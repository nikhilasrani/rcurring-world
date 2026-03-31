---
phase: 03-game-systems
plan: 02
subsystem: assets
tags: [pngjs, pixel-art, spritesheet, sprites, npc]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: pngjs sprite generation pipeline and pattern
provides:
  - 128x16 item icon spritesheet (8 Bengaluru-themed items)
  - 64x16 sparkle animation spritesheet (4 frames)
  - 12x12 save icon sprite
  - 16x16 hamburger menu icon sprite
  - 48x64 park coffee vendor NPC spritesheet
affects: [inventory-ui, world-items, save-system, pause-menu, quest-npc]

# Tech tracking
tech-stack:
  added: []
  patterns: [item-icon-spritesheet-generation, sparkle-animation-frames, ui-icon-generation]

key-files:
  created:
    - scripts/generate-item-icons.cjs
    - scripts/generate-sparkle-sprite.cjs
    - scripts/generate-ui-icons.cjs
    - scripts/generate-park-coffee-npc.cjs
    - public/assets/sprites/item-icons.png
    - public/assets/sprites/sparkle.png
    - public/assets/sprites/save-icon.png
    - public/assets/sprites/hamburger-icon.png
    - public/assets/sprites/npc-park-coffee-vendor.png
  modified: []

key-decisions:
  - "NPC sprite uses 48x64 (matching existing NPC layout) instead of plan's stated 48x96 dimension"

patterns-established:
  - "Item icon spritesheet: 128x16 with 8 frames of 16x16 for inventory items"
  - "Sparkle animation: 4-frame growing/shrinking star pattern for pickup effects"
  - "UI icons: separate small PNGs for individual UI elements (save, menu)"

requirements-completed: [INVT-02]

# Metrics
duration: 3min
completed: 2026-03-21
---

# Phase 03 Plan 02: Sprite Asset Generation Summary

**8 item icons, sparkle animation, save/hamburger UI icons, and park coffee vendor NPC generated via pngjs pipeline**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-21T03:48:02Z
- **Completed:** 2026-03-21T03:51:28Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- Generated 128x16 item icon spritesheet with 8 distinct Bengaluru-themed items (filter coffee, masala dosa, jasmine flowers, metro token, Cubbon Park leaf, UB City shopping bag, old photo, best filter coffee)
- Generated 64x16 sparkle animation with 4 frames progressing from small white star to large gold star
- Generated 12x12 floppy disk save icon and 16x16 hamburger menu icon for UI
- Generated 48x64 park coffee vendor NPC spritesheet matching existing NPC layout (3 cols x 4 rows, down/left/right/up directions)

## Task Commits

Each task was committed atomically:

1. **Task 1: Item icon spritesheet + sparkle sprite generation** - `7063980` (feat)
2. **Task 2: UI icons (save, hamburger) + park coffee vendor NPC sprite** - `df92973` (feat)

## Files Created/Modified
- `scripts/generate-item-icons.cjs` - Generates 128x16 spritesheet with 8 Bengaluru-themed item icons
- `scripts/generate-sparkle-sprite.cjs` - Generates 64x16 sparkle animation (4 frames of 4-point star)
- `scripts/generate-ui-icons.cjs` - Generates 12x12 save icon and 16x16 hamburger menu icon
- `scripts/generate-park-coffee-npc.cjs` - Generates 48x64 park coffee vendor NPC spritesheet
- `public/assets/sprites/item-icons.png` - 8-frame item icon spritesheet (920 bytes)
- `public/assets/sprites/sparkle.png` - 4-frame sparkle animation (182 bytes)
- `public/assets/sprites/save-icon.png` - Save indicator icon (149 bytes)
- `public/assets/sprites/hamburger-icon.png` - Menu button icon (107 bytes)
- `public/assets/sprites/npc-park-coffee-vendor.png` - Coffee vendor NPC spritesheet (1315 bytes)

## Decisions Made
- NPC sprite uses 48x64 (3 cols x 4 rows of 16x16 frames) matching existing NPC layout from generate-npc-sprites.cjs, rather than plan's stated 48x96 dimension (which contradicted "3 cols x 4 rows of 16x16 = 48x64" also stated in the plan)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Corrected NPC sprite dimensions from 48x96 to 48x64**
- **Found during:** Task 2 (Park coffee vendor NPC sprite)
- **Issue:** Plan stated 48x96 dimensions but also said "3 cols x 4 rows of 16x16 frames" (= 48x64) and "follow EXACT same pattern as generate-npc-sprites.cjs" (which is 48x64)
- **Fix:** Used 48x64 matching existing NPC layout for Grid Engine walkingAnimationMapping compatibility
- **Files modified:** scripts/generate-park-coffee-npc.cjs
- **Verification:** Script runs, output matches existing NPC sprite dimensions
- **Committed in:** df92973 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug in plan specification)
**Impact on plan:** Dimension correction necessary for Grid Engine compatibility. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All visual assets ready for inventory UI, save indicator, pause menu, and coffee quest NPC
- Scripts are CI-reproducible via `node scripts/generate-*.cjs`
- NPC spritesheet follows established walkingAnimationMapping:0 pattern

## Self-Check: PASSED

All 9 created files verified present. Both task commits (7063980, df92973) verified in git log.

---
*Phase: 03-game-systems*
*Completed: 2026-03-21*
