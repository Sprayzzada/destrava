import { useMemo } from 'react';
import { buscarGlossario, cx, pedacos } from '../lib/texto';
import type { OrigemCard, Sotaque } from '../lib/tipos';
import { useCamadas } from './camadas';

/** Texto em inglês em que cada palavra pode ser tocada para ver a tradução e virar card. */
export function TextoTocavel({
  texto,
  frase,
  glossario,
  origem,
  origemTitulo,
  sotaque,
  destaque,
  className,
}: {
  texto: string;
  /** Frase de contexto que vai para o card (padrão: o próprio texto). */
  frase?: string;
  glossario?: Record<string, string>;
  origem: OrigemCard;
  origemTitulo: string;
  sotaque?: Sotaque;
  /** Trecho sendo falado agora (posição dos caracteres). */
  destaque?: [number, number] | null;
  className?: string;
}) {
  const cam = useCamadas();
  const partes = useMemo(() => pedacos(texto), [texto]);
  return (
    <span className={className}>
      {partes.map((p, i) =>
        p.palavra ? (
          <button
            key={i}
            type="button"
            className={cx(
              'palavra',
              buscarGlossario(glossario, p.t) && 'palavra-glossario',
              destaque && p.ini < destaque[1] && p.fim > destaque[0] && 'palavra-falando',
            )}
            onClick={() =>
              cam.palavra({ palavra: p.t, frase: (frase ?? texto).trim(), glossario, origem, origemTitulo, sotaque })
            }
          >
            {p.t}
          </button>
        ) : (
          <span key={i}>{p.t}</span>
        ),
      )}
    </span>
  );
}
