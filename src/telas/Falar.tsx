import { BotaoOuvir } from '../componentes/BotaoOuvir';
import { Icone } from '../componentes/Icone';
import { Cabecalho, Secao, Segmentado, Selo } from '../componentes/ui';
import { APOIOS, CENARIOS, CORINGAS } from '../data/cenarios';
import { UNIDADES } from '../data/pronuncia';
import { useLoja } from '../lib/loja';
import { useNav } from '../lib/nav';
import { cx } from '../lib/texto';
import type { Apoio } from '../lib/tipos';

const SEGMENTOS = [
  { id: 'conversa', nome: 'Conversa' },
  { id: 'pronuncia', nome: 'Pronúncia' },
] as const;

export function Falar({ seg }: { seg: 'conversa' | 'pronuncia' }) {
  const nav = useNav();
  return (
    <div className="flex flex-col">
      <Cabecalho titulo="Falar" sub={seg === 'conversa' ? 'Sem plateia, com correção em português' : 'Os sons que entregam o sotaque'} />
      <div className="gutter pt-4">
        <Segmentado rotulo="Tipo de treino" opcoes={SEGMENTOS} valor={seg} aoMudar={(s) => nav.ir({ tela: 'falar', seg: s })} />
      </div>
      {seg === 'conversa' ? <ListaConversas /> : <ListaSons />}
    </div>
  );
}

function ListaConversas() {
  const { estado, acoes } = useLoja();
  const nav = useNav();
  const { perfil, config } = estado;
  const apoio = APOIOS.find((a) => a.id === config.apoio)!;
  const ordenados = [...CENARIOS].sort((a, b) => pontos(b) - pontos(a));

  function pontos(c: (typeof CENARIOS)[number]) {
    return (c.nivel === perfil.nivel ? 2 : 0) + (c.interesses.some((i) => perfil.interesses.includes(i)) ? 3 : 0) - (c.id === 'livre' ? 1 : 0);
  }

  return (
    <div className="gutter flex flex-col gap-7 pt-5 pb-8">
      <div className="rounded-[24px] bg-surface-2 p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Icone nome="cadeado" tamanho={18} className="text-accent" />
          <p className="font-semibold">Só você e a IA. Ninguém está ouvindo.</p>
        </div>
        <p className="text-[14px] text-muted">Quanto apoio você quer na tela?</p>
        <Segmentado
          rotulo="Nível de apoio"
          pequeno
          opcoes={APOIOS.map((a) => ({ id: a.id, nome: a.nome }))}
          valor={config.apoio}
          aoMudar={(v) => acoes.setConfig({ apoio: v as Apoio })}
        />
        <p className="text-[13px] leading-snug">{apoio.explica}</p>
      </div>

      <Secao titulo="Escolha uma situação" sub="Situações reais, com sotaques diferentes.">
        <div className="flex flex-col gap-3">
          {ordenados.map((c, i) => (
            <button
              key={c.id}
              type="button"
              onClick={() => nav.ir({ tela: 'conversa', cenario: c.id })}
              className="cartao text-left p-4 flex items-center gap-3 hover:border-muted transition-colors"
            >
              <span className="flex-1 min-w-0 flex flex-col gap-1.5">
                <span className="flex items-center gap-2">
                  <span className="font-display text-[17px] font-bold leading-tight">{c.titulo}</span>
                  {i === 0 && <Selo tom="sol">Para você</Selo>}
                </span>
                <span className="text-[14px] text-muted leading-snug">{c.subtitulo}</span>
                <span className="flex flex-wrap gap-1.5 mt-0.5">
                  <Selo>{c.id === 'livre' ? perfil.nivel : c.nivel}</Selo>
                  <Selo>Sotaque {c.nomeSotaque}</Selo>
                  <Selo>{c.quem}</Selo>
                </span>
              </span>
              <Icone nome="seta" tamanho={18} className="text-muted flex-none" />
            </button>
          ))}
        </div>
      </Secao>

      <Secao titulo="Frases para ganhar tempo" sub="Decore estas. Elas salvam quando o cérebro congela numa conversa de verdade.">
        <ul className="cartao divide-y divide-line">
          {CORINGAS.map((c) => (
            <li key={c.en} className="flex items-center gap-3 p-3">
              <BotaoOuvir id={`coringa:${c.en}`} texto={c.en} />
              <span className="min-w-0">
                <span className="block font-medium leading-snug" lang="en">
                  {c.en}
                </span>
                <span className="block text-[13px] text-muted">{c.pt}</span>
              </span>
            </li>
          ))}
        </ul>
      </Secao>

      <button type="button" onClick={() => nav.ir({ tela: 'galera' })} className="cartao p-4 flex items-center gap-3 text-left hover:border-muted">
        <span className="grid place-items-center w-10 h-10 rounded-xl bg-accent-soft text-accent flex-none">
          <Icone nome="escada" />
        </span>
        <span className="flex-1">
          <span className="block font-semibold">Pronto para falar com gente?</span>
          <span className="block text-[13px] text-muted">Suba um degrau: áudio com um parceiro, sem ao vivo.</span>
        </span>
        <Icone nome="seta" tamanho={18} className="text-muted" />
      </button>
    </div>
  );
}

function ListaSons() {
  const { estado } = useLoja();
  const nav = useNav();
  const sons = estado.stats.sons;
  return (
    <div className="gutter flex flex-col gap-6 pt-5 pb-8">
      <p className="text-[15px] leading-relaxed">
        Você nota o sotaque, mas não sabe o que corrigir? Estes são os sons que mais entregam o brasileiro. Cada treino diz{' '}
        <strong className="font-semibold">qual parte</strong> está saindo diferente.
      </p>
      <div className="flex flex-col gap-3">
        {UNIDADES.map((u) => {
          const feito = sons.includes(u.id);
          return (
            <button
              key={u.id}
              type="button"
              onClick={() => nav.ir({ tela: 'unidade', id: u.id })}
              className="cartao text-left p-3 flex items-center gap-3 hover:border-muted transition-colors"
            >
              <span
                className={cx(
                  'grid place-items-center w-14 h-14 rounded-2xl flex-none font-mono text-[18px] font-medium',
                  feito ? 'bg-ok-soft text-ok' : 'bg-accent-soft text-accent',
                )}
              >
                {u.simbolo}
              </span>
              <span className="flex-1 min-w-0">
                <span className="flex items-center gap-2">
                  <span className="font-display text-[16px] font-bold leading-tight">{u.titulo}</span>
                  {feito && <Selo tom="ok">treinado</Selo>}
                </span>
                <span className="block text-[13px] text-muted leading-snug mt-0.5">{u.resumo}</span>
              </span>
              <Icone nome="seta" tamanho={18} className="text-muted flex-none" />
            </button>
          );
        })}
      </div>
      <button type="button" onClick={() => nav.ir({ tela: 'galera' })} className="rounded-[24px] bg-sun-soft p-4 flex items-center gap-3 text-left">
        <span className="grid place-items-center w-10 h-10 rounded-xl bg-sun text-sun-fg flex-none">
          <Icone nome="pessoas" />
        </span>
        <span className="flex-1">
          <span className="block font-semibold">Quer um humano ouvindo?</span>
          <span className="block text-[13px] text-muted">Nativos da comunidade avaliam seu áudio, som por som.</span>
        </span>
        <Icone nome="seta" tamanho={18} className="text-muted" />
      </button>
    </div>
  );
}
