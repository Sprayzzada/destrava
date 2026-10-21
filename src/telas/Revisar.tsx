import { useEffect, useMemo, useRef, useState } from 'react';
import { BotaoOuvir } from '../componentes/BotaoOuvir';
import { useCamadas } from '../componentes/camadas';
import { Icone } from '../componentes/Icone';
import { Barra, Cabecalho, Secao, Selo } from '../componentes/ui';
import { diaDaSemana, hojeISO, quandoVence, somarDias } from '../lib/datas';
import { mensagemDeErro, perguntarJSON, useEstadoIA, type ErroIA } from '../lib/ia';
import { useLoja } from '../lib/loja';
import { promptCard, type CardIA } from '../lib/prompts';
import { filaDeHoje, limiteDiario, previsao, proximoIntervalo, type Nota } from '../lib/srs';
import { cx } from '../lib/texto';
import type { Card, OrigemCard } from '../lib/tipos';

const ORIGEM: Record<OrigemCard, string> = {
  video: 'Do vídeo',
  leitura: 'Da leitura',
  livro: 'Do livro',
  conversa: 'Da conversa',
  pronuncia: 'Da pronúncia',
  manual: 'Criado por você',
  inicial: 'Baralho inicial',
};

function rotuloIntervalo(dias: number): string {
  return dias <= 1 ? 'amanhã' : `${dias} dias`;
}

export function Revisar() {
  const { estado, acoes } = useLoja();
  const cam = useCamadas();
  const hoje = hojeISO();
  const limite = limiteDiario(estado.perfil.minutos);
  const feitasHoje = estado.revisoes.data === hoje ? estado.revisoes.feitas : 0;

  // A fila da sessão é fixada ao abrir (e quando a simulação muda as datas).
  const [versao, setVersao] = useState(0);
  const filaInicial = useMemo(
    () => filaDeHoje(estado.cards, hoje, limite - feitasHoje).map((c) => c.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [versao],
  );
  const [fila, setFila] = useState<string[]>(filaInicial);
  const [repetidas, setRepetidas] = useState<string[]>([]);
  const [virado, setVirado] = useState(false);
  const total = useRef(filaInicial.length);

  useEffect(() => {
    setFila(filaInicial);
    setRepetidas([]);
    setVirado(false);
    total.current = filaInicial.length;
  }, [filaInicial]);

  const atual = estado.cards.find((c) => c.id === fila[0]);
  const feitasSessao = total.current - fila.length;

  const avaliar = (nota: Nota) => {
    if (!atual) return;
    acoes.avaliarCard(atual.id, nota);
    setVirado(false);
    // Errou? Volta uma vez no fim da sessão.
    const repetir = nota === 'errei' && !repetidas.includes(atual.id);
    if (repetir) {
      setRepetidas((r) => [...r, atual.id]);
      total.current += 1;
    }
    setFila((f) => (repetir ? [...f.slice(1), atual.id] : f.slice(1)));
  };

  useEffect(() => {
    if (total.current > 0 && fila.length === 0) acoes.marcarTarefa('revisar');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fila.length]);

  const prox = previsao(estado.cards, hoje, 7, limite, feitasHoje);
  const maxProx = Math.max(limite, ...prox.map((p) => p.total));

  return (
    <div className="flex flex-col">
      <Cabecalho titulo="Revisar" sub={`Limite de hoje: ${limite} cards (você escolheu ${estado.perfil.minutos} min)`} />
      <div className="gutter flex flex-col gap-7 pt-5 pb-10">
        {estado.aviso && (
          <div className="rounded-[22px] bg-ok-soft p-4 flex flex-col gap-3 anima-subir">
            <div className="flex items-start gap-2">
              <p className="flex-1 font-semibold leading-snug">
                {estado.aviso.simulado ? 'Simulação: ' : ''}você ficou {estado.aviso.dias} {estado.aviso.dias === 1 ? 'dia' : 'dias'} fora. Sem
                avalanche.
              </p>
              <button type="button" className="btn-icone w-8 h-8 hover:bg-ok/15" onClick={acoes.fecharAviso} aria-label="Fechar aviso">
                <Icone nome="x" tamanho={16} />
              </button>
            </div>
            <Comparacao vencidos={estado.aviso.vencidos} hoje={estado.aviso.ficamHoje} />
            <p className="text-[14px] leading-snug">
              {estado.aviso.espalhados} cards foram espalhados pelos próximos {estado.aviso.diasEspalhados}{' '}
              {estado.aviso.diasEspalhados === 1 ? 'dia' : 'dias'}, começando pelos que você tinha mais dificuldade.
            </p>
            {estado.aviso.simulado && (
              <p className="text-[13px] text-muted leading-snug">
                Com o baralho de exemplo ({estado.cards.length} cards) a diferença é pequena. Depois de um ano de estudo, com milhares de
                cards, uma semana fora vira centenas de revisões de uma vez. Aqui continua sendo {limite}.
              </p>
            )}
          </div>
        )}

        {atual ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <Barra valor={feitasSessao} max={total.current} />
              </div>
              <span className="font-mono text-[13px] text-muted num">
                {feitasSessao}/{total.current}
              </span>
            </div>
            <CartaoRevisao card={atual} virado={virado} aoVirar={() => setVirado(true)} aoAvaliar={avaliar} />
          </div>
        ) : (
          <div className="rounded-[24px] bg-surface border border-line p-5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="grid place-items-center w-11 h-11 rounded-full bg-ok-soft text-ok">
                <Icone nome="check" />
              </span>
              <div>
                <p className="font-display text-[20px] font-bold leading-tight">Pronto por hoje!</p>
                <p className="text-[14px] text-muted">
                  {feitasHoje > 0 ? `${feitasHoje} revisões feitas.` : 'Nada vencido para hoje.'} Amanhã: {prox[1]?.total ?? 0} cards.
                </p>
              </div>
            </div>
            <Previsao prox={prox} max={maxProx} limite={limite} />
          </div>
        )}

        <Secao titulo="Sem avalanche" sub="Pulou dias? A fila não vira 500 cards: o app respeita seu limite e espalha o resto.">
          <div className="cartao p-4 flex flex-col gap-3">
            {atual && <Previsao prox={prox} max={maxProx} limite={limite} />}
            <p className="text-[14px] leading-snug">
              Para a apresentação: veja o que acontece se você sumir por uma semana. As datas dos seus cards voltam 7 dias e o app
              reorganiza a fila na hora.
            </p>
            <button
              type="button"
              className="btn btn-sol self-start"
              onClick={() => {
                acoes.simularAusencia(7);
                setVersao((v) => v + 1);
                cam.avisar('Simulado: 7 dias sem estudar.');
              }}
            >
              <Icone nome="relogio" tamanho={18} /> Simular 7 dias fora
            </button>
          </div>
        </Secao>

        <Baralho cards={estado.cards} hoje={hoje} />

        <div className="rounded-[22px] bg-surface-2 p-4 flex gap-3">
          <Icone nome="lampada" className="text-accent flex-none mt-0.5" />
          <p className="text-[14px] leading-relaxed">
            <strong className="font-semibold">Ninguém precisa copiar frase da Netflix.</strong> Toque numa palavra em vídeos, leituras
            e livros, ou salve uma correção da conversa: o card nasce pronto, com a frase de onde veio.
          </p>
        </div>
      </div>
    </div>
  );
}

function Comparacao({ vencidos, hoje }: { vencidos: number; hoje: number }) {
  return (
    <div className="flex flex-col gap-2 text-[13px]">
      <div className="flex flex-col gap-1">
        <div className="flex justify-between">
          <span>Num app comum, hoje</span>
          <span className="font-mono font-medium num">{vencidos} cards</span>
        </div>
        <div className="h-3 rounded-full bg-bad/80" />
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex justify-between">
          <span>No Destrava, hoje</span>
          <span className="font-mono font-medium num">{hoje} cards</span>
        </div>
        <div className="h-3 rounded-full bg-surface">
          <div className="h-full rounded-full bg-ok" style={{ width: `${Math.max(6, Math.round((hoje / Math.max(vencidos, 1)) * 100))}%` }} />
        </div>
      </div>
    </div>
  );
}

function Previsao({ prox, max, limite }: { prox: { data: string; total: number }[]; max: number; limite: number }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="rotulo">Próximos 7 dias</p>
      <div className="flex items-end gap-2 h-28" role="img" aria-label={`Revisões nos próximos dias: ${prox.map((p) => p.total).join(', ')}. Limite ${limite}.`}>
        {prox.map((p, i) => (
          <div key={p.data} className="flex-1 h-full flex flex-col items-center justify-end gap-1">
            <span className="font-mono text-[11px] text-muted num">{p.total}</span>
            <div
              className={cx('w-full rounded-t-md', i === 0 ? 'bg-accent' : 'bg-accent-soft')}
              style={{ height: `${Math.max(3, (p.total / max) * 72)}px` }}
            />
            <span className="text-[11px] text-muted">{i === 0 ? 'hoje' : diaDaSemana(p.data)}</span>
          </div>
        ))}
      </div>
      <p className="text-[12px] text-muted">Nenhum dia passa de {limite} cards.</p>
    </div>
  );
}

function CartaoRevisao({ card, virado, aoVirar, aoAvaliar }: { card: Card; virado: boolean; aoVirar(): void; aoAvaliar(n: Nota): void }) {
  return (
    <div className="rounded-[26px] bg-surface border border-line shadow-[var(--sombra)] p-5 flex flex-col gap-4 min-h-[300px]">
      <div className="flex items-center gap-2">
        <Selo tom="accent">
          {ORIGEM[card.origem]}: {card.origemTitulo}
        </Selo>
      </div>
      <div className="flex items-center gap-3">
        <p className="flex-1 font-display text-[28px] font-extrabold leading-[1.1]" lang="en">
          {card.frente}
        </p>
        <BotaoOuvir id={`card:${card.id}`} texto={card.frente} grande />
      </div>
      {!virado ? (
        <>
          <p className="text-[14px] text-muted">Diga em voz alta o que significa, ou use numa frase sua. Depois vire o card.</p>
          <button type="button" className="btn btn-primario mt-auto h-12" onClick={aoVirar}>
            Mostrar resposta
          </button>
        </>
      ) : (
        <>
          <p className="text-[18px] font-semibold leading-snug anima-subir">{card.verso}</p>
          {card.exemplo && (
            <div className="rounded-2xl bg-surface-2 p-3 flex items-start gap-2">
              <p className="flex-1 text-[15px] leading-snug" lang="en">
                {card.exemplo}
              </p>
              {!card.exemplo.startsWith('Você disse') && <BotaoOuvir id={`ex:${card.id}`} texto={card.exemplo} className="w-8 h-8" />}
            </div>
          )}
          <div className="grid grid-cols-3 gap-2 mt-auto">
            {(
              [
                ['errei', 'Errei', 'bg-bad-soft text-bad'],
                ['dificil', 'Difícil', 'bg-warn-soft text-warn'],
                ['lembrei', 'Lembrei', 'bg-ok-soft text-ok'],
              ] as const
            ).map(([nota, nome, classe]) => (
              <button key={nota} type="button" onClick={() => aoAvaliar(nota)} className={cx('rounded-2xl py-2.5 flex flex-col items-center font-semibold', classe)}>
                <span>{nome}</span>
                <span className="text-[11px] font-normal opacity-80">{rotuloIntervalo(proximoIntervalo(card, nota))}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Baralho({ cards, hoje }: { cards: Card[]; hoje: string }) {
  const { acoes } = useLoja();
  const cam = useCamadas();
  const [filtro, setFiltro] = useState<OrigemCard | 'todos'>('todos');
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const origens = [...new Set(cards.map((c) => c.origem))];
  const lista = cards.filter((c) => filtro === 'todos' || c.origem === filtro);
  const visiveis = mostrarTodos ? lista : lista.slice(0, 8);

  return (
    <Secao
      titulo={`Seus cards (${cards.length})`}
      sub="Cada um lembra de onde veio."
      acao={
        <button type="button" className="btn btn-sm btn-primario" onClick={() => cam.abrir(<FolhaNovoCard />, 'Novo card')}>
          <Icone nome="mais" tamanho={16} /> Novo
        </button>
      }
    >
      <div className="flex flex-wrap gap-1.5">
        {(['todos', ...origens] as const).map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => setFiltro(o)}
            aria-pressed={filtro === o}
            className={cx('h-8 px-3 rounded-full text-[13px] font-semibold border', filtro === o ? 'bg-fg text-bg border-fg' : 'border-line text-muted')}
          >
            {o === 'todos' ? 'Todos' : ORIGEM[o]}
          </button>
        ))}
      </div>
      <ul className="cartao divide-y divide-line">
        {visiveis.map((c) => (
          <li key={c.id} className="flex items-center gap-3 px-3 py-2.5">
            <span className="flex-1 min-w-0">
              <span className="block font-semibold leading-snug truncate" lang="en">
                {c.frente}
              </span>
              <span className="block text-[13px] text-muted truncate">{c.verso}</span>
            </span>
            <span className="text-[12px] text-muted text-right flex-none">
              <span className="block">{quandoVence(hoje, c.vence)}</span>
              <span className="block opacity-80">{ORIGEM[c.origem]}</span>
            </span>
            <button
              type="button"
              className="btn-icone w-8 h-8 text-muted hover:bg-surface-2"
              aria-label={`Apagar card ${c.frente}`}
              onClick={() => {
                acoes.removerCard(c.id);
                cam.avisar('Card apagado.');
              }}
            >
              <Icone nome="lixo" tamanho={16} />
            </button>
          </li>
        ))}
      </ul>
      {lista.length > 8 && (
        <button type="button" className="btn btn-sm btn-linha self-start" onClick={() => setMostrarTodos(!mostrarTodos)}>
          {mostrarTodos ? 'Mostrar menos' : `Ver todos os ${lista.length}`}
        </button>
      )}
    </Secao>
  );
}

function FolhaNovoCard() {
  const { estado, acoes } = useLoja();
  const cam = useCamadas();
  const ia = useEstadoIA();
  const [frente, setFrente] = useState('');
  const [verso, setVerso] = useState('');
  const [exemplo, setExemplo] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const preencher = () => {
    setCarregando(true);
    setErro('');
    perguntarJSON<CardIA>(promptCard(estado.perfil.nivel, frente.trim()))
      .then((r) => {
        if (r?.frente) setFrente(String(r.frente));
        if (r?.verso) setVerso(String(r.verso));
        if (r?.exemplo) setExemplo(String(r.exemplo));
      })
      .catch((e: ErroIA) => setErro(mensagemDeErro(e.code)))
      .finally(() => setCarregando(false));
  };

  const campo = 'h-11 rounded-xl bg-surface-2 px-3 text-[15px] outline-none focus:ring-2 focus:ring-accent';
  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!frente.trim() || !verso.trim()) return;
        const ok = acoes.adicionarCard({ frente, verso, exemplo, origem: 'manual', origemTitulo: 'você' });
        cam.fechar();
        cam.avisar(ok ? 'Card criado. Aparece amanhã.' : 'Esse card já existe.');
      }}
    >
      <label className="flex flex-col gap-1 text-[13px] font-semibold" htmlFor="nc-frente">
        Em inglês
        <input id="nc-frente" className={campo} value={frente} onChange={(e) => setFrente(e.target.value)} placeholder="ex.: catch up" lang="en" />
      </label>
      {ia !== 'demo' && (
        <button type="button" className="btn btn-sm btn-suave self-start" onClick={preencher} disabled={!frente.trim() || carregando}>
          <Icone nome="brilho" tamanho={15} /> {carregando ? 'Preenchendo…' : 'Preencher o resto com IA'}
        </button>
      )}
      {erro && <p className="text-[13px] text-bad">{erro}</p>}
      <label className="flex flex-col gap-1 text-[13px] font-semibold" htmlFor="nc-verso">
        Significado
        <input id="nc-verso" className={campo} value={verso} onChange={(e) => setVerso(e.target.value)} placeholder="ex.: colocar o papo em dia" />
      </label>
      <label className="flex flex-col gap-1 text-[13px] font-semibold" htmlFor="nc-exemplo">
        Frase de exemplo (opcional)
        <input id="nc-exemplo" className={campo} value={exemplo} onChange={(e) => setExemplo(e.target.value)} placeholder="ex.: Let's catch up this weekend." lang="en" />
      </label>
      <button type="submit" className="btn btn-primario" disabled={!frente.trim() || !verso.trim()}>
        Criar card
      </button>
      <p className="text-[12px] text-muted">Começa amanhã ({somarDias(hojeISO(), 1).split('-').reverse().slice(0, 2).join('/')}).</p>
    </form>
  );
}
