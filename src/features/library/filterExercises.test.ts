import { describe, expect, it } from 'vitest';
import { MODE1_EXERCISES } from '../../domain/mode1';
import { filterExercises } from './filterExercises';

const exercises = Object.values(MODE1_EXERCISES);

describe('filterExercises', () => {
  it('searches titles and purposes without case sensitivity', () => {
    expect(filterExercises(exercises, 'BAHU', 'all').map((item) => item.id)).toContain('shoulder-roll');
    expect(filterExercises(exercises, 'jantung', 'all').map((item) => item.id)).toContain('walk');
  });

  it('filters by movement category', () => {
    expect(filterExercises(exercises, '', 'balance').every((item) => item.kind === 'balance')).toBe(true);
  });

  it('returns an empty list when nothing matches', () => {
    expect(filterExercises(exercises, 'gerakan yang tidak ada', 'all')).toEqual([]);
  });
});
