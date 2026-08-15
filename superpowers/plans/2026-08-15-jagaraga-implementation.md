# JagaRaga Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a phone-first, offline-capable JagaRaga PWA that guides one user through the four-week Mode 1 program and stores progress locally.

**Architecture:** Use a React + TypeScript client application built by Vite and served as static files from an Nginx container. Keep the Mode 1 catalog, session engine, local persistence, media registry, and UI features separate; IndexedDB is the source of truth, while the service worker caches only application-owned assets.

**Tech Stack:** React 19.2, TypeScript, Vite 8, Vitest, Testing Library, Dexie 4, vite-plugin-pwa, Lucide React, CSS Modules/global design tokens, Nginx, Docker, GitHub, Coolify.

## Global Constraints

- Product name is exactly **JagaRaga**.
- Primary language is Indonesian and the primary viewport is an HP in portrait orientation.
- Touch targets are at least 44 px and essential actions remain reachable with one hand.
- Natural green and warm cream are the default palette; dark mode follows the device preference and can be overridden manually.
- No account, backend database, analytics tracker, advertising tracker, GPS tracking, calorie counting, medical diagnosis, or medical-clearance score.
- Essential program content, illustrations, session state, and progress work offline; third-party videos do not.
- Third-party videos are embedded from their original provider only after consent and are never downloaded, edited, cached, proxied, or republished.
- Browser storage is the source of truth; export/import uses a human-readable, versioned JSON format.
- Build and container tooling uses Node.js 22.12 or newer within the Node 22 LTS line.
- Target deployment is `https://app.ruanglegalitas.com` through GitHub and Coolify.
- Red-flag wording must cover chest pain or pressure, severe breathlessness, fainting or near-fainting, cold sweat, and pain spreading to the arm, jaw, neck, or back.

---

## Planned file structure

```text
/
├── .dockerignore
├── Dockerfile
├── nginx.conf
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.setup.ts
├── public/
│   ├── icons/
│   └── movement/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── app.css
│   ├── domain/
│   │   ├── types.ts
│   │   ├── mode1.ts
│   │   ├── schedule.ts
│   │   └── schedule.test.ts
│   ├── persistence/
│   │   ├── db.ts
│   │   ├── repository.ts
│   │   ├── repository.test.ts
│   │   ├── backup.ts
│   │   └── backup.test.ts
│   ├── media/
│   │   ├── videos.ts
│   │   ├── VideoEmbed.tsx
│   │   └── VideoEmbed.test.tsx
│   ├── session/
│   │   ├── reducer.ts
│   │   ├── reducer.test.ts
│   │   ├── useSessionTimer.ts
│   │   └── SessionRunner.tsx
│   ├── features/
│   │   ├── onboarding/Onboarding.tsx
│   │   ├── today/Today.tsx
│   │   ├── program/Program.tsx
│   │   ├── progress/Progress.tsx
│   │   └── settings/Settings.tsx
│   └── components/
│       ├── AppShell.tsx
│       ├── ReadinessCheck.tsx
│       ├── ExerciseCard.tsx
│       ├── WellnessForm.tsx
│       └── SafetyNotice.tsx
└── e2e/
    └── mobile.spec.ts
```

## Task 1: Application foundation and phone-first shell

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `vitest.setup.ts`, `index.html`
- Create: `src/main.tsx`, `src/App.tsx`, `src/app.css`, `src/components/AppShell.tsx`
- Test: `src/App.test.tsx`

**Interfaces:**
- Produces: `App`, `AppShell`, and four navigation destinations: `today | program | progress | settings`.
- Consumes: none.

- [ ] **Step 1: Scaffold the project and install pinned dependencies**

Create `package.json` with scripts `dev`, `build`, `test`, `test:run`, `lint`, and `preview`; include React, Dexie, Lucide React, Vite, Vitest, Testing Library, ESLint, TypeScript, `vite-plugin-pwa`, and Playwright. Run `npm install` and commit the generated lockfile.

- [ ] **Step 2: Write the failing shell test**

```tsx
// src/App.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';

test('opens the phone-first shell and changes destination', async () => {
  const user = userEvent.setup();
  render(<App />);
  expect(screen.getByRole('heading', { name: /hari ini/i })).toBeVisible();
  await user.click(screen.getByRole('button', { name: /program/i }));
  expect(screen.getByRole('heading', { name: /^program$/i })).toBeVisible();
});
```

- [ ] **Step 3: Run the focused test and verify failure**

Run: `npm test -- src/App.test.tsx`

Expected: FAIL because `./App` and the navigation shell do not exist.

- [ ] **Step 4: Implement the minimal accessible shell**

Define:

```ts
export type Destination = 'today' | 'program' | 'progress' | 'settings';
```

`AppShell` accepts `destination`, `onNavigate`, and `children`. Render one `<main>` and a bottom `<nav aria-label="Navigasi utama">` with four 44 px buttons labelled `Hari Ini`, `Program`, `Progres`, and `Pengaturan`. `App` owns the active destination and renders a correctly named heading for each destination.

Add CSS tokens for cream/green light mode, system dark mode, safe-area padding, maximum content width of 520 px, 16 px minimum body text, visible focus rings, reduced motion, and bottom-navigation clearance.

- [ ] **Step 5: Run foundation checks**

Run: `npm test -- src/App.test.tsx && npm run build`

Expected: test PASS and Vite production build succeeds without TypeScript errors.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json tsconfig.json vite.config.ts vitest.setup.ts index.html src
git commit -m "feat: establish JagaRaga mobile application shell"
```

## Task 2: Mode 1 domain catalog and schedule engine

**Files:**
- Create: `src/domain/types.ts`, `src/domain/mode1.ts`, `src/domain/schedule.ts`
- Test: `src/domain/schedule.test.ts`

**Interfaces:**
- Produces:
  - `type Exercise`, `type SessionDefinition`, `type ProgramWeek`, `type DayKey`.
  - `MODE1_EXERCISES: Record<string, Exercise>`.
  - `MODE1_SESSIONS: Record<DayKey, SessionDefinition>`.
  - `getTodayPlan(date: Date, programWeek: number): PlannedSession`.
- Consumes: none.

- [ ] **Step 1: Define exact domain types and failing schedule tests**

```ts
export type DayKey = 'monday'|'tuesday'|'wednesday'|'thursday'|'friday'|'saturday'|'sunday';
export type ExerciseKind = 'warmup'|'cardio'|'strength'|'balance'|'cooldown'|'recovery';
export interface Exercise {
  id: string;
  title: string;
  kind: ExerciseKind;
  purpose: string;
  equipment: string[];
  steps: string[];
  breathingCue: string;
  commonMistakes: string[];
  beginnerModification: string;
  stopCondition: string;
  illustration: string;
  videoId?: string;
}
export interface ExerciseTarget { exerciseId: string; sets?: number; reps?: number; seconds?: number; minutes?: number; }
export interface SessionDefinition { id: string; title: string; estimatedMinutes: number; items: ExerciseTarget[]; }
export interface PlannedSession extends SessionDefinition { date: string; day: DayKey; programWeek: 1|2|3|4; }
```

Test Monday Week 1 cardio is 10 minutes, Monday Week 4 cardio is 25 minutes, Tuesday Week 3 strength uses 2 sets × 8 repetitions, Sunday returns active rest, and invalid weeks throw `RangeError('Program week must be 1–4')`.

- [ ] **Step 2: Verify the tests fail**

Run: `npm test -- src/domain/schedule.test.ts`

Expected: FAIL because catalog and schedule modules do not exist.

- [ ] **Step 3: Implement the Mode 1 catalog**

Encode every exercise and session listed in the approved specification. Use Indonesian text and application-owned illustration paths such as `/movement/chair-squat.webp`. Keep the weekly volume table as immutable data:

```ts
export const WEEK_VOLUME = {
  1: { cardioMin: 10, cardioMax: 15, sets: 1, repsMin: 8, repsMax: 8 },
  2: { cardioMin: 15, cardioMax: 20, sets: 1, repsMin: 10, repsMax: 12 },
  3: { cardioMin: 20, cardioMax: 25, sets: 2, repsMin: 8, repsMax: 8 },
  4: { cardioMin: 25, cardioMax: 30, sets: 2, repsMin: 10, repsMax: 12 },
} as const;
```

Map JavaScript day numbers to `DayKey`, use local calendar dates in `YYYY-MM-DD` form without UTC conversion, and replace generic targets with the selected week’s cardio and strength volume.

- [ ] **Step 4: Verify domain behavior**

Run: `npm test -- src/domain/schedule.test.ts`

Expected: all schedule cases PASS.

- [ ] **Step 5: Commit**

```bash
git add src/domain
git commit -m "feat: define Mode 1 catalog and schedule progression"
```

## Task 3: Versioned local persistence and backup

**Files:**
- Create: `src/persistence/db.ts`, `src/persistence/repository.ts`, `src/persistence/backup.ts`
- Test: `src/persistence/repository.test.ts`, `src/persistence/backup.test.ts`

**Interfaces:**
- Produces:
  - `JagaRagaDB` Dexie database.
  - `ProgressRepository` with `getSettings`, `saveSettings`, `saveSession`, `getSession`, `listSessions`, `saveActiveSession`, `getActiveSession`, `clearActiveSession`, and `reset`.
  - `exportBackup(repository): Promise<string>`.
  - `validateBackup(input: unknown): BackupV1`.
  - `importBackup(repository, backup): Promise<void>`.
- Consumes: `PlannedSession` from Task 2.

- [ ] **Step 1: Define records and write failing repository tests**

```ts
export interface AppSettings {
  id: 'settings';
  startDate: string;
  programWeek: 1|2|3|4;
  preferredTime?: string;
  theme: 'system'|'light'|'dark';
  videoConsent: boolean;
  onboardingComplete: boolean;
}
export interface WellnessEntry { energy: 1|2|3|4|5; soreness: number; breathlessness: number; sleepHours?: number; note?: string; }
export interface SessionLog { id: string; date: string; plan: PlannedSession; status: 'completed'|'ended'; completedItemIds: string[]; skippedItemIds: string[]; elapsedSeconds: number; wellness?: WellnessEntry; updatedAt: string; }
export interface ActiveSession { id: 'active'; date: string; plan: PlannedSession; itemIndex: number; completedItemIds: string[]; skippedItemIds: string[]; startedAt: string; timerStartedAt?: string; elapsedBeforeTimer: number; }
```

Using `fake-indexeddb`, test settings round-trip, session upsert by ID, active-session clearing, and reset. Test that backup export uses `{ schemaVersion: 1, exportedAt, settings, sessions }`, invalid numeric scales are rejected, and a failed import leaves current data unchanged.

- [ ] **Step 2: Verify persistence tests fail**

Run: `npm test -- src/persistence`

Expected: FAIL because the database and repository do not exist.

- [ ] **Step 3: Implement database and repository**

Create Dexie stores `settings`, `sessions`, and `activeSessions`; inject the database into `ProgressRepository` so tests use an isolated database name. Wrap multi-record import and reset in Dexie transactions. Clamp neither invalid imported data nor wellness scales: reject the entire import with an Indonesian validation error.

- [ ] **Step 4: Implement atomic backup validation and import**

Parse JSON outside the repository; validate every required field, date string, union value, wellness range (`energy 1–5`, `soreness 0–10`, `breathlessness 0–10`, `sleepHours 0–24`), and schema version before opening the write transaction. Preserve existing data if validation or writing fails.

- [ ] **Step 5: Run persistence tests**

Run: `npm test -- src/persistence`

Expected: all repository and backup tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/persistence package.json package-lock.json
git commit -m "feat: persist and back up local exercise progress"
```

## Task 4: Onboarding, safety gate, and Today screen

**Files:**
- Create: `src/features/onboarding/Onboarding.tsx`, `src/features/today/Today.tsx`
- Create: `src/components/ReadinessCheck.tsx`, `src/components/SafetyNotice.tsx`
- Modify: `src/App.tsx`
- Test: `src/features/onboarding/Onboarding.test.tsx`, `src/features/today/Today.test.tsx`

**Interfaces:**
- Produces:
  - `Onboarding({ onComplete })` returning `AppSettings` through its callback.
  - `ReadinessCheck({ onClear, onStop })`.
  - `Today({ settings, repository, onStart })`.
- Consumes: schedule engine from Task 2 and repository from Task 3.

- [ ] **Step 1: Write failing onboarding and safety tests**

Test that onboarding states progress is device-local; collects start date, preferred time, and video consent; and cannot finish until the safety acknowledgement is checked. Test that selecting chest pressure disables `Mulai latihan` and renders `Hentikan latihan dan cari pertolongan medis segera`, while a clear check calls `onClear`.

- [ ] **Step 2: Verify UI tests fail**

Run: `npm test -- src/features/onboarding src/features/today`

Expected: FAIL because the components do not exist.

- [ ] **Step 3: Implement onboarding**

Use a three-step form: welcome/storage disclosure, preferences/video consent, and safety acknowledgement. Default the start date to the local current date, theme to `system`, program week to `1`, and video consent to `false`. Persist only after the final confirmation.

- [ ] **Step 4: Implement readiness and Today**

The readiness checklist has five explicit yes/no items: chest discomfort, severe or unusual breathlessness, faintness, acute illness, and significant new pain. Any yes result produces the stop state without calculating a medical score. Today shows session title, equipment, target duration, current program week, and `Mulai latihan`; it offers `Lanjutkan sesi` when an active record for today exists.

- [ ] **Step 5: Run focused and full tests**

Run: `npm test -- src/features/onboarding src/features/today && npm test`

Expected: all tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx src/components src/features
git commit -m "feat: add onboarding and pre-session safety check"
```

## Task 5: Guided session runner, durable timer, and completion form

**Files:**
- Create: `src/session/reducer.ts`, `src/session/useSessionTimer.ts`, `src/session/SessionRunner.tsx`
- Create: `src/components/ExerciseCard.tsx`, `src/components/WellnessForm.tsx`
- Test: `src/session/reducer.test.ts`, `src/session/SessionRunner.test.tsx`

**Interfaces:**
- Produces:
  - `sessionReducer(state, action): ActiveSession`.
  - `getElapsedSeconds(active, now): number`.
  - `SessionRunner({ active, repository, onFinish })`.
- Consumes: domain types and repository.

- [ ] **Step 1: Write failing state-machine tests**

Cover actions `COMPLETE_ITEM`, `SKIP_ITEM`, `NEXT_ITEM`, `PREVIOUS_ITEM`, `START_TIMER`, `PAUSE_TIMER`, and `RESTORE`. Assert item indices stay within the plan, completed/skipped IDs remain unique, and elapsed time derives from `elapsedBeforeTimer + (now - timerStartedAt)` when running.

- [ ] **Step 2: Verify failure**

Run: `npm test -- src/session`

Expected: FAIL because the session modules do not exist.

- [ ] **Step 3: Implement the pure session reducer and timer math**

Keep reducer logic free of browser APIs. Save ISO timestamps rather than relying on a background interval. `useSessionTimer` refreshes visible time once per second but persists only on user actions, visibility change, and unmount to avoid excessive IndexedDB writes.

- [ ] **Step 4: Implement the guided runner**

Render one exercise at a time with illustration, numbered Indonesian steps, breathing cue, target, modification, common mistakes, stop condition, timer where relevant, and controls `Sebelumnya`, `Lewati`, `Selesai`, and `Berikutnya`. Display current position as text such as `Gerakan 3 dari 8`; do not rely only on a visual progress bar.

On ending early, require confirmation and save status `ended`. On normal completion, require wellness input with energy 1–5, soreness 0–10, breathlessness 0–10, optional sleep 0–24, and optional note of at most 300 characters; save the completed log and clear the active session in one transaction.

- [ ] **Step 5: Test interruption and completion**

Test background timer restoration with a fake clock, persistence after advancing, resume from a stored item, early-end confirmation, input ranges, and completed-log creation.

Run: `npm test -- src/session src/components`

Expected: all session and component tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/session src/components src/persistence
git commit -m "feat: guide and safely resume Mode 1 sessions"
```

## Task 6: Legal public video wrapper and offline movement media

**Files:**
- Create: `src/media/videos.ts`, `src/media/VideoEmbed.tsx`
- Create: verified assets under `public/movement/`
- Modify: `src/components/ExerciseCard.tsx`
- Test: `src/media/VideoEmbed.test.tsx`

**Interfaces:**
- Produces:
  - `type VideoSource`.
  - `VIDEO_REGISTRY: Record<string, VideoSource>`.
  - `VideoEmbed({ source, consent, online })`.
- Consumes: exercise `videoId` and global video-consent preference.

- [ ] **Step 1: Define the registry and write failing consent/fallback tests**

```ts
export interface VideoSource {
  id: string;
  title: string;
  provider: 'youtube';
  providerName: string;
  videoId: string;
  originalUrl: string;
  verifiedAt: string;
  captionsVerified: boolean;
}
```

Test that no iframe appears without consent, consented YouTube uses `https://www.youtube-nocookie.com/embed/{videoId}`, offline mode renders `Video membutuhkan internet`, the source provider is visible, and `Buka sumber asli` uses `target="_blank" rel="noreferrer noopener"`.

- [ ] **Step 2: Verify failure**

Run: `npm test -- src/media/VideoEmbed.test.tsx`

Expected: FAIL because video modules do not exist.

- [ ] **Step 3: Verify and register initial sources manually**

Before adding an entry, open the source, confirm it is owned by the stated ministry/medical institution, confirm playback and embedding, record the current date in `verifiedAt`, and prefer captioned sources. Initial candidates are Kementerian Kesehatan’s low-impact aerobics and fitness videos and exercise demonstrations from reputable medical institutions. Do not add any source that fails ownership or embed verification.

- [ ] **Step 4: Implement the privacy-aware wrapper and illustrations**

Load no third-party iframe before explicit consent. Render a fixed-ratio responsive player only while online; always display source attribution and the original link. Add consistent two- or three-frame WebP illustrations for every catalog movement, descriptive alt text on meaningful images, empty alt text on repeated decorative frames, and CSS arrows only as supplementary cues.

- [ ] **Step 5: Run media tests and asset checks**

Run: `npm test -- src/media && test $(find public/movement -name '*.webp' | wc -l) -ge 20`

Expected: all tests PASS and at least 20 optimized movement assets exist.

- [ ] **Step 6: Commit**

```bash
git add src/media src/components/ExerciseCard.tsx public/movement
git commit -m "feat: add offline movement guides and legal video embeds"
```

## Task 7: Program, progress, settings, and week review

**Files:**
- Create: `src/features/program/Program.tsx`, `src/features/progress/Progress.tsx`, `src/features/settings/Settings.tsx`
- Create: `src/features/progress/weekReview.ts`
- Modify: `src/App.tsx`
- Test: `src/features/progress/weekReview.test.ts`, `src/features/settings/Settings.test.tsx`

**Interfaces:**
- Produces:
  - `reviewWeek(logs, week): { outcome: 'advance'|'repeat'|'assessment'; reasons: string[] }`.
  - Complete four-destination application navigation.
- Consumes: catalog, schedule engine, repository, backup functions, and settings.

- [ ] **Step 1: Write failing weekly-review and settings tests**

Test `assessment` when logs contain chest-warning termination or repeated breathlessness values of 8–10; `repeat` when fewer than four planned sessions were completed or soreness above 7 persists across two entries; and `advance` when at least four planned sessions are complete with no warning pattern. The return value is only a non-clinical prompt; progression still requires user confirmation.

Test export download, invalid import preserving current data, reset requiring the exact phrase `HAPUS PROGRES`, theme changes, and video-consent revocation.

- [ ] **Step 2: Verify failure**

Run: `npm test -- src/features/progress src/features/settings`

Expected: FAIL because review and settings features do not exist.

- [ ] **Step 3: Implement Program and Progress**

Program displays the stable Monday–Sunday structure, the four volume rows, current week, and exercise library. Progress displays a four-week completion grid, completed-session count, total cardio minutes, recent wellness values as labelled text plus modest bars, and the end-of-week review. Avoid medical conclusions and avoid celebratory pressure when the user records symptoms.

- [ ] **Step 4: Implement Settings and safe data controls**

Settings handles theme, video preference, JSON export/import, destructive reset confirmation, PWA installation help, privacy disclosure, safety information, and application version. Import first parses and validates, then presents a summary, and writes only after explicit replacement confirmation.

- [ ] **Step 5: Run feature and full tests**

Run: `npm test -- src/features && npm test`

Expected: all tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx src/features
git commit -m "feat: complete program progress and settings experiences"
```

## Task 8: PWA lifecycle, accessibility, and mobile end-to-end validation

**Files:**
- Modify: `vite.config.ts`, `src/main.tsx`, `src/App.tsx`, `src/app.css`
- Create: `public/icons/icon-192.png`, `public/icons/icon-512.png`, `public/icons/maskable-512.png`
- Create: `e2e/mobile.spec.ts`, `playwright.config.ts`

**Interfaces:**
- Produces: installable offline PWA and automated mobile smoke coverage.
- Consumes: complete application.

- [ ] **Step 1: Write the failing mobile smoke test**

Use Playwright’s Pixel 7 profile. Cover first launch, onboarding, clear readiness check, completing one exercise, reloading and resuming, finishing the session, opening Progres, switching dark mode, and navigating offline. Assert every visible primary control’s bounding box is at least 44 px high.

- [ ] **Step 2: Verify initial end-to-end failure**

Run: `npm run build && npx playwright test e2e/mobile.spec.ts`

Expected: FAIL because the PWA lifecycle and completed mobile flow are not yet configured.

- [ ] **Step 3: Configure PWA behavior**

Set manifest name and short name to `JagaRaga`, standalone display, portrait orientation, cream background, green theme, and the three icons. Configure Workbox to precache application-owned build assets and movement illustrations, navigate to the application shell offline, and exclude all `youtube.com`, `youtube-nocookie.com`, and third-party requests from runtime caching.

Prompt installation only after onboarding. When a new service worker is waiting, defer the reload during an active session and show `Pembaruan siap` afterward.

- [ ] **Step 4: Complete accessibility and responsive checks**

Add skip navigation, live text for timer changes without announcing every second, labelled progress text, visible focus, reduced-motion behavior, safe-area insets, 320–520 px viewport coverage, and empty states that explain the next action. Verify light and dark contrast with axe; fix all serious or critical findings.

- [ ] **Step 5: Run full quality gate**

Run: `npm test && npm run build && npx playwright test`

Expected: unit/component tests PASS, production build succeeds, and mobile end-to-end tests PASS.

- [ ] **Step 6: Commit**

```bash
git add vite.config.ts src public/icons e2e playwright.config.ts package.json package-lock.json
git commit -m "feat: make JagaRaga installable and offline capable"
```

## Task 9: Container, GitHub handoff, and Coolify deployment verification

**Files:**
- Create: `Dockerfile`, `nginx.conf`, `.dockerignore`, `.github/workflows/quality.yml`, `README.md`
- Test: container health and production hostname.

**Interfaces:**
- Produces: an immutable static container listening on port 8080 and deployment instructions for `app.ruanglegalitas.com`.
- Consumes: production build output from Task 8.

- [ ] **Step 1: Write the container and SPA routing configuration**

Use a Node 22 Alpine build stage running `npm ci && npm run build`, then copy `dist/` into an unprivileged Nginx Alpine image. Configure Nginx to listen on `8080`, serve hashed assets with long immutable caching, serve `index.html` without immutable caching, return `/index.html` for application routes, and expose `/healthz` as plain text `ok`.

- [ ] **Step 2: Add CI quality gate**

Configure GitHub Actions on pushes and pull requests to use Node 22, run `npm ci`, `npm test`, and `npm run build`. Do not place server credentials, Cloudflare credentials, or Coolify tokens in the repository.

- [ ] **Step 3: Document deployment and data behavior**

README must state: clone/install/test commands; local preview; progress is device-local and can be lost if browser site data is cleared; backup/restore; video privacy behavior; Docker port 8080; Coolify domain and health-check settings; Cloudflare proxy/TLS notes; and rollback by redeploying a prior Git commit.

- [ ] **Step 4: Verify the container locally**

Run:

```bash
docker build -t jagaraga:local .
docker run --rm -d --name jagaraga-local -p 8080:8080 jagaraga:local
curl --fail http://127.0.0.1:8080/healthz
curl --fail http://127.0.0.1:8080/program
docker stop jagaraga-local
```

Expected: both curl commands succeed; the health body is `ok`; the application route returns the PWA shell.

- [ ] **Step 5: Push to the user-authorized GitHub repository**

Create or select the repository only with the user’s confirmed GitHub destination and visibility. Push the reviewed `main` branch without credentials in the remote URL. Confirm the quality workflow succeeds before Coolify deployment.

- [ ] **Step 6: Configure and verify Coolify**

Deploy from the GitHub repository using the Dockerfile, internal port `8080`, health path `/healthz`, and domain `https://app.ruanglegalitas.com`. Confirm Cloudflare SSL mode is compatible with an origin certificate and avoid a redirect loop. Verify the production page, manifest, service worker, offline relaunch, video fallback, and health endpoint from an HP.

- [ ] **Step 7: Final verification and commit**

Run: `npm test && npm run build && npx playwright test`

Expected: all checks PASS, the GitHub workflow is green, Coolify is healthy, and the production hostname loads JagaRaga.

```bash
git add Dockerfile nginx.conf .dockerignore .github README.md
git commit -m "ops: prepare JagaRaga for GitHub and Coolify"
```

---

## Final review checklist

- [ ] Every approved Mode 1 exercise and weekly target is present.
- [ ] All essential screens work at 320 px width and with reduced motion.
- [ ] No third-party request occurs before video consent.
- [ ] No third-party media is cached or copied into the repository.
- [ ] Progress survives reload and interrupted sessions.
- [ ] Backup validation is atomic and reset requires explicit confirmation.
- [ ] Safety copy is visible, consistent, and does not claim diagnosis.
- [ ] Unit, component, end-to-end, production build, container, and deployment checks pass.
- [ ] `app.ruanglegalitas.com` serves the installable PWA through Coolify and Cloudflare without a redirect loop.
