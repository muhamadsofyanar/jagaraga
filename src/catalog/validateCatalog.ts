import type { Exercise } from '../domain/types';
import { BODY_REGIONS, DIFFICULTIES, EQUIPMENT_IDS, MOVEMENT_GOALS, MOVEMENT_GROUPS, MOVEMENT_POSITIONS } from './vocabulary';

const allowed = <T extends string>(values: readonly T[], actual: readonly string[]) => actual.every((value) => values.includes(value as T));

export function validateCatalog(exercises: Exercise[]): void {
  const ids = new Set<string>();
  for (const item of exercises) {
    if (ids.has(item.id)) throw new Error(`ID gerakan duplikat: ${item.id}`);
    ids.add(item.id);
    if (!MOVEMENT_GROUPS.includes(item.group) || !DIFFICULTIES.includes(item.difficulty)) throw new Error(`Kategori atau tingkat tidak valid: ${item.id}`);
    if (!item.purpose.trim() || Object.values(item.benefits).some((value) => !value.trim())) throw new Error(`Lapisan manfaat tidak lengkap: ${item.id}`);
    if (!item.bodyRegions.length || !allowed(BODY_REGIONS, item.bodyRegions) || !item.goals.length || !allowed(MOVEMENT_GOALS, item.goals)) throw new Error(`Metadata manfaat tidak valid: ${item.id}`);
    if (!item.positions.length || !allowed(MOVEMENT_POSITIONS, item.positions) || !allowed(EQUIPMENT_IDS, item.equipment)) throw new Error(`Posisi atau peralatan tidak valid: ${item.id}`);
    if (item.steps.length < 3 || !item.breathingCue.trim() || !item.beginnerModification.trim() || !item.progression.trim() || !item.stopCondition.trim() || !item.commonMistakes.length) throw new Error(`Panduan tidak lengkap: ${item.id}`);
    if (!item.illustration.startsWith('/movement/') || !item.illustration.endsWith('.png')) throw new Error(`Ilustrasi tidak valid: ${item.id}`);
    if (!Number.isInteger(item.dosage.value) || item.dosage.value < 1 || (item.dosage.sets !== undefined && (!Number.isInteger(item.dosage.sets) || item.dosage.sets < 1))) throw new Error(`Target tidak valid: ${item.id}`);
  }
  for (const item of exercises) {
    for (const id of item.compatibleSubstitutionIds ?? []) {
      if (!ids.has(id)) throw new Error(`Referensi pengganti tidak dikenal: ${item.id} -> ${id}`);
    }
  }
}
