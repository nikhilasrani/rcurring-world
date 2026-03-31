---
phase: 02-world-interaction
plan: 01
subsystem: data
tags: [typescript, json, npc, dialogue, interiors, signs, types]

# Dependency graph
requires:
  - phase: 01-foundation-and-movement
    provides: "Base types (PlayerState, ZoneConfig, LandmarkDef, TouchInputState), constants (EVENTS, ASSETS, LAYERS), zone data (mg-road.json)"
provides:
  - "NPCDef, DialogueData, SignDef, InteriorDef, InteractionTarget, DiscoveryState type interfaces"
  - "Extended EVENTS with dialogue, interaction, zone, and building events"
  - "Extended ASSETS with NPC sprite keys and interior tilemap/tileset keys"
  - "Extended LAYERS with decorations, interactables, doors"
  - "5 NPC JSON data files with culturally authentic Kannada dialogue"
  - "6 sign definitions covering MG Road landmarks"
  - "4 interior metadata files with door/spawn/exit positions"
affects: [02-02, 02-03, 02-04, 02-05]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "JSON data files conforming to TypeScript interfaces for type-safe content loading"
    - "Additive constant extension pattern: new entries added to existing EVENTS/ASSETS/LAYERS objects"

key-files:
  created:
    - src/data/npcs/chai-walla.json
    - src/data/npcs/auto-driver.json
    - src/data/npcs/jogger.json
    - src/data/npcs/shopkeeper.json
    - src/data/npcs/guard.json
    - src/data/signs/signs.json
    - src/data/interiors/metro-station.json
    - src/data/interiors/coffee-shop.json
    - src/data/interiors/ub-city-mall.json
    - src/data/interiors/cubbon-library.json
  modified:
    - src/utils/types.ts
    - src/utils/constants.ts

key-decisions:
  - "All data files are plain JSON, not TypeScript, for future editor/tool compatibility"
  - "NPC facing directions stored as Grid Engine Direction string values for direct use"

patterns-established:
  - "Data-driven content: NPC/sign/interior definitions in JSON, typed by TypeScript interfaces"
  - "Additive constants: new Phase entries appended to existing constant objects without modifying Phase 1 keys"

requirements-completed: [NPC-01, NPC-06, SIGN-01, SIGN-02, EXPL-02]

# Metrics
duration: 2min
completed: 2026-03-20
---

# Phase 02 Plan 01: Data Contracts Summary

**Extended type system with 6 new interfaces, 12 new constants, and 15 JSON data files defining 5 NPCs with Kannada dialogue, 6 landmark signs, and 4 enterable building interiors**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-20T09:26:49Z
- **Completed:** 2026-03-20T09:29:27Z
- **Tasks:** 2
- **Files modified:** 12

## Accomplishments
- Extended TypeScript type system with NPCDef, DialogueData, SignDef, InteriorDef, InteractionTarget, and DiscoveryState interfaces
- Added 9 new event constants, 10 new asset keys, 3 new layer names, and NPC frame dimension constants
- Created 5 NPC data files with culturally authentic dialogue containing natural Kannada code-switching (namaskara, saar, guru, banni, oota aitha)
- Created 6 sign definitions covering all major MG Road landmarks
- Created 4 interior metadata files with door positions, spawn points, exit positions, and room dimensions

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend types and constants for Phase 2 systems** - `9ff430e` (feat)
2. **Task 2: Create NPC dialogue data, sign data, and interior metadata JSON files** - `2b72d1a` (feat)

## Files Created/Modified
- `src/utils/types.ts` - Added 6 new interfaces for Phase 2 data contracts
- `src/utils/constants.ts` - Extended EVENTS, ASSETS, LAYERS with Phase 2 entries; added NPC frame constants
- `src/data/npcs/chai-walla.json` - Raju the filter coffee vendor, near MG Road
- `src/data/npcs/auto-driver.json` - Manju the auto-rickshaw driver, near metro station
- `src/data/npcs/jogger.json` - Priya the morning jogger, in Cubbon Park
- `src/data/npcs/shopkeeper.json` - Venkatesh near UB City, nostalgic about old Bengaluru
- `src/data/npcs/guard.json` - Siddappa the guard at Vidhana Soudha
- `src/data/signs/signs.json` - 6 signs: road signs, notice boards, landmark plaques, shop front
- `src/data/interiors/metro-station.json` - 15x10 metro station interior
- `src/data/interiors/coffee-shop.json` - 12x10 coffee shop interior
- `src/data/interiors/ub-city-mall.json` - 15x12 mall interior
- `src/data/interiors/cubbon-library.json` - 12x10 library interior

## Decisions Made
- All data files are plain JSON (not TypeScript modules) for future editor/tool compatibility and to match the established mg-road.json pattern
- NPC facing directions stored as Grid Engine Direction string values ("down", "left", "right") for direct use without mapping

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All type interfaces ready for import by downstream plans (02-02 through 02-05)
- All NPC, sign, and interior data files ready for runtime loading
- Constants fully extended for dialogue events, NPC assets, interior tilemaps, and new tile layers
- No blockers for any subsequent Phase 2 plan

## Self-Check: PASSED

All 12 created/modified files verified on disk. Both task commits (9ff430e, 2b72d1a) verified in git log.

---
*Phase: 02-world-interaction*
*Completed: 2026-03-20*
