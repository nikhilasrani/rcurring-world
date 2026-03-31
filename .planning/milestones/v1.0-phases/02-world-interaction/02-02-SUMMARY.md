---
phase: 02-world-interaction
plan: 02
subsystem: assets
tags: [pngjs, canvas, tiled-json, spritesheet, tileset, tilemap, pixel-art]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: "Sprite generation pattern (pngjs), tileset generation pattern (canvas), tilemap generation pattern"
provides:
  - "5 NPC spritesheets (48x96 PNG, Grid Engine walkingAnimationMapping layout)"
  - "Interior tileset (128x128 PNG, 64 tiles for floors/walls/furniture/decorative)"
  - "4 interior tilemaps (Tiled JSON with ground/buildings/collision/spawn-points/zones/doors)"
  - "generate-npc-sprites.cjs script for CI-reproducible NPC assets"
  - "generate-interior-tileset.cjs script for CI-reproducible interior tileset"
  - "generate-interior-tilemaps.js script for CI-reproducible interior maps"
affects: [02-world-interaction, 03-game-loop]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "NPC spritesheet generation via pngjs with per-NPC color palettes"
    - "Interior tileset generation via canvas (8x8 grid of 16x16 tiles)"
    - "Interior tilemap with 7 layers matching outdoor convention plus doors layer"

key-files:
  created:
    - scripts/generate-npc-sprites.cjs
    - scripts/generate-interior-tileset.cjs
    - scripts/generate-interior-tilemaps.js
    - public/assets/sprites/npc-chai-walla.png
    - public/assets/sprites/npc-auto-driver.png
    - public/assets/sprites/npc-jogger.png
    - public/assets/sprites/npc-shopkeeper.png
    - public/assets/sprites/npc-guard.png
    - public/assets/tilesets/interior.png
    - public/assets/tilemaps/interior-metro.json
    - public/assets/tilemaps/interior-coffee.json
    - public/assets/tilemaps/interior-ubcity.json
    - public/assets/tilemaps/interior-library.json
  modified:
    - scripts/extrude-tilesets.sh
    - package.json

key-decisions:
  - "Interior tileset uses canvas (like outdoor tilesets) while NPC sprites use pngjs (like player sprites)"
  - "Interior tilemaps include doors object layer for scene transitions with returnZone/returnX/returnY properties"
  - "Collision handled via both tile layer (collision) and ge_collide tile properties on furniture/shelf tiles"

patterns-established:
  - "Interior tilemaps follow same 7-layer structure as outdoor map plus doors layer for transitions"
  - "NPC sprites follow identical layout to player sprites (48x96, 3x4 grid, walkingAnimationMapping rows)"

requirements-completed: [NPC-01, EXPL-02]

# Metrics
duration: 6min
completed: 2026-03-20
---

# Phase 02 Plan 02: Asset Generation Summary

**5 NPC spritesheets with distinct Bengaluru character palettes, interior tileset with 64 tiles, and 4 interior tilemaps for metro/coffee/mall/library**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-20T09:26:45Z
- **Completed:** 2026-03-20T09:33:30Z
- **Tasks:** 2
- **Files modified:** 15

## Accomplishments
- 5 NPC spritesheets generated at 48x96 with distinct visual features (cap, towel, stripe, belt, kurta)
- Interior tileset with 64 tiles covering floors, walls, furniture, shelves, doors, decorative items, and collision markers
- 4 interior tilemaps with correct dimensions, full layer structure, spawn points, exit doors, and zone rectangles
- All 3 generation scripts are idempotent and CI-reproducible

## Task Commits

Each task was committed atomically:

1. **Task 1: Generate NPC spritesheets via pngjs script** - `7fca4d6` (feat)
2. **Task 2: Generate interior tileset and 4 interior tilemaps** - `2af62a1` (feat)

**Plan metadata:** pending (docs: complete plan)

## Files Created/Modified
- `scripts/generate-npc-sprites.cjs` - Generates 5 NPC spritesheets using pngjs with per-NPC palettes
- `scripts/generate-interior-tileset.cjs` - Generates 128x128 interior tileset using canvas with 64 tiles
- `scripts/generate-interior-tilemaps.js` - Generates 4 Tiled JSON tilemaps for building interiors
- `scripts/extrude-tilesets.sh` - Updated to include interior tileset extrusion
- `package.json` - Added generate:npc-sprites npm script
- `public/assets/sprites/npc-*.png` - 5 NPC spritesheet PNGs (48x96 each)
- `public/assets/tilesets/interior.png` - Interior tileset (128x128)
- `public/assets/tilemaps/interior-*.json` - 4 interior tilemap JSONs

## Decisions Made
- Interior tileset uses canvas (matching outdoor tileset pattern) while NPC sprites use pngjs (matching player sprite pattern) for consistency with Phase 1 conventions
- Interior tilemaps include a `doors` object layer with `returnZone`, `returnX`, `returnY` properties to enable scene transitions back to the outdoor map
- Collision is handled via both a dedicated collision tile layer AND ge_collide tile properties on furniture/shelf tiles (tiles 17-31 and 49-56) for defense in depth
- Interior tileset written directly to output dir (not through raw-tilesets) since it has no source separate from the generation script

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- NPC sprites ready for loading in BootScene and rendering in WorldScene
- Interior tilemaps ready for interior scene transitions
- All assets follow established naming conventions matching ASSETS constants pattern
- Interior tileset extrusion integrated into existing pipeline

## Self-Check: PASSED

All 13 created files verified present. Both task commits (7fca4d6, 2af62a1) verified in git log.

---
*Phase: 02-world-interaction*
*Completed: 2026-03-20*
