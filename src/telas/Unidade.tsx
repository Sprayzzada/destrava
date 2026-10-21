import { useEffect, useMemo, useRef, useState } from 'react';
import { BotaoOuvir } from '../componentes/BotaoOuvir';
import { useCamadas } from '../componentes/camadas';
import { EntradaFala } from '../componentes/EntradaFala';
import { Icone } from '../componentes/Icone';
import { AvisoVoz, Cabecalho, Secao, Selo } from '../componentes/ui';
import { AVALIACOES } from '../data/comunidade';
import { UNIDADE, UNIDADES, type Unidade as TUnidade } from '../data/pronuncia';
import { useLoja } from '../lib/loja';
import { useNav } from '../lib/nav';
import { compararPalavras, cx, normalizarFala } from '../lib/texto';
import { comecarGravacao, gravacaoPossivel, tocar } from '../lib/voz';

export function Unidade({ id }: { id: string }) {
  const u = UNIDADE[id] ?? UNIDADES[0];
  const nav = useNav();
  const idx = UNIDADES.indexOf(u);
  const proxima = UNIDADES[(idx + 1) % UNIDADES.length];
  return (
    <div className="flex flex-col">
      <Cabecalho voltar titulo={u.titulo} sub="Laboratório de sons" />
      <div className="gutter flex flex-col gap-7 pt-5 pb-10">
        <AvisoVoz />
        <div className="flex items-start gap-4">
          <span className="grid place-items-center min-w-20 h-20 px-3 rounded-[22px] bg-accent text-accent-fg font-mono text-[28px] font-medium flex-none">
            {u.simbolo}
          </span>
          <div className="flex flex-col gap-1">
            <p className="rotulo">O erro comum</p>
            <p className="text-[16px] leading-snug font-medium">{u.resumo}</p>
          </div>
        </div>

        <div className="rounded-[22px] bg-surface-2 p-4 flex gap-3">
          <Icone nome="lampada" className="text-accent flex-none mt-0.5" />
          <div>
            <p className="font-semibold mb-1">Como fazer</p>
            <p className="text-[15px] leading-relaxed">{u.comoFazer}</p>
          </div>
        </div>

        <Secao titulo="1. Ouça" sub="Normal e devagar. Repare na boca, não só no som.">
          <div className="flex flex-col gap-2">
            {u.palavras.map((p) => (
              <div key={p.alvo} className="cartao px-3 py-2 flex items-center gap-2">
                <span className="flex-1 font-display text-[19px] font-bold" lang="en">
                  {p.alvo}
                </span>
                <BotaoOuvir id={`u:${p.alvo}`} texto={p.alvo} />
                <BotaoOuvir id={`u-lento:${p.alvo}`} texto={p.alvo} velocidade={0.55} rotulo="Devagar" />
              </div>
            ))}
          </div>
        </Secao>

        <JogoPares u={u} />
        <AgoraVoce u={u} />
        <FraseDoSom u={u} />
        <PedirHumano u={u} />

        <button type="button" onClick={() => nav.ir({ tela: 'unidade', id: proxima.id })} className="cartao p-4 flex items-center gap-3 text-left hover:border-muted">
          <span className="grid place-items-center w-12 h-12 rounded-xl bg-accent-soft text-accent font-mono flex-none">{proxima.simbolo}</span>
          <span className="flex-1">
            <span className="block text-[12px] text-muted">Próximo som</span>
            <span className="block font-semibold">{proxima.titulo}</span>
          </span>
          <Icone nome="seta" tamanho={18} className="text-muted" />
        </button>
      </div>
    </div>
  );
}

/** Treino de ouvido: qual das duas palavras você ouviu? */
function JogoPares({ u }: { u: TUnidade }) {
  const { acoes } = useLoja();
  const rodadas = useMemo(
    () => u.pares.map((par) => ({ par: Math.random() < 0.5 ? par : ([par[1], par[0]] as [string, string]), certa: par[Math.random() < 0.5 ? 0 : 1] })),
    [u],
  );
  const [i, setI] = useState(0);
  const [escolha, setEscolha] = useState<string | null>(null);
  const [acertos, setAcertos] = useState(0);
  const [tocou, setTocou] = useState(false);
  const terminou = i >= rodadas.length;
  const r = rodadas[Math.min(i, rodadas.length - 1)];

  useEffect(() => {
    if (terminou && acertos >= 3) {
      acoes.marcarSom(u.id);
      acoes.marcarTarefa('pronuncia');
    }
    // Marca só quando o jogo acaba.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [terminou]);

  const ouvir = () => {
    setTocou(true);
    tocar(`par:${i}`, [{ texto: r.certa }], { velocidade: 0.9 });
  };

  return (
    <Secao titulo="2. Treine o ouvido" sub="Se você não ouve a diferença, não consegue falar a diferença.">
      <div className="cartao p-4 flex flex-col gap-4">
        {terminou ? (
          <div className="flex flex-col items-center text-center gap-2 py-2">
            <p className="font-display text-[34px] font-extrabold num">
              {acertos}/{rodadas.length}
            </p>
            <p className="text-[15px]">
              {acertos >= 4 ? 'Seu ouvido já separa bem esses sons.' : acertos >= 3 ? 'Quase lá. Mais uma rodada fixa a diferença.' : 'Normal no começo. Ouça devagar e tente de novo.'}
            </p>
            <button
              type="button"
              className="btn btn-suave mt-1"
              onClick={() => {
                setI(0);
                setAcertos(0);
                setEscolha(null);
                setTocou(false);
              }}
            >
              <Icone nome="repetir" tamanho={16} /> Jogar de novo
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <span className="rotulo">
                Rodada {i + 1} de {rodadas.length}
              </span>
              <span className="font-mono text-[13px] text-muted num">{acertos} acertos</span>
            </div>
            <button type="button" onClick={ouvir} className="btn btn-primario h-14 text-[16px]">
              <Icone nome="play" tamanho={18} /> {tocou ? 'Ouvir de novo' : 'Tocar a palavra'}
            </button>
            <div className="grid grid-cols-2 gap-2">
              {r.par.map((p) => {
                const certa = escolha && p === r.certa;
                const errada = escolha === p && p !== r.certa;
                return (
                  <button
                    key={p}
                    type="button"
                    disabled={!tocou || !!escolha}
                    onClick={() => {
                      setEscolha(p);
                      if (p === r.certa) setAcertos((a) => a + 1);
                    }}
                    className={cx(
                      'h-14 rounded-2xl border-2 font-display text-[19px] font-bold transition-colors disabled:cursor-default',
                      certa ? 'border-ok bg-ok-soft text-ok' : errada ? 'border-bad bg-bad-soft text-bad' : 'border-line bg-surface',
                      !tocou && 'opacity-50',
                    )}
                    lang="en"
                  >
                    {p}
                  </button>
                );
              })}
            </div>
            {escolha && (
              <div className="flex items-center gap-2">
                <p className="flex-1 text-[14px]">
                  {escolha === r.certa ? 'Isso!' : `Era "${r.certa}".`} Ouça as duas:
                </p>
                <BotaoOuvir id={`cmp-a:${i}`} texto={r.par[0]} rotulo={r.par[0]} />
                <BotaoOuvir id={`cmp-b:${i}`} texto={r.par[1]} rotulo={r.par[1]} />
              </div>
            )}
            {escolha && (
              <button
                type="button"
                className="btn btn-suave"
                onClick={() => {
                  setI(i + 1);
                  setEscolha(null);
                  setTocou(false);
                }}
              >
                {i + 1 < rodadas.length ? 'Próxima' : 'Ver resultado'}
              </button>
            )}
          </>
        )}
      </div>
    </Secao>
  );
}

/** Fala a palavra e descobre o que saiu diferente. */
function AgoraVoce({ u }: { u: TUnidade }) {
  const { acoes } = useLoja();
  const cam = useCamadas();
  const [k, setK] = useState(0);
  const [dito, setDito] = useState('');
  const [resultado, setResultado] = useState<{ ok: boolean; texto: string } | null>(null);
  const [gravando, setGravando] = useState(false);
  const [minhaGravacao, setMinhaGravacao] = useState<string | null>(null);
  const pararGravacao = useRef<(() => Promise<string>) | null>(null);
  const alvo = u.palavras[k % u.palavras.length];

  const conferir = (t: string) => {
    const ouvido = normalizarFala(t).join(' ');
    const certo = normalizarFala(alvo.alvo).join(' ');
    if (!ouvido) return;
    if (ouvido === certo || ouvido.split(' ').includes(certo)) {
      setResultado({ ok: true, texto: `Entendemos "${alvo.alvo}". O som saiu certo.` });
      acoes.marcarSom(u.id);
      acoes.marcarTarefa('pronuncia');
    } else if (alvo.confusoes.some((c) => ouvido === c || ouvido.includes(c))) {
      const c = alvo.confusoes.find((x) => ouvido === x || ouvido.includes(x))!;
      setResultado({ ok: false, texto: u.diagnostico(alvo.alvo, c) });
    } else {
      setResultado({ ok: false, texto: `Entendemos "${t.trim()}". Tente de novo mais devagar, exagerando o som "${u.simbolo}".` });
    }
  };

  const gravar = async () => {
    if (gravando) {
      const url = await pararGravacao.current?.();
      setGravando(false);
      if (url) setMinhaGravacao(url);
      return;
    }
    try {
      pararGravacao.current = await comecarGravacao();
      setGravando(true);
    } catch {
      cam.avisar('O navegador não liberou o microfone aqui. Se estiver numa pré-visualização, abra o app em uma aba própria.');
    }
  };

  return (
    <Secao titulo="3. Agora você" sub="Diga a palavra. O app mostra o que foi entendido e qual som escapou.">
      <div className="cartao p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="rotulo flex-1">Diga</span>
          <button
            type="button"
            className="text-[13px] font-semibold text-accent"
            onClick={() => {
              setK(k + 1);
              setDito('');
              setResultado(null);
              setMinhaGravacao(null);
            }}
          >
            Outra palavra
          </button>
        </div>
        <div className="flex items-center gap-3">
          <p className="flex-1 font-display text-[34px] font-extrabold leading-none" lang="en">
            {alvo.alvo}
          </p>
          <BotaoOuvir id={`alvo:${alvo.alvo}`} texto={alvo.alvo} grande />
        </div>
        <EntradaFala
          id={`fala-${u.id}`}
          valor={dito}
          aoMudar={(t) => {
            setDito(t);
            setResultado(null);
          }}
          aoEnviar={conferir}
          enviarAoFalar
          umaLinha
          placeholder="Fale a palavra (ou dite com o teclado)"
        />
        {resultado && (
          <div className={cx('rounded-2xl p-3 flex gap-2 text-[14px] leading-snug anima-subir', resultado.ok ? 'bg-ok-soft' : 'bg-warn-soft')}>
            <Icone nome={resultado.ok ? 'check' : 'alvo'} className={cx('flex-none mt-0.5', resultado.ok ? 'text-ok' : 'text-warn')} />
            <p>{resultado.texto}</p>
          </div>
        )}
        {gravacaoPossivel() && (
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-line">
            <span className="text-[13px] text-muted w-full pt-2">Grave e compare com a voz nativa:</span>
            <button type="button" onClick={gravar} className={cx('btn btn-sm', gravando ? 'bg-bad text-bg' : 'btn-suave')}>
              <Icone nome={gravando ? 'parar' : 'gravar'} tamanho={14} /> {gravando ? 'Parar' : 'Gravar'}
            </button>
            {minhaGravacao && (
              <button type="button" className="btn btn-sm btn-suave" onClick={() => new Audio(minhaGravacao).play()}>
                <Icone nome="play" tamanho={14} /> Você
              </button>
            )}
            {minhaGravacao && <BotaoOuvir id={`nativo:${alvo.alvo}`} texto={alvo.alvo} rotulo="Nativo" />}
          </div>
        )}
      </div>
    </Secao>
  );
}

function FraseDoSom({ u }: { u: TUnidade }) {
  const [dito, setDito] = useState('');
  const [resultado, setResultado] = useState<{ palavra: string; ok: boolean }[] | null>(null);
  return (
    <Secao titulo="4. Numa frase" sub="O som no meio de outras palavras, como numa conversa.">
      <div className="cartao p-4 flex flex-col gap-3">
        <div className="flex items-start gap-2">
          <p className="flex-1 text-[18px] font-medium leading-snug" lang="en">
            {u.frase}
          </p>
          <BotaoOuvir id={`frase-som:${u.id}`} texto={u.frase} />
        </div>
        <BotaoOuvir id={`frase-som-lento:${u.id}`} texto={u.frase} velocidade={0.7} rotulo="Ouvir devagar" className="self-start" />
        <EntradaFala
          id={`frase-${u.id}`}
          valor={dito}
          aoMudar={(t) => {
            setDito(t);
            setResultado(null);
          }}
          aoEnviar={(t) => setResultado(compararPalavras(u.frase, t))}
          enviarAoFalar
          placeholder="Fale a frase inteira"
        />
        {resultado && (
          <div className="anima-subir flex flex-col gap-2">
            <p className="flex flex-wrap gap-1" lang="en">
              {resultado.map((r, i) => (
                <span key={i} className={cx('px-1.5 py-0.5 rounded-md text-[15px] font-medium', r.ok ? 'bg-ok-soft text-ok' : 'bg-bad-soft text-bad line-through')}>
                  {r.palavra}
                </span>
              ))}
            </p>
            <p className="text-[13px] text-muted">
              {resultado.every((r) => r.ok)
                ? 'Todas as palavras foram entendidas.'
                : 'As riscadas não foram entendidas. Normalmente são justamente as que têm o som deste treino.'}
            </p>
          </div>
        )}
      </div>
    </Secao>
  );
}

function PedirHumano({ u }: { u: TUnidade }) {
  const cam = useCamadas();
  const exemplo = AVALIACOES.find((a) => a.som === u.titulo) ?? AVALIACOES[0];
  const abrir = () =>
    cam.abrir(
      <div className="flex flex-col gap-4">
        <p className="text-[15px]">
          Seu áudio vai para nativos da comunidade, que marcam som por som o que está bom e o que ajustar. Você escolhe o foco:
        </p>
        <div className="flex flex-wrap gap-2">
          <Selo tom="accent">{u.titulo}</Selo>
          <Selo>Ritmo</Selo>
          <Selo>Entonação</Selo>
        </div>
        <button
          type="button"
          className="btn btn-primario"
          onClick={() => {
            cam.fechar();
            cam.avisar('Exemplo: no app real, seu pedido iria para a comunidade agora.');
          }}
        >
          Enviar pedido de avaliação
        </button>
        <div className="rounded-2xl border border-line p-3 flex flex-col gap-2">
          <p className="rotulo">Como volta a avaliação · exemplo</p>
          <p className="text-[14px] font-semibold">
            {exemplo.autor} pediu: “{exemplo.pedido}”
          </p>
          {exemplo.respostas.map((r) => (
            <div key={r.quem} className="flex flex-col gap-1.5">
              <p className="text-[14px]" lang="en">
                <strong>{r.quem}</strong> <span className="text-muted">(nativa/o)</span>: {r.en}
              </p>
              <p className="text-[13px] text-muted">{r.pt}</p>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(r.notas).map(([som, nota]) => (
                  <Selo key={som} tom={/ótimo|bom|perfeito/.test(nota) ? 'ok' : 'warn'}>
                    {som}: {nota}
                  </Selo>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>,
      'Avaliação de um humano',
    );
  return (
    <Secao titulo="5. Quer um humano ouvindo?" sub="Máquina ajuda, mas às vezes você quer a opinião de um nativo.">
      <button type="button" onClick={abrir} className="rounded-[22px] bg-sun-soft p-4 flex items-center gap-3 text-left">
        <span className="grid place-items-center w-10 h-10 rounded-xl bg-sun text-sun-fg flex-none">
          <Icone nome="pessoas" />
        </span>
        <span className="flex-1">
          <span className="block font-semibold">Pedir avaliação para nativos</span>
          <span className="block text-[13px] text-muted">Feedback honesto sobre este som, em até um dia.</span>
        </span>
        <Icone nome="seta" tamanho={18} className="text-muted" />
      </button>
    </Secao>
  );
}
