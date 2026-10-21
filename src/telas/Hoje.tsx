import { useState } from 'react';
import { Icone, Marca, type NomeIcone } from '../componentes/Icone';
import { ChipDores } from '../componentes/PainelDores';
import { AvisoVoz, Barra, LinhaAcao, Secao, StatusIA } from '../componentes/ui';
import { CENARIOS } from '../data/cenarios';
import { DOR } from '../data/dores';
import { REELS } from '../data/feed';
import { UNIDADES } from '../data/pronuncia';
import { hojeISO } from '../lib/datas';
import { falaDaSemana, useLoja, type Estado } from '../lib/loja';
import { useNav, type Rota } from '../lib/nav';
import { filaDeHoje, limiteDiario } from '../lib/srs';
import { cx } from '../lib/texto';
import type { Nivel } from '../lib/tipos';

interface Tarefa {
  id: string;
  icone: NomeIcone;
  titulo: string;
  sub: string;
  minutos: number;
  rota: Rota;
}

function diaDoAno(): number {
  const d = new Date();
  return Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86_400_000);
}

function montarPlano(e: Estado): Tarefa[] {
  const { perfil, stats } = e;
  const hoje = hojeISO();
  const feitas = e.revisoes.data === hoje ? e.revisoes.feitas : 0;
  const fila = filaDeHoje(e.cards, hoje, limiteDiario(perfil.minutos) - feitas).length;
  const dia = diaDoAno();

  const doNivel = CENARIOS.filter((c) => c.id !== 'livre' && (c.nivel === perfil.nivel || c.interesses.some((i) => perfil.interesses.includes(i))));
  const cenario = (doNivel.length ? doNivel : CENARIOS)[dia % (doNivel.length || CENARIOS.length)];
  const unidade = UNIDADES.find((u) => !stats.sons.includes(u.id)) ?? UNIDADES[dia % UNIDADES.length];
  const reelIdx = Math.max(0, REELS.findIndex((r) => perfil.interesses.includes(r.tema)));

  const tarefas: Record<string, Tarefa> = {
    ouvido: {
      id: 'ouvido',
      icone: 'ouvido',
      titulo: 'Aquecer o ouvido',
      sub: 'Ditado com fala rápida: gonna, wanna, lemme',
      minutos: 3,
      rota: { tela: 'feed', seg: 'ouvido' },
    },
    revisar: {
      id: 'revisar',
      icone: 'cards',
      titulo: 'Revisar cards',
      sub: fila ? `${fila} cards, dentro do limite do dia` : 'Tudo em dia por hoje',
      minutos: 5,
      rota: { tela: 'revisar' },
    },
    falar: {
      id: 'falar',
      icone: 'balao',
      titulo: 'Falar sem plateia',
      sub: `${cenario.titulo} · com ${cenario.quem}`,
      minutos: 7,
      rota: { tela: 'conversa', cenario: cenario.id },
    },
    pronuncia: {
      id: 'pronuncia',
      icone: 'onda',
      titulo: 'Treinar um som',
      sub: unidade.titulo,
      minutos: 3,
      rota: { tela: 'unidade', id: unidade.id },
    },
    feed: {
      id: 'feed',
      icone: 'feed',
      titulo: 'Um vídeo do seu interesse',
      sub: REELS[reelIdx].titulo,
      minutos: 2,
      rota: { tela: 'reels', inicio: reelIdx },
    },
  };

  if (perfil.minutos === 10) {
    const extra = perfil.travas.includes(5) ? tarefas.pronuncia : tarefas.ouvido;
    return [
      { ...tarefas.revisar, minutos: 3 },
      { ...tarefas.falar, minutos: 5 },
      { ...extra, minutos: 2 },
    ];
  }
  if (perfil.minutos === 20) {
    return [tarefas.ouvido, tarefas.revisar, { ...tarefas.falar, minutos: 8 }, { ...tarefas.pronuncia, minutos: 4 }];
  }
  return [
    { ...tarefas.ouvido, minutos: 4 },
    { ...tarefas.revisar, minutos: 7 },
    { ...tarefas.falar, minutos: 10 },
    { ...tarefas.pronuncia, minutos: 5 },
    { ...tarefas.feed, minutos: 4 },
  ];
}

const METAS: Record<Nivel, { proximo: string; minutos: number; sons: number; palavras: number }> = {
  A2: { proximo: 'B1', minutos: 30, sons: 4, palavras: 150 },
  B1: { proximo: 'B2', minutos: 60, sons: 7, palavras: 300 },
  B2: { proximo: 'C1', minutos: 120, sons: 7, palavras: 600 },
};

export function Hoje() {
  const { estado, acoes } = useLoja();
  const nav = useNav();
  const [porque, setPorque] = useState(false);
  const { perfil, stats, plano } = estado;
  const tarefas = montarPlano(estado);
  const feitas = tarefas.filter((t) => plano.feitas.includes(t.id)).length;
  const minutosSemana = Math.round(falaDaSemana(stats) / 60);
  const minutosTotal = Math.round(Object.values(stats.falaPorDia).reduce((a, b) => a + b, 0) / 60);
  const meta = METAS[perfil.nivel];
  const data = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="flex flex-col">
      <header className="gutter flex items-center gap-1.5 pt-4 pb-1">
        <Marca tamanho={26} />
        <span className="font-display text-[20px] font-extrabold tracking-tight">destrava</span>
        <span className="ml-auto" />
        <StatusIA />
        <ChipDores />
        <button type="button" className="btn-icone hover:bg-surface-2" onClick={() => nav.ir({ tela: 'perfil' })} aria-label="Seu perfil">
          <Icone nome="perfil" />
        </button>
      </header>

      <div className="gutter flex flex-col gap-7 pt-4 pb-8">
        <div>
          <p className="text-[13px] text-muted first-letter:uppercase">{data}</p>
          <h1 className="font-display text-[32px] font-extrabold leading-[1.05] tracking-tight">
            {perfil.nome ? `Oi, ${perfil.nome}!` : 'Oi!'}
          </h1>
        </div>

        <AvisoVoz />

        <button
          type="button"
          onClick={() => nav.ir({ tela: 'falar' })}
          className="text-left rounded-[24px] bg-accent text-accent-fg p-5 flex flex-col gap-3 relative overflow-hidden"
        >
          <svg className="absolute -right-6 -bottom-8 opacity-20" width="170" height="170" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 12h1.5M7 8.5v7M11 5v14M15 8.5v7M19 11v2" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" fill="none" />
          </svg>
          <span className="rotulo !text-accent-fg/80">Dor 1 · a principal</span>
          <span className="font-display text-[26px] font-extrabold leading-[1.05] max-w-[16ch]">Travou? Fale sem plateia.</span>
          <span className="text-[14px] max-w-[30ch] opacity-90">Ninguém está ouvindo. Erre à vontade: a correção vem em português.</span>
          <span className="btn btn-sol self-start mt-1">
            <Icone nome="mic" tamanho={18} /> Começar a falar
          </span>
        </button>

        <Secao
          titulo={`Plano de hoje · ${perfil.minutos} min`}
          sub="Ouvido, vocabulário, fala e pronúncia num lugar só."
          acao={
            <span className="font-mono text-[13px] text-muted num">
              {feitas}/{tarefas.length}
            </span>
          }
        >
          <div className="cartao p-1.5 flex flex-col">
            {tarefas.map((t) => {
              const feita = plano.feitas.includes(t.id);
              return (
                <div key={t.id} className="flex items-center gap-1 pr-2">
                  <div className="flex-1 min-w-0">
                    <LinhaAcao
                      icone={t.icone}
                      titulo={t.titulo}
                      sub={t.sub}
                      feito={feita}
                      aoClicar={() => nav.ir(t.rota)}
                      direita={<span className="font-mono text-[12px] text-muted num flex-none">{t.minutos} min</span>}
                    />
                  </div>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={feita}
                    aria-label={feita ? `Desmarcar ${t.titulo}` : `Marcar ${t.titulo} como feito`}
                    onClick={() => acoes.marcarTarefa(t.id, !feita)}
                    className={cx(
                      'grid place-items-center w-7 h-7 rounded-full border-2 transition-colors flex-none',
                      feita ? 'bg-ok border-ok text-bg' : 'border-line hover:border-muted',
                    )}
                  >
                    {feita && <Icone nome="check" tamanho={14} strokeWidth={3} />}
                  </button>
                </div>
              );
            })}
          </div>
          <button type="button" className="self-start text-[13px] font-semibold text-accent" onClick={() => setPorque(!porque)} aria-expanded={porque}>
            {porque ? 'Fechar' : 'Por que esse plano?'}
          </button>
          {porque && (
            <div className="rounded-2xl bg-surface-2 p-4 text-[14px] leading-relaxed flex flex-col gap-2">
              <p>
                Em vez de um app para cada coisa, o plano junta tudo na ordem que funciona: aquecer o ouvido, relembrar
                palavras, usar essas palavras falando e acertar um som.
              </p>
              {perfil.travas.length > 0 && (
                <p className="text-muted">
                  Você marcou que trava em: {perfil.travas.map((t) => DOR[t]?.curto.toLowerCase()).filter(Boolean).join(', ')}.
                  O plano dá mais tempo para isso.
                </p>
              )}
            </div>
          )}
        </Secao>

        <Secao titulo="Seu progresso" sub="Sem ofensiva: conta o quanto você usa o inglês, não quantos dias seguidos abriu o app.">
          <div className="grid grid-cols-2 gap-3">
            <Numero valor={minutosSemana} rotulo="minutos falando" detalhe="nos últimos 7 dias" destaque />
            <Numero valor={stats.frases} rotulo="frases ditas" detalhe="em conversas" />
            <Numero valor={stats.palavrasUsadas.length} rotulo="palavras usadas" detalhe="falando, não só lendo" />
            <Numero valor={`${stats.sons.length}/7`} rotulo="sons treinados" detalhe="do sotaque brasileiro" />
          </div>
        </Secao>

        <Secao titulo={`Seu nível: ${perfil.nivel}`} sub="Metas abertas: você vê exatamente o que falta para subir.">
          <div className="cartao p-4 flex flex-col gap-4">
            <div className="flex items-center gap-1" aria-label="Escala de níveis">
              {(['A2', 'B1', 'B2', 'C1'] as const).map((n) => (
                <span
                  key={n}
                  className={cx(
                    'flex-1 h-8 rounded-lg grid place-items-center font-mono text-[12px] font-medium',
                    n === perfil.nivel ? 'bg-accent text-accent-fg' : n === meta.proximo ? 'bg-accent-soft text-accent border border-dashed border-accent' : 'bg-surface-2 text-muted',
                  )}
                >
                  {n}
                </span>
              ))}
            </div>
            <p className="text-[14px] font-semibold">Para chegar ao {meta.proximo}:</p>
            <Meta texto={`Falar ${meta.minutos} minutos com a IA`} valor={minutosTotal} max={meta.minutos} />
            <Meta texto={`Treinar ${meta.sons} sons de pronúncia`} valor={stats.sons.length} max={meta.sons} />
            <Meta texto={`Usar ${meta.palavras} palavras diferentes falando`} valor={stats.palavrasUsadas.length} max={meta.palavras} />
            <p className="text-[12px] text-muted">
              Quando um treino fica fácil, o app sobe a dificuldade em vez de te segurar aqui.
            </p>
          </div>
        </Secao>

        {estado.config.apresentacao && (
          <button type="button" onClick={() => nav.ir({ tela: 'mapa' })} className="cartao p-4 flex items-center gap-3 text-left hover:border-muted">
            <span className="grid place-items-center w-10 h-10 rounded-xl bg-sun text-sun-fg flex-none">
              <Icone nome="mapa" />
            </span>
            <span className="flex-1">
              <span className="block font-semibold">Como este app nasceu</span>
              <span className="block text-[13px] text-muted">As 7 dores do Define e onde cada uma é resolvida</span>
            </span>
            <Icone nome="seta" tamanho={18} className="text-muted" />
          </button>
        )}
      </div>
    </div>
  );
}

function Numero({ valor, rotulo, detalhe, destaque }: { valor: number | string; rotulo: string; detalhe: string; destaque?: boolean }) {
  return (
    <div className={cx('rounded-2xl p-4 flex flex-col', destaque ? 'bg-sun text-sun-fg' : 'bg-surface border border-line')}>
      <span className="font-display text-[30px] font-extrabold leading-none num">{valor}</span>
      <span className="text-[14px] font-semibold mt-2 leading-tight">{rotulo}</span>
      <span className={cx('text-[12px] leading-tight', destaque ? 'opacity-75' : 'text-muted')}>{detalhe}</span>
    </div>
  );
}

function Meta({ texto, valor, max }: { texto: string; valor: number; max: number }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between gap-3 text-[13px]">
        <span>{texto}</span>
        <span className="font-mono text-muted num flex-none">
          {Math.min(valor, max)}/{max}
        </span>
      </div>
      <Barra valor={valor} max={max} tom={valor >= max ? 'ok' : 'accent'} />
    </div>
  );
}
