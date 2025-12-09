"use client"

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Users, Zap, Heart, Flame, Trophy, Star, Gift, Sparkles, TrendingUp, RotateCcw, Play, Plus, X, Award, Target, Crown, PartyPopper, Volume2, VolumeX, Clock, Timer } from 'lucide-react';
import { useRouter } from 'next/navigation'

interface Player {
  id: string;
  name: string;
  avatar: string;
  truthsCompleted: number;
  daresCompleted: number;
  totalScore: number;
  achievements: string[];
}

interface Challenge {
  id: number;
  type: 'truth' | 'dare';
  category: 'funny' | 'romantic' | 'extreme' | 'embarrassing' | 'creative' | 'hilarious' | 'crazy-romantic' | 'awkward' | 'dance' | 'voice' | 'food' | 'story' | 'roleplay' | 'photo' | 'physical' | 'new-year';
  text: string;
  points: number;
}

interface GameStats {
  totalChallenges: number;
  totalTruths: number;
  totalDares: number;
  totalTime: number;
  mvpPlayer: Player | null;
}

interface CategoryColors {
  [key: string]: {
    bg: string;
    text: string;
    icon: string;
  };
}

interface TournamentSettings {
  duration: number;
  enabled: boolean;
}

const TruthOrDareGame = () => {
  const router = useRouter();
  const [gameState, setGameState] = useState<'intro' | 'setup' | 'playing' | 'challenge' | 'stats'>('intro');
  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [selectedType, setSelectedType] = useState<'truth' | 'dare' | null>(null);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [gameStats, setGameStats] = useState<GameStats>({
    totalChallenges: 0,
    totalTruths: 0,
    totalDares: 0,
    totalTime: 0,
    mvpPlayer: null
  });

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isDrumRoll, setIsDrumRoll] = useState(false);
  const [tournamentSettings, setTournamentSettings] = useState<TournamentSettings>({
    duration: 10,
    enabled: false
  });
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [tournamentWinner, setTournamentWinner] = useState<Player | null>(null);
  const [loserForPunishment, setLoserForPunishment] = useState<Player | null>(null);

  const startTimeRef = useRef<number>(0);
  const timerIntervalRef = useRef<any>(null);

  const avatars = ['🎅', '🤶', '🧝', '⛄', '🦌', '🎄', '⭐', '🎁', '❄️', '🔔', '🕯️', '🎊'];

const challenges: Challenge[] = [
  // ՊԱՏԱՍԽԱՆ - Ծիծաղելի
  { 
    id: 1, 
    type: 'truth', 
    category: 'hilarious', 
    text: 'Եթե ուտեստ լինեիր, ո՞ր ուտեստը կլինեիր և ինչո՞ւ:', 
    points: 15 
  },
  { 
    id: 2, 
    type: 'truth', 
    category: 'hilarious', 
    text: 'Պատմիր մի պատմություն, երբ մտածել ես՝ «Այսպես մահանալու էի...», բայց ամեն ինչ լավ է ավարտվել:', 
    points: 15 
  },
  { 
    id: 3, 
    type: 'truth', 
    category: 'hilarious', 
    text: 'Ո՞րն է ամենատարօրինակ բանը, որ երբևէ փորձել ես ուտել:', 
    points: 15 
  },
  { 
    id: 4, 
    type: 'truth', 
    category: 'hilarious', 
    text: 'Եթե ամբողջ կյանքում միայն մեկ ուտեստ ուտեիր, ո՞րն էիր ընտրում:', 
    points: 15 
  },
  { 
    id: 5, 
    type: 'truth', 
    category: 'hilarious', 
    text: 'Ի՞նչ անուն կտայիր ապագա շանդ և ինչպե՞ս կարդարացնեիր այդ անունը:', 
    points: 15 
  },
  { 
    id: 6, 
    type: 'truth', 
    category: 'hilarious', 
    text: 'Գանձանակում փող չունես, պետք է մթերք գնես: Ի՞նչ պլան ունես:', 
    points: 20 
  },
  { 
    id: 7, 
    type: 'truth', 
    category: 'hilarious', 
    text: 'Պատմիր քո ամենատարօրինակ երազի մասին:', 
    points: 15 
  },
  { 
    id: 8, 
    type: 'truth', 
    category: 'hilarious', 
    text: 'Եթե հիմա կենդանի դառնայիր, ո՞ր կենդանին կդառնայիր և ինչո՞ւ:', 
    points: 15 
  },
  { 
    id: 9, 
    type: 'truth', 
    category: 'hilarious', 
    text: 'Պատմիր մի պատմություն, երբ ամոթից ուզել ես գետնի տակ մտնել:', 
    points: 15 
  },
  { 
    id: 10, 
    type: 'truth', 
    category: 'hilarious', 
    text: 'Ո՞րն է ամենատարօրինակ կերպարը, որ երբևէ հագել ես Հելոուինի ժամանակ:', 
    points: 15 
  },

  // ՊԱՏԱՍԽԱՆ - Հիմար ռոմանտիկ
  { 
    id: 11, 
    type: 'truth', 
    category: 'crazy-romantic', 
    text: 'Եթե պետք լիներ ամուսնանալ սենյակում նստածներից մեկի հետ, ո՞ւմ հետ կամուսնանայիր:', 
    points: 20 
  },
  { 
    id: 12, 
    type: 'truth', 
    category: 'crazy-romantic', 
    text: 'Ո՞րն է ամենատարօրինակ բանը, որ արել ես մեկի ուշադրությունը գրավելու համար:', 
    points: 20 
  },
  { 
    id: 13, 
    type: 'truth', 
    category: 'crazy-romantic', 
    text: 'Պատմիր քո ամենամեծ սիրային ձախողման մասին:', 
    points: 20 
  },
  { 
    id: 14, 
    type: 'truth', 
    category: 'crazy-romantic', 
    text: 'Քո կատարյալ համբույրը ինչպիսի՞ն պետք է լինի:', 
    points: 20 
  },
  { 
    id: 15, 
    type: 'truth', 
    category: 'crazy-romantic', 
    text: 'Ի՞նչ անուններ կտայիր երևակայական երեխաներիդ:', 
    points: 20 
  },
  { 
    id: 16, 
    type: 'truth', 
    category: 'crazy-romantic', 
    text: 'Պատմիր, թե ինչպես ես բարում ներկայացել կեղծ անունով ու կենսագրությամբ:', 
    points: 25 
  },

  // ՊԱՏԱՍԽԱՆ - Ամոթալի
  { 
    id: 17, 
    type: 'truth', 
    category: 'awkward', 
    text: 'Պատմիր, թե երբ ես մոռացել մեկի անունը շատ կարևոր պահին:', 
    points: 20 
  },
  { 
    id: 18, 
    type: 'truth', 
    category: 'awkward', 
    text: 'Ե՞րբ ես վերջին անգամ այնքան ուշացել, որ հորինել ես պատմություն:', 
    points: 20 
  },
  { 
    id: 19, 
    type: 'truth', 
    category: 'awkward', 
    text: 'Պատմիր, թե երբ ես սխալմամբ ուղարկել սխալ հաղորդագրություն սխալ մարդուն:', 
    points: 20 
  },
  { 
    id: 20, 
    type: 'truth', 
    category: 'awkward', 
    text: 'Ո՞րն է ամենատարօրինակ բանը, որ երբևէ գողացել ես:', 
    points: 25 
  },
  { 
    id: 21, 
    type: 'truth', 
    category: 'awkward', 
    text: 'Պատմիր, թե երբ ես սխալմամբ դուրս եկել սենյակից առանց հագուստի:', 
    points: 30 
  },

  // ՄԻՐԱԾ - Ծիծաղելի պարեր
  { 
    id: 22, 
    type: 'dare', 
    category: 'dance', 
    text: 'Պարիր ինչպես փիղ՝ 1 րոպե:', 
    points: 20 
  },
  { 
    id: 23, 
    type: 'dare', 
    category: 'dance', 
    text: 'Պարիր ինչպես գազար՝ 30 վայրկյան:', 
    points: 20 
  },
  { 
    id: 24, 
    type: 'dare', 
    category: 'dance', 
    text: 'Ցույց տուր 80-ականների լավագույն պարի շարժումները:', 
    points: 20 
  },
  { 
    id: 25, 
    type: 'dare', 
    category: 'dance', 
    text: 'Պարիր ինչպես մեքենա, որը չի կարող վnագործել:', 
    points: 25 
  },
  { 
    id: 26, 
    type: 'dare', 
    category: 'dance', 
    text: 'Պարիր ինչպես անտառապահ, որ փնտրում է կորած կենդանուն:', 
    points: 25 
  },

  // ՄԻՐԱԾ - Ձայներ և ձայնային էֆեկտներ
  { 
    id: 27, 
    type: 'dare', 
    category: 'voice', 
    text: 'Կանչիր ինչպես կապիկ՝ 1 րոպե առանց դադարի:', 
    points: 20 
  },
  { 
    id: 28, 
    type: 'dare', 
    category: 'voice', 
    text: 'Խոսիր ինչպես բարձրաձայնող ռոբոտ՝ մինչև հաջորդ հարցը:', 
    points: 25 
  },
  { 
    id: 29, 
    type: 'dare', 
    category: 'voice', 
    text: 'Կարդա այբբենարանի մեկ էջը՝ ինչպես ռոմանտիկ պոեմ:', 
    points: 20 
  },
  { 
    id: 30, 
    type: 'dare', 
    category: 'voice', 
    text: 'Երգիր հայտնի երգ՝ բոլոր բառերը փոխարինելով «լազանիյա» բառով:', 
    points: 30 
  },
  { 
    id: 31, 
    type: 'dare', 
    category: 'voice', 
    text: 'Խոսիր ինչպես ծովահեն՝ 1 րոպե:', 
    points: 25 
  },

  // ՄԻՐԱԾ - Սնունդ և ըմպելիքներ
  { 
    id: 32, 
    type: 'dare', 
    category: 'food', 
    text: 'Ուտիր բանան՝ առանց ձեռքերիդ օգնության:', 
    points: 25 
  },
  { 
    id: 33, 
    type: 'dare', 
    category: 'food', 
    text: 'Խմիր ջուր՝ առանց ձեռքերիդ օգնության:', 
    points: 20 
  },
  { 
    id: 34, 
    type: 'dare', 
    category: 'food', 
    text: 'Ուտիր թխվածքաբլիթ՝ 1 րոպեում առանց օգնության:', 
    points: 30 
  },
  { 
    id: 35, 
    type: 'dare', 
    category: 'food', 
    text: 'Պատրաստիր երևակայական ուտեստ և ներկայացրու այն՝ ինչպես շեֆ-խոհարար:', 
    points: 25 
  },

  // ՄԻՐԱԾ - Պատմություններ հորինել
  { 
    id: 36, 
    type: 'dare', 
    category: 'story', 
    text: 'Հորինիր հեքիաթ, որտեղ բոլորը սենյակում կենդանիներ են, իսկ դու արջ ես:', 
    points: 25 
  },
  { 
    id: 37, 
    type: 'dare', 
    category: 'story', 
    text: 'Ստեղծիր և պատմիր պատմություն՝ օգտագործելով 5 բառ, որոնք սկսվում են «Բ» տառով:', 
    points: 20 
  },
  { 
    id: 38, 
    type: 'dare', 
    category: 'story', 
    text: 'Պատմիր պատմություն՝ օգտագործելով միայն ժեստեր և ձայներ:', 
    points: 30 
  },
  { 
    id: 39, 
    type: 'dare', 
    category: 'story', 
    text: 'Պատմիր քո կյանքի պատմությունը՝ սկսած վերջից:', 
    points: 25 
  },

  // ՄԻՐԱԾ - Դերակատարում
  { 
    id: 40, 
    type: 'dare', 
    category: 'roleplay', 
    text: 'Խաղացիր հարևանի դերը, որը գանգատվում է աղմուկից:', 
    points: 25 
  },
  { 
    id: 41, 
    type: 'dare', 
    category: 'roleplay', 
    text: 'Ցույց տուր, թե ինչպես կվարվեիր, եթե հանկարծ միլիոնատեր դառնայիր:', 
    points: 30 
  },
  { 
    id: 42, 
    type: 'dare', 
    category: 'roleplay', 
    text: 'Խաղացիր, թե ինչպես կզբոսնեիր քո գլխավոր թշնամու հետ:', 
    points: 30 
  },
  { 
    id: 43, 
    type: 'dare', 
    category: 'roleplay', 
    text: 'Խաղացիր ռեստորանի սպասավորի դերը և վերցրու պատվեր բոլորից:', 
    points: 25 
  },

  // ՄԻՐԱԾ - Նկարներ և տեսանյութեր
  { 
    id: 44, 
    type: 'dare', 
    category: 'photo', 
    text: 'Կատարիր ամենատարօրինակ սելֆին և ցույց տուր բոլորին:', 
    points: 20 
  },
  { 
    id: 45, 
    type: 'dare', 
    category: 'photo', 
    text: 'Նկարիր տեսանյութ, թե ինչպես ես նմանակում կատվի և ցույց տուր:', 
    points: 25 
  },
  { 
    id: 46, 
    type: 'dare', 
    category: 'photo', 
    text: 'Կեցվածք ընդունիր մարզիկի հետ, որ նկարեն քեզ:', 
    points: 20 
  },

  // ՄԻՐԱԾ - Ֆիզիկական մարտահրավերներ
  { 
    id: 47, 
    type: 'dare', 
    category: 'physical', 
    text: 'Պտտվիր 10 անգամ, ապա փորձիր ուղիղ քայլել գծի վրա:', 
    points: 25 
  },
  { 
    id: 48, 
    type: 'dare', 
    category: 'physical', 
    text: 'Կանգնիր մեկ ոտքի վրա՝ աչքերդ փակ 30 վայրկյան:', 
    points: 20 
  },
  { 
    id: 49, 
    type: 'dare', 
    category: 'physical', 
    text: 'Խաղա «թույն չկա»՝ 30 վայրկյան:', 
    points: 25 
  },
  { 
    id: 50, 
    type: 'dare', 
    category: 'physical', 
    text: 'Ցույց տուր լավագույն յոգայի դիրքդ և մնա դրանում 30 վայրկյան:', 
    points: 20 
  },

  // ՄԻՐԱԾ - Ամանորյա հատուկ
  { 
    id: 51, 
    type: 'dare', 
    category: 'new-year', 
    text: 'Երգիր Ամանորի երգ՝ «Ամանոր» բառը փոխարինելով «Պիցցա» բառով:', 
    points: 30 
  },
  { 
    id: 52, 
    type: 'dare', 
    category: 'new-year', 
    text: 'Գուշակիր մեկի Ամանորի ցանկությունը և կատարիր այն:', 
    points: 35 
  },
  { 
    id: 53, 
    type: 'dare', 
    category: 'new-year', 
    text: 'Պարիր սահնակի պար՝ 1 րոպե:', 
    points: 25 
  },
  { 
    id: 54, 
    type: 'dare', 
    category: 'new-year', 
    text: 'Խաղացիր Ձմեռ պապի դերը և բաշխիր երևակայական նվերներ:', 
    points: 30 
  },
  { 
    id: 55, 
    type: 'dare', 
    category: 'new-year', 
    text: 'Պատմիր Ամանորի առասպել՝ օգտագործելով միայն մատներդ:', 
    points: 35 
  },

  // 🎭 ՀԱՎԵԼՎԱԾ - Ծիծաղելի նոր մարտահրավերներ
  { 
    id: 56, 
    type: 'dare', 
    category: 'funny', 
    text: 'Պարիր ինչպես տիեզերագնաց՝ զրոյական ձգողության պայմաններում:', 
    points: 25 
  },
  { 
    id: 57, 
    type: 'dare', 
    category: 'funny', 
    text: 'Խոսիր 1 րոպե առանց «ես» բառի օգտագործելու:', 
    points: 20 
  },
  { 
    id: 58, 
    type: 'dare', 
    category: 'funny', 
    text: 'Ցույց տուր, թե ինչպես ես դուրս գալիս ջրից՝ ինչպես դոլֆին:', 
    points: 25 
  },
  { 
    id: 59, 
    type: 'dare', 
    category: 'funny', 
    text: 'Նմանակիր սենյակում նստած 3 մարդու:', 
    points: 30 
  },
  { 
    id: 60, 
    type: 'dare', 
    category: 'funny', 
    text: 'Պատմիր անեկդոտ՝ առանց ծիծաղելու:', 
    points: 25 
  }
];

const categoryColors: CategoryColors = {
  hilarious: { bg: 'from-yellow-400 to-orange-500', text: 'text-yellow-700', icon: '😂' },
  'crazy-romantic': { bg: 'from-pink-400 to-rose-500', text: 'text-pink-700', icon: '💕' },
  awkward: { bg: 'from-purple-400 to-indigo-500', text: 'text-purple-700', icon: '😳' },
  funny: { bg: 'from-green-400 to-emerald-500', text: 'text-green-700', icon: '😄' },
  romantic: { bg: 'from-red-400 to-pink-500', text: 'text-red-700', icon: '❤️' },
  extreme: { bg: 'from-orange-500 to-red-600', text: 'text-orange-700', icon: '🔥' },
  embarrassing: { bg: 'from-blue-400 to-purple-500', text: 'text-blue-700', icon: '😳' },
  creative: { bg: 'from-teal-400 to-cyan-500', text: 'text-teal-700', icon: '🎨' },
  dance: { bg: 'from-fuchsia-400 to-purple-500', text: 'text-fuchsia-700', icon: '💃' },
  voice: { bg: 'from-sky-400 to-blue-500', text: 'text-sky-700', icon: '🎤' },
  food: { bg: 'from-amber-400 to-orange-500', text: 'text-amber-700', icon: '🍕' },
  story: { bg: 'from-violet-400 to-purple-500', text: 'text-violet-700', icon: '📖' },
  roleplay: { bg: 'from-rose-400 to-pink-500', text: 'text-rose-700', icon: '🎭' },
  photo: { bg: 'from-lime-400 to-green-500', text: 'text-lime-700', icon: '📸' },
  physical: { bg: 'from-red-500 to-orange-600', text: 'text-red-700', icon: '💪' },
  'new-year': { bg: 'from-red-400 to-green-500', text: 'text-red-700', icon: '🎄' }
};

const winnerPunishments = [
  // 🎭 Актерские
  'Դառնալ սենյակի "մարդ-ռադիո". 2 րոպե խոսել միայն հայտարարություններով, կարծես ռադիոհաղորդում ես վարում',
  'Պատմել ամբողջ կյանքի պատմությունը՝ սկսելով "Մի անգամ մի փոքրիկ ցուլ կար..."',
  'Կատարել հայտնի դերասանի մոնոլոգ, բայց փոխարինել բոլոր բառերը "լոլիկ" բառով',
  'Դառնալ "մարդ-էմոջի". 1 րոպե արտահայտել բոլոր զգացմունքները միայն դեմքի արտահայտությամբ',

  // 💃 Танцевальные
  'Պարել "մարինարովանոցի պար". Պարել կարծես ծովախեցգետին ես, որին նորից թաթախել են մարինադի մեջ',
  'Պարել ինչպես տիեզերագնաց՝ զրո ձգողության պայմաններում (շատ դանդաղ և տարօրինակ շարժումներով)',
  'Կատարել "թխվածքաբլիթի պար". Պարել կարծես թխվածքաբլիթ ես, որը փորձում է խուսափել կաթից',
  'Պարել ինչպես մոծակ՝ փորձելով խուսափել ձեռքի հարվածից',

  // 🎤 Музыкальные
  'Երգել հայտնի երգ՝ փոխարինելով բոլոր բայերը "խմել" բառով',
  'Կատարել ռեփ մեկ րոպե՝ միայն բանջարեղենների անուններ օգտագործելով',
  'Երգել "Ծնունդդ շնորհավոր" երգը, բայց կարծես ձմռան սառած ես',
  'Ստեղծել և կատարել կարճ օպերա սենյակի մասին՝ օգտագործելով պիցցայի ոճը',

  // 🎨 Творческие
  'Գծել ինքդ քեզ՝ օգտագործելով միայն քո ոտքերը (թղթի վրա)',
  'Ստեղծել արձան ինքդ քեզնից՝ օգտագործելով միայն այն իրերը, որոնք գտնվում են սեղանի վրա',
  'Գրել բանաստեղծություն ձեր աջ ձեռքի մասին՝ այն դիտարկելով որպես առանձին անձնավորություն',
  'Նկարել մոնա լիզայի ժպիտը՝ օգտագործելով սուրճի կաթիլներ',

  // 🤣 Смешные ситуации
  'Դառնալ "մարդ-մկնիկ". 1 րոպե փորձել վախենալ ամեն ինչից (բարձր ձայներից, հանկարծակի շարժումներից)',
  'Պատկերացնել, որ դու գազար ես և փորձել համոզել մյուսներին, որ արժե գնել հենց քեզ',
  'Դառնալ "մարդ-սարք". Ունենալ երևակայական կոճակներ և փորձել բացատրել, թե ինչի համար են դրանք',
  'Խաղալ գործադուլի սցենար՝ եթե դու լինեիր սենյակի լույսը',

  // 🍕 Кулинарные
  'Դառնալ պիցցայի գովազդող. 1 րոպե գովազդել պիցցան՝ օգտագործելով տիեզերական պատկերացումներ',
  'Պատրաստել երևակայական աղանդեր և նկարագրել դրա պատրաստման գաղտնիքները',
  'Խաղալ "խոհարարի մրցույթ". Շաբլոններ պատրաստել օդից և նկարագրել դրանց համը',
  'Դառնալ սուրճի զոդված շիշ և ցույց տալ, թե ինչպես է այն աշխատում',

  // 🎪 Цирковые
  'Կատարել ջուլհակի համարը՝ օգտագործելով օդի թելերը',
  'Դառնալ շրջիկ ցուցահանդեսի մարդ-ձուկ և ներկայանալ հանդիսատեսին',
  'Ցույց տալ ուժի համար՝ բարձրացնելով օդե բարձերը',
  'Կատարել հնարք՝ աներևակայելի բանից դարձնելով ևս ավելի աներևակայելի բան',

  // 📱 Технологические
  'Դառնալ մարդ-սմարթֆոն. 1 րոպե ցույց տալ, թե ինչպես ես աշխատում (բեռնում ես, խափանում ես, թարմացում ես կատարում)',
  'Պատկերացնել, որ դու վիրուս ես համակարգչում և փորձել նկարագրել քո օրը',
  'Խաղալ Wi-Fi ռաութերի դերը՝ բացատրելով, թե ինչու ես երբեմն դադարում աշխատել',
  'Դառնալ մարդ-էմոջի ստեղնաշար՝ արտաբերելով յուրաքանչյուր սեղմված կոճակի ձայնը',

  // 🦸 Супергеройские
  'Դառնալ "Խմորված Հացի մարդ". Գտնել և "չեզոքացնել" սենյակի բոլոր քաղցրավենիքները',
  'Պատկերացնել, որ դու սուպերհերոս ես, որի ուժը կայանում է նրանում, որ կարողանում ես գտնել կորցրած գուլպաները',
  'Դառնալ "Թեյի պայուսակի մարդ". Թեյի պայուսակի դեր խաղալ և ցույց տալ, թե ինչպես ես փրկում աշխարհը անհետաքրքիր երեկոներից',
  'Ստեղծել և ներկայացնել սուպերհերոսի կոստյում՝ օգտագործելով միայն սեղանի սրբիչներ',

  // 🎄 Праздничные
  'Դառնալ մարդ-անձրև. Ձայնային էֆեկտներով նկարագրել անձրևը, որը դուրս է գալիս գարնանային հագուստով',
  'Պատկերացնել, որ դու եղևնի ես Նոր տարում և գանգատվել, որ քեզ չեն զարդարել',
  'Կատարել մարդ-հրավառություն. Ձայնային և շարժողական էֆեկտներով ցույց տալ հրավառությունը',
  'Դառնալ մարդ-փաթիլ. 1 րոպե ցույց տալ, թե ինչպես ես հանդարտ սահում օդում',

  // 🎭 Театральные миниатюры
  'Խաղալ սցենար՝ եթե սենյակի բոլոր մարդիկ լինեին սուրճի տարբեր տեսակներ',
  'Ցույց տալ, թե ինչպես կանցներ օրը, եթե դու լինեիր սենյակի պատի ժամացույցը',
  'Դառնալ "մարդ-օդերևութաբան". Կանխատեսել եղանակը՝ հիմնվելով սենյակի տրամադրության վրա',
  'Խաղալ դրամա՝ եթե սեղանը լիներ թատրոնի բեմ և պատմեր իր պատմությունը',

  // 🤪 Сумасшедшие
  'Դառնալ "շրջված մարդ". 2 րոպե ամեն ինչ անել հակառակը (խոսել ետևից առաջ, քայլել հետ ուղղությամբ և այլն)',
  'Պատկերացնել, որ դու կենդանաբանական այգու առաջին այցելուն ես և նկարագրել բոլորին որպես կենդանիներ',
  'Դառնալ "մարդ-էխո". Կրկնել վերջին բառը ամեն նախադասությունից',
  'Խաղալ, որ դու ժամանակի ճանապարհորդ ես 1980-ականներից և փորձել հասկանալ ժամանակակից տեխնիկան',

  // 🎁 Подарочные
  'Դառնալ "մարդ-նվեր". Փաթաթվել սեղանի սրբիչներով և նկարագրել, թե ինչ նվեր ես',
  'Ստեղծել անձնական պարգևատրության արարողություն և պարգևատրել բոլորին երևակայական մեդալներով',
  'Դառնալ "մարդ-բացիկ". Ասել 5 նախադասություն, որոնք հնչում են որպես տոնական բացիկի տեքստ',
  'Պատկերացնել, որ դու մարդ-կոնֆետ ես և նկարագրել քո համն ու հոտը',

  // 🌟 Звездные
  'Դառնալ մարդ-աստղ. 1 րոպե փայլել (փորձել արտացոլել լույսը կամ պարզապես ժպտալ)',
  'Կատարել "աստղային գիշերվա" համար՝ փորձելով լինել ամենապայծառ առարկան սենյակում',
  'Դառնալ մարդ-հորոսկոպ. Կանխատեսել բոլորի ապագան՝ հիմնվելով նրանց ներկա դիրքի վրա',
  'Պատկերացնել, որ դու աստղագետ ես և հայտնաբերել ես նոր համաստեղություն՝ "Սենյակի մարդիկ"'
];

  // Таймер для турнирного режима
  useEffect(() => {
    if (gameState === 'playing' && tournamentSettings.enabled && timeRemaining > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            endTournament();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
        }
      };
    }
  }, [gameState, tournamentSettings.enabled, timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const playSound = (type: 'spin' | 'click' | 'win' | 'drumroll' | 'complete') => {
    if (!soundEnabled) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    switch (type) {
      case 'spin':
        oscillator.frequency.value = 200;
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 2);
        break;
      case 'drumroll':
        for (let i = 0; i < 20; i++) {
          setTimeout(() => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.connect(gain);
            gain.connect(audioContext.destination);
            osc.frequency.value = 100 + Math.random() * 50;
            gain.gain.setValueAtTime(0.1, audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
            osc.start(audioContext.currentTime);
            osc.stop(audioContext.currentTime + 0.05);
          }, i * 100);
        }
        break;
      case 'click':
        oscillator.frequency.value = 800;
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
        break;
      case 'win':
        oscillator.frequency.value = 523.25;
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
        break;
      case 'complete':
        oscillator.frequency.value = 880;
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.8);
        break;
    }
  };

  const addPlayer = () => {
    if (newPlayerName.trim() && players.length < 12) {
      const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];
      setPlayers([...players, {
        id: Date.now().toString(),
        name: newPlayerName.trim(),
        avatar: randomAvatar,
        truthsCompleted: 0,
        daresCompleted: 0,
        totalScore: 0,
        achievements: []
      }]);
      setNewPlayerName('');
      playSound('click');
    }
  };

  const removePlayer = (id: string) => {
    setPlayers(players.filter(p => p.id !== id));
    playSound('click');
  };

  const startGame = () => {
    if (players.length >= 2) {
      setGameState('playing');
      startTimeRef.current = Date.now();

      if (tournamentSettings.enabled) {
        setTimeRemaining(tournamentSettings.duration * 60);
      }

      playSound('win');
    }
  };

  const selectRandomPlayer = () => {
    const randomIndex = Math.floor(Math.random() * players.length);
    setCurrentPlayer(players[randomIndex]);
    playSound('drumroll');
    setIsDrumRoll(true);
    setTimeout(() => setIsDrumRoll(false), 2000);
  };

  const spinWheel = () => {
    if (isSpinning || !currentPlayer) return;

    setIsSpinning(true);
    setSelectedType(null);
    playSound('spin');
    playSound('drumroll');

    const spins = 5 + Math.random() * 3;
    const finalRotation = wheelRotation + (360 * spins) + (Math.random() * 360);
    setWheelRotation(finalRotation);

    setTimeout(() => {
      const normalizedRotation = finalRotation % 360;
      const result = normalizedRotation < 180 ? 'truth' : 'dare';
      setSelectedType(result);
      setIsSpinning(false);
      playSound('win');

      setTimeout(() => {
        selectChallenge(result);
      }, 500);
    }, 3000);
  };

  const selectChallenge = (type: 'truth' | 'dare') => {
    const filteredChallenges = challenges.filter(c => c.type === type);
    const randomChallenge = filteredChallenges[Math.floor(Math.random() * filteredChallenges.length)];
    setCurrentChallenge(randomChallenge);
    setGameState('challenge');
  };

  const completeChallenge = (success: boolean) => {
    if (!currentPlayer || !currentChallenge) return;

    if (success) {
      const updatedPlayers = players.map(p => {
        if (p.id === currentPlayer.id) {
          const newAchievements = [...p.achievements];

          if (currentChallenge.type === 'truth') {
            p.truthsCompleted++;
            if (p.truthsCompleted === 5) newAchievements.push('truth_master');
          } else {
            p.daresCompleted++;
            if (p.daresCompleted === 5) newAchievements.push('dare_master');
          }

          if (p.truthsCompleted + p.daresCompleted === 10) newAchievements.push('challenge_king');

          return {
            ...p,
            totalScore: p.totalScore + currentChallenge.points,
            truthsCompleted: p.truthsCompleted,
            daresCompleted: p.daresCompleted,
            achievements: newAchievements
          };
        }
        return p;
      });

      setPlayers(updatedPlayers);
      setGameStats(prev => ({
        ...prev,
        totalChallenges: prev.totalChallenges + 1,
        totalTruths: currentChallenge.type === 'truth' ? prev.totalTruths + 1 : prev.totalTruths,
        totalDares: currentChallenge.type === 'dare' ? prev.totalDares + 1 : prev.totalDares
      }));

      setShowConfetti(true);
      playSound('complete');
      setTimeout(() => setShowConfetti(false), 3000);
    }

    setCurrentPlayer(null);
    setCurrentChallenge(null);
    setSelectedType(null);
    setGameState('playing');
    playSound('click');
  };

  const endTournament = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    const totalTime = (Date.now() - startTimeRef.current) / 1000;
    const sortedPlayers = [...players].sort((a, b) => b.totalScore - a.totalScore);
    const winner = sortedPlayers[0];

    // Выбираем случайного проигравшего (не победителя)
    const losers = sortedPlayers.slice(1);
    const randomLoser = losers[Math.floor(Math.random() * losers.length)];

    setTournamentWinner(winner);
    setLoserForPunishment(randomLoser);

    setGameStats(prev => ({
      ...prev,
      totalTime,
      mvpPlayer: winner
    }));

    setGameState('stats');
    setShowConfetti(true);
    playSound('win');
  };

  const endGame = () => {
    if (tournamentSettings.enabled) {
      endTournament();
    } else {
      const totalTime = (Date.now() - startTimeRef.current) / 1000;
      const mvp = [...players].sort((a, b) => b.totalScore - a.totalScore)[0];

      setGameStats(prev => ({
        ...prev,
        totalTime,
        mvpPlayer: mvp
      }));

      setGameState('stats');
      setShowConfetti(true);
      playSound('win');
    }
  };

  const resetGame = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    setGameState('setup');
    setPlayers(players.map(p => ({
      ...p,
      truthsCompleted: 0,
      daresCompleted: 0,
      totalScore: 0,
      achievements: []
    })));
    setCurrentPlayer(null);
    setCurrentChallenge(null);
    setSelectedType(null);
    setTimeRemaining(0);
    setTournamentWinner(null);
    setLoserForPunishment(null);
    setGameStats({
      totalChallenges: 0,
      totalTruths: 0,
      totalDares: 0,
      totalTime: 0,
      mvpPlayer: null
    });
    playSound('click');
  };

  const Confetti = () => {
    if (!showConfetti) return null;
    return (
      <div className="fixed inset-0 pointer-events-none z-50">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-fall"
            style={{
              left: `${(i * 13) % 100}%`,
              top: `-${(i * 7) % 20}%`,
              animationDelay: `${(i * 0.03) % 3}s`,
              animationDuration: `${3 + (i % 4)}s`,
            }}
          >
            <div className="text-2xl">
              {['🎉', '⭐', '💫', '✨', '🎊', '🎈'][i % 6]}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (gameState === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 flex items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-pulse"
              style={{
                left: `${(i * 17) % 100}%`,
                top: `${(i * 23) % 100}%`,
                animationDelay: `${(i * 0.5) % 3}s`,
              }}
            >
              <Heart className="w-8 h-8 text-pink-300" />
            </div>
          ))}
        </div>

        <div className="max-w-4xl w-full text-center relative z-10">
          <div className="mb-12 animate-bounce">
            <Target className="w-40 h-40 mx-auto text-yellow-300 drop-shadow-2xl" />
          </div>

          <h1 className="text-[80px] font-black mb-6 bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent drop-shadow-2xl animate-pulse">
            Правда или Действие
          </h1>

          <p className="text-4xl text-white/90 mb-12 font-bold">
            🎯 Ամանորյա Տարբերակ 🎯
          </p>

          <div className="grid grid-cols-3 gap-6 mb-12">
            <Card className="p-6 bg-white/10 backdrop-blur-xl border-2 border-white/20 hover:bg-white/20 transition-all transform hover:scale-110">
              <Zap className="w-16 h-16 mx-auto mb-3 text-yellow-300" />
              <p className="text-white font-bold text-lg">50+ Մարտահրավերներ</p>
            </Card>
            <Card className="p-6 bg-white/10 backdrop-blur-xl border-2 border-white/20 hover:bg-white/20 transition-all transform hover:scale-110">
              <Trophy className="w-16 h-16 mx-auto mb-3 text-amber-300" />
              <p className="text-white font-bold text-lg">Մրցաշարային ռեժիմ</p>
            </Card>
            <Card className="p-6 bg-white/10 backdrop-blur-xl border-2 border-white/20 hover:bg-white/20 transition-all transform hover:scale-110">
              <Heart className="w-16 h-16 mx-auto mb-3 text-pink-300" />
              <p className="text-white font-bold text-lg">Ռոմանտիկ Պահեր</p>
            </Card>
          </div>

          <Button
            onClick={() => {
              setGameState('setup');
              playSound('click');
            }}
            className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 hover:from-yellow-500 hover:via-pink-600 hover:to-purple-700 text-white !px-16 py-10 text-3xl font-black rounded-full shadow-2xl transform hover:scale-110 transition-all"
          >
            <Play className="mr-4 w-12 h-12" /> Սկսել
          </Button>
        </div>

        <div className="fixed left-[2rem] top-[2rem]">
          <Button
            onClick={() => {
              router.push('/');
            }}
            className="bg-white/10 backdrop-blur-lg hover:bg-white/20 border border-white/20 hover:scale-105 transition-all group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            <span className="ml-2">Գլխավոր</span>
          </Button>
        </div>
      </div>
    );
  }

  if (gameState === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="text-center flex-1">
              <Users className="w-24 h-24 mx-auto mb-4 text-yellow-300 animate-bounce" />
              <h1 className="text-6xl font-black text-white mb-2 drop-shadow-lg">Ավելացրեք Խաղացողներ</h1>
              <p className="text-2xl text-white/80">Մինիմում 2, Մաքսիմում 12 խաղացող</p>
            </div>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-4 bg-white/10 backdrop-blur-xl rounded-full hover:bg-white/20 transition-all"
            >
              {soundEnabled ? <Volume2 className="w-8 h-8 text-white" /> : <VolumeX className="w-8 h-8 text-white" />}
            </button>
          </div>

          {/* Турнирные настройки */}
          <Card className="p-8 bg-white/10 backdrop-blur-xl border-2 border-white/20 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <Trophy className="w-10 h-10 text-yellow-300" />
              <h2 className="text-3xl font-black text-white">Մրցաշարի ռեժիմ</h2>
            </div>

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <label className="text-xl text-white font-bold">Միացնել մրցաշարը։</label>
                <button
                  onClick={() => setTournamentSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
                  className={`px-8 py-3 rounded-xl font-bold text-xl transition-all ${tournamentSettings.enabled
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                      : 'bg-white/20'
                    } text-white`}
                >
                  {tournamentSettings.enabled ? '✓ Միացված է' : 'Անջատված է'}
                </button>
              </div>
            </div>

            {tournamentSettings.enabled && (
              <div className="space-y-4">
                <div>
                  <label className="text-xl text-white font-bold mb-3 block">
                    <Clock className="inline w-6 h-6 mr-2" />
                    Մրցաշարի տևողությունը: {tournamentSettings.duration} րոպե
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    step="5"
                    value={tournamentSettings.duration}
                    onChange={(e) => setTournamentSettings(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    className="w-full h-3 bg-white/20 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-white/60 text-sm mt-2">
                    <span>5 րոպե</span>
                    <span>15 րոպե</span>
                    <span>30 րոպե</span>
                  </div>
                </div>

                <div className="p-4 bg-yellow-500/20 rounded-xl border-2 border-yellow-500/50">
                  <p className="text-white text-lg">
                    ⏱️ Խաղը ավտոմատ կերպով կավարտվի {tournamentSettings.duration} րոպեից
                  </p>
                  <p className="text-white/80 text-sm mt-2">
                    🏆 Հաղթողը կընտրի պարտվողին, որպեսզի նա կատարի իր ցանկությունը։
                  </p>
                </div>
              </div>
            )}
          </Card>

          <Card className="p-8 bg-white/10 backdrop-blur-xl border-2 border-white/20 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <input
                type="text"
                placeholder="🎮 Մուտքագրեք անունը..."
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
                className="flex-1 px-6 py-4 text-xl bg-white/20 border-2 border-white/30 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:border-pink-400"
                maxLength={20}
              />
              <Button
                onClick={addPlayer}
                disabled={players.length >= 12}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 px-8 text-lg font-bold"
              >
                <Plus className="w-6 h-6 mr-2" /> Ավելացնել
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {players.map((player, index) => (
                <Card key={player.id} className="p-4 bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-xl border-2 border-white/30 hover:border-pink-400 transition-all transform hover:scale-105">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">{player.avatar}</div>
                      <div>
                        <p className="text-xl font-bold text-white">{player.name}</p>
                        <p className="text-sm text-white/60">Խաղացող #{index + 1}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removePlayer(player.id)}
                      className="p-2 hover:bg-red-500/50 rounded-full transition-all"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>

            {players.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-24 h-24 mx-auto mb-4 text-white/30" />
                <p className="text-xl text-white/50">Ավելացրեք խաղացողներ սկսելու համար</p>
              </div>
            )}
          </Card>

          <div className="flex justify-center gap-6">
            <Button
              onClick={() => setGameState('intro')}
              className="bg-white/10 hover:bg-white/20 px-10 py-6 text-xl font-bold"
            >
              ← Վերադառնալ
            </Button>
            <Button
              onClick={startGame}
              disabled={players.length < 2}
              className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 hover:from-yellow-500 hover:via-pink-600 hover:to-purple-700 px-16 py-6 text-2xl font-black disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl"
            >
              <Play className="mr-3 w-8 h-8" />
              {tournamentSettings.enabled ? `Սկսել մրցաշարը (${tournamentSettings.duration} րոպե)` : `Սկսել Խաղը (${players.length} խաղացող)`}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'playing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 p-8">
        <Confetti />

        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-5xl font-black text-white drop-shadow-lg">🎯 Правда или Действие</h1>
              <p className="text-xl text-white/70 mt-2">Ամանորյա Մարտահրավերներ</p>
            </div>
            <div className="flex items-center gap-4">
              {tournamentSettings.enabled && (
                <div className={`px-8 py-4 rounded-xl font-black text-3xl ${timeRemaining <= 60 ? 'bg-red-500 animate-pulse' : 'bg-white/10 backdrop-blur-xl'
                  } text-white`}>
                  <Timer className="inline w-8 h-8 mr-2" />
                  {formatTime(timeRemaining)}
                </div>
              )}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-4 bg-white/10 backdrop-blur-xl rounded-full hover:bg-white/20 transition-all"
              >
                {soundEnabled ? <Volume2 className="w-6 h-6 text-white" /> : <VolumeX className="w-6 h-6 text-white" />}
              </button>
              <Button
                onClick={endGame}
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 px-8 py-4 text-lg font-bold"
              >
                <Trophy className="mr-2" /> Ավարտել Խաղը
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-1">
              <Card className="p-6 bg-white/10 backdrop-blur-xl border-2 border-white/20 h-full">
                <div className="flex items-center gap-3 mb-6">
                  <Users className="w-8 h-8 text-yellow-300" />
                  <h2 className="text-2xl font-bold text-white">Խաղացողներ</h2>
                </div>

                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {[...players].sort((a, b) => b.totalScore - a.totalScore).map((player, index) => (
                    <Card
                      key={player.id}
                      className={`p-4 transition-all transform hover:scale-105 ${currentPlayer?.id === player.id
                          ? 'bg-gradient-to-r from-yellow-400 to-orange-500 border-4 border-yellow-300 shadow-2xl'
                          : 'bg-white/10 backdrop-blur-xl border-2 border-white/20'
                        }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="text-3xl">{player.avatar}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {index === 0 && <Crown className="w-5 h-5 text-yellow-400" />}
                            <p className={`text-lg font-bold ${currentPlayer?.id === player.id ? 'text-white' : 'text-white'}`}>
                              {player.name}
                            </p>
                          </div>
                          <div className="flex gap-4 text-sm mt-1">
                            <span className={currentPlayer?.id === player.id ? 'text-white/90' : 'text-white/60'}>
                              💬 {player.truthsCompleted}
                            </span>
                            <span className={currentPlayer?.id === player.id ? 'text-white/90' : 'text-white/60'}>
                              🔥 {player.daresCompleted}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-2xl font-black ${currentPlayer?.id === player.id ? 'text-white' : 'text-yellow-300'}`}>
                            {player.totalScore}
                          </p>
                          <p className={`text-xs ${currentPlayer?.id === player.id ? 'text-white/70' : 'text-white/50'}`}>
                            միավոր
                          </p>
                        </div>
                      </div>

                      {player.achievements.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {player.achievements.includes('truth_master') && (
                            <div className="text-xs bg-blue-500/50 px-2 py-1 rounded" title="Правда Мастер">💬⭐</div>
                          )}
                          {player.achievements.includes('dare_master') && (
                            <div className="text-xs bg-red-500/50 px-2 py-1 rounded" title="Действие Мастер">🔥⭐</div>
                          )}
                          {player.achievements.includes('challenge_king') && (
                            <div className="text-xs bg-yellow-500/50 px-2 py-1 rounded" title="Король Вызовов">👑</div>
                          )}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card className="p-8 bg-white/10 backdrop-blur-xl border-2 border-white/20">
                {!currentPlayer ? (
                  <div className="text-center py-20">
                    <div className={`mb-8 ${isDrumRoll ? 'animate-bounce' : ''}`}>
                      <Target className="w-32 h-32 mx-auto text-yellow-300 drop-shadow-2xl" />
                    </div>
                    <h2 className="text-4xl font-black text-white mb-6">
                      {isDrumRoll ? '🥁 Ընտրվում է խաղացող... 🥁' : 'Ընտրեք Խաղացող'}
                    </h2>
                    <Button
                      onClick={selectRandomPlayer}
                      disabled={isDrumRoll}
                      className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 px-12 py-6 text-2xl font-black shadow-2xl disabled:opacity-50"
                    >
                      <Sparkles className="mr-3 w-8 h-8" /> Պատահական Ընտրություն
                    </Button>

                    <div className="mt-8 pt-8 border-t-2 border-white/20">
                      <p className="text-white/70 mb-4 text-lg">Կամ ընտրեք ձեռքով:</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {players.map(player => (
                          <Button
                            key={player.id}
                            onClick={() => {
                              setCurrentPlayer(player);
                              playSound('click');
                            }}
                            className="bg-white/10 hover:bg-white/20 py-4"
                          >
                            <span className="text-2xl mr-2">{player.avatar}</span>
                            {player.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="mb-8 animate-pulse">
                      <div className="text-8xl mb-4">{currentPlayer.avatar}</div>
                      <h2 className="text-5xl font-black text-white mb-2">{currentPlayer.name}</h2>
                      <p className="text-2xl text-white/70">Պտտեք անիվը!</p>
                    </div>

                    <div className="relative w-80 h-80 mx-auto mb-8">
                      {/* Неоновое свечение */}
                      <div className="absolute inset-0 rounded-full blur-3xl opacity-60"
                        style={{
                          background: isSpinning
                            ? 'conic-gradient(from 0deg, #00f, #f0f, #f00, #ff0, #0ff, #00f)'
                            : 'radial-gradient(circle, rgba(255,0,255,0.4), transparent)'
                        }} />

                      <div
                        className={`relative w-full h-full rounded-full border-8 shadow-2xl transition-transform duration-3000 ease-out ${isSpinning ? 'animate-spin-slow' : ''
                          }`}
                        style={{
                          transform: `rotate(${wheelRotation}deg)`,
                          borderColor: '#fff',
                          boxShadow: '0 0 40px rgba(255,255,255,0.5), inset 0 0 60px rgba(255,255,255,0.2)'
                        }}
                      >
                        {/* Внутренний градиент */}
                        <div className="absolute inset-0 rounded-full overflow-hidden"
                          style={{ background: 'conic-gradient(from 0deg, #06b6d4 0deg 180deg, #f97316 180deg 360deg)' }}>

                          {/* Текст и иконки ПРАВДА */}
                          <div className="absolute top-[25%] left-1/2 -translate-x-1/2 text-center transform -rotate-45">
                            <div className="relative">
                              <div className="text-6xl mb-3 filter drop-shadow-[0_0_20px_rgba(255,255,255,0.9)]">💬</div>
                              <div className="text-white font-black text-3xl tracking-wider"
                                style={{
                                  textShadow: '0 0 20px rgba(255,255,255,0.8), 0 0 40px rgba(6,182,212,0.6)',
                                  fontFamily: 'Impact, sans-serif'
                                }}>
                                ПРАВДА
                              </div>
                            </div>
                          </div>

                          {/* Текст и иконки ДЕЙСТВИЕ */}
                          <div className="absolute bottom-[25%] left-1/2 -translate-x-1/2 text-center transform rotate-45">
                            <div className="relative">
                              <div className="text-6xl mb-3 filter drop-shadow-[0_0_20px_rgba(255,255,255,0.9)]">🔥</div>
                              <div className="text-white font-black text-3xl tracking-wider"
                                style={{
                                  textShadow: '0 0 20px rgba(255,255,255,0.8), 0 0 40px rgba(249,115,22,0.6)',
                                  fontFamily: 'Impact, sans-serif'
                                }}>
                                ДЕЙСТВИЕ
                              </div>
                            </div>
                          </div>

                          {/* Сегменты с границами */}
                          <div className="absolute inset-0">
                            {[0, 90, 180, 270].map((angle) => (
                              <div
                                key={angle}
                                className="absolute top-1/2 left-1/2 w-full h-0.5 bg-white/40 origin-left"
                                style={{ transform: `translate(-50%, -50%) rotate(${angle}deg)` }}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Центральная кнопка */}
                        <div className="absolute top-1/2 left-1/2 w-28 h-28 -translate-x-1/2 -translate-y-1/2 z-10">
                          <div className="w-full h-full rounded-full flex items-center justify-center relative"
                            style={{
                              background: 'radial-gradient(circle at 30% 30%, #fbbf24, #f59e0b, #d97706)',
                              boxShadow: '0 0 30px rgba(251,191,36,0.8), inset 0 -4px 20px rgba(0,0,0,0.3), inset 0 4px 10px rgba(255,255,255,0.5)'
                            }}>
                            <Zap className="w-14 h-14 text-white drop-shadow-lg animate-pulse"
                              style={{ filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.8))' }} />
                            {/* Кольца внутри */}
                            <div className="absolute inset-2 rounded-full border-4 border-white/30" />
                            <div className="absolute inset-4 rounded-full border-2 border-white/20" />
                          </div>
                        </div>
                      </div>

                      {/* Улучшенная стрелка */}
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-20">
                        <div className="relative animate-bounce">
                          <div className="absolute -inset-4 blur-xl bg-yellow-400/60 rounded-full" />
                          <div className="relative">
                            <div className="w-0 h-0 border-l-[24px] border-r-[24px] border-t-[36px] border-l-transparent border-r-transparent"
                              style={{
                                borderTopColor: '#fbbf24',
                                filter: 'drop-shadow(0 6px 12px rgba(251,191,36,0.9))'
                              }} />
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-8 bg-gradient-to-b from-yellow-300 to-transparent" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {selectedType && !isSpinning && (
                      <div className="mb-6 p-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl animate-pulse">
                        <p className="text-3xl font-black text-white">
                          {selectedType === 'truth' ? '💬 ПРАВДА!' : '🔥 ДЕЙСТВИЕ!'}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-4 justify-center">
                      <Button
                        onClick={spinWheel}
                        disabled={isSpinning}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 px-12 py-6 text-2xl font-black disabled:opacity-50 shadow-2xl"
                      >
                        <RotateCcw className="mr-3 w-8 h-8" /> Պտտել
                      </Button>

                      <Button
                        onClick={() => {
                          setCurrentPlayer(null);
                          setSelectedType(null);
                          playSound('click');
                        }}
                        className="bg-white/10 hover:bg-white/20 px-8 py-6 text-xl font-bold"
                      >
                        Փոխել Խաղացողին
                      </Button>
                    </div>
                  </div>
                )}
              </Card>

              <Card className="mt-6 p-6 bg-white/10 backdrop-blur-xl border-2 border-white/20">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-400" />
                    <p className="text-3xl font-black text-white">{gameStats.totalChallenges}</p>
                    <p className="text-sm text-white/60">Ընդամենը</p>
                  </div>
                  <div>
                    <Heart className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                    <p className="text-3xl font-black text-white">{gameStats.totalTruths}</p>
                    <p className="text-sm text-white/60">Правда</p>
                  </div>
                  <div>
                    <Flame className="w-8 h-8 mx-auto mb-2 text-orange-400" />
                    <p className="text-3xl font-black text-white">{gameStats.totalDares}</p>
                    <p className="text-sm text-white/60">Действие</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'challenge') {
    if (!currentChallenge || !currentPlayer) return null;

    const categoryColor = categoryColors[currentChallenge.category];

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 p-8 flex items-center justify-center">
        <Confetti />

        <div className="max-w-4xl w-full">
          <Card className={`p-12 bg-gradient-to-br ${categoryColor.bg} border-4 border-white/30 shadow-2xl transform animate-scale-in`}>
            <div className="text-center mb-8">
              <div className="text-8xl mb-4 animate-bounce">{currentPlayer.avatar}</div>
              <h2 className="text-4xl font-black text-white mb-2">{currentPlayer.name}</h2>
              <div className="flex items-center justify-center gap-4">
                <div className={`px-6 py-3 bg-white/20 backdrop-blur-xl rounded-full text-2xl font-bold text-white`}>
                  {currentChallenge.type === 'truth' ? '💬 ПРАВДА' : '🔥 ДЕЙСТВИЕ'}
                </div>
                <div className="px-6 py-3 bg-white/20 backdrop-blur-xl rounded-full text-2xl font-bold text-white">
                  {categoryColor.icon} {currentChallenge.category}
                </div>
              </div>
            </div>

            <div className="bg-white/20 backdrop-blur-xl rounded-3xl p-10 mb-8 border-4 border-white/30">
              <p className="text-4xl font-bold text-white text-center leading-relaxed">
                {currentChallenge.text}
              </p>
            </div>

            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 px-8 py-4 bg-yellow-400 rounded-full">
                <Star className="w-10 h-10 text-yellow-900" />
                <span className="text-4xl font-black text-yellow-900">+{currentChallenge.points}</span>
                <span className="text-2xl font-bold text-yellow-900">միավոր</span>
              </div>
            </div>

            <div className="flex gap-6 justify-center">
              <Button
                onClick={() => completeChallenge(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 px-16 py-8 text-3xl font-black shadow-2xl transform hover:scale-110 transition-all"
              >
                <Award className="mr-4 w-10 h-10" /> Կատարեցի!
              </Button>

              <Button
                onClick={() => completeChallenge(false)}
                className="bg-white/20 hover:bg-white/30 px-12 py-8 text-2xl font-bold"
              >
                Բաց թողնել
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (gameState === 'stats') {
    const randomPunishment = winnerPunishments[Math.floor(Math.random() * winnerPunishments.length)];

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-8">
        <Confetti />

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Trophy className="w-32 h-32 mx-auto mb-6 text-yellow-300 animate-bounce" />
            <h1 className="text-7xl font-black text-white mb-4 drop-shadow-2xl">
              {tournamentSettings.enabled ? 'Турнир Завершен!' : 'Խաղն Ավարտվեց!'}
            </h1>
            <p className="text-3xl text-white/70">🎊 Ստատիստիկա և Հաղթողներ 🎊</p>
          </div>

          {gameStats.mvpPlayer && (
            <Card className="p-12 mb-8 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 border-4 border-yellow-300 shadow-2xl">
              <div className="text-center">
                <PartyPopper className="w-24 h-24 mx-auto mb-6 text-white animate-bounce" />
                <h2 className="text-5xl font-black text-white mb-6">🏆 MVP - ԽԱՂԻ ԱՍՏՂ 🏆</h2>
                <div className="text-9xl mb-4">{gameStats.mvpPlayer.avatar}</div>
                <h3 className="text-6xl font-black text-white mb-4">{gameStats.mvpPlayer.name}</h3>
                <div className="flex justify-center gap-8 text-white">
                  <div className="text-center">
                    <p className="text-5xl font-black">{gameStats.mvpPlayer.totalScore}</p>
                    <p className="text-2xl">Միավոր</p>
                  </div>
                  <div className="text-center">
                    <p className="text-5xl font-black">{gameStats.mvpPlayer.truthsCompleted}</p>
                    <p className="text-2xl">Правда</p>
                  </div>
                  <div className="text-center">
                    <p className="text-5xl font-black">{gameStats.mvpPlayer.daresCompleted}</p>
                    <p className="text-2xl">Действие</p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {tournamentSettings.enabled && loserForPunishment && (
            <Card className="p-12 mb-8 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 border-4 border-purple-300 shadow-2xl animate-pulse">
              <div className="text-center">
                <Gift className="w-24 h-24 mx-auto mb-6 text-white animate-bounce" />
                <h2 className="text-5xl font-black text-white mb-6">🎁 Հաղթողի ցանկությունը 🎁</h2>

                <div className="mb-8">
                  <p className="text-3xl text-white mb-4">Պարտվող:</p>
                  <div className="text-8xl mb-2">{loserForPunishment.avatar}</div>
                  <h3 className="text-5xl font-black text-white">{loserForPunishment.name}</h3>
                </div>

                <div className="bg-white/20 backdrop-blur-xl rounded-3xl p-10 border-4 border-white/30">
                  <p className="text-4xl font-bold text-white leading-relaxed">
                    {randomPunishment}
                  </p>
                </div>

                <p className="text-2xl text-white/80 mt-6">
                  Կատարիր այս առաջադրանքը հաղթողի համար։ 🎯
                </p>
              </div>
            </Card>
          )}

          <Card className="p-8 mb-8 bg-white/10 backdrop-blur-xl border-2 border-white/20">
            <h2 className="text-4xl font-black text-white mb-6 flex items-center gap-3">
              <TrendingUp className="w-10 h-10 text-green-400" />
              Ընդհանուր Ստատիստիկա
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-6 bg-white/10 rounded-2xl">
                <Target className="w-12 h-12 mx-auto mb-3 text-purple-400" />
                <p className="text-4xl font-black text-white">{gameStats.totalChallenges}</p>
                <p className="text-lg text-white/60">Մարտահրավերներ</p>
              </div>
              <div className="text-center p-6 bg-white/10 rounded-2xl">
                <Heart className="w-12 h-12 mx-auto mb-3 text-blue-400" />
                <p className="text-4xl font-black text-white">{gameStats.totalTruths}</p>
                <p className="text-lg text-white/60">Правда</p>
              </div>
              <div className="text-center p-6 bg-white/10 rounded-2xl">
                <Flame className="w-12 h-12 mx-auto mb-3 text-orange-400" />
                <p className="text-4xl font-black text-white">{gameStats.totalDares}</p>
                <p className="text-lg text-white/60">Действие</p>
              </div>
              <div className="text-center p-6 bg-white/10 rounded-2xl">
                <Users className="w-12 h-12 mx-auto mb-3 text-green-400" />
                <p className="text-4xl font-black text-white">{players.length}</p>
                <p className="text-lg text-white/60">Խաղացողներ</p>
              </div>
            </div>
          </Card>

          <Card className="p-8 mb-8 bg-white/10 backdrop-blur-xl border-2 border-white/20">
            <h2 className="text-4xl font-black text-white mb-6 flex items-center gap-3">
              <Trophy className="w-10 h-10 text-yellow-400" />
              Լիդերների Աղյուսակ
            </h2>
            <div className="space-y-4">
              {[...players].sort((a, b) => b.totalScore - a.totalScore).map((player, index) => (
                <Card
                  key={player.id}
                  className={`p-6 ${index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500 border-4 border-yellow-300' :
                      index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-400 border-2 border-gray-400' :
                        index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600 border-2 border-orange-500' :
                          'bg-white/10 backdrop-blur-xl border-2 border-white/20'
                    }`}
                >
                  <div className="flex items-center gap-6">
                    <div className="text-center min-w-[60px]">
                      {index === 0 && <Crown className="w-12 h-12 text-white mx-auto mb-2" />}
                      {index === 1 && <Award className="w-10 h-10 text-white mx-auto mb-2" />}
                      {index === 2 && <Star className="w-10 h-10 text-white mx-auto mb-2" />}
                      <p className="text-3xl font-black text-white">#{index + 1}</p>
                    </div>

                    <div className="text-5xl">{player.avatar}</div>

                    <div className="flex-1">
                      <p className="text-3xl font-black text-white mb-1">{player.name}</p>
                      <div className="flex gap-6 text-lg">
                        <span className="text-white/80">💬 {player.truthsCompleted} Правда</span>
                        <span className="text-white/80">🔥 {player.daresCompleted} Действие</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-5xl font-black text-white">{player.totalScore}</p>
                      <p className="text-lg text-white/70">միավոր</p>
                    </div>
                  </div>

                  {player.achievements.length > 0 && (
                    <div className="mt-4 flex gap-2">
                      {player.achievements.includes('truth_master') && (
                        <div className="px-4 py-2 bg-blue-500/50 rounded-full text-white font-bold">
                          💬 Իսկական վարպետ
                        </div>
                      )}
                      {player.achievements.includes('dare_master') && (
                        <div className="px-4 py-2 bg-red-500/50 rounded-full text-white font-bold">
                          🔥 Գործողությունների վարպետ
                        </div>
                      )}
                      {player.achievements.includes('challenge_king') && (
                        <div className="px-4 py-2 bg-yellow-500/50 rounded-full text-white font-bold">
                          👑 Մարտահրավերների արքա
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </Card>

          <div className="flex gap-6 justify-center">
            <Button
              onClick={resetGame}
              className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 px-12 py-6 text-2xl font-black shadow-2xl"
            >
              <RotateCcw className="mr-3 w-8 h-8" /> Նոր Խաղ
            </Button>

            <Button
              onClick={() => setGameState('intro')}
              className="bg-white/10 hover:bg-white/20 px-12 py-6 text-2xl font-bold"
            >
              Գլխավոր Էջ
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default TruthOrDareGame;
