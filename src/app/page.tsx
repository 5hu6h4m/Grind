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
    // Check if there is a completion for today
    const isCompletedToday = habit.completions.some(
      c => new Date(c.date).getTime() === today.getTime()
    );

    // Basic streak calculation (number of total completions for now, will enhance later)
    const streak = habit.completions.length;

    return {
      id: habit.id,
      title: habit.title,
      category: habit.category,
      streak,
      xp: habit.xp,
      color: habit.color as 'purple' | 'cyan' | 'green' | 'orange',
      isCompletedToday,
    };
  });

  // Generate an activity map for the last 98 days for the Heatmap
  const activityMap: Record<string, number> = {};
  dbHabits.forEach(habit => {
    habit.completions.forEach(completion => {
      const dateStr = new Date(completion.date).toISOString().split('T')[0];
      if (!activityMap[dateStr]) {
        activityMap[dateStr] = 0;
      }
      // Add XP or just count to the day's intensity. Let's add 1 intensity per completed habit.
      activityMap[dateStr] += 1;
    });
  });

  return <DashboardClient initialHabits={initialHabits} initialActivityMap={activityMap} />;
}
