# Project Research Summary

**Project:** Recurring World (GBA-style Bengaluru city exploration game)
**Domain:** 2D tile-based exploration game (web + mobile, no combat)
**Researched:** 2026-03-19
**Confidence:** HIGH

## Executive Summary

Recurring World is a GBA-style top-down exploration game set in Bengaluru, built with Phaser 3, Tiled maps, and packaged for mobile via Capacitor. The game strips combat from the Pokemon overworld formula and replaces it with cultural discovery -- recognizable landmarks, authentic NPC dialogue, and city-specific quests. Experts build games like this using Phaser 3.90 (the final stable v3 release) with the rexrainbow plugin suite for dialogue/quest UI, Tiled for map authoring, the Grid Engine plugin for tile-locked movement, and a parallel-scene architecture where WorldScene, UIScene, and DialogScene run simultaneously with an EventsCenter singleton for decoupled communication. All game content (NPCs, dialogue, quests, zone metadata) should be data-driven via JSON files so that adding a new Bengaluru neighborhood requires zero code changes.

The recommended approach is to build incrementally toward a "5-minute Bengaluru walk" MVP -- one zone (MG Road/CBD) with tile movement, 3-5 NPCs, a dialogue system, one quest, basic audio, and mobile touch controls. This validates the core emotional hook (locals recognizing real landmarks in pixel art) before investing in zone expansion, metro fast-travel, and the full quest/journal system. The architecture must support zone expansion from the start, but only one zone needs to exist for v1.

The dominant risks are technical, not design. Tileset bleeding artifacts, pixel art scaling at non-integer ratios, iOS WebGL context loss, iOS audio autoplay restrictions, memory leaks during scene transitions, and AI-generated asset inconsistency are all well-documented failure modes in the Phaser/Capacitor ecosystem. Every one of them has a known prevention strategy, but they must be addressed in the foundation phase -- not patched retroactively. The asset pipeline (tile extrusion, palette enforcement, AI output validation) and the scene lifecycle pattern (proper shutdown cleanup, EventsCenter listener management) are the two areas where upfront discipline pays the highest dividends.

## Key Findings

### Recommended Stack

Phaser 3.90.0 is the cornerstone choice. Phaser 4 is in late release-candidate stage but the rexrainbow plugin ecosystem (dialogue boxes, quest management, UI widgets) has no v4 support, and rolling those from scratch would add months. Phaser 3.90 is the final, most stable v3 release with full Tiled integration, pixel art config, and official Capacitor deployment tutorials. The build toolchain is Vite (official Phaser template) + TypeScript for type safety across quest state machines and inventory logic. Capacitor 8 packages the Vite build output into native iOS/Android shells. See `.planning/research/STACK.md` for full rationale and version compatibility matrix.

**Core technologies:**
- **Phaser 3.90.0:** Game engine -- final stable v3, best plugin ecosystem, native Tiled support, `pixelArt: true` config, official Capacitor integration
- **TypeScript ~5.9:** Language -- catches bugs in complex game state, Phaser's official template uses it
- **Vite 6.x/7.x:** Build tool -- Phaser's official template, instant HMR, Vitest integration
- **Capacitor 8.x:** Mobile packaging -- official Phaser tutorial, Swift Package Manager for iOS, requires Node 22+
- **Tiled 1.12:** Map editor -- industry standard, Phaser has built-in JSON parser, object layers for NPC spawns/zones
- **phaser3-rex-plugins ~1.80.x:** Dialog, quest, text typing, BBCode text, buttons -- saves months of UI work
- **grid-engine:** Tile-locked movement, collision, pathfinding, NPC wandering -- avoids a major custom implementation time sink

### Expected Features

The game's identity lives in Bengaluru-specific content, not mechanical novelty. Table stakes are Pokemon-overworld fundamentals; differentiators are cultural authenticity. See `.planning/research/FEATURES.md` for the full dependency graph and prioritization matrix.

**Must have (table stakes for v1 -- the "5-minute walk"):**
- Grid-based tile movement with collision (the game's reason to exist)
- Player sprite with 4-direction walk animation
- NPC placement and interaction (talking IS the gameplay)
- Dialogue box system (typewriter text, multi-page, NPC names)
- One complete zone with recognizable Bengaluru landmarks (MG Road/CBD)
- One simple quest ("Find the best filter coffee")
- Basic inventory for quest and collectible items
- Zone transitions (exterior-to-interior doors)
- Save/load persistence (critical for mobile app-switching)
- Sound effects and 1-2 BGM tracks
- Mobile touch controls (virtual D-pad + action button)
- Camera follow and location signposts

**Should have (differentiators, add after v1 validation):**
- Namma Metro as fast-travel (Bengaluru-specific mechanic)
- Culturally authentic NPC dialogue (Kannada/English mix)
- City-specific quest chains (3-5 quests teaching real Bengaluru)
- Discovery journal / photo journal (completionist tracker)
- Ambient city soundscape (positional audio, auto-rickshaw horns, temple bells)
- Running shoes (2x speed toggle, quality of life)
- Second zone (Malleshwaram, Lalbagh, or Indiranagar)

**Defer (v2+):**
- Multiple interconnected zones with full metro network
- Auto-rickshaw rides (intra-zone fast travel)
- NPC schedules (Stardew-style movement)
- Minigames, character customization, voice acting, multiplayer
- Procedural generation (antithetical to handcrafted authenticity)

### Architecture Approach

The architecture follows Phaser 3's scene-centric model with parallel scene composition: WorldScene (tilemap + player + NPCs), UIScene (HUD overlay persists across zone transitions), and DialogScene (conversation overlay). Scenes communicate exclusively through an EventsCenter singleton (a standalone EventEmitter, never `this.game.events`). Game logic lives in manager classes (QuestManager, InventoryManager, NPCManager, SaveManager) that are Phaser-independent where possible for testability. All content is JSON-driven -- NPCs, dialogue trees, quests, and zone metadata are data files, not code. Zone transitions restart WorldScene with new zone parameters while UIScene persists. See `.planning/research/ARCHITECTURE.md` for the full system diagram, data flow, and layer conventions.

**Major components:**
1. **WorldScene** -- Tilemap rendering, player/NPC sprites, collision, camera. One instance per zone, restarts on zone transition.
2. **UIScene** -- HUD overlay (inventory icon, quest tracker, minimap). Persists across zone transitions. Updates via EventsCenter events.
3. **DialogScene** -- NPC dialogue boxes, choice prompts, quest accept/complete UI. Launched on demand, pauses player input.
4. **EventsCenter** -- Singleton EventEmitter for all cross-scene communication. Event names in constants file.
5. **Grid Engine** -- Phaser plugin for tile-locked movement, collision against Tiled layers, NPC pathfinding/wandering.
6. **Manager classes** (QuestManager, InventoryManager, NPCManager, SaveManager, AudioManager, ZoneRegistry) -- Own game logic, emit state change events, serializable for saves.
7. **Data layer** -- JSON files for zones, NPCs, dialogue, quests, items. Adding content = adding JSON + map assets, no code changes.

### Critical Pitfalls

The top pitfalls are concentrated in two areas: the rendering/asset pipeline and the mobile deployment pipeline. All have known solutions but require early action. See `.planning/research/PITFALLS.md` for the full list of 10 critical pitfalls with recovery strategies.

1. **Tileset bleeding / seam artifacts** -- Use `tile-extruder` on all tilesets before importing into Phaser. Set `margin: 1, spacing: 2` in `addTilesetImage()`. Set `roundPixels: true`. Must be solved in the asset pipeline before any map content is authored.
2. **Pixel art scaling at non-integer ratios** -- Render at 240x160 (GBA native), use `Phaser.Scale.FIT` with `pixelArt: true`, accept letterboxing. Lock this down in Phase 1 before any visual content is created.
3. **iOS WebGL context loss** -- Listen for `webglcontextlost`/`webglcontextrestored` events. Handle Capacitor `appStateChange`. Consider Canvas renderer on iOS if WebGL underperforms. Test on real devices.
4. **AI-generated tileset inconsistency** -- Treat AI output as first draft. Enforce strict 32-color palette, generate at exact target resolution (16x16), budget 30-40% of asset time for manual cleanup. Build a reference spritesheet of "golden tiles" early.
5. **Memory leaks from scene transitions** -- Implement strict scene shutdown cleanup. Store event listener references for removal. Use `this.scene.stop()` to trigger shutdown. Profile memory after 20 transitions.
6. **iOS audio autoplay restrictions** -- Mandatory "tap to start" screen before any audio. Call `AudioContext.resume()` after user gesture. Re-resume on app foreground via Capacitor `appStateChange`.
7. **Save data loss on mobile** -- Use `@capacitor/preferences` (native storage) instead of raw localStorage from day one. Version the save format. Auto-save on zone transitions.

## Implications for Roadmap

Based on combined research, the architecture research already identifies a clear 6-phase build order driven by component dependencies. The feature research confirms the MVP scope, and the pitfalls research dictates what must be front-loaded.

### Phase 1: Foundation and Asset Pipeline
**Rationale:** Everything depends on the project scaffold, renderer configuration, and asset pipeline. Pitfalls research is emphatic: tileset extrusion, pixel art scaling, save architecture, and scene lifecycle patterns must be established before any content exists. Retroactive fixes are expensive (HIGH recovery cost for AI tileset inconsistency and save data migration).
**Delivers:** Bootable Phaser project with correct pixel art rendering, extruded tileset pipeline, palette enforcement for AI assets, EventsCenter singleton, SaveManager with Capacitor Preferences, and documented Tiled layer conventions.
**Addresses features:** None directly visible to users. This is infrastructure.
**Avoids pitfalls:** Tileset bleeding (#1), pixel scaling (#2), AI tileset inconsistency (#5), memory leak patterns (#6), save data loss (#10).

### Phase 2: Core Movement Loop
**Rationale:** The tile movement system is the dependency root for everything else (see FEATURES.md dependency graph). You cannot build NPC interaction, zone transitions, or quests without a walkable map first. This phase produces the first playable increment.
**Delivers:** Player walking on a single MG Road/CBD tilemap with collision, camera follow, and Grid Engine integration.
**Addresses features:** Grid-based tile movement, player sprite + walk animation, collision + boundaries, camera follow.
**Uses:** Phaser 3.90, Grid Engine plugin, first Tiled map with all layer types.
**Avoids pitfalls:** Collision layer mismanagement (#7), tilemap layer count performance (#3).

### Phase 3: NPC Interaction and Dialogue
**Rationale:** With movement working, the next dependency is NPC interaction -- "talking to people IS the gameplay" per FEATURES.md. Dialogue is the primary content delivery mechanism and prerequisite for quests.
**Delivers:** NPCs on the map that the player can walk up to and talk to. Dialogue box with typewriter text, multi-page messages, NPC names. JSON-driven NPC definitions.
**Addresses features:** NPC placement + interaction, dialogue box system, readable signs/objects.
**Implements:** NPCManager, DialogScene, DialogBox UI, data-driven NPC JSON schema.

### Phase 4: Game Systems (Quest, Inventory, Save, Menu)
**Rationale:** Quest and inventory systems require dialogue to exist (quests are accepted via NPC dialogue, tracked in state, involve items). Save/load must work before mobile testing. This phase completes the MVP gameplay loop.
**Delivers:** One completable quest ("Find the best filter coffee"), inventory with collectible items, save/load persistence, pause menu with quest log.
**Addresses features:** Basic quest, basic inventory, save/load, pause/menu screen, zone transitions (doors), building interiors.
**Implements:** QuestManager, InventoryManager, SaveManager, quest/item JSON schemas, PreloaderScene for zone-specific loading.

### Phase 5: Audio, Polish, and Content
**Rationale:** Audio is independently layerable per FEATURES.md dependency analysis but dramatically improves playtesting. Location signposts, SFX, and BGM transform the experience from "tech demo" to "game." Touch controls must be validated before mobile packaging.
**Delivers:** Sound effects, 1-2 BGM tracks, location signposts, mobile touch controls, transition overlays. The complete v1 "5-minute Bengaluru walk."
**Addresses features:** SFX, BGM, location signposts, touch/mobile controls.
**Avoids pitfalls:** iOS audio autoplay (#8) -- "tap to start" screen designed here.

### Phase 6: Mobile Packaging and App Store
**Rationale:** Capacitor packaging is additive (STACK.md: "it is additive, not architectural") but iOS-specific pitfalls (WebGL context loss, audio in WKWebView, App Store rejection) require dedicated attention. Budget one rejection-and-resubmit cycle.
**Delivers:** iOS and Android builds via Capacitor. Native splash screen, status bar hiding, screen orientation lock, haptic feedback. Offline-only operation. TestFlight distribution.
**Addresses features:** Cross-platform mobile deployment.
**Avoids pitfalls:** iOS WebGL context loss (#4), App Store "minimal functionality" rejection (#9), save data persistence on iOS (#10).

### Phase Ordering Rationale

- **Phases 1-2 are non-negotiable firsts.** The entire feature tree depends on a working tilemap with correct rendering and grid movement. PITFALLS.md is explicit: tileset extrusion and pixel scaling cannot be patched retroactively without re-authoring all assets.
- **Phase 3 before Phase 4** because quest and inventory systems depend on dialogue existing. The FEATURES.md dependency graph shows: Quest System requires Dialogue + Inventory; Metro requires Zone Transitions; Journal requires Quest System.
- **Phase 5 before Phase 6** because audio bugs on iOS are easier to debug in the web build first, then fix iOS-specific issues during Capacitor integration.
- **Landmark art (the core differentiator) runs as a parallel track.** The AI asset pipeline can generate and curate Bengaluru landmark tilesets while programming progresses through Phases 2-4. This parallelism is explicitly called out in FEATURES.md: "Landmark Art is an independent pipeline."
- **Touch controls in Phase 5 (not Phase 6)** because FEATURES.md warns: "Waiting until the end risks discovering the control scheme does not work." Validate mobile input feel before packaging.

### Research Flags

Phases likely needing deeper research (`/gsd:research-phase`) during planning:
- **Phase 1 (Foundation):** AI asset pipeline specifics -- palette enforcement tooling, tile-extruder integration into Vite build, reference spritesheet creation workflow. The PITFALLS.md research flags this as HIGH recovery cost if done wrong.
- **Phase 4 (Game Systems):** Quest state machine design -- the JSON schema for quests, objective types, and branching dialogue choices. Rex plugins have a quest plugin but its API needs evaluation against the game's specific needs.
- **Phase 6 (Mobile Packaging):** iOS WebGL vs Canvas renderer decision, App Store submission checklist, Capacitor WKWebView configuration for audio. PITFALLS.md flags multiple iOS-specific issues that need device testing.

Phases with standard patterns (skip `/gsd:research-phase`):
- **Phase 2 (Core Movement):** Grid Engine plugin has comprehensive documentation. Tiled-to-Phaser pipeline is well-documented (Michael Hadley tutorial series, official Phaser docs).
- **Phase 3 (NPC Interaction):** Rex plugins Dialog/TextTyping are battle-tested. Parallel scene composition for DialogScene is a standard Phaser pattern with official docs.
- **Phase 5 (Audio/Polish):** Phaser's built-in Sound Manager + SFX patterns are well-documented. Touch input via virtual D-pad is a solved problem in Phaser.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All recommendations backed by official Phaser/Capacitor docs and tutorials. Version compatibility verified. Phaser 3.90 as final v3 release is confirmed. Rex plugins version compatibility checked on npm. |
| Features | HIGH | Feature set derived from Pokemon overworld analysis, cozy game comparisons (A Short Hike, Stardew), and cultural heritage game research. MVP scope is well-defined with clear dependency graph. |
| Architecture | HIGH | Parallel scene composition and EventsCenter are official Phaser 3 patterns documented in Phaser docs. Grid Engine is a mature plugin. Project structure follows community consensus from Phaser forums. |
| Pitfalls | HIGH | Most pitfalls verified across multiple sources: Phaser GitHub issues, official forum threads, Apple Developer Forums, community post-mortems. Recovery strategies are concrete and actionable. |

**Overall confidence:** HIGH

### Gaps to Address

- **Grid Engine vs custom movement:** STACK.md recommends phaser3-rex-plugins but ARCHITECTURE.md recommends the `grid-engine` npm package. Both are viable. The `grid-engine` package is purpose-built for tile-locked movement with pathfinding and NPC wandering. Evaluate during Phase 2 planning -- try Grid Engine first, fall back to custom implementation only if it proves limiting.
- **Renderer choice (WebGL vs Canvas) on iOS:** PITFALLS.md cites a case study where Canvas outperformed WebGL by 30% on older devices. The decision should be deferred to Phase 6 with real device testing. Use `Phaser.AUTO` (WebGL with Canvas fallback) initially.
- **Kannada script rendering in dialogue:** FEATURES.md lists bilingual signboards as a differentiator. Phaser's default text rendering supports Unicode but complex script shaping (Kannada conjuncts) may need BitmapText or a custom font. Validate during Phase 3 when building the dialogue system.
- **Vite version pinning:** STACK.md notes Vite 8 just released (2026-03-12) with Rolldown but recommends matching whatever the official Phaser template pins (currently Vite 6.3.1). Check the template at project init time.
- **Playwright canvas testing maturity:** Testing a game rendered to a single `<canvas>` element is inherently harder than DOM testing. The `@bisonsoftware/canvas-grid-playwright` package is experimental (LOW confidence in STACK.md sources). E2E test strategy may need to rely more on screenshot comparison and exposed game state hooks than structured canvas queries.

## Sources

### Primary (HIGH confidence)
- [Phaser v3.90.0 Release](https://phaser.io/news/2025/05/phaser-v390-released) -- Final v3 release confirmation
- [Phaser Official Capacitor Tutorial](https://phaser.io/tutorials/bring-your-phaser-game-to-ios-and-android-with-capacitor) -- Mobile deployment reference
- [Phaser 3 Scene Architecture (Official Docs)](https://docs.phaser.io/phaser/concepts/scenes) -- Scene lifecycle, parallel scenes
- [Phaser 3 Events System (Official Docs)](https://docs.phaser.io/phaser/concepts/events) -- EventsCenter pattern
- [Capacitor 8 Announcement](https://ionic.io/blog/announcing-capacitor-8) -- SPM, Node 22 requirement
- [Grid Engine Plugin](https://annoraaq.github.io/grid-engine/) -- Tile movement, collision, pathfinding
- [phaser3-rex-plugins](https://www.npmjs.com/package/phaser3-rex-plugins) -- UI toolkit, quest management
- [Tiled 1.12 Release](http://www.mapeditor.org/2026/03/13/tiled-1-12-released.html) -- Map editor
- [tile-extruder (sporadic-labs)](https://github.com/sporadic-labs/tile-extruder) -- Tileset bleeding prevention

### Secondary (MEDIUM confidence)
- [Modular Game Worlds in Phaser 3 (Michael Hadley)](https://medium.com/@michaelwesthadley/modular-game-worlds-in-phaser-3-tilemaps-1-958fc7e6bbd6) -- Tilemap best practices
- [Pixel Tools for Phaser](https://phaser.io/news/2026/03/pixel-tools-phaser-asset-pipeline) -- Tilepack + Atlaspack
- [Rex Plugins Documentation](https://rexrainbow.github.io/phaser3-rex-notes/docs/site/plugin-list/) -- Plugin API reference
- [Phaser Forum: Project Structure Discussion](https://phaser.discourse.group/t/whats-the-best-style-to-structure-your-project/7299) -- Community architecture consensus
- [Cultural Heritage Game Design (MDPI)](https://www.mdpi.com/2227-7102/13/1/47) -- Nostalgia as design strategy

### Tertiary (LOW confidence)
- [Canvas Grid Playwright](https://www.npmjs.com/package/@bisonsoftware/canvas-grid-playwright) -- Grid-based canvas testing, experimental
- [AI Pixel Art consistency (QWE Academy)](https://www.qwe.edu.pl/tutorial/create-pixel-art-with-ai-tools/) -- AI asset pipeline challenges

---
*Research completed: 2026-03-19*
*Ready for roadmap: yes*
