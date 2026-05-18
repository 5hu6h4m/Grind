'use client';

import React, { useState } from 'react';
import HabitCard from '@/components/HabitCard';
import AddHabitModal, { HabitData } from '@/components/AddHabitModal';
import { Target, Plus, Search, Filter, Sparkles, Flame, Calendar, Award } from 'lucide-react';
import { addHabit, toggleHabit, deleteHabit, editHabit } from '@/app/actions';
import { playTickSound } from '@/lib/sound';

interface HabitsManagerClientProps {
  initialHabits: HabitData[];
}

export default function HabitsManagerClient({ initialHabits }: HabitsManagerClientProps) {
  const [habits, setHabits] = useState<HabitData[]>(initialHabits);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [habitToDelete, setHabitToDelete] = useState<string | null>(null);

  const triggerHapticLight = () => {
    if (typeof window !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(15);
    }
  };

  const handleAddHabit = async (newHabit: Omit<HabitData, 'id' | 'streak' | 'completedDates'>) => {
    const tempId = Math.random().toString(36).substr(2, 9);
    const habit: HabitData = {
      ...newHabit,
      id: tempId,
      streak: 0,
      completedDates: [],
    };
    setHabits([...habits, habit]);
    
    try {
      const savedHabit = await addHabit({
        title: newHabit.title,
        category: newHabit.category,
        xp: newHabit.xp,
        color: newHabit.color,
      });
      if (savedHabit && savedHabit.id) {
        setHabits(prev => prev.map(h => h.id === tempId ? { ...h, id: savedHabit.id } : h));
      }
    } catch (e) {
      console.error("Failed to save habit:", e);
      setHabits(prev => prev.filter(h => h.id !== tempId));
    }
  };

  const handleToggleHabit = async (id: string, isCompleted: boolean) => {
    const d = new Date();
    const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    setHabits(prev => prev.map(h => {
      if (h.id === id) {
        const newDates = isCompleted 
          ? [...h.completedDates, todayStr]
          : h.completedDates.filter(d => d !== todayStr);
        return { ...h, completedDates: newDates };
      }
      return h;
    }));

    await toggleHabit(id, isCompleted, todayStr);
  };

  const handleEditHabit = async (id: string, updatedData: { title: string; category: string; xp: number; color: 'purple' | 'cyan' | 'green' | 'orange' }) => {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, ...updatedData } : h));
    await editHabit(id, updatedData);
  };

  const handleDeleteHabit = (id: string) => {
    setHabitToDelete(id);
  };

  // Compile categories list dynamically
  const categories = ['all', ...Array.from(new Set(habits.map(h => h.category.toLowerCase())))];

  // Filter habits based on search query and category
  const filteredHabits = habits.filter(h => {
    const matchesSearch = h.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          h.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || h.category.toLowerCase() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalXpValue = habits.reduce((acc, h) => acc + h.xp, 0);
  const avgCompletions = habits.length > 0 
    ? Math.round((habits.reduce((acc, h) => acc + h.completedDates.length, 0) / habits.length) * 10) / 10
    : 0;

  const d = new Date();
  const todayStrLocal = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const isHabitCompletedToday = (h: HabitData) => h.completedDates.includes(todayStrLocal);

  return (
    <main className="min-h-screen p-4 md:p-10 max-w-7xl mx-auto flex flex-col gap-8 pb-24 relative bg-[#060608] text-zinc-300">
      
      {/* Background neon pulses */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[20%] w-[35vw] h-[35vw] rounded-full bg-success/5 blur-[130px] animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="absolute bottom-[20%] right-[20%] w-[35vw] h-[35vw] rounded-full bg-neon-purple/5 blur-[130px] animate-pulse" style={{ animationDuration: '12s' }} />
      </div>

      {/* Header and Add button */}
      <header className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 mt-8 md:mt-0">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2 flex items-center gap-2">
            <Target className="w-8 h-8 text-success" />
            Habit Manager
          </h1>
          <p className="text-zinc-500 text-xs md:text-sm font-medium">Define, configure, and maintain your custom daily habits catalog.</p>
        </div>
        <button
          onClick={() => { triggerHapticLight(); playTickSound(); setIsModalOpen(true); }}
          className="flex items-center justify-center gap-2 text-sm font-bold bg-success hover:bg-success/90 text-white px-6 py-3.5 rounded-2xl shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all cursor-pointer select-none"
        >
          <Plus className="w-4 h-4" />
          Create New Habit
        </button>
      </header>

      {/* Summary grid stats */}
      <section className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Habits', value: habits.length, desc: 'Registered in SQLite', icon: Target, color: 'text-success' },
          { label: 'Total Daily Value', value: `+${totalXpValue} XP`, desc: 'Max daily potential', icon: Calendar, color: 'text-neon-cyan' },
          { label: 'Avg Completions', value: `${avgCompletions}x`, desc: 'Completions per habit', icon: Award, color: 'text-neon-purple' },
          { label: 'Longest Streak', value: `${habits.reduce((acc, h) => Math.max(acc, h.streak), 0)} Days`, desc: 'Personal records', icon: Flame, color: 'text-warning' },
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

      {/* Search and Filters */}
      <section className="relative z-10 flex flex-col md:flex-row gap-4 justify-between items-center bg-black/40 border border-white/5 p-4 rounded-2xl backdrop-blur-md">
        
        {/* Search Input */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Search habits by name or category..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-success transition-colors"
          />
        </div>

        {/* Category filtering chips */}
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <div className="flex items-center gap-1.5 text-zinc-500 text-xs font-bold uppercase tracking-wider mr-2">
            <Filter className="w-3.5 h-3.5" />
            Filter:
          </div>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => { triggerHapticLight(); playTickSound(); setSelectedCategory(cat); }}
              className={`text-xs font-bold px-4 py-2 rounded-xl border capitalize transition-all select-none ${
                selectedCategory === cat
                  ? 'border-success text-success bg-success/5 font-black shadow-[0_0_10px_rgba(34,197,94,0.1)]'
                  : 'border-white/5 bg-white/[0.005] hover:bg-white/5 text-zinc-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </section>

      {/* Habits Grid List */}
      <section className="relative z-10">
        {filteredHabits.length === 0 ? (
          <div className="glass p-12 rounded-3xl border border-dashed border-white/10 flex flex-col items-center justify-center text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.02] flex items-center justify-center border border-white/10">
              <Target className="w-8 h-8 text-zinc-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">No Habits Found</h3>
              <p className="text-zinc-500 text-xs mt-1 max-w-sm">No habits match your active filters or search query. Create a new habit or adjust filter parameters.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredHabits.map((habit) => (
              <HabitCard 
                key={habit.id}
                id={habit.id}
                title={habit.title} 
                category={habit.category} 
                streak={habit.streak} 
                xp={habit.xp} 
                color={habit.color} 
                completedDates={habit.completedDates}
                isCompletedInitial={isHabitCompletedToday(habit)} 
                onToggle={handleToggleHabit}
                onDelete={() => handleDeleteHabit(habit.id)}
                onEdit={(data) => handleEditHabit(habit.id, data)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Modals */}
      <AddHabitModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAddHabit={handleAddHabit} 
      />

      {/* Delete confirmation modal */}
      {habitToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div 
            onClick={() => setHabitToDelete(null)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <div className="glass relative w-full max-w-sm p-6 rounded-2xl border border-white/10 shadow-2xl z-10 bg-zinc-950/80">
            <h3 className="text-lg font-bold text-white mb-2">Delete Habit?</h3>
            <p className="text-sm text-zinc-400 mb-6 font-normal">
              Are you sure you want to delete this habit? This action cannot be undone and you will lose all completion history.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setHabitToDelete(null)}
                className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  triggerHapticLight();
                  const id = habitToDelete;
                  setHabitToDelete(null);
                  setHabits(habits.filter(h => h.id !== id));
                  await deleteHabit(id);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-500 rounded-lg shadow-[0_2px_10px_rgba(220,38,38,0.3)] transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
