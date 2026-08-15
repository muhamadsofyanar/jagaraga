import { describe, expect, it } from 'vitest';
import type { Exercise } from '../domain/types';
import { validateCatalog } from './validateCatalog';

const valid = (): Exercise => ({
  id: 'test-move',
  title: 'Gerakan uji',
  alternateName: 'Test move',
  kind: 'warmup',
  group: 'warmup-mobility',
  purpose: 'Menggerakkan bahu dengan nyaman.',
  benefits: {
    muscles: 'Otot sekitar bahu bekerja ringan.',
    joints: 'Bahu bergerak dalam rentang nyaman.',
    dailyFunction: 'Membantu aktivitas meraih.',
    fitness: 'Menyiapkan latihan tubuh atas.',
  },
  bodyRegions: ['shoulders'],
  movementPatterns: ['mobility'],
  goals: ['mobility'],
  difficulty: 'light',
  positions: ['standing'],
  equipment: [],
  steps: ['Berdiri tegak.', 'Gerakkan bahu perlahan.', 'Kembali ke posisi awal.'],
  breathingCue: 'Bernapas normal.',
  dosage: { unit: 'reps', value: 8, sets: 1 },
  commonMistakes: ['Gerakan menghentak.'],
  beginnerModification: 'Kecilkan rentang gerak.',
  progression: 'Tambah rentang sedikit tanpa nyeri.',
  stopCondition: 'Hentikan jika muncul nyeri tajam, pusing, atau sesak yang tidak biasa.',
  illustration: '/movement/test-move.png',
  searchTerms: ['bahu'],
});

describe('validateCatalog', () => {
  it('accepts a complete movement', () => {
    expect(() => validateCatalog([valid()])).not.toThrow();
  });

  it('rejects duplicate IDs', () => {
    expect(() => validateCatalog([valid(), valid()])).toThrow(/ID gerakan duplikat/);
  });

  it('rejects an empty benefit layer', () => {
    expect(() => validateCatalog([{ ...valid(), benefits: { ...valid().benefits, dailyFunction: '' } }])).toThrow(/manfaat/i);
  });

  it('rejects unknown substitution references', () => {
    expect(() => validateCatalog([{ ...valid(), compatibleSubstitutionIds: ['missing'] }])).toThrow(/referensi pengganti/i);
  });

  it('rejects invalid dosage and incomplete guidance', () => {
    expect(() => validateCatalog([{ ...valid(), dosage: { unit: 'reps', value: 0 } }])).toThrow(/target/i);
    expect(() => validateCatalog([{ ...valid(), progression: '' }])).toThrow(/panduan/i);
  });
});
