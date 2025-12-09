"use client"

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Users, Zap, Trophy, Star, Gift, Puzzle, Target, Clock,
    Volume2, VolumeX, Plus, X, Crown, Award, Timer, RotateCcw,
    Play, SkipForward, Brain, Lightbulb, Shield, Sword, Sparkles,
    TrendingUp, BarChart3, MessageSquare, Eye, EyeOff, Music,
    Palette, Sparkle, Gamepad2, Castle, Globe, Atom, BookOpen,
    Calculator, Camera, Car, Cloud, Coffee, Compass, Database,
    Download, Feather, Film, Flag, FlaskConical, Heart, Home, Key,
    Layers, Leaf, Lock, Map, Moon, Package, Phone, Plane,
    Printer, Rocket, School, Server, ShoppingBag, Sun, Tag,
    Umbrella, Upload, Video, Wifi, Wind, Zap as Lightning
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';

interface SoundFiles {
    click: string;
    correct: string;
    incorrect: string;
    timer: string;
    win: string;
    lose: string;
    achievement: string;
    special: string;
    cardFlip: string;
    ambient: string;
}

// 🔧 Տիպեր
interface Player {
    id: string;
    name: string;
    avatar: string;
    role?: 'captain' | 'strategist' | 'analyst' | 'creative' | 'member';
}

interface Question {
    id: number;
    question: string;
    options: string[];
    answer: string;
    points: number;
    difficulty: 'easy' | 'medium' | 'hard';
}

interface Team {
    id: string;
    name: string;
    color: string;
    members: Player[];
    theme: string | null;
    puzzlePieces: number;
    puzzleRevealed: boolean[];
    completedPuzzle: boolean;
    score: number;
    currentRound: number;
    answeredQuestions: number[];
    usedQuestions: number[];
}

interface GameState {
    phase: 'setup' | 'theme-selection' | 'playing' | 'round-break' | 'finished';
    round: number;
    timeRemaining: number;
    activeTeam: number;
    currentQuestion: Question | null;
    showAnswer: boolean;
    timerActive: boolean;
}

// 🎵 Ձայնային ֆայլեր
const soundFiles: SoundFiles = {
    click: '/sounds/click.mp3',
    correct: '/sounds/correct.mp3',
    incorrect: '/sounds/incorrect.mp3',
    timer: '/sounds/timer.mp3',
    win: '/sounds/win.mp3',
    lose: '/sounds/lose.mp3',
    achievement: '/sounds/achievement.mp3',
    special: '/sounds/special.mp3',
    cardFlip: '/sounds/card-flip.mp3',
    ambient: '/sounds/ambient.mp3'
};

// 🧩 Հարցերի բազա ըստ թեմաների
const themeQuestions: Record<string, {
    title: string;
    description: string;
    questions: Question[];
}> = {
    "աշխարհի-յոթ-հրաշալիքներ": {
        title: "🌍 Աշխարհի Յոթ Հրաշալիքներ",
        description: "Հին և նոր հրաշալիքների մասին",
        questions: [
            { id: 1, question: "Ո՞րն է աշխարհի հնագույն հրաշալիքը, որ գոյություն ունի մինչ օրս:", options: ["Գիզայի բուրգեր", "Քյոլոսի արձան", "Բաբելոնի կախովի այգիներ"], answer: "Գիզայի բուրգեր", points: 10, difficulty: 'easy' },
            { id: 2, question: "Ո՞ր երկրում է գտնվում Տաջ Մահալը:", options: ["Պակիստան", "Հնդկաստան", "Բանգլադեշ"], answer: "Հնդկաստան", points: 10, difficulty: 'easy' },
            { id: 3, question: "Ո՞ր հրաշալիքն է կառուցվել Հռոմի կայսրության ժամանակ:", options: ["Կոլոսեում", "Մաչու Պիկչու", "Պետրա"], answer: "Կոլոսեում", points: 10, difficulty: 'easy' },
            { id: 4, question: "Քրիստոսի Փրկիչ արձանը գտնվում է ո՞ր քաղաքում:", options: ["Ռիո դե Ժանեյրո", "Բուենոս Այրես", "Լիմա"], answer: "Ռիո դե Ժանեյրո", points: 10, difficulty: 'easy' },
            { id: 5, question: "Ո՞ր հրաշալիքն է համարվում աշխարհի ամենաերկար պատը:", options: ["Մեծ Պատը", "Հադրիանոսի պատը", "Կրեմլի պատը"], answer: "Մեծ Պատը", points: 10, difficulty: 'easy' },
            { id: 6, question: "Քանի՞ մետր է Գիզայի մեծ բուրգի բարձրությունը:", options: ["136.4 մ", "146.6 մ", "156.8 մ"], answer: "146.6 մ", points: 20, difficulty: 'medium' },
            { id: 7, question: "Ո՞ր թագավորի համար է կառուցվել Տաջ Մահալը:", options: ["Շահ Ջահան", "Ակբար Մեծ", "Աուրանգզեբ"], answer: "Շահ Ջահան", points: 20, difficulty: 'medium' },
            { id: 8, question: "Մաչու Պիկչուն պատկանում է ո՞ր քաղաքակրթությանը:", options: ["Ինկերի", "Ացտեկների", "Մայաների"], answer: "Ինկերի", points: 20, difficulty: 'medium' },
            { id: 9, question: "Ո՞ր թվականին է ավարտվել Քրիստոսի Փրկիչ արձանի կառուցումը:", options: ["1922", "1931", "1945"], answer: "1931", points: 30, difficulty: 'hard' },
            { id: 10, question: "Քանի՞ սյուն կա Պարթենոնում:", options: ["46", "58", "64"], answer: "46", points: 30, difficulty: 'hard' },
            { id: 11, question: "Ո՞ր հրաշալիքն է գտնվում Հորդանանում:", options: ["Պետրա", "Պարթենոն", "Ալհամբրա"], answer: "Պետրա", points: 15, difficulty: 'medium' },
            { id: 12, question: "Ո՞րն է միակ հրաշալիքը, որ գտնվում է Հարավային Ամերիկայում:", options: ["Մաչու Պիկչու", "Քրիստոսի Փրկիչ", "Սուրբ Ֆամիլիա"], answer: "Մաչու Պիկչու", points: 15, difficulty: 'medium' },
            { id: 13, question: "Քանի՞ հրաշալիք է գտնվում Եվրոպայում:", options: ["1", "2", "3"], answer: "2", points: 20, difficulty: 'hard' },
            { id: 14, question: "Ո՞ր հրաշալիքն է կառուցվել 20-րդ դարում:", options: ["Քրիստոսի Փրկիչ", "Տաջ Մահալ", "Կոլոսեում"], answer: "Քրիստոսի Փրկիչ", points: 15, difficulty: 'medium' },
            { id: 15, question: "Ո՞ր հրաշալիքն է համարվում աշխարհի ամենամեծ եկեղեցին:", options: ["Սուրբ Ֆամիլիա", "Սուրբ Պետրոսի տաճար", "Քրիստոսի Փրկիչ"], answer: "Սուրբ Պետրոսի տաճար", points: 20, difficulty: 'hard' }
        ]
    },

    "տիեզերական-ոդիսական": {
        title: "🚀 Տիեզերական Ոդիսական",
        description: "Տիեզերքի և տիեզերագնացության մասին",
        questions: [
            { id: 16, question: "Ո՞ր մոլորակն է կոչվում Կարմիր մոլորակ:", options: ["Վեներա", "Մարս", "Յուպիտեր"], answer: "Մարս", points: 10, difficulty: 'easy' },
            { id: 17, question: "Մարդու առաջին թռիչքը դեպի Լուսին տեղի է ունեցել ո՞ր թվականին:", options: ["1965", "1969", "1972"], answer: "1969", points: 10, difficulty: 'easy' },
            { id: 18, question: "Արևի ամենամոտ մոլորակը ո՞րն է:", options: ["Մերկուրի", "Վեներա", "Երկիր"], answer: "Մերկուրի", points: 10, difficulty: 'easy' },
            { id: 19, question: "Ո՞րն է Արեգակնային համակարգի ամենամեծ մոլորակը:", options: ["Սատուրն", "Յուպիտեր", "Ուրան"], answer: "Յուպիտեր", points: 20, difficulty: 'medium' },
            { id: 20, question: "Քանի՞ արբանյակ ունի Մարսը:", options: ["1", "2", "3"], answer: "2", points: 20, difficulty: 'medium' },
            { id: 21, question: "Ո՞ր տարածքն է զբաղեցնում մեր գալակտիկան տիեզերքում:", options: ["100,000 լուսային տարի", "150,000 լուսային տարի", "200,000 լուսային տարի"], answer: "100,000 լուսային տարի", points: 30, difficulty: 'hard' },
            { id: 22, question: "Ո՞վ է եղել առաջին մարդը տիեզերքում:", options: ["Յուրի Գագարին", "Նիլ Արմստրոնգ", "Ջոն Գլեն"], answer: "Յուրի Գագարին", points: 15, difficulty: 'medium' },
            { id: 23, question: "Քանի՞ մոլորակ կա Արեգակնային համակարգում:", options: ["7", "8", "9"], answer: "8", points: 15, difficulty: 'medium' },
            { id: 24, question: "Ո՞ր մոլորակն ունի ամենամեծ օղակները:", options: ["Սատուրն", "Յուպիտեր", "Ուրան"], answer: "Սատուրն", points: 15, difficulty: 'easy' },
            { id: 25, question: "Ո՞ր մոլորակն է ամենացուրտը:", options: ["Նեպտուն", "Ուրան", "Պլուտոն"], answer: "Նեպտուն", points: 20, difficulty: 'hard' },
            { id: 26, question: "Քանի՞ արբանյակ ունի Յուպիտերը:", options: ["79", "82", "95"], answer: "95", points: 25, difficulty: 'hard' },
            { id: 27, question: "Ո՞ր տարեթվին մարդն առաջին անգամ ոտք դրեց Լուսնի վրա:", options: ["1969", "1971", "1965"], answer: "1969", points: 10, difficulty: 'easy' },
            { id: 28, question: "Ո՞ր մոլորակն է հայտնաբերվել աստղադիտակով:", options: ["Ուրան", "Նեպտուն", "Պլուտոն"], answer: "Ուրան", points: 20, difficulty: 'medium' },
            { id: 29, question: "Քանի՞ րոպեում է լույսը հասնում Երկիր Լուսինից:", options: ["1.3", "2.5", "3.8"], answer: "1.3", points: 25, difficulty: 'hard' },
            { id: 30, question: "Ո՞ր մոլորակն է ամենաարագը պտտվում իր առանցքի շուրջ:", options: ["Յուպիտեր", "Սատուրն", "Մերկուրի"], answer: "Յուպիտեր", points: 20, difficulty: 'medium' }
        ]
    },

    "հայկական-պատմություն": {
        title: "🏛️ Հայկական Պատմություն",
        description: "Հայաստանի պատմության և մշակույթի մասին",
        questions: [
            { id: 31, question: "Ո՞ր թվականին Հայաստանն ընդունեց քրիստոնեությունը որպես պետական կրոն:", options: ["301", "451", "387"], answer: "301", points: 10, difficulty: 'easy' },
            { id: 32, question: "Ո՞վ է համարվում հայոց գրերի ստեղծողը:", options: ["Մեսրոպ Մաշտոց", "Գրիգոր Լուսավորիչ", "Սահակ Պարթև"], answer: "Մեսրոպ Մաշտոց", points: 10, difficulty: 'easy' },
            { id: 33, question: "Ո՞րն է Հայաստանի մայրաքաղաքը:", options: ["Գյումրի", "Երևան", "Վանաձոր"], answer: "Երևան", points: 10, difficulty: 'easy' },
            { id: 34, question: "Ո՞ր թագավորի օրոք Հայաստանը հասավ իր հզորության գագաթնակետին:", options: ["Տիգրան Մեծ", "Արտաշես Ա", "Վաղարշակ"], answer: "Տիգրան Մեծ", points: 20, difficulty: 'medium' },
            { id: 35, question: "Քանի՞ տառ ունի հայոց այբուբենը:", options: ["36", "38", "39"], answer: "39", points: 20, difficulty: 'medium' },
            { id: 36, question: "Ո՞ր թվականին ստեղծվեց Հայաստանի Հանրապետության առաջին հանրապետությունը:", options: ["1918", "1920", "1991"], answer: "1918", points: 30, difficulty: 'hard' },
            { id: 37, question: "Ո՞րն է Հայաստանի ամենաբարձր լեռը:", options: ["Արագած", "Արարատ", "Կապուտջուղ"], answer: "Արարատ", points: 15, difficulty: 'medium' },
            { id: 38, question: "Քանի՞ մայրցամաքում է գտնվում Հայաստանը:", options: ["1", "2", "3"], answer: "2", points: 20, difficulty: 'hard' },
            { id: 39, question: "Ո՞վ է հայոց այբուբենի ստեղծման տարեթիվը:", options: ["405", "451", "301"], answer: "405", points: 15, difficulty: 'medium' },
            { id: 40, question: "Ո՞րն է Հայաստանի ամենամեծ լիճը:", options: ["Սևանա լիճ", "Արփի լիճ", "Պարզ լիճ"], answer: "Սևանա լիճ", points: 10, difficulty: 'easy' },
            { id: 41, question: "Քանի՞ գավառ կար Մեծ Հայքում:", options: ["15", "20", "25"], answer: "15", points: 25, difficulty: 'hard' },
            { id: 42, question: "Ո՞վ է եղել հայոց առաջին թագավորը:", options: ["Արգիշտի Ա", "Տիգրան Ա", "Արամ"], answer: "Արամ", points: 20, difficulty: 'medium' },
            { id: 43, question: "Ո՞ր թվականին է տեղի ունեցել Ավարայրի ճակատամարտը:", options: ["451", "387", "301"], answer: "451", points: 20, difficulty: 'medium' },
            { id: 44, question: "Քանի՞ հրեշտակ կա Սուրբ Էջմիածնի տաճարի վրա:", options: ["4", "6", "8"], answer: "4", points: 25, difficulty: 'hard' },
            { id: 45, question: "Ո՞րն է Հայաստանի ամենահին քաղաքը:", options: ["Երևան", "Գյումրի", "Վան"], answer: "Երևան", points: 15, difficulty: 'medium' }
        ]
    },

    "գիտական-հայտնագործություններ": {
        title: "🔬 Գիտական Հայտնագործություններ",
        description: "Մեծագույն գիտական հայտնագործություններ",
        questions: [
            { id: 46, question: "Ո՞վ է հայտնագործել ձգողականության օրենքը:", options: ["Ալբերտ Այնշտայն", "Իսահակ Նյուտոն", "Գալիլեո Գալիլեյ"], answer: "Իսահակ Նյուտոն", points: 10, difficulty: 'easy' },
            { id: 47, question: "Ո՞վ է համարվում համակարգիչների հայրը:", options: ["Ալան Թյուրինգ", "Չարլզ Բաբիջ", "Բիլ Գեյթս"], answer: "Չարլզ Բաբիջ", points: 10, difficulty: 'easy' },
            { id: 48, question: "Ո՞ր գիտնականն է բացահայտել ռադիումը:", options: ["Մարի Կյուրի", "Ալբերտ Այնշտայն", "Նիլս Բոր"], answer: "Մարի Կյուրի", points: 20, difficulty: 'medium' },
            { id: 49, question: "Քանի՞ քրոմոսոմ ունի մարդը:", options: ["46", "48", "50"], answer: "46", points: 30, difficulty: 'hard' },
            { id: 50, question: "Ո՞վ է հայտնագործել պենիցիլինը:", options: ["Ալեքսանդր Ֆլեմինգ", "Լուի Պաստյոր", "Ռոբերտ Կոխ"], answer: "Ալեքսանդր Ֆլեմինգ", points: 20, difficulty: 'medium' },
            { id: 51, question: "Ո՞ր թվականին է հայտնագործվել էլեկտրականությունը:", options: ["1752", "1800", "1879"], answer: "1752", points: 25, difficulty: 'hard' },
            { id: 52, question: "Քանի՞ տարր կա պարբերական աղյուսակում:", options: ["118", "120", "92"], answer: "118", points: 25, difficulty: 'hard' },
            { id: 53, question: "Ո՞վ է ստեղծել հարաբերականության տեսությունը:", options: ["Ալբերտ Այնշտայն", "Իսահակ Նյուտոն", "Ստիվեն Հոքինգ"], answer: "Ալբերտ Այնշտայն", points: 20, difficulty: 'medium' },
            { id: 54, question: "Քանի՞ կարգաբանված տեսակի կենդանի է հայտնի:", options: ["1.5 միլիոն", "8.7 միլիոն", "12 միլիոն"], answer: "8.7 միլիոն", points: 30, difficulty: 'hard' },
            { id: 55, question: "Ո՞վ է հայտնագործել ռադիոն:", options: ["Գուլիելմո Մարկոնի", "Նիկոլա Տեսլա", "Չարլզ Դարվին"], answer: "Գուլիելմո Մարկոնի", points: 20, difficulty: 'medium' },
            { id: 56, question: "Քանի՞ ոտք ունի սարդը:", options: ["6", "8", "10"], answer: "8", points: 10, difficulty: 'easy' },
            { id: 57, question: "Ո՞վ է ստեղծել առաջին ավտոմոբիլը:", options: ["Կառլ Բենց", "Հենրի Ֆորդ", "Ռուդոլֆ Դիզել"], answer: "Կառլ Բենց", points: 20, difficulty: 'medium' },
            { id: 58, question: "Քանի՞ ատոմ ունի ջրի մոլեկուլը:", options: ["2", "3", "4"], answer: "3", points: 15, difficulty: 'easy' },
            { id: 59, question: "Ո՞վ է հայտնագործել վակցինան:", options: ["Էդվարդ Ջեններ", "Լուի Պաստյոր", "Ալեքսանդր Ֆլեմինգ"], answer: "Էդվարդ Ջեններ", points: 20, difficulty: 'medium' },
            { id: 60, question: "Քանի՞ նեյտրոն ունի ուրանի 235 իզոտոպը:", options: ["143", "146", "92"], answer: "143", points: 30, difficulty: 'hard' }
        ]
    },

    "աշխարհագրական-հրաշալիքներ": {
        title: "🗺️ Աշխարհագրական Հրաշալիքներ",
        description: "Բնության հրաշալիքներ և աշխարհագրական ռեկորդներ",
        questions: [
            { id: 61, question: "Ո՞րն է աշխարհի ամենաերկար գետը:", options: ["Ամազոն", "Նեղոս", "Յանցզի"], answer: "Նեղոս", points: 10, difficulty: 'easy' },
            { id: 62, question: "Ո՞րն է աշխարհի ամենաբարձր լեռը:", options: ["Կիլիմանջարո", "Էվերեստ", "Ակոնկագուա"], answer: "Էվերեստ", points: 10, difficulty: 'easy' },
            { id: 63, question: "Ո՞ր մայրցամաքն է ամենափոքրը:", options: ["Ավստրալիա", "Անտարկտիդա", "Եվրոպա"], answer: "Ավստրալիա", points: 20, difficulty: 'medium' },
            { id: 64, question: "Քանի՞ օվկիանոս կա աշխարհում:", options: ["4", "5", "6"], answer: "5", points: 30, difficulty: 'hard' },
            { id: 65, question: "Ո՞րն է աշխարհի ամենամեծ անապատը:", options: ["Սահարա", "Արաբական", "Գոբի"], answer: "Սահարա", points: 15, difficulty: 'medium' },
            { id: 66, question: "Քանի՞ երկիր կա աշխարհում:", options: ["195", "206", "150"], answer: "195", points: 25, difficulty: 'hard' },
            { id: 67, question: "Ո՞րն է աշխարհի ամենախոր օվկիանոսը:", options: ["Խաղաղ օվկիանոս", "Ատլանտյան օվկիանոս", "Հնդկական օվկիանոս"], answer: "Խաղաղ օվկիանոս", points: 20, difficulty: 'medium' },
            { id: 68, question: "Ո՞րն է աշխարհի ամենամեծ կղզին:", options: ["Գրենլանդիա", "Ավստրալիա", "Նոր Գվինեա"], answer: "Գրենլանդիա", points: 15, difficulty: 'medium' },
            { id: 69, question: "Քանի՞ ժամանակային գոտի կա աշխարհում:", options: ["24", "12", "36"], answer: "24", points: 20, difficulty: 'medium' },
            { id: 70, question: "Ո՞րն է աշխարհի ամենամեծ լիճը:", options: ["Կասպից ծով", "Վերին լիճ", "Վիկտորիա"], answer: "Կասպից ծով", points: 20, difficulty: 'hard' },
            { id: 71, question: "Ո՞րն է աշխարհի ամենաբարձր ջրվեժը:", options: ["Անխել", "Վիկտորիա", "Նիագարա"], answer: "Անխել", points: 20, difficulty: 'medium' },
            { id: 72, question: "Քանի՞ մայրցամաք կա աշխարհում:", options: ["5", "6", "7"], answer: "7", points: 15, difficulty: 'easy' },
            { id: 73, question: "Ո՞րն է աշխարհի ամենահին քաղաքը:", options: ["Երուսաղեմ", "Դամասկոս", "Աթենք"], answer: "Դամասկոս", points: 25, difficulty: 'hard' },
            { id: 74, question: "Քանի՞ լեզու կա աշխարհում:", options: ["5000", "7000", "10000"], answer: "7000", points: 30, difficulty: 'hard' },
            { id: 75, question: "Ո՞րն է աշխարհի ամենամեծ պետությունը:", options: ["Ռուսաստան", "Կանադա", "Չինաստան"], answer: "Ռուսաստան", points: 15, difficulty: 'medium' }
        ]
    },

    "արվեստի-շեփորներ": {
        title: "🎨 Արվեստի Շեփորներ",
        description: "Արվեստի աշխարհի գլուխգործոցներ",
        questions: [
            { id: 76, question: "Ո՞վ է նկարել Մոնա Լիզան:", options: ["Վինչենթ վան Գոգ", "Լեոնարդո դա Վինչի", "Պաբլո Պիկասո"], answer: "Լեոնարդո դա Վինչի", points: 10, difficulty: 'easy' },
            { id: 77, question: "Քանի՞ նկար կա Վան Գոգի աստղային գիշերը:", options: ["1", "2", "3"], answer: "2", points: 20, difficulty: 'medium' },
            { id: 78, question: "Ո՞ր երկրում է ծնվել Պաբլո Պիկասոն:", options: ["Իսպանիա", "Ֆրանսիա", "Իտալիա"], answer: "Իսպանիա", points: 15, difficulty: 'medium' },
            { id: 79, question: "Ո՞ր դարում է ապրել Ռաֆայելը:", options: ["15-րդ", "16-րդ", "17-րդ"], answer: "16-րդ", points: 20, difficulty: 'hard' },
            { id: 80, question: "Քանի՞ ջրաներկ նկար է ստեղծել Ուիլյամ Թըրները:", options: ["300", "500", "700"], answer: "300", points: 25, difficulty: 'hard' }
        ]
    }
};

// 🎭 Թեմաների ցանկ
const themes = [
    { id: "աշխարհի-յոթ-հրաշալիքներ", name: "🌍 Աշխարհի Յոթ Հրաշալիքներ", color: "from-blue-500 to-purple-600", icon: <Globe className="w-8 h-8" /> },
    { id: "տիեզերական-ոդիսական", name: "🚀 Տիեզերական Ոդիսական", color: "from-indigo-500 to-cyan-600", icon: <Rocket className="w-8 h-8" /> },
    { id: "հայկական-պատմություն", name: "🏛️ Հայկական Պատմություն", color: "from-orange-500 to-red-600", icon: <Castle className="w-8 h-8" /> },
    { id: "գիտական-հայտնագործություններ", name: "🔬 Գիտական Հայտնագործություններ", color: "from-green-500 to-emerald-600", icon: <FlaskConical className="w-8 h-8" /> },
    { id: "աշխարհագրական-հրաշալիքներ", name: "🗺️ Աշխարհագրական Հրաշալիքներ", color: "from-yellow-500 to-amber-600", icon: <Compass className="w-8 h-8" /> },
    { id: "արվեստի-շեփորներ", name: "🎨 Արվեստի Շեփորներ", color: "from-pink-500 to-rose-600", icon: <Palette className="w-8 h-8" /> },
    { id: "երաժշտական-լեգենդներ", name: "🎵 Երաժշտական Լեգենդներ", color: "from-purple-500 to-violet-600", icon: <Music className="w-8 h-8" /> },
    { id: "սպորտային-ռեկորդներ", name: "⚽ Սպորտային Ռեկորդներ", color: "from-lime-500 to-green-600", icon: <Trophy className="w-8 h-8" /> }
];

// 🧩 Պազլի նկարներ ըստ թեմաների
const puzzleImages: Record<string, string> = {
    "աշխարհի-յոթ-հրաշալիքներ": "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?q=80&w=2000",
    "տիեզերական-ոդիսական": "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?q=80&w=2000",
    "հայկական-պատմություն": "https://images.unsplash.com/photo-1622624751362-328ec4aa688f?q=80&w=2000",
    "գիտական-հայտնագործություններ": "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=2000",
    "աշխարհագրական-հրաշալիքներ": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2000",
    "արվեստի-շեփորներ": "https://images.unsplash.com/photo-1541961017774-22349e4a1262?q=80&w=2000",
    "երաժշտական-լեգենդներ": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=2000",
    "սպորտային-ռեկորդներ": "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=2000"
};

// 🧩 Պազլի ցուցադրման կոմպոնենտ
const PuzzleDisplay = ({ team, piecesToWin }: { team: Team, piecesToWin: number }) => {
    const totalPieces = piecesToWin;
    const gridCols = Math.min(Math.ceil(Math.sqrt(totalPieces)), 4);
    const gridRows = Math.ceil(totalPieces / gridCols);

    const theme = themes.find(t => t.id === team.theme);
    const imageUrl = team.theme ? puzzleImages[team.theme] : null;

    return (
        <div className="relative w-full max-w-md mx-auto">
            <div className="text-center mb-4">
                <p className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    Պազլ՝ {theme?.name || 'Թեմա'}
                </p>
                <p className="text-sm text-white/70">
                    Բացված է <span className="font-bold text-green-400">{team.puzzlePieces}</span>/{totalPieces} մաս
                </p>
            </div>

            <div
                className="grid gap-1.5 rounded-2xl overflow-hidden shadow-2xl bg-black/30 border-2 border-white/20"
                style={{
                    gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
                    aspectRatio: '1/1'
                }}
            >
                {Array.from({ length: totalPieces }).map((_, index) => {
                    const isRevealed = team.puzzleRevealed[index] || false;
                    const row = Math.floor(index / gridCols);
                    const col = index % gridCols;

                    return (
                        <div
                            key={index}
                            className={`relative overflow-hidden transition-all duration-700 ${isRevealed
                                ? 'opacity-100 transform scale-105 shadow-lg shadow-green-500/30 z-10'
                                : 'opacity-30 bg-gradient-to-br from-gray-900/80 to-black/80'
                                }`}
                        >
                            {imageUrl && (
                                <div
                                    className="w-full h-full bg-cover bg-no-repeat transform transition-transform duration-700"
                                    style={{
                                        backgroundImage: `url(${imageUrl})`,
                                        backgroundPosition: `${(col / (gridCols - 1)) * 100}% ${(row / (gridRows - 1)) * 100}%`,
                                        backgroundSize: `${gridCols * 100}% ${gridRows * 100}%`,
                                        filter: isRevealed
                                            ? 'none'
                                            : 'brightness(0.3) blur(4px) contrast(0.8)',
                                        transform: isRevealed ? 'scale(1.1)' : 'scale(1)'
                                    }}
                                />
                            )}

                            <div className={`absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded-full transition-all duration-300 ${isRevealed
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                                    : 'bg-black/50 text-white/50'
                                }`}>
                                {index + 1}
                            </div>

                            {isRevealed ? (
                                <div className="absolute bottom-2 right-2 animate-pulse">
                                    <div className="text-xs bg-gradient-to-r from-green-500 to-emerald-600 px-3 py-1 rounded-full text-white font-bold shadow-lg">
                                        ✓ ԲԱՑՎԱԾ
                                    </div>
                                </div>
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-3xl text-white/20 animate-pulse">?</div>
                                </div>
                            )}

                            {/* Գլաու էֆեկտ */}
                            {isRevealed && (
                                <div className="absolute inset-0 bg-gradient-to-t from-green-500/10 to-transparent pointer-events-none" />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Պրոգրես բար */}
            <div className="mt-6">
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/80">Առաջընթաց</span>
                    <span className="font-bold text-green-400">
                        {Math.round((team.puzzlePieces / totalPieces) * 100)}%
                    </span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 transition-all duration-1000 shadow-lg shadow-green-500/30"
                        style={{ width: `${(team.puzzlePieces / totalPieces) * 100}%` }}
                    />
                </div>
                <div className="flex justify-between text-xs text-white/60 mt-1">
                    <span>Սկիզբ</span>
                    <span>Հաղթանակ</span>
                </div>
            </div>
        </div>
    );
};

const soundManager = {
    sounds: {} as Record<keyof typeof soundFiles, HTMLAudioElement | null>,
    enabled: true,
    
    init() {
        if (typeof window === 'undefined') return;
        
        Object.entries(soundFiles).forEach(([key, url]) => {
            try {
                // Используем any для обхода проблемы с конструктором Audio
                const audio = new (Audio as any)(url);
                audio.preload = 'auto';
                this.sounds[key as keyof typeof soundFiles] = audio;
            } catch (error) {
                console.warn(`Could not load sound: ${key}`, error);
                this.sounds[key as keyof typeof soundFiles] = null;
            }
        });
    },
    
    play(soundName: keyof typeof soundFiles) {
        if (!this.enabled || typeof window === 'undefined') return;
        
        try {
            const audio = this.sounds[soundName];
            if (audio) {
                audio.currentTime = 0;
                audio.play().catch((e) => {
                    console.warn(`Could not play sound: ${soundName}`, e);
                });
            }
        } catch (error) {
            console.warn('Sound playback error:', error);
        }
    },
    
    stop(soundName: keyof typeof soundFiles) {
        if (typeof window === 'undefined') return;
        
        const audio = this.sounds[soundName];
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
        }
    },
    
    setEnabled(enabled: boolean) {
        this.enabled = enabled;
        if (!enabled && typeof window !== 'undefined') {
            Object.values(this.sounds).forEach(audio => {
                if (audio) {
                    audio.pause();
                    audio.currentTime = 0;
                }
            });
        }
    }
};

// Инициализация звукового менеджера
if (typeof window !== 'undefined') {
    soundManager.init();
}

// SoundManager օգտագործում (միայն կլիենթում)
const PuzzleBattleGame = () => {
    const router = useRouter();

    // 🎮 Խաղի հիմնական վիճակներ
    const [gameState, setGameState] = useState<GameState>({
        phase: 'setup',
        round: 1,
        timeRemaining: 30,
        activeTeam: 0,
        currentQuestion: null,
        showAnswer: false,
        timerActive: false
    });

    // 👥 Թիմեր
    const [teams, setTeams] = useState<Team[]>([
        {
            id: 'team-1',
            name: 'Թիմ Ա',
            color: 'from-blue-500 to-cyan-500',
            members: [],
            theme: null,
            puzzlePieces: 0,
            puzzleRevealed: [],
            completedPuzzle: false,
            score: 0,
            currentRound: 1,
            answeredQuestions: [],
            usedQuestions: []
        },
        {
            id: 'team-2',
            name: 'Թիմ Բ',
            color: 'from-purple-500 to-pink-500',
            members: [],
            theme: null,
            puzzlePieces: 0,
            puzzleRevealed: [],
            completedPuzzle: false,
            score: 0,
            currentRound: 1,
            answeredQuestions: [],
            usedQuestions: []
        }
    ]);

    // 👤 Նոր խաղացողի տվյալներ
    const [newPlayer, setNewPlayer] = useState({
        name: '',
        teamId: '',
        role: 'member' as 'captain' | 'strategist' | 'analyst' | 'creative' | 'member'
    });

    // ⚙️ Խաղի կարգավորումներ
    const [gameSettings, setGameSettings] = useState({
        timePerQuestion: 30,
        piecesToWin: 12,
        roundsPerTheme: 3,
        soundEnabled: true,
        difficulty: 'balanced' as 'easy' | 'balanced' | 'hard'
    });

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const [ambientPlaying, setAmbientPlaying] = useState(false);

    // 🎵 Ձայնի կառավարում
    useEffect(() => {
        soundManager.setEnabled(gameSettings.soundEnabled);

        if (gameSettings.soundEnabled && !ambientPlaying) {
            const playAmbient = () => {
                soundManager.play('ambient');
                setAmbientPlaying(true);
            };

            // Ուշացում ֆոնային երաժշտության համար
            const timer = setTimeout(playAmbient, 1000);
            return () => clearTimeout(timer);
        } else if (!gameSettings.soundEnabled && ambientPlaying) {
            soundManager.stop('ambient');
            setAmbientPlaying(false);
        }
    }, [gameSettings.soundEnabled, ambientPlaying]);

    // 🎉 Հաղթանակի կոնֆետի
    const launchConfetti = () => {
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#00ff88', '#00ccff', '#ff00ff', '#ffff00']
        });

        setTimeout(() => {
            confetti({
                particleCount: 100,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#00ff88', '#00ccff']
            });
            confetti({
                particleCount: 100,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#ff00ff', '#ffff00']
            });
        }, 250);

        // Կոնֆետի շարունակական էֆեկտ
        setTimeout(() => {
            const end = Date.now() + 1000;
            const frame = () => {
                confetti({
                    particleCount: 2,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#00ff88', '#00ccff']
                });
                confetti({
                    particleCount: 2,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#ff00ff', '#ffff00']
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            };
            frame();
        }, 500);
    };

    // ⏱️ Ժամանակաչափ
    useEffect(() => {
        if (gameState.timerActive && gameState.timeRemaining > 0) {
            timerRef.current = setTimeout(() => {
                setGameState(prev => ({
                    ...prev,
                    timeRemaining: prev.timeRemaining - 1
                }));

                // Ձայնային էֆեկտ վերջին 10 վայրկյանների համար
                if (gameState.timeRemaining <= 10 && gameState.timeRemaining > 0) {
                    soundManager.play('timer');
                }
            }, 1000);
        } else if (gameState.timeRemaining === 0 && gameState.timerActive) {
            handleTimeUp();
        }

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [gameState.timeRemaining, gameState.timerActive]);

    // 👤 Խաղացողի ավելացում
    const addPlayer = () => {
        if (!newPlayer.name.trim() || !newPlayer.teamId) return;

        const avatars = ['😎', '🤠', '🧙', '🦸', '🧚', '🧜', '🧛', '🧞', '🧟', '👨‍🚀', '👩‍🚀', '👨‍🔬', '👩‍🔬', '🐲', '🦄', '🐯', '🦁', '🐼', '🦊'];
        const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];

        setTeams(prevTeams =>
            prevTeams.map(team =>
                team.id === newPlayer.teamId
                    ? {
                        ...team,
                        members: [...team.members, {
                            id: Date.now().toString(),
                            name: newPlayer.name.trim(),
                            avatar: randomAvatar,
                            role: newPlayer.role
                        }]
                    }
                    : team
            )
        );

        soundManager.play('click');
        setNewPlayer({ name: '', teamId: '', role: 'member' });
    };

    // 🌀 Թեմաների ընտրություն
    const selectRandomThemes = () => {
        const availableThemes = [...themes];
        const shuffled = [...availableThemes].sort(() => Math.random() - 0.5);

        setTeams(prevTeams =>
            prevTeams.map((team, index) => ({
                ...team,
                theme: shuffled[index % shuffled.length].id,
                puzzleRevealed: new Array(gameSettings.piecesToWin).fill(false)
            }))
        );

        setGameState(prev => ({ ...prev, phase: 'theme-selection' }));
        soundManager.play('achievement');
    };

    // ❓ Հարցի ընտրություն (ԱՆՈՒՆՉ ԿՐԿՆՈՒԹՅՈՒՆ)
    const selectQuestion = (teamIndex: number) => {
        const team = teams[teamIndex];
        if (!team.theme) return;

        const themeQuestionsData = themeQuestions[team.theme];
        if (!themeQuestionsData) return;

        // Բոլոր հասանելի հարցերը
        const allQuestions: Question[] = themeQuestionsData.questions;

        // Ֆիլտրել արդեն պատասխանված և օգտագործված հարցերը
        const availableQuestions = allQuestions.filter(q =>
            !team.answeredQuestions.includes(q.id) &&
            !team.usedQuestions.includes(q.id)
        );

        // Եթե բոլոր հարցերը օգտագործված են, սկսել նորից
        const questionsToUse = availableQuestions.length > 0 ? availableQuestions : allQuestions;

        if (questionsToUse.length === 0) {
            console.error('No questions available');
            return;
        }

        // Ընտրել պատահական հարց
        const randomIndex = Math.floor(Math.random() * questionsToUse.length);
        const randomQuestion = questionsToUse[randomIndex];

        // Նշել, որ հարցը օգտագործվում է
        setTeams(prevTeams =>
            prevTeams.map((t, index) =>
                index === teamIndex
                    ? { ...t, usedQuestions: [...t.usedQuestions, randomQuestion.id] }
                    : t
            )
        );

        setGameState(prev => ({
            ...prev,
            activeTeam: teamIndex,
            currentQuestion: randomQuestion,
            timeRemaining: gameSettings.timePerQuestion,
            timerActive: true,
            showAnswer: false,
            phase: 'playing'
        }));

        soundManager.play('cardFlip');
    };

    // ✅ Պատասխանի ստուգում
    const checkAnswer = (selectedOption: string) => {
        if (!gameState.currentQuestion || gameState.showAnswer) return;

        const isCorrect = selectedOption === gameState.currentQuestion.answer;

        setGameState(prev => ({ ...prev, showAnswer: true, timerActive: false }));

        if (isCorrect) {
            const points = gameState.currentQuestion.points;

            setTeams(prevTeams =>
                prevTeams.map((team, index) => {
                    if (index === gameState.activeTeam) {
                        const newPuzzlePieces = team.puzzlePieces + 1;
                        const newPuzzleRevealed = [...team.puzzleRevealed];

                        if (newPuzzlePieces <= gameSettings.piecesToWin) {
                            newPuzzleRevealed[team.puzzlePieces] = true;
                        }

                        const completedPuzzle = newPuzzlePieces >= gameSettings.piecesToWin;

                        if (newPuzzlePieces > team.puzzlePieces) {
                            soundManager.play('special');
                            soundManager.play('achievement');

                            if (completedPuzzle) {
                                soundManager.play('win');
                                launchConfetti();
                            }
                        }

                        return {
                            ...team,
                            score: team.score + points,
                            puzzlePieces: newPuzzlePieces,
                            puzzleRevealed: newPuzzleRevealed,
                            completedPuzzle,
                            answeredQuestions: [...team.answeredQuestions, gameState.currentQuestion!.id],
                            currentRound: newPuzzlePieces >= (gameSettings.piecesToWin / 3)
                                ? team.currentRound + 1
                                : team.currentRound
                        };
                    }
                    return team;
                })
            );

            soundManager.play('correct');
        } else {
            soundManager.play('incorrect');
        }

        setTimeout(() => {
            const nextTeam = (gameState.activeTeam + 1) % teams.length;
            setGameState(prev => ({
                ...prev,
                phase: 'round-break',
                activeTeam: nextTeam
            }));

            const winningTeam = teams.find(team => team.puzzlePieces >= gameSettings.piecesToWin);
            if (winningTeam) {
                setTimeout(() => {
                    setGameState(prev => ({ ...prev, phase: 'finished' }));
                }, 1000);
            }
        }, 2000);
    };

    // ⏰ Ժամանակի ավարտ
    const handleTimeUp = () => {
        setGameState(prev => ({ ...prev, timerActive: false, showAnswer: true }));
        soundManager.play('lose');

        setTimeout(() => {
            const nextTeam = (gameState.activeTeam + 1) % teams.length;
            setGameState(prev => ({
                ...prev,
                phase: 'round-break',
                activeTeam: nextTeam
            }));
        }, 2000);
    };

    // 🏁 Խաղի սկիզբ
    const startGame = () => {
        if (teams.every(team => team.members.length > 0)) {
            selectRandomThemes();
        } else {
            alert('➕ Խնդրում ենք ավելացնել խաղացողներ երկու թիմերում էլ');
        }
    };

    // 🔄 Խաղի վերագործարկում
    const resetGame = () => {
        setTeams([
            {
                id: 'team-1',
                name: 'Թիմ Ա',
                color: 'from-blue-500 to-cyan-500',
                members: [],
                theme: null,
                puzzlePieces: 0,
                puzzleRevealed: [],
                completedPuzzle: false,
                score: 0,
                currentRound: 1,
                answeredQuestions: [],
                usedQuestions: []
            },
            {
                id: 'team-2',
                name: 'Թիմ Բ',
                color: 'from-purple-500 to-pink-500',
                members: [],
                theme: null,
                puzzlePieces: 0,
                puzzleRevealed: [],
                completedPuzzle: false,
                score: 0,
                currentRound: 1,
                answeredQuestions: [],
                usedQuestions: []
            }
        ]);

        setGameState({
            phase: 'setup',
            round: 1,
            timeRemaining: 30,
            activeTeam: 0,
            currentQuestion: null,
            showAnswer: false,
            timerActive: false
        });

        soundManager.play('click');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/80 to-purple-900 p-4 md:p-8 relative overflow-hidden">
            {/* Անիմացված ֆոն */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                {[...Array(30)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute animate-float"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${10 + Math.random() * 15}s`,
                            animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                            transform: 'translateZ(0)',
                            willChange: 'transform'
                        }}
                    >
                        <div className="text-4xl opacity-10 animate-pulse" style={{ animationDelay: `${Math.random() * 2}s` }}>
                            {['🧩', '🎯', '🏆', '🌟', '✨', '🎮', '🎪', '🎭', '⚡', '🔥', '💎', '🎨', '🎵', '⚽', '🎲'][i % 15]}
                        </div>
                    </div>
                ))}

                {/* Գրադիենտ օվերլեյ */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5" />

                {/* Կետային ազդեցություն */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
            </div>

            {/* Վերնագիր և կառավարում */}
            <div className="relative z-10 mb-8">
                <div className="flex justify-between items-center mb-8">
                    <Button
                        onClick={() => router.push('/')}
                        className="bg-white/10 hover:bg-white/20 backdrop-blur-lg text-white hover:text-white/80 border-2 border-white/20 hover:border-white/40 transition-all duration-300 group"
                        variant="outline"
                    >
                        <Sparkle className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                        Գլխավոր
                    </Button>

                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <button
                                onClick={() => setGameSettings(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
                                className="p-3 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-xl hover:from-white/20 hover:to-white/10 transition-all duration-300 border-2 border-white/20 hover:border-cyan-400/50 shadow-lg"
                            >
                                {gameSettings.soundEnabled ?
                                    <Volume2 className="w-5 h-5 text-cyan-400" /> :
                                    <VolumeX className="w-5 h-5 text-rose-400" />
                                }
                            </button>
                            <div className="absolute top-full mt-2 right-0 bg-gray-900/90 backdrop-blur-lg text-white text-sm py-1 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
                                {gameSettings.soundEnabled ? 'Անջատել ձայնը' : 'Միացնել ձայնը'}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-center mb-12">
                    <div className="relative inline-block">
                        <h1 className="text-[80px] md:text-[120px] font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 mb-4 leading-none tracking-tighter animate-gradient-x">
                            🧩 Պազլ-Մարտ
                        </h1>
                        <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-ping" />
                        <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-cyan-400 rounded-full animate-pulse" />
                    </div>
                    <p className="text-2xl text-white/80 font-light tracking-wide">
                        Թեմաների մարտահրավերների էպիկական մարտ
                    </p>
                    <div className="flex justify-center gap-4 mt-6">
                        <div className="flex items-center gap-2 text-white/60">
                            <Sparkle className="w-4 h-4 text-yellow-400" />
                            <span>100+ Հարցեր</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/60">
                            <Trophy className="w-4 h-4 text-amber-400" />
                            <span>Պրեմիում խաղ</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/60">
                            <Zap className="w-4 h-4 text-cyan-400" />
                            <span>Իրական ժամանակում</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Հիմնական բովանդակություն */}
            <div className="relative z-10 max-w-7xl mx-auto">
                {/* ԿԱՐԳԱՎՈՐՄԱՆ ԷԿՐԱՆ */}
                {gameState.phase === 'setup' && (
                    <div className="space-y-8">
                        <Card className="p-8 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-2xl border-2 border-white/10 shadow-2xl">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl">
                                    <Users className="w-8 h-8 text-cyan-400" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                                        Թիմերի Կազմավորում
                                    </h2>
                                    <p className="text-white/60">Ավելացրեք խաղացողներ և պատրաստվեք մարտի</p>
                                </div>
                            </div>

                            {/* Թիմերի ցուցադրում */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                                {teams.map((team, teamIndex) => (
                                    <div key={team.id} className="relative group">
                                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-500" />
                                        <Card className={`relative p-6 bg-gradient-to-br ${team.color} border-2 border-white/20`}>
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-white/20 rounded-lg">
                                                        <Crown className="w-6 h-6 text-yellow-400" />
                                                    </div>
                                                    <h3 className="text-2xl font-bold text-white">{team.name}</h3>
                                                </div>
                                                <div className="px-4 py-2 bg-white/10 rounded-full">
                                                    <span className="text-white font-bold">{team.members.length}</span>
                                                    <span className="text-white/70 ml-1">խաղացող</span>
                                                </div>
                                            </div>

                                            {/* Թիմի անդամներ */}
                                            <div className="space-y-3 mb-8">
                                                {team.members.map((player) => (
                                                    <div key={player.id} className="flex items-center justify-between bg-white/10 p-4 rounded-xl hover:bg-white/15 transition-all duration-300 group/item">
                                                        <div className="flex items-center gap-4">
                                                            <div className="text-3xl transform group-hover/item:scale-110 transition-transform duration-300">
                                                                {player.avatar}
                                                            </div>
                                                            <div>
                                                                <div className="text-white font-medium">{player.name}</div>
                                                                <div className="text-white/50 text-sm">
                                                                    {player.role === 'captain' ? 'Կապիտան' :
                                                                        player.role === 'strategist' ? 'Ստրատեգ' :
                                                                            player.role === 'analyst' ? 'Անալիտիկ' :
                                                                                player.role === 'creative' ? 'Կրեատիվ' : 'Անդամ'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                setTeams(prevTeams =>
                                                                    prevTeams.map(t =>
                                                                        t.id === team.id
                                                                            ? { ...t, members: t.members.filter(p => p.id !== player.id) }
                                                                            : t
                                                                    )
                                                                );
                                                                soundManager.play('click');
                                                            }}
                                                            className="p-2 hover:bg-white/20 rounded-lg opacity-0 group-hover/item:opacity-100 transition-all duration-300"
                                                        >
                                                            <X className="w-5 h-5 text-white/70 hover:text-white" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Խաղացողի ավելացման ձև */}
                                            <div className="space-y-4">
                                                <div className="relative">
                                                    <Input
                                                        placeholder="Խաղացողի անուն"
                                                        value={newPlayer.teamId === team.id ? newPlayer.name : ''}
                                                        onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value, teamId: team.id })}
                                                        className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-12 pl-12 text-lg"
                                                    />
                                                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                                                        <div className="text-2xl">👤</div>
                                                    </div>
                                                </div>
                                                <Button
                                                    onClick={addPlayer}
                                                    disabled={newPlayer.teamId !== team.id || !newPlayer.name.trim()}
                                                    className={`w-full h-12 text-lg font-bold transition-all duration-300 ${newPlayer.teamId === team.id && newPlayer.name.trim()
                                                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                                                        : 'bg-white/10 hover:bg-white/20'
                                                        }`}
                                                >
                                                    <Plus className="w-5 h-5 mr-2" />
                                                    Ավելացնել {team.name}
                                                </Button>
                                            </div>
                                        </Card>
                                    </div>
                                ))}
                            </div>

                            {/* Խաղի կարգավորումներ */}
                            <div className="relative group mb-12">
                                <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
                                <Card className="relative p-8 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border-2 border-white/20">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="p-3 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl">
                                            <Settings className="w-8 h-8 text-amber-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                                                Խաղի Կարգավորումներ
                                            </h3>
                                            <p className="text-white/60">Կարգավորեք խաղի պարամետրերը</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        <div className="space-y-3">
                                            <Label className="text-white/80 block">⏱️ Հարցի ժամանակ</Label>
                                            <div className="flex items-center gap-3">
                                                <Input
                                                    type="number"
                                                    value={gameSettings.timePerQuestion}
                                                    onChange={(e) => setGameSettings(prev => ({
                                                        ...prev,
                                                        timePerQuestion: Math.max(10, Math.min(60, parseInt(e.target.value) || 30))
                                                    }))}
                                                    className="bg-white/10 border-white/20 text-white text-center text-xl font-bold w-20 h-14"
                                                    min={10}
                                                    max={60}
                                                />
                                                <span className="text-white/70">վայրկյան</span>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="text-white/80 block">🧩 Պազլի մասեր</Label>
                                            <div className="flex items-center gap-3">
                                                <Input
                                                    type="number"
                                                    value={gameSettings.piecesToWin}
                                                    onChange={(e) => setGameSettings(prev => ({
                                                        ...prev,
                                                        piecesToWin: Math.max(4, Math.min(24, parseInt(e.target.value) || 12))
                                                    }))}
                                                    className="bg-white/10 border-white/20 text-white text-center text-xl font-bold w-20 h-14"
                                                    min={4}
                                                    max={24}
                                                />
                                                <span className="text-white/70">մաս հաղթելու համար</span>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="text-white/80 block">🎯 Դժվարության աստիճան</Label>
                                            <select
                                                value={gameSettings.difficulty}
                                                onChange={(e) => setGameSettings(prev => ({
                                                    ...prev,
                                                    difficulty: e.target.value as 'easy' | 'balanced' | 'hard'
                                                }))}
                                                className="w-full h-14 bg-white/10 border-2 border-white/20 text-white rounded-lg px-4 text-lg focus:outline-none focus:border-cyan-400"
                                            >
                                                <option value="easy">Հեշտ</option>
                                                <option value="balanced">Հավասարակշռված</option>
                                                <option value="hard">Դժվար</option>
                                            </select>
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="text-white/80 block">🔊 Ձայնի մակարդակ</Label>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => setGameSettings(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
                                                    className={`w-full h-14 rounded-lg flex items-center justify-center gap-3 text-lg font-bold transition-all ${gameSettings.soundEnabled
                                                        ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-400/50 text-green-400'
                                                        : 'bg-gradient-to-r from-rose-500/20 to-pink-500/20 border-2 border-rose-400/50 text-rose-400'
                                                        }`}
                                                >
                                                    {gameSettings.soundEnabled ? (
                                                        <>
                                                            <Volume2 className="w-6 h-6" />
                                                            <span>Միացված</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <VolumeX className="w-6 h-6" />
                                                            <span>Անջատված</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </div>

                            {/* Սկսել խաղը */}
                            <div className="text-center">
                                <Button
                                    onClick={startGame}
                                    disabled={teams.some(team => team.members.length === 0)}
                                    className="relative group bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 px-16 py-8 text-2xl font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-500"
                                >
                                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg blur opacity-0 group-hover:opacity-70 transition duration-500" />
                                    <div className="relative flex items-center gap-4">
                                        <Play className="w-8 h-8" />
                                        <span>ՍՐԿՍԵԼ ՊԱԶԼ-ՄԱՐՏԸ</span>
                                        <Lightning className="w-8 h-8 animate-pulse" />
                                    </div>
                                </Button>

                                {teams.some(team => team.members.length === 0) && (
                                    <p className="text-rose-400 mt-6 text-lg flex items-center justify-center gap-2">
                                        <X className="w-5 h-5" />
                                        ⚠️ Ավելացրեք առնվազն մեկ խաղացող յուրաքանչյուր թիմում
                                    </p>
                                )}

                                <div className="flex justify-center gap-6 mt-10 text-white/60">
                                    <div className="text-center">
                                        <div className="text-3xl">🧩</div>
                                        <div className="text-sm">Պազլի համակարգ</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl">🎯</div>
                                        <div className="text-sm">80+ Հարցեր</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl">⚡</div>
                                        <div className="text-sm">Իրական ժամանակ</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl">🏆</div>
                                        <div className="text-sm">Պրեմիում խաղ</div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

                {/* ԹԵՄԱՆԵՐԻ ԸՆՏՐՈՒԹՅԱՆ ԷԿՐԱՆ */}
                {gameState.phase === 'theme-selection' && (
                    <div className="text-center space-y-8">
                        <div className="relative group mb-12">
                            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/30 to-orange-500/30 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
                            <Card className="relative p-12 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border-2 border-white/20 shadow-2xl">
                                <div className="text-8xl mb-8 animate-bounce">🎯</div>
                                <h2 className="text-5xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent mb-6">
                                    Թեմաները Շնորհված են!
                                </h2>
                                <p className="text-xl text-white/70 mb-12 max-w-2xl mx-auto">
                                    Յուրաքանչյուր թիմ ստացել է իր եզակի թեման: Պատրաստվեք մտավոր մարտի
                                </p>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                                    {teams.map((team, index) => {
                                        const theme = themes.find(t => t.id === team.theme);
                                        const themeData = team.theme ? themeQuestions[team.theme] : null;

                                        return (
                                            <div key={team.id} className="relative group/card">
                                                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-20 group-hover/card:opacity-30 transition duration-500" />
                                                <Card className={`relative p-8 bg-gradient-to-br ${team.color} border-2 border-white/20`}>
                                                    <div className="text-center mb-8">
                                                        <div className="text-6xl mb-6 animate-pulse">
                                                            {team.members[0]?.avatar || '👥'}
                                                        </div>
                                                        <h3 className="text-3xl font-bold text-white mb-2">{team.name}</h3>
                                                        <p className="text-white/80 text-lg">
                                                            {team.members.length} խաղացող • {team.members.map(m => m.name).join(', ')}
                                                        </p>
                                                    </div>

                                                    {theme && themeData && (
                                                        <div className="bg-white/10 p-8 rounded-2xl border-2 border-white/20">
                                                            <div className="flex items-center justify-center gap-4 mb-6">
                                                                <div className="p-3 bg-white/20 rounded-xl">
                                                                    {theme.icon}
                                                                </div>
                                                                <div className="text-4xl">{theme.name.split(' ')[0]}</div>
                                                            </div>
                                                            <div className="text-2xl font-bold text-white mb-3">
                                                                {theme.name}
                                                            </div>
                                                            <p className="text-white/70 mb-6">
                                                                {themeData.description}
                                                            </p>
                                                            <div className="flex justify-center gap-4 text-white/60">
                                                                <div className="text-center">
                                                                    <div className="text-xl font-bold text-green-400">
                                                                        {themeData.questions.filter(q => q.difficulty === 'easy').length}
                                                                    </div>
                                                                    <div className="text-sm">Հեշտ</div>
                                                                </div>
                                                                <div className="text-center">
                                                                    <div className="text-xl font-bold text-yellow-400">
                                                                        {themeData.questions.filter(q => q.difficulty === 'medium').length}
                                                                    </div>
                                                                    <div className="text-sm">Միջին</div>
                                                                </div>
                                                                <div className="text-center">
                                                                    <div className="text-xl font-bold text-rose-400">
                                                                        {themeData.questions.filter(q => q.difficulty === 'hard').length}
                                                                    </div>
                                                                    <div className="text-sm">Դժվար</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Card>
                                            </div>
                                        );
                                    })}
                                </div>

                                <Button
                                    onClick={() => {
                                        selectQuestion(0);
                                    }}
                                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 px-16 py-8 text-2xl font-bold shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-500 group"
                                >
                                    <Zap className="w-8 h-8 mr-4 group-hover:rotate-12 transition-transform duration-300" />
                                    ՍԿՍԵԼ ԽԱՂԸ
                                </Button>

                                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-white/70">
                                    <div className="text-center p-6 bg-white/5 rounded-2xl border border-white/10">
                                        <div className="text-3xl mb-3">🎯</div>
                                        <h4 className="text-lg font-bold text-white mb-2">Հարցերի Տեսականի</h4>
                                        <p>80+ եզակի հարց յուրաքանչյուր թեմայի համար</p>
                                    </div>
                                    <div className="text-center p-6 bg-white/5 rounded-2xl border border-white/10">
                                        <div className="text-3xl mb-3">🧩</div>
                                        <h4 className="text-lg font-bold text-white mb-2">Պազլի Համակարգ</h4>
                                        <p>Յուրաքանչյուր ճիշտ պատասխան բացում է պազլի մաս</p>
                                    </div>
                                    <div className="text-center p-6 bg-white/5 rounded-2xl border border-white/10">
                                        <div className="text-3xl mb-3">⚡</div>
                                        <h4 className="text-lg font-bold text-white mb-2">Իրական ժամանակ</h4>
                                        <p>Ժամանակի սահմանափակում և դինամիկ խաղ</p>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}

                {/* ԽԱՂԱՅԻՆ ԷԿՐԱՆ */}
                {gameState.phase === 'playing' && gameState.currentQuestion && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Ձախ սյունակ - Թիմ Ա */}
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-2xl blur opacity-0 group-hover:opacity-50 transition duration-500" />
                            <Card className="relative p-6 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-xl border-2 border-white/20">
                                <div className="text-center mb-8">
                                    <div className="text-5xl mb-4 transform hover:scale-110 transition-transform duration-300">
                                        {teams[0].members[0]?.avatar || '👥'}
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2">{teams[0].name}</h3>
                                    <div className="text-white/70 text-lg">
                                        {teams[0].members.map(m => m.name).join(', ')}
                                    </div>
                                </div>

                                <PuzzleDisplay team={teams[0]} piecesToWin={gameSettings.piecesToWin} />

                                <div className="mt-8 grid grid-cols-2 gap-4 text-center">
                                    <div className="bg-white/10 p-4 rounded-xl hover:bg-white/15 transition-all duration-300">
                                        <div className="text-3xl font-bold text-white">{teams[0].score}</div>
                                        <div className="text-sm text-white/70">Միավոր</div>
                                    </div>
                                    <div className="bg-white/10 p-4 rounded-xl hover:bg-white/15 transition-all duration-300">
                                        <div className="text-3xl font-bold text-white">{teams[0].currentRound}/3</div>
                                        <div className="text-sm text-white/70">Ռաունդ</div>
                                    </div>
                                </div>

                                <div className="mt-6 p-4 bg-white/5 rounded-xl">
                                    <div className="flex justify-between text-white/80 mb-2">
                                        <span>Օգտագործված հարցեր</span>
                                        <span className="font-bold">{teams[0].usedQuestions.length}</span>
                                    </div>
                                    <div className="flex justify-between text-white/80">
                                        <span>Ճիշտ պատասխաններ</span>
                                        <span className="font-bold text-green-400">{teams[0].answeredQuestions.length}</span>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Կենտրոնական սյունակ - Հարցը */}
                        <div className="relative group lg:col-span-1">
                            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-2xl blur opacity-0 group-hover:opacity-50 transition duration-500" />
                            <Card className="relative p-8 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border-2 border-white/20">
                                <div className="text-center mb-8">
                                    <div className="flex items-center justify-center gap-4 mb-6">
                                        <div className={`text-5xl animate-pulse ${gameState.activeTeam === 0 ? 'text-blue-400' : 'text-purple-400'}`}>
                                            {teams[gameState.activeTeam].members[0]?.avatar || '🎯'}
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-white mb-1">{teams[gameState.activeTeam].name}</h3>
                                            <p className="text-white/70">Հերթը ձերն է</p>
                                        </div>
                                    </div>

                                    {/* Ժամանակաչափ */}
                                    <div className={`inline-flex items-center gap-4 px-8 py-4 rounded-full mb-8 transition-all duration-500 ${gameState.timeRemaining <= 10
                                        ? 'bg-gradient-to-r from-rose-500/20 to-pink-500/20 border-2 border-rose-400 animate-pulse'
                                        : 'bg-gradient-to-br from-white/10 to-white/5 border-2 border-white/20'
                                        }`}>
                                        <Timer className={`w-6 h-6 ${gameState.timeRemaining <= 10 ? 'text-rose-400 animate-spin' : 'text-white'}`} />
                                        <span className={`text-4xl font-black font-mono ${gameState.timeRemaining <= 10 ? 'text-rose-400' : 'text-white'
                                            }`}>
                                            {gameState.timeRemaining}
                                        </span>
                                        <span className="text-white/70">վայրկյան</span>
                                    </div>
                                </div>

                                {/* Հարցը */}
                                <div className="bg-gradient-to-br from-white/10 to-white/5 p-8 rounded-2xl border-2 border-white/20 mb-8">
                                    <p className="text-2xl font-bold text-white text-center leading-relaxed">
                                        {gameState.currentQuestion.question}
                                    </p>
                                    <div className="mt-4 text-center">
                                        <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${gameState.currentQuestion.difficulty === 'easy'
                                            ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/50 text-green-400'
                                            : gameState.currentQuestion.difficulty === 'medium'
                                                ? 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-400/50 text-yellow-400'
                                                : 'bg-gradient-to-r from-rose-500/20 to-pink-500/20 border border-rose-400/50 text-rose-400'
                                            }`}>
                                            {gameState.currentQuestion.difficulty === 'easy' ? 'Հեշտ' :
                                                gameState.currentQuestion.difficulty === 'medium' ? 'Միջին' : 'Դժվար'
                                            } • +{gameState.currentQuestion.points} միավոր
                                        </span>
                                    </div>
                                </div>

                                {/* Պատասխանների տարբերակները */}
                                <div className="grid grid-cols-1 gap-4">
                                    {gameState.currentQuestion.options.map((option, index) => {
                                        const isCorrect = gameState.showAnswer && option === gameState.currentQuestion!.answer;
                                        const isWrong = gameState.showAnswer && option !== gameState.currentQuestion!.answer;

                                        return (
                                            <Button
                                                key={index}
                                                onClick={() => !gameState.showAnswer && checkAnswer(option)}
                                                disabled={gameState.showAnswer}
                                                className={`justify-start h-20 text-lg font-medium transition-all duration-300 transform hover:scale-[1.02] ${isCorrect
                                                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 border-2 border-green-400 scale-105 shadow-lg shadow-green-500/30'
                                                    : isWrong
                                                        ? 'bg-gradient-to-r from-rose-500 to-pink-600 border-2 border-rose-400'
                                                        : 'bg-gradient-to-br from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 border-2 border-white/20'
                                                    }`}
                                            >
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 text-lg font-bold ${isCorrect
                                                    ? 'bg-white text-green-700'
                                                    : isWrong
                                                        ? 'bg-white text-rose-700'
                                                        : 'bg-white/20 text-white'
                                                    }`}>
                                                    {String.fromCharCode(65 + index)}
                                                </div>
                                                <span className="text-left">{option}</span>
                                                {isCorrect && (
                                                    <div className="ml-auto text-3xl animate-bounce">✅</div>
                                                )}
                                                {isWrong && (
                                                    <div className="ml-auto text-3xl">❌</div>
                                                )}
                                            </Button>
                                        );
                                    })}
                                </div>

                                {/* Միավորներ */}
                                {gameState.showAnswer && (
                                    <div className="mt-8 text-center">
                                        <div className="inline-flex items-center gap-4 bg-gradient-to-r from-amber-500/20 to-orange-500/20 px-8 py-4 rounded-full border-2 border-amber-400/50">
                                            <Star className="w-6 h-6 text-amber-400" />
                                            <span className="text-xl font-bold text-amber-400">+{gameState.currentQuestion.points} միավոր</span>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        </div>

                        {/* Աջ սյունակ - Թիմ Բ */}
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-2xl blur opacity-0 group-hover:opacity-50 transition duration-500" />
                            <Card className="relative p-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl border-2 border-white/20">
                                <div className="text-center mb-8">
                                    <div className="text-5xl mb-4 transform hover:scale-110 transition-transform duration-300">
                                        {teams[1].members[0]?.avatar || '👥'}
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2">{teams[1].name}</h3>
                                    <div className="text-white/70 text-lg">
                                        {teams[1].members.map(m => m.name).join(', ')}
                                    </div>
                                </div>

                                <PuzzleDisplay team={teams[1]} piecesToWin={gameSettings.piecesToWin} />

                                <div className="mt-8 grid grid-cols-2 gap-4 text-center">
                                    <div className="bg-white/10 p-4 rounded-xl hover:bg-white/15 transition-all duration-300">
                                        <div className="text-3xl font-bold text-white">{teams[1].score}</div>
                                        <div className="text-sm text-white/70">Միավոր</div>
                                    </div>
                                    <div className="bg-white/10 p-4 rounded-xl hover:bg-white/15 transition-all duration-300">
                                        <div className="text-3xl font-bold text-white">{teams[1].currentRound}/3</div>
                                        <div className="text-sm text-white/70">Ռաունդ</div>
                                    </div>
                                </div>

                                <div className="mt-6 p-4 bg-white/5 rounded-xl">
                                    <div className="flex justify-between text-white/80 mb-2">
                                        <span>Օգտագործված հարցեր</span>
                                        <span className="font-bold">{teams[1].usedQuestions.length}</span>
                                    </div>
                                    <div className="flex justify-between text-white/80">
                                        <span>Ճիշտ պատասխաններ</span>
                                        <span className="font-bold text-green-400">{teams[1].answeredQuestions.length}</span>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}

                {/* ՌԱՈՒՆԴԻ ՄԻՋԹԵՂԱՆԱԿ */}
                {gameState.phase === 'round-break' && (
                    <div className="text-center space-y-8">
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-3xl blur opacity-0 group-hover:opacity-50 transition duration-500" />
                            <Card className="relative p-12 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border-2 border-white/20 shadow-2xl">
                                <div className="text-8xl mb-8 animate-bounce">🎉</div>
                                <h2 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-6">
                                    Հաջորդ Հարցը
                                </h2>
                                <p className="text-2xl text-white/70 mb-8">
                                    Հերթը <span className="font-bold text-white">{teams[gameState.activeTeam].name}</span> թիմինն է
                                </p>

                                <div className="flex justify-center gap-8 mb-12">
                                    <Button
                                        onClick={() => selectQuestion(gameState.activeTeam)}
                                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 px-12 py-8 text-2xl font-bold shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-500 group"
                                    >
                                        <Zap className="w-8 h-8 mr-4 group-hover:rotate-12 transition-transform duration-300" />
                                        Սկսել Հաջորդ Հարցը
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            const otherTeam = (gameState.activeTeam + 1) % 2;
                                            setGameState(prev => ({ ...prev, activeTeam: otherTeam }));
                                            selectQuestion(otherTeam);
                                            soundManager.play('click');
                                        }}
                                        className="bg-gradient-to-br from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 px-12 py-8 text-2xl font-bold border-2 border-white/20 hover:border-white/40 transition-all duration-500"
                                    >
                                        <SkipForward className="w-8 h-8 mr-4" />
                                        Փոխանցել Մյուս Թիմին
                                    </Button>
                                </div>

                                {/* Թիմերի պրոգրեսը */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {teams.map((team, index) => (
                                        <div key={team.id} className="relative group/card">
                                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur opacity-0 group-hover/card:opacity-50 transition duration-500" />
                                            <Card className={`relative p-8 bg-gradient-to-br ${team.color} border-2 border-white/20`}>
                                                <h3 className="text-2xl font-bold text-white mb-6">{team.name}</h3>
                                                <div className="space-y-6">
                                                    <div>
                                                        <div className="flex justify-between text-white mb-2">
                                                            <span>Պազլի մասեր</span>
                                                            <span className="font-bold">{team.puzzlePieces}/{gameSettings.piecesToWin}</span>
                                                        </div>
                                                        <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-1000"
                                                                style={{ width: `${(team.puzzlePieces / gameSettings.piecesToWin) * 100}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between text-white">
                                                        <span>Միավորներ</span>
                                                        <span className="font-bold">{team.score}</span>
                                                    </div>
                                                    <div className="flex justify-between text-white">
                                                        <span>Օգտագործված հարցեր</span>
                                                        <span className="font-bold">{team.usedQuestions.length}</span>
                                                    </div>
                                                    <div className="flex justify-between text-white">
                                                        <span>Դժվարության մակարդակ</span>
                                                        <span className="font-bold text-yellow-400">{team.currentRound}</span>
                                                    </div>
                                                </div>
                                            </Card>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    </div>
                )}

                {/* ԱՎԱՐՏԻ ԷԿՐԱՆ */}
                {gameState.phase === 'finished' && (
                    <div className="text-center space-y-8">
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500/30 to-amber-500/30 rounded-3xl blur opacity-0 group-hover:opacity-50 transition duration-500" />
                            <Card className="relative p-12 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border-2 border-white/20 shadow-2xl">
                                <div className="text-8xl mb-8 animate-bounce">🏆</div>

                                {teams.find(t => t.completedPuzzle) && (
                                    <>
                                        <h2 className="text-6xl font-bold bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent mb-6 animate-pulse">
                                            ՀԱՂԹՈՂ
                                        </h2>
                                        <div className="text-8xl mb-8 animate-pulse">
                                            {teams.find(t => t.completedPuzzle)?.members[0]?.avatar || '🎉'}
                                        </div>
                                        <h3 className="text-4xl font-bold text-white mb-4">
                                            {teams.find(t => t.completedPuzzle)?.name} Թիմը
                                        </h3>
                                        <p className="text-2xl text-white/70 mb-12 max-w-2xl mx-auto">
                                            Առաջինը հավաքեց ամբողջ պազլը և դարձավ Պազլ-Մարտի չեմպիոն
                                        </p>
                                    </>
                                )}

                                {/* Վիճակագրություն */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                                    {teams.map((team) => (
                                        <div key={team.id} className="relative group/card">
                                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur opacity-0 group-hover/card:opacity-50 transition duration-500" />
                                            <Card className={`relative p-8 bg-gradient-to-br ${team.color} border-2 ${team.completedPuzzle ? 'border-yellow-400 shadow-2xl shadow-yellow-500/30' : 'border-white/20'}`}>
                                                <h4 className="text-2xl font-bold text-white mb-8">{team.name}</h4>
                                                <div className="space-y-6">
                                                    <div className="flex justify-between text-white">
                                                        <span>Պազլի մասեր</span>
                                                        <span className={`font-bold ${team.completedPuzzle ? 'text-yellow-400' : ''}`}>
                                                            {team.puzzlePieces}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between text-white">
                                                        <span>Միավորներ</span>
                                                        <span className="font-bold">{team.score}</span>
                                                    </div>
                                                    <div className="flex justify-between text-white">
                                                        <span>Ճիշտ պատասխաններ</span>
                                                        <span className="font-bold text-green-400">{team.answeredQuestions.length}</span>
                                                    </div>
                                                    <div className="flex justify-between text-white">
                                                        <span>Օգտագործված հարցեր</span>
                                                        <span className="font-bold">{team.usedQuestions.length}</span>
                                                    </div>
                                                    <div className="flex justify-between text-white">
                                                        <span>Ռաունդ</span>
                                                        <span className="font-bold">{team.currentRound}</span>
                                                    </div>
                                                    {team.completedPuzzle && (
                                                        <div className="mt-6 p-4 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 rounded-xl border border-yellow-400/50">
                                                            <div className="text-xl font-bold text-yellow-400">ՉԵՄՊԻՈՆ</div>
                                                        </div>
                                                    )}
                                                </div>
                                            </Card>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-center gap-8">
                                    <Button
                                        onClick={resetGame}
                                        className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 px-12 py-8 text-2xl font-bold shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-500 group"
                                    >
                                        <RotateCcw className="w-8 h-8 mr-4 group-hover:rotate-180 transition-transform duration-500" />
                                        Նոր Խաղ
                                    </Button>
                                    <Button
                                        onClick={() => router.push('/')}
                                        className="bg-gradient-to-br from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 px-12 py-8 text-2xl font-bold border-2 border-white/20 hover:border-white/40 transition-all duration-500"
                                    >
                                        Գլխավոր Էջ
                                    </Button>
                                </div>

                                <div className="mt-12 p-8 bg-gradient-to-br from-white/5 to-white/2 rounded-2xl border border-white/10">
                                    <h4 className="text-xl font-bold text-white mb-4">Խաղի Վիճակագրություն</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-white/70">
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-white">{teams.reduce((acc, t) => acc + t.score, 0)}</div>
                                            <div className="text-sm">Ընդհանուր միավոր</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-white">{teams.reduce((acc, t) => acc + t.answeredQuestions.length, 0)}</div>
                                            <div className="text-sm">Ճիշտ պատասխաններ</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-white">{teams.reduce((acc, t) => acc + t.usedQuestions.length, 0)}</div>
                                            <div className="text-sm">Օգտագործված հարցեր</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-white">{gameState.round}</div>
                                            <div className="text-sm">Ընդհանուր ռաունդ</div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="relative z-10 mt-16 pt-8 border-t border-white/10 text-center">
                <p className="text-white/40 text-sm">
                    🧩 Պազլ-Մարտ • Տիեզերական հանելուկների խաղ • {new Date().getFullYear()}
                </p>
                <div className="flex justify-center gap-6 mt-4 text-white/30">
                    <span>80+ հարցեր</span>
                    <span>•</span>
                    <span>8 թեմա</span>
                    <span>•</span>
                    <span>Պրեմիում խաղ</span>
                </div>
            </div>

            {/* CSS անիմացիաներ */}
            <style jsx>{`
                @keyframes float {
                    0%, 100% { 
                        transform: translateY(0px) rotate(0deg) translateZ(0); 
                    }
                    50% { 
                        transform: translateY(-30px) rotate(10deg) translateZ(0); 
                    }
                }
                
                @keyframes gradient-x {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                
                @keyframes pulse-glow {
                    0%, 100% { opacity: 0.5; transform: scale(1); }
                    50% { opacity: 0.8; transform: scale(1.05); }
                }
                
                .animate-float {
                    animation: float 8s ease-in-out infinite;
                    will-change: transform;
                    backface-visibility: hidden;
                    transform-style: preserve-3d;
                }
                
                .animate-gradient-x {
                    animation: gradient-x 3s ease infinite;
                    background-size: 200% 200%;
                }
                
                .animate-pulse-glow {
                    animation: pulse-glow 2s ease-in-out infinite;
                }
                
                /* Smooth scroll */
                html {
                    scroll-behavior: smooth;
                }
                
                /* Glass effect */
                .glass-effect {
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }
            `}</style>
        </div>
    );
};

// Settings իկոնի ավելացում
const Settings = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

export default PuzzleBattleGame;