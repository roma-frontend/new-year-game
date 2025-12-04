"use client"

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Play, Pause, Volume2, SkipForward, Trophy, Music,
    Clock, Sparkles, Timer,
    Zap, Heart, VolumeX, Settings, UserPlus, Plus, X,
    Trash2, User, Zap as Lightning, Rocket,
    Video as VideoIcon,
    Target, Timer as TimerIcon, Users as UsersIcon,
    Gamepad2, Crown as CrownIcon, BrickWallFire
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Question {
    id: number;
    type: 'video' | 'audio' | 'quote' | 'scene' | 'image' | 'emoji';
    title: string;
    hint: string;
    answer: string;
    year: number;
    points: number;
    media: {
        type: 'youtube' | 'giphy' | 'image' | 'audio';
        url: string;
        startTime?: number;
        endTime?: number;
    };
    funFact: string;
    category: 'hollywood' | 'soviet' | 'animation' | 'music' | 'comedy' | 'armenia';
    difficulty: 'easy' | 'medium' | 'hard' | 'expert';
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
}

const MovieQuizGame = () => {
    const router = useRouter();

    // Основные состояния игры
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [gamePhase, setGamePhase] = useState<'setup' | 'intro' | 'playing' | 'results'>('setup');
    const [timeLeft, setTimeLeft] = useState(30);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showAnswer, setShowAnswer] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState('');
    const [soundOn, setSoundOn] = useState(true);
    const [hintUsed, setHintUsed] = useState(false);
    const [isAddingTeam, setIsAddingTeam] = useState(false);

    // Настройки
    const [config, setConfig] = useState<GameConfig>({
        timerDuration: 45,
        autoPlay: true,
        soundEnabled: true,
        enableHints: true,
        pointsMultiplier: true,
        shuffleQuestions: true
    });

    // Команды - НЕТ ДЕФОЛТНЫХ!
    const [teams, setTeams] = useState<Team[]>([]);

    const [newTeam, setNewTeam] = useState({
        name: '',
        color: 'from-purple-500 to-pink-500',
        emoji: '🏆',
        avatar: '👥',
        members: ['', '']
    });

    const [activeTeam, setActiveTeam] = useState(0);

    // Вопросы (улучшенные ссылки)
    const questions: Question[] = [
        {
            id: 1,
            type: 'video',
            title: '🎬 Ո՞ր ֆիլմի տեսարանն է սա',
            hint: 'Պարային մրցույթ ծննդյան երեկույթին',
            answer: 'Մենք հրեշտակներ չենք (2000)',
            year: 2000,
            points: 300,
            media: {
                type: 'youtube',
                url: 'https://www.youtube.com/embed/2GFcHcL3_iI',
            },
            funFact: 'Թրևիսը իրականում չգիտեր պարել, նրան սովորեցրել են ֆիլմի համար',
            category: 'comedy',
            difficulty: 'medium'
        },
        {
            id: 2,
            type: 'audio',
            title: '🎵 Լսեք և գուշակեք ֆիլմը',
            hint: 'Ֆիլմի անունը նշանակում է "մենակ տանը"',
            answer: 'Home Alone (1990)',
            year: 1990,
            points: 250,
            media: {
                type: 'youtube',
                url: 'https://www.youtube.com/embed/1Ml3nqjkZqE',
            },
            funFact: 'Երաժշտությունը գրվել է հայտնի կոմպոզիտոր Ջոն Ուիլյամսի կողմից',
            category: 'hollywood',
            difficulty: 'easy'
        },
        {
            id: 3,
            type: 'scene',
            title: '🎪 Ո՞ր կատակերգության տեսարանն է',
            hint: 'Կանաչ սվիտեր, սեղանի վրա պար',
            answer: 'Ձմեռ պապի կյանքը (1994)',
            year: 1994,
            points: 350,
            media: {
                type: 'youtube',
                url: 'https://www.youtube.com/embed/RSwa8KjOJ8I',
            },
            funFact: 'Տիմ Ալենի պարը դարձել է կուլտային տեսարան',
            category: 'comedy',
            difficulty: 'hard'
        },
        {
            id: 4,
            type: 'video',
            title: '🌟 Սովետական դասական',
            hint: '«Հե՜յ, Սվետլանա, նվերնե՜ր»',
            answer: 'Կարմիր գլխարկի արկածները (1977)',
            year: 1977,
            points: 200,
            media: {
                type: 'youtube',
                url: 'https://www.youtube.com/embed/mo_Bm-FC1Ms',
            },
            funFact: 'Այս մուլտֆիլմի երգերը դասական են դարձել նոր տարվա սեղանի ժամանակ',
            category: 'soviet',
            difficulty: 'medium'
        },
        {
            id: 5,
            type: 'emoji',
            title: '😊 Էմոջի վիկտորինա',
            hint: '🎅🏻 🏠 🚫 👨‍👩‍👧‍👦 🎄',
            answer: 'Home Alone (1990)',
            year: 1990,
            points: 400,
            media: {
                type: 'giphy',
                url: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif',
            },
            funFact: 'Մակոլեյ Քալկինը ստացել է 4,5 միլիոն դոլար այս ֆիլմի համար',
            category: 'hollywood',
            difficulty: 'expert'
        },
        {
            id: 6,
            type: 'audio',
            title: '🎶 Տոնական երգի ճանաչում',
            hint: '«Last Christmas I gave you my heart...»',
            answer: 'Last Christmas - Wham!',
            year: 1984,
            points: 200,
            media: {
                type: 'youtube',
                url: 'https://www.youtube.com/embed/E8gmARGvPlI',
            },
            funFact: 'Այս երգը վաճառվել է ավելի քան 1.8 միլիոն օրինակով',
            category: 'music',
            difficulty: 'easy'
        },
        {
            id: 7,
            type: 'video',
            title: '🎄 Հայկական նորամյա ֆիլմ',
            hint: '«Ձմեռ պապ, ձմեռ պապ, ինչո՞ւ ես ուշանում»',
            answer: 'Ձմեռ պապը գյուղից (1983)',
            year: 1983,
            points: 300,
            media: {
                type: 'youtube',
                url: 'https://www.youtube.com/embed/4QqHwG3nQ8E',
            },
            funFact: 'Այս ֆիլմը դասական է դարձել ամբողջ ԱՊՀ-ում',
            category: 'armenia',
            difficulty: 'medium'
        },
        {
            id: 8,
            type: 'quote',
            title: '💬 Ճանաչեք արտահայտությունը',
            hint: 'Գրուշան կրկնում է այս բառերը ամեն անգամ',
            answer: 'Ձմեռ պապը 3 (2006)',
            year: 2006,
            points: 250,
            media: {
                type: 'giphy',
                url: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif',
            },
            funFact: 'Այս արտահայտությունը դարձել է ինտերնետ-մեմ',
            category: 'comedy',
            difficulty: 'medium'
        },
        {
            id: 9,
            type: 'scene',
            title: '🎭 Կադր ֆիլմից',
            hint: 'Տղամարդը հիշում է իր կնոջն այս տողերով',
            answer: 'Սիրո իրական իմաստը (2003)',
            year: 2003,
            points: 350,
            media: {
                type: 'giphy',
                url: 'https://media.giphy.com/media/3o7abAHdYvZdBNnGZq/giphy.gif',
            },
            funFact: 'Ֆիլմը նկարահանվել է ընդամենը 6 շաբաթում',
            category: 'comedy',
            difficulty: 'hard'
        },
        {
            id: 10,
            type: 'audio',
            title: '🎧 Հայկական տոնական երգ',
            hint: '«Ամանոր, ամանոր, դու եկար նորից...»',
            answer: 'Ամանոր - Արմեն Խուդիկյան',
            year: 1970,
            points: 200,
            media: {
                type: 'youtube',
                url: 'https://www.youtube.com/embed/3vJ6KpX5Q7o',
            },
            funFact: 'Այս երգը դարձել է ամանորյան անպայման ատրիբուտ',
            category: 'armenia',
            difficulty: 'medium'
        }
    ];

    const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>(questions);
    const [answerOptions, setAnswerOptions] = useState<string[]>([]);

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const clickSoundRef = useRef<HTMLAudioElement>(null);
    const correctSoundRef = useRef<HTMLAudioElement>(null);
    const incorrectSoundRef = useRef<HTMLAudioElement>(null);
    const timerSoundRef = useRef<HTMLAudioElement>(null);
    const winSoundRef = useRef<HTMLAudioElement>(null);
    const loseSoundRef = useRef<HTMLAudioElement>(null);

    // Инициализация вариантов ответов при загрузке вопроса
    useEffect(() => {
        if (shuffledQuestions.length > 0 && currentQuestion < shuffledQuestions.length) {
            generateAnswerOptions();
        }
    }, [currentQuestion, shuffledQuestions]);

    const generateAnswerOptions = () => {
        const currentQuestionObj = shuffledQuestions[currentQuestion];
        if (!currentQuestionObj) return;

        // Получаем все ответы, кроме текущего
        const otherAnswers = shuffledQuestions
            .filter(q => q.id !== currentQuestionObj.id)
            .map(q => q.answer);

        // Выбираем 3 случайных неправильных ответа
        const shuffledWrongAnswers = [...otherAnswers]
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);

        // Создаем массив из 4 вариантов (3 неправильных + 1 правильный)
        const options = [...shuffledWrongAnswers, currentQuestionObj.answer];

        // Перемешиваем варианты
        setAnswerOptions(options.sort(() => Math.random() - 0.5));
    };

    // Цветовые опции для команд
    const colorOptions = [
        { value: 'from-red-500 to-pink-600', label: 'Կրակ', icon: '🔥' },
        { value: 'from-blue-500 to-cyan-600', label: 'Ծով', icon: '🌊' },
        { value: 'from-green-500 to-emerald-600', label: 'Բնություն', icon: '🌿' },
        { value: 'from-yellow-500 to-orange-600', label: 'Արև', icon: '☀️' },
        { value: 'from-purple-500 to-pink-600', label: 'Մոգություն', icon: '✨' },
        { value: 'from-indigo-500 to-blue-600', label: 'Երեկո', icon: '🌌' },
        { value: 'from-teal-500 to-green-600', label: 'Օվկիանոս', icon: '🐬' },
        { value: 'from-rose-500 to-red-600', label: 'Սեր', icon: '💖' },
        { value: 'from-amber-500 to-yellow-600', label: 'Ոսկի', icon: '💰' },
        { value: 'from-violet-500 to-purple-600', label: 'Արքայություն', icon: '👑' }
    ];

    const avatarOptions = ['👑', '⚡', '🔥', '💎', '🌟', '🎯', '🎪', '🎨', '🏆', '🎮', '🎵', '🎬', '🎭', '🥇', '💥', '🚀'];

    // ========== ОСНОВНЫЕ ФУНКЦИИ ==========

    useEffect(() => {
        if (config.shuffleQuestions) {
            const shuffled = [...questions].sort(() => Math.random() - 0.5);
            setShuffledQuestions(shuffled);
        } else {
            setShuffledQuestions(questions);
        }
        setCurrentQuestion(0);
    }, [config.shuffleQuestions]);

    const startGame = () => {
        if (teams.length < 2) {
            alert('➕ Ավելացրեք առնվազն 2 թիմ խաղը սկսելու համար');
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

    const playSound = (type: 'start' | 'correct' | 'wrong' | 'timeup' | 'hint' | 'levelup' | 'click' | 'card' | 'special' | 'achievement') => {
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
                case 'hint':
                case 'card':
                case 'special':
                    audioElement = winSoundRef.current; // Используем win звук для подсказок
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
            particleCount: 150,
            spread: 100,
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

    // ========== УПРАВЛЕНИЕ ТАЙМЕРОМ ==========

    useEffect(() => {
        if (gamePhase === 'playing' && timeLeft > 0 && isPlaying) {
            timerRef.current = setTimeout(() => {
                setTimeLeft(timeLeft - 1);

                // Воспроизводим звук таймера каждую секунду при последних 10 секундах
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

    // ========== УПРАВЛЕНИЕ КОМАНДАМИ ==========

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
            color: 'from-purple-500 to-pink-500',
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

    // ========== ИГРОВАЯ ЛОГИКА ==========

    const handleAnswer = (answer: string) => {
        if (showAnswer) return; // Предотвращаем повторный выбор

        setSelectedAnswer(answer);
        playSound('click');

        const currentQuestionObj = shuffledQuestions[currentQuestion];
        const isCorrect = answer === currentQuestionObj.answer;

        // Задержка перед показом ответа для драматизма
        setTimeout(() => {
            setShowAnswer(true);
            setIsPlaying(false);

            if (isCorrect) {
                const newTeams = [...teams];
                let points = currentQuestionObj.points;

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

    // ========== КОМПОНЕНТЫ МЕДИА ==========

    const getMediaComponent = (question: Question) => {
        switch (question.media.type) {
            case 'youtube':
                return (
                    <div className="relative w-full aspect-video rounded-3xl overflow-hidden border-4 border-white/30 shadow-2xl shadow-white/10">
                        <iframe
                            src={question.media.url}
                            className="absolute inset-0 w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                    </div>
                );
            case 'giphy':
                return (
                    <div className="relative w-full max-w-2xl mx-auto">
                        <img
                            src={question.media.url}
                            alt="GIF scene"
                            className="w-full h-72 object-cover rounded-3xl border-4 border-white/30 shadow-2xl shadow-white/10"
                        />
                    </div>
                );
            default:
                return (
                    <div className="relative w-full aspect-video rounded-3xl overflow-hidden border-4 border-white/30 shadow-2xl shadow-white/10 bg-gradient-to-br from-purple-900/50 to-blue-900/50 flex items-center justify-center">
                        <Music className="w-32 h-32 text-white/30" />
                    </div>
                );
        }
    };

    // ========== РЕНДЕРИНГ ==========

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 relative overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20" />

                {/* Animated Stars */}
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

                {/* Floating Elements */}
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
                            {['🎬', '🎭', '🎮', '🎪', '🎨', '🎯', '🎲', '🎳', '🎸', '🎺'][i % 10]}
                        </div>
                    </div>
                ))}
            </div>

            {/* Звуковые элементы */}
            <audio ref={audioRef} className="hidden" />
            <audio ref={clickSoundRef} src="/sounds/click.mp3" preload="auto" />
            <audio ref={correctSoundRef} src="/sounds/correct.mp3" preload="auto" />
            <audio ref={incorrectSoundRef} src="/sounds/incorrect.mp3" preload="auto" />
            <audio ref={timerSoundRef} src="/sounds/timer.mp3" preload="auto" />
            <audio ref={winSoundRef} src="/sounds/win.mp3" preload="auto" />
            <audio ref={loseSoundRef} src="/sounds/lose.mp3" preload="auto" />

            {/* Main content */}
            <div className="relative z-10 container mx-auto px-4 py-8">
                {/* Header */}
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

                {/* ЭКРАН НАСТРОЙКИ */}
                {gamePhase === 'setup' && (
                    <div className="min-h-[80vh] flex flex-col items-center space-y-12">
                        {/* Hero Section */}
                        <div className="text-center space-y-6 max-w-4xl">
                            <div className="relative inline-block">
                                <h1 className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 animate-gradient-slow mb-4">
                                    🎬 Կինո-Քվիզ
                                </h1>
                                <div className="absolute -top-4 -right-4 text-3xl animate-bounce">✨</div>
                                <div className="absolute -bottom-4 -left-4 text-3xl animate-pulse">🌟</div>
                            </div>

                            <p className="text-2xl md:text-3xl text-white/90 font-light">
                                Ստեղծեք ձեր <span className="text-yellow-300 font-bold">սեփական</span> թիմերը և մրցեք
                            </p>

                            <div className="flex flex-wrap justify-center gap-4 mt-8">
                                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
                                    <Rocket className="w-5 h-5 text-purple-400" />
                                    <span className="text-white">100% կարգավորելի</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
                                    <BrickWallFire className="w-5 h-5 text-orange-400" />
                                    <span className="text-white">Բացառիկ դիզայն</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
                                    <CrownIcon className="w-5 h-5 text-yellow-400" />
                                    <span className="text-white">Պրեմիում խաղ</span>
                                </div>
                            </div>
                        </div>

                        {/* Game Setup Area */}
                        <div className="w-full max-w-6xl">
                            <Tabs defaultValue="teams" className="w-full">
                                <TabsList className="grid grid-cols-3 mb-8 bg-white/10 backdrop-blur-md border border-white/20">
                                    <TabsTrigger value="teams" className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500">
                                        <UsersIcon className="w-4 h-4 mr-2" />
                                        Թիմեր
                                    </TabsTrigger>
                                    <TabsTrigger value="settings" className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500">
                                        <Settings className="w-4 h-4 mr-2" />
                                        Կարգավորումներ
                                    </TabsTrigger>
                                    <TabsTrigger value="rules" className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500">
                                        <Target className="w-4 h-4 mr-2" />
                                        Կանոններ
                                    </TabsTrigger>
                                </TabsList>

                                {/* Teams Tab */}
                                <TabsContent value="teams" className="space-y-8">
                                    {/* Create Team Card */}
                                    <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-2xl">
                                        <div className="flex items-center justify-between mb-8">
                                            <div>
                                                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                                                    <UserPlus className="w-8 h-8 text-purple-400" />
                                                    Ստեղծել Նոր Թիմ
                                                </h2>
                                                <p className="text-white/70 mt-2">Ավելացրեք ձեր թիմը և անդամներին</p>
                                            </div>
                                            <div className="text-4xl animate-pulse">✨</div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {/* Left Column - Basic Info */}
                                            <div className="space-y-6">
                                                <div>
                                                    <Label className="text-white text-lg mb-3 block">🏷️ Թիմի Անուն</Label>
                                                    <Input
                                                        value={newTeam.name}
                                                        onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                                                        placeholder="Օրինակ՝ Կինո Թագավորներ"
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

                                            {/* Right Column - Members */}
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
                                                className="w-full py-7 text-xl font-bold rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 hover:scale-[1.02] transition-all shadow-2xl shadow-purple-500/30"
                                            >
                                                <Plus className="w-6 h-6 mr-3" />
                                                Ստեղծել Թիմը
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Existing Teams */}
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
                                                            <div className="text-sm text-white/50">Պատրաստ է խաղալ</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>

                                {/* Settings Tab */}
                                <TabsContent value="settings" className="space-y-8">
                                    <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-2xl">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {/* Game Settings */}
                                            <div className="space-y-6">
                                                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                                                    <Gamepad2 className="w-6 h-6 text-blue-400" />
                                                    Խաղի Կարգավորումներ
                                                </h3>

                                                <div className="space-y-6">
                                                    <div>
                                                        <Label className="text-white text-lg mb-3 block flex items-center gap-2">
                                                            <TimerIcon className="w-5 h-5" />
                                                            Ժամանակի Սահմանափակում
                                                        </Label>
                                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                            {[15, 30, 45, 60].map((sec) => (
                                                                <Button
                                                                    key={sec}
                                                                    onClick={() => setConfig({ ...config, timerDuration: sec })}
                                                                    variant={config.timerDuration === sec ? "default" : "outline"}
                                                                    className={`h-14 text-lg ${config.timerDuration === sec ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}
                                                                >
                                                                    {sec} վայրկյան
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

                                            {/* Preview */}
                                            <div className="space-y-6">
                                                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                                                    <VideoIcon className="w-6 h-6 text-purple-400" />
                                                    Խաղի Նախադիտում
                                                </h3>

                                                <div className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-2xl border border-white/20 space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
                                                            <div>
                                                                <div className="text-white font-bold">Օրինակ Թիմ</div>
                                                                <div className="text-sm text-white/70">0 միավոր</div>
                                                            </div>
                                                        </div>
                                                        <div className="bg-white/10 px-4 py-2 rounded-full">
                                                            <span className="text-white font-mono">{config.timerDuration} վ</span>
                                                        </div>
                                                    </div>

                                                    <div className="aspect-video bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-xl border border-white/20 flex items-center justify-center">
                                                        <div className="text-center">
                                                            <div className="text-4xl mb-2">🎬</div>
                                                            <div className="text-white/70">Տեսահոլովակի նախադիտում</div>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3">
                                                        {['Տարբերակ 1', 'Տարբերակ 2', 'Տարբերակ 3', 'Տարբերակ 4'].map((opt, i) => (
                                                            <div key={i} className="bg-white/5 p-3 rounded-lg border border-white/10 text-white/70 text-sm text-center">
                                                                {opt}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30">
                                                    <div className="text-green-300 text-sm">
                                                        ✅ Խաղը կաշխատի հետևյալ կարգավորումներով
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                {/* Rules Tab */}
                                <TabsContent value="rules" className="space-y-6">
                                    <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-2xl">
                                        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                            <Target className="w-6 h-6 text-green-400" />
                                            Խաղի Կանոններ
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {[
                                                {
                                                    icon: '🎯',
                                                    title: 'Միավորների համակարգ',
                                                    points: [
                                                        'Կոշտ հարց՝ 400 միավոր',
                                                        'Բարդ հարց՝ 350 միավոր',
                                                        'Միջին հարց՝ 250-300 միավոր',
                                                        'Հեշտ հարց՝ 200 միավոր'
                                                    ]
                                                },
                                                {
                                                    icon: '⚡',
                                                    title: 'Բոնուսներ',
                                                    points: [
                                                        'Արագ պատասխան՝ +50% միավոր',
                                                        'Առաջին հուշում՝ -50 միավոր',
                                                        'Ճիշտ պատասխան շարքով՝ +100 միավոր',
                                                        'Թիմային հարված՝ +150 միավոր'
                                                    ]
                                                },
                                                {
                                                    icon: '🏆',
                                                    title: 'Հաղթողի որոշում',
                                                    points: [
                                                        'Ամենաբարձր միավոր',
                                                        'Ամենաարագ պատասխաններ',
                                                        'Ամենաքիչ հուշումներ',
                                                        'Թիմային համագործակցություն'
                                                    ]
                                                },
                                                {
                                                    icon: '🎪',
                                                    title: 'Խաղի առանձնահատկություններ',
                                                    points: [
                                                        '10 տարբեր հարցեր',
                                                        '6 կատեգորիա',
                                                        '4 մակարդակի բարդություն',
                                                        'Տեսա և աուդիո հարցեր'
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

                            {/* Start Game Button */}
                            <div className="text-center mt-12">
                                <Button
                                    onClick={startGame}
                                    disabled={teams.length < 2}
                                    className={`px-20 py-8 text-4xl font-black rounded-3xl transition-all duration-500 ${teams.length >= 2
                                        ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-500 hover:via-pink-500 hover:to-blue-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50 animate-pulse-slow'
                                        : 'bg-gray-700 cursor-not-allowed opacity-50'}`}
                                >
                                    {teams.length >= 2 ? (
                                        <>
                                            <Rocket className="w-10 h-10 mr-4 animate-bounce" />
                                            🚀 Սկսել խաղը
                                            <Sparkles className="w-10 h-10 ml-4 animate-spin" />
                                        </>
                                    ) : (
                                        '➕ Ավելացրեք 2 թիմ'
                                    )}
                                </Button>

                                {teams.length >= 2 && (
                                    <p className="text-white/70 mt-6 text-lg animate-pulse">
                                        Պատրաստ է խաղալ {teams.length} թիմերով և {config.timerDuration} վայրկյանանոց ժամանակաչափով
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ЭКРАН ВСТУПЛЕНИЯ */}
                {gamePhase === 'intro' && (
                    <div className="min-h-screen flex flex-col items-center justify-center space-y-12 px-4 animate-fade-in">
                        <div className="text-center space-y-8 max-w-4xl">
                            <div className="relative">
                                <h1 className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 animate-gradient-slow mb-6">
                                    ՊԱՏՐԱՍՏ
                                </h1>
                                <div className="absolute -top-8 -right-8 text-5xl animate-bounce">🎉</div>
                                <div className="absolute -bottom-8 -left-8 text-5xl animate-ping">✨</div>
                            </div>

                            <p className="text-4xl text-white/90 font-light">
                                <span className="text-yellow-300 font-bold">{teams.length} թիմ</span> պատրաստ են մրցել
                            </p>

                            <div className="flex flex-wrap justify-center gap-6 mt-8">
                                <div className="flex items-center gap-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-md px-8 py-4 rounded-2xl border border-white/20">
                                    <Timer className="w-6 h-6 text-purple-400" />
                                    <div>
                                        <div className="text-2xl font-bold text-white">{config.timerDuration} վ</div>
                                        <div className="text-white/70 text-sm">յուրաքանչյուր հարցի համար</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-md px-8 py-4 rounded-2xl border border-white/20">
                                    <Target className="w-6 h-6 text-blue-400" />
                                    <div>
                                        <div className="text-2xl font-bold text-white">{shuffledQuestions.length} հարց</div>
                                        <div className="text-white/70 text-sm">ընդհանուր առաջադրանք</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-md px-8 py-4 rounded-2xl border border-white/20">
                                    <Trophy className="w-6 h-6 text-green-400" />
                                    <div>
                                        <div className="text-2xl font-bold text-white">3000+ միավոր</div>
                                        <div className="text-white/70 text-sm">հաղթելու համար</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Teams Display */}
                        <div className="w-full max-w-6xl">
                            <h2 className="text-3xl font-bold text-white text-center mb-8">🎪 Մրցող Թիմերը</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {teams.map((team, index) => (
                                    <div
                                        key={team.id}
                                        className={`relative p-6 rounded-3xl bg-gradient-to-br ${team.color} transform hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-white/20`}
                                    >
                                        <div className="absolute -top-4 -right-4 text-4xl animate-bounce">
                                            {index === 0 ? '👑' : index === 1 ? '🥈' : index === 2 ? '🥉' : '⭐'}
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

                        {/* Start Button */}
                        <div className="text-center space-y-8">
                            <div className="flex items-center justify-center gap-6">
                                <div className="text-white/70 text-xl animate-pulse">
                                    Առաջին հարցը պատրաստ է
                                </div>
                            </div>

                            <Button
                                onClick={beginPlaying}
                                className="px-24 py-10 text-5xl font-black rounded-3xl bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 hover:from-green-500 hover:via-emerald-500 hover:to-green-500 hover:scale-110 transition-all duration-500 animate-bounce-slow shadow-2xl shadow-green-500/30"
                            >
                                <Lightning className="w-12 h-12 mr-6 animate-pulse" />
                                🚀 Սկսել
                                <Play className="w-12 h-12 ml-6" />
                            </Button>

                            <p className="text-white/50 text-lg">
                                Լավագույն թիմը կստանա հատուկ մրցանակ 🏆
                            </p>
                        </div>
                    </div>
                )}

                {/* ЭКРАН ИГРЫ */}
                {gamePhase === 'playing' && (
                    <div className="min-h-screen py-8 space-y-8 animate-fade-in">
                        {/* Game Header */}
                        <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-8">
                            {/* Teams Progress */}
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

                            {/* Timer & Controls */}
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
                                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 backdrop-blur-md border-0 hover:scale-110 transition-all"
                                        size="icon"
                                    >
                                        {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                                    </Button>

                                    <Button
                                        onClick={useHint}
                                        disabled={hintUsed || showAnswer || !config.enableHints}
                                        className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 backdrop-blur-md border-0 hover:scale-110 transition-all"
                                        size="icon"
                                    >
                                        <Zap className="w-6 h-6" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="relative">
                            <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 transition-all duration-500 ease-out"
                                    style={{ width: `${((currentQuestion + 1) / shuffledQuestions.length) * 100}%` }}
                                />
                            </div>
                            <div className="flex justify-between mt-2">
                                <span className="text-white/70">Հարց {currentQuestion + 1}</span>
                                <span className="text-white/70">Ընդհանուր {shuffledQuestions.length}</span>
                            </div>
                        </div>

                        {/* Main Game Area */}
                        <div className="space-y-10">
                            {/* Question Header */}
                            <div className="text-center space-y-6">
                                <div className="inline-flex items-center gap-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-lg px-8 py-4 rounded-full border border-white/20">
                                    <span className="text-3xl">
                                        {shuffledQuestions[currentQuestion].type === 'video' && '🎬'}
                                        {shuffledQuestions[currentQuestion].type === 'audio' && '🎵'}
                                        {shuffledQuestions[currentQuestion].type === 'quote' && '💬'}
                                        {shuffledQuestions[currentQuestion].type === 'scene' && '🎭'}
                                        {shuffledQuestions[currentQuestion].type === 'emoji' && '😊'}
                                    </span>
                                    <div className="text-left">
                                        <div className="text-2xl font-bold text-white">
                                            {shuffledQuestions[currentQuestion].title}
                                        </div>
                                        <div className="text-white/70">
                                            {shuffledQuestions[currentQuestion].difficulty === 'easy' && '⭐ Հեշտ'}
                                            {shuffledQuestions[currentQuestion].difficulty === 'medium' && '⭐⭐ Միջին'}
                                            {shuffledQuestions[currentQuestion].difficulty === 'hard' && '⭐⭐⭐ Բարդ'}
                                            {shuffledQuestions[currentQuestion].difficulty === 'expert' && '⭐⭐⭐⭐ Էքսպերտ'}
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
                                        <p className="text-xl text-blue-300 mt-4 animate-pulse bg-blue-500/20 px-6 py-3 rounded-xl">
                                            💡 Հուշում: {shuffledQuestions[currentQuestion].answer.split('(')[0]}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Media Display */}
                            <div className="max-w-5xl mx-auto">
                                {getMediaComponent(shuffledQuestions[currentQuestion])}
                            </div>

                            {/* Answers */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                                {answerOptions.map((answer, idx) => (
                                    <Button
                                        key={idx}
                                        onClick={() => handleAnswer(answer)}
                                        disabled={showAnswer}
                                        className={`group relative p-8 text-xl font-bold h-auto min-h-[100px] rounded-2xl transition-all duration-300 overflow-hidden ${showAnswer
                                            ? answer === shuffledQuestions[currentQuestion].answer
                                                ? 'bg-gradient-to-r from-green-500 to-emerald-600 border-4 border-green-400 text-white scale-105 shadow-2xl shadow-green-500/50'
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

                            {/* Answer Reveal */}
                            {showAnswer && (
                                <div className="max-w-5xl mx-auto space-y-8 text-center animate-in fade-in duration-500">
                                    <div className="relative bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-blue-500/30 backdrop-blur-xl p-8 rounded-3xl border-2 border-white/30 shadow-2xl overflow-hidden">
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
                                                    <div className="text-white/70 mb-1">Տարեթիվ</div>
                                                    <div className="text-xl text-white font-bold">{shuffledQuestions[currentQuestion].year}</div>
                                                </div>
                                                <div className="bg-black/30 p-4 rounded-xl">
                                                    <div className="text-white/70 mb-1">Կատեգորիա</div>
                                                    <div className="text-xl text-white font-bold">
                                                        {shuffledQuestions[currentQuestion].category === 'hollywood' && 'Հոլիվուդ'}
                                                        {shuffledQuestions[currentQuestion].category === 'soviet' && 'Սովետական'}
                                                        {shuffledQuestions[currentQuestion].category === 'animation' && 'Մուլտֆիլմ'}
                                                        {shuffledQuestions[currentQuestion].category === 'music' && 'Երաժշտություն'}
                                                        {shuffledQuestions[currentQuestion].category === 'comedy' && 'Կատակերգություն'}
                                                        {shuffledQuestions[currentQuestion].category === 'armenia' && 'Հայկական'}
                                                    </div>
                                                </div>
                                                <div className="bg-black/30 p-4 rounded-xl">
                                                    <div className="text-white/70 mb-1">Միավորներ</div>
                                                    <div className="text-2xl text-yellow-300 font-bold">{shuffledQuestions[currentQuestion].points}</div>
                                                </div>
                                            </div>

                                            <div className="bg-black/40 p-6 rounded-xl border border-white/20">
                                                <div className="text-xl text-white/90 italic">
                                                    {shuffledQuestions[currentQuestion].funFact}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={nextQuestion}
                                        className="px-16 py-8 text-3xl font-black rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 hover:scale-105 transition-transform group shadow-2xl shadow-blue-500/30"
                                    >
                                        {currentQuestion < shuffledQuestions.length - 1 ? (
                                            <>
                                                Հաջորդ հարցը
                                                <SkipForward className="w-8 h-8 ml-4 group-hover:translate-x-2 transition-transform" />
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

                {/* ЭКРАН РЕЗУЛЬТАТОВ */}
                {gamePhase === 'results' && (
                    <div className="min-h-screen flex flex-col items-center justify-center space-y-16 px-4 animate-fade-in">
                        {/* Winner Celebration */}
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
                                        👑
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* All Teams Results */}
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

                        {/* Statistics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl w-full">
                            {[
                                {
                                    label: 'Խաղացված հարցեր',
                                    value: currentQuestion + 1,
                                    icon: '❓',
                                    color: 'from-blue-500 to-cyan-500'
                                },
                                {
                                    label: 'Ընդհանուր միավոր',
                                    value: teams.reduce((sum, t) => sum + t.score, 0),
                                    icon: '⭐',
                                    color: 'from-yellow-500 to-orange-500'
                                },
                                {
                                    label: 'Միջին միավոր',
                                    value: Math.round(teams.reduce((sum, t) => sum + t.score, 0) / Math.max(teams.length, 1)),
                                    icon: '📊',
                                    color: 'from-green-500 to-emerald-500'
                                },
                                {
                                    label: 'Խաղի ժամանակ',
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

                        {/* Action Buttons */}
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
                                className="px-10 py-8 text-2xl font-black rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 hover:scale-105 transition-transform shadow-2xl shadow-green-500/30"
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
                                Նոր խաղ
                            </Button>

                            <Button
                                onClick={() => {
                                    const text = `🎬 Նորամյա Կինո-Քվիզ\n\n🏆 Մեր արդյունքները․\n${teams
                                        .sort((a, b) => b.score - a.score)
                                        .map((t, i) => `${i + 1}. ${t.name} - ${t.score} միավոր`)
                                        .join('\n')}\n\n✨ Խաղացեք այստեղ՝ ${window.location.origin}`;
                                    navigator.clipboard.writeText(text);
                                    alert('Արդյունքները պատճենվեցին! 📋');
                                }}
                                className="px-10 py-8 text-2xl font-black rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 hover:scale-105 transition-transform shadow-2xl shadow-purple-500/30"
                            >
                                <Heart className="w-8 h-8 mr-4" />
                                Կիսվել
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Global Sound Toggle */}
            <audio ref={audioRef} className="hidden" />

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

export default MovieQuizGame;