import React from 'react';
import { Trophy, ArrowLeft, ShieldAlert, Award, Star, Flame, Zap, ZapOff, Clock, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  borderColor: string;
  shadowColor: string;
  isUnlocked: boolean;
  progressText: string;
}

export default async function AchievementsPage() {
  // Fetch real metrics from SQLite
  const habits = await prisma.habit.findMany({
    include: {
      completions: true,
    },
  });

  const focusSessions = await prisma.focusSession.findMany();

  // 1. Calculate total completions
  let totalCompletions = 0;
  habits.forEach((h) => {
    totalCompletions += h.completions.length;
  });

  // 2. Double Trouble (2+ completions in a single day)
  const completionsPerDay: { [key: string]: number } = {};
  habits.forEach((h) => {
    h.completions.forEach((c) => {
      const dateStr = c.date.toISOString().split('T')[0];
      completionsPerDay[dateStr] = (completionsPerDay[dateStr] || 0) + 1;
    });
  });
  const maxCompletionsInOneDay = Math.max(0, ...Object.values(completionsPerDay));

  // 3. Consistency Streak calculation
  let longestStreak = 0;
  let currentStreak = 0;
  let d = new Date();
  
  while (true) {
    const dateStr = d.toISOString().split('T')[0];
    let completedAny = false;
    
    for (const h of habits) {
      if (h.completions.some((c) => c.date.toISOString().split('T')[0] === dateStr)) {
        completedAny = true;
        break;
      }
    }

    if (completedAny) {
      currentStreak++;
      d.setDate(d.getDate() - 1);
    } else {
      if (currentStreak === 0) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yestStr = yesterday.toISOString().split('T')[0];
        let completedYest = false;
        for (const h of habits) {
          if (h.completions.some((c) => c.date.toISOString().split('T')[0] === yestStr)) {
            completedYest = true;
            break;
          }
        }
        if (completedYest) {
          d.setDate(d.getDate() - 1);
          continue;
        }
      }
      break;
    }
  }
  longestStreak = currentStreak; // Simulating active streak as long streak

  // 4. Focus session calculations
  const totalFocusCount = focusSessions.length;
  const totalFocusMins = focusSessions.reduce((acc, s) => acc + s.duration, 0);
  const totalFocusXp = focusSessions.reduce((acc, s) => acc + s.xpEarned, 0);

  // 5. Dynamic career XP
  const habitsXp = habits.reduce((acc, h) => acc + (h.completions.length * h.xp), 0);
  const totalCareerXp = 150 + habitsXp + totalFocusXp;

  // 6. Night Owl (Completion after 9:00 PM local time / hour >= 21)
  let nightOwlCompleted = false;
  habits.forEach((h) => {
    h.completions.forEach((c) => {
      const completionHour = c.date.getUTCHours() + 5.5; // Adjusted approx for IST +5:30 or local
      if (completionHour >= 21 || completionHour < 5) {
        nightOwlCompleted = true;
      }
    });
  });

  // Define Achievements list and evaluate unlock criteria
  const achievements: Achievement[] = [
    {
      id: 'first_step',
      title: 'First Step',
      description: 'Complete your first habit sprint.',
      icon: Star,
      color: 'text-neon-cyan',
      borderColor: 'border-neon-cyan/30',
      shadowColor: 'rgba(34,211,238,0.2)',
      isUnlocked: totalCompletions >= 1,
      progressText: `${Math.min(totalCompletions, 1)} / 1 Completion`,
    },
    {
      id: 'double_trouble',
      title: 'Double Trouble',
      description: 'Complete 2 or more habits in a single day.',
      icon: Award,
      color: 'text-neon-purple',
      borderColor: 'border-neon-purple/30',
      shadowColor: 'rgba(168,85,247,0.2)',
      isUnlocked: maxCompletionsInOneDay >= 2,
      progressText: `${Math.min(maxCompletionsInOneDay, 2)} / 2 Habits`,
    },
    {
      id: 'consistency_king',
      title: 'Consistency King',
      description: 'Build a 3-day consistency streak.',
      icon: Flame,
      color: 'text-warning',
      borderColor: 'border-warning/30',
      shadowColor: 'rgba(245,158,11,0.2)',
      isUnlocked: longestStreak >= 3,
      progressText: `${Math.min(longestStreak, 3)} / 3 Days`,
    },
    {
      id: 'elite_streak',
      title: 'Elite Warrior',
      description: 'Achieve a legendary 7-day consistency streak.',
      icon: ShieldCheck,
      color: 'text-success',
      borderColor: 'border-success/30',
      shadowColor: 'rgba(34,197,94,0.2)',
      isUnlocked: longestStreak >= 7,
      progressText: `${Math.min(longestStreak, 7)} / 7 Days`,
    },
    {
      id: 'focus_recruit',
      title: 'Focus Recruit',
      description: 'Successfully log your first deep Focus Session.',
      icon: Zap,
      color: 'text-neon-cyan',
      borderColor: 'border-neon-cyan/30',
      shadowColor: 'rgba(34,211,238,0.2)',
      isUnlocked: totalFocusCount >= 1,
      progressText: `${Math.min(totalFocusCount, 1)} / 1 Session`,
    },
    {
      id: 'deep_work_guru',
      title: 'Deep Work Guru',
      description: 'Invest 100+ total minutes in Focus Mode.',
      icon: Clock,
      color: 'text-neon-purple',
      borderColor: 'border-neon-purple/30',
      shadowColor: 'rgba(168,85,247,0.2)',
      isUnlocked: totalFocusMins >= 100,
      progressText: `${Math.min(totalFocusMins, 100)} / 100 Mins`,
    },
    {
      id: 'legendary_grinder',
      title: 'Legendary Warrior',
      description: 'Accumulate a career total of 500+ XP.',
      icon: Trophy,
      color: 'text-warning',
      borderColor: 'border-warning/30',
      shadowColor: 'rgba(245,158,11,0.2)',
      isUnlocked: totalCareerXp >= 500,
      progressText: `${Math.min(totalCareerXp, 500)} / 500 XP`,
    },
    {
      id: 'night_owl',
      title: 'Night Owl',
      description: 'Crush your habits after 9:00 PM in the evening.',
      icon: Star,
      color: 'text-success',
      borderColor: 'border-success/30',
      shadowColor: 'rgba(34,197,94,0.2)',
      isUnlocked: nightOwlCompleted,
      progressText: nightOwlCompleted ? 'Unlocked' : '0 / 1 Late Completion',
    },
  ];

  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;

  return (
    <main className="min-h-screen p-4 md:p-10 max-w-7xl mx-auto flex flex-col gap-8 pb-24 relative bg-[#060608] text-zinc-300">
      
      {/* Visual Ambient Glows */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-[45vw] h-[45vw] rounded-full bg-neon-cyan/5 blur-[130px] animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="absolute bottom-[20%] right-[10%] w-[40vw] h-[40vw] rounded-full bg-neon-purple/5 blur-[120px] animate-pulse" style={{ animationDuration: '12s' }} />
      </div>

      {/* Header panel */}
      <header className="relative z-10 flex items-center justify-between mt-8 md:mt-0">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-semibold"
        >
          <ArrowLeft className="w-4.5 h-4.5" />
          <span>Back to Dashboard</span>
        </Link>
        <div className="flex items-center gap-2 text-xs font-bold text-warning bg-warning/10 border border-warning/20 px-3.5 py-1 rounded-full">
          <Trophy className="w-3.5 h-3.5" />
          <span>Achievements Room</span>
        </div>
      </header>

      {/* Score and level summary banner */}
      <section className="relative z-10 glass p-8 rounded-3xl border border-white/5 bg-white/[0.01] flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
        
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-warning/15 rounded-2xl flex items-center justify-center border border-warning/40 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
            <Trophy className="w-8 h-8 text-warning" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white">Trophy Arena</h1>
            <p className="text-zinc-500 text-xs mt-1">Unlock epic accomplishments as you level up your daily execution.</p>
          </div>
        </div>

        <div className="flex items-center gap-8 border-l border-white/5 pl-8 md:border-l md:pl-8 flex-shrink-0">
          <div className="flex flex-col text-right">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Unlocked Badges</span>
            <span className="text-3xl font-black text-white mt-1">{unlockedCount} / {achievements.length}</span>
          </div>
          <div className="h-12 w-[1px] bg-white/10" />
          <div className="flex flex-col text-right">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Career XP</span>
            <span className="text-3xl font-black text-warning mt-1">+{totalCareerXp} XP</span>
          </div>
        </div>

        <div className="absolute top-0 right-0 w-64 h-64 bg-warning/5 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Badges Grid Layout */}
      <section className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {achievements.map((item) => {
          const Icon = item.icon;
          
          return (
            <div 
              key={item.id}
              className={`glass p-6 rounded-3xl border flex flex-col items-center text-center gap-4 relative overflow-hidden transition-all duration-300 ${
                item.isUnlocked 
                  ? `${item.borderColor} bg-white/[0.015] hover:bg-white/[0.03] hover:-translate-y-1 hover:shadow-2xl`
                  : 'border-white/5 bg-white/[0.002] opacity-40 hover:opacity-50'
              }`}
              style={{
                boxShadow: item.isUnlocked ? `0 10px 30px -15px ${item.shadowColor}` : 'none'
              }}
            >
              
              {/* Badge Icon Slot */}
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border transition-all ${
                item.isUnlocked 
                  ? `bg-white/5 ${item.borderColor}`
                  : 'bg-white/[0.02] border-white/10'
              }`}>
                {item.isUnlocked ? (
                  <Icon className={`w-8 h-8 ${item.color}`} fill="currentColor" />
                ) : (
                  <ZapOff className="w-8 h-8 text-zinc-600" />
                )}
              </div>

              {/* Badge Title & Text */}
              <div className="flex flex-col gap-1.5 flex-1">
                <h4 className={`text-base font-bold transition-colors ${item.isUnlocked ? 'text-white' : 'text-zinc-500'}`}>
                  {item.title}
                </h4>
                <p className="text-xs text-zinc-500 leading-relaxed font-normal">
                  {item.description}
                </p>
              </div>

              {/* Badge Progress Tracker */}
              <div className="w-full mt-2 pt-3 border-t border-white/5 flex flex-col gap-1.5">
                <div className="flex justify-between text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                  <span>Progress</span>
                  <span className={item.isUnlocked ? item.color : 'text-zinc-600'}>
                    {item.isUnlocked ? 'Completed' : 'Locked'}
                  </span>
                </div>
                <div className="text-[10px] font-bold text-white tracking-wide text-left">
                  {item.progressText}
                </div>
              </div>

              {/* Premium locked background layer lock indicator */}
              {!item.isUnlocked && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-white/[0.02] border border-white/10 flex items-center justify-center">
                  <span className="text-[10px] text-zinc-600 font-black">L</span>
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* Dynamic Motivational Tip */}
      <section className="relative z-10 glass p-5 rounded-2xl border border-neon-cyan/20 bg-neon-cyan/5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-neon-cyan/20 flex items-center justify-center border border-neon-cyan/40 mt-0.5 flex-shrink-0">
          <Clock className="w-5 h-5 text-neon-cyan" />
        </div>
        <div>
          <h4 className="font-bold text-white text-sm">Discipline Hint</h4>
          <p className="text-xs text-zinc-400 leading-relaxed mt-1">
            Focus Mode sprints award dynamic XP based on your timer. Keep a 7-day habits streak active to unlock the Elite Streak medal!
          </p>
        </div>
      </section>

    </main>
  );
}
