import React from 'react';
import { Activity, ArrowLeft, Target, TrendingUp, Trophy, Zap, Calendar, Award } from 'lucide-react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  // Fetch raw completions and habits from SQLite database
  const habits = await prisma.habit.findMany({
    include: {
      completions: true,
    },
  });

  const focusSessions = await prisma.focusSession.findMany();

  // Get last 7 days names and dates
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const todayStrLocal = new Date().toISOString().split('T')[0];

  // Compile daily completions statistics
  const dayCompletions = last7Days.map((dateObj) => {
    const dateStr = dateObj.toISOString().split('T')[0];
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    
    // Find how many habits completed on this date
    let count = 0;
    habits.forEach((habit) => {
      const completed = habit.completions.some(
        (c) => c.date.toISOString().split('T')[0] === dateStr
      );
      if (completed) count++;
    });

    return { dateStr, dayName, count };
  });

  // Calculate career statistics
  const totalHabitsCount = habits.length;
  const totalFocusSessionsCount = focusSessions.length;
  const totalFocusMinutes = focusSessions.reduce((acc, s) => acc + s.duration, 0);
  const totalFocusXp = focusSessions.reduce((acc, s) => acc + s.xpEarned, 0);

  let totalCompletionsCount = 0;
  habits.forEach((h) => {
    totalCompletionsCount += h.completions.length;
  });

  const habitsXp = habits.reduce((acc, h) => {
    // Each completion adds habit's XP
    return acc + (h.completions.length * h.xp);
  }, 0);

  const careerXp = 150 + habitsXp + totalFocusXp; // Base 150 XP + Habit XP + Focus XP

  // Find daily completion streaks
  // We check dates in sequence backwards starting today
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
      // If we didn't complete anything today, check yesterday. If yesterday was completed, the streak is alive (waiting for today).
      // If even yesterday was empty, streak is broken.
      if (currentStreak === 0) {
        // Check yesterday
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
          // Streak starts from yesterday
          d.setDate(d.getDate() - 1);
          continue;
        }
      }
      break;
    }
  }

  // Compile categories counts
  const categoryMap: { [key: string]: number } = {};
  habits.forEach((h) => {
    categoryMap[h.category] = (categoryMap[h.category] || 0) + h.completions.length;
  });
  const categoriesList = Object.entries(categoryMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const maxWeeklyCount = Math.max(1, ...dayCompletions.map((d) => d.count));

  // Heatmap generation for last 4 weeks (28 days)
  const heatmapWeeks = Array.from({ length: 4 }, (_, weekIdx) => {
    return Array.from({ length: 7 }, (_, dayIdx) => {
      const d = new Date();
      // Backwards calculation: 27 days ago to today
      d.setDate(d.getDate() - (27 - (weekIdx * 7 + dayIdx)));
      const dateStr = d.toISOString().split('T')[0];
      
      let count = 0;
      habits.forEach((habit) => {
        const completed = habit.completions.some(
          (c) => c.date.toISOString().split('T')[0] === dateStr
        );
        if (completed) count++;
      });
      
      return { dateStr, count };
    });
  });

  return (
    <main className="min-h-screen p-4 md:p-10 max-w-7xl mx-auto flex flex-col gap-8 pb-24 relative bg-[#060608] text-zinc-300">
      
      {/* Background Glow */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] right-[10%] w-[45vw] h-[45vw] rounded-full bg-neon-purple/5 blur-[130px] animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="absolute bottom-[20%] left-[10%] w-[40vw] h-[40vw] rounded-full bg-neon-cyan/5 blur-[120px] animate-pulse" style={{ animationDuration: '12s' }} />
      </div>

      {/* Back Button */}
      <header className="relative z-10 flex items-center justify-between mt-8 md:mt-0">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-semibold"
        >
          <ArrowLeft className="w-4.5 h-4.5" />
          <span>Back to Dashboard</span>
        </Link>
        <div className="flex items-center gap-2 text-xs font-bold text-neon-purple bg-neon-purple/10 border border-neon-purple/20 px-3 py-1 rounded-full">
          <Activity className="w-3.5 h-3.5" />
          <span>SQLite Engine Active</span>
        </div>
      </header>

      {/* Top Banner Stats */}
      <section className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Career XP', value: careerXp.toLocaleString(), desc: 'All-time grind', icon: Zap, color: 'text-neon-cyan' },
          { label: 'Longest Streak', value: `${currentStreak} Days`, desc: 'Active consistency', icon: Trophy, color: 'text-warning' },
          { label: 'Focus Sprints', value: `${totalFocusSessionsCount}`, desc: `${totalFocusMinutes} Mins deep work`, icon: Calendar, color: 'text-neon-purple' },
          { label: 'Task Completions', value: `${totalCompletionsCount}`, desc: 'Total database records', icon: Target, color: 'text-success' },
        ].map((stat, i) => (
          <div key={i} className="glass p-5 rounded-2xl border border-white/5 bg-white/[0.005] flex flex-col gap-1 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">{stat.label}</span>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <span className="text-2xl font-black text-white mt-1">{stat.value}</span>
            <span className="text-[10px] text-zinc-500 font-medium mt-1">{stat.desc}</span>
            <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-white/[0.02] rounded-full blur-xl group-hover:bg-white/[0.04] transition-colors" />
          </div>
        ))}
      </section>

      {/* Main Charts Grid */}
      <section className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Weekly Consistency SVG Bar Chart */}
        <div className="lg:col-span-2 glass p-6 rounded-3xl border border-white/5 bg-white/[0.01] flex flex-col gap-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-neon-cyan" />
              Weekly Consistency
            </h3>
            <p className="text-xs text-zinc-500 mt-1">Number of completed tasks per day over the last 7 days.</p>
          </div>

          <div className="w-full h-64 flex items-end justify-between px-4 pb-2 border-b border-white/5 relative">
            
            {/* Guide Grid lines */}
            <div className="absolute left-0 right-0 top-0 h-[1px] bg-white/[0.02]" />
            <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-white/[0.02]" />

            {dayCompletions.map((day, idx) => {
              const barHeightPct = (day.count / maxWeeklyCount) * 80 + 5; // offset for minimum visual presence
              return (
                <div key={idx} className="flex flex-col items-center gap-3 flex-1 group">
                  
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-950/90 border border-white/10 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-white absolute mb-24 z-20 pointer-events-none" style={{ bottom: `${barHeightPct}%` }}>
                    {day.count} Task{day.count !== 1 && 's'}
                  </div>

                  {/* SVG Bar representation */}
                  <div 
                    className="w-8 rounded-t-lg bg-gradient-to-t from-neon-cyan/20 to-neon-cyan shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-all duration-700 ease-out hover:scale-105"
                    style={{ 
                      height: `${day.count === 0 ? 4 : barHeightPct}%`,
                      opacity: day.count === 0 ? 0.2 : 1,
                      backgroundColor: day.count === 0 ? 'rgba(255,255,255,0.05)' : undefined
                    }}
                  />
                  
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{day.dayName}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Breakdown list */}
        <div className="glass p-6 rounded-3xl border border-white/5 bg-white/[0.01] flex flex-col gap-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-neon-purple" />
              Category Focus
            </h3>
            <p className="text-xs text-zinc-500 mt-1">Which disciplines you have invested energy in all-time.</p>
          </div>

          <div className="flex flex-col gap-4">
            {categoriesList.length === 0 ? (
              <div className="py-12 text-center text-xs text-zinc-500 font-medium">No completions logged yet.</div>
            ) : (
              categoriesList.map((cat, idx) => {
                const colors = ['bg-neon-cyan', 'bg-neon-purple', 'bg-warning', 'bg-success', 'bg-rose-500'];
                const maxCount = Math.max(1, ...categoriesList.map((c) => c.count));
                const widthPct = (cat.count / maxCount) * 100;
                
                return (
                  <div key={idx} className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-white">{cat.name}</span>
                      <span className="text-zinc-400">{cat.count} Sprints</span>
                    </div>
                    <div className="h-2 w-full bg-white/[0.05] rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${colors[idx % colors.length]} rounded-full transition-all duration-500`}
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </section>

      {/* Completion Intensity Heatmap */}
      <section className="relative z-10 glass p-6 rounded-3xl border border-white/5 bg-white/[0.01] flex flex-col gap-6">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-success" />
            Consistency Heatmap
          </h3>
          <p className="text-xs text-zinc-500 mt-1">Your daily execution frequency over the last 4 weeks.</p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border border-white/5 p-5 rounded-2xl bg-black/40">
          <div className="flex gap-2.5 overflow-x-auto pb-2 w-full justify-center">
            {heatmapWeeks.map((week, weekIdx) => (
              <div key={weekIdx} className="flex flex-col gap-2.5">
                {week.map((day, dayIdx) => {
                  let cellColor = 'bg-white/[0.03] border-white/5';
                  if (day.count > 0 && day.count <= 2) cellColor = 'bg-success/20 border-success/30 text-success';
                  if (day.count > 2 && day.count <= 4) cellColor = 'bg-success/40 border-success/50';
                  if (day.count > 4) cellColor = 'bg-success border-success shadow-[0_0_10px_rgba(34,197,94,0.3)]';

                  return (
                    <div 
                      key={dayIdx} 
                      className={`w-7.5 h-7.5 rounded-md border flex items-center justify-center text-[10px] font-bold transition-all duration-300 hover:scale-110 ${cellColor}`}
                      title={`${day.dateStr}: ${day.count} Completions`}
                    >
                      {day.count > 0 ? day.count : ''}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="flex md:flex-col gap-4 text-xs font-bold text-zinc-500 border-l md:border-l-0 md:border-t border-white/5 pl-4 md:pl-0 md:pt-4 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-white/[0.03] border border-white/5" />
              <span>Zero</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-success/20 border border-success/30" />
              <span>1 - 2 Sprints</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-success border border-success" />
              <span>5+ Sprints</span>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
