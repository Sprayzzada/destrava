import type { Interesse, Nivel, Sotaque } from '../lib/tipos';

export interface PassoRoteiro {
  fala: string;
  pt: string;
  sugestoes: string[];
}

export interface Cenario {
  id: string;
  titulo: string;
  subtitulo: string;
  nivel: Nivel;
  sotaque: Sotaque;
  nomeSotaque: string;
  interesses: Interesse[];
  quem: string;
  papel: string;
  contexto: string;
  abertura: PassoRoteiro;
  /** Respostas prontas para o modo demonstração (sem IA). */
  roteiro: PassoRoteiro[];
}

export const CENARIOS: Cenario[] = [
  {
    id: 'daily',
    titulo: 'Daily no trabalho',
    subtitulo: 'Dê o status do seu trabalho numa reunião rápida',
    nivel: 'B1',
    sotaque: 'en-US',
    nomeSotaque: 'americano',
    interesses: ['tecnologia', 'negocios'],
    quem: 'Sam, líder do time',
    papel: 'Sam, the learner\'s team lead at a software company. Friendly but brief.',
    contexto:
      'A short daily stand-up meeting on a video call. Sam asks what the learner did yesterday, what they will do today, and whether anything is blocking them.',
    abertura: {
      fala: 'Morning! Okay, your turn. What did you work on yesterday?',
      pt: 'Bom dia! Ok, sua vez. No que você trabalhou ontem?',
      sugestoes: [
        'Yesterday I worked on the login page.',
        'I fixed a bug in the payment flow.',
        'I was in meetings most of the day, to be honest.',
      ],
    },
    roteiro: [
      {
        fala: "Nice. And what's the plan for today?",
        pt: 'Legal. E qual é o plano para hoje?',
        sugestoes: ["Today I'm going to finish the tests.", "I'll keep working on the same task.", "I'm planning to review Ana's code."],
      },
      {
        fala: 'Got it. Is anything blocking you right now?',
        pt: 'Entendi. Tem alguma coisa te travando agora?',
        sugestoes: ["No, I'm good, thanks.", "Yes, I'm waiting for access to the server.", 'Kind of. I need some help with the database.'],
      },
      {
        fala: "Okay, let's sort that out after the call. Anything else before we wrap up?",
        pt: 'Ok, vamos resolver isso depois da call. Mais alguma coisa antes de encerrar?',
        sugestoes: ["No, that's all from me.", 'Just one thing: can we move the demo to Friday?', "Nope, I'm all set."],
      },
      {
        fala: 'Perfect. Thanks, everyone. Have a good one!',
        pt: 'Perfeito. Valeu, pessoal. Bom dia pra vocês!',
        sugestoes: ['Thanks, you too!', 'See you later!', 'Bye, everyone!'],
      },
    ],
  },
  {
    id: 'cafe',
    titulo: 'Pedir num café',
    subtitulo: 'Uma barista que fala rápido, numa cafeteria cheia',
    nivel: 'A2',
    sotaque: 'en-US',
    nomeSotaque: 'americano',
    interesses: ['viagem'],
    quem: 'Jess, barista em Nova York',
    papel: 'Jess, a barista at a busy coffee shop in New York. Upbeat and quick.',
    contexto:
      'Ordering at the counter of a busy coffee shop. The barista asks for the drink, size, hot or iced, type of milk, name for the order, and whether it is for here or to go.',
    abertura: {
      fala: 'Hi there! What can I get for you?',
      pt: 'Oi! O que vai ser?',
      sugestoes: ['Can I get a medium latte, please?', 'Hi! A black coffee, please.', 'What do you recommend?'],
    },
    roteiro: [
      { fala: 'Sure thing. Hot or iced?', pt: 'Claro. Quente ou gelado?', sugestoes: ['Hot, please.', 'Iced, please.', 'Hot is fine.'] },
      {
        fala: "Any milk? We've got whole, oat, and almond.",
        pt: 'Algum leite? Temos integral, de aveia e de amêndoa.',
        sugestoes: ['Oat milk, please.', 'Whole milk is fine.', 'No milk, thanks.'],
      },
      {
        fala: 'Great. Is that for here or to go?',
        pt: 'Ótimo. É para tomar aqui ou para viagem?',
        sugestoes: ['To go, please.', 'For here.', 'To go, thanks.'],
      },
      {
        fala: 'Can I get a name for the order?',
        pt: 'Qual nome eu coloco no pedido?',
        sugestoes: ["It's Gui.", 'My name is Ana.', "Sure, it's Rafa. R-A-F-A."],
      },
      {
        fala: "Awesome. That'll be five seventy-five. It'll be ready at the end of the counter!",
        pt: 'Beleza. Fica cinco e setenta e cinco. Vai sair no fim do balcão!',
        sugestoes: ['Thank you!', 'Can I pay by card?', 'Thanks, have a nice day!'],
      },
    ],
  },
  {
    id: 'smalltalk',
    titulo: 'Papo com colega gringo',
    subtitulo: 'Conversa leve na copa do escritório',
    nivel: 'B1',
    sotaque: 'en-CA',
    nomeSotaque: 'canadense',
    interesses: ['series', 'esportes', 'musica', 'games'],
    quem: 'Riley, colega do Canadá',
    papel: 'Riley, a friendly coworker from Canada, chatting in the office kitchen.',
    contexto: 'Casual small talk between coworkers: the weekend, hobbies, life in Brazil, shows and music.',
    abertura: {
      fala: 'Hey! How was your weekend? Do anything fun?',
      pt: 'Oi! Como foi seu fim de semana? Fez alguma coisa legal?',
      sugestoes: ['It was good! I went to the beach.', 'Pretty quiet, I just stayed home.', 'I watched a lot of series, to be honest.'],
    },
    roteiro: [
      {
        fala: "Oh nice! I've always wanted to visit Brazil. What's your city like?",
        pt: 'Que legal! Sempre quis conhecer o Brasil. Como é a sua cidade?',
        sugestoes: ["It's big and pretty busy.", "It's hot most of the year.", "It's great, the food is amazing."],
      },
      {
        fala: 'Sounds awesome. So what do you usually do for fun?',
        pt: 'Parece ótimo. E o que você costuma fazer para se divertir?',
        sugestoes: ['I play video games.', 'I like going to concerts.', "I'm into running these days."],
      },
      {
        fala: 'No way, me too! Have you seen anything good lately? Movies, shows?',
        pt: 'Não acredito, eu também! Viu alguma coisa boa ultimamente? Filmes, séries?',
        sugestoes: ['Yes! I just finished a great series.', "Not really, I've been too busy.", "I've been rewatching an old sitcom."],
      },
      {
        fala: "I'll have to check it out. Anyway, I gotta run to a meeting. Catch you later!",
        pt: 'Vou dar uma olhada. Enfim, tenho que correr para uma reunião. Até mais!',
        sugestoes: ['See you!', 'Catch you later!', 'Good luck with the meeting!'],
      },
    ],
  },
  {
    id: 'hotel',
    titulo: 'Check-in em Londres',
    subtitulo: 'Recepção de hotel, com sotaque britânico',
    nivel: 'A2',
    sotaque: 'en-GB',
    nomeSotaque: 'britânico',
    interesses: ['viagem'],
    quem: 'Taylor, recepcionista',
    papel: 'Taylor, a polite receptionist at a hotel in London. Uses British expressions like "lovely" and "brilliant".',
    contexto: 'Checking in at a hotel: reservation name, passport, number of nights, breakfast times, wifi and room key.',
    abertura: {
      fala: 'Good evening! Welcome. Do you have a reservation with us?',
      pt: 'Boa noite! Bem-vindo. Você tem uma reserva conosco?',
      sugestoes: ['Yes, under the name Silva.', 'Yes, I booked online.', 'Good evening! Yes, I do.'],
    },
    roteiro: [
      {
        fala: 'Lovely. Could I see your passport, please?',
        pt: 'Ótimo. Posso ver seu passaporte, por favor?',
        sugestoes: ['Sure, here you go.', 'Of course, here it is.', 'Just a second.'],
      },
      {
        fala: "Thank you. You're with us for three nights, is that right?",
        pt: 'Obrigado. Você fica três noites conosco, certo?',
        sugestoes: ["Yes, that's right.", "Actually, it's four nights.", 'Yes, until Friday.'],
      },
      {
        fala: 'Brilliant. Breakfast is from seven to ten, on the first floor. Any questions?',
        pt: 'Perfeito. O café da manhã é das sete às dez, no primeiro andar. Alguma pergunta?',
        sugestoes: ["What's the wifi password?", 'Is there a gym?', 'What time is check-out?'],
      },
      {
        fala: "It's all on the card with your key. You're in room four-twelve. Enjoy your stay!",
        pt: 'Está tudo no cartão junto com a chave. Seu quarto é o 412. Aproveite a estadia!',
        sugestoes: ['Thank you very much!', 'Thanks! Where is the lift?', 'Great, thanks!'],
      },
    ],
  },
  {
    id: 'entrevista',
    titulo: 'Entrevista de emprego',
    subtitulo: 'Primeira conversa com uma recrutadora',
    nivel: 'B2',
    sotaque: 'en-US',
    nomeSotaque: 'americano',
    interesses: ['negocios', 'tecnologia'],
    quem: 'Morgan, recrutadora',
    papel: 'Morgan, a recruiter at an international company. Professional and encouraging.',
    contexto:
      'First-round video interview. Morgan asks about the learner\'s background, strengths, a challenge they faced, why this company, and invites questions at the end.',
    abertura: {
      fala: 'Hi, thanks for joining. To start, could you tell me a little about yourself?',
      pt: 'Oi, obrigada por entrar. Para começar, pode me contar um pouco sobre você?',
      sugestoes: [
        "Sure. I'm a developer with three years of experience.",
        'Of course. I work in marketing, mostly with social media.',
        "Sure! I've been working in customer support since 2022.",
      ],
    },
    roteiro: [
      {
        fala: "That's great. What would you say is your biggest strength?",
        pt: 'Ótimo. Qual você diria que é seu maior ponto forte?',
        sugestoes: ["I'd say I'm a fast learner.", "I'm good at solving problems under pressure.", 'I communicate well with different teams.'],
      },
      {
        fala: 'Can you tell me about a challenge you faced at work and how you handled it?',
        pt: 'Pode me contar sobre um desafio que você enfrentou no trabalho e como lidou com ele?',
        sugestoes: [
          'Once our deadline was moved up by a week, so I...',
          'We lost a big client, and I had to...',
          'I had to learn a new tool in two weeks.',
        ],
      },
      {
        fala: 'Interesting. And why do you want to work with us?',
        pt: 'Interessante. E por que você quer trabalhar com a gente?',
        sugestoes: ['I like your products and I want to grow here.', 'I want to work on an international team.', 'Your company has a great culture.'],
      },
      {
        fala: "Thanks, that's really helpful. Do you have any questions for me?",
        pt: 'Obrigada, isso ajuda muito. Você tem alguma pergunta para mim?',
        sugestoes: ['What does a typical day look like?', 'What are the next steps?', 'How big is the team?'],
      },
      {
        fala: "Great question. We'll be in touch by the end of the week. Thanks again!",
        pt: 'Ótima pergunta. Entraremos em contato até o fim da semana. Obrigada de novo!',
        sugestoes: ['Thank you for your time!', 'Looking forward to hearing from you.', 'Thanks, have a great day!'],
      },
    ],
  },
  {
    id: 'livre',
    titulo: 'Conversa livre',
    subtitulo: 'Fale do que você curte, sem roteiro',
    nivel: 'B1',
    sotaque: 'en-US',
    nomeSotaque: 'americano',
    interesses: [],
    quem: 'Alex, um amigo curioso',
    papel: 'Alex, a curious and friendly person who loves hearing about other people\'s hobbies.',
    contexto: "An open, relaxed conversation about the learner's interests and daily life.",
    abertura: {
      fala: "Hey! So, tell me something you've been into lately.",
      pt: 'E aí! Me conta alguma coisa que você tem curtido ultimamente.',
      sugestoes: ["I've been playing a new game.", 'I started watching a new series.', "I'm learning to cook."],
    },
    roteiro: [
      {
        fala: 'Oh, cool! How did you get into that?',
        pt: 'Que legal! Como você começou com isso?',
        sugestoes: ['A friend told me about it.', 'I saw it on social media.', 'I was bored at home, to be honest.'],
      },
      {
        fala: 'What do you like most about it?',
        pt: 'O que você mais gosta nisso?',
        sugestoes: ["It helps me relax.", "It's really fun with friends.", "I learn something new every time."],
      },
      {
        fala: 'Would you recommend it to a friend? Why?',
        pt: 'Você recomendaria para um amigo? Por quê?',
        sugestoes: ["Yes, because it's easy to start.", "Maybe, it depends on the person.", "Definitely! It's worth it."],
      },
      {
        fala: 'Love it. Thanks for sharing, this was fun! Talk soon?',
        pt: 'Adorei. Obrigado por contar, foi divertido! Falamos logo?',
        sugestoes: ['Sure, talk soon!', 'Thanks, this was fun!', 'See you!'],
      },
    ],
  },
];

export const CENARIO = Object.fromEntries(CENARIOS.map((c) => [c.id, c])) as Record<string, Cenario>;

export const CORINGAS = [
  { en: 'Let me think for a second.', pt: 'Deixa eu pensar um segundo.' },
  { en: 'Sorry, could you say that again?', pt: 'Desculpa, pode repetir?' },
  { en: 'Could you speak a little slower?', pt: 'Pode falar um pouco mais devagar?' },
  { en: 'How do you say "saudade" in English?', pt: 'Como se diz "saudade" em inglês?' },
  { en: 'What I mean is...', pt: 'O que eu quero dizer é...' },
  { en: "I'm not sure how to say this, but...", pt: 'Não sei bem como dizer, mas...' },
];

export const APOIOS = [
  { id: 'rodinhas', nome: 'Com rodinhas', explica: 'Três respostas prontas aparecem. Escolha uma, ouça e diga.' },
  { id: 'dicas', nome: 'Com dicas', explica: 'Você fala do seu jeito. Se travar, peça uma dica.' },
  { id: 'livre', nome: 'Livre', explica: 'Sem ajuda na tela, como numa conversa de verdade.' },
] as const;
