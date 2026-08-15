import type { DayKey, ExerciseTarget, SessionDefinition } from './types';

export { EXERCISES_BY_ID as MODE1_EXERCISES } from '../catalog';

const warmup: ExerciseTarget[] = [
  { exerciseId: 'march', seconds: 120 },
  { exerciseId: 'shoulder-roll', reps: 10 },
  { exerciseId: 'chest-open', reps: 10 },
  { exerciseId: 'standing-cat-cow', reps: 8 },
  { exerciseId: 'trunk-turn', reps: 8 },
  { exerciseId: 'hip-circle', reps: 8 },
  { exerciseId: 'knee-raise', reps: 10 },
  { exerciseId: 'ankle-circle', reps: 8 },
];

const cooldown: ExerciseTarget[] = [{ exerciseId: 'slow-walk', seconds: 180 }];

export const MODE1_SESSIONS: Record<DayKey, SessionDefinition> = {
  monday: { id: 'walk-base', title: 'Kardio dasar', description: 'Pemanasan dan jalan nyaman.', estimatedMinutes: 25, items: [...warmup, { exerciseId: 'walk' }, ...cooldown] },
  tuesday: { id: 'strength-a', title: 'Kekuatan A', description: 'Kaki, dorong, pinggul, inti, dan betis.', estimatedMinutes: 25, items: [...warmup.slice(0, 4), ...['chair-squat', 'wall-pushup', 'glute-bridge', 'bird-dog', 'calf-raise'].map((exerciseId) => ({ exerciseId }))] },
  wednesday: { id: 'walk-balance', title: 'Kardio & keseimbangan', description: 'Jalan nyaman dan latihan kestabilan.', estimatedMinutes: 30, items: [...warmup, { exerciseId: 'walk' }, { exerciseId: 'single-leg', seconds: 20 }, { exerciseId: 'heel-to-toe', reps: 8 }, ...cooldown] },
  thursday: { id: 'active-recovery', title: 'Pemulihan aktif', description: 'Gerak lembut dan napas santai.', estimatedMinutes: 18, items: [{ exerciseId: 'easy-mobility', minutes: 10 }, { exerciseId: 'slow-breathing', minutes: 5 }] },
  friday: { id: 'strength-b', title: 'Kekuatan B', description: 'Pola berdiri, menarik, dan kestabilan tubuh.', estimatedMinutes: 25, items: [...warmup.slice(0, 4), ...['chair-squat', 'wall-pushup', 'hip-hinge', 'row', 'dead-bug', 'calf-raise'].map((exerciseId) => ({ exerciseId }))] },
  saturday: { id: 'fun-cardio', title: 'Kardio pilihan', description: 'Jalan atau senam low-impact ringan.', estimatedMinutes: 30, items: [...warmup, { exerciseId: 'walk' }, ...cooldown] },
  sunday: { id: 'active-rest', title: 'Istirahat aktif', description: 'Bergerak ringan dan mengevaluasi pemulihan.', estimatedMinutes: 15, items: [{ exerciseId: 'easy-mobility', minutes: 10 }] },
};

export const WEEK_VOLUME = {
  1: { cardioMin: 10, cardioMax: 15, sets: 1, repsMin: 8, repsMax: 8 },
  2: { cardioMin: 15, cardioMax: 20, sets: 1, repsMin: 10, repsMax: 12 },
  3: { cardioMin: 20, cardioMax: 25, sets: 2, repsMin: 8, repsMax: 8 },
  4: { cardioMin: 25, cardioMax: 30, sets: 2, repsMin: 10, repsMax: 12 },
} as const;
