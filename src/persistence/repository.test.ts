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
});
