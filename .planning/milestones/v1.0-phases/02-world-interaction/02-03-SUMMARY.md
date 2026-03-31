---
phase: 02-world-interaction
plan: 03
subsystem: gameplay
tags: [phaser, grid-engine, dialogue, npc, typewriter, interaction, rex-plugins]

# Dependency graph
requires:
  - phase: 02-world-interaction plan 01
    provides: "NPCDef, SignDef, InteriorDef, DialogueData, InteractionTarget types and EVENTS constants"
provides:
  - "DialogBox class with GBA-style typewriter text and multi-page paging"
  - "DialogueController pure logic for dialogue paging (testable without Phaser)"
  - "InteractionPrompt floating A-button icon with bob animation"
  - "NPC entity class with Grid Engine character config and walk/idle animations"
  - "NPCManager for spawning NPCs with patrol start/stop/resume"
  - "InteractionSystem detecting NPCs/signs/doors at player facing position"
affects: [02-world-interaction plan 04, 02-world-interaction plan 05]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "DialogueController extracted for pure-logic unit testing without Phaser"
    - "InteractionSystem priority: NPC > Sign > Door at facing position"
    - "EventsCenter DIALOGUE_OPEN/DIALOGUE_CLOSE for cross-scene communication"
    - "TextTyping from phaser3-rex-plugins for typewriter effect at 30ms per char"

key-files:
  created:
    - src/entities/NPC.ts
    - src/systems/NPCManager.ts
    - src/systems/InteractionSystem.ts
    - src/ui/DialogBox.ts
    - src/ui/DialogueController.ts
    - src/ui/InteractionPrompt.ts
    - tests/unit/dialogue-box.test.ts
    - tests/unit/interaction.test.ts
    - tests/unit/npc-manager.test.ts
  modified: []

key-decisions:
  - "DialogueController extracted to separate file to avoid Phaser import chain in unit tests"
  - "NPC > Sign > Door priority order in InteractionSystem.checkInteraction"

patterns-established:
  - "Pure logic controllers extracted for Phaser-dependent UI classes to enable unit testing"
  - "Grid Engine facade pattern: systems accept gridEngine as any-typed parameter for mockability"

requirements-completed: [NPC-02, NPC-03, NPC-04, NPC-05, SIGN-01, SIGN-02]

# Metrics
duration: 5min
completed: 2026-03-20
---

# Phase 02 Plan 03: NPC Interaction Pipeline Summary

**NPC interaction pipeline with GBA-style typewriter dialogue box, floating interaction prompt, NPC entity/manager with Grid Engine patrol, and adjacency-based interaction detection**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-20T09:36:41Z
- **Completed:** 2026-03-20T09:41:41Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- Built DialogBox with typewriter text (30ms/char), multi-page paging, NPC name display, and page indicator
- Created InteractionSystem that detects NPCs, signs, and doors at player's facing position via Grid Engine
- Implemented NPCManager for spawning NPCs with Grid Engine integration and random patrol routes
- Created InteractionPrompt with floating "A" icon and Sine bob animation above interactable targets
- Extracted DialogueController as pure logic class enabling unit tests without Phaser dependencies
- All 27 unit tests pass across 3 test files

## Task Commits

Each task was committed atomically:

1. **Task 1: Create DialogBox, InteractionPrompt, NPC entity, and NPCManager (TDD)**
   - `c454171` test(02-03): add failing tests for dialogue box, interaction system, and NPC manager
   - `deb0cdc` feat(02-03): implement NPC interaction pipeline

_Note: TDD task with RED (failing tests) then GREEN (implementation) commits._

## Files Created/Modified
- `src/entities/NPC.ts` - NPC entity wrapping sprite with Grid Engine character config and walk/idle animations
- `src/systems/NPCManager.ts` - Spawns NPCs from JSON data, manages patrol routes via Grid Engine moveRandomly
- `src/systems/InteractionSystem.ts` - Detects adjacent NPCs/signs/doors at player facing position
- `src/ui/DialogBox.ts` - GBA-style dialogue box with typewriter text, multi-page paging, events
- `src/ui/DialogueController.ts` - Pure logic controller for dialogue paging (extracted for testability)
- `src/ui/InteractionPrompt.ts` - Floating "A" button icon with vertical bob tween above targets
- `tests/unit/dialogue-box.test.ts` - 10 test cases for DialogueController paging logic
- `tests/unit/interaction.test.ts` - 10 test cases for InteractionSystem detection
- `tests/unit/npc-manager.test.ts` - 7 test cases for NPCManager data management

## Decisions Made
- Extracted DialogueController to a separate file (`src/ui/DialogueController.ts`) to avoid Phaser import chain when unit testing -- importing from DialogBox.ts would trigger rexrainbow TextTyping which requires Phaser global
- NPC detection takes priority over sign/door detection in InteractionSystem (NPC standing on a sign tile = NPC interaction)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Extracted DialogueController to separate file**
- **Found during:** Task 1 (TDD GREEN phase)
- **Issue:** Unit tests importing DialogueController from DialogBox.ts triggered Phaser dependency chain via TextTyping import, causing "Phaser is not defined" error in Vitest
- **Fix:** Moved DialogueController class to src/ui/DialogueController.ts (pure logic, no Phaser imports), re-exported from DialogBox.ts for existing consumers
- **Files modified:** src/ui/DialogueController.ts (new), src/ui/DialogBox.ts (updated imports), tests/unit/dialogue-box.test.ts (updated import path)
- **Verification:** All 27 tests pass, tsc --noEmit clean
- **Committed in:** deb0cdc

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Essential for test execution. DialogueController still available from both import paths. No scope creep.

## Issues Encountered
None beyond the auto-fixed deviation above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All NPC interaction modules ready for integration into WorldScene
- DialogBox ready to receive DIALOGUE_OPEN/CLOSE events from InteractionSystem
- NPCManager ready to spawn NPCs from JSON data files created in Plan 01
- InteractionPrompt ready to show above detected targets

## Self-Check: PASSED

All 9 created files verified on disk. Both commit hashes (c454171, deb0cdc) verified in git log.

---
*Phase: 02-world-interaction*
*Completed: 2026-03-20*
