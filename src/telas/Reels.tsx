import { useEffect, useRef, useState } from 'react';
import { useCamadas } from '../componentes/camadas';
import { Icone, type NomeIcone } from '../componentes/Icone';
import { TextoTocavel } from '../componentes/TextoTocavel';
import type { Reel } from '../data/feed';
import { useLoja } from '../lib/loja';
import { useNav } from '../lib/nav';
import { cx } from '../lib/texto';
import { NOME_INTERESSE } from '../lib/tipos';
import { pararFala, tocar, useTocando } from '../lib/voz';
import { COR_REEL, reelsOrdenados } from './Feed';

const LEGENDAS = ['en', 'en-pt', 'nenhuma'] as const;
const NOME_LEGENDA = { en: 'Legenda em inglês', 'en-pt': 'Inglês + português', nenhuma: 'Sem legenda' };

export function Reels({ inicio }: { inicio: number }) {
  const { estado } = useLoja();
  const nav = useNav();
  const lista = reelsOrdenados(estado.perfil.interesses);
  const rolagem = useRef<HTMLDivElement>(null);
  const [ativo, setAtivo] = useState(inicio);
  const [autoplay, setAutoplay] = useState(false);

  useEffect(() => {
    const el = rolagem.current;
    if (!el) return;
    el.scrollTop = inicio * el.clientHeight;
    const obs = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (e.isIntersecting) setAtivo(Number((e.target as HTMLElement).dataset.i));
        }
      },
      { root: el, threshold: 0.6 },
    );
    el.querySelectorAll('[data-i]').forEach((n) => obs.observe(n));
    return () => obs.disconnect();
  }, [inicio]);

  useEffect(() => {
    pararFala();
  }, [ativo]);

  return (
    <div className="flex-1 min-h-0 relative bg-[var(--reel-tinta)]">
      <div ref={rolagem} className="absolute inset-0 overflow-y-auto snap-y snap-mandatory overscroll-contain" style={{ scrollbarWidth: 'none' }}>
        {lista.map((r, i) => (
          <section key={r.id} data-i={i} className="h-full snap-start snap-always" aria-label={`Vídeo ${i + 1} de ${lista.length}: ${r.titulo}`}>
            <CartaoReel
              reel={r}
              ativo={i === ativo}
              autoplay={autoplay}
              aoTocar={() => setAutoplay(true)}
              aoFechar={nav.voltar}
              posicao={`${i + 1}/${lista.length}`}
            />
          </section>
        ))}
      </div>
    </div>
  );
}

function CartaoReel({
  reel,
  ativo,
  autoplay,
  aoTocar,
  aoFechar,
  posicao,
}: {
  reel: Reel;
  ativo: boolean;
  autoplay: boolean;
  aoTocar(): void;
  aoFechar(): void;
  posicao: string;
}) {
  const { estado, acoes } = useLoja();
  const cam = useCamadas();
  const id = `reel:${reel.id}`;
  const tocando = useTocando() === id;
  const [linha, setLinha] = useState(-1);
  const [destaque, setDestaque] = useState<[number, number, number] | null>(null);
  const [lento, setLento] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [revelado, setRevelado] = useState(false);
  const legenda = estado.config.legenda;
  const cor = COR_REEL[reel.cor];

  const play = () => {
    aoTocar();
    tocar(
      id,
      reel.falas.map((f) => ({ texto: f.en, sotaque: reel.sotaque, indiceVoz: f.quem === 'A' ? 0 : 1 })),
      {
        velocidade: lento ? 0.75 : 1,
        aoLinha: (i) => {
          setLinha(i);
          setDestaque(null);
        },
        aoPalavra: (l, ini, fim) => setDestaque([l, ini, fim]),
        aoTerminar: () => {
          setLinha(-1);
          setDestaque(null);
          acoes.contar('reels');
          acoes.marcarTarefa('feed');
        },
      },
    );
  };

  useEffect(() => {
    if (ativo && autoplay) {
      const t = setTimeout(play, 450);
      return () => clearTimeout(t);
    }
    if (!ativo) {
      setLinha(-1);
      setDestaque(null);
    }
    // Toca sozinho quando o vídeo entra na tela (depois do primeiro toque da pessoa).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ativo]);

  const proximaLegenda = () => {
    const i = LEGENDAS.indexOf(legenda);
    const nova = LEGENDAS[(i + 1) % LEGENDAS.length];
    acoes.setConfig({ legenda: nova });
    setRevelado(false);
    cam.avisar(NOME_LEGENDA[nova]);
  };

  const fraseAtual = reel.falas[Math.max(0, linha)].en;

  return (
    <div className={cx('h-full relative flex flex-col overflow-hidden', cor.claro && 'reel-fundo-claro')} style={{ background: cor.bg, color: cor.fg }}>
      <div className="gutter flex items-center gap-2 pt-3">
        <button type="button" onClick={aoFechar} className="btn-icone hover:bg-black/10" aria-label="Fechar vídeos">
          <Icone nome="x" />
        </button>
        <span className="font-mono text-[12px] opacity-75 num">{posicao}</span>
        <span className="ml-auto text-[11px] font-mono uppercase tracking-wider opacity-75">conteúdo de exemplo</span>
      </div>

      <div className="flex-1 min-h-0 flex flex-col justify-center gap-4 pl-[max(20px,env(safe-area-inset-left,0px))] pr-20 py-4 overflow-y-auto">
        {reel.falas.map((f, i) => {
          const atual = linha === i;
          return (
            <div key={i} className={cx('flex gap-2.5 transition-opacity duration-300', linha >= 0 && !atual && 'opacity-45')}>
              <span
                className="mt-1.5 grid place-items-center w-6 h-6 rounded-full text-[11px] font-bold flex-none"
                style={{ background: cor.fg, color: cor.bg }}
                aria-label={f.quem === 'A' ? 'Pessoa A' : 'Pessoa B'}
              >
                {f.quem}
              </span>
              <div className="min-w-0">
                {legenda === 'nenhuma' && !revelado ? (
                  <button type="button" onClick={() => setRevelado(true)} className="text-left font-display text-[22px] font-extrabold leading-[1.15] blur-[7px] select-none" aria-label="Revelar a legenda">
                    {f.en}
                  </button>
                ) : (
                  <p className="font-display text-[22px] font-extrabold leading-[1.18]" lang="en">
                    <TextoTocavel
                      texto={f.en}
                      glossario={reel.glossario}
                      origem="video"
                      origemTitulo={reel.titulo}
                      sotaque={reel.sotaque}
                      destaque={destaque && destaque[0] === i ? [destaque[1], destaque[2]] : null}
                    />
                  </p>
                )}
                {legenda === 'en-pt' && <p className="text-[14px] opacity-80 mt-0.5">{f.pt}</p>}
              </div>
            </div>
          );
        })}
        {legenda === 'nenhuma' && !revelado && <p className="text-[13px] opacity-75">Sem legenda: tente entender só ouvindo. Toque no texto para revelar.</p>}
      </div>

      <div className="absolute right-[max(12px,env(safe-area-inset-right,0px))] bottom-28 flex flex-col items-center gap-4">
        <Acao
          icone={tocando ? 'pausa' : 'play'}
          rotulo={tocando ? 'Pausar' : 'Tocar'}
          grande
          cor={cor}
          aoClicar={() => (tocando ? pararFala() : play())}
        />
        <Acao icone="relogio" rotulo={lento ? '0,75×' : '1×'} cor={cor} aoClicar={() => setLento(!lento)} />
        <Acao icone="legenda" rotulo={legenda === 'en' ? 'EN' : legenda === 'en-pt' ? 'EN+PT' : 'Sem'} cor={cor} aoClicar={proximaLegenda} />
        <Acao
          icone="salvar"
          rotulo={(reel.curtidas + (salvo ? 1 : 0)).toLocaleString('pt-BR')}
          ativo={salvo}
          cor={cor}
          aoClicar={() => {
            setSalvo(!salvo);
            if (!salvo) cam.avisar('Vídeo salvo. As palavras que você tocar viram card.');
          }}
        />
        <Acao icone="pergunta" rotulo="Por que?" cor={cor} aoClicar={() => cam.explicar(fraseAtual)} />
      </div>

      <div className="gutter pb-5 pt-2 flex flex-col gap-1.5 pr-24">
        <p className="text-[13px] font-semibold opacity-80">@destrava.exemplos</p>
        <p className="font-display text-[18px] font-bold leading-tight">{reel.titulo}</p>
        <p className="text-[13px] opacity-80">
          {reel.nivel} · sotaque {reel.nomeSotaque} · {NOME_INTERESSE[reel.tema]}
        </p>
        <p className="text-[12px] opacity-70">Toque numa palavra para traduzir e virar card.</p>
      </div>
    </div>
  );
}

function Acao({
  icone,
  rotulo,
  aoClicar,
  grande,
  ativo,
  cor,
}: {
  icone: NomeIcone;
  rotulo: string;
  aoClicar(): void;
  grande?: boolean;
  ativo?: boolean;
  cor: { bg: string; fg: string };
}) {
  return (
    <button type="button" onClick={aoClicar} className="flex flex-col items-center gap-1" aria-label={rotulo}>
      <span
        className={cx('grid place-items-center rounded-full', grande ? 'w-14 h-14' : 'w-11 h-11')}
        style={grande || ativo ? { background: cor.fg, color: cor.bg } : { background: 'color-mix(in srgb, currentColor 16%, transparent)' }}
      >
        <Icone nome={icone} tamanho={grande ? 24 : 19} />
      </span>
      <span className="text-[11px] font-semibold num">{rotulo}</span>
    </button>
  );
}
