"use client"

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation'
import { Sparkles, Snowflake, Gift, Heart, Wine, Users, Award, ChevronDown, ChevronUp, Eye, EyeOff, X, UserPlus, Shuffle, Star, Timer, Play, Pause, RotateCcw, Music, Volume2, VolumeX, Trophy, Plus, Minus, Save, Trash2, Zap, Dices } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { games, type Game, type Participant } from './games-data';

export default function NewYearGames() {
  const router = useRouter();
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [printMode, setPrintMode] = useState(false);
  const [expandedGame, setExpandedGame] = useState<number | null>(null);
  const [printAllGames, setPrintAllGames] = useState(false);
  
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [currentGameForRoles, setCurrentGameForRoles] = useState<Game | null>(null);
  const [participantInputs, setParticipantInputs] = useState<string[]>(['', '', '', '', '', '']);
  const [assignedParticipants, setAssignedParticipants] = useState<Participant[]>([]);
  const [revealMode, setRevealMode] = useState(false);
  const [currentRevealIndex, setCurrentRevealIndex] = useState(0);
  const [isRevealing, setIsRevealing] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [showTimer, setShowTimer] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [selectedGameForTimer, setSelectedGameForTimer] = useState<Game | null>(null);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [savedParticipants, setSavedParticipants] = useState<string[]>([]);
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [teamScores, setTeamScores] = useState<{[key: string]: number}>({});
  const [showSavedList, setShowSavedList] = useState(false);
  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);
  const [showTeamGenerator, setShowTeamGenerator] = useState(false);
  const [generatedTeams, setGeneratedTeams] = useState<{name: string, members: string[], avatar: string}[]>([]);
  const [teamSize, setTeamSize] = useState(3);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [showAchievements, setShowAchievements] = useState(false);
  const [newAchievement, setNewAchievement] = useState<string | null>(null);
  
  // Новые состояния для улучшений
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSnowfall, setShowSnowfall] = useState(true);
  const [showRouletteWheel, setShowRouletteWheel] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedRouletteGame, setSelectedRouletteGame] = useState<Game | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const snowflakesRef = useRef<any[]>([]);

  // Аватары для команд
  const teamAvatars = [
    '❄️', '🎅', '🧝', '🦌', '🎁', '🍊', '⛄', '⭐',
    '🎄', '🎀', '🔔', '🍬', '🎉', '✨', '🌟', '💫',
    '🎊', '🎈', '🧊', '☃️', '🎶', '🍾', '🥂', '🎺'
  ];

  // Звуковые эффекты
  const playSound = (type: 'win' | 'click' | 'reveal' | 'timer' | 'achievement') => {
    if (!soundEnabled) return;
    
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch(type) {
      case 'win':
        oscillator.frequency.value = 523.25; // C5
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
        setTimeout(() => {
          const osc2 = audioContext.createOscillator();
          const gain2 = audioContext.createGain();
          osc2.connect(gain2);
          gain2.connect(audioContext.destination);
          osc2.frequency.value = 659.25; // E5
          gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
          gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
          osc2.start(audioContext.currentTime);
          osc2.stop(audioContext.currentTime + 0.5);
        }, 200);
        break;
      case 'click':
        oscillator.frequency.value = 800;
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
        break;
      case 'reveal':
        oscillator.frequency.value = 440;
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
        break;
      case 'timer':
        oscillator.frequency.value = 1000;
        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.05);
        break;
      case 'achievement':
        oscillator.frequency.value = 880;
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.8);
        break;
    }
  };

  // Конфетти эффект
  const triggerConfetti = () => {
    setShowConfetti(true);
    playSound('win');
    setTimeout(() => setShowConfetti(false), 5000);
  };

  // Снегопад эффект
  useEffect(() => {
    if (!showSnowfall || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Создаем снежинки
    const createSnowflakes = () => {
      snowflakesRef.current = [];
      for (let i = 0; i < 50; i++) {
        snowflakesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 3 + 1,
          speed: Math.random() * 1 + 0.5,
          wind: Math.random() * 0.5 - 0.25
        });
      }
    };

    createSnowflakes();

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.strokeStyle = 'rgba(200, 220, 255, 0.6)';

      snowflakesRef.current.forEach((flake) => {
        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        flake.y += flake.speed;
        flake.x += flake.wind;

        if (flake.y > canvas.height) {
          flake.y = -10;
          flake.x = Math.random() * canvas.width;
        }
        if (flake.x > canvas.width) flake.x = 0;
        if (flake.x < 0) flake.x = canvas.width;
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      createSnowflakes();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [showSnowfall]);

  // Рулетка для выбора игры
  const spinRouletteWheel = () => {
    setIsSpinning(true);
    playSound('click');
    
    const spinDuration = 3000;
    const randomIndex = Math.floor(Math.random() * games.length);
    
    setTimeout(() => {
      setSelectedRouletteGame(games[randomIndex]);
      setIsSpinning(false);
      triggerConfetti();
      playSound('achievement');
    }, spinDuration);
  };

  useEffect(() => {
    const saved = localStorage.getItem('savedParticipants');
    if (saved) {
      setSavedParticipants(JSON.parse(saved));
    }
    const savedScores = localStorage.getItem('teamScores');
    if (savedScores) {
      setTeamScores(JSON.parse(savedScores));
    }
    const savedAchievements = localStorage.getItem('achievements');
    if (savedAchievements) {
      setAchievements(JSON.parse(savedAchievements));
    }
    
    const audio = new Audio();
    audio.loop = true;
    audio.volume = 0.3;
    setAudioPlayer(audio);
    
    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  const handlePrint = (game: Game) => {
    setSelectedGame(game);
    setPrintMode(true);
    setTimeout(() => window.print(), 100);
  };

  const handlePrintAll = () => {
    setPrintAllGames(true);
    setTimeout(() => window.print(), 100);
  };

  const openParticipantsModal = (game: Game) => {
    setCurrentGameForRoles(game);
    setShowParticipantsModal(true);
    setParticipantInputs(['', '', '', '', '', '']);
    setAssignedParticipants([]);
    setRevealMode(false);
    setCurrentRevealIndex(0);
    setIsRevealing(false);
    playSound('click');
  };

  const updateParticipantInput = (index: number, value: string) => {
    const newInputs = [...participantInputs];
    newInputs[index] = value;
    setParticipantInputs(newInputs);
  };

  const addMoreInputs = () => {
    setParticipantInputs([...participantInputs, '', '']);
    playSound('click');
  };

  const assignRoles = () => {
    if (!currentGameForRoles) return;

    const participantNames = participantInputs
      .map(name => name.trim())
      .filter(name => name.length > 0);

    if (participantNames.length === 0) return;

    const shuffledRoles = [...currentGameForRoles.roles].sort(() => Math.random() - 0.5);
    
    const assigned: Participant[] = participantNames.map((name, index) => ({
      name,
      role: shuffledRoles[index % shuffledRoles.length]
    }));

    setAssignedParticipants(assigned);
    setRevealMode(true);
    setCurrentRevealIndex(0);
    setIsRevealing(false);
    playSound('win');
    
    unlockAchievement('first_game');
    if (participantNames.length >= 10) {
      unlockAchievement('entertainer');
    }
  };

  const handleRevealRole = () => {
    setIsRevealing(true);
    playSound('reveal');
  };

  const handleNextParticipant = () => {
    setIsRevealing(false);
    if (currentRevealIndex < assignedParticipants.length - 1) {
      setCurrentRevealIndex(currentRevealIndex + 1);
    }
    playSound('click');
  };

  const handleRestart = () => {
    setRevealMode(false);
    setCurrentRevealIndex(0);
    setIsRevealing(false);
    setParticipantInputs(['', '', '', '', '', '']);
    setAssignedParticipants([]);
    playSound('click');
  };

  const toggleFavorite = (gameId: number) => {
    setFavorites(prev => 
      prev.includes(gameId) 
        ? prev.filter(id => id !== gameId)
        : [...prev, gameId]
    );
    playSound('click');
  };

  const startTimer = (game: Game) => {
    const duration = parseInt(game.duration.match(/\d+/)?.[0] || '30');
    setTimerMinutes(duration);
    setTimerSeconds(0);
    setSelectedGameForTimer(game);
    setShowTimer(true);
    setIsTimerRunning(true);
    playSound('click');
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && (timerMinutes > 0 || timerSeconds > 0)) {
      interval = setInterval(() => {
        if (timerSeconds > 0) {
          setTimerSeconds(timerSeconds - 1);
          if (timerSeconds <= 10 && timerSeconds > 0) {
            playSound('timer');
          }
        } else if (timerMinutes > 0) {
          setTimerMinutes(timerMinutes - 1);
          setTimerSeconds(59);
        } else {
          setIsTimerRunning(false);
          triggerConfetti();
          alert('⏰ Время вышло! Игра завершена!');
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerMinutes, timerSeconds]);

  const newYearTracks = [
    { name: 'Jingle Bells', url: '/music/jingle-bells.mp3' },
    { name: 'Carol of the Bells', url: '/music/carol.mp3' },
    { name: 'Winter Wonderland', url: '/music/winter.mp3' }
  ];

  const toggleMusic = async () => {
    if (!audioPlayer) return;
    
    if (musicPlaying) {
      audioPlayer.pause();
      setMusicPlaying(false);
    } else {
      try {
        audioPlayer.src = newYearTracks[currentTrack].url;
        await audioPlayer.load();
        await audioPlayer.play();
        setMusicPlaying(true);
      } catch (err) {
        console.error('Ошибка воспроизведения:', err);
        setMusicPlaying(false);
      }
    }
    playSound('click');
  };

  const changeTrack = async (index: number) => {
    if (!audioPlayer) return;
    
    const wasPlaying = musicPlaying;
    audioPlayer.pause();
    setCurrentTrack(index);
    
    try {
      audioPlayer.src = newYearTracks[index].url;
      audioPlayer.load();
      
      if (wasPlaying) {
        await audioPlayer.play();
        setMusicPlaying(true);
      }
    } catch (err) {
      console.error('Ошибка смены трека:', err);
      setMusicPlaying(false);
    }
    playSound('click');
  };

  const saveParticipantsList = () => {
    const names = participantInputs.filter(name => name.trim().length > 0);
    if (names.length > 0) {
      const uniqueNames = Array.from(new Set([...savedParticipants, ...names]));
      setSavedParticipants(uniqueNames);
      localStorage.setItem('savedParticipants', JSON.stringify(uniqueNames));
      playSound('achievement');
      alert('✅ Список участников сохранен!');
    }
  };

  const loadSavedParticipants = () => {
    if (savedParticipants.length > 0) {
      const newInputs = [...savedParticipants];
      while (newInputs.length < 6) newInputs.push('');
      setParticipantInputs(newInputs);
      setShowSavedList(false);
      playSound('click');
    }
  };

  const clearSavedParticipants = () => {
    if (confirm('Удалить все сохраненные имена?')) {
      setSavedParticipants([]);
      localStorage.removeItem('savedParticipants');
      playSound('click');
    }
  };

  const updateTeamScore = (teamName: string, delta: number) => {
    const newScores = {
      ...teamScores,
      [teamName]: (teamScores[teamName] || 0) + delta
    };
    setTeamScores(newScores);
    localStorage.setItem('teamScores', JSON.stringify(newScores));
    
    if (delta > 0) {
      playSound('win');
    } else {
      playSound('click');
    }
    
    const totalScore = Object.values(newScores).reduce((sum, score) => sum + score, 0);
    if (totalScore >= 100) {
      unlockAchievement('strategist');
    }
    if (Object.keys(newScores).length >= 5) {
      unlockAchievement('party_king');
    }
  };

  const resetScores = () => {
    if (confirm('Сбросить все очки?')) {
      setTeamScores({});
      localStorage.removeItem('teamScores');
      playSound('click');
    }
  };

  const getTeamsList = () => {
    return Array.from(new Set(assignedParticipants.map(p => p.name)));
  };

  const allAchievements = [
    { id: 'first_game', name: 'Սկսնակ', description: 'Խաղացել է առաջին խաղը', icon: '🎮', color: 'bg-blue-100 border-blue-300 text-blue-700' },
    { id: 'party_king', name: 'Երեկոյի թագավոր', description: 'Հաղթել է 5-ից ավել խաղեր', icon: '👑', color: 'bg-yellow-100 border-yellow-300 text-yellow-700' },
    { id: 'team_player', name: 'Թիմային խաղացող', description: 'Օգնել է թիմին հաղթել', icon: '🤝', color: 'bg-green-100 border-green-300 text-green-700' },
    { id: 'speedster', name: 'Արագ վազող', description: 'Խաղն ավարտվել է ռեկորդային ժամանակում', icon: '⚡', color: 'bg-purple-100 border-purple-300 text-purple-700' },
    { id: 'entertainer', name: 'Երեկոյի հոգին', description: 'Մասնակցել է բոլոր խաղերին', icon: '🎭', color: 'bg-pink-100 border-pink-300 text-pink-700' },
    { id: 'strategist', name: 'Ստրատեգ', description: 'Հավաքել է 100+ միավոր', icon: '🧠', color: 'bg-indigo-100 border-indigo-300 text-indigo-700' },
    { id: 'collector', name: 'Հավաքորդ', description: 'Վաստակել է 10+ նվաճում', icon: '⭐', color: 'bg-amber-100 border-amber-300 text-amber-700' },
    { id: 'perfectionist', name: 'Պերֆեկցիոնիստ', description: 'Խաղացել է դերը կատարյալ', icon: '💎', color: 'bg-cyan-100 border-cyan-300 text-cyan-700' }
  ];

  const unlockAchievement = (achievementId: string) => {
    if (!achievements.includes(achievementId)) {
      const newAchievements = [...achievements, achievementId];
      setAchievements(newAchievements);
      localStorage.setItem('achievements', JSON.stringify(newAchievements));
      
      const achievement = allAchievements.find(a => a.id === achievementId);
      if (achievement) {
        setNewAchievement(achievementId);
        triggerConfetti();
        playSound('achievement');
        setTimeout(() => setNewAchievement(null), 4000);
      }
    }
  };

  const teamNames = [
    'Ձյան փաթիլներ', 'Ձմեռ պապի թիմ', 'Էլֆեր', 'Եղնիկներ',
    'Նվերներ', 'Մանդարիններ', 'Ձնե մարդիկ', 'Ասղեր',
    'Եղևնիներ', 'Գարլանդներ', 'Զանգեր', 'Կոնֆետներ'
  ];

  const generateTeams = () => {
    const participants = participantInputs.filter(name => name.trim().length > 0);
    
    if (participants.length < 2) {
      alert('Ավելացրեք առնվազն 2 մասնակից!');
      return;
    }

    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    const teams: {name: string, members: string[], avatar: string}[] = [];
    const numTeams = Math.ceil(shuffled.length / teamSize);
    
    for (let i = 0; i < numTeams; i++) {
      const teamMembers = shuffled.slice(i * teamSize, (i + 1) * teamSize);
      teams.push({
        name: teamNames[i % teamNames.length],
        members: teamMembers,
        avatar: teamAvatars[i % teamAvatars.length]
      });
    }
    
    setGeneratedTeams(teams);
    unlockAchievement('team_player');
    playSound('win');
    triggerConfetti();
  };

  const applyTeamsToGame = () => {
    if (generatedTeams.length === 0) return;
    
    const allMembers = generatedTeams.flatMap(team => team.members);
    const newInputs = [...allMembers];
    while (newInputs.length < 6) newInputs.push('');
    
    setParticipantInputs(newInputs);
    setShowTeamGenerator(false);
    playSound('achievement');
    alert('✅ Թիմերը կիրառվել են։ Հիմա նշանակեք դերերը։');
  };

  // Конфетти компонент
  const ConfettiCanvas = () => {
    const confettiRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
      if (!showConfetti || !confettiRef.current) return;

      const canvas = confettiRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const particles: any[] = [];
      const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];

      for (let i = 0; i < 150; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height - canvas.height,
          r: Math.random() * 6 + 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          vx: Math.random() * 4 - 2,
          vy: Math.random() * 5 + 2,
          rotation: Math.random() * 360,
          rotationSpeed: Math.random() * 10 - 5
        });
      }

      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach((p, index) => {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r);
          ctx.restore();

          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.2;
          p.rotation += p.rotationSpeed;

          if (p.y > canvas.height) {
            particles.splice(index, 1);
          }
        });

        if (particles.length > 0) {
          requestAnimationFrame(animate);
        }
      };

      animate();
    }, [showConfetti]);

    return showConfetti ? (
      <canvas
        ref={confettiRef}
        className="fixed inset-0 pointer-events-none z-50"
      />
    ) : null;
  };

  // Рулетка компонент
  const RouletteWheel = () => (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl shadow-2xl max-w-4xl w-full p-8 relative">
        <button
          onClick={() => {
            setShowRouletteWheel(false);
            playSound('click');
          }}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={32} />
        </button>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Dices className="text-purple-600 animate-bounce" size={56} />
          </div>
          <h2 className="text-4xl font-bold text-slate-800 mb-2">🎡 Բախտի անիվ</h2>
          <p className="text-lg text-slate-600">Թող ճակատագիրը ընտրի խաղը ձեզ համար!</p>
        </div>

        {!selectedRouletteGame ? (
          <div className="text-center">
            <div className={`mx-auto w-80 h-80 rounded-full border-8 border-indigo-500 bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 mb-8 flex items-center justify-center relative overflow-hidden shadow-2xl ${
              isSpinning ? 'animate-spin' : ''
            }`} style={{ animationDuration: '3s' }}>
              {!isSpinning && (
                <div className="text-white text-6xl font-bold">?</div>
              )}
              {isSpinning && (
                <div className="absolute inset-0 flex items-center justify-center text-white text-2xl font-bold animate-pulse">
                  Պտտվում է...
                </div>
              )}
            </div>

            <button
              onClick={spinRouletteWheel}
              disabled={isSpinning}
              className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-12 py-6 rounded-2xl font-bold text-2xl hover:from-purple-600 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
            >
              <Zap size={32} className="mr-3" />
              {isSpinning ? 'Պտտվում է...' : 'ՊՏԵՔ ԱՆԻՎԸ!'}
            </button>
          </div>
        ) : (
          <div className="text-center animate-in fade-in duration-500">
            <div className="bg-gradient-to-r from-amber-100 to-yellow-100 rounded-2xl p-8 mb-6 border-4 border-amber-400">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-3xl font-bold text-slate-800 mb-2">Խաղն ընտրված է:</h3>
              <h2 className="text-5xl font-bold text-indigo-700 mb-4">{selectedRouletteGame.name}</h2>
              <p className="text-xl text-slate-700">{selectedRouletteGame.description}</p>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  openParticipantsModal(selectedRouletteGame);
                  setShowRouletteWheel(false);
                }}
                className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg flex items-center"
              >
                <UserPlus size={24} className="mr-2" />
                Սկսել խաղը
              </button>
              <button
                onClick={() => {
                  setSelectedRouletteGame(null);
                  setIsSpinning(false);
                  playSound('click');
                }}
                className="bg-gradient-to-r from-orange-500 to-amber-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-orange-600 hover:to-amber-700 transition-all shadow-lg flex items-center"
              >
                <RotateCcw size={24} className="mr-2" />
                Պտտել նորից
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (printAllGames) {
    return (
      <div className="print-page bg-white p-8">
        <style>{`
          @media print {
            body { margin: 0; padding: 10px; background: white; }
            .no-print { display: none !important; }
            .print-page { display: block !important; }
            .game-summary-card { page-break-inside: avoid; }
          }
          @page { size: A4; margin: 10mm; }
        `}</style>
        
        <div className="text-center mb-8 pb-4 border-b-2 border-slate-300">
          <div className="flex items-center justify-center mb-3">
            <Snowflake className="text-sky-500" size={40} />
            <h1 className="text-[60px] font-bold text-slate-800 mx-4">Ամանորյա Խաղերի Հավաքածու</h1>
            <Sparkles className="text-amber-500" size={40} />
          </div>
          <p className="text-xl text-slate-600 font-semibold">10 Շքեղ Դերային Խաղ</p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {games.map((game) => (
            <div
              key={game.id}
              className="game-summary-card border-2 border-slate-200 rounded-xl p-6 bg-gradient-to-br from-slate-50 to-blue-50"
              style={{ minHeight: '320px' }}
            >
              <div className="flex items-center mb-4 pb-3 border-b border-slate-200">
                <div className="bg-gradient-to-br from-sky-500 to-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center text-2xl font-bold mr-4 shadow-md">
                  {game.id}
                </div>
                <h2 className="text-2xl font-bold text-slate-800">{game.name}</h2>
              </div>

              <p className="text-sm text-slate-700 mb-3 leading-relaxed">{game.description}</p>

              <div className="space-y-2 mb-3">
                <div className="bg-blue-50 p-2 rounded-lg border border-blue-200">
                  <p className="text-xs text-slate-700"><strong className="text-blue-600">⏱️</strong> {game.duration} | <strong className="text-blue-600">👥</strong> {game.players}</p>
                </div>
                
                <div className="bg-amber-50 p-2 rounded-lg border border-amber-200">
                  <p className="text-xs text-slate-700"><strong className="text-amber-600">🎯</strong> {game.materials}</p>
                </div>

                <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                  <p className="text-xs text-slate-700"><strong className="text-emerald-600">🍽️</strong> {game.food}</p>
                </div>
              </div>

              <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                <h3 className="font-bold text-indigo-700 mb-2 text-sm flex items-center">
                  <Users className="mr-1" size={16} />
                  Դերեր ({game.roles.length}):
                </h3>
                <div className="grid grid-cols-2 gap-1">
                  {game.roles.map((role, idx) => (
                    <div
                      key={idx}
                      className="bg-white px-2 py-1 rounded text-xs font-medium text-slate-700 border border-slate-200"
                    >
                      {role.name}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center mt-3 space-x-2">
                <Gift className="text-emerald-500" size={18} />
                <Heart className="text-rose-500" size={18} />
                <Wine className="text-purple-500" size={18} />
                <Sparkles className="text-amber-500" size={18} />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center border-t-2 border-slate-300 pt-6">
          <div className="flex items-center justify-center space-x-4 text-2xl mb-3">
            <Snowflake className="text-sky-500" />
            <Heart className="text-rose-500" />
            <Wine className="text-purple-500" />
            <Gift className="text-emerald-500" />
            <Sparkles className="text-amber-500" />
          </div>
          <p className="text-xl text-slate-700 font-bold">
            Շնորհավոր Նոր Տարի և Սուրբ Ծնունդ! 🎄🎉
          </p>
        </div>

        <button
          onClick={() => setPrintAllGames(false)}
          className="no-print fixed top-4 right-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white px-8 py-4 rounded-xl hover:from-sky-600 hover:to-blue-700 shadow-xl font-bold text-lg"
        >
          ✕ Փակել
        </button>
      </div>
    );
  }

  if (printMode && selectedGame) {
    return (
      <div className="print-page bg-gradient-to-br from-slate-50 to-blue-50 p-8">
        <style>{`
          @media print {
            body { margin: 0; padding: 15px; background: white; }
            .no-print { display: none !important; }
            .print-page { display: block !important; }
          }
          @page { size: A4; margin: 8mm; }
          .card-shadow { 
            box-shadow: 0 4px 12px rgba(71, 85, 105, 0.2);
          }
        `}</style>
        
        <div className="text-center mb-8 py-6 border-b-2 border-slate-300">
          <div className="flex items-center justify-center mb-4">
            <Snowflake className="text-sky-500" size={36} />
            <h1 className="text-5xl font-bold text-slate-800 mx-4 tracking-wide">{selectedGame.name}</h1>
            <Sparkles className="text-amber-500" size={36} />
          </div>
          <p className="text-xl text-slate-700 mb-3 font-semibold">{selectedGame.description}</p>
          <p className="text-base text-slate-600 leading-relaxed mb-4 max-w-4xl mx-auto">{selectedGame.fullDescription}</p>
          
          <div className="grid grid-cols-2 gap-4 max-w-5xl mx-auto mt-6">
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-xl border border-indigo-200">
              <p className="text-sm font-bold text-indigo-700">⏱️ Տևողություն: {selectedGame.duration}</p>
            </div>
            <div className="bg-gradient-to-r from-sky-50 to-cyan-50 p-4 rounded-xl border border-sky-200">
              <p className="text-sm font-bold text-sky-700">👥 Խաղացողներ: {selectedGame.players}</p>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border border-orange-200 mt-4 max-w-5xl mx-auto">
            <p className="text-sm font-bold text-orange-700">🎯 Անհրաժեշտ նյութեր: {selectedGame.materials}</p>
          </div>
          
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-xl border border-emerald-200 mt-4 max-w-5xl mx-auto">
            <p className="text-sm font-bold text-emerald-700">{selectedGame.food}</p>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-4 rounded-xl border border-amber-200 mt-4 max-w-5xl mx-auto">
            <p className="text-sm font-bold text-amber-700">{selectedGame.tips}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {selectedGame.roles.map((role, idx) => (
            <div
              key={idx}
              className="border-2 border-slate-300 rounded-2xl p-6 bg-gradient-to-br from-white to-blue-50 card-shadow"
              style={{
                pageBreakInside: 'avoid',
                minHeight: '280px'
              }}
            >
              <div className="flex items-center justify-center mb-4 pb-3 border-b border-slate-200">
                <Snowflake className="text-sky-500" size={28} />
                <h3 className="text-2xl font-bold text-slate-800 text-center mx-3">{role.name}</h3>
                <Sparkles className="text-amber-500" size={28} />
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-slate-700 leading-relaxed">{role.task}</p>
              </div>
              
              <div className="bg-indigo-50 bg-opacity-80 p-3 rounded-lg border border-dashed border-indigo-300 mt-4">
                <p className="text-xs text-indigo-800 font-medium">💭 Հուշումներ: {role.hints}</p>
              </div>
              
              <div className="flex justify-center mt-4 space-x-3">
                <Gift className="text-emerald-600" size={20} />
                <Heart className="text-rose-600" size={20} />
                <Wine className="text-purple-600" size={20} />
                <Sparkles className="text-amber-500" size={20} />
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            setPrintMode(false);
            setSelectedGame(null);
          }}
          className="no-print fixed top-4 right-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white px-8 py-4 rounded-xl hover:from-sky-600 hover:to-blue-700 shadow-xl font-bold text-lg"
        >
          ✕ Փակել
        </button>
      </div>
    );
  }

  if (showParticipantsModal && currentGameForRoles) {
    if (revealMode && assignedParticipants.length > 0) {
      const currentParticipant = assignedParticipants[currentRevealIndex];
      
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl shadow-2xl max-w-4xl w-full p-8 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowParticipantsModal(false);
                playSound('click');
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={32} />
            </button>

            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-slate-800 mb-2">{currentGameForRoles.name}</h2>
              <p className="text-lg text-slate-600">Մասնակից {currentRevealIndex + 1}-ը {assignedParticipants.length}-ից</p>
            </div>

            {!isRevealing ? (
              <div className="text-center py-12">
                <div className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-2xl p-12 mb-8 shadow-xl">
                  <EyeOff size={64} className="mx-auto mb-6" />
                  <h3 className="text-5xl font-bold mb-4">{currentParticipant.name}</h3>
                  <p className="text-2xl mb-8">Պատրա՞ստ եք իմանալ ձեր դերը:</p>
                  <p className="text-xl opacity-90">⚠️ Մնացած մասնակիցները պետք է հեռու նայեն!</p>
                </div>

                <button
                  onClick={handleRevealRole}
                  className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-12 py-6 rounded-xl font-bold text-2xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg flex items-center justify-center mx-auto"
                >
                  <Eye size={32} className="mr-3" />
                  Բացել իմ դերը
                </button>
              </div>
            ) : (
              <div className="py-8">
                <div className="border-2 border-slate-300 rounded-2xl p-8 bg-gradient-to-br from-white to-blue-50 shadow-xl mb-8">
                  <div className="flex items-center justify-center mb-6 pb-4 border-b border-slate-200">
                    <Snowflake className="text-sky-500" size={36} />
                    <h3 className="text-4xl font-bold text-slate-800 text-center mx-4">
                      {currentParticipant.role?.name}
                    </h3>
                    <Sparkles className="text-amber-500" size={36} />
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="text-xl font-bold text-indigo-700 mb-3">📋 Ձեր առաջադրանքը:</h4>
                    <p className="text-lg text-slate-700 leading-relaxed">{currentParticipant.role?.task}</p>
                  </div>
                  
                  <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <h4 className="text-lg font-bold text-indigo-800 mb-2">💭 Հուշումներ:</h4>
                    <p className="text-base text-indigo-700">{currentParticipant.role?.hints}</p>
                  </div>
                </div>

                <div className="flex justify-center space-x-4">
                  {currentRevealIndex < assignedParticipants.length - 1 ? (
                    <button
                      onClick={handleNextParticipant}
                      className="bg-gradient-to-r from-sky-500 to-blue-600 text-white px-10 py-5 rounded-xl font-bold text-xl hover:from-sky-600 hover:to-blue-700 transition-all shadow-lg flex items-center"
                    >
                      Հաջորդ մասնակիցը
                      <ChevronDown size={28} className="ml-3" />
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <button
                        onClick={() => {
                          setShowParticipantsModal(false);
                          triggerConfetti();
                        }}
                        className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-10 py-5 rounded-xl font-bold text-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg flex items-center mx-auto"
                      >
                        <Gift size={28} className="mr-3" />
                        Սկսել խաղը
                      </button>
                      <button
                        onClick={handleRestart}
                        className="bg-gradient-to-r from-orange-500 to-amber-600 text-white px-8 py-3 rounded-xl font-bold text-lg hover:from-orange-600 hover:to-amber-700 transition-all shadow-lg flex items-center mx-auto"
                      >
                        <Shuffle size={24} className="mr-2" />
                        Վերաբաշխել դերերը
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    const filledParticipants = participantInputs.filter(name => name.trim().length > 0).length;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl shadow-2xl max-w-3xl w-full p-8 relative max-h-[90vh] overflow-y-auto">
          <button
            onClick={() => {
              setShowParticipantsModal(false);
              playSound('click');
            }}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={32} />
          </button>

          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-4">
              <UserPlus className="text-indigo-600" size={48} />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">{currentGameForRoles.name}</h2>
            <p className="text-lg text-slate-600">Ավելացրեք մասնակիցներին</p>
            <p className="text-sm text-indigo-600 mt-2">
              Հասանելի դերեր՝ {currentGameForRoles.roles.length} | Ավելացված՝ {filledParticipants}
            </p>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-lg font-bold text-slate-700">
                Մուտքագրեք մասնակիցների անունները:
              </label>
              {savedParticipants.length > 0 && (
                <button
                  onClick={() => {
                    setShowSavedList(!showSavedList);
                    playSound('click');
                  }}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center"
                >
                  <Users size={16} className="mr-1" />
                  Բեռնումը պահպանվել է ({savedParticipants.length})
                </button>
              )}
            </div>

            {showSavedList && savedParticipants.length > 0 && (
              <div className="mb-4 bg-indigo-50 rounded-xl p-4 border border-indigo-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-indigo-800">Պահպանված մասնակիցներ:</span>
                  <button
                    onClick={clearSavedParticipants}
                    className="text-xs text-rose-600 hover:text-rose-700 flex items-center"
                  >
                    <Trash2 size={14} className="mr-1" />
                    Մաքրել
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {savedParticipants.map((name, idx) => (
                    <span key={idx} className="bg-white px-3 py-1 rounded-full text-sm text-slate-700 border border-indigo-200">
                      {name}
                    </span>
                  ))}
                </div>
                <button
                  onClick={loadSavedParticipants}
                  className="w-full bg-indigo-500 text-white py-2 rounded-lg font-bold hover:bg-indigo-600 transition-all"
                >
                  Բեռնել այս մասնակիցներին
                </button>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {participantInputs.map((value, index) => (
                <div key={index} className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600 font-bold text-lg">
                    {index + 1}.
                  </div>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => updateParticipantInput(index, e.target.value)}
                    placeholder={`Մասնակից ${index + 1}`}
                    className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-400 text-lg"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={addMoreInputs}
                className="flex-1 bg-gradient-to-r from-sky-400 to-blue-500 text-white py-3 rounded-xl font-bold hover:from-sky-500 hover:to-blue-600 transition-all flex items-center justify-center"
              >
                <UserPlus size={20} className="mr-2" />
                Ավելացնել ևս 2 մասնակից
              </button>
              <button
                onClick={saveParticipantsList}
                className="flex-1 bg-gradient-to-r from-emerald-400 to-green-500 text-white py-3 rounded-xl font-bold hover:from-emerald-500 hover:to-green-600 transition-all flex items-center justify-center"
              >
                <Save size={20} className="mr-2" />
                Պահպանել ցուցակը
              </button>
            </div>

            <button
              onClick={() => {
                setShowParticipantsModal(false);
                setShowTeamGenerator(true);
              }}
              className="w-full mt-3 bg-gradient-to-r from-purple-400 to-indigo-500 text-white py-3 rounded-xl font-bold hover:from-purple-500 hover:to-indigo-600 transition-all flex items-center justify-center"
            >
              <Shuffle size={20} className="mr-2" />
              🎲 Գեներացնել թիմեր
            </button>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={() => {
                setShowParticipantsModal(false);
                playSound('click');
              }}
              className="bg-slate-200 text-slate-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-300 transition-all"
            >
              Չեղարկել
            </button>
            <button
              onClick={assignRoles}
              disabled={filledParticipants === 0}
              className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-indigo-600 hover:to-blue-700 transition-all shadow-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Shuffle size={24} className="mr-3" />
              Բաշխել դերերը ({filledParticipants})
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8 relative overflow-hidden">
      {/* Снегопад */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-10"
        style={{ display: showSnowfall ? 'block' : 'none' }}
      />

      {/* Конфетти */}
      <ConfettiCanvas />

      {/* Рулетка */}
      {showRouletteWheel && <RouletteWheel />}

      <div className="relative max-w-7xl mx-auto z-20">

        {/* Модальное окно генератора команд */}
        {showTeamGenerator && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl shadow-2xl max-w-2xl w-full p-8 relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => {
                  setShowTeamGenerator(false);
                  playSound('click');
                }}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={32} />
              </button>

              <div className="text-center mb-6">
                <div className="flex items-center justify-center mb-4">
                  <Shuffle className="text-purple-600" size={48} />
                </div>
                <h2 className="text-3xl font-bold text-slate-800 mb-2">🎲 Թիմերի գեներատոր</h2>
                <p className="text-lg text-slate-600">Ստեղծեք պատահական թիմեր մասնակիցներից</p>
              </div>

              <div className="mb-6">
                <label className="block text-lg font-bold text-slate-700 mb-3">
                  Թիմի չափ (մարդիկ թիմում):
                </label>
                <div className="flex items-center gap-4 mb-4 justify-center">
                  <button
                    onClick={() => {
                      setTeamSize(Math.max(2, teamSize - 1));
                      playSound('click');
                    }}
                    className="bg-rose-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-rose-600 transition-all"
                  >
                    <Minus size={20} />
                  </button>
                  <span className="text-4xl font-bold text-indigo-600 min-w-[60px] text-center">{teamSize}</span>
                  <button
                    onClick={() => {
                      setTeamSize(teamSize + 1);
                      playSound('click');
                    }}
                    className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-emerald-600 transition-all"
                  >
                    <Plus size={20} />
                  </button>
                </div>

                <button
                  onClick={generateTeams}
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-4 rounded-xl font-bold hover:from-purple-600 hover:to-indigo-700 transition-all flex items-center justify-center text-lg"
                >
                  <Shuffle size={24} className="mr-3" />
                  Գեներացնել թիմեր
                </button>
              </div>
              {generatedTeams.length > 0 && (
                <div className="space-y-4 mb-6">
                  <h3 className="text-xl font-bold text-slate-800 text-center mb-4">
                    🎉 Ձեր թիմերը պատրաստ են!
                  </h3>
                  {generatedTeams.map((team, idx) => (
                    <div key={idx} className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border-2 border-indigo-200">
                      <h4 className="text-lg font-bold text-indigo-700 mb-2">{team.name}</h4>
                      <div className="flex flex-wrap gap-2">
                        {team.members.map((member, mIdx) => (
                          <span key={mIdx} className="bg-white px-3 py-1 rounded-full text-sm text-slate-700 border border-indigo-200">
                            {member}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={applyTeamsToGame}
                    className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-4 rounded-xl font-bold hover:from-emerald-600 hover:to-green-700 transition-all flex items-center justify-center text-lg"
                  >
                    <UserPlus size={24} className="mr-3" />
                    Կիրառել թիմերը խաղում
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Модальное окно достижений */}
        {showAchievements && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl shadow-2xl max-w-3xl w-full p-8 relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setShowAchievements(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={32} />
              </button>

              <div className="text-center mb-6">
                <div className="flex items-center justify-center mb-4">
                  <Trophy className="text-amber-500" size={48} />
                </div>
                <h2 className="text-3xl font-bold text-slate-800 mb-2">🏅 Ձեր նվաճումները</h2>
                <p className="text-lg text-slate-600">
                  Ապաբլոկավորվել է {achievements.length} / {allAchievements.length}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allAchievements.map((achievement) => {
                  const isUnlocked = achievements.includes(achievement.id);
                  return (
                    <div
                      key={achievement.id}
                      className={`rounded-xl p-6 border-2 transition-all ${
                        isUnlocked
                          ? achievement.color + ' shadow-lg'
                          : 'bg-slate-100 border-slate-300 text-slate-400 opacity-50'
                      }`}
                    >
                      <div className="text-5xl mb-3 text-center">{achievement.icon}</div>
                      <h3 className="text-xl font-bold text-center mb-2">{achievement.name}</h3>
                      <p className="text-sm text-center">{achievement.description}</p>
                      {isUnlocked && (
                        <div className="text-center mt-3">
                          <span className="inline-block bg-white bg-opacity-70 px-3 py-1 rounded-full text-xs font-bold">
                            ✓ Ապաբլոկավորված
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {achievements.length === allAchievements.length && (
                <div className="mt-6 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-xl p-6 border-2 border-amber-400 text-center">
                  <div className="text-6xl mb-3">🎉</div>
                  <h3 className="text-2xl font-bold text-amber-800 mb-2">Շնորհավորում ենք!</h3>
                  <p className="text-amber-700">Դուք բացել եք բոլոր նվաճումները! 🏆</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Уведомление о новом достижении */}
        {newAchievement && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
            <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 rounded-2xl p-6 shadow-2xl border-4 border-yellow-500">
              {(() => {
                const achievement = allAchievements.find(a => a.id === newAchievement);
                return achievement ? (
                  <>
                    <div className="text-center">
                      <div className="text-6xl mb-2">{achievement.icon}</div>
                      <div className="text-white font-bold text-2xl mb-1">🎉 Նվաճումը սպաբլոկավորված է!</div>
                      <div className="text-yellow-900 font-bold text-xl">{achievement.name}</div>
                      <div className="text-yellow-800 text-sm">{achievement.description}</div>
                    </div>
                  </>
                ) : null;
              })()}
            </div>
          </div>
        )}

        {/* Таймер */}
        {showTimer && selectedGameForTimer && (
          <div className="fixed top-20 right-8 bg-white rounded-2xl shadow-2xl p-6 border-2 border-indigo-300 z-40 min-w-[280px]">
            <div className="text-center">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-800">{selectedGameForTimer.name}</h3>
                <button
                  onClick={() => setShowTimer(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="bg-gradient-to-br from-indigo-100 to-blue-100 rounded-xl p-6 mb-4">
                <div className="text-6xl font-bold text-indigo-700 mb-2">
                  {String(timerMinutes).padStart(2, '0')}:{String(timerSeconds).padStart(2, '0')}
                </div>
                <div className="text-sm text-indigo-600">
                  {isTimerRunning ? 'Խաղը մեկնարկել է...' : 'Դադար'}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 text-white py-2 rounded-lg font-bold hover:from-emerald-600 hover:to-green-700 transition-all flex items-center justify-center"
                >
                  {isTimerRunning ? <Pause size={20} className="mr-1" /> : <Play size={20} className="mr-1" />}
                </button>
                <button
                  onClick={() => startTimer(selectedGameForTimer)}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-amber-600 text-white py-2 rounded-lg font-bold hover:from-orange-600 hover:to-amber-700 transition-all flex items-center justify-center"
                >
                  <RotateCcw size={20} className="mr-1" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Музыкальный плеер */}
        <div className="fixed bottom-8 right-8 bg-white rounded-2xl shadow-2xl p-4 border-2 border-purple-300 z-40 min-w-[300px]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Music className="text-purple-600 mr-2" size={24} />
              <span className="font-bold text-slate-800">Ամանորյա երաժշտություն</span>
            </div>
            <button
              onClick={toggleMusic}
              className={`p-2 rounded-lg transition-all ${
                musicPlaying 
                  ? 'bg-purple-500 text-white hover:bg-purple-600' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {musicPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
          </div>
          
          {musicPlaying && (
            <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
              <div className="text-sm text-purple-700 font-medium mb-2">
                🎵 {newYearTracks[currentTrack].name}
              </div>
              <div className="flex gap-2 mb-2">
                {newYearTracks.map((track, idx) => (
                  <button
                    key={idx}
                    onClick={() => changeTrack(idx)}
                    className={`flex-1 py-1 rounded text-xs font-bold transition-all ${
                      currentTrack === idx
                        ? 'bg-purple-500 text-white'
                        : 'bg-white text-purple-600 hover:bg-purple-100'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
              <div className="text-xs text-purple-600 text-center">
                🔊 Ձայն: 50%
              </div>
            </div>
          )}
        </div>

        {/* Таблица очков */}
        {showScoreboard && (
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-6 border-2 border-amber-300 z-50 min-w-[400px] max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Trophy className="text-amber-500 mr-2" size={28} />
                <h3 className="text-2xl font-bold text-slate-800">Միավորների աղյուսակ</h3>
              </div>
              <button
                onClick={() => setShowScoreboard(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-3 mb-4">
              {getTeamsList().map((teamName) => (
                <div key={teamName} className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-4 border border-amber-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-800">{teamName}</span>
                    <span className="text-3xl font-bold text-amber-600">
                      {teamScores[teamName] || 0}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateTeamScore(teamName, 1)}
                      className="flex-1 bg-emerald-500 text-white py-2 rounded-lg font-bold hover:bg-emerald-600 transition-all flex items-center justify-center"
                    >
                      <Plus size={18} className="mr-1" />
                      +1
                    </button>
                    <button
                      onClick={() => updateTeamScore(teamName, 5)}
                      className="flex-1 bg-green-500 text-white py-2 rounded-lg font-bold hover:bg-green-600 transition-all flex items-center justify-center"
                    >
                      <Plus size={18} className="mr-1" />
                      +5
                    </button>
                    <button
                      onClick={() => updateTeamScore(teamName, -1)}
                      className="flex-1 bg-rose-500 text-white py-2 rounded-lg font-bold hover:bg-rose-600 transition-all flex items-center justify-center"
                    >
                      <Minus size={18} className="mr-1" />
                      -1
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {getTeamsList().length === 0 && (
              <div className="text-center text-slate-500 py-8">
                <Trophy size={48} className="mx-auto mb-3 text-slate-300" />
                <p>Նախ, բաշխեք դերերը,<br/>որպեսզի սկսել գրանցել հաշիվը</p>
              </div>
            )}

            <button
              onClick={resetScores}
              className="w-full bg-gradient-to-r from-rose-500 to-red-600 text-white py-3 rounded-xl font-bold hover:from-rose-600 hover:to-red-700 transition-all flex items-center justify-center"
            >
              <Trash2 size={20} className="mr-2" />
              Վերագործարկեք բոլոր միավորները
            </button>
          </div>
        )}

        {/* Фильтр избранного */}
        {favorites.length > 0 && (
          <div className="mb-6 bg-amber-50 border-2 border-amber-300 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center">
              <Star className="text-amber-500 fill-amber-500 mr-2" size={24} />
              <span className="text-slate-700 font-semibold">
              Նախընտրած խաղեր: {favorites.length}
              </span>
            </div>
            <button
              onClick={() => setFavorites([])}
              className="text-sm text-amber-600 hover:text-amber-700 font-medium underline"
            >
              Մաքրել նախընտրածները
            </button>
          </div>
        )}

        <div className="fixed left-[2rem] top-[2rem]">
          <button
            onClick={() => router.push("/")}
            className="group relative flex px-8 py-4 text-xl font-bold rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl h-[3rem] bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white"
          >
            <span className="relative z-10 flex items-center gap-3">
              <svg 
                className="w-6 h-6 transform group-hover:-translate-x-1 transition-transform duration-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Գլխավոր էջ
              <Sparkles className="w-5 h-5 animate-pulse" />
            </span>
          </button>
        </div>

        <header className="text-center mb-12 bg-white bg-opacity-90 rounded-3xl p-8 shadow-xl border border-slate-200">
          <div className="flex items-center justify-center mb-6">
            <Snowflake className="text-sky-500 animate-spin" size={56} style={{animationDuration: '3s'}} />
            <h1 className="text-[60px] font-bold bg-gradient-to-r from-slate-700 via-indigo-600 to-blue-600 bg-clip-text text-transparent mx-6">
              Ամանորյա Խաղերի հավաքածու
            </h1>
            <Sparkles className="text-amber-500 animate-pulse" size={56} />
          </div>
          <p className="text-2xl text-slate-700 font-semibold">
            10 Շքեղ Դերային Խաղ Աշխատավայրի Համար
          </p>
          <p className="text-lg text-slate-600 mt-3">
            🎭 Իմպրովիզացիա | 💋 Ֆլիրտ | 🍷 Զվարճություն | 🎉 Անմոռանալի Հուշեր
          </p>
          
          <button
            onClick={handlePrintAll}
            className="mt-6 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-8 py-4 rounded-xl font-bold hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg text-lg flex items-center justify-center mx-auto"
          >
            <Gift className="mr-3" size={24} />
            🖨️ Տպել Բոլոր Խաղերի Քարտերը
          </button>

          <button
            onClick={() => setShowScoreboard(true)}
            className="mt-4 bg-gradient-to-r from-amber-500 to-yellow-600 text-white px-8 py-4 rounded-xl font-bold hover:from-amber-600 hover:to-yellow-700 transition-all shadow-lg text-lg flex items-center justify-center mx-auto"
          >
            <Trophy className="mr-3" size={24} />
            🏆 Միավորների աղյուսակ
          </button>

          <div className="flex flex-wrap gap-4 mt-4 justify-center">
            <button
              onClick={() => {
                setShowRouletteWheel(true);
                playSound('click');
              }}
              className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-8 py-4 rounded-xl font-bold hover:from-purple-600 hover:to-pink-700 transition-all shadow-lg text-lg flex items-center"
            >
              <Dices className="mr-3" size={24} />
              🎡 Колесо Фортуны
            </button>

            <button
              onClick={() => setShowTeamGenerator(true)}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-4 rounded-xl font-bold hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg text-lg flex items-center"
            >
              <Shuffle className="mr-3" size={24} />
              🎲 Թիմերի գեներատոր
            </button>

            <button
              onClick={() => setShowAchievements(true)}
              className="relative bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-4 rounded-xl font-bold hover:from-amber-600 hover:to-orange-700 transition-all shadow-lg text-lg flex items-center"
            >
              <Award className="mr-3" size={24} />
              🏅 Նվաճումներ
              {achievements.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {achievements.length}
                </span>
              )}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {games
            .filter(game => favorites.length === 0 || favorites.includes(game.id))
            .map((game) => (
            <div
              key={game.id}
              className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200 hover:border-indigo-300 transition-all hover:scale-[1.02] hover:shadow-xl relative"
            >
              <button
                onClick={() => toggleFavorite(game.id)}
                className="absolute top-4 right-4 transition-all hover:scale-110"
              >
                <Star 
                  size={28} 
                  className={favorites.includes(game.id) 
                    ? 'text-amber-500 fill-amber-500' 
                    : 'text-slate-300 hover:text-amber-400'
                  }
                />
              </button>

              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-br from-sky-500 to-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mr-5 shadow-md">
                  {game.id}
                </div>
                <h2 className="text-3xl font-bold text-slate-800 pr-10">{game.name}</h2>
              </div>

              <p className="text-slate-700 mb-4 text-lg leading-relaxed">{game.description}</p>

              <button
                onClick={() => setExpandedGame(expandedGame === game.id ? null : game.id)}
                className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white py-3 rounded-lg font-bold mb-4 hover:from-indigo-600 hover:to-blue-600 transition-all flex items-center justify-center"
              >
                {expandedGame === game.id ? <ChevronUp size={20} className="mr-2" /> : <ChevronDown size={20} className="mr-2" />}
                {expandedGame === game.id ? 'Թաքցնել Մանրամասները' : 'Տեսնել Մանրամասները'}
              </button>

              {expandedGame === game.id && (
                <div className="mb-6 space-y-3 animate-in">
                  <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <p className="text-sm text-slate-700"><strong className="text-indigo-700">📖 Ամբողջական նկարագրություն:</strong> {game.fullDescription}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <p className="text-sm text-slate-700"><strong className="text-blue-600">⏱️ Տևողություն:</strong> {game.duration}</p>
                    </div>
                    <div className="bg-cyan-50 p-3 rounded-lg border border-cyan-200">
                      <p className="text-sm text-slate-700"><strong className="text-cyan-600">👥 Խաղացողներ:</strong> {game.players}</p>
                    </div>
                  </div>

                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <p className="text-sm text-slate-700"><strong className="text-amber-600">🎯 Անհրաժեշտ է:</strong> {game.materials}</p>
                  </div>

                  <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                    <p className="text-sm text-slate-700"><strong className="text-emerald-600">🍽️ Ուտեստ և Խմիչք:</strong> {game.food}</p>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <p className="text-sm text-slate-700"><strong className="text-yellow-600">💡 Խորհուրդներ:</strong> {game.tips}</p>
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-bold text-slate-700 mb-3 flex items-center text-xl">
                  <Users className="mr-2 text-indigo-600" size={24} />
                  Դերեր ({game.roles.length} հատ):
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {game.roles.map((role, idx) => (
                    <div
                      key={idx}
                      className="bg-gradient-to-r from-indigo-50 to-blue-50 px-4 py-3 rounded-xl text-sm font-semibold text-indigo-800 border border-indigo-200 shadow-sm hover:shadow-md transition-all"
                    >
                      {role.name}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => startTimer(game)}
                  className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-4 rounded-xl font-bold hover:from-emerald-600 hover:to-green-700 transition-all flex items-center justify-center shadow-md text-lg"
                >
                  <Timer className="mr-3" size={24} />
                  ⏱️ Միացնել ժամանակաչափը
                </button>

                <button
                  onClick={() => openParticipantsModal(game)}
                  className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-4 rounded-xl font-bold hover:from-indigo-700 hover:to-blue-700 transition-all flex items-center justify-center shadow-md text-lg"
                >
                  <UserPlus className="mr-3" size={24} />
                  👥 Ավելացնել խաղացողներին և բաշխել դերերը
                </button>

                <button
                  onClick={() => handlePrint(game)}
                  className="w-full bg-gradient-to-r from-sky-500 to-cyan-600 text-white py-4 rounded-xl font-bold hover:from-sky-600 hover:to-cyan-700 transition-all flex items-center justify-center shadow-md text-lg"
                >
                  <Gift className="mr-3" size={24} />
                  🖨️ Տպել Շքեղ Քարտերը
                </button>
              </div>
            </div>
          ))}
        </div>

        <footer className="mt-16 text-center bg-white bg-opacity-90 rounded-3xl p-8 shadow-xl border border-slate-200">
          <div className="flex items-center justify-center space-x-6 text-3xl mb-4">
            <Snowflake className="text-sky-500 animate-bounce" />
            <Heart className="text-rose-500 animate-pulse" />
            <Wine className="text-purple-500 animate-bounce" />
            <Gift className="text-emerald-500 animate-pulse" />
            <Sparkles className="text-amber-500 animate-bounce" />
          </div>
          <p className="text-2xl text-slate-800 font-bold mb-2">
            Շնորհավոր Ամանոր և Սուրբ Ծնունդ! 🎄🎉
          </p>
          <p className="text-lg text-slate-600">
            Վայելեք խաղերը, ստեղծեք անմոռանալի հուշեր և եղեք երջանիկ! 💖
          </p>
        </footer>
      </div>
    </div>
  );
}