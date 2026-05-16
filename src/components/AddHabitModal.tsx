'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target } from 'lucide-react';
import { cn } from './Sidebar';

export interface HabitData {
  id: string;
  title: string;
  category: string;
  streak: number;
  xp: number;
  color: 'purple' | 'cyan' | 'green' | 'orange';
  isCompletedToday: boolean;
}

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddHabit: (habit: Omit<HabitData, 'id' | 'streak' | 'isCompletedToday'>) => void;
}

export default function AddHabitModal({ isOpen, onClose, onAddHabit }: AddHabitModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [color, setColor] = useState<'purple' | 'cyan' | 'green' | 'orange'>('purple');
  const [xp, setXp] = useState(50);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !category) return;

    onAddHabit({
      title,
      category,
      color,
      xp,
    });
    
    // Reset and close
    setTitle('');
    setCategory('');
    setColor('purple');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="glass relative w-full max-w-md p-6 rounded-2xl border border-border shadow-2xl z-10"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-neon-purple/20 flex items-center justify-center border border-neon-purple/50">
                <Target className="w-5 h-5 text-neon-purple" />
              </div>
              <h2 className="text-xl font-bold text-white">Create New Habit</h2>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Habit Name</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Solve 2 LeetCode problems"
                  className="w-full bg-black/50 border border-border rounded-lg px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-neon-purple transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Category</label>
                <input 
                  type="text" 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. DSA, Fitness, Reading"
                  className="w-full bg-black/50 border border-border rounded-lg px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-neon-purple transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Theme Color</label>
                <div className="flex gap-3">
                  {(['purple', 'cyan', 'green', 'orange'] as const).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 transition-all",
                        color === c ? "border-white scale-110" : "border-transparent opacity-50 hover:opacity-100",
                        c === 'purple' ? "bg-neon-purple" : 
                        c === 'cyan' ? "bg-neon-cyan" : 
                        c === 'green' ? "bg-success" : "bg-warning"
                      )}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">XP Reward</label>
                <select 
                  value={xp}
                  onChange={(e) => setXp(Number(e.target.value))}
                  className="w-full bg-black/50 border border-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-neon-purple transition-colors appearance-none"
                >
                  <option value={10}>10 XP (Easy)</option>
                  <option value={30}>30 XP (Medium)</option>
                  <option value={50}>50 XP (Hard)</option>
                  <option value={100}>100 XP (Legendary)</option>
                </select>
              </div>

              <button 
                type="submit"
                className="mt-4 w-full bg-neon-purple hover:bg-neon-purple/90 text-white font-semibold py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)]"
              >
                Add Habit to Grind
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
