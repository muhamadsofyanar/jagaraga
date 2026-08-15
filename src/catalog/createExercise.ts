import type { Exercise, MovementBenefits } from '../domain/types';

type ExerciseSeed = Omit<Exercise, 'illustration' | 'searchTerms' | 'stopCondition'> & {
  searchTerms?: string[];
  stopCondition?: string;
};

export const benefits = (muscles: string, joints: string, dailyFunction: string, fitness: string): MovementBenefits => ({ muscles, joints, dailyFunction, fitness });

export function createExercise(seed: ExerciseSeed): Exercise {
  return Object.freeze({
    ...seed,
    illustration: `/movement/${seed.id}.png`,
    searchTerms: seed.searchTerms ?? [],
    stopCondition: seed.stopCondition ?? 'Hentikan jika muncul nyeri tajam, pusing, nyeri dada, atau sesak yang tidak biasa.',
  });
}
