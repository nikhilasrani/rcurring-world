# Phase 1: Foundation and Movement - Research

**Researched:** 2026-03-20
**Domain:** Phaser 3 project scaffold, pixel-art rendering, tile-based movement, touch controls, GitHub Pages deployment
**Confidence:** HIGH

## Summary

Phase 1 establishes the entire technical foundation for the game: a Phaser 3.90.0 + Vite + TypeScript project scaffold with pixel-perfect GBA-style rendering at 480x320, Grid Engine plugin for tile-locked 4-direction movement, a ~60x60 Tiled map of MG Road/CBD with 5 recognizable landmarks, touch controls (floating joystick + A/B buttons), an opening sequence (title screen, name entry, gender pick), and GitHub Pages deployment via GitHub Actions. This is a greenfield project -- the repo is currently empty except for planning docs.

The core technical challenge is getting pixel-art rendering correct from the start. Integer scaling with letterboxing, tile extrusion to prevent bleeding, strict GBA palette enforcement, and the `pixelArt: true` Phaser config must all be locked down before any visual content is created. The Grid Engine plugin (v2.48.2) handles tile-locked movement, collision against Tiled layers, and smooth tile-to-tile interpolation, eliminating the need for custom movement code. The rexrainbow virtual joystick plugin provides a floating 4-direction joystick that maps directly to cursor keys. Name entry uses rexrainbow's InputText plugin which overlays a real HTML input element on the canvas, triggering native mobile keyboards.

**Primary recommendation:** Start with the official `phaserjs/template-vite-ts` template (Phaser 3.90.0, Vite 6.3.1, TypeScript 5.7.2), add Grid Engine and rexrainbow plugins, configure pixel-art rendering at 480x320 with `Phaser.Scale.FIT`, and establish the tile extrusion pipeline before creating any map content.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Faithful geographic layout of MG Road / CBD -- real street grid simplified into tiles
- Medium map size: ~60x60 tiles
- Player spawns at MG Road Metro station exit
- 5 landmarks: Chinnaswamy Stadium, UB City, Cubbon Park entrance, Vidhana Soudha, MG Road Metro station
- Hard boundaries at map edges (trees/fences/barriers)
- Visual elevation layers -- stairs, elevated paths, overpasses for depth
- GBA-quality placeholder tiles -- actual pixel art, not developer rectangles
- Tile source: mix of open-source base tiles + AI-generated tiles for Bengaluru-specific landmarks
- Strict GBA 15-bit color palette (32,768 colors, limited palette per sprite/tile)
- 16x16 pixel tiles
- 480x320 base resolution (2x GBA) -- 30x20 visible tiles
- Asset tasks broken down by area
- Dense, Pokemon-like decoration -- every tile has something
- Bengaluru-specific decorative elements (vendors, autos, vegetation, signage)
- Floating joystick: touch anywhere on left half to spawn, 4-direction snap
- A/B buttons in GBA style: A (interact/confirm) bottom-right, B (cancel/run) bottom-right
- Controls appear on first touch -- invisible until player touches
- B held while moving = run (2x speed)
- Toggle-able on desktop: hidden by default, dev shortcut shows them
- Generic young explorer in casual Bengaluru clothes
- Male/female choice at game start (side-by-side sprites, player picks one)
- Chibi sprite style (16x16 or 16x24)
- Player names their character via HTML text input field
- Walk animation: 4 directions, minimum 3 frames each (12 frames per gender)
- Idle animation: subtle loop when standing still
- Walk speed: ~0.25 seconds per tile (4 tiles/sec)
- Run speed: 2x walk (~0.125 seconds per tile, 8 tiles/sec)
- Smooth lerp interpolation between tiles
- Camera centered on player, stops at map edges
- Title screen -> Name entry -> Gender pick -> Spawn at MG Road Metro exit
- Integer scaling + letterbox: scale by whole numbers, black bars if aspect ratio doesn't match
- Support both landscape and portrait orientation on mobile
- GitHub Pages hosting with custom domain
- Auto-deploy on push to main via GitHub Actions
- Playwright boot + input + screenshot strategy
- Vitest for unit testing movement logic, collision, state

### Claude's Discretion
- Street layout: which specific streets to include between landmarks (faithful to real MG Road/CBD)
- Door treatment on buildings: solid blocks vs visible-but-locked doors (whatever sets up Phase 2 best)
- Time of day: fixed lighting -- whatever looks best for GBA aesthetic
- Landmark rendering technique: multi-tile buildings vs large sprites (whatever Phaser/Tiled handles best)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| MOVE-01 | Player can walk on a 16x16 tile grid in 4 directions using keyboard or D-pad | Grid Engine plugin handles tile-locked 4-direction movement; rexrainbow VirtualJoystick provides D-pad; both emit cursor key events |
| MOVE-02 | Player sprite has walk animations for all 4 directions (minimum 3 frames each) | Grid Engine's `walkingAnimationMapping` auto-plays walk animations from spritesheet rows; 4 directions x 3 frames = 12 frames per gender |
| MOVE-03 | Player cannot walk through walls, buildings, water, or other impassable tiles | Grid Engine reads `ge_collide` boolean property from Tiled tileset; dedicated collision layer with `collisionTilePropertyName` config |
| MOVE-04 | Camera follows the player smoothly and stays bounded within map edges | Phaser camera `startFollow()` + `setBounds()` to tilemap size; `roundPixels: true` prevents sub-pixel jitter |
| MOVE-05 | Player can toggle running shoes to move at 2x speed | Grid Engine `speed` property on CharacterData (default 4 tiles/sec); change to 8 tiles/sec when B/run held |
| EXPL-01 | MG Road/CBD zone explorable with recognizable pixel art of 5 landmarks | ~60x60 Tiled map with multi-tile landmark buildings; extruded tilesets; dense decoration layers |
| PLAT-01 | Game runs in a web browser (Chrome, Safari, Firefox) | Phaser 3.90.0 with `Phaser.AUTO` renderer (WebGL preferred, Canvas fallback); Vite build produces standard web bundle |
| PLAT-02 | Virtual D-pad and action button overlay appears on touch devices | rexrainbow VirtualJoystick (`dir: '4dir'`) + custom A/B button sprites; appear on first touch via pointer event |
| PLAT-03 | Touch controls do not obscure the gameplay area | Controls on dedicated UIScene (parallel scene, rendered above WorldScene); floating joystick on left half, buttons on bottom-right; semi-transparent; `fixed: true` pins to camera |
</phase_requirements>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Phaser | 3.90.0 | Game engine (rendering, physics, tilemaps, input, audio) | Final stable v3 release. `pixelArt: true` config. Native Tiled JSON parser. Official Vite template. Verified on npm 2026-03-20. |
| TypeScript | 5.7.2 | Language (match template pin) | Phaser template pins 5.7.2. Current npm latest is 5.9.3 but match the template to avoid compatibility issues. |
| Vite | 6.3.1 | Build tool / dev server (match template pin) | Phaser template pins 6.3.1. Current npm latest is 8.0.1 but Vite 8 uses Rolldown and is too new for production. Match the template. |
| grid-engine | 2.48.2 | Tile-locked movement, collision, pathfinding | Purpose-built Phaser 3 plugin. Handles smooth tile-to-tile lerp, Tiled collision properties (`ge_collide`), speed in tiles/sec, walking animation mapping. Active maintenance. |
| phaser3-rex-plugins | 1.80.19 | Virtual joystick, InputText, UI widgets | VirtualJoystick with `dir: '4dir'` and floating mode. InputText overlays real HTML input for mobile keyboard. 100+ plugins for Phase 2+. |
| Tiled | 1.12 | Tilemap editor | Industry standard. Phaser has built-in JSON parser. Custom properties for collision. Object layers for spawn points and zones. |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| tile-extruder | 2.1.1 | Extrude tileset edges to prevent tile bleeding | Run on EVERY tileset before importing into Phaser. Part of asset pipeline from day one. |
| vitest | 4.1.0 | Unit testing for movement logic, state | Test Grid Engine integration, collision logic, player state, scene transitions without rendering. |
| @playwright/test | 1.58.2 | E2E screenshot testing | Boot game, simulate input, screenshot compare. Verify game loads and player moves. |
| eslint | latest | Linting | Flat config with typescript-eslint. |
| prettier | latest | Code formatting | Consistent style. |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| grid-engine | Custom movement code | Grid Engine saves weeks of work on tile-locked movement, smooth interpolation, collision, pathfinding. Custom code only if Grid Engine proves limiting. |
| rexrainbow VirtualJoystick | Custom touch handler | Rex plugin handles floating spawn, 4-direction snap, cursor key simulation, force threshold. Building custom means reimplementing all of this. |
| rexrainbow InputText | Phaser keyboard text entry | Phaser's built-in keyboard text entry does NOT trigger mobile virtual keyboards. Rex InputText overlays a real HTML input element. Required for mobile name entry. |
| Vite 6.3.1 | Vite 8.0.1 | Vite 8 (Rolldown-powered) released 2026-03-12. Too new -- 8 days old at time of research. Template pins 6.3.1. Upgrade later when ecosystem stabilizes. |

**Installation:**
```bash
# Clone official Phaser template
npx degit phaserjs/template-vite-ts rcurring-world
cd rcurring-world
npm install

# Core game plugins
npm install grid-engine@2.48.2
npm install phaser3-rex-plugins@1.80.19

# Asset pipeline
npm install -D tile-extruder@2.1.1

# Testing
npm install -D vitest@4.1.0 @playwright/test@1.58.2
npx playwright install chromium

# Linting
npm install -D eslint @eslint/js typescript-eslint prettier
```

**Version verification:** All versions confirmed against npm registry on 2026-03-20.

## Architecture Patterns

### Recommended Project Structure
```
src/
  main.ts                    # Vite entry point, creates Phaser.Game
  config.ts                  # Phaser game config
  scenes/
    BootScene.ts             # Load shared assets, show loading bar
    TitleScene.ts            # Title screen, "Press Start"
    NameEntryScene.ts        # Name input + gender selection
    WorldScene.ts            # Tilemap + player + camera
    UIScene.ts               # Touch controls overlay (parallel)
  entities/
    Player.ts                # Player sprite, animation, speed state
  ui/
    TouchControls.ts         # Floating joystick + A/B buttons
  utils/
    EventsCenter.ts          # Singleton EventEmitter
    constants.ts             # Tile size, speeds, colors, event names
    types.ts                 # Shared TypeScript interfaces
  data/
    zones/
      mg-road.json           # Zone metadata (spawn point, landmarks)
public/
  assets/
    tilesets/                # Extruded tileset PNGs
    tilemaps/                # Tiled JSON exports
    sprites/                 # Player spritesheets (male/female)
    ui/                      # Touch control graphics
.github/
  workflows/
    deploy.yml               # GitHub Pages deployment
```

### Pattern 1: Parallel Scene Composition
**What:** WorldScene (tilemap + player + camera) and UIScene (touch controls, HUD) run simultaneously. UIScene renders above WorldScene.
**When to use:** Always -- separates gameplay from UI. Touch controls persist independent of world state.
**Example:**
```typescript
// In WorldScene.create()
this.scene.launch('UIScene');

// UIScene runs in parallel, handles touch input
// WorldScene handles game logic, tilemap, Grid Engine
```

### Pattern 2: Grid Engine Plugin Registration
**What:** Register Grid Engine as a Phaser scene plugin in game config. Initialize in WorldScene.create() with tilemap and character config.
**When to use:** From day one. This is the movement system.
**Example:**
```typescript
// config.ts
import { GridEngine } from 'grid-engine';

const config: Phaser.Types.Core.GameConfig = {
  // ... other config
  plugins: {
    scene: [
      {
        key: 'gridEngine',
        plugin: GridEngine,
        mapping: 'gridEngine',
      },
    ],
  },
};

// WorldScene.ts create()
const gridEngineConfig = {
  characters: [{
    id: 'player',
    sprite: this.playerSprite,
    walkingAnimationMapping: 0, // row index in spritesheet
    startPosition: { x: 30, y: 45 }, // MG Road Metro exit
    speed: 4,  // 4 tiles/sec = ~0.25s per tile (walk)
    facingDirection: Direction.DOWN,
  }],
  numberOfDirections: NumberOfDirections.FOUR,
  collisionTilePropertyName: 'ge_collide',
};
this.gridEngine.create(tilemap, gridEngineConfig);
```

### Pattern 3: Floating Touch Joystick
**What:** rexrainbow VirtualJoystick spawns at touch position on left half of screen, snaps to 4 directions, creates cursor key state.
**When to use:** For mobile touch movement input.
**Example:**
```typescript
// In UIScene or TouchControls.ts
const joystick = this.plugins.get('rexVirtualJoystick').add(this, {
  x: 0, y: 0,           // Will be repositioned on touch
  radius: 50,
  dir: '4dir',           // 4-direction snap (no diagonals)
  forceMin: 16,          // Dead zone threshold
  fixed: true,           // Fixed to camera (no scroll)
  enable: true,
});

// Floating: reposition on touch
this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
  if (pointer.x < this.scale.width / 2) { // Left half only
    joystick.setPosition(pointer.x, pointer.y);
    joystick.setVisible(true);
  }
});

// Read as cursor keys
const cursorKeys = joystick.createCursorKeys();
// cursorKeys.left.isDown, cursorKeys.right.isDown, etc.
```

### Pattern 4: EventsCenter Singleton
**What:** Standalone EventEmitter for cross-scene communication. Never use `this.game.events` (collides with Phaser internals).
**When to use:** All inter-scene communication.
**Example:**
```typescript
// utils/EventsCenter.ts
import Phaser from 'phaser';
export const eventsCenter = new Phaser.Events.EventEmitter();

// utils/constants.ts
export const EVENTS = {
  PLAYER_MOVE: 'player-move',
  PLAYER_RUN_TOGGLE: 'player-run-toggle',
  TOUCH_INPUT: 'touch-input',
  SCENE_READY: 'scene-ready',
} as const;
```

### Pattern 5: HTML Name Entry with Rex InputText
**What:** Overlay a real HTML input element on the canvas for name entry. Triggers native mobile keyboards.
**When to use:** Name entry scene. Must enable DOM in Phaser config.
**Example:**
```typescript
// In game config
const config = {
  // ...
  dom: { createContainer: true },
};

// In NameEntryScene.ts
const inputText = this.add.rexInputText(240, 160, 200, 40, {
  type: 'text',
  placeholder: 'Enter your name',
  maxLength: 12,
  fontSize: '16px',
  fontFamily: 'monospace',
  color: '#ffffff',
  backgroundColor: '#222222',
  border: '2px solid #ffffff',
});

inputText.on('textchange', (inputText: any) => {
  this.playerName = inputText.text;
});
```

### Anti-Patterns to Avoid
- **God Scene:** Do NOT put movement, UI, touch controls, and scene transitions all in one scene. Use parallel scenes.
- **Custom movement code:** Do NOT hand-roll tile-to-tile movement with tweens. Grid Engine handles smooth interpolation, collision, and animation.
- **`this.game.events` for custom events:** Collides with Phaser internals. Use EventsCenter singleton.
- **Non-extruded tilesets:** Will cause tile bleeding on every device. Extrude before importing.
- **Phaser keyboard-only text entry:** Will NOT trigger mobile virtual keyboards. Use Rex InputText.
- **Loading all assets in one scene for a 60x60 map:** Acceptable for Phase 1 single zone. But structure the loader to support zone-specific loading for Phase 2+.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Tile-locked movement with smooth interpolation | Custom tween-based movement between tiles | grid-engine plugin | Grid Engine handles collision, smooth lerp, walking animation, speed control, pathfinding. Custom code takes weeks and has edge cases. |
| 4-direction virtual joystick | Custom pointer math with angle snapping | rexrainbow VirtualJoystick (`dir: '4dir'`) | Handles floating spawn, dead zone, cursor key simulation, 4-direction snap. Battle-tested. |
| Mobile text input | Canvas-based character selection | rexrainbow InputText (HTML overlay) | Native HTML input triggers mobile virtual keyboard. Canvas-based input cannot trigger the keyboard. |
| Tileset bleeding fix | Manual pixel padding in image editor | tile-extruder CLI | Automates 1px edge extrusion for every tileset. Manual padding is error-prone and must be redone on every tileset change. |
| Pixel-perfect integer scaling | Custom canvas resize handler | Phaser Scale Manager (`Phaser.Scale.FIT`) | Phaser handles device pixel ratio, resize events, letterboxing, and center alignment. |
| Spritesheet walking animation | Manual frame-by-frame animation code | Grid Engine `walkingAnimationMapping` | Grid Engine auto-plays the correct directional walk animation based on spritesheet row index. |

**Key insight:** Phase 1's core mechanics (movement, collision, touch input, scaling) are all solved problems with mature plugins. The value is in map content and Bengaluru authenticity, not in re-implementing game engine fundamentals.

## Common Pitfalls

### Pitfall 1: Tileset Bleeding / Seam Artifacts
**What goes wrong:** Hairline gaps between tiles during camera movement, especially visible on mobile and high-DPI screens.
**Why it happens:** GPU texture sampling reads fractional pixel coordinates at tile boundaries, pulling colors from adjacent tiles in the tileset image.
**How to avoid:** Run `tile-extruder` on every tileset. Set `margin: 1, spacing: 2` in `map.addTilesetImage()`. Set `roundPixels: true` in game config and camera.
**Warning signs:** Flickering lines between tiles during scrolling. Lines appear only at certain zoom levels or devices.

### Pitfall 2: Pixel Art Scaling Destroys GBA Aesthetic
**What goes wrong:** Pixel art looks blurry or has inconsistent pixel sizes. Some pixels appear larger than others ("fat pixel" problem).
**Why it happens:** Non-integer scaling ratios. Phaser defaults to bilinear filtering. High-DPI devices add their own scaling layer.
**How to avoid:** Render at 480x320 base resolution. Use `pixelArt: true`, `roundPixels: true`, `antialias: false`. Use `Phaser.Scale.FIT` with `Phaser.Scale.CENTER_BOTH`. Accept letterboxing.
**Warning signs:** Art looks "soft" on any device. Different-sized pixels visible on screen.

### Pitfall 3: Grid Engine Collision Property Mismatch
**What goes wrong:** Player walks through walls or gets stuck on invisible geometry.
**Why it happens:** Tiled collision property name doesn't match Grid Engine config. Default property is `ge_collide` (boolean) but developers often use different names or forget to set it.
**How to avoid:** Use a single dedicated collision layer in Tiled. Set `ge_collide: true` on all blocking tiles in Tiled's tileset editor. Set `collisionTilePropertyName: 'ge_collide'` in GridEngineConfig. Note: Grid Engine treats missing tiles as blocking by default.
**Warning signs:** Player clips through some tiles but not others. Collision works in some areas but not others.

### Pitfall 4: Touch Controls Not Triggering on Mobile
**What goes wrong:** Floating joystick appears but doesn't register movement, or joystick and game canvas fight for touch events.
**Why it happens:** Touch input target misconfigured. Phaser's input system may consume pointer events before the joystick plugin receives them. UIScene and WorldScene competing for the same pointer.
**How to avoid:** Touch controls live in UIScene (separate from WorldScene). Use `fixed: true` on joystick to pin to camera. Set proper input targets in DOM config. Test on real mobile devices early.
**Warning signs:** Touch works in desktop browser dev tools mobile emulation but fails on actual phone.

### Pitfall 5: Tilemap Layer Count Performance
**What goes wrong:** Frame rate drops on mobile. Each tilemap layer is a separate rendering pass.
**Why it happens:** Developers create many layers in Tiled for organization (ground, detail, buildings, decorations, collision, above-player, etc.). Each visible layer costs GPU time.
**How to avoid:** Maximum 4 visible tile layers. Use object layers (zero render cost) for spawn points, zones, and decoration placement. Collision layer should be invisible (`visible: false`). Flatten decorative layers in Tiled where possible.
**Warning signs:** FPS drops in detailed map areas. Fine on desktop, stutters on mobile. More than 5 tile layers in the Tiled map.

### Pitfall 6: AI-Generated Tileset Inconsistency
**What goes wrong:** AI-generated tiles don't align to pixel grid, have anti-aliased edges, use inconsistent colors across tiles, don't seamlessly tile.
**Why it happens:** AI models don't understand pixel art constraints (strict grid alignment, limited palettes, no anti-aliasing, edge-pixel matching).
**How to avoid:** Treat AI output as first draft -- budget 30-40% for cleanup. Enforce strict color palette (run through quantization). Generate at exact 16x16 resolution (never downscale). Create 5-10 "golden" reference tiles early to anchor the art style.
**Warning signs:** Tiles look great alone but have visible seams in grid. Zooming reveals gradient edges. Color picker shows dozens of similar-but-different colors.

### Pitfall 7: Name Entry Fails on Mobile
**What goes wrong:** Players can't type their name because the virtual keyboard doesn't appear.
**Why it happens:** Phaser's built-in keyboard text entry captures keydown events on the canvas, which does not trigger mobile virtual keyboards. Only real HTML input elements trigger the keyboard.
**How to avoid:** Use rexrainbow InputText plugin (overlays real HTML `<input>` element). Enable `dom: { createContainer: true }` in Phaser config. Test name entry on real mobile devices.
**Warning signs:** Name entry works on desktop but keyboard never appears on phone.

## Code Examples

### Phaser Game Config (pixel-perfect 480x320)
```typescript
// src/config.ts
import Phaser from 'phaser';
import { GridEngine } from 'grid-engine';

export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 320;
export const TILE_SIZE = 16;

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  pixelArt: true,
  antialias: false,
  roundPixels: true,
  backgroundColor: '#000000',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  dom: {
    createContainer: true, // Required for Rex InputText (name entry)
  },
  plugins: {
    scene: [
      {
        key: 'gridEngine',
        plugin: GridEngine,
        mapping: 'gridEngine',
      },
    ],
  },
  scene: [BootScene, TitleScene, NameEntryScene, WorldScene, UIScene],
};
```
Source: Phaser official docs + Grid Engine installation docs + Rex InputText docs

### Grid Engine Movement with Speed Toggle
```typescript
// In WorldScene.ts update()
update() {
  const cursors = this.input.keyboard?.createCursorKeys();
  if (!cursors) return;

  // Also read virtual joystick state from UIScene via EventsCenter
  const isRunning = cursors.shift?.isDown || this.runButtonHeld;

  // Set speed: 4 tiles/sec walk, 8 tiles/sec run
  const speed = isRunning ? 8 : 4;
  this.gridEngine.setSpeed('player', speed);

  if (cursors.left.isDown || this.joystickLeft) {
    this.gridEngine.move('player', Direction.LEFT);
  } else if (cursors.right.isDown || this.joystickRight) {
    this.gridEngine.move('player', Direction.RIGHT);
  } else if (cursors.up.isDown || this.joystickUp) {
    this.gridEngine.move('player', Direction.UP);
  } else if (cursors.down.isDown || this.joystickDown) {
    this.gridEngine.move('player', Direction.DOWN);
  }
}
```
Source: Grid Engine API (CharacterData speed property, `setSpeed` method) + CONTEXT.md decisions

### Camera Follow with Map Bounds
```typescript
// In WorldScene.ts create(), after tilemap creation
const tilemap = this.make.tilemap({ key: 'mg-road' });
// ... add layers ...

// Camera follows player, bounded to map
this.cameras.main.startFollow(this.playerSprite, true);
this.cameras.main.setBounds(
  0, 0,
  tilemap.widthInPixels,
  tilemap.heightInPixels
);
this.cameras.main.setRoundPixels(true);
```
Source: Phaser camera docs

### Tile Extrusion Pipeline Command
```bash
# Run on every tileset before importing into Phaser
# Extrudes 1px border around each tile to prevent bleeding
npx tile-extruder \
  --tileWidth 16 \
  --tileHeight 16 \
  --input ./raw-tilesets/mg-road-ground.png \
  --output ./public/assets/tilesets/mg-road-ground.png

# When loading in Phaser, account for extrusion:
# map.addTilesetImage('mg-road-ground', 'mg-road-ground', 16, 16, 1, 2);
#                                         tileW tileH margin spacing
```
Source: tile-extruder npm docs, Phaser forum tileset bleeding discussion

### Tiled Map Layer Convention
```
Layer Name        | Type         | Purpose                          | Visible
ground            | Tile Layer   | Roads, grass, floor tiles        | Yes
ground-detail     | Tile Layer   | Road markings, puddles, cracks   | Yes
buildings         | Tile Layer   | Walls, structures at player level| Yes
above-player      | Tile Layer   | Tree canopy, roof overhangs      | Yes (depth above player)
collision         | Tile Layer   | Invisible blocking tiles         | No (ge_collide: true on tiles)
spawn-points      | Object Layer | Player spawn, landmark positions | N/A (data only)
zones             | Object Layer | Zone boundaries, landmark areas  | N/A (data only)
```
Maximum 4 visible tile layers for mobile performance. Collision layer is invisible. Object layers have zero render cost.

### GitHub Actions Deploy Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: ['main']
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v6
      - name: Set up Node
        uses: actions/setup-node@v6
        with:
          node-version: 22
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
      - name: Setup Pages
        uses: actions/configure-pages@v5
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v4
        with:
          path: './dist'
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```
Source: Vite official static deploy docs

### vite.config.ts with base path
```typescript
// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',  // Relative paths for GitHub Pages subdirectory
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ['phaser'],
        },
      },
    },
  },
});
```
Source: Vite docs + Phaser template conventions

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Custom tile movement with tweens | Grid Engine plugin (v2.48.2) | Active since 2021, mature v2 | Eliminates weeks of movement code. Handles interpolation, collision, pathfinding. |
| Raw Phaser keyboard for text input | Rex InputText (HTML overlay) | Rex plugins continuously updated | Only way to trigger mobile virtual keyboard. Phaser canvas keyboard cannot. |
| Manual tileset padding | tile-extruder (v2.1.1) | Stable, inactive maintenance but feature-complete | Automated 1px extrusion. Unchanged because the problem is solved. |
| Phaser.Scale.RESIZE for pixel art | Phaser.Scale.FIT + pixelArt:true + roundPixels | Phaser 3.x (stable approach) | FIT + letterbox is the only way to get consistent pixel sizes across all screen ratios. |
| Webpack for Phaser | Vite (official template) | 2023+ | Instant HMR, simpler config, official Phaser support. |

**Deprecated/outdated:**
- `phaser-grid-movement-plugin` npm package: Deprecated, renamed to `grid-engine`. Use `grid-engine` instead.
- Phaser.Scale.RESIZE for pixel art: Causes tile bleeding artifacts (GitHub issue #6674). Use FIT mode.
- Webpack-based Phaser templates: Phaser team officially moved to Vite.

## Open Questions

1. **Vite version: 6.3.1 (template) vs 8.0.1 (latest)**
   - What we know: Template pins 6.3.1. Vite 8 released 2026-03-12 using Rolldown (new bundler).
   - What's unclear: Whether Vite 8 breaks Phaser or plugin compatibility.
   - Recommendation: Use 6.3.1 (match template). Upgrade to Vite 8 is optional future work once ecosystem matures.

2. **Grid Engine `setSpeed` method availability**
   - What we know: CharacterData has `speed` property (default 4 tiles/sec). The API reference lists speed-related types.
   - What's unclear: Whether `setSpeed()` is a runtime method or speed can only be set at initialization.
   - Recommendation: Test during implementation. If `setSpeed()` doesn't exist, destroy and re-create the character with new speed config, or handle run speed via a wrapper.

3. **Landmark rendering: multi-tile buildings vs large sprites**
   - What we know: Tiled supports multi-tile structures across layers. Phaser can also render individual sprites from object layers.
   - What's unclear: Which approach looks better at 16x16 and is easier to author in Tiled.
   - Recommendation: Use multi-tile buildings on tile layers (standard approach). Tiled's tileset editor supports painting large structures tile by tile. Object-layer sprites are harder to align to the grid and don't benefit from tile extrusion.

4. **Integer scaling implementation**
   - What we know: `Phaser.Scale.FIT` respects aspect ratio with letterbox. `pixelArt: true` enables nearest-neighbor.
   - What's unclear: Whether FIT alone gives strict integer scaling (2x, 3x, 4x) or if it can produce non-integer scales that cause "fat pixel" artifacts.
   - Recommendation: Start with FIT mode. If pixel inconsistency appears, implement a custom resize handler that calculates the maximum integer scale factor and sets canvas size explicitly.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 (unit) + Playwright 1.58.2 (E2E) |
| Config file | None -- Wave 0 creates `vitest.config.ts` and `playwright.config.ts` |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run && npx playwright test` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| MOVE-01 | Player moves in 4 directions on tile grid | E2E (screenshot) | `npx playwright test tests/e2e/movement.spec.ts` | Wave 0 |
| MOVE-02 | Walk animations play for all 4 directions | E2E (screenshot) | `npx playwright test tests/e2e/movement.spec.ts` | Wave 0 |
| MOVE-03 | Player blocked by collision tiles | unit + E2E | `npx vitest run tests/unit/collision.test.ts` | Wave 0 |
| MOVE-04 | Camera follows player, bounded to map | E2E (screenshot) | `npx playwright test tests/e2e/camera.spec.ts` | Wave 0 |
| MOVE-05 | Run toggle doubles speed | unit | `npx vitest run tests/unit/player-speed.test.ts` | Wave 0 |
| EXPL-01 | 5 landmarks visible on map | E2E (screenshot) | `npx playwright test tests/e2e/landmarks.spec.ts` | Wave 0 |
| PLAT-01 | Game loads in Chrome/Safari/Firefox | E2E (multi-browser) | `npx playwright test --project=chromium --project=firefox --project=webkit` | Wave 0 |
| PLAT-02 | Touch controls appear on touch | E2E (touch sim) | `npx playwright test tests/e2e/touch-controls.spec.ts` | Wave 0 |
| PLAT-03 | Touch controls don't obscure gameplay | E2E (screenshot) | `npx playwright test tests/e2e/touch-controls.spec.ts` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run`
- **Per wave merge:** `npx vitest run && npx playwright test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `vitest.config.ts` -- Vitest config file
- [ ] `playwright.config.ts` -- Playwright config with chromium/firefox/webkit projects
- [ ] `tests/unit/collision.test.ts` -- collision logic tests
- [ ] `tests/unit/player-speed.test.ts` -- speed toggle tests
- [ ] `tests/e2e/movement.spec.ts` -- boot + move + screenshot
- [ ] `tests/e2e/camera.spec.ts` -- camera bounds verification
- [ ] `tests/e2e/landmarks.spec.ts` -- landmark visibility screenshots
- [ ] `tests/e2e/touch-controls.spec.ts` -- touch control appearance and positioning
- [ ] `tests/e2e/game-boot.spec.ts` -- basic game boot smoke test
- [ ] Framework install: `npm install -D vitest @playwright/test && npx playwright install`

**Note on Playwright canvas testing:** Phaser renders to a single `<canvas>` element. There are no DOM nodes for game objects. E2E tests must use:
1. Screenshot comparison (`toHaveScreenshot()`) for visual verification
2. `window.__testState` hook (dev-only) for programmatic state assertions
3. Coordinate-based canvas clicks for input simulation
4. Playwright Clock API to control game time for deterministic screenshots

Run Playwright tests only in Docker or match a single OS to avoid cross-platform pixel differences.

## Sources

### Primary (HIGH confidence)
- [Grid Engine Plugin](https://annoraaq.github.io/grid-engine/) -- v2.48.2, tile movement, collision, speed config
- [Grid Engine CharacterData API](https://annoraaq.github.io/grid-engine/api/interfaces/CharacterData) -- speed, startPosition, walkingAnimationMapping
- [Grid Engine Collision Docs](https://annoraaq.github.io/grid-engine/p/collision/index.html) -- ge_collide property, collision config
- [Grid Engine GitHub](https://github.com/Annoraaq/grid-engine) -- Active maintenance, v2.48.2
- [rexrainbow VirtualJoystick](https://rexrainbow.github.io/phaser3-rex-notes/docs/site/virtualjoystick/) -- dir:'4dir', floating mode, cursor keys
- [rexrainbow InputText](https://rexrainbow.github.io/phaser3-rex-notes/docs/site/inputtext/) -- HTML overlay input, mobile keyboard
- [Phaser template-vite-ts](https://github.com/phaserjs/template-vite-ts) -- Phaser 3.90.0, Vite 6.3.1, TS 5.7.2
- [tile-extruder](https://github.com/sporadic-labs/tile-extruder) -- v2.1.1, tileset bleeding fix
- [Vite static deploy guide](https://vite.dev/guide/static-deploy) -- GitHub Pages workflow YAML
- [Playwright visual comparisons](https://playwright.dev/docs/test-snapshots) -- toHaveScreenshot() API

### Secondary (MEDIUM confidence)
- [Phaser forum: floating joystick with Rex](https://phaser.discourse.group/t/how-to-make-floating-joystick-using-rexrainbows-joystick-plugin/9696) -- Floating joystick implementation pattern
- [Phaser forum: pixel art scaling](https://phaser.discourse.group/t/help-with-scaling-for-pixel-art/4782) -- Integer scaling discussion
- [Phaser forum: tileset bleeding](https://phaser.discourse.group/t/issue-with-tileset-bleeding/3911) -- Tile-extruder usage with Phaser
- [E2E Testing a Video Game (Medium)](https://medium.com/@philscode/e2e-testing-a-video-game-a12c7061385f) -- Canvas game testing patterns
- [Web game E2E with Playwright](https://barthpaleologue.github.io/Blog/posts/webgl-webgpu-playwright-setup/) -- WebGL canvas testing approach
- [pawap90/phaser3-ts-vite-eslint](https://github.com/pawap90/phaser3-ts-vite-eslint) -- Template with GitHub Pages deploy workflow

### Tertiary (LOW confidence)
- [playwright-canvas](https://github.com/satelllte/playwright-canvas) -- Canvas testing proof-of-concept
- Grid Engine `setSpeed` runtime method -- Inferred from API type `TileSizePerSecond` but not explicitly confirmed in retrieved docs. Needs implementation-time validation.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- All package versions verified on npm. Phaser template inspected. Grid Engine CharacterData API documented.
- Architecture: HIGH -- Parallel scene, Grid Engine plugin, EventsCenter, Rex joystick all follow documented patterns from official sources.
- Pitfalls: HIGH -- Tileset bleeding, pixel scaling, layer performance, mobile keyboard all verified across Phaser GitHub issues and forum posts.
- Touch controls: HIGH -- Rex VirtualJoystick `dir: '4dir'` confirmed in official docs. Floating mode documented in forum thread.
- Validation: MEDIUM -- Playwright canvas testing is inherently harder than DOM testing. Screenshot comparison works but requires OS-consistent test environments.

**Research date:** 2026-03-20
**Valid until:** 2026-04-20 (stable technologies, 30-day window)

---
*Phase: 01-foundation-and-movement*
*Research completed: 2026-03-20*
