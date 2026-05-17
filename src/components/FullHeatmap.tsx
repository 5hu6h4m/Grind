'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface FullHeatmapProps {
  completedDates: string[]; // Array of YYYY-MM-DD
  colorTheme?: 'green' | 'purple' | 'cyan' | 'orange';
}

export default function FullHeatmap({ completedDates, colorTheme = 'green' }: FullHeatmapProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Generate a map for quick lookup: { 'YYYY-MM-DD': 1 }
  const activityMap = React.useMemo(() => {
    const map: Record<string, number> = {};
    completedDates.forEach(date => {
      map[date] = 1;
    });
    return map;
  }, [completedDates]);

  // Calculate stats
  const totalActiveDays = Object.keys(activityMap).length;
  
  // Calculate streaks
  let maxStreak = 0;
  let currentStreak = 0;
  
  if (completedDates.length > 0) {
    const sortedDates = [...completedDates].sort();
    let tempStreak = 1;
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

    // Current streak (checking from today backwards)
    let cStreak = 0;
    const today = new Date();
    today.setHours(0,0,0,0);
    
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
      if (activityMap[dateStr]) {
        cStreak++;
      } else {
        if (i !== 0) break; // If it's not today, and missed, break. If missed today, we check yesterday.
      }
    }
    currentStreak = cStreak;
  }

  const [selectedYear, setSelectedYear] = React.useState<number>(new Date().getFullYear());

  // Generate available years list dynamically from completedDates
  const availableYears = React.useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = new Set<number>([currentYear]);
    completedDates.forEach(dateStr => {
      const year = parseInt(dateStr.split('-')[0], 10);
      if (!isNaN(year)) {
        years.add(year);
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [completedDates]);

  // Generate 365 days of data grouped by month, aligned perfectly to weekdays based on selectedYear
  const monthsData = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const list = [];
    const isCurrentYear = selectedYear === today.getFullYear();

    const generateMonthData = (year: number, month: number) => {
      const targetMonthDate = new Date(year, month, 1);
      const monthLabel = targetMonthDate.toLocaleDateString('en-US', { month: 'short' });
      const startDayOfWeek = targetMonthDate.getDay();
      const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
      
      const days = [];
      
      // Pad days before the 1st of the month with null
      for (let pad = 0; pad < startDayOfWeek; pad++) {
        days.push(null);
      }
      
      // Add all days of the month
      for (let d = 1; d <= totalDaysInMonth; d++) {
        const currentDate = new Date(year, month, d);
        if (currentDate > today) {
          days.push(null); // Don't show future days, pad with null
        } else {
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          days.push({
            date: currentDate,
            dateStr,
            intensity: activityMap[dateStr] ? 4 : 0,
            formatted: currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          });
        }
      }
      
      // Pad the end of the month so it completes a full week column (multiple of 7)
      const remainingPadding = 7 - (days.length % 7);
      if (remainingPadding < 7) {
        for (let pad = 0; pad < remainingPadding; pad++) {
          days.push(null);
        }
      }
      
      const weeks = [];
      for (let w = 0; w < days.length; w += 7) {
        weeks.push(days.slice(w, w + 7));
      }
      
      return {
        name: monthLabel,
        weeks
      };
    };
    
    if (isCurrentYear) {
      // Trailing 12 months for current year view
      for (let i = 11; i >= 0; i--) {
        const targetMonthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
        list.push(generateMonthData(targetMonthDate.getFullYear(), targetMonthDate.getMonth()));
      }
    } else {
      // Full calendar year (Jan to Dec) for past years
      for (let m = 0; m < 12; m++) {
        list.push(generateMonthData(selectedYear, m));
      }
    }
    
    return list;
  }, [activityMap, selectedYear]);

  // Auto-scroll to current day (far right) on mount or whenever monthsData changes
  React.useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
    }
  }, [monthsData]);

  const getIntensityColor = (level: number) => {
    if (level === 0) return 'bg-zinc-800/40 hover:bg-zinc-800/80';

    const themes = {
      green: [
        'bg-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.15)]',
        'bg-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.25)]',
        'bg-emerald-500/70 shadow-[0_0_8px_rgba(16,185,129,0.4)]',
        'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)]'
      ],
      purple: [
        'bg-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.15)]',
        'bg-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.25)]',
        'bg-emerald-500/70 shadow-[0_0_8px_rgba(16,185,129,0.4)]',
        'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)]'
      ],
      cyan: [
        'bg-cyan-500/20 shadow-[0_0_8px_rgba(6,182,212,0.15)]',
        'bg-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.25)]',
        'bg-cyan-500/70 shadow-[0_0_8px_rgba(6,182,212,0.4)]',
        'bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.6)]'
      ],
      orange: [
        'bg-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.15)]',
        'bg-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.25)]',
        'bg-amber-500/70 shadow-[0_0_8px_rgba(245,158,11,0.4)]',
        'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.6)]'
      ]
    };

    const selectedTheme = themes[colorTheme] || themes.green;
    return selectedTheme[level - 1] || selectedTheme[0];
  };

  return (
    <div className="glass rounded-2xl p-6 md:p-8 border border-white/5 w-full bg-zinc-950/20 backdrop-blur-md overflow-x-auto">
      {/* Header and Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-white/5 pb-6 min-w-[700px]">
        <div>
          <div className="flex items-center gap-4 mb-1">
            <h3 className="text-xl font-medium text-white">
              Activity Heatmap
            </h3>
            
            {/* Year Selector Capsule */}
            {availableYears.length > 1 && (
              <div className="flex gap-1 bg-zinc-900/60 p-0.5 rounded-lg border border-white/5">
                {availableYears.map(year => (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className={cn(
                      "px-2.5 py-0.5 text-[11px] font-medium rounded-md transition-all duration-200",
                      selectedYear === year 
                        ? "bg-emerald-500 text-white shadow-sm" 
                        : "text-zinc-400 hover:text-white"
                    )}
                  >
                    {year}
                  </button>
                ))}
              </div>
            )}
          </div>
          <p className="text-sm text-zinc-400">
            {totalActiveDays} completions {selectedYear === new Date().getFullYear() ? 'in the past 12 months' : `in ${selectedYear}`}
          </p>
        </div>
        
        <div className="flex gap-6 text-sm">
          <div className="flex flex-col">
            <span className="text-zinc-500 text-xs uppercase tracking-wider font-medium">Total active days</span>
            <span className="text-white font-semibold text-lg">{totalActiveDays}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-zinc-500 text-xs uppercase tracking-wider font-medium">Max streak</span>
            <span className="text-white font-semibold text-lg">{maxStreak} days</span>
          </div>
          <div className="flex flex-col">
            <span className="text-zinc-500 text-xs uppercase tracking-wider font-medium">Current streak</span>
            <span className="text-white font-semibold text-lg">{currentStreak} days</span>
          </div>
        </div>
      </div>

      {/* Horizontal Heatmap grouped by Month with Visual Gaps */}
      <div ref={scrollContainerRef} className="flex flex-col gap-2 min-w-[800px] overflow-x-auto pb-4">
        <div className="flex gap-4 items-end">
          {monthsData.map((month, mIdx) => (
            <div key={`${month.name}-${mIdx}`} className="flex flex-col items-center gap-2">
              {/* Grid of Weeks for this Month */}
              <div className="flex gap-[3px]">
                {month.weeks.map((week, wIdx) => (
                  <div key={wIdx} className="flex flex-col gap-[3px]">
                    {week.map((day, dIdx) => (
                      <div 
                        key={day ? day.dateStr : `empty-${mIdx}-${wIdx}-${dIdx}`} 
                        className={cn(
                          "w-[11px] h-[11px] rounded-full transition-all duration-300",
                          day ? getIntensityColor(day.intensity) : "bg-transparent",
                          day && "hover:scale-125 cursor-pointer z-10 relative"
                        )}
                        title={day ? `${day.formatted}: ${day.intensity > 0 ? 'Completed' : 'Missed'}` : undefined}
                      />
                    ))}
                  </div>
                ))}
              </div>
              
              {/* Month Label below the grid */}
              <span className="text-xs text-zinc-500 font-medium mt-1">{month.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-2 mt-4 text-xs text-zinc-500 min-w-[700px]">
        <span>Less</span>
        <div className="w-3 h-3 rounded-full bg-zinc-800/40"></div>
        <div className={cn("w-3 h-3 rounded-full", getIntensityColor(1))}></div>
        <div className={cn("w-3 h-3 rounded-full", getIntensityColor(2))}></div>
        <div className={cn("w-3 h-3 rounded-full", getIntensityColor(3))}></div>
        <div className={cn("w-3 h-3 rounded-full", getIntensityColor(4))}></div>
        <span>More</span>
      </div>
    </div>
  );
}
