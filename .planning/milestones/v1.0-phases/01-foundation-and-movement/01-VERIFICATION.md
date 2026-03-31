---
phase: 01-foundation-and-movement
verified: 2026-03-20T00:00:00Z
status: human_needed
score: 23/23 must-haves verified
re_verification: false
human_verification:
  - test: "Open http://localhost:5173 after npm run dev and verify the title screen shows 'RECURRING WORLD' text and a blinking 'PRESS START' prompt over a pixel art background"
    expected: "Title screen with Bengaluru skyline art, game title, subtitle 'Bengaluru Explorer', and blinking prompt are all visible"
    why_human: "Canvas pixel art rendering cannot be verified programmatically -- toHaveScreenshot requires baseline images not yet established"
  - test: "Press any key from the title screen, type a name in the HTML input field, select a gender sprite, press Enter -- verify the world scene loads showing the MG Road tilemap"
    expected: "Scene chain works Boot->Title->NameEntry->World. World renders the tilemap with player sprite at approximately the Metro station coordinates"
    why_human: "Scene transition success and tilemap visual rendering require visual inspection"
  - test: "Walk the player with arrow keys into a building wall and into a map edge"
    expected: "Player is blocked by buildings and cannot walk past map edge (camera also stops)"
    why_human: "Collision and camera-bound behavior requires live interaction; Grid Engine collision depends on ge_collide tile property being read at runtime"
  - test: "Hold Shift while moving and verify player moves noticeably faster; release Shift to return to walk speed"
    expected: "Run speed is visually 2x walk speed; the try/catch setSpeed fallback does not produce an error in the console"
    why_human: "Speed change requires live playback; setSpeed() availability with grid-engine@2.48.2 cannot be confirmed statically"
  - test: "Stand still with the player and observe for idle animation (subtle breathing or weight-shift frames)"
    expected: "Player sprite cycles through idle frames (not frozen on one frame) when no movement key is held"
    why_human: "Animation playback requires visual inspection of the canvas"
  - test: "On a mobile device or Chrome DevTools device emulation, tap the left half of the screen"
    expected: "Floating joystick appears at the tap position; A and B buttons appear bottom-right; central gameplay area is not obscured"
    why_human: "Touch device behavior and positioning of semi-transparent controls require real or emulated touch input"
  - test: "Hold the B button while using the joystick and verify the player runs at 2x speed"
    expected: "B button emits RUN_BUTTON_DOWN, WorldScene receives it and doubles speed; player visually moves faster"
    why_human: "Touch-to-event-to-scene wiring requires live interaction on touch input"
  - test: "Look at the rendered MG Road tilemap and identify the 5 landmarks: Chinnaswamy Stadium, UB City, Cubbon Park, Vidhana Soudha, MG Road Metro Station"
    expected: "Each landmark is visually recognizable -- distinctive pixel art, different tile styles, placed at geographically approximate positions"
    why_human: "Pixel art quality and recognizability of a Bengaluru neighborhood is a subjective visual judgment"
---

# Phase 1: Foundation and Movement Verification Report

**Phase Goal:** Player can walk around a recognizable MG Road / CBD neighborhood rendered in GBA-style pixel art, on both desktop (keyboard) and mobile (touch controls)
**Verified:** 2026-03-20
**Status:** human_needed — all automated checks passed; 8 items require human/visual verification
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | npm run dev starts a Vite dev server that opens a black 480x320 Phaser canvas | VERIFIED | Build succeeds (`dist/` produced in 3.93s), config has `width: 480, height: 320, pixelArt: true` |
| 2 | npm run build produces a dist/ folder with a working production bundle | VERIFIED | `dist/index.html`, `dist/assets/index-*.js`, `dist/assets/phaser-*.js` all present |
| 3 | TypeScript compilation has zero errors | VERIFIED | `npx tsc --noEmit` exits with no output (zero errors) |
| 4 | npx vitest run exits with 0 — 4 test files, 29 tests, all pass | VERIFIED | 29/29 unit tests pass across constants, movement, collision, player-speed |
| 5 | Player moves tile-by-tile in 4 directions using keyboard | VERIFIED | `WorldScene.update()` calls `gridEngine.move('player', direction)` from `getMovementDirection()`, GridEngine configured with `numberOfDirections: FOUR` |
| 6 | Player sprite has walk animations for all 4 directions (3 frames each) | VERIFIED | `Player.registerAnimations()` creates `walk-down`, `walk-left`, `walk-right`, `walk-up` with rows 0-3 from 48x96 spritesheet |
| 7 | Player cannot walk through walls / impassable tiles | VERIFIED (runtime?) | `collisionTilePropertyName: 'ge_collide'` set in GridEngine config; collision layer has 819 tiles with GID 2 which has `ge_collide: true`; requires runtime confirmation |
| 8 | Camera follows the player and stays bounded within map edges | VERIFIED | `cameras.main.startFollow(player.sprite, true)`, `cameras.main.setBounds(0, 0, tilemap.widthInPixels, tilemap.heightInPixels)`, `setRoundPixels(true)` |
| 9 | Player can toggle running to move at 2x speed | VERIFIED | `cursors.shift?.isDown \|\| runButtonHeld` → `player.updateSpeed(isRunning)` → `gridEngine.setSpeed('player', speed)` with try/catch fallback |
| 10 | MG Road / CBD zone is explorable with recognizable pixel art of 5 landmarks | VERIFIED (visual?) | 60x60 tilemap exists; zones layer has all 5 landmark objects; tilesets are extruded GBA-style PNGs; visual quality requires human check |
| 11 | Game runs in a web browser (PLAT-01) | VERIFIED | Phaser.AUTO + Vite bundle + `dist/index.html` produced cleanly |
| 12 | Virtual D-pad and action buttons appear on touch devices (PLAT-02) | VERIFIED | UIScene + TouchControls with rexVirtualJoystick plugin wired; buttons hidden until first touch |
| 13 | Touch controls do not obscure the central gameplay area (PLAT-03) | VERIFIED (visual?) | Joystick spawns on left half (`pointer.x < GAME_WIDTH / 2`); A/B buttons positioned at `GAME_WIDTH - 40` and `GAME_WIDTH - 80`, `alpha: 0.6`; requires human verification of visual positioning |

**Score:** 13/13 truths have supporting implementation; 8 require visual/runtime human confirmation

---

## Required Artifacts

| Artifact | Status | Details |
|----------|--------|---------|
| `src/config.ts` | VERIFIED | Contains `pixelArt: true`, `antialias: false`, `roundPixels: true`, `GridEngine`, `InputTextPlugin`, `VirtualJoystickPlugin`, all 5 scenes registered |
| `src/main.ts` | VERIFIED | `new Phaser.Game(config)`, `__PHASER_GAME__` test hook |
| `src/utils/EventsCenter.ts` | VERIFIED | `export const eventsCenter = new Phaser.Events.EventEmitter()` |
| `src/utils/constants.ts` | VERIFIED | `TILE_SIZE`, `WALK_SPEED`, `RUN_SPEED`, `COLLISION_PROPERTY`, `SCENES`, `EVENTS`, `LAYERS`, `ASSETS` all present |
| `src/utils/types.ts` | VERIFIED | `PlayerState`, `ZoneConfig`, `TouchInputState` interfaces present |
| `vitest.config.ts` | VERIFIED | `tests/unit/**/*.test.ts` include pattern, `environment: 'node'` |
| `playwright.config.ts` | VERIFIED | `testDir: 'tests/e2e'`, `baseURL: 'http://localhost:5173'`, `webServer.command: 'npm run dev'` |
| `src/scenes/BootScene.ts` | VERIFIED | Progress bar, loads all 4 tilesets + tilemap + sprites + UI assets, transitions to TitleScene |
| `src/scenes/TitleScene.ts` | VERIFIED | `RECURRING WORLD` title, `Bengaluru Explorer` subtitle, `PRESS START` blinking tween, starts NameEntryScene |
| `src/scenes/NameEntryScene.ts` | VERIFIED | Rex InputText `maxLength: 12`, gender sprite selection, `registry.set('playerState', ...)`, `scene.start(SCENES.WORLD, playerState)` |
| `public/assets/sprites/player-male.png` | VERIFIED | 48x96px PNG (3 columns x 4 rows of 16x24 frames) |
| `public/assets/sprites/player-female.png` | VERIFIED | 48x96px PNG (3 columns x 4 rows of 16x24 frames) |
| `src/scenes/WorldScene.ts` | VERIFIED | Tilemap load, 4 tilesets with margin 1 spacing 2, GridEngine create with `ge_collide`, camera follow + bounds, keyboard + touch input, run toggle, idle animation trigger |
| `src/entities/Player.ts` | VERIFIED | `class Player`, `walkingAnimationMapping: 0`, walk animations all 4 directions, idle animations all 4 directions, `playIdleAnimation`, `getPlayerSpeed`, `getMovementDirection` exported |
| `src/scenes/UIScene.ts` | VERIFIED | `class UIScene`, `new TouchControls(this)`, `keydown-T` desktop toggle, `update()` delegates to touchControls |
| `src/ui/TouchControls.ts` | VERIFIED | `class TouchControls`, rexVirtualJoystick `dir: '4dir'`, `eventsCenter.emit(EVENTS.TOUCH_DIRECTION, ...)`, `EVENTS.RUN_BUTTON_DOWN/UP`, `GAME_WIDTH / 2` joystick zone, `setVisible(false)` initially |
| `public/assets/tilesets/ground.png` | VERIFIED | Extruded (1202 bytes vs raw 1008 bytes) |
| `public/assets/tilesets/buildings.png` | VERIFIED | Extruded (1998 bytes vs raw 1507 bytes) |
| `public/assets/tilesets/nature.png` | VERIFIED | Extruded (2343 bytes vs raw 1517 bytes) |
| `public/assets/tilesets/decorations.png` | VERIFIED | Extruded (1554 bytes vs raw 1374 bytes) |
| `public/assets/tilemaps/mg-road.json` | VERIFIED | 60x60, tilewidth 16, 7 layers, 4 tilesets with margin 1 spacing 2, 819 collision tiles, `player-spawn` object, all 5 landmark zone objects |
| `src/data/zones/mg-road.json` | VERIFIED | `playerSpawn: {x:45, y:35}`, 5 landmarks with id/name/position/size |
| `scripts/extrude-tilesets.sh` | VERIFIED | Contains `tile-extruder`, `--tileWidth 16` |
| `raw-tilesets/` | VERIFIED | 4 raw PNGs present (ground, buildings, nature, decorations) |
| `public/assets/ui/joystick-base.png` | VERIFIED | Exists |
| `public/assets/ui/joystick-thumb.png` | VERIFIED | Exists |
| `public/assets/ui/button-a.png` | VERIFIED | Exists |
| `public/assets/ui/button-b.png` | VERIFIED | Exists |
| `public/assets/ui/title-bg.png` | VERIFIED | Exists |
| `.github/workflows/deploy.yml` | VERIFIED | `actions/deploy-pages@v4`, `npm run build`, `branches: ['main']`, `path: './dist'` |
| `tests/unit/constants.test.ts` | VERIFIED | `TILE_SIZE`, `WALK_SPEED`, `RUN_SPEED`, `COLLISION_PROPERTY` assertions pass |
| `tests/unit/movement.test.ts` | VERIFIED | Movement constants and direction priority assertions pass |
| `tests/unit/collision.test.ts` | VERIFIED | `ge_collide`, map boundary, spawn bounds assertions pass |
| `tests/unit/player-speed.test.ts` | VERIFIED | `getPlayerSpeed(false)==4`, `getPlayerSpeed(true)==8`, `getMovementDirection` assertions pass |
| `tests/e2e/game-boot.spec.ts` | VERIFIED | Contains `canvas`, `toBeVisible`, `__PHASER_GAME__`, `toBe(480)` |
| `tests/e2e/movement.spec.ts` | VERIFIED | Contains `keyboard.press`, `WorldScene`, `gridEngine` |
| `tests/e2e/camera.spec.ts` | VERIFIED | Contains `cameras`, `scrollX`, `_follow`, `startFollow` checks |
| `tests/e2e/landmarks.spec.ts` | VERIFIED | Contains zone metadata check for all 5 landmarks by ID |
| `tests/e2e/touch-controls.spec.ts` | VERIFIED | Contains `UIScene`, `toggle`, `pointerdown` tests |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/main.ts` | `src/config.ts` | `new Phaser.Game(config)` | WIRED | Line 4: `const game = new Phaser.Game(config)` |
| `src/config.ts` | `grid-engine` | GridEngine in scene plugins | WIRED | `plugin: GridEngine, mapping: 'gridEngine'` |
| `src/config.ts` | `VirtualJoystickPlugin` | global plugin `rexVirtualJoystick` | WIRED | `plugin: VirtualJoystickPlugin, start: true` |
| `src/scenes/BootScene.ts` | `src/scenes/TitleScene.ts` | `this.scene.start(SCENES.TITLE)` | WIRED | Line 94: `this.scene.start(SCENES.TITLE)` |
| `src/scenes/TitleScene.ts` | `src/scenes/NameEntryScene.ts` | `this.scene.start(SCENES.NAME_ENTRY)` | WIRED | Line 67: `this.scene.start(SCENES.NAME_ENTRY)` |
| `src/scenes/NameEntryScene.ts` | `WorldScene` | `this.scene.start(SCENES.WORLD, playerState)` | WIRED | Line 172: `this.scene.start(SCENES.WORLD, playerState)` |
| `src/scenes/WorldScene.ts` | `mg-road.json` | `this.make.tilemap({key: ASSETS.TILEMAP_MG_ROAD})` | WIRED | Line 54: `this.make.tilemap({ key: ASSETS.TILEMAP_MG_ROAD })` |
| `src/scenes/WorldScene.ts` | `grid-engine` | `this.gridEngine.create(tilemap, config)` | WIRED | Line 132: `this.gridEngine.create(tilemap, gridEngineConfig)` |
| `src/scenes/WorldScene.ts` | `src/entities/Player.ts` | `new Player(this, playerState)` | WIRED | Line 124: `this.player = new Player(this, playerState)` |
| `src/scenes/WorldScene.ts` | `src/scenes/UIScene.ts` | `this.scene.launch(SCENES.UI)` | WIRED | Line 159: `this.scene.launch(SCENES.UI)` |
| `src/entities/Player.ts` | `grid-engine` | `gridEngine.move('player', ...)` | WIRED | WorldScene line 197: `this.gridEngine.move('player', direction)` |
| `src/scenes/UIScene.ts` | `src/ui/TouchControls.ts` | `new TouchControls(this)` | WIRED | Line 20: `this.touchControls = new TouchControls(this)` |
| `src/ui/TouchControls.ts` | `src/utils/EventsCenter.ts` | `eventsCenter.emit(EVENTS.TOUCH_DIRECTION, ...)` | WIRED | Line 142: `eventsCenter.emit(EVENTS.TOUCH_DIRECTION, direction)` |
| `src/ui/TouchControls.ts` | `src/scenes/WorldScene.ts` | `EVENTS.RUN_BUTTON_DOWN/UP` via EventsCenter | WIRED | TouchControls emits on pointerdown/up; WorldScene listens in create() |

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| PLAT-01 | 01-01 | Game runs in a web browser (Chrome, Safari, Firefox) | SATISFIED | Vite build produces valid web bundle; `npm run build` exits 0 |
| MOVE-02 | 01-02 | Player sprite has walk animations for all 4 directions (min 3 frames each) | SATISFIED | `Player.registerAnimations()` creates 4 direction walk anims + 4 idle anims from 48x96 spritesheet |
| EXPL-01 | 01-03 | MG Road / CBD zone explorable with recognizable pixel art of 5 landmarks | SATISFIED (visual?) | 60x60 tilemap, zones layer with all 5 landmark objects; tileset PNGs extruded; visual quality human-only |
| MOVE-01 | 01-04 | Player can walk on 16x16 tile grid in 4 directions using keyboard or D-pad | SATISFIED | `getMovementDirection()` + `gridEngine.move()` + `NumberOfDirections.FOUR` |
| MOVE-03 | 01-04 | Player cannot walk through walls, buildings, water, or other impassable tiles | SATISFIED (runtime?) | `collisionTilePropertyName: 'ge_collide'`; 819 collision tiles with `ge_collide: true`; runtime confirmation needed |
| MOVE-04 | 01-04 | Camera follows player smoothly and stays bounded within map edges | SATISFIED | `cameras.main.startFollow(...)`, `cameras.main.setBounds(0, 0, width, height)` |
| MOVE-05 | 01-04 | Player can toggle running shoes to move at 2x speed | SATISFIED | `cursors.shift?.isDown` → `player.updateSpeed(true)` → `gridEngine.setSpeed('player', 8)` |
| PLAT-02 | 01-05 | Virtual D-pad and action button overlay appears on touch devices | SATISFIED (visual?) | TouchControls creates joystick + A/B buttons, hidden until first touch; visual appearance needs human check |
| PLAT-03 | 01-05 | Touch controls do not obscure the gameplay area | SATISFIED (visual?) | Controls positioned on left half (joystick) and bottom-right edges; `alpha: 0.6`; visual confirmation needed |

All 9 requirements from plans 01-01 through 01-05 are accounted for. No orphaned requirements found.

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/scenes/WorldScene.ts` | 173-181 | `try { gridEngine.setSpeed(...) } catch { console.warn(...) }` | Info | Speed-toggle silently degrades if `setSpeed()` is unavailable in the installed grid-engine version. Functional fallback exists but no explicit test confirms setSpeed() works with grid-engine@2.48.2 |
| `tests/unit/collision.test.ts` | 31-38 | Boundary test only checks that array values are `[0, 59]` — does not actually read tilemap collision data | Info | Test validates constants, not actual tilemap collision tiles at edges. Boundary collision relies on the `ge_collide` tileset property being applied in the tilemap, which only has 2 unique GIDs with that property |

No blockers found. No STUB or PLACEHOLDER patterns detected. No `return null` / empty implementations.

---

## Human Verification Required

### 1. Title Screen Visual Rendering

**Test:** Run `npm run dev`, open http://localhost:5173, observe the title screen.
**Expected:** Pixel art Bengaluru skyline background, "RECURRING WORLD" in monospace white, "Bengaluru Explorer" subtitle, "PRESS START" blinking at ~800ms interval.
**Why human:** Canvas pixel art cannot be verified without screenshot comparison baselines.

### 2. Scene Transition Chain

**Test:** From the title screen, press any key. On the name entry screen, type a name, select a gender, press Enter.
**Expected:** Boot -> Title -> NameEntry -> World scene chain completes without errors. World scene renders the tilemap with the player sprite visible near the Metro station coordinates.
**Why human:** Scene transitions and tilemap visual rendering require live observation.

### 3. Collision Behavior

**Test:** Walk the player directly into a building wall and into the map edge.
**Expected:** Player is visually blocked and cannot pass through. Camera stops at map edge while player can still move inward.
**Why human:** Grid Engine collision with `ge_collide` tile property must be confirmed working at runtime. The tilemap has only 2 tile GIDs with `ge_collide: true` (GID 2 from ground tileset). The collision layer placement against visible landmarks must be checked visually.

### 4. Walk/Run Speed Toggle

**Test:** Walk normally with arrow keys, then hold Shift while moving.
**Expected:** Noticeably faster movement (2x). No console errors about `setSpeed`.
**Why human:** Speed change is a visual/feel judgment. The `setSpeed()` catch block is silent — confirming it does NOT fire requires observation.

### 5. Idle Animation

**Test:** Stop moving and watch the player sprite.
**Expected:** Player subtly cycles between idle frames (not frozen). Different idle animation for each facing direction.
**Why human:** Frame-by-frame animation cycling must be observed on canvas.

### 6. Touch Joystick Appearance

**Test:** Open Chrome DevTools, enable mobile emulation (iPhone 12 or Pixel), tap the left half of the game canvas.
**Expected:** Floating joystick appears at tap position on the left side. A and B buttons are visible in the bottom-right. Central gameplay area (the tilemap) is not obscured.
**Why human:** Requires touch event emulation and visual positioning check.

### 7. Touch B Button Run

**Test:** On mobile emulation, use joystick to move the player. Hold the B button while moving.
**Expected:** Player moves at 2x speed while B is held, returns to walk speed when released.
**Why human:** Requires live touch input and visual speed confirmation.

### 8. MG Road Landmark Recognizability

**Test:** Walk around the MG Road tilemap and look for the 5 landmarks.
**Expected:** Chinnaswamy Stadium, UB City, Cubbon Park entrance, Vidhana Soudha, and MG Road Metro station are visually distinguishable and roughly in the correct geographic positions.
**Why human:** "Recognizable" is a subjective standard — GBA pixel art quality and Bengaluru authenticity require human judgment.

---

## Summary

Phase 1 automated verification is complete. All 23 structural must-haves are verified:

- Project scaffold (Phaser 3.90.0 + Vite + TypeScript) builds cleanly with zero TS errors
- All 5 scenes (Boot, Title, NameEntry, World, UI) exist with complete, non-stub implementations
- Scene chain is wired end-to-end: Boot -> Title -> NameEntry -> World (parallel: UI)
- Player sprites are correctly sized (48x96px, 3 cols x 4 rows)
- All 4 walk animations and 4 idle animations registered in Player.ts
- WorldScene wires Grid Engine with collision, camera bounds, keyboard + touch input, run toggle, idle trigger
- 60x60 tilemap with all 7 required layers, 4 extruded tilesets, 819 collision tiles with `ge_collide: true`, all 5 landmark zone objects
- UIScene + TouchControls wired: joystick emits `TOUCH_DIRECTION`, B button emits `RUN_BUTTON_DOWN/UP` via EventsCenter
- All 9 phase requirements have implementation evidence
- 29/29 unit tests pass; 5 E2E test files exist with substantive tests
- GitHub Pages deployment workflow configured

The 8 human verification items are visual/runtime quality checks, not structural gaps. The phase goal ("player can walk around a recognizable MG Road / CBD neighborhood in GBA-style pixel art, on both desktop and mobile") is architecturally complete. Visual quality of the pixel art tilesets and the behavior of Grid Engine collision at runtime are the primary items requiring human eyes.

---

_Verified: 2026-03-20_
_Verifier: Claude (gsd-verifier)_
