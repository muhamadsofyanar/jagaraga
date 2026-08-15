export type DayKey =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export type ProgramWeek = 1 | 2 | 3 | 4;
export type ExerciseKind = 'warmup' | 'cardio' | 'strength' | 'balance' | 'cooldown' | 'recovery';
export type SessionSource = 'program' | 'free';
export type BreathlessnessLevel = 'none' | 'exercise' | 'ordinary';

export interface Exercise {
  id: string;
  title: string;
  kind: ExerciseKind;
  purpose: string;
  equipment: string[];
  steps: string[];
  breathingCue: string;
  commonMistakes: string[];
  beginnerModification: string;
  stopCondition: string;
  illustration: string;
  videoId?: string;
}

export interface ExerciseTarget {
  exerciseId: string;
  sets?: number;
  reps?: number;
  seconds?: number;
  minutes?: number;
}

export interface SessionDefinition {
  id: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  items: ExerciseTarget[];
}

export interface PlannedSession extends SessionDefinition {
  date: string;
  day: DayKey;
  programWeek: ProgramWeek;
}

export interface JournalEntry {
  id: string;
  energy: 1 | 2 | 3 | 4 | 5;
  soreness: number;
  sleepQuality: 1 | 2 | 3 | 4 | 5;
  stress: 1 | 2 | 3 | 4 | 5;
  breathlessness: BreathlessnessLevel;
  note: string;
  updatedAt: string;
}

export interface FreeSessionTemplate {
  id: string;
  name: string;
  items: ExerciseTarget[];
  createdAt: string;
  updatedAt: string;
}

export interface TahajjudEntry {
  id: string;
  sleptOnTime: boolean;
  wokeOnTime: boolean;
  prayed: boolean;
  readiness: 1 | 2 | 3 | 4 | 5;
  note: string;
  updatedAt: string;
}
