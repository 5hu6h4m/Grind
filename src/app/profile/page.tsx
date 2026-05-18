import React from 'react';
import { User, ArrowLeft, Zap, Award, Target, Flame, Shield, ShieldCheck, Database, Calendar } from 'lucide-react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  // Fetch stats from SQLite
  const habits = await prisma.habit.findMany({
    include: {
      completions: true,
    },
  });

  const focusSessions = await prisma.focusSession.findMany();

  // Completions count
  let totalCompletions = 0;
  habits.forEach((h) => {
    totalCompletions += h.completions.length;
  });

  // Streaks
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

  // Focus Sprints
  const focusCount = focusSessions.length;
  const focusMins = focusSessions.reduce((acc, s) => acc + s.duration, 0);
  const focusXp = focusSessions.reduce((acc, s) => acc + s.xpEarned, 0);

  // Career XP
  const habitsXp = habits.reduce((acc, h) => acc + (h.completions.length * h.xp), 0);
  const careerXp = 150 + habitsXp + focusXp;

  // Level Progression: 350 XP per level
  const xpPerLevel = 350;
  const currentLevel = Math.floor(careerXp / xpPerLevel) + 1;
  const xpInCurrentLevel = careerXp % xpPerLevel;
  const progressPercent = Math.min(100, Math.round((xpInCurrentLevel / xpPerLevel) * 100));

  // Circular gauge offset (circumference is ~440 for radius 70)
  const strokeCircumference = 2 * Math.PI * 70;
  const strokeDashoffset = strokeCircumference - (progressPercent / 100) * strokeCircumference;

  // Warrior titles based on level
  let warriorTitle = 'Beginner Grinder';
  if (currentLevel >= 2) warriorTitle = 'Consistency Neophyte';
  if (currentLevel >= 3) warriorTitle = 'Focus Sentinel';
  if (currentLevel >= 5) warriorTitle = 'Discipline Master';
  if (currentLevel >= 10) warriorTitle = 'Ultimate Conqueror';

  return (
    <main className="min-h-screen p-4 md:p-10 max-w-7xl mx-auto flex flex-col gap-8 pb-24 relative bg-[#060608] text-zinc-300">
      
      {/* Background glow glows */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[20%] w-[35vw] h-[35vw] rounded-full bg-neon-cyan/5 blur-[130px] animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="absolute bottom-[20%] right-[20%] w-[35vw] h-[35vw] rounded-full bg-neon-purple/5 blur-[130px] animate-pulse" style={{ animationDuration: '12s' }} />
      </div>

      {/* Header back button */}
      <header className="relative z-10 flex items-center justify-between mt-8 md:mt-0">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-semibold"
        >
          <ArrowLeft className="w-4.5 h-4.5" />
          <span>Back to Dashboard</span>
        </Link>
        <div className="flex items-center gap-2 text-xs font-bold text-neon-cyan bg-neon-cyan/10 border border-neon-cyan/20 px-3.5 py-1 rounded-full">
          <User className="w-3.5 h-3.5" />
          <span>Warrior Profile</span>
        </div>
      </header>

      {/* Profile summary screen */}
      <section className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Card: Level ring gauge */}
        <div className="glass p-8 rounded-[3rem] border border-white/5 bg-white/[0.01] flex flex-col items-center justify-center text-center relative overflow-hidden">
          
          <div className="relative w-52 h-52 flex items-center justify-center mb-6">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="104" cy="104" r="70" className="stroke-white/[0.03]" strokeWidth="10" fill="none" />
              <circle 
                cx="104" cy="104" r="70" 
                className="stroke-neon-cyan transition-all duration-1000 ease-out" 
                strokeWidth="10" fill="none" 
                strokeDasharray={strokeCircumference} 
                strokeDashoffset={strokeDashoffset} 
                strokeLinecap="round"
                style={{ filter: 'drop-shadow(0 0 8px rgba(34,211,238,0.4))' }}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Level</span>
              <span className="text-5xl font-black text-white leading-none mt-1">{currentLevel}</span>
              <span className="text-[9px] text-zinc-400 font-bold mt-2 uppercase tracking-wide">
                {progressPercent}% Up
              </span>
            </div>
          </div>

          <h2 className="text-xl font-black text-white tracking-tight">{warriorTitle}</h2>
          <span className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest mt-1">XP Career Rank</span>
          
          <div className="w-full mt-8 border-t border-white/5 pt-6 flex justify-between text-xs font-semibold text-zinc-500">
            <span>Next Level</span>
            <span className="text-white">{xpInCurrentLevel} / {xpPerLevel} XP</span>
          </div>
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mt-2.5">
            <div 
              className="h-full bg-gradient-to-r from-neon-purple to-neon-cyan rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="absolute top-0 right-0 w-32 h-32 bg-neon-cyan/5 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Center/Right Cards: Career stats & Dev logs */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Career statistics dashboard grid */}
          <div className="glass p-6 rounded-3xl border border-white/5 bg-white/[0.01]">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-6 flex items-center gap-2">
              <ShieldCheck className="w-4.5 h-4.5 text-neon-cyan" />
              Execution Statistics
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[
                { label: 'Total Career XP', value: careerXp.toLocaleString(), desc: 'Points accumulated', icon: Zap, color: 'text-neon-cyan' },
                { label: 'Active Streak', value: `${currentStreak} Days`, desc: 'Continuous grind', icon: Flame, color: 'text-warning' },
                { label: 'Logged Sprints', value: totalCompletions, desc: 'Task executions', icon: Target, color: 'text-success' },
                { label: 'Focus Sprints', value: focusCount, desc: 'Timer sessions', icon: Calendar, color: 'text-neon-purple' },
                { label: 'Focus Minutes', value: `${focusMins} Mins`, desc: 'Deep work duration', icon: Shield, color: 'text-neon-cyan' },
                { label: 'Completed Habits', value: habits.length, desc: 'Active routines', icon: Award, color: 'text-success' },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col gap-1 border-r border-white/5 last:border-0 pr-4">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{stat.label}</span>
                  <span className="text-xl font-black text-white mt-1 flex items-center gap-1.5">
                    {stat.value}
                  </span>
                  <span className="text-[9px] text-zinc-500 font-medium mt-0.5">{stat.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Local SQLite Database Info */}
          <div className="glass p-6 rounded-3xl border border-white/5 bg-white/[0.01] relative overflow-hidden">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-4 flex items-center gap-2">
              <Database className="w-4.5 h-4.5 text-success" />
              On-Device SQLite Database
            </h3>
            <div className="flex flex-col gap-3 text-xs font-semibold text-zinc-400">
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span>Database Engine</span>
                <span className="text-white font-bold">Better-SQLite3 via Prisma v7</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span>Local Cache File</span>
                <span className="text-success font-bold font-mono">./dev.db</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span>Migration State</span>
                <span className="text-white font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-success" /> In Sync
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span>Native Bridge Wrapper</span>
                <span className="text-neon-cyan font-bold">Capacitor v8 (com.grind.app)</span>
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-success/5 rounded-full blur-2xl pointer-events-none" />
          </div>

        </div>

      </section>

    </main>
  );
}
