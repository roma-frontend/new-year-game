"use client"

import React, { useState, useEffect, useRef } from 'react';
import { Timer, Users, Trophy, Sparkles, Zap, Clock, Star, Play, Pause, RotateCcw, Settings, TrendingUp, Award, Target, Flame, Shield, Gift, Music, Mic, Volume2, VolumeX, Eye, EyeOff, ChevronRight, Plus, Minus, Check, X, Crown, Rocket, Heart, Brain, Coffee, BookOpen, Lightbulb, Siren, PartyPopper, Snowflake, Volume, Bell, AlertCircle, BrainCircuit, LightbulbOff, Moon, Sun, CloudRain, Wind, BrickWallFire, User, UserPlus, UserMinus, Edit, Trash2, Save, Mail, Phone, Briefcase, MapPin, Calendar, Hash, Flag, Trees, Home } from 'lucide-react';
import useSound from 'use-sound';

import { useRouter } from "next/navigation"
import { Button } from '@/components/ui/button';

// Типы для игры
type GameState = 'menu' | 'setup' | 'playerSetup' | 'ready' | 'playing' | 'results';
type Difficulty = 'easy' | 'medium' | 'hard' | 'expert' | 'insane';
type Theme = 'night' | 'aurora' | 'fire' | 'ocean';
type Mood = 'neutral' | 'happy' | 'sad';
type SpecialCardType = 'hint' | 'extraTime' | 'doublePoints' | 'skipWord' | 'shield' | 'steal' | 'reveal' | 'bonus';

interface Player {
    id: string;
    name: string;
    avatar: string;
    isActive: boolean;
    score: number;
    correctAnswers: number;
    wrongAnswers: number;
    reactionTime: number[];
    streak: number;
    maxStreak: number;
}

interface Word {
    armenian: string;
    russian: string;
    english: string;
    category: string;
    difficulty: number;
    exampleSongs: string[];
    frequency: number;
    hints: string[];
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

interface HistoryItem {
    player: string;
    word: string;
    time: number;
    points: number;
    round: number;
}

interface Stats {
    fastestGuess: { player: string; time: number; word: string } | null;
    bestPlayer: string | null;
    totalWords: number;
    avgTime: number;
    totalGameTime: number;
    wordsPerMinute: number;
    bestStreak: number;
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

const playerAvatars = ['👤', '👨', '👩', '🧑', '🧔', '👨‍💼', '👩‍💼', '👨‍🔧', '👩‍🔧', '👨‍🎓', '👩‍🎓', '👨‍🍳', '👩‍🍳', '👨‍🔬', '👩‍🔬', '🎤', '🎸', '🥁', '🎹', '🎧'];

const ArmenianSongsGame = () => {
    const router = useRouter();
    const [gameState, setGameState] = useState<GameState>('menu');
    const [players, setPlayers] = useState<Player[]>([]);
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [currentWord, setCurrentWord] = useState<Word | null>(null);
    const [timeLeft, setTimeLeft] = useState(30);
    const [difficulty, setDifficulty] = useState<Difficulty>('medium');
    const [round, setRound] = useState(1);
    const [maxRounds, setMaxRounds] = useState(10);
    const [playerQueue, setPlayerQueue] = useState<number[]>([]);
    const [currentQueueIndex, setCurrentQueueIndex] = useState(0);
    const [stats, setStats] = useState<Stats>({
        fastestGuess: null,
        bestPlayer: null,
        totalWords: 0,
        avgTime: 0,
        totalGameTime: 0,
        wordsPerMinute: 0,
        bestStreak: 0
    });
    const [showConfetti, setShowConfetti] = useState(false);
    const [showFireworks, setShowFireworks] = useState(false);
    const [showSnow, setShowSnow] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [showWord, setShowWord] = useState(false);
    const [gameMode, setGameMode] = useState<'classic' | 'blitz' | 'survival'>('classic');
    const [streak, setStreak] = useState(0);
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [animateCard, setAnimateCard] = useState(false);
    const [theme, setTheme] = useState<Theme>('night');
    const [aiAssistant, setAiAssistant] = useState(true);
    const [hintLevel, setHintLevel] = useState(0);
    const [lastAction, setLastAction] = useState('');
    const [combo, setCombo] = useState(0);
    const [mood, setMood] = useState<Mood>('neutral');
    const [particles, setParticles] = useState<Particle[]>([]);
    const [specialCards, setSpecialCards] = useState<Record<SpecialCardType, number>>({
        hint: 3,
        extraTime: 2,
        doublePoints: 1,
        skipWord: 2,
        shield: 1,
        steal: 1,
        reveal: 1,
        bonus: 2
    });
    const [wordHistory, setWordHistory] = useState<Word[]>([]);
    const [usedWords, setUsedWords] = useState<string[]>([]);
    const [timerActive, setTimerActive] = useState(false);
    const [gameStartTime, setGameStartTime] = useState<number | null>(null);
    const [totalWordsGuessed, setTotalWordsGuessed] = useState(0);
    const [currentStreak, setCurrentStreak] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);

    // Для добавления игроков
    const [newPlayerName, setNewPlayerName] = useState('');
    const [selectedPlayerAvatar, setSelectedPlayerAvatar] = useState(0);
    const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
    const [playerSearchTerm, setPlayerSearchTerm] = useState('');

    // Звуки
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

    // База армянских слов и песен
    const armenianWords: Word[] = [
        {
            armenian: "սեր",
            russian: "любовь",
            english: "love",
            category: "чувства",
            difficulty: 1,
            exampleSongs: ["Սեր ունեմ", "Կյանքս սիրով", "Անվերջ սեր"],
            frequency: 10,
            hints: ["Основная тема большинства песен", "Чувство, которое движет миром"]
        },
        {
            armenian: "կյանք",
            russian: "жизнь",
            english: "life",
            category: "философия",
            difficulty: 2,
            exampleSongs: ["Կյանքի ճանապարհ", "Կյանքը գեղեցիկ է", "Կյանքս իմ"],
            frequency: 8,
            hints: ["То, что мы все проживаем", "Путешествие от рождения до смерти"]
        },
        {
            armenian: "երգ",
            russian: "песня",
            english: "song",
            category: "музыка",
            difficulty: 1,
            exampleSongs: ["Երգ իմ հոգու", "Աշխարհի երգը", "Երգը կյանքի"],
            frequency: 9,
            hints: ["То, что мы сейчас слушаем", "Музыкальное произведение"]
        },
        {
            armenian: "սիրտ",
            russian: "сердце",
            english: "heart",
            category: "чувства",
            difficulty: 2,
            exampleSongs: ["Սիրտը բաց", "Սրտիս երգը", "Կոտրված սիրտ"],
            frequency: 7,
            hints: ["Символ любви и чувств", "Орган, который бьется"]
        },
        {
            armenian: "հայրենիք",
            russian: "родина",
            english: "homeland",
            category: "патриотизм",
            difficulty: 3,
            exampleSongs: ["Հայրենիքիս", "Իմ Հայաստան", "Հայաստան աշխարհ"],
            frequency: 6,
            hints: ["Место, где родился", "Страна предков"]
        },
        {
            armenian: "երկինք",
            russian: "небо",
            english: "sky",
            category: "природа",
            difficulty: 2,
            exampleSongs: ["Երկնքում աստղեր", "Երկինքը կապույտ", "Երկնքի տակ"],
            frequency: 5,
            hints: ["То, что над нами", "Где летают птицы и облака"]
        },
        {
            armenian: "աստղ",
            russian: "звезда",
            english: "star",
            category: "природа",
            difficulty: 2,
            exampleSongs: ["Իմ աստղը", "Աստղեր գիշերվա", "Աստղիկն իմ"],
            frequency: 6,
            hints: ["Светит ночью на небе", "Небесное тело"]
        },
        {
            armenian: "ճանապարհ",
            russian: "дорога",
            english: "road",
            category: "путешествия",
            difficulty: 3,
            exampleSongs: ["Երկար ճանապարհ", "Ճանապարհ դեպի տուն", "Կյանքի ճանապարհ"],
            frequency: 5,
            hints: ["Путь из точки А в точку Б", "По ней ездят машины"]
        },
        {
            armenian: "երազ",
            russian: "мечта",
            english: "dream",
            category: "философия",
            difficulty: 2,
            exampleSongs: ["Երազանքներ", "Իմ երազը", "Երազների աշխարհ"],
            frequency: 7,
            hints: ["То, что мы видим во сне", "Цель, к которой стремимся"]
        },
        {
            armenian: "անուն",
            russian: "имя",
            english: "name",
            category: "личное",
            difficulty: 3,
            exampleSongs: ["Անունդ", "Իմ անունը", "Անունով մի երգ"],
            frequency: 4,
            hints: ["Как тебя зовут?", "Личное обозначение человека"]
        },
        {
            armenian: "գարուն",
            russian: "весна",
            english: "spring",
            category: "времена года",
            difficulty: 2,
            exampleSongs: ["Գարնան երգ", "Գարուն է գալիս", "Գարնանային մեղեդի"],
            frequency: 5,
            hints: ["Время года после зимы", "Когда все цветет"]
        },
        {
            armenian: "ձյուն",
            russian: "снег",
            english: "snow",
            category: "времена года",
            difficulty: 2,
            exampleSongs: ["Ձյունե երգ", "Ձմեռային հեքիաթ", "Ձյունիկներ"],
            frequency: 5,
            hints: ["Белое зимнее покрывало", "Падает с неба зимой"]
        },
        {
            armenian: "ջուր",
            russian: "вода",
            english: "water",
            category: "природа",
            difficulty: 1,
            exampleSongs: ["Ծովի երգ", "Ակունք", "Ջրերի մեղեդի"],
            frequency: 4,
            hints: ["Основа жизни", "Пьем каждый день"]
        },
        {
            armenian: "հուր",
            russian: "огонь",
            english: "fire",
            category: "стихии",
            difficulty: 3,
            exampleSongs: ["Հուրը սրտում", "Կրակի պար", "Հրեղեն սեր"],
            frequency: 4,
            hints: ["Дает тепло и свет", "Стихия"]
        },
        {
            armenian: "անուշ",
            russian: "сладкий",
            english: "sweet",
            category: "чувства",
            difficulty: 2,
            exampleSongs: ["Անուշ սեր", "Անուշ բառեր", "Անուշիկ"],
            frequency: 6,
            hints: ["Противоположность горькому", "Вкус конфет"]
        },
        {
            armenian: "լույս",
            russian: "свет",
            english: "light",
            category: "философия",
            difficulty: 3,
            exampleSongs: ["Լույսի ճանապարհ", "Լույսը սրտում", "Լուսավոր ապագա"],
            frequency: 5,
            hints: ["Противоположность тьме", "Дает солнце"]
        },
        {
            armenian: "մենություն",
            russian: "одиночество",
            english: "loneliness",
            category: "чувства",
            difficulty: 4,
            exampleSongs: ["Մենակություն", "Միայնակ սիրտ", "Մենության երգ"],
            frequency: 4,
            hints: ["Когда нет рядом никого", "Чувство изоляции"]
        },
        {
            armenian: "ընկեր",
            russian: "друг",
            english: "friend",
            category: "отношения",
            difficulty: 2,
            exampleSongs: ["Ընկերոջ երգ", "Ընկերություն", "Իմ ընկերը"],
            frequency: 6,
            hints: ["Тот, кто всегда рядом", "Не родственник, но близкий"]
        },
        {
            armenian: "մայր",
            russian: "мать",
            english: "mother",
            category: "семья",
            difficulty: 2,
            exampleSongs: ["Մայրիկիս", "Մայրական սեր", "Մայրը սրտում"],
            frequency: 7,
            hints: ["Самая родная женщина", "Дарила жизнь"]
        },
        {
            armenian: "հաղթանակ",
            russian: "победа",
            english: "victory",
            category: "спорт",
            difficulty: 3,
            exampleSongs: ["Հաղթանակի երգ", "Հաղթողները", "Հաղթանակ մերն է"],
            frequency: 5,
            hints: ["Цель в соревнованиях", "Противоположность поражению"]
        }
    ];

    const categories = {
        чувства: { name: 'Զգացմունքներ', emoji: '❤️', color: 'from-red-500 to-pink-600', icon: <Heart className="w-5 h-5" /> },
        философия: { name: 'Փիլիսոփայություն', emoji: '💭', color: 'from-blue-500 to-cyan-600', icon: <Brain className="w-5 h-5" /> },
        музыка: { name: 'Երաժշտություն', emoji: '🎵', color: 'from-purple-500 to-violet-600', icon: <Music className="w-5 h-5" /> },
        патриотизм: { name: 'Հայրենասիրություն', emoji: '🇦🇲', color: 'from-orange-500 to-red-600', icon: <Flag className="w-5 h-5" /> },
        природа: { name: 'Բնություն', emoji: '🌿', color: 'from-green-500 to-emerald-600', icon: <Trees className="w-5 h-5" /> },
        путешествия: { name: 'Ճանապարհորդություն', emoji: '🧳', color: 'from-yellow-500 to-amber-600', icon: <MapPin className="w-5 h-5" /> },
        времена_года: { name: 'Տարվա Եղանակներ', emoji: '🍂', color: 'from-teal-500 to-cyan-600', icon: <Calendar className="w-5 h-5" /> },
        стихии: { name: 'Տարերքներ', emoji: '🔥', color: 'from-orange-600 to-red-700', icon: <Flame className="w-5 h-5" /> },
        отношения: { name: 'Հարաբերություններ', emoji: '👥', color: 'from-pink-500 to-rose-600', icon: <Users className="w-5 h-5" /> },
        семья: { name: 'Ընտանիք', emoji: '👨‍👩‍👧‍👦', color: 'from-indigo-500 to-blue-600', icon: <Home className="w-5 h-5" /> },
        спорт: { name: 'Սպորտ', emoji: '⚽', color: 'from-green-600 to-lime-600', icon: <Trophy className="w-5 h-5" /> }
    };

    const difficultySettings = {
        easy: {
            time: 45,
            points: 1,
            label: 'Հեշտ',
            color: 'from-green-400 to-emerald-500',
            icon: '😊',
            multiplier: 0.8,
            description: 'Իդեալական սկսնակների համար'
        },
        medium: {
            time: 30,
            points: 2,
            label: 'Միջին',
            color: 'from-yellow-400 to-orange-500',
            icon: '😎',
            multiplier: 1.0,
            description: 'Հավասարակշռված բարդություն'
        },
        hard: {
            time: 20,
            points: 3,
            label: 'Բարդ',
            color: 'from-orange-500 to-red-600',
            icon: '🔥',
            multiplier: 1.3,
            description: 'Փորձառու խաղացողների համար'
        },
        expert: {
            time: 15,
            points: 5,
            label: 'Փորձառու',
            color: 'from-red-600 to-purple-700',
            icon: '💀',
            multiplier: 1.7,
            description: 'Ճշգրիտ ռեակցիա և մտածողություն'
        },
        insane: {
            time: 10,
            points: 8,
            label: 'Խելագար',
            color: 'from-purple-700 to-pink-700',
            icon: '👿',
            multiplier: 2.2,
            description: 'Մաքսիմալ մարտահրավեր'
        }
    };

    const gameModes = {
        classic: {
            name: 'Դասական',
            description: 'Խաղացողները հերթով անվանում են երգեր',
            icon: <Play className="w-6 h-6" />,
            color: 'from-blue-500 to-cyan-500',
            features: ['10 տուր', 'Յուրաքանչյուրին հավասար հնարավորություն', 'Կուտակային միավորներ']
        },
        blitz: {
            name: 'Բլից',
            description: 'Առավելագույն բառեր սահմանափակ ժամանակում',
            icon: <Zap className="w-6 h-6" />,
            color: 'from-purple-500 to-violet-500',
            features: ['Ժամանակի սահմանափակում', 'Արագ մտածողություն', 'Բառերի հոսք']
        },
        survival: {
            name: 'Գոյատևում',
            description: 'Մեկ սխալ - դուրս ես մնում',
            icon: <Shield className="w-6 h-6" />,
            color: 'from-red-500 to-pink-500',
            features: ['Կյանքերով խաղ', 'Լարվածություն', 'Վերջինը մնացածը հաղթում է']
        }
    };

    const specialCardTypes: SpecialCard[] = [
        {
            type: 'hint',
            name: 'Հուշում',
            emoji: '💡',
            description: 'Ստացեք հուշում',
            color: 'from-yellow-400 to-amber-500',
            effect: 'Ստացեք հուշում երգի մասին'
        },
        {
            type: 'extraTime',
            name: 'Լրացուցիչ Ժամանակ',
            emoji: '⏰',
            description: '+10 վայրկյան',
            color: 'from-cyan-400 to-blue-500',
            effect: 'Ավելացրեք ժամանակ'
        },
        {
            type: 'doublePoints',
            name: 'Կրկնակի Միավորներ',
            emoji: '✨',
            description: 'Կրկնակի միավորներ',
            color: 'from-purple-500 to-pink-500',
            effect: 'Միավորների բազմապատկում'
        },
        {
            type: 'skipWord',
            name: 'Բաց Թողնել',
            emoji: '⏭️',
            description: 'Նոր բառ ստանալ',
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
            type: 'steal',
            name: 'Գողություն',
            emoji: '🎯',
            description: 'Վերցրեք միավորներ հակառակորդից',
            color: 'from-red-500 to-orange-600',
            effect: 'Վերցրեք 3 միավոր հակառակորդից'
        },
        {
            type: 'reveal',
            name: 'Բացահայտում',
            emoji: '👁️',
            description: 'Տեսեք օրինակ երգ',
            color: 'from-indigo-500 to-purple-600',
            effect: 'Ցույց տալ օրինակ երգ'
        },
        {
            type: 'bonus',
            name: 'Բոնուս',
            emoji: '💰',
            description: '+5 միավոր',
            color: 'from-amber-400 to-yellow-500',
            effect: 'Անմիջական միավորներ'
        }
    ];

    // Эффекты
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (gameState === 'playing' && timerActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 10 && soundEnabled) {
                        playTimer();
                    }

                    if (prev <= 1) {
                        handleTimeout();
                        return 0;
                    }

                    return prev - 1;
                });
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [gameState, timeLeft, soundEnabled, timerActive]);

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
            score: 0,
            correctAnswers: 0,
            wrongAnswers: 0,
            reactionTime: [],
            streak: 0,
            maxStreak: 0
        };

        setPlayers(prev => [...prev, newPlayer]);
        setNewPlayerName('');
        setSelectedPlayerAvatar(0);

        if (soundEnabled) playClick();
    };

    const removePlayer = (playerId: string) => {
        setPlayers(prev => prev.filter(p => p.id !== playerId));
        if (soundEnabled) playClick();
    };

    const startGameWithPlayers = () => {
        if (players.length < 2) {
            alert('Անհրաժեշտ է առնվազն 2 խաղացող խաղի համար');
            return;
        }

        // Создаем очередь игроков
        const queue = [...Array(players.length).keys()];
        // Перемешиваем массив для случайного порядка
        for (let i = queue.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [queue[i], queue[j]] = [queue[j], queue[i]];
        }

        setPlayerQueue(queue);
        setCurrentQueueIndex(0);
        setGameState('ready');
        if (soundEnabled) playSpecial();
    };

    const startPlayerTurn = (playerIndex: number) => {
        setCurrentPlayerIndex(playerIndex);
        setTimerActive(true);
        setGameStartTime(Date.now());
        setTotalWordsGuessed(0);
        setCurrentStreak(0);
        setMaxCombo(0);

        const gameTime = difficultySettings[difficulty].time;
        setTimeLeft(gameTime);

        generateNewWord();
        setGameState('playing');
        setAnimateCard(true);
        setShowWord(false);

        setTimeout(() => setAnimateCard(false), 500);

        if (soundEnabled) {
            playCardFlip();
            playSpecial();
        }
        generateParticles('sparkle', 20);
    };

    const generateNewWord = () => {
        // Фильтруем уже использованные слова
        const availableWords = armenianWords.filter(word => !usedWords.includes(word.armenian));
        
        if (availableWords.length === 0) {
            // Если все слова использованы, сбрасываем историю
            setUsedWords([]);
            return generateNewWord();
        }

        // Выбираем случайное слово с учетом сложности
        const filteredWords = availableWords.filter(word => 
            word.difficulty <= (difficulty === 'easy' ? 2 : 
                               difficulty === 'medium' ? 3 :
                               difficulty === 'hard' ? 4 : 5)
        );

        const selectedWord = filteredWords.length > 0 
            ? filteredWords[Math.floor(Math.random() * filteredWords.length)]
            : availableWords[Math.floor(Math.random() * availableWords.length)];

        setCurrentWord(selectedWord);
        setUsedWords(prev => [...prev, selectedWord.armenian]);
        setWordHistory(prev => [...prev, selectedWord]);
    };

    const handleCorrect = () => {
        if (!currentWord) return;

        const timeTaken = difficultySettings[difficulty].time - timeLeft;
        const basePoints = difficultySettings[difficulty].points;
        let multiplier = difficultySettings[difficulty].multiplier;

        // Бонус за скорость
        if (timeTaken < 5) multiplier += 1.5;
        else if (timeTaken < 10) multiplier += 1.0;
        else if (timeTaken < 20) multiplier += 0.5;

        // Бонус за комбо
        if (currentStreak >= 5) multiplier += 1.0;
        else if (currentStreak >= 3) multiplier += 0.5;

        const points = Math.floor(basePoints * multiplier);

        const newStreak = currentStreak + 1;
        setCurrentStreak(newStreak);
        if (newStreak > maxCombo) {
            setMaxCombo(newStreak);
        }

        setTotalWordsGuessed(prev => prev + 1);

        // Обновляем статистику игрока
        setPlayers(prev => prev.map((player, idx) => {
            if (idx === currentPlayerIndex) {
                const newStreak = player.streak + 1;
                return {
                    ...player,
                    score: player.score + points,
                    correctAnswers: player.correctAnswers + 1,
                    reactionTime: [...player.reactionTime, timeTaken],
                    streak: newStreak,
                    maxStreak: Math.max(player.maxStreak, newStreak)
                };
            }
            return player;
        }));

        // Визуальные эффекты
        setShowConfetti(true);
        generateParticles('confetti', 30);
        setTimeout(() => setShowConfetti(false), 1000);

        if (soundEnabled) {
            playCorrect();
            if (points > 10) playWin();
        }

        checkAchievements(timeTaken, points);

        // В режиме Blitz сразу рисуем новое слово
        if (gameMode === 'blitz') {
            setTimeout(() => {
                generateNewWord();
                setShowWord(false);
                setTimeLeft(difficultySettings[difficulty].time);
            }, 500);
        } else {
            // В классическом режиме переходим к следующему игроку
            setTimeout(() => {
                endTurn(true);
            }, 1500);
        }
    };

    const handleWrong = () => {
        setCurrentStreak(0);

        if (soundEnabled) playIncorrect();

        setPlayers(prev => prev.map((player, idx) => {
            if (idx === currentPlayerIndex) {
                return {
                    ...player,
                    wrongAnswers: player.wrongAnswers + 1,
                    streak: 0
                };
            }
            return player;
        }));

        // В режиме Survival уменьшаем жизни
        if (gameMode === 'survival') {
            // Здесь можно добавить логику жизней
        }

        // В режиме Blitz сразу рисуем новое слово
        if (gameMode === 'blitz') {
            setTimeout(() => {
                generateNewWord();
                setShowWord(false);
                setTimeLeft(difficultySettings[difficulty].time);
            }, 500);
        } else {
            // В классическом режиме переходим к следующему игроку
            setTimeout(() => {
                endTurn(false);
            }, 1500);
        }
    };

    const handleTimeout = () => {
        setTimerActive(false);
        handleWrong();
    };

    const endTurn = (wasCorrect: boolean) => {
        setTimerActive(false);
        
        const nextQueueIndex = currentQueueIndex + 1;
        
        if (nextQueueIndex < playerQueue.length) {
            // Есть следующий игрок
            setCurrentQueueIndex(nextQueueIndex);
            
            // Проверяем, не закончились ли раунды
            if (nextQueueIndex === 0) {
                // Начинаем новый раунд
                setRound(prev => {
                    if (prev >= maxRounds) {
                        endGame();
                        return prev;
                    }
                    return prev + 1;
                });
            }
            
            // Показываем экран готовности для следующего игрока
            setGameState('ready');
            if (soundEnabled) playSpecial();
        } else {
            // Все игроки отыграли - проверяем раунды
            if (round >= maxRounds) {
                endGame();
            } else {
                // Начинаем новый раунд с первого игрока
                setCurrentQueueIndex(0);
                setRound(prev => prev + 1);
                setGameState('ready');
                if (soundEnabled) playSpecial();
            }
        }
    };

    const endGame = () => {
        setTimerActive(false);
        
        const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
        const winner = sortedPlayers[0];

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
        setPlayers([]);
        setRound(1);
        setStreak(0);
        setCombo(0);
        setStats({
            fastestGuess: null,
            bestPlayer: null,
            totalWords: 0,
            avgTime: 0,
            totalGameTime: 0,
            wordsPerMinute: 0,
            bestStreak: 0
        });
        setAchievements([]);
        setCurrentPlayerIndex(0);
        setCurrentWord(null);
        setMood('neutral');
        setTotalWordsGuessed(0);
        setCurrentStreak(0);
        setMaxCombo(0);
        setUsedWords([]);
        setWordHistory([]);
        if (soundEnabled) playClick();
    };

    const useSpecialCard = (type: SpecialCardType) => {
        if (!specialCards[type] || specialCards[type] <= 0) return;

        if (soundEnabled) playSpecial();
        generateParticles('special', 15);

        setSpecialCards(prev => ({ ...prev, [type]: prev[type] - 1 }));

        switch (type) {
            case 'hint':
                if (currentWord) {
                    const hint = currentWord.hints[Math.min(hintLevel, currentWord.hints.length - 1)];
                    alert(`💡 Հուշում: ${hint}`);
                }
                setHintLevel(prev => prev + 1);
                setLastAction('Հուշման քարտ օգտագործված!');
                break;
            case 'extraTime':
                setTimeLeft(prev => prev + 10);
                setLastAction('Լրացուցիչ ժամանակի քարտ օգտագործված! +10 վայրկյան');
                break;
            case 'doublePoints':
                setLastAction('Կրկնակի միավորների քարտ ակտիվացված!');
                // Здесь можно добавить логику для активации бонуса
                break;
            case 'skipWord':
                generateNewWord();
                setLastAction('Բաց թողնելու քարտ օգտագործված! Նոր բառ ստացված');
                break;
            case 'reveal':
                if (currentWord) {
                    const randomSong = currentWord.exampleSongs[Math.floor(Math.random() * currentWord.exampleSongs.length)];
                    alert(`🎵 Օրինակ երգ: "${randomSong}"`);
                }
                setLastAction('Բացահայտման քարտ օգտագործված! Օրինակ երգ ցուցադրված');
                break;
            case 'bonus':
                setPlayers(prev => prev.map((player, idx) => 
                    idx === currentPlayerIndex ? { ...player, score: player.score + 5 } : player
                ));
                setLastAction('Բոնուս քարտ օգտագործված! +5 միավոր');
                break;
        }
    };

    const checkAchievements = (timeTaken: number, points: number) => {
        const newAchievements: Achievement[] = [];
        const player = players[currentPlayerIndex];

        if (timeTaken < 3) {
            newAchievements.push({
                name: 'Մտքի կայծակ',
                emoji: '⚡',
                description: 'Երգ է նշել 3 վայրկյանում!',
                points: 50
            });
        }

        if (currentStreak >= 5) {
            newAchievements.push({
                name: 'Երգերի մոլորակ',
                emoji: '🎵',
                description: '5 ճիշտ պատասխան անընդմեջ!',
                points: 100
            });
        }

        if (player && player.correctAnswers >= 10) {
            newAchievements.push({
                name: 'Երգերի Թագավոր',
                emoji: '👑',
                description: '10+ ճիշտ պատասխան',
                points: 150
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

        if (newAchievements.length > 0) {
            setAchievements(prev => [...prev, ...newAchievements]);
            if (soundEnabled) playAchievement();
            generateParticles('achievement', 20);
        }
    };

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

                    {/* Кнопка возврата на главную */}
                    <div className="fixed left-[2rem] top-[2rem] z-50">
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
                        <div className="absolute top-20 left-10 text-6xl animate-bounce">🎵</div>
                        <div className="absolute top-40 right-20 text-5xl animate-bounce delay-300">🎤</div>
                        <div className="absolute bottom-32 left-1/4 text-7xl animate-bounce delay-500">🎸</div>
                        <div className="absolute bottom-20 right-1/3 text-6xl animate-bounce delay-700">🥁</div>
                        <div className="absolute top-1/2 left-1/3 text-5xl animate-pulse delay-1000">✨</div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 max-w-6xl w-full border-2 border-white/20 shadow-2xl relative z-10">
                        <div className="text-center mb-8">
                            <div className="text-8xl mb-4 animate-pulse">🇦🇲</div>
                            <h1 className="text-6xl font-black text-white mb-3 bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
                                ՀԱՅԿԱԿԱՆ ԵՐԳԵՐ
                            </h1>
                            <p className="text-2xl text-blue-200">Նշեք երգ, որը պարունակում է տրված բառը!</p>
                            <div className="flex items-center justify-center gap-2 mt-2">
                                <div className="flex items-center gap-1">
                                    <Users className="w-4 h-4 text-green-400" />
                                    <span className="text-sm text-green-300">Անսահմանափակ խաղացողներ</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Music className="w-4 h-4 text-yellow-400" />
                                    <span className="text-sm text-yellow-300">20+ հայկական բառեր</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Zap className="w-4 h-4 text-blue-400" />
                                    <span className="text-sm text-blue-300">Բաց թողեք երաժշտական գիտելիքները</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {Object.entries(gameModes).map(([key, mode]) => (
                                <button
                                    key={key}
                                    onClick={() => {
                                        setGameMode(key as 'classic' | 'blitz' | 'survival');
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
                                <div className="text-white font-semibold">{armenianWords.length} հայկական բառ</div>
                                <div className="text-white/60 text-sm">Բազմաթիվ երգերի օրինակներ</div>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all">
                                <div className="text-3xl mb-2">👥</div>
                                <div className="text-white font-semibold">2-12 խաղացող</div>
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
                                        <div className="text-green-400/80 text-sm">Պատրաստ է տրամադրել հուշումներ երգերի մասին</div>
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

                        {/* Game Mode Settings */}
                        {gameMode === 'classic' && (
                            <div className="mb-8">
                                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                                    <Clock className="text-cyan-400" />
                                    Տուրերի քանակ
                                </h3>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => {
                                            setMaxRounds(Math.max(3, maxRounds - 1));
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
                                setGameState('playerSetup');
                                if (soundEnabled) playSpecial();
                            }}
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-2xl font-bold py-6 rounded-2xl shadow-xl transition-all transform hover:scale-105 hover:shadow-2xl"
                        >
                            Ավելացնել Խաղացողներ →
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // PLAYER SETUP SCREEN
    if (gameState === 'playerSetup') {
        const filteredPlayers = players.filter(player =>
            player.name.toLowerCase().includes(playerSearchTerm.toLowerCase())
        );

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
                                Խաղացողների Ավելացում
                            </h2>
                            <div className="text-white/60 text-sm">
                                {players.length} խաղացող ավելացված
                            </div>
                        </div>

                        {/* Добавление нового игрока */}
                        <div className="mb-8 p-6 bg-gradient-to-r from-blue-900/20 to-cyan-900/20 rounded-2xl border border-blue-500/30">
                            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                                <UserPlus className="text-green-400" />
                                Ավելացնել Նոր Խաղացող
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-white/80 text-sm mb-2">Խաղացողի Անուն *</label>
                                    <input
                                        type="text"
                                        value={newPlayerName}
                                        onChange={(e) => setNewPlayerName(e.target.value)}
                                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Օրինակ՝ Արամ"
                                        maxLength={20}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                addNewPlayer();
                                            }
                                        }}
                                    />
                                    <div className="text-white/40 text-xs mt-1 text-right">{newPlayerName.length}/20</div>
                                </div>
                                <div>
                                    <label className="block text-white/80 text-sm mb-2">Ավատար</label>
                                    <div className="flex gap-2 flex-wrap">
                                        {playerAvatars.slice(0, 10).map((avatar, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setSelectedPlayerAvatar(idx)}
                                                className={`p-3 rounded-lg transition-all transform ${selectedPlayerAvatar === idx ? 'ring-2 ring-white scale-110 bg-white/20' : 'hover:scale-105 hover:bg-white/10'}`}
                                                title={`Ավատար ${idx + 1}`}
                                            >
                                                <span className="text-2xl">{avatar}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-end">
                                    <button
                                        onClick={addNewPlayer}
                                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-105"
                                    >
                                        Ավելացնել
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Список игроков */}
                        <div className="mb-8">
                            <div className="mb-4">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={playerSearchTerm}
                                        onChange={(e) => setPlayerSearchTerm(e.target.value)}
                                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 pl-12"
                                        placeholder="Որոնել խաղացողներ..."
                                    />
                                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                                </div>
                            </div>

                            <div className="bg-white/5 rounded-2xl p-4 border border-white/20">
                                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <Users className="text-yellow-400" />
                                    Ընթացիկ Խաղացողներ ({filteredPlayers.length})
                                </h3>

                                {filteredPlayers.length === 0 ? (
                                    <div className="text-center py-12 bg-white/5 rounded-xl">
                                        <div className="text-6xl mb-4">👥</div>
                                        <h4 className="text-xl font-bold text-white mb-2">Խաղացողներ դեռ չկան</h4>
                                        <p className="text-white/60">Ավելացրեք առաջին խաղացողը վերևի ձևի միջոցով</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {filteredPlayers.map((player) => (
                                            <div
                                                key={player.id}
                                                className="bg-white/5 rounded-xl p-4 border border-white/20 hover:border-white/40 transition-all group"
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="text-3xl">{player.avatar}</div>
                                                        <div>
                                                            <h4 className="text-lg font-bold text-white">{player.name}</h4>
                                                            <p className="text-white/60 text-xs">
                                                                Միավորներ: {player.score}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => removePlayer(player.id)}
                                                        className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                        title="Հեռացնել խաղացողին"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
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
                                                • Առնվազն 2 խաղացող <br />
                                                • Առավելագույնը 12 խաղացող <br />
                                                • Յուրաքանչյուր խաղացող պետք է ունենա անուն
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={startGameWithPlayers}
                                    disabled={players.length < 2}
                                    className={`w-full text-3xl font-bold py-8 rounded-2xl shadow-xl transition-all transform hover:scale-105 hover:shadow-2xl flex items-center justify-center gap-3 ${players.length < 2
                                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
                                        }`}
                                >
                                    <Play className="w-10 h-10" />
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
        const currentPlayerIndex = playerQueue[currentQueueIndex];
        const player = players[currentPlayerIndex];

        if (!player) {
            return (
                <div className={`min-h-screen bg-gradient-to-br ${getThemeClasses()} flex items-center justify-center p-4`}>
                    <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 border-2 border-white/20 text-center max-w-2xl">
                        <div className="text-8xl mb-6 animate-bounce">🎮</div>
                        <h2 className="text-5xl font-bold text-white mb-4">Խաղը Սկսվում է!</h2>
                        <div className="mb-8">
                            <div className="text-4xl font-black text-white mb-2">Պատրաստվեք</div>
                            <div className="text-white/60 text-xl">Առաջին խաղացողը կնշանակվի պատահականորեն</div>
                        </div>
                        <button
                            onClick={() => {
                                const newQueue = [...Array(players.length).keys()];
                                for (let i = newQueue.length - 1; i > 0; i--) {
                                    const j = Math.floor(Math.random() * (i + 1));
                                    [newQueue[i], newQueue[j]] = [newQueue[j], newQueue[i]];
                                }
                                setPlayerQueue(newQueue);
                                setCurrentQueueIndex(0);
                                startPlayerTurn(newQueue[0]);
                            }}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-3xl font-bold py-6 px-12 rounded-2xl shadow-xl transition-all transform hover:scale-105 hover:shadow-2xl"
                        >
                            Սկսել Խաղը
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className={`min-h-screen bg-gradient-to-br ${getThemeClasses()} flex items-center justify-center p-4`}>
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 border-2 border-white/20 text-center max-w-2xl">
                    <div className="text-8xl mb-6 animate-bounce">🎮</div>
                    <h2 className="text-5xl font-bold text-white mb-4">Ձեր Շրջանն է!</h2>
                    <div className="mb-8">
                        <div className="text-4xl font-black text-white mb-2 flex items-center justify-center gap-3">
                            <span className="text-5xl">{player.avatar}</span>
                            {player.name}
                        </div>
                        <div className="text-white/60 text-xl">Պատրաստվեք նշել երգ, որը պարունակում է հայկական բառ</div>
                        <div className="mt-4 text-white/40">
                            Տուր {round} / {maxRounds} • Ժամանակ՝ {difficultySettings[difficulty].time} վայրկյան
                        </div>
                    </div>
                    <button
                        onClick={() => startPlayerTurn(currentPlayerIndex)}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-3xl font-bold py-6 px-12 rounded-2xl shadow-xl transition-all transform hover:scale-105 hover:shadow-2xl"
                    >
                        Սկսել
                    </button>
                </div>
            </div>
        );
    }

    // PLAYING SCREEN
    if (gameState === 'playing' && currentWord) {
        const currentPlayerIndex = playerQueue[currentQueueIndex] || 0;
        const currentPlayer = players[currentPlayerIndex];

        return (
            <div className={`relative min-h-screen bg-gradient-to-br ${getThemeClasses()} p-4`}>
                {showConfetti && <ParticleEffect type="confetti" />}
                <FireworksEffect />

                <Button
                    onClick={() => {
                        router.push('/');
                    }}
                    className="absolute top-10 left-10 bg-white/10 backdrop-blur-lg hover:bg-white/20 border border-white/20 hover:scale-105 transition-all group"
                >
                    <span className="group-hover:-translate-x-1 transition-transform">←</span>
                    <span className="ml-2">Գլխավոր</span>
                </Button>

                <div className="max-w-6xl mx-auto py-8">
                    {/* Header with Player Info and Controls */}
                    <div className="mb-6">
                        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                <div className="text-center p-4 bg-white/5 rounded-lg">
                                    <div className="text-white/60 text-sm mb-1">Խաղացող</div>
                                    <div className="text-white font-bold text-xl flex items-center justify-center gap-2">
                                        <span className="text-2xl">{currentPlayer?.avatar}</span>
                                        {currentPlayer?.name}
                                    </div>
                                    <div className="text-white/40 text-xs mt-1">
                                        Տուր {round} / {maxRounds}
                                    </div>
                                </div>

                                <div className="text-center p-4 bg-white/5 rounded-lg">
                                    <div className="text-white/60 text-sm mb-1">Ժամանակ</div>
                                    <div className={`text-4xl font-black ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                                        {timeLeft}
                                    </div>
                                </div>

                                <div className="text-center p-4 bg-white/5 rounded-lg">
                                    <div className="text-white/60 text-sm mb-1">Միավոր</div>
                                    <div className="text-white font-bold text-3xl">{currentPlayer?.score}</div>
                                </div>

                                <div className="text-center p-4 bg-white/5 rounded-lg">
                                    <div className="text-white/60 text-sm mb-1">Ճիշտ պատասխաններ</div>
                                    <div className="text-white font-bold text-2xl">{currentPlayer?.correctAnswers}</div>
                                </div>

                                <div className="text-center p-4 bg-white/5 rounded-lg">
                                    <div className="text-white/60 text-sm mb-1">Կոմբո</div>
                                    <div className="text-yellow-300 font-bold text-2xl">{currentStreak}</div>
                                </div>
                            </div>

                            {/* Режим Blitz статистика */}
                            {gameMode === 'blitz' && (
                                <div className="grid grid-cols-4 gap-2 mt-4">
                                    <div className="bg-white/10 backdrop-blur-lg rounded-lg p-3 text-center">
                                        <div className="text-white/60 text-xs mb-1">Բառեր</div>
                                        <div className="text-white text-xl font-bold">{totalWordsGuessed}</div>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-lg rounded-lg p-3 text-center">
                                        <div className="text-white/60 text-xs mb-1">Կոմբո</div>
                                        <div className="text-yellow-300 text-xl font-bold">{currentStreak}</div>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-lg rounded-lg p-3 text-center">
                                        <div className="text-white/60 text-xs mb-1">Մաքս Կոմբո</div>
                                        <div className="text-orange-300 text-xl font-bold">{maxCombo}</div>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-lg rounded-lg p-3 text-center">
                                        <div className="text-white/60 text-xs mb-1">Բառ/րոպե</div>
                                        <div className="text-green-300 text-xl font-bold">
                                            {difficultySettings[difficulty].time > 0 ? 
                                                Math.round(totalWordsGuessed / (difficultySettings[difficulty].time / 60)) : 0}
                                        </div>
                                    </div>
                                </div>
                            )}
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
                                            Բարդություն {currentWord?.difficulty}/5
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => useSpecialCard('hint')}
                                    disabled={!specialCards.hint || specialCards.hint <= 0}
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm transition-all hover:scale-105"
                                >
                                    Հուշում ստանալ ({specialCards.hint})
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Main Word Card */}
                    <div className={`relative bg-white/10 backdrop-blur-xl rounded-3xl p-12 mb-6 border-2 border-white/20 text-center transition-all duration-500 ${animateCard ? 'scale-110 ring-4 ring-yellow-400/50' : 'scale-100'}`}>
                        {/* Glow Effect */}
                        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-xl -z-10"></div>

                        <div className="inline-block px-6 py-3 rounded-full bg-gradient-to-r from-red-500 to-orange-600 mb-8 shadow-lg">
                            <div className="flex items-center gap-2 text-white font-semibold">
                                <span className="text-2xl">🇦🇲</span>
                                <span className="text-xl">ՀԱՅԿԱԿԱՆ ԲԱՌ</span>
                            </div>
                        </div>

                        <div className="animate-fadeIn">
                            <div className="text-8xl font-black text-white mb-6 animate-pulse-slow bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
                                {currentWord?.armenian}
                            </div>
                            
                            <div className="text-2xl text-white/70 mb-4">
                                Ռուսերեն: <span className="text-yellow-300 font-bold">{currentWord?.russian}</span>
                            </div>
                            
                            <div className="text-xl text-white/60 mb-6">
                                Անգլերեն: <span className="text-blue-300">{currentWord?.english}</span>
                            </div>

                            <div className={`inline-block px-4 py-2 rounded-lg bg-gradient-to-r ${categories[currentWord?.category as keyof typeof categories]?.color || 'from-gray-500 to-gray-700'}`}>
                                <div className="flex items-center gap-2 text-white">
                                    {categories[currentWord?.category as keyof typeof categories]?.emoji || '🎵'}
                                    <span>{categories[currentWord?.category as keyof typeof categories]?.name || currentWord?.category}</span>
                                </div>
                            </div>

                            <div className="mt-8 p-4 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl inline-block">
                                <div className="text-white/80 text-lg">
                                    Նշեք հայկական երգ, որը պարունակում է "<span className="text-yellow-300 font-bold">{currentWord?.armenian}</span>" բառը
                                </div>
                            </div>
                        </div>

                        {/* Timer Indicator */}
                        <div className="absolute top-4 right-4">
                            <div className={`p-3 rounded-full ${timeLeft > 10 ? 'bg-green-500/20' : 'bg-red-500/20 animate-pulse'}`}>
                                <div className="flex items-center gap-2">
                                    <Timer className={`w-5 h-5 ${timeLeft > 10 ? 'text-green-400' : 'text-red-400'}`} />
                                    <span className={`text-sm ${timeLeft > 10 ? 'text-white' : 'text-red-300'}`}>
                                        {timeLeft} վայրկյան
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Special Cards */}
                    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 mb-6 border border-white/20">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-white font-bold flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-yellow-400" />
                                Հատուկ Քարտեր
                            </h3>
                            <div className="text-sm text-blue-300">
                                {Object.values(specialCards).reduce((a, b) => a + b, 0)} մատչելի
                            </div>
                        </div>
                        <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-8 gap-2">
                            {specialCardTypes.map(card => {
                                const count = specialCards[card.type] || 0;
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

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <button
                            onClick={handleCorrect}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-2xl font-bold py-8 rounded-2xl shadow-xl transition-all transform hover:scale-105 active:scale-95 hover:shadow-2xl flex items-center justify-center gap-3 group"
                        >
                            <div className="relative">
                                <Check className="w-8 h-8" />
                                <div className="absolute inset-0 animate-ping opacity-20">✓</div>
                            </div>
                            Ես գիտեմ երգ!
                        </button>
                        <button
                            onClick={handleWrong}
                            className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white text-2xl font-bold py-8 rounded-2xl shadow-xl transition-all transform hover:scale-105 active:scale-95 hover:shadow-2xl flex items-center justify-center gap-3"
                        >
                            <X className="w-8 h-8" />
                            Չգիտեմ
                        </button>
                    </div>

                    {/* Quick Info */}
                    <div className="fixed bottom-4 left-4 p-3 bg-white/10 rounded-lg border border-white/20">
                        <div className="text-white text-xs">
                            <div className="font-bold">Հուշում</div>
                            <div className="text-green-300">Օրինակ երգեր՝ {currentWord?.exampleSongs.slice(0, 2).join(', ')}</div>
                            <div className="text-yellow-300 mt-1">Կատեգորիա՝ {categories[currentWord?.category as keyof typeof categories]?.name}</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // RESULTS SCREEN
    if (gameState === 'results') {
        const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
        const winner = sortedPlayers[0];

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
                                <div className="text-4xl font-black text-yellow-300 mb-4 flex items-center gap-3">
                                    <span className="text-5xl">{winner?.avatar}</span>
                                    {winner?.name}
                                </div>
                                <div className="text-6xl font-black text-white">{winner?.score} միավոր</div>
                            </div>
                        </div>

                        {/* Podium */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            {sortedPlayers.slice(0, 3).map((player, idx) => (
                                <div
                                    key={player.id}
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
                                        <div className="text-3xl mb-2">{player.avatar}</div>
                                        <div className="text-2xl font-bold text-white mb-3">{player.name}</div>
                                        <div className="text-5xl font-black text-white mb-4">{player.score}</div>
                                        <div className="space-y-2 text-sm text-white/80">
                                            <div className="flex justify-between">
                                                <span>Ճիշտ պատասխաններ</span>
                                                <span className="font-bold">✅ {player.correctAnswers}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Սխալ պատասխաններ</span>
                                                <span className="font-bold">❌ {player.wrongAnswers}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Մաքսիմալ շարք</span>
                                                <span className="font-bold">🔥 {player.maxStreak}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Ճշգրտություն</span>
                                                <span className="font-bold">🎯 {
                                                    player.correctAnswers + player.wrongAnswers > 0 
                                                        ? Math.round(player.correctAnswers / (player.correctAnswers + player.wrongAnswers) * 100)
                                                        : 0
                                                }%</span>
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
                                        <span className="text-white/60">Ընդհանուր խաղացողներ</span>
                                        <span className="font-bold text-xl">{players.length}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-white/10">
                                        <span className="text-white/60">Ընդհանուր տուրեր</span>
                                        <span className="font-bold text-xl">{round}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-white/10">
                                        <span className="text-white/60">Ընդհանուր բառեր</span>
                                        <span className="font-bold text-xl">{usedWords.length}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-white/60">Խաղի ռեժիմ</span>
                                        <span className="font-bold text-xl">{gameModes[gameMode].name}</span>
                                    </div>
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

                        {/* All Players Leaderboard */}
                        {sortedPlayers.length > 3 && (
                            <div className="bg-white/10 rounded-2xl p-6 border border-white/20 mb-8">
                                <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
                                    <Trophy className="text-yellow-400" />
                                    Բոլոր Խաղացողների Վարկանիշ
                                </h3>
                                <div className="space-y-2">
                                    {sortedPlayers.slice(3).map((player, idx) => (
                                        <div
                                            key={player.id}
                                            className="flex items-center justify-between bg-white/5 p-4 rounded-xl hover:bg-white/10 transition-all"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="text-2xl font-bold text-white/60">#{idx + 4}</div>
                                                <div className="text-2xl">{player.avatar}</div>
                                                <div>
                                                    <div className="text-white font-bold">{player.name}</div>
                                                    <div className="text-white/60 text-xs">
                                                        ✅ {player.correctAnswers} • ❌ {player.wrongAnswers} • 🎯 {
                                                            player.correctAnswers + player.wrongAnswers > 0 
                                                                ? Math.round(player.correctAnswers / (player.correctAnswers + player.wrongAnswers) * 100)
                                                                : 0
                                                        }%
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-2xl font-black text-white">{player.score}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                onClick={resetGame}
                                className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white text-xl font-bold py-6 rounded-2xl shadow-xl transition-all transform hover:scale-105 hover:shadow-2xl flex items-center justify-center gap-3"
                            >
                                <RotateCcw className="w-6 h-6" />
                                Նոր Խաղ
                            </button>
                            <button
                                onClick={() => {
                                    setGameState('playerSetup');
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

export default ArmenianSongsGame;