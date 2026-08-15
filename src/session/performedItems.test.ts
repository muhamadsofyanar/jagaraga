import { describe, expect, it } from 'vitest';
import { getTodayPlan } from '../domain/schedule';
import { replacePlanItem } from '../domain/substitutions';
import { buildPerformedItems } from './performedItems';

describe('buildPerformedItems', () => {
  it('snapshots the actual replacement and original item', () => {
    const configuredPlan = replacePlanItem(getTodayPlan(new Date(2026, 7, 18), 1), 4, 'sit-to-stand');
    const items = buildPerformedItems(configuredPlan, ['sit-to-stand'], []);
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ plannedExerciseId: 'chair-squat', exerciseId: 'sit-to-stand', status: 'completed', group: 'lower-strength', difficulty: 'light', equipment: ['chair'] });
    expect(items[0].target).toMatchObject({ exerciseId: 'sit-to-stand', sets: 1, reps: 8 });
  });

  it('records skipped items and ignores untouched items', () => {
    const plan = getTodayPlan(new Date(2026, 7, 17), 1);
    const items = buildPerformedItems(plan, [], ['march']);
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ exerciseId: 'march', plannedExerciseId: 'march', status: 'skipped' });
  });
});
