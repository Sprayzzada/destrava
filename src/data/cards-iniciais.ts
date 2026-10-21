// Baralho de exemplo para o protótipo começar com cara de uso real.
import type { Card, OrigemCard } from '../lib/tipos';
import { somarDias } from '../lib/datas';

type Base = [frente: string, verso: string, exemplo: string, origem: OrigemCard, origemTitulo: string];

const BASE: Base[] = [
  ["I'm kinda stuck", 'Estou meio travado', "I'm kinda stuck on the login bug.", 'video', 'Status na daily'],
  ['Need a hand?', 'Precisa de ajuda?', 'Need a hand with that?', 'video', 'Status na daily'],
  ['ping me', 'me chama (mensagem rápida)', "Sure, ping me when you're free.", 'video', 'Status na daily'],
  ['actually', 'na verdade (não é "atualmente")', 'Actually, can I get oat milk?', 'video', 'Pedido rápido no café'],
  ['currently', 'atualmente', 'I currently work in marketing.', 'conversa', 'Correção: "actually I work"'],
  ['to go', 'para viagem', 'Is that for here or to go?', 'conversa', 'Pedir num café'],
  ['fair enough', 'justo, faz sentido', "Fair enough, let's do it your way.", 'leitura', 'Séries: Ted Lasso'],
  ["I'm starving", 'Estou morrendo de fome', "Sounds good, mate. I'm starving.", 'video', 'Dia de jogo na Austrália'],
  ['binge-watch', 'maratonar', 'I binge-watched the whole season.', 'video', 'Sem spoilers!'],
  ['My lips are sealed', 'Boca de siri', 'No spoilers, I promise. My lips are sealed.', 'video', 'Sem spoilers!'],
  ["I'm 25", 'Tenho 25 anos', "I'm 25 and I live in Recife.", 'conversa', 'Correção: "I have 25 years"'],
  ['I agree', 'Eu concordo', 'I agree, that makes sense.', 'conversa', 'Correção: "I am agree"'],
  ['depend on', 'depender de', 'It depends on the weather.', 'conversa', 'Correção: "depends of"'],
  ["I'm bored", 'Estou entediado', "I'm bored, let's go out.", 'conversa', 'Correção: "I\'m boring"'],
  ['watch a movie', 'assistir a um filme', 'We watched a movie last night.', 'conversa', 'Correção: "assist a movie"'],
  ['ask a question', 'fazer uma pergunta', 'Can I ask a question?', 'conversa', 'Correção: "make a question"'],
  ['there are a lot of people', 'tem muita gente', 'There are a lot of people at the beach today.', 'conversa', 'Correção: "have many people"'],
  ['reckon', 'achar (gíria)', "Reckon they'll win this arvo?", 'video', 'Dia de jogo na Austrália'],
  ['barely', 'mal, quase nada', 'Barely. You stop noticing after a week.', 'video', 'O celular que dobra'],
  ['dodge', 'desviar', 'You gotta dodge left when he jumps.', 'video', 'Chefão impossível'],
  ['wrap up', 'encerrar', 'Anything else before we wrap up?', 'conversa', 'Daily no trabalho'],
  ['sort out', 'resolver', "Let's sort that out after the call.", 'conversa', 'Daily no trabalho'],
  ['Catch you later!', 'Até mais!', 'I gotta run. Catch you later!', 'conversa', 'Papo com colega gringo'],
  ['lately', 'ultimamente', 'Have you seen anything good lately?', 'conversa', 'Papo com colega gringo'],
  ['to be honest', 'pra ser sincero', 'To be honest, I stayed home all weekend.', 'conversa', 'Papo com colega gringo'],
  ['be in touch', 'entrar em contato', "We'll be in touch by Friday.", 'conversa', 'Entrevista de emprego'],
  ['look forward to', 'aguardar com expectativa', 'I look forward to hearing from you.', 'conversa', 'Entrevista de emprego'],
  ['pay off', 'valer a pena, compensar', 'All that practice will pay off.', 'leitura', 'Telhados brancos'],
  ['shut down', 'desligar', 'The phone shuts down to protect itself.', 'leitura', 'O celular no frio'],
  ['think', 'pensar (TH com a língua entre os dentes)', 'I think so.', 'pronuncia', 'O TH de "think"'],
  ['ship / sheep', 'navio / ovelha (I curto x I longo)', 'There is a sheep on the ship.', 'pronuncia', '"Ship" e "sheep"'],
  ['get off', 'descer (do trem, ônibus)', 'Get off at the next stop.', 'livro', 'The Wrong Train'],
];

export function cardsIniciais(hoje: string): Card[] {
  return BASE.map(([frente, verso, exemplo, origem, origemTitulo], i) => {
    // Um terço vence hoje (alguns atrasados), o resto ao longo dos próximos dias.
    const desloc = i % 3 === 0 ? -(i % 4) : (i % 9) + 1;
    const intervalo = 1 + (i % 6);
    return {
      id: `ini-${i}`,
      frente,
      verso,
      exemplo,
      origem,
      origemTitulo,
      intervalo,
      facilidade: 2.2 + (i % 5) * 0.1,
      vence: somarDias(hoje, desloc),
      reps: 1 + (i % 4),
      criado: somarDias(hoje, -14 + (i % 10)),
    };
  });
}
