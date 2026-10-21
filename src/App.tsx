import { useEffect, useState } from 'react';
import { BarraAbas } from './componentes/BarraAbas';
import { ProvedorCamadas } from './componentes/camadas';
import { PainelLateral } from './componentes/PainelDores';
import { iniciarIA } from './lib/ia';
import { ProvedorLoja, useLoja } from './lib/loja';
import { ProvedorNav, useNav, type Rota } from './lib/nav';
import { pararFala } from './lib/voz';
import { Conversa } from './telas/Conversa';
import { Falar } from './telas/Falar';
import { Feed } from './telas/Feed';
import { Galera } from './telas/Galera';
import { Hoje } from './telas/Hoje';
import { Leitura, Livro } from './telas/Leitura';
import { Mapa } from './telas/Mapa';
import { Onboarding } from './telas/Onboarding';
import { Perfil } from './telas/Perfil';
import { Reels } from './telas/Reels';
import { Revisar } from './telas/Revisar';
import { Unidade } from './telas/Unidade';

export function App() {
  return (
    <ProvedorLoja>
      <ProvedorNav>
        <Casca />
      </ProvedorNav>
    </ProvedorLoja>
  );
}

function useLarga(): boolean {
  const consulta = '(min-width: 1024px)';
  const [larga, setLarga] = useState(() => typeof window !== 'undefined' && window.matchMedia(consulta).matches);
  useEffect(() => {
    const m = window.matchMedia(consulta);
    const mudar = () => setLarga(m.matches);
    m.addEventListener('change', mudar);
    return () => m.removeEventListener('change', mudar);
  }, []);
  return larga;
}

function Tela({ rota }: { rota: Rota }) {
  switch (rota.tela) {
    case 'hoje':
      return <Hoje />;
    case 'falar':
      return <Falar seg={rota.seg ?? 'conversa'} />;
    case 'conversa':
      return <Conversa cenarioId={rota.cenario} />;
    case 'unidade':
      return <Unidade id={rota.id} />;
    case 'feed':
      return <Feed seg={rota.seg ?? 'pravoce'} />;
    case 'reels':
      return <Reels inicio={rota.inicio} />;
    case 'leitura':
      return <Leitura id={rota.id} />;
    case 'livro':
      return <Livro id={rota.id} />;
    case 'revisar':
      return <Revisar />;
    case 'galera':
      return <Galera />;
    case 'mapa':
      return <Mapa />;
    case 'perfil':
      return <Perfil />;
  }
}

function Casca() {
  const { estado } = useLoja();
  const nav = useNav();
  const larga = useLarga();
  const onboarding = !estado.perfil.pronto;
  const painel = estado.config.apresentacao && larga;
  const telaCheia = nav.rota.tela === 'reels' || nav.rota.tela === 'conversa';
  const chave = `${nav.profundidade}:${JSON.stringify(nav.rota)}`;

  // Descobre cedo se a IA existe aqui (não pede permissão; isso só acontece no primeiro uso).
  useEffect(() => {
    iniciarIA();
  }, []);

  // Trocar de tela para qualquer áudio que esteja tocando.
  useEffect(() => {
    pararFala();
  }, [chave]);

  return (
    <div className="h-full flex justify-center lg:items-center lg:gap-12 lg:px-8">
      {painel && (
        <aside className="h-full w-[min(480px,40vw)] overflow-y-auto flex-none" aria-label="Painel da apresentação">
          <PainelLateral onboarding={onboarding} />
        </aside>
      )}
      <div
        className="relative h-full w-full max-w-[460px] flex flex-col bg-bg overflow-hidden min-[461px]:border-x min-[461px]:border-line lg:h-[calc(100%-40px)] lg:rounded-[32px] lg:border lg:shadow-[var(--sombra)] flex-none"
      >
        <ProvedorCamadas>
          {onboarding ? (
            <Onboarding />
          ) : (
            <>
              <main key={chave} className="flex-1 min-h-0 overflow-y-auto overscroll-contain flex flex-col [scrollbar-width:thin]">
                <Tela rota={nav.rota} />
              </main>
              {!telaCheia && <BarraAbas />}
            </>
          )}
        </ProvedorCamadas>
      </div>
    </div>
  );
}
