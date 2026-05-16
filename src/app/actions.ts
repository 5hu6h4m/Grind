'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function addHabit(data: { title: string; category: string; xp: number; color: string }) {
  await prisma.habit.create({
    data: {
      title: data.title,
      category: data.category,
      xp: data.xp,
      color: data.color,
    }
  });
  revalidatePath('/');
}

export async function toggleHabit(habitId: string, isCompleted: boolean) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isCompleted) {
    // Add completion for today
    try {
      await prisma.completion.create({
        data: {
          habitId,
          date: today,
        }
      });
    } catch (e) {
      // Might already exist due to unique constraint, that's fine
    }
  } else {
    // Remove completion for today
    await prisma.completion.deleteMany({
      where: {
        habitId,
        date: today,
      }
    });
  }

  revalidatePath('/');
}
