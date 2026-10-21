// As 7 dores levantadas no Define e como o app responde a cada uma.
import type { Rota } from '../lib/nav';

export interface Dor {
  id: number;
  titulo: string;
  curto: string;
  ouvimos: string[];
  resposta: string;
  recursos: { nome: string; rota: Rota }[];
}

export const DORES: Dor[] = [
  {
    id: 1,
    titulo: 'Entendo, mas não consigo falar',
    curto: 'Trava na fala',
    ouvimos: [
      'Lê um artigo e responde no chat de boa, mas na hora de falar o cérebro congela.',
      'Não tem com quem praticar, ou é introvertido e não consegue frequentar grupos com constância.',
      '"So hard to get feedback that helps me improve."',
    ],
    resposta:
      'Conversa com IA sem plateia, em cenários reais e com três níveis de apoio. O botão Travei transforma o que você quer dizer em português em três jeitos de falar em inglês, e cada fala recebe uma correção explicada em português.',
    recursos: [
      { nome: 'Conversa com IA', rota: { tela: 'falar' } },
      { nome: 'Daily no trabalho', rota: { tela: 'conversa', cenario: 'daily' } },
      { nome: 'Escada de exposição', rota: { tela: 'galera' } },
    ],
  },
  {
    id: 2,
    titulo: 'Flashcards funcionam, mas cansam',
    curto: 'Flashcards cansativos',
    ouvimos: [
      'Pular alguns dias e encontrar 500 cards esperando: o motivo mais comum para largar o Anki.',
      'Gastar duas horas por dia copiando frases da Netflix para o Anki leva ao burnout.',
      'O processo é repetitivo e desmotivador.',
    ],
    resposta:
      'Limite diário que nunca vira avalanche: se você some, a fila se espalha pelos próximos dias. Os cards nascem com um toque numa palavra de vídeo, leitura ou correção, já com a frase de onde vieram.',
    recursos: [
      { nome: 'Revisão sem avalanche', rota: { tela: 'revisar' } },
      { nome: 'Palavra tocável no vídeo', rota: { tela: 'reels', inicio: 0 } },
    ],
  },
  {
    id: 3,
    titulo: 'Não sei quais ferramentas usar',
    curto: 'Ferramentas soltas',
    ouvimos: [
      'Todo mundo tem streak de 500 dias, mas trava quando perguntam algo no idioma.',
      'O app explica mal a gramática, e a discussão das frases foi removida.',
      'Sensação de que o app ensina devagar para manter a pessoa presa.',
      'Um app para vocabulário, um livro de gramática, vídeos, podcasts e outra plataforma para conversar.',
    ],
    resposta:
      'Um plano do dia que junta ouvido, revisão, fala e pronúncia. O progresso mede minutos falando, não ofensiva. Qualquer frase tem o botão "Por que é assim?", e o nível mostra o que falta para subir.',
    recursos: [
      { nome: 'Plano de hoje', rota: { tela: 'hoje' } },
      { nome: 'Por que é assim? numa leitura', rota: { tela: 'leitura', id: 'telhados' } },
    ],
  },
  {
    id: 4,
    titulo: 'Não entendo o idioma fora dos exercícios',
    curto: 'Inglês do mundo real',
    ouvimos: [
      'Não entende nativos falando rápido, como "¿Comtá?" no lugar de "¿Cómo estás?".',
      'Ouvido viciado no professor: foi a uma reunião em inglês e não entendeu nada.',
      'Entende bem um sotaque, mas sofre com os de outras regiões.',
    ],
    resposta:
      'Treino de ouvido com fala rápida decodificada (gonna, wanna, lemme), ditado em velocidade real e vozes de vários sotaques. No feed, tudo tem áudio e legenda tocável.',
    recursos: [
      { nome: 'Treino de ouvido', rota: { tela: 'feed', seg: 'ouvido' } },
      { nome: 'Vídeos curtos', rota: { tela: 'reels', inicio: 0 } },
    ],
  },
  {
    id: 5,
    titulo: 'Pronúncia sem direção',
    curto: 'Pronúncia',
    ouvimos: [
      'Nota o sotaque nas próprias gravações, mas não sabe quais vogais ou consoantes estão erradas.',
      'Pede que um humano avalie o sotaque, com feedback honesto sobre sons específicos.',
    ],
    resposta:
      'Os 7 sons que mais entregam o sotaque brasileiro, com teste de ouvido, diagnóstico do que saiu diferente ("ouvimos sink: o TH virou S") e pedido de avaliação para nativos da comunidade.',
    recursos: [
      { nome: 'Laboratório de sons', rota: { tela: 'falar', seg: 'pronuncia' } },
      { nome: 'O TH de "think"', rota: { tela: 'unidade', id: 'th-surdo' } },
    ],
  },
  {
    id: 6,
    titulo: 'Sem comunidade para praticar',
    curto: 'Comunidade',
    ouvimos: ['As pessoas não têm com quem praticar.', 'Ideia do grupo: uma rede de membros para praticar o idioma.'],
    resposta:
      'Parceiros por nível e interesse, nativos que aprendem português (troca de idiomas), salas pequenas e áudio sem ao vivo para introvertidos, numa escada que começa sem plateia.',
    recursos: [{ nome: 'Galera', rota: { tela: 'galera' } }],
  },
  {
    id: 7,
    titulo: 'Conteúdo de verdade no idioma',
    curto: 'Feed de conteúdo',
    ouvimos: [
      'Uma "rede social" com conteúdo focado no idioma: vídeos curtos no estilo reels, séries, filmes, notícias e e-books.',
    ],
    resposta:
      'Feed no seu nível e dos seus interesses: vídeos curtos com áudio, leituras em três níveis, séries indicadas por sotaque e livros curtos. Toda palavra é tocável e vira card.',
    recursos: [
      { nome: 'Feed', rota: { tela: 'feed' } },
      { nome: 'Leitura em 3 níveis', rota: { tela: 'leitura', id: 'bateria' } },
      { nome: 'Livro curto', rota: { tela: 'livro', id: 'trem' } },
    ],
  },
];

export const DOR = Object.fromEntries(DORES.map((d) => [d.id, d])) as Record<number, Dor>;
