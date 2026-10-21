import { useMemo, useState } from 'react';
import { useCamadas } from '../componentes/camadas';
import { Icone } from '../componentes/Icone';
import { TextoTocavel } from '../componentes/TextoTocavel';
import { Cabecalho, Segmentado, Selo } from '../componentes/ui';
import { LEITURA, LEITURAS, LIVRO, LIVROS } from '../data/feed';
import { useLoja } from '../lib/loja';
import { useNav } from '../lib/nav';
import { cx, frases } from '../lib/texto';
import type { Nivel, OrigemCard } from '../lib/tipos';
import { pararFala, tocar, useTocando } from '../lib/voz';

/** Texto com áudio frase a frase, destaque da palavra falada e palavras tocáveis. */
function Leitor({
  id,
  paragrafos,
  glossario,
  origem,
  origemTitulo,
}: {
  id: string;
  paragrafos: string[];
  glossario: Record<string, string>;
  origem: OrigemCard;
  origemTitulo: string;
}) {
  const { estado } = useLoja();
  const tocando = useTocando() === id;
  const [ativa, setAtiva] = useState(-1);
  const [destaque, setDestaque] = useState<[number, number] | null>(null);
  const [lento, setLento] = useState(false);

  const blocos = useMemo(() => {
    let n = 0;
    return paragrafos.map((p) => frases(p).map((f) => ({ texto: f, i: n++ })));
  }, [paragrafos]);
  const todas = blocos.flat();

  const ouvir = () => {
    if (tocando) {
      pararFala();
      setAtiva(-1);
      return;
    }
    tocar(
      id,
      todas.map((f) => ({ texto: f.texto.trim() })),
      {
        velocidade: lento ? 0.8 : estado.config.velocidade,
        aoLinha: (i) => {
          setAtiva(i);
          setDestaque(null);
        },
        aoPalavra: (_l, ini, fim) => setDestaque([ini, fim]),
        aoTerminar: () => {
          setAtiva(-1);
          setDestaque(null);
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <button type="button" className="btn btn-primario" onClick={ouvir}>
          <Icone nome={tocando ? 'parar' : 'play'} tamanho={16} /> {tocando ? 'Parar' : 'Ouvir o texto'}
        </button>
        <button type="button" className={cx('btn btn-sm', lento ? 'btn-primario' : 'btn-suave')} onClick={() => setLento(!lento)} aria-pressed={lento}>
          Devagar
        </button>
      </div>
      <p className="text-[12px] text-muted">Toque numa palavra para traduzir, virar card ou perguntar “por que é assim?”.</p>
      <div className="flex flex-col gap-4 text-[18px] leading-[1.7]" lang="en">
        {blocos.map((b, k) => (
          <p key={k}>
            {b.map((f) => (
              <span key={f.i} className={cx(ativa === f.i && 'frase-falando')}>
                <TextoTocavel
                  texto={f.texto}
                  frase={f.texto}
                  glossario={glossario}
                  origem={origem}
                  origemTitulo={origemTitulo}
                  destaque={ativa === f.i ? destaque : null}
                />
              </span>
            ))}
          </p>
        ))}
      </div>
    </div>
  );
}

function Glossario({ glossario, origem, origemTitulo, exemplo }: { glossario: Record<string, string>; origem: OrigemCard; origemTitulo: string; exemplo(p: string): string }) {
  const { acoes } = useLoja();
  const cam = useCamadas();
  return (
    <div className="flex flex-col gap-2">
      <p className="rotulo">Palavras deste texto</p>
      <ul className="cartao divide-y divide-line">
        {Object.entries(glossario).map(([en, pt]) => (
          <li key={en} className="flex items-center gap-3 px-3 py-2">
            <span className="flex-1 min-w-0">
              <span className="font-semibold" lang="en">
                {en}
              </span>{' '}
              <span className="text-[14px] text-muted">{pt}</span>
            </span>
            <button
              type="button"
              className="btn-icone w-8 h-8 bg-accent-soft text-accent"
              aria-label={`Virar card: ${en}`}
              onClick={() => {
                const m = pt.match(/^"([^"]+)"\s*=\s*(.+)$/);
                const ok = acoes.adicionarCard({
                  frente: m ? m[1] : en,
                  verso: m ? m[2] : pt,
                  exemplo: exemplo(en),
                  origem,
                  origemTitulo,
                });
                cam.avisar(ok ? `"${m ? m[1] : en}" virou card.` : 'Esse card já existe.');
              }}
            >
              <Icone nome="mais" tamanho={16} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function fraseCom(paragrafos: string[], palavra: string): string {
  const re = new RegExp(`\\b${palavra.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
  return paragrafos.flatMap((p) => frases(p)).find((f) => re.test(f))?.trim() ?? '';
}

export function Leitura({ id }: { id: string }) {
  const l = LEITURA[id] ?? LEITURAS[0];
  const { estado, acoes } = useLoja();
  const cam = useCamadas();
  const [nivel, setNivel] = useState<Nivel>(estado.perfil.nivel);
  const [lida, setLida] = useState(false);
  const paragrafos = l.versoes[nivel];
  const glossarioDoNivel = Object.fromEntries(Object.entries(l.glossario).filter(([en]) => fraseCom(paragrafos, en)));

  return (
    <div className="flex flex-col">
      <Cabecalho voltar titulo={l.tituloPt} sub={`Leitura · ${l.minutos} min`} />
      <div className="gutter flex flex-col gap-6 pt-5 pb-10">
        <div className="flex flex-col gap-2">
          <p className="text-[13px] text-muted">Mesmo texto, três níveis. Mude quando ficar fácil:</p>
          <Segmentado
            rotulo="Nível do texto"
            opcoes={(['A2', 'B1', 'B2'] as const).map((n) => ({ id: n, nome: n === estado.perfil.nivel ? `${n} · seu` : n }))}
            valor={nivel}
            aoMudar={(n) => {
              pararFala();
              setNivel(n);
            }}
          />
        </div>
        <h1 className="font-display text-[28px] font-extrabold leading-[1.08] tracking-tight" lang="en">
          {l.titulo}
        </h1>
        <Leitor key={nivel} id={`leitura:${l.id}:${nivel}`} paragrafos={paragrafos} glossario={l.glossario} origem="leitura" origemTitulo={l.tituloPt} />
        <Glossario glossario={glossarioDoNivel} origem="leitura" origemTitulo={l.tituloPt} exemplo={(p) => fraseCom(paragrafos, p)} />
        <button
          type="button"
          className={cx('btn w-full', lida ? 'btn-suave' : 'btn-primario')}
          disabled={lida}
          onClick={() => {
            setLida(true);
            acoes.contar('leituras');
            cam.avisar('Leitura concluída. Boa!');
          }}
        >
          {lida ? (
            <>
              <Icone nome="check" tamanho={18} /> Lida
            </>
          ) : (
            'Terminei de ler'
          )}
        </button>
      </div>
    </div>
  );
}

export function Livro({ id }: { id: string }) {
  const l = LIVRO[id] ?? LIVROS[0];
  const { acoes } = useLoja();
  const cam = useCamadas();
  const nav = useNav();
  const [cap, setCap] = useState(0);
  const c = l.capitulos[cap];
  const ultimo = cap === l.capitulos.length - 1;

  return (
    <div className="flex flex-col">
      <Cabecalho voltar titulo={l.tituloPt} sub={`Livro curto · ${l.nivel}`} />
      <div className="gutter flex flex-col gap-6 pt-5 pb-10">
        {cap === 0 && (
          <div className="rounded-[22px] bg-sun-soft p-4 flex flex-col gap-2">
            <Selo tom="sol">História original · {l.nivel}</Selo>
            <p className="text-[14px] leading-relaxed">{l.sinopse}</p>
          </div>
        )}
        <div className="flex gap-2" role="tablist" aria-label="Capítulos">
          {l.capitulos.map((x, i) => (
            <button
              key={x.titulo}
              type="button"
              role="tab"
              aria-selected={cap === i}
              onClick={() => {
                pararFala();
                setCap(i);
              }}
              className={cx('h-9 px-4 rounded-full text-[13px] font-semibold border', cap === i ? 'bg-fg text-bg border-fg' : 'border-line text-muted')}
            >
              Capítulo {i + 1}
            </button>
          ))}
        </div>
        <div>
          <p className="rotulo" lang="en">
            {l.titulo}
          </p>
          <h1 className="font-display text-[28px] font-extrabold leading-[1.08] tracking-tight" lang="en">
            {c.titulo}
          </h1>
        </div>
        <Leitor key={cap} id={`livro:${l.id}:${cap}`} paragrafos={c.paragrafos} glossario={l.glossario} origem="livro" origemTitulo={l.titulo} />
        <button
          type="button"
          className="btn btn-primario w-full"
          onClick={() => {
            pararFala();
            if (!ultimo) setCap(cap + 1);
            else {
              acoes.contar('leituras');
              cam.avisar('Livro concluído!');
              nav.voltar();
            }
          }}
        >
          {ultimo ? 'Terminar o livro' : 'Próximo capítulo'} <Icone nome="seta" tamanho={16} />
        </button>
        <Glossario
          glossario={l.glossario}
          origem="livro"
          origemTitulo={l.titulo}
          exemplo={(p) => fraseCom(l.capitulos.flatMap((x) => x.paragrafos), p)}
        />
      </div>
    </div>
  );
}
