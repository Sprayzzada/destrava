# Destrava

Protótipo da fase **Develop** (Double Diamond) de um app de inglês para brasileiros que **entendem, mas travam na hora de falar**. Cada tela responde a uma das 7 dores levantadas no Define.

| Dor | Onde o app responde |
|---|---|
| 1. Entendo, mas não consigo falar | Aba **Falar**: conversa com IA sem plateia, 3 níveis de apoio, botão **Travei** (português → 3 jeitos de dizer em inglês) e correção explicada em português |
| 2. Flashcards cansam | Aba **Revisar**: limite diário, fila espalhada quando você some, cards criados com um toque numa palavra |
| 3. Não sei quais ferramentas usar | Aba **Hoje**: plano do dia que junta ouvido, revisão, fala e pronúncia; progresso em minutos falando; botão "Por que é assim?" em qualquer frase |
| 4. Não entendo o inglês real | **Feed › Treino de ouvido**: fala rápida (gonna, wanna), ditado em velocidade normal, sotaques |
| 5. Pronúncia sem direção | **Falar › Pronúncia**: os 7 sons que mais entregam o brasileiro, com diagnóstico e pedido de avaliação humana |
| 6. Sem comunidade | Aba **Galera** (de exemplo): parceiros, salas pequenas, escada de exposição para introvertidos |
| 7. Conteúdo de verdade | Aba **Feed**: vídeos curtos com legenda tocável, leituras em 3 níveis, séries, livros curtos |

## Rodar

```bash
npm install
npm run dev
```

## O que funciona onde

- **IA de verdade** só funciona no link publicado no Claude (usa a conta Claude de quem abre). Aqui (bolt.new, StackBlitz ou no computador) o app roda em **modo demonstração**: respostas prontas por cenário e correções por regras dos erros clássicos de brasileiros (`src/lib/erros-br.ts`).
- **Voz**: usa as vozes instaladas no navegador. Chrome e Edge têm vozes em inglês; se o aparelho só tiver vozes em português, o app avisa.
- **Microfone**: funciona no Chrome e no Edge. Numa pré-visualização em moldura, abra o app numa aba própria. Sem microfone, dá para falar pelo ditado do teclado (Windows + H, ou o microfone do teclado do celular).
- **Progresso** fica salvo só no navegador (localStorage).
- Comunidade, pessoas e vídeos são **conteúdo de exemplo**, escrito para o protótipo.

## Estrutura

- `src/telas/`: uma tela por arquivo (Hoje, Falar, Conversa, Unidade de pronúncia, Feed, Ouvido, Reels, Leitura, Revisar, Galera, Mapa das dores, Perfil)
- `src/data/`: conteúdo (dores, cenários de conversa, sons, feed, cards iniciais, comunidade)
- `src/lib/`: IA (`ia.ts`, `prompts.ts`), voz e microfone (`voz.ts`), revisão espaçada (`srs.ts`), estado salvo (`loja.tsx`), navegação (`nav.tsx`)
- `scripts/gerar-artifact.mjs`: junta tudo num HTML só para publicar como link do Claude (`npm run publicar`)

Feito com Vite, React, TypeScript e Tailwind CSS.
