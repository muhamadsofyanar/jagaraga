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
export type MovementGroup = 'warmup-mobility' | 'low-impact-cardio' | 'lower-strength' | 'upper-strength' | 'core-posture' | 'balance' | 'cooldown-recovery';
export type Difficulty = 'light' | 'moderate' | 'higher';
export type MovementPosition = 'standing' | 'seated' | 'floor' | 'supine' | 'prone';
export type EquipmentId = 'chair' | 'wall' | 'mat' | 'water-bottles' | 'resistance-band' | 'light-dumbbells';
export type BodyRegion = 'full-body' | 'neck' | 'shoulders' | 'chest' | 'upper-back' | 'lower-back' | 'core' | 'hips' | 'thighs' | 'glutes' | 'knees' | 'calves' | 'ankles' | 'arms';
export type MovementGoal = 'mobility' | 'cardio' | 'strength' | 'posture' | 'balance' | 'recovery';
export type TargetUnit = 'reps' | 'seconds' | 'minutes';

export interface MovementBenefits {
  muscles: string;
  joints: string;
  dailyFunction: string;
  fitness: string;
}

export interface ExerciseDosage {
  unit: TargetUnit;
  value: number;
  sets?: number;
  restSeconds?: number;
}

export interface Exercise {
  id: string;
  title: string;
  alternateName?: string;
  kind: ExerciseKind;
  group: MovementGroup;
  purpose: string;
  benefits: MovementBenefits;
  bodyRegions: BodyRegion[];
  movementPatterns: string[];
  goals: MovementGoal[];
  difficulty: Difficulty;
  positions: MovementPosition[];
  equipment: EquipmentId[];
  steps: string[];
  breathingCue: string;
  dosage: ExerciseDosage;
  commonMistakes: string[];
  beginnerModification: string;
  progression: string;
  stopCondition: string;
  illustration: string;
  searchTerms: string[];
  compatibleSubstitutionIds?: string[];
  videoId?: string;
}

export interface ExerciseTarget {
  exerciseId: string;
  sets?: number;
  reps?: number;
  seconds?: number;
  minutes?: number;
}

export interface ConfiguredExerciseTarget extends ExerciseTarget {
  plannedExerciseId?: string;
  difficultyAcknowledged?: boolean;
}

export interface SessionDefinition {
  id: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  items: ConfiguredExerciseTarget[];
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
