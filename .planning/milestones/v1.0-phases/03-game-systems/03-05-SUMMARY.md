---
phase: 03-game-systems
plan: 05
subsystem: ui
tags: [phaser, metro-map, item-pickup, overlay, animation, interior-data]

# Dependency graph
requires:
  - phase: 03-game-systems
    plan: 01
    provides: "Event constants (METRO_MAP_OPEN, METRO_TRAVEL_START, ITEM_PICKUP_INTERACT), PickupDef/InteriorInteractable types"
  - phase: 03-game-systems
    plan: 04
    provides: "PauseMenu overlay pattern (depth 70, container-based, fade animations)"
provides:
  - "MetroMap: full-screen Purple Line overlay with 3 stations, selection, and travel transition"
  - "ItemPickup: world-space sparkle entity with bob animation for collectible items"
  - "Metro station interior with metro-map-wall interactable definition"
  - "Coffee shop interior with counter interactable and dialogue"
affects: [03-06, 03-07]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "3-part travel transition (doors close/ride screen/doors open) using Phaser tweens at depth 80"
    - "Tile-aligned entity positioning: tileX * TILE_SIZE + TILE_SIZE / 2"

key-files:
  created:
    - src/ui/MetroMap.ts
    - src/entities/ItemPickup.ts
  modified:
    - src/data/interiors/metro-station.json
    - src/data/interiors/coffee-shop.json

key-decisions:
  - "MetroMap uses same overlay pattern as PauseMenu (depth 70, container-based, fade in/out)"
  - "Travel transition door panels at depth 80 above all UI for proper visual stacking"
  - "ItemPickup sprite at depth 2 matching NPC sprite depth for consistent world rendering"

patterns-established:
  - "Metro travel transition: doors close (500ms Quad.easeInOut) -> ride screen (1500ms) -> doors open (500ms Quad.easeInOut)"
  - "World entity sparkle: tween bob + alpha pulse with yoyo repeat for collectible indication"

requirements-completed: [MTRO-01, MTRO-02, MTRO-03, INVT-01]

# Metrics
duration: 2min
completed: 2026-03-21
---

# Phase 03 Plan 05: Metro Map & Item Pickups Summary

**MetroMap overlay with Namma Metro Purple Line diagram (3 stations, door-close/ride/door-open travel transition), ItemPickup sparkle entity, and interior interactable data for metro station and coffee shop**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-21T04:03:25Z
- **Completed:** 2026-03-21T04:05:37Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- MetroMap overlay with Purple Line diagram showing Majestic, MG Road, and Indiranagar stations with proper color coding (#E8B830 active, #666666 locked, #8B45A6 line)
- 3-part travel transition animation with Quad.easeInOut door panels sliding from edges to center and back
- ItemPickup entity with sparkle bob animation (2px vertical, 0.7-1.0 alpha, 600ms cycle, Sine.easeInOut)
- Metro station and coffee shop interiors extended with interactable definitions for in-building interactions

## Task Commits

Each task was committed atomically:

1. **Task 1: MetroMap overlay with travel transition** - `3bb194a` (feat)
2. **Task 2: ItemPickup entity + interior interactable data** - `b68394f` (feat)

## Files Created/Modified
- `src/ui/MetroMap.ts` - Full-screen metro map overlay with Purple Line diagram, station selection, locked tooltip, and 3-part travel transition
- `src/entities/ItemPickup.ts` - World-space sparkle pickup entity with bob + alpha animation at depth 2
- `src/data/interiors/metro-station.json` - Extended with metro-map-wall interactable at position (7,3)
- `src/data/interiors/coffee-shop.json` - Extended with coffee counter interactable with Chikmagalur coffee dialogue

## Decisions Made
- MetroMap follows same overlay pattern as PauseMenu (depth 70, 448x288, 16px margin, container-based rendering)
- Travel transition door panels rendered at depth 80 to visually stack above all other UI during animation
- ItemPickup sprite depth 2 matches NPC sprite depth for consistent world-space layering

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- MetroMap ready for scene integration (UIScene wiring, key input binding for open/close)
- ItemPickup ready for WorldScene spawning from mg-road-pickups.json data
- Interior interactables ready for InteractionSystem extension in Plan 06
- Travel transition mechanism functional but destinations locked for v1 (only MG Road unlocked)

## Self-Check: PASSED

All 4 created/modified files verified on disk. Both commit hashes (3bb194a, b68394f) found in git log.

---
*Phase: 03-game-systems*
*Completed: 2026-03-21*
