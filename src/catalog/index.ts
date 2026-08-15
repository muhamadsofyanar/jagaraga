import type { Exercise } from '../domain/types';
import { balance } from './groups/balance';
import { cooldownRecovery } from './groups/cooldownRecovery';
import { corePosture } from './groups/corePosture';
import { lowImpactCardio } from './groups/lowImpactCardio';
import { lowerStrength } from './groups/lowerStrength';
import { upperStrength } from './groups/upperStrength';
import { warmupMobility } from './groups/warmupMobility';
import { validateCatalog } from './validateCatalog';

export const EXERCISES = Object.freeze([
  ...warmupMobility,
  ...lowImpactCardio,
  ...lowerStrength,
  ...upperStrength,
  ...corePosture,
  ...balance,
  ...cooldownRecovery,
] satisfies Exercise[]);

validateCatalog([...EXERCISES]);

export const EXERCISES_BY_ID = Object.freeze(Object.fromEntries(EXERCISES.map((item) => [item.id, item])) as Record<string, Exercise>);
export const MODE1_EXERCISES = EXERCISES_BY_ID;
