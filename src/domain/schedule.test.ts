import { describe, expect, it } from 'vitest';
import { getTodayPlan } from './schedule';

describe('getTodayPlan', () => {
  it('uses the Week 1 walking target on Monday', () => {
    const plan = getTodayPlan(new Date(2026, 7, 17), 1);
    expect(plan.day).toBe('monday');
    expect(plan.items.find((item) => item.exerciseId === 'walk')?.minutes).toBe(10);
  });

  it('uses two sets of eight in Week 3 strength sessions', () => {
    const plan = getTodayPlan(new Date(2026, 7, 18), 3);
    const squat = plan.items.find((item) => item.exerciseId === 'chair-squat');
    expect(squat).toMatchObject({ sets: 2, reps: 8 });
  });

  it('returns active rest on Sunday', () => {
    const plan = getTodayPlan(new Date(2026, 7, 23), 1);
    expect(plan.day).toBe('sunday');
    expect(plan.id).toBe('active-rest');
  });

  it('rejects weeks outside one to four', () => {
    expect(() => getTodayPlan(new Date(), 5)).toThrow('Program week must be 1–4');
  });
});
