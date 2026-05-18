import { prisma } from '@/lib/prisma';
import DashboardClient from '@/components/DashboardClient';
import { HabitData } from '@/components/AddHabitModal';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // Fetch habits from the real database
  const dbHabits = await prisma.habit.findMany({
    include: {
      completions: true,
    }
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Map database data to frontend HabitData structure
  const initialHabits: HabitData[] = dbHabits.map(habit => {
    // Map completions to YYYY-MM-DD strings
    const completedDates = habit.completions.map(c => 
      c.date.toISOString().split('T')[0]
    );

    // Basic streak calculation
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

  // Fetch focus sessions for dynamic XP calculations
  const focusSessions = await prisma.focusSession.findMany();
  const initialFocusXp = focusSessions.reduce((acc, s) => acc + s.xpEarned, 0);

  return <DashboardClient initialHabits={initialHabits} initialFocusXp={initialFocusXp} />;
}
