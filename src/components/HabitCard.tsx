'use client';

import React, { useState } from 'react';
import { Check, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

interface HabitCardProps {
  id: string;
  title: string;
  category: string;
  streak: number;
  xp: number;
  isCompletedInitial?: boolean;
  color?: 'purple' | 'cyan' | 'green' | 'orange';
  onToggle?: (id: string, isCompleted: boolean) => void;
}

const HabitCard = ({ id, title, category, streak, xp, isCompletedInitial = false, color = 'purple', onToggle }: HabitCardProps) => {
  const [isCompleted, setIsCompleted] = useState(isCompletedInitial);
  const [showConfetti, setShowConfetti] = useState(false);

  const toggleComplete = () => {
    const newState = !isCompleted;
    setIsCompleted(newState);
    if (onToggle) onToggle(id, newState);

    if (newState) {
      // Complete action
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1000);
      
      // Play a soft sound if possible (browser restrictions might block without interaction, but this is click handler so ok)
      try {
        const audio = new Audio('/tick.mp3');
        audio.volume = 0.5;
        audio.play().catch(() => {});
      } catch (e) {}
    } else {
      setIsCompleted(false);
    }
  };

  const getColorTheme = () => {
    switch (color) {
      case 'cyan': return { text: 'text-neon-cyan', border: 'border-neon-cyan/50', bg: 'bg-neon-cyan/20' };
      case 'green': return { text: 'text-success', border: 'border-success/50', bg: 'bg-success/20' };
      case 'orange': return { text: 'text-warning', border: 'border-warning/50', bg: 'bg-warning/20' };
      default: return { text: 'text-neon-purple', border: 'border-neon-purple/50', bg: 'bg-neon-purple/20' };
    }
  };

  const theme = getColorTheme();

  return (
    <div className={cn(
      "relative group flex items-center justify-between p-4 rounded-xl border transition-all duration-300",
      isCompleted 
        ? `border-white/10 bg-white/5 opacity-60` 
        : `glass hover:bg-card-hover border-border hover:border-white/20 hover:-translate-y-1`
    )}>
      <div className="flex items-center gap-4">
        {/* Checkbox */}
        <button 
          onClick={toggleComplete}
          className={cn(
            "relative flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all duration-300 focus:outline-none",
            isCompleted 
              ? `${theme.bg} ${theme.border} ${theme.text}` 
              : "border-zinc-600 hover:border-zinc-400 bg-transparent text-transparent hover:text-zinc-500"
          )}
        >
          <Check className="h-4 w-4" strokeWidth={isCompleted ? 3 : 2} />
          {/* Ping animation when clicked */}
          <AnimatePresence>
            {showConfetti && (
              <motion.div
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 2, opacity: 0 }}
                exit={{ opacity: 0 }}
                className={cn("absolute inset-0 rounded-full", theme.bg)}
              />
            )}
          </AnimatePresence>
        </button>

        {/* Info */}
        <div>
          <h4 className={cn("font-medium transition-colors duration-300", isCompleted ? "text-zinc-500 line-through" : "text-white")}>{title}</h4>
          <p className="text-xs text-zinc-500">{category} • +{xp} XP</p>
        </div>
      </div>

      {/* Streak Info */}
      <div className={cn(
        "flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all duration-300",
        isCompleted ? "border-transparent bg-transparent opacity-50" : "bg-white/5 border-white/10"
      )}>
        <Flame className={cn("h-4 w-4", isCompleted ? "text-zinc-500" : "text-warning")} fill={isCompleted ? "none" : "currentColor"} />
        <span className={cn("text-sm font-semibold", isCompleted ? "text-zinc-500" : "text-white")}>{isCompleted ? streak + 1 : streak}</span>
      </div>
    </div>
  );
};

export default HabitCard;
