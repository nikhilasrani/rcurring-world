# Architecture Research

**Domain:** GBA-style tile-based exploration game (Phaser 3 + Tiled + Capacitor)
**Researched:** 2026-03-19
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Phaser Game Instance                        │
│  (Renderer, Animation Manager, Cache, Registry, Sound Manager)  │
├─────────────────────────────────────────────────────────────────┤
│                      Scene Layer (parallel)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  World Scene  │  │  UI Scene    │  │  Dialog Scene│          │
│  │  (per zone)   │  │  (HUD/menus) │  │  (overlays)  │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                  │                  │
│         └─────── EventsCenter (singleton) ───┘                  │
├─────────────────────────────────────────────────────────────────┤
│                     Game Systems Layer                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ Movement │  │   NPC    │  │  Quest   │  │ Inventory│       │
│  │ (Grid    │  │  Manager │  │  Manager │  │  Manager │       │
│  │ Engine)  │  │          │  │          │  │          │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
├─────────────────────────────────────────────────────────────────┤
│                     Data Layer                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Zone Data    │  │ NPC/Dialogue │  │  Save State  │          │
│  │ (Tiled JSON) │  │ (JSON defs)  │  │ (localStorage)│          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
├─────────────────────────────────────────────────────────────────┤
│                     Platform Layer                               │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐               │
│  │ Web (Vite) │  │ iOS (Cap)  │  │ Android    │               │
│  │            │  │            │  │ (Cap)      │               │
│  └────────────┘  └────────────┘  └────────────┘               │
└─────────────────────────────────────────────────────────────────┘
```

In Phaser 3, each Scene is an almost entirely self-contained game world. Scenes own their own input, tweens, game objects, display lists, and cameras. The Game instance itself is minimal, controlling only global systems: the renderer, Animation Manager, Cache, Registry, Input Manager, Scene Manager, and Sound Manager. This is the fundamental architectural unit -- not components or game objects, but **Scenes**.

### Component Responsibilities

| Component | Responsibility | Communicates With |
|-----------|----------------|-------------------|
| **BootScene** | Loads global assets (tilesets, shared sprites, audio), shows loading bar | Starts PreloaderScene when done |
| **PreloaderScene** | Loads zone-specific assets, transition animations | Starts WorldScene for target zone |
| **WorldScene** | Tilemap rendering, player sprite, NPC placement, collision, camera | EventsCenter, UIScene, DialogScene, MovementSystem, NPCManager |
| **UIScene** | HUD overlay (inventory icon, quest tracker, minimap), pause menu | EventsCenter, InventoryManager, QuestManager |
| **DialogScene** | NPC dialogue boxes, choice prompts, quest accept/complete UI | EventsCenter, NPCManager, QuestManager |
| **EventsCenter** | Singleton EventEmitter for decoupled cross-scene communication | All scenes and managers |
| **Grid Engine** | Tile-locked movement, collision detection, pathfinding, NPC wandering | WorldScene (plugin), Tilemap data |
| **NPCManager** | NPC definitions, spawn positions, dialogue triggers, behavior | Zone data (JSON), DialogScene, QuestManager |
| **QuestManager** | Quest state machine (available/active/complete), objective tracking | Save state, NPCManager, InventoryManager |
| **InventoryManager** | Item collection, storage, quantity tracking | Save state, UIScene, QuestManager |
| **SaveManager** | Serialize/deserialize game state to localStorage | All managers, Registry |
| **AudioManager** | Ambient zone sounds, SFX, music layering | WorldScene (zone transitions) |
| **ZoneRegistry** | Defines available zones, entry points, connections between zones | WorldScene (zone transitions), PreloaderScene |

## Recommended Project Structure

```
src/
├── main.ts                    # Vite entry point, creates Phaser.Game
├── config.ts                  # Phaser game config (renderer, physics, plugins)
├── scenes/                    # All Phaser Scene classes
│   ├── BootScene.ts           # Initial asset loading
│   ├── PreloaderScene.ts      # Zone-specific asset loading
│   ├── WorldScene.ts          # Main gameplay scene (tilemap + player + NPCs)
│   ├── UIScene.ts             # HUD overlay scene (runs parallel to World)
│   └── DialogScene.ts         # Dialogue overlay scene
├── systems/                   # Game logic managers (not Phaser-dependent)
│   ├── QuestManager.ts        # Quest state machine
│   ├── InventoryManager.ts    # Item tracking
│   ├── NPCManager.ts          # NPC spawning and behavior
│   ├── SaveManager.ts         # Persistence to localStorage
│   ├── AudioManager.ts        # Sound/music management
│   └── ZoneRegistry.ts        # Zone metadata and connections
├── entities/                  # Game object classes
│   ├── Player.ts              # Player sprite, input handling hookup
│   ├── NPC.ts                 # NPC sprite, interaction zones
│   └── InteractableObject.ts  # Items, signs, doors, etc.
├── ui/                        # UI component classes (used by UIScene/DialogScene)
│   ├── DialogBox.ts           # Text rendering, typewriter effect, choices
│   ├── InventoryPanel.ts      # Grid display of collected items
│   ├── QuestTracker.ts        # Active quest display
│   └── TransitionOverlay.ts   # Fade/wipe between zones
├── data/                      # JSON definitions (content, not code)
│   ├── zones/                 # Zone definitions
│   │   ├── mg-road.json       # NPC placements, entry points, ambient config
│   │   └── malleshwaram.json  # (future zone)
│   ├── npcs/                  # NPC dialogue and behavior definitions
│   │   ├── chai-vendor.json   # Dialogue trees, items offered
│   │   └── metro-guard.json
│   ├── quests/                # Quest definitions
│   │   └── best-filter-coffee.json
│   └── items/                 # Item catalog
│       └── items.json
├── utils/                     # Shared helpers
│   ├── EventsCenter.ts        # Singleton EventEmitter instance
│   ├── constants.ts           # Tile sizes, speeds, z-depths
│   └── types.ts               # Shared TypeScript interfaces
├── assets/                    # Referenced by Phaser loader (copied to public/)
│   ├── tilesets/              # Tileset PNGs (shared across zones)
│   ├── tilemaps/              # Tiled JSON exports (one per zone)
│   ├── sprites/               # Character/NPC sprite sheets
│   ├── ui/                    # UI element graphics
│   └── audio/                 # Music, SFX, ambient loops
public/
├── index.html                 # Entry HTML
└── style.css                  # Minimal global styles
capacitor.config.ts            # Capacitor platform config
vite.config.ts                 # Vite build config
```

### Structure Rationale

- **scenes/:** One file per Phaser Scene. Scenes are the primary organizational unit in Phaser 3, each self-contained with its own lifecycle. Keep scene files thin -- they orchestrate but delegate to systems and entities.
- **systems/:** Pure TypeScript classes with no Phaser dependency where possible. This is critical: game logic (quest state, inventory rules, save format) should be testable without instantiating Phaser. Systems are instantiated once and shared via the Phaser Registry or dependency injection.
- **entities/:** Phaser GameObjects that extend Sprite or Container. These encapsulate visual representation + behavior for a single game object type.
- **ui/:** Reusable UI widgets. Separated from scenes because the same DialogBox is used in DialogScene and potentially in cutscene sequences.
- **data/:** All game content lives here as JSON. Adding a new NPC, quest, or zone should require zero code changes -- only new/modified JSON files and map assets. This is the expansion mechanism.
- **utils/:** EventsCenter is the most important utility. It is a standalone `new Phaser.Events.EventEmitter()` that all scenes import to communicate without tight coupling.

## Architectural Patterns

### Pattern 1: Parallel Scene Composition

**What:** Run multiple Phaser Scenes simultaneously with distinct responsibilities. WorldScene handles gameplay; UIScene handles HUD overlay; DialogScene handles conversation UI. All render in the same frame, layered by scene order.

**When to use:** Always. This is the standard Phaser 3 approach for separating gameplay from UI.

**Trade-offs:** Adds initial complexity over "everything in one scene" but pays off immediately. UI elements do not get destroyed when transitioning between world zones. HUD persists while the WorldScene sleeps/restarts.

**Example:**
```typescript
// In WorldScene.create()
this.scene.launch('UIScene');  // Runs in parallel, rendered above WorldScene

// In UIScene -- listen for events from WorldScene without coupling
import { eventsCenter } from '../utils/EventsCenter';

eventsCenter.on('player-health-changed', (health: number) => {
  this.healthBar.setValue(health);
});

// In WorldScene -- emit without knowing who listens
eventsCenter.emit('player-health-changed', this.player.health);
```

### Pattern 2: Data-Driven Content via JSON

**What:** Define all game content (NPCs, dialogues, quests, zone metadata) as external JSON files loaded by the Phaser loader. Game systems read these definitions at runtime.

**When to use:** For any content that will grow over time. NPCs, dialogue, quests, item definitions, zone configurations.

**Trade-offs:** Requires upfront schema design for JSON formats. Slightly more indirection than hardcoded logic. But this is the key to scaling from one neighborhood to many without code changes.

**Example:**
```typescript
// data/npcs/chai-vendor.json
{
  "id": "chai-vendor-mg-road",
  "name": "Raju",
  "sprite": "npc-vendor-male",
  "position": { "x": 24, "y": 15 },
  "facing": "down",
  "dialogue": [
    { "text": "Best cutting chai on MG Road! Only 20 rupees!" },
    { "text": "You want one? [Yes/No]", "choices": ["yes", "no"] }
  ],
  "gives_item": { "choice": "yes", "item": "cutting-chai", "quest": "best-filter-coffee" }
}
```

```typescript
// In NPCManager.ts -- load and spawn from data
spawnNPCsForZone(scene: WorldScene, zoneId: string): void {
  const npcData: NPCDef[] = scene.cache.json.get(`npcs-${zoneId}`);
  for (const def of npcData) {
    const npc = new NPC(scene, def);
    this.activeNPCs.set(def.id, npc);
  }
}
```

### Pattern 3: Zone-as-Scene-Restart

**What:** Each neighborhood (MG Road, Malleshwaram, etc.) is a single WorldScene that loads different tilemap data. Transitioning zones means shutting down the current WorldScene and starting a new one with different zone parameters, while UIScene persists.

**When to use:** When adding new geographic areas to the game.

**Trade-offs:** Simpler than loading/unloading tilemap layers dynamically. Clean memory management (old zone's GameObjects are destroyed on shutdown). Downside: brief loading screen between zones. For a GBA-style game, this is actually authentic -- Pokemon also has zone transitions.

**Example:**
```typescript
// Zone transition trigger (e.g., player walks to zone edge or enters metro)
this.scene.start('PreloaderScene', {
  targetZone: 'malleshwaram',
  entryPoint: 'metro-exit',
  fromZone: 'mg-road'
});

// PreloaderScene loads zone-specific assets, then:
this.scene.start('WorldScene', {
  zoneId: 'malleshwaram',
  entryPoint: 'metro-exit'
});
// UIScene remains running throughout -- no HUD flicker
```

### Pattern 4: EventsCenter Singleton for Cross-Scene Communication

**What:** A dedicated EventEmitter instance (not `this.game.events`, not scene events) shared across all scenes and systems. Imported as a module.

**When to use:** Always, for all inter-scene communication. The Phaser docs explicitly warn against using `this.game.events` because you risk colliding with Phaser's internal event names.

**Trade-offs:** Requires discipline to clean up listeners on scene shutdown to avoid memory leaks. Simple to implement, hard to debug if events get out of control. Keep event names in a constants file.

**Example:**
```typescript
// utils/EventsCenter.ts
import Phaser from 'phaser';
export const eventsCenter = new Phaser.Events.EventEmitter();

// utils/events.ts -- event name constants
export const EVENTS = {
  QUEST_STARTED: 'quest-started',
  QUEST_COMPLETED: 'quest-completed',
  ITEM_COLLECTED: 'item-collected',
  ZONE_TRANSITION: 'zone-transition',
  NPC_INTERACT: 'npc-interact',
  DIALOG_OPEN: 'dialog-open',
  DIALOG_CLOSE: 'dialog-close',
} as const;
```

### Pattern 5: Grid Engine Plugin for Movement

**What:** Use the `grid-engine` npm package as a Phaser plugin for tile-locked movement, collision, pathfinding, and NPC wandering. This handles the core GBA-style movement mechanic.

**When to use:** From day one. Grid-based movement is non-trivial to implement correctly (smooth tile-to-tile animation, collision against tilemap layers, NPC collision, pathfinding for NPC wander). Grid Engine handles all of this and integrates with Tiled collision properties.

**Trade-offs:** External dependency. But it is actively maintained, TypeScript-native, well-documented, and removes a significant amount of custom code. Rolling your own grid movement is a common time sink that delays actual game content work.

## Data Flow

### Player Interaction Flow

```
Player Input (arrow keys / touch / d-pad)
    |
    v
Grid Engine Plugin
    |-- Checks collision with tilemap layers
    |-- Checks collision with NPC positions
    |-- If valid: moves player sprite tile-by-tile with walk animation
    |
    v
Camera follows player (lerp smoothing, bounded to tilemap size)
    |
    v
Interaction Key Pressed (space / tap)
    |
    v
WorldScene checks: is player facing an NPC? An interactable object?
    |
    +--> NPC found:
    |       eventsCenter.emit('npc-interact', npcId)
    |           |
    |           v
    |       NPCManager looks up NPC dialogue data
    |           |
    |           v
    |       DialogScene displays dialogue
    |           |
    |           +--> Choice made --> QuestManager / InventoryManager updated
    |           |
    |           v
    |       eventsCenter.emit('dialog-close')
    |
    +--> Interactable found:
    |       Item collected --> InventoryManager.addItem()
    |       eventsCenter.emit('item-collected', itemId)
    |           |
    |           v
    |       UIScene updates inventory display
    |
    +--> Zone exit found:
            eventsCenter.emit('zone-transition', { target, entryPoint })
                |
                v
            WorldScene starts PreloaderScene with zone params
```

### State Management

```
Game Registry (Phaser built-in, global key-value store)
    |
    +-- Player state (position, facing, current zone)
    +-- Quest states (Map<questId, QuestStatus>)
    +-- Inventory (Map<itemId, quantity>)
    +-- Game flags (Set<string> for one-time events)
    |
    +--> SaveManager serializes to JSON
    |        |
    |        v
    |    localStorage.setItem('save', JSON.stringify(state))
    |
    +--> On load: SaveManager deserializes and populates Registry
    |
    +--> Registry.events.on('changedata') --> UIScene updates
```

### Zone Loading Flow

```
ZoneRegistry.getZone(zoneId)
    |
    v
PreloaderScene
    |-- Loads tilemap JSON: assets/tilemaps/{zoneId}.json
    |-- Loads zone NPC data: data/zones/{zoneId}.json
    |-- Loads any zone-specific tilesets not already cached
    |-- Loads zone-specific audio (ambient loops)
    |
    v
WorldScene.create({ zoneId, entryPoint })
    |-- Creates Tilemap from cached JSON
    |-- Creates TilemapLayers (ground, buildings, above-player, collision)
    |-- Configures Grid Engine with tilemap + collision layer
    |-- Spawns player at entryPoint coordinates
    |-- NPCManager spawns NPCs from zone data
    |-- Camera setBounds to tilemap size, startFollow player
    |-- AudioManager crossfades to zone ambient
    |
    v
Game loop: update() called every frame
    |-- Grid Engine handles movement
    |-- NPCManager updates NPC wander behaviors
    |-- Interaction checks on input
```

### Key Data Flows

1. **Content addition flow:** New JSON files in data/ + new tilemap in assets/ + tileset images = new zone. No code changes needed for adding neighborhoods, NPCs, or quests.
2. **Save/load flow:** SaveManager snapshots Registry state to localStorage on key events (zone transition, quest complete, manual save). On boot, checks for existing save and restores.
3. **Event flow:** All cross-system communication goes through EventsCenter. No scene directly calls methods on another scene. This keeps scenes independently testable.

## Scaling Considerations

For this game, "scaling" means more zones, NPCs, quests, and assets -- not more concurrent users. This is a single-player offline game.

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 1 zone (MVP) | Single WorldScene, all assets loaded in BootScene, flat NPC data |
| 3-5 zones | Zone-specific asset loading in PreloaderScene, ZoneRegistry for connections, lazy-load tilesets |
| 10+ zones | Asset bundles per zone, tileset sharing/deduplication, consider IndexedDB for save data size, asset manifest system |
| 20+ zones | Streaming asset loading, zone adjacency preloading, tileset atlas optimization with tools like Tilepack |

### Scaling Priorities

1. **First bottleneck -- Asset loading time:** Each zone adds a tilemap JSON + tileset images + NPC sprites + audio. If all loaded at boot, initial load becomes unacceptable. Solution: lazy-load per zone in PreloaderScene. Share tilesets across zones (load once, reuse).
2. **Second bottleneck -- Save data complexity:** As quests and inventory grow, the save state blob gets large and fragile. Solution: version the save format from day one. Use a migration function when format changes. Consider IndexedDB if localStorage 5MB limit becomes an issue.
3. **Third bottleneck -- Tileset texture memory:** GBA-style pixel art is small per tile but tilesets add up. Solution: use texture atlases (Atlaspack or TexturePacker in Phaser 3 format). Set `pixelArt: true` in game config for nearest-neighbor filtering.

## Anti-Patterns

### Anti-Pattern 1: God Scene

**What people do:** Put all game logic -- movement, dialogue, quests, inventory, UI -- into a single Scene's create() and update() methods.

**Why it's wrong:** Becomes unmaintainable past ~500 lines. Cannot persist UI across zone transitions. Cannot test any system independently.

**Do this instead:** Parallel scenes (WorldScene + UIScene + DialogScene) with systems extracted into manager classes. Scenes orchestrate; managers own logic.

### Anti-Pattern 2: Direct Scene-to-Scene Method Calls

**What people do:** `this.scene.get('UIScene').updateHealth(50)` -- calling methods directly on another scene.

**Why it's wrong:** Tight coupling. If UIScene is sleeping or not yet created, this throws. Makes it impossible to test WorldScene without UIScene.

**Do this instead:** EventsCenter. `eventsCenter.emit('health-changed', 50)`. UIScene listens or does not -- WorldScene does not care.

### Anti-Pattern 3: Hardcoded NPC/Quest/Dialogue in Code

**What people do:** Define NPC dialogue as string literals in scene create() methods. Quest logic as if/else chains in update().

**Why it's wrong:** Adding one NPC requires modifying code, risking regressions. Content creators cannot contribute without code knowledge. The game becomes impossible to expand.

**Do this instead:** JSON data files for all content. The code reads definitions; it never contains specific NPC names, dialogue text, or quest objectives.

### Anti-Pattern 4: Using this.game.events for Custom Events

**What people do:** Emit custom events on `this.game.events` thinking it is the global event bus.

**Why it's wrong:** Phaser's internal systems use `this.game.events` with reserved event names ('blur', 'focus', 'step', 'prestep', etc.). Custom events can collide and cause bizarre bugs.

**Do this instead:** Create a standalone `new Phaser.Events.EventEmitter()` singleton (EventsCenter pattern). No collision risk.

### Anti-Pattern 5: Loading All Assets Upfront

**What people do:** Load every tileset, sprite sheet, and audio file in the BootScene for the entire game.

**Why it's wrong:** Works fine with one zone. With five zones, the initial load becomes 30+ seconds. With ten, it is unusable. Also wastes memory with textures for zones the player may never visit.

**Do this instead:** Load shared assets (UI, player sprite, shared tilesets) in BootScene. Load zone-specific assets in PreloaderScene before each zone transition. Cache prevents reloading already-loaded assets.

### Anti-Pattern 6: Pixel Art Without pixelArt Config

**What people do:** Use pixel art tilesets without setting Phaser's pixel art rendering mode.

**Why it's wrong:** Default bilinear filtering blurs pixel art, especially at non-integer scales. The GBA aesthetic is destroyed.

**Do this instead:** Set `pixelArt: true` in the Phaser game config. This enables nearest-neighbor filtering globally. Also set `roundPixels: true` on the camera to prevent sub-pixel rendering artifacts during scrolling.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| **Tiled Map Editor** | Export as JSON, load with `this.load.tilemapTiledJSON()` | Must use CSV or Base64 uncompressed tile encoding. Embed tilesets in map or load separately. Layer names in Tiled must match layerID strings in code. |
| **Grid Engine Plugin** | Phaser plugin registered in game config | Reads collision data from Tiled tile properties. Configure `collides: true` on blocked tiles in Tiled. |
| **Capacitor** | Wraps Vite build output (dist/) into native app shell | `npx cap add android/ios`, `npx cap sync` after build. Touch input works through Phaser's pointer events. May need safe area CSS adjustments. |
| **Playwright** | E2E tests against dev server, canvas screenshot comparison | Game logic in systems/ is unit-testable with Vitest. E2E tests validate visual output and interaction flows. Expose game state via window for test hooks. |
| **TexturePacker / Atlaspack** | Generate texture atlases from individual sprite PNGs | Output Phaser 3 JSON format. Load with `this.load.atlas()`. Critical for reducing draw calls on mobile. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| WorldScene <--> UIScene | EventsCenter events | Never direct method calls. UI updates on events, World emits without knowing UI exists. |
| WorldScene <--> DialogScene | EventsCenter events | Dialog opens/closes via events. World pauses player input while dialog is active. |
| Scenes <--> Systems | Direct method calls + events | Scenes hold references to managers. Managers emit events for state changes. |
| Systems <--> Data | JSON loaded via Phaser cache | Systems read `scene.cache.json.get(key)`. Data is never imported as ES modules -- always loaded at runtime. |
| Game <--> Platform | Capacitor bridge | Game code is platform-agnostic. Capacitor provides native APIs (haptics, status bar) if needed. Build target detection via env variable. |

## Tiled Map Layer Convention

A critical architectural decision is the tilemap layer naming and ordering convention used in Tiled. This determines collision, rendering order, and Grid Engine configuration.

| Layer Name | Type | Purpose | Rendering Order |
|------------|------|---------|-----------------|
| `ground` | Tile Layer | Roads, grass, floor tiles | Bottom (drawn first) |
| `ground-detail` | Tile Layer | Cracks, puddles, road markings | Above ground |
| `buildings` | Tile Layer | Building walls, structures at player level | Player can walk behind |
| `collision` | Tile Layer | Invisible tiles marking unwalkable areas | Not rendered (set alpha 0). Grid Engine reads this. |
| `above-player` | Tile Layer | Tree canopies, roof overhangs, bridge rails | Rendered above player sprite |
| `npcs` | Object Layer | NPC spawn positions and metadata | Read by NPCManager, not rendered as tiles |
| `zones` | Object Layer | Zone transition triggers, interaction areas | Read by WorldScene for trigger zones |
| `items` | Object Layer | Collectible item positions | Read by WorldScene for item spawns |

This convention must be established before any map authoring begins and documented for anyone creating Tiled maps.

## Build Order (Dependencies Between Components)

Understanding what depends on what determines the order components must be built:

```
Phase 1: Foundation (nothing depends on these, everything needs them)
├── Phaser + Vite + TypeScript project scaffold
├── Game config (pixelArt: true, Grid Engine plugin registration)
├── EventsCenter singleton
├── BootScene (loading bar)
└── Tiled map layer convention documented

Phase 2: Core Loop (requires Phase 1)
├── Single tilemap in Tiled (MG Road) with all layer types
├── WorldScene (tilemap loading, player spawn)
├── Player entity (sprite, walk animation frames)
├── Grid Engine configuration (collision layer, player character)
└── Camera follow + bounds

Phase 3: Interaction (requires Phase 2)
├── NPC entity (sprite, interaction zone detection)
├── NPCManager (spawn from JSON data)
├── DialogScene + DialogBox UI
├── Basic NPC dialogue flow (JSON-driven)
└── UIScene (initially just interaction prompts)

Phase 4: Game Systems (requires Phase 3)
├── InventoryManager + item data schema
├── QuestManager + quest data schema
├── InventoryPanel UI
├── QuestTracker UI
└── SaveManager (localStorage persistence)

Phase 5: Zone Expansion (requires Phase 2, benefits from Phase 4)
├── PreloaderScene (zone-specific asset loading)
├── ZoneRegistry (zone connections, entry points)
├── Zone transition triggers
├── Metro fast-travel mechanic
└── Second zone tilemap

Phase 6: Polish (requires all above)
├── AudioManager (ambient per zone, SFX)
├── Transition overlays (fade/wipe between zones)
├── Capacitor mobile packaging
├── Touch input / virtual d-pad
└── Playwright E2E test suite
```

Each phase produces a playable increment. Phase 2 gives a walkable map. Phase 3 gives NPC interaction. Phase 4 gives progression. Phase 5 gives expansion. Phase 6 gives platform reach and polish.

## Sources

- [Phaser 3 Scene Architecture (Official Docs)](https://docs.phaser.io/phaser/concepts/scenes) -- HIGH confidence, authoritative
- [Cross-Scene Communication (Official Docs)](https://docs.phaser.io/phaser/concepts/scenes/cross-scene-communication) -- HIGH confidence, authoritative
- [Phaser 3 Events System (Official Docs)](https://docs.phaser.io/phaser/concepts/events) -- HIGH confidence, authoritative
- [Grid Engine Plugin](https://annoraaq.github.io/grid-engine/) -- HIGH confidence, active project with TypeScript support
- [Grid Engine GitHub](https://github.com/Annoraaq/grid-engine) -- HIGH confidence
- [Phaser Vite TypeScript Template (Official)](https://github.com/phaserjs/template-vite-ts) -- HIGH confidence, official template
- [Modular Game Worlds in Phaser 3 (Michael Hadley)](https://medium.com/@michaelwesthadley/modular-game-worlds-in-phaser-3-tilemaps-1-958fc7e6bbd6) -- MEDIUM confidence, well-known tutorial series
- [Phaser + Capacitor Boilerplate](https://github.com/gnesher/phaser-capacitor) -- MEDIUM confidence, community project
- [Phaser Capacitor Tutorial (Official)](https://phaser.io/tutorials/bring-your-phaser-game-to-ios-and-android-with-capacitor) -- HIGH confidence
- [Rex UI Dialog-Quest Plugin](https://rexrainbow.github.io/phaser3-rex-notes/docs/site/dialog-quest/) -- MEDIUM confidence, widely used community plugin
- [Monster Tamer (Tutorial RPG)](https://github.com/devshareacademy/monster-tamer) -- MEDIUM confidence, reference implementation
- [Phaser Forum: Project Structure Discussion](https://phaser.discourse.group/t/whats-the-best-style-to-structure-your-project/7299) -- MEDIUM confidence, community consensus
- [Phaser Forum: HUD Scene Pattern](https://phaser.discourse.group/t/hud-scene-multiple-scenes/6348) -- MEDIUM confidence
- [Ourcade: Cross-Scene Communication](https://blog.ourcade.co/posts/2020/phaser3-how-to-communicate-between-scenes/) -- MEDIUM confidence

---
*Architecture research for: GBA-style Bengaluru exploration game (Phaser 3 + Tiled + Capacitor)*
*Researched: 2026-03-19*
