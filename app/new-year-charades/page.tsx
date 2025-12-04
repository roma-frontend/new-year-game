"use client"

import React, { useState, useEffect, useRef } from 'react';
import { Timer, Users, Trophy, Sparkles, Zap, Clock, Star, Play, Pause, RotateCcw, Settings, TrendingUp, Award, Target, Flame, Shield, Gift, Music, Mic, Volume2, VolumeX, Eye, EyeOff, ChevronRight, Plus, Minus, Check, X, Crown, Rocket, Heart, Brain, Coffee, BookOpen, Lightbulb, Siren, PartyPopper, Snowflake, Volume, Bell, AlertCircle, BrainCircuit, LightbulbOff, Moon, Sun, CloudRain, Wind, BrickWallFire, User, UserPlus, UserMinus, Edit, Trash2, Save, Mail, Phone, Briefcase, MapPin, Calendar, Hash } from 'lucide-react';
import useSound from 'use-sound';

// Типы для игры
type GameState = 'menu' | 'setup' | 'teamSetup' | 'ready' | 'playing' | 'results';
type Difficulty = 'easy' | 'medium' | 'hard' | 'expert' | 'insane';
type GameMode = 'classic' | 'tournament' | 'survival' | 'blitz' | 'cooperation';
type Theme = 'night' | 'aurora' | 'fire' | 'ocean';
type Mood = 'neutral' | 'happy' | 'sad';
type SpecialCardType = 'joker' | 'freeze' | 'double' | 'swap' | 'shield' | 'bomb' | 'vision' | 'bonus' | 'timeWarp' | 'mindReader';

interface Player {
    id: string;
    name: string;
    avatar: string;
    isActive: boolean;
    stats: {
        gamesPlayed: number;
        gamesWon: number;
        totalPoints: number;
        accuracy: number;
        favoriteCategory: string;
    };
}

interface Category {
    name: string;
    emoji: string;
    color: string;
    icon: React.ReactNode;
    difficulty: number;
    description: string;
}

interface DifficultySetting {
    time: number;
    points: number;
    label: string;
    color: string;
    icon: string;
    multiplier: number;
    description: string;
}

interface GameModeInfo {
    name: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    features: string[];
}

interface SpecialCard {
    type: SpecialCardType;
    name: string;
    emoji: string;
    description: string;
    color: string;
    effect: string;
}

interface Team {
    id: string;
    name: string;
    color: string;
    emoji: string;
    players: Player[];
    captain: Player | null;
    score: number;
    specialCards: Record<SpecialCardType, number>;
    correctGuesses: number;
    skippedWords: number;
    fastestTime: number | null;
    streak: number;
    maxStreak: number;
    lives: number;
    efficiency: number;
    lastAction: { type: string; points?: number; time: number } | null;
}

interface Card {
    word: string;
    category: string;
    categoryInfo: Category;
    difficulty: number;
    aiHint: string[];
}

interface HistoryItem {
    team: string;
    word: string;
    time: number;
    points: number;
    round: number;
    difficulty: number;
    multiplier: string;
}

interface Stats {
    fastestGuess: { team: string; time: number; word: string; points?: number } | null;
    bestPlayer: string | null;
    slowestGuess: { team: string; time: number; word: string } | null;
    totalWords: number;
    skippedWords: number;
    history: HistoryItem[];
    avgTime: number;
}

interface Achievement {
    name: string;
    emoji: string;
    description: string;
    points: number;
}

interface Particle {
    id: number;
    type: string;
    x: number;
    y: number;
    size: number;
    speed: number;
    opacity: number;
}

const teamColors = [
    { color: 'from-blue-500 to-cyan-500', bg: 'bg-gradient-to-r from-blue-500 to-cyan-500', emoji: '🔵' },
    { color: 'from-red-500 to-pink-500', bg: 'bg-gradient-to-r from-red-500 to-pink-500', emoji: '🔴' },
    { color: 'from-green-500 to-emerald-500', bg: 'bg-gradient-to-r from-green-500 to-emerald-500', emoji: '🟢' },
    { color: 'from-yellow-500 to-orange-500', bg: 'bg-gradient-to-r from-yellow-500 to-orange-500', emoji: '🟡' },
    { color: 'from-purple-500 to-violet-500', bg: 'bg-gradient-to-r from-purple-500 to-violet-500', emoji: '🟣' },
    { color: 'from-teal-500 to-cyan-500', bg: 'bg-gradient-to-r from-teal-500 to-cyan-500', emoji: '🟦' },
    { color: 'from-pink-500 to-rose-500', bg: 'bg-gradient-to-r from-pink-500 to-rose-500', emoji: '🎀' },
    { color: 'from-indigo-500 to-blue-500', bg: 'bg-gradient-to-r from-indigo-500 to-blue-500', emoji: '🌀' }
];

const playerAvatars = ['👤', '👨', '👩', '🧑', '🧔', '👨‍💼', '👩‍💼', '👨‍🔧', '👩‍🔧', '👨‍🎓', '👩‍🎓', '👨‍🍳', '👩‍🍳', '👨‍🔬', '👩‍🔬'];

const NewYearCharades = () => {
    const [gameState, setGameState] = useState<GameState>('menu');
    const [teams, setTeams] = useState<Team[]>([]);
    const [currentTeam, setCurrentTeam] = useState(0);
    const [currentCard, setCurrentCard] = useState<Card | null>(null);
    const [timeLeft, setTimeLeft] = useState(60);
    const [difficulty, setDifficulty] = useState<Difficulty>('medium');
    const [specialCards, setSpecialCards] = useState<Record<string, boolean>>({});
    const [round, setRound] = useState(1);
    const [maxRounds, setMaxRounds] = useState(5);
    const [stats, setStats] = useState<Stats>({
        fastestGuess: null,
        bestPlayer: null,
        slowestGuess: null,
        totalWords: 0,
        skippedWords: 0,
        history: [],
        avgTime: 0
    });
    const [showConfetti, setShowConfetti] = useState(false);
    const [showFireworks, setShowFireworks] = useState(false);
    const [showSnow, setShowSnow] = useState(false);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [showWord, setShowWord] = useState(true);
    const [gameMode, setGameMode] = useState<GameMode>('classic');
    const [streak, setStreak] = useState(0);
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [cardBack, setCardBack] = useState('gradient1');
    const [teamSize, setTeamSize] = useState(2);
    const [pointsToWin, setPointsToWin] = useState(30);
    const [animateCard, setAnimateCard] = useState(false);
    const [theme, setTheme] = useState<Theme>('night');
    const [aiAssistant, setAiAssistant] = useState(true);
    const [hintLevel, setHintLevel] = useState(0);
    const [timeMultiplier, setTimeMultiplier] = useState(1);
    const [showTutorial, setShowTutorial] = useState(false);
    const [lastAction, setLastAction] = useState('');
    const [combo, setCombo] = useState(0);
    const [mood, setMood] = useState<Mood>('neutral');
    const [particles, setParticles] = useState<Particle[]>([]);
    const [ambientSounds, setAmbientSounds] = useState(true);

    // Состояния для управления командами и игроками
    const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
    const [editingTeam, setEditingTeam] = useState<Team | null>(null);
    const [newTeamName, setNewTeamName] = useState('');
    const [selectedTeamColor, setSelectedTeamColor] = useState(0);
    const [newPlayerName, setNewPlayerName] = useState('');
    const [selectedPlayerAvatar, setSelectedPlayerAvatar] = useState(0);
    const [showAddPlayerForm, setShowAddPlayerForm] = useState(false);
    const [teamSearchTerm, setTeamSearchTerm] = useState('');
    const [playerSearchTerm, setPlayerSearchTerm] = useState('');
    const [showTeamPlayers, setShowTeamPlayers] = useState<string | null>(null);

    // Заглушки для звуков
    const [playCorrect] = useSound('/sounds/correct.mp3', { volume: 0.5 });
    const [playIncorrect] = useSound('/sounds/incorrect.mp3', { volume: 0.3 });
    const [playWin] = useSound('/sounds/win.mp3', { volume: 0.6 });
    const [playLose] = useSound('/sounds/lose.mp3', { volume: 0.4 });
    const [playCardFlip] = useSound('/sounds/card-flip.mp3', { volume: 0.3 });
    const [playTimer] = useSound('/sounds/timer.mp3', { volume: 0.2 });
    const [playClick] = useSound('/sounds/click.mp3', { volume: 0.2 });
    const [playAchievement] = useSound('/sounds/achievement.mp3', { volume: 0.5 });
    const [playSpecial] = useSound('/sounds/special.mp3', { volume: 0.4 });
    const [playAmbient] = useSound('/sounds/ambient.mp3', { volume: 0.1, loop: true });

    const categories: Record<string, Category> = {
        movies: {
            name: 'Ֆիլմեր',
            emoji: '🎬',
            color: 'from-red-500 to-pink-600',
            icon: <Music className="w-5 h-5" />,
            difficulty: 3,
            description: 'Հայտնի ֆիլմեր և կինոգործիչներ'
        },
        professions: {
            name: 'Մասնագիտություններ',
            emoji: '👔',
            color: 'from-blue-500 to-cyan-600',
            icon: <Coffee className="w-5 h-5" />,
            difficulty: 2,
            description: 'Տարբեր մասնագիտություններ'
        },
        emotions: {
            name: 'Զգացմունքներ',
            emoji: '😊',
            color: 'from-yellow-400 to-orange-500',
            icon: <Heart className="w-5 h-5" />,
            difficulty: 4,
            description: 'Տարբեր զգացմունքներ և էմոցիաներ'
        },
        actions: {
            name: 'Գործողություններ',
            emoji: '🏃',
            color: 'from-green-500 to-emerald-600',
            icon: <Rocket className="w-5 h-5" />,
            difficulty: 3,
            description: 'Ֆիզիկական գործողություններ'
        },
        celebrities: {
            name: 'Հանրահայտ անձինք',
            emoji: '⭐',
            color: 'from-purple-500 to-violet-600',
            icon: <Crown className="w-5 h-5" />,
            difficulty: 4,
            description: 'Հայտնի մարդիկ և կերպարներ'
        },
        traditions: {
            name: 'Ամանորյա',
            emoji: '🎄',
            color: 'from-pink-500 to-rose-600',
            icon: <Gift className="w-5 h-5" />,
            difficulty: 2,
            description: 'Ամանորի ավանդույթներ և սովորույթներ'
        },
        animals: {
            name: 'Կենդանիներ',
            emoji: '🦁',
            color: 'from-amber-500 to-yellow-600',
            icon: <Target className="w-5 h-5" />,
            difficulty: 1,
            description: 'Տարբեր կենդանիներ'
        },
        food: {
            name: 'Ուտելիք և ըմպելիքներ',
            emoji: '🍕',
            color: 'from-orange-500 to-red-600',
            icon: <Flame className="w-5 h-5" />,
            difficulty: 2,
            description: 'Սննդամթերք և խմիչքներ'
        },
        places: {
            name: 'Վայրեր',
            emoji: '🏰',
            color: 'from-indigo-500 to-blue-600',
            icon: <BookOpen className="w-5 h-5" />,
            difficulty: 3,
            description: 'Տարբեր վայրեր և տեսարժան վայրեր'
        },
        objects: {
            name: 'Առարկաներ',
            emoji: '📱',
            color: 'from-teal-500 to-cyan-600',
            icon: <Lightbulb className="w-5 h-5" />,
            difficulty: 2,
            description: 'Առօրյա առարկաներ'
        }
    };

    const words: Record<string, string[]> = {
        movies: ['Բախտի հեգնանք', 'Մենակ տանը', 'Հարի Փոթեր', 'Տիտանիկ', 'Մատրիցա', 'Կոշտ ընկույզ', 'Աստղային պատերազմներ', 'Ֆորսաժ', 'Ավատար', 'Ինտերստելլար', 'Ջոկեր', 'Սկիզբ', 'Գլադիատոր', 'Տերմինատոր', 'Առյուծ արքան'],
        professions: ['Դեդ Մորոզ', 'Սնեգուրոչկա', 'Կախարդ', 'Հրշեջ', 'Ծրագրավորող', 'Բժիշկ', 'Ուսուցիչ', 'Խոհարար', 'Աստրոնավտ', 'Նկարիչ', 'Երաժիշտ', 'Ճարտարապետ', 'Օդաչու', 'Դետեկտիվ', 'Վետերինար'],
        emotions: ['Հրճվանք', 'Զարմանք', 'Անհամբերություն', 'Ուրախություն', 'Հուզմունք', 'Դժկամություն', 'Հպարտություն', 'Հետաքրքրասիրություն', 'Կարոտ', 'Ներշնչանք', 'Բավարարվածություն', 'Էնտուզիազմ', 'Թեթևություն', 'Հիացմունք', 'Քնքշություն'],
        actions: ['Ձյան մարդուկ շինել', 'Եղևնին զարդարել', 'Հրավառություն արձակել', 'Նվերներ տալ', 'Կարկանդակ թխել', 'Սահել չմուշկներով', 'Ձնագնդեր խաղալ', 'Լուսանկարել', 'Պարել', 'Կարաոկե երգել', 'Ընթրիք պատրաստել', 'Նվեր փաթեթավորել', 'Ցանկություն անել'],
        celebrities: ['Սանտա Կլաուս', 'Էլֆ', 'Ձյան թագուհի', 'Ընկույզով կռիվ', 'Օլաֆ', 'Գրինչ', 'Բուրատինո', 'Մոխրոտ', 'Շռեկ', 'Մարդ-սարդ', 'Բեթմեն', 'Պիկաչու', 'Միկի Մաուս', 'Էլզա', 'Չեբուրաշկա'],
        traditions: ['Կոչունակների զարկ', 'Ցանկություն անել', 'Եղևնու շուրջ պար', 'Մանդարիններ', 'Օլիվիե', 'Շամպայն', 'Ամանորյա բացիկ', 'Նվերներ եղևնու տակ', 'Հրավառություն', 'Երիզումներ', 'Կալյադկի', 'Ադվենտ օրացույց', 'Ձմեռային թխվածք'],
        animals: ['Սպիտակ արջ', 'Պինգվին', 'Հյուսիսային եղջերու', 'Նապաստակ', 'Աղվես', 'Գայլ', 'Բու', 'Դելֆին', 'Ընձուղտ', 'Փիղ', 'Կենգուրու', 'Պանդա', 'Կոալա', 'Առյուծ', 'Վագր'],
        food: ['Տորթ', 'Պաղպաղակ', 'Պիցցա', 'Սուշի', 'Բուրգեր', 'Պաստա', 'Սուրճ', 'Թեյ', 'Շոկոլադ', 'Կրուասան', 'Կրեպ', 'Վաֆլի', 'Պոնչիկ', 'Պոպկոռն', 'Լիմոնադ'],
        places: ['Կարմիր հրապարակ', 'Էյֆելյան աշտարակ', 'Բուրգեր', 'Կոլիզեում', 'Ազատության արձան', 'Բիգ Բեն', 'Տաջ Մահալ', 'Դիսնեյլենդ', 'Ակվապարկ', 'Թանգարան', 'Ծովափ', 'Լեռներ', 'Անտառ', 'Վայր', 'Տիեզերք'],
        objects: ['Խելացի հեռախոս', 'Եղևնու խաղալիք', 'Նվերի տուփ', 'Ձյունանուշ', 'Երիզում', 'Մոմ', 'Ֆոտոապարատ', 'Ժամացույց', 'Հովանոց', 'Աչոցներ', 'Համետ', 'Գիրք', 'Կիթառ', 'Շարֆ', 'Սահնակ']
    };

    const difficultySettings: Record<Difficulty, DifficultySetting> = {
        easy: {
            time: 90,
            points: 1,
            label: 'Հեշտ',
            color: 'from-green-400 to-emerald-500',
            icon: '😊',
            multiplier: 0.8,
            description: 'Իդեալական սկսնակների համար'
        },
        medium: {
            time: 60,
            points: 2,
            label: 'Միջին',
            color: 'from-yellow-400 to-orange-500',
            icon: '😎',
            multiplier: 1.0,
            description: 'Հավասարակշռված բարդություն'
        },
        hard: {
            time: 45,
            points: 3,
            label: 'Բարդ',
            color: 'from-orange-500 to-red-600',
            icon: '🔥',
            multiplier: 1.3,
            description: 'Փորձառու խաղացողների համար'
        },
        expert: {
            time: 30,
            points: 5,
            label: 'Փորձառու',
            color: 'from-red-600 to-purple-700',
            icon: '💀',
            multiplier: 1.7,
            description: 'Ճշգրիտ ռեակցիա և մտածողություն'
        },
        insane: {
            time: 15,
            points: 8,
            label: 'Խելագար',
            color: 'from-purple-700 to-pink-700',
            icon: '👿',
            multiplier: 2.2,
            description: 'Մաքսիմալ մարտահրավեր'
        }
    };

    const gameModes: Record<GameMode, GameModeInfo> = {
        classic: {
            name: 'Դասական',
            description: 'Ստանդարտ խաղ տուրերով',
            icon: <Play className="w-6 h-6" />,
            color: 'from-blue-500 to-cyan-500',
            features: ['5 տուր', 'Թիմային խաղ', 'Հավասար հնարավորություններ']
        },
        tournament: {
            name: 'Մրցաշար',
            description: 'Խաղ մինչև որոշակի միավորներ',
            icon: <Trophy className="w-6 h-6" />,
            color: 'from-yellow-500 to-orange-500',
            features: ['Մրցակցային', 'Միավորների նպատակ', 'Մրցանակային ֆոնդ']
        },
        survival: {
            name: 'Գոյատևում',
            description: 'Մեկ սխալ - դուրս ես մնում',
            icon: <Shield className="w-6 h-6" />,
            color: 'from-red-500 to-pink-500',
            features: ['3 կյանք', 'Լարվածություն', 'Սթրեսային իրավիճակներ']
        },
        blitz: {
            name: 'Բլից',
            description: 'Առավելագույն բառեր 3 րոպեում',
            icon: <Zap className="w-6 h-6" />,
            color: 'from-purple-500 to-violet-500',
            features: ['Ժամանակի սահմանափակում', 'Արագ մտածողություն', 'Համակենտրոնացում']
        },
        cooperation: {
            name: 'Խմբային',
            description: 'Բոլորը միասին դեմ ընդդեմ ժամանակի',
            icon: <Users className="w-6 h-6" />,
            color: 'from-green-500 to-emerald-500',
            features: ['Թիմային աշխատանք', 'Ընդհանուր նպատակ', 'Փոխգործակցություն']
        }
    };

    const specialCardTypes: SpecialCard[] = [
        {
            type: 'joker',
            name: 'Ջոքեր',
            emoji: '🃏',
            description: 'Մեկ հուշում',
            color: 'from-purple-500 to-pink-500',
            effect: 'Արտահայտություն մեկ բառով'
        },
        {
            type: 'freeze',
            name: 'Սառեցում',
            emoji: '❄️',
            description: '+15 վրկ',
            color: 'from-cyan-400 to-blue-500',
            effect: 'Ժամանակի ընդլայնում'
        },
        {
            type: 'double',
            name: 'Կրկնակի',
            emoji: '✨',
            description: 'Կրկնակի միավորներ',
            color: 'from-yellow-400 to-orange-500',
            effect: 'Միավորների բազմապատկում'
        },
        {
            type: 'swap',
            name: 'Փոխանակում',
            emoji: '🔄',
            description: 'Փոխել բառը',
            color: 'from-green-400 to-emerald-500',
            effect: 'Նոր բառ ստանալ'
        },
        {
            type: 'shield',
            name: 'Վահան',
            emoji: '🛡️',
            description: 'Պաշտպանություն տուգանքից',
            color: 'from-blue-500 to-indigo-600',
            effect: 'Տուգանքներից պաշտպանություն'
        },
        {
            type: 'bomb',
            name: 'Ռումբ',
            emoji: '💣',
            description: '-10 վրկ հակառակորդին',
            color: 'from-red-500 to-orange-600',
            effect: 'Հակառակորդի ժամանակի կրճատում'
        },
        {
            type: 'vision',
            name: 'Տեսլական',
            emoji: '👁️',
            description: 'Ցույց տալ կատեգորիան',
            color: 'from-indigo-500 to-purple-600',
            effect: 'Կատեգորիայի բացահայտում'
        },
        {
            type: 'bonus',
            name: 'Բոնուս',
            emoji: '💰',
            description: '+3 միավոր',
            color: 'from-amber-400 to-yellow-500',
            effect: 'Անմիջական միավորներ'
        }
    ];

    // Функции для управления игроками
    const addNewPlayer = () => {
        if (!newPlayerName.trim()) {
            alert('Խնդրում ենք մուտքագրել խաղացողի անունը');
            return;
        }

        const newPlayer: Player = {
            id: `player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: newPlayerName,
            avatar: playerAvatars[selectedPlayerAvatar],
            isActive: true,
            stats: {
                gamesPlayed: 0,
                gamesWon: 0,
                totalPoints: 0,
                accuracy: 0,
                favoriteCategory: 'traditions'
            }
        };

        setAvailablePlayers(prev => [...prev, newPlayer]);
        setNewPlayerName('');
        setSelectedPlayerAvatar(0);
        setShowAddPlayerForm(false);

        if (soundEnabled) playClick();
    };

    const removePlayer = (playerId: string) => {
        // Удаляем игрока из всех команд
        setTeams(prev => prev.map(team => ({
            ...team,
            players: team.players.filter(p => p.id !== playerId),
            captain: team.captain?.id === playerId ? (team.players.length > 1 ? team.players.find(p => p.id !== playerId) || null : null) : team.captain
        })));

        // Удаляем игрока из списка доступных
        setAvailablePlayers(prev => prev.filter(p => p.id !== playerId));

        if (soundEnabled) playClick();
    };

    // Функции для управления командами
    const createNewTeam = () => {
        if (!newTeamName.trim()) {
            alert('Խնդրում ենք մուտքագրել թիմի անունը');
            return;
        }

        const newTeam: Team = {
            id: `team-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: newTeamName,
            color: teamColors[selectedTeamColor].color,
            emoji: teamColors[selectedTeamColor].emoji,
            players: [],
            captain: null,
            score: 0,
            specialCards: {
                joker: 2,
                freeze: 2,
                double: 1,
                swap: 2,
                shield: 1,
                bomb: 1,
                vision: 1,
                bonus: 1,
                timeWarp: 0,
                mindReader: 0
            },
            correctGuesses: 0,
            skippedWords: 0,
            fastestTime: null,
            streak: 0,
            maxStreak: 0,
            lives: gameMode === 'survival' ? 3 : 0,
            efficiency: 0,
            lastAction: null
        };

        setTeams(prev => [...prev, newTeam]);
        setNewTeamName('');
        setSelectedTeamColor(0);

        if (soundEnabled) playSpecial();
    };

    const addPlayerToTeam = (teamId: string, playerId: string) => {
        const player = availablePlayers.find(p => p.id === playerId);
        if (!player) return;

        setTeams(prev => prev.map(team => {
            if (team.id === teamId && !team.players.some(p => p.id === playerId)) {
                const updatedPlayers = [...team.players, player];
                return {
                    ...team,
                    players: updatedPlayers,
                    captain: team.captain || player
                };
            }
            return team;
        }));

        if (soundEnabled) playClick();
    };

    const removePlayerFromTeam = (teamId: string, playerId: string) => {
        setTeams(prev => prev.map(team => {
            if (team.id === teamId) {
                const updatedPlayers = team.players.filter(p => p.id !== playerId);
                return {
                    ...team,
                    players: updatedPlayers,
                    captain: team.captain?.id === playerId ? (updatedPlayers.length > 0 ? updatedPlayers[0] : null) : team.captain
                };
            }
            return team;
        }));

        if (soundEnabled) playClick();
    };

    const setTeamCaptain = (teamId: string, playerId: string) => {
        setTeams(prev => prev.map(team => {
            if (team.id === teamId) {
                const captain = team.players.find(p => p.id === playerId);
                if (captain) {
                    return { ...team, captain };
                }
            }
            return team;
        }));

        if (soundEnabled) playClick();
    };

    const deleteTeam = (teamId: string) => {
        // Возвращаем игроков команды в список доступных
        const teamToDelete = teams.find(team => team.id === teamId);
        if (teamToDelete) {
            const playersToReturn = teamToDelete.players.filter(player =>
                !teams.some(t => t.id !== teamId && t.players.some(p => p.id === player.id))
            );
            setAvailablePlayers(prev => [...prev, ...playersToReturn]);
        }

        setTeams(prev => prev.filter(team => team.id !== teamId));
        if (soundEnabled) playClick();
    };

    const startGameWithTeams = () => {
        if (teams.length < 2) {
            alert('Անհրաժեշտ է առնվազն 2 թիմ խաղի համար');
            return;
        }

        if (teams.some(team => team.players.length === 0)) {
            alert('Բոլոր թիմերը պետք է ունենան առնվազն 1 խաղացող');
            return;
        }

        const totalPlayers = teams.reduce((sum, team) => sum + team.players.length, 0);
        if (totalPlayers < 4) {
            alert('Ընդհանուր առնվազն 4 խաղացող պետք է լինի բոլոր թիմերում');
            return;
        }

        setGameState('ready');
        if (soundEnabled) playSpecial();
    };

    // Фильтры для поиска
    const filteredAvailablePlayers = availablePlayers.filter(player =>
        player.name.toLowerCase().includes(playerSearchTerm.toLowerCase())
    );

    const filteredTeams = teams.filter(team =>
        team.name.toLowerCase().includes(teamSearchTerm.toLowerCase())
    );

    // Функции для игры
    const getAIHint = (word: string, category: string, difficultyLevel: string): string[] => {
        const hints = {
            easy: [
                `Բառը պատկանում է "${categories[category]?.name}" կատեգորիային`,
                `Բառը սկսվում է "${word[0]}" տառով`,
                `Բառը պարունակում է ${word.length} տառ`
            ],
            medium: [
                `Կատեգորիա՝ ${categories[category]?.name}`,
                `Առաջին տառ՝ "${word[0]}", վերջին տառ՝ "${word[word.length - 1]}"`,
                `Հոմանիշ՝ ${getSynonymHint(word)}`
            ],
            hard: [
                `Կատեգորիա՝ ${categories[category]?.name}`,
                `Բառի կառուցվածք՝ ${word.length} տառ`,
                `Ստեղծեք ասոցիացիաներ կատեգորիայի հետ`
            ]
        };

        return hints[difficultyLevel as keyof typeof hints] || hints.medium;
    };

    const getSynonymHint = (word: string): string => {
        const synonyms: Record<string, string> = {
            'Բախտի հեգնանք': 'նախատեսվածություն',
            'Մենակ տանը': 'մեկուսացում',
            'Հարի Փոթեր': 'կախարդ',
            'Դեդ Մորոզ': 'Նոր տարվա հերոս',
            'Սպիտակ արջ': 'արկտիկական կենդանի',
            'Տորթ': 'աղանդեր',
            'Կարմիր հրապարակ': 'պատմական վայր'
        };
        return synonyms[word] || 'փորձեք ասոցիացիաներ';
    };

    // Generate particles for effects
    const generateParticles = (type: string, count = 30) => {
        const newParticles: Particle[] = [];
        for (let i = 0; i < count; i++) {
            newParticles.push({
                id: i,
                type,
                x: Math.random() * 100,
                y: Math.random() * 100,
                size: Math.random() * 10 + 5,
                speed: Math.random() * 2 + 1,
                opacity: Math.random() * 0.5 + 0.5
            });
        }
        setParticles(newParticles);
        setTimeout(() => setParticles([]), 2000);
    };

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (gameState === 'playing' && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 10 && soundEnabled) {
                        playTimer();
                    }
                    return prev - 1;
                });
            }, 1000);
        } else if (timeLeft === 0 && gameState === 'playing') {
            handleSkip();
        }
        return () => clearInterval(interval);
    }, [gameState, timeLeft, soundEnabled]);

    const toggleCategory = (category: string) => {
        setSelectedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
        if (soundEnabled) playClick();
    };

    const selectAllCategories = () => {
        setSelectedCategories(Object.keys(categories));
        if (soundEnabled) playClick();
    };

    const startSetup = () => {
        if (selectedCategories.length === 0) {
            alert('Ընտրեք գոնե մեկ կատեգորիա!');
            return;
        }
        if (soundEnabled) playClick();
        setGameState('teamSetup');
    };

    const startGame = () => {
        drawCard();
        setGameState('playing');
        setStartTime(Date.now());
        setAnimateCard(true);
        setTimeout(() => setAnimateCard(false), 500);
        if (soundEnabled) {
            playCardFlip();
            playSpecial();
        }
        generateParticles('sparkle', 20);
    };

    const drawCard = () => {
        const availableCategories = selectedCategories.length > 0
            ? selectedCategories
            : Object.keys(categories);

        // AI-based card selection based on team performance
        let selectedCategory: string;
        if (aiAssistant && teams[currentTeam]) {
            const teamEfficiency = teams[currentTeam].correctGuesses / (teams[currentTeam].correctGuesses + teams[currentTeam].skippedWords) || 0.5;
            const appropriateCategories = availableCategories.filter(cat =>
                categories[cat].difficulty <= Math.ceil(teamEfficiency * 5)
            );
            selectedCategory = appropriateCategories.length > 0
                ? appropriateCategories[Math.floor(Math.random() * appropriateCategories.length)]
                : availableCategories[Math.floor(Math.random() * availableCategories.length)];
        } else {
            selectedCategory = availableCategories[Math.floor(Math.random() * availableCategories.length)];
        }

        const categoryWords = words[selectedCategory];
        const randomWord = categoryWords[Math.floor(Math.random() * categoryWords.length)];

        setCurrentCard({
            word: randomWord,
            category: selectedCategory,
            categoryInfo: categories[selectedCategory],
            difficulty: categories[selectedCategory].difficulty,
            aiHint: getAIHint(randomWord, selectedCategory, difficulty)
        });
        setTimeLeft(difficultySettings[difficulty].time);
        setStats(prev => ({ ...prev, totalWords: prev.totalWords + 1 }));

        if (soundEnabled) playCardFlip();
    };

    const handleCorrect = () => {
        if (!currentCard) return;

        const timeTaken = difficultySettings[difficulty].time - timeLeft;
        const basePoints = difficultySettings[difficulty].points;
        let multiplier = difficultySettings[difficulty].multiplier;

        if (specialCards.double) multiplier *= 2;
        if (streak >= 3) multiplier += 0.5;
        if (timeTaken < 10) multiplier += 0.5;
        if (combo > 0) multiplier += combo * 0.1;

        const points = Math.floor(basePoints * multiplier);

        setShowConfetti(true);
        setShowFireworks(true);
        generateParticles('confetti', 50);
        setTimeout(() => {
            setShowConfetti(false);
            setShowFireworks(false);
        }, 2000);

        setStreak(prev => prev + 1);
        setCombo(prev => prev + 1);
        setMood('happy');

        const newHistory: HistoryItem = {
            team: teams[currentTeam].name,
            word: currentCard.word,
            time: timeTaken,
            points: points,
            round: round,
            difficulty: currentCard.difficulty,
            multiplier: multiplier.toFixed(2)
        };

        const updatedTeams = teams.map((team, idx) => {
            if (idx === currentTeam) {
                const newCorrectGuesses = team.correctGuesses + 1;
                const newFastestTime = team.fastestTime ? Math.min(team.fastestTime, timeTaken) : timeTaken;
                const newStreak = team.streak + 1;
                const newMaxStreak = Math.max(team.maxStreak, newStreak);
                const totalActions = team.correctGuesses + team.skippedWords;
                const newEfficiency = totalActions > 0 ? (newCorrectGuesses / totalActions) * 100 : 100;

                return {
                    ...team,
                    score: team.score + points,
                    correctGuesses: newCorrectGuesses,
                    fastestTime: newFastestTime,
                    streak: newStreak,
                    maxStreak: newMaxStreak,
                    efficiency: newEfficiency,
                    lastAction: { type: 'correct', points, time: Date.now() }
                };
            }
            return team;
        });

        setTeams(updatedTeams);

        setStats(prev => {
            const totalTime = prev.history.reduce((sum, item) => sum + item.time, 0) + timeTaken;
            const avgTime = totalTime / (prev.history.length + 1);
            const newStats: Stats = {
                ...prev,
                history: [...prev.history, newHistory],
                avgTime: Math.round(avgTime * 100) / 100
            };

            if (!newStats.fastestGuess || timeTaken < newStats.fastestGuess.time) {
                newStats.fastestGuess = {
                    team: teams[currentTeam].name,
                    time: timeTaken,
                    word: currentCard.word,
                    points: points
                };
            }

            if (!newStats.slowestGuess || timeTaken > newStats.slowestGuess.time) {
                newStats.slowestGuess = {
                    team: teams[currentTeam].name,
                    time: timeTaken,
                    word: currentCard.word
                };
            }

            return newStats;
        });

        if (soundEnabled) {
            playCorrect();
            if (points > 10) playWin();
        }

        checkAchievements(timeTaken, points);
        nextTurn();
    };

    const handleSkip = () => {
        setStreak(0);
        setCombo(0);
        setMood('sad');

        if (soundEnabled) playIncorrect();

        const updatedTeams = teams.map((team, idx) => {
            if (idx === currentTeam) {
                return {
                    ...team,
                    skippedWords: team.skippedWords + 1,
                    streak: 0,
                    lastAction: { type: 'skip', time: Date.now() }
                };
            }
            return team;
        });

        setTeams(updatedTeams);
        setStats(prev => ({ ...prev, skippedWords: prev.skippedWords + 1 }));

        // AI suggests a hint if skipping too much
        if (aiAssistant && teams[currentTeam]?.skippedWords > 2) {
            setTimeout(() => {
                alert(`🤖 AI առաջարկ. Փորձեք օգտագործել հատուկ քարտեր կամ խնդրեք թիմից օգնություն։`);
            }, 500);
        }

        nextTurn();
    };

    const checkAchievements = (timeTaken: number, points: number) => {
        const newAchievements: Achievement[] = [];
        const team = teams[currentTeam];

        if (timeTaken < 3) {
            newAchievements.push({
                name: 'Մտքի կայծակ',
                emoji: '⚡',
                description: 'Գուշակվել է 3 վայրկյանում!',
                points: 50
            });
        }

        if (streak >= 10) {
            newAchievements.push({
                name: 'Անհաղթահարելի',
                emoji: '🏆',
                description: '10 ճիշտ պատասխան անընդմեջ!',
                points: 100
            });
        }

        if (team.score >= pointsToWin && gameMode === 'tournament') {
            newAchievements.push({
                name: 'Չեմպիոն',
                emoji: '👑',
                description: 'Հասել եք նպատակային միավորներին!',
                points: 200
            });
        }

        if (points > 15) {
            newAchievements.push({
                name: 'Մեծ միավոր',
                emoji: '💎',
                description: `Ստացել եք ${points} միավոր մեկ բառից!`,
                points: 30
            });
        }

        if (team.efficiency > 90) {
            newAchievements.push({
                name: 'Կատարելատիպ',
                emoji: '🎯',
                description: '90%+ արդյունավետություն',
                points: 75
            });
        }

        if (newAchievements.length > 0) {
            setAchievements(prev => [...prev, ...newAchievements]);
            if (soundEnabled) playAchievement();
            generateParticles('achievement', 20);
        }
    };

    const nextTurn = () => {
        setSpecialCards({});
        const nextTeam = (currentTeam + 1) % teams.length;

        if (nextTeam === 0) {
            setRound(prev => prev + 1);

            if (gameMode === 'classic' && round >= maxRounds) {
                endGame();
                return;
            }
        }

        if (gameMode === 'tournament') {
            const winner = teams.find(team => team.score >= pointsToWin);
            if (winner) {
                endGame();
                return;
            }
        }

        if (gameMode === 'survival') {
            const aliveTeams = teams.filter(team => team.lives > 0);
            if (aliveTeams.length === 1) {
                endGame();
                return;
            }
        }

        setCurrentTeam(nextTeam);
        setGameState('ready');
        setCurrentCard(null);
        setHintLevel(0);
    };

    const useSpecialCard = (type: SpecialCardType) => {
        if (!teams[currentTeam]?.specialCards[type] || teams[currentTeam].specialCards[type] <= 0) return;

        if (soundEnabled) playSpecial();
        generateParticles('special', 15);

        setTeams(prev => prev.map((team, idx) => {
            if (idx === currentTeam) {
                return {
                    ...team,
                    specialCards: {
                        ...team.specialCards,
                        [type]: team.specialCards[type] - 1
                    }
                };
            }
            return team;
        }));

        switch (type) {
            case 'freeze':
                setTimeLeft(prev => prev + 15);
                setLastAction('Սառեցման քարտ օգտագործված! +15 վայրկյան');
                break;
            case 'double':
                setSpecialCards(prev => ({ ...prev, double: true }));
                setLastAction('Կրկնակի միավորների քարտ ակտիվացված!');
                break;
            case 'joker':
                if (currentCard) {
                    const hint = currentCard.aiHint[Math.min(hintLevel, currentCard.aiHint.length - 1)];
                    alert(`🤖 AI հուշում: ${hint}`);
                }
                setHintLevel(prev => prev + 1);
                setLastAction('Ջոքեր քարտ օգտագործված! AI հուշում ստացված');
                break;
            case 'swap':
                drawCard();
                setLastAction('Փոխանակման քարտ օգտագործված! Նոր բառ ստացված');
                break;
            case 'bomb':
                const nextTeamIdx = (currentTeam + 1) % teams.length;
                setTeams(prev => prev.map((team, idx) =>
                    idx === nextTeamIdx ? { ...team, score: Math.max(0, team.score - 5) } : team
                ));
                alert(`💣 Ռումբ ուղարկվել է ${teams[nextTeamIdx].name} թիմին! -5 միավոր`);
                setLastAction('Ռումբ քարտ ուղարկված հակառակորդին');
                break;
            case 'vision':
                if (currentCard) {
                    alert(`👁️ Կատեգորիա: ${currentCard.categoryInfo.name}\n📚 Նկարագրություն: ${currentCard.categoryInfo.description}`);
                }
                setLastAction('Տեսլական քարտ օգտագործված! Կատեգորիան բացահայտված');
                break;
            case 'bonus':
                setTeams(prev => prev.map((team, idx) =>
                    idx === currentTeam ? { ...team, score: team.score + 3 } : team
                ));
                setLastAction('Բոնուս քարտ օգտագործված! +3 միավոր');
                break;
        }
    };

    const endGame = () => {
        const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
        const winner = sortedTeams[0];

        setStats(prev => ({
            ...prev,
            bestPlayer: sortedTeams.sort((a, b) => b.correctGuesses - a.correctGuesses)[0].name,
            totalTime: prev.history.reduce((sum, item) => sum + item.time, 0)
        }));

        setGameState('results');
        setShowFireworks(true);
        setShowSnow(true);

        if (soundEnabled) playWin();
        generateParticles('celebration', 100);

        setTimeout(() => {
            setShowFireworks(false);
            setShowSnow(false);
        }, 5000);
    };

    const resetGame = () => {
        setGameState('menu');
        setTeams([]);
        setRound(1);
        setStreak(0);
        setCombo(0);
        setStats({
            fastestGuess: null,
            bestPlayer: null,
            slowestGuess: null,
            totalWords: 0,
            skippedWords: 0,
            history: [],
            avgTime: 0
        });
        setAchievements([]);
        setCurrentTeam(0);
        setCurrentCard(null);
        setMood('neutral');
        if (soundEnabled) playClick();
    };

    const getThemeClasses = () => {
        switch (theme) {
            case 'night': return 'from-indigo-900 via-purple-900 to-pink-900';
            case 'aurora': return 'from-blue-900 via-teal-800 to-emerald-900';
            case 'fire': return 'from-red-900 via-orange-800 to-amber-900';
            case 'ocean': return 'from-blue-800 via-cyan-700 to-teal-800';
            default: return 'from-indigo-900 via-purple-900 to-pink-900';
        }
    };

    const ParticleEffect = ({ type }: { type: string }) => {
        if (!particles.length) return null;

        return (
            <div className="fixed inset-0 pointer-events-none z-40">
                {particles.map(particle => (
                    <div
                        key={particle.id}
                        className={`absolute ${type === 'confetti' ? 'text-2xl' : 'text-xl'}`}
                        style={{
                            left: `${particle.x}%`,
                            top: `${particle.y}%`,
                            opacity: particle.opacity,
                            transform: `scale(${particle.size / 10})`,
                            transition: 'all 0.5s ease-out'
                        }}
                    >
                        {type === 'confetti' ? '🎉' : type === 'sparkle' ? '✨' : '🌟'}
                    </div>
                ))}
            </div>
        );
    };

    const FireworksEffect = () => {
        if (!showFireworks) return null;

        return (
            <div className="fixed inset-0 pointer-events-none z-30">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-yellow-400 to-red-500 animate-ping"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${i * 0.1}s`,
                            animationDuration: '1s'
                        }}
                    />
                ))}
            </div>
        );
    };

    const SnowEffect = () => {
        if (!showSnow) return null;

        return (
            <div className="fixed inset-0 pointer-events-none z-20">
                {[...Array(50)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute text-white animate-fall"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * -20}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${Math.random() * 10 + 10}s`,
                            fontSize: `${Math.random() * 10 + 10}px`
                        }}
                    >
                        ❄️
                    </div>
                ))}
            </div>
        );
    };

    // MAIN MENU
    if (gameState === 'menu') {
        return (
            <>
                <div className={`min-h-screen bg-gradient-to-br ${getThemeClasses()} flex items-center justify-center p-4 transition-all duration-1000`}>
                    <FireworksEffect />
                    <SnowEffect />
                    <ParticleEffect type="sparkle" />

                    <div className="absolute top-4 right-4 flex gap-2 z-50">
                        <button
                            onClick={() => setSoundEnabled(!soundEnabled)}
                            className="p-3 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all"
                        >
                            {soundEnabled ? <Volume2 className="w-6 h-6 text-white" /> : <VolumeX className="w-6 h-6 text-white" />}
                        </button>
                        <button
                            onClick={() => setTheme(theme === 'night' ? 'aurora' : theme === 'aurora' ? 'fire' : 'night')}
                            className="p-3 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all"
                        >
                            {theme === 'night' ? <Moon className="w-6 h-6 text-white" /> :
                                theme === 'aurora' ? <CloudRain className="w-6 h-6 text-white" /> :
                                    <BrickWallFire className="w-6 h-6 text-white" />}
                        </button>
                        <button
                            onClick={() => setAiAssistant(!aiAssistant)}
                            className="p-3 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all"
                        >
                            <BrainCircuit className={`w-6 h-6 ${aiAssistant ? 'text-green-400' : 'text-gray-400'}`} />
                        </button>
                    </div>

                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-20 left-10 text-6xl animate-bounce">❄️</div>
                        <div className="absolute top-40 right-20 text-5xl animate-bounce delay-300">🎄</div>
                        <div className="absolute bottom-32 left-1/4 text-7xl animate-bounce delay-500">⭐</div>
                        <div className="absolute bottom-20 right-1/3 text-6xl animate-bounce delay-700">🎁</div>
                        <div className="absolute top-1/2 left-1/3 text-5xl animate-pulse delay-1000">✨</div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 max-w-6xl w-full border-2 border-white/20 shadow-2xl relative z-10">
                        <div className="text-center mb-8">
                            <div className="text-8xl mb-4 animate-pulse">🎭</div>
                            <h1 className="text-6xl font-black text-white mb-3 bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
                                Ամանորյա Կոկորդիլոս
                            </h1>
                            <p className="text-2xl text-blue-200">Ստեղծեք ձեր սեփական թիմերը և խաղացեք!</p>
                            <div className="flex items-center justify-center gap-2 mt-2">
                                <div className="flex items-center gap-1">
                                    <Users className="w-4 h-4 text-green-400" />
                                    <span className="text-sm text-green-300">Սեփական թիմեր</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <UserPlus className="w-4 h-4 text-yellow-400" />
                                    <span className="text-sm text-yellow-300">Ավելացրեք խաղացողներ</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Zap className="w-4 h-4 text-blue-400" />
                                    <span className="text-sm text-blue-300">Բաց թողեք կրեատիվությունը</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {Object.entries(gameModes).map(([key, mode]) => (
                                <button
                                    key={key}
                                    onClick={() => {
                                        setGameMode(key as GameMode);
                                        setGameState('setup');
                                        if (soundEnabled) playClick();
                                    }}
                                    className={`p-6 rounded-2xl transition-all transform hover:scale-105 border-2 hover:shadow-2xl ${gameMode === key
                                        ? 'border-white bg-gradient-to-r ' + mode.color + ' shadow-2xl'
                                        : 'border-white/20 bg-white/5 hover:bg-white/10'
                                        }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-xl bg-gradient-to-r ${mode.color}`}>
                                            {mode.icon}
                                        </div>
                                        <div className="text-left flex-1">
                                            <h3 className="text-2xl font-bold text-white mb-1">{mode.name}</h3>
                                            <p className="text-white/80 text-sm mb-2">{mode.description}</p>
                                            <ul className="text-xs text-white/60 space-y-1">
                                                {mode.features?.map((feature, idx) => (
                                                    <li key={idx} className="flex items-center gap-1">
                                                        <ChevronRight className="w-3 h-3" /> {feature}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all">
                                <div className="text-3xl mb-2">🎯</div>
                                <div className="text-white font-semibold">{Object.keys(categories).length} կատեգորիա</div>
                                <div className="text-white/60 text-sm">{Object.values(words).flat().length}+ բառ</div>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all">
                                <div className="text-3xl mb-2">👥</div>
                                <div className="text-white font-semibold">Անսահմանափակ խաղացողներ</div>
                                <div className="text-white/60 text-sm">Ավելացրեք ձեր ընկերներին</div>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all">
                                <div className="text-3xl mb-2">✨</div>
                                <div className="text-white font-semibold">{specialCardTypes.length} հատուկ քարտ</div>
                                <div className="text-white/60 text-sm">Եզակի ունակություններ</div>
                            </div>
                        </div>

                        {aiAssistant && (
                            <div className="mt-6 p-4 bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-xl border border-green-500/30">
                                <div className="flex items-center gap-3">
                                    <BrainCircuit className="w-6 h-6 text-green-400" />
                                    <div>
                                        <div className="text-green-300 font-semibold">AI օգնական ակտիվ է</div>
                                        <div className="text-green-400/80 text-sm">Պատրաստ է տրամադրել խելացի հուշումներ խաղի ընթացքում</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </>
        );
    }

    // SETUP SCREEN
    if (gameState === 'setup') {
        return (
            <div className={`min-h-screen bg-gradient-to-br ${getThemeClasses()} p-4 overflow-y-auto`}>
                <div className="max-w-6xl mx-auto py-8">
                    <button
                        onClick={() => {
                            setGameState('menu');
                            if (soundEnabled) playClick();
                        }}
                        className="mb-6 text-white/80 hover:text-white flex items-center gap-2 transition-colors hover:scale-105"
                    >
                        ← Ետ մենյու
                    </button>

                    <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border-2 border-white/20 shadow-2xl">
                        <h2 className="text-4xl font-bold text-white mb-8 text-center">
                            ⚙️ Խաղի կարգավորում
                        </h2>

                        {/* Difficulty Selection */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                                    <Flame className="text-orange-400" />
                                    Ընտրեք բարդությունը
                                </h3>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                {Object.entries(difficultySettings).map(([key, value]) => (
                                    <button
                                        key={key}
                                        onClick={() => {
                                            setDifficulty(key as Difficulty);
                                            if (soundEnabled) playClick();
                                        }}
                                        className={`p-4 rounded-xl transition-all transform hover:scale-105 ${difficulty === key
                                            ? `bg-gradient-to-r ${value.color} text-white shadow-xl scale-105`
                                            : 'bg-white/10 text-white hover:bg-white/20'
                                            }`}
                                    >
                                        <div className="text-3xl mb-1">{value.icon}</div>
                                        <div className="font-bold">{value.label}</div>
                                        <div className="text-sm opacity-90">{value.time}վ</div>
                                        <div className="text-xs opacity-75">{value.points} միավոր</div>
                                        <div className="text-xs opacity-60 mt-1">{value.description}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Category Selection */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                                    <Target className="text-blue-400" />
                                    Ընտրեք կատեգորիաները ({selectedCategories.length}/{Object.keys(categories).length})
                                </h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            selectAllCategories();
                                            if (soundEnabled) playClick();
                                        }}
                                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                                    >
                                        Ընտրել բոլորը
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedCategories([]);
                                            if (soundEnabled) playClick();
                                        }}
                                        className="bg-red-500/20 hover:bg-red-500/30 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                                    >
                                        Մաքրել
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                {Object.entries(categories).map(([key, cat]) => (
                                    <button
                                        key={key}
                                        onClick={() => toggleCategory(key)}
                                        className={`p-4 rounded-xl transition-all transform hover:scale-105 relative ${selectedCategories.includes(key)
                                            ? `bg-gradient-to-r ${cat.color} text-white shadow-xl`
                                            : 'bg-white/10 text-white hover:bg-white/20'
                                            }`}
                                    >
                                        {selectedCategories.includes(key) && (
                                            <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                                                ✓
                                            </div>
                                        )}
                                        <div className="text-3xl mb-1">{cat.emoji}</div>
                                        <div className="font-semibold text-sm mb-1">{cat.name}</div>
                                        <div className="text-xs opacity-75">Բարդություն {cat.difficulty}/5</div>
                                        <div className="text-xs opacity-60 truncate" title={cat.description}>
                                            {cat.description}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Game Mode Settings */}
                        {gameMode === 'tournament' && (
                            <div className="mb-8">
                                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                                    <Trophy className="text-yellow-400" />
                                    Հաղթելու համար անհրաժեշտ միավորներ
                                </h3>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => {
                                            setPointsToWin(Math.max(10, pointsToWin - 5));
                                            if (soundEnabled) playClick();
                                        }}
                                        className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-lg transition-colors hover:scale-110"
                                    >
                                        <Minus className="w-5 h-5" />
                                    </button>
                                    <div className="flex-1 bg-white/10 rounded-lg p-6 text-center">
                                        <div className="text-5xl font-bold text-white mb-2">{pointsToWin}</div>
                                        <div className="text-white/60">միավոր</div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setPointsToWin(pointsToWin + 5);
                                            if (soundEnabled) playClick();
                                        }}
                                        className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-lg transition-colors hover:scale-110"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {gameMode === 'classic' && (
                            <div className="mb-8">
                                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                                    <Clock className="text-cyan-400" />
                                    Տուրերի քանակ
                                </h3>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => {
                                            setMaxRounds(Math.max(1, maxRounds - 1));
                                            if (soundEnabled) playClick();
                                        }}
                                        className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-lg transition-colors hover:scale-110"
                                    >
                                        <Minus className="w-5 h-5" />
                                    </button>
                                    <div className="flex-1 bg-white/10 rounded-lg p-6 text-center">
                                        <div className="text-5xl font-bold text-white mb-2">{maxRounds}</div>
                                        <div className="text-white/60">տուր</div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setMaxRounds(maxRounds + 1);
                                            if (soundEnabled) playClick();
                                        }}
                                        className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-lg transition-colors hover:scale-110"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => {
                                startSetup();
                                if (soundEnabled) playSpecial();
                            }}
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-2xl font-bold py-6 rounded-2xl shadow-xl transition-all transform hover:scale-105 hover:shadow-2xl"
                        >
                            Ստեղծել Թիմերը →
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // TEAM SETUP SCREEN
if (gameState === 'teamSetup') {
    return (
        <div className={`min-h-screen bg-gradient-to-br ${getThemeClasses()} p-4 overflow-y-auto`}>
            <div className="max-w-6xl mx-auto py-8">
                <button
                    onClick={() => {
                        setGameState('setup');
                        if (soundEnabled) playClick();
                    }}
                    className="mb-6 text-white/80 hover:text-white flex items-center gap-2 transition-colors hover:scale-105"
                >
                    ← Ետ
                </button>

                <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border-2 border-white/20 shadow-2xl">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-4xl font-bold text-white flex items-center gap-3">
                            <Users className="text-blue-400" />
                            Թիմերի Ստեղծում
                        </h2>
                        <div className="text-white/60 text-sm">
                            {teams.reduce((total, team) => total + team.players.length, 0)} խաղացող, {teams.length} թիմ
                        </div>
                    </div>

                    {/* Создание новой команды */}
                    <div className="mb-8 p-6 bg-gradient-to-r from-blue-900/20 to-cyan-900/20 rounded-2xl border border-blue-500/30">
                        <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                            <Plus className="text-green-400" />
                            Ստեղծել Նոր Թիմ
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-white/80 text-sm mb-2">Թիմի Անուն *</label>
                                <input
                                    type="text"
                                    value={newTeamName}
                                    onChange={(e) => setNewTeamName(e.target.value)}
                                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Օրինակ՝ Ծրագրավորողներ"
                                    maxLength={30}
                                />
                                <div className="text-white/40 text-xs mt-1 text-right">{newTeamName.length}/30</div>
                            </div>
                            <div>
                                <label className="block text-white/80 text-sm mb-2">Գույն և Սիմվոլ</label>
                                <div className="flex gap-2 flex-wrap">
                                    {teamColors.map((color, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedTeamColor(idx)}
                                            className={`p-3 rounded-lg transition-all transform ${selectedTeamColor === idx ? 'ring-2 ring-white scale-110' : 'hover:scale-105'}`}
                                            style={{ background: color.bg }}
                                            title={`${color.emoji} թիմ`}
                                        >
                                            <span className="text-2xl">{color.emoji}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-end">
                                <button
                                    onClick={createNewTeam}
                                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-105"
                                >
                                    Ստեղծել Թիմ
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Команды и управление игроками */}
                    <div className="mb-8">
                        <div className="mb-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={teamSearchTerm}
                                    onChange={(e) => setTeamSearchTerm(e.target.value)}
                                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 pl-12"
                                    placeholder="Որոնել թիմեր..."
                                />
                                <Hash className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                            </div>
                        </div>

                        <div className="bg-white/5 rounded-2xl p-4 border border-white/20">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Trophy className="text-yellow-400" />
                                Ընթացիկ Թիմեր ({filteredTeams.length})
                            </h3>

                            {filteredTeams.length === 0 ? (
                                <div className="text-center py-12 bg-white/5 rounded-xl">
                                    <div className="text-6xl mb-4">👥</div>
                                    <h4 className="text-xl font-bold text-white mb-2">Թիմեր դեռ չկան</h4>
                                    <p className="text-white/60">Ստեղծեք առաջին թիմը վերևի ձևի միջոցով</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {filteredTeams.map((team) => (
                                        <div
                                            key={team.id}
                                            className="bg-white/5 rounded-xl p-4 border border-white/20 hover:border-white/40 transition-all"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${team.color}`}>
                                                        {team.emoji}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-bold text-white">{team.name}</h4>
                                                        <p className="text-white/60 text-xs">
                                                            {team.players.length} խաղացող
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => deleteTeam(team.id)}
                                                    className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
                                                    title="Ջնջել թիմը"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>

                                            {/* Список игроков в команде */}
                                            <div className="mb-3">
                                                <div className="text-white/80 text-sm mb-2">Խաղացողներ</div>
                                                {team.players.length === 0 ? (
                                                    <div className="text-center py-2 bg-white/5 rounded-lg">
                                                        <p className="text-white/50 text-sm">Ոչ մի խաղացող</p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-1">
                                                        {team.players.map((player, playerIndex) => (
                                                            <div
                                                                key={`${team.id}-${player.id}-${playerIndex}`}
                                                                className="flex items-center justify-between bg-white/5 p-2 rounded"
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <div className="text-lg">{player.avatar}</div>
                                                                    <div>
                                                                        <div className="text-white text-sm">{player.name}</div>
                                                                        {team.captain?.id === player.id && (
                                                                            <div className="text-yellow-400 text-xs flex items-center gap-1">
                                                                                <Crown className="w-2 h-2" /> Կապիտան
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="flex gap-1">
                                                                    {/* Кнопка перемещения в другие команды */}
                                                                    {teams
                                                                        .filter(t => t.id !== team.id)
                                                                        .map(otherTeam => (
                                                                            <button
                                                                                key={otherTeam.id}
                                                                                onClick={() => {
                                                                                    // Создаем глубокую копию игрока
                                                                                    const playerToMove = {
                                                                                        ...player,
                                                                                        id: `player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
                                                                                    };
                                                                                    
                                                                                    setTeams(prev => prev.map(t => {
                                                                                        if (t.id === team.id) {
                                                                                            return {
                                                                                                ...t,
                                                                                                players: t.players.filter(p => p.id !== player.id),
                                                                                                captain: t.captain?.id === player.id ? 
                                                                                                    (t.players.length > 1 ? t.players.find(p => p.id !== player.id) || null : null) 
                                                                                                    : t.captain
                                                                                            };
                                                                                        }
                                                                                        if (t.id === otherTeam.id) {
                                                                                            return {
                                                                                                ...t,
                                                                                                players: [...t.players, playerToMove]
                                                                                            };
                                                                                        }
                                                                                        return t;
                                                                                    }));
                                                                                }}
                                                                                className="p-1 hover:bg-blue-500/20 rounded text-blue-300"
                                                                                title={`Տեղափոխել "${otherTeam.name}" թիմ`}
                                                                            >
                                                                                <span className="text-xs">→</span>
                                                                            </button>
                                                                        ))}
                                                                    <button
                                                                        onClick={() => {
                                                                            setTeams(prev => prev.map(t => {
                                                                                if (t.id === team.id) {
                                                                                    return {
                                                                                        ...t,
                                                                                        players: t.players.filter(p => p.id !== player.id),
                                                                                        captain: t.captain?.id === player.id ? 
                                                                                            (t.players.length > 1 ? t.players.find(p => p.id !== player.id) || null : null) 
                                                                                            : t.captain
                                                                                    };
                                                                                }
                                                                                return t;
                                                                            }));
                                                                        }}
                                                                        className="p-1 hover:bg-red-500/20 rounded text-red-300"
                                                                        title="Հեռացնել"
                                                                    >
                                                                        <Trash2 className="w-3 h-3" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Форма добавления нового игрока в команду */}
                                            <div className="space-y-2">
                                                <div className="text-white/80 text-sm">Ավելացնել նոր խաղացող</div>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Խաղացողի անուն"
                                                        className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                        id={`player-input-${team.id}`}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                const input = e.target as HTMLInputElement;
                                                                const playerName = input.value.trim();
                                                                if (playerName) {
                                                                    const newPlayer: Player = {
                                                                        id: `player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                                                                        name: playerName,
                                                                        avatar: playerAvatars[Math.floor(Math.random() * playerAvatars.length)],
                                                                        isActive: true,
                                                                        stats: {
                                                                            gamesPlayed: 0,
                                                                            gamesWon: 0,
                                                                            totalPoints: 0,
                                                                            accuracy: 0,
                                                                            favoriteCategory: 'traditions'
                                                                        }
                                                                    };
                                                                    
                                                                    setTeams(prev => prev.map(t => {
                                                                        if (t.id === team.id) {
                                                                            return {
                                                                                ...t,
                                                                                players: [...t.players, newPlayer],
                                                                                captain: t.captain || newPlayer
                                                                            };
                                                                        }
                                                                        return t;
                                                                    }));
                                                                    input.value = '';
                                                                }
                                                            }
                                                        }}
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            const input = document.getElementById(`player-input-${team.id}`) as HTMLInputElement;
                                                            const playerName = input?.value.trim();
                                                            if (playerName) {
                                                                const newPlayer: Player = {
                                                                    id: `player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                                                                    name: playerName,
                                                                    avatar: playerAvatars[Math.floor(Math.random() * playerAvatars.length)],
                                                                    isActive: true,
                                                                    stats: {
                                                                        gamesPlayed: 0,
                                                                        gamesWon: 0,
                                                                        totalPoints: 0,
                                                                        accuracy: 0,
                                                                        favoriteCategory: 'traditions'
                                                                    }
                                                                };
                                                                
                                                                setTeams(prev => prev.map(t => {
                                                                    if (t.id === team.id) {
                                                                        return {
                                                                            ...t,
                                                                            players: [...t.players, newPlayer],
                                                                            captain: t.captain || newPlayer
                                                                        };
                                                                    }
                                                                    return t;
                                                                }));
                                                                input.value = '';
                                                            }
                                                        }}
                                                        className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white px-3 py-2 rounded-lg text-sm transition-all"
                                                    >
                                                        <UserPlus className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Кнопка для смены капитана */}
                                            {team.players.length > 0 && (
                                                <button
                                                    onClick={() => {
                                                        if (team.players.length > 1) {
                                                            const currentCaptainIndex = team.players.findIndex(p => p.id === team.captain?.id);
                                                            const nextCaptainIndex = (currentCaptainIndex + 1) % team.players.length;
                                                            setTeams(prev => prev.map(t => {
                                                                if (t.id === team.id) {
                                                                    return {
                                                                        ...t,
                                                                        captain: team.players[nextCaptainIndex]
                                                                    };
                                                                }
                                                                return t;
                                                            }));
                                                        }
                                                    }}
                                                    className="w-full mt-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 text-yellow-300 py-2 rounded text-sm transition-all flex items-center justify-center gap-2"
                                                >
                                                    <Crown className="w-3 h-3" />
                                                    Փոխել Կապիտանին
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Кнопка начала игры */}
                    <div className="mt-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 rounded-xl p-4 border border-blue-500/30">
                                <div className="flex items-center gap-3">
                                    <Bell className="w-5 h-5 text-blue-400" />
                                    <div>
                                        <div className="text-blue-300 font-semibold">Պայմաններ խաղը սկսելու համար</div>
                                        <div className="text-blue-400/80 text-sm">
                                            • Առնվազն 2 թիմ <br />
                                            • Ամեն թիմում առնվազն 1 խաղացող <br />
                                            • Ընդհանուր առնվազն 4 խաղացող
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    if (teams.length < 2) {
                                        alert('Անհրաժեշտ է առնվազն 2 թիմ խաղի համար');
                                        return;
                                    }

                                    if (teams.some(team => team.players.length === 0)) {
                                        alert('Բոլոր թիմերը պետք է ունենան առնվազն 1 խաղացող');
                                        return;
                                    }

                                    const totalPlayers = teams.reduce((sum, team) => sum + team.players.length, 0);
                                    if (totalPlayers < 4) {
                                        alert('Ընդհանուր առնվազն 4 խաղացող պետք է լինի բոլոր թիմերում');
                                        return;
                                    }

                                    setGameState('ready');
                                    if (soundEnabled) playSpecial();
                                }}
                                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xl font-bold py-4 rounded-2xl transition-all transform hover:scale-105 hover:shadow-2xl flex items-center justify-center gap-3"
                            >
                                <Play className="w-6 h-6" />
                                Սկսել Խաղը
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

    // READY SCREEN
    if (gameState === 'ready') {
        const team = teams[currentTeam];

        return (
            <div className={`min-h-screen bg-gradient-to-br ${getThemeClasses()} p-4 flex items-center justify-center`}>
                <FireworksEffect />
                <ParticleEffect type="sparkle" />

                <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 max-w-2xl w-full border-2 border-white/20 shadow-2xl text-center">
                    <div className="text-7xl mb-6 animate-bounce">
                        {team?.emoji || '🎭'}
                    </div>

                    <h2 className="text-5xl font-black text-white mb-4">
                        Թիմի Հերթը
                    </h2>
                    <div className="text-6xl font-black text-transparent bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text mb-8">
                        {team?.name || 'Թիմ'}
                    </div>

                    {/* Информация о команде */}
                    <div className="mb-6 bg-white/5 rounded-xl p-4 border border-white/20">
                        <div className="flex items-center justify-center gap-4 mb-3">
                            <div className="text-2xl">👥</div>
                            <div>
                                <div className="text-white font-bold text-xl">{team?.players.length || 0} խաղացող</div>
                                {team?.captain && (
                                    <div className="text-white/80 text-sm flex items-center justify-center gap-1">
                                        <Crown className="w-3 h-3 text-yellow-400" />
                                        Կապիտան՝ {team.captain.name}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {team?.players.map(player => (
                                <div key={player.id} className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full">
                                    <span>{player.avatar}</span>
                                    <span className="text-white text-sm">{player.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="bg-white/10 rounded-xl p-4 border border-white/20 hover:scale-105 transition-all">
                            <div className="text-yellow-400 text-3xl mb-1">🏆</div>
                            <div className="text-white/60 text-sm">Միավոր</div>
                            <div className="text-white text-3xl font-bold">{team?.score || 0}</div>
                        </div>
                        <div className="bg-white/10 rounded-xl p-4 border border-white/20 hover:scale-105 transition-all">
                            <div className="text-blue-400 text-3xl mb-1">⚡</div>
                            <div className="text-white/60 text-sm">Տուր</div>
                            <div className="text-white text-3xl font-bold">{round}{gameMode === 'classic' ? `/${maxRounds}` : ''}</div>
                        </div>
                        <div className="bg-white/10 rounded-xl p-4 border border-white/20 hover:scale-105 transition-all">
                            <div className="text-green-400 text-3xl mb-1">🔥</div>
                            <div className="text-white/60 text-sm">Հաջողություն</div>
                            <div className="text-white text-3xl font-bold">{streak}</div>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            startGame();
                            if (soundEnabled) playSpecial();
                        }}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-3xl font-bold py-8 rounded-2xl shadow-xl transition-all transform hover:scale-105 hover:shadow-2xl flex items-center justify-center gap-3"
                    >
                        <Play className="w-10 h-10" />
                        Սկսել Ցուցադրումը
                    </button>
                </div>
            </div>
        );
    }

    // PLAYING SCREEN
    if (gameState === 'playing' && currentCard) {
        return (
            <div className={`min-h-screen bg-gradient-to-br ${getThemeClasses()} p-4`}>
                {showConfetti && <ParticleEffect type="confetti" />}
                <FireworksEffect />

                <div className="max-w-6xl mx-auto py-8">
                    {/* Header with Team Info and AI Assistant */}
                    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 mb-6 border border-white/20">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-white/5 rounded-lg">
                                <div className="text-white/60 text-sm mb-1">Թիմ</div>
                                <div className="text-white font-bold text-xl">{teams[currentTeam]?.name}</div>
                                <div className="text-white/40 text-xs mt-1">Արդյունավետություն {teams[currentTeam]?.efficiency.toFixed(0)}%</div>
                            </div>
                            <div className="text-center p-4 bg-white/5 rounded-lg">
                                <div className="text-white/60 text-sm mb-1">Ժամանակ</div>
                                <div className={`text-4xl font-black ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                                    {timeLeft}
                                </div>
                            </div>
                            <div className="text-center p-4 bg-white/5 rounded-lg">
                                <div className="text-white/60 text-sm mb-1">Միավոր</div>
                                <div className="text-white font-bold text-3xl">{teams[currentTeam]?.score}</div>
                            </div>
                            <div className="text-center p-4 bg-white/5 rounded-lg">
                                <div className="text-white/60 text-sm mb-1">Ռեկորդ</div>
                                <div className="text-white font-bold text-xl">
                                    {streak > 0 ? `🔥 ${streak}` : '—'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* AI Assistant Panel */}
                    {aiAssistant && (
                        <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 backdrop-blur-xl rounded-2xl p-4 mb-6 border border-purple-500/30">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <BrainCircuit className="w-6 h-6 text-purple-400" />
                                    <div>
                                        <div className="text-purple-300 font-semibold">AI Օգնական</div>
                                        <div className="text-purple-400/80 text-sm">
                                            {currentCard?.difficulty > 4 ? 'Բարդ բառ' :
                                                currentCard?.difficulty > 3 ? 'Միջին բարդություն' :
                                                    'Հեշտ բառ'}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => useSpecialCard('joker')}
                                    disabled={!teams[currentTeam]?.specialCards.joker || teams[currentTeam].specialCards.joker <= 0}
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm transition-all hover:scale-105"
                                >
                                    Հուշում ստանալ
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Main Card with Visual Effects */}
                    <div className={`relative bg-white/10 backdrop-blur-xl rounded-3xl p-12 mb-6 border-2 border-white/20 text-center transition-all duration-500 ${animateCard ? 'scale-110 ring-4 ring-yellow-400/50' : 'scale-100'}`}>
                        {/* Glow Effect */}
                        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-xl -z-10"></div>

                        <div className={`inline-block px-6 py-3 rounded-full bg-gradient-to-r ${currentCard?.categoryInfo?.color || 'from-gray-500 to-gray-700'} mb-6 shadow-lg`}>
                            <div className="flex items-center gap-2 text-white font-semibold">
                                {currentCard?.categoryInfo?.icon || '🎯'}
                                <span>{currentCard?.categoryInfo?.name || 'Կատեգորիա'}</span>
                            </div>
                        </div>

                        {showWord ? (
                            <div className="animate-fadeIn">
                                <div className="text-7xl font-black text-white mb-4 animate-pulse-slow">
                                    {currentCard?.word || 'Բառ'}
                                </div>
                                <div className="text-2xl text-white/60">
                                    Ցույց տուր այս բառը!
                                </div>
                                {currentCard?.difficulty && (
                                    <div className="mt-4 text-sm text-white/40">
                                        Բարդություն {currentCard.difficulty}/5
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-7xl font-black text-white/20 animate-pulse">
                                • • • • •
                            </div>
                        )}

                        {/* Mood Indicator */}
                        {mood !== 'neutral' && (
                            <div className="absolute top-4 right-4">
                                <div className={`p-2 rounded-full ${mood === 'happy' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                                    {mood === 'happy' ? '😊' : '😔'}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Special Cards with AI Suggestions */}
                    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 mb-6 border border-white/20">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-white font-bold flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-yellow-400" />
                                Հատուկ Քարտեր
                            </h3>
                            {aiAssistant && (
                                <div className="text-sm text-blue-300">
                                    {specialCardTypes.filter(card => teams[currentTeam]?.specialCards[card.type] > 0).length} մատչելի
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-8 gap-2">
                            {specialCardTypes.map(card => {
                                const count = teams[currentTeam]?.specialCards[card.type] || 0;
                                const canUse = count > 0;
                                return (
                                    <button
                                        key={card.type}
                                        onClick={() => canUse && useSpecialCard(card.type)}
                                        disabled={!canUse}
                                        className={`p-3 rounded-xl transition-all relative group ${canUse
                                            ? `bg-gradient-to-r ${card.color} hover:scale-110 cursor-pointer active:scale-95`
                                            : 'bg-white/5 opacity-30 cursor-not-allowed'
                                            }`}
                                        title={`${card.name}: ${card.description}`}
                                    >
                                        <div className="text-2xl mb-1">{card.emoji}</div>
                                        <div className="text-white text-xs font-bold">
                                            {count}
                                        </div>
                                        {canUse && (
                                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-50">
                                                {card.effect}
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Action Buttons with Visual Feedback */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <button
                            onClick={() => {
                                handleCorrect();
                            }}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-2xl font-bold py-8 rounded-2xl shadow-xl transition-all transform hover:scale-105 active:scale-95 hover:shadow-2xl flex items-center justify-center gap-3 group"
                        >
                            <div className="relative">
                                <Check className="w-8 h-8" />
                                <div className="absolute inset-0 animate-ping opacity-20">✓</div>
                            </div>
                            Ճիշտ է!
                        </button>
                        <button
                            onClick={() => {
                                handleSkip();
                            }}
                            className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white text-2xl font-bold py-8 rounded-2xl shadow-xl transition-all transform hover:scale-105 active:scale-95 hover:shadow-2xl flex items-center justify-center gap-3"
                        >
                            <X className="w-8 h-8" />
                            Բաց Թողնել
                        </button>
                    </div>

                    {/* Last Action Feedback */}
                    {lastAction && (
                        <div className="text-center animate-fadeIn">
                            <div className="inline-block bg-gradient-to-r from-blue-500/20 to-purple-500/20 px-6 py-3 rounded-full border border-blue-500/30">
                                <span className="text-white/80 text-sm">
                                    {lastAction}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Combo and Streak Indicators */}
                    {(streak > 0 || combo > 0) && (
                        <div className="mt-6 text-center space-y-2">
                            {streak > 0 && (
                                <div className="inline-block bg-gradient-to-r from-orange-500 to-red-600 px-6 py-3 rounded-full animate-pulse">
                                    <span className="text-white font-bold text-xl">
                                        🔥 {streak} անընդմեջ ճիշտ
                                    </span>
                                </div>
                            )}
                            {combo > 0 && (
                                <div className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 rounded-full ml-2">
                                    <span className="text-white font-bold text-lg">
                                        ⚡ Combo x{combo}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // RESULTS SCREEN
    if (gameState === 'results') {
        const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
        const winner = sortedTeams[0];

        useEffect(() => {
            if (soundEnabled) {
                playWin();
            }
        }, []);

        return (
            <div className={`min-h-screen bg-gradient-to-br ${getThemeClasses()} p-4 overflow-y-auto`}>
                <FireworksEffect />
                <SnowEffect />
                <ParticleEffect type="celebration" />

                <div className="max-w-6xl mx-auto py-8">
                    <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border-2 border-white/20 shadow-2xl">
                        <div className="text-center mb-8">
                            <div className="text-8xl mb-4 animate-bounce">🏆</div>
                            <h2 className="text-6xl font-black text-white mb-2">
                                Խաղն Ավարտվեց!
                            </h2>
                            <p className="text-2xl text-blue-200">Շնորհավորում ենք բոլոր մասնակիցներին!</p>
                        </div>

                        {/* Winner Announcement */}
                        <div className="mb-8 p-8 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-3xl border-2 border-yellow-400/50">
                            <div className="flex flex-col items-center">
                                <div className="text-5xl mb-4">👑</div>
                                <h3 className="text-3xl font-bold text-white mb-2">Հաղթող</h3>
                                <div className="text-4xl font-black text-yellow-300 mb-4">{winner?.name}</div>
                                <div className="text-6xl font-black text-white">{winner?.score} միավոր</div>
                            </div>
                        </div>

                        {/* Podium */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            {sortedTeams.slice(0, 3).map((team, idx) => (
                                <div
                                    key={team.id}
                                    className={`p-8 rounded-2xl border-2 transform transition-all hover:scale-105 ${idx === 0
                                        ? 'bg-gradient-to-r from-yellow-500/30 to-orange-500/30 border-yellow-400 scale-105'
                                        : idx === 1
                                            ? 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-300'
                                            : 'bg-gradient-to-r from-amber-700/30 to-amber-800/30 border-amber-600'
                                        }`}
                                >
                                    <div className="text-center">
                                        <div className="text-6xl mb-4">
                                            {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                                        </div>
                                        <div className="text-2xl font-bold text-white mb-3">{team.name}</div>
                                        <div className="text-5xl font-black text-white mb-4">{team.score}</div>
                                        <div className="space-y-2 text-sm text-white/80">
                                            <div className="flex justify-between">
                                                <span>Ճիշտ պատասխաններ</span>
                                                <span className="font-bold">✅ {team.correctGuesses}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Բաց թողնված</span>
                                                <span className="font-bold">⏭️ {team.skippedWords}</span>
                                            </div>
                                            {team.fastestTime && (
                                                <div className="flex justify-between">
                                                    <span>Լավագույն ժամանակ</span>
                                                    <span className="font-bold">⚡ {team.fastestTime}վ</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between">
                                                <span>Արդյունավետություն</span>
                                                <span className="font-bold">🎯 {team.efficiency.toFixed(0)}%</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Մաքսիմալ շարք</span>
                                                <span className="font-bold">🔥 {team.maxStreak}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Statistics */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
                                <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
                                    <TrendingUp className="text-green-400" />
                                    Խաղի Վիճակագրություն
                                </h3>
                                <div className="space-y-3 text-white">
                                    <div className="flex justify-between items-center py-2 border-b border-white/10">
                                        <span className="text-white/60">Ընդհանուր բառեր</span>
                                        <span className="font-bold text-xl">{stats.totalWords}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-white/10">
                                        <span className="text-white/60">Ճիշտ գուշակված</span>
                                        <span className="font-bold text-xl text-green-400">{stats.totalWords - stats.skippedWords}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-white/10">
                                        <span className="text-white/60">Բաց թողնված</span>
                                        <span className="font-bold text-xl text-red-400">{stats.skippedWords}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-white/10">
                                        <span className="text-white/60">Արդյունավետություն</span>
                                        <span className="font-bold text-xl">
                                            {stats.totalWords > 0 ? Math.round((stats.totalWords - stats.skippedWords) / stats.totalWords * 100) : 0}%
                                        </span>
                                    </div>
                                    {stats.fastestGuess && (
                                        <div className="flex justify-between items-center py-2 border-b border-white/10">
                                            <span className="text-white/60">Ամենաարագ պատասխան</span>
                                            <span className="font-bold text-xl">⚡ {stats.fastestGuess.time}վ</span>
                                        </div>
                                    )}
                                    {stats.avgTime > 0 && (
                                        <div className="flex justify-between items-center py-2">
                                            <span className="text-white/60">Միջին ժամանակ</span>
                                            <span className="font-bold text-xl">⏱️ {stats.avgTime}վ</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Achievements */}
                            <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
                                <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
                                    <Award className="text-yellow-400" />
                                    Ձեռքբերումներ
                                </h3>
                                {achievements.length > 0 ? (
                                    <div className="space-y-3 max-h-64 overflow-y-auto">
                                        {achievements.map((ach, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center gap-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-4 rounded-xl border border-purple-500/30 hover:scale-105 transition-all"
                                            >
                                                <div className="text-3xl">{ach.emoji}</div>
                                                <div className="flex-1">
                                                    <div className="text-white font-bold">{ach.name}</div>
                                                    <div className="text-white/60 text-sm">{ach.description}</div>
                                                </div>
                                                <div className="text-yellow-400 font-bold">+{ach.points}</div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-white/60">
                                        Դեռ չկան ձեռքբերումներ
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* All Teams Leaderboard */}
                        {sortedTeams.length > 3 && (
                            <div className="bg-white/10 rounded-2xl p-6 border border-white/20 mb-8">
                                <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
                                    <Trophy className="text-yellow-400" />
                                    Բոլոր Թիմերի Վարկանիշ
                                </h3>
                                <div className="space-y-2">
                                    {sortedTeams.slice(3).map((team, idx) => (
                                        <div
                                            key={team.id}
                                            className="flex items-center justify-between bg-white/5 p-4 rounded-xl hover:bg-white/10 transition-all"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="text-2xl font-bold text-white/60">#{idx + 4}</div>
                                                <div>
                                                    <div className="text-white font-bold">{team.name}</div>
                                                    <div className="text-white/60 text-xs">
                                                        ✅ {team.correctGuesses} • ⏭️ {team.skippedWords} • 🎯 {team.efficiency.toFixed(0)}%
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-2xl font-black text-white">{team.score}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                onClick={() => {
                                    resetGame();
                                    if (soundEnabled) playClick();
                                }}
                                className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white text-xl font-bold py-6 rounded-2xl shadow-xl transition-all transform hover:scale-105 hover:shadow-2xl flex items-center justify-center gap-3"
                            >
                                <RotateCcw className="w-6 h-6" />
                                Նոր Խաղ
                            </button>
                            <button
                                onClick={() => {
                                    setGameState('teamSetup');
                                    if (soundEnabled) playClick();
                                }}
                                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-xl font-bold py-6 rounded-2xl shadow-xl transition-all transform hover:scale-105 hover:shadow-2xl flex items-center justify-center gap-3"
                            >
                                <Play className="w-6 h-6" />
                                Վերախաղարկում
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default NewYearCharades;