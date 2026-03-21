---
phase: 03-game-systems
plan: 03
subsystem: dialogue, quests, npcs
tags: [dialogue-choice, quest-data, npc-dialogue, phaser-text, game-systems]

requires:
  - phase: 03-01
    provides: QuestManager state machine, quest events, QuestState types
  - phase: 02-03
    provides: DialogBox with typewriter, DialogueController paging

provides:
  - DialogBox choice page mechanic with cursor navigation and DIALOGUE_CHOICE event
  - DialogueController choice page support (setChoiceData, isChoicePage, selectChoice)
  - DialogueData extended with optional choicePage/choices fields
  - NPCManager quest-state-aware dialogue selection via getDialogueForNPC
  - Coffee quest data (best-filter-coffee.json) with 3 objectives and reward
  - Chai-walla NPC quest dialogue variants (offer/active/complete/done)
  - Park coffee vendor NPC (Lakshmi) with quest dialogue
  - Shopkeeper NPC quest dialogue for coffee shop objective

affects: [03-04, 03-05, 03-06, 03-07]

tech-stack:
  added: []
  patterns:
    - "Quest-state dialogue: NPCManager.getDialogueForNPC selects dialogue based on QuestManager state"
    - "Choice mechanic: DialogBox choice pages with cursor, emits DIALOGUE_CHOICE event"
    - "NPC JSON questDialogue: offer/active/complete/done/afterObjective with optional choicePage/choices"

key-files:
  created:
    - src/data/quests/best-filter-coffee.json
    - src/data/npcs/park-coffee-vendor.json
  modified:
    - src/ui/DialogueController.ts
    - src/ui/DialogBox.ts
    - src/utils/types.ts
    - src/systems/NPCManager.ts
    - src/data/npcs/chai-walla.json
    - src/data/npcs/shopkeeper.json
    - tests/unit/dialogue-box.test.ts

key-decisions:
  - "choicePage value in NPC JSON is the page index that triggers choice mode (0-based); hasMorePages returns false on choice page to block auto-advance"
  - "NPCDefWithQuest extends NPCDef locally in NPCManager to avoid breaking existing NPCDef consumers"
  - "Quest giver NPC shows offer dialogue even when quest state is undefined (first encounter)"

patterns-established:
  - "NPC questDialogue JSON: offer/active/complete/done/afterObjective variants keyed by quest status"
  - "questObjectiveId field in NPC questDialogue for per-objective dialogue selection"
  - "DialogueData optional choicePage/choices fields for choice-enabled dialogue"

requirements-completed: [QUST-01, QUST-03]

duration: 4min
completed: 2026-03-21
---

# Phase 3 Plan 3: Dialogue Choice & Quest Data Summary

**DialogBox choice mechanic with cursor navigation, NPCManager quest-state dialogue, and coffee quest JSON with 3 objectives and 4 NPC dialogue variants**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-21T03:55:11Z
- **Completed:** 2026-03-21T03:59:18Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- Extended DialogBox with choice page rendering, cursor navigation (up/down), and DIALOGUE_CHOICE event emission
- Extended DialogueController with choice page logic (setChoiceData, isChoicePage, getChoices, selectChoice)
- Created complete coffee quest data with 3 objectives (chai-walla, coffee shop, park stall) and reward
- Added quest-state-aware dialogue selection to NPCManager via getDialogueForNPC
- Created park coffee vendor NPC (Lakshmi) with quest dialogue variants
- Added quest dialogue to chai-walla (offer/active/complete/done with choicePage) and shopkeeper NPCs
- 9 new unit tests for choice page logic (19 total dialogue-box tests pass)

## Task Commits

Each task was committed atomically:

1. **Task 1: DialogueController + DialogBox choice mechanic** - `b1b44d3` (feat)
2. **Task 2: NPCManager quest-state dialogue + quest/NPC data files** - `ce09468` (feat)

## Files Created/Modified
- `src/ui/DialogueController.ts` - Added choice page support: setChoiceData, isChoicePage, getChoices, selectChoice, getChoiceCount
- `src/ui/DialogBox.ts` - Added choice rendering with cursor indicator, moveChoiceCursor, isChoiceActive, DIALOGUE_CHOICE event
- `src/utils/types.ts` - Extended DialogueData with optional choicePage/choices fields
- `src/systems/NPCManager.ts` - Added setQuestManager, getDialogueForNPC with quest-state dialogue selection
- `src/data/quests/best-filter-coffee.json` - Coffee quest with 3 objectives and reward item
- `src/data/npcs/chai-walla.json` - Added questDialogue with offer/active/complete/done and choicePage
- `src/data/npcs/park-coffee-vendor.json` - New NPC (Lakshmi) with quest dialogue variants
- `src/data/npcs/shopkeeper.json` - Added questDialogue for coffee shop objective
- `tests/unit/dialogue-box.test.ts` - Added 9 choice page tests

## Decisions Made
- choicePage in NPC JSON is 0-based page index; hasMorePages returns false on choice page to block auto-advance
- NPCDefWithQuest extends NPCDef locally in NPCManager to keep NPCDef interface clean for existing consumers
- Quest giver NPC shows offer dialogue on first encounter (when quest state is undefined)
- Jogger NPC left unchanged per plan guidance (optional quip would overcomplicate)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Known Stubs

None - all data files contain complete dialogue text and quest definitions.

## Next Phase Readiness
- Choice mechanic ready for integration with WorldScene input handling
- NPCManager quest dialogue ready to wire with QuestManager in WorldScene
- Coffee quest data ready for quest system integration
- Park coffee vendor NPC needs sprite asset and map placement in future plans

## Self-Check: PASSED

All 9 created/modified files verified on disk. Both task commits (b1b44d3, ce09468) verified in git log.

---
*Phase: 03-game-systems*
*Completed: 2026-03-21*
