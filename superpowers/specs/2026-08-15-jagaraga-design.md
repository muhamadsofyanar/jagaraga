# JagaRaga — Design Specification

## 1. Product summary

JagaRaga is a private, mobile-first progressive web application (PWA) for completing the four-week “Mode 1 — Adaptasi Tubuh” exercise program. It is intended for one person who is returning to exercise after prolonged inactivity and mainly uses an HP.

The application supports the routine; it does not diagnose illness, replace medical care, or make individualized clinical decisions.

## 2. Goals

- Make the correct exercise for the current day immediately visible.
- Guide each session from warm-up through the main activity and cool-down.
- Show clear movement instructions with offline illustrations and legally embedded public videos.
- Record completion, walking duration, repetitions, perceived energy, soreness, breathlessness, and sleep.
- Work without an account or database and remain useful when offline.
- Help the user decide whether to progress, repeat a week, or stop and seek medical advice.

## 3. Non-goals for version 1

- User accounts, synchronization between devices, coaching, social features, or payments.
- Medical diagnosis, calorie counting, nutrition planning, wearable integration, or GPS tracking.
- Modes 2–4; version 1 contains Mode 1 and leaves a clear extension point for later modes.
- Hosting or redistributing third-party video files.

## 4. Audience and device assumptions

- Primary user: one Indonesian-speaking adult returning to exercise.
- Primary device: Android or iPhone in portrait orientation.
- The interface remains usable on wider screens but is designed and tested for phone widths first.
- Touch targets are at least 44 px, body text remains readable without zoom, and essential actions are reachable with one hand.

## 5. Identity and visual direction

- Product name: **JagaRaga**.
- Tone: calm, supportive, direct, and non-judgmental.
- Palette: natural green and warm cream.
- Dark mode follows the device preference automatically and can also be changed manually.
- The interface avoids crowded dashboard chrome. The first viewport focuses on today’s session and the primary action.

## 6. Information architecture

The application has four primary destinations in a bottom navigation bar:

1. **Hari Ini** — today’s session, current week, readiness check, and start/resume action.
2. **Program** — four-week calendar, weekly schedule, exercise library, and progression criteria.
3. **Progres** — completion history and simple trends.
4. **Pengaturan** — theme, video preference, export/import, reset, safety information, and installation help.

During an active workout, the bottom navigation is replaced by a focused session interface.

## 7. Mode 1 program

The weekly structure remains constant while volume progresses gradually.

| Day | Session |
| --- | --- |
| Monday | Mobility, warm-up, and walking |
| Tuesday | Mobility and strength A |
| Wednesday | Mobility, walking, and balance |
| Thursday | Active recovery, mobility, and relaxed breathing |
| Friday | Mobility and strength B |
| Saturday | Walking, beginner low-impact aerobics, stationary cycling, or safe easy swimming |
| Sunday | Active rest and weekly reflection |

### Weekly volume

| Week | Cardio target | Strength target |
| --- | --- | --- |
| 1 | 10–15 minutes | 1 set × 8 repetitions |
| 2 | 15–20 minutes | 1 set × 10–12 repetitions |
| 3 | 20–25 minutes | 2 sets × 8 repetitions |
| 4 | 25–30 minutes | 2 sets × 10–12 repetitions |

The user may repeat a week. Calendar dates advance normally, while the selected program week remains unchanged until the user explicitly advances it.

### Exercise library

Version 1 includes:

- Warm-up: marching in place, shoulder rolls, chest opening, standing cat–cow, gentle trunk rotation, hip circles, alternating knee raises, ankle circles, and shallow chair squats.
- Strength A: chair squat, wall push-up, glute bridge, bird-dog, and calf raise.
- Strength B: sit-to-stand, wall or supported incline push-up, hip hinge, resistance-band row or unloaded scapular row, simplified dead bug, and calf raise.
- Balance: supported single-leg stand, heel-to-toe walk, and controlled marching.
- Cool-down: slow walking, calf stretch, quadriceps stretch, chest stretch, and relaxed breathing.

Each exercise record contains a title, purpose, equipment, step-by-step instructions, breathing cue, repetitions or duration, beginner modification, common mistakes, stop condition, illustration asset, and optional approved video source.

## 8. Core user flows

### First launch

1. Introduce JagaRaga and state that progress stays on the device.
2. Show a concise safety notice and red-flag symptoms.
3. Ask for a preferred start date, normal exercise time, and whether online videos may load.
4. Set Week 1 and open Hari Ini.

No medical questionnaire is used to clear the user for exercise. The safety screen advises medical evaluation when ordinary walking already causes unusual breathlessness or when red-flag symptoms occur.

### Start a daily session

1. Hari Ini shows the session type, estimated duration, equipment, and readiness prompt.
2. The user chooses **Mulai latihan**.
3. A short readiness check asks about chest discomfort, severe or unusual breathlessness, faintness, acute illness, and significant new pain.
4. If no stop symptom is selected, the guided session opens.
5. Exercises appear one at a time with illustration, instructions, set/repetition target, timer where relevant, and previous/next controls.
6. The user can pause, skip, reduce the target, or end the session.
7. At completion, the user records energy, soreness, breathlessness, optional sleep duration, and an optional short note.

### Resume an interrupted session

The current exercise, set, timer state, and completed steps are saved locally. Returning to the application offers **Lanjutkan sesi** or **Akhiri sesi**. Timers use stored timestamps so backgrounding the application does not silently lose elapsed time.

### Weekly review

At the end of the week, JagaRaga summarizes completed sessions, total cardio minutes, recovery notes, and any repeated high-symptom entries. It recommends one of three non-clinical actions:

- continue to the next week when targets are comfortable and recovery is normal;
- repeat the week when sessions were missed or recovery was excessive;
- seek professional assessment before increasing intensity when warning patterns were recorded.

The user always confirms the decision.

## 9. Movement media

### Offline illustrations

- Every movement has a consistent two- or three-frame illustration: start, movement, and finish where needed.
- Illustrations are optimized for phone screens, include directional cues only when necessary, and do not contain essential instructions inside the image.
- Text instructions remain the authoritative guide.

### Public video

- Videos are streamed through the original provider’s official embed player when embedding is permitted.
- Preferred sources are Indonesian Ministry of Health channels, public health agencies, hospitals, and established medical institutions.
- JagaRaga stores only the source URL, provider, title, and last verification date. It never downloads, edits, or republishes third-party video files.
- Each video shows its source name and an **Buka sumber asli** action.
- If embedding is blocked, unavailable, offline, or removed, the illustration and text remain available and the application shows a non-blocking fallback.
- External video cookies and data usage are disclosed before the first load. Videos load only after consent; a privacy-enhanced embed is used where the provider supports it.

Initial candidates include official Kementerian Kesehatan low-impact aerobics and fitness videos, plus movement demonstrations from reputable medical institutions. Every source must be manually verified before release and may be replaced without changing the exercise definition.

## 10. Progress and data model

Local application state is versioned and contains:

- settings: start date, program week, preferred time, theme, video consent, and onboarding completion;
- session plan snapshots so a recorded session remains understandable after future program edits;
- session logs: date, planned session, completion status, completed exercises, repetitions, durations, skips, and notes;
- wellness entries: energy 1–5, soreness 0–10, breathlessness 0–10, and optional sleep hours;
- active-session recovery data;
- schema version and last backup time.

Browser storage is the source of truth. No personal exercise data is sent to a server in version 1. Analytics and advertising trackers are excluded.

### Backup and reset

- Export creates a human-readable, versioned JSON backup.
- Import validates file structure and asks before replacing local data.
- Reset requires an explicit confirmation phrase and explains that deletion cannot be undone unless an export exists.

## 11. Offline and PWA behavior

- The application shell, program content, illustrations, and saved progress work offline after the first successful visit.
- Public video does not work offline and displays an appropriate message.
- A manifest provides the JagaRaga name, icons, theme colors, portrait-friendly launch behavior, and standalone display mode.
- A service worker caches only application-owned assets. Third-party media is not cached or proxied.
- An install prompt is shown contextually after the user has completed onboarding, not immediately on first load.

## 12. Safety behavior

JagaRaga consistently distinguishes expected effort from warning symptoms.

- Expected: mild muscle soreness, warmth, temporarily faster breathing that settles after slowing down, and recovery within 24–48 hours.
- Stop and obtain urgent help: chest pain or pressure, severe breathlessness, fainting or near-fainting, cold sweat, or pain spreading to the arm, jaw, neck, or back.
- Reduce or stop the session: sharp joint pain, dizziness, worsening unusual breathlessness, or pain that changes movement mechanics.

Safety messages are visible but not alarmist. The application does not use scores to diagnose a condition. Emergency wording remains generic enough for the user’s location and directs them to local emergency services or the nearest emergency department.

## 13. Error and edge-case handling

- Storage unavailable or quota exceeded: preserve the current in-memory session, explain that progress may not persist, and offer export when possible.
- Corrupt import: reject it without changing existing data and identify the invalid section in plain language.
- Video unavailable: keep the session usable and offer the original source link.
- Service worker update: apply after the active session finishes or the user confirms reload.
- Device clock or date changes: retain completed logs and ask before moving the planned day.
- Accidental navigation: auto-save session progress and provide resume behavior.
- Duplicate completion: update the existing day’s log rather than silently creating conflicting records.

## 14. Accessibility

- Semantic controls, visible focus states, accessible names, and logical reading order.
- Color is never the only indicator of completion, warning, or intensity.
- Motion is minimal and respects reduced-motion preferences.
- Embedded videos expose captions when supplied by the original provider; source selection favors captioned material.
- Timer cues have text and optional vibration where browser support and permission allow.

## 15. Technical architecture

- A static client-side PWA suitable for container deployment through Coolify.
- Component boundaries: program catalog, session runner, timer, readiness check, video wrapper, progress summaries, local persistence, backup/import, and PWA lifecycle.
- Program content is separate from interface components so later modes can be added without rewriting the session runner.
- External video entries live in a replaceable, validated registry.
- The production container serves built static assets and supports SPA fallback routing.

Deployment target:

- source repository: GitHub;
- application host: Coolify;
- public hostname: `https://app.ruanglegalitas.com`;
- DNS is already pointed at the server through Cloudflare; TLS behavior will be verified during deployment.

## 16. Validation and testing

Automated checks cover:

- daily schedule and week-volume calculations;
- session state transitions and timer restoration;
- local data migration, export, import, and reset;
- weekly progression and repeated-week behavior;
- offline fallback and video-unavailable states;
- duplicate logs and device-date changes.

Manual verification covers:

- representative small and large phone viewports;
- touch targets, portrait scrolling, keyboard focus, screen-reader labels, reduced motion, light mode, and dark mode;
- first launch, installability, offline relaunch, interrupted-session resume, and application update behavior;
- each external video’s source, embed permission, playback, caption availability, and fallback link;
- Coolify health, Cloudflare/TLS behavior, and the final production hostname.

## 17. Acceptance criteria

Version 1 is ready when the user can:

1. Install JagaRaga from `app.ruanglegalitas.com` on an HP.
2. Complete onboarding without creating an account.
3. See the correct Mode 1 session and target for the selected program week.
4. Complete a guided session with illustrations, timers, and optional legal public video.
5. Pause, leave, return, and resume without losing completed steps.
6. Record and review four weeks of progress locally.
7. Export, validate, import, and reset progress safely.
8. Use every essential feature offline except third-party video.
9. Receive clear safety guidance without the application claiming to diagnose or medically clear exercise.

