import { Fragment, type ReactNode } from 'react';
import { useEstadoIA } from '../lib/ia';
import { useNav } from '../lib/nav';
import { cx } from '../lib/texto';
import { useSemVozIngles } from '../lib/voz';
import { Icone, type NomeIcone } from './Icone';
import { ChipDores } from './PainelDores';

export function Cabecalho({
  titulo,
  sub,
  voltar,
  direita,
  semDores,
}: {
  titulo: ReactNode;
  sub?: ReactNode;
  voltar?: boolean;
  direita?: ReactNode;
  semDores?: boolean;
}) {
  const nav = useNav();
  return (
    <header className="sticky top-0 z-20 bg-bg/90 backdrop-blur-md border-b border-line/60">
      <div className="gutter flex items-center gap-2 min-h-14 py-2">
        {voltar && (
          <button type="button" className="btn-icone -ml-2 hover:bg-surface-2" onClick={nav.voltar} aria-label="Voltar">
            <Icone nome="voltar" />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-[19px] font-bold leading-tight truncate">{titulo}</h1>
          {sub && <p className="text-[13px] text-muted truncate">{sub}</p>}
        </div>
        {!semDores && <ChipDores />}
        {direita}
      </div>
    </header>
  );
}

export function Segmentado<T extends string>({
  opcoes,
  valor,
  aoMudar,
  rotulo,
  pequeno,
}: {
  opcoes: readonly { id: T; nome: string }[];
  valor: T;
  aoMudar(v: T): void;
  rotulo: string;
  pequeno?: boolean;
}) {
  return (
    <div role="tablist" aria-label={rotulo} className="flex p-1 rounded-full bg-surface-2 gap-1">
      {opcoes.map((o) => (
        <button
          key={o.id}
          type="button"
          role="tab"
          aria-selected={valor === o.id}
          onClick={() => aoMudar(o.id)}
          className={cx(
            'flex-1 rounded-full font-semibold transition-colors',
            pequeno ? 'h-8 text-[13px] px-2' : 'h-9 text-[14px] px-3',
            valor === o.id ? 'bg-surface text-fg shadow-sm' : 'text-muted hover:text-fg',
          )}
        >
          {o.nome}
        </button>
      ))}
    </div>
  );
}

export function Secao({
  titulo,
  sub,
  acao,
  children,
  className,
}: {
  titulo: ReactNode;
  sub?: ReactNode;
  acao?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cx('flex flex-col gap-3', className)}>
      <div className="flex items-end gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-[18px] font-bold leading-tight">{titulo}</h2>
          {sub && <p className="text-[13px] text-muted mt-0.5">{sub}</p>}
        </div>
        {acao}
      </div>
      {children}
    </section>
  );
}

export function Selo({ children, tom = 'neutro', className }: { children: ReactNode; tom?: 'neutro' | 'accent' | 'sol' | 'ok' | 'warn'; className?: string }) {
  const tons = {
    neutro: 'bg-surface-2 text-muted',
    accent: 'bg-accent-soft text-accent',
    sol: 'bg-sun-soft text-fg',
    ok: 'bg-ok-soft text-ok',
    warn: 'bg-warn-soft text-warn',
  };
  return (
    <span className={cx('inline-flex items-center gap-1 rounded-full px-2.5 h-6 text-[12px] font-semibold whitespace-nowrap', tons[tom], className)}>
      {children}
    </span>
  );
}

export function StatusIA() {
  const estado = useEstadoIA();
  if (estado === 'verificando') return null;
  return estado === 'ligada' ? (
    <Selo tom="ok">
      <Icone nome="brilho" tamanho={13} /> IA<span className="hidden min-[420px]:inline"> ligada</span>
    </Selo>
  ) : (
    <Selo>
      <Icone nome="brilho" tamanho={13} />
      <span className="min-[420px]:hidden">Demo</span>
      <span className="hidden min-[420px]:inline">Modo demonstração</span>
    </Selo>
  );
}

/** Mostra **negrito** e quebras de linha (formato das explicações da IA). */
export function TextoFormatado({ texto, className }: { texto: string; className?: string }) {
  return (
    <div className={cx('flex flex-col gap-2', className)}>
      {texto
        .split(/\n{1,}/)
        .filter((l) => l.trim())
        .map((linha, i) => (
          <p key={i}>
            {linha.split(/(\*\*[^*]+\*\*)/g).map((p, j) =>
              p.startsWith('**') && p.endsWith('**') ? (
                <strong key={j} className="font-semibold">
                  {p.slice(2, -2)}
                </strong>
              ) : (
                <Fragment key={j}>{p.replace(/^[-•]\s*/, '')}</Fragment>
              ),
            )}
          </p>
        ))}
    </div>
  );
}

export function LinhaAcao({
  icone,
  titulo,
  sub,
  aoClicar,
  direita,
  feito,
}: {
  icone: NomeIcone;
  titulo: ReactNode;
  sub?: ReactNode;
  aoClicar?(): void;
  direita?: ReactNode;
  feito?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={aoClicar}
      className="w-full text-left flex items-center gap-3 p-3 rounded-2xl hover:bg-surface-2 transition-colors"
    >
      <span className={cx('grid place-items-center w-10 h-10 rounded-xl flex-none', feito ? 'bg-ok-soft text-ok' : 'bg-accent-soft text-accent')}>
        <Icone nome={feito ? 'check' : icone} />
      </span>
      <span className="min-w-0 flex-1">
        <span className={cx('block font-semibold leading-snug', feito && 'line-through decoration-2 text-muted')}>{titulo}</span>
        {sub && <span className="block text-[13px] text-muted leading-snug">{sub}</span>}
      </span>
      {direita ?? <Icone nome="seta" tamanho={18} className="text-muted flex-none" />}
    </button>
  );
}

export function AvisoVoz() {
  const sem = useSemVozIngles();
  if (!sem) return null;
  return (
    <div className="rounded-2xl bg-warn-soft p-3 text-[13px] leading-snug flex gap-2.5">
      <Icone nome="ouvir" tamanho={18} className="text-warn flex-none mt-0.5" />
      <p>
        <strong className="font-semibold">Este aparelho não tem voz em inglês.</strong> O áudio vai sair com sotaque de português.
        Para ouvir certo, abra no Chrome ou no Edge, ou instale uma voz em inglês no Windows (Configurações › Hora e idioma › Fala ›
        Adicionar vozes).
      </p>
    </div>
  );
}

export function Carregando({ texto = 'Pensando' }: { texto?: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-muted text-[14px]" role="status">
      {texto}
      <span className="digitando" aria-hidden="true">
        <span>.</span>
        <span>.</span>
        <span>.</span>
      </span>
    </span>
  );
}

export function Barra({ valor, max, tom = 'accent' }: { valor: number; max: number; tom?: 'accent' | 'ok' | 'sol' }) {
  const p = max > 0 ? Math.min(100, Math.round((valor / max) * 100)) : 0;
  const cor = { accent: 'bg-accent', ok: 'bg-ok', sol: 'bg-sun' }[tom];
  return (
    <div className="h-2 rounded-full bg-surface-2 overflow-hidden" role="progressbar" aria-valuenow={valor} aria-valuemax={max}>
      <div className={cx('h-full rounded-full transition-all', cor)} style={{ width: `${p}%` }} />
    </div>
  );
}
