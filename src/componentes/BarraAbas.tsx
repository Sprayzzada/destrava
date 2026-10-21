import { hojeISO } from '../lib/datas';
import { useLoja } from '../lib/loja';
import { useNav, type Aba } from '../lib/nav';
import { filaDeHoje, limiteDiario } from '../lib/srs';
import { cx } from '../lib/texto';
import { Icone, type NomeIcone } from './Icone';

const ABAS: { id: Aba; nome: string; icone: NomeIcone }[] = [
  { id: 'hoje', nome: 'Hoje', icone: 'casa' },
  { id: 'falar', nome: 'Falar', icone: 'balao' },
  { id: 'feed', nome: 'Feed', icone: 'feed' },
  { id: 'revisar', nome: 'Revisar', icone: 'cards' },
  { id: 'galera', nome: 'Galera', icone: 'pessoas' },
];

export function BarraAbas() {
  const nav = useNav();
  const { estado } = useLoja();
  const hoje = hojeISO();
  const feitas = estado.revisoes.data === hoje ? estado.revisoes.feitas : 0;
  const pendentes = filaDeHoje(estado.cards, hoje, limiteDiario(estado.perfil.minutos) - feitas).length;

  return (
    <nav aria-label="Seções do app" className="flex-none border-t border-line bg-surface">
      <div className="gutter grid grid-cols-5">
        {ABAS.map((a) => {
          const ativa = nav.aba === a.id;
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => nav.trocarAba(a.id)}
              aria-current={ativa ? 'page' : undefined}
              className={cx(
                'flex flex-col items-center gap-0.5 pt-2 pb-2 text-[11px] font-semibold transition-colors',
                ativa ? 'text-fg' : 'text-muted hover:text-fg',
              )}
            >
              <span
                className={cx(
                  'relative grid place-items-center w-14 h-8 rounded-full transition-colors',
                  ativa && 'bg-accent-soft text-accent',
                )}
              >
                <Icone nome={a.icone} tamanho={21} />
                {a.id === 'revisar' && pendentes > 0 && (
                  <span className="absolute -top-0.5 right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-sun text-sun-fg text-[10px] font-bold grid place-items-center num">
                    {pendentes}
                  </span>
                )}
              </span>
              {a.nome}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
