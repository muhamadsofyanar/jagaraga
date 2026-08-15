import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { MODE1_EXERCISES } from '../domain/mode1';

describe('movement visuals', () => {
  test.each(Object.values(MODE1_EXERCISES))('$id has a deployable PNG illustration', (exercise) => {
    expect(exercise.illustration).toBe(`/movement/${exercise.id}.png`);
    expect(existsSync(join(process.cwd(), 'public', exercise.illustration))).toBe(true);
  });
});
