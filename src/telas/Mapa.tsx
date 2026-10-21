import { ListaDores } from '../componentes/PainelDores';
import { Cabecalho } from '../componentes/ui';
import { DORES } from '../data/dores';

export function Mapa() {
  return (
    <div className="flex flex-col">
      <Cabecalho voltar titulo="As 7 dores" sub="Do Define ao Develop" semDores />
      <div className="gutter flex flex-col gap-5 pt-5 pb-10">
        <div className="flex flex-col gap-2">
          <p className="rotulo">Como este app nasceu</p>
          <h1 className="font-display text-[30px] font-extrabold leading-[1.05] tracking-tight">
            Cada tela responde a uma dor que as pessoas contaram.
          </h1>
          <p className="text-[15px] text-muted">
            Abaixo, o que ouvimos na pesquisa, como o app responde e o atalho para ver funcionando.
          </p>
        </div>
        <ListaDores ids={DORES.map((d) => d.id)} />
      </div>
    </div>
  );
}
