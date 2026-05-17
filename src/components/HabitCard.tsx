'use client';

import React, { useState } from 'react';
import { Check, Flame, Pencil, Trash2, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import EditHabitModal from './EditHabitModal';
import { playTickSound } from '@/lib/sound';
import { cn } from '@/lib/utils';

interface HabitCardProps {
  id: string;
  title: string;
  category: string;
  streak: number;
  xp: number;
  completedDates?: string[];
  isCompletedInitial?: boolean;
  color?: 'purple' | 'cyan' | 'green' | 'orange';
  onToggle?: (id: string, isCompleted: boolean) => void;
  onEdit?: (data: { title: string; category: string; xp: number; color: 'purple' | 'cyan' | 'green' | 'orange' }) => void;
  onDelete?: () => void;
}

const HabitCard = ({ id, title, category, streak, xp, completedDates = [], isCompletedInitial = false, color = 'purple', onToggle, onEdit, onDelete }: HabitCardProps) => {
  const [isCompleted, setIsCompleted] = useState(isCompletedInitial);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const router = useRouter();



  // Generate last 7 days
  const last7Days = React.useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    });
  }, []);

  const toggleComplete = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newState = !isCompleted;
    setIsCompleted(newState);
    if (onToggle) onToggle(id, newState);

    if (newState) {
      // Complete action
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1000);
      
      // Play a synthetic premium click sound
      playTickSound();
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
      "relative group flex flex-col p-4 rounded-xl border transition-all duration-300 overflow-hidden cursor-pointer",
      isCompleted 
        ? `border-white/10 bg-white/5 opacity-60` 
        : `glass hover:bg-card-hover border-border hover:border-white/20 hover:-translate-y-1`
    )}
    onClick={() => router.push(`/dashboard/habits/${id}`)}
    >
      <div className="flex items-center justify-between">
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
      
      {/* Right Side (Chevron) */}
      <div>
        <div className="w-5 h-5 flex items-center justify-center rounded-full bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500 group-hover:text-white transition-colors">
            <path d="m9 18 6-6-6-6"/>
          </svg>
        </div>
      </div>
    </div>

    <div className="flex items-center justify-between mt-4">
        {/* 7-Day Progress Bar */}
        <div className="flex gap-1.5">
          {last7Days.map(dateStr => {
            const isDone = completedDates.includes(dateStr);
            return (
              <div 
                key={dateStr}
                className={cn(
                  "w-3.5 h-3.5 rounded-sm transition-colors duration-300",
                  isDone ? `${theme.bg} border ${theme.border}` : "bg-white/5 border border-white/5"
                )}
                title={dateStr}
              />
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          {/* Action Buttons (visible on hover / touch compatible) */}
          <div className="opacity-60 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); setIsEditModalOpen(true); }}
              className="p-1.5 rounded-md hover:bg-white/10 text-zinc-500 hover:text-white transition-colors"
              title="Edit Habit"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); if (onDelete) onDelete(); }}
              className="p-1.5 rounded-md hover:bg-danger/20 text-zinc-500 hover:text-danger transition-colors"
              title="Delete Habit"
            >
              <Trash2 className="w-4 h-4" />
            </button>
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
      </div>



      {isEditModalOpen && (
        <EditHabitModal 
          isOpen={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)} 
          initialData={{ title, category, xp, color }} 
          onEditHabit={onEdit || (() => {})} 
        />
      )}
    </div>
  );
};

export default HabitCard;
