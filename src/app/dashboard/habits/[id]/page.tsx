import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import HabitDetailClient from '@/components/HabitDetailClient';

export default async function HabitPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const habitId = resolvedParams.id;
  
  const habit = await prisma.habit.findUnique({
    where: { id: habitId },
    include: { completions: true }
  });

  if (!habit) {
    notFound();
  }

  // Generate completedDates
  const completedDates = habit.completions.map(c => 
    new Date(c.date).toISOString().split('T')[0]
  );

  return (
    <HabitDetailClient 
      habit={habit} 
      initialCompletedDates={completedDates} 
    />
  );
}
