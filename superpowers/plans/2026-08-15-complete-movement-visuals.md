# Complete Movement Visuals Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ensure every one of JagaRaga Mode 1's 22 exercises displays a clear two-phase male movement illustration, with official videos remaining optional supplements.

**Architecture:** Every exercise definition owns one explicit `/movement/<exercise-id>.png` URL. `ExerciseCard` renders that URL uniformly and provides a readable fallback only when an asset fails at runtime. A registry-wide integrity test enforces both the PNG path contract and presence of each public file.

**Tech Stack:** React 19, TypeScript 5.9, Vitest, Testing Library, Vite, PNG assets generated with the built-in image generation tool.

## Global Constraints

- Every `MODE1_EXERCISES` entry must have a raster illustration available in the deployed application.
- The recurring subject is an adult man in modest neutral exercise clothing.
- Every illustration presents the starting and ending phase of the movement.
- Palette: warm cream background, dark green linework, muted gold accents.
- Third-party videos remain consent-gated, online-only, and linked to their original sources.
- No changes to exercise prescription, repetitions, duration, or safety copy.

---

### Task 1: Enforce the Complete Media Contract

**Files:**
- Create: `src/media/movementVisuals.test.ts`
- Modify: `src/domain/mode1.ts`

**Interfaces:**
- Consumes: `MODE1_EXERCISES: Record<string, Exercise>` and `Exercise.illustration: string`.
- Produces: one `/movement/<exercise-id>.png` URL per exercise.

- [ ] **Step 1: Write the failing registry test**

```ts
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { MODE1_EXERCISES } from '../domain/mode1';

describe('movement visuals', () => {
  test.each(Object.values(MODE1_EXERCISES))('$id has a deployable PNG illustration', (exercise) => {
    expect(exercise.illustration).toBe(`/movement/${exercise.id}.png`);
    expect(existsSync(join(process.cwd(), 'public', exercise.illustration))).toBe(true);
  });
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `npm run test:run -- src/media/movementVisuals.test.ts`

Expected: FAIL because current definitions point to `.svg` and most files do not exist.

- [ ] **Step 3: Change the illustration path contract**

In `src/domain/mode1.ts`, change the exercise factory field to:

```ts
illustration: `/movement/${id}.png`,
```

- [ ] **Step 4: Run the focused test again**

Run: `npm run test:run -- src/media/movementVisuals.test.ts`

Expected: still FAIL only for absent PNG files, proving the test reaches filesystem integrity.

---

### Task 2: Generate and Install the Male Movement Illustrations

**Files:**
- Create: `public/movement/march.png`
- Create: `public/movement/shoulder-roll.png`
- Create: `public/movement/chest-open.png`
- Create: `public/movement/standing-cat-cow.png`
- Create: `public/movement/trunk-turn.png`
- Create: `public/movement/hip-circle.png`
- Create: `public/movement/knee-raise.png`
- Create: `public/movement/ankle-circle.png`
- Replace: `public/movement/chair-squat.png`
- Replace: `public/movement/wall-pushup.png`
- Create: `public/movement/glute-bridge.png`
- Create: `public/movement/bird-dog.png`
- Create: `public/movement/calf-raise.png`
- Create: `public/movement/walk.png`
- Create: `public/movement/single-leg.png`
- Create: `public/movement/heel-to-toe.png`
- Create: `public/movement/hip-hinge.png`
- Create: `public/movement/row.png`
- Create: `public/movement/dead-bug.png`
- Create: `public/movement/easy-mobility.png`
- Create: `public/movement/slow-breathing.png`
- Create: `public/movement/slow-walk.png`

**Interfaces:**
- Consumes: the filename contract established in Task 1.
- Produces: 22 PNG assets addressable at the exact URLs stored in `Exercise.illustration`.

- [ ] **Step 1: Generate six consistent contact sheets**

Use the built-in image generation tool once per sheet. Each prompt uses the `scientific-educational` use case and asks for a precise 2×2 grid, one named movement per quadrant, two side-by-side phases inside every quadrant, the same adult Indonesian man, modest beige top and dark green trousers, full body visible, warm cream background, dark green linework, muted gold accents, no text, no arrows, no logos, and no watermark.

Sheet assignments:

```text
1: march, walk, slow-walk, knee-raise
2: shoulder-roll, chest-open, standing-cat-cow, trunk-turn
3: hip-circle, ankle-circle, single-leg, heel-to-toe
4: chair-squat, wall-pushup, calf-raise, hip-hinge
5: glute-bridge, bird-dog, dead-bug, slow-breathing
6: row-with-band, easy-mobility; leave the remaining two quadrants empty
```

- [ ] **Step 2: Inspect all six sheets**

Use the image viewer at original detail. Reject and regenerate a sheet if a quadrant has a cropped body, incorrect exercise mechanics, extra limbs, inconsistent clothing, text, or a watermark.

- [ ] **Step 3: Extract named assets**

Crop every populated quadrant into its corresponding `public/movement/<exercise-id>.png`. Preserve a consistent 3:2 frame and verify each image with the image viewer.

- [ ] **Step 4: Verify the registry test turns GREEN**

Run: `npm run test:run -- src/media/movementVisuals.test.ts`

Expected: PASS for all 22 rows.

- [ ] **Step 5: Commit the contract and assets**

```bash
git add src/domain/mode1.ts src/media/movementVisuals.test.ts public/movement
git commit -m "feat: illustrate every Mode 1 movement"
```

---

### Task 3: Render Visuals Uniformly and Handle Failures

**Files:**
- Modify: `src/components/ExerciseCard.test.tsx`
- Modify: `src/components/ExerciseCard.tsx`
- Modify: `src/app.css`

**Interfaces:**
- Consumes: `item.illustration` from every exercise definition.
- Produces: `MovementVisual({ src, title })`, which displays an image and swaps to accessible fallback copy only after an image error.

- [ ] **Step 1: Write failing component tests**

Add a test for a formerly abstract movement:

```ts
test('shows a concrete illustration for every exercise kind', () => {
  render(<ExerciseCard target={{ exerciseId: 'shoulder-roll', reps: 10 }} index={0} total={1} consent={false} onPrevious={vi.fn()} onComplete={vi.fn()} onSkip={vi.fn()} />);
  expect(screen.getByRole('img', { name: /contoh putaran bahu/i })).toHaveAttribute('src', '/movement/shoulder-roll.png');
});
```

Add an error test that fires the image `error` event and expects `Ilustrasi Putaran bahu tidak dapat dimuat.`.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm run test:run -- src/components/ExerciseCard.test.tsx`

Expected: FAIL because shoulder roll currently renders an abstract glyph and has no runtime fallback.

- [ ] **Step 3: Implement `MovementVisual` and use it uniformly**

In `ExerciseCard.tsx`, remove `visualGlyph` and `visualAsset`. Add a small stateful component that renders:

```tsx
<img className="movement-image" src={src} alt={`Contoh ${title}`} />
```

and, after `onError`, renders:

```tsx
<div className="movement-image-fallback" role="status">Ilustrasi {title} tidak dapat dimuat.</div>
```

Use `<MovementVisual src={item.illustration} title={item.title} />` for every exercise.

- [ ] **Step 4: Update mobile image framing**

In `src/app.css`, give `.movement-image` and `.movement-image-fallback` a `3 / 2` aspect ratio, `height: auto`, and matching rounded-card presentation so full-body phases remain visible on narrow screens.

- [ ] **Step 5: Run focused and full verification**

Run:

```bash
npm run test:run -- src/components/ExerciseCard.test.tsx src/media/movementVisuals.test.ts
npm run test:run
npm run lint
npm run build
```

Expected: all tests PASS, lint exits 0, TypeScript and Vite production build exit 0.

- [ ] **Step 6: Commit rendering changes**

```bash
git add src/components/ExerciseCard.tsx src/components/ExerciseCard.test.tsx src/app.css
git commit -m "feat: show an illustration at every exercise stage"
```

---

### Task 4: Package the GitHub and Coolify Update

**Files:**
- Modify: `README.md`
- Create outside repository: `JagaRaga-GitHub-ready-v2.zip`

**Interfaces:**
- Consumes: verified source tree and Git history.
- Produces: a clean downloadable ZIP suitable for replacing the GitHub repository contents and redeploying through Coolify.

- [ ] **Step 1: Document the new media guarantee**

Add to `README.md` that every exercise has an offline local illustration and that official third-party video remains optional and consent-gated.

- [ ] **Step 2: Run final verification from a clean status snapshot**

Run:

```bash
git diff --check
npm run test:run
npm run lint
npm run build
```

Expected: zero whitespace errors, zero failing tests, zero lint errors, successful build.

- [ ] **Step 3: Commit documentation**

```bash
git add README.md
git commit -m "docs: explain complete offline movement visuals"
```

- [ ] **Step 4: Build and verify the archive**

Create `JagaRaga-GitHub-ready-v2.zip` from `git archive HEAD`, include a complete Git bundle, and exclude `.git`, `node_modules`, `dist`, TypeScript build metadata, and environment files. Run `unzip -t` and `git bundle verify`, then calculate SHA-256.

- [ ] **Step 5: Make the ZIP available for download**

Upload the verified archive as one persistent downloadable file and present its sandbox link.
