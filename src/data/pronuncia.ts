// Os sons que mais entregam o sotaque brasileiro no inglês.

export interface PalavraAlvo {
  alvo: string;
  /** O que o reconhecimento costuma ouvir quando o som sai "abrasileirado". */
  confusoes: string[];
}

export interface Unidade {
  id: string;
  simbolo: string;
  titulo: string;
  resumo: string;
  comoFazer: string;
  palavras: PalavraAlvo[];
  pares: [string, string][];
  frase: string;
  diagnostico(alvo: string, ouvido: string): string;
}

export const UNIDADES: Unidade[] = [
  {
    id: 'th-surdo',
    simbolo: 'θ',
    titulo: 'O TH de "think"',
    resumo: 'Brasileiro costuma trocar por T, F ou S: "tink", "fink", "sink".',
    comoFazer:
      'Ponha a ponta da língua entre os dentes da frente e sopre o ar, sem vibrar a garganta. É quase um S com a língua para fora. Exagere no começo: com o tempo, a língua aparece menos.',
    palavras: [
      { alvo: 'think', confusoes: ['sink', 'tink', 'fink', 'thing', 'zinc'] },
      { alvo: 'three', confusoes: ['tree', 'free', 'sree'] },
      { alvo: 'thanks', confusoes: ['tanks', 'sanks', 'thinks'] },
      { alvo: 'mouth', confusoes: ['mouse', 'mount', 'mout'] },
      { alvo: 'thick', confusoes: ['sick', 'tick', 'fick'] },
    ],
    pares: [
      ['think', 'sink'],
      ['three', 'tree'],
      ['thank', 'tank'],
      ['mouth', 'mouse'],
      ['thick', 'sick'],
    ],
    frase: 'I think those three things are worth a thousand thanks.',
    diagnostico: (alvo, ouvido) => {
      const letra = /^s|se$|s$/.test(ouvido) ? 'S' : /^f/.test(ouvido) ? 'F' : 'T';
      return `Ouvimos "${ouvido}" no lugar de "${alvo}": o TH saiu como ${letra}. Ponha a língua entre os dentes e sopre, sem encostar a língua atrás dos dentes.`;
    },
  },
  {
    id: 'th-sonoro',
    simbolo: 'ð',
    titulo: 'O TH de "this"',
    resumo: 'Sai como D: "dis", "dey", "mudder".',
    comoFazer:
      'Mesma posição do TH de "think" (língua entre os dentes), mas agora a garganta vibra. Encoste a mão no pescoço: tem que sentir vibrar, como num D bem suave e comprido.',
    palavras: [
      { alvo: 'they', confusoes: ['day', 'dey', 'say'] },
      { alvo: 'then', confusoes: ['den', 'zen', 'ten'] },
      { alvo: 'those', confusoes: ['doze', 'dose', 'toes'] },
      { alvo: 'though', confusoes: ['dough', 'doe', 'so'] },
      { alvo: 'breathe', confusoes: ['breed', 'breeze', 'bleed'] },
    ],
    pares: [
      ['they', 'day'],
      ['then', 'den'],
      ['those', 'doze'],
      ['though', 'dough'],
      ['breathe', 'breed'],
    ],
    frase: 'This is the weather they mentioned the other day.',
    diagnostico: (alvo, ouvido) =>
      `Ouvimos "${ouvido}" no lugar de "${alvo}": o TH saiu como ${/^z/.test(ouvido) ? 'Z' : 'D'}. A língua precisa ficar entre os dentes enquanto a garganta vibra.`,
  },
  {
    id: 'i-curto',
    simbolo: 'ɪ / iː',
    titulo: '"Ship" e "sheep"',
    resumo: 'Em português só existe um I. Em inglês, o curto e o longo mudam a palavra.',
    comoFazer:
      'Para o curto (ship, sit, live), relaxe a boca: o som fica entre I e Ê, rapidinho. Para o longo (sheep, seat, leave), estique os lábios como num sorriso e segure o som um pouco mais.',
    palavras: [
      { alvo: 'ship', confusoes: ['sheep', 'cheap'] },
      { alvo: 'sheep', confusoes: ['ship', 'chip'] },
      { alvo: 'live', confusoes: ['leave', 'lift'] },
      { alvo: 'leave', confusoes: ['live', 'lift'] },
      { alvo: 'sit', confusoes: ['seat', 'set'] },
    ],
    pares: [
      ['ship', 'sheep'],
      ['sit', 'seat'],
      ['live', 'leave'],
      ['fill', 'feel'],
      ['chip', 'cheap'],
    ],
    frase: 'Please sit in this seat and fill in the form.',
    diagnostico: (alvo, ouvido) => {
      const alvoLongo = /ee|ea/.test(alvo);
      return alvoLongo
        ? `Ouvimos "${ouvido}" no lugar de "${alvo}": o I saiu curto demais. Estique os lábios num sorriso e segure o som: "${alvo.replace(/ee|ea/, 'iii')}".`
        : `Ouvimos "${ouvido}" no lugar de "${alvo}": o I saiu longo e tenso demais. Relaxe a boca e fale rápido, quase um Ê.`;
    },
  },
  {
    id: 'r-inicial',
    simbolo: 'ɹ',
    titulo: 'O R de "red"',
    resumo: 'No começo da palavra, o R brasileiro sai como H: "red" vira "head".',
    comoFazer:
      'A língua não encosta em nada. Curve a ponta um pouco para trás, arredonde os lábios e solte um som contínuo, parecido com o R caipira de "porta".',
    palavras: [
      { alvo: 'red', confusoes: ['head', 'hed', 'wed'] },
      { alvo: 'right', confusoes: ['height', 'white', 'hide'] },
      { alvo: 'rope', confusoes: ['hope', 'hop'] },
      { alvo: 'rat', confusoes: ['hat', 'that'] },
      { alvo: 'road', confusoes: ['hold', 'load', 'who'] },
    ],
    pares: [
      ['red', 'head'],
      ['rat', 'hat'],
      ['rope', 'hope'],
      ['rot', 'hot'],
      ['rail', 'hail'],
    ],
    frase: 'Rachel ran right around the red road.',
    diagnostico: (alvo, ouvido) =>
      /^h|^wh/.test(ouvido)
        ? `Ouvimos "${ouvido}" no lugar de "${alvo}": o R saiu como o H de "rato". Não use a garganta: curve a ponta da língua para trás sem encostar.`
        : `Ouvimos "${ouvido}" no lugar de "${alvo}". Comece pelo R com os lábios arredondados, como se fosse dizer "u".`,
  },
  {
    id: 'vogal-extra',
    simbolo: '+i',
    titulo: 'Sem "i" no final',
    resumo: 'A gente põe um I escondido no fim: "bigui", "stopi", "Facebooki".',
    comoFazer:
      'Termine a palavra na consoante e pare. Para "big", feche no G e segure. Pode soltar o ar bem de leve, mas sem nenhuma vogal depois.',
    palavras: [
      { alvo: 'big', confusoes: ['biggie', 'bigi', 'big e'] },
      { alvo: 'dog', confusoes: ['doggy', 'doggie', 'dog e'] },
      { alvo: 'good', confusoes: ['goody', 'goodie', 'good e'] },
      { alvo: 'stop', confusoes: ['stoppy', 'stop e', 'stopping'] },
      { alvo: 'like', confusoes: ['likey', 'lucky', 'like e'] },
    ],
    pares: [
      ['dog', 'doggy'],
      ['big', 'biggie'],
      ['good', 'goody'],
      ['pick', 'picky'],
      ['stuff', 'stuffy'],
    ],
    frase: 'Stop that big dog and grab a good book.',
    diagnostico: (alvo, ouvido) =>
      `Ouvimos "${ouvido}" no lugar de "${alvo}": apareceu uma vogal depois da última consoante. Termine em "${alvo.slice(-1).toUpperCase()}" e pare ali.`,
  },
  {
    id: 'ed',
    simbolo: '-ed',
    titulo: 'O -ED do passado',
    resumo: 'O -ED quase nunca é "é-di". "Worked" tem uma sílaba só: "workt".',
    comoFazer:
      'São três sons. Depois de K, P, S, SH, CH e F vira T: worked, stopped, watched. Depois de som vozeado vira D: played, called, loved. Só depois de T ou D vira "id": wanted, needed.',
    palavras: [
      { alvo: 'worked', confusoes: ['work it', 'worker', 'work ed', 'work'] },
      { alvo: 'watched', confusoes: ['watch it', 'watch', 'watch ed'] },
      { alvo: 'played', confusoes: ['play it', 'play', 'player'] },
      { alvo: 'called', confusoes: ['call it', 'call', 'cold'] },
      { alvo: 'stopped', confusoes: ['stop it', 'stop', 'stopping'] },
    ],
    pares: [
      ['watched', 'watch it'],
      ['walked', 'walk it'],
      ['stopped', 'stop it'],
      ['called', 'call it'],
      ['kissed', 'kiss it'],
    ],
    frase: 'I worked all day, watched a movie and called my mom.',
    diagnostico: (alvo, ouvido) =>
      / it$| ed$|er$/.test(ouvido)
        ? `Ouvimos "${ouvido}" no lugar de "${alvo}": o -ED virou uma sílaba a mais. "${alvo}" tem uma sílaba só; termine com um ${/(k|p|s|sh|ch|f)ed$/.test(alvo) ? 'T' : 'D'} curto.`
        : `Ouvimos "${ouvido}" no lugar de "${alvo}": o final sumiu. Feche a palavra com um ${/(k|p|s|sh|ch|f)ed$/.test(alvo) ? 'T' : 'D'} bem curto.`,
  },
  {
    id: 'l-final',
    simbolo: 'ɫ',
    titulo: 'O L no final',
    resumo: 'No Brasil o L final vira U: "Brasil" soa "Brasiu", "hotel" soa "hoteu".',
    comoFazer:
      'Encoste a ponta da língua atrás dos dentes de cima e deixe ela lá no final da palavra. O som fica "escuro", meio "ol", e a língua precisa tocar no céu da boca.',
    palavras: [
      { alvo: 'feel', confusoes: ['fee', 'few', 'fear'] },
      { alvo: 'mile', confusoes: ['my', 'mine', 'mild'] },
      { alvo: 'school', confusoes: ['scoo', 'skew', 'cool'] },
      { alvo: 'well', confusoes: ['wow', 'we', 'where'] },
      { alvo: 'hotel', confusoes: ['hotels', 'hot', 'hotter'] },
    ],
    pares: [
      ['feel', 'fee'],
      ['mile', 'my'],
      ['bowl', 'bow'],
      ['tile', 'tie'],
      ['seal', 'see'],
    ],
    frase: 'People feel well at this small hotel near the school.',
    diagnostico: (alvo, ouvido) =>
      `Ouvimos "${ouvido}" no lugar de "${alvo}": o L do final sumiu ou virou U. Termine com a língua encostada atrás dos dentes de cima.`,
  },
];

export const UNIDADE = Object.fromEntries(UNIDADES.map((u) => [u.id, u])) as Record<string, Unidade>;
