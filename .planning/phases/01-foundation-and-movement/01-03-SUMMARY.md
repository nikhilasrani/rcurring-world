---
phase: 01-foundation-and-movement
plan: 03
subsystem: assets
tags: [pixel-art, tilesets, tilemap, tiled, tile-extruder, canvas, bengaluru]

# Dependency graph
requires:
  - phase: 01-01
    provides: Project scaffold with constants (TILE_SIZE, LAYERS, ASSETS keys)
provides:
  - Four extruded GBA-quality tilesets (ground, buildings, nature, decorations)
  - 60x60 Tiled JSON tilemap for MG Road / CBD with all 7 layers
  - Zone metadata JSON with spawn point and 5 landmark definitions
  - Tileset extrusion pipeline (generate + extrude scripts)
  - Elevation tiles: stairs, elevated paths, overpass structures
affects: [01-04, 01-05, 02-world-interaction]

# Tech tracking
tech-stack:
  added: [canvas (dev dep for tileset generation)]
  patterns: [programmatic tileset generation, tile-extruder pipeline, Tiled JSON format generation]

key-files:
  created:
    - raw-tilesets/ground.png
    - raw-tilesets/buildings.png
    - raw-tilesets/nature.png
    - raw-tilesets/decorations.png
    - public/assets/tilesets/ground.png
    - public/assets/tilesets/buildings.png
    - public/assets/tilesets/nature.png
    - public/assets/tilesets/decorations.png
    - public/assets/tilemaps/mg-road.json
    - src/data/zones/mg-road.json
    - scripts/generate-tilesets.js
    - scripts/generate-tilemap.js
    - scripts/extrude-tilesets.sh
  modified:
    - package.json
    - package-lock.json

key-decisions:
  - "Programmatic tileset generation via Node.js canvas instead of manual image editing"
  - "Strict GBA-inspired color palette with hard pixel edges and no anti-aliasing"
  - "Collision managed via dedicated collision layer with ge_collide tile property"
  - "Tilemap generated programmatically via reusable script for iterative map development"

patterns-established:
  - "Asset pipeline: raw-tilesets/ -> tile-extruder -> public/assets/tilesets/"
  - "Tilemap generation: scripts/generate-tilemap.js -> public/assets/tilemaps/"
  - "Zone metadata: src/data/zones/{zone}.json with spawn and landmark definitions"

requirements-completed: [EXPL-01]

# Metrics
duration: 10min
completed: 2026-03-19
---

# Phase 01 Plan 03: Tilesets, Tilemap, and Zone Metadata Summary

**GBA-quality pixel art tilesets (144 tiles) and 60x60 Tiled tilemap of MG Road/CBD with elevation transitions, collision data, and 5 landmark zones**

## Performance

- **Duration:** 10 min
- **Started:** 2026-03-19T20:03:48Z
- **Completed:** 2026-03-19T20:13:39Z
- **Tasks:** 2
- **Files modified:** 15

## Accomplishments
- Generated 4 raw tilesets programmatically (144 tiles total) with GBA-inspired palette and Bengaluru-specific landmark tiles
- Extruded all tilesets with tile-extruder (1px margin, 2px spacing) to prevent tile bleeding
- Created 60x60 Tiled JSON tilemap with faithful MG Road/CBD geography and all 7 required layers
- Implemented elevation transitions: stairs at metro exit, terraced Cubbon Park area, overpass near Chinnaswamy
- Dense Bengaluru decorations: auto-rickshaws, fruit carts, sugarcane stalls, BMTC bus stops, lampposts, metro pillars
- Zone metadata with player spawn at Metro station exit (45,35) and 5 landmark definitions

## Task Commits

Each task was committed atomically:

1. **Task 1: Create GBA-quality pixel art tilesets with elevation tiles and extrusion pipeline** - `6866a1e` (feat)
2. **Task 2: Create Tiled-format JSON tilemap with elevation transitions and zone metadata** - `740076a` (feat, bundled with 01-02 docs commit due to parallel execution)

**Plan metadata:** `f3d33d6` (docs: complete plan)

## Files Created/Modified
- `scripts/generate-tilesets.js` - Node.js script that draws 144 pixel art tiles across 4 tilesets using canvas
- `scripts/extrude-tilesets.sh` - Shell script to re-extrude all tilesets (rerunnable on tileset updates)
- `scripts/generate-tilemap.js` - Node.js script that builds valid Tiled JSON with 7 layers and zone data
- `raw-tilesets/*.png` - Pre-extrusion source tilesets (ground 32, buildings 48, nature 32, decorations 32 tiles)
- `public/assets/tilesets/*.png` - Extruded tilesets ready for Phaser loading (margin:1, spacing:2)
- `public/assets/tilemaps/mg-road.json` - 60x60 Tiled JSON tilemap with collision, spawn, and zone layers
- `src/data/zones/mg-road.json` - Zone metadata: spawn point, 5 landmarks with positions and sizes

## Decisions Made
- **Programmatic tileset generation:** Used Node.js canvas package to draw tiles pixel-by-pixel rather than relying on external image editing tools. Enables CI-reproducible asset generation and iterative refinement.
- **Strict palette enforcement:** All tiles use a hand-picked GBA-inspired limited palette (~60 colors). No gradients, no anti-aliasing, hard pixel edges.
- **Collision via dedicated layer:** Used a separate collision tile layer (invisible) with ge_collide property on marker tiles rather than marking individual building tiles. Grid Engine reads this layer for walkability.
- **Geographic faithfulness:** Map layout follows real MG Road/CBD geography: Vidhana Soudha NW, Cubbon Park W, MG Road E-W through center, Chinnaswamy SW, Metro station E. Kasturba Road and St. Marks Road as N-S arteries.
- **Elevation implementation:** Stairs, elevated paths, and overpass surfaces use distinct tile variants on appropriate layers (ground for surfaces, buildings for railings/pillars, above-player for overpass deck).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Task 2 files committed in parallel 01-02 plan's docs commit**
- **Found during:** Task 2 commit
- **Issue:** Task 2 files (tilemap, zone metadata, generation script) were picked up by the parallel 01-02 plan's final docs commit (740076a) due to concurrent execution
- **Fix:** Accepted as-is -- files are correctly committed and verified. Documented in summary.
- **Files affected:** public/assets/tilemaps/mg-road.json, scripts/generate-tilemap.js, src/data/zones/mg-road.json
- **Verification:** All acceptance criteria verified passing

---

**Total deviations:** 1 auto-fixed (1 blocking - parallel execution artifact)
**Impact on plan:** No scope creep. All deliverables present and verified.

## Issues Encountered
- canvas npm package required installation for programmatic tileset generation (expected, handled as dev dependency)
- Task 2 files were committed by parallel 01-02 execution's final commit rather than in a standalone Task 2 commit

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All 4 extruded tilesets ready for Phaser tilemap loading with margin:1, spacing:2
- Tilemap JSON can be loaded with `this.load.tilemapTiledJSON('tilemap-mg-road', 'assets/tilemaps/mg-road.json')`
- Zone metadata provides spawn point and landmark data for WorldScene initialization
- Elevation features (stairs, overpass, terraced park) provide visual depth per CONTEXT.md decisions
- Ready for Plan 01-04 (WorldScene + Grid Engine integration) and 01-05 (touch controls, camera)

## Self-Check: PASSED

All 13 created files verified present on disk. Both commit hashes (6866a1e, 740076a) verified in git log.

---
*Phase: 01-foundation-and-movement*
*Completed: 2026-03-19*
