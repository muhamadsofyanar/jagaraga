# JagaRaga 60 Movements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand JagaRaga Mode 1 from 22 to exactly 60 well-documented movements, with male offline illustrations, advanced catalog filtering, safe same-group substitutions, persisted preferences, accurate history, and one verified GitHub/Coolify release.

**Architecture:** Replace the monolithic movement object with a typed, validated catalog split into seven focused data modules while retaining a compatibility export for existing consumers. Build substitution as pure domain logic first, persist only explicit defaults in IndexedDB v3, and place a pre-session configurator between Today and the existing readiness gate. Session plans carry both original and selected movement IDs so the runner, progress statistics, and backup remain deterministic and migration-safe.

**Tech Stack:** React 19, TypeScript 5.9, Vite 8, Vitest 4, Testing Library, Dexie 4, CSS, static PNG assets, privacy-enhanced YouTube embeds, Docker/Nginx.

## Global Constraints

- The final catalog contains exactly 60 movements: 12 warm-up/mobility, 8 low-impact cardio, 10 lower-body strength, 10 upper-body strength, 8 core/posture, 6 balance, and 6 cool-down/recovery.
- Keep Mode 1; do not add Mode 2, accounts, backend, analytics, subscriptions, coaches, or large gym equipment.
- Approved equipment is bodyweight, chair, wall, mat, water bottles, resistance bands, and light dumbbells.
- Every movement has a local male illustration; video remains optional and only uses a verified official or rights-holder source.
- Card summaries and detail pages use conservative anatomical and functional language, never diagnosis, cure, guaranteed outcome, or organ-unblocking claims.
- Traditional wellness concepts, when present, are visibly labeled as context and never replace safety or anatomical guidance.
- Same-group replacements are all visible; harder and unavailable-equipment choices require explicit confirmation.
- Existing user settings, sessions, active sessions, journals, free-session templates, and tahajjud records survive migration.
- Backup v1, v2, and v3 imports validate completely before an atomic write.
- Release only after Vitest, ESLint, TypeScript, Vite, Docker, healthcheck, offline, and 320/390/520-pixel checks pass.

## File Structure

| Path | Responsibility |
| --- | --- |
| `src/domain/types.ts` | Shared movement, target, configured-session, and persistence-facing types. |
| `src/catalog/vocabulary.ts` | Labels and closed vocabularies for groups, difficulty, positions, equipment, body areas, and goals. |
| `src/catalog/groups/*.ts` | Seven movement-data modules, one per catalog group. |
| `src/catalog/index.ts` | Combine, index, and export the exactly-60 catalog. |
| `src/catalog/validateCatalog.ts` | Runtime/build-test validation of movement metadata and references. |
| `src/domain/mode1.ts` | Mode 1 session definitions and weekly volume only; consumes the catalog. |
| `src/domain/substitutions.ts` | Candidate ranking, target normalization, equipment summary, and plan replacement. |
| `src/features/library/*` | Search/filter cards, details, image fallback, and benefit sections. |
| `src/features/program/SessionConfigurator.tsx` | Pre-readiness plan customization and confirmation UI. |
| `src/persistence/db.ts` | IndexedDB v3 table and performed-item snapshot types. |
| `src/persistence/repository.ts` | Preference CRUD, active plan persistence, and atomic completion. |
| `src/persistence/backup.ts` | Backup schema v3, migrations, validation, export, and import. |
| `src/session/*` | Runner integration and actual performed-movement snapshots. |
| `src/features/progress/stats.ts` | Statistics based on actual performed movement metadata. |
| `src/media/videos.ts` | Audited, consent-gated official video registry and provenance. |
| `public/movement/*.png` | Sixty optimized offline male illustrations. |
| `scripts/verify-catalog-assets.mjs` | Production-asset existence/count/dimension verification. |

---

### Task 1: Define the normalized catalog contract and validator

**Files:**
- Modify: `src/domain/types.ts`
- Create: `src/catalog/vocabulary.ts`
- Create: `src/catalog/validateCatalog.ts`
- Create: `src/catalog/validateCatalog.test.ts`

**Interfaces:**
- Produces: `MovementGroup`, `Difficulty`, `MovementPosition`, `EquipmentId`, `TargetUnit`, `MovementBenefits`, `ExerciseDosage`, expanded `Exercise`, and `validateCatalog(exercises: Exercise[]): void`.
- Consumes: no new interfaces.

- [ ] **Step 1: Write failing catalog-contract tests**

```ts
import { describe, expect, it } from 'vitest';
import type { Exercise } from '../domain/types';
import { validateCatalog } from './validateCatalog';

const valid = (): Exercise => ({
  id: 'test-move', title: 'Gerakan uji', alternateName: 'Test move', kind: 'warmup',
  group: 'warmup-mobility', purpose: 'Menggerakkan bahu dengan nyaman.',
  benefits: { muscles: 'Otot sekitar bahu bekerja ringan.', joints: 'Bahu bergerak dalam rentang nyaman.', dailyFunction: 'Membantu aktivitas meraih.', fitness: 'Menyiapkan latihan tubuh atas.' },
  bodyRegions: ['shoulders'], movementPatterns: ['mobility'], goals: ['mobility'],
  difficulty: 'light', positions: ['standing'], equipment: [],
  steps: ['Berdiri tegak.', 'Gerakkan bahu perlahan.', 'Kembali ke posisi awal.'],
  breathingCue: 'Bernapas normal.', dosage: { unit: 'reps', value: 8, sets: 1 },
  commonMistakes: ['Gerakan menghentak.'], beginnerModification: 'Kecilkan rentang gerak.',
  progression: 'Tambah rentang sedikit tanpa nyeri.',
  stopCondition: 'Hentikan jika muncul nyeri tajam, pusing, atau sesak yang tidak biasa.',
  illustration: '/movement/test-move.png', searchTerms: ['bahu'],
});

describe('validateCatalog', () => {
  it('accepts a complete movement', () => expect(() => validateCatalog([valid()])).not.toThrow());
  it('rejects duplicate IDs', () => expect(() => validateCatalog([valid(), valid()])).toThrow(/ID gerakan duplikat/));
  it('rejects an empty benefit layer', () => expect(() => validateCatalog([{ ...valid(), benefits: { ...valid().benefits, dailyFunction: '' } }])).toThrow(/manfaat/));
  it('rejects unknown substitution references', () => expect(() => validateCatalog([{ ...valid(), compatibleSubstitutionIds: ['missing'] }])).toThrow(/referensi pengganti/));
});
```

- [ ] **Step 2: Run the focused test and verify the module is missing**

Run: `./node_modules/.bin/vitest run src/catalog/validateCatalog.test.ts --pool=threads`

Expected: FAIL because `validateCatalog` and the expanded `Exercise` contract do not exist.

- [ ] **Step 3: Add exact closed vocabularies and types**

```ts
export type MovementGroup = 'warmup-mobility' | 'low-impact-cardio' | 'lower-strength' | 'upper-strength' | 'core-posture' | 'balance' | 'cooldown-recovery';
export type Difficulty = 'light' | 'moderate' | 'higher';
export type MovementPosition = 'standing' | 'seated' | 'floor' | 'supine' | 'prone';
export type EquipmentId = 'chair' | 'wall' | 'mat' | 'water-bottles' | 'resistance-band' | 'light-dumbbells';
export type BodyRegion = 'full-body' | 'neck' | 'shoulders' | 'chest' | 'upper-back' | 'lower-back' | 'core' | 'hips' | 'thighs' | 'glutes' | 'knees' | 'calves' | 'ankles' | 'arms';
export type MovementGoal = 'mobility' | 'cardio' | 'strength' | 'posture' | 'balance' | 'recovery';
export type TargetUnit = 'reps' | 'seconds' | 'minutes';

export interface MovementBenefits { muscles: string; joints: string; dailyFunction: string; fitness: string }
export interface ExerciseDosage { unit: TargetUnit; value: number; sets?: number; restSeconds?: number }
```

Expand `Exercise` with `alternateName?`, `group`, `benefits`, `bodyRegions`, `movementPatterns`, `goals`, `difficulty`, `positions`, `dosage`, `progression`, `searchTerms`, and `compatibleSubstitutionIds?`. Retain `kind`, `purpose`, and all existing technique/safety fields for backward-compatible consumers.

- [ ] **Step 4: Implement deterministic validation**

```ts
export function validateCatalog(exercises: Exercise[]): void {
  const ids = new Set<string>();
  for (const item of exercises) {
    if (ids.has(item.id)) throw new Error(`ID gerakan duplikat: ${item.id}`);
    ids.add(item.id);
    if (!item.purpose.trim() || Object.values(item.benefits).some((value) => !value.trim())) throw new Error(`Lapisan manfaat tidak lengkap: ${item.id}`);
    if (item.steps.length < 3 || !item.breathingCue.trim() || !item.beginnerModification.trim() || !item.progression.trim() || !item.stopCondition.trim()) throw new Error(`Panduan tidak lengkap: ${item.id}`);
    if (!item.illustration.startsWith('/movement/') || !item.illustration.endsWith('.png')) throw new Error(`Ilustrasi tidak valid: ${item.id}`);
    const units = ['reps', 'seconds', 'minutes'].filter((unit) => item.dosage.unit === unit);
    if (units.length !== 1 || !Number.isInteger(item.dosage.value) || item.dosage.value < 1) throw new Error(`Target tidak valid: ${item.id}`);
  }
  for (const item of exercises) for (const id of item.compatibleSubstitutionIds ?? []) if (!ids.has(id)) throw new Error(`Referensi pengganti tidak dikenal: ${item.id} -> ${id}`);
}
```

- [ ] **Step 5: Run test, typecheck, and commit**

Run: `./node_modules/.bin/vitest run src/catalog/validateCatalog.test.ts --pool=threads && ./node_modules/.bin/tsc -b`

Expected: all focused tests PASS and TypeScript exits 0.

```bash
git add src/domain/types.ts src/catalog/vocabulary.ts src/catalog/validateCatalog.ts src/catalog/validateCatalog.test.ts
git commit -m "feat: define validated movement catalog contract"
```

### Task 2: Populate the exactly-60 movement catalog

**Files:**
- Create: `src/catalog/createExercise.ts`
- Create: `src/catalog/groups/warmupMobility.ts`
- Create: `src/catalog/groups/lowImpactCardio.ts`
- Create: `src/catalog/groups/lowerStrength.ts`
- Create: `src/catalog/groups/upperStrength.ts`
- Create: `src/catalog/groups/corePosture.ts`
- Create: `src/catalog/groups/balance.ts`
- Create: `src/catalog/groups/cooldownRecovery.ts`
- Create: `src/catalog/index.ts`
- Create: `src/catalog/catalog.test.ts`
- Modify: `src/domain/mode1.ts`

**Interfaces:**
- Consumes: expanded `Exercise`, `MovementGroup`, `EquipmentId`, and `validateCatalog` from Task 1.
- Produces: `EXERCISES: readonly Exercise[]`, `EXERCISES_BY_ID: Readonly<Record<string, Exercise>>`, and compatibility alias `MODE1_EXERCISES`.

- [ ] **Step 1: Write the exact-count and completeness tests**

```ts
const expected = {
  'warmup-mobility': 12, 'low-impact-cardio': 8, 'lower-strength': 10,
  'upper-strength': 10, 'core-posture': 8, balance: 6, 'cooldown-recovery': 6,
};

it('contains exactly 60 unique movements in agreed groups', () => {
  expect(EXERCISES).toHaveLength(60);
  expect(new Set(EXERCISES.map((item) => item.id)).size).toBe(60);
  expect(Object.fromEntries(Object.keys(expected).map((group) => [group, EXERCISES.filter((item) => item.group === group).length]))).toEqual(expected);
});

it.each(EXERCISES)('$id has complete instructional content', (item) => {
  expect(item.steps.length).toBeGreaterThanOrEqual(3);
  expect(Object.values(item.benefits).every(Boolean)).toBe(true);
  expect(item.commonMistakes.length).toBeGreaterThanOrEqual(1);
  expect(item.illustration).toBe(`/movement/${item.id}.png`);
});
```

- [ ] **Step 2: Run the test and verify it fails before catalog modules exist**

Run: `./node_modules/.bin/vitest run src/catalog/catalog.test.ts --pool=threads`

Expected: FAIL on missing catalog module.

- [ ] **Step 3: Add the factory and all exact movement IDs**

Use these IDs and no additional records:

| Group | IDs |
| --- | --- |
| Warm-up/mobility (12) | `march`, `shoulder-roll`, `chest-open`, `standing-cat-cow`, `trunk-turn`, `hip-circle`, `knee-raise`, `ankle-circle`, `wrist-circle`, `side-reach`, `heel-dig`, `scapular-squeeze` |
| Low-impact cardio (8) | `walk`, `step-touch`, `low-impact-jack`, `boxer-step`, `side-march`, `toe-tap`, `low-kick`, `stair-step-simulation` |
| Lower strength (10) | `chair-squat`, `glute-bridge`, `calf-raise`, `hip-hinge`, `supported-reverse-lunge`, `sit-to-stand`, `wall-sit`, `side-leg-raise`, `standing-hamstring-curl`, `bottle-goblet-squat` |
| Upper strength (10) | `wall-pushup`, `row`, `incline-pushup-chair`, `seated-band-row`, `band-pull-apart`, `bottle-overhead-press`, `bottle-biceps-curl`, `bottle-triceps-extension`, `wall-slide`, `band-chest-press` |
| Core/posture (8) | `bird-dog`, `dead-bug`, `standing-knee-brace`, `seated-knee-lift`, `wall-plank`, `side-plank-knees`, `pelvic-tilt`, `prone-cobra-small` |
| Balance (6) | `single-leg`, `heel-to-toe`, `tandem-stand`, `clock-reach`, `supported-toe-walk`, `lateral-weight-shift` |
| Cool-down/recovery (6) | `easy-mobility`, `slow-breathing`, `slow-walk`, `calf-stretch-wall`, `chest-stretch-wall`, `childs-pose-chair` |

`createExercise` must derive `illustration: /movement/${id}.png`, freeze each record, and require every field at compile time. Each record gets unique Indonesian purpose/benefits, 3–5 steps, breathing, dosage/rest, regression, progression, mistakes, and stop guidance. Classify dumbbell, band, wall-sit, lunges, planks, and overhead work as `moderate` or `higher`; do not soften the label to make the catalog appear easier.

- [ ] **Step 4: Assemble and validate the catalog at module load**

```ts
export const EXERCISES = Object.freeze([
  ...warmupMobility, ...lowImpactCardio, ...lowerStrength, ...upperStrength,
  ...corePosture, ...balance, ...cooldownRecovery,
] satisfies Exercise[]);
validateCatalog([...EXERCISES]);
export const EXERCISES_BY_ID = Object.freeze(Object.fromEntries(EXERCISES.map((item) => [item.id, item])) as Record<string, Exercise>);
export const MODE1_EXERCISES = EXERCISES_BY_ID;
```

Move only session definitions and `WEEK_VOLUME` into `mode1.ts`; import `EXERCISES_BY_ID` where the legacy export is needed.

- [ ] **Step 5: Run catalog and existing domain tests, then commit**

Run: `./node_modules/.bin/vitest run src/catalog/catalog.test.ts src/domain/schedule.test.ts --pool=threads && ./node_modules/.bin/tsc -b`

Expected: 60-count, group-count, completeness, and schedule tests PASS.

```bash
git add src/catalog src/domain/mode1.ts
git commit -m "feat: add sixty complete movement records"
```

### Task 3: Add and verify sixty offline male illustrations

**Files:**
- Create: `public/movement/<38-new-movement-ids>.png`
- Replace where needed: `public/movement/<22-existing-movement-ids>.png`
- Create: `scripts/verify-catalog-assets.mjs`
- Modify: `src/media/movementVisuals.test.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: the exact IDs exported by `src/catalog/index.ts`.
- Produces: one readable PNG per ID and `npm run verify:assets`.

- [ ] **Step 1: Extend the asset test to require exactly one local illustration per movement**

```ts
it('maps every catalog movement to a unique local PNG', () => {
  const paths = EXERCISES.map((item) => item.illustration);
  expect(paths).toHaveLength(60);
  expect(new Set(paths).size).toBe(60);
  expect(paths.every((path) => /^\/movement\/[a-z0-9-]+\.png$/.test(path))).toBe(true);
});
```

- [ ] **Step 2: Run the asset test and verification script to expose missing files**

Run: `./node_modules/.bin/vitest run src/media/movementVisuals.test.ts --pool=threads`

Expected: FAIL listing paths for the 38 new records.

- [ ] **Step 3: Generate/import the image set with a fixed visual brief**

Every image shows an adult man in modest neutral sportswear, warm cream background, dark-green linework, muted-gold accents, conservative anatomy, and two frames when motion direction is otherwise ambiguous. Use no text, arrows, logo, or watermark. Each pose must match its record's steps; seated and supported movements must visibly include the chair or wall, and equipment movements must show only the declared item.

- [ ] **Step 4: Add the production asset verifier**

```js
import { existsSync, readFileSync } from 'node:fs';
const source = readFileSync('src/catalog/index.ts', 'utf8');
const groupFiles = [...source.matchAll(/from '.\/groups\/(.+)'/g)].map((match) => `src/catalog/groups/${match[1]}.ts`);
const ids = groupFiles.flatMap((file) => [...readFileSync(file, 'utf8').matchAll(/id: '([a-z0-9-]+)'/g)].map((match) => match[1]));
if (ids.length !== 60 || new Set(ids).size !== 60) throw new Error(`Expected 60 unique catalog IDs, got ${ids.length}`);
for (const id of ids) if (!existsSync(`public/movement/${id}.png`)) throw new Error(`Missing public/movement/${id}.png`);
console.log('Verified 60 movement illustrations');
```

Add `"verify:assets": "node scripts/verify-catalog-assets.mjs"` to `package.json`.

- [ ] **Step 5: Verify assets and commit**

Run: `npm run verify:assets && ./node_modules/.bin/vitest run src/media/movementVisuals.test.ts --pool=threads`

Expected: `Verified 60 movement illustrations` and all media tests PASS.

```bash
git add public/movement scripts/verify-catalog-assets.mjs package.json src/media/movementVisuals.test.ts
git commit -m "feat: add male illustrations for sixty movements"
```

### Task 4: Audit official video metadata and build layered movement details

**Files:**
- Modify: `src/media/videos.ts`
- Modify: `src/media/VideoEmbed.test.tsx`
- Create: `src/features/library/MovementVisual.tsx`
- Modify: `src/features/library/ExerciseDetail.tsx`
- Create: `src/features/library/ExerciseDetail.test.tsx`

**Interfaces:**
- Consumes: `Exercise`, `VIDEO_REGISTRY`, and consent-gated `VideoEmbed`.
- Produces: reusable `MovementVisual` fallback and a complete detail view.

- [ ] **Step 1: Write failing detail and provenance tests**

```tsx
it('shows all benefit and safety layers without requiring video', () => {
  render(<ExerciseDetail exercise={EXERCISES_BY_ID['pelvic-tilt']} videoConsent={false} onBack={() => undefined} onAdd={() => undefined} />);
  expect(screen.getByRole('heading', { name: /manfaat/i })).toBeVisible();
  expect(screen.getByText(EXERCISES_BY_ID['pelvic-tilt'].benefits.dailyFunction)).toBeVisible();
  expect(screen.getByText(/lebih ringan/i)).toBeVisible();
  expect(screen.getByText(/lebih menantang/i)).toBeVisible();
  expect(screen.queryByTitle(/video/i)).not.toBeInTheDocument();
});

it.each(Object.values(VIDEO_REGISTRY))('$id has auditable provenance', (source) => {
  expect(source.originalUrl).toMatch(/^https:\/\/www\.youtube\.com\/watch\?v=/);
  expect(source.providerName.length).toBeGreaterThan(3);
  expect(source.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  expect(source.sourceClass).toMatch(/government|hospital|university|sports-body|rights-holder/);
});
```

- [ ] **Step 2: Run tests and verify missing detail sections and source classification**

Run: `./node_modules/.bin/vitest run src/features/library/ExerciseDetail.test.tsx src/media/VideoEmbed.test.tsx --pool=threads`

Expected: FAIL on missing benefit heading and `sourceClass`.

- [ ] **Step 3: Audit registry entries and extend metadata**

Add `sourceClass: 'government' | 'hospital' | 'university' | 'sports-body' | 'rights-holder'` and `movementIds: string[]` to `VideoSource`. Preserve the three already-audited entries only after reopening their original URLs and confirming channel ownership, availability, movement relevance, and embed permission. Add another source only when the same four checks pass; otherwise leave that movement image-and-text only. Remove the hard-coded `walk` fallback and use only explicit `exercise.videoId` assignments.

- [ ] **Step 4: Render the complete detail hierarchy and resilient image**

```tsx
<MovementVisual src={exercise.illustration} title={exercise.title} />
<p className="eyebrow">{groupLabels[exercise.group]}</p>
<h1>{exercise.title}</h1>
<p>{exercise.purpose}</p>
<section aria-labelledby="benefit-title">
  <h2 id="benefit-title">Manfaat</h2>
  <BenefitRow label="Otot" value={exercise.benefits.muscles} />
  <BenefitRow label="Sendi & mobilitas" value={exercise.benefits.joints} />
  <BenefitRow label="Aktivitas harian" value={exercise.benefits.dailyFunction} />
  <BenefitRow label="Kebugaran" value={exercise.benefits.fitness} />
</section>
<details open><summary>Teknik dan napas</summary><ol>{exercise.steps.map((step) => <li key={step}>{step}</li>)}</ol><div className="cue"><Wind size={20} /><span><strong>Napas</strong>{exercise.breathingCue}</span></div></details>
<details><summary>Lebih ringan & lebih menantang</summary><p>{exercise.beginnerModification}</p><p>{exercise.progression}</p></details>
<details><summary>Kesalahan dan tanda berhenti</summary><ul>{exercise.commonMistakes.map((mistake) => <li key={mistake}>{mistake}</li>)}</ul><div className="stop-cue"><AlertCircle size={19} /><span>{exercise.stopCondition}</span></div></details>
```

Import `Wind` and `AlertCircle` from `lucide-react`; keep this as the single rendering path for technique and safety content.

- [ ] **Step 5: Run tests and commit**

Run: `./node_modules/.bin/vitest run src/features/library/ExerciseDetail.test.tsx src/media/VideoEmbed.test.tsx --pool=threads`

Expected: detail/provenance/consent tests PASS.

```bash
git add src/media src/features/library/MovementVisual.tsx src/features/library/ExerciseDetail.tsx src/features/library/ExerciseDetail.test.tsx
git commit -m "feat: add layered movement guidance and audited videos"
```

### Task 5: Upgrade the movement library search and filters

**Files:**
- Modify: `src/features/library/filterExercises.ts`
- Modify: `src/features/library/filterExercises.test.ts`
- Modify: `src/features/library/MovementLibrary.tsx`
- Modify: `src/features/library/MovementLibrary.test.tsx`
- Modify: `src/app.css`

**Interfaces:**
- Consumes: catalog vocabularies and `EXERCISES`.
- Produces: `ExerciseFilters`, `EMPTY_FILTERS`, and `filterExercises(exercises, filters)`.

- [ ] **Step 1: Write compound-filter tests**

```ts
const filters: ExerciseFilters = {
  query: 'bahu', groups: ['upper-strength'], bodyRegions: ['shoulders'],
  positions: ['standing'], equipment: ['water-bottles'], difficulties: ['moderate'],
  goals: ['strength'], videoOnly: false,
};
expect(filterExercises(EXERCISES, filters).map((item) => item.id)).toEqual(['bottle-overhead-press']);
expect(filterExercises(EXERCISES, { ...EMPTY_FILTERS, videoOnly: true }).every((item) => item.videoId)).toBe(true);
```

- [ ] **Step 2: Run focused tests and verify the old signature fails**

Run: `./node_modules/.bin/vitest run src/features/library/filterExercises.test.ts --pool=threads`

Expected: FAIL because multi-dimensional filters do not exist.

- [ ] **Step 3: Implement AND-between-dimensions, OR-within-dimension filtering**

```ts
const includesAny = <T,>(selected: T[], actual: T[]) => selected.length === 0 || selected.some((value) => actual.includes(value));
export function filterExercises(exercises: readonly Exercise[], filters: ExerciseFilters) {
  const query = filters.query.trim().toLocaleLowerCase('id');
  return exercises.filter((item) => {
    const haystack = [item.title, item.alternateName, item.purpose, ...Object.values(item.benefits), ...item.searchTerms].filter(Boolean).join(' ').toLocaleLowerCase('id');
    return (!query || haystack.includes(query)) &&
      (!filters.groups.length || filters.groups.includes(item.group)) &&
      includesAny(filters.bodyRegions, item.bodyRegions) && includesAny(filters.positions, item.positions) &&
      includesAny(filters.equipment, item.equipment) &&
      (!filters.difficulties.length || filters.difficulties.includes(item.difficulty)) &&
      includesAny(filters.goals, item.goals) && (!filters.videoOnly || Boolean(item.videoId));
  });
}
```

- [ ] **Step 4: Build mobile filters and richer cards**

Show “60 gerakan lokal”, query, group chips, a collapsible “Filter lainnya” panel, active-filter count, reset action, result count, and cards with illustration, short purpose, group, difficulty, equipment, and first body-area label. At 320px, stack card actions and preserve 44px touch targets; render difficulty with text and icon so color is not the only signal.

- [ ] **Step 5: Run component tests and commit**

Run: `./node_modules/.bin/vitest run src/features/library --pool=threads`

Expected: search, combined filters, reset, empty state, details, and add-to-free-session tests PASS.

```bash
git add src/features/library src/app.css
git commit -m "feat: add advanced movement library filters"
```

### Task 6: Implement pure substitution and target-normalization logic

**Files:**
- Modify: `src/domain/types.ts`
- Create: `src/domain/substitutions.ts`
- Create: `src/domain/substitutions.test.ts`

**Interfaces:**
- Produces: `ConfiguredExerciseTarget`, `rankSubstitutions`, `normalizeReplacementTarget`, `replacePlanItem`, `getRequiredEquipment`, and `estimatePlanMinutes`.
- Consumes: catalog and `WEEK_VOLUME`.

- [ ] **Step 1: Write failing safety and plan-preservation tests**

```ts
it('returns every same-group candidate and ranks light equipment matches first', () => {
  const results = rankSubstitutions('chair-squat', ['chair']);
  expect(results.map((item) => item.id).sort()).toEqual(EXERCISES.filter((item) => item.group === 'lower-strength' && item.id !== 'chair-squat').map((item) => item.id).sort());
  expect(results[0].equipment.every((item) => item === 'chair')).toBe(true);
});

it('keeps original ID and caps a higher replacement to the active week', () => {
  const result = replacePlanItem(getTodayPlan(new Date(2026, 7, 18), 1), 4, 'bottle-goblet-squat');
  expect(result.items[4].plannedExerciseId).toBe('chair-squat');
  expect(result.items[4].exerciseId).toBe('bottle-goblet-squat');
  expect(result.items[4].sets).toBe(1);
  expect(result.items[4].reps).toBeLessThanOrEqual(8);
});
```

- [ ] **Step 2: Run focused tests and verify missing functions**

Run: `./node_modules/.bin/vitest run src/domain/substitutions.test.ts --pool=threads`

Expected: FAIL on missing module.

- [ ] **Step 3: Add configured-target provenance**

```ts
export interface ConfiguredExerciseTarget extends ExerciseTarget {
  plannedExerciseId?: string;
  difficultyAcknowledged?: boolean;
}
```

Change `SessionDefinition.items` and `PlannedSession.items` to `ConfiguredExerciseTarget[]`; old targets remain valid because both fields are optional.

- [ ] **Step 4: Implement candidate ranking and conservative normalization**

`rankSubstitutions` filters only by exact `group`, excludes the original ID, and sorts by: all equipment owned, difficulty rank light/moderate/higher, equipment count, Indonesian title. `normalizeReplacementTarget` uses the chosen movement's dosage, caps cardio/recovery minutes by `WEEK_VOLUME[week].cardioMax`, caps strength-like sets/reps by weekly sets/repsMax, and never converts a timed target to repetitions. `replacePlanItem` copies the plan and records the first original ID through later changes.

- [ ] **Step 5: Run tests and commit**

Run: `./node_modules/.bin/vitest run src/domain/substitutions.test.ts src/domain/schedule.test.ts --pool=threads && ./node_modules/.bin/tsc -b`

Expected: substitution, cap, immutability, estimate, and equipment-summary tests PASS.

```bash
git add src/domain/types.ts src/domain/substitutions.ts src/domain/substitutions.test.ts
git commit -m "feat: add safe same-group substitution logic"
```

### Task 7: Add IndexedDB v3 preferences and performed-item history

**Files:**
- Modify: `src/persistence/db.ts`
- Modify: `src/persistence/repository.ts`
- Modify: `src/persistence/repository.test.ts`

**Interfaces:**
- Produces: `ExercisePreference`, `PerformedMovement`, `listExercisePreferences`, `saveExercisePreference`, `deleteExercisePreference`, and extended `SessionLog.performedItems`.
- Consumes: `ConfiguredExerciseTarget`, catalog equipment, group, and difficulty.

- [ ] **Step 1: Write migration, preference, and atomic-completion tests**

```ts
it('stores one preferred replacement per original movement', async () => {
  const preference = { originalExerciseId: 'chair-squat', replacementExerciseId: 'sit-to-stand', updatedAt: '2026-08-15T00:00:00.000Z' };
  await repository.saveExercisePreference(preference);
  expect(await repository.listExercisePreferences()).toEqual([preference]);
  await repository.deleteExercisePreference('chair-squat');
  expect(await repository.listExercisePreferences()).toEqual([]);
});

it('upgrades v2 without changing existing records', async () => {
  const name = `migration-v3-${crypto.randomUUID()}`;
  const legacy = new Dexie(name);
  legacy.version(2).stores({
    settings: 'id', sessions: 'id,date,status,source', activeSessions: 'id,date,source',
    journalEntries: 'id,updatedAt', freeSessionTemplates: 'id,updatedAt', tahajjudEntries: 'id,updatedAt',
  });
  const settings = { ...defaultSettings(), onboardingComplete: true };
  const plan = getTodayPlan(new Date(2026, 7, 17), 1);
  const session = { id: plan.date, date: plan.date, plan, source: 'program', status: 'completed', completedItemIds: ['march'], skippedItemIds: [], elapsedSeconds: 60, updatedAt: '2026-08-15T00:00:00.000Z' };
  const journal = { id: '2026-08-15', energy: 3, soreness: 2, sleepQuality: 4, stress: 2, breathlessness: 'exercise', note: '', updatedAt: '2026-08-15T00:00:00.000Z' };
  const template = { id: 'ringan', name: 'Ringan', items: [{ exerciseId: 'march', seconds: 60 }], createdAt: '2026-08-15T00:00:00.000Z', updatedAt: '2026-08-15T00:00:00.000Z' };
  const tahajjud = { id: '2026-08-15', sleptOnTime: true, wokeOnTime: true, prayed: true, readiness: 4, note: '', updatedAt: '2026-08-15T00:00:00.000Z' };
  await legacy.table('settings').put(settings);
  await legacy.table('sessions').put(session);
  await legacy.table('journalEntries').put(journal);
  await legacy.table('freeSessionTemplates').put(template);
  await legacy.table('tahajjudEntries').put(tahajjud);
  legacy.close();
  const upgraded = new JagaRagaDB(name);
  expect(await upgraded.settings.get('settings')).toEqual(settings);
  expect(await upgraded.sessions.get(plan.date)).toEqual(session);
  expect(await upgraded.journalEntries.get(journal.id)).toEqual(journal);
  expect(await upgraded.freeSessionTemplates.get(template.id)).toEqual(template);
  expect(await upgraded.tahajjudEntries.get(tahajjud.id)).toEqual(tahajjud);
  expect(await upgraded.exercisePreferences.toArray()).toEqual([]);
  await upgraded.delete();
});
```

- [ ] **Step 2: Run repository tests and verify missing v3 table**

Run: `./node_modules/.bin/vitest run src/persistence/repository.test.ts --pool=threads`

Expected: FAIL because `exercisePreferences` does not exist.

- [ ] **Step 3: Define v3 records and table**

```ts
export interface ExercisePreference { originalExerciseId: string; replacementExerciseId: string; updatedAt: string }
export interface PerformedMovement {
  plannedExerciseId: string; exerciseId: string; status: 'completed' | 'skipped';
  target: ExerciseTarget; group: MovementGroup; difficulty: Difficulty; equipment: EquipmentId[];
}
```

Add `performedItems?: PerformedMovement[]` to `SessionLog`, `exercisePreferences!: EntityTable<ExercisePreference, 'originalExerciseId'>`, and Dexie version 3 stores with `exercisePreferences: 'originalExerciseId,replacementExerciseId,updatedAt'`. No v3 upgrade callback mutates legacy rows; optional history fields preserve v1/v2 readability.

- [ ] **Step 4: Add CRUD and include preferences in reset**

Implement list/save/delete methods, and include the table in the existing reset transaction. Keep `completeSession` atomic between session log and active-session deletion.

- [ ] **Step 5: Run persistence tests and commit**

Run: `./node_modules/.bin/vitest run src/persistence/repository.test.ts --pool=threads`

Expected: legacy migration, preference CRUD, reset, and atomic completion tests PASS.

```bash
git add src/persistence/db.ts src/persistence/repository.ts src/persistence/repository.test.ts
git commit -m "feat: persist exercise preferences and performed history"
```

### Task 8: Build pre-session configuration and guardrails

**Files:**
- Create: `src/features/program/SessionConfigurator.tsx`
- Create: `src/features/program/SessionConfigurator.test.tsx`
- Modify: `src/App.tsx`
- Modify: `src/features/today/Today.tsx`
- Modify: `src/components/ReadinessCheck.tsx`
- Modify: `src/app.css`

**Interfaces:**
- Consumes: substitution functions, preferences, repository methods, and `PlannedSession`.
- Produces: `SessionConfigurator({ plan, preferences, ownedEquipment, onCancel, onContinue, onSavePreference })`.

- [ ] **Step 1: Write the full configuration-flow test**

```tsx
it('replaces one item, warns for harder equipment work, and continues with provenance', async () => {
  const onContinue = vi.fn();
  render(<SessionConfigurator plan={strengthPlan} preferences={[]} ownedEquipment={['chair', 'water-bottles']} onCancel={() => undefined} onContinue={onContinue} onSavePreference={vi.fn()} />);
  await user.click(screen.getByRole('button', { name: /ganti chair squat/i }));
  expect(screen.getAllByRole('option').length).toBe(10);
  await user.click(screen.getByRole('option', { name: /goblet squat/i }));
  expect(screen.getByRole('dialog', { name: /konfirmasi gerakan/i })).toBeVisible();
  await user.click(screen.getByRole('button', { name: /saya mengerti, gunakan/i }));
  await user.click(screen.getByRole('button', { name: /lanjut pemeriksaan kesiapan/i }));
  expect(onContinue.mock.calls[0][0].items.some((item: ConfiguredExerciseTarget) => item.exerciseId === 'bottle-goblet-squat' && item.plannedExerciseId === 'chair-squat')).toBe(true);
});
```

- [ ] **Step 2: Run component test and verify missing configurator**

Run: `./node_modules/.bin/vitest run src/features/program/SessionConfigurator.test.tsx --pool=threads`

Expected: FAIL on missing component.

- [ ] **Step 3: Implement the configurator states**

Render the ordered plan, estimate, equipment summary, and “Ganti” for every item. The chooser displays all ten same-group items including the current item, with image, purpose, difficulty, required equipment, and unavailable-equipment warning. Require a modal confirmation when `difficulty !== 'light'` or required equipment is not owned. Offer an unchecked “Jadikan pilihan utama” checkbox; current-session replacement is the default. Provide “Kembalikan bawaan” per item and “Reset semua perubahan”.

- [ ] **Step 4: Wire Today → configurator → readiness → runner**

Add explicit app states `configuring`, `configuredPlan`, and `checking`. A fresh program start opens the configurator; resume of an existing active session skips it. Apply stored preferences only if original/replacement IDs still exist and remain in the same group. Save the configured active session only after readiness passes, preventing abandoned configuration from overwriting an existing active session.

- [ ] **Step 5: Verify mobile behavior and commit**

Run: `./node_modules/.bin/vitest run src/features/program/SessionConfigurator.test.tsx src/App.test.tsx --pool=threads`

Expected: default path, replacement path, warning, reset, saved preference, readiness, and resume tests PASS.

```bash
git add src/features/program/SessionConfigurator.tsx src/features/program/SessionConfigurator.test.tsx src/App.tsx src/features/today/Today.tsx src/components/ReadinessCheck.tsx src/app.css
git commit -m "feat: configure Mode 1 sessions before readiness"
```

### Task 9: Record actual movements, upgrade backup v3, and update progress

**Files:**
- Create: `src/session/performedItems.ts`
- Create: `src/session/performedItems.test.ts`
- Modify: `src/session/SessionRunner.tsx`
- Modify: `src/persistence/backup.ts`
- Modify: `src/persistence/backup.test.ts`
- Modify: `src/features/progress/stats.ts`
- Modify: `src/features/progress/stats.test.ts`
- Modify: `src/features/progress/Progress.tsx`

**Interfaces:**
- Produces: `buildPerformedItems(plan, completedIds, skippedIds): PerformedMovement[]` and `BackupV3`.
- Consumes: catalog snapshots and exercise preferences.

- [ ] **Step 1: Write performed-history and v1/v2/v3 migration tests**

```ts
it('snapshots the actual replacement and original item', () => {
  const items = buildPerformedItems(configuredPlan, ['sit-to-stand'], []);
  expect(items[0]).toMatchObject({ plannedExerciseId: 'chair-squat', exerciseId: 'sit-to-stand', status: 'completed', group: 'lower-strength' });
});

it.each([legacyV1, legacyV2, validV3])('migrates backup atomically to schema 3', (input) => {
  const result = validateAndMigrateBackup(input);
  expect(result.schemaVersion).toBe(3);
  expect(result.exercisePreferences).toBeDefined();
});
```

- [ ] **Step 2: Run focused tests and verify schema/history failures**

Run: `./node_modules/.bin/vitest run src/session/performedItems.test.ts src/persistence/backup.test.ts src/features/progress/stats.test.ts --pool=threads`

Expected: FAIL because performed snapshots and BackupV3 do not exist.

- [ ] **Step 3: Snapshot actual performed items when finishing**

`buildPerformedItems` walks `plan.items`, resolves `plannedExerciseId ?? exerciseId`, copies the exact target, and snapshots group, difficulty, and equipment from the current catalog. `SessionRunner.save` includes this array. Keep legacy `completedItemIds` and `skippedItemIds` for backward compatibility.

- [ ] **Step 4: Implement BackupV3 and atomic migration**

```ts
export interface BackupV3 {
  schemaVersion: 3; exportedAt: string; settings: AppSettings | null; sessions: SessionLog[];
  journalEntries: JournalEntry[]; freeSessionTemplates: FreeSessionTemplate[];
  tahajjudEntries: TahajjudEntry[]; exercisePreferences: ExercisePreference[];
}
```

V1 migration adds all v2 collections and empty preferences; v2 migration adds empty preferences; v3 validates every preference against current catalog and same-group rules plus every optional performed-item snapshot. Complete all parsing and validation in memory before starting the transaction. During import, clear/write all seven tables in one Dexie transaction. Export always emits schema 3.

- [ ] **Step 5: Count actual categories in progress**

For sessions with `performedItems`, count completed snapshots by their stored group/kind mapping; for older sessions, fall back to `completedItemIds` and the current catalog. Add a “Gerakan pengganti” statistic showing how many completed snapshots have differing planned and actual IDs. Keep older-session progress stable.

- [ ] **Step 6: Run persistence/session/progress tests and commit**

Run: `./node_modules/.bin/vitest run src/session src/persistence src/features/progress --pool=threads`

Expected: performed-history, legacy fallback, Backup v1/v2/v3, invalid-import preservation, and progress tests PASS.

```bash
git add src/session src/persistence src/features/progress
git commit -m "feat: record substitutions in backup and progress"
```

### Task 10: Complete offline integration, accessibility, documentation, and one release artifact

**Files:**
- Modify: `src/components/ExerciseCard.tsx`
- Modify: `src/features/free-session/FreeSessionBuilder.tsx`
- Modify: `src/features/help/Help.tsx`
- Modify: `src/app.css`
- Modify: `public/sw.js`
- Modify: `README.md`
- Modify: `Dockerfile` if the new asset verifier is not already run during build
- Modify: `src/pwa.test.ts`
- Modify: `src/App.test.tsx`

**Interfaces:**
- Consumes: completed catalog, reusable `MovementVisual`, configured plans, v3 repository, and audited video registry.
- Produces: production-ready offline app and one GitHub-ready ZIP.

- [ ] **Step 1: Add failing end-to-end integration assertions**

```tsx
it('opens the sixty-item local catalog from the app shell', async () => {
  await repository.saveSettings({ ...(await repository.getSettings()), onboardingComplete: true });
  const user = userEvent.setup();
  render(<App />);
  await user.click(await screen.findByRole('button', { name: /^pustaka$/i }));
  expect(screen.getByText(/60 gerakan lokal/i)).toBeInTheDocument();
  expect([...document.querySelectorAll('img')].every((image) => image.getAttribute('src')?.startsWith('/movement/') ?? true)).toBe(true);
});

it('does not place YouTube domains in the service-worker cache list', () => {
  const worker = readFileSync('public/sw.js', 'utf8');
  expect(worker).not.toMatch(/youtube\.com|youtube-nocookie\.com|youtu\.be/);
});
```

- [ ] **Step 2: Run integration/PWA tests and record current failures**

Run: `./node_modules/.bin/vitest run src/App.test.tsx src/pwa.test.ts --pool=threads`

Expected: FAIL until the final catalog count, new navigation flow, and cache assertions are integrated.

- [ ] **Step 3: Finish cross-feature integration**

Use `EXERCISES_BY_ID` in `ExerciseCard`, free-session builder, statistics, backup validation, and every remaining former `MODE1_EXERCISES` consumer. Reuse `MovementVisual` in runner and library. The free-session selector shows all 60 records and remains capped at 40 items. Update Help with substitution, difficulty/equipment warnings, offline illustrations, optional official videos, and emergency stop guidance.

- [ ] **Step 4: Finish responsive and accessibility states**

At 320, 390, and 520 pixels verify no horizontal overflow, cards stack predictably, filter/configurator modals fit the viewport, sticky actions do not cover content, controls are at least 44px, focus is visible, dialogs have labels and focus return, images have useful alt text in details/runner and decorative alt text in compact cards, and reduced-motion disables nonessential transitions.

- [ ] **Step 5: Update offline caching and documentation**

Increment the service-worker cache name, include all build-owned hashed output through the existing Vite/static strategy, and retain the rule that external video frames are never cached. Update README with the exact 60/group counts, approved equipment, substitution flow, local-only storage, backup v3, video consent, build commands, Docker/Coolify settings, domain `jagaraga.ruanglegalitas.com` when configured, and the one-redeploy procedure.

- [ ] **Step 6: Run the complete verification matrix**

Run:

```bash
npm run verify:assets
./node_modules/.bin/vitest run --pool=threads
./node_modules/.bin/eslint .
./node_modules/.bin/tsc -b
./node_modules/.bin/vite build
docker build -t jagaraga:60-movements .
docker run --rm -d --name jagaraga-verify -p 18080:80 jagaraga:60-movements
curl --fail --silent http://127.0.0.1:18080/healthz
docker stop jagaraga-verify
```

Expected: asset verifier reports 60; all tests pass; lint/typecheck/build exit 0; Docker build succeeds; `/healthz` returns `ok`; verification container stops cleanly.

- [ ] **Step 7: Inspect production pages at target widths**

Serve the production build and manually verify Today, catalog/filter/detail, free session, configurator/chooser/confirmation, readiness, runner, progress, settings backup import/export, Help, offline reload, dark mode, and reduced motion at 320×700, 390×844, and 520×900. Confirm every one of the 60 movement detail pages shows an illustration and no blank video box appears when no video is assigned.

- [ ] **Step 8: Commit final integration and create the single release archive**

```bash
git add src public README.md Dockerfile package.json scripts
git commit -m "feat: complete JagaRaga sixty-movement release"
git status --short
git archive --format=zip --output=JagaRaga-60-Gerakan-GitHub-ready.zip HEAD
sha256sum JagaRaga-60-Gerakan-GitHub-ready.zip
```

Expected: clean working tree before archive; one ZIP and one SHA-256 checksum are produced. Upload that ZIP to GitHub and trigger one Coolify redeploy only after this task is fully green.

## Final Acceptance Map

| Specification requirement | Implemented by |
| --- | --- |
| Exactly 60 movements and agreed distribution | Tasks 1–2 |
| Male offline illustration for every movement | Task 3 |
| Official/legal optional video provenance | Task 4 |
| Layered benefits and detail guidance | Task 4 |
| Search and all filter dimensions | Task 5 |
| Same-group substitution and normalization | Task 6 |
| Preference persistence and DB v3 | Task 7 |
| Pre-session UX and harder/equipment guardrails | Task 8 |
| Actual movement history, statistics, Backup v3 | Task 9 |
| Offline/mobile/accessibility/release verification | Task 10 |
