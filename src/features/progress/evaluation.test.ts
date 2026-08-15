import { describe, expect, it } from 'vitest';
import { getTodayPlan } from '../../domain/schedule';
import type { JournalEntry } from '../../domain/types';
import type { SessionLog } from '../../persistence/db';
import { evaluateWeek } from './evaluation';

const journal = (id: string, values: Partial<JournalEntry> = {}): JournalEntry => ({ id, energy: 3, soreness: 2, sleepQuality: 3, stress: 2, breathlessness: 'exercise', note: '', updatedAt: `${id}T00:00:00.000Z`, ...values });
const session = (id: string): SessionLog => ({ id, date: id, plan: getTodayPlan(new Date(`${id}T12:00:00`), 1), source: 'program', status: 'completed', completedItemIds: ['march'], skippedItemIds: [], elapsedSeconds: 600, updatedAt: `${id}T00:00:00.000Z` });

describe('evaluateWeek', () => {
  it('asks for assessment when breathing trouble occurs during ordinary activity', () => {
    const result = evaluateWeek([], [journal('2026-08-15', { breathlessness: 'ordinary' })], '2026-08-15');
    expect(result.outcome).toBe('assess');
    expect(result.reasons).toContain('Engap tercatat saat aktivitas biasa.');
  });
  it('lightens for high or worsening soreness', () => {
    expect(evaluateWeek([], [journal('2026-08-15', { soreness: 8 })], '2026-08-15').outcome).toBe('lighten');
    expect(evaluateWeek([], [journal('2026-08-13', { soreness: 2 }), journal('2026-08-14', { soreness: 4 }), journal('2026-08-15', { soreness: 6 })], '2026-08-15').outcome).toBe('lighten');
  });
  it('advances after three sessions with adequate energy and sleep', () => {
    const result = evaluateWeek([session('2026-08-13'), session('2026-08-14'), session('2026-08-15')], [journal('2026-08-13'), journal('2026-08-14'), journal('2026-08-15')], '2026-08-15');
    expect(result.outcome).toBe('advance');
    expect(result.reasons).toContain('3 sesi selesai dalam 7 hari.');
  });
  it('maintains when evidence is not yet enough', () => expect(evaluateWeek([session('2026-08-15')], [journal('2026-08-15')], '2026-08-15').outcome).toBe('maintain'));
});
