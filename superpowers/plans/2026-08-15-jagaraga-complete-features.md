# JagaRaga Complete Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship one offline-first JagaRaga update that adds the complete feature set around the existing Mode 1 program: movement library, free sessions, journal, transparent weekly evaluation, richer statistics, tahajjud routine, calendar/browser reminders, help, and versioned backup migration.

**Architecture:** Keep the application as a static React PWA with Dexie-backed local data. Add focused domain modules for validation, evaluation, statistics, calendar generation, and notifications; UI features consume those pure interfaces while `App.tsx` remains the navigation and refresh coordinator. Upgrade IndexedDB and backup data atomically without introducing accounts, backend services, analytics, or additional runtime dependencies.

**Tech Stack:** React 19, TypeScript 5.9, Dexie 4, Vitest, Testing Library, Lucide React, Vite 8, hand-authored iCalendar text.

## Global Constraints

- Program content remains only **Mode 1 — Adaptasi Tubuh**.
- All features are available immediately after the update.
- Data remains local to the browser; no account, backend, analytics, or server database.
- Every non-video feature must remain useful offline.
- YouTube remains consent-gated and is never cached by the service worker.
- Calendar `.ics` is the reliable reminder path; browser notifications are an explicitly limited supplement.
- Advice is deterministic, transparent, conservative, and never presented as diagnosis.
- Existing schema-version-1 JSON backups must import without losing data.
- Minimum supported layout width is 320 pixels and touch targets remain at least 44×44 pixels.

---

### Task 1: Versioned Local Data Model and Repository

**Files:**
- Modify: `src/domain/types.ts`
- Modify: `src/persistence/db.ts`
- Modify: `src/persistence/repository.ts`
- Modify: `src/persistence/repository.test.ts`

**Interfaces:**
- Produces: `SessionSource`, `JournalEntry`, `FreeSessionTemplate`, `TahajjudEntry`, `ReminderSettings`, `TahajjudSettings`.
- Produces repository methods: `listJournalEntries()`, `saveJournalEntry()`, `listTemplates()`, `saveTemplate()`, `deleteTemplate()`, `listTahajjudEntries()`, `saveTahajjudEntry()`.
- Existing consumers continue using `getSettings`, `listSessions`, and active-session methods.

- [ ] **Step 1: Write failing migration and repository tests**

Add tests proving version-1 rows reopen under version 2 with `source: 'program'`, and proving save/list/delete behavior for journals, templates, and tahajjud entries:

```ts
const journal = { id: '2026-08-15', energy: 3, soreness: 2, sleepQuality: 4, stress: 2, breathlessness: 'exercise', note: '', updatedAt: now } satisfies JournalEntry;
await repository.saveJournalEntry(journal);
expect(await repository.listJournalEntries()).toEqual([journal]);

await repository.saveTemplate(template);
expect(await repository.listTemplates()).toEqual([template]);
await repository.deleteTemplate(template.id);
expect(await repository.listTemplates()).toEqual([]);
```

- [ ] **Step 2: Run repository tests and verify RED**

Run: `./node_modules/.bin/vitest run src/persistence/repository.test.ts --pool=threads`

Expected: FAIL because schema 2 entities and repository methods do not exist.

- [ ] **Step 3: Add exact domain and persistence types**

Add:

```ts
export type SessionSource = 'program' | 'free';
export type BreathlessnessLevel = 'none' | 'exercise' | 'ordinary';

export interface JournalEntry {
  id: string;
  energy: 1 | 2 | 3 | 4 | 5;
  soreness: number;
  sleepQuality: 1 | 2 | 3 | 4 | 5;
  stress: 1 | 2 | 3 | 4 | 5;
  breathlessness: BreathlessnessLevel;
  note: string;
  updatedAt: string;
}

export interface FreeSessionTemplate {
  id: string;
  name: string;
  items: ExerciseTarget[];
  createdAt: string;
  updatedAt: string;
}

export interface TahajjudEntry {
  id: string;
  sleptOnTime: boolean;
  wokeOnTime: boolean;
  prayed: boolean;
  readiness: 1 | 2 | 3 | 4 | 5;
  note: string;
  updatedAt: string;
}
```

Extend settings with nested reminder and tahajjud defaults, and add `source: SessionSource` plus optional `templateId` to active/session records.

- [ ] **Step 4: Upgrade Dexie and repository atomically**

Add version 2 stores:

```ts
this.version(2).stores({
  settings: 'id',
  sessions: 'id,date,status,source',
  activeSessions: 'id,date,source',
  journalEntries: 'id,updatedAt',
  freeSessionTemplates: 'id,updatedAt',
  tahajjudEntries: 'id,updatedAt',
}).upgrade(async (transaction) => {
  await transaction.table('sessions').toCollection().modify((row) => { row.source ??= 'program'; });
  await transaction.table('activeSessions').toCollection().modify((row) => { row.source ??= 'program'; });
});
```

Include every new table in `reset()`.

- [ ] **Step 5: Run repository tests and full tests**

Run:

```bash
./node_modules/.bin/vitest run src/persistence/repository.test.ts --pool=threads
./node_modules/.bin/vitest run --pool=threads
```

Expected: all repository and existing tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/domain/types.ts src/persistence/db.ts src/persistence/repository.ts src/persistence/repository.test.ts
git commit -m "feat: add local data model for complete features"
```

---

### Task 2: Backup V2 and Atomic Legacy Migration

**Files:**
- Modify: `src/persistence/backup.ts`
- Modify: `src/persistence/backup.test.ts`

**Interfaces:**
- Consumes: all Task 1 persistence entities and repository tables.
- Produces: `BackupV2`, `validateAndMigrateBackup(input): BackupV2`, unchanged `exportBackup()` and `importBackup()` entry points.

- [ ] **Step 1: Write failing V1 migration, V2 round-trip, and atomic rejection tests**

Test that a V1 backup returns schema 2 with default collections and `source: 'program'`. Test V2 export/import for journals, templates, and tahajjud entries. Seed the database, import invalid JSON, and prove all seeded rows remain.

```ts
const migrated = validateAndMigrateBackup(v1Fixture);
expect(migrated.schemaVersion).toBe(2);
expect(migrated.sessions[0].source).toBe('program');
expect(migrated.journalEntries).toEqual([]);
```

- [ ] **Step 2: Run backup tests and verify RED**

Run: `./node_modules/.bin/vitest run src/persistence/backup.test.ts --pool=threads`

Expected: FAIL because schema 2 migration is absent.

- [ ] **Step 3: Implement strict validators and V1 migration**

Define:

```ts
export interface BackupV2 {
  schemaVersion: 2;
  exportedAt: string;
  settings: AppSettings | null;
  sessions: SessionLog[];
  journalEntries: JournalEntry[];
  freeSessionTemplates: FreeSessionTemplate[];
  tahajjudEntries: TahajjudEntry[];
}
```

Validate string lengths, numeric bounds, exercise IDs, target exclusivity, date IDs, and enum values before opening a write transaction. Convert V1 to V2 in memory and apply setting defaults.

- [ ] **Step 4: Extend one atomic import transaction**

Clear and replace all version-2 tables only after validation succeeds. Return restored counts:

```ts
return { sessions: backup.sessions.length, journals: backup.journalEntries.length, templates: backup.freeSessionTemplates.length, tahajjud: backup.tahajjudEntries.length };
```

- [ ] **Step 5: Verify and commit**

Run:

```bash
./node_modules/.bin/vitest run src/persistence/backup.test.ts --pool=threads
./node_modules/.bin/vitest run --pool=threads
```

Then commit:

```bash
git add src/persistence/backup.ts src/persistence/backup.test.ts
git commit -m "feat: migrate and back up complete local data"
```

---

### Task 3: Five-Destination Navigation and Movement Library

**Files:**
- Create: `src/features/library/filterExercises.ts`
- Create: `src/features/library/filterExercises.test.ts`
- Create: `src/features/library/MovementLibrary.tsx`
- Create: `src/features/library/MovementLibrary.test.tsx`
- Create: `src/features/library/ExerciseDetail.tsx`
- Modify: `src/components/AppShell.tsx`
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx`
- Modify: `src/app.css`

**Interfaces:**
- Produces `Destination = 'today' | 'library' | 'free' | 'progress' | 'more'`.
- Produces `filterExercises(exercises, query, kind): Exercise[]`.
- `MovementLibrary` accepts `onAddToFreeSession(exerciseId)` and renders `ExerciseDetail` locally.

- [ ] **Step 1: Write failing filter and navigation tests**

Cover case-insensitive title/purpose search, category filtering, empty result, opening Putaran bahu detail, and all five navigation labels.

```ts
expect(filterExercises(Object.values(MODE1_EXERCISES), 'bahu', 'all').map((item) => item.id)).toContain('shoulder-roll');
expect(screen.getByRole('navigation')).toHaveTextContent('Pustaka');
expect(screen.getByRole('navigation')).toHaveTextContent('Sesi Bebas');
```

- [ ] **Step 2: Run focused tests and verify RED**

Run: `./node_modules/.bin/vitest run src/features/library src/App.test.tsx --pool=threads`

Expected: FAIL because library modules and five destinations do not exist.

- [ ] **Step 3: Implement filtering and library UI**

Render a search input, category chips, result count, cards with image/title/purpose/equipment, and a detail view containing the existing safety and video components. Use Indonesian accessible labels and a clear empty state.

- [ ] **Step 4: Replace bottom navigation**

Use exactly five items: Hari Ini, Pustaka, Sesi Bebas, Progres, Lainnya. Update CSS to `grid-template-columns: repeat(5, 1fr)` and retain 44-pixel targets at 320 pixels.

- [ ] **Step 5: Wire library destination in `App.tsx`**

Retain Mode 1 Today behavior; replace Program and Settings destinations with the new structure. `More` will receive its complete content in Task 8.

- [ ] **Step 6: Verify and commit**

Run:

```bash
./node_modules/.bin/vitest run src/features/library src/App.test.tsx --pool=threads
./node_modules/.bin/eslint src/features/library src/components/AppShell.tsx src/App.tsx
```

Then commit:

```bash
git add src/features/library src/components/AppShell.tsx src/App.tsx src/App.test.tsx src/app.css
git commit -m "feat: add searchable movement library"
```

---

### Task 4: Free Session Builder, Templates, and Runner Integration

**Files:**
- Create: `src/features/free-session/freeSession.ts`
- Create: `src/features/free-session/freeSession.test.ts`
- Create: `src/features/free-session/FreeSessionBuilder.tsx`
- Create: `src/features/free-session/FreeSessionBuilder.test.tsx`
- Modify: `src/session/SessionRunner.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Produces `validateFreeSession(name, items): Record<string, string>`.
- Produces `createFreePlan(template, date, programWeek): PlannedSession`.
- `FreeSessionBuilder` receives templates, `onSave`, `onDelete`, and `onStart` callbacks.
- Runner persists `source: 'free'` and optional `templateId` unchanged from active session to session log.

- [ ] **Step 1: Write failing domain and component tests**

Cover zero items, zero/negative targets, multiple target units, reorder, template save/delete, and starting a valid free session.

```ts
expect(validateFreeSession('', [])).toEqual({ items: 'Pilih minimal satu gerakan.' });
expect(createFreePlan(template, '2026-08-15', 1).items).toEqual(template.items);
```

- [ ] **Step 2: Run tests and verify RED**

Run: `./node_modules/.bin/vitest run src/features/free-session --pool=threads`

- [ ] **Step 3: Implement pure validation and plan creation**

Require 1–40 items, integer target values 1–999, exactly one target unit, and a trimmed name of 1–60 characters when saving a template. A one-off unsaved session receives the name `Sesi Bebas`.

- [ ] **Step 4: Implement mobile builder**

Provide add, remove, move up/down, target-unit select, target value, save template, load template, delete with confirmation, and start controls. Reuse the 22 local images as thumbnails.

- [ ] **Step 5: Integrate with active session and history**

Create active records with `source: 'free'`; make SessionRunner's completed log retain source and template ID. Program sessions explicitly use `source: 'program'`.

- [ ] **Step 6: Verify and commit**

Run focused and full tests, then:

```bash
git add src/features/free-session src/session/SessionRunner.tsx src/App.tsx
git commit -m "feat: add reusable free exercise sessions"
```

---

### Task 5: Body Journal and Transparent Weekly Evaluation

**Files:**
- Create: `src/features/journal/journal.ts`
- Create: `src/features/journal/journal.test.ts`
- Create: `src/features/journal/Journal.tsx`
- Create: `src/features/journal/Journal.test.tsx`
- Create: `src/features/progress/evaluation.ts`
- Create: `src/features/progress/evaluation.test.ts`
- Modify: `src/features/today/Today.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Produces `validateJournal(input): Record<string, string>`.
- Produces `evaluateWeek(sessions, journals, today): WeeklyEvaluation` with outcomes `maintain | advance | lighten | assess` and `reasons: string[]`.
- `Journal` receives entries, `onSave`, and `onBack`.

- [ ] **Step 1: Write failing validation and evaluation tests**

Cover every field boundary, 500-character note, update by date, and all four evaluation branches. `ordinary` breathlessness must always yield `assess`. Pain average ≥7 or worsening must yield `lighten`; at least 3 completed sessions with average energy/sleep ≥3 and no warnings yields `advance`; otherwise `maintain`.

- [ ] **Step 2: Run tests and verify RED**

Run: `./node_modules/.bin/vitest run src/features/journal src/features/progress/evaluation.test.ts --pool=threads`

- [ ] **Step 3: Implement pure rules**

Return human-readable Indonesian reasons containing the exact triggering facts, for example `Engap tercatat saat aktivitas biasa.` or `3 sesi selesai dalam 7 hari.`

- [ ] **Step 4: Implement journal UI and Today summary**

Render ranges/selects, breathlessness radios, note count, save status, and descending history. Add a Today card showing today's entry or a `Catat kondisi tubuh` action.

- [ ] **Step 5: Verify and commit**

Run focused/full tests and commit:

```bash
git add src/features/journal src/features/progress/evaluation.ts src/features/progress/evaluation.test.ts src/features/today/Today.tsx src/App.tsx
git commit -m "feat: add body journal and weekly guidance"
```

---

### Task 6: Statistics, Trends, and Local Achievements

**Files:**
- Create: `src/features/progress/stats.ts`
- Create: `src/features/progress/stats.test.ts`
- Modify: `src/features/progress/Progress.tsx`
- Modify: `src/App.tsx`
- Modify: `src/app.css`

**Interfaces:**
- Produces `buildProgressStats(sessions, journals, templates, today): ProgressStats`.
- `Progress` receives sessions, journals, and templates and derives accessible text summaries.

- [ ] **Step 1: Write failing aggregation tests**

Cover completed-only minutes, program/free counts, exercise-kind distribution, true calendar dates instead of count-based filling, 14/30-day journal averages, and five achievements.

```ts
expect(stats.sessionSources).toEqual({ program: 2, free: 1 });
expect(stats.achievements.map((item) => item.id)).toContain('first-session');
expect(stats.summary).toContain('3 sesi selesai');
```

- [ ] **Step 2: Run and verify RED**

Run: `./node_modules/.bin/vitest run src/features/progress/stats.test.ts --pool=threads`

- [ ] **Step 3: Implement deterministic aggregations**

Derive category counts from completed exercise IDs and `MODE1_EXERCISES`. Keep chart data and text summaries in the same return object.

- [ ] **Step 4: Redesign Progress UI**

Render stat cards, source split, category bars, date-correct consistency calendar, trend rows with values and words, achievements, and Task 5 evaluation. Render actionable empty states.

- [ ] **Step 5: Verify and commit**

Run focused/full tests, ESLint, and commit:

```bash
git add src/features/progress src/App.tsx src/app.css
git commit -m "feat: expand accessible progress insights"
```

---

### Task 7: Tahajjud Routine, Calendar Export, and Browser Notifications

**Files:**
- Create: `src/features/tahajjud/Tahajjud.tsx`
- Create: `src/features/tahajjud/Tahajjud.test.tsx`
- Create: `src/features/reminders/calendar.ts`
- Create: `src/features/reminders/calendar.test.ts`
- Create: `src/features/reminders/notifications.ts`
- Create: `src/features/reminders/notifications.test.ts`
- Create: `src/features/reminders/Reminders.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Produces `buildCalendar(settings, startDate, timeZone): string` and `downloadCalendar(content): void`.
- Produces `getNotificationCapability()`, `requestNotificationPermission()`, and `showTestNotification()` using injected browser APIs for tests.
- `Tahajjud` saves settings and one daily entry; `Reminders` exports `.ics` and manages explicit permission.

- [ ] **Step 1: Write failing calendar and notification tests**

Assert CRLF-delimited `VCALENDAR`, stable UIDs, escaped text, chosen weekdays, local start date/time, training/bed/wake events, and `VTIMEZONE`/timezone identifier. Cover notification unsupported, denied, granted, and test display.

- [ ] **Step 2: Write failing Tahajjud component tests**

Cover enabled state, bed/wake times, weekdays, mobility choice, five daily fields, 280-character note, and save callbacks.

- [ ] **Step 3: Implement pure calendar generation**

Use RFC 5545 escaping and line endings. Generate recurring weekly VEVENT entries without network calls. Use device timezone from `Intl.DateTimeFormat().resolvedOptions().timeZone`.

- [ ] **Step 4: Implement limited notifications**

Only request permission after a click. Show a test notification through the service worker registration when available, falling back to `new Notification`. Return Indonesian capability/status messages instead of throwing.

- [ ] **Step 5: Implement Tahajjud and reminder UI**

Explain that `.ics` works after importing into the HP calendar and that browser reminders may not fire when the PWA is closed. Provide exact download buttons for latihan, tidur, and tahajjud in one calendar.

- [ ] **Step 6: Verify and commit**

Run focused/full tests and commit:

```bash
git add src/features/tahajjud src/features/reminders src/App.tsx
git commit -m "feat: add tahajjud routine and local reminders"
```

---

### Task 8: More Hub, Settings, Help, and Integration

**Files:**
- Create: `src/features/more/More.tsx`
- Create: `src/features/help/Help.tsx`
- Modify: `src/features/settings/Settings.tsx`
- Modify: `src/features/settings/Settings.test.tsx`
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx`
- Modify: `src/app.css`
- Modify: `public/sw.js`
- Modify: `src/pwa.test.ts`

**Interfaces:**
- `More` routes locally among Jurnal, Tahajjud, Pengingat, Pengaturan, and Bantuan.
- Settings continues receiving immutable `AppSettings` and backup/reset callbacks.
- Service worker cache constant becomes `jagaraga-v3`.

- [ ] **Step 1: Write failing integration tests**

Cover five bottom destinations, every More destination, restored-count message after import, notification settings, help text for install/offline/update/data deletion, and service-worker cache v3.

- [ ] **Step 2: Run and verify RED**

Run: `./node_modules/.bin/vitest run src/App.test.tsx src/features/settings/Settings.test.tsx src/pwa.test.ts --pool=threads`

- [ ] **Step 3: Implement More hub and Help**

Use large labeled rows with descriptions. Help must include Android install steps, iPhone Add to Home Screen steps, refresh-after-deploy instructions, offline/video behavior, export advice, and emergency symptom copy.

- [ ] **Step 4: Expand Settings and import feedback**

Move reminder/tahajjud deep configuration to their dedicated screens while keeping enable summaries in Settings. Display exact restored counts returned by Task 2.

- [ ] **Step 5: Integrate App state and loading**

Load settings, sessions, journals, templates, active session, and tahajjud entries together. Refresh only affected collections after saves, keep existing data during recoverable errors, and expose retry copy.

- [ ] **Step 6: Bump PWA cache and complete mobile styling**

Set `const CACHE = 'jagaraga-v3'`. Add 320/390/520-pixel responsive rules, five-tab navigation, form error styles, accessible bars, cards, and reduced-motion-safe interactions.

- [ ] **Step 7: Verify and commit**

Run:

```bash
./node_modules/.bin/vitest run --pool=threads
./node_modules/.bin/eslint .
./node_modules/.bin/tsc -b
./node_modules/.bin/vite build
git diff --check
```

Then commit:

```bash
git add src public/sw.js
git commit -m "feat: complete the offline JagaRaga experience"
```

---

### Task 9: Documentation, Final Verification, and One-Deploy Archive

**Files:**
- Modify: `README.md`
- Create outside repository: `JagaRaga-Final-GitHub-ready.zip`

**Interfaces:**
- Consumes the complete verified source tree and Git history.
- Produces one clean archive for GitHub and Coolify.

- [ ] **Step 1: Update deployment and feature documentation**

Document the five tabs, local data model, calendar/browser reminder distinction, V1 backup migration, offline behavior, Docker port 8080, `/healthz`, and Cloudflare/Coolify redeploy instructions.

- [ ] **Step 2: Run fresh final verification**

Run:

```bash
git diff --check
./node_modules/.bin/vitest run --pool=threads
./node_modules/.bin/eslint .
./node_modules/.bin/tsc -b
./node_modules/.bin/vite build
```

Expected: zero whitespace/lint/type/build errors and all tests PASS.

- [ ] **Step 3: Commit documentation**

```bash
git add README.md
git commit -m "docs: describe the final offline feature package"
```

- [ ] **Step 4: Build and validate the final ZIP**

Use `git archive HEAD`, add a complete Git bundle, and exclude `.git`, `node_modules`, `dist`, TypeScript build metadata, and environment files. Run `unzip -t`, `git bundle verify`, count all 22 required movement PNG files, and calculate SHA-256.

- [ ] **Step 5: Make the final archive available**

Save `JagaRaga-Final-GitHub-ready.zip` as one persistent downloadable artifact and keep the feature branch/worktree for future fixes.
