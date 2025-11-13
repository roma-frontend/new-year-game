"use client"

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Music, Trophy, Users, Play, Pause, Plus, Trash2, Crown, Sparkles, Zap, Star, Flame, Award, PartyPopper, Volume2, VolumeX, SkipForward, Clock, TrendingUp, Gift, Heart, Mic2 } from 'lucide-react';

interface Player {
  id: string;
  name: string;
  score: number;
  streak: number;
  avatar: string;
  fastestGuess?: number;
  totalGuesses: number;
  combo: number;
}

interface Song {
  id: number;
  file: string;
  title: string;
  artist: string;
  difficulty: 'easy' | 'medium' | 'hard';
  year?: string;
}

interface GameStats {
  totalTime: number;
  songsPlayed: number;
  avgResponseTime: number;
}

const GuessTheMelody = () => {
  const [gameState, setGameState] = useState<'intro' | 'setup' | 'playing' | 'round-end' | 'finished'>('intro');
  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [winner, setWinner] = useState<Player | null>(null);
  const [loser, setLoser] = useState<Player | null>(null);
  const [wish, setWish] = useState('');
  const [volume, setVolume] = useState(0.7);
  const [showHint, setShowHint] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);
  const [roundWinner, setRoundWinner] = useState<Player | null>(null);
  const [gameStats, setGameStats] = useState<GameStats>({ totalTime: 0, songsPlayed: 0, avgResponseTime: 0 });
  const [lastGuessTime, setLastGuessTime] = useState<number>(0);
  const [powerUpActive, setPowerUpActive] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [songRevealed, setSongRevealed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const avatarColors = ['🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '🟤', '⚫', '⚪', '🔷', '🔶', '⭐', '💎', '🎯', '🎨', '🎭'];

  const songs: Song[] = [
    { id: 1, file: '/song1.mp3', title: 'My Kind of Present', artist: 'Meghan Trainor', difficulty: 'easy', year: '2022' },
    { id: 2, file: '/song2.mp3', title: 'Snowman', artist: 'Sia', difficulty: 'medium', year: '2021' },
    { id: 3, file: '/song3.mp3', title: 'White Christmas', artist: 'Bing Crosby', difficulty: 'easy', year: '1942' },
    { id: 4, file: '/song4.mp3', title: 'Underneath the Tree', artist: 'Kelly Clarkson', difficulty: 'medium', year: '2020' },
    { id: 5, file: '/song5.mp3', title: "It's Beginning to Look a Lot Like Christmas", artist: 'Michael Bublé', difficulty: 'easy', year: '2011' },
    { id: 6, file: '/song6.mp3', title: 'Jingle Bells (Swing Version)', artist: 'Various Artists', difficulty: 'medium', year: '1857' },
    { id: 7, file: '/song7.mp3', title: 'Merry Christmas', artist: 'Ed Sheeran & Elton John', difficulty: 'hard', year: '2021' },
    { id: 8, file: '/song8.mp3', title: 'Blue Christmas', artist: 'Elvis Presley', difficulty: 'easy', year: '1957' },
    { id: 9, file: '/song9.mp3', title: 'Christmas Tree Farm', artist: 'Taylor Swift', difficulty: 'medium', year: '2019' },
    { id: 10, file: '/song10.mp3', title: 'Cindy Lou Who', artist: 'Sabrina Carpenter', difficulty: 'hard', year: '2023' },
  ];

  const wishes = [
    '🎤 երգել հաջորդ երգը լիարժեք ձայնով',
    '💃 պարել 45 վայրկյան հաղթողի համար',
    '😂 պատմել ամենաբարձրաձայն կատակը',
    '💪 անել 15 վարժություն հաղթողի հետ',
    '💋 նվերել համբույր հաղթողի ձեռքին',
    '🌟 ասել 5 համալիր հաղթողին',
    '📸 անել 5 ֆոտո տարբեր ծիծաղելի դեմքերով',
    '👏 խաղալ ծափահարելով 30 վայրկյան',
    '🎭 նմանակել հաղթողի ձայնը',
    '🎨 նկարել հաղթողի դիմանկարը',
    '🕺 սովորեցնել պարի քայլ բոլորին',
    '🎁 պատրաստել անակնկալ նվեր հաղթողին',
  ];

  const difficultyPoints = {
    easy: { base: 3, fast: 5, perfect: 8 },
    medium: { base: 5, fast: 8, perfect: 12 },
    hard: { base: 8, fast: 12, perfect: 15 }
  };

  useEffect(() => {
    setIsMounted(true);
    // Initialize audio element
    audioRef.current = new Audio();
    audioRef.current.volume = volume;
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (gameState === 'playing' && isPlaying && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleRoundEnd();
            return 0;
          }
          if (prev === 30 && !showHint) {
            setShowHint(true);
            setHintLevel(1);
          }
          if (prev === 15 && hintLevel === 1) {
            setHintLevel(2);
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, isPlaying, timeLeft, showHint, hintLevel]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  const addPlayer = () => {
    if (newPlayerName.trim() && players.length < 8) {
      const randomAvatar = avatarColors[Math.floor(Math.random() * avatarColors.length)];
      setPlayers([...players, {
        id: Date.now().toString(),
        name: newPlayerName.trim(),
        score: 0,
        streak: 0,
        avatar: randomAvatar,
        totalGuesses: 0,
        combo: 0
      }]);
      setNewPlayerName('');
    }
  };

  const removePlayer = (id: string) => {
    setPlayers(players.filter(p => p.id !== id));
  };

  const startGame = () => {
    if (players.length >= 2) {
      setGameState('playing');
      setIsPlaying(true);
      setSongRevealed(false);
      startTimeRef.current = Date.now();
      
      if (audioRef.current) {
        audioRef.current.src = songs[currentSongIndex].file;
        audioRef.current.volume = volume;
        
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(e => {
            console.log('Audio play failed:', e);
            alert('Не удалось загрузить аудио файл. Убедитесь, что файлы song1.mp3 - song10.mp3 находятся в папке /public/');
          });
        }
      }
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.log('Audio play failed:', e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const calculatePoints = (basePoints: number, timeRemaining: number, streak: number) => {
    const timeBonus = timeRemaining > 30 ? 5 : timeRemaining > 15 ? 3 : 0;
    const streakBonus = streak >= 3 ? 10 : streak >= 2 ? 5 : 0;
    const comboMultiplier = powerUpActive ? 2 : 1;
    return (basePoints + timeBonus + streakBonus) * comboMultiplier;
  };

  const addPoints = (playerId: string, difficulty: 'base' | 'fast' | 'perfect') => {
    const currentSong = songs[currentSongIndex];
    const basePoints = difficultyPoints[currentSong.difficulty][difficulty];
    const responseTime = 45 - timeLeft;
    
    setSongRevealed(true);
    
    setPlayers(players.map(p => {
      if (p.id === playerId) {
        const newStreak = p.streak + 1;
        const finalPoints = calculatePoints(basePoints, timeLeft, newStreak);
        const newCombo = newStreak >= 2 ? newStreak : 0;
        
        setRoundWinner(p);
        setLastGuessTime(responseTime);
        
        return {
          ...p,
          score: p.score + finalPoints,
          streak: newStreak,
          totalGuesses: p.totalGuesses + 1,
          combo: newCombo,
          fastestGuess: p.fastestGuess === undefined ? responseTime : Math.min(p.fastestGuess, responseTime)
        };
      }
      return { ...p, streak: 0, combo: 0 };
    }));

    setShowConfetti(true);
    setPowerUpActive(false);
    setTimeout(() => {
      setGameState('round-end');
      if (audioRef.current) audioRef.current.pause();
      setIsPlaying(false);
    }, 2000);
  };

  const handleRoundEnd = () => {
    setSongRevealed(true);
    setGameState('round-end');
    if (audioRef.current) audioRef.current.pause();
    setIsPlaying(false);
    setPlayers(players.map(p => ({ ...p, streak: 0, combo: 0 })));
  };

  const nextSong = () => {
    setRoundWinner(null);
    setShowHint(false);
    setHintLevel(0);
    setPowerUpActive(false);
    setSongRevealed(false);
    
    if (currentSongIndex < songs.length - 1) {
      setCurrentSongIndex(currentSongIndex + 1);
      setTimeLeft(45);
      setGameState('playing');
      setIsPlaying(true);
      setGameStats(prev => ({ ...prev, songsPlayed: prev.songsPlayed + 1 }));
      
      if (audioRef.current) {
        audioRef.current.src = songs[currentSongIndex + 1].file;
        audioRef.current.play().catch(e => console.log('Audio play failed:', e));
      }
    } else {
      finishGame();
    }
  };

  const activatePowerUp = () => {
    setPowerUpActive(true);
    setTimeout(() => setPowerUpActive(false), 10000);
  };

  const finishGame = () => {
    setIsPlaying(false);
    if (audioRef.current) audioRef.current.pause();
    
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    const gameWinner = sortedPlayers[0];
    const gameLoser = sortedPlayers[sortedPlayers.length - 1];
    
    setWinner(gameWinner);
    setLoser(gameLoser);
    setWish(wishes[Math.floor(Math.random() * wishes.length)]);
    
    const totalTime = (Date.now() - startTimeRef.current) / 1000;
    setGameStats(prev => ({
      ...prev,
      totalTime,
      avgResponseTime: totalTime / (currentSongIndex + 1)
    }));
    
    setGameState('finished');
    setShowConfetti(true);
  };

  const resetGame = () => {
    setGameState('setup');
    setPlayers(players.map(p => ({ 
      ...p, 
      score: 0, 
      streak: 0, 
      combo: 0, 
      totalGuesses: 0,
      fastestGuess: undefined 
    })));
    setCurrentSongIndex(0);
    setTimeLeft(45);
    setIsPlaying(false);
    setWinner(null);
    setLoser(null);
    setWish('');
    setShowHint(false);
    setHintLevel(0);
    setRoundWinner(null);
    setSongRevealed(false);
    setGameStats({ totalTime: 0, songsPlayed: 0, avgResponseTime: 0 });
  };

  const getHintText = (level: number, song: Song) => {
    if (level === 1) {
      return `💡 Подсказка 1: Год ${song.year}`;
    } else if (level === 2) {
      return `💡 Подсказка 2: Исполнитель ${song.artist.substring(0, 3)}...`;
    }
    return '';
  };

  const Confetti = () => {
    if (!showConfetti || !isMounted) return null;
    return (
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {[...Array(100)].map((_, i) => {
          const icons = [Sparkles, Star, Trophy, Crown, Heart, Gift, PartyPopper, Zap];
          const Icon = icons[i % icons.length];
          const colors = ['text-yellow-400', 'text-pink-400', 'text-purple-400', 'text-blue-400', 'text-red-400', 'text-green-400'];
          const color = colors[i % colors.length];
          
          return (
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
              <Icon className={color} size={15 + (i % 3) * 10} />
            </div>
          );
        })}
      </div>
    );
  };

  const Fireworks = () => {
    if (!isMounted) return null;
    return (
      <div className="fixed inset-0 pointer-events-none z-40">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-red-500 rounded-full animate-ping"
            style={{
              left: `${(i * 17) % 100}%`,
              top: `${(i * 23) % 100}%`,
              animationDelay: `${(i * 0.1) % 2}s`,
            }}
          />
        ))}
      </div>
    );
  };

  if (gameState === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 flex items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
        
        <Fireworks />
        
        <div className="max-w-4xl w-full text-center relative z-10">
          <div className="mb-12 animate-bounce">
            <Mic2 className="w-40 h-40 mx-auto text-yellow-300 drop-shadow-2xl" />
          </div>
          
          <h1 className="text-8xl font-black mb-6 bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent drop-shadow-2xl animate-pulse">
            ԳՈՒՇԱԿԻՐ ՄԵՂԵԴԻՆ
          </h1>
          
          <p className="text-3xl text-white/90 mb-12 font-bold animate-fade-in">
            🎵 Վերջնական Երաժշտական Մրցույթ 🎵
          </p>
          
          <div className="grid grid-cols-3 gap-6 mb-12">
            <Card className="p-6 bg-white/10 backdrop-blur-xl border-2 border-white/20 hover:bg-white/20 transition-all transform hover:scale-110">
              <Trophy className="w-16 h-16 mx-auto mb-3 text-yellow-300" />
              <p className="text-white font-bold text-lg">Խելացի Միավորներ</p>
            </Card>
            <Card className="p-6 bg-white/10 backdrop-blur-xl border-2 border-white/20 hover:bg-white/20 transition-all transform hover:scale-110">
              <Zap className="w-16 h-16 mx-auto mb-3 text-orange-300" />
              <p className="text-white font-bold text-lg">Power-Up Համակարգ</p>
            </Card>
            <Card className="p-6 bg-white/10 backdrop-blur-xl border-2 border-white/20 hover:bg-white/20 transition-all transform hover:scale-110">
              <Flame className="w-16 h-16 mx-auto mb-3 text-red-300" />
              <p className="text-white font-bold text-lg">Streak & Combo</p>
            </Card>
          </div>
          
          <Button
            onClick={() => setGameState('setup')}
            className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 hover:from-yellow-500 hover:via-pink-600 hover:to-purple-700 text-white px-16 py-10 text-3xl font-black rounded-full shadow-2xl transform hover:scale-110 transition-all animate-pulse"
          >
            <Play className="mr-4 w-12 h-12" /> ՍԿՍԵԼ
          </Button>
        </div>
      </div>
    );
  }

  if (gameState === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <Users className="w-24 h-24 mx-auto mb-4 text-yellow-300 animate-bounce" />
            <h1 className="text-6xl font-black text-white mb-2 drop-shadow-lg">Ավելացրեք Խաղացողներ</h1>
            <p className="text-2xl text-white/80">Մինիմում 2, Մաքսիմում 8 խաղացող</p>
          </div>

          <Card className="p-8 bg-white/10 backdrop-blur-xl border-2 border-white/20 mb-8">
            <div className="flex gap-4 mb-6">
              <Input
                placeholder="🎤 Մուտքագրեք անունը..."
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
                className="text-xl bg-white/20 border-white/30 text-white placeholder:text-white/50 py-6"
                maxLength={20}
              />
              <Button 
                onClick={addPlayer} 
                disabled={players.length >= 8}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 px-8 text-lg font-bold"
              >
                <Plus className="mr-2" /> Ավելացնել
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {players.map((player, index) => (
                <div 
                  key={player.id} 
                  className="group relative p-6 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-xl border-2 border-white/30 hover:border-white/60 transition-all transform hover:scale-105"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-5xl animate-pulse">{player.avatar}</div>
                      <div>
                        <div className="text-sm text-white/70 font-semibold">Խաղացող {index + 1}</div>
                        <div className="text-2xl font-black text-white">{player.name}</div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removePlayer(player.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                    >
                      <Trash2 size={24} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {players.length < 2 && (
              <div className="text-center p-6 bg-orange-500/20 rounded-xl border-2 border-orange-400/50">
                <p className="text-xl text-orange-200 font-bold">⚠️ Նվազագույնը 2 խաղացող անհրաժեշտ է</p>
              </div>
            )}

            <Button
              onClick={startGame}
              disabled={players.length < 2}
              className="w-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-600 hover:via-orange-600 hover:to-red-600 text-white py-8 text-2xl font-black rounded-xl shadow-2xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="mr-3 w-8 h-8" /> ՍԿՍԵԼ ԽԱՂԸ 🚀
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (gameState === 'playing') {
    const currentSong = songs[currentSongIndex];
    const progressPercent = (timeLeft / 45) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 p-6 relative overflow-hidden">
        <Confetti />
        
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-96 h-96 bg-pink-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <Button
                onClick={togglePlayPause}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 p-6 rounded-full"
              >
                {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
              </Button>
              
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xl px-6 py-3 rounded-full border-2 border-white/20">
                {volume > 0 ? <Volume2 className="text-white" /> : <VolumeX className="text-white" />}
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-32"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-white/10 backdrop-blur-xl px-8 py-4 rounded-full border-2 border-white/20">
                <span className="text-2xl font-black text-white">
                  Երգ {currentSongIndex + 1} / {songs.length}
                </span>
              </div>
              
              {!powerUpActive && (
                <Button
                  onClick={activatePowerUp}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 px-6 py-4 font-bold animate-pulse"
                >
                  <Zap className="mr-2" /> x2 Power-Up
                </Button>
              )}
              
              {powerUpActive && (
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-4 rounded-full border-4 border-yellow-300 animate-pulse">
                  <span className="text-xl font-black text-white flex items-center gap-2">
                    <Zap className="animate-bounce" /> x2 ԱԿՏԻՎ
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Central Timer Display */}
          <div className="mb-8">
            <Card className="p-8 bg-gradient-to-br from-purple-600/40 to-pink-600/40 backdrop-blur-xl border-4 border-white/30">
              <div className="text-center mb-4">
                <div className="inline-flex items-center gap-3 bg-black/30 px-8 py-3 rounded-full mb-6">
                  <Music className="w-8 h-8 text-yellow-300 animate-bounce" />
                  {songRevealed ? (
                    <span className="text-3xl font-black text-white">
                      {currentSong.title} - {currentSong.artist}
                    </span>
                  ) : (
                    <span className="text-3xl font-black text-white">
                      🎵 ԳՈՒՇԱԿԵՔ ԵՐԳԸ 🎵
                    </span>
                  )}
                  <div className={`px-4 py-1 rounded-full text-sm font-bold ${
                    currentSong.difficulty === 'easy' ? 'bg-green-500' :
                    currentSong.difficulty === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}>
                    {currentSong.difficulty === 'easy' ? '⭐ Հեշտ' :
                     currentSong.difficulty === 'medium' ? '⭐⭐ Միջին' : '⭐⭐⭐ Բարդ'}
                  </div>
                </div>
              </div>

              <div className="relative w-64 h-64 mx-auto mb-6">
                <svg className="transform -rotate-90 w-64 h-64">
                  <circle
                    cx="128"
                    cy="128"
                    r="120"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="16"
                    fill="none"
                  />
                  <circle
                    cx="128"
                    cy="128"
                    r="120"
                    stroke="url(#gradient)"
                    strokeWidth="16"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 120}`}
                    strokeDashoffset={`${2 * Math.PI * 120 * (1 - progressPercent / 100)}`}
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#fbbf24" />
                      <stop offset="50%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#ef4444" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Clock className="w-12 h-12 mx-auto mb-2 text-yellow-300" />
                    <div className="text-7xl font-black text-white drop-shadow-2xl">{timeLeft}</div>
                    <div className="text-xl text-white/80 font-bold mt-2">վայրկյան</div>
                  </div>
                </div>
              </div>

              {/* Hints */}
              {showHint && (
                <div className="text-center space-y-3">
                  {hintLevel >= 1 && (
                    <div className="bg-blue-500/30 px-6 py-3 rounded-full inline-block animate-fade-in border-2 border-blue-400">
                      <span className="text-xl font-bold text-white">{getHintText(1, currentSong)}</span>
                    </div>
                  )}
                  {hintLevel >= 2 && (
                    <div className="bg-purple-500/30 px-6 py-3 rounded-full inline-block animate-fade-in border-2 border-purple-400 ml-3">
                      <span className="text-xl font-bold text-white">{getHintText(2, currentSong)}</span>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>

          {/* Players Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {players.map((player) => (
              <Card 
                key={player.id} 
                className={`relative overflow-hidden transform transition-all hover:scale-105 ${
                  player.combo > 0 ? 'ring-4 ring-yellow-400 animate-pulse' : ''
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/30 to-pink-600/30 backdrop-blur-xl"></div>
                
                {player.combo >= 2 && (
                  <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-orange-500 px-3 py-1 rounded-full flex items-center gap-1 z-10 animate-bounce">
                    <Flame className="w-4 h-4" />
                    <span className="text-sm font-black">{player.combo}x COMBO!</span>
                  </div>
                )}

                <div className="relative p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-4xl">{player.avatar}</div>
                    <div className="flex-1">
                      <div className="text-lg font-black text-white truncate">{player.name}</div>
                      <div className="flex items-center gap-2 text-sm">
                        {player.streak > 0 && (
                          <span className="bg-orange-500 px-2 py-1 rounded-full text-white font-bold flex items-center gap-1">
                            <Flame className="w-3 h-3" /> {player.streak}
                          </span>
                        )}
                        <span className="text-white/70">Խաղեր: {player.totalGuesses}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-4xl font-black text-yellow-300 mb-4 text-center drop-shadow-lg">
                    {player.score}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      onClick={() => addPoints(player.id, 'base')}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 font-bold"
                    >
                      +{difficultyPoints[currentSong.difficulty].base}
                    </Button>
                    <Button
                      onClick={() => addPoints(player.id, 'fast')}
                      className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 font-bold"
                    >
                      ⚡ +{difficultyPoints[currentSong.difficulty].fast}
                    </Button>
                    <Button
                      onClick={() => addPoints(player.id, 'perfect')}
                      className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 font-bold"
                    >
                      ⭐ +{difficultyPoints[currentSong.difficulty].perfect}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Control Buttons */}
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => setShowStats(!showStats)}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 px-8 py-6 text-lg font-bold"
            >
              <TrendingUp className="mr-2" /> Վիճակագրություն
            </Button>
            <Button
              onClick={handleRoundEnd}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 px-8 py-6 text-lg font-bold"
            >
              <SkipForward className="mr-2" /> Բաց թողնել
            </Button>
            <Button
              onClick={finishGame}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-8 py-6 text-lg font-bold"
            >
              <Trophy className="mr-2" /> Ավարտել
            </Button>
          </div>

          {/* Live Stats */}
          {showStats && (
            <Card className="mt-6 p-6 bg-white/10 backdrop-blur-xl border-2 border-white/20">
              <h3 className="text-2xl font-black text-white mb-4 flex items-center gap-2">
                <TrendingUp /> Կենդանի Վիճակագրություն
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {players.map(player => (
                  <div key={player.id} className="bg-black/30 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{player.avatar}</span>
                      <span className="text-white font-bold">{player.name}</span>
                    </div>
                    <div className="text-sm text-white/70 space-y-1">
                      <div>Ամենաարագ: {player.fastestGuess?.toFixed(1) || '-'}վ</div>
                      <div>Ճիշտ պատասխաններ: {player.totalGuesses}</div>
                      <div>Ընթացիկ streak: {player.streak}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    );
  }

  if (gameState === 'round-end') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-900 via-cyan-900 to-blue-900 p-8 flex items-center justify-center">
        {roundWinner && <Confetti />}
        
        <div className="max-w-4xl w-full">
          <Card className="p-12 bg-white/10 backdrop-blur-2xl border-4 border-white/30 text-center">
            {roundWinner ? (
              <>
                <Award className="w-32 h-32 mx-auto mb-6 text-yellow-300 animate-bounce" />
                <h2 className="text-6xl font-black text-white mb-4">Շնորհավորում եմ!</h2>
                <div className="text-5xl mb-6">{roundWinner.avatar}</div>
                <h3 className="text-4xl font-black text-yellow-300 mb-6">{roundWinner.name}</h3>
                
                <div className="bg-blue-500/20 px-6 py-4 rounded-xl mb-6">
                  <Music className="w-8 h-8 mx-auto mb-2 text-blue-300" />
                  <p className="text-2xl font-bold text-white">
                    {songs[currentSongIndex].title} - {songs[currentSongIndex].artist}
                  </p>
                </div>
                
                <div className="grid grid-cols-3 gap-6 mb-8">
                  <div className="bg-white/20 p-6 rounded-xl">
                    <Clock className="w-12 h-12 mx-auto mb-2 text-blue-300" />
                    <div className="text-3xl font-black text-white">{lastGuessTime.toFixed(1)}վ</div>
                    <div className="text-white/70">Արագություն</div>
                  </div>
                  <div className="bg-white/20 p-6 rounded-xl">
                    <Flame className="w-12 h-12 mx-auto mb-2 text-orange-300" />
                    <div className="text-3xl font-black text-white">{roundWinner.streak}</div>
                    <div className="text-white/70">Streak</div>
                  </div>
                  <div className="bg-white/20 p-6 rounded-xl">
                    <Star className="w-12 h-12 mx-auto mb-2 text-yellow-300" />
                    <div className="text-3xl font-black text-white">{roundWinner.score}</div>
                    <div className="text-white/70">Ընդամենը միավոր</div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Clock className="w-32 h-32 mx-auto mb-6 text-gray-400" />
                <h2 className="text-5xl font-black text-white mb-4">Ժամանակը Ավարտվեց!</h2>
                <p className="text-2xl text-white/70 mb-4">Ոչ ոք չգուշակեց այս երգը</p>
                
                <div className="bg-blue-500/20 px-6 py-4 rounded-xl mb-8">
                  <Music className="w-8 h-8 mx-auto mb-2 text-blue-300" />
                  <p className="text-2xl font-bold text-white">
                    Պատասխանը: {songs[currentSongIndex].title} - {songs[currentSongIndex].artist}
                  </p>
                </div>
              </>
            )}

            <div className="space-y-3 mb-8">
              <h4 className="text-2xl font-bold text-white mb-4">Ընթացիկ Դասակարգում:</h4>
              {[...players].sort((a, b) => b.score - a.score).map((player, index) => (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-4 rounded-xl ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-500/30 to-orange-500/30 border-2 border-yellow-400' :
                    'bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl font-black text-white">{index + 1}</span>
                    <span className="text-3xl">{player.avatar}</span>
                    <span className="text-xl font-bold text-white">{player.name}</span>
                    {player.streak >= 2 && (
                      <span className="bg-orange-500 px-3 py-1 rounded-full text-white font-bold flex items-center gap-1">
                        <Flame className="w-4 h-4" /> {player.streak}x
                      </span>
                    )}
                  </div>
                  <span className="text-3xl font-black text-yellow-300">{player.score}</span>
                </div>
              ))}
            </div>

            <Button
              onClick={nextSong}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 py-8 text-2xl font-black"
            >
              {currentSongIndex < songs.length - 1 ? (
                <>
                  <Play className="mr-3 w-8 h-8" /> Հաջորդ Երգ
                </>
              ) : (
                <>
                  <Trophy className="mr-3 w-8 h-8" /> Տեսնել Վերջնական Արդյունքները
                </>
              )}
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (gameState === 'finished' && winner && loser) {
    const topThree = [...players].sort((a, b) => b.score - a.score).slice(0, 3);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-600 via-orange-600 to-red-600 p-8 relative overflow-hidden">
        <Confetti />
        <Fireworks />
        
        <div className="absolute inset-0 opacity-20">
          {isMounted && [...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float"
              style={{
                left: `${(i * 11) % 100}%`,
                top: `${(i * 13) % 100}%`,
                animationDelay: `${(i * 0.5) % 5}s`,
              }}
            >
              <Trophy className="w-24 h-24 text-yellow-200" />
            </div>
          ))}
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Winner Podium */}
          <div className="text-center mb-12">
            <h1 className="text-8xl font-black text-white mb-8 drop-shadow-2xl animate-pulse">
              🏆 ՀԱՂԹՈՂ 🏆
            </h1>
            
            <Card className="p-12 bg-white/95 backdrop-blur-xl border-8 border-yellow-400 shadow-2xl transform hover:scale-105 transition-all">
              <Crown className="w-40 h-40 mx-auto mb-6 text-yellow-500 animate-bounce" />
              <div className="text-8xl mb-6">{winner.avatar}</div>
              <h2 className="text-7xl font-black mb-6 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
                {winner.name}
              </h2>
              
              <div className="grid grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-6 rounded-xl shadow-xl">
                  <Trophy className="w-12 h-12 mx-auto mb-2 text-white" />
                  <div className="text-5xl font-black text-white">{winner.score}</div>
                  <div className="text-white/90 font-bold">Միավորներ</div>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-6 rounded-xl shadow-xl">
                  <Flame className="w-12 h-12 mx-auto mb-2 text-white" />
                  <div className="text-5xl font-black text-white">{winner.totalGuesses}</div>
                  <div className="text-white/90 font-bold">Ճիշտ պատասխաններ</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-6 rounded-xl shadow-xl">
                  <Zap className="w-12 h-12 mx-auto mb-2 text-white" />
                  <div className="text-5xl font-black text-white">{winner.fastestGuess?.toFixed(1) || '-'}</div>
                  <div className="text-white/90 font-bold">Ամենաարագ (վ)</div>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-6 rounded-xl shadow-xl">
                  <Star className="w-12 h-12 mx-auto mb-2 text-white" />
                  <div className="text-5xl font-black text-white">{winner.streak}</div>
                  <div className="text-white/90 font-bold">Լավագույն Streak</div>
                </div>
              </div>

              {/* Podium */}
              <div className="flex items-end justify-center gap-4 mb-8">
                {topThree[1] && (
                  <div className="flex flex-col items-center">
                    <div className="text-6xl mb-2">{topThree[1].avatar}</div>
                    <div className="bg-gray-400 text-white px-8 py-16 rounded-t-xl w-48 text-center">
                      <div className="text-7xl font-black mb-2">2</div>
                      <div className="text-xl font-bold mb-2">{topThree[1].name}</div>
                      <div className="text-3xl font-black">{topThree[1].score}</div>
                    </div>
                  </div>
                )}
                
                {topThree[0] && (
                  <div className="flex flex-col items-center">
                    <Crown className="w-16 h-16 text-yellow-400 mb-2 animate-bounce" />
                    <div className="text-8xl mb-2">{topThree[0].avatar}</div>
                    <div className="bg-gradient-to-b from-yellow-400 to-orange-500 text-white px-8 py-20 rounded-t-xl w-56 text-center shadow-2xl">
                      <div className="text-8xl font-black mb-2">1</div>
                      <div className="text-2xl font-bold mb-2">{topThree[0].name}</div>
                      <div className="text-4xl font-black">{topThree[0].score}</div>
                    </div>
                  </div>
                )}
                
                {topThree[2] && (
                  <div className="flex flex-col items-center">
                    <div className="text-5xl mb-2">{topThree[2].avatar}</div>
                    <div className="bg-orange-600 text-white px-8 py-12 rounded-t-xl w-40 text-center">
                      <div className="text-6xl font-black mb-2">3</div>
                      <div className="text-lg font-bold mb-2">{topThree[2].name}</div>
                      <div className="text-2xl font-black">{topThree[2].score}</div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* All Players Ranking */}
          <Card className="p-8 bg-white/95 backdrop-blur-xl border-4 border-white/50 mb-8">
            <h3 className="text-4xl font-black mb-6 text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              📊 Ամբողջական Դասակարգում
            </h3>
            <div className="space-y-3">
              {[...players].sort((a, b) => b.score - a.score).map((player, index) => (
                <div
                  key={player.id}
                  className={`p-6 rounded-xl flex items-center justify-between transform hover:scale-105 transition-all ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-200 to-orange-200 border-4 border-yellow-400' :
                    index === 1 ? 'bg-gradient-to-r from-gray-200 to-gray-300 border-4 border-gray-400' :
                    index === 2 ? 'bg-gradient-to-r from-orange-200 to-orange-300 border-4 border-orange-400' :
                    index === players.length - 1 ? 'bg-gradient-to-r from-red-100 to-pink-100 border-2 border-red-300' :
                    'bg-gradient-to-r from-purple-100 to-pink-100'
                  }`}
                >
                  <div className="flex items-center gap-6">
                    <div className="text-4xl font-black">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                    </div>
                    <div className="text-5xl">{player.avatar}</div>
                    <div>
                      <div className="text-3xl font-black">{player.name}</div>
                      <div className="flex gap-4 text-sm text-gray-600">
                        <span>✅ {player.totalGuesses} ճիշտ</span>
                        <span>⚡ {player.fastestGuess?.toFixed(1) || '-'}վ</span>
                        <span>🔥 {player.streak} streak</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-5xl font-black text-purple-600">{player.score}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Wish Card */}
          <Card className="p-10 bg-gradient-to-r from-pink-600 to-purple-700 text-white mb-8 border-8 border-pink-400 shadow-2xl">
            <h3 className="text-5xl font-black mb-6 text-center animate-pulse">
              🎭 ԽՆԴՐԱՆՔ ՊԱՐՏՎՈՂԻՑ 🎭
            </h3>
            <div className="bg-white/20 backdrop-blur-xl p-8 rounded-2xl border-4 border-white/40">
              <div className="text-6xl mb-4 text-center">{loser.avatar}</div>
              <p className="text-4xl font-black mb-6 text-center text-yellow-300">
                {loser.name}
              </p>
              <p className="text-3xl font-bold text-center mb-4">ՊԵՏՔ Է ԿԱՏԱՐԵԼ:</p>
              <p className="text-5xl font-black text-center text-yellow-200 animate-bounce">
                {wish}
              </p>
            </div>
          </Card>

          {/* Game Stats */}
          <Card className="p-8 bg-white/95 backdrop-blur-xl border-4 border-blue-400 mb-8">
            <h3 className="text-4xl font-black mb-6 text-center bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              📈 Խաղի Վիճակագրություն
            </h3>
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-6 rounded-xl text-white text-center">
                <Music className="w-12 h-12 mx-auto mb-3" />
                <div className="text-4xl font-black">{songs.length}</div>
                <div className="text-lg font-bold">Երգեր</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-6 rounded-xl text-white text-center">
                <Clock className="w-12 h-12 mx-auto mb-3" />
                <div className="text-4xl font-black">{Math.floor(gameStats.totalTime / 60)}:{(Math.floor(gameStats.totalTime) % 60).toString().padStart(2, '0')}</div>
                <div className="text-lg font-bold">Ընդհանուր ժամանակ</div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-6 rounded-xl text-white text-center">
                <Users className="w-12 h-12 mx-auto mb-3" />
                <div className="text-4xl font-black">{players.length}</div>
                <div className="text-lg font-bold">Խաղացողներ</div>
              </div>
            </div>
          </Card>

          <Button
            onClick={resetGame}
            className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 py-10 text-3xl font-black shadow-2xl transform hover:scale-105 transition-all"
          >
            <Play className="mr-4 w-10 h-10" /> ՆՈՐ ԽԱՂԻ ՍԿԻԶԲ 🎮
          </Button>
        </div>
      </div>
    );
  }

  return null;
};

export default GuessTheMelody;