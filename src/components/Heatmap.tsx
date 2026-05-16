'use client';

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

// Generate some mock data for 14 weeks (98 days)
const generateMockData = () => {
  const days = [];
  for (let i = 0; i < 98; i++) {
    // Random intensity 0-4
    const intensity = Math.floor(Math.random() * 10) > 3 ? Math.floor(Math.random() * 4) + 1 : 0;
    days.push({ id: i, intensity });
  }
  return days;
};

const Heatmap = () => {
  const data = React.useMemo(() => generateMockData(), []);
  const weeks = [];
  for (let i = 0; i < 14; i++) {
    weeks.push(data.slice(i * 7, i * 7 + 7));
  }

  const getIntensityColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-neon-purple/20';
      case 2: return 'bg-neon-purple/40';
      case 3: return 'bg-neon-purple/70';
      case 4: return 'bg-neon-purple shadow-[0_0_8px_rgba(168,85,247,0.6)]';
      default: return 'bg-white/5';
    }
  };

  return (
    <div className="glass rounded-2xl p-6 border border-border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Consistency</h3>
          <p className="text-sm text-zinc-400">Your 90-day progress</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">42<span className="text-sm text-zinc-500 font-normal ml-1">Days Active</span></div>
        </div>
      </div>
      
      <div className="flex gap-2 justify-end">
        {weeks.map((week, wIndex) => (
          <div key={wIndex} className="flex flex-col gap-2">
            {week.map((day) => (
              <div 
                key={day.id} 
                className={cn(
                  "w-3 h-3 sm:w-4 sm:h-4 rounded-[3px] transition-all duration-300 hover:scale-125 cursor-pointer", 
                  getIntensityColor(day.intensity)
                )}
                title={`Activity level: ${day.intensity}`}
              />
            ))}
          </div>
        ))}
      </div>
      
      <div className="flex items-center justify-end gap-2 mt-4 text-xs text-zinc-500">
        <span>Less</span>
        <div className="w-3 h-3 rounded-[3px] bg-white/5"></div>
        <div className="w-3 h-3 rounded-[3px] bg-neon-purple/20"></div>
        <div className="w-3 h-3 rounded-[3px] bg-neon-purple/40"></div>
        <div className="w-3 h-3 rounded-[3px] bg-neon-purple/70"></div>
        <div className="w-3 h-3 rounded-[3px] bg-neon-purple shadow-[0_0_5px_rgba(168,85,247,0.5)]"></div>
        <span>More</span>
      </div>
    </div>
  );
};

export default Heatmap;
