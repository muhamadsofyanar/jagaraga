import { afterEach, beforeEach, describe, expect, it } from 'vitest';
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
    await repository.saveSession({ id: plan.date, date: plan.date, plan, status: 'ended', completedItemIds: [], skippedItemIds: [], elapsedSeconds: 10, updatedAt: new Date().toISOString() });
    await repository.saveSession({ id: plan.date, date: plan.date, plan, status: 'completed', completedItemIds: ['march'], skippedItemIds: [], elapsedSeconds: 20, updatedAt: new Date().toISOString() });
    expect((await repository.listSessions())).toHaveLength(1);
    expect((await repository.getSession(plan.date))?.status).toBe('completed');
  });
});
