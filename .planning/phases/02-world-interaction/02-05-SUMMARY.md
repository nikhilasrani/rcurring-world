---
phase: 02-world-interaction
plan: 05
subsystem: integration
tags: [phaser, grid-engine, npc, dialogue, zone-detection, building-transitions, interaction, tilemap]

# Dependency graph
requires:
  - phase: 02-01
    provides: "Type definitions, constants, event names, JSON data files for NPCs/signs/interiors/zones"
  - phase: 02-02
    provides: "Interior tileset, interior tilemaps, NPC spritesheets"
  - phase: 02-03
    provides: "NPCManager, InteractionSystem, DialogBox, InteractionPrompt"
  - phase: 02-04
    provides: "ZoneManager, ZoneBanner, TransitionManager"
provides:
  - "Fully integrated WorldScene with NPC spawning, interaction handling, zone detection, and building transitions"
  - "UIScene with DialogBox and ZoneBanner event listeners"
  - "BootScene loading all Phase 2 assets (NPC sprites, interior tilesets/tilemaps)"
  - "NPC content verification tests (Kannada phrases, page counts)"
  - "E2E tests for NPCs, zone banners, and building transitions"
  - "Corrected door positions matching actual tilemap tiles with collision"
  - "Library building added to Cubbon Park in the tilemap"
affects: [phase-03]

# Tech tracking
tech-stack:
  added: []
  patterns: [scene-restart-data-pattern, interior-outdoor-mode-branching, interaction-priority-npc-sign-door]

key-files:
  created:
    - tests/unit/npc-dialogue-content.test.ts
    - tests/e2e/dialogue.spec.ts
    - tests/e2e/building-transition.spec.ts
    - tests/e2e/zone-banner.spec.ts
  modified:
    - src/scenes/WorldScene.ts
    - src/scenes/UIScene.ts
    - src/scenes/BootScene.ts
    - src/data/interiors/metro-station.json
    - src/data/interiors/coffee-shop.json
    - src/data/interiors/ub-city-mall.json
    - src/data/interiors/cubbon-library.json
    - scripts/generate-tilemap.js
    - public/assets/tilemaps/mg-road.json

key-decisions:
  - "Import JSON data directly via ES modules in WorldScene instead of Phaser JSON loader for Vite compatibility"
  - "InteractionSystem priority: NPC > Sign > Door -- NPC always wins if on same tile"
  - "Interior mode uses scene restart with mode data object, not separate scene class"
  - "Metro door at (44,33) to avoid sign conflict at (45,33) where metro sign has higher interaction priority"
  - "Library placed at x=13-16, y=16-17 in Cubbon Park, south of horizontal path, north of pond"

patterns-established:
  - "Scene restart data pattern: init() checks data.mode for interior/outdoor branching"
  - "Door interaction requires collision tile: player faces door from adjacent walkable tile"
  - "Interior camera centers on small rooms (stopFollow + centerOn) vs follow for large interiors"

requirements-completed: [NPC-01, NPC-02, NPC-03, NPC-04, NPC-05, NPC-06, SIGN-01, SIGN-02, EXPL-02, EXPL-03, EXPL-04]

# Metrics
duration: 15min
completed: 2026-03-20
---

# Phase 02 Plan 05: Scene Integration Summary

**Wired NPCManager, InteractionSystem, ZoneManager, and TransitionManager into WorldScene with corrected door positions matching tilemap collision tiles and a new library building in Cubbon Park**

## Performance

- **Duration:** 15 min
- **Started:** 2026-03-20T10:15:00Z
- **Completed:** 2026-03-20T10:30:00Z
- **Tasks:** 3
- **Files modified:** 13

## Accomplishments
- All Phase 2 systems integrated: 5 NPCs spawn and can be talked to, 6 signs readable, 4 building interiors accessible via door interaction with fade transitions, zone banners on area entry
- Fixed all 4 interior JSON doorPositions to match actual tilemap door/entrance tile coordinates with collision
- Added library building (4x2) in Cubbon Park so all 4 interiors have valid door tiles
- Added collision to all door tiles ensuring player is blocked and faces doors from adjacent walkable tiles
- NPC content verification test confirms Kannada phrases in all 5 NPC dialogues
- E2E tests verify NPC spawning, interior tilemap loading, and UI element existence

## Task Commits

Each task was committed atomically:

1. **Task 1: Wire all Phase 2 systems into WorldScene, UIScene, and BootScene** - `93dbfad` (feat)
2. **Task 2: Create E2E tests and NPC content verification test** - `ab2c662` (test)
3. **Task 3: Fix door positions, add collision, add library building** - `2f56bec` (fix)

## Files Created/Modified
- `src/scenes/WorldScene.ts` - Integrated with NPCManager, InteractionSystem, ZoneManager, TransitionManager; handles interior/outdoor mode
- `src/scenes/UIScene.ts` - Hosts DialogBox and ZoneBanner, listens for NPC_INTERACT/SIGN_INTERACT/ZONE_ENTER events
- `src/scenes/BootScene.ts` - Loads NPC spritesheets, interior tileset, and 4 interior tilemaps
- `src/data/interiors/metro-station.json` - doorPosition corrected to (44,33), returnPosition to (44,34)
- `src/data/interiors/coffee-shop.json` - doorPosition corrected to (40,36), returnPosition to (40,37)
- `src/data/interiors/ub-city-mall.json` - doorPosition corrected to (27,41), returnPosition to (27,42)
- `src/data/interiors/cubbon-library.json` - doorPosition corrected to (15,17), returnPosition to (15,18)
- `scripts/generate-tilemap.js` - Added library building, door collision, fixed lamppost overwriting metro sign
- `public/assets/tilemaps/mg-road.json` - Regenerated with all fixes
- `tests/unit/npc-dialogue-content.test.ts` - Verifies 5 NPCs have Kannada phrases, 2-4 pages, unique IDs
- `tests/e2e/dialogue.spec.ts` - Verifies NPCs spawned in Grid Engine
- `tests/e2e/building-transition.spec.ts` - Verifies interior tilemaps loaded in cache
- `tests/e2e/zone-banner.spec.ts` - Verifies UIScene has zone banner components

## Decisions Made
- Import JSON data directly via ES modules instead of Phaser JSON loader -- Vite handles JSON imports natively, avoids public path issues
- Metro door placed at (44, 33) instead of (45, 33) to avoid conflict with metro station sign which has higher interaction priority (sign > door)
- Library building is a compact 4x2 structure (roof + front wall with door) at x=13-16, y=16-17 in Cubbon Park, positioned south of the horizontal path and north of the pond
- All door tiles must have collision so the InteractionSystem's getFacingPosition pattern works (player faces blocked tile from adjacent walkable tile)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed doorPosition coordinates in all 4 interior JSONs**
- **Found during:** Task 3 (human verification)
- **Issue:** doorPosition values in interior JSONs did not match actual door/entrance tile positions in the tilemap. Metro pointed to walkable floor, Coffee pointed to wrong tile, UB City pointed inside collision zone, Library had no building
- **Fix:** Updated all 4 interior JSONs with coordinates matching the actual DOOR/UB_ENTRANCE tiles in generate-tilemap.js
- **Files modified:** src/data/interiors/metro-station.json, coffee-shop.json, ub-city-mall.json, cubbon-library.json
- **Verification:** Tile data verified in generated mg-road.json -- all doorPositions match collision tiles, all returnPositions are walkable
- **Committed in:** 2f56bec

**2. [Rule 2 - Missing Critical] Added collision to door tiles**
- **Found during:** Task 3 (human verification)
- **Issue:** Door tiles at coffee shop (40,36), UB City entrance (27-28,41), and west shop (23,36) had no collision. Player walked through them instead of being blocked, preventing the facing-based interaction system from working
- **Fix:** Added collision fills for all door tile rows in generate-tilemap.js
- **Files modified:** scripts/generate-tilemap.js
- **Verification:** Collision layer verified at all door positions in generated tilemap
- **Committed in:** 2f56bec

**3. [Rule 2 - Missing Critical] Added library building to Cubbon Park**
- **Found during:** Task 3 (human verification)
- **Issue:** cubbon-library.json referenced a doorPosition but no library building existed in the tilemap -- Cubbon Park only had trees, paths, benches, and a fountain
- **Fix:** Added a 4x2 library building at x=13-16, y=16-17 with ROOF top row, CONCRETE+DOOR front row, and full collision
- **Files modified:** scripts/generate-tilemap.js
- **Verification:** Building tiles and collision verified in generated tilemap; return position (15,18) confirmed walkable
- **Committed in:** 2f56bec

**4. [Rule 1 - Bug] Fixed lamppost overwriting metro sign**
- **Found during:** Task 3 (investigating door issues)
- **Issue:** Lamppost loop at x=5,13,21,29,37,45,53 placed D.LAMPPOST at (45,33) after B.METRO_SIGN was already placed there, overwriting the metro sign visual
- **Fix:** Added x !== 45 skip condition in the south sidewalk lamppost loop
- **Files modified:** scripts/generate-tilemap.js
- **Verification:** Metro sign tile (45,33) confirmed as GID 45 (B.METRO_SIGN) in generated tilemap
- **Committed in:** 2f56bec

---

**Total deviations:** 4 auto-fixed (2 bugs, 2 missing critical)
**Impact on plan:** All fixes necessary for building entry to function. Door interaction requires collision on door tiles and correct coordinate matching. No scope creep.

## Issues Encountered
- Pond edge collision at y=19 in Cubbon Park required moving the library one row north (y=16-17 instead of y=16-18) to ensure the return position was walkable
- Metro sign and metro door at same tile (45,33) would cause sign to always win due to interaction priority; resolved by moving door to (44,33)

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 2 is complete: all NPC, sign, door, zone, and transition systems are integrated and functional
- ZoneManager.getDiscoveryState() provides discovery data ready for Phase 3 journal integration
- 85 unit tests and 4 E2E test files provide regression coverage for all Phase 2 features
- Building transition pattern (scene restart with mode data) is established for any future interior additions

---
*Phase: 02-world-interaction*
*Completed: 2026-03-20*
