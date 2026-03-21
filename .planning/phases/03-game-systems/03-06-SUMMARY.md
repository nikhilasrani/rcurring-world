---
phase: 03-game-systems
plan: 06
subsystem: integration
tags: [phaser, quest-system, inventory, save-load, pause-menu, metro-map, title-screen]

# Dependency graph
requires:
  - phase: 03-01
    provides: "QuestManager, InventoryManager, JournalManager, SaveManager"
  - phase: 03-02
    provides: "Phase 3 asset generation scripts"
  - phase: 03-03
    provides: "NPCManager quest-state dialogue, DialogBox choice mechanic"
  - phase: 03-04
    provides: "PauseMenu, QuestHUD, ItemNotification, panel components"
  - phase: 03-05
    provides: "MetroMap overlay, ItemPickup entity"
provides:
  - "Full game system integration in WorldScene (managers, pickups, quest events, auto-save)"
  - "UIScene Phase 3 overlay management (pause, HUD, notifications, metro map)"
  - "TitleScene Continue/New Game menu with save detection"
  - "BootScene Phase 3 asset loading"
  - "TouchControls hamburger menu button"
  - "InteractionSystem pickup and interior interactable support"
affects: [03-07, future-phases]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Registry-based manager persistence across scene restarts"
    - "Auto-save on building transitions via event listeners"
    - "Quest-state-aware NPC dialogue selection in handleAction"

key-files:
  created: []
  modified:
    - src/scenes/WorldScene.ts
    - src/scenes/UIScene.ts
    - src/scenes/TitleScene.ts
    - src/scenes/BootScene.ts
    - src/ui/TouchControls.ts
    - src/systems/InteractionSystem.ts
    - src/utils/types.ts

key-decisions:
  - "Managers stored in Phaser registry for persistence across scene restarts (outdoor/interior)"
  - "Quest offered at WorldScene creation (offerQuest idempotent) so NPC shows offer dialogue on first encounter"
  - "InteractionTarget type extended with 'counter' and 'object' for interior interactable type-safety"
  - "NPC_INTERACT event reused for journal NPC-met tracking via registry lastInteractedNPC"
  - "TitleScene defaults to NEW GAME selection when no save exists (CONTINUE greyed out)"

patterns-established:
  - "Registry pattern: game managers stored via this.registry.set() for cross-scene access"
  - "Auto-save pattern: listen for BUILDING_ENTER/EXIT, build GameState from managers, save to localStorage"
  - "Interior interaction pattern: separate handleAction branch for isInInterior with interactable support"

requirements-completed: [QUST-02, QUST-03, QUST-04, INVT-01, SAVE-02, SAVE-03, SAVE-04, PLAT-04]

# Metrics
duration: 5min
completed: 2026-03-21
---

# Phase 03 Plan 06: Scene Integration Summary

**All Phase 3 systems wired into running game: quest events, item pickups, auto-save, pause menu, HUD, metro map, and Continue/New Game title screen**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-21T04:08:11Z
- **Completed:** 2026-03-21T04:13:38Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- WorldScene initializes all 4 managers (Quest, Inventory, Journal, Save), spawns item pickups, handles quest/inventory events, auto-saves on building transitions
- UIScene manages PauseMenu, QuestHUD, ItemNotification, MetroMap with keyboard/touch input routing (Escape for pause, up/down for dialogue choices, left/right for tab/station navigation)
- TitleScene rewritten with CONTINUE/NEW GAME menu, save detection, overwrite warning, and cursor navigation
- InteractionSystem extended with pickup detection and interior interactable support (coffee counter, metro map wall)
- BootScene loads all Phase 3 sprite assets (item icons, sparkle, save icon, hamburger, park coffee NPC)
- TouchControls adds hamburger menu button in top-right corner

## Task Commits

Each task was committed atomically:

1. **Task 1: WorldScene + InteractionSystem + BootScene + TouchControls integration** - `739c144` (feat)
2. **Task 2: UIScene integration + TitleScene Continue/New Game** - `d3f7af5` (feat)

## Files Created/Modified
- `src/scenes/WorldScene.ts` - Added QuestManager, InventoryManager, JournalManager, SaveManager initialization; item pickup spawning; quest event listeners; auto-save on transitions; interior interaction handling; park coffee vendor NPC
- `src/scenes/UIScene.ts` - Added PauseMenu, QuestHUD, ItemNotification, MetroMap; Escape/arrow key routing; save icon flash; event listener cleanup
- `src/scenes/TitleScene.ts` - Rewritten with CONTINUE/NEW GAME menu, save detection, overwrite warning, cursor navigation
- `src/scenes/BootScene.ts` - Added loading for item-icons, sparkle, save-icon, hamburger-icon, npc-park-coffee-vendor sprites
- `src/ui/TouchControls.ts` - Added hamburger menu button with PAUSE_MENU_OPEN event
- `src/systems/InteractionSystem.ts` - Extended with pickup and interior interactable detection, priority order NPC > Sign > Door > Pickup > Interactable
- `src/utils/types.ts` - Extended InteractionTarget type with 'counter' and 'object'

## Decisions Made
- Managers stored in Phaser registry for persistence across scene restarts (outdoor to interior and back)
- Quest offered via offerQuest() at WorldScene creation (idempotent) so NPC shows offer dialogue on first encounter
- InteractionTarget type extended with 'counter' and 'object' for type-safe interior interactable handling
- TitleScene defaults selection to NEW GAME when no save exists, skipping greyed-out CONTINUE
- NPC_INTERACT event reused for journal NPC-met tracking via registry lastInteractedNPC pattern

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added InteractionTarget type extension**
- **Found during:** Task 1 (InteractionSystem)
- **Issue:** InteriorInteractable type has 'counter' and 'object' types not present in InteractionTarget union
- **Fix:** Extended InteractionTarget type in types.ts to include 'counter' | 'object'
- **Files modified:** src/utils/types.ts
- **Verification:** npx tsc --noEmit passes
- **Committed in:** 739c144 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 missing critical)
**Impact on plan:** Type extension necessary for type safety. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All Phase 3 systems are integrated and functional end-to-end
- Ready for Plan 07 (validation/testing) to verify the full integration
- All 137 existing tests continue to pass
- Production build succeeds

## Self-Check: PASSED

- All 7 modified files exist on disk
- Both task commits (739c144, d3f7af5) exist in git history
- SUMMARY.md created at expected path

---
*Phase: 03-game-systems*
*Completed: 2026-03-21*
