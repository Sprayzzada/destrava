import { useEffect, useRef, useState } from 'react';
import { BotaoOuvir } from '../componentes/BotaoOuvir';
import { useCamadas } from '../componentes/camadas';
import { EntradaFala } from '../componentes/EntradaFala';
import { Icone } from '../componentes/Icone';
import { TextoTocavel } from '../componentes/TextoTocavel';
import { AvisoVoz, Cabecalho, Carregando, Selo } from '../componentes/ui';
import { APOIOS, CENARIO, CENARIOS, CORINGAS, type Cenario, type PassoRoteiro } from '../data/cenarios';
import { verificarFrase, type Feedback } from '../lib/erros-br';
import { ehPermanente, mensagemDeErro, perguntarJSON, useEstadoIA, type ErroIA } from '../lib/ia';
import { useLoja } from '../lib/loja';
import { useNav } from '../lib/nav';
import { instrucoesConversa, promptTravei, type OpcaoTravei, type RespostaConversa } from '../lib/prompts';
import { cx, idNovo, normalizarFala } from '../lib/texto';
import { NOME_INTERESSE } from '../lib/tipos';
import { tocar } from '../lib/voz';

interface Msg {
  id: string;
  de: 'ia' | 'eu';
  texto: string;
  traducao?: string;
  sugestoes?: string[];
  feedback?: Feedback | 'carregando' | { erro: string };
}

const FINAL: PassoRoteiro = {
  fala: 'That was great practice! Want to try another situation?',
  pt: 'Foi um ótimo treino! Quer tentar outra situação?',
  sugestoes: ["Sure, let's do it!", 'Thanks, that was fun!', 'See you next time!'],
};

const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

function normalizarFeedback(f: unknown): Feedback {
  const o = (f && typeof f === 'object' ? f : {}) as Record<string, unknown>;
  if (o.status === 'ajuste' && (o.melhor || o.porque)) {
    return { status: 'ajuste', melhor: o.melhor ? String(o.melhor) : undefined, porque: o.porque ? String(o.porque) : undefined };
  }
  return { status: 'ok' };
}

export function Conversa({ cenarioId }: { cenarioId: string }) {
  const cenario: Cenario = CENARIO[cenarioId] ?? CENARIOS[0];
  const { estado, acoes } = useLoja();
  const nav = useNav();
  const cam = useCamadas();
  const ia = useEstadoIA();
  const { perfil, config } = estado;

  const [msgs, setMsgs] = useState<Msg[]>(() => [
    { id: 'abertura', de: 'ia', texto: cenario.abertura.fala, traducao: cenario.abertura.pt, sugestoes: cenario.abertura.sugestoes },
  ]);
  const [entrada, setEntrada] = useState('');
  const [esperando, setEsperando] = useState(false);
  const [traduzidas, setTraduzidas] = useState<string[]>([]);
  const [dica, setDica] = useState(false);
  const [fim, setFim] = useState<null | { segundos: number }>(null);
  const msgsRef = useRef(msgs);
  msgsRef.current = msgs;
  const inicio = useRef(Date.now());
  const ctl = useRef<AbortController | null>(null);
  const passoDemo = useRef(0);
  const fundo = useRef<HTMLDivElement>(null);

  const papel =
    cenario.id === 'livre'
      ? `${cenario.papel} Ask about the learner's interests: ${perfil.interesses.map((i) => NOME_INTERESSE[i]).join(', ') || 'anything'}.`
      : cenario.papel;

  useEffect(() => {
    fundo.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [msgs, esperando]);

  useEffect(() => {
    if (config.falarRespostas) {
      const t = setTimeout(() => tocar('msg:abertura', [{ texto: cenario.abertura.fala, sotaque: cenario.sotaque }], { velocidade: config.velocidade }), 350);
      return () => clearTimeout(t);
    }
    // Só na abertura da conversa.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => ctl.current?.abort(), []);

  function montarTurnos(historico: Msg[]) {
    const turnos: { role: 'user' | 'assistant'; content: string }[] = [
      { role: 'user', content: instrucoesConversa({ papel, contexto: cenario.contexto, nivel: perfil.nivel, interesses: perfil.interesses }) },
    ];
    for (const m of historico.slice(-16)) {
      turnos.push(m.de === 'ia' ? { role: 'assistant', content: m.texto } : { role: 'user', content: `Learner: ${m.texto}` });
    }
    turnos[turnos.length - 1] = {
      ...turnos[turnos.length - 1],
      content: `${turnos[turnos.length - 1].content}\n\n(Reply with the JSON object only.)`,
    };
    return turnos;
  }

  async function enviar(texto: string, base = msgsRef.current) {
    setEntrada('');
    setDica(false);
    const meu: Msg = { id: idNovo(), de: 'eu', texto, feedback: 'carregando' };
    const historico = [...base, meu];
    setMsgs(historico);
    setEsperando(true);

    let feedback: Feedback;
    let resposta: Msg;
    try {
      if (ia === 'demo') throw { code: 'demo' } satisfies ErroIA;
      const c = new AbortController();
      ctl.current = c;
      const r = await perguntarJSON<RespostaConversa>(montarTurnos(historico), { signal: c.signal, cache: false });
      feedback = normalizarFeedback(r?.feedback);
      resposta = {
        id: idNovo(),
        de: 'ia',
        texto: String(r?.resposta || 'Sorry, could you say that again?'),
        traducao: r?.traducao ? String(r.traducao) : undefined,
        sugestoes: Array.isArray(r?.sugestoes) ? r.sugestoes.map(String).slice(0, 3) : [],
      };
    } catch (e) {
      const erro = e as ErroIA;
      if (erro.code === 'cancelled') return;
      if (!ehPermanente(erro.code)) {
        setMsgs((h) => h.map((m) => (m.id === meu.id ? { ...m, feedback: { erro: mensagemDeErro(erro.code) } } : m)));
        setEsperando(false);
        return;
      }
      if (erro.code !== 'demo') cam.avisar('A IA não está disponível. Seguindo no modo demonstração.');
      await esperar(650);
      feedback = verificarFrase(texto);
      const passo = cenario.roteiro[passoDemo.current] ?? FINAL;
      passoDemo.current++;
      resposta = { id: idNovo(), de: 'ia', texto: passo.fala, traducao: passo.pt, sugestoes: passo.sugestoes };
    }
    setMsgs((h) => [...h.map((m) => (m.id === meu.id ? { ...m, feedback } : m)), resposta]);
    setEsperando(false);
    if (config.falarRespostas) tocar(`msg:${resposta.id}`, [{ texto: resposta.texto, sotaque: cenario.sotaque }], { velocidade: config.velocidade });
  }

  function reenviar(m: Msg) {
    const base = msgsRef.current.filter((x) => x.id !== m.id);
    enviar(m.texto, base);
  }

  const minhas = msgs.filter((m) => m.de === 'eu');
  const ajustes = minhas.filter((m) => typeof m.feedback === 'object' && 'status' in m.feedback && m.feedback.status === 'ajuste' && m.feedback.melhor);
  const ultimaIA = [...msgs].reverse().find((m) => m.de === 'ia');
  const mostrarSugestoes = !esperando && (config.apoio === 'rodinhas' || (config.apoio === 'dicas' && dica)) && !!ultimaIA?.sugestoes?.length;

  function terminar() {
    ctl.current?.abort();
    const segundos = Math.min(15 * 60, Math.round((Date.now() - inicio.current) / 1000));
    if (minhas.length) {
      const palavras = [...new Set(minhas.flatMap((m) => normalizarFala(m.texto)).filter((p) => /^[a-z]{2,}$/.test(p)))];
      acoes.registrarFala(segundos, minhas.length, palavras);
      acoes.marcarTarefa('falar');
      setFim({ segundos });
    } else {
      nav.voltar();
    }
  }

  function abrirTravei() {
    cam.abrir(
      <FolhaTravei
        cenario={cenario}
        ultimaFala={ultimaIA?.texto ?? ''}
        aoEscolher={(t) => {
          setEntrada(t);
          cam.fechar();
        }}
      />,
      'Travou? Tudo bem.',
    );
  }

  if (fim) {
    return <Resumo cenario={cenario} minhas={minhas} ajustes={ajustes} segundos={fim.segundos} aoRecomecar={() => nav.ir({ tela: 'conversa', cenario: cenario.id })} />;
  }

  const apoio = APOIOS.find((a) => a.id === config.apoio)!;

  return (
    <div className="flex-1 flex flex-col">
      <Cabecalho
        voltar
        titulo={cenario.titulo}
        sub={`com ${cenario.quem} · sotaque ${cenario.nomeSotaque}`}
        direita={
          <button type="button" className="btn btn-sm btn-linha flex-none" onClick={terminar}>
            Terminar
          </button>
        }
      />

      <div className="gutter flex-1 flex flex-col gap-4 pt-4 pb-4">
        <div className="self-center flex flex-wrap justify-center gap-1.5 text-center">
          <Selo>{cenario.subtitulo}</Selo>
          <Selo tom="accent">{apoio.nome}</Selo>
          {ia === 'demo' && <Selo tom="warn">Respostas prontas (sem IA)</Selo>}
        </div>
        <AvisoVoz />

        {msgs.map((m, i) =>
          m.de === 'ia' ? (
            <BalaoIA
              key={m.id}
              m={m}
              cenario={cenario}
              primeira={i === 0}
              traduzida={traduzidas.includes(m.id)}
              aoTraduzir={() => setTraduzidas((t) => (t.includes(m.id) ? t.filter((x) => x !== m.id) : [...t, m.id]))}
              aoExplicar={() => cam.explicar(m.texto)}
            />
          ) : (
            <BalaoEu
              key={m.id}
              m={m}
              cenario={cenario}
              aoRepetir={(t) => setEntrada(t)}
              aoReenviar={() => reenviar(m)}
              aoTravei={abrirTravei}
            />
          ),
        )}

        {esperando && (
          <div className="flex items-end gap-2">
            <Avatar cenario={cenario} />
            <div className="rounded-[20px] rounded-bl-md bg-surface border border-line px-4 py-3">
              <Carregando texto={ia === 'ligada' ? 'Pensando' : 'Digitando'} />
            </div>
          </div>
        )}
        <div ref={fundo} />
      </div>

      <div className="sticky bottom-0 z-10 bg-bg/95 backdrop-blur-md border-t border-line gutter pt-3 pb-3 flex flex-col gap-2">
        {mostrarSugestoes && (
          <div className="flex flex-col gap-1.5">
            <p className="rotulo">Toque para ouvir e usar. Depois, diga em voz alta.</p>
            <div className="flex flex-wrap gap-1.5">
              {ultimaIA!.sugestoes!.map((s) => (
                <button
                  key={s}
                  type="button"
                  lang="en"
                  onClick={() => {
                    setEntrada(s);
                    tocar(`sug:${s}`, [{ texto: s, sotaque: 'en-US' }], { velocidade: config.velocidade });
                  }}
                  className="text-left text-[14px] leading-snug rounded-2xl border border-line bg-surface px-3 py-2 hover:border-accent"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="flex items-end gap-2">
          <div className="flex flex-col gap-1.5 flex-none">
            <button type="button" onClick={abrirTravei} className="btn btn-sol h-11 px-3.5 text-[14px]">
              Travei
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <EntradaFala id="fala-conversa" valor={entrada} aoMudar={setEntrada} aoEnviar={(t) => enviar(t)} desabilitado={esperando} />
          </div>
        </div>
        {config.apoio === 'dicas' && !dica && !esperando && (
          <button type="button" className="self-start text-[13px] font-semibold text-accent inline-flex items-center gap-1" onClick={() => setDica(true)}>
            <Icone nome="lampada" tamanho={15} /> Ver uma dica
          </button>
        )}
      </div>
    </div>
  );
}

function Avatar({ cenario }: { cenario: Cenario }) {
  return (
    <span className="grid place-items-center w-8 h-8 rounded-full bg-accent-soft text-accent font-display font-bold text-[14px] flex-none" aria-hidden="true">
      {cenario.quem.charAt(0)}
    </span>
  );
}

function BalaoIA({
  m,
  cenario,
  primeira,
  traduzida,
  aoTraduzir,
  aoExplicar,
}: {
  m: Msg;
  cenario: Cenario;
  primeira: boolean;
  traduzida: boolean;
  aoTraduzir(): void;
  aoExplicar(): void;
}) {
  return (
    <div className="flex items-end gap-2 max-w-[92%] anima-subir">
      <Avatar cenario={cenario} />
      <div className="min-w-0 rounded-[20px] rounded-bl-md bg-surface border border-line px-4 pt-3 pb-2">
        <p lang="en" className="text-[16px] leading-relaxed">
          <TextoTocavel texto={m.texto} origem="conversa" origemTitulo={cenario.titulo} sotaque={cenario.sotaque} />
        </p>
        {traduzida && m.traducao && <p className="text-[14px] text-muted mt-1 leading-snug">{m.traducao}</p>}
        <div className="flex items-center gap-1 mt-1.5 -ml-1.5">
          <BotaoOuvir id={`msg:${m.id}`} texto={m.texto} sotaque={cenario.sotaque} className="w-8 h-8" />
          {m.traducao && (
            <button type="button" onClick={aoTraduzir} aria-pressed={traduzida} className="h-8 px-2.5 rounded-full text-[12px] font-semibold text-muted hover:bg-surface-2 inline-flex items-center gap-1">
              <Icone nome="traduzir" tamanho={15} /> {traduzida ? 'Esconder' : 'Tradução'}
            </button>
          )}
          <button type="button" onClick={aoExplicar} className="h-8 px-2.5 rounded-full text-[12px] font-semibold text-muted hover:bg-surface-2 inline-flex items-center gap-1">
            <Icone nome="pergunta" tamanho={15} /> Por que?
          </button>
        </div>
        {primeira && <p className="text-[12px] text-muted pb-1">Toque numa palavra para ver a tradução.</p>}
      </div>
    </div>
  );
}

function BalaoEu({
  m,
  cenario,
  aoRepetir,
  aoReenviar,
  aoTravei,
}: {
  m: Msg;
  cenario: Cenario;
  aoRepetir(t: string): void;
  aoReenviar(): void;
  aoTravei(): void;
}) {
  const { acoes } = useLoja();
  const cam = useCamadas();
  const f = m.feedback;
  return (
    <div className="self-end flex flex-col items-end gap-1.5 max-w-[88%] anima-subir">
      <div className="rounded-[20px] rounded-br-md bg-accent text-accent-fg px-4 py-2.5 text-[16px] leading-relaxed" lang="en">
        {m.texto}
      </div>
      {f === 'carregando' && <Carregando texto="Conferindo sua frase" />}
      {f && typeof f === 'object' && 'erro' in f && (
        <div className="flex items-center gap-2 text-[13px] text-bad">
          {f.erro}
          <button type="button" className="font-semibold underline" onClick={aoReenviar}>
            Tentar de novo
          </button>
        </div>
      )}
      {f && typeof f === 'object' && 'status' in f && f.status === 'ok' && (
        <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-ok">
          <Icone nome="check" tamanho={15} strokeWidth={3} /> Soou natural
        </span>
      )}
      {f && typeof f === 'object' && 'status' in f && f.status === 'ajuste' && (
        <div className="w-full rounded-2xl bg-warn-soft p-3 flex flex-col gap-2 text-[14px]">
          {f.melhor && (
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <p className="rotulo !text-warn">Mais natural</p>
                <p className="font-semibold text-[15px] leading-snug" lang="en">
                  {f.melhor}
                </p>
              </div>
              <BotaoOuvir id={`melhor:${m.id}`} texto={f.melhor} className="w-8 h-8" />
            </div>
          )}
          {f.porque && <p className="leading-snug">{f.porque}</p>}
          <div className="flex flex-wrap gap-1.5">
            {f.melhor ? (
              <>
                <button type="button" className="btn btn-sm bg-surface text-fg" onClick={() => aoRepetir(f.melhor!)}>
                  <Icone nome="repetir" tamanho={15} /> Dizer de novo
                </button>
                <button
                  type="button"
                  className="btn btn-sm bg-surface text-fg"
                  onClick={() => {
                    const ok = acoes.adicionarCard({
                      frente: f.melhor!,
                      verso: f.porque ?? 'Jeito natural de dizer',
                      exemplo: `Você disse: "${m.texto}"`,
                      origem: 'conversa',
                      origemTitulo: cenario.titulo,
                    });
                    cam.avisar(ok ? 'Correção salva como card.' : 'Essa correção já está nos seus cards.');
                  }}
                >
                  <Icone nome="cards" tamanho={15} /> Virar card
                </button>
              </>
            ) : (
              <button type="button" className="btn btn-sm btn-sol" onClick={aoTravei}>
                Ver em inglês
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function FolhaTravei({ cenario, ultimaFala, aoEscolher }: { cenario: Cenario; ultimaFala: string; aoEscolher(t: string): void }) {
  const { estado } = useLoja();
  const ia = useEstadoIA();
  const [pt, setPt] = useState('');
  const [opcoes, setOpcoes] = useState<OpcaoTravei[] | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const ctl = useRef<AbortController | null>(null);
  useEffect(() => () => ctl.current?.abort(), []);

  const pedir = () => {
    if (!pt.trim()) return;
    ctl.current?.abort();
    const c = new AbortController();
    ctl.current = c;
    setCarregando(true);
    setErro('');
    perguntarJSON<{ opcoes: OpcaoTravei[] }>(
      promptTravei({ nivel: estado.perfil.nivel, contexto: cenario.contexto, ultimaFala, textoPt: pt.trim() }),
      { signal: c.signal },
    )
      .then((r) => setOpcoes(Array.isArray(r?.opcoes) ? r.opcoes.filter((o) => o?.en).slice(0, 3) : []))
      .catch((e: ErroIA) => {
        if (e.code !== 'cancelled') setErro(mensagemDeErro(e.code));
      })
      .finally(() => setCarregando(false));
  };

  return (
    <div className="flex flex-col gap-5">
      <p className="text-[15px] text-muted -mt-1">
        Escreva em português o que você quer dizer. Você recebe três jeitos de falar em inglês, do mais simples ao mais natural.
      </p>
      {ia !== 'demo' ? (
        <form
          className="flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            pedir();
          }}
        >
          <label htmlFor="travei-pt" className="sr-only">
            O que você quer dizer, em português
          </label>
          <textarea
            id="travei-pt"
            value={pt}
            onChange={(e) => setPt(e.target.value)}
            rows={2}
            placeholder="Ex.: estou esperando o acesso ao servidor desde ontem"
            className="rounded-2xl bg-surface-2 p-3 text-[15px] outline-none focus:ring-2 focus:ring-accent resize-none"
          />
          <button type="submit" className="btn btn-primario" disabled={carregando || !pt.trim()}>
            {carregando ? 'Procurando jeitos de dizer…' : 'Como digo isso em inglês?'}
          </button>
          {erro && <p className="text-[14px] text-bad">{erro}</p>}
        </form>
      ) : (
        <p className="rounded-2xl border border-dashed border-line p-3 text-[14px] text-muted">
          No link publicado no Claude, a IA transforma qualquer frase em português em três jeitos de dizer em inglês. Neste modo de
          demonstração, use uma das frases para ganhar tempo abaixo.
        </p>
      )}

      {opcoes && (
        <ul className="flex flex-col gap-2">
          {opcoes.length === 0 && <li className="text-[14px] text-muted">Não veio nenhuma opção. Tente escrever de outro jeito.</li>}
          {opcoes.map((o, i) => (
            <li key={i} className="rounded-2xl border border-line p-3 flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <Selo tom={i === 0 ? 'ok' : i === 1 ? 'accent' : 'sol'}>{o.rotulo || ['Simples', 'Natural', 'Mais nativo'][i]}</Selo>
                  <p className="font-semibold text-[16px] leading-snug mt-1.5" lang="en">
                    {o.en}
                  </p>
                  {o.nota && <p className="text-[13px] text-muted mt-0.5">{o.nota}</p>}
                </div>
                <BotaoOuvir id={`travei:${o.en}`} texto={o.en} />
              </div>
              <button type="button" className="btn btn-sm btn-primario self-start" onClick={() => aoEscolher(o.en)}>
                Usar esta
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col gap-2">
        <p className="rotulo">Ou ganhe tempo com uma destas</p>
        <ul className="flex flex-col divide-y divide-line rounded-2xl border border-line">
          {CORINGAS.map((c) => (
            <li key={c.en} className="flex items-center gap-2 p-2.5">
              <BotaoOuvir id={`coringa:${c.en}`} texto={c.en} className="w-8 h-8" />
              <span className="flex-1 min-w-0">
                <span className="block text-[14px] font-medium leading-snug" lang="en">
                  {c.en}
                </span>
                <span className="block text-[12px] text-muted">{c.pt}</span>
              </span>
              <button type="button" className="btn btn-sm btn-suave" onClick={() => aoEscolher(c.en)}>
                Usar
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Resumo({
  cenario,
  minhas,
  ajustes,
  segundos,
  aoRecomecar,
}: {
  cenario: Cenario;
  minhas: Msg[];
  ajustes: Msg[];
  segundos: number;
  aoRecomecar(): void;
}) {
  const { acoes } = useLoja();
  const nav = useNav();
  const cam = useCamadas();
  const palavras = new Set(minhas.flatMap((m) => normalizarFala(m.texto)).filter((p) => /^[a-z]{2,}$/.test(p)));
  const minutos = Math.max(1, Math.round(segundos / 60));

  const salvarTodos = () => {
    let novos = 0;
    for (const m of ajustes) {
      const f = m.feedback as Feedback;
      if (
        acoes.adicionarCard({
          frente: f.melhor!,
          verso: f.porque ?? 'Jeito natural de dizer',
          exemplo: `Você disse: "${m.texto}"`,
          origem: 'conversa',
          origemTitulo: cenario.titulo,
        })
      )
        novos++;
    }
    cam.avisar(novos ? `${novos} ${novos === 1 ? 'correção virou card' : 'correções viraram cards'}.` : 'Essas correções já estão nos seus cards.');
  };

  return (
    <div className="flex-1 flex flex-col">
      <Cabecalho voltar titulo="Fim da conversa" sub={cenario.titulo} />
      <div className="gutter flex flex-col gap-6 py-6">
        <div className="flex flex-col gap-2">
          <p className="rotulo">Você falou</p>
          <h2 className="font-display text-[34px] font-extrabold leading-[1.02] tracking-tight">
            {minhas.length} {minhas.length === 1 ? 'frase' : 'frases'} em inglês.
          </h2>
          <p className="text-muted">Isso conta no seu progresso. Sem plateia, sem pressão.</p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            [`${minutos}`, minutos === 1 ? 'minuto' : 'minutos'],
            [`${palavras.size}`, 'palavras usadas'],
            [`${ajustes.length}`, ajustes.length === 1 ? 'ajuste' : 'ajustes'],
          ].map(([v, r]) => (
            <div key={r} className="rounded-2xl bg-surface border border-line p-3">
              <p className="font-display text-[26px] font-extrabold num leading-none">{v}</p>
              <p className="text-[12px] text-muted mt-1">{r}</p>
            </div>
          ))}
        </div>

        {ajustes.length > 0 ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-end justify-between gap-2">
              <h3 className="font-display text-[18px] font-bold">O que dá para melhorar</h3>
              <button type="button" className="btn btn-sm btn-primario" onClick={salvarTodos}>
                Salvar todos como cards
              </button>
            </div>
            {ajustes.map((m) => {
              const f = m.feedback as Feedback;
              return (
                <div key={m.id} className="cartao p-3 flex flex-col gap-1.5">
                  <p className="text-[14px] text-muted line-through decoration-bad/60" lang="en">
                    {m.texto}
                  </p>
                  <div className="flex items-start gap-2">
                    <p className="flex-1 font-semibold leading-snug" lang="en">
                      {f.melhor}
                    </p>
                    <BotaoOuvir id={`res:${m.id}`} texto={f.melhor!} className="w-8 h-8" />
                  </div>
                  {f.porque && <p className="text-[13px] text-muted leading-snug">{f.porque}</p>}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl bg-ok-soft p-4 flex gap-3 items-start">
            <Icone nome="check" className="text-ok flex-none mt-0.5" />
            <p className="text-[14px]">Nenhum ajuste nesta conversa. Na próxima, tente o modo com menos apoio.</p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <button type="button" className="btn btn-primario w-full" onClick={aoRecomecar}>
            <Icone nome="repetir" tamanho={18} /> Conversar de novo
          </button>
          <button type="button" className="btn btn-linha w-full" onClick={() => nav.trocarAba('falar')}>
            Escolher outra situação
          </button>
        </div>
        <p className={cx('text-[12px] text-muted text-center')}>
          Próximo degrau: mandar um áudio para um parceiro na Galera, sem chamada ao vivo.
        </p>
      </div>
    </div>
  );
}
