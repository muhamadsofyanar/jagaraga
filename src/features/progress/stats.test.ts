import { describe, expect, it } from 'vitest';
import { getTodayPlan } from '../../domain/schedule';
import type { FreeSessionTemplate, JournalEntry } from '../../domain/types';
import type { SessionLog } from '../../persistence/db';
import { buildProgressStats } from './stats';

const session = (date: string, source: 'program' | 'free', seconds = 600, completedItemIds = ['march']): SessionLog => ({ id: `${date}-${source}`, date, plan: getTodayPlan(new Date(`${date}T12:00:00`), 1), source, status: 'completed', completedItemIds, skippedItemIds: [], elapsedSeconds: seconds, updatedAt: `${date}T12:00:00.000Z` });
const journal = (id: string, energy: JournalEntry['energy']): JournalEntry => ({ id, energy, soreness: 2, sleepQuality: 4, stress: 2, breathlessness: 'exercise', note: '', updatedAt: `${id}T12:00:00.000Z` });

describe('buildProgressStats', () => {
  it('counts completed minutes, sources, and exercise categories', () => {
    const sessions = [session('2026-08-13', 'program', 600, ['march', 'chair-squat']), session('2026-08-15', 'program', 1200, ['walk']), session('2026-08-15', 'free', 300, ['single-leg']), { ...session('2026-08-14', 'program'), status: 'ended' as const }];
    const stats = buildProgressStats(sessions, [], [], '2026-08-15');
    expect(stats.totalMinutes).toBe(35);
    expect(stats.sessionSources).toEqual({ program: 2, free: 1 });
    expect(stats.categoryCounts.strength).toBe(1);
    expect(stats.categoryCounts.balance).toBe(1);
    expect(stats.substitutionCount).toBe(0);
  });

  it('counts actual performed replacements while keeping legacy fallback stable', () => {
    const current = session('2026-08-15', 'program', 600, ['sit-to-stand']);
    current.performedItems = [{ plannedExerciseId: 'chair-squat', exerciseId: 'sit-to-stand', status: 'completed', target: { exerciseId: 'sit-to-stand', sets: 1, reps: 8 }, group: 'lower-strength', difficulty: 'light', equipment: ['chair'] }];
    const stats = buildProgressStats([current, session('2026-08-14', 'program', 600, ['walk'])], [], [], '2026-08-15');
    expect(stats.categoryCounts.strength).toBe(1);
    expect(stats.categoryCounts.cardio).toBe(1);
    expect(stats.substitutionCount).toBe(1);
  });

  it('uses real calendar dates and recent journal windows', () => {
    const stats = buildProgressStats([session('2026-08-13', 'program')], [journal('2026-08-01', 1), journal('2026-08-15', 5)], [], '2026-08-15');
    expect(stats.calendar.find((day) => day.date === '2026-08-13')?.done).toBe(true);
    expect(stats.calendar.find((day) => day.date === '2026-08-14')?.done).toBe(false);
    expect(stats.journalAverages.energy14).toBe(5);
    expect(stats.journalAverages.energy30).toBe(3);
  });

  it('returns five achievements and readable summary', () => {
    const template: FreeSessionTemplate = { id: 'x', name: 'X', items: [{ exerciseId: 'march', seconds: 60 }], createdAt: 'x', updatedAt: 'x' };
    const stats = buildProgressStats([session('2026-08-15', 'program')], [journal('2026-08-15', 3)], [template], '2026-08-15');
    expect(stats.achievements).toHaveLength(5);
    expect(stats.achievements.map((item) => item.id)).toContain('first-session');
    expect(stats.summary).toContain('1 sesi selesai');
  });
});
