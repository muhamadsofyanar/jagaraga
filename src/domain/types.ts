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
