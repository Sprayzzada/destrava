import { useState, type ReactNode } from 'react';
import { Icone, Marca } from '../componentes/Icone';
import { useLoja } from '../lib/loja';
import { cx } from '../lib/texto';
import { INTERESSES, type Interesse, type Minutos, type Nivel } from '../lib/tipos';

const TRAVAS = [
  { id: 1, texto: 'Entendo, mas travo na hora de falar' },
  { id: 6, texto: 'Não tenho com quem praticar' },
  { id: 2, texto: 'Flashcards me cansam' },
  { id: 3, texto: 'Não sei o que estudar, nem com qual app' },
  { id: 4, texto: 'Não entendo nativo falando rápido' },
  { id: 5, texto: 'Minha pronúncia' },
  { id: 7, texto: 'Quero conteúdo que eu goste' },
];

const NIVEIS: { id: Nivel; nome: string; texto: string }[] = [
  { id: 'A2', nome: 'Me viro no básico', texto: 'Entendo frases simples, ditas devagar.' },
  { id: 'B1', nome: 'Leio bem, falo pouco', texto: 'Entendo bastante coisa, mas travo para responder.' },
  { id: 'B2', nome: 'Falo, mas travo no real', texto: 'Converso, mas sofro com nativo rápido e reunião.' },
];

const TEMPOS: { id: Minutos; texto: string }[] = [
  { id: 10, texto: 'Fala com a IA e uma revisão curta' },
  { id: 20, texto: 'Ouvido, revisão, fala e pronúncia' },
  { id: 30, texto: 'O plano completo, com um vídeo do feed' },
];

export function Onboarding() {
  const { acoes } = useLoja();
  const [passo, setPasso] = useState(0);
  const [nome, setNome] = useState('');
  const [travas, setTravas] = useState<number[]>([]);
  const [nivel, setNivel] = useState<Nivel>('B1');
  const [minutos, setMinutos] = useState<Minutos>(20);
  const [interesses, setInteresses] = useState<Interesse[]>([]);

  const alternar = <T,>(lista: T[], item: T) => (lista.includes(item) ? lista.filter((x) => x !== item) : [...lista, item]);

  const concluir = () =>
    acoes.concluirOnboarding({ nome: nome.trim(), nivel, minutos, travas, interesses: interesses.length ? interesses : ['series'] });

  const exemplo = () =>
    acoes.concluirOnboarding({ nome: '', nivel: 'B1', minutos: 20, travas: [1, 4], interesses: ['tecnologia', 'series'] });

  const total = 4;
  const podeSeguir = passo !== 1 || travas.length > 0;

  if (passo === 0) {
    return (
      <div className="flex-1 overflow-y-auto flex flex-col">
        <div className="gutter flex-1 flex flex-col justify-center gap-8 py-10">
          <div className="flex flex-col gap-5">
            <Marca tamanho={56} />
            <h1 className="font-display text-[44px] font-extrabold leading-[0.95] tracking-tight">destrava</h1>
            <p className="text-[19px] leading-snug max-w-[26ch]">
              Inglês para quem <strong className="font-semibold">entende</strong>, mas trava na hora de{' '}
              <span className="bg-sun text-sun-fg px-1 rounded">falar</span>.
            </p>
          </div>
          <ul className="flex flex-col gap-2 text-[14px] text-muted">
            <li className="flex gap-2">
              <Icone nome="balao" tamanho={18} className="text-accent flex-none mt-0.5" /> Converse com uma IA sem plateia e
              receba correção em português.
            </li>
            <li className="flex gap-2">
              <Icone nome="ouvido" tamanho={18} className="text-accent flex-none mt-0.5" /> Treine o ouvido com fala rápida e
              sotaques de verdade.
            </li>
            <li className="flex gap-2">
              <Icone nome="cards" tamanho={18} className="text-accent flex-none mt-0.5" /> Revise sem avalanche de cards.
            </li>
          </ul>
          <div className="flex flex-col gap-2">
            <label htmlFor="nome" className="text-[14px] font-semibold">
              Como podemos te chamar?
            </label>
            <input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Seu nome (opcional)"
              className="h-12 rounded-2xl bg-surface border border-line px-4 text-[16px] outline-none focus:border-accent"
            />
          </div>
        </div>
        <div className="gutter flex flex-col gap-2 pb-6">
          <button type="button" className="btn btn-primario w-full h-12" onClick={() => setPasso(1)}>
            Começar
          </button>
          <button type="button" className="btn btn-linha w-full" onClick={exemplo}>
            Pular e ver o app com um perfil de exemplo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="gutter flex items-center gap-3 pt-4 pb-2">
        <button type="button" className="btn-icone -ml-2 hover:bg-surface-2" onClick={() => setPasso((p) => p - 1)} aria-label="Voltar">
          <Icone nome="voltar" />
        </button>
        <div className="flex-1 flex gap-1.5" aria-label={`Passo ${passo} de ${total}`}>
          {Array.from({ length: total }, (_, i) => (
            <span key={i} className={cx('h-1.5 flex-1 rounded-full', i < passo ? 'bg-accent' : 'bg-surface-2')} />
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto gutter py-4 flex flex-col gap-5">
        {passo === 1 && (
          <>
            <Titulo t="O que mais te trava no inglês?" s="Escolha quantas quiser. O plano do dia começa por aqui." />
            <div className="flex flex-col gap-2">
              {TRAVAS.map((t) => (
                <Opcao key={t.id} ativa={travas.includes(t.id)} aoClicar={() => setTravas(alternar(travas, t.id))} multi>
                  {t.texto}
                </Opcao>
              ))}
            </div>
          </>
        )}
        {passo === 2 && (
          <>
            <Titulo t="Como está seu inglês hoje?" s="Sem prova: escolha o que mais parece com você. Dá para mudar depois." />
            <div className="flex flex-col gap-2">
              {NIVEIS.map((n) => (
                <Opcao key={n.id} ativa={nivel === n.id} aoClicar={() => setNivel(n.id)} detalhe={n.texto} selo={n.id}>
                  {n.nome}
                </Opcao>
              ))}
            </div>
          </>
        )}
        {passo === 3 && (
          <>
            <Titulo t="Quanto tempo por dia?" s="O limite de revisões acompanha o seu tempo, para nunca virar avalanche." />
            <div className="flex flex-col gap-2">
              {TEMPOS.map((t) => (
                <Opcao key={t.id} ativa={minutos === t.id} aoClicar={() => setMinutos(t.id)} detalhe={t.texto}>
                  {t.id} minutos
                </Opcao>
              ))}
            </div>
          </>
        )}
        {passo === 4 && (
          <>
            <Titulo t="Do que você gosta?" s="Seu feed e suas conversas vão falar disso." />
            <div className="flex flex-wrap gap-2">
              {INTERESSES.map((i) => {
                const ativo = interesses.includes(i.id);
                return (
                  <button
                    key={i.id}
                    type="button"
                    aria-pressed={ativo}
                    onClick={() => setInteresses(alternar(interesses, i.id))}
                    className={cx(
                      'h-10 px-4 rounded-full border text-[14px] font-semibold transition-colors',
                      ativo ? 'bg-accent text-accent-fg border-accent' : 'bg-surface border-line hover:border-muted',
                    )}
                  >
                    {i.nome}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      <div className="gutter pb-6 pt-2">
        <button
          type="button"
          className="btn btn-primario w-full h-12"
          disabled={!podeSeguir}
          onClick={() => (passo < total ? setPasso(passo + 1) : concluir())}
        >
          {passo < total ? 'Continuar' : 'Montar meu plano'}
        </button>
      </div>
    </div>
  );
}

function Titulo({ t, s }: { t: string; s: string }) {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="font-display text-[28px] font-extrabold leading-[1.05] tracking-tight">{t}</h1>
      <p className="text-muted text-[15px]">{s}</p>
    </div>
  );
}

function Opcao({
  ativa,
  aoClicar,
  children,
  detalhe,
  selo,
  multi,
}: {
  ativa: boolean;
  aoClicar(): void;
  children: ReactNode;
  detalhe?: string;
  selo?: string;
  multi?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={aoClicar}
      aria-pressed={ativa}
      className={cx(
        'w-full text-left flex items-center gap-3 rounded-2xl border p-4 transition-colors',
        ativa ? 'border-accent bg-accent-soft' : 'border-line bg-surface hover:border-muted',
      )}
    >
      <span
        className={cx(
          'grid place-items-center w-6 h-6 flex-none border-2',
          multi ? 'rounded-md' : 'rounded-full',
          ativa ? 'bg-accent border-accent text-accent-fg' : 'border-line',
        )}
      >
        {ativa && <Icone nome="check" tamanho={14} strokeWidth={3} />}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block font-semibold">{children}</span>
        {detalhe && <span className="block text-[13px] text-muted">{detalhe}</span>}
      </span>
      {selo && <span className="font-mono text-[12px] text-muted">{selo}</span>}
    </button>
  );
}
