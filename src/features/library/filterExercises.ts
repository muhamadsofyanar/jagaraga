import type { Exercise, ExerciseKind } from '../../domain/types';

export type ExerciseFilter = ExerciseKind | 'all';

export function filterExercises(exercises: Exercise[], query: string, kind: ExerciseFilter): Exercise[] {
  const normalized = query.trim().toLocaleLowerCase('id');
  return exercises.filter((exercise) => {
    const matchesKind = kind === 'all' || exercise.kind === kind;
    const haystack = `${exercise.title} ${exercise.purpose}`.toLocaleLowerCase('id');
    return matchesKind && (!normalized || haystack.includes(normalized));
  });
}
