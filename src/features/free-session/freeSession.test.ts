import { describe, expect, it } from 'vitest';
import type { FreeSessionTemplate } from '../../domain/types';
import { createFreePlan, validateFreeSession } from './freeSession';

describe('free session domain', () => {
  it('requires at least one movement before a name', () => {
    expect(validateFreeSession('', [])).toEqual({ items: 'Pilih minimal satu gerakan.' });
  });

  it('validates name, target bounds, and one target unit', () => {
    expect(validateFreeSession('', [{ exerciseId: 'march', seconds: 60 }])).toHaveProperty('name');
    expect(validateFreeSession('Tes', [{ exerciseId: 'march', seconds: 0 }])).toHaveProperty('items');
    expect(validateFreeSession('Tes', [{ exerciseId: 'march', seconds: 60, reps: 8 }])).toHaveProperty('items');
    expect(validateFreeSession('Tes', [{ exerciseId: 'march', seconds: 60 }])).toEqual({});
  });

  it('creates a dated plan without changing template items', () => {
    const template = { id: 'pagi', name: 'Pagi', items: [{ exerciseId: 'march', seconds: 60 }], createdAt: 'x', updatedAt: 'x' } satisfies FreeSessionTemplate;
    const plan = createFreePlan(template, '2026-08-15', 1);
    expect(plan.items).toEqual(template.items);
    expect(plan.items).not.toBe(template.items);
    expect(plan.day).toBe('saturday');
    expect(plan.title).toBe('Pagi');
  });
});
