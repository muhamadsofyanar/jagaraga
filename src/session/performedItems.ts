import { EXERCISES_BY_ID } from '../catalog';
import type { PlannedSession } from '../domain/types';
import type { PerformedMovement } from '../persistence/db';

export function buildPerformedItems(plan: PlannedSession, completedIds: string[], skippedIds: string[]): PerformedMovement[] {
  const completed = new Set(completedIds);
  const skipped = new Set(skippedIds);

  return plan.items.flatMap((target) => {
    const status = completed.has(target.exerciseId) ? 'completed' : skipped.has(target.exerciseId) ? 'skipped' : undefined;
    if (!status) return [];
    const exercise = EXERCISES_BY_ID[target.exerciseId];
    if (!exercise) return [];
    return [{
      plannedExerciseId: target.plannedExerciseId ?? target.exerciseId,
      exerciseId: target.exerciseId,
      status,
      target: { ...target },
      group: exercise.group,
      difficulty: exercise.difficulty,
      equipment: [...exercise.equipment],
    } satisfies PerformedMovement];
  });
}
