# Roadmap: Recurring World -- Bengaluru Explorer

## Overview

Four phases take this project from empty repo to a playable 5-minute Bengaluru walk. Phase 1 establishes the Phaser project with pixel art rendering, tile movement, and a walkable MG Road / CBD tilemap -- including touch controls so the game is deployable and testable on real mobile devices from day one. Phase 2 fills that world with NPCs, dialogue, signs, and explorable buildings. Phase 3 wires up the game systems that give the exploration purpose -- quests, inventory, journal, metro fast-travel, save/load, and the pause menu. Phase 4 layers on audio and polish to make it sound and feel like a real game.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation and Movement** - Phaser project scaffold with pixel art rendering, tile movement, collision, camera, touch controls, and a walkable MG Road / CBD map (completed 2026-03-20)
- [ ] **Phase 2: World Interaction** - NPCs with dialogue, readable signs, building interiors, zone banners, and landmark discovery
- [ ] **Phase 3: Game Systems** - Quest loop, inventory, journal, metro fast-travel, save/load persistence, and pause menu
- [ ] **Phase 4: Audio and Polish** - Sound effects, background music, and ambient city sounds

## Phase Details

### Phase 1: Foundation and Movement
**Goal**: Player can walk around a recognizable MG Road / CBD neighborhood rendered in GBA-style pixel art, on both desktop (keyboard) and mobile (touch controls)
**Depends on**: Nothing (first phase)
**Requirements**: MOVE-01, MOVE-02, MOVE-03, MOVE-04, MOVE-05, EXPL-01, PLAT-01, PLAT-02, PLAT-03
**Success Criteria** (what must be TRUE):
  1. Player can move in 4 directions on a tile grid using keyboard, with walk animations and a 2x run toggle
  2. Player cannot walk through walls, buildings, water, or other impassable tiles
  3. Camera follows the player smoothly and stays within map bounds
  4. The MG Road / CBD tilemap is visible with recognizable pixel art representations of Chinnaswamy Stadium, UB City, Cubbon Park entrance, Vidhana Soudha, and MG Road Metro station
  5. The game loads and runs in Chrome, Safari, and Firefox on both desktop and mobile
  6. On touch devices, a virtual D-pad and action button overlay appears without obscuring the gameplay area, and the player can move and interact using touch alone
**Plans**: 5 plans

Plans:
- [x] 01-01-PLAN.md -- Project scaffold, Phaser config, shared utilities, test infrastructure
- [x] 01-02-PLAN.md -- Player spritesheets and opening sequence (Boot, Title, Name Entry scenes)
- [x] 01-03-PLAN.md -- GBA pixel art tilesets and MG Road / CBD tilemap creation
- [x] 01-04-PLAN.md -- WorldScene with Grid Engine movement, collision, camera, and speed toggle
- [x] 01-05-PLAN.md -- Touch controls (UIScene), GitHub Pages deployment, E2E tests, and final verification

### Phase 2: World Interaction
**Goal**: The world feels alive -- player can talk to NPCs, read signs, enter buildings, and discover landmarks
**Depends on**: Phase 1
**Requirements**: NPC-01, NPC-02, NPC-03, NPC-04, NPC-05, NPC-06, SIGN-01, SIGN-02, EXPL-02, EXPL-03, EXPL-04
**Success Criteria** (what must be TRUE):
  1. Player can walk up to any of 3-5 NPCs, press action to talk, and read culturally authentic dialogue (English with Kannada phrases) in a typewriter-style dialogue box with NPC name and multi-page support
  2. NPCs face toward the player when spoken to
  3. Player can interact with signs and notice boards using the same dialogue box system
  4. Player can enter and exit 2-3 building interiors through door tiles, with a zone name banner sliding in on each transition
  5. Player can discover and visit all major landmarks in the MG Road / CBD area
**Plans**: 5 plans

Plans:
- [ ] 02-01-PLAN.md -- Phase 2 types, constants, NPC dialogue data, sign data, and interior metadata
- [ ] 02-02-PLAN.md -- NPC spritesheets, interior tileset, and interior tilemaps (asset generation)
- [ ] 02-03-PLAN.md -- DialogBox, InteractionPrompt, NPC entity, NPCManager, and InteractionSystem
- [ ] 02-04-PLAN.md -- ZoneBanner, ZoneManager, and TransitionManager for zones and building transitions
- [ ] 02-05-PLAN.md -- Integration wiring into WorldScene/UIScene/BootScene, tests, and verification

### Phase 3: Game Systems
**Goal**: Exploration has purpose -- player can accept quests, collect items, track progress in a journal, fast-travel via metro, and save their game
**Depends on**: Phase 2
**Requirements**: QUST-01, QUST-02, QUST-03, QUST-04, INVT-01, INVT-02, INVT-03, JRNL-01, JRNL-02, JRNL-03, MTRO-01, MTRO-02, MTRO-03, SAVE-01, SAVE-02, SAVE-03, SAVE-04, PLAT-04
**Success Criteria** (what must be TRUE):
  1. Player can accept a quest from an NPC, track its objectives (accepted / in-progress / complete), and receive a reward on completion -- at least the "find the best filter coffee" quest is fully playable
  2. Player can collect Bengaluru-specific items (masala dosa, filter coffee, jasmine flowers) into an inventory and view them with pixel art icons and flavor text
  3. Player has a discovery journal that records landmarks visited, NPCs met, items collected, and shows zone completion percentage
  4. Player can enter a metro station, view a metro map, select a destination, and fast-travel with a transition animation (doors close, ride, doors open)
  5. Player can save manually from the pause menu or auto-save on zone transitions, then load and resume with all progress intact (position, quests, inventory, journal)
**Plans**: 7 plans

Plans:
- [x] 03-01-PLAN.md -- Types, constants, data files (items/pickups/journal), pure-logic managers (Quest, Inventory, Journal, Save) with unit tests
- [x] 03-02-PLAN.md -- Programmatic asset generation (item icons, sparkle, save icon, hamburger icon, park coffee vendor NPC sprite)
- [x] 03-03-PLAN.md -- DialogBox choice mechanic, NPCManager quest-state dialogue, coffee quest data, NPC dialogue extensions
- [x] 03-04-PLAN.md -- PauseMenu with 5 tab panels (Inventory, Quests, Journal, Save, Settings), QuestHUD, ItemNotification
- [x] 03-05-PLAN.md -- MetroMap overlay with travel transition, ItemPickup entity, interior interactable data
- [ ] 03-06-PLAN.md -- Scene integration (WorldScene, UIScene, TitleScene, BootScene, TouchControls, InteractionSystem)
- [ ] 03-07-PLAN.md -- E2E tests and human verification of all game systems

### Phase 4: Audio and Polish
**Goal**: The game sounds like Bengaluru -- ambient city audio, background music, and sound effects complete the "5-minute walk" experience
**Depends on**: Phase 3
**Requirements**: AUDO-01, AUDO-02, AUDO-03, AUDO-04
**Success Criteria** (what must be TRUE):
  1. Key actions produce sound effects -- footsteps, door open/close, NPC interaction chime, menu sounds
  2. Area-specific background music plays (at least outdoor and interior themes) and crossfades on zone/building transitions
  3. Ambient city sounds are layered by area -- traffic near roads, birds in Cubbon Park, announcements near metro
**Plans**: TBD

Plans:
- [ ] 04-01: TBD
- [ ] 04-02: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation and Movement | 5/5 | Complete   | 2026-03-20 |
| 2. World Interaction | 0/5 | Not started | - |
| 3. Game Systems | 4/7 | In Progress|  |
| 4. Audio and Polish | 0/? | Not started | - |
