import { describe, expect, it } from 'vitest';
import { EXERCISES } from '../../catalog';
import { EMPTY_FILTERS, filterExercises, type ExerciseFilters } from './filterExercises';

describe('filterExercises', () => {
  it('searches titles, purposes, benefits, alternate names, and search terms', () => {
    expect(filterExercises(EXERCISES, { ...EMPTY_FILTERS, query: 'BAHU' }).map((item) => item.id)).toContain('shoulder-roll');
    expect(filterExercises(EXERCISES, { ...EMPTY_FILTERS, query: 'bangun dari kursi' }).map((item) => item.id)).toContain('chair-squat');
    expect(filterExercises(EXERCISES, { ...EMPTY_FILTERS, query: 'Comfortable walk' }).map((item) => item.id)).toContain('walk');
  });

  it('combines dimensions with AND and selections inside a dimension with OR', () => {
    const filters: ExerciseFilters = {
      query: 'bahu', groups: ['upper-strength'], bodyRegions: ['shoulders'],
      positions: ['standing'], equipment: ['water-bottles'], difficulties: ['moderate'],
      goals: ['strength'], videoOnly: false,
    };
    expect(filterExercises(EXERCISES, filters).map((item) => item.id)).toEqual(['bottle-overhead-press']);

    const eitherGroup = filterExercises(EXERCISES, { ...EMPTY_FILTERS, groups: ['balance', 'cooldown-recovery'] });
    expect(eitherGroup).toHaveLength(12);
  });

  it('returns only explicitly linked videos', () => {
    const results = filterExercises(EXERCISES, { ...EMPTY_FILTERS, videoOnly: true });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((item) => item.videoId)).toBe(true);
  });

  it('returns an empty list when nothing matches', () => {
    expect(filterExercises(EXERCISES, { ...EMPTY_FILTERS, query: 'gerakan yang tidak ada' })).toEqual([]);
  });
});
