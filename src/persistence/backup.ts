import { MODE1_EXERCISES } from '../domain/mode1';
import type { ExerciseTarget, FreeSessionTemplate, JournalEntry, TahajjudEntry } from '../domain/types';
import type { AppSettings, SessionLog } from './db';
import { defaultSettings, type ProgressRepository } from './repository';

export interface BackupV1 {
  schemaVersion: 1;
  exportedAt: string;
  settings: unknown;
  sessions: unknown[];
}

export interface BackupV2 {
  schemaVersion: 2;
  exportedAt: string;
  settings: AppSettings | null;
  sessions: SessionLog[];
  journalEntries: JournalEntry[];
  freeSessionTemplates: FreeSessionTemplate[];
  tahajjudEntries: TahajjudEntry[];
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const DAYS = new Set(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']);
const EXERCISES = new Set(Object.keys(MODE1_EXERCISES));
const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const isNumberIn = (value: unknown, min: number, max: number) => typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
const isIntegerIn = (value: unknown, min: number, max: number) => Number.isInteger(value) && isNumberIn(value, min, max);
const isString = (value: unknown, max: number, min = 0) => typeof value === 'string' && value.length >= min && value.length <= max;
const fail = (): never => { throw new Error('Data cadangan tidak valid'); };
function assertObject(value: unknown): asserts value is Record<string, unknown> { if (!isObject(value)) fail(); }
function assertArray(value: unknown): asserts value is unknown[] { if (!Array.isArray(value)) fail(); }

function validateDays(value: unknown) {
  return Array.isArray(value) && value.length <= 7 && value.every((day) => typeof day === 'string' && DAYS.has(day));
}

function validateTarget(value: unknown): value is ExerciseTarget {
  if (!isObject(value) || typeof value.exerciseId !== 'string' || !EXERCISES.has(value.exerciseId)) return false;
  const units = ['sets', 'reps', 'seconds', 'minutes'].filter((key) => value[key] !== undefined);
  return units.length === 1 && isIntegerIn(value[units[0]], 1, 999);
}

function validatePlan(value: unknown) {
  if (!isObject(value) || !isString(value.id, 100, 1) || !isString(value.title, 100, 1) || !isString(value.description, 300) || !isNumberIn(value.estimatedMinutes, 0, 999)) return false;
  if (!DATE.test(String(value.date)) || !DAYS.has(String(value.day)) || ![1, 2, 3, 4].includes(Number(value.programWeek))) return false;
  return Array.isArray(value.items) && value.items.length >= 1 && value.items.length <= 40 && value.items.every(validateTarget);
}

function validateSettings(value: unknown): AppSettings | null {
  if (value === null || value === undefined) return null;
  assertObject(value);
  if (value.id !== 'settings' || !DATE.test(String(value.startDate)) || ![1, 2, 3, 4].includes(Number(value.programWeek))) fail();
  if (!['system', 'light', 'dark'].includes(String(value.theme)) || typeof value.videoConsent !== 'boolean' || typeof value.onboardingComplete !== 'boolean') fail();
  const defaults = defaultSettings();
  const reminder = value.reminder === undefined ? defaults.reminder : value.reminder;
  const tahajjud = value.tahajjud === undefined ? defaults.tahajjud : value.tahajjud;
  if (!isObject(reminder) || typeof reminder.enabled !== 'boolean' || !TIME.test(String(reminder.trainingTime)) || !validateDays(reminder.trainingDays) || typeof reminder.browserNotifications !== 'boolean') fail();
  if (!isObject(tahajjud) || typeof tahajjud.enabled !== 'boolean' || !TIME.test(String(tahajjud.bedTime)) || !TIME.test(String(tahajjud.wakeTime)) || !validateDays(tahajjud.weekdays) || ![0, 3, 5, 10].includes(Number(tahajjud.mobilityMinutes))) fail();
  if (value.preferredTime !== undefined && !TIME.test(String(value.preferredTime))) fail();
  return { ...defaults, ...value, reminder: { ...defaults.reminder, ...reminder }, tahajjud: { ...defaults.tahajjud, ...tahajjud } } as AppSettings;
}

function validateSession(value: unknown, legacy: boolean): SessionLog {
  assertObject(value);
  if (!isString(value.id, 120, 1) || !DATE.test(String(value.date)) || !['completed', 'ended'].includes(String(value.status)) || !validatePlan(value.plan)) fail();
  if (!Array.isArray(value.completedItemIds) || !value.completedItemIds.every((id) => typeof id === 'string' && EXERCISES.has(id))) fail();
  if (!Array.isArray(value.skippedItemIds) || !value.skippedItemIds.every((id) => typeof id === 'string' && EXERCISES.has(id))) fail();
  if (!isNumberIn(value.elapsedSeconds, 0, 604800) || !isString(value.updatedAt, 50, 1)) fail();
  if (!legacy && !['program', 'free'].includes(String(value.source))) fail();
  if (value.templateId !== undefined && !isString(value.templateId, 100, 1)) fail();
  if (value.wellness !== undefined) {
    assertObject(value.wellness);
    const { energy, soreness, breathlessness, sleepHours, note } = value.wellness;
    if (!isNumberIn(energy, 1, 5) || !isNumberIn(soreness, 0, 10) || !isNumberIn(breathlessness, 0, 10)) fail();
    if (sleepHours !== undefined && !isNumberIn(sleepHours, 0, 24)) fail();
    if (note !== undefined && !isString(note, 300)) fail();
  }
  return { ...value, source: legacy ? 'program' : value.source } as unknown as SessionLog;
}

function validateJournal(value: unknown): JournalEntry {
  assertObject(value);
  if (!DATE.test(String(value.id)) || !isIntegerIn(value.energy, 1, 5) || !isNumberIn(value.soreness, 0, 10) || !isIntegerIn(value.sleepQuality, 1, 5) || !isIntegerIn(value.stress, 1, 5)) fail();
  if (!['none', 'exercise', 'ordinary'].includes(String(value.breathlessness)) || !isString(value.note, 500) || !isString(value.updatedAt, 50, 1)) fail();
  return value as unknown as JournalEntry;
}

function validateTemplate(value: unknown): FreeSessionTemplate {
  assertObject(value);
  if (!isString(value.id, 100, 1) || !isString(value.name, 60, 1) || !Array.isArray(value.items) || value.items.length < 1 || value.items.length > 40 || !value.items.every(validateTarget)) fail();
  if (!isString(value.createdAt, 50, 1) || !isString(value.updatedAt, 50, 1)) fail();
  return value as unknown as FreeSessionTemplate;
}

function validateTahajjud(value: unknown): TahajjudEntry {
  assertObject(value);
  if (!DATE.test(String(value.id)) || typeof value.sleptOnTime !== 'boolean' || typeof value.wokeOnTime !== 'boolean' || typeof value.prayed !== 'boolean') fail();
  if (!isIntegerIn(value.readiness, 1, 5) || !isString(value.note, 280) || !isString(value.updatedAt, 50, 1)) fail();
  return value as unknown as TahajjudEntry;
}

export function validateAndMigrateBackup(input: unknown): BackupV2 {
  assertObject(input);
  if (![1, 2].includes(Number(input.schemaVersion)) || !isString(input.exportedAt, 50, 1)) fail();
  assertArray(input.sessions);
  const legacy = input.schemaVersion === 1;
  const sessions = input.sessions.map((session) => validateSession(session, legacy));
  const settings = validateSettings(input.settings);
  if (legacy) return { schemaVersion: 2, exportedAt: input.exportedAt as string, settings, sessions, journalEntries: [], freeSessionTemplates: [], tahajjudEntries: [] };
  assertArray(input.journalEntries);
  assertArray(input.freeSessionTemplates);
  assertArray(input.tahajjudEntries);
  return {
    schemaVersion: 2,
    exportedAt: input.exportedAt as string,
    settings,
    sessions,
    journalEntries: input.journalEntries.map(validateJournal),
    freeSessionTemplates: input.freeSessionTemplates.map(validateTemplate),
    tahajjudEntries: input.tahajjudEntries.map(validateTahajjud),
  };
}

export const validateBackup = validateAndMigrateBackup;

export async function exportBackup(repository: ProgressRepository): Promise<string> {
  const [settings, sessions, journalEntries, freeSessionTemplates, tahajjudEntries] = await Promise.all([
    repository.db.settings.get('settings'), repository.listSessions(), repository.listJournalEntries(),
    repository.listTemplates(), repository.listTahajjudEntries(),
  ]);
  const backup: BackupV2 = { schemaVersion: 2, exportedAt: new Date().toISOString(), settings: settings ?? null, sessions, journalEntries, freeSessionTemplates, tahajjudEntries };
  return JSON.stringify(backup, null, 2);
}

export async function importBackup(repository: ProgressRepository, raw: string) {
  const backup = validateAndMigrateBackup(JSON.parse(raw));
  const tables = [repository.db.settings, repository.db.sessions, repository.db.activeSessions, repository.db.journalEntries, repository.db.freeSessionTemplates, repository.db.tahajjudEntries];
  await repository.db.transaction('rw', tables, async () => {
    await Promise.all(tables.map((table) => table.clear()));
    if (backup.settings) await repository.db.settings.put(backup.settings);
    if (backup.sessions.length) await repository.db.sessions.bulkPut(backup.sessions);
    if (backup.journalEntries.length) await repository.db.journalEntries.bulkPut(backup.journalEntries);
    if (backup.freeSessionTemplates.length) await repository.db.freeSessionTemplates.bulkPut(backup.freeSessionTemplates);
    if (backup.tahajjudEntries.length) await repository.db.tahajjudEntries.bulkPut(backup.tahajjudEntries);
  });
  return { sessions: backup.sessions.length, journals: backup.journalEntries.length, templates: backup.freeSessionTemplates.length, tahajjud: backup.tahajjudEntries.length };
}
