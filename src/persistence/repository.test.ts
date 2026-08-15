import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import Dexie from 'dexie';
import type { FreeSessionTemplate, JournalEntry, TahajjudEntry } from '../domain/types';
import { JagaRagaDB } from './db';
import { ProgressRepository, defaultSettings } from './repository';
import { getTodayPlan } from '../domain/schedule';

describe('ProgressRepository', () => {
  let db: JagaRagaDB;
  let repository: ProgressRepository;

  beforeEach(() => {
    db = new JagaRagaDB(`test-${crypto.randomUUID()}`);
    repository = new ProgressRepository(db);
  });

  afterEach(async () => {
    await db.delete();
  });

  it('round-trips settings', async () => {
    const settings = { ...defaultSettings(), onboardingComplete: true as const, preferredTime: '05:00' };
    await repository.saveSettings(settings);
    expect(await repository.getSettings()).toEqual(settings);
  });

  it('upserts a session by id', async () => {
    const plan = getTodayPlan(new Date(2026, 7, 17), 1);
    await repository.saveSession({ id: plan.date, date: plan.date, plan, source: 'program', status: 'ended', completedItemIds: [], skippedItemIds: [], elapsedSeconds: 10, updatedAt: new Date().toISOString() });
    await repository.saveSession({ id: plan.date, date: plan.date, plan, source: 'program', status: 'completed', completedItemIds: ['march'], skippedItemIds: [], elapsedSeconds: 20, updatedAt: new Date().toISOString() });
    expect((await repository.listSessions())).toHaveLength(1);
    expect((await repository.getSession(plan.date))?.status).toBe('completed');
  });

  it('stores journals, templates, and tahajjud entries', async () => {
    const now = new Date().toISOString();
    const journal = {
      id: '2026-08-15', energy: 3, soreness: 2, sleepQuality: 4, stress: 2,
      breathlessness: 'exercise', note: '', updatedAt: now,
    } satisfies JournalEntry;
    const template = {
      id: 'gentle-start', name: 'Mulai Ringan', items: [{ exerciseId: 'march', seconds: 60 }],
      createdAt: now, updatedAt: now,
    } satisfies FreeSessionTemplate;
    const tahajjud = {
      id: '2026-08-15', sleptOnTime: true, wokeOnTime: true, prayed: true,
      readiness: 4, note: '', updatedAt: now,
    } satisfies TahajjudEntry;

    await repository.saveJournalEntry(journal);
    await repository.saveTemplate(template);
    await repository.saveTahajjudEntry(tahajjud);

    expect(await repository.listJournalEntries()).toEqual([journal]);
    expect(await repository.listTemplates()).toEqual([template]);
    expect(await repository.listTahajjudEntries()).toEqual([tahajjud]);

    await repository.deleteTemplate(template.id);
    expect(await repository.listTemplates()).toEqual([]);
  });

  it('stores one preferred replacement per original movement', async () => {
    const preference = { originalExerciseId: 'chair-squat', replacementExerciseId: 'sit-to-stand', updatedAt: '2026-08-15T00:00:00.000Z' };
    await repository.saveExercisePreference(preference);
    expect(await repository.listExercisePreferences()).toEqual([preference]);

    const updated = { ...preference, replacementExerciseId: 'hip-hinge', updatedAt: '2026-08-16T00:00:00.000Z' };
    await repository.saveExercisePreference(updated);
    expect(await repository.listExercisePreferences()).toEqual([updated]);

    await repository.deleteExercisePreference('chair-squat');
    expect(await repository.listExercisePreferences()).toEqual([]);
  });

  it('completes a session with performed movement history atomically', async () => {
    const plan = getTodayPlan(new Date(2026, 7, 18), 1);
    await repository.saveActiveSession({ id: 'active', date: plan.date, plan, source: 'program', itemIndex: 4, completedItemIds: [], skippedItemIds: [], startedAt: '2026-08-15T00:00:00.000Z', elapsedBeforeTimer: 10 });
    const log = {
      id: plan.date, date: plan.date, plan, source: 'program' as const, status: 'completed' as const,
      completedItemIds: ['chair-squat'], skippedItemIds: [], elapsedSeconds: 60,
      performedItems: [{ plannedExerciseId: 'chair-squat', exerciseId: 'sit-to-stand', status: 'completed' as const, target: { exerciseId: 'sit-to-stand', sets: 1, reps: 8 }, group: 'lower-strength' as const, difficulty: 'light' as const, equipment: ['chair' as const] }],
      updatedAt: '2026-08-15T00:00:00.000Z',
    };
    await repository.completeSession(log);
    expect((await repository.getSession(plan.date))?.performedItems).toEqual(log.performedItems);
    expect(await repository.getActiveSession()).toBeUndefined();
  });

  it('includes preferences in a full local reset', async () => {
    await repository.saveSettings({ ...defaultSettings(), onboardingComplete: true });
    await repository.saveExercisePreference({ originalExerciseId: 'chair-squat', replacementExerciseId: 'sit-to-stand', updatedAt: '2026-08-15T00:00:00.000Z' });
    await repository.reset();
    expect(await db.settings.count()).toBe(0);
    expect(await repository.listExercisePreferences()).toEqual([]);
  });

  it('upgrades version 1 sessions with a program source', async () => {
    const name = `migration-${crypto.randomUUID()}`;
    const legacy = new Dexie(name);
    legacy.version(1).stores({ settings: 'id', sessions: 'id,date,status', activeSessions: 'id,date' });
    const plan = getTodayPlan(new Date(2026, 7, 17), 1);
    await legacy.table('sessions').put({
      id: plan.date, date: plan.date, plan, status: 'completed', completedItemIds: [],
      skippedItemIds: [], elapsedSeconds: 60, updatedAt: new Date().toISOString(),
    });
    await legacy.table('activeSessions').put({
      id: 'active', date: plan.date, plan, itemIndex: 0, completedItemIds: [], skippedItemIds: [],
      startedAt: new Date().toISOString(), elapsedBeforeTimer: 0,
    });
    legacy.close();

    const upgraded = new JagaRagaDB(name);
    expect((await upgraded.sessions.get(plan.date))?.source).toBe('program');
    expect((await upgraded.activeSessions.get('active'))?.source).toBe('program');
    await upgraded.delete();
  });

  it('upgrades v2 without changing existing records', async () => {
    const name = `migration-v3-${crypto.randomUUID()}`;
    const legacy = new Dexie(name);
    legacy.version(2).stores({
      settings: 'id', sessions: 'id,date,status,source', activeSessions: 'id,date,source',
      journalEntries: 'id,updatedAt', freeSessionTemplates: 'id,updatedAt', tahajjudEntries: 'id,updatedAt',
    });
    const settings = { ...defaultSettings(), onboardingComplete: true };
    const plan = getTodayPlan(new Date(2026, 7, 17), 1);
    const session = { id: plan.date, date: plan.date, plan, source: 'program', status: 'completed', completedItemIds: ['march'], skippedItemIds: [], elapsedSeconds: 60, updatedAt: '2026-08-15T00:00:00.000Z' };
    const journal = { id: '2026-08-15', energy: 3, soreness: 2, sleepQuality: 4, stress: 2, breathlessness: 'exercise', note: '', updatedAt: '2026-08-15T00:00:00.000Z' };
    const template = { id: 'ringan', name: 'Ringan', items: [{ exerciseId: 'march', seconds: 60 }], createdAt: '2026-08-15T00:00:00.000Z', updatedAt: '2026-08-15T00:00:00.000Z' };
    const tahajjud = { id: '2026-08-15', sleptOnTime: true, wokeOnTime: true, prayed: true, readiness: 4, note: '', updatedAt: '2026-08-15T00:00:00.000Z' };
    await legacy.table('settings').put(settings);
    await legacy.table('sessions').put(session);
    await legacy.table('journalEntries').put(journal);
    await legacy.table('freeSessionTemplates').put(template);
    await legacy.table('tahajjudEntries').put(tahajjud);
    legacy.close();

    const upgraded = new JagaRagaDB(name);
    expect(await upgraded.settings.get('settings')).toEqual(settings);
    expect(await upgraded.sessions.get(plan.date)).toEqual(session);
    expect(await upgraded.journalEntries.get(journal.id)).toEqual(journal);
    expect(await upgraded.freeSessionTemplates.get(template.id)).toEqual(template);
    expect(await upgraded.tahajjudEntries.get(tahajjud.id)).toEqual(tahajjud);
    expect(await upgraded.exercisePreferences.toArray()).toEqual([]);
    await upgraded.delete();
  });
});
