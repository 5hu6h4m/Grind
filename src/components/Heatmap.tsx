'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface HeatmapProps {
  activityMap?: Record<string, number>;
  colorTheme?: 'purple' | 'cyan' | 'green' | 'orange';
  compact?: boolean;
}

// Generate data based on real map for the last 98 days
const generateDataFromMap = (activityMap: Record<string, number> = {}) => {
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // We want 98 days ending today.
  // We'll iterate backwards from 97 days ago to today.
  for (let i = 97; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    
    // Format a nice readable date for the tooltip (e.g., "May 16, 2026")
    const formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    const count = activityMap[dateStr] || 0;
    
    // Calculate intensity 0-4
    let intensity = 0;
    if (count > 0) intensity = 1;
    if (count >= 2) intensity = 2;
    if (count >= 4) intensity = 3;
    if (count >= 6) intensity = 4;

    days.push({ id: dateStr, intensity, count, formattedDate });
  }
  return days;
};

const Heatmap = ({ activityMap, colorTheme = 'green', compact = false }: HeatmapProps) => {
  const data = React.useMemo(() => generateDataFromMap(activityMap), [activityMap]);
  const weeks = [];
  for (let i = 0; i < 14; i++) {
    weeks.push(data.slice(i * 7, i * 7 + 7));
  }
  
  // Calculate total active days
  const activeDays = Object.values(activityMap || {}).filter(v => v > 0).length;

  const getIntensityColor = (level: number) => {
    if (level === 0) return 'bg-white/5';

    const themes = {
      purple: ['bg-success/20', 'bg-success/40', 'bg-success/70', 'bg-success shadow-[0_0_8px_rgba(34,197,94,0.6)]'],
      cyan: ['bg-neon-cyan/20', 'bg-neon-cyan/40', 'bg-neon-cyan/70', 'bg-neon-cyan shadow-[0_0_8px_rgba(34,211,238,0.6)]'],
      green: ['bg-success/20', 'bg-success/40', 'bg-success/70', 'bg-success shadow-[0_0_8px_rgba(34,197,94,0.6)]'],
      orange: ['bg-warning/20', 'bg-warning/40', 'bg-warning/70', 'bg-warning shadow-[0_0_8px_rgba(245,158,11,0.6)]'],
    };

    const selectedTheme = themes[colorTheme] || themes.green;
    return selectedTheme[level - 1] || selectedTheme[0];
  };

  return (
    <div className={cn("flex flex-col w-full", !compact && "glass rounded-2xl p-6 border border-border")}>
      {!compact && (
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">Consistency</h3>
            <p className="text-sm text-zinc-400">Your 90-day progress</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{activeDays}<span className="text-sm text-zinc-500 font-normal ml-1">Days Active</span></div>
          </div>
        </div>
      )}
      
      <div className={cn("flex gap-2", compact ? "justify-start" : "justify-end")}>
        {weeks.map((week, wIndex) => (
          <div key={wIndex} className="flex flex-col gap-2">
            {week.map((day) => (
              <div 
                key={day.id} 
                className={cn(
                  "w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all duration-300 hover:scale-125 cursor-pointer", 
                  getIntensityColor(day.intensity)
                )}
                title={`${day.formattedDate}: ${day.count} Completions`}
              />
            ))}
          </div>
        ))}
      </div>
      
      {!compact && (
        <div className="flex items-center justify-end gap-2 mt-4 text-xs text-zinc-500">
          <span>Less</span>
          <div className="w-3 h-3 rounded-full bg-white/5"></div>
          <div className="w-3 h-3 rounded-full bg-success/20"></div>
          <div className="w-3 h-3 rounded-full bg-success/40"></div>
          <div className="w-3 h-3 rounded-full bg-success/70"></div>
          <div className="w-3 h-3 rounded-full bg-success shadow-[0_0_5px_rgba(34,197,94,0.5)]"></div>
          <span>More</span>
        </div>
      )}
    </div>
  );
};

export default Heatmap;
