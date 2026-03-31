# Milestones

## v1.0 Bengaluru Explorer MVP (Shipped: 2026-03-31)

**Phases completed:** 4 phases, 20 plans, 41 tasks

**Key accomplishments:**

- Phaser 3.90.0 project with pixel-art 480x320 config, Grid Engine plugin, shared utilities (EventsCenter, constants, types), and Vitest + Playwright test infrastructure
- Three-scene opening sequence (Boot/Title/NameEntry) with GBA-style Bengaluru skyline, Rex InputText name entry, gender selection, and 12-frame chibi player spritesheets for both genders
- GBA-quality pixel art tilesets (144 tiles) and 60x60 Tiled tilemap of MG Road/CBD with elevation transitions, collision data, and 5 landmark zones
- Tile-locked 4-direction movement with Grid Engine, collision, camera follow, walk/idle animations, and walk/run speed toggle on MG Road tilemap
- UIScene with rexrainbow floating joystick and A/B buttons, GitHub Pages deployment workflow, and Playwright E2E test suite covering the complete Phase 1 game loop
- Extended type system with 6 new interfaces, 12 new constants, and 15 JSON data files defining 5 NPCs with Kannada dialogue, 6 landmark signs, and 4 enterable building interiors
- 5 NPC spritesheets with distinct Bengaluru character palettes, interior tileset with 64 tiles, and 4 interior tilemaps for metro/coffee/mall/library
- NPC interaction pipeline with GBA-style typewriter dialogue box, floating interaction prompt, NPC entity/manager with Grid Engine patrol, and adjacency-based interaction detection
- Dark Souls-style zone banners with Power2 slide animation, landmark discovery tracking via tile-coordinate hit testing, and camera-fade building transitions
- Wired NPCManager, InteractionSystem, ZoneManager, and TransitionManager into WorldScene with corrected door positions matching tilemap collision tiles and a new library building in Cubbon Park
- 4 pure-logic TypeScript managers (Quest, Inventory, Journal, Save) with 34 unit tests, 10 new type interfaces, 18 event constants, and 3 JSON data files for Bengaluru items/pickups/discoveries
- 8 item icons, sparkle animation, save/hamburger UI icons, and park coffee vendor NPC generated via pngjs pipeline
- DialogBox choice mechanic with cursor navigation, NPCManager quest-state dialogue, and coffee quest JSON with 3 objectives and 4 NPC dialogue variants
- 8 Phaser UI components: PauseMenu with 5-tab overlay (Inventory/Quests/Journal/Save/Settings), QuestHUD corner indicator, and ItemNotification slide-in popup, all following GBA-style pixel art design spec
- MetroMap overlay with Namma Metro Purple Line diagram (3 stations, door-close/ride/door-open travel transition), ItemPickup sparkle entity, and interior interactable data for metro station and coffee shop
- All Phase 3 systems wired into running game: quest events, item pickups, auto-save, pause menu, HUD, metro map, and Continue/New Game title screen
- AudioManager class with BGM crossfade, SFX one-shot, ambient base+overlay layers, ducking, volume settings, and 34 passing TDD tests plus 16 placeholder MP3 files
- All 16 audio assets preloaded in BootScene, title music wired in TitleScene, outdoor/interior BGM and ambient switching in WorldScene, footstep gating via Grid Engine, dialogue tick SFX, settings panel wiring, and save volume bug fixed
- E2E test validates all 16 audio assets in Phaser cache, Chrome autoplay policy handled via AudioContext unlock deferral, human verified no console errors across all audio gameplay contexts

---
