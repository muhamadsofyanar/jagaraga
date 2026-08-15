import { describe, expect, it } from 'vitest';
import { validateJournal } from './journal';

const valid = { id: '2026-08-15', energy: 3, soreness: 2, sleepQuality: 4, stress: 2, breathlessness: 'exercise', note: '', updatedAt: '2026-08-15T00:00:00.000Z' } as const;

describe('validateJournal', () => {
  it('accepts every field inside its boundary', () => expect(validateJournal(valid)).toEqual({}));
  it('rejects invalid dates, scales, pain, breathing, and long notes', () => {
    expect(validateJournal({ ...valid, id: '15-08-2026' })).toHaveProperty('id');
    expect(validateJournal({ ...valid, energy: 0 })).toHaveProperty('energy');
    expect(validateJournal({ ...valid, soreness: 11 })).toHaveProperty('soreness');
    expect(validateJournal({ ...valid, sleepQuality: 6 })).toHaveProperty('sleepQuality');
    expect(validateJournal({ ...valid, stress: 0 })).toHaveProperty('stress');
    expect(validateJournal({ ...valid, breathlessness: 'unknown' })).toHaveProperty('breathlessness');
    expect(validateJournal({ ...valid, note: 'a'.repeat(501) })).toHaveProperty('note');
  });
});
