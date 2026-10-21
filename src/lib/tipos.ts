export type Nivel = 'A2' | 'B1' | 'B2';

export type Interesse =
  | 'tecnologia'
  | 'series'
  | 'games'
  | 'viagem'
  | 'negocios'
  | 'musica'
  | 'esportes'
  | 'ciencia';

export const INTERESSES: { id: Interesse; nome: string }[] = [
  { id: 'tecnologia', nome: 'Tecnologia' },
  { id: 'series', nome: 'Séries e filmes' },
  { id: 'games', nome: 'Games' },
  { id: 'viagem', nome: 'Viagem' },
  { id: 'negocios', nome: 'Trabalho e negócios' },
  { id: 'musica', nome: 'Música' },
  { id: 'esportes', nome: 'Esportes' },
  { id: 'ciencia', nome: 'Ciência' },
];

export const NOME_INTERESSE = Object.fromEntries(INTERESSES.map((i) => [i.id, i.nome])) as Record<
  Interesse,
  string
>;

export type Minutos = 10 | 20 | 30;

export interface Perfil {
  nome: string;
  nivel: Nivel;
  minutos: Minutos;
  travas: number[];
  interesses: Interesse[];
  pronto: boolean;
}

export type OrigemCard = 'video' | 'leitura' | 'livro' | 'conversa' | 'pronuncia' | 'manual' | 'inicial';

export interface Card {
  id: string;
  frente: string;
  verso: string;
  exemplo?: string;
  origem: OrigemCard;
  origemTitulo: string;
  intervalo: number;
  facilidade: number;
  vence: string;
  reps: number;
  criado: string;
}

export type Apoio = 'rodinhas' | 'dicas' | 'livre';

export type Sotaque = 'en-US' | 'en-GB' | 'en-AU' | 'en-IN' | 'en-IE' | 'en-CA' | 'en-ZA' | 'en-NZ';
