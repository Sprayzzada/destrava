// Estado do app (perfil, cards, progresso), salvo no navegador.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { apagar, gravar, ler } from './armazenamento';
import { diasEntre, hojeISO, somarDias } from './datas';
import { agendar, limiteDiario, redistribuir, type Nota } from './srs';
import { idNovo } from './texto';
import type { Apoio, Card, OrigemCard, Perfil } from './tipos';
import { cardsIniciais } from '../data/cards-iniciais';

const CHAVE = 'destrava:v1';

export interface Stats {
  /** Segundos falando por dia (AAAA-MM-DD). */
  falaPorDia: Record<string, number>;
  frases: number;
  palavrasUsadas: string[];
  sons: string[];
  reels: number;
  leituras: number;
  ditados: number;
  conversas: number;
}

export interface Config {
  apresentacao: boolean;
  velocidade: number;
  legenda: 'en' | 'en-pt' | 'nenhuma';
  apoio: Apoio;
  falarRespostas: boolean;
  degrau: number;
}

export interface Aviso {
  dias: number;
  vencidos: number;
  ficamHoje: number;
  espalhados: number;
  diasEspalhados: number;
  simulado: boolean;
}

export interface Estado {
  versao: 1;
  perfil: Perfil;
  cards: Card[];
  stats: Stats;
  plano: { data: string; feitas: string[] };
  revisoes: { data: string; feitas: number };
  ultimoDia: string;
  aviso: Aviso | null;
  config: Config;
}

const CONFIG_PADRAO: Config = {
  apresentacao: true,
  velocidade: 1,
  legenda: 'en',
  apoio: 'rodinhas',
  falarRespostas: true,
  degrau: 1,
};

function novoEstado(): Estado {
  const hoje = hojeISO();
  return {
    versao: 1,
    perfil: { nome: '', nivel: 'B1', minutos: 20, travas: [], interesses: [], pronto: false },
    cards: cardsIniciais(hoje),
    stats: { falaPorDia: {}, frases: 0, palavrasUsadas: [], sons: [], reels: 0, leituras: 0, ditados: 0, conversas: 0 },
    plano: { data: hoje, feitas: [] },
    revisoes: { data: hoje, feitas: 0 },
    ultimoDia: hoje,
    aviso: null,
    config: CONFIG_PADRAO,
  };
}

/** Virada de dia: zera o plano e espalha revisões acumuladas (anti-avalanche). */
function abrirDia(e: Estado, hoje: string): Estado {
  if (e.ultimoDia === hoje) return e;
  const dias = Math.max(1, diasEntre(e.ultimoDia, hoje));
  const r = redistribuir(e.cards, hoje, limiteDiario(e.perfil.minutos));
  return {
    ...e,
    cards: r.cards,
    plano: { data: hoje, feitas: [] },
    revisoes: { data: hoje, feitas: 0 },
    ultimoDia: hoje,
    aviso:
      r.espalhados > 0
        ? {
            dias,
            vencidos: r.vencidos,
            ficamHoje: r.ficamHoje,
            espalhados: r.espalhados,
            diasEspalhados: r.dias,
            simulado: false,
          }
        : null,
  };
}

function carregar(): Estado {
  const salvo = ler<Estado | null>(CHAVE, null);
  const base = salvo && salvo.versao === 1 ? { ...novoEstado(), ...salvo, config: { ...CONFIG_PADRAO, ...salvo.config } } : novoEstado();
  return abrirDia(base, hojeISO());
}

export interface NovoCard {
  frente: string;
  verso: string;
  exemplo?: string;
  origem: OrigemCard;
  origemTitulo: string;
}

interface Acoes {
  concluirOnboarding(p: Omit<Perfil, 'pronto'>): void;
  atualizarPerfil(p: Partial<Perfil>): void;
  marcarTarefa(id: string, feita?: boolean): void;
  adicionarCard(c: NovoCard): boolean;
  temCard(frente: string): boolean;
  removerCard(id: string): void;
  avaliarCard(id: string, nota: Nota): void;
  registrarFala(segundos: number, frases: number, palavras: string[]): void;
  marcarSom(id: string): void;
  contar(o: 'reels' | 'leituras' | 'ditados'): void;
  simularAusencia(dias: number): void;
  fecharAviso(): void;
  setConfig(c: Partial<Config>): void;
  resetar(): void;
}

const Contexto = createContext<{ estado: Estado; acoes: Acoes } | null>(null);

function chaveCard(frente: string) {
  return frente.trim().toLowerCase();
}

export function ProvedorLoja({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<Estado>(carregar);
  const atual = useRef(estado);
  atual.current = estado;

  useEffect(() => {
    gravar(CHAVE, estado);
  }, [estado]);

  // Se o app ficar aberto de um dia para o outro.
  useEffect(() => {
    const t = setInterval(() => setEstado((e) => abrirDia(e, hojeISO())), 60_000);
    return () => clearInterval(t);
  }, []);

  const temCard = useCallback((frente: string) => {
    const k = chaveCard(frente);
    return atual.current.cards.some((c) => chaveCard(c.frente) === k);
  }, []);

  const acoes = useMemo<Acoes>(
    () => ({
      concluirOnboarding: (p) => setEstado((e) => ({ ...e, perfil: { ...p, pronto: true } })),
      atualizarPerfil: (p) => setEstado((e) => ({ ...e, perfil: { ...e.perfil, ...p } })),
      marcarTarefa: (id, feita = true) =>
        setEstado((e) => {
          const tem = e.plano.feitas.includes(id);
          if (feita === tem) return e;
          return {
            ...e,
            plano: { ...e.plano, feitas: feita ? [...e.plano.feitas, id] : e.plano.feitas.filter((f) => f !== id) },
          };
        }),
      temCard,
      adicionarCard: (c) => {
        if (temCard(c.frente)) return false;
        const hoje = hojeISO();
        const card: Card = {
          id: idNovo(),
          frente: c.frente.trim(),
          verso: c.verso.trim(),
          exemplo: c.exemplo?.trim(),
          origem: c.origem,
          origemTitulo: c.origemTitulo,
          intervalo: 1,
          facilidade: 2.5,
          vence: somarDias(hoje, 1),
          reps: 0,
          criado: hoje,
        };
        atual.current = { ...atual.current, cards: [card, ...atual.current.cards] };
        setEstado((e) => ({ ...e, cards: [card, ...e.cards.filter((x) => x.id !== card.id)] }));
        return true;
      },
      removerCard: (id) => setEstado((e) => ({ ...e, cards: e.cards.filter((c) => c.id !== id) })),
      avaliarCard: (id, nota) =>
        setEstado((e) => {
          const hoje = hojeISO();
          return {
            ...e,
            cards: e.cards.map((c) => (c.id === id ? agendar(c, nota, hoje) : c)),
            revisoes: { data: hoje, feitas: (e.revisoes.data === hoje ? e.revisoes.feitas : 0) + 1 },
          };
        }),
      registrarFala: (segundos, frases, palavras) =>
        setEstado((e) => {
          const hoje = hojeISO();
          const usadas = new Set(e.stats.palavrasUsadas);
          palavras.forEach((p) => usadas.add(p));
          return {
            ...e,
            stats: {
              ...e.stats,
              falaPorDia: { ...e.stats.falaPorDia, [hoje]: (e.stats.falaPorDia[hoje] ?? 0) + segundos },
              frases: e.stats.frases + frases,
              palavrasUsadas: [...usadas].slice(-3000),
              conversas: e.stats.conversas + 1,
            },
          };
        }),
      marcarSom: (id) =>
        setEstado((e) =>
          e.stats.sons.includes(id) ? e : { ...e, stats: { ...e.stats, sons: [...e.stats.sons, id] } },
        ),
      contar: (o) => setEstado((e) => ({ ...e, stats: { ...e.stats, [o]: e.stats[o] + 1 } })),
      simularAusencia: (dias) =>
        setEstado((e) => {
          const hoje = hojeISO();
          const movidos = e.cards.map((c) => ({ ...c, vence: somarDias(c.vence, -dias) }));
          const r = redistribuir(movidos, hoje, limiteDiario(e.perfil.minutos));
          return {
            ...e,
            cards: r.cards,
            revisoes: { data: hoje, feitas: 0 },
            aviso: {
              dias,
              vencidos: r.vencidos,
              ficamHoje: r.ficamHoje,
              espalhados: r.espalhados,
              diasEspalhados: r.dias,
              simulado: true,
            },
          };
        }),
      fecharAviso: () => setEstado((e) => ({ ...e, aviso: null })),
      setConfig: (c) => setEstado((e) => ({ ...e, config: { ...e.config, ...c } })),
      resetar: () => {
        apagar(CHAVE);
        setEstado(novoEstado());
      },
    }),
    [temCard],
  );

  const valor = useMemo(() => ({ estado, acoes }), [estado, acoes]);
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useLoja() {
  const v = useContext(Contexto);
  if (!v) throw new Error('useLoja fora do ProvedorLoja');
  return v;
}

/** Segundos falados nos últimos 7 dias. */
export function falaDaSemana(stats: Stats): number {
  const hoje = hojeISO();
  let total = 0;
  for (let i = 0; i < 7; i++) total += stats.falaPorDia[somarDias(hoje, -i)] ?? 0;
  return total;
}
