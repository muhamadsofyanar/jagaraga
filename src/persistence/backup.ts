import type { AppSettings, SessionLog } from './db';
import type { ProgressRepository } from './repository';

export interface BackupV1 {
  schemaVersion: 1;
  exportedAt: string;
  settings: AppSettings | null;
  sessions: SessionLog[];
}

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;
const isNumberIn = (value: unknown, min: number, max: number) => typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
const fail = (): never => { throw new Error('Data cadangan tidak valid'); };
function assertObject(value: unknown): asserts value is Record<string, unknown> {
  if (!isObject(value)) throw new Error('Data cadangan tidak valid');
}

export function validateBackup(input: unknown): BackupV1 {
  assertObject(input);
  if (input.schemaVersion !== 1 || typeof input.exportedAt !== 'string') fail();
  if (!Array.isArray(input.sessions)) throw new Error('Data cadangan tidak valid');
  for (const session of input.sessions) {
    if (!isObject(session) || typeof session.id !== 'string' || typeof session.date !== 'string' || !['completed', 'ended'].includes(String(session.status)) || !isObject(session.plan)) fail();
    if (session.wellness !== undefined) {
      assertObject(session.wellness);
      const { energy, soreness, breathlessness, sleepHours, note } = session.wellness;
      if (!isNumberIn(energy, 1, 5) || !isNumberIn(soreness, 0, 10) || !isNumberIn(breathlessness, 0, 10)) fail();
      if (sleepHours !== undefined && !isNumberIn(sleepHours, 0, 24)) fail();
      if (note !== undefined && (typeof note !== 'string' || note.length > 300)) fail();
    }
  }
  if (input.settings !== null && input.settings !== undefined) {
    if (!isObject(input.settings) || input.settings.id !== 'settings' || ![1, 2, 3, 4].includes(Number(input.settings.programWeek))) fail();
  }
  return input as unknown as BackupV1;
}

export async function exportBackup(repository: ProgressRepository): Promise<string> {
  const settings = await repository.db.settings.get('settings');
  const sessions = await repository.listSessions();
  return JSON.stringify({ schemaVersion: 1, exportedAt: new Date().toISOString(), settings: settings ?? null, sessions }, null, 2);
}

export async function importBackup(repository: ProgressRepository, raw: string) {
  const backup = validateBackup(JSON.parse(raw));
  await repository.db.transaction('rw', repository.db.settings, repository.db.sessions, repository.db.activeSessions, async () => {
    await repository.db.settings.clear();
    await repository.db.sessions.clear();
    await repository.db.activeSessions.clear();
    if (backup.settings) await repository.db.settings.put(backup.settings);
    if (backup.sessions.length) await repository.db.sessions.bulkPut(backup.sessions);
  });
}
