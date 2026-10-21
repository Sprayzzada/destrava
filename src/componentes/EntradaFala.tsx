import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { cx } from '../lib/texto';
import { emMoldura, micPossivel, ouvirFala, pararFala, plataforma } from '../lib/voz';
import { useCamadas } from './camadas';
import { Icone } from './Icone';

/** Campo para falar (microfone ou ditado do aparelho) ou escrever em inglês. */
export function EntradaFala({
  id,
  valor,
  aoMudar,
  aoEnviar,
  placeholder = 'Fale ou escreva em inglês…',
  desabilitado,
  enviarAoFalar,
  umaLinha,
}: {
  id: string;
  valor: string;
  aoMudar(t: string): void;
  aoEnviar(t: string): void;
  placeholder?: string;
  desabilitado?: boolean;
  enviarAoFalar?: boolean;
  umaLinha?: boolean;
}) {
  const cam = useCamadas();
  const [ouvindo, setOuvindo] = useState(false);
  const [dica, setDica] = useState(false);
  const parar = useRef<(() => void) | null>(null);
  const campo = useRef<HTMLTextAreaElement>(null);

  useEffect(() => () => parar.current?.(), []);

  useLayoutEffect(() => {
    const el = campo.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  }, [valor]);

  const enviar = () => {
    const t = valor.trim();
    if (!t || desabilitado) return;
    aoEnviar(t);
  };

  const clicarMic = () => {
    if (ouvindo) {
      parar.current?.();
      return;
    }
    if (!micPossivel()) {
      setDica((d) => !d);
      campo.current?.focus();
      return;
    }
    pararFala();
    setOuvindo(true);
    parar.current = ouvirFala({
      aoParcial: aoMudar,
      aoFinal: (t) => {
        aoMudar(t);
        if (enviarAoFalar && !desabilitado) aoEnviar(t);
      },
      aoErro: (e) => {
        if (e === 'negado') setDica(true);
        else if (e === 'sem-fala') cam.avisar('Não ouvimos nada. Toque no microfone e fale.');
        else cam.avisar('O microfone falhou. Tente de novo ou use o ditado do aparelho.');
      },
      aoFim: () => setOuvindo(false),
    });
  };

  return (
    <div className="flex flex-col gap-2">
      {dica && <DicaDitado aoFechar={() => setDica(false)} />}
      <form
        className="flex items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          enviar();
        }}
      >
        <div className="flex-1 min-w-0 flex items-end rounded-[22px] bg-surface border border-line focus-within:border-accent transition-colors">
          <label htmlFor={id} className="sr-only">
            {placeholder}
          </label>
          <textarea
            id={id}
            ref={campo}
            rows={1}
            value={valor}
            onChange={(e) => aoMudar(umaLinha ? e.target.value.replace(/\n/g, ' ') : e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                enviar();
              }
            }}
            placeholder={ouvindo ? 'Ouvindo… pode falar' : placeholder}
            autoCapitalize="sentences"
            autoCorrect="off"
            spellCheck={false}
            lang="en"
            className="flex-1 min-w-0 resize-none bg-transparent pl-4 py-[11px] text-[15px] leading-[22px] outline-none placeholder:text-muted"
          />
          <button
            type="button"
            onClick={clicarMic}
            aria-label={ouvindo ? 'Parar de ouvir' : 'Falar com o microfone'}
            aria-pressed={ouvindo}
            className={cx(
              'relative isolate btn-icone m-1 w-9 h-9',
              ouvindo ? 'bg-bad text-bg pulso' : 'text-accent hover:bg-accent-soft',
            )}
          >
            <Icone nome="mic" tamanho={19} />
          </button>
        </div>
        <button
          type="submit"
          className="btn-icone w-11 h-11 bg-accent text-accent-fg disabled:opacity-40"
          disabled={!valor.trim() || desabilitado}
          aria-label="Enviar"
        >
          <Icone nome="enviar" tamanho={19} />
        </button>
      </form>
    </div>
  );
}

function DicaDitado({ aoFechar }: { aoFechar(): void }) {
  const p = plataforma();
  const dicas = {
    windows: { titulo: 'No Windows', texto: 'Clique no campo e aperte Windows + H. Fale em inglês e o texto aparece sozinho.' },
    celular: { titulo: 'No celular', texto: 'Toque no campo e use o microfone do teclado. Deixe o teclado em inglês para o ditado entender.' },
    mac: { titulo: 'No Mac', texto: 'Clique no campo e aperte a tecla Fn (globo) duas vezes para ditar.' },
    outro: { titulo: 'No seu aparelho', texto: 'Use o ditado por voz do sistema: ele escreve no campo o que você falar.' },
  };
  const principal = dicas[p];
  const outras = (['windows', 'celular', 'mac'] as const).filter((k) => k !== p);
  return (
    <div className="anima-subir rounded-2xl bg-sun-soft p-3 text-[14px] leading-snug flex gap-3">
      <span className="grid place-items-center w-9 h-9 rounded-xl bg-sun text-sun-fg flex-none">
        <Icone nome="teclado" tamanho={18} />
      </span>
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <p className="font-semibold">Fale usando o ditado do aparelho</p>
        <p>
          {emMoldura
            ? 'Dentro do link publicado, o navegador não libera o microfone direto para o app. '
            : 'Seu navegador não deu acesso ao microfone. '}
          <strong>{principal.titulo}:</strong> {principal.texto}
        </p>
        <p className="text-[12px] text-muted">
          {outras.map((k) => `${dicas[k].titulo}: ${dicas[k].texto}`).join(' ')}
        </p>
      </div>
      <button type="button" onClick={aoFechar} className="btn-icone w-8 h-8 hover:bg-sun/40" aria-label="Fechar dica">
        <Icone nome="x" tamanho={16} />
      </button>
    </div>
  );
}
