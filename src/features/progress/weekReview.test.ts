import { describe, expect, it } from 'vitest';
import { reviewWeek } from './weekReview';
import type { SessionLog } from '../../persistence/db';
import { getTodayPlan } from '../../domain/schedule';

const log = (id: string, breathlessness = 2, soreness = 2): SessionLog => ({ id, date: `2026-08-${id.padStart(2, '0')}`, plan: getTodayPlan(new Date(2026, 7, 17), 1), status: 'completed', completedItemIds: ['march'], skippedItemIds: [], elapsedSeconds: 900, wellness: { energy: 3, soreness, breathlessness }, updatedAt: new Date().toISOString() });

describe('reviewWeek', () => {
  it('advances after four comfortable completed sessions', () => expect(reviewWeek([log('1'), log('2'), log('3'), log('4')]).outcome).toBe('advance'));
  it('repeats when fewer than four sessions are complete', () => expect(reviewWeek([log('1'), log('2')]).outcome).toBe('repeat'));
  it('recommends assessment after repeated very high breathlessness', () => expect(reviewWeek([log('1', 9), log('2', 8), log('3'), log('4')]).outcome).toBe('assessment'));
});
