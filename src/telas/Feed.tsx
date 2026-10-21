import { useRef, useState } from 'react';
import { BotaoOuvir } from '../componentes/BotaoOuvir';
import { useCamadas } from '../componentes/camadas';
import { Icone } from '../componentes/Icone';
import { TextoTocavel } from '../componentes/TextoTocavel';
import { Cabecalho, Carregando, Secao, Segmentado, Selo } from '../componentes/ui';
import { CLASSICOS, LEITURAS, LIVROS, REELS, SERIES, type Reel, type Serie } from '../data/feed';
import { mensagemDeErro, perguntarJSON, useEstadoIA, type ErroIA } from '../lib/ia';
import { useLoja } from '../lib/loja';
import { useNav } from '../lib/nav';
import { promptAdaptar, type TextoAdaptado } from '../lib/prompts';
import { cx } from '../lib/texto';
import { NOME_INTERESSE, type Interesse } from '../lib/tipos';
import { Ouvido } from './Ouvido';

const SEGMENTOS = [
  { id: 'pravoce', nome: 'Para você' },
  { id: 'ouvido', nome: 'Treino de ouvido' },
] as const;

type Filtro = 'tudo' | 'videos' | 'leituras' | 'series' | 'livros';

const FILTROS: { id: Filtro; nome: string }[] = [
  { id: 'tudo', nome: 'Tudo' },
  { id: 'videos', nome: 'Vídeos' },
  { id: 'leituras', nome: 'Leituras' },
  { id: 'series', nome: 'Séries' },
  { id: 'livros', nome: 'Livros' },
];

export function reelsOrdenados(interesses: Interesse[]): Reel[] {
  return [...REELS].sort((a, b) => Number(interesses.includes(b.tema)) - Number(interesses.includes(a.tema)));
}

export const COR_REEL: Record<Reel['cor'], { bg: string; fg: string; claro: boolean }> = {
  cobalto: { bg: 'var(--reel-cobalto)', fg: 'var(--reel-claro)', claro: false },
  sol: { bg: 'var(--reel-sol)', fg: 'var(--reel-escuro)', claro: true },
  coral: { bg: 'var(--reel-coral)', fg: 'var(--reel-escuro)', claro: true },
  menta: { bg: 'var(--reel-menta)', fg: 'var(--reel-escuro)', claro: true },
  tinta: { bg: 'var(--reel-tinta)', fg: 'var(--reel-claro)', claro: false },
  lilas: { bg: 'var(--reel-lilas)', fg: 'var(--reel-escuro)', claro: true },
};

export function Feed({ seg }: { seg: 'pravoce' | 'ouvido' }) {
  const nav = useNav();
  return (
    <div className="flex flex-col">
      <Cabecalho titulo="Feed" sub={seg === 'pravoce' ? 'Inglês de verdade, no seu nível' : 'Velocidade e sotaques reais'} />
      <div className="gutter pt-4">
        <Segmentado rotulo="Parte do feed" opcoes={SEGMENTOS} valor={seg} aoMudar={(s) => nav.ir({ tela: 'feed', seg: s })} />
      </div>
      {seg === 'pravoce' ? <ParaVoce /> : <Ouvido />}
    </div>
  );
}

function ParaVoce() {
  const { estado } = useLoja();
  const nav = useNav();
  const cam = useCamadas();
  const [filtro, setFiltro] = useState<Filtro>('tudo');
  const { interesses, nivel } = estado.perfil;
  const reels = reelsOrdenados(interesses);
  const ver = (f: Filtro) => filtro === 'tudo' || filtro === f;
  const motivo = (tema: Interesse) => (interesses.includes(tema) ? `Você curte ${NOME_INTERESSE[tema].toLowerCase()}` : null);

  return (
    <div className="flex flex-col gap-7 pt-4 pb-10">
      <div className="trilho gutter" role="tablist" aria-label="Filtrar o feed">
        {FILTROS.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={filtro === f.id}
            onClick={() => setFiltro(f.id)}
            className={cx(
              'h-9 px-4 rounded-full text-[14px] font-semibold border transition-colors',
              filtro === f.id ? 'bg-fg text-bg border-fg' : 'border-line text-muted hover:text-fg',
            )}
          >
            {f.nome}
          </button>
        ))}
      </div>

      {ver('videos') && (
        <section className="flex flex-col gap-3">
          <div className="gutter">
            <h2 className="font-display text-[18px] font-bold leading-tight">Vídeos curtos</h2>
            <p className="text-[13px] text-muted mt-0.5">Com áudio e legenda tocável: toque numa palavra e ela vira card.</p>
          </div>
          <div className="trilho gutter pb-1">
            {reels.map((r, i) => {
              const c = COR_REEL[r.cor];
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => nav.ir({ tela: 'reels', inicio: i })}
                  className="w-[150px] aspect-[9/14] max-w-full rounded-[22px] p-3 flex flex-col text-left relative overflow-hidden"
                  style={{ background: c.bg, color: c.fg }}
                >
                  <span className="text-[11px] font-mono uppercase tracking-wider opacity-80">
                    {r.nivel} · {r.nomeSotaque}
                  </span>
                  <span className="mt-auto font-display text-[17px] font-extrabold leading-[1.05]" lang="en">
                    “{r.falas[0].en}”
                  </span>
                  <span className="mt-2 text-[12px] font-semibold opacity-90">{r.titulo}</span>
                  <span className="absolute top-3 right-3 grid place-items-center w-8 h-8 rounded-full" style={{ background: c.fg, color: c.bg }}>
                    <Icone nome="play" tamanho={14} />
                  </span>
                </button>
              );
            })}
            <span className="w-1" aria-hidden="true" />
          </div>
        </section>
      )}

      <div className="gutter flex flex-col gap-7">
        {ver('leituras') && (
          <Secao titulo="Leituras em 3 níveis" sub="O mesmo texto em A2, B1 e B2. Comece no seu e suba quando ficar fácil.">
            <div className="flex flex-col gap-3">
              {LEITURAS.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => nav.ir({ tela: 'leitura', id: l.id })}
                  className="cartao p-4 text-left flex gap-3 items-start hover:border-muted transition-colors"
                >
                  <span className="grid place-items-center w-11 h-11 rounded-xl bg-accent-soft text-accent flex-none">
                    <Icone nome="jornal" />
                  </span>
                  <span className="flex-1 min-w-0 flex flex-col gap-1">
                    <span className="font-display text-[16px] font-bold leading-tight">{l.tituloPt}</span>
                    <span className="text-[13px] text-muted leading-snug" lang="en">
                      {l.titulo}
                    </span>
                    <span className="flex flex-wrap gap-1.5 mt-1">
                      <Selo tom="accent">Seu nível: {nivel}</Selo>
                      <Selo>{l.minutos} min</Selo>
                      {motivo(l.tema) && <Selo tom="sol">{motivo(l.tema)}</Selo>}
                    </span>
                  </span>
                </button>
              ))}
              <AdaptarTexto />
            </div>
          </Secao>
        )}

        {ver('series') && (
          <Secao titulo="Séries para treinar o ouvido" sub="Escolhidas pelo sotaque e pela velocidade da fala, não só pela fama.">
            <div className="flex flex-col gap-2">
              {SERIES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => cam.abrir(<FolhaSerie s={s} />, s.titulo)}
                  className="cartao p-3 text-left flex items-center gap-3 hover:border-muted transition-colors"
                >
                  <span className="grid place-items-center w-11 h-11 rounded-xl bg-surface-2 flex-none">
                    <Icone nome="tela" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block font-semibold leading-tight">{s.titulo}</span>
                    <span className="block text-[13px] text-muted">
                      {s.sotaque} · {s.formato}
                    </span>
                  </span>
                  <Selo tom={s.nivel === nivel ? 'accent' : 'neutro'}>{s.nivel}</Selo>
                </button>
              ))}
            </div>
          </Secao>
        )}

        {ver('livros') && (
          <Secao titulo="Livros curtos" sub="Histórias graduadas, com áudio e palavra tocável.">
            <div className="grid grid-cols-2 gap-3">
              {LIVROS.map((l, i) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => nav.ir({ tela: 'livro', id: l.id })}
                  className={cx('rounded-[20px] p-4 text-left flex flex-col gap-2 min-h-44', i === 0 ? 'bg-sun-soft' : 'bg-accent-soft')}
                >
                  <Icone nome="livro" className={i === 0 ? 'text-fg' : 'text-accent'} />
                  <span className="font-display text-[18px] font-extrabold leading-tight mt-auto" lang="en">
                    {l.titulo}
                  </span>
                  <span className="text-[12px] text-muted">
                    {l.nivel} · {l.capitulos.length} capítulos
                  </span>
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              <p className="rotulo">Para depois: clássicos em domínio público</p>
              {CLASSICOS.map((c) => (
                <a key={c.url} href={c.url} target="_blank" rel="noreferrer" className="cartao p-3 flex items-center gap-3 hover:border-muted">
                  <span className="flex-1 min-w-0">
                    <span className="block font-semibold leading-tight" lang="en">
                      {c.titulo}
                    </span>
                    <span className="block text-[13px] text-muted">
                      {c.autor} · {c.nota}
                    </span>
                  </span>
                  <Selo>{c.nivel}</Selo>
                  <Icone nome="externo" tamanho={16} className="text-muted flex-none" />
                </a>
              ))}
            </div>
          </Secao>
        )}
      </div>
    </div>
  );
}

function FolhaSerie({ s }: { s: Serie }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-1.5">
        <Selo tom="accent">{s.nivel}</Selo>
        <Selo>{s.sotaque}</Selo>
        <Selo>{s.formato}</Selo>
      </div>
      <p className="text-[15px] leading-relaxed">{s.porque}</p>
      <div>
        <p className="rotulo mb-2">Expressões que você vai ouvir muito</p>
        <ul className="flex flex-col gap-1.5">
          {s.expressoes.map((e) => (
            <li key={e} className="flex items-center gap-2">
              <BotaoOuvir id={`serie:${e}`} texto={e} className="w-8 h-8" />
              <span lang="en" className="font-medium">
                {e}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-2xl bg-surface-2 p-3 text-[14px] leading-relaxed">
        <p className="font-semibold mb-1">Como assistir para treinar</p>
        <p>
          1º episódio com legenda em inglês. Depois, reveja só a cena de que mais gostou sem legenda nenhuma. As palavras novas,
          anote aqui no app e elas viram card.
        </p>
      </div>
    </div>
  );
}

/** "Cole qualquer texto": a ponte entre o conteúdo real e o seu nível. */
function AdaptarTexto() {
  const ia = useEstadoIA();
  const cam = useCamadas();
  if (ia === 'demo') {
    return (
      <div className="rounded-[20px] border border-dashed border-line p-4 flex gap-3">
        <Icone nome="brilho" className="text-muted flex-none mt-0.5" />
        <p className="text-[14px] text-muted">
          <strong className="text-fg">Cole qualquer texto em inglês</strong> (notícia, letra de música, post) e a IA reescreve no seu
          nível. Disponível no link publicado no Claude.
        </p>
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={() => cam.abrir(<FolhaAdaptar />, 'Adaptar um texto')}
      className="rounded-[20px] bg-accent text-accent-fg p-4 flex gap-3 text-left"
    >
      <Icone nome="brilho" className="flex-none mt-0.5" />
      <span>
        <span className="block font-semibold">Cole qualquer texto em inglês</span>
        <span className="block text-[14px] opacity-90">Notícia, letra de música, post: a IA reescreve no seu nível, com palavras tocáveis.</span>
      </span>
    </button>
  );
}

function FolhaAdaptar() {
  const { estado } = useLoja();
  const [texto, setTexto] = useState('');
  const [res, setRes] = useState<TextoAdaptado | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const ctl = useRef<AbortController | null>(null);

  const adaptar = () => {
    ctl.current?.abort();
    const c = new AbortController();
    ctl.current = c;
    setCarregando(true);
    setErro('');
    perguntarJSON<TextoAdaptado>(promptAdaptar(estado.perfil.nivel, texto), { signal: c.signal })
      .then((r) =>
        setRes({
          texto: String(r?.texto ?? ''),
          glossario: Array.isArray(r?.glossario) ? r.glossario.filter((g) => g?.en && g?.pt) : [],
        }),
      )
      .catch((e: ErroIA) => {
        if (e.code !== 'cancelled') setErro(mensagemDeErro(e.code));
      })
      .finally(() => setCarregando(false));
  };

  if (res) {
    const glossario = Object.fromEntries(res.glossario.map((g) => [g.en.toLowerCase(), g.pt]));
    return (
      <div className="flex flex-col gap-4">
        <Selo tom="accent">Reescrito para {estado.perfil.nivel}</Selo>
        <p className="text-[17px] leading-relaxed" lang="en">
          <TextoTocavel texto={res.texto} glossario={glossario} origem="leitura" origemTitulo="Texto adaptado" />
        </p>
        <BotaoOuvir id="adaptado" texto={res.texto} rotulo="Ouvir o texto" className="self-start" />
        {res.glossario.length > 0 && (
          <ul className="rounded-2xl bg-surface-2 p-3 grid grid-cols-2 gap-x-3 gap-y-1 text-[14px]">
            {res.glossario.map((g) => (
              <li key={g.en}>
                <span className="font-semibold" lang="en">
                  {g.en}
                </span>{' '}
                <span className="text-muted">{g.pt}</span>
              </li>
            ))}
          </ul>
        )}
        <button type="button" className="btn btn-suave" onClick={() => setRes(null)}>
          Adaptar outro texto
        </button>
      </div>
    );
  }

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (texto.trim().length > 20) adaptar();
      }}
    >
      <label htmlFor="texto-adaptar" className="text-[14px] text-muted">
        Cole um trecho em inglês (até umas 600 palavras). A IA reescreve no nível {estado.perfil.nivel} e escolhe as palavras que valem
        a pena aprender.
      </label>
      <textarea
        id="texto-adaptar"
        rows={7}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Paste any English text here…"
        className="rounded-2xl bg-surface-2 p-3 text-[15px] outline-none focus:ring-2 focus:ring-accent resize-y"
        lang="en"
      />
      <button type="submit" className="btn btn-primario" disabled={carregando || texto.trim().length <= 20}>
        {carregando ? <Carregando texto="Adaptando" /> : 'Adaptar para o meu nível'}
      </button>
      {erro && <p className="text-[14px] text-bad">{erro}</p>}
    </form>
  );
}
