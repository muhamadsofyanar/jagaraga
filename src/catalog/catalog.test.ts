import { describe, expect, it } from 'vitest';
import { EXERCISES, EXERCISES_BY_ID } from './index';
import { validateCatalog } from './validateCatalog';

const expected = {
  'warmup-mobility': 12,
  'low-impact-cardio': 8,
  'lower-strength': 10,
  'upper-strength': 10,
  'core-posture': 8,
  balance: 6,
  'cooldown-recovery': 6,
};

describe('movement catalog', () => {
  it('contains exactly 60 unique movements in the agreed groups', () => {
    expect(EXERCISES).toHaveLength(60);
    expect(new Set(EXERCISES.map((item) => item.id)).size).toBe(60);
    expect(Object.fromEntries(Object.keys(expected).map((group) => [group, EXERCISES.filter((item) => item.group === group).length]))).toEqual(expected);
    expect(Object.keys(EXERCISES_BY_ID)).toHaveLength(60);
  });

  it('passes runtime catalog validation', () => {
    expect(() => validateCatalog([...EXERCISES])).not.toThrow();
  });

  it.each([
    'march', 'wrist-circle', 'walk', 'step-touch', 'chair-squat', 'bottle-goblet-squat',
    'wall-pushup', 'band-chest-press', 'bird-dog', 'pelvic-tilt', 'single-leg',
    'lateral-weight-shift', 'slow-breathing', 'childs-pose-chair',
  ])('%s is indexed and complete', (id) => {
    const item = EXERCISES_BY_ID[id];
    expect(item.id).toBe(id);
    expect(item.steps.length).toBeGreaterThanOrEqual(3);
    expect(Object.values(item.benefits).every(Boolean)).toBe(true);
    expect(item.commonMistakes.length).toBeGreaterThanOrEqual(1);
    expect(item.illustration).toBe(`/movement/${id}.png`);
  });
});
