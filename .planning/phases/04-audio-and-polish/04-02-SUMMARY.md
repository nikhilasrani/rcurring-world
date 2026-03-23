---
phase: 04-audio-and-polish
plan: 02
subsystem: audio
tags: [phaser-audio, scene-integration, footstep-gating, save-fix, settings-wiring, dialogue-tick]

# Dependency graph
requires:
  - phase: 04-audio-and-polish
    provides: AudioManager singleton, audio-config.json, 16 placeholder MP3 assets
  - phase: 03-game-systems
    provides: PauseMenu, SettingsPanel, SaveManager, Grid Engine movement observables
  - phase: 02-world-interaction
    provides: EventsCenter events, TransitionManager, ZoneManager, DialogBox
provides:
  - Audio preloading in BootScene (16 audio assets)
  - Title music lifecycle in TitleScene (play on create, stop on transition)
  - AudioManager wired into WorldScene for outdoor BGM, ambient, footsteps, interior transitions
  - SettingsPanel slider changes propagated to AudioManager in real-time
  - Throttled dialogue tick SFX emission from DialogBox
  - Fixed save volume bug (0-1 scale from AudioManager instead of hardcoded 100)
affects: [04-03 polish-and-deployment]

# Tech tracking
tech-stack:
  added: []
  patterns: [audio-preload-in-bootscene, footstep-gating-via-gridengine-observables, throttled-sfx-emission, volume-normalization-on-load]

key-files:
  created: []
  modified:
    - src/scenes/BootScene.ts
    - src/scenes/TitleScene.ts
    - src/scenes/WorldScene.ts
    - src/scenes/UIScene.ts
    - src/ui/DialogBox.ts
    - src/systems/AudioManager.ts
    - src/utils/constants.ts

key-decisions:
  - "AudioManager created in TitleScene (first boot) so title music works before WorldScene"
  - "Volume normalization on load handles both 0-1 (new saves) and 0-100 (legacy saves) scales"
  - "Footstep audio gated by Grid Engine movementStarted/Stopped observables with subscription cleanup in shutdown"
  - "Dialogue tick throttled to 80ms interval via Date.now() to avoid buzz from per-character playback"
  - "Settings panel wires to AudioManager on PAUSE_MENU_CLOSE rather than per-slider-change for simplicity"

patterns-established:
  - "Audio preloading via ASSETS constants keeps BootScene consistent with existing asset patterns"
  - "Grid Engine movement observables stored as class fields for proper cleanup on scene shutdown"
  - "Throttled event emission pattern: track lastTickTime, emit only when interval elapsed"

requirements-completed: [AUDO-01, AUDO-02, AUDO-03, AUDO-04]

# Metrics
duration: 5min
completed: 2026-03-23
---

# Phase 04 Plan 02: Scene Audio Integration Summary

**All 16 audio assets preloaded in BootScene, title music wired in TitleScene, outdoor/interior BGM and ambient switching in WorldScene, footstep gating via Grid Engine, dialogue tick SFX, settings panel wiring, and save volume bug fixed**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-23T14:43:06Z
- **Completed:** 2026-03-23T14:48:14Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- 16 audio asset constants added to ASSETS and preloaded in BootScene (3 BGM + 9 SFX + 4 ambient)
- AudioManager lifecycle wired across all game scenes: TitleScene (title music), WorldScene (outdoor/interior BGM, ambient, footsteps), UIScene (settings)
- Footstep audio gated to Grid Engine movementStarted/movementStopped with proper subscription cleanup on shutdown
- Save volume bug fixed: performAutoSave and performManualSave now read AudioManager.getSettings() (0-1 scale) instead of hardcoded 100
- Throttled dialogue tick SFX (80ms interval) prevents audio buzz during typewriter text
- SettingsPanel volume changes propagate to AudioManager on pause menu close

## Task Commits

Each task was committed atomically:

1. **Task 1: BootScene audio preloading and TitleScene title music** - `dd06315` (feat)
2. **Task 2: WorldScene AudioManager integration, footstep gating, interior audio, dialogue tick, settings wiring, and save volume fix** - `3610ae9` (feat)

## Files Created/Modified
- `src/utils/constants.ts` - Added 16 AUDIO_* asset key constants to ASSETS object
- `src/scenes/BootScene.ts` - Added 16 this.load.audio() calls for all audio assets
- `src/scenes/TitleScene.ts` - AudioManager init in registry, title music start/stop lifecycle
- `src/scenes/WorldScene.ts` - AudioManager retrieval from registry, outdoor BGM+ambient, footstep gating, interior audio switch, save volume fix
- `src/scenes/UIScene.ts` - settingsPanel as class field, wire to AudioManager on PAUSE_MENU_CLOSE
- `src/ui/DialogBox.ts` - Throttled DIALOGUE_ADVANCE event emission on typewriter text
- `src/systems/AudioManager.ts` - Added DIALOGUE_ADVANCE listener for dialogue-tick SFX

## Decisions Made
- AudioManager created in TitleScene.create() (first boot) rather than WorldScene, so title music plays immediately on the title screen
- Volume normalization on load: `value <= 1 ? value : value / 100` handles legacy saves (musicVolume: 100) and new saves (musicVolume: 0.7) transparently
- Footstep gating uses Grid Engine movementStarted/movementStopped observables stored as class fields for proper unsubscribe in shutdown
- Dialogue tick throttled to 80ms interval using Date.now() comparison to avoid per-character buzz at 30ms typing speed
- Settings panel wires to AudioManager on PAUSE_MENU_CLOSE (batch apply) rather than per-slider-change for simplicity

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added DIALOGUE_ADVANCE listener to AudioManager**
- **Found during:** Task 2 (DialogBox dialogue tick wiring)
- **Issue:** AudioManager from Plan 01 did not subscribe to DIALOGUE_ADVANCE event, so dialogue tick SFX would never play
- **Fix:** Added `eventsCenter.on(EVENTS.DIALOGUE_ADVANCE, this.onDialogueAdvance, this)` and corresponding handler + cleanup
- **Files modified:** src/systems/AudioManager.ts
- **Verification:** grep confirms DIALOGUE_ADVANCE in wireEvents and destroy
- **Committed in:** 3610ae9 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 missing critical functionality)
**Impact on plan:** Fix was necessary for dialogue tick SFX to work. No scope creep.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All audio infrastructure is wired and functional across all scenes
- Plan 03 (polish and deployment) can proceed with E2E audio testing and final polish
- Full test suite (171 tests) passes with no regressions
- Build succeeds with no TypeScript errors

## Self-Check: PASSED

All 7 modified files verified present. Both task commit hashes (dd06315, 3610ae9) verified in git log.

---
*Phase: 04-audio-and-polish*
*Completed: 2026-03-23*
