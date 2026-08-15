import { describe, expect, it } from 'vitest';
import { EXERCISES } from '../catalog';
import { getTodayPlan } from './schedule';
import {
  estimatePlanMinutes, getRequiredEquipment, normalizeReplacementTarget, rankSubstitutions, replacePlanItem,
} from './substitutions';

describe('safe substitutions', () => {
  it('returns every same-group candidate and ranks light equipment matches first', () => {
    const results = rankSubstitutions('chair-squat', ['chair']);
    expect(results.map((item) => item.id).sort()).toEqual(EXERCISES.filter((item) => item.group === 'lower-strength' && item.id !== 'chair-squat').map((item) => item.id).sort());
    expect(results[0].equipment.every((item) => item === 'chair')).toBe(true);
    expect(results[0].difficulty).toBe('light');
  });

  it('keeps original ID and caps a higher replacement to the active week', () => {
    const original = getTodayPlan(new Date(2026, 7, 18), 1);
    const result = replacePlanItem(original, 4, 'bottle-goblet-squat');
    expect(result.items[4].plannedExerciseId).toBe('chair-squat');
    expect(result.items[4].exerciseId).toBe('bottle-goblet-squat');
    expect(result.items[4].sets).toBe(1);
    expect(result.items[4].reps).toBeLessThanOrEqual(8);
    expect(original.items[4].exerciseId).toBe('chair-squat');
    expect(original.items[4]).not.toHaveProperty('plannedExerciseId');

    const changedAgain = replacePlanItem(result, 4, 'sit-to-stand');
    expect(changedAgain.items[4].plannedExerciseId).toBe('chair-squat');
  });

  it('never converts a timed replacement to repetitions', () => {
    const target = normalizeReplacementTarget({ exerciseId: 'chair-squat', reps: 8, sets: 1 }, 'wall-sit', 1);
    expect(target).toMatchObject({ exerciseId: 'wall-sit', seconds: 15, sets: 1 });
    expect(target.reps).toBeUndefined();
  });

  it('caps a cardio replacement to the active week', () => {
    const target = normalizeReplacementTarget({ exerciseId: 'walk', minutes: 10 }, 'walk', 1);
    expect(target.minutes).toBeLessThanOrEqual(15);
    expect(target.reps).toBeUndefined();
  });

  it('summarizes current equipment and estimates the configured plan without mutation', () => {
    const plan = replacePlanItem(getTodayPlan(new Date(2026, 7, 18), 1), 4, 'bottle-goblet-squat');
    expect(getRequiredEquipment(plan)).toEqual(expect.arrayContaining(['chair', 'water-bottles']));
    expect(new Set(getRequiredEquipment(plan)).size).toBe(getRequiredEquipment(plan).length);
    expect(estimatePlanMinutes(plan)).toBeGreaterThan(0);
    expect(plan.items[4].exerciseId).toBe('bottle-goblet-squat');
  });

  it('rejects cross-group and unknown replacements', () => {
    const plan = getTodayPlan(new Date(2026, 7, 18), 1);
    expect(() => replacePlanItem(plan, 4, 'wall-pushup')).toThrow(/kelompok/i);
    expect(() => rankSubstitutions('tidak-ada', [])).toThrow(/tidak ditemukan/i);
  });
});
