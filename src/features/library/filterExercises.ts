import type { BodyRegion, Difficulty, EquipmentId, Exercise, MovementGoal, MovementGroup, MovementPosition } from '../../domain/types';

export interface ExerciseFilters {
  query: string;
  groups: MovementGroup[];
  bodyRegions: BodyRegion[];
  positions: MovementPosition[];
  equipment: EquipmentId[];
  difficulties: Difficulty[];
  goals: MovementGoal[];
  videoOnly: boolean;
}

export const EMPTY_FILTERS: ExerciseFilters = {
  query: '', groups: [], bodyRegions: [], positions: [], equipment: [], difficulties: [], goals: [], videoOnly: false,
};

const includesAny = <T,>(selected: T[], actual: T[]) => selected.length === 0 || selected.some((value) => actual.includes(value));

export function filterExercises(exercises: readonly Exercise[], filters: ExerciseFilters): Exercise[] {
  const query = filters.query.trim().toLocaleLowerCase('id');
  return exercises.filter((item) => {
    const haystack = [item.title, item.alternateName, item.purpose, ...Object.values(item.benefits), ...item.searchTerms].filter(Boolean).join(' ').toLocaleLowerCase('id');
    return (!query || haystack.includes(query)) &&
      (!filters.groups.length || filters.groups.includes(item.group)) &&
      includesAny(filters.bodyRegions, item.bodyRegions) &&
      includesAny(filters.positions, item.positions) &&
      includesAny(filters.equipment, item.equipment) &&
      (!filters.difficulties.length || filters.difficulties.includes(item.difficulty)) &&
      includesAny(filters.goals, item.goals) &&
      (!filters.videoOnly || Boolean(item.videoId));
  });
}
