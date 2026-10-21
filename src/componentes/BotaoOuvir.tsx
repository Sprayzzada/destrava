import { useLoja } from '../lib/loja';
import type { Sotaque } from '../lib/tipos';
import { cx } from '../lib/texto';
import { pararFala, tocar, ttsDisponivel, useTocando } from '../lib/voz';
import { Icone } from './Icone';

/** Botão ▶ que lê o texto com a voz do aparelho. Vira ■ enquanto toca. */
export function BotaoOuvir({
  id,
  texto,
  sotaque = 'en-US',
  velocidade,
  rotulo,
  grande,
  className,
}: {
  id: string;
  texto: string;
  sotaque?: Sotaque;
  velocidade?: number;
  rotulo?: string;
  grande?: boolean;
  className?: string;
}) {
  const { estado } = useLoja();
  const tocando = useTocando() === id;
  if (!ttsDisponivel) return null;
  const clicar = () => {
    if (tocando) pararFala();
    else tocar(id, [{ texto, sotaque }], { velocidade: velocidade ?? estado.config.velocidade });
  };
  const nomeAcao = tocando ? 'Parar' : rotulo ?? 'Ouvir';
  if (rotulo) {
    return (
      <button type="button" onClick={clicar} className={cx('btn btn-sm btn-suave', className)}>
        <Icone nome={tocando ? 'parar' : 'ouvir'} tamanho={16} />
        {nomeAcao}
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={clicar}
      aria-label={`${nomeAcao}: ${texto}`}
      className={cx(
        'btn-icone',
        grande ? 'w-12 h-12 bg-accent text-accent-fg' : tocando ? 'bg-accent text-accent-fg' : 'bg-accent-soft text-accent hover:brightness-95',
        className,
      )}
    >
      <Icone nome={tocando ? 'parar' : 'ouvir'} tamanho={grande ? 22 : 18} />
    </button>
  );
}
