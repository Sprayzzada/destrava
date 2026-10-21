// Comunidade de EXEMPLO: pessoas e conversas fictícias para mostrar como funcionaria.
import type { Interesse } from '../lib/tipos';

export interface Pessoa {
  id: string;
  nome: string;
  lugar: string;
  inicial: string;
  cor: string;
  nativo: boolean;
  nivel: string;
  aprende?: string;
  interesses: Interesse[];
  jeito: string;
  bio: string;
}

export const PESSOAS: Pessoa[] = [
  {
    id: 'ellie',
    nome: 'Ellie',
    lugar: 'Manchester, Reino Unido',
    inicial: 'E',
    cor: 'var(--reel-menta)',
    nativo: true,
    nivel: 'Nativa',
    aprende: 'Português (B1)',
    interesses: ['series', 'musica'],
    jeito: 'Áudio sem pressa',
    bio: 'Troca: 15 min em inglês, 15 em português. Adoro novela brasileira.',
  },
  {
    id: 'marcus',
    nome: 'Marcus',
    lugar: 'Toronto, Canadá',
    inicial: 'M',
    cor: 'var(--reel-cobalto)',
    nativo: true,
    nivel: 'Nativo',
    aprende: 'Português (A2)',
    interesses: ['tecnologia', 'games'],
    jeito: 'Chamada curta, 15 min',
    bio: 'Dev, vou trabalhar com um time em São Paulo. Topo trocar idioma.',
  },
  {
    id: 'bianca',
    nome: 'Bianca',
    lugar: 'Recife',
    inicial: 'B',
    cor: 'var(--reel-coral)',
    nativo: false,
    nivel: 'B1',
    interesses: ['viagem', 'series'],
    jeito: 'Introvertida: prefere áudio',
    bio: 'Leio tudo, mas travo para falar. Bora treinar por áudio, sem chamada?',
  },
  {
    id: 'kenji',
    nome: 'Kenji',
    lugar: 'Osaka, Japão',
    inicial: 'K',
    cor: 'var(--reel-lilas)',
    nativo: false,
    nivel: 'B1',
    interesses: ['games', 'tecnologia'],
    jeito: 'Texto e áudio',
    bio: 'Também aprendo inglês. Treinar com quem não é nativo tira a pressão.',
  },
  {
    id: 'lucas',
    nome: 'Lucas',
    lugar: 'Porto Alegre',
    inicial: 'L',
    cor: 'var(--reel-sol)',
    nativo: false,
    nivel: 'A2',
    interesses: ['esportes', 'musica'],
    jeito: 'Grupo de 3',
    bio: 'Começando agora. Prefiro grupo pequeno, me sinto menos exposto.',
  },
  {
    id: 'priya',
    nome: 'Priya',
    lugar: 'Bangalore, Índia',
    inicial: 'P',
    cor: 'var(--reel-tinta)',
    nativo: true,
    nivel: 'Nativa',
    aprende: 'Espanhol',
    interesses: ['negocios', 'tecnologia'],
    jeito: 'Treino de entrevista',
    bio: 'Recrutadora. Ajudo a treinar entrevistas em inglês, com feedback direto.',
  },
];

export const SALAS = [
  {
    id: 'silenciosa',
    nome: 'Sala silenciosa',
    tema: 'Só ouvir: você entra mudo e fala só se quiser.',
    nivel: 'Todos',
    pessoas: 14,
    vagas: null as number | null,
    degrau: 3,
  },
  {
    id: 'cafe20h',
    nome: 'Café das 20h',
    tema: 'Séries que você está vendo',
    nivel: 'B1',
    pessoas: 4,
    vagas: 6,
    degrau: 4,
  },
  {
    id: 'trio',
    nome: 'Trio de entrevista',
    tema: 'Cada um faz uma pergunta e recebe feedback',
    nivel: 'B2',
    pessoas: 2,
    vagas: 3,
    degrau: 4,
  },
  {
    id: 'gamers',
    nome: 'Gamers falando inglês',
    tema: 'O que você está jogando?',
    nivel: 'B1',
    pessoas: 5,
    vagas: 8,
    degrau: 5,
  },
];

export const DEGRAUS = [
  { n: 1, nome: 'Só com a IA', explica: 'Ninguém ouve. Erre à vontade.' },
  { n: 2, nome: 'Áudio com 1 parceiro', explica: 'Sem ao vivo: grave, ouça e responda no seu tempo.' },
  { n: 3, nome: 'Sala silenciosa', explica: 'Entre só para ouvir. Fale se e quando quiser.' },
  { n: 4, nome: 'Trio pequeno', explica: 'Três pessoas do seu nível, com tema definido.' },
  { n: 5, nome: 'Sala aberta', explica: 'Conversa livre com mais gente.' },
];

export const AVALIACOES = [
  {
    id: 'a1',
    autor: 'Bianca',
    pedido: 'Meu TH em "three" e "think" está ok?',
    som: 'O TH de "think"',
    respostas: [
      {
        quem: 'Ellie',
        nativo: true,
        en: '"Think" is spot on! In "three" your tongue slips back a bit, so it sounds close to "tree". Keep it between your teeth a little longer.',
        pt: '"Think" está perfeito! No "three" a língua volta um pouco e soa perto de "tree". Deixe ela entre os dentes um pouco mais.',
        notas: { TH: 'quase lá', Ritmo: 'bom' },
      },
    ],
  },
  {
    id: 'a2',
    autor: 'Lucas',
    pedido: 'Meu "sheep" está soando como "ship"?',
    som: '"Ship" e "sheep"',
    respostas: [
      {
        quem: 'Marcus',
        nativo: true,
        en: 'A little, yes. Smile more and hold the vowel: sheeeep. Your "ship" is great, though.',
        pt: 'Um pouco, sim. Sorria mais e segure a vogal: sheeeep. Seu "ship" está ótimo.',
        notas: { 'I longo': 'curto demais', 'I curto': 'ótimo' },
      },
    ],
  },
];

export interface Duvida {
  frase: string;
  pergunta: string;
  autor: string;
  resposta: string;
  respondeu: string;
  votos: number;
}

/** A "discussão da frase" que o Duolingo removeu, de volta. */
export const DUVIDAS: Duvida[] = [
  {
    frase: "I've been working here since 2022.",
    pergunta: 'Por que não "I work here since 2022"?',
    autor: 'Bianca',
    resposta:
      'Porque "since" liga um ponto do passado ao agora. Quando a ação começou antes e continua, o inglês usa "have been + -ing" (ou "have worked"). "I work here since" soa como tradução direta do português.',
    respondeu: 'Ellie',
    votos: 48,
  },
  {
    frase: 'Do you mind if I sit here?',
    pergunta: 'Se eu responder "yes", a pessoa pode sentar?',
    autor: 'Lucas',
    resposta:
      'Não! "Do you mind" é "você se importa". "Yes" quer dizer "me importo, sim". Para deixar, responda "No, go ahead" ou "Not at all".',
    respondeu: 'Marcus',
    votos: 112,
  },
  {
    frase: "I'm used to waking up early.",
    pergunta: 'Por que "waking" e não "wake"?',
    autor: 'Kenji',
    resposta:
      'Em "be used to" (estar acostumado), o "to" é preposição, e depois de preposição o verbo vai com -ing. Já "I used to wake up early" (sem o "be") quer dizer "eu costumava acordar cedo".',
    respondeu: 'Priya',
    votos: 67,
  },
];

export const DESAFIO = {
  titulo: 'Grave 30 segundos contando sua série favorita',
  participantes: 38,
  termina: 'domingo',
};
