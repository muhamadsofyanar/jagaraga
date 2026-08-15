import { EXERCISES, EXERCISES_BY_ID } from '../catalog';
import { EQUIPMENT_IDS } from '../catalog/vocabulary';
import { WEEK_VOLUME } from './mode1';
import type { ConfiguredExerciseTarget, EquipmentId, Exercise, PlannedSession, ProgramWeek } from './types';

const difficultyRank = { light: 0, moderate: 1, higher: 2 } as const;

const requireExercise = (exerciseId: string) => {
  const exercise = EXERCISES_BY_ID[exerciseId];
  if (!exercise) throw new Error(`Gerakan tidak ditemukan: ${exerciseId}`);
  return exercise;
};

export function rankSubstitutions(exerciseId: string, ownedEquipment: EquipmentId[]): Exercise[] {
  const original = requireExercise(exerciseId);
  const ownsAll = (exercise: Exercise) => exercise.equipment.every((item) => ownedEquipment.includes(item));

  return EXERCISES
    .filter((item) => item.group === original.group && item.id !== original.id)
    .sort((left, right) => Number(ownsAll(right)) - Number(ownsAll(left)) ||
      difficultyRank[left.difficulty] - difficultyRank[right.difficulty] ||
      left.equipment.length - right.equipment.length ||
      left.title.localeCompare(right.title, 'id'));
}

export function normalizeReplacementTarget(target: ConfiguredExerciseTarget, replacementId: string, week: ProgramWeek): ConfiguredExerciseTarget {
  const replacement = requireExercise(replacementId);
  const volume = WEEK_VOLUME[week];
  const plannedExerciseId = target.plannedExerciseId ?? target.exerciseId;
  const next: ConfiguredExerciseTarget = { exerciseId: replacement.id, plannedExerciseId };
  const strengthLike = replacement.kind === 'strength' || replacement.goals.includes('strength');
  const sets = replacement.dosage.sets ?? 1;

  if (replacement.dosage.unit === 'minutes') {
    next.minutes = Math.min(replacement.dosage.value, volume.cardioMax);
  } else if (replacement.dosage.unit === 'seconds') {
    next.seconds = replacement.dosage.value;
    next.sets = strengthLike ? Math.min(sets, volume.sets) : sets;
  } else {
    next.reps = strengthLike ? Math.min(replacement.dosage.value, volume.repsMax) : replacement.dosage.value;
    next.sets = strengthLike ? Math.min(sets, volume.sets) : sets;
  }

  return next;
}

export function replacePlanItem(plan: PlannedSession, itemIndex: number, replacementId: string): PlannedSession {
  const current = plan.items[itemIndex];
  if (!current) throw new RangeError(`Item sesi tidak ditemukan: ${itemIndex}`);
  const currentExercise = requireExercise(current.exerciseId);
  const replacement = requireExercise(replacementId);
  if (currentExercise.group !== replacement.group) throw new Error('Gerakan pengganti harus dari kelompok yang sama.');

  const replacementTarget = normalizeReplacementTarget(current, replacementId, plan.programWeek);
  return { ...plan, items: plan.items.map((item, index) => index === itemIndex ? replacementTarget : { ...item }) };
}

export function getRequiredEquipment(plan: Pick<PlannedSession, 'items'>): EquipmentId[] {
  const required = new Set(plan.items.flatMap((item) => requireExercise(item.exerciseId).equipment));
  return EQUIPMENT_IDS.filter((item) => required.has(item));
}

export function estimatePlanMinutes(plan: Pick<PlannedSession, 'items'>): number {
  const seconds = plan.items.reduce((total, target) => {
    const exercise = requireExercise(target.exerciseId);
    const sets = target.sets ?? exercise.dosage.sets ?? 1;
    const rest = exercise.dosage.restSeconds ?? 0;
    const active = target.minutes !== undefined ? target.minutes * 60 :
      target.seconds !== undefined ? target.seconds * sets :
      (target.reps ?? exercise.dosage.value) * sets * 4;
    return total + active + Math.max(0, sets - 1) * rest + 20;
  }, 0);
  return Math.max(1, Math.ceil(seconds / 60));
}
