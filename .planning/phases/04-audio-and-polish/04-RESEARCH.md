# Phase 4: Audio and Polish - Research

**Researched:** 2026-03-23
**Domain:** Phaser 3 Audio API, browser audio playback, game audio architecture
**Confidence:** HIGH

## Summary

Phase 4 adds audio to an already-complete game. The Phaser 3.90.0 Sound Manager provides everything needed: `this.sound.add()` for persistent sound instances, built-in `loop`, `volume`, `play()`/`stop()` methods, and the ability to tween volume for crossfades. No additional audio libraries are needed -- Phaser's WebAudio backend handles MP3 playback, looping, and volume control natively.

The core technical challenge is designing an AudioManager singleton that subscribes to the existing EventsCenter events (BUILDING_ENTER, BUILDING_EXIT, ZONE_ENTER, DIALOGUE_OPEN/CLOSE, etc.) and manages three concurrent audio layers: BGM (music), SFX (one-shot effects), and ambient loops. Crossfades between music and ambient tracks use Phaser's tween system (`scene.tweens.add()` targeting the sound's `volume` property). The SettingsPanel sliders already exist as visual-only controls with musicVolume/sfxVolume state -- they just need wiring to the AudioManager.

All audio assets are MP3 files preloaded in BootScene alongside existing assets. Total budget is 2-4MB per CONTEXT.md D-03. Browser autoplay restrictions require no special handling because Phaser's Sound Manager auto-unlocks the AudioContext on first user interaction (click/tap on the title screen START button).

**Primary recommendation:** Build a single AudioManager class registered in Phaser's registry (same pattern as QuestManager, InventoryManager). It subscribes to EventsCenter events and manages all audio state. No Phaser imports in the core logic where possible for testability, but the Phaser Sound Manager instance must be passed in since it owns audio playback.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Real audio files in MP3 format -- no programmatic Web Audio synthesis, no OGG fallback
- **D-02:** AI-generated audio assets (Suno for BGM, ElevenLabs SFX or similar for sound effects and ambient loops)
- **D-03:** Preload all audio in BootScene alongside existing assets -- no lazy loading. Total audio budget ~2-4MB is acceptable
- **D-04:** Multi-layer blend model -- base ambient layer (general city hum) + zone-specific overlay layers that fade in/out as player moves
- **D-05:** 4 distinct ambient zones: outdoor general (roads/sidewalks), Cubbon Park (nature), Metro station interior, Shop/building interior
- **D-06:** 1-second crossfade between ambient zone layers when player crosses zone boundaries
- **D-07:** Audio ducking during dialogue -- ambient and music reduce ~50% volume when dialogue box opens, restore on close
- **D-08:** Lo-fi chiptune with Indian flavor -- 8-bit/chiptune base matching GBA aesthetic with subtle Indian melodic motifs
- **D-09:** 3 BGM tracks for v1: dedicated title/menu theme, outdoor exploration theme, interior theme
- **D-10:** Title theme is a slower, moodier arrangement of the outdoor theme
- **D-11:** 2-second crossfade between music tracks on zone/building transitions (outdoor <-> interior)
- **D-12:** Required SFX: footsteps (walking loop), door open/close, NPC interaction chime, menu open/close, dialogue advance tick, item collected jingle, quest complete fanfare
- **D-13:** SFX style matches chiptune aesthetic -- short, clean, 8-bit influenced sounds

### Claude's Discretion
- AudioManager class design and API surface
- Exact volume levels and ducking curves
- Footstep timing (per-tile vs continuous loop)
- Ambient layer mixing ratios per zone
- Audio asset file naming and directory structure
- Whether to add audio config to Phaser game config or manage via AudioManager alone
- Metro travel sequence sound design details

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| AUDO-01 | Basic SFX play for key actions: footsteps, door open/close, NPC interaction chime, menu sounds | Phaser `this.sound.play(key)` for one-shots; AudioManager subscribes to existing EVENTS (NPC_INTERACT, BUILDING_ENTER/EXIT, PAUSE_MENU_OPEN/CLOSE, DIALOGUE_ADVANCE). Footstep loop tied to Grid Engine movement. |
| AUDO-02 | Area-specific background music plays (at least outdoor theme + interior theme) | 3 BGM tracks (title, outdoor, interior) managed as looping Phaser sound instances. AudioManager switches based on scene mode (isInInterior flag) and TitleScene lifecycle. |
| AUDO-03 | Music crossfades on zone/building transitions | Phaser tween system (`scene.tweens.add()`) targets sound.volume property for 2-second crossfade. BUILDING_ENTER/EXIT events trigger music transition. Camera fade (250ms) overlaps with music crossfade start. |
| AUDO-04 | Ambient city sounds are layered by area (e.g., traffic near roads, birds in Cubbon Park, announcements near metro) | Multi-layer ambient: base city hum (always playing outdoors) + zone overlays. ZoneManager.checkZone() emits ZONE_ENTER with landmark name -- AudioManager maps landmark IDs to ambient zone presets. Interior mode uses interior-specific ambient. 1-second crossfade per D-06. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Phaser 3 | 3.90.0 | Sound Manager (WebAudio backend) | Already installed; provides `this.sound.add()`, `.play()`, `.stop()`, volume control, looping, events. No additional audio lib needed. |
| phaser3-rex-plugins | 1.80.19 | SoundFade utility (optional import) | Already installed; `SoundFade.fadeIn/fadeOut` simplifies crossfade code. Can also use raw tweens. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Phaser Tweens | built-in | Volume crossfade animation | When fading between BGM tracks or ambient layers. `scene.tweens.add({ targets: sound, volume: targetVol, duration: ms })` |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Phaser Sound Manager | Howler.js | Howler offers more features but adds dependency; Phaser's built-in manager handles all requirements |
| Rex SoundFade plugin | Raw tweens | SoundFade is a convenience wrapper; raw tweens work identically and avoid another plugin registration |

**Installation:**
```bash
# No new packages needed -- Phaser 3.90.0 and phaser3-rex-plugins 1.80.19 already installed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
  systems/
    AudioManager.ts       # Singleton audio controller (NEW)
  data/
    audio/
      audio-config.json   # Audio asset manifest + zone-to-ambient mapping (NEW)
public/
  assets/
    audio/
      bgm/
        title-theme.mp3       # ~60-90s loop, lo-fi chiptune
        outdoor-theme.mp3      # ~90-120s loop, exploration vibe
        interior-theme.mp3     # ~60-90s loop, mellow indoor
      sfx/
        footstep.mp3           # ~0.15s, 8-bit step
        door-open.mp3          # ~0.3s
        door-close.mp3         # ~0.3s
        npc-chime.mp3          # ~0.3s, interaction ping
        menu-open.mp3          # ~0.2s
        menu-close.mp3         # ~0.2s
        dialogue-tick.mp3      # ~0.05s, typewriter advance
        item-collected.mp3     # ~0.5s, jingle
        quest-complete.mp3     # ~1.5s, fanfare
      ambient/
        city-base.mp3          # ~30-60s seamless loop, general city hum
        cubbon-park.mp3        # ~30-60s loop, birds/leaves
        metro-interior.mp3     # ~30-60s loop, echo + PA chime
        shop-interior.mp3      # ~30-60s loop, quiet indoor hum
```

### Pattern 1: AudioManager Singleton via Registry
**What:** A single AudioManager instance created in WorldScene.create() and stored in Phaser's registry for persistence across scene restarts (same pattern as QuestManager, InventoryManager).
**When to use:** Always -- it must survive outdoor/interior scene restarts.
**Example:**
```typescript
// Source: Existing project pattern (QuestManager in WorldScene)
// In WorldScene.createOutdoor():
const existingAM = this.registry.get('audioManager') as AudioManager | undefined;
if (existingAM) {
  this.audioManager = existingAM;
  this.audioManager.setScene(this); // update scene ref for tweens
} else {
  this.audioManager = new AudioManager(this);
  this.registry.set('audioManager', this.audioManager);
}
```

### Pattern 2: Event-Driven Audio Triggers
**What:** AudioManager subscribes to EventsCenter events instead of being called directly by game systems. Keeps audio decoupled from gameplay code.
**When to use:** For all audio triggers -- no game system should call AudioManager methods directly.
**Example:**
```typescript
// Source: Existing project pattern (WorldScene event wiring)
// In AudioManager constructor or init:
eventsCenter.on(EVENTS.BUILDING_ENTER, () => this.onBuildingEnter());
eventsCenter.on(EVENTS.BUILDING_EXIT, () => this.onBuildingExit());
eventsCenter.on(EVENTS.ZONE_ENTER, (zoneName: string) => this.onZoneEnter(zoneName));
eventsCenter.on(EVENTS.DIALOGUE_OPEN, () => this.duck());
eventsCenter.on(EVENTS.DIALOGUE_CLOSE, () => this.unduck());
eventsCenter.on(EVENTS.NPC_INTERACT, () => this.playSFX('npc-chime'));
eventsCenter.on(EVENTS.PAUSE_MENU_OPEN, () => this.playSFX('menu-open'));
eventsCenter.on(EVENTS.PAUSE_MENU_CLOSE, () => this.playSFX('menu-close'));
eventsCenter.on(EVENTS.ITEM_COLLECTED, () => this.playSFX('item-collected'));
eventsCenter.on(EVENTS.QUEST_COMPLETE, () => this.playSFX('quest-complete'));
```

### Pattern 3: Volume-Based Crossfade via Tweens
**What:** Two sound instances playing simultaneously, one fading out while the other fades in, using Phaser's tween system.
**When to use:** Music transitions (outdoor <-> interior, 2s) and ambient layer transitions (1s).
**Example:**
```typescript
// Source: Phaser 3 official docs (https://docs.phaser.io/phaser/concepts/audio)
// + Rex notes (https://rexrainbow.github.io/phaser3-rex-notes/docs/site/fadevolume/)
private crossfadeMusic(fromKey: string, toKey: string, duration: number): void {
  const from = this.bgmTracks[fromKey];
  const to = this.bgmTracks[toKey];
  if (!from || !to || from === to) return;

  // Start new track at volume 0
  to.play({ loop: true, volume: 0 });

  // Fade out old, fade in new
  this.scene.tweens.add({ targets: from, volume: 0, duration, onComplete: () => from.stop() });
  this.scene.tweens.add({ targets: to, volume: this.musicVolume, duration });

  this.currentBGM = toKey;
}
```

### Pattern 4: Footstep Loop Gated by Movement State
**What:** A short footstep sound that plays in a loop only while the player is actively moving, stopping when idle.
**When to use:** For the walking footstep SFX (D-12).
**Example:**
```typescript
// Subscribe to Grid Engine movement events
this.scene.gridEngine.movementStarted().subscribe(({ charId }) => {
  if (charId === 'player') this.startFootsteps();
});
this.scene.gridEngine.movementStopped().subscribe(({ charId }) => {
  if (charId === 'player') this.stopFootsteps();
});

private startFootsteps(): void {
  if (!this.footstepSound.isPlaying) {
    this.footstepSound.play({ loop: true, volume: this.sfxVolume * 0.5 });
  }
}
private stopFootsteps(): void {
  if (this.footstepSound.isPlaying) {
    this.footstepSound.stop();
  }
}
```

### Pattern 5: Audio Ducking on Dialogue
**What:** Reduce BGM and ambient volume to ~50% when dialogue opens, restore when it closes.
**When to use:** D-07 requires this for dialogue immersion.
**Example:**
```typescript
private duck(): void {
  if (this.isDucked) return;
  this.isDucked = true;
  const duckLevel = 0.5;
  // Tween all active BGM and ambient to half their current volume
  if (this.currentBGMSound?.isPlaying) {
    this.scene.tweens.add({ targets: this.currentBGMSound, volume: this.musicVolume * duckLevel, duration: 300 });
  }
  for (const amb of this.activeAmbientSounds) {
    if (amb.isPlaying) {
      this.scene.tweens.add({ targets: amb, volume: amb.volume * duckLevel, duration: 300 });
    }
  }
}

private unduck(): void {
  if (!this.isDucked) return;
  this.isDucked = false;
  // Restore volumes
  if (this.currentBGMSound?.isPlaying) {
    this.scene.tweens.add({ targets: this.currentBGMSound, volume: this.musicVolume, duration: 300 });
  }
  // ... restore ambient volumes similarly
}
```

### Anti-Patterns to Avoid
- **Creating new Sound instances per play:** Use `this.sound.add()` once in init, then `sound.play()` repeatedly. Creating per-play wastes memory and causes audio glitches.
- **Destroying sounds on scene restart:** AudioManager must persist in registry. Sound instances survive scene restarts because they belong to the global Phaser Sound Manager, NOT to individual scenes.
- **Calling audio methods from game systems directly:** Use EventsCenter. Direct coupling makes testing harder and creates import chains.
- **Using `this.sound.play(key)` for looping audio:** This creates a fire-and-forget sound with no reference. Always use `this.sound.add()` for any sound you need to stop, fade, or control.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Audio crossfade | Custom requestAnimationFrame volume interpolation | Phaser Tween system (`scene.tweens.add({ targets: sound, volume })`) | Tweens handle easing, cancellation, overlap; hand-rolling misses edge cases |
| Browser autoplay unlock | Manual click handler to resume AudioContext | Phaser Sound Manager auto-unlock (built-in) | Phaser already handles this on first user gesture; duplicating it causes double-play bugs |
| Audio sprite system | Marker-based SFX packing | Individual MP3 files per SFX | With only ~9 SFX files at tiny sizes, sprite packing adds complexity with no measurable benefit at this scale |
| Spatial/positional audio | Custom distance-based volume | Zone-based ambient switching via EventsCenter | Map is small enough that zone-based switching (4 zones) captures the spatial feel without real positional audio math |

**Key insight:** Phaser 3's Sound Manager already handles 95% of what this phase needs. The only custom code is the AudioManager orchestration layer that decides WHAT plays WHEN -- the HOW (playback, volume, looping) is all Phaser built-in.

## Common Pitfalls

### Pitfall 1: Sound Instances Not Surviving Scene Restart
**What goes wrong:** Audio stops abruptly when WorldScene restarts (outdoor <-> interior transition) because the scene's local references are destroyed.
**Why it happens:** Phaser Sound Manager is global (game-level), but scene-local variables pointing to sounds are lost on restart.
**How to avoid:** Store AudioManager in Phaser's registry (existing pattern). AudioManager holds references to sound instances. On scene restart, retrieve AudioManager from registry and call `setScene(this)` to update the tween-capable scene reference.
**Warning signs:** Music cutting out during building enter/exit transitions.

### Pitfall 2: Overlapping Crossfade Tweens
**What goes wrong:** Rapid zone changes (player running through zones) spawn multiple simultaneous crossfade tweens on the same sound, causing volume to jump erratically.
**Why it happens:** Each zone boundary crossing starts a new tween without cancelling the previous one.
**How to avoid:** Track active crossfade tweens and kill them before starting new ones. Use a `currentCrossfadeTween` reference: `this.currentCrossfadeTween?.stop(); this.currentCrossfadeTween = scene.tweens.add(...)`.
**Warning signs:** Volume pumping or sounds not reaching target volume.

### Pitfall 3: Volume Settings Not Applying to Active Sounds
**What goes wrong:** Player changes volume in SettingsPanel but currently-playing music/ambient doesn't change.
**Why it happens:** SettingsPanel updates its internal state but nothing propagates to AudioManager.
**How to avoid:** Wire SettingsPanel.adjustValue() to emit a settings-changed event (or have AudioManager poll registry). AudioManager.setMusicVolume(v) must update both the stored volume AND the currently-playing sound's volume immediately.
**Warning signs:** Slider moves but audio volume doesn't change until next track starts.

### Pitfall 4: Footstep Sound Playing After Scene Restart
**What goes wrong:** Footstep loop continues playing during interior transition because the movement subscription wasn't cleaned up.
**Why it happens:** Grid Engine subscriptions and EventsCenter listeners leak across scene restarts if not cleaned up in shutdown().
**How to avoid:** Stop footstep sound in AudioManager.onSceneShutdown(). Remove Grid Engine movement subscriptions. Same cleanup pattern as WorldScene.shutdown() already does for touch handlers.
**Warning signs:** Footstep sounds playing during fade-to-black or in wrong scene.

### Pitfall 5: Dialogue Tick SFX Rapid-Firing
**What goes wrong:** The typewriter effect plays the dialogue-tick sound for every character, creating an unpleasant buzz.
**Why it happens:** TextTyping plugin calls back per character at 30ms intervals.
**How to avoid:** Throttle dialogue tick to play every Nth character (e.g., every 3rd-4th character) or on a fixed interval (e.g., every 80-100ms) regardless of typing speed.
**Warning signs:** Buzzing or clicking noise during dialogue.

### Pitfall 6: Save State Not Including Audio Settings
**What goes wrong:** Player adjusts volume, saves, loads -- volume resets to default.
**Why it happens:** WorldScene.performAutoSave() and performManualSave() currently hardcode `settings: { musicVolume: 100, sfxVolume: 100, runDefault: false }` instead of reading actual settings.
**How to avoid:** Read AudioManager's current volume settings when building GameState for save. Note: GameState.settings.musicVolume is typed as `number` -- need to decide if 0-1 float or 0-100 integer (current hardcoded values use 100, SettingsPanel uses 0-1).
**Warning signs:** Volume always resets to max on game load.

## Code Examples

### Loading Audio in BootScene
```typescript
// Source: Phaser 3 docs (https://docs.phaser.io/phaser/concepts/audio)
// Add to BootScene.preload() after existing asset loads:

// BGM
this.load.audio('bgm-title', 'assets/audio/bgm/title-theme.mp3');
this.load.audio('bgm-outdoor', 'assets/audio/bgm/outdoor-theme.mp3');
this.load.audio('bgm-interior', 'assets/audio/bgm/interior-theme.mp3');

// SFX
this.load.audio('sfx-footstep', 'assets/audio/sfx/footstep.mp3');
this.load.audio('sfx-door-open', 'assets/audio/sfx/door-open.mp3');
this.load.audio('sfx-door-close', 'assets/audio/sfx/door-close.mp3');
this.load.audio('sfx-npc-chime', 'assets/audio/sfx/npc-chime.mp3');
this.load.audio('sfx-menu-open', 'assets/audio/sfx/menu-open.mp3');
this.load.audio('sfx-menu-close', 'assets/audio/sfx/menu-close.mp3');
this.load.audio('sfx-dialogue-tick', 'assets/audio/sfx/dialogue-tick.mp3');
this.load.audio('sfx-item-collected', 'assets/audio/sfx/item-collected.mp3');
this.load.audio('sfx-quest-complete', 'assets/audio/sfx/quest-complete.mp3');

// Ambient
this.load.audio('amb-city-base', 'assets/audio/ambient/city-base.mp3');
this.load.audio('amb-cubbon-park', 'assets/audio/ambient/cubbon-park.mp3');
this.load.audio('amb-metro-interior', 'assets/audio/ambient/metro-interior.mp3');
this.load.audio('amb-shop-interior', 'assets/audio/ambient/shop-interior.mp3');
```

### AudioManager Skeleton
```typescript
// Source: Project patterns (registry singleton, EventsCenter subscription)
export class AudioManager {
  private scene: Phaser.Scene;
  private soundManager: Phaser.Sound.BaseSoundManager;

  // BGM state
  private bgmTracks: Record<string, Phaser.Sound.BaseSound> = {};
  private currentBGMKey: string | null = null;
  private musicVolume: number = 0.7;

  // SFX
  private sfx: Record<string, Phaser.Sound.BaseSound> = {};
  private sfxVolume: number = 0.7;

  // Ambient layers
  private ambientBase: Phaser.Sound.BaseSound | null = null;
  private ambientOverlay: Phaser.Sound.BaseSound | null = null;
  private currentAmbientZone: string | null = null;

  // Ducking state
  private isDucked: boolean = false;

  // Active tweens (for cancellation)
  private activeTweens: Phaser.Tweens.Tween[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.soundManager = scene.sound;
    this.initSounds();
    this.wireEvents();
  }

  setScene(scene: Phaser.Scene): void {
    this.scene = scene;
    // Cancel any active tweens from the old scene
    this.activeTweens.forEach(t => t.stop());
    this.activeTweens = [];
  }

  // ... methods for BGM, SFX, ambient, ducking, settings
}
```

### Zone-to-Ambient Mapping
```typescript
// Maps landmark IDs from mg-road.json to ambient zones
private readonly ZONE_AMBIENT_MAP: Record<string, string> = {
  'cubbon-park': 'amb-cubbon-park',
  'mg-road-metro': 'amb-city-base',  // metro exterior = city sounds
  'chinnaswamy-stadium': 'amb-city-base',
  'ub-city': 'amb-city-base',
  'vidhana-soudha': 'amb-city-base',
};

// Interior ID to ambient mapping
private readonly INTERIOR_AMBIENT_MAP: Record<string, string> = {
  'interior-metro': 'amb-metro-interior',
  'interior-coffee': 'amb-shop-interior',
  'interior-ubcity': 'amb-shop-interior',
  'interior-library': 'amb-shop-interior',
};
```

### Wiring SettingsPanel to AudioManager
```typescript
// Source: Existing SettingsPanel.adjustValue() + project EventsCenter pattern
// Option: Add a SETTINGS_CHANGED event to constants.ts, or have
// PauseMenu.close() read settings and emit them.

// In UIScene, when pause menu closes:
eventsCenter.on(EVENTS.PAUSE_MENU_CLOSE, () => {
  const settings = settingsPanel.getSettings();
  const am = this.registry.get('audioManager') as AudioManager | undefined;
  if (am) {
    am.setMusicVolume(settings.musicVolume);
    am.setSFXVolume(settings.sfxVolume);
  }
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| HTML5 Audio tags | Web Audio API (Phaser default) | Phaser 3.0+ | Better latency, multiple simultaneous sounds, volume control |
| OGG + MP3 dual format | MP3-only | All modern browsers support MP3 | Simplifies asset pipeline (per D-01) |
| Audio sprites for SFX | Individual MP3 files | With modern HTTP/2 | Parallel loading eliminates the sprite-packing benefit for small file counts |
| Rex SoundFade plugin (global) | Direct import of SoundFade utility | Available in phaser3-rex-plugins | Can import `SoundFade` directly without registering as global plugin |

**Deprecated/outdated:**
- HTML5 Audio fallback mode: Still exists in Phaser but unnecessary for modern browsers. Do not add `disableWebAudio: true`.
- `this.sound.play(key)` fire-and-forget: Works for quick one-shots but creates orphaned sound instances. Use `this.sound.add()` + `.play()` for anything needing control.

## Open Questions

1. **Audio asset generation workflow**
   - What we know: D-02 specifies AI-generated assets (Suno for BGM, ElevenLabs for SFX/ambient)
   - What's unclear: Who generates these and when? Are they checked into git or generated at build time?
   - Recommendation: Generate externally, commit MP3 files to `public/assets/audio/`. Small enough (~2-4MB total) to commit. Planner should include a task for creating placeholder/silence MP3 files so the AudioManager can be developed and tested before real assets arrive.

2. **Volume scale consistency (0-1 vs 0-100)**
   - What we know: SettingsPanel uses 0-1 floats. GameState.settings uses `number` type. Current hardcoded save values are 100.
   - What's unclear: Whether to normalize everything to 0-1 or keep the save format as 0-100 for display.
   - Recommendation: Use 0-1 everywhere (Phaser's native scale). Fix the hardcoded 100 values in WorldScene save methods to read from AudioManager. This is a bug fix that should happen in this phase.

3. **Grid Engine movement subscription cleanup**
   - What we know: Grid Engine provides `movementStarted()` and `movementStopped()` observables for footstep gating.
   - What's unclear: Whether these subscriptions survive scene restart and need explicit unsubscribe.
   - Recommendation: Store subscription references and unsubscribe in shutdown(). Verify by testing outdoor->interior->outdoor transitions don't leak footstep sounds.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest 4.1.0 (unit) + playwright 1.58.2 (e2e) |
| Config file | vitest.config.ts (unit), playwright.config.ts (e2e) |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npm run test:all` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AUDO-01 | SFX plays for key actions | unit | `npx vitest run tests/unit/audio-manager.test.ts -t "sfx" -x` | Wave 0 |
| AUDO-01 | Footstep loop starts/stops with movement | unit | `npx vitest run tests/unit/audio-manager.test.ts -t "footstep" -x` | Wave 0 |
| AUDO-02 | Correct BGM plays per area | unit | `npx vitest run tests/unit/audio-manager.test.ts -t "bgm" -x` | Wave 0 |
| AUDO-03 | Music crossfades on transition | unit | `npx vitest run tests/unit/audio-manager.test.ts -t "crossfade" -x` | Wave 0 |
| AUDO-04 | Ambient layers switch per zone | unit | `npx vitest run tests/unit/audio-manager.test.ts -t "ambient" -x` | Wave 0 |
| AUDO-04 | Ambient crossfade timing | unit | `npx vitest run tests/unit/audio-manager.test.ts -t "ambient crossfade" -x` | Wave 0 |
| ALL | Audio ducking during dialogue | unit | `npx vitest run tests/unit/audio-manager.test.ts -t "duck" -x` | Wave 0 |
| ALL | Settings panel wires to AudioManager | unit | `npx vitest run tests/unit/audio-manager.test.ts -t "settings" -x` | Wave 0 |
| ALL | Audio loads in BootScene | e2e | `npx playwright test tests/e2e/audio-boot.spec.ts` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npm run test:all`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/unit/audio-manager.test.ts` -- covers AUDO-01 through AUDO-04, ducking, settings wiring
- [ ] `tests/e2e/audio-boot.spec.ts` -- covers audio asset loading verification (checks Phaser sound cache keys exist after boot)
- [ ] AudioManager must be testable without Phaser by mocking the sound manager interface (same pattern as existing managers -- no Phaser imports in pure logic)

## Sources

### Primary (HIGH confidence)
- [Phaser 3 Official Audio Docs](https://docs.phaser.io/phaser/concepts/audio) -- Sound Manager API, loading, playback, configuration, autoplay handling
- [Phaser 3 Rex Notes - Audio](https://rexrainbow.github.io/phaser3-rex-notes/docs/site/audio/) -- Complete API reference for sound.add(), play(), volume, loop, events
- [Phaser 3 Rex Notes - Fade Volume](https://rexrainbow.github.io/phaser3-rex-notes/docs/site/fadevolume/) -- SoundFade plugin API and direct import pattern

### Secondary (MEDIUM confidence)
- [Phaser Forum - Sound Fade](https://phaser.discourse.group/t/solved-fade-out-sound/3289) -- Community patterns for fadeOut/fadeIn with tweens
- [Phaser WebAudioSoundManager API](https://docs.phaser.io/api-documentation/class/sound-webaudiosoundmanager) -- Manager-level methods: get(), getAll(), stopByKey()

### Tertiary (LOW confidence)
- None -- all findings verified against official Phaser documentation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- Phaser 3.90.0 Sound Manager verified against official docs, already installed
- Architecture: HIGH -- AudioManager pattern follows established project conventions (registry singleton, EventsCenter events, pure-logic testability)
- Pitfalls: HIGH -- scene restart persistence, crossfade overlap, and settings wiring are all derivable from existing codebase patterns and Phaser documentation
- Audio asset pipeline: MEDIUM -- MP3 preloading is straightforward, but asset generation workflow (Suno/ElevenLabs) is external to the codebase

**Research date:** 2026-03-23
**Valid until:** 2026-04-23 (stable -- Phaser audio API hasn't changed significantly in years)
