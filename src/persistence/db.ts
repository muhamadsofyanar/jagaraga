import Dexie, { type EntityTable } from 'dexie';
import type { PlannedSession } from '../domain/types';

export interface AppSettings {
  id: 'settings';
  startDate: string;
  programWeek: 1 | 2 | 3 | 4;
  preferredTime?: string;
  theme: 'system' | 'light' | 'dark';
  videoConsent: boolean;
  onboardingComplete: boolean;
}

export interface WellnessEntry {
  energy: 1 | 2 | 3 | 4 | 5;
  soreness: number;
  breathlessness: number;
  sleepHours?: number;
  note?: string;
}

export interface SessionLog {
  id: string;
  date: string;
  plan: PlannedSession;
  status: 'completed' | 'ended';
  completedItemIds: string[];
  skippedItemIds: string[];
  elapsedSeconds: number;
  wellness?: WellnessEntry;
  warningFlag?: boolean;
  updatedAt: string;
}

export interface ActiveSession {
  id: 'active';
  date: string;
  plan: PlannedSession;
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

  constructor(name = 'jagaraga') {
    super(name);
    this.version(1).stores({ settings: 'id', sessions: 'id,date,status', activeSessions: 'id,date' });
  }
}

export const appDb = new JagaRagaDB();
