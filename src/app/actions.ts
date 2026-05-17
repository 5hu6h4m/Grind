'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function addHabit(data: { title: string; category: string; xp: number; color: string }) {
  const newHabit = await prisma.habit.create({
    data: {
      title: data.title,
      category: data.category,
      xp: data.xp,
      color: data.color,
    }
  });
  revalidatePath('/');
  return newHabit;
}

export async function toggleHabit(habitId: string, isCompleted: boolean, dateStr: string) {
  // dateStr is expected to be "YYYY-MM-DD"
  const dateObj = new Date(`${dateStr}T00:00:00.000Z`);


  if (isCompleted) {
    // Add completion for today
    try {
      await prisma.completion.create({
        data: {
          habitId,
          date: dateObj,
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
        date: dateObj,
      }
    });
  }

  revalidatePath('/');
}

export async function deleteHabit(habitId: string) {
  await prisma.habit.delete({ where: { id: habitId } });
  revalidatePath('/');
}

export async function editHabit(habitId: string, data: { title: string; category: string; xp: number; color: string }) {
  await prisma.habit.update({
    where: { id: habitId },
    data: {
      title: data.title,
      category: data.category,
      xp: data.xp,
      color: data.color,
    }
  });
  revalidatePath('/');
}
