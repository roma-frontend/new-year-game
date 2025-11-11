"use client"

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Snowflake, Gift, Star, Sparkles, PartyPopper, Heart, Wine, Users, LucideIcon } from 'lucide-react';

interface Particle {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  icon: LucideIcon;
}

const NewYearLanding = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate random particles
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 7,
      size: 15 + Math.random() * 25,
      icon: [Snowflake, Star, Gift, Heart][Math.floor(Math.random() * 4)]
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-purple-950 to-red-950 relative overflow-hidden">
      {/* Animated particles background */}
      <div className="fixed inset-0 pointer-events-none">
        {particles.map((particle) => {
          const Icon = particle.icon;
          return (
            <div
              key={particle.id}
              className="absolute animate-float"
              style={{
                left: `${particle.left}%`,
                top: `-50px`,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration}s`,
              }}
            >
              <Icon 
                className="text-white/20"
                style={{
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Gradient orbs */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        
        {/* Top decorative elements */}
        <div className="flex gap-8 mb-8 animate-bounce">
          <Sparkles className="w-16 h-16 text-yellow-300" />
          <Gift className="w-16 h-16 text-red-400" />
          <Sparkles className="w-16 h-16 text-yellow-300" />
        </div>

        {/* Main title */}
        <div className="text-center mb-12 space-y-6">
          <h1 className="text-7xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-red-300 to-pink-300 drop-shadow-2xl animate-pulse">
            Ամանորյա
          </h1>
          <h2 className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-purple-300 to-pink-300 drop-shadow-2xl">
            Խաղեր
          </h2>
          
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
              <div className="flex items-center gap-2 text-white">
                <Users className="w-5 h-5" />
                <span className="font-semibold">10 Խաղ</span>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
              <div className="flex items-center gap-2 text-white">
                <PartyPopper className="w-5 h-5" />
                <span className="font-semibold">Խմբային</span>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
              <div className="flex items-center gap-2 text-white">
                <Heart className="w-5 h-5" />
                <span className="font-semibold">Ֆլիրտավոր</span>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="max-w-2xl mx-auto mb-12">
          <p className="text-2xl md:text-3xl text-center text-white/90 leading-relaxed backdrop-blur-sm bg-white/5 p-8 rounded-3xl border border-white/10">
            Զվարճալի և ինտերակտիվ խաղեր աշխատավայրի 
            <span className="text-yellow-300 font-bold"> Ամանորյա </span>
            և 
            <span className="text-red-300 font-bold"> Սուրբ Ծննդյան </span>
            տոների համար
          </p>
        </div>

        {/* CTA Button */}
        <div className="space-y-6">
          <Button
            onClick={() => window.location.href = '/new-year'}
            className="group relative px-12 py-8 text-3xl font-bold rounded-2xl overflow-hidden transition-all duration-300 hover:scale-110 hover:shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 animate-gradient"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-red-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative z-10 flex items-center gap-4">
              <Gift className="w-10 h-10 animate-bounce" />
              Սկսել Խաղալ
              <PartyPopper className="w-10 h-10 animate-bounce" style={{ animationDelay: '0.2s' }} />
            </span>
          </Button>

          <p className="text-center text-white/60 text-lg">
            Տպեք քարտերը և վայելեք խաղերը ձեր թիմի հետ! 🎄
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-5xl mx-auto w-full">
          <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-gradient-to-br from-red-400 to-pink-500 rounded-full">
                <Wine className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">Ուտեստներ & Խմիչքներ</h3>
              <p className="text-white/80">Խաղերը ինտեգրված են համով ուտեստների և խմիչքների հետ</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">Դերային Քարտեր</h3>
              <p className="text-white/80">Յուրաքանչյուր խաղացող ունի իր յուրահատուկ դերը</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">Տպագրվող PDF</h3>
              <p className="text-white/80">Գեղեցիկ ձևավորված քարտեր տպագրության համար</p>
            </div>
          </div>
        </div>

        {/* Bottom decorative text */}
        <div className="mt-20 text-center">
          <p className="text-4xl font-bold text-white/40 animate-pulse">
            🎄 Շնորհավոր Նոր Տարի և Սուրբ Ծնունդ 🎄
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(-50px) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .animate-float {
          animation: float linear infinite;
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default NewYearLanding;