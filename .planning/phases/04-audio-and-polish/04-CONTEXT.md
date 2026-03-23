# Phase 4: Audio and Polish - Context

**Gathered:** 2026-03-23
**Status:** Ready for planning

<domain>
## Phase Boundary

The game sounds like Bengaluru — ambient city audio, background music, and sound effects complete the "5-minute walk" experience. This includes: SFX for key actions (footsteps, doors, NPC chime, menus), area-specific BGM with crossfades, and layered ambient city sounds per zone. No new gameplay mechanics, no new zones, no visual changes — audio only.

</domain>

<decisions>
## Implementation Decisions

### Audio Asset Sourcing
- **D-01:** Real audio files in MP3 format — no programmatic Web Audio synthesis, no OGG fallback
- **D-02:** AI-generated audio assets (Suno for BGM, ElevenLabs SFX or similar for sound effects and ambient loops)
- **D-03:** Preload all audio in BootScene alongside existing assets — no lazy loading. Total audio budget ~2-4MB is acceptable

### Ambient Sound Layering
- **D-04:** Multi-layer blend model — base ambient layer (general city hum) + zone-specific overlay layers that fade in/out as player moves
- **D-05:** 4 distinct ambient zones: outdoor general (roads/sidewalks), Cubbon Park (nature), Metro station interior, Shop/building interior
- **D-06:** 1-second crossfade between ambient zone layers when player crosses zone boundaries
- **D-07:** Audio ducking during dialogue — ambient and music reduce ~50% volume when dialogue box opens, restore on close

### Music Style and Identity
- **D-08:** Lo-fi chiptune with Indian flavor — 8-bit/chiptune base matching GBA aesthetic with subtle Indian melodic motifs (sitar-like arpeggios, tabla-esque percussion)
- **D-09:** 3 BGM tracks for v1: dedicated title/menu theme, outdoor exploration theme, interior theme
- **D-10:** Title theme is a slower, moodier arrangement of the outdoor theme — sets the tone before gameplay
- **D-11:** 2-second crossfade between music tracks on zone/building transitions (outdoor <-> interior)

### SFX Inventory (from AUDO-01)
- **D-12:** Required SFX: footsteps (walking loop), door open/close, NPC interaction chime, menu open/close, dialogue advance tick, item collected jingle, quest complete fanfare
- **D-13:** SFX style matches chiptune aesthetic — short, clean, 8-bit influenced sounds

### Claude's Discretion
- AudioManager class design and API surface
- Exact volume levels and ducking curves
- Footstep timing (per-tile vs continuous loop)
- Ambient layer mixing ratios per zone
- Audio asset file naming and directory structure
- Whether to add audio config to Phaser game config or manage via AudioManager alone
- Metro travel sequence sound design details

</decisions>

<specifics>
## Specific Ideas

- Music should feel like walking through Bengaluru with earbuds — lo-fi chiptune vibes with just enough Indian melodic flavor to place you in the city
- Cubbon Park ambient should feel noticeably different from road ambient — birds, rustling leaves vs traffic, horns
- Metro station interior should have that distinctive echo + PA announcement feel
- The title theme should make you want to press START — sets anticipation for the walk ahead
- Music crossfades should sync with the existing camera fade-to-black transition system, not fight it

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Audio integration points
- `src/utils/EventsCenter.ts` — Central event bus for all audio triggers
- `src/utils/constants.ts` — EVENTS constants (ZONE_ENTER, BUILDING_ENTER/EXIT, DIALOGUE_OPEN/CLOSE, ITEM_COLLECTED, QUEST_COMPLETE, etc.)
- `src/config.ts` — Phaser game config (needs audio config added)
- `src/scenes/BootScene.ts` — Asset loader (add audio asset loading here)

### Scene structure
- `src/scenes/WorldScene.ts` — Main scene, indoor/outdoor modes, zone detection
- `src/scenes/UIScene.ts` — UI overlay, dialogue, menus
- `src/scenes/TitleScene.ts` — Title screen (needs title music)
- `src/scenes/NameEntryScene.ts` — Name input screen

### Systems to wire
- `src/systems/TransitionManager.ts` — Building enter/exit with camera fade (music crossfade trigger)
- `src/systems/ZoneManager.ts` — Zone boundary detection (ambient crossfade trigger)
- `src/ui/SettingsPanel.ts` — Volume sliders exist as visual-only stubs (wire to AudioManager)
- `src/ui/DialogBox.ts` — Dialogue open/close events (ducking trigger)

### Prior phase context
- `.planning/phases/03-game-systems/03-CONTEXT.md` — Settings panel decisions, save system integration
- `.planning/phases/01-foundation-and-movement/01-CONTEXT.md` — EventsCenter pattern, asset pipeline

### Type definitions
- `src/utils/types.ts` — GameState with musicVolume/sfxVolume settings already defined

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `SettingsPanel` (src/ui/SettingsPanel.ts): Music/SFX volume sliders already rendered — just need wiring to AudioManager. Has `musicVolume: 0.7` and `sfxVolume: 0.7` visual state
- `EventsCenter` (src/utils/EventsCenter.ts): Phaser EventEmitter — all audio triggers already emit events, AudioManager just subscribes
- `SaveManager` (src/systems/SaveManager.ts): Persists `settings.musicVolume` and `settings.sfxVolume` — AudioManager reads on load

### Established Patterns
- JSON-driven content in `src/data/` — audio asset manifest could follow same pattern
- Programmatic asset generation (pngjs/canvas) — NOT used for audio (real MP3 files instead)
- Scene composition: WorldScene + UIScene parallel — AudioManager can live in either or as singleton
- BootScene preload pipeline with progress bar and error handling

### Integration Points
- `BootScene.preload()`: Add `this.load.audio()` calls for all MP3 files
- `WorldScene.create()`: Initialize AudioManager, start outdoor BGM + ambient
- `WorldScene` indoor/outdoor mode switch: Trigger music + ambient crossfade
- `TransitionManager.enterBuilding()/exitBuilding()`: Already emits BUILDING_ENTER/EXIT events
- `ZoneManager.checkZone()`: Already emits ZONE_ENTER — add ambient layer switching
- `UIScene` or `WorldScene`: Subscribe to DIALOGUE_OPEN/CLOSE for ducking
- `SettingsPanel`: Wire slider callbacks to AudioManager.setMusicVolume()/setSfxVolume()

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 04-audio-and-polish*
*Context gathered: 2026-03-23*
