---
phase: 01-foundation-and-movement
plan: 04
subsystem: gameplay
tags: [phaser, grid-engine, tilemap, movement, collision, camera, animation]

# Dependency graph
requires:
  - phase: 01-foundation-and-movement
    plan: 01
    provides: Project scaffold, constants, types, EventsCenter
  - phase: 01-foundation-and-movement
    plan: 02
    provides: BootScene asset loading, player spritesheets, scene flow
  - phase: 01-foundation-and-movement
    plan: 03
    provides: Tilemap, tilesets, collision layer, zone metadata
provides:
  - WorldScene with tilemap rendering, Grid Engine tile-locked movement, and camera follow
  - Player entity class with walk/idle animation registration and speed management
  - Keyboard and touch input wiring for 4-direction movement
  - Walk/run speed toggle (Shift key or B button)
  - Collision via ge_collide property on invisible collision layer
  - Idle animation triggered when player is stationary
  - Pure functions getPlayerSpeed() and getMovementDirection() for testable movement logic
affects: [01-05-touch-controls, 02-npcs, 02-interaction]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Player entity encapsulates sprite, animations, Grid Engine config, and speed state"
    - "Pure function exports from entity modules for unit testability"
    - "EventsCenter for cross-scene communication (touch direction, run button)"
    - "Guarded scene launch for optional parallel scenes"

key-files:
  created:
    - src/entities/Player.ts
    - src/scenes/WorldScene.ts
    - tests/unit/player-speed.test.ts
    - tests/unit/movement.test.ts
    - tests/unit/collision.test.ts
  modified:
    - src/scenes/BootScene.ts
    - src/config.ts

key-decisions:
  - "walkingAnimationMapping:0 for Grid Engine auto walk animation from spritesheet rows"
  - "Idle animation as slow 2fps breathing loop using stand/shift frames per CONTEXT.md"
  - "setSpeed() with try/catch fallback for runtime speed changes"
  - "UIScene launch guarded with scene.manager.keys check since UIScene is plan 05"
  - "Touch direction via EventsCenter takes precedence over keyboard when active"

patterns-established:
  - "Player entity pattern: class wraps sprite + Grid Engine config + animation registration"
  - "Pure function exports for unit-testable game logic (speed, direction)"
  - "Guarded parallel scene launch for dependencies not yet created"

requirements-completed: [MOVE-01, MOVE-03, MOVE-04, MOVE-05]

# Metrics
duration: 4min
completed: 2026-03-20
---

# Phase 1 Plan 4: WorldScene and Player Movement Summary

**Tile-locked 4-direction movement with Grid Engine, collision, camera follow, walk/idle animations, and walk/run speed toggle on MG Road tilemap**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-19T20:18:50Z
- **Completed:** 2026-03-19T20:22:50Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Player entity class with walk animation registration (4 directions x 3 frames) and idle animations (4 directions, subtle breathing loop at 2fps)
- WorldScene loads tilemap, initializes Grid Engine with 4-direction movement, ge_collide collision, and camera follow with map bounds
- Walk/run speed toggle (4 vs 8 tiles/sec) via Shift key or EventsCenter run button events
- 29 unit tests passing across 4 test files covering speed, direction priority, collision config, and map boundaries

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Player entity class with animation registration, idle animation, and speed management** - `8ddf5ae` (feat)
2. **Task 2: Create WorldScene with tilemap, Grid Engine, movement, collision, camera, idle animation, and unit tests** - `4579ec7` (feat)

## Files Created/Modified
- `src/entities/Player.ts` - Player entity: sprite creation, walk/idle animation registration with Phaser AnimationManager, Grid Engine character config, speed management, pure function exports
- `src/scenes/WorldScene.ts` - Main gameplay scene: tilemap loading, Grid Engine initialization, keyboard+touch input, movement, collision, camera follow, idle animation trigger
- `src/scenes/BootScene.ts` - Fixed tileset image paths to match actual filenames; added zone metadata loading
- `src/config.ts` - Added WorldScene to Phaser scene array
- `tests/unit/player-speed.test.ts` - 10 tests for speed toggle and movement direction logic
- `tests/unit/movement.test.ts` - 7 tests for movement constants and direction priority
- `tests/unit/collision.test.ts` - 7 tests for collision config, map boundaries, and spawn point validation

## Decisions Made
- Used `walkingAnimationMapping: 0` to let Grid Engine auto-play walk animations from spritesheet row 0 (standard approach from research)
- Idle animations registered as separate Phaser animations (2fps breathing loop) since Grid Engine only handles walk animations
- `setSpeed()` used with try/catch fallback -- Grid Engine 2.48.2 supports it based on API testing
- UIScene launch guarded with `this.scene.manager.keys[SCENES.UI]` check since UIScene is created in plan 05
- Touch direction from EventsCenter takes precedence over keyboard when both are active (touch ?? keyboard)
- Player sprite depth set to 2 (between buildings at depth 1 and above-player layer at depth 3)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed BootScene tileset image paths**
- **Found during:** Task 2 (WorldScene creation)
- **Issue:** BootScene loaded tileset images as `mg-road-ground.png`, `mg-road-buildings.png`, etc. but actual files in `public/assets/tilesets/` are `ground.png`, `buildings.png`, etc.
- **Fix:** Changed all four tileset load paths to match actual filenames
- **Files modified:** src/scenes/BootScene.ts
- **Verification:** TypeScript compiles, filenames match directory listing
- **Committed in:** 4579ec7 (Task 2 commit)

**2. [Rule 3 - Blocking] Added guarded UIScene launch**
- **Found during:** Task 2 (WorldScene creation)
- **Issue:** Plan specifies `this.scene.launch(SCENES.UI)` but UIScene does not exist yet (plan 05). Would cause runtime error.
- **Fix:** Guarded launch with `if (this.scene.manager.keys[SCENES.UI])` check
- **Files modified:** src/scenes/WorldScene.ts
- **Verification:** No runtime error when UIScene is absent; launch will work once plan 05 adds it
- **Committed in:** 4579ec7 (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (1 bug, 1 blocking)
**Impact on plan:** Both fixes necessary for correctness. Tileset path bug would have prevented tilemap rendering. UIScene guard prevents crash. No scope creep.

## Issues Encountered
- NameEntryScene uses spawn position {x:30, y:35} while zone metadata has {x:45, y:35}. WorldScene fallback defaults use the zone metadata value (45, 35). The NameEntryScene value will be passed through when the full flow runs, so the actual spawn depends on which scene the player arrives from.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- WorldScene is fully functional with tilemap, movement, collision, camera, and animations
- Ready for plan 05 (UIScene with touch controls) which will wire into the EventsCenter events already listened to
- Ready for Phase 2 NPC and interaction work which builds on the WorldScene foundation

## Self-Check: PASSED

All 7 files verified present. Both task commits (8ddf5ae, 4579ec7) confirmed in git log.

---
*Phase: 01-foundation-and-movement*
*Completed: 2026-03-20*
