import type { JournalEntry } from '../../domain/types';

export function validateJournal(input: Partial<JournalEntry> | Record<string, unknown>): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(input.id ?? ''))) errors.id = 'Tanggal tidak valid.';
  if (!Number.isInteger(input.energy) || Number(input.energy) < 1 || Number(input.energy) > 5) errors.energy = 'Energi harus 1–5.';
  if (typeof input.soreness !== 'number' || input.soreness < 0 || input.soreness > 10) errors.soreness = 'Pegal harus 0–10.';
  if (!Number.isInteger(input.sleepQuality) || Number(input.sleepQuality) < 1 || Number(input.sleepQuality) > 5) errors.sleepQuality = 'Kualitas tidur harus 1–5.';
  if (!Number.isInteger(input.stress) || Number(input.stress) < 1 || Number(input.stress) > 5) errors.stress = 'Stres harus 1–5.';
  if (!['none', 'exercise', 'ordinary'].includes(String(input.breathlessness))) errors.breathlessness = 'Pilih kondisi napas.';
  if (typeof input.note !== 'string' || input.note.length > 500) errors.note = 'Catatan maksimal 500 karakter.';
  return errors;
}
