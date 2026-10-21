// Camada de apresentação: liga cada tela às dores levantadas no Define.
import { DOR, DORES } from '../data/dores';
import { useLoja } from '../lib/loja';
import { doresDaRota, useNav, type Rota } from '../lib/nav';
import { cx } from '../lib/texto';
import { useCamadas, useCamadasOpcional } from './camadas';
import { Icone, Marca } from './Icone';

const NOME_TELA: Record<Rota['tela'], string> = {
  hoje: 'Plano de hoje',
  falar: 'Falar sem plateia',
  conversa: 'Conversa com IA',
  unidade: 'Treino de um som',
  feed: 'Feed no seu nível',
  reels: 'Vídeos curtos',
  leitura: 'Leitura em 3 níveis',
  livro: 'Livro curto',
  revisar: 'Revisão sem avalanche',
  galera: 'Comunidade em degraus',
  mapa: 'As 7 dores',
  perfil: 'Seu perfil',
};

function nomeDaRota(r: Rota): string {
  if (r.tela === 'falar' && r.seg === 'pronuncia') return 'Laboratório de sons';
  if (r.tela === 'feed' && r.seg === 'ouvido') return 'Treino de ouvido';
  return NOME_TELA[r.tela];
}

export function ChipDores() {
  const { estado } = useLoja();
  const nav = useNav();
  const cam = useCamadas();
  if (!estado.config.apresentacao) return null;
  const ids = doresDaRota(nav.rota);
  if (!ids.length || ids.length === 7) return null;
  return (
    <button
      type="button"
      onClick={() => cam.abrir(<ListaDores ids={ids} />, 'Por que esta tela existe')}
      className="lg:hidden inline-flex items-center gap-1 h-8 px-3 rounded-full bg-sun-soft text-fg text-[12px] font-semibold flex-none hover:bg-sun/40"
      aria-label={`Esta tela responde às dores ${ids.join(', ')}`}
    >
      <span className="font-mono">Dor {ids.join('·')}</span>
    </button>
  );
}

export function ListaDores({ ids }: { ids: number[] }) {
  const nav = useNav();
  const cam = useCamadasOpcional();
  return (
    <div className="flex flex-col gap-3">
      {ids.map((id) => {
        const d = DOR[id];
        return (
          <article key={id} className="rounded-2xl border border-line bg-surface p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="grid place-items-center w-9 h-9 rounded-full bg-sun text-sun-fg font-display font-extrabold text-[17px] flex-none">
                {d.id}
              </span>
              <h3 className="font-display text-[17px] font-bold leading-tight">{d.titulo}</h3>
            </div>
            <div>
              <p className="rotulo mb-1">O que ouvimos</p>
              <ul className="flex flex-col gap-1 text-[14px] text-muted leading-snug">
                {d.ouvimos.map((o, i) => (
                  <li key={i} className="pl-3 border-l-2 border-line">
                    {o}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="rotulo mb-1">Como o app responde</p>
              <p className="text-[14px] leading-snug">{d.resposta}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {d.recursos.map((r) => (
                <button
                  key={r.nome}
                  type="button"
                  className="btn btn-sm btn-suave"
                  onClick={() => {
                    cam?.fechar();
                    nav.ir(r.rota);
                  }}
                >
                  {r.nome} <Icone nome="seta" tamanho={14} />
                </button>
              ))}
            </div>
          </article>
        );
      })}
    </div>
  );
}

/** Painel fixo à esquerda no computador, para apresentar o Develop. */
export function PainelLateral({ onboarding }: { onboarding: boolean }) {
  const { acoes } = useLoja();
  const nav = useNav();
  const ids = onboarding ? [] : doresDaRota(nav.rota);
  return (
    <div className="flex flex-col gap-6 py-8 pr-1">
      <div className="flex items-center gap-2">
        <Marca tamanho={30} />
        <span className="font-display text-[22px] font-extrabold tracking-tight">destrava</span>
        <span className="rotulo ml-auto">Protótipo · Develop</span>
      </div>

      <div className="flex flex-col gap-2">
        <p className="rotulo">Define → Develop</p>
        <h2 className="font-display text-[36px] font-extrabold leading-[1.02] tracking-tight">
          {onboarding ? 'Primeiro acesso' : nomeDaRota(nav.rota)}
        </h2>
        <p className="text-muted text-[15px] max-w-[42ch]">
          {onboarding
            ? 'O início pergunta o que mais trava a pessoa e monta um plano com isso. Cada tela do app responde a uma ou mais das 7 dores da pesquisa.'
            : ids.length === 7
              ? 'Todas as dores levantadas na pesquisa e onde cada uma é resolvida no app.'
              : ids.length
                ? `Esta tela responde a ${ids.length === 1 ? 'uma' : ids.length} das 7 dores levantadas na pesquisa.`
                : 'Ajustes da pessoa usuária. Nenhuma dor específica aqui.'}
        </p>
      </div>

      <nav aria-label="As 7 dores" className="flex gap-1.5 flex-wrap">
        {DORES.map((d) => {
          const ativa = ids.includes(d.id);
          return (
            <button
              key={d.id}
              type="button"
              title={d.titulo}
              onClick={() => nav.ir(d.recursos[0].rota)}
              className={cx(
                'h-9 pl-1 pr-3 rounded-full inline-flex items-center gap-2 text-[13px] font-semibold border transition-colors',
                ativa ? 'bg-sun-soft border-sun text-fg' : 'border-line text-muted hover:text-fg hover:border-muted',
              )}
            >
              <span
                className={cx(
                  'grid place-items-center w-7 h-7 rounded-full font-display font-extrabold',
                  ativa ? 'bg-sun text-sun-fg' : 'bg-surface-2',
                )}
              >
                {d.id}
              </span>
              {d.curto}
            </button>
          );
        })}
      </nav>

      {ids.length > 0 && ids.length < 7 && <ListaDores ids={ids} />}

      <div className="flex flex-wrap gap-2">
        {!onboarding && (
          <button type="button" className="btn btn-sm btn-linha" onClick={() => nav.ir({ tela: 'mapa' })}>
            <Icone nome="mapa" tamanho={16} /> Ver as 7 dores
          </button>
        )}
        <button type="button" className="btn btn-sm btn-linha" onClick={() => acoes.setConfig({ apresentacao: false })}>
          Esconder este painel
        </button>
      </div>
    </div>
  );
}
