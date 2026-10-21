import { BotaoOuvir } from '../componentes/BotaoOuvir';
import { useCamadas } from '../componentes/camadas';
import { Icone } from '../componentes/Icone';
import { Cabecalho, Secao, Selo } from '../componentes/ui';
import { AVALIACOES, DEGRAUS, DESAFIO, DUVIDAS, PESSOAS, SALAS } from '../data/comunidade';
import { useLoja } from '../lib/loja';
import { useNav } from '../lib/nav';
import { cx } from '../lib/texto';
import { NOME_INTERESSE } from '../lib/tipos';

export function Galera() {
  const { estado, acoes } = useLoja();
  const nav = useNav();
  const cam = useCamadas();
  const { perfil, config } = estado;
  const degrau = DEGRAUS.find((d) => d.n === config.degrau) ?? DEGRAUS[0];

  const pessoas = [...PESSOAS].sort(
    (a, b) => b.interesses.filter((i) => perfil.interesses.includes(i)).length - a.interesses.filter((i) => perfil.interesses.includes(i)).length,
  );

  return (
    <div className="flex flex-col">
      <Cabecalho titulo="Galera" sub="Prática com gente, no seu ritmo" />
      <div className="flex flex-col gap-8 pt-5 pb-10">
        <div className="gutter">
          <p className="rounded-2xl border border-dashed border-line p-3 text-[13px] text-muted">
            <strong className="text-fg">Comunidade de exemplo.</strong> No protótipo, as pessoas e conversas são fictícias, para mostrar
            como funcionaria.
          </p>
        </div>

        <div className="gutter">
          <Secao titulo="Seu ritmo, sem pressão" sub="Para quem é introvertido: comece sem plateia e suba um degrau quando quiser.">
            <div className="cartao p-4 flex flex-col gap-4">
              <div className="flex items-end gap-1.5 h-32" role="radiogroup" aria-label="Degraus de exposição">
                {DEGRAUS.map((d) => {
                  const atual = d.n === config.degrau;
                  return (
                    <button
                      key={d.n}
                      type="button"
                      role="radio"
                      aria-checked={atual}
                      aria-label={`Degrau ${d.n}: ${d.nome}`}
                      onClick={() => acoes.setConfig({ degrau: d.n })}
                      className={cx(
                        'flex-1 rounded-t-xl rounded-b-md flex items-start justify-center pt-2 font-display font-extrabold text-[16px] transition-colors',
                        atual ? 'bg-accent text-accent-fg' : d.n < config.degrau ? 'bg-accent-soft text-accent' : 'bg-surface-2 text-muted hover:bg-line',
                      )}
                      style={{ height: `${28 + d.n * 18}%` }}
                    >
                      {d.n}
                    </button>
                  );
                })}
              </div>
              <div>
                <p className="font-semibold">
                  Degrau {degrau.n}: {degrau.nome}
                </p>
                <p className="text-[14px] text-muted">{degrau.explica}</p>
              </div>
              {config.degrau === 1 ? (
                <button type="button" className="btn btn-primario self-start" onClick={() => nav.ir({ tela: 'falar' })}>
                  <Icone nome="balao" tamanho={16} /> Treinar com a IA
                </button>
              ) : (
                <p className="text-[13px] text-muted">Toque em outro degrau para mudar. Você pode descer quando quiser.</p>
              )}
            </div>
          </Secao>
        </div>

        <section className="flex flex-col gap-3">
          <div className="gutter">
            <h2 className="font-display text-[18px] font-bold leading-tight">Parceiros que combinam com você</h2>
            <p className="text-[13px] text-muted mt-0.5">Por nível, interesses e jeito de praticar. Nativos que aprendem português topam trocar.</p>
          </div>
          <div className="trilho gutter pb-1">
            {pessoas.map((p) => {
              const comum = p.interesses.filter((i) => perfil.interesses.includes(i));
              return (
                <article key={p.id} className="w-[250px] cartao p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="grid place-items-center w-11 h-11 rounded-full font-display font-extrabold text-[18px] flex-none"
                      style={{ background: p.cor, color: p.id === 'lucas' || p.id === 'ellie' || p.id === 'bianca' || p.id === 'kenji' ? 'var(--reel-escuro)' : 'var(--reel-claro)' }}
                      aria-hidden="true"
                    >
                      {p.inicial}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold leading-tight">{p.nome}</p>
                      <p className="text-[12px] text-muted truncate">{p.lugar}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <Selo tom={p.nativo ? 'accent' : 'neutro'}>{p.nivel}</Selo>
                    {p.aprende?.startsWith('Português') && <Selo tom="sol">Troca de idiomas</Selo>}
                    <Selo>{p.jeito}</Selo>
                  </div>
                  <p className="text-[13px] leading-snug flex-1">{p.bio}</p>
                  {comum.length > 0 && (
                    <p className="text-[12px] text-ok font-semibold">Vocês curtem {comum.map((i) => NOME_INTERESSE[i].toLowerCase()).join(' e ')}</p>
                  )}
                  <button
                    type="button"
                    className="btn btn-sm btn-suave"
                    onClick={() => cam.avisar(`Exemplo: no app real, isso abriria um áudio para ${p.nome}, sem chamada ao vivo.`)}
                  >
                    <Icone nome="mic" tamanho={15} /> Mandar áudio
                  </button>
                </article>
              );
            })}
            <span className="w-1" aria-hidden="true" />
          </div>
        </section>

        <div className="gutter flex flex-col gap-8">
          <Secao titulo="Salas agora" sub="Pequenas e com tema. Na silenciosa você só ouve.">
            <ul className="cartao divide-y divide-line">
              {SALAS.map((s) => (
                <li key={s.id} className="flex items-center gap-3 p-3">
                  <span className="relative isolate w-2.5 h-2.5 rounded-full bg-ok pulso flex-none" aria-hidden="true" />
                  <span className="flex-1 min-w-0">
                    <span className="block font-semibold leading-tight">{s.nome}</span>
                    <span className="block text-[13px] text-muted leading-snug">{s.tema}</span>
                    <span className="block text-[12px] text-muted font-mono mt-0.5 num">
                      {s.nivel} · {s.vagas ? `${s.pessoas}/${s.vagas} pessoas` : `${s.pessoas} ouvindo`} · degrau {s.degrau}
                    </span>
                  </span>
                  <button
                    type="button"
                    className="btn btn-sm btn-linha"
                    onClick={() =>
                      cam.abrir(
                        <div className="flex flex-col gap-3">
                          <p className="text-[15px]">{s.tema}</p>
                          <div className="flex flex-wrap gap-1.5">
                            <Selo>{s.nivel}</Selo>
                            <Selo>{s.vagas ? `${s.pessoas} de ${s.vagas} vagas` : `${s.pessoas} pessoas ouvindo`}</Selo>
                          </div>
                          <p className="rounded-2xl bg-surface-2 p-3 text-[14px]">
                            Você entra com o microfone desligado. Fala só quando quiser, e pode sair a qualquer momento sem precisar
                            explicar.
                          </p>
                          <p className="text-[13px] text-muted">Exemplo: no protótipo, a sala é só demonstração.</p>
                          <button type="button" className="btn btn-primario" onClick={cam.fechar}>
                            Entendi
                          </button>
                        </div>,
                        s.nome,
                      )
                    }
                  >
                    Entrar
                  </button>
                </li>
              ))}
            </ul>
          </Secao>

          <Secao
            titulo="Avaliação de pronúncia"
            sub="Pedidos de quem quer um humano ouvindo, com resposta som por som."
            acao={
              <button type="button" className="btn btn-sm btn-primario" onClick={() => nav.ir({ tela: 'falar', seg: 'pronuncia' })}>
                Pedir
              </button>
            }
          >
            <div className="flex flex-col gap-3">
              {AVALIACOES.map((a) => (
                <article key={a.id} className="cartao p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <p className="flex-1 font-semibold leading-snug">“{a.pedido}”</p>
                  </div>
                  <p className="text-[12px] text-muted">
                    {a.autor} · {a.som}
                  </p>
                  {a.respostas.map((r) => (
                    <div key={r.quem} className="rounded-2xl bg-surface-2 p-3 flex flex-col gap-1.5">
                      <p className="text-[13px] font-semibold">
                        {r.quem} <span className="text-muted font-normal">· {r.nativo ? 'nativa/o' : 'aluno/a'}</span>
                      </p>
                      <p className="text-[14px] leading-snug" lang="en">
                        {r.en}
                      </p>
                      <p className="text-[13px] text-muted leading-snug">{r.pt}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(r.notas).map(([som, nota]) => (
                          <Selo key={som} tom={/ótimo|bom|perfeito/.test(nota) ? 'ok' : 'warn'}>
                            {som}: {nota}
                          </Selo>
                        ))}
                      </div>
                    </div>
                  ))}
                </article>
              ))}
            </div>
          </Secao>

          <Secao titulo="Dúvidas sobre frases" sub="A discussão da frase que outros apps tiraram. Aqui ela fica.">
            <div className="flex flex-col gap-3">
              {DUVIDAS.map((d) => (
                <article key={d.frase} className="cartao p-4 flex flex-col gap-2">
                  <div className="flex items-start gap-2">
                    <p className="flex-1 font-display text-[17px] font-bold leading-snug" lang="en">
                      {d.frase}
                    </p>
                    <BotaoOuvir id={`duvida:${d.frase}`} texto={d.frase} className="w-8 h-8" />
                  </div>
                  <p className="text-[14px] font-semibold">
                    {d.autor}: {d.pergunta}
                  </p>
                  <p className="text-[14px] leading-relaxed pl-3 border-l-2 border-accent">{d.resposta}</p>
                  <div className="flex items-center gap-2 text-[12px] text-muted">
                    <span className="flex-1">
                      {d.respondeu} respondeu · {d.votos} acharam útil
                    </span>
                    <button type="button" className="font-semibold text-accent text-[13px]" onClick={() => cam.explicar(d.frase)}>
                      Perguntar à IA
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </Secao>

          <div className="rounded-[24px] bg-sun p-5 text-sun-fg flex flex-col gap-2">
            <p className="text-[12px] font-mono uppercase tracking-wider opacity-80">Desafio da semana · exemplo</p>
            <p className="font-display text-[22px] font-extrabold leading-tight">{DESAFIO.titulo}</p>
            <p className="text-[14px]">
              {DESAFIO.participantes} pessoas já mandaram. Termina {DESAFIO.termina}. Só a comunidade ouve, e você escolhe quem pode comentar.
            </p>
            <button
              type="button"
              className="btn self-start mt-1 bg-sun-fg text-sun"
              onClick={() => cam.avisar('Exemplo: no app real, isso abriria o gravador do desafio.')}
            >
              <Icone nome="mic" tamanho={16} /> Participar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
