import { describe, expect, it } from 'vitest';
import { getTodayPlan } from '../domain/schedule';
import type { ActiveSession } from '../persistence/db';
import { getElapsedSeconds, sessionReducer } from './reducer';

const active = (): ActiveSession => ({ id: 'active', date: '2026-08-17', plan: getTodayPlan(new Date(2026, 7, 17), 1), itemIndex: 0, completedItemIds: [], skippedItemIds: [], startedAt: '2026-08-17T00:00:00.000Z', elapsedBeforeTimer: 10 });

describe('session reducer', () => {
  it('completes an item once and moves forward', () => {
    const next = sessionReducer(active(), { type: 'COMPLETE_ITEM', id: 'march' });
    expect(next.completedItemIds).toEqual(['march']);
    expect(next.itemIndex).toBe(1);
  });

  it('never advances beyond the final item', () => {
    const state = active();
    state.itemIndex = state.plan.items.length - 1;
    expect(sessionReducer(state, { type: 'NEXT_ITEM' }).itemIndex).toBe(state.itemIndex);
  });

  it('restores elapsed time from an ISO timestamp', () => {
    const state = { ...active(), timerStartedAt: '2026-08-17T00:00:10.000Z' };
    expect(getElapsedSeconds(state, new Date('2026-08-17T00:00:15.500Z'))).toBe(15);
  });
});
