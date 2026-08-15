import Dexie, { type EntityTable } from 'dexie';
import type { DayKey, Difficulty, EquipmentId, ExerciseTarget, FreeSessionTemplate, JournalEntry, MovementGroup, PlannedSession, SessionSource, TahajjudEntry } from '../domain/types';

export interface ReminderSettings {
  enabled: boolean;
  trainingTime: string;
  trainingDays: DayKey[];
  browserNotifications: boolean;
}

export interface TahajjudSettings {
  enabled: boolean;
  bedTime: string;
  wakeTime: string;
  weekdays: DayKey[];
  mobilityMinutes: 0 | 3 | 5 | 10;
}

export interface AppSettings {
  id: 'settings';
  startDate: string;
  programWeek: 1 | 2 | 3 | 4;
  preferredTime?: string;
  theme: 'system' | 'light' | 'dark';
  videoConsent: boolean;
  onboardingComplete: boolean;
  reminder: ReminderSettings;
  tahajjud: TahajjudSettings;
}

export interface WellnessEntry {
  energy: 1 | 2 | 3 | 4 | 5;
  soreness: number;
  breathlessness: number;
  sleepHours?: number;
  note?: string;
}

export interface ExercisePreference {
  originalExerciseId: string;
  replacementExerciseId: string;
  updatedAt: string;
}

export interface PerformedMovement {
  plannedExerciseId: string;
  exerciseId: string;
  status: 'completed' | 'skipped';
  target: ExerciseTarget;
  group: MovementGroup;
  difficulty: Difficulty;
  equipment: EquipmentId[];
}

export interface SessionLog {
  id: string;
  date: string;
  plan: PlannedSession;
  source: SessionSource;
  templateId?: string;
  status: 'completed' | 'ended';
  completedItemIds: string[];
  skippedItemIds: string[];
  elapsedSeconds: number;
  wellness?: WellnessEntry;
  warningFlag?: boolean;
  performedItems?: PerformedMovement[];
  updatedAt: string;
}

export interface ActiveSession {
  id: 'active';
  date: string;
  plan: PlannedSession;
  source: SessionSource;
  templateId?: string;
  itemIndex: number;
  completedItemIds: string[];
  skippedItemIds: string[];
  startedAt: string;
  timerStartedAt?: string;
  elapsedBeforeTimer: number;
}

export class JagaRagaDB extends Dexie {
  settings!: EntityTable<AppSettings, 'id'>;
  sessions!: EntityTable<SessionLog, 'id'>;
  activeSessions!: EntityTable<ActiveSession, 'id'>;
  journalEntries!: EntityTable<JournalEntry, 'id'>;
  freeSessionTemplates!: EntityTable<FreeSessionTemplate, 'id'>;
  tahajjudEntries!: EntityTable<TahajjudEntry, 'id'>;
  exercisePreferences!: EntityTable<ExercisePreference, 'originalExerciseId'>;

  constructor(name = 'jagaraga') {
    super(name);
    this.version(1).stores({ settings: 'id', sessions: 'id,date,status', activeSessions: 'id,date' });
    this.version(2).stores({
      settings: 'id',
      sessions: 'id,date,status,source',
      activeSessions: 'id,date,source',
      journalEntries: 'id,updatedAt',
      freeSessionTemplates: 'id,updatedAt',
      tahajjudEntries: 'id,updatedAt',
    }).upgrade(async (transaction) => {
      await transaction.table('sessions').toCollection().modify((row) => { row.source ??= 'program'; });
      await transaction.table('activeSessions').toCollection().modify((row) => { row.source ??= 'program'; });
    });
    this.version(3).stores({
      settings: 'id',
      sessions: 'id,date,status,source',
      activeSessions: 'id,date,source',
      journalEntries: 'id,updatedAt',
      freeSessionTemplates: 'id,updatedAt',
      tahajjudEntries: 'id,updatedAt',
      exercisePreferences: 'originalExerciseId,replacementExerciseId,updatedAt',
    });
  }
}

export const appDb = new JagaRagaDB();
