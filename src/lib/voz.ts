// Voz do aparelho (falar), reconhecimento de fala (ouvir) e gravação.
import { useSyncExternalStore } from 'react';
import type { Sotaque } from './tipos';

const sintese: SpeechSynthesis | null =
  typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;

export const ttsDisponivel = !!sintese;

/** Dentro do link publicado no Claude o app roda numa moldura que bloqueia o microfone.
 *  Em outras molduras (ex.: pré-visualização do bolt.new) o app tenta e, se o navegador negar, ensina o ditado. */
export const emMoldura = (() => {
  try {
    return window.self !== window.top && !!(window as unknown as { claude?: unknown }).claude;
  } catch {
    return true;
  }
})();

// ---------- Vozes ----------

let vozes: SpeechSynthesisVoice[] = [];
let totalVozes = 0;
const ouvintesVozes = new Set<() => void>();

function langDe(v: SpeechSynthesisVoice): string {
  return v.lang.replace('_', '-').toLowerCase();
}

function atualizarVozes() {
  if (!sintese) return;
  const todas = sintese.getVoices();
  totalVozes = todas.length;
  vozes = todas.filter((v) => langDe(v).startsWith('en'));
  ouvintesVozes.forEach((f) => f());
}

if (sintese) {
  atualizarVozes();
  sintese.addEventListener?.('voiceschanged', atualizarVozes);
}

export function useVozes(): SpeechSynthesisVoice[] {
  return useSyncExternalStore(
    (cb) => {
      ouvintesVozes.add(cb);
      return () => ouvintesVozes.delete(cb);
    },
    () => vozes,
  );
}

/** O aparelho tem vozes, mas nenhuma em inglês (o inglês sairia com sotaque de outra língua). */
export function useSemVozIngles(): boolean {
  const lista = useVozes();
  return ttsDisponivel && totalVozes > 0 && lista.length === 0;
}

function qualidade(v: SpeechSynthesisVoice): number {
  const n = v.name.toLowerCase();
  return (n.includes('natural') ? 4 : 0) + (n.includes('online') ? 2 : 0) + (n.includes('google') ? 2 : 0);
}

export function vozesDoSotaque(s: Sotaque, lista = vozes): SpeechSynthesisVoice[] {
  return lista.filter((v) => langDe(v) === s.toLowerCase()).sort((a, b) => qualidade(b) - qualidade(a));
}

export function escolherVoz(s: Sotaque, indice = 0): SpeechSynthesisVoice | undefined {
  let lista = vozesDoSotaque(s);
  if (!lista.length) lista = vozesDoSotaque('en-US');
  if (!lista.length) lista = vozes;
  return lista.length ? lista[indice % lista.length] : undefined;
}

export function temSotaque(s: Sotaque, lista = vozes): boolean {
  return vozesDoSotaque(s, lista).length > 0;
}

// ---------- Falar ----------

export interface Linha {
  texto: string;
  sotaque?: Sotaque;
  indiceVoz?: number;
}

export interface OpcoesFala {
  velocidade?: number;
  aoLinha?(i: number): void;
  aoPalavra?(linha: number, ini: number, fim: number): void;
  aoTerminar?(): void;
}

let geracao = 0;
let tocandoId: string | null = null;
const ouvintesTocando = new Set<() => void>();

function setTocando(id: string | null) {
  tocandoId = id;
  ouvintesTocando.forEach((f) => f());
}

export function useTocando(): string | null {
  return useSyncExternalStore(
    (cb) => {
      ouvintesTocando.add(cb);
      return () => ouvintesTocando.delete(cb);
    },
    () => tocandoId,
  );
}

export function pararFala(): void {
  geracao++;
  sintese?.cancel();
  setTocando(null);
}

/** Fala uma ou mais linhas em sequência. `id` identifica quem está tocando (para mostrar ▶/■). */
export function tocar(id: string, linhas: Linha[], o: OpcoesFala = {}): void {
  pararFala();
  if (!sintese || !linhas.length) {
    o.aoTerminar?.();
    return;
  }
  const minha = ++geracao;
  setTocando(id);

  const falarLinha = (i: number) => {
    if (minha !== geracao) return;
    if (i >= linhas.length) {
      setTocando(null);
      o.aoTerminar?.();
      return;
    }
    const l = linhas[i];
    const u = new SpeechSynthesisUtterance(l.texto);
    const voz = escolherVoz(l.sotaque ?? 'en-US', l.indiceVoz ?? 0);
    if (voz) {
      u.voice = voz;
      u.lang = voz.lang;
    } else {
      u.lang = l.sotaque ?? 'en-US';
    }
    u.rate = o.velocidade ?? 1;
    u.onstart = () => {
      if (minha === geracao) o.aoLinha?.(i);
    };
    u.onboundary = (e) => {
      if (minha !== geracao || (e.name && e.name !== 'word')) return;
      const ini = e.charIndex;
      const tam = e.charLength || (l.texto.slice(ini).match(/^[^\s.,!?;:]+/)?.[0].length ?? 0);
      o.aoPalavra?.(i, ini, ini + tam);
    };
    u.onend = () => falarLinha(i + 1);
    u.onerror = (ev) => {
      if (ev.error === 'interrupted' || ev.error === 'canceled') return;
      falarLinha(i + 1);
    };
    sintese.speak(u);
  };
  falarLinha(0);
}

export function falar(texto: string, sotaque: Sotaque = 'en-US', velocidade = 1): void {
  tocar(`avulso:${texto}`, [{ texto, sotaque }], { velocidade });
}

// ---------- Ouvir (reconhecimento de fala) ----------

type ClasseReconhecimento = new () => {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  onresult: ((e: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
};

const Reconhecimento: ClasseReconhecimento | undefined =
  typeof window !== 'undefined'
    ? ((window as unknown as Record<string, ClasseReconhecimento | undefined>).SpeechRecognition ??
      (window as unknown as Record<string, ClasseReconhecimento | undefined>).webkitSpeechRecognition)
    : undefined;

let micNegado = false;

export function micPossivel(): boolean {
  return !!Reconhecimento && !emMoldura && !micNegado;
}

export type ErroMic = 'negado' | 'sem-fala' | 'outro';

export function ouvirFala(o: {
  aoParcial?(t: string): void;
  aoFinal(t: string): void;
  aoErro(e: ErroMic): void;
  aoFim?(): void;
}): () => void {
  if (!Reconhecimento) {
    o.aoErro('negado');
    o.aoFim?.();
    return () => {};
  }
  const r = new Reconhecimento();
  r.lang = 'en-US';
  r.interimResults = true;
  r.continuous = false;
  r.maxAlternatives = 1;
  let final = '';
  r.onresult = (e) => {
    let parcial = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const t = e.results[i][0].transcript;
      if (e.results[i].isFinal) final += t;
      else parcial += t;
    }
    o.aoParcial?.((final + parcial).trim());
  };
  r.onerror = (e) => {
    if (e.error === 'not-allowed' || e.error === 'service-not-allowed' || e.error === 'audio-capture') {
      micNegado = true;
      o.aoErro('negado');
    } else if (e.error === 'no-speech') {
      o.aoErro('sem-fala');
    } else if (e.error !== 'aborted') {
      o.aoErro('outro');
    }
  };
  r.onend = () => {
    if (final.trim()) o.aoFinal(final.trim());
    o.aoFim?.();
  };
  try {
    r.start();
  } catch {
    o.aoErro('outro');
    o.aoFim?.();
  }
  return () => {
    try {
      r.stop();
    } catch {
      /* já parou */
    }
  };
}

// ---------- Gravar ----------

export function gravacaoPossivel(): boolean {
  return (
    !emMoldura && typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined'
  );
}

/** Começa a gravar; devolve uma função que para e entrega o endereço do áudio. */
export async function comecarGravacao(): Promise<() => Promise<string>> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const rec = new MediaRecorder(stream);
  const partes: Blob[] = [];
  rec.ondataavailable = (e) => partes.push(e.data);
  rec.start();
  return () =>
    new Promise((resolver) => {
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        resolver(URL.createObjectURL(new Blob(partes, { type: rec.mimeType })));
      };
      rec.stop();
    });
}

// ---------- Ditado do aparelho ----------

export type Plataforma = 'celular' | 'windows' | 'mac' | 'outro';

export function plataforma(): Plataforma {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  if (/Android|iPhone|iPad|iPod|Mobile/i.test(ua)) return 'celular';
  if (/Windows/i.test(ua)) return 'windows';
  if (/Macintosh|Mac OS/i.test(ua)) return 'mac';
  return 'outro';
}
