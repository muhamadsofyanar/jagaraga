import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { EXERCISES } from '../catalog';

describe('movement visuals', () => {
  test('catalog maps sixty movements to unique local PNG paths', () => {
    const paths = EXERCISES.map((exercise) => exercise.illustration);
    expect(paths).toHaveLength(60);
    expect(new Set(paths).size).toBe(60);
    expect(paths.every((path) => /^\/movement\/[a-z0-9-]+\.png$/.test(path))).toBe(true);
  });

  test.each(EXERCISES)('$id has a deployable PNG illustration', (exercise) => {
    expect(exercise.illustration).toBe(`/movement/${exercise.id}.png`);
    expect(existsSync(join(process.cwd(), 'public', exercise.illustration))).toBe(true);
  });
});
