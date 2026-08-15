import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { getTodayPlan } from '../domain/schedule';
import type { FreeSessionTemplate, JournalEntry, TahajjudEntry } from '../domain/types';
import { exportBackup, importBackup, validateAndMigrateBackup } from './backup';
import { JagaRagaDB, type SessionLog } from './db';
import { defaultSettings, ProgressRepository } from './repository';

describe('backup version 2', () => {
  let db: JagaRagaDB;
  let repository: ProgressRepository;

  beforeEach(() => {
    db = new JagaRagaDB(`backup-${crypto.randomUUID()}`);
    repository = new ProgressRepository(db);
  });

  afterEach(async () => { await db.delete(); });

  it('migrates a schema 1 backup and supplies new defaults', () => {
    const plan = getTodayPlan(new Date(2026, 7, 17), 1);
    const migrated = validateAndMigrateBackup({
      schemaVersion: 1,
      exportedAt: '2026-08-15T00:00:00.000Z',
      settings: { id: 'settings', startDate: '2026-08-01', programWeek: 1, theme: 'system', videoConsent: false, onboardingComplete: true },
      sessions: [{ id: plan.date, date: plan.date, plan, status: 'completed', completedItemIds: [], skippedItemIds: [], elapsedSeconds: 60, updatedAt: '2026-08-15T00:00:00.000Z' }],
    });

    expect(migrated.schemaVersion).toBe(2);
    expect(migrated.sessions[0].source).toBe('program');
    expect(migrated.journalEntries).toEqual([]);
    expect(migrated.settings?.reminder.trainingTime).toBe('06:00');
  });

  it('round-trips all schema 2 collections', async () => {
    const now = '2026-08-15T00:00:00.000Z';
    const plan = getTodayPlan(new Date(2026, 7, 17), 1);
    const session = { id: plan.date, date: plan.date, plan, source: 'program', status: 'completed', completedItemIds: ['march'], skippedItemIds: [], elapsedSeconds: 60, updatedAt: now } satisfies SessionLog;
    const journal = { id: '2026-08-15', energy: 3, soreness: 2, sleepQuality: 4, stress: 2, breathlessness: 'exercise', note: '', updatedAt: now } satisfies JournalEntry;
    const template = { id: 'ringan', name: 'Ringan', items: [{ exerciseId: 'march', seconds: 60 }], createdAt: now, updatedAt: now } satisfies FreeSessionTemplate;
    const tahajjud = { id: '2026-08-15', sleptOnTime: true, wokeOnTime: true, prayed: true, readiness: 4, note: '', updatedAt: now } satisfies TahajjudEntry;

    await repository.saveSettings({ ...defaultSettings(), onboardingComplete: true });
    await repository.saveSession(session);
    await repository.saveJournalEntry(journal);
    await repository.saveTemplate(template);
    await repository.saveTahajjudEntry(tahajjud);
    const raw = await exportBackup(repository);
    await repository.reset();

    const restored = await importBackup(repository, raw);
    expect(restored).toEqual({ sessions: 1, journals: 1, templates: 1, tahajjud: 1 });
    expect(await repository.listJournalEntries()).toEqual([journal]);
    expect(await repository.listTemplates()).toEqual([template]);
    expect(await repository.listTahajjudEntries()).toEqual([tahajjud]);
  });

  it('rejects invalid input before changing existing data', async () => {
    const plan = getTodayPlan(new Date(2026, 7, 17), 1);
    await repository.saveSession({ id: plan.date, date: plan.date, plan, source: 'program', status: 'completed', completedItemIds: [], skippedItemIds: [], elapsedSeconds: 60, updatedAt: '2026-08-15T00:00:00.000Z' });
    const invalid = JSON.stringify({ schemaVersion: 2, exportedAt: 'x', settings: null, sessions: [], journalEntries: [{ id: 'not-a-date' }], freeSessionTemplates: [], tahajjudEntries: [] });

    await expect(importBackup(repository, invalid)).rejects.toThrow('Data cadangan tidak valid');
    expect(await repository.listSessions()).toHaveLength(1);
  });

  it('rejects wellness values outside safe input ranges', () => {
    const invalid = {
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      settings: null,
      sessions: [{ id: 'x', date: '2026-08-15', status: 'completed', wellness: { energy: 8, soreness: 2, breathlessness: 1 } }],
    };
    expect(() => validateAndMigrateBackup(invalid)).toThrow('Data cadangan tidak valid');
  });
});
