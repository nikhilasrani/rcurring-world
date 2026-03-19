---
phase: 01-foundation-and-movement
plan: 02
subsystem: ui
tags: [phaser, spritesheet, pixel-art, rex-inputtext, scene-management, gba-style]

# Dependency graph
requires:
  - phase: 01-01
    provides: "Project scaffold, Phaser config, constants, types, directory structure"
provides:
  - "BootScene with asset loading and progress bar"
  - "TitleScene with pixel art Bengaluru skyline and press-start prompt"
  - "NameEntryScene with HTML text input (mobile keyboard) and gender sprite selection"
  - "Male and female player spritesheets (48x96px, 12 frames each, Grid Engine layout)"
  - "Title background art (480x320 night Bengaluru skyline)"
  - "Scene chain: Boot -> Title -> NameEntry -> World with PlayerState"
affects: [01-03, 01-04, 01-05]

# Tech tracking
tech-stack:
  added: [phaser3-rex-plugins/inputtext-plugin]
  patterns: [scene-chaining, asset-loading-with-progress, programmatic-sprite-generation]

key-files:
  created:
    - src/scenes/BootScene.ts
    - src/scenes/TitleScene.ts
    - src/scenes/NameEntryScene.ts
    - public/assets/sprites/player-male.png
    - public/assets/sprites/player-female.png
    - public/assets/ui/title-bg.png
    - scripts/generate-sprites.cjs
    - scripts/generate-title-bg.cjs
  modified:
    - src/config.ts

key-decisions:
  - "Rex InputText used as global plugin for cleaner scene API"
  - "Sprites generated programmatically via pngjs for reproducibility"
  - "Graceful asset load errors in BootScene (missing tilesets expected until plan 03)"

patterns-established:
  - "Scene chaining via SCENES constants for type-safe transitions"
  - "Programmatic pixel art generation scripts in scripts/ directory"
  - "Rex global plugin registration in config.ts plugins.global array"

requirements-completed: [MOVE-02]

# Metrics
duration: 6min
completed: 2026-03-19
---

# Phase 01 Plan 02: Opening Sequence and Player Sprites Summary

**Three-scene opening sequence (Boot/Title/NameEntry) with GBA-style Bengaluru skyline, Rex InputText name entry, gender selection, and 12-frame chibi player spritesheets for both genders**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-19T20:03:51Z
- **Completed:** 2026-03-19T20:10:14Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- Two complete player spritesheets (male/female) with 4-direction walk animations matching Grid Engine walkingAnimationMapping convention
- BootScene loads all game assets with a visual progress bar, gracefully handles missing tilemap assets
- TitleScene displays pixel art Bengaluru night skyline with Vidhana Soudha dome, Chinnaswamy Stadium, lit windows, and blinking "PRESS START" prompt
- NameEntryScene captures player name via Rex InputText (triggers mobile keyboard) and gender via interactive sprite selection with arrow key and tap support
- Complete scene chain: Boot -> Title -> NameEntry -> World, passing PlayerState through registry and scene data

## Task Commits

Each task was committed atomically:

1. **Task 1: Create player spritesheets** - `9209b4f` (feat)
2. **Task 2: Create BootScene, TitleScene, NameEntryScene with scene chaining** - `a1eb566` (feat)

**Plan metadata:** `6b8a5ff` (docs: complete plan)

## Files Created/Modified
- `src/scenes/BootScene.ts` - Asset loading with progress bar, chains to TitleScene
- `src/scenes/TitleScene.ts` - Title screen with Bengaluru skyline, game title, blinking press-start
- `src/scenes/NameEntryScene.ts` - Name entry via Rex InputText + gender selection with sprites
- `src/config.ts` - Updated with three scenes and Rex InputTextPlugin global plugin
- `public/assets/sprites/player-male.png` - Male chibi spritesheet (48x96, 12 frames)
- `public/assets/sprites/player-female.png` - Female chibi spritesheet (48x96, 12 frames)
- `public/assets/ui/title-bg.png` - Pixel art night Bengaluru skyline (480x320)
- `scripts/generate-sprites.cjs` - Programmatic sprite generation using pngjs
- `scripts/generate-title-bg.cjs` - Programmatic title background generation

## Decisions Made
- Used Rex InputText as a global plugin (`plugins.global`) rather than per-scene instantiation for cleaner API access across scenes
- Generated sprites and title background programmatically using pngjs (available via tile-extruder dependency) for reproducibility and easy iteration
- BootScene gracefully handles missing tilemap/tileset assets (logs warning, continues) since those are created in plan 03
- InputText constructed directly via `new InputText(scene, ...)` rather than `this.add.rexInputText()` factory to avoid TypeScript issues with plugin augmentation

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed unused GAME_HEIGHT import in NameEntryScene**
- **Found during:** Task 2 (TypeScript compilation)
- **Issue:** `GAME_HEIGHT` was imported but never used, causing `noUnusedLocals` error
- **Fix:** Removed the unused import
- **Files modified:** src/scenes/NameEntryScene.ts
- **Verification:** `npx tsc --noEmit` passes cleanly
- **Committed in:** a1eb566 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Trivial unused import cleanup. No scope creep.

## Issues Encountered
None - both tasks executed smoothly.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Player spritesheets ready for Grid Engine walkingAnimationMapping in WorldScene (plan 04)
- Scene chain complete up to WorldScene transition point
- BootScene already attempts to load tilemap/tileset assets that plan 03 will create
- PlayerState is passed to WorldScene via both registry and scene data for plan 04 to consume

## Self-Check: PASSED

All 9 created files verified present. Both task commits (9209b4f, a1eb566) verified in git log.

---
*Phase: 01-foundation-and-movement*
*Completed: 2026-03-19*
