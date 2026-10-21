// Camadas por cima das telas: folhas (painéis que sobem de baixo) e avisos rápidos.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { DUVIDAS } from '../data/comunidade';
import { ehPermanente, mensagemDeErro, perguntarJSON, perguntarTexto, useEstadoIA, type ErroIA } from '../lib/ia';
import { useLoja } from '../lib/loja';
import { promptExplicar, promptPalavra, type TraducaoPalavra } from '../lib/prompts';
import { buscarGlossario, chave, pedacos } from '../lib/texto';
import type { OrigemCard, Sotaque } from '../lib/tipos';
import { BotaoOuvir } from './BotaoOuvir';
import { Icone } from './Icone';
import { Carregando, TextoFormatado } from './ui';

export interface DadosPalavra {
  palavra: string;
  frase: string;
  glossario?: Record<string, string>;
  origem: OrigemCard;
  origemTitulo: string;
  sotaque?: Sotaque;
}

interface Camadas {
  abrir(conteudo: ReactNode, titulo: string): void;
  fechar(): void;
  avisar(texto: string): void;
  palavra(d: DadosPalavra): void;
  explicar(frase: string, foco?: string): void;
}

const Contexto = createContext<Camadas | null>(null);

export function useCamadas(): Camadas {
  const c = useContext(Contexto);
  if (!c) throw new Error('useCamadas fora do ProvedorCamadas');
  return c;
}

/** Para componentes que também aparecem fora da coluna do app (painel da apresentação). */
export function useCamadasOpcional(): Camadas | null {
  return useContext(Contexto);
}

export function ProvedorCamadas({ children }: { children: ReactNode }) {
  const [folha, setFolha] = useState<{ conteudo: ReactNode; titulo: string; id: number } | null>(null);
  const [aviso, setAviso] = useState<{ texto: string; id: number } | null>(null);
  const contador = useRef(0);

  const fechar = useCallback(() => setFolha(null), []);
  const abrir = useCallback((conteudo: ReactNode, titulo: string) => {
    contador.current++;
    setFolha({ conteudo, titulo, id: contador.current });
  }, []);
  const avisar = useCallback((texto: string) => {
    contador.current++;
    setAviso({ texto, id: contador.current });
  }, []);

  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(null), 2800);
    return () => clearTimeout(t);
  }, [aviso]);

  const valor = useMemo<Camadas>(
    () => ({
      abrir,
      fechar,
      avisar,
      palavra: (d) => abrir(<FolhaPalavra d={d} />, d.palavra),
      explicar: (frase, foco) => abrir(<FolhaExplicar frase={frase} foco={foco} />, 'Por que é assim?'),
    }),
    [abrir, fechar, avisar],
  );

  return (
    <Contexto.Provider value={valor}>
      {children}
      {folha && (
        <Folha key={folha.id} titulo={folha.titulo} aoFechar={fechar}>
          {folha.conteudo}
        </Folha>
      )}
      {aviso && (
        <div className="pointer-events-none absolute inset-x-0 bottom-24 z-[60] flex justify-center gutter" role="status">
          <div key={aviso.id} className="anima-subir max-w-[360px] rounded-2xl bg-fg text-bg px-4 py-3 text-[14px] font-medium shadow-lg text-center">
            {aviso.texto}
          </div>
        </div>
      )}
    </Contexto.Provider>
  );
}

function Folha({ titulo, aoFechar, children }: { titulo: string; aoFechar(): void; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.focus();
    const tecla = (e: KeyboardEvent) => e.key === 'Escape' && aoFechar();
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [aoFechar]);
  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end" role="dialog" aria-modal="true" aria-label={titulo}>
      <button type="button" className="absolute inset-0 cursor-default" style={{ background: 'var(--scrim)' }} aria-label="Fechar" onClick={aoFechar} />
      <div
        ref={ref}
        tabIndex={-1}
        className="relative bg-surface rounded-t-[28px] max-h-[88%] overflow-y-auto anima-subir gutter pt-2 outline-none"
        style={{ paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="mx-auto mt-1 mb-2 h-1.5 w-10 rounded-full bg-line" />
        <div className="flex items-center gap-2 mb-3">
          <h2 className="flex-1 font-display text-[20px] font-bold leading-tight">{titulo}</h2>
          <button type="button" className="btn-icone bg-surface-2 hover:bg-line" onClick={aoFechar} aria-label="Fechar">
            <Icone nome="x" tamanho={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/** Separa "\"Need a hand?\" = precisa de ajuda?" em frente e verso. */
function partesDoGlossario(palavra: string, entrada: string): { frente: string; verso: string } {
  const m = entrada.match(/^"([^"]+)"\s*=\s*(.+)$/);
  if (m) return { frente: m[1], verso: m[2] };
  return { frente: palavra, verso: entrada };
}

function FolhaPalavra({ d }: { d: DadosPalavra }) {
  const { acoes } = useLoja();
  const cam = useCamadas();
  const ia = useEstadoIA();
  const local = buscarGlossario(d.glossario, d.palavra);
  const [trad, setTrad] = useState<{ traducao: string; nota?: string } | null>(local ? { traducao: local } : null);
  const [carregando, setCarregando] = useState(!local && ia !== 'demo');
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (local || ia === 'demo') {
      setCarregando(false);
      return;
    }
    const ctl = new AbortController();
    perguntarJSON<TraducaoPalavra>(promptPalavra(d.palavra, d.frase), { signal: ctl.signal, cache: { gcTime: 86_400_000 } })
      .then((r) => setTrad({ traducao: String(r?.traducao ?? ''), nota: r?.nota ? String(r.nota) : undefined }))
      .catch((e: ErroIA) => {
        if (e.code !== 'cancelled') setErro(mensagemDeErro(e.code));
      })
      .finally(() => setCarregando(false));
    return () => ctl.abort();
    // Uma tradução por abertura da folha.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const salvar = () => {
    if (!trad) return;
    const { frente, verso } = local ? partesDoGlossario(d.palavra, local) : { frente: d.palavra, verso: trad.traducao };
    const ok = acoes.adicionarCard({ frente, verso, exemplo: d.frase.trim(), origem: d.origem, origemTitulo: d.origemTitulo });
    cam.fechar();
    cam.avisar(ok ? `"${frente}" virou card. Aparece na revisão de amanhã.` : `"${frente}" já está no seu baralho.`);
  };

  const k = chave(d.palavra);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <BotaoOuvir id={`palavra:${k}`} texto={d.palavra} sotaque={d.sotaque} grande />
        <div className="min-w-0">
          {carregando ? (
            <Carregando texto="Traduzindo" />
          ) : trad ? (
            <>
              <p className="text-[17px] font-semibold leading-snug">{trad.traducao}</p>
              {trad.nota && <p className="text-[13px] text-muted">{trad.nota}</p>}
            </>
          ) : (
            <p className="text-[14px] text-muted">
              {erro ||
                'Esta palavra ainda não tem tradução pronta. No link publicado no Claude, a IA traduz qualquer palavra no contexto.'}
            </p>
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-surface-2 p-3">
        <p className="rotulo mb-1">Na frase</p>
        <p className="text-[15px] leading-relaxed">
          {pedacos(d.frase).map((p, i) =>
            p.palavra && chave(p.t) === k ? (
              <mark key={i} className="bg-sun text-sun-fg rounded px-0.5">
                {p.t}
              </mark>
            ) : (
              <span key={i}>{p.t}</span>
            ),
          )}
        </p>
        <div className="mt-2 flex gap-2">
          <BotaoOuvir id={`frase:${d.frase}`} texto={d.frase} sotaque={d.sotaque} rotulo="Ouvir a frase" />
        </div>
      </div>

      <div className="flex gap-2">
        <button type="button" className="btn btn-primario flex-1" onClick={salvar} disabled={!trad}>
          <Icone nome="cards" tamanho={18} /> Virar card
        </button>
        <button type="button" className="btn btn-suave flex-1" onClick={() => cam.explicar(d.frase, d.palavra)}>
          <Icone nome="pergunta" tamanho={18} /> Por que é assim?
        </button>
      </div>
      <p className="text-[12px] text-muted">
        O card guarda a frase de onde a palavra veio, para você lembrar do contexto.
      </p>
    </div>
  );
}

function FolhaExplicar({ frase, foco }: { frase: string; foco?: string }) {
  const { estado } = useLoja();
  const ia = useEstadoIA();
  const [texto, setTexto] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [pergunta, setPergunta] = useState('');
  const ctl = useRef<AbortController | null>(null);
  const duvida = DUVIDAS.find((d) => d.frase.toLowerCase() === frase.trim().toLowerCase());

  const pedir = useCallback(
    (perg?: string) => {
      ctl.current?.abort();
      const c = new AbortController();
      ctl.current = c;
      setCarregando(true);
      setErro('');
      setTexto('');
      perguntarTexto(promptExplicar({ nivel: estado.perfil.nivel, frase, foco, pergunta: perg }), {
        signal: c.signal,
        onText: ({ text }) => setTexto(text),
        cache: perg ? false : { gcTime: 3_600_000 },
      })
        .then((t) => setTexto(t))
        .catch((e: ErroIA) => {
          if (e.code === 'cancelled') return;
          setTexto(e.text ?? '');
          if (!ehPermanente(e.code)) setErro(mensagemDeErro(e.code));
        })
        .finally(() => setCarregando(false));
    },
    [estado.perfil.nivel, frase, foco],
  );

  useEffect(() => {
    if (ia !== 'demo') pedir();
    return () => ctl.current?.abort();
    // Explica uma vez ao abrir; depois só se a pessoa perguntar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const semIA = ia === 'demo';
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl bg-surface-2 p-3 flex items-start gap-3">
        <p className="flex-1 text-[16px] font-medium leading-relaxed">{frase}</p>
        <BotaoOuvir id={`explica:${frase}`} texto={frase} />
      </div>

      {!semIA && (
        <div className="min-h-16 text-[15px] leading-relaxed">
          {texto ? <TextoFormatado texto={texto} /> : carregando ? <Carregando texto="A IA está pensando" /> : null}
          {erro && <p className="text-bad text-[14px] mt-2">{erro}</p>}
        </div>
      )}

      {semIA && !duvida && (
        <p className="text-[14px] text-muted rounded-2xl border border-dashed border-line p-3">
          No link publicado no Claude, a IA explica qualquer frase aqui, em português e no seu nível. Neste modo de
          demonstração, veja as explicações prontas em Galera › Dúvidas sobre frases.
        </p>
      )}

      {duvida && (
        <div className="rounded-2xl border border-line p-3 flex flex-col gap-1">
          <p className="rotulo">A galera respondeu · exemplo</p>
          <p className="font-semibold">{duvida.pergunta}</p>
          <p className="text-[14px] leading-relaxed">{duvida.resposta}</p>
          <p className="text-[12px] text-muted">
            {duvida.respondeu} · {duvida.votos} pessoas acharam útil
          </p>
        </div>
      )}

      {!semIA && (
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (pergunta.trim()) pedir(pergunta.trim());
            setPergunta('');
          }}
        >
          <label htmlFor="pergunta-frase" className="sr-only">
            Pergunte mais sobre a frase
          </label>
          <input
            id="pergunta-frase"
            value={pergunta}
            onChange={(e) => setPergunta(e.target.value)}
            placeholder="Ainda ficou dúvida? Pergunte."
            className="flex-1 min-w-0 h-11 rounded-full bg-surface-2 px-4 text-[15px] outline-none focus:ring-2 focus:ring-accent"
          />
          <button type="submit" className="btn btn-primario" disabled={carregando || !pergunta.trim()}>
            Perguntar
          </button>
        </form>
      )}
    </div>
  );
}
