# JagaRaga 60 Movements Expansion Design

**Date:** 2026-08-15  
**Status:** Approved by user
**Product boundary:** Expand the existing Mode 1 application without adding a new training mode, account system, backend, analytics, or large gym equipment.

## Objective

Expand JagaRaga from 22 to exactly 60 movements, enrich every movement with layered benefit and safety information, and allow a user to replace a Mode 1 movement with any movement in the same category. Complete and verify all ten phases before one GitHub/Coolify redeploy.

## Confirmed Product Decisions

- The existing Mode 1 program is enriched rather than replaced.
- The catalog target is exactly 60 movements, adding 38 new movements.
- Before training, users may choose freely from the full matching category.
- More difficult choices remain visible but require clear warnings and confirmation.
- Equipment includes bodyweight, chair, wall, mat, water bottles, resistance bands, and light dumbbells. Large gym machines, barbells, and cable stations are excluded.
- Every movement has an offline male illustration. A legal official video is optional and appears only where an appropriate source exists.
- Benefit explanations are layered: concise on cards and detailed on the movement page.
- The implementation is data-driven and modular.
- All phases are released together in one final redeploy.

## Ten-Phase Roadmap

1. **Catalog foundation:** introduce normalized metadata, validation, and migration-safe types.
2. **Sixty-movement content:** add 38 movements across all agreed categories.
3. **Male offline illustrations:** provide and validate a consistent local image for every movement.
4. **Official video registry:** research and register suitable legal public sources without making video mandatory.
5. **Layered benefits:** add card summaries and full anatomical, functional, training, and safety explanations.
6. **Advanced movement library:** search and filter by category, body area, position, equipment, level, goal, and video availability.
7. **Mode 1 substitutions:** let the user configure each session by replacing an item with another item from the same category.
8. **Difficulty and equipment guardrails:** label all options and require confirmation for harder or equipment-dependent choices.
9. **Preference, history, and backup:** store actual substitutions and optional defaults, include them in statistics, and migrate backup data to schema v3.
10. **Integration and single release:** verify mobile/offline behavior, optimize images, update documentation, create a tested archive, and redeploy once.

## Catalog Composition

The target distribution is:

| Group | Target |
| --- | ---: |
| Warm-up and mobility | 12 |
| Low-impact cardio | 8 |
| Lower-body strength | 10 |
| Upper-body strength | 10 |
| Core and posture | 8 |
| Balance | 6 |
| Cool-down and recovery | 6 |
| **Total** | **60** |

The final catalog must match these group counts. Any proposed redistribution requires a later specification change rather than an implicit implementation adjustment.

## Movement Data Model

Each movement record has one stable ID and the following information:

- Indonesian title and optional common alternate name.
- Primary category and catalog group.
- Body regions and movement patterns.
- Difficulty: `light`, `moderate`, or `higher`.
- Positions: standing, seated, floor, or supine/prone as applicable.
- Equipment from the approved equipment vocabulary.
- Short purpose and benefit summary for cards.
- Detailed benefits separated into muscles, joints/mobility, daily function, and fitness relevance.
- Primary and supporting muscles, described conservatively.
- Steps, breathing cue, dosage, rest, and target-unit defaults.
- Beginner regression and harder progression.
- Common mistakes and stop conditions.
- Local illustration path and optional official video registry ID.
- Explicit compatible-substitution relationships where category matching alone is insufficient.

Content must not claim to diagnose, cure, unblock organs, or provide guaranteed outcomes. Traditional concepts may be presented only as clearly labeled wellness context and must not replace anatomical explanations or safety guidance.

## Substitution Rules

1. Before the readiness check, the user sees an “Atur sesi hari ini” screen.
2. The default Mode 1 plan remains usable with no configuration.
3. Opening an item shows all catalog movements in the same primary category.
4. Results rank light and equipment-compatible movements first; no valid same-category item is hidden.
5. Moderate, higher, resistance-band, and dumbbell movements have visible labels.
6. Choosing a higher-level movement requires a confirmation explaining the level and equipment.
7. Target normalization prevents a replacement from silently multiplying session load. Defaults use the selected movement's dosage and the active Mode 1 week, capped by conservative Mode 1 limits.
8. A substitution applies to the current session by default.
9. The user may explicitly save it as the preferred replacement for the same original movement.
10. Session history stores both the original plan item and the performed movement, target, difficulty, and equipment context.

## User Experience

### Movement cards

Cards show the illustration, title, short benefit, category, difficulty, equipment, and body area. Labels must remain readable at 320 pixels and must not rely on color alone.

### Movement details

The detail page contains collapsible sections for technique, benefits, muscles and joints, daily function, dosage and rest, breathing, easier and harder versions, common mistakes, stop conditions, substitutes, and official video. The illustration remains visible offline.

### Session configuration

The pre-session screen shows the complete ordered plan, estimated time, required equipment, and a change action for every item. Replacements update the estimate and equipment summary immediately. The readiness check and existing runner remain the final gates before exercise begins.

## Persistence and Migration

- IndexedDB receives a new version for catalog preferences and performed-item metadata.
- Existing settings, program sessions, free sessions, journals, and tahajjud data remain intact.
- Backup schema v3 includes preferred substitutions and performed movement metadata.
- Schema v1 and v2 backups import through in-memory validation and migration before any write transaction starts.
- Invalid imports do not clear existing data.
- Reset continues clearing every local JagaRaga collection only after explicit confirmation.

## Media and Legal Source Policy

- Every one of the 60 movements requires a local male illustration with consistent style, conservative anatomy, no embedded text, and no watermark.
- Official video sources are accepted from health ministries, public-health agencies, hospitals, universities, recognized sports bodies, or the rights holder's official channel.
- Embeds use the existing consent-gated privacy-enhanced player and are not cached.
- Absence of an appropriate video never blocks a movement; the local illustration and written instructions are the primary guide.
- Source title, provider, original URL, and review date are recorded for each registered video.

## Validation and Error Handling

- Build-time catalog validation rejects duplicate IDs, unknown categories, invalid target units, missing benefit sections, unknown equipment, missing images, broken substitution references, and unsafe empty stop guidance.
- Image failures show a named fallback rather than a blank area.
- Unsupported or offline video states retain the written and illustrated guide.
- Interrupted session configuration persists locally and can be resumed or reset.
- Database and backup migrations are atomic.
- Recoverable persistence errors preserve loaded data and expose retry actions.

## Testing and Acceptance Criteria

The release is accepted only when:

- The catalog contains exactly 60 unique, schema-valid movements.
- All 60 referenced illustration files exist in the production archive.
- Every movement has short and detailed benefits, steps, dosage, breathing, regression, progression, mistakes, and stop conditions.
- Search and every filter dimension work alone and in combination.
- Same-category substitution, harder-choice confirmation, equipment labeling, target normalization, preference saving, and history recording are covered by tests.
- Backup v1, v2, and v3 migration tests pass without destructive partial writes.
- Core flows remain usable offline; external video domains never enter the service-worker cache.
- Layout and touch targets work at 320, 390, and 520 pixels with reduced-motion behavior preserved.
- Full Vitest, ESLint, TypeScript, Vite build, Docker build, and `/healthz` verification succeed.
- One clean GitHub/Coolify archive is produced only after all ten phases pass.

## Out of Scope

- A Mode 2 or other new training mode.
- Accounts, cloud sync, multi-user administration, coaches, subscriptions, analytics, or remote databases.
- User-authored exercise instructions.
- Large gym machines, barbells, cable stations, or maximal-strength programming.
- Medical diagnosis, treatment prescriptions, or guaranteed organ-health claims.
