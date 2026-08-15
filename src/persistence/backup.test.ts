import { describe, expect, it } from 'vitest';
import { validateBackup } from './backup';

describe('validateBackup', () => {
  it('rejects wellness values outside safe input ranges', () => {
    const invalid = {
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      settings: null,
      sessions: [{ id: 'x', date: '2026-08-15', status: 'completed', wellness: { energy: 8, soreness: 2, breathlessness: 1 } }],
    };
    expect(() => validateBackup(invalid)).toThrow('Data cadangan tidak valid');
  });
});
