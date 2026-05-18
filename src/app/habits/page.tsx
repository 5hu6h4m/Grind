import React from 'react';
import { prisma } from '@/lib/prisma';
import HabitsManagerClient from '@/components/HabitsManagerClient';
import { HabitData } from '@/components/AddHabitModal';

export const dynamic = 'force-dynamic';

export default async function HabitsPage() {
  // Fetch habits from SQLite database
  const dbHabits = await prisma.habit.findMany({
    include: {
      completions: true,
    }
  });

  // Map database structures to client HabitData structures
  const habits: HabitData[] = dbHabits.map((habit) => {
    const completedDates = habit.completions.map(c => 
      c.date.toISOString().split('T')[0]
    );

    // Dynamic streak calculation
    const streak = habit.completions.length;

    return {
      id: habit.id,
      title: habit.title,
      category: habit.category,
      streak,
      xp: habit.xp,
      color: habit.color as 'purple' | 'cyan' | 'green' | 'orange',
      completedDates,
    };
  });

  return <HabitsManagerClient initialHabits={habits} />;
}
