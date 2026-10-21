import { useMemo, useState } from 'react';
import { BotaoOuvir } from '../componentes/BotaoOuvir';
import { Icone } from '../componentes/Icone';
import { AvisoVoz, Secao, Segmentado, Selo } from '../componentes/ui';
import { DITADOS, FRASE_SOTAQUE, REDUCOES, SOTAQUES } from '../data/ouvido';
import { useLoja } from '../lib/loja';
import { compararPalavras, cx } from '../lib/texto';
import type { Sotaque } from '../lib/tipos';
import { tocar, ttsDisponivel, useVozes, vozesDoSotaque } from '../lib/voz';

const VELOCIDADES = [
  { id: '0.8', nome: 'Devagar' },
  { id: '1', nome: 'Normal' },
  { id: '1.2', nome: 'Rápido' },
] as const;

export function Ouvido() {
  return (
    <div className="gutter flex flex-col gap-8 pt-5 pb-10">
      <AvisoVoz />
      <div className="rounded-[24px] bg-surface-2 p-4 flex gap-3">
        <Icone nome="ouvido" className="text-accent flex-none mt-0.5" />
        <p className="text-[15px] leading-relaxed">
          O professor fala devagar e claro. Nativo, não. Aqui você treina com a fala grudada, a velocidade normal e sotaques de
          vários lugares.
        </p>
      </div>
      <Ditado />
      <FalaRapida />
      <Sotaques />
    </div>
  );
}

function Ditado() {
  const { acoes } = useLoja();
  const [i, setI] = useState(0);
  const [vel, setVel] = useState<(typeof VELOCIDADES)[number]['id']>('1');
  const [texto, setTexto] = useState('');
  const [resultado, setResultado] = useState<{ palavra: string; ok: boolean }[] | null>(null);
  const [feitos, setFeitos] = useState(0);
  const d = DITADOS[i % DITADOS.length];
  const acertou = resultado?.every((r) => r.ok);

  const conferir = () => {
    if (!texto.trim()) return;
    setResultado(compararPalavras(d.texto, texto));
    const n = feitos + 1;
    setFeitos(n);
    if (n === 3) {
      acoes.contar('ditados');
      acoes.marcarTarefa('ouvido');
    }
  };

  return (
    <Secao
      titulo="Ditado relâmpago"
      sub="Ouça uma frase em velocidade normal e escreva o que entendeu."
      acao={<span className="font-mono text-[13px] text-muted num">{feitos} feitos</span>}
    >
      <div className="cartao p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Selo>{d.dica}</Selo>
        </div>
        <Segmentado rotulo="Velocidade" pequeno opcoes={VELOCIDADES} valor={vel} aoMudar={(v) => setVel(v as typeof vel)} />
        <button
          type="button"
          className="btn btn-primario h-14 text-[16px]"
          onClick={() => tocar(`ditado:${i}`, [{ texto: d.texto }], { velocidade: Number(vel) })}
          disabled={!ttsDisponivel}
        >
          <Icone nome="play" tamanho={18} /> Tocar a frase
        </button>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            conferir();
          }}
        >
          <label htmlFor="ditado" className="sr-only">
            O que você ouviu
          </label>
          <input
            id="ditado"
            value={texto}
            onChange={(e) => {
              setTexto(e.target.value);
              setResultado(null);
            }}
            placeholder="Escreva o que ouviu…"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            lang="en"
            className="flex-1 min-w-0 h-11 rounded-full bg-surface-2 px-4 text-[15px] outline-none focus:ring-2 focus:ring-accent"
          />
          <button type="submit" className="btn btn-suave" disabled={!texto.trim()}>
            Conferir
          </button>
        </form>
        {resultado && (
          <div className="anima-subir flex flex-col gap-2">
            <p className="flex flex-wrap gap-1" lang="en">
              {resultado.map((r, k) => (
                <span key={k} className={cx('px-1.5 py-0.5 rounded-md text-[15px] font-medium', r.ok ? 'bg-ok-soft text-ok' : 'bg-bad-soft text-bad')}>
                  {r.palavra}
                </span>
              ))}
            </p>
            <p className="text-[14px]">
              {acertou ? 'Perfeito! Pegou tudo.' : 'Em vermelho, o que escapou.'} A frase era: <strong lang="en">{d.texto}</strong>
            </p>
            <p className="text-[12px] text-muted">
              Contrações contam como certas: "gonna" e "going to" valem igual.
            </p>
            <button
              type="button"
              className="btn btn-suave self-start"
              onClick={() => {
                setI(i + 1);
                setTexto('');
                setResultado(null);
              }}
            >
              Próxima frase <Icone nome="seta" tamanho={16} />
            </button>
          </div>
        )}
      </div>
    </Secao>
  );
}

function FalaRapida() {
  const [aberto, setAberto] = useState<string | null>(null);
  return (
    <Secao titulo="Fala rápida, decodificada" sub="Na fala real as palavras grudam. É por isso que o ouvido acostumado com o professor trava.">
      <ul className="cartao divide-y divide-line">
        {REDUCOES.map((r) => {
          const ativo = aberto === r.rapido;
          return (
            <li key={r.rapido}>
              <div className="flex items-center gap-3 p-3">
                <button type="button" className="flex-1 min-w-0 text-left" onClick={() => setAberto(ativo ? null : r.rapido)} aria-expanded={ativo}>
                  <span className="flex items-baseline gap-2 flex-wrap">
                    <span className="font-display text-[19px] font-extrabold" lang="en">
                      {r.rapido}
                    </span>
                    <span className="text-muted text-[14px]">=</span>
                    <span className="font-mono text-[14px]" lang="en">
                      {r.completo}
                    </span>
                  </span>
                  <span className="block text-[13px] text-muted">{r.pt}</span>
                </button>
                <BotaoOuvir id={`red:${r.rapido}`} texto={r.exemplo} velocidade={1.1} />
              </div>
              {ativo && (
                <p className="px-3 pb-3 -mt-1 text-[15px]" lang="en">
                  “{r.exemplo}”
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </Secao>
  );
}

function Sotaques() {
  const vozes = useVozes();
  const disponiveis = SOTAQUES.filter((s) => vozesDoSotaque(s.lang, vozes).length > 0);
  const faltando = SOTAQUES.filter((s) => vozesDoSotaque(s.lang, vozes).length === 0);

  if (!ttsDisponivel) {
    return (
      <Secao titulo="Sotaques" sub="Este navegador não tem voz sintetizada.">
        <p className="text-muted text-[14px]">Abra em outro navegador (Chrome, Edge ou Safari) para ouvir os sotaques.</p>
      </Secao>
    );
  }

  return (
    <Secao titulo="Sotaques" sub="A mesma frase em vários lugares. Ouça as diferenças antes de encontrar em uma reunião.">
      {disponiveis.length >= 2 && <AdivinheSotaque opcoes={disponiveis.map((s) => s.lang)} />}
      <div className="flex flex-col gap-2">
        {disponiveis.map((s) => (
          <div key={s.lang} className="cartao p-3 flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="grid place-items-center w-11 h-11 rounded-xl bg-surface-2 font-mono font-medium text-[14px] flex-none">{s.sigla}</span>
              <span className="flex-1 font-semibold">{s.nome}</span>
              <BotaoOuvir id={`sot:${s.lang}`} texto={FRASE_SOTAQUE} sotaque={s.lang} />
            </div>
            <ul className="flex flex-col gap-1 text-[13px] text-muted leading-snug">
              {s.tracos.map((t) => (
                <li key={t} className="pl-3 border-l-2 border-line">
                  {t}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="text-[13px] text-muted">
        Frase: <span lang="en">“{FRASE_SOTAQUE}”</span>
        {faltando.length > 0 && (
          <>
            {' '}
            As vozes dependem do aparelho. Não instaladas aqui: {faltando.map((s) => s.nome).join(', ')}. No celular ou no navegador Edge
            costumam aparecer mais.
          </>
        )}
      </p>
    </Secao>
  );
}

function AdivinheSotaque({ opcoes }: { opcoes: Sotaque[] }) {
  const lista = useMemo(() => opcoes.slice(0, 4), [opcoes]);
  const [certa, setCerta] = useState<Sotaque>(() => lista[Math.floor(Math.random() * lista.length)]);
  const [escolha, setEscolha] = useState<Sotaque | null>(null);
  const [tocou, setTocou] = useState(false);
  const nome = (l: Sotaque) => SOTAQUES.find((s) => s.lang === l)!;
  return (
    <div className="rounded-[22px] bg-accent-soft p-4 flex flex-col gap-3">
      <p className="font-semibold">De onde é esse sotaque?</p>
      <button
        type="button"
        className="btn btn-primario"
        onClick={() => {
          setTocou(true);
          tocar('adivinhe', [{ texto: FRASE_SOTAQUE, sotaque: certa }]);
        }}
      >
        <Icone nome="play" tamanho={16} /> {tocou ? 'Ouvir de novo' : 'Tocar'}
      </button>
      <div className="grid grid-cols-2 gap-2">
        {lista.map((l) => (
          <button
            key={l}
            type="button"
            disabled={!tocou || !!escolha}
            onClick={() => setEscolha(l)}
            className={cx(
              'h-11 rounded-xl border-2 font-semibold text-[14px] transition-colors',
              escolha && l === certa ? 'border-ok bg-ok-soft text-ok' : escolha === l ? 'border-bad bg-bad-soft text-bad' : 'border-transparent bg-surface',
              !tocou && 'opacity-50',
            )}
          >
            {nome(l).nome}
          </button>
        ))}
      </div>
      {escolha && (
        <div className="flex items-center gap-2">
          <p className="flex-1 text-[14px]">{escolha === certa ? 'Acertou!' : `Era ${nome(certa).nome}.`}</p>
          <button
            type="button"
            className="btn btn-sm bg-surface text-fg"
            onClick={() => {
              setCerta(lista[Math.floor(Math.random() * lista.length)]);
              setEscolha(null);
              setTocou(false);
            }}
          >
            Outro
          </button>
        </div>
      )}
    </div>
  );
}
