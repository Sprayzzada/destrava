// Conteúdo original do feed (vídeos curtos, leituras, séries e livros). Tudo de exemplo.
import type { Interesse, Nivel, Sotaque } from '../lib/tipos';

export interface FalaReel {
  quem: 'A' | 'B';
  en: string;
  pt: string;
}

export interface Reel {
  id: string;
  titulo: string;
  tema: Interesse;
  nivel: Nivel;
  sotaque: Sotaque;
  nomeSotaque: string;
  cor: 'cobalto' | 'sol' | 'coral' | 'menta' | 'tinta' | 'lilas';
  falas: FalaReel[];
  glossario: Record<string, string>;
  curtidas: number;
}

export const REELS: Reel[] = [
  {
    id: 'cafe',
    titulo: 'Pedido rápido no café',
    tema: 'viagem',
    nivel: 'A2',
    sotaque: 'en-US',
    nomeSotaque: 'americano',
    cor: 'coral',
    curtidas: 1240,
    falas: [
      { quem: 'A', en: 'Hey! What can I get ya?', pt: 'Oi! O que vai ser?' },
      { quem: 'B', en: 'Lemme get a medium iced latte.', pt: 'Me vê um latte gelado médio.' },
      { quem: 'A', en: 'Sure. Is whole milk okay?', pt: 'Claro. Pode ser leite integral?' },
      { quem: 'B', en: 'Actually, can I get oat milk?', pt: 'Na verdade, pode ser de aveia?' },
      { quem: 'A', en: 'You got it. Name?', pt: 'Fechado. Nome?' },
    ],
    glossario: {
      ya: 'você (jeito rápido de dizer "you")',
      lemme: 'deixa eu / me vê ("let me")',
      medium: 'médio',
      iced: 'gelado',
      whole: 'integral (leite)',
      actually: 'na verdade (falso cognato: não é "atualmente")',
      oat: 'aveia',
      got: '"You got it" = pode deixar, fechado',
    },
  },
  {
    id: 'daily',
    titulo: 'Status na daily',
    tema: 'tecnologia',
    nivel: 'B1',
    sotaque: 'en-US',
    nomeSotaque: 'americano',
    cor: 'cobalto',
    curtidas: 2310,
    falas: [
      { quem: 'A', en: 'So, quick update from me.', pt: 'Então, uma atualização rápida da minha parte.' },
      { quem: 'A', en: "I'm kinda stuck on the login bug.", pt: 'Estou meio travado no bug do login.' },
      { quem: 'B', en: 'Need a hand with that?', pt: 'Precisa de uma mão com isso?' },
      { quem: 'A', en: "Yeah, that'd be great. Can we pair after lunch?", pt: 'Sim, seria ótimo. Podemos programar juntos depois do almoço?' },
      { quem: 'B', en: "Sure, ping me when you're free.", pt: 'Claro, me chama quando estiver livre.' },
    ],
    glossario: {
      update: 'atualização',
      kinda: 'meio, um pouco ("kind of")',
      stuck: 'travado, preso',
      hand: '"Need a hand?" = precisa de ajuda?',
      pair: 'programar em dupla',
      ping: 'mandar uma mensagem rápida',
      free: 'livre, disponível',
    },
  },
  {
    id: 'chefao',
    titulo: 'Chefão impossível',
    tema: 'games',
    nivel: 'B1',
    sotaque: 'en-US',
    nomeSotaque: 'americano',
    cor: 'lilas',
    curtidas: 3105,
    falas: [
      { quem: 'A', en: 'Dude, that boss fight was nuts.', pt: 'Cara, aquela luta com o chefão foi insana.' },
      { quem: 'B', en: 'Right? I died like ten times.', pt: 'Né? Eu morri tipo umas dez vezes.' },
      { quem: 'A', en: 'You gotta dodge left when he jumps.', pt: 'Você tem que desviar para a esquerda quando ele pula.' },
      { quem: 'B', en: 'Now you tell me!', pt: 'Agora que você me fala!' },
    ],
    glossario: {
      dude: 'cara, mano',
      boss: 'chefão (fase final do jogo)',
      fight: 'luta',
      nuts: 'insano, doido',
      right: '"Right?" = né?',
      like: 'tipo (muleta, igual em português)',
      gotta: 'tem que ("have got to")',
      dodge: 'desviar',
    },
  },
  {
    id: 'cha',
    titulo: 'Um chá à britânica',
    tema: 'viagem',
    nivel: 'B1',
    sotaque: 'en-GB',
    nomeSotaque: 'britânico',
    cor: 'menta',
    curtidas: 1876,
    falas: [
      { quem: 'A', en: 'Fancy a cuppa?', pt: 'Aceita um chá?' },
      { quem: 'B', en: 'Oh, go on then. Milk, no sugar.', pt: 'Ah, vai, então. Com leite, sem açúcar.' },
      { quem: 'A', en: "The kettle's just boiled.", pt: 'A chaleira acabou de ferver.' },
      { quem: 'B', en: 'Brilliant. Cheers, mate.', pt: 'Ótimo. Valeu, amigo.' },
    ],
    glossario: {
      fancy: 'estar a fim de ("Fancy a...?" = quer um...?)',
      cuppa: 'xícara de chá ("cup of tea")',
      go: '"Go on then" = tá bom, vai',
      kettle: 'chaleira',
      boiled: 'ferveu',
      brilliant: 'ótimo (muito usado no Reino Unido)',
      cheers: 'valeu, obrigado (e também "saúde!")',
      mate: 'amigo, parceiro',
    },
  },
  {
    id: 'jogo-au',
    titulo: 'Dia de jogo na Austrália',
    tema: 'esportes',
    nivel: 'B1',
    sotaque: 'en-AU',
    nomeSotaque: 'australiano',
    cor: 'sol',
    curtidas: 982,
    falas: [
      { quem: 'A', en: "Reckon they'll win this arvo?", pt: 'Acha que eles ganham hoje à tarde?' },
      { quem: 'B', en: "No worries, they've been on fire lately.", pt: 'Relaxa, eles estão pegando fogo ultimamente.' },
      { quem: 'A', en: "Let's grab a bite before the match.", pt: 'Vamos comer alguma coisa antes do jogo.' },
      { quem: 'B', en: "Sounds good, mate. I'm starving.", pt: 'Fechado, parceiro. Estou morrendo de fome.' },
    ],
    glossario: {
      reckon: 'achar ("I reckon" = eu acho)',
      arvo: 'tarde ("afternoon", gíria australiana)',
      worries: '"No worries" = relaxa, de nada',
      fire: '"On fire" = em ótima fase',
      lately: 'ultimamente',
      bite: '"Grab a bite" = comer algo rápido',
      match: 'jogo, partida',
      starving: 'morrendo de fome',
    },
  },
  {
    id: 'polvo',
    titulo: 'Três corações',
    tema: 'ciencia',
    nivel: 'B1',
    sotaque: 'en-US',
    nomeSotaque: 'americano',
    cor: 'tinta',
    curtidas: 4420,
    falas: [
      { quem: 'A', en: 'Did you know octopuses have three hearts?', pt: 'Você sabia que polvos têm três corações?' },
      { quem: 'B', en: 'No way. Why three?', pt: 'Não acredito. Por que três?' },
      {
        quem: 'A',
        en: 'Two pump blood to the gills, and one pumps it to the rest of the body.',
        pt: 'Dois bombeiam sangue para as brânquias, e um bombeia para o resto do corpo.',
      },
      { quem: 'B', en: "That's wild.", pt: 'Que doideira.' },
    ],
    glossario: {
      octopuses: 'polvos',
      hearts: 'corações',
      way: '"No way" = não acredito, de jeito nenhum',
      pump: 'bombear',
      gills: 'brânquias',
      body: 'corpo',
      wild: 'impressionante, doido',
    },
  },
  {
    id: 'gadget',
    titulo: 'O celular que dobra',
    tema: 'tecnologia',
    nivel: 'B2',
    sotaque: 'en-US',
    nomeSotaque: 'americano',
    cor: 'cobalto',
    curtidas: 1530,
    falas: [
      { quem: 'A', en: 'Check this out. It folds in half.', pt: 'Olha só isso. Ele dobra no meio.' },
      { quem: 'B', en: "Huh. Doesn't the screen crease?", pt: 'Hum. A tela não fica com vinco?' },
      { quem: 'A', en: 'Barely. You stop noticing after a week.', pt: 'Quase nada. Você para de notar depois de uma semana.' },
      { quem: 'B', en: "I dunno, it's a lot of money for a phone.", pt: 'Sei não, é muito dinheiro por um celular.' },
    ],
    glossario: {
      check: '"Check this out" = olha isso',
      folds: 'dobra',
      half: 'metade, meio',
      crease: 'vinco, marca de dobra',
      barely: 'quase nada, mal',
      noticing: 'perceber, notar',
      dunno: 'sei lá ("don\'t know")',
    },
  },
  {
    id: 'serie',
    titulo: 'Sem spoilers!',
    tema: 'series',
    nivel: 'B1',
    sotaque: 'en-US',
    nomeSotaque: 'americano',
    cor: 'coral',
    curtidas: 2765,
    falas: [
      { quem: 'A', en: 'Did ya finish the show last night?', pt: 'Você terminou a série ontem à noite?' },
      { quem: 'B', en: 'Yeah, I binge-watched the whole season.', pt: 'Sim, maratonei a temporada inteira.' },
      { quem: 'A', en: "No spoilers! I'm only on episode three.", pt: 'Sem spoilers! Eu só estou no episódio três.' },
      { quem: 'B', en: 'My lips are sealed.', pt: 'Minha boca é um túmulo.' },
    ],
    glossario: {
      ya: 'você',
      show: 'série, programa',
      'binge-watched': 'maratonou ("binge-watch")',
      season: 'temporada',
      whole: 'inteira',
      lips: 'lábios',
      sealed: '"My lips are sealed" = boca de siri',
    },
  },
];

export interface Leitura {
  id: string;
  titulo: string;
  tituloPt: string;
  tema: Interesse;
  minutos: number;
  versoes: Record<Nivel, string[]>;
  glossario: Record<string, string>;
}

export const LEITURAS: Leitura[] = [
  {
    id: 'telhados',
    titulo: 'Why some cities paint their roofs white',
    tituloPt: 'Por que algumas cidades pintam os telhados de branco',
    tema: 'ciencia',
    minutos: 2,
    versoes: {
      A2: [
        'Some cities paint their roofs white. Why? Dark roofs get very hot in the sun. White roofs send the sunlight back to the sky, so the building stays cooler inside.',
        'People use less air conditioning, and they save money. It is a simple idea, and it is cheap. Some cities also plant gardens on their roofs. Plants make the air cooler too.',
      ],
      B1: [
        'In many cities around the world, people are painting their roofs white. The idea is simple: dark surfaces absorb sunlight and turn it into heat, while light surfaces reflect most of it back.',
        'A white roof can stay much cooler than a black one on a sunny afternoon, so the rooms below need less air conditioning. That means lower electricity bills and less pressure on the power grid during heat waves. Some cities are going further and covering roofs with plants, which also help with rainwater.',
      ],
      B2: [
        'As summers get hotter, a surprisingly low-tech solution is gaining ground: painting roofs white. Dark roofing materials absorb most of the sunlight that hits them and release it as heat, contributing to the urban heat island effect, the reason cities are often several degrees warmer than the surrounding countryside.',
        "Reflective \"cool roofs\" bounce much of that energy back, keeping buildings cooler and cutting demand for air conditioning. Critics point out that the benefits are smaller in cold climates, where some winter heating is lost, but in hot, dense cities the trade-off usually pays off.",
      ],
    },
    glossario: {
      roofs: 'telhados',
      roof: 'telhado',
      paint: 'pintar',
      sunlight: 'luz do sol',
      cooler: 'mais fresco',
      cheap: 'barato',
      absorb: 'absorver',
      reflect: 'refletir',
      bills: 'contas (de luz, água)',
      grid: 'rede elétrica ("power grid")',
      heat: 'calor',
      waves: '"Heat waves" = ondas de calor',
      gaining: '"Gaining ground" = ganhando espaço',
      surrounding: 'ao redor',
      countryside: 'campo, zona rural',
      bounce: 'rebater, quicar',
      demand: 'demanda, procura',
      'trade-off': 'troca: o que se ganha e o que se perde',
      pays: '"Pays off" = vale a pena, compensa',
    },
  },
  {
    id: 'bateria',
    titulo: 'Why your phone dies in the cold',
    tituloPt: 'Por que o celular descarrega no frio',
    tema: 'tecnologia',
    minutos: 2,
    versoes: {
      A2: [
        'Your phone battery works with chemistry. Inside the battery, very small parts move from one side to the other. When it is very cold, they move more slowly.',
        "So the battery gives less energy, and the phone can turn off. Don't worry: when the phone is warm again, the battery comes back. A good tip: keep your phone in a pocket near your body.",
      ],
      B1: [
        "Have you ever seen your phone die in the cold, even with 30% battery left? It's not broken. Phone batteries use lithium ions that move between two sides of the battery to produce electricity.",
        "Low temperatures slow that movement down, so the battery can't deliver enough power and the phone shuts down to protect itself. The good news is that the effect is usually temporary: once the phone warms up, most of the charge comes back. Keeping it in an inside pocket helps a lot.",
      ],
      B2: [
        'Anyone who has used a smartphone on a ski trip knows the frustration: the battery indicator says 30%, and then the screen goes black. The culprit is chemistry. Lithium-ion cells rely on ions travelling through an electrolyte, and cold temperatures make that process sluggish.',
        "When the phone asks for a burst of power, the voltage drops below a safe threshold and the system shuts down to avoid damage. The charge isn't actually gone: warm the device up and much of it reappears. Charging a battery while it's freezing, however, can cause lasting harm.",
      ],
    },
    glossario: {
      battery: 'bateria',
      chemistry: 'química',
      slowly: 'devagar',
      warm: 'quente, morno',
      pocket: 'bolso',
      die: '"The phone dies" = o celular descarrega, apaga',
      left: 'restando ("30% left")',
      broken: 'quebrado',
      deliver: 'entregar, fornecer',
      shuts: '"Shuts down" = desliga',
      charge: 'carga',
      culprit: 'culpado',
      rely: '"Rely on" = depender de',
      sluggish: 'lento, arrastado',
      burst: 'pico, rajada',
      threshold: 'limite',
      damage: 'dano',
      freezing: 'congelando, muito frio',
      lasting: 'duradouro',
      harm: 'dano, prejuízo',
    },
  },
];

export interface Serie {
  id: string;
  titulo: string;
  nivel: Nivel | 'B2+';
  sotaque: string;
  formato: string;
  porque: string;
  expressoes: string[];
  tema: Interesse;
}

export const SERIES: Serie[] = [
  {
    id: 'bluey',
    titulo: 'Bluey',
    nivel: 'A2',
    sotaque: 'Australiano',
    formato: 'Desenho, episódios de 7 minutos',
    porque: 'Feito para crianças, mas adultos adoram. Frases simples e o sotaque australiano sem pressa: ótimo para começar a sair do americano.',
    expressoes: ["Let's play!", "That's not fair!", 'Hooray!'],
    tema: 'series',
  },
  {
    id: 'friends',
    titulo: 'Friends',
    nivel: 'B1',
    sotaque: 'Americano',
    formato: 'Sitcom, episódios de 20 minutos',
    porque: 'Diálogos curtos do dia a dia, falados com clareza. Boa primeira série para assistir sem legenda em português.',
    expressoes: ["What's up?", 'Are you kidding me?', "I'm so sorry!"],
    tema: 'series',
  },
  {
    id: 'b99',
    titulo: 'Brooklyn Nine-Nine',
    nivel: 'B1',
    sotaque: 'Americano',
    formato: 'Comédia policial, episódios de 20 minutos',
    porque: 'Piadas rápidas, gírias e ironia. Treina o ouvido para o ritmo de conversa entre colegas de trabalho.',
    expressoes: ['Hold on a sec.', 'Nice!', "That's a terrible idea."],
    tema: 'series',
  },
  {
    id: 'ted',
    titulo: 'Ted Lasso',
    nivel: 'B2',
    sotaque: 'Americano e britânico',
    formato: 'Comédia, episódios de 30 minutos',
    porque: 'Um técnico americano no meio de ingleses: você ouve os dois sotaques lado a lado, com as diferenças bem marcadas.',
    expressoes: ['Cheers, mate.', 'Fair enough.', 'I appreciate you.'],
    tema: 'esportes',
  },
  {
    id: 'office',
    titulo: 'The Office (EUA)',
    nivel: 'B2',
    sotaque: 'Americano',
    formato: 'Falso documentário, episódios de 22 minutos',
    porque: 'Conversas que se sobrepõem e humor constrangedor de escritório. Muito vocabulário de trabalho.',
    expressoes: ["Let's circle back.", "That's what I'm talking about.", 'Quick question.'],
    tema: 'negocios',
  },
  {
    id: 'derry',
    titulo: 'Derry Girls',
    nivel: 'B2+',
    sotaque: 'Irlandês do Norte',
    formato: 'Comédia, episódios de 25 minutos',
    porque: 'Sotaque forte e fala rapidíssima. Um desafio para quando as outras ficarem fáceis.',
    expressoes: ["What's the craic?", 'Wise up!', 'Catch yourself on.'],
    tema: 'series',
  },
];

export interface Capitulo {
  titulo: string;
  paragrafos: string[];
}

export interface Livro {
  id: string;
  titulo: string;
  tituloPt: string;
  nivel: Nivel;
  tema: Interesse;
  sinopse: string;
  capitulos: Capitulo[];
  glossario: Record<string, string>;
}

export const LIVROS: Livro[] = [
  {
    id: 'trem',
    titulo: 'The Wrong Train',
    tituloPt: 'O trem errado',
    nivel: 'A2',
    tema: 'viagem',
    sinopse: 'Lia está atrasada para o voo e entra no trem errado. Uma história curta sobre viagem e sobre pedir ajuda.',
    capitulos: [
      {
        titulo: 'Platform 4',
        paragrafos: [
          'Lia arrives at the station at eight o\'clock. She is tired, and her bag is heavy. She looks at the board: the train to the airport leaves from platform 4.',
          'She runs, gets on the train and sits by the window. She puts on her headphones and closes her eyes. Twenty minutes later, she opens them. Outside, there are no buildings. There are cows. A lot of cows.',
          '"This is not the way to the airport," she thinks.',
        ],
      },
      {
        titulo: 'A New Plan',
        paragrafos: [
          'Lia asks the woman next to her, "Excuse me, is this the train to the airport?" The woman smiles. "No, dear. This train goes to the mountains."',
          'Lia checks her phone. Her flight is at noon. "What can I do?" she asks. "Get off at the next stop," the woman says. "There\'s a bus to the airport every hour."',
          'Lia gets off, finds the bus and gets to the airport with ten minutes to spare. On the plane, she laughs. Next time, she will read the board twice.',
        ],
      },
    ],
    glossario: {
      arrives: 'chega',
      tired: 'cansada',
      heavy: 'pesada',
      board: 'painel (de horários)',
      leaves: 'sai, parte',
      platform: 'plataforma',
      window: 'janela',
      headphones: 'fones de ouvido',
      cows: 'vacas',
      way: 'caminho',
      dear: 'querida (tratamento carinhoso)',
      mountains: 'montanhas',
      flight: 'voo',
      noon: 'meio-dia',
      off: '"Get off" = descer (do trem, ônibus)',
      spare: '"With ten minutes to spare" = com dez minutos de folga',
      twice: 'duas vezes',
    },
  },
  {
    id: 'bug',
    titulo: 'Midnight Bug',
    tituloPt: 'Bug à meia-noite',
    nivel: 'B1',
    tema: 'tecnologia',
    sinopse: 'O sistema de pagamentos cai perto da meia-noite, e Davi precisa explicar o problema em inglês numa call de emergência.',
    capitulos: [
      {
        titulo: 'The Alert',
        paragrafos: [
          "At 11:52 p.m., Davi's phone buzzed on the nightstand. It was an alert from work: the payment system was down. He sat up, opened his laptop and joined the emergency call.",
          '"Hey, sorry to wake you," said Priya, the engineer on duty. "Customers can\'t pay, and we don\'t know why yet."',
          'Davi rubbed his eyes and started reading the logs. Thousands of lines scrolled by, full of numbers he didn\'t understand. Then he saw it: the same error, over and over again.',
        ],
      },
      {
        titulo: 'The Fix',
        paragrafos: [
          '"Look at this," Davi said, sharing his screen. "Every failed payment has the date in the wrong format." Priya leaned closer to her camera. "Someone changed the date settings today, right?"',
          'They checked the recent changes, and there it was: a small update that nobody had tested. They rolled it back, and within two minutes the payments started going through again.',
          'At 12:40, Davi closed his laptop. He was exhausted, but he couldn\'t stop smiling. He had found the bug, and he had explained it in English without freezing once.',
        ],
      },
    ],
    glossario: {
      buzzed: 'vibrou',
      nightstand: 'criado-mudo',
      down: '"The system was down" = o sistema caiu',
      joined: 'entrou (na call)',
      wake: 'acordar',
      duty: '"On duty" = de plantão',
      rubbed: 'esfregou',
      logs: 'registros do sistema',
      scrolled: 'rolaram (na tela)',
      failed: 'que falhou',
      leaned: 'se inclinou',
      settings: 'configurações',
      rolled: '"Rolled it back" = desfizeram a mudança',
      within: 'em menos de, dentro de',
      exhausted: 'exausto',
      freezing: 'travar, congelar',
    },
  },
];

export const CLASSICOS = [
  {
    titulo: 'The Adventures of Sherlock Holmes',
    autor: 'Arthur Conan Doyle',
    nivel: 'B2+',
    nota: 'Domínio público. Contos curtos de mistério.',
    url: 'https://www.gutenberg.org/ebooks/1661',
  },
  {
    titulo: "Alice's Adventures in Wonderland",
    autor: 'Lewis Carroll',
    nivel: 'B2',
    nota: 'Domínio público. Frases simples, ideias malucas.',
    url: 'https://www.gutenberg.org/ebooks/11',
  },
];

export const REEL = Object.fromEntries(REELS.map((r) => [r.id, r])) as Record<string, Reel>;
export const LEITURA = Object.fromEntries(LEITURAS.map((l) => [l.id, l])) as Record<string, Leitura>;
export const LIVRO = Object.fromEntries(LIVROS.map((l) => [l.id, l])) as Record<string, Livro>;
