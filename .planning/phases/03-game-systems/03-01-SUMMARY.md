---
phase: 03-game-systems
plan: 01
subsystem: game-logic
tags: [typescript, quest-system, inventory, save-load, journal, pure-logic, tdd]

# Dependency graph
requires:
  - phase: 02-world-interaction
    provides: "NPC data, InteractionTarget, DiscoveryState, DialogueData types"
provides:
  - "GameState interface for all saveable state"
  - "QuestManager state machine (offered/accepted/in-progress/complete)"
  - "InventoryManager with 12-slot capacity and duplicate prevention"
  - "JournalManager for zone completion percentage computation"
  - "SaveManager for localStorage persistence with error handling"
  - "Phase 3 event constants (quest/inventory/journal/menu/save/metro)"
  - "8 Bengaluru item definitions in items.json"
  - "5 world pickup definitions in mg-road-pickups.json"
  - "MG Road discovery checklist in mg-road-discoveries.json"
affects: [03-02, 03-03, 03-04, 03-05, 03-06, 03-07]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Pure TypeScript system managers with zero Phaser imports for testability"
    - "Stateless computation pattern (JournalManager takes discovery state as params)"
    - "One-active-quest constraint enforced at manager level"
    - "Optional onStateChange callback for reactive UI binding"

key-files:
  created:
    - src/systems/QuestManager.ts
    - src/systems/InventoryManager.ts
    - src/systems/JournalManager.ts
    - src/systems/SaveManager.ts
    - src/data/items/items.json
    - src/data/pickups/mg-road-pickups.json
    - src/data/journal/mg-road-discoveries.json
    - tests/unit/quest-manager.test.ts
    - tests/unit/inventory-manager.test.ts
    - tests/unit/journal-manager.test.ts
    - tests/unit/save-manager.test.ts
  modified:
    - src/utils/types.ts
    - src/utils/constants.ts
    - tests/unit/constants.test.ts

key-decisions:
  - "All system managers are pure TypeScript with no Phaser dependency for unit test isolation"
  - "JournalManager is stateless -- computes on demand from passed-in discovery arrays"
  - "QuestManager uses optional callback for state change notifications instead of event emitter"
  - "SaveManager.migrate() uses version comparison for forward-compatible save migration"

patterns-established:
  - "Pure-logic managers: business logic in src/systems/*.ts with no framework imports"
  - "Stateless aggregation: JournalManager receives state as params, never stores mutable state"
  - "Save versioning: GameState.version field + migrate() method for forward compatibility"

requirements-completed: [QUST-01, QUST-02, QUST-04, INVT-01, INVT-03, JRNL-01, JRNL-02, JRNL-03, SAVE-01, SAVE-02, SAVE-03, SAVE-04]

# Metrics
duration: 4min
completed: 2026-03-21
---

# Phase 03 Plan 01: Core Data Model & System Managers Summary

**4 pure-logic TypeScript managers (Quest, Inventory, Journal, Save) with 34 unit tests, 10 new type interfaces, 18 event constants, and 3 JSON data files for Bengaluru items/pickups/discoveries**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-21T03:48:09Z
- **Completed:** 2026-03-21T03:52:41Z
- **Tasks:** 2
- **Files modified:** 14

## Accomplishments
- GameState interface fully defined with all saveable fields (player, quests, inventory, discovery, settings)
- 4 pure-logic system managers with zero Phaser imports, fully unit-tested (34 tests passing)
- 8 culturally authentic Bengaluru items with flavor text (filter coffee, masala dosa, jasmine flowers, etc.)
- 18 Phase 3 event constants and 5 asset keys added without modifying existing Phase 1-2 constants

## Task Commits

Each task was committed atomically:

1. **Task 1: Type contracts, constants, data files**
   - `169375c` (test) - Failing tests for Phase 3 event and asset constants
   - `2820153` (feat) - Phase 3 type contracts, event constants, and data files

2. **Task 2: Pure-logic system managers with unit tests**
   - `ded3634` (test) - Failing tests for 4 system managers
   - `afd1f45` (feat) - Implement 4 pure-logic system managers

_TDD tasks each have separate test (RED) and implementation (GREEN) commits._

## Files Created/Modified
- `src/utils/types.ts` - Extended with GameState, QuestState, InventoryItem, QuestDef, ItemDef, PickupDef, JournalDiscoveries, InteriorInteractable interfaces; InteractionTarget expanded with pickup/metro-map
- `src/utils/constants.ts` - 18 new EVENTS constants (quest/inventory/journal/menu/save/metro) and 5 new ASSETS keys
- `src/systems/QuestManager.ts` - Quest state machine with one-active-at-a-time, offer/accept/decline/complete lifecycle
- `src/systems/InventoryManager.ts` - 12-slot inventory with duplicate prevention and save/load
- `src/systems/JournalManager.ts` - Stateless zone completion aggregation from discovery data
- `src/systems/SaveManager.ts` - localStorage persistence with JSON error handling and version migration
- `src/data/items/items.json` - 8 Bengaluru-specific items with culturally authentic descriptions
- `src/data/pickups/mg-road-pickups.json` - 5 world pickup positions for MG Road zone
- `src/data/journal/mg-road-discoveries.json` - Discovery checklist: 5 places, 6 NPCs, 8 items
- `tests/unit/constants.test.ts` - Extended with 9 new test cases for Phase 3 constants
- `tests/unit/quest-manager.test.ts` - 13 test cases covering full quest lifecycle
- `tests/unit/inventory-manager.test.ts` - 6 test cases covering capacity, duplicates, round-trip
- `tests/unit/journal-manager.test.ts` - 7 test cases covering completion percentage computation
- `tests/unit/save-manager.test.ts` - 8 test cases covering localStorage save/load/error handling

## Decisions Made
- All system managers are pure TypeScript with no Phaser dependency -- enables fast unit testing without browser mocking
- JournalManager is stateless -- receives discovery arrays as parameters and computes on demand, avoiding stale state
- QuestManager uses optional callback pattern for state change notifications rather than coupling to EventsCenter
- SaveManager.migrate() uses version comparison for forward-compatible save file migration

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed unused CURRENT_VERSION variable in SaveManager**
- **Found during:** Task 2 (system manager implementation)
- **Issue:** `CURRENT_VERSION` static field was declared but never referenced, causing tsc --noEmit to fail
- **Fix:** Added version comparison in migrate() method: `if (data.version < SaveManager.CURRENT_VERSION)`
- **Files modified:** src/systems/SaveManager.ts
- **Verification:** `npx tsc --noEmit` passes with zero errors
- **Committed in:** afd1f45 (part of Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug fix)
**Impact on plan:** Trivial fix for TypeScript strict mode compliance. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All type contracts ready for UI components (Plans 03-04 through 03-07)
- System managers ready for scene integration (Plan 03-03)
- Data files ready for quest/pickup/journal scene wiring
- 34 unit tests provide regression safety for future changes

## Self-Check: PASSED

All 14 created/modified files verified on disk. All 4 commit hashes (169375c, 2820153, ded3634, afd1f45) found in git log.

---
*Phase: 03-game-systems*
*Completed: 2026-03-21*
