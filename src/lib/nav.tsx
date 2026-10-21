import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

export type Aba = 'hoje' | 'falar' | 'feed' | 'revisar' | 'galera';

export type Rota =
  | { tela: 'hoje' }
  | { tela: 'falar'; seg?: 'conversa' | 'pronuncia' }
  | { tela: 'feed'; seg?: 'pravoce' | 'ouvido' }
  | { tela: 'revisar' }
  | { tela: 'galera' }
  | { tela: 'conversa'; cenario: string }
  | { tela: 'unidade'; id: string }
  | { tela: 'reels'; inicio: number }
  | { tela: 'leitura'; id: string }
  | { tela: 'livro'; id: string }
  | { tela: 'mapa' }
  | { tela: 'perfil' };

const ABA: Record<Rota['tela'], Aba> = {
  hoje: 'hoje',
  falar: 'falar',
  feed: 'feed',
  revisar: 'revisar',
  galera: 'galera',
  conversa: 'falar',
  unidade: 'falar',
  reels: 'feed',
  leitura: 'feed',
  livro: 'feed',
  mapa: 'hoje',
  perfil: 'hoje',
};

const RAIZES = new Set<Rota['tela']>(['hoje', 'falar', 'feed', 'revisar', 'galera']);

/** Quais dores (do Define) cada tela responde. */
export function doresDaRota(r: Rota): number[] {
  switch (r.tela) {
    case 'hoje':
      return [3];
    case 'falar':
      return r.seg === 'pronuncia' ? [5] : [1];
    case 'conversa':
      return [1, 3];
    case 'unidade':
      return [5];
    case 'feed':
      return r.seg === 'ouvido' ? [4] : [7, 4];
    case 'reels':
      return [7, 4, 2];
    case 'leitura':
      return [7, 4, 3];
    case 'livro':
      return [7, 2];
    case 'revisar':
      return [2];
    case 'galera':
      return [6, 1, 5];
    case 'mapa':
      return [1, 2, 3, 4, 5, 6, 7];
    default:
      return [];
  }
}

interface Nav {
  rota: Rota;
  aba: Aba;
  profundidade: number;
  ir(r: Rota): void;
  voltar(): void;
  trocarAba(a: Aba): void;
}

const Contexto = createContext<Nav | null>(null);

export function ProvedorNav({ children }: { children: ReactNode }) {
  const [pilha, setPilha] = useState<Rota[]>([{ tela: 'hoje' }]);

  const ir = useCallback((r: Rota) => {
    setPilha((p) => (RAIZES.has(r.tela) ? [r] : [...p, r]));
  }, []);

  const voltar = useCallback(() => {
    setPilha((p) => (p.length > 1 ? p.slice(0, -1) : [{ tela: 'hoje' }]));
  }, []);

  const trocarAba = useCallback((a: Aba) => {
    setPilha([{ tela: a } as Rota]);
  }, []);

  const valor = useMemo<Nav>(() => {
    const rota = pilha[pilha.length - 1];
    return { rota, aba: ABA[rota.tela], profundidade: pilha.length, ir, voltar, trocarAba };
  }, [pilha, ir, voltar, trocarAba]);

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useNav(): Nav {
  const n = useContext(Contexto);
  if (!n) throw new Error('useNav fora do ProvedorNav');
  return n;
}
