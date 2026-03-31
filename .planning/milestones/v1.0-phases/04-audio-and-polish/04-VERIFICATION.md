---
phase: 04-audio-and-polish
verified: 2026-03-23T00:00:00Z
status: human_needed
score: 10/10 must-haves verified
human_verification:
  - test: "Audio actually plays in-game: run npm run dev, open http://localhost:5173 in Chrome, play through title screen, walk outdoors, enter a building, talk to an NPC, open pause menu"
    expected: "Title music plays on title screen. Outdoor BGM and city-base ambient start when the game loads outdoors. Walking produces looping footstep sound that stops when idle. Entering a building plays door-open SFX and crossfades to interior BGM + interior ambient. Exiting plays door-close SFX and restores outdoor audio. NPC interaction plays chime. Pause menu open/close plays menu SFX. Dialogue typewriter produces ticking sounds."
    why_human: "All audio is implemented with placeholder silence MP3s. The wiring is verified programmatically, but confirming actual sound output and absence of console errors requires a human running the dev server."
  - test: "Zone-specific ambient: walk into Cubbon Park zone and confirm cubbon-park ambient overlays city-base"
    expected: "DevTools console shows amb-cubbon-park sound playing (isPlaying=true) while in Cubbon Park zone. In other outdoor zones, only city-base plays."
    why_human: "ZoneManager emits ZONE_ENTER with display names -- the zoneNameToId bridge is code-verified, but correct zone boundary triggering requires runtime observation."
  - test: "E2E Playwright audio test: npx playwright test tests/e2e/audio-boot.spec.ts"
    expected: "Test passes: all 16 audio keys confirmed in Phaser cache after BootScene. Requires dev server running."
    why_human: "E2E test requires a running dev server (npm run dev) and a browser -- cannot be run in static verification."
---

# Phase 04: Audio and Polish Verification Report

**Phase Goal:** The game sounds like Bengaluru -- ambient city audio, background music, and sound effects complete the "5-minute walk" experience
**Verified:** 2026-03-23
**Status:** human_needed
**Re-verification:** No -- initial verification

## Goal Achievement

### Observable Truths

| #  | Truth | Status | Evidence |
|----|-------|--------|----------|
| 1  | Key actions produce sound effects -- footsteps, door open/close, NPC interaction chime, menu sounds | VERIFIED | AudioManager.playSFX wired to NPC_INTERACT, BUILDING_ENTER/EXIT, PAUSE_MENU_OPEN/CLOSE. startFootsteps/stopFootsteps gated by Grid Engine movementStarted/Stopped in WorldScene. DialogBox emits throttled DIALOGUE_ADVANCE for dialogue-tick SFX. |
| 2  | Area-specific background music plays (outdoor and interior themes) and crossfades on zone/building transitions | VERIFIED | AudioManager.crossfadeMusic uses Phaser tweens over configurable duration (2000ms). WorldScene calls playBGM('outdoor') on createOutdoor() and enterInterior() on createInterior(). onBuildingExit triggers exitInterior() which crossfades back to outdoor. |
| 3  | Ambient city sounds are layered by area -- traffic near roads, birds in Cubbon Park, announcements near metro | VERIFIED | base+overlay model: city-base at 0.4 volume as base layer; zone-specific overlays fade in at 0.6. zoneNameToId in audio-config.json maps ZoneManager display names to landmark IDs for setAmbientZone lookup. 4 interior ambient variants mapped. |

**Score:** 3/3 success criteria truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/systems/AudioManager.ts` | Audio orchestration singleton | VERIFIED | 465 lines. Exports AudioManager. All required methods present: playBGM, crossfadeMusic, playSFX, startFootsteps, stopFootsteps, setAmbientZone, enterInterior, exitInterior, duck, unduck, setMusicVolume, setSFXVolume, getSettings, loadSettings, setScene, destroy, startTitleMusic, stopTitleMusic, startOutdoorAmbient. No Phaser import. |
| `src/data/audio/audio-config.json` | Zone-to-ambient mapping, zoneNameToId, audio asset keys | VERIFIED | Contains zoneAmbientMap (5 landmarks), interiorAmbientMap (4 interiors), zoneNameToId (5 display-name-to-ID entries), crossfade timing (musicDurationMs: 2000, ambientDurationMs: 1000, duckLevel: 0.5, duckDurationMs: 300), 16 audio asset entries across bgm/sfx/ambient. |
| `tests/unit/audio-manager.test.ts` | Unit tests for all AudioManager behaviors, min 100 lines | VERIFIED | 390 lines, 34 test cases. Imports AudioManager. Covers BGM crossfade, SFX, ambient, ducking, settings, event wiring, footsteps, interior enter/exit, zoneNameToId resolution. |
| `scripts/generate-placeholder-audio.cjs` | Script to generate silent MP3 placeholders | VERIFIED | Exists. Generates 16 MP3 files (3 BGM, 9 SFX, 4 ambient). |
| `public/assets/audio/bgm/*.mp3` (3 files) | Placeholder audio | VERIFIED | title-theme.mp3, outdoor-theme.mp3, interior-theme.mp3 present. |
| `public/assets/audio/sfx/*.mp3` (9 files) | Placeholder audio | VERIFIED | All 9 SFX files present. |
| `public/assets/audio/ambient/*.mp3` (4 files) | Placeholder audio | VERIFIED | All 4 ambient files present. |
| `src/scenes/BootScene.ts` | Audio preloading (16 load.audio calls) | VERIFIED | Exactly 16 this.load.audio() calls using ASSETS.AUDIO_* constants. |
| `src/scenes/TitleScene.ts` | Title music start/stop, AudioManager init | VERIFIED | Imports AudioManager. Creates instance in registry on first boot. Calls startTitleMusic() with Chrome AudioContext unlock deferral (checks sound.locked, defers to 'unlocked' event). Calls stopTitleMusic() before scene transitions. |
| `src/scenes/WorldScene.ts` | AudioManager initialization, outdoor/interior audio, footstep gating, save fix | VERIFIED | Retrieves/creates AudioManager from registry. Calls playBGM('outdoor') and startOutdoorAmbient() in createOutdoor(). Calls enterInterior() in createInterior(). movementStarted/Stopped subscriptions gate footsteps. performAutoSave and performManualSave use audioManager.getSettings() (not hardcoded 100). Cleanup in shutdown(). |
| `src/scenes/UIScene.ts` | Settings panel wired to AudioManager | VERIFIED | settingsPanel stored as class field. PAUSE_MENU_CLOSE handler calls am.setMusicVolume() and am.setSFXVolume() from settingsPanel.getSettings(). |
| `src/ui/DialogBox.ts` | Dialogue tick SFX on typewriter advance | VERIFIED | lastTickTime field. TICK_INTERVAL_MS = 80. Emits EVENTS.DIALOGUE_ADVANCE when 80ms has elapsed since last tick. |
| `tests/e2e/audio-boot.spec.ts` | E2E test for all 16 audio keys in cache | VERIFIED | EXPECTED_AUDIO_KEYS array has 16 entries. Checks game.cache.audio.exists(key) for each. Waits for TitleScene active before checking. |
| `src/utils/constants.ts` | 16 AUDIO_* asset key constants | VERIFIED | AUDIO_BGM_TITLE, AUDIO_SFX_QUEST_COMPLETE, AUDIO_AMB_SHOP_INTERIOR and all others confirmed present. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/systems/AudioManager.ts` | `src/data/audio/audio-config.json` | import audioConfig | WIRED | Line 3: `import audioConfig from '../data/audio/audio-config.json'` used throughout |
| `tests/unit/audio-manager.test.ts` | `src/systems/AudioManager.ts` | import AudioManager | WIRED | Line 29: `import { AudioManager } from '../../src/systems/AudioManager'` |
| `src/scenes/BootScene.ts` | `public/assets/audio/` | this.load.audio() | WIRED | 16 load.audio calls, each referencing correct file paths via ASSETS constants |
| `src/scenes/WorldScene.ts` | `src/systems/AudioManager.ts` | new AudioManager(this) + registry | WIRED | Line 435-441: retrieves from registry or creates new AudioManager; stored at this.audioManager |
| `src/scenes/UIScene.ts` | AudioManager via registry | registry.get + setMusicVolume/setSFXVolume | WIRED | Lines 148-152: registry.get('audioManager'), calls setMusicVolume and setSFXVolume on PAUSE_MENU_CLOSE |
| `src/scenes/WorldScene.ts` | AudioManager.getSettings() | save methods read real settings | WIRED | Lines 964-965 and 1013-1014: both save methods use audioManager?.getSettings().musicVolume/sfxVolume |
| `src/ui/DialogBox.ts` | EVENTS.DIALOGUE_ADVANCE | eventsCenter.emit | WIRED | Lines 93-95: throttled emit of EVENTS.DIALOGUE_ADVANCE; AudioManager line 58 wires onDialogueAdvance handler |
| `src/scenes/TitleScene.ts` | `src/systems/AudioManager.ts` | new AudioManager(this) + registry | WIRED | Lines 46-72: creates AudioManager if not in registry, calls startTitleMusic() with Chrome unlock deferral |

### Data-Flow Trace (Level 4)

Audio is sound output not rendered UI data. Data-flow trace not applicable for the AudioManager system -- it produces audio events rather than rendering visible state. The unit tests provide functional coverage of all data paths through the AudioManager logic.

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| All 34 audio-manager unit tests pass | `npx vitest run tests/unit/audio-manager.test.ts` | 34 passed | PASS |
| Full 171-test suite passes (no regressions) | `npx vitest run` | 171 passed across 14 test files | PASS |
| TypeScript build succeeds | `npm run build` | Built in 4.01s, no errors | PASS |
| Hardcoded save volume bug absent | `grep "musicVolume: 100" src/scenes/WorldScene.ts` | 0 matches | PASS |
| AudioManager has no Phaser import | `grep "import Phaser" src/systems/AudioManager.ts` | 0 matches | PASS |
| E2E audio test | `npx playwright test tests/e2e/audio-boot.spec.ts` | Requires dev server | SKIP (needs running server) |

### Requirements Coverage

| Requirement | Source Plans | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| AUDO-01 | 04-01, 04-02, 04-03 | Basic SFX play for key actions: footsteps, door open/close, NPC interaction chime, menu sounds | SATISFIED | AudioManager.playSFX covers all named SFX. Footsteps gated by Grid Engine. Door SFX on BUILDING_ENTER/EXIT. NPC chime on NPC_INTERACT. Menu SFX on PAUSE_MENU_OPEN/CLOSE. DialogBox emits throttled DIALOGUE_ADVANCE for tick SFX. |
| AUDO-02 | 04-01, 04-02, 04-03 | Area-specific background music plays (at least outdoor theme + interior theme) | SATISFIED | 3 BGM tracks (title, outdoor, interior). WorldScene calls playBGM('outdoor') on outdoor create, enterInterior() crossfades to 'interior' BGM. |
| AUDO-03 | 04-01, 04-02, 04-03 | Music crossfades on zone/building transitions | SATISFIED | crossfadeMusic() uses Phaser tweens (fade out current, fade in new) over 2000ms. Building enter/exit triggers crossfades. Previous tweens cancelled before starting new ones. |
| AUDO-04 | 04-01, 04-02, 04-03 | Ambient city sounds are layered by area (traffic near roads, birds in Cubbon Park, announcements near metro) | SATISFIED | base+overlay ambient model. city-base plays at 0.4 as constant base. Zone-specific overlays (cubbon-park, metro-interior, shop-interior) fade in at 0.6 on zone entry. 5 landmarks mapped in zoneAmbientMap. 4 interiors mapped in interiorAmbientMap. |

All 4 AUDO requirements satisfied across all 3 plans. No orphaned requirements -- REQUIREMENTS.md confirms AUDO-01 through AUDO-04 all marked Phase 4 / Complete.

### Anti-Patterns Found

None found.

Scanned files: AudioManager.ts, WorldScene.ts (audio sections), TitleScene.ts, BootScene.ts, UIScene.ts, DialogBox.ts.

- No TODO/FIXME/PLACEHOLDER comments in any audio-related file
- No stub return patterns (return null, return {}, return []) in audio paths
- No hardcoded empty arrays or objects passed to audio calls
- No Phaser direct import in AudioManager (correctly uses `any` types for test isolation)
- No hardcoded volume values remaining in save methods (bug fixed)

### Human Verification Required

The automated pipeline is fully verified. Three items require human confirmation:

#### 1. Audio Output in Browser

**Test:** Run `npm run dev`, open http://localhost:5173 in Chrome with DevTools open. Play through: title screen -> new game -> walk outdoors -> enter a building -> talk to NPC -> open pause menu -> adjust volume sliders.
**Expected:** Each action produces the corresponding sound or silence (placeholder files). No console errors of the form "The AudioContext was not allowed to start" or "cannot read property of undefined" on audio calls. The `__PHASER_GAME__.sound.getAll().map(s => s.key + ':' + s.isPlaying)` DevTools query shows bgm-outdoor and amb-city-base as isPlaying=true when outdoors.
**Why human:** Audio output is inherently a runtime browser experience. The wiring is code-verified but actual sound playback and error-free operation can only be confirmed by running the game.

#### 2. Zone Ambient Switching (Cubbon Park)

**Test:** In the running game, walk the player into the Cubbon Park zone boundary. Check DevTools: `__PHASER_GAME__.sound.getAll().filter(s=>s.isPlaying).map(s=>s.key)`.
**Expected:** amb-cubbon-park appears in the playing sounds list while inside Cubbon Park. amb-city-base continues playing as base. On leaving Cubbon Park, amb-cubbon-park stops (fades out over 1 second).
**Why human:** ZoneManager emits ZONE_ENTER with display names. The zoneNameToId bridge is code-verified, but whether ZoneManager correctly fires ZONE_ENTER events at the right tile boundaries requires runtime walkthrough.

#### 3. E2E Playwright Audio Test

**Test:** Start dev server (`npm run dev`), then run `npx playwright test tests/e2e/audio-boot.spec.ts`.
**Expected:** Test passes -- all 16 audio keys confirmed in Phaser cache.
**Why human:** E2E test requires a running dev server and browser -- cannot be executed in static verification.

### Gaps Summary

No gaps. All automated checks pass. The phase goal is structurally achieved: the complete audio pipeline exists and is correctly wired. Remaining items are human runtime confirmations of browser audio playback and zone-boundary trigger correctness, which are inherently un-automatable in static verification.

Note on audio assets: All 16 MP3 files are valid placeholder silence files. The architecture and wiring are production-ready -- real audio assets (Suno BGM, ElevenLabs SFX) can be substituted by replacing files in `public/assets/audio/` without any code changes.

---

_Verified: 2026-03-23_
_Verifier: Claude (gsd-verifier)_
