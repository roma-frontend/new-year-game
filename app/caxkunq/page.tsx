'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Users, Star, Zap, ArrowRight, Play, Medal, Target, Award, Sparkles, Flame, Shield, Swords, Waves, Building2, Landmark, UsersRound, FishSymbol, Trees, Bird, Flag } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentTeam, setCurrentTeam] = useState(0);
  const [particles, setParticles] = useState<Array<{ id: number, x: number, y: number }>>([]);
  const [hoveredTeam, setHoveredTeam] = useState<number | null>(null);

  useEffect(() => {
    setIsVisible(true);
    toast.success('Բարի գալուստ Մեծ Խաղ! 🎉', {
      description: 'Պատրա՞ստ եք էպիկական արկածախնդրության',
      duration: 2000,
    });

    const teamInterval = setInterval(() => {
      setCurrentTeam(prev => (prev + 1) % 3);
    }, 3000);

    const particleInterval = setInterval(() => {
      const newParticle = {
        id: Date.now(),
        x: Math.random() * 100,
        y: -10
      };
      setParticles(prev => [...prev.slice(-30), newParticle]);
    }, 150);

    return () => {
      clearInterval(teamInterval);
      clearInterval(particleInterval);
    };
  }, []);


  const iconMap = {
    FishSymbol: '/icons/fish.png',
    Trees: '/icons/plant.png',
    Bird: '/icons/bird.png'
  };

  const teams = [
    {
      name: 'Ջրում',
      icon: <img src={iconMap.FishSymbol} alt="Fish" className="w-16 h-16" />,
      color: 'from-cyan-400 to-blue-500',
      bgColor: 'from-cyan-50 via-blue-50 to-sky-100',
    },
    {
      name: 'Ցամաքում',
      icon: <img src={iconMap.Trees} alt="Trees" className="w-16 h-16" />,
      color: 'from-teal-700 to-green-500',
      bgColor: 'from-blue-50 via-indigo-50 to-purple-100',
    },
    {
      name: 'Օդում',
      icon: <img src={iconMap.Bird} alt="Bird" className="w-16 h-16" />,
      color: 'from-orange-400 to-red-600',
      bgColor: 'from-emerald-50 via-teal-50 to-green-100',
    }
  ];

  const games = [
    {
      name: 'Ճանաչիր Սևանը',
      icon: '🏞️',
      points: '20/15/10',
      difficulty: 'Միջին',
      // Мягкий бирюзово-голубой градиент (ассоциируется с водой и природой)
      color: 'from-sky-400 via-cyan-400 to-blue-500',
      bgColor: 'bg-gradient-to-br from-sky-50 via-cyan-25 to-blue-50',
    },
    {
      name: 'Քարհավաք',
      icon: '💎',
      points: '40/25/15',
      difficulty: 'Բարձր',
      // Элегантный фиолетово-розовый градиент (драгоценные камни)
      color: 'from-violet-400 via-purple-500 to-fuchsia-500',
      bgColor: 'bg-gradient-to-br from-violet-50 via-purple-25 to-fuchsia-50',
    },
    {
      name: 'Ճանաչիր ՖՆ',
      icon: '🏛️',
      points: '15/10/5',
      difficulty: 'Հեշտ',
      // Глубокий индиго-синий градиент (классика и надежность)
      color: 'from-blue-500 via-indigo-500 to-blue-600',
      bgColor: 'bg-gradient-to-br from-blue-50 via-indigo-25 to-blue-75',
    },
    {
      name: 'Ճանաչիր ԱԶԲ',
      icon: '🏦',
      points: '15/10/5',
      difficulty: 'Հեշտ',
      // Свежий зелено-изумрудный градиент (природа и рост)
      color: 'from-emerald-400 via-green-500 to-teal-500',
      bgColor: 'bg-gradient-to-br from-emerald-50 via-green-25 to-teal-50',
    },
    {
      name: 'Թիմային խաղ',
      icon: '🤝',
      points: '35/20/10',
      difficulty: 'Բարձր',
      // Теплый оранжево-янтарный градиент (энергия и командный дух)
      color: 'from-amber-400 via-orange-500 to-red-400',
      bgColor: 'bg-gradient-to-br from-amber-50 via-orange-25 to-red-50',
    }
  ];


  return (
    <div className={`min-h-[100lvh] bg-gradient-to-br ${teams[currentTeam].bgColor} transition-all duration-1000 overflow-hidden relative`}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Lake Sevan Waves */}
        <div className="absolute bottom-0 left-0 right-0 h-64 opacity-30">
          <svg className="w-full h-full" viewBox="0 0 1440 320">
            <path fill="#0891b2" fillOpacity="0.3" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,138.7C960,139,1056,117,1152,101.3C1248,85,1344,75,1392,69.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>

        {/* Floating Particles */}
        {particles.map(particle => (
          <div
            key={particle.id}
            className="absolute w-3 h-3 rounded-full animate-float"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              background: `radial-gradient(circle, rgba(103, 232, 249, 0.8) 0%, rgba(59, 130, 246, 0.6) 100%)`,
              boxShadow: '0 0 10px rgba(103, 232, 249, 0.5)',
              animation: 'float 8s ease-in-out infinite',
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-6">
        {/* Header */}
        <div className={`text-center mb-6 transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 animate-ping">
              <Trophy className="w-24 h-24 text-blue-400/30" />
            </div>
            <Trophy className="relative w-24 h-24 text-blue-400 animate-float" />
            <Sparkles className="absolute -top-4 -right-4 w-12 h-12 text-yellow-400 animate-spin" />
            <Star className="absolute -top-2 -left-4 w-8 h-8 text-yellow-400 animate-pulse" />
          </div>

          <h1 className="text-4xl font-black mb-12 relative">
            <span className="absolute inset-0 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 blur-lg">
              MoF - ADB Joint Environmental Reatreat  <br /><span className="text-3xl">26 July 2025</span>
            </span>
            <span className="relative bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600">
              MoF - ADB Joint Environmental Reatreat  <br /><span className="text-3xl">26 July 2025</span>
            </span>
          </h1>
        </div>

        {/* Teams Carousel */}
        <div className={`mb-8 transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h2 className="text-3xl font-bold text-sky-900 text-center mb-8 flex items-center justify-center gap-3">
            <UsersRound className="w-14 h-14 text-blue-400" />
            Մրցակից թիմեր
          </h2>

          {/* Active Team Display */}
          <div className="relative h-64 mb-8">
            {teams.map((team, index) => (
              <div
                key={team.name}
                className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ${index === currentTeam ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                  }`}
              >
                <div
                  className="flex flex-col items-center text-center glass rounded-3xl p-8 shadow-2xl transform hover:scale-105 transition-transform cursor-pointer"
                  onMouseLeave={() => setHoveredTeam(null)}
                >
                  <div className={`text-sky-600 mb-4 transform ${hoveredTeam === index ? 'scale-110 rotate-6' : ''} transition-all duration-300`}>
                    {team.icon}
                  </div>
                  <h3 className={`text-5xl font-black mb-2 bg-clip-text text-transparent bg-gradient-to-r ${team.color}`}>
                    {team.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Games Grid */}
        <div className={`mb-8 transform transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h2 className="text-3xl md:text-4xl font-bold text-sky-900 text-center mb-8 flex items-center justify-center gap-3">
            <Flag className="w-10 h-10 text-emerald-500 animate-bounce" style={{ animationDuration: '3s' }} />
            Մարտահրավերներ
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {games.map((game, index) => (
              <div
                key={game.name}
                className={`group relative overflow-hidden glass rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 cursor-pointer ${game.bgColor}`}
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => toast(`${game.name}`, {
                  description: ` | Դժվարություն: ${game.difficulty} | Միավորներ: ${game.points}`,
                  icon: game.icon
                })}
              >
                {/* Game color accent */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${game.color} rounded-t-2xl`} />

                <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

                <div className="relative z-10">
                  <div className="text-5xl mb-3 transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-300">{game.icon}</div>
                  <h3 className="text-lg font-bold text-sky-900 mb-2">{game.name}</h3>

                  {/* Game color stripe */}
                  <div className={`w-full h-1 rounded-full bg-gradient-to-r ${game.color} mb-3 opacity-60 group-hover:opacity-100 transition-opacity duration-300`}></div>

                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2 text-amber-600 font-semibold">
                      <Trophy className="w-4 h-4" />
                      <span>{game.points}</span>
                    </div>
                    <div className={`text-xs font-bold flex items-center gap-1 ${game.difficulty === 'Բարձր' ? 'text-red-500' :
                      game.difficulty === 'Միջին' ? 'text-amber-500' :
                        'text-emerald-500'
                      }`}>
                      {game.difficulty === 'Բարձր' && <Flame className="w-3 h-3" />}
                      {game.difficulty === 'Միջին' && <Zap className="w-3 h-3" />}
                      {game.difficulty === 'Հեշտ' && <Star className="w-3 h-3" />}
                      {game.difficulty}
                    </div>
                  </div>
                </div>

                {/* Animated background element */}
                <div className={`absolute -bottom-10 -right-10 w-20 h-20 bg-gradient-to-br ${game.color} opacity-20 rounded-full blur-xl group-hover:w-32 group-hover:h-32 group-hover:opacity-30 transition-all duration-500`} />
              </div>
            ))}
          </div>

          {/* Games Legend */}
          <div className="mt-8 text-center">
            <h3 className="text-xl font-bold text-sky-900 mb-4">Խաղերի գունային ծածկագիր</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {games.map(game => (
                <div key={game.name} className="flex items-center gap-2 glass rounded-full px-4 py-2 hover:scale-105 transition-transform">
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${game.color}`}></div>
                  <span className="text-sm font-medium text-sky-900">{game.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className={`flex flex-col md:flex-row gap-6 justify-center items-center mb-8 transform transition-all duration-1000 delay-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <Link
            href="/scores"
            className="group relative inline-flex items-center gap-4 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 text-white font-black py-6 px-12 rounded-full text-xl shadow-2xl hover:shadow-cyan-500/50 transform hover:scale-105 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute inset-0 animate-shimmer" />

            <Play className="relative z-10 w-8 h-8 group-hover:animate-pulse" />
            <span className="relative z-10">ՍԿՍԵԼ ԽԱՂԸ</span>
            <ArrowRight className="relative z-10 w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
          </Link>

          <Link
            href="/scores/chart"
            className="group relative inline-flex items-center gap-4 glass text-sky-900 font-black py-6 px-12 rounded-full text-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            <Zap className="w-8 h-8 text-amber-500 group-hover:animate-bounce" />
            <span>ԱՐԴՅՈՒՆՔՆԵՐ</span>
          </Link>
        </div>

        {/* Statistics */}
        <div className={`grid grid-cols-3 gap-6 max-w-3xl mx-auto transform transition-all duration-1000 delay-900 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          {[
            { value: '3', label: 'Թիմեր', icon: <Users className="w-6 h-6 text-cyan-500" />, color: 'from-cyan-400 to-blue-500' },
            { value: '5', label: 'Մրցույթներ', icon: <Target className="w-6 h-6 text-emerald-500" />, color: 'from-emerald-400 to-teal-500' },
            { value: '125', label: 'Մաքս միավոր', icon: <Trophy className="w-6 h-6 text-amber-500" />, color: 'from-yellow-400 to-orange-500' }
          ].map((stat, index) => (
            <div key={index} className="text-center glass rounded-2xl p-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden">
              {/* Subtle gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`}></div>

              <div className="relative z-10">
                <div className="flex justify-center mb-2">{stat.icon}</div>
                <div className="text-4xl font-black text-sky-900 mb-2">{stat.value}</div>
                <div className="text-sky-700 font-semibold">{stat.label}</div>
              </div>

              {/* Color accent */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color} opacity-50`}></div>
            </div>
          ))}
        </div>
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-shimmer {
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%);
          background-size: 200% 100%;
          animation: shimmer 2s linear infinite;
        }

        .glass {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
}