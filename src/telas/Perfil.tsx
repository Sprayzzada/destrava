import { useState } from 'react';
import { useCamadas } from '../componentes/camadas';
import { Icone } from '../componentes/Icone';
import { Cabecalho, Secao, Segmentado, Selo } from '../componentes/ui';
import { useEstadoIA } from '../lib/ia';
import { useLoja } from '../lib/loja';
import { useNav } from '../lib/nav';
import { cx } from '../lib/texto';
import { INTERESSES, type Minutos, type Nivel } from '../lib/tipos';
import { emMoldura, micPossivel, ttsDisponivel, useVozes } from '../lib/voz';

export function Perfil() {
  const { estado, acoes } = useLoja();
  const nav = useNav();
  const cam = useCamadas();
  const ia = useEstadoIA();
  const vozes = useVozes();
  const [confirmar, setConfirmar] = useState(false);
  const { perfil, config } = estado;

  return (
    <div className="flex flex-col">
      <Cabecalho voltar titulo="Seu perfil" semDores />
      <div className="gutter flex flex-col gap-7 pt-5 pb-10">
        <label className="flex flex-col gap-1.5 text-[14px] font-semibold" htmlFor="perfil-nome">
          Nome
          <input
            id="perfil-nome"
            value={perfil.nome}
            onChange={(e) => acoes.atualizarPerfil({ nome: e.target.value })}
            placeholder="Como podemos te chamar?"
            className="h-11 rounded-xl bg-surface border border-line px-3 text-[15px] font-normal outline-none focus:border-accent"
          />
        </label>

        <Secao titulo="Nível">
          <Segmentado
            rotulo="Nível"
            opcoes={(['A2', 'B1', 'B2'] as const).map((n) => ({ id: n, nome: n }))}
            valor={perfil.nivel}
            aoMudar={(n) => acoes.atualizarPerfil({ nivel: n as Nivel })}
          />
        </Secao>

        <Secao titulo="Tempo por dia" sub="Define o tamanho do plano e o limite de revisões.">
          <Segmentado
            rotulo="Tempo por dia"
            opcoes={([10, 20, 30] as const).map((m) => ({ id: String(m), nome: `${m} min` }))}
            valor={String(perfil.minutos)}
            aoMudar={(m) => acoes.atualizarPerfil({ minutos: Number(m) as Minutos })}
          />
        </Secao>

        <Secao titulo="Interesses">
          <div className="flex flex-wrap gap-2">
            {INTERESSES.map((i) => {
              const ativo = perfil.interesses.includes(i.id);
              return (
                <button
                  key={i.id}
                  type="button"
                  aria-pressed={ativo}
                  onClick={() =>
                    acoes.atualizarPerfil({
                      interesses: ativo ? perfil.interesses.filter((x) => x !== i.id) : [...perfil.interesses, i.id],
                    })
                  }
                  className={cx(
                    'h-9 px-3.5 rounded-full border text-[13px] font-semibold',
                    ativo ? 'bg-accent text-accent-fg border-accent' : 'bg-surface border-line',
                  )}
                >
                  {i.nome}
                </button>
              );
            })}
          </div>
        </Secao>

        <Secao titulo="Voz e conversa">
          <div className="cartao divide-y divide-line">
            <Alternar
              id="falar-respostas"
              titulo="Ler as respostas da IA em voz alta"
              ligado={config.falarRespostas}
              aoMudar={(v) => acoes.setConfig({ falarRespostas: v })}
            />
            <div className="p-3 flex flex-col gap-2">
              <p className="font-semibold text-[15px]">Velocidade da voz</p>
              <Segmentado
                rotulo="Velocidade da voz"
                pequeno
                opcoes={[
                  { id: '0.8', nome: 'Devagar' },
                  { id: '1', nome: 'Normal' },
                  { id: '1.15', nome: 'Rápida' },
                ]}
                valor={String(config.velocidade)}
                aoMudar={(v) => acoes.setConfig({ velocidade: Number(v) })}
              />
            </div>
          </div>
        </Secao>

        <Secao titulo="Apresentação">
          <div className="cartao">
            <Alternar
              id="apresentacao"
              titulo="Mostrar as dores do Define em cada tela"
              sub="No computador, aparece o painel à esquerda. No celular, o botão “Dor” no topo."
              ligado={config.apresentacao}
              aoMudar={(v) => acoes.setConfig({ apresentacao: v })}
            />
          </div>
          <button type="button" className="btn btn-linha self-start" onClick={() => nav.ir({ tela: 'mapa' })}>
            <Icone nome="mapa" tamanho={16} /> Ver as 7 dores
          </button>
        </Secao>

        <Secao titulo="O que funciona aqui">
          <ul className="cartao divide-y divide-line text-[14px]">
            <Status ok={ia === 'ligada'} nome="IA de verdade" texto={ia === 'ligada' ? 'Ligada (usa a sua conta Claude; pede permissão no primeiro uso).' : 'Fora do link do Claude: o app usa respostas prontas para demonstrar.'} />
            <Status ok={ttsDisponivel && vozes.length > 0} nome="Voz em inglês" texto={vozes.length ? `${vozes.length} vozes instaladas neste aparelho.` : 'Nenhuma voz em inglês encontrada.'} />
            <Status
              ok={micPossivel()}
              nome="Microfone direto"
              texto={micPossivel() ? 'Disponível neste navegador.' : emMoldura ? 'Bloqueado dentro do link. Use o ditado do teclado (Windows + H ou o microfone do celular).' : 'Indisponível neste navegador. Use o ditado do teclado.'}
            />
            <Status ok nome="Seu progresso" texto="Fica salvo só neste navegador." />
          </ul>
        </Secao>

        <Secao titulo="Recomeçar">
          <div className="flex flex-col gap-2">
            <button type="button" className="btn btn-linha" onClick={() => acoes.atualizarPerfil({ pronto: false })}>
              Refazer as perguntas do início
            </button>
            {confirmar ? (
              <div className="rounded-2xl bg-bad-soft p-3 flex flex-col gap-2">
                <p className="text-[14px]">Apagar progresso, cards criados e perfil deste navegador? Não dá para desfazer.</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn btn-sm bg-bad text-bg"
                    onClick={() => {
                      acoes.resetar();
                      nav.trocarAba('hoje');
                      cam.avisar('Progresso apagado.');
                    }}
                  >
                    Apagar tudo
                  </button>
                  <button type="button" className="btn btn-sm btn-suave" onClick={() => setConfirmar(false)}>
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button type="button" className="btn btn-linha text-bad" onClick={() => setConfirmar(true)}>
                Apagar meu progresso
              </button>
            )}
          </div>
        </Secao>

        <p className="text-[12px] text-muted text-center">
          Destrava · protótipo da fase Develop. Conteúdo original de exemplo. <Selo>v0.1</Selo>
        </p>
      </div>
    </div>
  );
}

function Alternar({ id, titulo, sub, ligado, aoMudar }: { id: string; titulo: string; sub?: string; ligado: boolean; aoMudar(v: boolean): void }) {
  return (
    <label htmlFor={id} className="flex items-center gap-3 p-3 cursor-pointer">
      <span className="flex-1">
        <span className="block font-semibold text-[15px]">{titulo}</span>
        {sub && <span className="block text-[13px] text-muted">{sub}</span>}
      </span>
      <input id={id} type="checkbox" role="switch" checked={ligado} onChange={(e) => aoMudar(e.target.checked)} className="peer sr-only" />
      <span
        aria-hidden="true"
        className={cx('relative w-11 h-6 rounded-full transition-colors flex-none peer-focus-visible:ring-2 peer-focus-visible:ring-accent', ligado ? 'bg-accent' : 'bg-line')}
      >
        <span className={cx('absolute top-0.5 w-5 h-5 rounded-full bg-surface shadow transition-all', ligado ? 'left-[22px]' : 'left-0.5')} />
      </span>
    </label>
  );
}

function Status({ ok, nome, texto }: { ok: boolean; nome: string; texto: string }) {
  return (
    <li className="flex items-start gap-3 p-3">
      <span className={cx('grid place-items-center w-6 h-6 rounded-full flex-none mt-0.5', ok ? 'bg-ok-soft text-ok' : 'bg-surface-2 text-muted')}>
        <Icone nome={ok ? 'check' : 'x'} tamanho={14} strokeWidth={3} />
      </span>
      <span>
        <span className="block font-semibold">{nome}</span>
        <span className="block text-muted leading-snug">{texto}</span>
      </span>
    </li>
  );
}
