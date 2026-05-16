'use client';

import React, { useState } from 'react';
import Heatmap from '@/components/Heatmap';
import HabitCard from '@/components/HabitCard';
import AddHabitModal, { HabitData } from '@/components/AddHabitModal';
import { Target, Zap, Trophy, TrendingUp, Plus } from 'lucide-react';

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [habits, setHabits] = useState<HabitData[]>([]);

  const handleAddHabit = (newHabit: Omit<HabitData, 'id' | 'streak' | 'isCompletedToday'>) => {
    const habit: HabitData = {
      ...newHabit,
      id: Math.random().toString(36).substr(2, 9),
      streak: 0,
      isCompletedToday: false,
    };
    setHabits([...habits, habit]);
  };

  const handleToggleHabit = (id: string, isCompleted: boolean) => {
    setHabits(habits.map(h => h.id === id ? { ...h, isCompletedToday: isCompleted } : h));
  };

  // Calculate dynamic stats
  const totalXp = habits.reduce((acc, h) => acc + (h.isCompletedToday ? h.xp : 0), 0) + (habits.length > 0 ? 150 : 0); // Starting with 150 base XP
  const completedCount = habits.filter(h => h.isCompletedToday).length;
  const progressPercent = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;
  
  // Dynamic offset for SVG circle (circumference is ~502)
  const circleOffset = 502 - (502 * progressPercent) / 100;

  return (
    <main className="min-h-screen p-6 md:p-10 max-w-7xl mx-auto flex flex-col gap-8 pb-24">
      
      {/* Header & Welcome */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-8 md:mt-0">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-cyan">Warrior</span>
          </h1>
          <p className="text-zinc-400">"Small consistency beats massive short-term effort."</p>
        </div>
        <div className="flex items-center gap-4 glass px-5 py-2.5 rounded-full border border-border">
          <div className="flex flex-col text-right">
            <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Level 1</span>
            <span className="text-sm font-medium text-white">Beginner</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-neon-purple/20 flex items-center justify-center border border-neon-purple/50">
            <Trophy className="w-5 h-5 text-neon-purple" />
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total XP', value: totalXp.toLocaleString(), icon: Zap, color: 'text-neon-cyan' },
          { label: 'Tasks Today', value: `${completedCount} / ${habits.length}`, icon: Target, color: 'text-neon-purple' },
          { label: 'Longest Streak', value: '0 Days', icon: Trophy, color: 'text-warning' },
          { label: 'Consistency', value: `${progressPercent}%`, icon: TrendingUp, color: 'text-success' },
        ].map((stat, i) => (
          <div key={i} className="glass p-5 rounded-2xl border border-border flex flex-col gap-3 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400 font-medium">{stat.label}</span>
              <stat.icon className={`w-4 h-4 ${stat.color} opacity-70`} />
            </div>
            <span className="text-2xl font-bold text-white">{stat.value}</span>
            <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white/5 rounded-full blur-xl group-hover:bg-white/10 transition-colors" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Habits */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-neon-cyan" />
              Today's Grind
            </h2>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 text-sm font-medium bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg text-neon-purple transition-all border border-neon-purple/20 hover:border-neon-purple/50"
            >
              <Plus className="w-4 h-4" />
              New Habit
            </button>
          </div>
          
          <div className="flex flex-col gap-3">
            {habits.length === 0 ? (
              <div className="glass p-10 rounded-2xl border border-dashed border-border flex flex-col items-center justify-center text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                  <Target className="w-8 h-8 text-zinc-500" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">No Habits Yet</h3>
                  <p className="text-zinc-500 mt-1 max-w-sm">Start your journey by adding your first habit. Consistency starts with a single step.</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="mt-2 bg-neon-purple hover:bg-neon-purple/90 text-white px-6 py-2.5 rounded-xl font-medium transition-all"
                >
                  Create Habit
                </button>
              </div>
            ) : (
              habits.map((habit) => (
                <HabitCard 
                  key={habit.id}
                  id={habit.id}
                  title={habit.title} 
                  category={habit.category} 
                  streak={habit.streak} 
                  xp={habit.xp} 
                  color={habit.color} 
                  isCompletedInitial={habit.isCompletedToday} 
                  onToggle={handleToggleHabit}
                />
              ))
            )}
          </div>

          <div className="mt-4">
            <Heatmap />
          </div>
        </div>

        {/* Right Column: Progress Ring & Motivation */}
        <div className="flex flex-col gap-6">
          
          {/* Progress Ring Card */}
          <div className="glass p-6 rounded-2xl border border-border flex flex-col items-center justify-center relative overflow-hidden">
            <h3 className="text-lg font-semibold text-white mb-6 self-start w-full text-center">Daily Progress</h3>
            
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="96" cy="96" r="80" className="stroke-white/10" strokeWidth="12" fill="none" />
                <circle 
                  cx="96" cy="96" r="80" 
                  className="stroke-neon-purple transition-all duration-1000 ease-out" 
                  strokeWidth="12" fill="none" 
                  strokeDasharray="502" 
                  strokeDashoffset={habits.length === 0 ? 502 : circleOffset} 
                  strokeLinecap="round"
                  style={{ filter: 'drop-shadow(0 0 8px rgba(168,85,247,0.5))' }}
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-white">{progressPercent}%</span>
                <span className="text-sm text-zinc-400">Complete</span>
              </div>
            </div>

            <div className="mt-8 w-full">
              <div className="flex justify-between text-xs text-zinc-400 mb-2">
                <span>XP to Level 2</span>
                <span>{totalXp} / 500 XP</span>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-neon-purple to-neon-cyan rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)] transition-all duration-500" 
                  style={{ width: `${Math.min((totalXp / 500) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* AI Coach Suggestion */}
          <div className="glass p-5 rounded-2xl border border-neon-cyan/30 bg-neon-cyan/5 relative overflow-hidden">
            <div className="flex items-start gap-3 relative z-10">
              <div className="w-8 h-8 rounded-full bg-neon-cyan/20 flex items-center justify-center flex-shrink-0 mt-1 border border-neon-cyan/50">
                <Zap className="w-4 h-4 text-neon-cyan" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm mb-1">AI Coach Insight</h4>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  Start by adding 2-3 small habits. Don't overwhelm yourself on day one. Consistency is the key to victory.
                </p>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-neon-cyan/10 rounded-full blur-2xl -mr-10 -mt-10" />
          </div>

        </div>
      </div>

      <AddHabitModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAddHabit={handleAddHabit} 
      />
    </main>
  );
}
