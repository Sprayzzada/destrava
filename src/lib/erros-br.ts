// Correções offline: erros clássicos de quem pensa em português e fala em inglês.
// Usado quando a IA não está disponível (modo demonstração).

export interface Feedback {
  status: 'ok' | 'ajuste';
  melhor?: string;
  porque?: string;
}

type Troca = string | ((trecho: string, ...grupos: string[]) => string);

interface Regra {
  padrao: RegExp;
  troca: Troca;
  porque: string;
}

const PASSADO: Record<string, string> = {
  go: 'went',
  eat: 'ate',
  see: 'saw',
  do: 'did',
  have: 'had',
  work: 'worked',
  watch: 'watched',
  play: 'played',
  buy: 'bought',
  meet: 'met',
};

const COMPARATIVO: Record<string, string> = {
  good: 'better',
  bad: 'worse',
  big: 'bigger',
  easy: 'easier',
  cheap: 'cheaper',
  fast: 'faster',
  small: 'smaller',
  hot: 'hotter',
};

const ESTADO: Record<string, string> = {
  hunger: 'hungry',
  thirst: 'thirsty',
  fear: 'scared',
  cold: 'cold',
  sleep: 'sleepy',
};

const REGRAS: Regra[] = [
  {
    padrao: /\bI have (\d+) years( old)?\b/gi,
    troca: "I'm $1",
    porque: "Idade em inglês usa o verbo 'to be': \"I'm 25\". Com 'have' soa como se você possuísse 25 anos.",
  },
  {
    padrao: /\bI(?: am|'m) agree\b/gi,
    troca: 'I agree',
    porque: "'Agree' já é verbo (concordar). Fica só \"I agree\", sem o 'am'.",
  },
  {
    padrao: /\bpeople is\b/gi,
    troca: 'people are',
    porque: "'People' é plural em inglês, então pede 'are'.",
  },
  {
    padrao: /\b(depends?|depending) of\b/gi,
    troca: '$1 on',
    porque: "A preposição de 'depend' é 'on': \"it depends on the day\".",
  },
  {
    padrao: /\bexplain me\b/gi,
    troca: 'explain to me',
    porque: "'Explain' pede 'to' antes da pessoa: \"explain to me\" ou \"explain it to me\".",
  },
  {
    padrao: /\bdiscuss about\b/gi,
    troca: 'discuss',
    porque: "'Discuss' já carrega o 'sobre': \"discuss the project\".",
  },
  {
    padrao: /\binformations\b/gi,
    troca: 'information',
    porque: "'Information' não tem plural em inglês.",
  },
  {
    padrao: /\badvices\b/gi,
    troca: 'advice',
    porque: "'Advice' não tem plural. Um conselho é \"a piece of advice\".",
  },
  {
    padrao: /\bsince (\d+|two|three|four|five|six|ten) (years|months|weeks|days)\b/gi,
    troca: 'for $1 $2',
    porque: "Para duração use 'for' (for 3 years). 'Since' marca o ponto de início (since 2021).",
  },
  {
    padrao: /\b(?:make|do) (?:a|one) question\b/gi,
    troca: 'ask a question',
    porque: "Em inglês, pergunta se faz com 'ask': \"ask a question\".",
  },
  {
    padrao: /\b(?:it )?(?:has|have) (a lot of|many) people\b/gi,
    troca: 'there are $1 people',
    porque: "Para o 'tem' de existir, use 'there is / there are': \"there are a lot of people\".",
  },
  {
    padrao: /\bI(?: am|'m) boring\b/gi,
    troca: "I'm bored",
    porque: "\"I'm boring\" quer dizer \"eu sou chato\". Entediado é 'bored'.",
  },
  {
    padrao: /\bassist(ed|ing)?( to)? (a|the|some|tv|movies?|films?|series|shows?)\b/gi,
    troca: (_t, fim, _to, alvo) => `watch${fim === 'ed' ? 'ed' : fim === 'ing' ? 'ing' : ''} ${alvo}`,
    porque: "Falso cognato: 'assist' é ajudar. Assistir filme ou série é 'watch'.",
  },
  {
    padrao: /\bI have (hunger|thirst|fear|cold|sleep)\b/gi,
    troca: (_t, s) => `I'm ${ESTADO[s.toLowerCase()] ?? s}`,
    porque: "Em inglês você 'está' com fome: \"I'm hungry\", e não 'I have hunger'.",
  },
  {
    padrao: /\bmore (good|bad|big|easy|cheap|fast|small|hot)\b/gi,
    troca: (_t, adj) => COMPARATIVO[adj.toLowerCase()] ?? `more ${adj}`,
    porque: "Adjetivos curtos fazem comparação com -er (cheaper), e 'good' vira 'better'.",
  },
  {
    padrao: /\b(he|she|it) don'?t\b/gi,
    troca: "$1 doesn't",
    porque: "Com he, she e it, a negação é 'doesn't'.",
  },
  {
    padrao: /\bI no (like|want|have|know|understand|speak|need)\b/gi,
    troca: "I don't $1",
    porque: "A negação em inglês precisa de 'don't': \"I don't like\".",
  },
  {
    padrao: /^\s*is (very|so|really|too|a|good|bad|nice|great|cool|hard|easy)\b/i,
    troca: "It's $1",
    porque: "Em inglês a frase precisa de sujeito: 'É muito bom' vira \"It's very good\".",
  },
  {
    padrao: /\byesterday (I|we|they|he|she) (go|eat|see|do|have|work|watch|play|buy|meet)\b/gi,
    troca: (_t, quem, verbo) => `yesterday ${quem} ${PASSADO[verbo.toLowerCase()] ?? verbo}`,
    porque: "Com 'yesterday' o verbo vai para o passado.",
  },
  {
    padrao: /\bactually I (work|live|study)\b/gi,
    troca: 'currently I $1',
    porque: "Falso cognato: 'actually' é 'na verdade'. Atualmente é 'currently' ou 'these days'.",
  },
  {
    padrao: /\bpretend to\b/gi,
    troca: 'plan to',
    porque: "Falso cognato: 'pretend' é fingir. Pretender (planejar) é 'plan to' ou 'intend to'.",
  },
  {
    padrao: /\bin the next week\b/gi,
    troca: 'next week',
    porque: "'Next week' já basta, sem 'in the'.",
  },
];

const PALAVRAS_PT = /\b(eu|você|voce|não|nao|é|que|para|com|uma|isso|está|estou|tenho|muito|porque|então|também)\b/i;

function maiuscula(t: string): string {
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export function verificarFrase(texto: string): Feedback {
  const limpo = texto.trim();
  if (!limpo) return { status: 'ok' };
  const palavrasPt = limpo.split(/\s+/).filter((p) => PALAVRAS_PT.test(p)).length;
  if (palavrasPt >= 2) {
    return {
      status: 'ajuste',
      porque:
        'Parece que saiu em português, e tudo bem. Toque em "Travei" para ver jeitos de dizer isso em inglês e tente de novo.',
    };
  }
  let melhor = limpo;
  const motivos: string[] = [];
  for (const regra of REGRAS) {
    if (melhor.search(regra.padrao) >= 0) {
      regra.padrao.lastIndex = 0;
      melhor = melhor.replace(regra.padrao, regra.troca as never);
      motivos.push(regra.porque);
    }
  }
  if (!motivos.length) return { status: 'ok' };
  return { status: 'ajuste', melhor: maiuscula(melhor), porque: motivos.join(' ') };
}
