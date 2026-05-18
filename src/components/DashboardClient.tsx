'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import HabitCard from '@/components/HabitCard';
import AddHabitModal, { HabitData } from '@/components/AddHabitModal';
import { Target, Zap, Trophy, TrendingUp, Plus, Flame, Sparkles, BookOpen, ChevronRight, Play } from 'lucide-react';
import { addHabit, toggleHabit, deleteHabit, editHabit } from '@/app/actions';

interface DashboardClientProps {
  initialHabits: HabitData[];
  initialFocusXp: number;
}

export default function DashboardClient({ initialHabits, initialFocusXp }: DashboardClientProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [habits, setHabits] = useState<HabitData[]>(initialHabits);
  const [habitToDelete, setHabitToDelete] = useState<string | null>(null);

  const handleAddHabit = async (newHabit: Omit<HabitData, 'id' | 'streak' | 'completedDates'>) => {
    // Optimistic update
    const tempId = Math.random().toString(36).substr(2, 9);
    const habit: HabitData = {
      ...newHabit,
      id: tempId,
      streak: 0,
      completedDates: [],
    };
    setHabits([...habits, habit]);
    
    // Server action
    try {
      const savedHabit = await addHabit({
        title: newHabit.title,
        category: newHabit.category,
        xp: newHabit.xp,
        color: newHabit.color,
      });
      if (savedHabit && savedHabit.id) {
        setHabits(prev => prev.map(h => h.id === tempId ? { ...h, id: savedHabit.id } : h));
      }
    } catch (e) {
      console.error("Failed to save habit:", e);
      // Revert optimistic update on error
      setHabits(prev => prev.filter(h => h.id !== tempId));
    }
  };

  const handleToggleHabit = async (id: string, isCompleted: boolean) => {
    // Determine local today string (YYYY-MM-DD)
    const d = new Date();
    const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    // Optimistic update for habits
    setHabits(habits.map(h => {
      if (h.id === id) {
        const newDates = isCompleted 
          ? [...h.completedDates, todayStr]
          : h.completedDates.filter(d => d !== todayStr);
        return { ...h, completedDates: newDates };
      }
      return h;
    }));



    // Server action
    await toggleHabit(id, isCompleted, todayStr);
  };

  // Helper for today's status
  const d = new Date();
  const todayStrLocal = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const isHabitCompletedToday = (h: HabitData) => h.completedDates.includes(todayStrLocal);

  const handleDeleteHabit = (id: string) => {
    setHabitToDelete(id);
  };

  const handleEditHabit = async (id: string, updatedData: { title: string; category: string; xp: number; color: 'purple' | 'cyan' | 'green' | 'orange' }) => {
    setHabits(habits.map(h => h.id === id ? { ...h, ...updatedData } : h));
    await editHabit(id, updatedData);
  };

  // Calculate dynamic stats based on optimistic state
  const habitsXp = habits.reduce((acc, h) => acc + (h.completedDates.length * h.xp), 0);
  const totalXp = 150 + initialFocusXp + habitsXp;
  const completedCount = habits.filter(h => isHabitCompletedToday(h)).length;
  const progressPercent = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;
  
  // Calculate user level dynamically based on totalXp (350 XP per level)
  const currentLevel = Math.floor(totalXp / 350) + 1;
  
  // Warrior ranks
  let warriorRank = 'Beginner';
  if (currentLevel >= 2) warriorRank = 'Consistency';
  if (currentLevel >= 3) warriorRank = 'Focus Sentinel';
  if (currentLevel >= 5) warriorRank = 'Discipline Master';
  if (currentLevel >= 10) warriorRank = 'Ultimate Conqueror';

  const longestStreak = habits.reduce((acc, h) => Math.max(acc, h.streak), 0);
  
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
            <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Level {currentLevel}</span>
            <span className="text-sm font-medium text-white">{warriorRank}</span>
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
          { label: 'Longest Streak', value: `${longestStreak} Days`, icon: Trophy, color: 'text-warning' },
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
                  completedDates={habit.completedDates}
                  isCompletedInitial={isHabitCompletedToday(habit)} 
                  onToggle={handleToggleHabit}
                  onDelete={() => handleDeleteHabit(habit.id)}
                  onEdit={(data) => handleEditHabit(habit.id, data)}
                />
              ))
            )}
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

      {/* Dynamic Motivational Banner if all habits completed */}
      {habits.length > 0 && completedCount === habits.length && (
        <div className="glass p-6 rounded-2xl border border-warning/30 bg-warning/5 shadow-[0_0_25px_rgba(245,158,11,0.15)] flex items-center justify-between gap-4 mt-6 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center border border-warning/50">
              <Flame className="w-5 h-5 text-warning" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">🔥 FLUSH DEFEAT!</h4>
              <p className="text-xs text-zinc-400 mt-0.5">All of today's habits have been successfully completed! Level up your grind!</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-warning uppercase bg-warning/10 px-2.5 py-1 rounded-full border border-warning/20">Mastery</span>
        </div>
      )}

      {/* Bottom Section: Focus Quick-Launcher & Wisdom Capsule */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-white/5 pt-8 mt-6">
        {/* Focus Launcher Widget */}
        <div className="glass p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col justify-between gap-6 relative overflow-hidden group">
          <div className="relative z-10 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-white font-semibold">
              <Play className="w-4 h-4 text-neon-cyan" />
              <h3>Quick Focus Arena</h3>
            </div>
            <p className="text-sm text-zinc-500">Jump directly into deep work or a coding sprint with visual ambient timers.</p>
          </div>

          <div className="flex gap-2 relative z-10">
            {['Deep Work', 'LeetCode Grind', 'Quick Sprint'].map((preset, idx) => (
              <button
                key={idx}
                onClick={() => router.push('/focus')}
                className="text-xs bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/5 text-zinc-300 font-medium transition-colors"
              >
                {preset}
              </button>
            ))}
          </div>

          <button
            onClick={() => router.push('/focus')}
            className="w-full bg-neon-cyan/20 border border-neon-cyan/30 text-neon-cyan font-semibold py-3 rounded-xl transition-all hover:bg-neon-cyan hover:text-black flex items-center justify-center gap-2"
          >
            <span>Enter Focus Mode</span>
            <ChevronRight className="w-4 h-4" />
          </button>
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-neon-cyan/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-neon-cyan/10 transition-colors" />
        </div>

        {/* Wisdom Capsule */}
        <div className="glass p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col justify-between gap-4 relative overflow-hidden group">
          <div className="flex items-center gap-2 text-white font-semibold">
            <BookOpen className="w-4 h-4 text-neon-purple" />
            <h3>Warrior Wisdom</h3>
          </div>

          <blockquote className="text-zinc-300 italic text-sm border-l-2 border-neon-purple/50 pl-4 py-1 leading-relaxed">
            "We are what we repeatedly do. Excellence, then, is not an act, but a habit."
            <span className="block text-xs text-zinc-500 font-medium mt-1.5 not-italic">— Aristotle</span>
          </blockquote>

          <div className="text-[11px] text-zinc-500 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-neon-purple" />
            <span>Wisdom updates every time you crush your daily targets.</span>
          </div>

          <div className="absolute top-0 right-0 w-32 h-32 bg-neon-purple/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-neon-purple/10 transition-colors" />
        </div>
      </div>

      <AddHabitModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAddHabit={handleAddHabit} 
      />

      {habitToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div 
            onClick={() => setHabitToDelete(null)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <div className="glass relative w-full max-w-sm p-6 rounded-2xl border border-white/10 shadow-2xl z-10 bg-zinc-950/80">
            <h3 className="text-lg font-bold text-white mb-2">Delete Habit?</h3>
            <p className="text-sm text-zinc-400 mb-6 font-normal">
              Are you sure you want to delete this habit? This action cannot be undone and you will lose all completion history.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setHabitToDelete(null)}
                className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const id = habitToDelete;
                  setHabitToDelete(null);
                  setHabits(habits.filter(h => h.id !== id));
                  await deleteHabit(id);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-500 rounded-lg shadow-[0_2px_10px_rgba(220,38,38,0.3)] transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
