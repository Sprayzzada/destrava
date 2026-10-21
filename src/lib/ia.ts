// Ponte com a IA do Claude. Só existe dentro do link publicado no Claude;
// fora dele (ou se a pessoa não permitir), o app segue no modo demonstração.
import { useSyncExternalStore } from 'react';

interface ResultadoIA {
  text: string;
  truncated: boolean;
}

type Entrada = string | { role: 'user' | 'assistant'; content: string }[];

interface OpcoesIA {
  onText?(u: { text: string; delta: string }): void;
  signal?: AbortSignal;
  modelTier?: 'quick' | 'default' | 'complex';
  cache?: boolean | { gcTime?: number };
}

type FuncaoIA = ((entrada: Entrada, o?: OpcoesIA) => Promise<ResultadoIA>) & {
  json<T>(entrada: Entrada, o?: OpcoesIA): Promise<T>;
};

declare global {
  interface Window {
    claude?: { use(nome: string): Promise<unknown> };
  }
}

export type EstadoIA = 'verificando' | 'ligada' | 'demo';

let estado: EstadoIA = typeof window !== 'undefined' && window.claude?.use ? 'verificando' : 'demo';
const ouvintes = new Set<() => void>();
let promessa: Promise<FuncaoIA | null> | null = null;

function mudar(e: EstadoIA) {
  if (estado === e) return;
  estado = e;
  ouvintes.forEach((f) => f());
}

export function iniciarIA(): Promise<FuncaoIA | null> {
  if (promessa) return promessa;
  if (typeof window === 'undefined' || !window.claude?.use) {
    mudar('demo');
    promessa = Promise.resolve(null);
    return promessa;
  }
  promessa = window.claude
    .use('sample')
    .then((s) => {
      mudar(s ? 'ligada' : 'demo');
      return (s as FuncaoIA | null) ?? null;
    })
    .catch(() => {
      mudar('demo');
      return null;
    });
  return promessa;
}

export function useEstadoIA(): EstadoIA {
  return useSyncExternalStore(
    (cb) => {
      ouvintes.add(cb);
      return () => ouvintes.delete(cb);
    },
    () => estado,
  );
}

export interface ErroIA {
  code: string;
  message?: string;
  text?: string;
}

const PERMANENTES = new Set([
  'not_granted',
  'sampling_disabled',
  'not_declared',
  'capability_disabled',
  'capability_removed',
  'session_expired',
]);

function tratarErro(e: unknown): never {
  const erro = (e && typeof e === 'object' ? e : { code: 'upstream_error' }) as ErroIA;
  if (PERMANENTES.has(erro.code)) mudar('demo');
  throw erro;
}

export async function perguntarJSON<T>(entrada: Entrada, o: OpcoesIA = {}): Promise<T> {
  const ia = await iniciarIA();
  if (!ia) throw { code: 'demo' } satisfies ErroIA;
  try {
    return await ia.json<T>(entrada, { modelTier: 'quick', ...o });
  } catch (e) {
    return tratarErro(e);
  }
}

export async function perguntarTexto(entrada: Entrada, o: OpcoesIA = {}): Promise<string> {
  const ia = await iniciarIA();
  if (!ia) throw { code: 'demo' } satisfies ErroIA;
  try {
    const r = await ia(entrada, { modelTier: 'quick', ...o });
    return r.text;
  } catch (e) {
    return tratarErro(e);
  }
}

export function mensagemDeErro(code: string): string {
  switch (code) {
    case 'demo':
    case 'not_granted':
    case 'sampling_disabled':
    case 'not_declared':
    case 'capability_disabled':
    case 'capability_removed':
      return 'A IA não está disponível aqui. O app segue no modo demonstração.';
    case 'session_expired':
      return 'Sua sessão no Claude expirou. Entre de novo para usar a IA.';
    case 'rate_limited':
      return 'Muitos pedidos seguidos para a IA. Espere um pouco e tente de novo.';
    case 'refused':
      return 'A IA não respondeu a esse pedido. Tente com outras palavras.';
    case 'invalid_json':
    case 'empty_completion':
      return 'A resposta veio incompleta. Tente de novo.';
    case 'cancelled':
      return 'Pedido cancelado.';
    default:
      return 'A conexão com a IA falhou. Tente de novo.';
  }
}

export function ehPermanente(code: string): boolean {
  return code === 'demo' || PERMANENTES.has(code);
}
