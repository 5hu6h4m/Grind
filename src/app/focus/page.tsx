'use client';

import React, { useState, useEffect } from 'react';
import { Zap, Play, Pause, RotateCcw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { playFocusEndSound } from '@/lib/sound';

export default function FocusMode() {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Play a premium synthetic zen chime sound
      playFocusEndSound();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(25 * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <main className="min-h-screen p-6 md:p-10 max-w-7xl mx-auto flex flex-col items-center justify-center pb-24 relative">
      {/* Back Button */}
      <Link 
        href="/dashboard" 
        className="absolute top-8 left-8 inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </Link>
      <div className="glass p-12 rounded-[3rem] border border-neon-cyan/20 flex flex-col items-center justify-center shadow-[0_0_50px_rgba(34,211,238,0.1)] text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-neon-cyan/10 rounded-full blur-3xl -mr-20 -mt-20" />
        
        <div className="flex items-center gap-3 mb-8 relative z-10">
          <Zap className="w-8 h-8 text-neon-cyan" fill="currentColor" />
          <h1 className="text-2xl font-bold tracking-widest text-white uppercase">Focus Mode</h1>
        </div>

        <div className="text-[8rem] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500 leading-none mb-12 tabular-nums relative z-10">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>

        <div className="flex gap-6 relative z-10">
          <button 
            onClick={toggleTimer}
            className="flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-zinc-200 transition-all hover:scale-105"
          >
            {isActive ? <Pause className="w-6 h-6" fill="currentColor" /> : <Play className="w-6 h-6" fill="currentColor" />}
            {isActive ? 'Pause Focus' : 'Start Focus'}
          </button>
          
          <button 
            onClick={resetTimer}
            className="flex items-center justify-center w-16 h-16 rounded-full glass border border-border hover:bg-white/10 transition-all text-white hover:text-neon-cyan"
          >
            <RotateCcw className="w-6 h-6" />
          </button>
        </div>
      </div>
    </main>
  );
}
