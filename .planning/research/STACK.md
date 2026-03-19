# Stack Research

**Domain:** GBA-style tile-based exploration game (web + mobile)
**Researched:** 2026-03-19
**Confidence:** HIGH

## Decision: Phaser 3.90 (not Phaser 4)

The biggest stack decision is Phaser version. Phaser 4 RC6 is in late release-candidate stage with the official launch imminent. However, this project should use **Phaser 3.90.0** because:

1. **Plugin ecosystem depends on v3.** The rexrainbow plugin suite (`phaser3-rex-plugins`) -- which provides dialogue UI, quest management, board/grid utilities, and dozens of other RPG-essential plugins -- is Phaser 3 only. No Phaser 4 compatibility has been announced. Building dialogue, quest, and inventory UI from scratch would add months.
2. **Phaser 4's API is "the same" but not identical.** The Mesh Game Object was removed. Plugin compatibility is not guaranteed. The tilemap API carries over, but third-party plugins may break.
3. **v3.90 is the final, most stable Phaser 3 release.** It includes all accumulated fixes and the full feature set. It will not change.
4. **Migration path exists.** If Phaser 4 stabilizes and the rex plugin suite adds support, migration is feasible later -- the core API is intentionally compatible.

**When to reconsider:** If Phaser 4 hits stable 4.0.0+ AND rexrainbow publishes v4-compatible plugins, evaluate migration. Not before.

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Phaser | 3.90.0 | Game engine (rendering, physics, tilemaps, audio, input) | Final stable v3 release. Best plugin ecosystem. Native tilemap/Tiled support. WebGL + Canvas fallback. Pixel art config built-in (`pixelArt: true`, `antialias: false`). Phaser is the only HTML5 game engine with first-class Capacitor integration tutorials on both the Phaser and Capacitor official sites. |
| TypeScript | ~5.9 | Language | Static typing catches bugs in game logic, inventory systems, quest state machines. Phaser's official template uses TS. Vite handles it natively. |
| Vite | ~6.x (LTS) or 7.x | Build tool / dev server | Phaser's official template uses Vite. Instant HMR for rapid iteration. Vite 8 (released 2026-03-12) uses Rolldown but is brand new -- use Vite 6 or 7 for stability unless the official Phaser template has upgraded. Match whatever version the `phaserjs/template-vite-ts` template pins. |
| Capacitor | 8.x | Native mobile packaging (iOS/Android) | Latest stable. Official Phaser tutorial uses Capacitor. Swift Package Manager replaces CocoaPods for iOS. Requires Node 22+. Nearly 1M weekly downloads. |
| Tiled | 1.12 | Tilemap editor | Industry standard for 2D tile maps. Phaser has a built-in Tiled JSON parser. Supports orthogonal maps (GBA-style), layer groups, object layers for NPC spawn points and collision zones. Just released 2026-03-13 with rewritten Properties view. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| phaser3-rex-plugins | ~1.80.x | UI toolkit: dialogue boxes, quest system, text typing, buttons, grids, sliders, toast notifications | From day one. The single most important Phaser plugin. Provides `Dialog`, `TextTyping`, `Quest`, `BBCodeText`, `Buttons`, `GridTable`, and 100+ other plugins. Saves months of UI work. |
| phaser-animated-tiles | latest | Animated tile support for Tiled maps | When maps need animated water, flickering lights, or other tile animations defined in Tiled. Pass tilemap to plugin; it handles the rest. |
| @capacitor/preferences | 8.x | Persistent key-value storage on mobile | For save game data on mobile. Falls back to localStorage on web. More reliable than raw localStorage on iOS/Android where WebView storage can be cleared. |
| @capacitor/haptics | 8.x | Haptic feedback on mobile | When the player interacts with key events (quest completion, item pickup). Optional but adds tactile feel on mobile. |
| @capacitor/status-bar | 8.x | Control status bar visibility | Hide status bar for fullscreen immersive game experience on mobile. |
| @capacitor/screen-orientation | 8.x | Lock screen orientation | Lock to landscape mode (GBA aspect ratio). Critical for consistent game experience. |

### Asset Pipeline Tools

| Tool | Version | Purpose | Notes |
|------|---------|---------|-------|
| Aseprite | latest (v1.3+) | Pixel art sprite creation and animation | Industry standard for pixel art. Exports sprite sheets with JSON atlas files that Phaser loads natively via `createFromAseprite()`. Tag-based animation export. GBA palette support. AI agents can generate Aseprite-compatible sprite sheets. |
| Pixel Tools (Tilepack) | latest | Optimize Tiled TMX maps for Phaser | Strips unused tiles, outputs optimized JSON tilemaps. MIT license. Go binaries + npm Vite plugin with hot-reload. Created specifically for Phaser. |
| Pixel Tools (Atlaspack) | latest | Pack sprite sheets into texture atlases | Consolidates PNGs into optimized atlases with Phaser-compatible `.atlas` files. Reduces draw calls. |
| TexturePacker (alternative) | latest | Commercial texture atlas packer | If Atlaspack is insufficient. More mature but costs money. Phaser has native support. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Vitest | Unit/integration testing for game logic | Vitest is built on Vite -- zero config when already using Vite. Test quest state machines, inventory logic, NPC dialogue trees, and save/load serialization WITHOUT rendering. Jest-compatible API. |
| Playwright | E2E testing of the running game | For smoke tests: game boots, scenes load, player can move, NPCs are interactable. Use screenshot comparison (`toHaveScreenshot()`) for visual regression. Canvas interaction via coordinate-based clicks or `@bisonsoftware/canvas-grid-playwright` for grid-based tile interaction. |
| @vitest/ui | Visual test runner UI | Run `vitest --ui` for a browser-based test dashboard with hot-reload on spec file changes. |
| ESLint | Linting | Use flat config (`eslint.config.mjs`) with `typescript-eslint`. Standard since ESLint v9. |
| Prettier | Code formatting | Consistent style across the codebase. |

## Installation

```bash
# Core game engine + build tool
npm install phaser@3.90.0

# Phaser plugins
npm install phaser3-rex-plugins

# Capacitor core + CLI
npm install @capacitor/core@8
npm install -D @capacitor/cli@8

# Capacitor plugins (add after `npx cap init`)
npm install @capacitor/preferences@8
npm install @capacitor/haptics@8
npm install @capacitor/status-bar@8
npm install @capacitor/screen-orientation@8

# Dev dependencies
npm install -D typescript@~5.9
npm install -D vite
npm install -D vitest @vitest/ui
npm install -D playwright @playwright/test
npm install -D eslint @eslint/js typescript-eslint
npm install -D prettier

# Asset pipeline (optional, install when asset workflow starts)
npm install -D @nicholasgasior/pixel-tools
```

## Project Initialization

```bash
# 1. Clone official Phaser + Vite + TypeScript template
npx degit phaserjs/template-vite-ts rcurring-world
cd rcurring-world

# 2. Install dependencies
npm install

# 3. Initialize Capacitor
npx cap init "Recurring World" "com.recurringworld.app" --web-dir dist

# 4. Add mobile platforms
npx cap add android
npx cap add ios

# 5. Phaser config (in game config object)
# pixelArt: true, antialias: false, roundPixels: true
# scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Phaser 3.90 | Phaser 4.x | When Phaser 4 reaches stable release AND rexrainbow plugins confirm v4 support. Phaser 4 has a new "Beam" renderer with better mobile performance, but the plugin ecosystem is not ready. |
| Phaser 3.90 | Godot + HTML5 export | If the game needed complex physics, particle systems, or a visual editor. Not recommended here: Godot HTML5 export is heavier, harder to test with Playwright, and Capacitor integration is non-trivial. |
| Vite | Webpack | Never for new projects. Webpack is slower, more complex config. The Phaser team officially moved to Vite templates. |
| Capacitor 8 | Cordova | Never. Cordova is effectively deprecated. Capacitor is its successor by the same team (Ionic). |
| Capacitor 8 | Tauri | If targeting desktop only. Tauri uses system WebView which has inconsistent canvas/WebGL support. Capacitor is purpose-built for mobile. |
| TypeScript | JavaScript | If the team has zero TypeScript experience. Not recommended: game state management (quests, inventory, NPC data) is complex enough to warrant types. |
| Tiled | LDtk | If you prefer LDtk's "world" concept for multiple connected maps. Phaser's LDtk support is community-maintained and less mature than Tiled. Tiled is the safer choice. |
| Vitest | Jest | Never when already using Vite. Jest requires extra config for TypeScript/ESM. Vitest is drop-in. |
| Aseprite | Piskel (free), Libresprite (free) | If cost is a concern ($20 for Aseprite). Piskel is browser-based but lacks animation tag export. Libresprite is a free Aseprite fork but less maintained. Since assets are AI-generated, the tool matters less -- but Aseprite's JSON export is the most Phaser-compatible. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Phaser 4 RC (as of March 2026) | Release candidates, not stable. Rex plugins incompatible. Tilemap plugin ecosystem untested. Risk of breaking changes before final release. | Phaser 3.90.0 |
| Webpack | Slow builds, complex config. Phaser team abandoned it for Vite. | Vite |
| Cordova | Deprecated. No active development. Security vulnerabilities unfixed. | Capacitor 8 |
| React/Vue wrapper around Phaser | Adds unnecessary complexity. Phaser manages its own rendering loop. React bridge introduces state sync issues and performance overhead. UI should be Phaser-native (rex-plugins) not DOM-based. | Phaser scenes + rex UI plugins |
| Howler.js | Phaser has a built-in Sound Manager with Web Audio API support, HTML5 Audio fallback, spatial audio, and audio sprites. Adding Howler duplicates functionality and creates two audio contexts competing for resources. | Phaser's built-in `this.sound` API |
| ECS (bitECS) | Over-engineering for this game. ECS shines for thousands of entities with shared components (bullet-hell, RTS). An exploration game with ~50 NPCs and one player doesn't need it. Phaser's scene/game-object model maps naturally to zones + characters. | Phaser's built-in Scene + GameObject hierarchy |
| Phaser Editor 2D | Visual scene editor. Costs money and adds tooling complexity. Tiled handles map editing. Phaser scenes are simple enough to code directly for an exploration game. | Code-based scene composition + Tiled for maps |
| IndexedDB directly | Complex API for what amounts to save-game JSON. Over-engineering. | `@capacitor/preferences` (mobile) + `localStorage` (web) wrapped in a simple SaveManager class |

## Stack Patterns by Variant

**If starting from scratch (recommended):**
- Clone `phaserjs/template-vite-ts`
- Add Capacitor on top
- Structure: `src/scenes/`, `src/objects/`, `src/systems/`, `src/data/`, `assets/`

**If targeting web-only first, mobile later:**
- Skip Capacitor installation initially
- Add it when mobile packaging is needed (it is additive, not architectural)
- Use `localStorage` for saves initially, migrate to `@capacitor/preferences` when adding mobile

**If asset pipeline is AI-agent driven:**
- AI generates individual PNG sprites + Aseprite files
- Pixel Tools Atlaspack consolidates into texture atlases
- Pixel Tools Tilepack optimizes Tiled maps
- Vite plugin hot-reloads assets during development

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| phaser@3.90.0 | phaser3-rex-plugins@1.80.x | Rex plugins require phaser >= 3.80.0. Pin to 3.90.0 for stability. |
| phaser@3.90.0 | Tiled 1.12 JSON export | Phaser's Tiled parser supports all Tiled JSON features except "Collection of Images" tilesets. Use embedded tilesets only. Export as JSON, not TMX. Use CSV or Base64 (uncompressed) tile layer format. |
| Capacitor 8.x | Node.js >= 22 | Capacitor 8 requires Node 22+. Use Node 22 LTS. |
| Vite 6.x/7.x | TypeScript 5.9 | Vite handles TypeScript natively. No separate `ts-loader` needed. |
| Playwright 1.58 | Node.js >= 18 | Playwright supports Node 18+. No conflict with Node 22 requirement from Capacitor. |
| Vitest | Vite (same major) | Vitest shares Vite's config. Keep versions aligned. |
| @capacitor/preferences 8.x | @capacitor/core 8.x | All Capacitor plugins must match the core major version. |

## Key Configuration

### Phaser Game Config (pixel-perfect GBA style)

```typescript
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO, // WebGL preferred, Canvas fallback
  width: 240,        // GBA native resolution
  height: 160,       // GBA native resolution
  pixelArt: true,    // Nearest-neighbor scaling, no blur
  antialias: false,  // Crisp pixel edges
  roundPixels: true, // Snap to pixel grid
  scale: {
    mode: Phaser.Scale.FIT,           // Scale to fit container
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',  // Simple AABB collision for tile-based movement
    arcade: {
      gravity: { x: 0, y: 0 }, // Top-down, no gravity
      debug: false,
    },
  },
  scene: [BootScene, PreloadScene, WorldScene, DialogScene],
};
```

### Capacitor Config

```typescript
// capacitor.config.ts
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.recurringworld.app',
  appName: 'Recurring World',
  webDir: 'dist',
  server: {
    // During development, load from Vite dev server
    // url: 'http://localhost:8080',
    // cleartext: true,
  },
};

export default config;
```

## GBA Resolution and Scaling Strategy

The GameBoy Advance has a native resolution of **240x160 pixels**. The game should render at this resolution (or a clean multiple like 480x320) and use Phaser's `Scale.FIT` mode to fill the screen while maintaining aspect ratio. The `pixelArt: true` config ensures textures scale with nearest-neighbor interpolation, preserving the crisp pixel aesthetic at any display size.

For mobile devices, the camera viewport stays at 240x160 logical pixels. The canvas is scaled up to fill the device screen. Touch input coordinates are automatically mapped back to game coordinates by Phaser's input system.

## Sources

- [Phaser v3.90.0 Release](https://phaser.io/news/2025/05/phaser-v390-released) -- Confirmed as final v3 release (HIGH confidence)
- [Phaser v4 RC5 Status](https://phaser.io/news/2025/05/phaser-mega-update) -- v3 entering maintenance, v4 getting all new features (HIGH confidence)
- [Phaser Official Capacitor Tutorial](https://phaser.io/tutorials/bring-your-phaser-game-to-ios-and-android-with-capacitor) -- Uses Vite, Phaser 3.90, step-by-step mobile deployment (HIGH confidence)
- [Capacitor 8 Announcement](https://ionic.io/blog/announcing-capacitor-8) -- SPM default, Node 22 required, 930K weekly downloads (HIGH confidence)
- [Capacitor Games Guide](https://capacitorjs.com/docs/guides/games) -- Official docs recommend Phaser specifically (HIGH confidence)
- [Phaser Vite TypeScript Template](https://github.com/phaserjs/template-vite-ts) -- Phaser 3.90.0, Vite 6.3.1, TypeScript 5.7.2 (HIGH confidence)
- [phaser3-rex-plugins npm](https://www.npmjs.com/package/phaser3-rex-plugins) -- v1.80.19, requires Phaser >= 3.80.0 (HIGH confidence)
- [Rex Plugins Documentation](https://rexrainbow.github.io/phaser3-rex-notes/docs/site/plugin-list/) -- Comprehensive plugin list (HIGH confidence)
- [Tiled 1.12 Release](http://www.mapeditor.org/2026/03/13/tiled-1-12-released.html) -- Released 2026-03-13 (HIGH confidence)
- [Playwright 1.58 Release Notes](https://playwright.dev/docs/release-notes) -- Released 2026-01-30 (HIGH confidence)
- [TypeScript 5.9](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-9.html) -- Current stable (HIGH confidence)
- [Vite 8 Announcement](https://vite.dev/blog/announcing-vite8) -- Released 2026-03-12, Rolldown-powered (HIGH confidence)
- [Vitest + Phaser Guide](https://dev.to/davidmorais/testing-phaser-games-with-vitest-3kon) -- Practical testing approach (MEDIUM confidence)
- [Canvas Grid Playwright](https://www.npmjs.com/package/@bisonsoftware/canvas-grid-playwright) -- Grid-based canvas testing, experimental (LOW confidence)
- [Pixel Tools for Phaser](https://phaser.io/news/2026/03/pixel-tools-phaser-asset-pipeline) -- Tilepack + Atlaspack, MIT license (MEDIUM confidence)
- [Aseprite + Phaser Integration](https://saricden.github.io/aseprite-sprites-in-phaser3-5) -- createFromAseprite() API (HIGH confidence)
- [Phaser Tilemap Best Practices](https://medium.com/@michaelwesthadley/modular-game-worlds-in-phaser-3-tilemaps-1-958fc7e6bbd6) -- Tiled export requirements (HIGH confidence)

---
*Stack research for: GBA-style tile-based exploration game (Phaser + Capacitor + Playwright)*
*Researched: 2026-03-19*
