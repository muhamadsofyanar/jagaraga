import type { DayKey, ExerciseTarget, FreeSessionTemplate, PlannedSession, ProgramWeek } from '../../domain/types';

const dayKeys: DayKey[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const targetKeys = ['sets', 'reps', 'seconds', 'minutes'] as const;

export function validateFreeSession(name: string, items: ExerciseTarget[]): Record<string, string> {
  if (items.length === 0) return { items: 'Pilih minimal satu gerakan.' };
  const errors: Record<string, string> = {};
  if (!name.trim() || name.trim().length > 60) errors.name = 'Nama template wajib diisi, maksimal 60 karakter.';
  if (items.length > 40 || items.some((item) => {
    const used = targetKeys.filter((key) => item[key] !== undefined);
    const value = used.length === 1 ? item[used[0]] : undefined;
    return used.length !== 1 || !Number.isInteger(value) || Number(value) < 1 || Number(value) > 999;
  })) errors.items = 'Setiap gerakan harus memiliki satu target antara 1 dan 999.';
  return errors;
}

export function createFreePlan(template: FreeSessionTemplate, date: string, programWeek: ProgramWeek): PlannedSession {
  const estimatedSeconds = template.items.reduce((total, item) => total + (item.minutes ?? 0) * 60 + (item.seconds ?? 0) + (item.sets ?? 1) * (item.reps ?? 0) * 4, 0);
  return {
    id: `free-${template.id}-${date}`,
    title: template.name || 'Sesi Bebas',
    description: 'Latihan pilihan pribadi.',
    estimatedMinutes: Math.max(1, Math.ceil(estimatedSeconds / 60)),
    items: template.items.map((item) => ({ ...item })),
    date,
    day: dayKeys[new Date(`${date}T12:00:00`).getDay()],
    programWeek,
  };
}
