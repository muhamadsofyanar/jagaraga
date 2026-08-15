import { EXERCISES_BY_ID } from '../../catalog';
import type { ExerciseKind, FreeSessionTemplate, JournalEntry, MovementGroup } from '../../domain/types';
import type { SessionLog } from '../../persistence/db';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  earned: boolean;
}

export interface ProgressStats {
  completedCount: number;
  totalMinutes: number;
  sessionSources: { program: number; free: number };
  categoryCounts: Record<ExerciseKind, number>;
  substitutionCount: number;
  calendar: { date: string; day: number; done: boolean }[];
  journalAverages: { energy14: number | null; energy30: number | null; sleep14: number | null; soreness14: number | null; stress14: number | null };
  achievements: Achievement[];
  summary: string;
}

const dateValue = (id: string) => new Date(`${id}T12:00:00`).getTime();
const dateId = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const mean = (values: number[]) => values.length ? Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1)) : null;
const groupKind: Record<MovementGroup, ExerciseKind> = {
  'warmup-mobility': 'warmup', 'low-impact-cardio': 'cardio', 'lower-strength': 'strength', 'upper-strength': 'strength',
  'core-posture': 'strength', balance: 'balance', 'cooldown-recovery': 'recovery',
};

export function buildProgressStats(sessions: SessionLog[], journals: JournalEntry[], templates: FreeSessionTemplate[], today: string): ProgressStats {
  const completed = sessions.filter((session) => session.status === 'completed');
  const totalMinutes = Math.round(completed.reduce((sum, session) => sum + session.elapsedSeconds, 0) / 60);
  const sessionSources = { program: completed.filter((session) => session.source === 'program').length, free: completed.filter((session) => session.source === 'free').length };
  const categoryCounts: Record<ExerciseKind, number> = { warmup: 0, cardio: 0, strength: 0, balance: 0, cooldown: 0, recovery: 0 };
  completed.forEach((session) => {
    if (session.performedItems) session.performedItems.filter((item) => item.status === 'completed').forEach((item) => { categoryCounts[groupKind[item.group]] += 1; });
    else session.completedItemIds.forEach((id) => { const exercise = EXERCISES_BY_ID[id]; if (exercise) categoryCounts[exercise.kind] += 1; });
  });
  const substitutionCount = completed.flatMap((session) => session.performedItems ?? []).filter((item) => item.status === 'completed' && item.plannedExerciseId !== item.exerciseId).length;
  const completedDates = new Set(completed.map((session) => session.date));
  const end = new Date(`${today}T12:00:00`);
  const calendar = Array.from({ length: 28 }, (_, index) => { const date = new Date(end); date.setDate(end.getDate() - (27 - index)); const id = dateId(date); return { date: id, day: date.getDate(), done: completedDates.has(id) }; });
  const recent = (days: number) => { const start = dateValue(today) - (days - 1) * 86400000; return journals.filter((entry) => dateValue(entry.id) >= start && dateValue(entry.id) <= dateValue(today)); };
  const recent14 = recent(14);
  const recent30 = recent(30);
  const journalAverages = { energy14: mean(recent14.map((entry) => entry.energy)), energy30: mean(recent30.map((entry) => entry.energy)), sleep14: mean(recent14.map((entry) => entry.sleepQuality)), soreness14: mean(recent14.map((entry) => entry.soreness)), stress14: mean(recent14.map((entry) => entry.stress)) };
  const achievements: Achievement[] = [
    { id: 'first-session', title: 'Langkah pertama', description: 'Selesaikan satu sesi.', earned: completed.length >= 1 },
    { id: 'five-sessions', title: 'Mulai konsisten', description: 'Selesaikan lima sesi.', earned: completed.length >= 5 },
    { id: 'hundred-minutes', title: '100 menit bergerak', description: 'Kumpulkan 100 menit latihan.', earned: totalMinutes >= 100 },
    { id: 'journal-week', title: 'Kenal kondisi tubuh', description: 'Buat tujuh catatan harian.', earned: journals.length >= 7 },
    { id: 'first-template', title: 'Latihan pribadi', description: 'Simpan satu template Sesi Bebas.', earned: templates.length >= 1 },
  ];
  return { completedCount: completed.length, totalMinutes, sessionSources, categoryCounts, substitutionCount, calendar, journalAverages, achievements, summary: `${completed.length} sesi selesai dan ${totalMinutes} menit bergerak.` };
}
