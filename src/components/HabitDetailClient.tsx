'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Target, Zap, Check, Flame, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FullHeatmap from '@/components/FullHeatmap';
import { toggleHabit } from '@/app/actions';
import { cn } from '@/lib/utils';
import { playTickSound } from '@/lib/sound';

interface Completion {
  id: string;
  date: Date;
  habitId: string;
}

interface Habit {
  id: string;
  title: string;
  category: string;
  xp: number;
  color: string;
  completions: Completion[];
}

interface HabitDetailClientProps {
  habit: Habit;
  initialCompletedDates: string[];
}

export default function HabitDetailClient({ habit, initialCompletedDates }: HabitDetailClientProps) {
  const [completedDates, setCompletedDates] = useState<string[]>(initialCompletedDates);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Helper for today's date string (YYYY-MM-DD)
  const todayStr = React.useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  const isCompletedToday = completedDates.includes(todayStr);

  // Calculate dynamic streak and active days
  const { streak, totalActiveDays } = React.useMemo(() => {
    const activeDays = completedDates.length;
    
    let currentStreak = 0;
    if (completedDates.length > 0) {
      const sortedDates = [...completedDates].sort();
      let tempStreak = 1;
      let maxStreak = 0;
      
      for (let i = 1; i < sortedDates.length; i++) {
        const d1 = new Date(sortedDates[i - 1]);
        const d2 = new Date(sortedDates[i]);
        const diffTime = Math.abs(d2.getTime() - d1.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          tempStreak++;
        } else if (diffDays > 1) {
          if (tempStreak > maxStreak) maxStreak = tempStreak;
          tempStreak = 1;
        }
      }
      if (tempStreak > maxStreak) maxStreak = tempStreak;

      // Current streak check
      let cStreak = 0;
      const today = new Date();
      today.setHours(0,0,0,0);
      const activityMap = completedDates.reduce((acc, date) => ({ ...acc, [date]: true }), {} as Record<string, boolean>);
      
      for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        const dateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
        if (activityMap[dateStr]) {
          cStreak++;
        } else {
          if (i !== 0) break;
        }
      }
      currentStreak = cStreak;
    }

    return {
      streak: currentStreak,
      totalActiveDays: activeDays
    };
  }, [completedDates]);

  const handleToggleComplete = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    
    const newState = !isCompletedToday;
    
    // Optimistic Update
    if (newState) {
      setCompletedDates([...completedDates, todayStr]);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1200);

      // Play synthetic premium click sound
      playTickSound();
    } else {
      setCompletedDates(completedDates.filter(d => d !== todayStr));
    }

    try {
      // Server Action
      await toggleHabit(habit.id, newState, todayStr);
    } catch (err) {
      // Revert state on error
      if (newState) {
        setCompletedDates(completedDates.filter(d => d !== todayStr));
      } else {
        setCompletedDates([...completedDates, todayStr]);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <main className="min-h-screen p-6 md:p-10 max-w-5xl mx-auto flex flex-col gap-8 pb-24 relative">
      {/* Header */}
      <header className="flex flex-col gap-4">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors self-start mb-4 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center border bg-white/5 border-white/10 shadow-lg">
              <Target className="w-8 h-8 text-white opacity-80" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-1.5">{habit.title}</h1>
              <p className="text-zinc-400 text-sm md:text-base flex items-center gap-2">
                {habit.category} • <Zap className="w-4 h-4 text-neon-cyan" /> {habit.xp} XP per completion
              </p>
            </div>
          </div>

          {/* Interactive Tick / Complete Option */}
          <div className="relative">
            <button
              onClick={handleToggleComplete}
              disabled={isUpdating}
              className={cn(
                "relative flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl font-semibold text-sm transition-all duration-300 shadow-xl border overflow-hidden focus:outline-none",
                isCompletedToday
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 group"
                  : "bg-emerald-500 border-emerald-600 text-white hover:bg-emerald-400 hover:scale-[1.02]"
              )}
            >
              <AnimatePresence mode="wait">
                {isCompletedToday ? (
                  <motion.span 
                    key="completed"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex items-center gap-2"
                  >
                    <Check className="w-5 h-5 stroke-[3] group-hover:hidden" />
                    <span className="group-hover:hidden">Completed for Today</span>
                    <span className="hidden group-hover:inline">Undo Completion?</span>
                  </motion.span>
                ) : (
                  <motion.span 
                    key="not-completed"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex items-center gap-2"
                  >
                    <Check className="w-5 h-5 stroke-[3]" />
                    <span>Complete Today</span>
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Confetti bubble effect */}
              <AnimatePresence>
                {showConfetti && (
                  <motion.div
                    initial={{ scale: 0, opacity: 1 }}
                    animate={{ scale: 2.2, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 rounded-2xl bg-emerald-400/30 pointer-events-none"
                  />
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active Days', value: totalActiveDays, icon: Trophy, color: 'text-zinc-400' },
          { label: 'Streak', value: `${streak} Days`, icon: Flame, color: 'text-warning' },
          { label: 'Total XP', value: `${totalActiveDays * habit.xp} XP`, icon: Zap, color: 'text-neon-cyan' }
        ].map((stat, i) => (
          <div key={i} className="glass p-5 rounded-2xl border border-white/5 bg-white/[0.02] flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-zinc-500 uppercase tracking-wider font-semibold">
              <span>{stat.label}</span>
              <stat.icon className={cn("w-4 h-4", stat.color)} />
            </div>
            <span className="text-xl md:text-2xl font-bold text-white">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Heatmap Section */}
      <section className="mt-4">
        <FullHeatmap 
          completedDates={completedDates} 
          colorTheme={habit.color as any} 
        />
      </section>
    </main>
  );
}
