// Instruções enviadas para a IA. Cada chamada é independente: tudo que ela precisa vai aqui.
import type { Nivel, Interesse } from './tipos';
import { NOME_INTERESSE } from './tipos';

export interface RespostaConversa {
  resposta: string;
  traducao: string;
  feedback: { status: 'ok' | 'ajuste'; melhor?: string; porque?: string };
  sugestoes: string[];
}

export function instrucoesConversa(o: {
  papel: string;
  contexto: string;
  nivel: Nivel;
  interesses: Interesse[];
}): string {
  const interesses = o.interesses.map((i) => NOME_INTERESSE[i]).join(', ') || 'variados';
  return `You are the conversation partner inside "Destrava", an app for Brazilian adults who understand English but freeze when they have to speak.

Role-play: ${o.papel}
Situation: ${o.contexto}
Learner level: ${o.nivel} (CEFR). Learner interests (in Portuguese): ${interesses}.

How to reply:
- Stay in character and sound like natural spoken English. 1 to 3 short sentences, with vocabulary that fits ${o.nivel}.
- Keep the conversation moving: end with a question or a clear prompt for the learner.
- Be warm and patient. The learner may freeze, mix in Portuguese, or write like dictated speech (lowercase, no punctuation). Never lecture inside your reply.
- After about 6 learner turns, wrap up the scene naturally.

Feedback is ONLY about the learner's last message:
- "ok" when a native speaker would find it natural enough. Ignore capitalization, punctuation and small dictation slips.
- "ajuste" when something sounds wrong or unnatural. Then "melhor" is how a native speaker would say it, keeping the learner's meaning, and "porque" is one or two short sentences in Brazilian Portuguese explaining the difference. If the mistake comes from Portuguese (false friends, "have" for age, word order), say so.
- If the learner wrote in Portuguese, "melhor" is the English version and "porque" encourages them, in Portuguese.

Also write "sugestoes": 3 short things the learner could say next, at level ${o.nivel}; and "traducao": your reply in Brazilian Portuguese.

Reply with only this JSON object:
{"resposta": "...", "traducao": "...", "feedback": {"status": "ok", "melhor": "", "porque": ""}, "sugestoes": ["...", "...", "..."]}`;
}

export interface OpcaoTravei {
  en: string;
  rotulo: string;
  nota?: string;
}

export function promptTravei(o: { nivel: Nivel; contexto: string; ultimaFala: string; textoPt: string }): string {
  return `A Brazilian learner of English (level ${o.nivel}) is in this situation: ${o.contexto}
The other person just said: "${o.ultimaFala}"
The learner froze and wrote in Portuguese what they want to say: "${o.textoPt}"

Give 3 ways to say it in English, from the simplest to the most natural. Each one short and easy to say out loud.
Reply with only JSON: {"opcoes": [{"en": "...", "rotulo": "Simples", "nota": "dica curta em português, opcional"}, {"en": "...", "rotulo": "Natural", "nota": ""}, {"en": "...", "rotulo": "Mais nativo", "nota": ""}]}`;
}

export function promptExplicar(o: { nivel: Nivel; frase: string; foco?: string; pergunta?: string }): string {
  const foco = o.foco ? ` com atenção especial para "${o.foco}"` : '';
  const pergunta = o.pergunta ? `\nA pessoa perguntou: "${o.pergunta}". Responda a essa dúvida.` : '';
  return `Explique para um brasileiro aprendendo inglês (nível ${o.nivel}) a frase em inglês: "${o.frase}"${foco}.${pergunta}
Responda em português do Brasil, curto e direto, em três partes com estes títulos em negrito:
**O que significa** (tradução natural)
**Por que é assim** (a regra ou o costume por trás, sem jargão desnecessário; se houver armadilha comum para brasileiros, diga)
**Outro exemplo** (uma frase nova parecida em inglês, com tradução)
No máximo 120 palavras. Use só **negrito** e quebras de linha, sem outros formatos.`;
}

export interface TraducaoPalavra {
  traducao: string;
  nota?: string;
}

export function promptPalavra(palavra: string, frase: string): string {
  return `Traduza a palavra "${palavra}" como ela é usada nesta frase em inglês: "${frase}"
Responda só JSON: {"traducao": "tradução curta em português do Brasil", "nota": "observação curta e útil (gíria, falso cognato, pronúncia), ou vazio"}`;
}

export interface TextoAdaptado {
  texto: string;
  glossario: { en: string; pt: string }[];
}

export function promptAdaptar(nivel: Nivel, texto: string): string {
  return `Reescreva o texto abaixo em inglês claro para o nível ${nivel} (CEFR), mantendo o sentido e os fatos. Até 180 palavras.
Depois escolha até 8 palavras do texto adaptado que valem a pena aprender e traduza para o português do Brasil. Use palavras únicas (uma palavra cada), exatamente como aparecem no texto.
Responda só JSON: {"texto": "...", "glossario": [{"en": "...", "pt": "..."}]}

Texto:
"""
${texto.slice(0, 4000)}
"""`;
}

export interface CardIA {
  frente: string;
  verso: string;
  exemplo: string;
}

export function promptCard(nivel: Nivel, termo: string): string {
  return `Crie um flashcard para um brasileiro (nível ${nivel}) aprendendo a palavra ou expressão em inglês "${termo}".
Responda só JSON: {"frente": "a expressão em inglês", "verso": "tradução natural em português do Brasil", "exemplo": "uma frase natural em inglês usando a expressão"}`;
}
