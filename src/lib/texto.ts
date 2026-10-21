export interface Pedaco {
  t: string;
  palavra: boolean;
  ini: number;
  fim: number;
}

const RE_PALAVRA = /[A-Za-zÀ-ÿ0-9]+(?:['’-][A-Za-zÀ-ÿ0-9]+)*/g;

/** Quebra o texto em palavras (tocáveis) e o resto (espaços e pontuação). */
export function pedacos(texto: string): Pedaco[] {
  const lista: Pedaco[] = [];
  let ultimo = 0;
  for (const m of texto.matchAll(RE_PALAVRA)) {
    const ini = m.index ?? 0;
    if (ini > ultimo) lista.push({ t: texto.slice(ultimo, ini), palavra: false, ini: ultimo, fim: ini });
    lista.push({ t: m[0], palavra: true, ini, fim: ini + m[0].length });
    ultimo = ini + m[0].length;
  }
  if (ultimo < texto.length) lista.push({ t: texto.slice(ultimo), palavra: false, ini: ultimo, fim: texto.length });
  return lista;
}

export function chave(palavra: string): string {
  return palavra.toLowerCase().replace(/’/g, "'");
}

/** Procura a palavra no glossário, tentando também sem "'s" e sem plural simples. */
export function buscarGlossario(glossario: Record<string, string> | undefined, palavra: string): string | undefined {
  if (!glossario) return undefined;
  const k = chave(palavra);
  return (
    glossario[k] ??
    glossario[k.replace(/'s$/, '')] ??
    glossario[k.replace(/s$/, '')] ??
    glossario[k.replace(/(ed|ing)$/, '')]
  );
}

/** Divide um parágrafo em frases, mantendo a pontuação. */
export function frases(paragrafo: string): string[] {
  return (paragrafo.match(/[^.!?]+[.!?]+["'”’)]*\s*|[^.!?]+$/g) ?? [paragrafo]).map((f) => f);
}

const EXPANSOES: Record<string, string> = {
  gonna: 'going to',
  wanna: 'want to',
  gotta: 'got to',
  hafta: 'have to',
  lemme: 'let me',
  gimme: 'give me',
  kinda: 'kind of',
  sorta: 'sort of',
  dunno: 'do not know',
  whatcha: 'what are you',
  didja: 'did you',
  ya: 'you',
  "y'know": 'you know',
  "'cause": 'because',
  cause: 'because',
  cuz: 'because',
  outta: 'out of',
  lotta: 'lot of',
  "i'm": 'i am',
  im: 'i am',
  ive: 'i have',
  dont: 'do not',
  doesnt: 'does not',
  didnt: 'did not',
  cant: 'can not',
  wont: 'will not',
  isnt: 'is not',
  arent: 'are not',
  youre: 'you are',
  theyre: 'they are',
  thats: 'that is',
  whats: 'what is',
  "you're": 'you are',
  "we're": 'we are',
  "they're": 'they are',
  "it's": 'it is',
  "that's": 'that is',
  "what's": 'what is',
  "there's": 'there is',
  "don't": 'do not',
  "doesn't": 'does not',
  "didn't": 'did not',
  "can't": 'can not',
  cannot: 'can not',
  "won't": 'will not',
  "isn't": 'is not',
  "aren't": 'are not',
  "i'll": 'i will',
  "you'll": 'you will',
  "we'll": 'we will',
  "i've": 'i have',
  "you've": 'you have',
  "i'd": 'i would',
  "you'd": 'you would',
  "let's": 'let us',
  "that'd": 'that would',
  ok: 'okay',
  '1': 'one',
  '2': 'two',
  '3': 'three',
  '4': 'four',
  '5': 'five',
  '6': 'six',
  '7': 'seven',
  '8': 'eight',
  '9': 'nine',
  '10': 'ten',
};

/** Normaliza fala/texto para comparar: minúsculas, sem pontuação, contrações abertas. */
export function normalizarFala(texto: string): string[] {
  const palavras = texto
    .toLowerCase()
    .replace(/[’`]/g, "'")
    .match(/[a-z0-9]+(?:'[a-z]+)?|'cause/g);
  if (!palavras) return [];
  return palavras.flatMap((p) => (EXPANSOES[p] ?? p).split(' '));
}

/** Compara palavra a palavra (maior subsequência comum) e marca o que faltou no alvo. */
export function compararPalavras(alvo: string, dito: string): { palavra: string; ok: boolean }[] {
  const a = normalizarFala(alvo);
  const b = normalizarFala(dito);
  const tab: number[][] = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      tab[i][j] = a[i] === b[j] ? tab[i + 1][j + 1] + 1 : Math.max(tab[i + 1][j], tab[i][j + 1]);
    }
  }
  const resultado: { palavra: string; ok: boolean }[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length) {
    if (j < b.length && a[i] === b[j]) {
      resultado.push({ palavra: a[i], ok: true });
      i++;
      j++;
    } else if (j < b.length && tab[i][j + 1] >= tab[i + 1][j]) {
      j++;
    } else {
      resultado.push({ palavra: a[i], ok: false });
      i++;
    }
  }
  return resultado;
}

export function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function idNovo(): string {
  return Math.random().toString(36).slice(2, 10);
}
