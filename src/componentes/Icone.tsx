import type { SVGProps } from 'react';

const TRACOS: Record<string, string> = {
  casa: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z',
  balao: 'M5 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-8l-5 4v-4H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
  ouvir: 'M11 5 6 9H3v6h3l5 4zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13',
  check: 'M5 12.5 10 17.5 19 7',
  x: 'M6 6l12 12M18 6 6 18',
  voltar: 'M15 5 8 12l7 7',
  seta: 'M9 5l7 7-7 7',
  cards: 'M4 7h12a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1zM7 3h13a1 1 0 0 1 1 1v13',
  feed: 'M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM10 8.5v7l6-3.5z',
  pessoas: 'M9 11.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2.5 20a6.5 6.5 0 0 1 13 0M16.5 11a2.5 2.5 0 1 0 0-5M17 14.2a5 5 0 0 1 4.5 5',
  ouvido: 'M7 9.5a5 5 0 0 1 10 0c0 3.2-3 4.2-3 7a3 3 0 0 1-5.6 1.4M10 9.5a2 2 0 0 1 4 0c0 1.2-1 1.6-1.5 2.4',
  livro: 'M3 5.5A1.5 1.5 0 0 1 4.5 4H9a3 3 0 0 1 3 3v13a2.5 2.5 0 0 0-2.5-2.5H4.5A1.5 1.5 0 0 1 3 16zM21 5.5A1.5 1.5 0 0 0 19.5 4H15a3 3 0 0 0-3 3v13a2.5 2.5 0 0 1 2.5-2.5h5a1.5 1.5 0 0 0 1.5-1.5z',
  jornal: 'M5 4h12a2 2 0 0 1 2 2v14H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM19 9h2v9a2 2 0 0 1-2 2M7 8h8M7 12h8M7 16h5',
  tela: 'M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM8 21h8M12 17v4',
  brilho: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z',
  pergunta: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9.5 9.2a2.6 2.6 0 0 1 5 .8c0 1.8-2.5 2.2-2.5 4M12 17.2h.01',
  mais: 'M12 5v14M5 12h14',
  traduzir: 'M4 5h8M8 3v2M5.5 5c.6 3 2.6 5.5 5.5 7M10.5 5c-.6 3-2.6 5.5-5.5 7M13 21l4-9 4 9M14.5 18h5',
  enviar: 'M4 12 20 4l-6 16-3-7z',
  perfil: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
  cadeado: 'M6 11h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1zM8 11V7a4 4 0 0 1 7.6-1.8',
  onda: 'M3 12h1.5M7 8.5v7M11 5v14M15 8.5v7M19 11v2',
  salvar: 'M6 3h12v18l-6-4-6 4z',
  lampada: 'M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z',
  relogio: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
  legenda: 'M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM10.5 10.2a2.2 2.2 0 1 0 0 3.6M17.5 10.2a2.2 2.2 0 1 0 0 3.6',
  lixo: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
  teclado: 'M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2zM6.5 10h.01M10 10h.01M13.5 10h.01M17 10h.01M7.5 14h9',
  repetir: 'M4 12a8 8 0 0 1 14-5.3L20 9M20 4v5h-5M20 12a8 8 0 0 1-14 5.3L4 15M4 20v-5h5',
  mapa: 'M9 4 3 6.5v13.5l6-2.5 6 2.5 6-2.5V4l-6 2.5zM9 4v13.5M15 6.5V20',
  escada: 'M4 20h4v-4h4v-4h4V8h4',
  alvo: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 12h.01',
  link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  externo: 'M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5',
};

const CHEIOS: Record<string, string> = {
  play: 'M7 4.5v15a1 1 0 0 0 1.5.9l12-7.5a1 1 0 0 0 0-1.8l-12-7.5A1 1 0 0 0 7 4.5z',
  pausa: 'M6 4h4v16H6zM14 4h4v16h-4z',
  parar: 'M7 6h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z',
  gravar: 'M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z',
  ponto: 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
};

export type NomeIcone = keyof typeof TRACOS | keyof typeof CHEIOS | 'mic';

export function Icone({ nome, tamanho = 20, ...resto }: { nome: NomeIcone; tamanho?: number } & SVGProps<SVGSVGElement>) {
  const comum = {
    width: tamanho,
    height: tamanho,
    viewBox: '0 0 24 24',
    'aria-hidden': true,
    focusable: false,
    ...resto,
  } as const;
  if (nome === 'mic') {
    return (
      <svg {...comum} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="3" width="6" height="11" rx="3" />
        <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
      </svg>
    );
  }
  if (nome in CHEIOS) {
    return (
      <svg {...comum} fill="currentColor">
        <path d={CHEIOS[nome]} />
      </svg>
    );
  }
  return (
    <svg {...comum} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d={TRACOS[nome]} />
    </svg>
  );
}

/** Marca do app: balão de fala com o cadeado aberto. */
export function Marca({ tamanho = 28 }: { tamanho?: number }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 32 32" aria-hidden="true">
      <path d="M10.5 11V8.2a5.3 5.3 0 0 1 10.2-2" fill="none" stroke="var(--sun)" strokeWidth="2.8" strokeLinecap="round" />
      <path
        d="M6 11.5h20a3 3 0 0 1 3 3v8.5a3 3 0 0 1-3 3H14.5L8.5 30v-4H6a3 3 0 0 1-3-3v-8.5a3 3 0 0 1 3-3z"
        fill="var(--accent)"
      />
      <path d="M10 17.5v3M14 15.5v7M18 16.5v5M22 18v2" stroke="var(--accent-fg)" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}
