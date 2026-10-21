// Repetição espaçada simples, com limite diário e sem avalanche de revisões.
import type { Card, Minutos } from './tipos';
import { diasEntre, somarDias } from './datas';

export type Nota = 'errei' | 'dificil' | 'lembrei';

export function limiteDiario(minutos: Minutos): number {
  if (minutos <= 10) return 10;
  if (minutos <= 20) return 15;
  return 25;
}

export function vencidos(cards: Card[], hoje: string): Card[] {
  return cards.filter((c) => c.vence <= hoje);
}

/** Menor número = mais urgente: cards difíceis e mais atrasados vêm primeiro. */
function prioridade(c: Card, hoje: string): number {
  return c.facilidade * 10 - diasEntre(c.vence, hoje);
}

function porPrioridade(cards: Card[], hoje: string): Card[] {
  return [...cards].sort((a, b) => prioridade(a, hoje) - prioridade(b, hoje));
}

export function filaDeHoje(cards: Card[], hoje: string, restante: number): Card[] {
  return porPrioridade(vencidos(cards, hoje), hoje).slice(0, Math.max(0, restante));
}

export function proximoIntervalo(c: Card, nota: Nota): number {
  if (nota === 'errei') return 1;
  if (nota === 'dificil') return Math.max(1, Math.round(c.intervalo * 1.2));
  return c.reps === 0 ? 2 : Math.max(c.intervalo + 1, Math.round(c.intervalo * c.facilidade));
}

export function agendar(c: Card, nota: Nota, hoje: string): Card {
  const intervalo = proximoIntervalo(c, nota);
  let facilidade = c.facilidade;
  if (nota === 'errei') facilidade = Math.max(1.3, facilidade - 0.2);
  else if (nota === 'dificil') facilidade = Math.max(1.3, facilidade - 0.15);
  else facilidade = Math.min(3, facilidade + 0.05);
  return { ...c, intervalo, facilidade, reps: c.reps + 1, vence: somarDias(hoje, intervalo) };
}

export interface Redistribuicao {
  cards: Card[];
  vencidos: number;
  ficamHoje: number;
  espalhados: number;
  dias: number;
}

/**
 * Anti-avalanche: deixa só o limite do dia vencido hoje e espalha o resto
 * pelos próximos dias (metade do limite por dia, para sobrar espaço para os novos).
 */
export function redistribuir(cards: Card[], hoje: string, limite: number): Redistribuicao {
  const venc = porPrioridade(vencidos(cards, hoje), hoje);
  if (venc.length <= limite) {
    return { cards, vencidos: venc.length, ficamHoje: venc.length, espalhados: 0, dias: 0 };
  }
  const sobra = venc.slice(limite);
  const porDia = Math.max(3, Math.floor(limite / 2));
  const novos = new Map<string, string>();
  sobra.forEach((c, i) => novos.set(c.id, somarDias(hoje, 1 + Math.floor(i / porDia))));
  return {
    cards: cards.map((c) => (novos.has(c.id) ? { ...c, vence: novos.get(c.id)! } : c)),
    vencidos: venc.length,
    ficamHoje: limite,
    espalhados: sobra.length,
    dias: Math.ceil(sobra.length / porDia),
  };
}

/** Quantos cards vencem em cada um dos próximos dias (hoje incluso), respeitando o limite. */
export function previsao(cards: Card[], hoje: string, dias: number, limite: number, feitasHoje: number) {
  const lista: { data: string; total: number }[] = [];
  let acumulado = 0;
  for (let i = 0; i < dias; i++) {
    const data = somarDias(hoje, i);
    const doDia = cards.filter((c) => (i === 0 ? c.vence <= data : c.vence === data)).length + acumulado;
    const cap = i === 0 ? Math.max(0, limite - feitasHoje) : limite;
    const total = Math.min(cap, doDia);
    acumulado = doDia - total;
    lista.push({ data, total });
  }
  return lista;
}
