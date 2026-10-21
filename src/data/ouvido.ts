import type { Sotaque } from '../lib/tipos';

export interface Reducao {
  rapido: string;
  completo: string;
  pt: string;
  exemplo: string;
}

/** Como as palavras "grudam" na fala rápida. */
export const REDUCOES: Reducao[] = [
  { rapido: 'gonna', completo: 'going to', pt: 'vou / vai', exemplo: "I'm gonna grab a coffee." },
  { rapido: 'wanna', completo: 'want to', pt: 'quero / quer', exemplo: 'Do you wanna come with us?' },
  { rapido: 'gotta', completo: 'have got to', pt: 'tenho que', exemplo: 'I gotta go, sorry.' },
  { rapido: 'lemme', completo: 'let me', pt: 'deixa eu', exemplo: 'Lemme check my calendar.' },
  { rapido: 'gimme', completo: 'give me', pt: 'me dá', exemplo: 'Gimme a second.' },
  { rapido: 'kinda', completo: 'kind of', pt: 'meio, um pouco', exemplo: "I'm kinda tired today." },
  { rapido: 'dunno', completo: "don't know", pt: 'sei lá', exemplo: 'I dunno, maybe tomorrow?' },
  { rapido: 'whatcha', completo: 'what are you', pt: 'o que você está', exemplo: 'Whatcha doing tonight?' },
  { rapido: 'didja', completo: 'did you', pt: 'você ... ?', exemplo: 'Didja see the game last night?' },
  { rapido: 'outta', completo: 'out of', pt: 'sem, fora de', exemplo: "We're outta milk." },
  { rapido: "'cause", completo: 'because', pt: 'porque', exemplo: "I stayed home 'cause it was raining." },
  { rapido: 'ya', completo: 'you', pt: 'você', exemplo: 'See ya tomorrow!' },
];

export interface Ditado {
  texto: string;
  dica: string;
}

export const DITADOS: Ditado[] = [
  { texto: "I'm gonna grab a coffee. Do you want anything?", dica: 'Pedido rápido no trabalho' },
  { texto: 'Whatcha doing this weekend?', dica: 'Pergunta entre amigos' },
  { texto: 'I dunno, I kinda wanna stay home.', dica: 'Resposta preguiçosa' },
  { texto: 'Lemme check my calendar real quick.', dica: 'Marcando uma reunião' },
  { texto: 'We gotta leave in like five minutes.', dica: 'Saindo com pressa' },
  { texto: 'Did you get my message last night?', dica: 'Conferindo uma mensagem' },
  { texto: "It's not that bad, but it's not great either.", dica: 'Dando opinião' },
  { texto: 'Could you send me the file when you get a chance?', dica: 'Pedido educado no trabalho' },
];

export interface InfoSotaque {
  lang: Sotaque;
  nome: string;
  sigla: string;
  tracos: string[];
}

export const SOTAQUES: InfoSotaque[] = [
  {
    lang: 'en-US',
    nome: 'Estados Unidos',
    sigla: 'US',
    tracos: ['O R é sempre pronunciado: "car" termina com R.', 'T entre vogais vira um "r" rápido: "water" soa "wárer".'],
  },
  {
    lang: 'en-GB',
    nome: 'Inglaterra',
    sigla: 'UK',
    tracos: ['O R do final some: "car" soa "cah".', 'T bem marcado: "water" é "uó-tah".', 'O A de "can\'t" e "bath" é longo e aberto.'],
  },
  {
    lang: 'en-AU',
    nome: 'Austrália',
    sigla: 'AU',
    tracos: ['"Day" soa quase "dai".', 'Muitas frases terminam subindo, como pergunta.', 'Adoram abreviar: "arvo" (afternoon), "brekkie" (breakfast).'],
  },
  {
    lang: 'en-IN',
    nome: 'Índia',
    sigla: 'IN',
    tracos: ['Ritmo mais silábico: cada sílaba com peso parecido.', 'T e D com a língua mais para trás.', 'R batido, parecido com o nosso de "caro".'],
  },
  {
    lang: 'en-IE',
    nome: 'Irlanda',
    sigla: 'IE',
    tracos: ['O TH muitas vezes vira T ou D: "tree" no lugar de "three".', 'Entonação melodiosa, sobe e desce bastante.'],
  },
  {
    lang: 'en-CA',
    nome: 'Canadá',
    sigla: 'CA',
    tracos: ['Bem parecido com o americano.', '"About" e "out" soam um pouco mais fechados, quase "a-bôut".'],
  },
  {
    lang: 'en-ZA',
    nome: 'África do Sul',
    sigla: 'ZA',
    tracos: ['Vogais mais curtas e fechadas.', 'R às vezes batido, com influência do africâner.'],
  },
  {
    lang: 'en-NZ',
    nome: 'Nova Zelândia',
    sigla: 'NZ',
    tracos: ['O I curto de "fish" fica quase como "fêsh".', 'Parecido com o australiano, mas mais suave.'],
  },
];

export const FRASE_SOTAQUE = "I'd love a glass of water, but I can't find my car keys anywhere.";
