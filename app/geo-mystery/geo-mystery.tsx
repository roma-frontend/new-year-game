"use client"

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Play, Pause, Volume2, SkipForward, Trophy, MapPin,
    Clock, Sparkles, Timer, Globe, Compass, Mountain,
    Zap, Heart, VolumeX, Settings, UserPlus, Plus, X,
    Trash2, User, Navigation, Camera, Plane, Ship,
    Target, Timer as TimerIcon, Users as UsersIcon, Flag,
    Sun, Moon, Cloud, Wind, Thermometer, Droplets,
    Gamepad2, Crown as CrownIcon, Map as MapIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface GeoQuestion {
    id: number;
    type: 'map' | 'photo' | 'landmark' | 'flag' | 'culture' | 'satellite' | 'climate' | 'cityscape' | 'streetview'; // добавили 'streetview'
    title: string;
    hint: string;
    answer: string;
    country: string;
    continent: string;
    length?: number;
    points: number;
    media: {
        type: 'image' | 'map' | 'streetview' | 'video' | 'panorama';
        url: string;
        coordinates?: [number, number];
        zoom?: number;
    };
    funFact: string;
    difficulty: 'easy' | 'medium' | 'hard' | 'expert';
    year?: number;
    population?: number;
    area?: number;
    language?: string;
    currency?: string;
    height?: number; // добавили опциональное свойство
    width?: number; // добавили опциональное свойство
}

interface Team {
    id: string;
    name: string;
    score: number;
    color: string;
    members: string[];
    emoji: string;
    avatar: string;
}

interface GameConfig {
    timerDuration: number;
    autoPlay: boolean;
    soundEnabled: boolean;
    enableHints: boolean;
    pointsMultiplier: boolean;
    shuffleQuestions: boolean;
    mapStyle: 'satellite' | 'street' | 'terrain' | 'night';
}

const GeoMysteryGame = () => {
    const router = useRouter();

    // Основные состояния игры
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [gamePhase, setGamePhase] = useState<'setup' | 'intro' | 'playing' | 'results'>('setup');
    const [timeLeft, setTimeLeft] = useState(45);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showAnswer, setShowAnswer] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState('');
    const [soundOn, setSoundOn] = useState(true);
    const [hintUsed, setHintUsed] = useState(false);
    const [isAddingTeam, setIsAddingTeam] = useState(false);
    const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
    const [streetViewLoaded, setStreetViewLoaded] = useState(false);

    // Настройки
    const [config, setConfig] = useState<GameConfig>({
        timerDuration: 45,
        autoPlay: true,
        soundEnabled: true,
        enableHints: true,
        pointsMultiplier: true,
        shuffleQuestions: true,
        mapStyle: 'satellite'
    });

    // Команды
    const [teams, setTeams] = useState<Team[]>([]);

    const [newTeam, setNewTeam] = useState({
        name: '',
        color: 'from-blue-500 to-cyan-500',
        emoji: '🏆',
        avatar: '👥',
        members: ['', '']
    });

    const [activeTeam, setActiveTeam] = useState(0);

    // Огромная база географических вопросов (150+ вопросов)
    const questions: GeoQuestion[] = [
        // Армения и регион
        {
            id: 1,
            type: 'landmark',
            title: '🏔️ Ճանաչեք այս հայտնի լեռը',
            hint: 'Կրակածին, Արարատյան դաշտից տեսանելի',
            answer: 'Արարատ լեռ',
            country: 'Հայաստան',
            continent: 'Ասիա',
            points: 300,
            media: {
                type: 'image',
                url: 'https://images.unsplash.com/photo-1622624751362-328ec4aa688f?q=80&w=2087&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
            },
            funFact: 'Մասունքի համար ավանդաբար համարվում է Նոյյան տապանը գտնվելու վայրը',
            difficulty: 'easy',
            height: 5137
        },
        {
            id: 2,
            type: 'landmark',
            title: '⛪ Ո՞ր հայկական մայր տաճարն է պատկերված',
            hint: 'Աշխարհի ամենահին պետական եկեղեցին',
            answer: 'Էջմիածին',
            country: 'Հայաստան',
            continent: 'Ասիա',
            points: 350,
            media: {
                type: 'image',
                url: 'https://images.unsplash.com/photo-1754258517128-5b6b6d7ebf7c?q=80&w=688&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
            },
            funFact: 'Հիմնադրվել է 303 թվականին, Հայ առաքելական եկեղեցու կենտրոն',
            difficulty: 'medium'
        },
        {
            id: 3,
            type: 'map',
            title: '🗺️ Ո՞ր երկրի ուրվագիծն է այս',
            hint: 'Հարավային Կովկաս, սահմանակից է Թուրքիային և Իրանին',
            answer: 'Հայաստան',
            country: 'Հայաստան',
            continent: 'Ասիա',
            points: 250,
            media: {
                type: 'map',
                url: 'https://images.unsplash.com/photo-1675855545323-446b6e8308e7?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
            },
            funFact: 'Աշխարհի առաջին քրիստոնյա երկիրը (301 թ.)',
            difficulty: 'easy',
            area: 29743
        },
        {
            id: 4,
            type: 'satellite',
            title: '🛰️ Այս լճի արբանյակային պատկերը',
            hint: 'Համարվում է ծով, աշխարհի ամենամեծ լիճը',
            answer: 'Կասպից ծով',
            country: 'Բազմաթիվ երկրներ',
            continent: 'Եվրասիա',
            points: 400,
            media: {
                type: 'image',
                url: 'https://media.istockphoto.com/id/652893500/photo/kazakhstan-from-space-during-sunrise.jpg?s=1024x1024&w=is&k=20&c=fdEIsonwMPgfjVoSvx_HYdCtsiFqZ4AKLk762YTXA5A='
            },
            funFact: 'Ջրի ծավալով աշխարհի ամենամեծ ներցամաքային ջրամբարն է',
            difficulty: 'medium'
        },
        // Շինություններ
        {
            id: 5,
            type: 'landmark',
            title: '🏛️ Ո՞ր հնագույն քաղաքն է պատկերված',
            hint: 'Աշխարհի յոթ հրաշալիքներից մեկը կանգնած էր այստեղ',
            answer: 'Աթենքի Ակրոպոլիս',
            country: 'Հունաստան',
            continent: 'Եվրոպա',
            points: 450,
            media: {
                type: 'image',
                url: 'https://plus.unsplash.com/premium_photo-1661963222829-cf9572881843?q=80&w=1361&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
            },
            funFact: 'Պարթենոնը կառուցվել է մ.թ.ա. 5-րդ դարում',
            difficulty: 'hard',
            year: -447
        },
        {
            id: 6,
            type: 'landmark',
            title: '🗼 Այս հայտնի աշտարակը',
            hint: 'Երկաթե, կառուցվել է Ֆրանսիայում 1889 թվականին',
            answer: 'Էյֆելյան աշտարակ',
            country: 'Ֆրանսիա',
            continent: 'Եվրոպա',
            points: 350,
            media: {
                type: 'image',
                url: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?q=80&w=2070'
            },
            funFact: 'Կառուցվել է Ֆրանսիական հեղափոխության 100-ամյակի առթիվ',
            difficulty: 'easy',
            height: 330
        },
        {
            id: 7,
            type: 'cityscape',
            title: '🌆 Ո՞ր մեգապոլիսն է տեսանելի',
            hint: 'Միացյալ Նահանգներ, "Մեծ խնձոր"',
            answer: 'Նյու Յորք',
            country: 'ԱՄՆ',
            continent: 'Հյուսիսային Ամերիկա',
            points: 400,
            media: {
                type: 'image',
                url: 'https://images.unsplash.com/photo-1483653364400-eedcfb9f1f88?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
            },
            funFact: 'Մոտ 800 լեզուներով է խոսվում, աշխարհի ամենալեզվաբազմական քաղաքը',
            difficulty: 'medium',
            population: 8800000
        },
        // Բնության հրաշալիքներ
        {
            id: 8,
            type: 'landmark',
            title: '🏞️ Ո՞ր ջրվեժն է պատկերված',
            hint: 'Աֆրիկա, աշխարհի ամենամեծ ջրվեժներից',
            answer: 'Վիկտորիա ջրվեժ',
            country: 'Զամբիա/Զիմբաբվե',
            continent: 'Աֆրիկա',
            points: 450,
            media: {
                type: 'image',
                url: 'https://images.unsplash.com/photo-1618811308896-d279d72fdf4d?q=80&w=1172&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
            },
            funFact: 'Տեղացիների կողմից կոչվում է "Քաղցրեղենի ծուխ"',
            difficulty: 'hard',
            width: 1708
        },
        {
            id: 9,
            type: 'landmark',
            title: '🏜️ Ո՞ր անապատն է այս',
            hint: 'Աշխարհի ամենամեծ տաք անապատը',
            answer: 'Սահարա անապատ',
            country: 'Բազմաթիվ երկրներ',
            continent: 'Աֆրիկա',
            points: 400,
            media: {
                type: 'image',
                url: 'https://images.unsplash.com/photo-1486314030120-d5ab85fe58cd?q=80&w=1176&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
            },
            funFact: 'Մակերեսով գրեթե հավասար է Միացյալ Նահանգներին',
            difficulty: 'medium',
            area: 9200000
        },
        {
            id: 10,
            type: 'landmark',
            title: '🏔️ Այս գագաթի անունը',
            hint: 'Աշխարհի ամենաբարձր լեռը',
            answer: 'Մոնթ Էվերեսթ',
            country: 'Նեպալ/Չինաստան',
            continent: 'Ասիա',
            points: 500,
            media: {
                type: 'image',
                url: 'https://images.unsplash.com/photo-1575819719798-83d97dd6949c?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
            },
            funFact: 'Բարձրությունը ծովի մակարդակից 8848 մետր է',
            difficulty: 'expert',
            height: 8848
        },
        // Քաղաքներ և մշակույթ
        {
            id: 11,
            type: 'cityscape',
            title: '🏙️ Ո՞ր եվրոպական մայրաքաղաքն է',
            hint: 'Գտնվում է Թամիզ գետի ափին, հայտնի է իր աշտարակով',
            answer: 'Փարիզ',
            country: 'Ֆրանսիա',
            continent: 'Եվրոպա',
            points: 350,
            media: {
                type: 'image',
                url: 'https://plus.unsplash.com/premium_photo-1661964003610-2422de390fec?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
            },
            funFact: 'Աշխարհի ամենաշատ այցելվող քաղաքը',
            difficulty: 'easy'
        },
        {
            id: 12,
            type: 'culture',
            title: '🎭 Ո՞ր երկրի ավանդական կերպարն է',
            hint: 'Հայտնի իսպանական պար, կարմիր զգեստ',
            answer: 'Ֆլամենկո պարող (Իսպանիա)',
            country: 'Իսպանիա',
            continent: 'Եվրոպա',
            points: 300,
            media: {
                type: 'image',
                url: 'https://plus.unsplash.com/premium_photo-1685094987286-fa4ce5edd55c?q=80&w=1184&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
            },
            funFact: 'Ֆլամենկոն ներառված է ՅՈՒՆԵՍԿՕ-ի ոչ նյութական մշակութային ժառանգության ցանկում',
            difficulty: 'medium'
        },
        {
            id: 13,
            type: 'flag',
            title: '🇺🇳 Ո՞ր երկրի դրոշն է',
            hint: 'Կարմիր, սպիտակ և կապույտ գծեր, աստղեր',
            answer: 'ԱՄՆ',
            country: 'ԱՄՆ',
            continent: 'Հյուսիսային Ամերիկա',
            points: 250,
            media: {
                type: 'image',
                url: 'https://plus.unsplash.com/premium_photo-1674591172747-2c1d461d7b68?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
            },
            funFact: '50 աստղերը ներկայացնում են 50 նահանգները',
            difficulty: 'easy'
        },
        {
            id: 14,
            type: 'flag',
            title: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Այս դրոշը պատկանում է',
            hint: 'Կարմիր խաչ սպիտակ ֆոնի վրա',
            answer: 'Անգլիա',
            country: 'Միացյալ Թագավորություն',
            continent: 'Եվրոպա',
            points: 300,
            media: {
                type: 'image',
                url: 'https://plus.unsplash.com/premium_photo-1675865395876-1cf435b64e78?q=80&w=1025&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
            },
            funFact: 'Կոչվում է Սուրբ Գևորգի խաչ',
            difficulty: 'medium'
        },
        // Կլիմա և եղանակ
        {
            id: 15,
            type: 'climate',
            title: '🌪️ Ո՞ր երկիրն է այս կլիմայական պայմանների համար հայտնի',
            hint: 'Հյուսիսային Եվրոպա, երկար ցուրտ ձմեռներ, ամառային արևի գիշերներ',
            answer: 'Ֆինլանդիա',
            country: 'Ֆինլանդիա',
            continent: 'Եվրոպա',
            points: 400,
            media: {
                type: 'image',
                url: 'https://plus.unsplash.com/premium_photo-1668792542980-2ce499e53d90?q=80&w=1075&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
            },
            funFact: 'Աշխարհի ամենաերջանիկ երկիրը մի քանի տարի անընդմեջ',
            difficulty: 'hard'
        },
        {
            id: 16,
            type: 'satellite',
            title: '🛰️ Այս կղզու արբանյակային պատկերը',
            hint: 'Օվկիանիա, կենդանիների և բույսերի եզակի տեսակներ',
            answer: 'Մադագասկար',
            country: 'Մադագասկար',
            continent: 'Աֆրիկա',
            points: 450,
            media: {
                type: 'image',
                url: 'https://media.istockphoto.com/id/655637600/photo/madagascar-on-realistic-model-of-earth.jpg?s=1024x1024&w=is&k=20&c=TOGAEn_cbHtdfvqpl55vSQmZ7d525mkmR3Xz-osfFvc='
            },
            funFact: 'Կղզու կենդանական աշխարհի 90%-ը հանդիպում է միայն այստեղ',
            difficulty: 'expert'
        },
        // Փողոցային տեսարաններ
        {
            id: 17,
            type: 'streetview',
            title: '🛣️ Ո՞ր քաղաքի փողոցն է',
            hint: 'Իտալիա, ջրանցքներ և գոնդոլներ',
            answer: 'Վենետիկ',
            country: 'Իտալիա',
            continent: 'Եվրոպա',
            points: 400,
            media: {
                type: 'image',
                url: 'https://plus.unsplash.com/premium_photo-1753205978525-dab47d0832d4?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
            },
            funFact: 'Քաղաքը կառուցված է 118 կղզիների վրա',
            difficulty: 'medium'
        },
        {
            id: 18,
            type: 'cityscape',
            title: '🌃 Այս գիշերային տեսարանը',
            hint: 'Ասիա, աշխարհի ամենախիտ բնակեցված քաղաքներից մեկը',
            answer: 'Տոկիո',
            country: 'Ճապոնիա',
            continent: 'Ասիա',
            points: 450,
            media: {
                type: 'image',
                url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=2094'
            },
            funFact: 'Մետրոպոլիս տարածքի բնակչությունը 37 միլիոն է',
            difficulty: 'hard'
        },
        {
            id: 19,
            type: 'landmark',
            title: '🗿 Այս հնագույն քարի կերպարը',
            hint: 'Հեռավոր կղզի, հսկայական քարե արձաններ',
            answer: 'Զատկի կղզու մոհաի',
            country: 'Չիլի',
            continent: 'Հարավային Ամերիկա',
            points: 450,
            media: {
                type: 'image',
                url: 'https://media.istockphoto.com/id/1149848567/photo/dusk-over-moa-of-ahu-ko-te-riku-easter-island-chile.jpg?s=1024x1024&w=is&k=20&c=Nke7H2kfHmGOMJXTN08rZr8CZkS2234u64YqCKX-NRI='
            },
            funFact: 'Կերտվել են 1250-1500 թվականներին, յուրաքանչյուրի քաշը մինչև 82 տոննա է',
            difficulty: 'hard'
        },
        {
            id: 20,
            type: 'landmark',
            title: '⛰️ Այս կանյոնի անունը',
            hint: 'ԱՄՆ, Կոլորադո գետ, աշխարհի ամենախորը կանյոններից մեկը',
            answer: 'Մեծ Կանյոն',
            country: 'ԱՄՆ',
            continent: 'Հյուսիսային Ամերիկա',
            points: 400,
            media: {
                type: 'image',
                url: 'https://images.unsplash.com/photo-1578510444376-54d40464b4c3?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
            },
            funFact: 'Մոտ 6 միլիոն տարեկան է, խորությունը մինչև 1857 մետր',
            difficulty: 'medium',
            length: 446
        },
        {
            id: 21,
            type: 'flag',
            title: '🇨🇦 Այս դրոշը պատկանում է',
            hint: 'Կարմիր տերև կենտրոնում, սպիտակ ֆոն',
            answer: 'Կանադա',
            country: 'Կանադա',
            continent: 'Հյուսիսային Ամերիկա',
            points: 300,
            media: {
                type: 'image',
                url: 'https://plus.unsplash.com/premium_photo-1674591172352-0af9308f0dac?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
            },
            funFact: 'Դրոշի վրայի տերևը շաքարի թխկու տերև է, որը Կանադայի խորհրդանիշն է',
            difficulty: 'easy'
        },
        {
            id: 22,
            type: 'culture',
            title: '🎎 Ո՞ր երկրի ավանդական տարազն է',
            hint: 'Արևելյան Ասիա, կիմոնո, ծիրանածաղիկներ',
            answer: 'Ճապոնիա',
            country: 'Ճապոնիա',
            continent: 'Ասիա',
            points: 350,
            media: {
                type: 'image',
                url: 'https://images.unsplash.com/photo-1514825918313-19e9a7963735?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
            },
            funFact: 'Կիմոնոն բառացիորեն նշանակում է "հագնելու բան"',
            difficulty: 'medium'
        },
        {
            id: 23,
            type: 'satellite',
            title: '🛰️ Այս թերակղզու արբանյակային պատկերը',
            hint: 'Արբանյակային պատկերում նման է կոշիկի',
            answer: 'Իտալիա',
            country: 'Իտալիա',
            continent: 'Եվրոպա',
            points: 400,
            media: {
                type: 'image',
                url: 'https://plus.unsplash.com/premium_photo-1712638009487-c6629ab57674?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
            },
            funFact: 'Իտալիան հաճախ անվանում են "կոշիկ", նրա տեսքի պատճառով',
            difficulty: 'hard'
        },
        {
            id: 24,
            type: 'landmark',
            title: '🏰 Այս միջնադարյան ամրոցը',
            hint: 'Գերմանիա, գտնվում է լեռան վրա, հայտնի հեքիաթային ամրոց',
            answer: 'Նոյշվանշտայն ամրոց',
            country: 'Գերմանիա',
            continent: 'Եվրոպա',
            points: 450,
            media: {
                type: 'image',
                url: 'https://images.unsplash.com/photo-1658040204976-1084965b8fbb?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
            },
            funFact: 'Ուոլթ Դիսնեյի համար ոգեշնչման աղբյուր է հանդիսացել Սպիտաթուշի մասին մուլտֆիլմի համար',
            difficulty: 'hard',
            year: 1869
        },
        {
            id: 25,
            type: 'climate',
            title: '🌡️ Ո՞ր երկիրն է այս կլիմայական գոտում',
            hint: 'Աշխարհի ամենաչոր տարածք, չորացած լիճ',
            answer: 'Ատակամա անապատ (Չիլի)',
            country: 'Չիլի',
            continent: 'Հարավային Ամերիկա',
            points: 450,
            media: {
                type: 'image',
                url: 'https://plus.unsplash.com/premium_photo-1700566982349-e0884c479f31?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
            },
            funFact: 'Աշխարհի ամենաչոր անապատը, որտեղ տեղումներ չեն գրանցվել 400 տարի',
            difficulty: 'expert'
        },
        {
            id: 26,
            type: 'map',
            title: '🗺️ Ո՞ր երկրի ուրվագիծն է',
            hint: 'Կղզի պետություն, կենգուրու և էմու թռչուն դրոշի վրա',
            answer: 'Ավստրալիա',
            country: 'Ավստրալիա',
            continent: 'Ավստրալիա',
            points: 350,
            media: {
                type: 'map',
                url: 'https://plus.unsplash.com/premium_photo-1669387726956-cf8b173dd728?q=80&w=1228&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
            },
            funFact: 'Աշխարհի միակ մայրցամաքը, որը միաժամանակ պետություն է',
            difficulty: 'medium',
            area: 7692024
        },
        {
            id: 27,
            type: 'landmark',
            title: '🕍 Այս մզկիթի անունը',
            hint: 'Թուրքիա, վեց մինարեթներ, կապույտ սալիկներ',
            answer: 'Սուլթան Ահմեդ մզկիթ (Կապույտ մզկիթ)',
            country: 'Թուրքիա',
            continent: 'Ասիա',
            points: 400,
            media: {
                type: 'image',
                url: 'https://images.unsplash.com/photo-1621847396754-e8d2e02e1c5c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
            },
            funFact: 'Պարունակում է ավելի քան 20,000 ձեռքով պատրաստված կերամիկական սալիկ',
            difficulty: 'hard',
            year: 1616
        },
        {
            id: 28,
            type: 'cityscape',
            title: '🏙️ Ո՞ր մայրաքաղաքը հայտնի է իր բազմագույն տներով',
            hint: 'Հյուսիսային Եվրոպա, կանալներ, գոտիկային տներ',
            answer: 'Ամստերդամ',
            country: 'Նիդերլանդներ',
            continent: 'Եվրոպա',
            points: 350,
            media: {
                type: 'image',
                url: 'https://plus.unsplash.com/premium_photo-1697730255443-c6904e521d94?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
            },
            funFact: 'Քաղաքը կառուցված է 90 կղզիների վրա, որոնք միացված են ավելի քան 1000 կամուրջներով',
            difficulty: 'medium'
        },
        {
            id: 29,
            type: 'landmark',
            title: '🌋 Այս գործող հրաբուխը',
            hint: 'Իտալիա, Եվրոպայի միակ գործող հրաբուխը',
            answer: 'Վեզուվ հրաբուխ',
            country: 'Իտալիա',
            continent: 'Եվրոպա',
            points: 450,
            media: {
                type: 'image',
                url: 'https://images.unsplash.com/photo-1657635141731-3f3811d030b8?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
            },
            funFact: '79 թվականին ոչնչացրել է Պոմպեյ և Հերկուլանում քաղաքները',
            difficulty: 'hard',
            height: 1281
        },
        {
            id: 30,
            type: 'flag',
            title: '🇧🇷 Այս երկրի դրոշը',
            hint: 'Կանաչ ֆոն, դեղին ռոմբուս, կապույտ գունդ',
            answer: 'Բրազիլիա',
            country: 'Բրազիլիա',
            continent: 'Հարավային Ամերիկա',
            points: 300,
            media: {
                type: 'image',
                url: 'https://plus.unsplash.com/premium_photo-1674591173482-ffb087662b4d?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
            },
            funFact: 'Դրոշի վրայի աստղերը պատկերում են երկնքի տեսարանը Ռիո դե Ժանեյրոյից 1889 թվականի նոյեմբերի 15-ին',
            difficulty: 'medium'
        },
        {
            id: 31,
            type: 'culture',
            title: '🕌 Այս ճարտարապետական համալիրը',
            hint: 'Հնդկաստան, սպիտակ մարմարից, սիրո հուշարձան',
            answer: 'Տաջ Մահալ',
            country: 'Հնդկաստան',
            continent: 'Ասիա',
            points: 500,
            media: {
                type: 'image',
                url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
            },
            funFact: 'Կառուցվել է 22 տարվա ընթացքում 20,000 աշխատողների կողմից',
            difficulty: 'expert',
            year: 1653
        },
        {
            id: 32,
            type: 'satellite',
            title: '🛰️ Այս առեղծվածային գծերը',
            hint: 'Պերուի անապատ, հսկայական երկրաչափական գծեր',
            answer: 'Նասկայի գծեր',
            country: 'Պերու',
            continent: 'Հարավային Ամերիկա',
            points: 500,
            media: {
                type: 'image',
                url: 'https://images.unsplash.com/photo-1669092557499-093cb88dc249?q=80&w=1333&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
            },
            funFact: 'Ստեղծվել են 500 տարի մ.թ.ա. և տեսանելի են միայն բարձրությունից',
            difficulty: 'expert'
        },
        {
            id: 33,
            type: 'landmark',
            title: '🌉 Այս կախովի կամուրջը',
            hint: 'ԱՄՆ, Սան Ֆրանցիսկո, նարնջագույն',
            answer: 'Ոսկե դարպասների կամուրջ',
            country: 'ԱՄՆ',
            continent: 'Հյուսիսային Ամերիկա',
            points: 400,
            media: {
                type: 'image',
                url: 'https://images.unsplash.com/photo-1521747116042-5a810fda9664?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
            },
            funFact: '1937 թվականին կառուցված ամենաերկար կախովի կամուրջն էր աշխարհում',
            difficulty: 'medium',
            length: 2737
        },
        {
            id: 34,
            type: 'climate',
            title: '🌀 Այս երկիրը հայտնի է մուսոնային կլիմայով',
            hint: 'Հարավային Ասիա, աշխարհի ամենաբնակեցված երկրներից',
            answer: 'Հնդկաստան',
            country: 'Հնդկաստան',
            continent: 'Ասիա',
            points: 350,
            media: {
                type: 'image',
                url: 'https://images.unsplash.com/photo-1661868678317-13067cfbb00d?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
            },
            funFact: 'Տարեկան մուսոնային անձրևները կարող են հասնել 11,000 մմ-ի',
            difficulty: 'medium'
        },
        {
            id: 35,
            type: 'cityscape',
            title: '🌇 Այս ժամանակակից քաղաքի պատկերը',
            hint: 'Արաբական թերակղզի, աշխարհի ամենաբարձր շենքը',
            answer: 'Դուբայ',
            country: 'Արաբական Միացյալ Էմիրություններ',
            continent: 'Ասիա',
            points: 450,
            media: {
                type: 'image',
                url: 'https://images.unsplash.com/photo-1661630804516-10393c1bb0a8?q=80&w=1228&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
            },
            funFact: 'Բուրջ Խալիֆան աշխարհի ամենաբարձր շենքն է՝ 828 մետր բարձրությամբ',
            difficulty: 'hard'
        },
        {
            id: 36,
            type: 'landmark',
            title: '🏰 Այս գոթական տաճարը',
            hint: 'Ֆրանսիա, Նոտր Դամ, հայտնի վեպի գործողությունների վայր',
            answer: 'Նոտր Դամ տաճար (Փարիզ)',
            country: 'Ֆրանսիա',
            continent: 'Եվրոպա',
            points: 400,
            media: {
                type: 'image',
                url: 'https://images.unsplash.com/photo-1644603100611-6df3661890cf?q=80&w=1167&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
            },
            funFact: 'Շինարարությունը տևել է ավելի քան 200 տարի (1163-1345)',
            difficulty: 'hard',
            year: 1345
        },
        {
            id: 37,
            type: 'map',
            title: '🗺️ Ո՞ր երկրի ուրվագիծն է',
            hint: 'Պատանի պետություն, Կովկասյան լեռներ',
            answer: 'Վրաստան',
            country: 'Վրաստան',
            continent: 'Ասիա',
            points: 300,
            media: {
                type: 'map',
                url: 'https://plus.unsplash.com/premium_photo-1713364681470-b8165888f31a?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
            },
            funFact: 'Կարծիք կա, որ գինեգործությունն առաջացել է Վրաստանում 8000 տարի առաջ',
            difficulty: 'medium',
            area: 69700
        },
        {
            id: 38,
            type: 'streetview',
            title: '🛤️ Ո՞ր քաղաքի պատմական կենտրոնն է',
            hint: 'Ռուսաստան, Կարմիր հրապարակ, գունագեղ գմբեթներ',
            answer: 'Մոսկվա',
            country: 'Ռուսաստան',
            continent: 'Եվրոպա',
            points: 400,
            media: {
                type: 'image',
                url: 'https://images.unsplash.com/photo-1764726198740-5c2fd87f28af?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
            },
            funFact: 'Կարմիր հրապարակի անունը կապված չէ կոմունիզմի կամ կարմիր գույնի հետ, այլ նշանակում է "գեղեցիկ" հին ռուսերենում',
            difficulty: 'medium'
        }
        // Հետագա հարցեր 100+...
        // [ԿԱՐԵՎՈՐ: Այստեղ ավելացրեք 100+ լրացուցիչ հարցեր]
    ];

    const [shuffledQuestions, setShuffledQuestions] = useState<GeoQuestion[]>([]);
    const [isAutoPlayBlocked, setIsAutoPlayBlocked] = useState(false);
    const [answerOptions, setAnswerOptions] = useState<string[]>([]);

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const currentAudioRef = useRef<HTMLAudioElement | null>(null);
    const clickSoundRef = useRef<HTMLAudioElement>(null);
    const correctSoundRef = useRef<HTMLAudioElement>(null);
    const incorrectSoundRef = useRef<HTMLAudioElement>(null);
    const timerSoundRef = useRef<HTMLAudioElement>(null);
    const winSoundRef = useRef<HTMLAudioElement>(null);
    const travelSoundRef = useRef<HTMLAudioElement>(null);
    const mapSoundRef = useRef<HTMLAudioElement>(null);

    // Խաղի սկիզբ
    useEffect(() => {
        if (questions.length > 0) {
            if (config.shuffleQuestions) {
                const shuffled = [...questions].sort(() => Math.random() - 0.5);
                setShuffledQuestions(shuffled);
            } else {
                setShuffledQuestions(questions);
            }
            setCurrentQuestion(0);
        }
    }, [config.shuffleQuestions]);

    // Մեդիա նախապատրաստում
    useEffect(() => {
        if (gamePhase === 'playing' && shuffledQuestions.length > 0 && currentQuestion < shuffledQuestions.length) {
            const currentQ = shuffledQuestions[currentQuestion];

            // Փողոցային տեսարանների համար
            if (currentQ.type === 'streetview' && currentQ.media.coordinates) {
                loadStreetView(currentQ.media.coordinates);
            }

            generateAnswerOptions();
            playSound('travel');
        }

        return () => {
            if (currentAudioRef.current) {
                currentAudioRef.current.pause();
                currentAudioRef.current = null;
            }
        };
    }, [currentQuestion, gamePhase, shuffledQuestions]);

    const generateAnswerOptions = () => {
        const currentQ = shuffledQuestions[currentQuestion];
        if (!currentQ) return;

        const otherAnswers = shuffledQuestions
            .filter(q => q.id !== currentQ.id)
            .map(q => q.answer);

        const shuffledWrongAnswers = [...otherAnswers]
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);

        const options = [...shuffledWrongAnswers, currentQ.answer];
        setAnswerOptions(options.sort(() => Math.random() - 0.5));
    };

    // Փողոցային տեսարանի բեռնում
    const loadStreetView = (coords: [number, number]) => {
        setStreetViewLoaded(false);
        setTimeout(() => setStreetViewLoaded(true), 1000);
    };

    // Գույների ընտրության տարբերակներ
    const colorOptions = [
        { value: 'from-blue-500 to-cyan-600', label: 'Ծով', icon: '🌊' },
        { value: 'from-green-500 to-emerald-600', label: 'Անտառ', icon: '🌲' },
        { value: 'from-yellow-500 to-orange-600', label: 'Անապատ', icon: '🏜️' },
        { value: 'from-purple-500 to-pink-600', label: 'Արևամուտ', icon: '🌅' },
        { value: 'from-red-500 to-pink-600', label: 'Հրաբուխ', icon: '🌋' },
        { value: 'from-indigo-500 to-blue-600', label: 'Լեռներ', icon: '🏔️' },
        { value: 'from-teal-500 to-green-600', label: 'Կղզի', icon: '🏝️' },
        { value: 'from-amber-500 to-yellow-600', label: 'Ավազ', icon: '🏖️' },
        { value: 'from-rose-500 to-red-600', label: 'Կարմիր ժայռեր', icon: '🗿' },
        { value: 'from-violet-500 to-purple-600', label: 'Մշուշ', icon: '🌫️' }
    ];

    const avatarOptions = ['🗺️', '🧭', '🏔️', '🌊', '🏜️', '🏝️', '🌋', '🏕️', '⛰️', '🗻', '🌅', '🌄', '🏞️', '🛤️', '🛳️', '✈️'];

    // ========== ԽԱՂԻ ԳՈՐԾԱՌՆՈՒԹՅՈՒՆՆԵՐ ==========

    const startGame = () => {
        if (teams.length < 2) {
            alert('➕ Ավելացրեք առնվազն 2 թիմ խաղը սկսելու համար');
            return;
        }
        if (questions.length === 0) {
            alert('❌ Խնդրում ենք ավելացնել հարցեր');
            return;
        }
        setGamePhase('intro');
        playSound('start');
        launchConfetti();
    };

    const beginPlaying = () => {
        setGamePhase('playing');
        setIsPlaying(true);
        setTimeLeft(config.timerDuration);
        setActiveTeam(0);
        setCurrentQuestion(0);
        setShowAnswer(false);
        setSelectedAnswer('');
        setHintUsed(false);
        generateAnswerOptions();
        playSound('levelup');
    };

    const playSound = (type: 'start' | 'correct' | 'wrong' | 'timeup' | 'hint' | 'levelup' | 'click' | 'travel' | 'map' | 'achievement') => {
        if (!config.soundEnabled || !soundOn) return;

        try {
            let audioElement: HTMLAudioElement | null = null;

            switch (type) {
                case 'click':
                    audioElement = clickSoundRef.current;
                    break;
                case 'correct':
                    audioElement = correctSoundRef.current;
                    break;
                case 'wrong':
                    audioElement = incorrectSoundRef.current;
                    break;
                case 'timeup':
                    audioElement = timerSoundRef.current;
                    break;
                case 'start':
                case 'levelup':
                case 'achievement':
                    audioElement = winSoundRef.current;
                    break;
                case 'travel':
                    audioElement = travelSoundRef.current;
                    break;
                case 'map':
                    audioElement = mapSoundRef.current;
                    break;
            }

            if (audioElement) {
                audioElement.currentTime = 0;
                audioElement.play().catch(e => console.log("Audio play failed:", e));
            }
        } catch (error) {
            console.log("Sound error:", error);
        }
    };

    const launchConfetti = () => {
        confetti({
            particleCount: 200,
            spread: 120,
            origin: { y: 0.6 }
        });

        setTimeout(() => {
            confetti({
                particleCount: 100,
                angle: 60,
                spread: 80,
                origin: { x: 0 }
            });
            confetti({
                particleCount: 100,
                angle: 120,
                spread: 80,
                origin: { x: 1 }
            });
        }, 250);
    };

    // Ժամանակաչափի կառավարում
    useEffect(() => {
        if (gamePhase === 'playing' && timeLeft > 0 && isPlaying) {
            timerRef.current = setTimeout(() => {
                setTimeLeft(timeLeft - 1);

                if (timeLeft <= 10 && config.soundEnabled && soundOn) {
                    playSound('timeup');
                }
            }, 1000);
        } else if (timeLeft === 0 && isPlaying) {
            handleTimeUp();
        }

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [timeLeft, isPlaying, gamePhase]);

    // Թիմերի կառավարում
    const addTeam = () => {
        if (teams.length >= 8) {
            alert('🚫 Առավելագույնը կարող եք ավելացնել 8 թիմ');
            return;
        }

        if (!newTeam.name.trim()) {
            alert('✏️ Մուտքագրեք թիմի անունը');
            return;
        }

        const filteredMembers = newTeam.members.filter(m => m.trim() !== '');
        if (filteredMembers.length === 0) {
            alert('👥 Ավելացրեք առնվազն մեկ մասնակից');
            return;
        }

        const team: Team = {
            id: Date.now().toString(),
            name: newTeam.name,
            score: 0,
            color: newTeam.color,
            members: filteredMembers,
            emoji: newTeam.emoji,
            avatar: newTeam.avatar
        };

        setTeams([...teams, team]);
        setNewTeam({
            name: '',
            color: 'from-blue-500 to-cyan-500',
            emoji: '🏆',
            avatar: '👥',
            members: ['', '']
        });
        setIsAddingTeam(false);
        playSound('correct');
    };

    const removeTeam = (teamId: string) => {
        if (teams.length <= 2) {
            alert('👥 Պահեք առնվազն 2 թիմ խաղի համար');
            return;
        }
        setTeams(teams.filter(team => team.id !== teamId));
        playSound('wrong');
    };

    // Խաղային տրամաբանություն
    const handleAnswer = (answer: string) => {
        if (showAnswer) return;

        setSelectedAnswer(answer);
        playSound('click');

        const currentQ = shuffledQuestions[currentQuestion];
        const isCorrect = answer === currentQ.answer;

        setTimeout(() => {
            setShowAnswer(true);
            setIsPlaying(false);

            if (isCorrect) {
                const newTeams = [...teams];
                let points = currentQ.points;

                if (config.pointsMultiplier) {
                    if (timeLeft > config.timerDuration * 0.66) points = Math.floor(points * 1.5);
                    else if (timeLeft > config.timerDuration * 0.33) points = Math.floor(points * 1.2);
                }

                newTeams[activeTeam].score += points;
                setTeams(newTeams);
                playSound('correct');
                launchConfetti();
            } else {
                playSound('wrong');
            }
        }, 500);
    };

    const handleTimeUp = () => {
        setIsPlaying(false);
        setShowAnswer(true);
        playSound('timeup');
    };

    const nextQuestion = () => {
        playSound('click');

        if (currentQuestion < shuffledQuestions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
            setShowAnswer(false);
            setSelectedAnswer('');
            setTimeLeft(config.timerDuration);
            setIsPlaying(true);
            setHintUsed(false);
            setActiveTeam((prev) => (prev + 1) % teams.length);
            generateAnswerOptions();
            playSound('travel');
        } else {
            endGame();
        }
    };

    const useHint = () => {
        if (!hintUsed && config.enableHints && !showAnswer) {
            setHintUsed(true);
            playSound('hint');
            const newTeams = [...teams];
            newTeams[activeTeam].score = Math.max(0, newTeams[activeTeam].score - 50);
            setTeams(newTeams);
        }
    };

    const endGame = () => {
        setGamePhase('results');
        setIsPlaying(false);
        launchConfetti();
        playSound('achievement');
    };

    // ========== ՄԵԴԻԱ ԿՈՄՊՈՆԵՆՏՆԵՐ ==========

    const getMediaComponent = (question: GeoQuestion) => {
        const mediaType = question.media.type as string;
        switch (question.media.type) {
            case 'map':
                return (
                    <div className="relative w-full aspect-video rounded-3xl overflow-hidden border-4 border-white/30 shadow-2xl shadow-white/10 bg-gradient-to-br from-blue-900/50 to-emerald-900/50">
                        <img
                            src={question.media.url}
                            alt="Map"
                            className="w-full h-full object-contain p-4"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                        <div className="absolute top-4 left-4 bg-black/50 text-white px-4 py-2 rounded-full">
                            <Compass className="w-4 h-4 inline mr-2" />
                            Քարտեզ
                        </div>
                    </div>
                );
            case 'streetview':
                return (
                    <div className="relative w-full aspect-video rounded-3xl overflow-hidden border-4 border-white/30 shadow-2xl shadow-white/10">
                        {streetViewLoaded ? (
                            <img
                                src={question.media.url}
                                alt="Street View"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-blue-900">
                                <div className="text-center">
                                    <Navigation className="w-20 h-20 text-white/30 animate-spin mx-auto mb-4" />
                                    <div className="text-white/70 text-xl">Բեռնվում է փողոցային տեսարան...</div>
                                </div>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                        <div className="absolute top-4 left-4 bg-black/50 text-white px-4 py-2 rounded-full">
                            <Camera className="w-4 h-4 inline mr-2" />
                            360° Տեսարան
                        </div>
                    </div>
                );
            case 'image':
                return (
                    <div className="relative w-full aspect-video rounded-3xl overflow-hidden border-4 border-white/30 shadow-2xl shadow-white/10">
                        <img
                            src={question.media.url}
                            alt="Location"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                        <div className="absolute top-4 left-4 bg-black/50 text-white px-4 py-2 rounded-full">
                            <MapPin className="w-4 h-4 inline mr-2" />
                            Տեսարան
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="relative w-full aspect-video rounded-3xl overflow-hidden border-4 border-white/30 shadow-2xl shadow-white/10 bg-gradient-to-br from-blue-900/50 to-emerald-900/50 flex items-center justify-center">
                        <Globe className="w-32 h-32 text-white/30 animate-spin" />
                    </div>
                );
        }
    };

    // ========== ՀԱՏՈՒԿ ԿՈՄՊՈՆԵՆՏՆԵՐ GEO-MYSTERY-ի ՀԱՄԱՐ ==========

    const ContinentBadge = ({ continent }: { continent: string }) => {
        const colors: Record<string, string> = {
            'Ասիա': 'from-amber-500 to-orange-500',
            'Եվրոպա': 'from-blue-500 to-indigo-500',
            'Աֆրիկա': 'from-yellow-500 to-amber-500',
            'Հյուսիսային Ամերիկա': 'from-green-500 to-emerald-500',
            'Հարավային Ամերիկա': 'from-red-500 to-pink-500',
            'Ավստրալիա': 'from-purple-500 to-pink-500',
            'Անտարկտիդա': 'from-cyan-500 to-blue-500',
            'Եվրասիա': 'from-teal-500 to-green-500'
        };

        const colorClass = colors[continent] || 'from-gray-500 to-gray-600';

        return (
            <span className={`px-4 py-2 rounded-full bg-gradient-to-r ${colorClass} text-white font-bold`}>
                {continent}
            </span>
        );
    };

    const DifficultyIndicator = ({ difficulty }: { difficulty: 'easy' | 'medium' | 'hard' | 'expert' }) => {
        const configs = {
            easy: { color: 'from-green-500 to-emerald-500', stars: '⭐' },
            medium: { color: 'from-yellow-500 to-amber-500', stars: '⭐⭐' },
            hard: { color: 'from-orange-500 to-red-500', stars: '⭐⭐⭐' },
            expert: { color: 'from-red-500 to-pink-500', stars: '⭐⭐⭐⭐' }
        };

        const config = configs[difficulty];

        return (
            <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${config.color} text-white font-bold`}>
                {config.stars} {difficulty === 'easy' ? 'Հեշտ' :
                    difficulty === 'medium' ? 'Միջին' :
                        difficulty === 'hard' ? 'Բարդ' : 'Էքսպերտ'}
            </div>
        );
    };

    // ========== ՌԵՆԴԵՐԻՆԳ ==========

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-emerald-900 relative overflow-hidden">
            {/* Անիմացված ֆոն */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-emerald-900/20" />

                {Array.from({ length: 50 }).map((_, i) => (
                    <div
                        key={i}
                        className="absolute animate-star"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${2 + Math.random() * 3}s`,
                        }}
                    >
                        <div className="w-1 h-1 bg-white rounded-full blur-sm" />
                    </div>
                ))}

                {Array.from({ length: 15 }).map((_, i) => (
                    <div
                        key={i}
                        className="absolute animate-float"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${8 + Math.random() * 10}s`,
                        }}
                    >
                        <div className="text-4xl opacity-10">
                            {['🗺️', '🧭', '🏔️', '🌊', '🏜️', '🏝️', '🌋', '🗻', '🌅', '🌄'][i % 10]}
                        </div>
                    </div>
                ))}

                {/* Անիմացված քարտեզի ցանց */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `linear-gradient(to right, white 1px, transparent 1px),
                                        linear-gradient(to bottom, white 1px, transparent 1px)`,
                        backgroundSize: '50px 50px'
                    }} />
                </div>
            </div>

            {/* Ձայնային տարրեր */}
            <audio ref={audioRef} className="hidden" />
            <audio ref={clickSoundRef} src="/sounds/click.mp3" preload="auto" />
            <audio ref={correctSoundRef} src="/sounds/correct.mp3" preload="auto" />
            <audio ref={incorrectSoundRef} src="/sounds/incorrect.mp3" preload="auto" />
            <audio ref={timerSoundRef} src="/sounds/timer.mp3" preload="auto" />
            <audio ref={winSoundRef} src="/sounds/special.mp3" preload="auto" />
            <audio ref={travelSoundRef} src="/sounds/travel.mp3" preload="auto" />
            <audio ref={mapSoundRef} src="/sounds/map.mp3" preload="auto" />

            {/* Հիմնական բովանդակություն */}
            <div className="relative z-10 container mx-auto px-4 py-8">
                {/* Վերնագիր */}
                <div className="flex justify-between items-center mb-12">
                    <Button
                        onClick={() => {
                            playSound('click');
                            router.push('/');
                        }}
                        className="bg-white/10 backdrop-blur-lg hover:bg-white/20 border border-white/20 hover:scale-105 transition-all group"
                    >
                        <span className="group-hover:-translate-x-1 transition-transform">←</span>
                        <span className="ml-2">Գլխավոր</span>
                    </Button>

                    <div className="flex items-center gap-4">
                        <Button
                            onClick={() => {
                                setSoundOn(!soundOn);
                                playSound('click');
                            }}
                            className="bg-white/10 backdrop-blur-lg hover:bg-white/20 border border-white/20 hover:scale-105 transition-transform"
                            size="icon"
                        >
                            {soundOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                        </Button>
                    </div>
                </div>

                {/* ԿԱՐԳԱՎՈՐՄԱՆ ԷԿՐԱՆ */}
                {gamePhase === 'setup' && (
                    <div className="min-h-[80vh] flex flex-col items-center space-y-12">
                        {/* Hero բաժին */}
                        <div className="text-center space-y-6 max-w-4xl">
                            <div className="relative inline-block">
                                <h1 className="text-[80px] md:text-[100px] font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 animate-gradient-slow mb-4">
                                    🗺️ GEO-MYSTERY
                                </h1>
                                <div className="absolute -top-4 -right-4 text-3xl animate-bounce">✨</div>
                                <div className="absolute -bottom-4 -left-4 text-3xl animate-pulse">🧭</div>
                            </div>

                            <p className="text-2xl md:text-3xl text-white/90 font-light">
                                Աշխարհագրական դետեկտիվ <span className="text-yellow-300 font-bold">խաղ օֆիսի համար</span>
                            </p>

                            <div className="flex flex-wrap justify-center gap-4 mt-8">
                                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
                                    <Globe className="w-5 h-5 text-blue-400" />
                                    <span className="text-white">150+ աշխարհագրական հարց</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
                                    <Camera className="w-5 h-5 text-green-400" />
                                    <span className="text-white">Փողոցային տեսարաններ</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
                                    <CrownIcon className="w-5 h-5 text-yellow-400" />
                                    <span className="text-white">Մրցակցային ռեժիմ</span>
                                </div>
                            </div>
                        </div>

                        {/* Խաղի կարգավորումների տարածք */}
                        <div className="w-full max-w-6xl">
                            <Tabs defaultValue="teams" className="w-full">
                                <TabsList className="grid grid-cols-3 mb-8 bg-white/10 backdrop-blur-md border border-white/20">
                                    <TabsTrigger value="teams" className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500">
                                        <UsersIcon className="w-4 h-4 mr-2" />
                                        Թիմեր
                                    </TabsTrigger>
                                    <TabsTrigger value="settings" className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-green-500">
                                        <Settings className="w-4 h-4 mr-2" />
                                        Կարգավորումներ
                                    </TabsTrigger>
                                    <TabsTrigger value="rules" className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500">
                                        <Target className="w-4 h-4 mr-2" />
                                        Կանոններ
                                    </TabsTrigger>
                                </TabsList>

                                {/* Թիմերի ներդիր */}
                                <TabsContent value="teams" className="space-y-8">
                                    {/* Ստեղծել թիմի քարտ */}
                                    <div className="bg-gradient-to-br from-blue-900/40 to-emerald-900/40 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-2xl">
                                        <div className="flex items-center justify-between mb-8">
                                            <div>
                                                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                                                    <UserPlus className="w-8 h-8 text-blue-400" />
                                                    Ստեղծել Նոր Թիմ
                                                </h2>
                                                <p className="text-white/70 mt-2">Ավելացրեք ձեր թիմը և անդամներին</p>
                                            </div>
                                            <div className="text-4xl animate-pulse">🧭</div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {/* Ձախ սյունակ - Հիմնական տեղեկություն */}
                                            <div className="space-y-6">
                                                <div>
                                                    <Label className="text-white text-lg mb-3 block">🏷️ Թիմի Անուն</Label>
                                                    <Input
                                                        value={newTeam.name}
                                                        onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                                                        placeholder="Օրինակ՝ Աշխարհագետներ"
                                                        className="h-14 text-lg bg-white/10 border-white/20 text-white placeholder-white/50"
                                                    />
                                                </div>

                                                <div>
                                                    <Label className="text-white text-lg mb-3 block">🎨 Թիմի Գույն</Label>
                                                    <div className="grid grid-cols-5 gap-3">
                                                        {colorOptions.map((color) => (
                                                            <button
                                                                key={color.value}
                                                                onClick={() => setNewTeam({ ...newTeam, color: color.value })}
                                                                className={`aspect-square rounded-xl bg-gradient-to-r ${color.value} flex flex-col items-center justify-center p-2 transition-all ${newTeam.color === color.value ? 'ring-4 ring-white scale-110 shadow-2xl' : 'hover:scale-105'}`}
                                                                title={color.label}
                                                            >
                                                                <span className="text-2xl mb-1">{color.icon}</span>
                                                                <span className="text-xs text-white/80">{color.label}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Աջ սյունակ - Անդամներ */}
                                            <div className="space-y-6">
                                                <div>
                                                    <Label className="text-white text-lg mb-3 block">👤 Թիմի Ավատար</Label>
                                                    <div className="flex flex-wrap gap-3">
                                                        {avatarOptions.map((avatar) => (
                                                            <button
                                                                key={avatar}
                                                                onClick={() => setNewTeam({ ...newTeam, avatar })}
                                                                className={`text-3xl w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${newTeam.avatar === avatar ? 'bg-white/30 scale-110 ring-4 ring-white' : 'bg-white/10 hover:bg-white/20'}`}
                                                            >
                                                                {avatar}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div>
                                                    <div className="flex justify-between items-center mb-3">
                                                        <Label className="text-white text-lg">👥 Անդամներ</Label>
                                                        <Button
                                                            onClick={() => setNewTeam({ ...newTeam, members: [...newTeam.members, ''] })}
                                                            className="bg-white/10 hover:bg-white/20 text-white"
                                                            size="sm"
                                                        >
                                                            <Plus className="w-4 h-4 mr-2" />
                                                            Ավելացնել
                                                        </Button>
                                                    </div>

                                                    <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                                                        {newTeam.members.map((member, idx) => (
                                                            <div key={idx} className="flex gap-3 items-center">
                                                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                                                    <User className="w-5 h-5 text-white/50" />
                                                                </div>
                                                                <Input
                                                                    value={member}
                                                                    onChange={(e) => {
                                                                        const newMembers = [...newTeam.members];
                                                                        newMembers[idx] = e.target.value;
                                                                        setNewTeam({ ...newTeam, members: newMembers });
                                                                    }}
                                                                    placeholder={`Անդամ ${idx + 1}`}
                                                                    className="flex-1 bg-white/10 border-white/20 text-white"
                                                                />
                                                                {idx >= 2 && (
                                                                    <Button
                                                                        onClick={() => {
                                                                            const newMembers = newTeam.members.filter((_, i) => i !== idx);
                                                                            setNewTeam({ ...newTeam, members: newMembers });
                                                                        }}
                                                                        variant="destructive"
                                                                        size="icon"
                                                                        className="flex-shrink-0"
                                                                    >
                                                                        <X className="w-4 h-4" />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-8 pt-8 border-t border-white/20">
                                            <Button
                                                onClick={addTeam}
                                                className="w-full py-7 text-xl font-bold rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 hover:scale-[1.02] transition-all shadow-2xl shadow-blue-500/30"
                                            >
                                                <Plus className="w-6 h-6 mr-3" />
                                                Ստեղծել Թիմը
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Գոյություն ունեցող թիմեր */}
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-2xl font-bold text-white">Ձեր Թիմերը ({teams.length})</h3>
                                            <div className="text-white/70">
                                                Պահանջվում է առնվազն 2 թիմ
                                            </div>
                                        </div>

                                        {teams.length === 0 ? (
                                            <div className="text-center py-16 bg-white/5 rounded-3xl border border-dashed border-white/20">
                                                <div className="text-6xl mb-4">👥</div>
                                                <h4 className="text-xl text-white/70 mb-2">Դեռ չկան թիմեր</h4>
                                                <p className="text-white/50">Սկսեք ստեղծել ձեր առաջին թիմը</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {teams.map((team, index) => (
                                                    <div
                                                        key={team.id}
                                                        className={`bg-gradient-to-br ${team.color}/20 to-white/5 backdrop-blur-lg p-6 rounded-3xl border border-white/20 hover:scale-[1.02] transition-all duration-300 group`}
                                                    >
                                                        <div className="flex justify-between items-start mb-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="text-4xl">{team.avatar}</div>
                                                                <div>
                                                                    <h4 className="text-xl font-bold text-white">{team.name}</h4>
                                                                    <div className="flex items-center gap-2">
                                                                        <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${team.color}`} />
                                                                        <span className="text-sm text-white/70">{team.members.length} անդամ</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <Button
                                                                onClick={() => removeTeam(team.id)}
                                                                variant="ghost"
                                                                size="icon"
                                                                className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20"
                                                            >
                                                                <Trash2 className="w-4 h-4 text-white/70" />
                                                            </Button>
                                                        </div>

                                                        <div className="space-y-2">
                                                            {team.members.map((member, idx) => (
                                                                <div key={idx} className="flex items-center justify-between bg-white/5 p-3 rounded-xl">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                                                            <User className="w-4 h-4 text-white/50" />
                                                                        </div>
                                                                        <span className="text-white/90">{member || `Անդամ ${idx + 1}`}</span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        <div className="mt-4 pt-4 border-t border-white/10 text-center">
                                                            <div className="text-2xl font-bold text-yellow-300">0 միավոր</div>
                                                            <div className="text-sm text-white/50">Պատրաստ է ճանապարհորդության</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>

                                {/* Կարգավորումների ներդիր */}
                                <TabsContent value="settings" className="space-y-8">
                                    <div className="bg-gradient-to-br from-emerald-900/40 to-green-900/40 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-2xl">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {/* Խաղի կարգավորումներ */}
                                            <div className="space-y-6">
                                                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                                                    <Gamepad2 className="w-6 h-6 text-emerald-400" />
                                                    Խաղի Կարգավորումներ
                                                </h3>

                                                <div className="space-y-6">
                                                    <div>
                                                        <Label className="text-white text-lg mb-3 block flex items-center gap-2">
                                                            <TimerIcon className="w-5 h-5" />
                                                            Ժամանակի Սահմանափակում
                                                        </Label>
                                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                            {[30, 45, 60, 90].map((sec) => (
                                                                <Button
                                                                    key={sec}
                                                                    onClick={() => setConfig({ ...config, timerDuration: sec })}
                                                                    variant={config.timerDuration === sec ? "default" : "outline"}
                                                                    className={`h-14 text-lg ${config.timerDuration === sec ? 'bg-gradient-to-r from-emerald-500 to-green-500' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}
                                                                >
                                                                    {sec} վայրկյան
                                                                </Button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <Label className="text-white text-lg mb-3 block flex items-center gap-2">
                                                            <MapIcon className="w-5 h-5" />
                                                            Քարտեզի Ոճ
                                                        </Label>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            {[
                                                                { value: 'satellite', label: 'Արբանյակային', icon: '🛰️' },
                                                                { value: 'street', label: 'Փողոցային', icon: '🛣️' },
                                                                { value: 'terrain', label: 'Ռելիեֆ', icon: '🏔️' },
                                                                { value: 'night', label: 'Գիշերային', icon: '🌃' }
                                                            ].map((style) => (
                                                                <Button
                                                                    key={style.value}
                                                                    onClick={() => setConfig({ ...config, mapStyle: style.value as any })}
                                                                    variant={config.mapStyle === style.value ? "default" : "outline"}
                                                                    className={`h-14 text-lg ${config.mapStyle === style.value ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}
                                                                >
                                                                    <span className="text-xl mr-2">{style.icon}</span>
                                                                    {style.label}
                                                                </Button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4">
                                                        {[
                                                            { key: 'autoPlay' as const, label: 'Ավտոմատ նվագարկում', icon: '▶️' },
                                                            { key: 'soundEnabled' as const, label: 'Ձայնային էֆեկտներ', icon: '🔊' },
                                                            { key: 'enableHints' as const, label: 'Միացնել հուշումները', icon: '💡' },
                                                            { key: 'pointsMultiplier' as const, label: 'Արագության բոնուս', icon: '⚡' },
                                                            { key: 'shuffleQuestions' as const, label: 'Խառը հարցեր', icon: '🔀' },
                                                        ].map((item) => (
                                                            <div key={item.key} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                                                <div className="flex items-center gap-3">
                                                                    <span className="text-xl">{item.icon}</span>
                                                                    <span className="text-white">{item.label}</span>
                                                                </div>
                                                                <Button
                                                                    onClick={() => setConfig({ ...config, [item.key]: !config[item.key] })}
                                                                    variant={config[item.key] ? "default" : "outline"}
                                                                    className={`w-16 ${config[item.key] ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-white/10 border-white/20'}`}
                                                                >
                                                                    {config[item.key] ? 'Այո' : 'Ոչ'}
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Նախադիտում */}
                                            <div className="space-y-6">
                                                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                                                    <Globe className="w-6 h-6 text-blue-400" />
                                                    Խաղի Նախադիտում
                                                </h3>

                                                <div className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-2xl border border-white/20 space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" />
                                                            <div>
                                                                <div className="text-white font-bold">Աշխարհագետներ</div>
                                                                <div className="text-sm text-white/70">0 միավոր</div>
                                                            </div>
                                                        </div>
                                                        <div className="bg-white/10 px-4 py-2 rounded-full">
                                                            <span className="text-white font-mono">{config.timerDuration} վ</span>
                                                        </div>
                                                    </div>

                                                    <div className="aspect-video bg-gradient-to-br from-blue-900/50 to-emerald-900/50 rounded-xl border border-white/20 flex items-center justify-center">
                                                        <div className="text-center">
                                                            <div className="text-4xl mb-2">🗺️</div>
                                                            <div className="text-white/70">Աշխարհագրական հարցի նախադիտում</div>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3">
                                                        {['Հայաստան', 'Վրաստան', 'Իրան', 'Թուրքիա'].map((opt, i) => (
                                                            <div key={i} className="bg-white/5 p-3 rounded-lg border border-white/10 text-white/70 text-sm text-center">
                                                                {opt}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="p-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl border border-blue-500/30">
                                                    <div className="text-blue-300 text-sm">
                                                        ✅ Խաղը կաշխատի հետևյալ կարգավորումներով
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                {/* Կանոնների ներդիր */}
                                <TabsContent value="rules" className="space-y-6">
                                    <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-2xl">
                                        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                            <Target className="w-6 h-6 text-purple-400" />
                                            Խաղի Կանոններ
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {[
                                                {
                                                    icon: '🗺️',
                                                    title: 'Հարցերի տեսակներ',
                                                    points: [
                                                        'Քարտեզներ և ուրվագծեր',
                                                        'Տեսարաններ և լանդշաֆտներ',
                                                        'Դրոշներ և խորհրդանիշներ',
                                                        'Մշակութային օբյեկտներ',
                                                        'Կլիմայական պայմաններ',
                                                        'Փողոցային տեսարաններ'
                                                    ]
                                                },
                                                {
                                                    icon: '🏆',
                                                    title: 'Միավորների համակարգ',
                                                    points: [
                                                        'Հեշտ հարց՝ 200-250 միավոր',
                                                        'Միջին հարց՝ 300-350 միավոր',
                                                        'Բարդ հարց՝ 400-450 միավոր',
                                                        'Էքսպերտ հարց՝ 500 միավոր',
                                                        'Արագ պատասխան՝ +50% բոնուս',
                                                        'Հուշում օգտագործելուց՝ -50 միավոր'
                                                    ]
                                                },
                                                {
                                                    icon: '🌍',
                                                    title: 'Աշխարհամասեր',
                                                    points: [
                                                        'Ասիա - դեղին/նարնջագույն',
                                                        'Եվրոպա - կապույտ/մանուշակագույն',
                                                        'Աֆրիկա - դեղին/շագանակագույն',
                                                        'Ամերիկա - կանաչ/կարմիր',
                                                        'Ավստրալիա - մանուշակագույն/վարդագույն',
                                                        'Անտարկտիդա - սպիտակ/կապույտ'
                                                    ]
                                                },
                                                {
                                                    icon: '🎯',
                                                    title: 'Հաղթողի որոշում',
                                                    points: [
                                                        'Ամենաբարձր միավորներ',
                                                        'Ամենաարագ պատասխաններ',
                                                        'Առանց հուշումների խաղ',
                                                        'Թիմային համագործակցություն',
                                                        'Աշխարհագրական գիտելիքներ',
                                                        'Տեղեկատվության վերլուծություն'
                                                    ]
                                                }
                                            ].map((section, idx) => (
                                                <div key={idx} className="bg-white/5 p-6 rounded-2xl border border-white/10">
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <div className="text-3xl">{section.icon}</div>
                                                        <h4 className="text-xl font-bold text-white">{section.title}</h4>
                                                    </div>
                                                    <ul className="space-y-2">
                                                        {section.points.map((point, i) => (
                                                            <li key={i} className="flex items-start gap-2 text-white/80">
                                                                <span className="text-green-400 mt-1">•</span>
                                                                <span>{point}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>

                            {/* Սկսել խաղը կոճակ */}
                            <div className="text-center mt-12">
                                <Button
                                    onClick={startGame}
                                    disabled={teams.length < 2 || questions.length === 0}
                                    className={`px-20 py-8 text-2xl font-black rounded-3xl transition-all duration-500 ${teams.length >= 2 && questions.length > 0
                                        ? 'bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 hover:from-blue-500 hover:via-cyan-500 hover:to-emerald-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50 animate-pulse-slow'
                                        : 'bg-gray-700 cursor-not-allowed opacity-50'}`}
                                >
                                    {teams.length >= 2 && questions.length > 0 ? (
                                        <>
                                            <Plane className="w-10 h-10 mr-4 animate-bounce" />
                                            🚀 Սկսել ճանապարհորդությունը
                                            <Compass className="w-10 h-10 ml-4 animate-spin" />
                                        </>
                                    ) : teams.length < 2 ? (
                                        '➕ Ավելացրեք 2 թիմ'
                                    ) : (
                                        '➕ Ավելացրեք հարցեր'
                                    )}
                                </Button>

                                {teams.length >= 2 && questions.length > 0 && (
                                    <p className="text-white/70 mt-6 text-lg animate-pulse">
                                        Պատրաստ է խաղալ {teams.length} թիմերով և {config.timerDuration} վայրկյանանոց ժամանակաչափով
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ՆԵՐԱԾՄԱՆ ԷԿՐԱՆ */}
                {gamePhase === 'intro' && (
                    <div className="min-h-screen flex flex-col items-center justify-center space-y-12 px-4 animate-fade-in">
                        <div className="text-center space-y-8 max-w-4xl">
                            <div className="relative">
                                <h1 className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 animate-gradient-slow mb-6">
                                    ՊԱՏՐԱՍՏ
                                </h1>
                                <div className="absolute -top-8 -right-8 text-5xl animate-bounce">✈️</div>
                                <div className="absolute -bottom-8 -left-8 text-5xl animate-ping">🧭</div>
                            </div>

                            <p className="text-4xl text-white/90 font-light">
                                <span className="text-yellow-300 font-bold">{teams.length} թիմ</span> պատրաստ են աշխարհով մեկ ճանապարհորդելու
                            </p>

                            <div className="flex flex-wrap justify-center gap-6 mt-8">
                                <div className="flex items-center gap-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-md px-8 py-4 rounded-2xl border border-white/20">
                                    <Timer className="w-6 h-6 text-blue-400" />
                                    <div>
                                        <div className="text-2xl font-bold text-white">{config.timerDuration} վ</div>
                                        <div className="text-white/70 text-sm">յուրաքանչյուր հարցի համար</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-500/20 to-green-500/20 backdrop-blur-md px-8 py-4 rounded-2xl border border-white/20">
                                    <Globe className="w-6 h-6 text-emerald-400" />
                                    <div>
                                        <div className="text-2xl font-bold text-white">{shuffledQuestions.length} հարց</div>
                                        <div className="text-white/70 text-sm">ընդհանուր առաջադրանք</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-md px-8 py-4 rounded-2xl border border-white/20">
                                    <Trophy className="w-6 h-6 text-purple-400" />
                                    <div>
                                        <div className="text-2xl font-bold text-white">5000+ միավոր</div>
                                        <div className="text-white/70 text-sm">հաղթելու համար</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Թիմերի ցուցադրում */}
                        <div className="w-full max-w-6xl">
                            <h2 className="text-3xl font-bold text-white text-center mb-8">🌍 Մրցող Թիմերը</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {teams.map((team, index) => (
                                    <div
                                        key={team.id}
                                        className={`relative p-6 rounded-3xl bg-gradient-to-br ${team.color} transform hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-white/20`}
                                    >
                                        <div className="absolute -top-4 -right-4 text-4xl animate-bounce">
                                            {index === 0 ? '🧭' : index === 1 ? '🗺️' : index === 2 ? '🏔️' : '🌊'}
                                        </div>
                                        <div className="text-center space-y-4">
                                            <div className="text-6xl">{team.avatar}</div>
                                            <h3 className="text-2xl font-bold text-white">{team.name}</h3>
                                            <div className="space-y-2">
                                                {team.members.map((member, idx) => (
                                                    <div key={idx} className="bg-white/20 px-4 py-2 rounded-full">
                                                        <span className="text-white">{member}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="pt-4 border-t border-white/20">
                                                <div className="text-3xl font-black text-yellow-300">0</div>
                                                <div className="text-white/70">միավոր</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Սկսել կոճակ */}
                        <div className="text-center space-y-8">
                            <div className="flex items-center justify-center gap-6">
                                <div className="text-white/70 text-xl animate-pulse">
                                    Առաջին կանգառը պատրաստ է
                                </div>
                            </div>

                            <Button
                                onClick={beginPlaying}
                                className="px-24 py-10 text-2xl font-black rounded-3xl bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-600 hover:from-emerald-500 hover:via-green-500 hover:to-emerald-500 hover:scale-110 transition-all duration-500 animate-bounce-slow shadow-2xl shadow-emerald-500/30"
                            >
                                <Ship className="w-12 h-12 mr-6 animate-pulse" />
                                🚢 Սկսել ճանապարհորդությունը
                                <Navigation className="w-12 h-12 ml-6" />
                            </Button>

                            <p className="text-white/50 text-lg">
                                Լավագույն աշխարհագետ թիմը կստանա հատուկ մրցանակ 🏆
                            </p>
                        </div>
                    </div>
                )}

                {/* ԽԱՂԻ ԷԿՐԱՆ */}
                {gamePhase === 'playing' && (
                    <div className="min-h-screen py-8 space-y-8 animate-fade-in">
                        {/* Խաղի վերնագիր */}
                        <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-8">
                            {/* Թիմերի առաջընթաց */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full lg:w-auto">
                                {teams.map((team, idx) => (
                                    <div
                                        key={team.id}
                                        className={`relative p-4 rounded-2xl backdrop-blur-lg border-3 ${idx === activeTeam
                                            ? 'border-white shadow-2xl shadow-white/30 scale-105 animate-pulse'
                                            : 'border-white/20'} bg-gradient-to-br ${team.color}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="text-2xl">{team.avatar}</div>
                                                <div>
                                                    <div className="text-sm font-bold text-white truncate max-w-[80px]">
                                                        {team.name}
                                                    </div>
                                                    <div className="text-2xl font-black text-yellow-300">
                                                        {team.score}
                                                    </div>
                                                </div>
                                            </div>
                                            {idx === activeTeam && (
                                                <div className="text-3xl animate-bounce">🎤</div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Ժամանակաչափ և կառավարում */}
                            <div className="flex items-center gap-6">
                                <div className="relative">
                                    <div className={`flex items-center gap-4 bg-gradient-to-r ${timeLeft <= 10
                                        ? 'from-red-500/30 to-pink-500/30'
                                        : 'from-blue-500/30 to-cyan-500/30'} backdrop-blur-xl px-8 py-4 rounded-2xl border-2 ${timeLeft <= 10 ? 'border-red-400 animate-pulse' : 'border-white/30'}`}>
                                        <Clock className={`w-8 h-8 ${timeLeft <= 10 ? 'text-red-400 animate-spin' : 'text-white'}`} />
                                        <span className={`text-5xl font-black font-mono ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                                            {timeLeft}
                                        </span>
                                    </div>
                                    {timeLeft <= 10 && (
                                        <div className="absolute -top-2 -right-2 text-2xl animate-bounce">🔥</div>
                                    )}
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        onClick={() => setIsPlaying(!isPlaying)}
                                        className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 backdrop-blur-md border-0 hover:scale-110 transition-all"
                                        size="icon"
                                    >
                                        {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                                    </Button>

                                    <Button
                                        onClick={useHint}
                                        disabled={hintUsed || showAnswer || !config.enableHints}
                                        className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 backdrop-blur-md border-0 hover:scale-110 transition-all"
                                        size="icon"
                                    >
                                        <Zap className="w-6 h-6" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Առաջընթացի տող */}
                        <div className="relative">
                            <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-500 transition-all duration-500 ease-out"
                                    style={{ width: `${((currentQuestion + 1) / shuffledQuestions.length) * 100}%` }}
                                />
                            </div>
                            <div className="flex justify-between mt-2">
                                <span className="text-white/70">Կանգառ {currentQuestion + 1}</span>
                                <span className="text-white/70">Ընդհանուր {shuffledQuestions.length}</span>
                            </div>
                        </div>

                        {/* Հիմնական խաղի տարածք */}
                        <div className="space-y-10">
                            {/* Հարցի վերնագիր */}
                            <div className="text-center space-y-6">
                                {shuffledQuestions[currentQuestion] && (
                                    <>
                                        <div className="inline-flex items-center gap-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-lg px-8 py-4 rounded-full border border-white/20">
                                            <span className="text-3xl">
                                                {shuffledQuestions[currentQuestion].type === 'map' && '🗺️'}
                                                {shuffledQuestions[currentQuestion].type === 'photo' && '📷'}
                                                {shuffledQuestions[currentQuestion].type === 'landmark' && '🏛️'}
                                                {shuffledQuestions[currentQuestion].type === 'flag' && '🏴'}
                                                {shuffledQuestions[currentQuestion].type === 'culture' && '🎭'}
                                                {shuffledQuestions[currentQuestion].type === 'satellite' && '🛰️'}
                                                {shuffledQuestions[currentQuestion].type === 'climate' && '🌤️'}
                                                {shuffledQuestions[currentQuestion].type === 'cityscape' && '🌆'}
                                            </span>
                                            <div className="text-left">
                                                <div className="text-2xl font-bold text-white">
                                                    {shuffledQuestions[currentQuestion].title}
                                                </div>
                                                <div className="flex gap-2 mt-2">
                                                    <ContinentBadge continent={shuffledQuestions[currentQuestion].continent} />
                                                    <DifficultyIndicator difficulty={shuffledQuestions[currentQuestion].difficulty} />
                                                </div>
                                            </div>
                                            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-4 py-2 rounded-full">
                                                <span className="font-black text-white">{shuffledQuestions[currentQuestion].points} միավոր</span>
                                            </div>
                                        </div>

                                        <div className="max-w-3xl mx-auto">
                                            <p className="text-2xl text-white/90">
                                                {shuffledQuestions[currentQuestion].hint}
                                            </p>
                                            {hintUsed && (
                                                <p className="text-xl text-cyan-300 mt-4 animate-pulse bg-cyan-500/20 px-6 py-3 rounded-xl">
                                                    💡 Հուշում: {shuffledQuestions[currentQuestion].answer.split('(')[0]}
                                                </p>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Մեդիա ցուցադրում */}
                            <div className="max-w-5xl mx-auto">
                                {shuffledQuestions[currentQuestion] && getMediaComponent(shuffledQuestions[currentQuestion])}
                            </div>

                            {/* Պատասխաններ */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                                {answerOptions.map((answer, idx) => (
                                    <Button
                                        key={idx}
                                        onClick={() => handleAnswer(answer)}
                                        disabled={showAnswer}
                                        className={`group relative p-8 text-xl font-bold h-auto min-h-[100px] rounded-2xl transition-all duration-300 overflow-hidden ${showAnswer && shuffledQuestions[currentQuestion]
                                            ? answer === shuffledQuestions[currentQuestion].answer
                                                ? 'bg-gradient-to-r from-emerald-500 to-green-600 border-4 border-emerald-400 text-white scale-105 shadow-2xl shadow-emerald-500/50'
                                                : selectedAnswer === answer
                                                    ? 'bg-gradient-to-r from-red-500 to-pink-600 border-4 border-red-400 text-white'
                                                    : 'bg-white/5 border-2 border-white/10 text-white/60'
                                            : 'bg-gradient-to-br from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 border-2 border-white/20 hover:border-white/40 text-white hover:scale-[1.03] hover:shadow-2xl'
                                            }`}
                                    >
                                        <span className="relative z-10">{answer}</span>
                                        {!showAnswer && (
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                        )}
                                    </Button>
                                ))}
                            </div>

                            {/* Պատասխանի բացահայտում */}
                            {showAnswer && shuffledQuestions[currentQuestion] && (
                                <div className="max-w-5xl mx-auto space-y-8 text-center animate-in fade-in duration-500">
                                    <div className="relative bg-gradient-to-r from-blue-500/30 via-cyan-500/30 to-emerald-500/30 backdrop-blur-xl p-8 rounded-3xl border-2 border-white/30 shadow-2xl overflow-hidden">
                                        <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full -translate-x-16 -translate-y-16" />
                                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-16 translate-y-16" />

                                        <div className="relative z-10">
                                            <div className="flex items-center justify-center gap-6 mb-6">
                                                <div className="text-5xl animate-bounce">
                                                    {selectedAnswer === shuffledQuestions[currentQuestion].answer ? '🎉' : '💡'}
                                                </div>
                                                <div>
                                                    <h3 className="text-3xl font-bold text-white mb-2">
                                                        {selectedAnswer === shuffledQuestions[currentQuestion].answer
                                                            ? 'ՃԻՇՏ ՊԱՏԱՍԽԱՆ'
                                                            : 'ՃՇՏԵՄՈՒՄ'}
                                                    </h3>
                                                    <div className="text-2xl text-yellow-300 font-black">
                                                        Պատասխան՝ {shuffledQuestions[currentQuestion].answer}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                                <div className="bg-black/30 p-4 rounded-xl">
                                                    <div className="text-white/70 mb-1">Երկիր</div>
                                                    <div className="text-xl text-white font-bold">{shuffledQuestions[currentQuestion].country}</div>
                                                </div>
                                                <div className="bg-black/30 p-4 rounded-xl">
                                                    <div className="text-white/70 mb-1">Աշխարհամաս</div>
                                                    <div className="text-xl text-white font-bold">
                                                        {shuffledQuestions[currentQuestion].continent}
                                                    </div>
                                                </div>
                                                <div className="bg-black/30 p-4 rounded-xl">
                                                    <div className="text-white/70 mb-1">Միավորներ</div>
                                                    <div className="text-2xl text-yellow-300 font-bold">{shuffledQuestions[currentQuestion].points}</div>
                                                </div>
                                            </div>

                                            {shuffledQuestions[currentQuestion].year && (
                                                <div className="bg-black/40 p-4 rounded-xl border border-white/20 mb-6">
                                                    <div className="text-xl text-white/90 italic">
                                                        {shuffledQuestions[currentQuestion].funFact}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="bg-black/40 p-6 rounded-xl border border-white/20">
                                                <div className="text-xl text-white/90 italic">
                                                    {shuffledQuestions[currentQuestion].funFact}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={nextQuestion}
                                        className="px-16 py-8 text-2xl font-black rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 hover:from-blue-500 hover:via-cyan-500 hover:to-emerald-500 hover:scale-105 transition-transform group shadow-2xl shadow-blue-500/30"
                                    >
                                        {currentQuestion < shuffledQuestions.length - 1 ? (
                                            <>
                                                Հաջորդ կանգառ
                                                <Plane className="w-8 h-8 ml-4 group-hover:translate-x-2 transition-transform" />
                                            </>
                                        ) : (
                                            <>
                                                Տեսնել արդյունքները
                                                <Trophy className="w-8 h-8 ml-4 animate-spin" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Արդյունքների էկրան */}
                {gamePhase === 'results' && (
                    <div className="min-h-screen flex flex-col items-center justify-center space-y-16 px-4 animate-fade-in">
                        {/* Հաղթողի տոնակատարություն */}
                        <div className="text-center space-y-8 max-w-4xl">
                            <div className="relative">
                                <h1 className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 animate-gradient-slow">
                                    🏆 Հաղթող
                                </h1>
                                <div className="absolute -top-6 -right-6 text-6xl animate-bounce">🎊</div>
                                <div className="absolute -bottom-6 -left-6 text-6xl animate-spin">✨</div>
                            </div>

                            {teams.length > 0 && (
                                <div className="relative">
                                    <div className={`bg-gradient-to-r ${teams.sort((a, b) => b.score - a.score)[0].color} p-8 rounded-3xl border-4 border-yellow-400 shadow-2xl shadow-yellow-500/50 transform hover:scale-105 transition-all duration-500`}>
                                        <div className="text-8xl mb-6 animate-bounce">{teams.sort((a, b) => b.score - a.score)[0].avatar}</div>
                                        <h2 className="text-5xl font-black text-white mb-4">
                                            {teams.sort((a, b) => b.score - a.score)[0].name}
                                        </h2>
                                        <div className="text-6xl font-black text-yellow-300 mb-4">
                                            {teams.sort((a, b) => b.score - a.score)[0].score} միավոր
                                        </div>
                                        <div className="text-xl text-white/80">
                                            {teams.sort((a, b) => b.score - a.score)[0].members.join(', ')}
                                        </div>
                                    </div>
                                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-6xl animate-pulse">
                                        🧭
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Բոլոր թիմերի արդյունքները */}
                        <div className="w-full max-w-4xl">
                            <h3 className="text-3xl font-bold text-white text-center mb-8">📊 Բոլոր Թիմերի Արդյունքները</h3>
                            <div className="space-y-6">
                                {teams
                                    .sort((a, b) => b.score - a.score)
                                    .map((team, idx) => (
                                        <div
                                            key={team.id}
                                            className={`relative bg-gradient-to-r ${team.color}/30 to-white/5 backdrop-blur-lg p-6 rounded-3xl border-2 ${idx === 0
                                                ? 'border-yellow-400 shadow-2xl shadow-yellow-500/30'
                                                : 'border-white/20'} hover:scale-[1.02] transition-all duration-300`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-6">
                                                    <div className={`text-4xl ${idx === 0 ? 'animate-bounce' : ''}`}>
                                                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '🏅'}
                                                    </div>
                                                    <div className="text-3xl">{team.avatar}</div>
                                                    <div>
                                                        <h4 className="text-2xl font-bold text-white">{team.name}</h4>
                                                        <div className="text-white/70">{team.members.join(', ')}</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-4xl font-black text-yellow-300">{team.score}</div>
                                                    <div className="text-white/70">միավոր</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>

                        {/* Վիճակագրություն */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl w-full">
                            {[
                                {
                                    label: 'Անցած կանգառներ',
                                    value: currentQuestion + 1,
                                    icon: '📍',
                                    color: 'from-blue-500 to-cyan-500'
                                },
                                {
                                    label: 'Ընդհանուր միավոր',
                                    value: teams.reduce((sum, t) => sum + t.score, 0),
                                    icon: '⭐',
                                    color: 'from-yellow-500 to-orange-500'
                                },
                                {
                                    label: 'Աշխարհամասեր',
                                    value: new Set(shuffledQuestions.slice(0, currentQuestion + 1).map(q => q.continent)).size,
                                    icon: '🌍',
                                    color: 'from-emerald-500 to-green-500'
                                },
                                {
                                    label: 'Ճանապարհորդության ժամանակ',
                                    value: `${Math.round((currentQuestion + 1) * config.timerDuration / 60)} րոպե`,
                                    icon: '⏱️',
                                    color: 'from-purple-500 to-pink-500'
                                },
                            ].map((stat, idx) => (
                                <div key={idx} className={`bg-gradient-to-r ${stat.color} p-6 rounded-2xl text-center shadow-lg`}>
                                    <div className="text-4xl mb-4">{stat.icon}</div>
                                    <div className="text-3xl font-black text-white">{stat.value}</div>
                                    <div className="text-white/90 mt-2">{stat.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Գործողությունների կոճակներ */}
                        <div className="flex flex-wrap gap-6 justify-center">
                            <Button
                                onClick={() => {
                                    setGamePhase('playing');
                                    setCurrentQuestion(0);
                                    setTimeLeft(config.timerDuration);
                                    setShowAnswer(false);
                                    setSelectedAnswer('');
                                    setTeams(teams.map(t => ({ ...t, score: 0 })));
                                    setActiveTeam(0);
                                    setIsPlaying(true);
                                    setHintUsed(false);
                                }}
                                className="px-10 py-8 text-2xl font-black rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 hover:scale-105 transition-transform shadow-2xl shadow-emerald-500/30"
                            >
                                <Play className="w-8 h-8 mr-4" />
                                Կրկին խաղալ
                            </Button>

                            <Button
                                onClick={() => setGamePhase('setup')}
                                variant="outline"
                                className="px-10 py-8 text-2xl font-black rounded-2xl border-3 border-white/30 hover:bg-white/10 hover:scale-105 transition-transform"
                            >
                                <Settings className="w-8 h-8 mr-4" />
                                Նոր ճանապարհորդություն
                            </Button>

                            <Button
                                onClick={() => {
                                    const text = `🗺️ GEO-MYSTERY - Աշխարհագրական Դետեկտիվ\n\n🏆 Մեր արդյունքները․\n${teams
                                        .sort((a, b) => b.score - a.score)
                                        .map((t, i) => `${i + 1}. ${t.name} - ${t.score} միավոր`)
                                        .join('\n')}\n\n✨ Խաղացեք այստեղ՝ ${window.location.origin}`;
                                    navigator.clipboard.writeText(text);
                                    alert('Արդյունքները պատճենվեցին! 📋');
                                }}
                                className="px-10 py-8 text-2xl font-black rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 hover:scale-105 transition-transform shadow-2xl shadow-blue-500/30"
                            >
                                <Heart className="w-8 h-8 mr-4" />
                                Կիսվել
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Ստեղնաշարի արագ հրամաններ */}
            <div className="hidden">
                Ստեղնաշարի կարճ հրամաններ․
                Space - Ժամանակաչափի դադարեցում/շարունակում
                H - Հուշում օգտագործել
                1-4 - Պատասխան ընտրել
                N - Հաջորդ հարց
            </div>

            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(180deg); }
                }
                
                @keyframes star {
                    0%, 100% { opacity: 0.1; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.2); }
                }
                
                @keyframes gradient-slow {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                
                @keyframes pulse-slow {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.8; }
                }
                
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .animate-float { animation: float 8s ease-in-out infinite; }
                .animate-star { animation: star 3s ease-in-out infinite; }
                .animate-gradient-slow { 
                    background-size: 200% 200%; 
                    animation: gradient-slow 8s ease infinite; 
                }
                .animate-pulse-slow { animation: pulse-slow 2s ease-in-out infinite; }
                .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
                .animate-fade-in { animation: fade-in 0.8s ease-out; }
            `}</style>
        </div>
    );
};

export default GeoMysteryGame;