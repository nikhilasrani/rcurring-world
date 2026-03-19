# Feature Research

**Domain:** GBA-style city exploration game (no combat, cultural nostalgia)
**Researched:** 2026-03-19
**Confidence:** HIGH

## Feature Landscape

This analysis draws from Pokemon FireRed/Emerald overworld mechanics, cozy/non-combat exploration games (A Short Hike, Spiritfarer, Stardew Valley), cultural heritage game design research, and the specific Bengaluru-explorer context defined in PROJECT.md. The game strips the combat layer from the Pokemon formula and replaces it with cultural discovery and city nostalgia.

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete or broken.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Grid-based tile movement** | Core Pokemon GBA feel. Players move on a tile grid with 4-directional D-pad input. Without this, it does not feel like a GBA game. | MEDIUM | 16x16 tile grid. Collision layers from Tiled. Smooth tile-to-tile interpolation (not instant snap). |
| **Player sprite with walk animation** | Visual feedback for movement. Pokemon has 4-direction walk cycles (3 frames each minimum). Static sprite sliding across tiles feels broken. | LOW | 4 directions x 3 frames = 12 frames minimum. Can start with placeholder. |
| **NPC placement and interaction** | Talking to people IS the gameplay when there is no combat. NPCs standing in the world that you walk up to and press a button to talk to. | MEDIUM | Face-toward-player on interact. Speech bubble indicator. Proximity trigger zone. |
| **Dialogue box system** | The primary content delivery mechanism. Text appears in a box at the bottom of the screen, typewriter-style, advance with button press. | MEDIUM | Must support: typewriter text reveal, tap-to-advance, multi-page messages, NPC name display. Pokemon-style bottom-of-screen box. |
| **Collision and boundaries** | Players must not walk through walls, water, buildings, or other impassable terrain. Basic expectation of any tile game. | LOW | Collision layer in Tiled. Phaser tilemap collision API handles this natively. |
| **Screen/zone transitions** | Walking to the edge of a map or through a door loads a new area. Pokemon uses fade-to-black transitions between routes/buildings. | MEDIUM | Fade transition between scenes. Door tiles trigger interior loads. Zone edge triggers adjacent zone load. |
| **Building interiors** | Entering buildings (shops, stations, landmarks) loads an interior map. Pokemon has dozens of enterable buildings per town. | MEDIUM | Each enterable building = separate Tiled map. Door tile on exterior links to interior spawn point. |
| **Save/load system** | Players expect to save progress and resume later. Essential for mobile (app switching kills state). | MEDIUM | LocalStorage or IndexedDB. Save player position, quest state, inventory, visited flags. Auto-save on zone transition for mobile. |
| **Pause/menu screen** | Press Start/Escape to open a menu. Shows inventory, quest log, map, save option. Pokemon menu is iconic. | MEDIUM | Overlay UI. Sections: Inventory, Quests, Map, Save, Settings. |
| **Camera that follows player** | Camera centered on player, scrolling smoothly as they move through the world. Standard for all top-down tile games. | LOW | Phaser camera.startFollow(). Bounded to map edges so camera does not show void. |
| **Location signposts** | When entering a new area, a banner appears showing the area name (e.g., "MG Road", "Cubbon Park"). Pokemon does this for every route/town. | LOW | Slide-in text overlay triggered by zone entry. Disappears after 2-3 seconds. |
| **Sound effects** | Button press sounds, door sounds, NPC interaction chime, footstep sounds, menu sounds. Without SFX the game feels like a slideshow. | LOW | ~10-15 core SFX. Can be simple 8-bit style chiptune sounds. |
| **Background music** | Area-specific BGM. Different music for outdoors, interiors, metro stations. Pokemon has distinct music per town/route. | MEDIUM | Need 3-5 tracks minimum for v1. Chiptune/lo-fi style matching GBA aesthetic. Crossfade on zone transition. |
| **Readable signs and objects** | Pressing interact on signs, notice boards, plaques shows text. Information delivery without NPC. | LOW | Same dialogue box system, triggered by object interaction instead of NPC. |
| **Touch/mobile controls** | Cross-platform target includes iOS/Android. Without on-screen D-pad and action button, mobile is unplayable. | MEDIUM | Virtual joystick or D-pad overlay. Action button. Menu button. Must not obscure gameplay area. |

### Differentiators (Competitive Advantage)

Features that make this game special. These are where the Bengaluru identity lives.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Recognizable Bengaluru landmarks as pixel art** | THE core differentiator. Chinnaswamy Stadium, Vidhana Soudha, Cubbon Park, UB City rendered in GBA pixel style. Locals see it and say "I know that place." This is the entire emotional hook. | HIGH | Each landmark = custom tileset work. Must be recognizable, not generic. AI-assisted generation with manual curation. |
| **Namma Metro as fast-travel** | Bengaluru-specific mechanic. Enter metro station, pick destination on metro map UI, exit at destination station. Maps directly to real Namma Metro stops. Familiar to every Bengaluru local. | MEDIUM | Metro map selection screen. Loading/transition animation (train doors close, brief ride, doors open). Station interiors. |
| **Culturally authentic NPC dialogue** | NPCs that speak like Bengaluru locals -- mix of English, Kannada, and Hindi. Chai-walla, auto-rickshaw driver, IT professional, flower seller. Dialogue that captures real Bengaluru character. | MEDIUM | Writing challenge more than technical. Dialogue must feel authentic, not touristy. Kannada script support in text renderer needed. |
| **City-specific quest chains** | "Find the best filter coffee on MG Road", "Help the flower seller on Sampige Road", "Photograph all the heritage buildings in CBD". Quests that teach you about real Bengaluru. | MEDIUM | Quest state machine: accepted/in-progress/complete. Quest objectives tied to NPC interactions, location visits, item collection. |
| **Ambient city soundscape** | Auto-rickshaw horns, street vendor calls, temple bells, metro announcements, cricket commentary near Chinnaswamy. Layers of sound that make you FEEL Bengaluru. | MEDIUM | Positional audio tied to map zones. Layer multiple ambient tracks. Volume based on proximity. |
| **Collectible local items** | Masala dosa, filter coffee, jasmine flowers, Mysore silk, sandalwood items. Items that are culturally specific and trigger recognition. | LOW | Inventory items with pixel art icons and flavor text descriptions. Collection completionist mechanic. |
| **Photo/discovery journal** | A journal that records landmarks visited, NPCs met, items found. Completionist tracker that doubles as a love letter to the city. | MEDIUM | Persistent state tracking. Journal UI with pixel art thumbnails. Percentage completion. Area-by-area breakdown. |
| **Area-specific weather/atmosphere** | Bengaluru's famous weather -- pleasant evenings, sudden rain showers, morning mist in Cubbon Park. Visual palette shifts and rain particle effects. | MEDIUM | Palette overlay system. Rain particle emitter. Per-zone weather configuration. |
| **Running shoes / speed toggle** | Pokemon gives you running shoes to move 2x speed. Essential quality-of-life for exploration. Hold button to run. | LOW | Double movement speed while holding button. Run animation (faster walk cycle). |
| **Auto-rickshaw rides** | Short-distance fast travel within a zone. Talk to auto driver, pick nearby destination, brief ride animation. More Bengaluru-flavored than teleporting. | LOW | Variant of metro fast-travel but within a zone. Simple cutscene transition. Dialogue with meter/haggling humor. |
| **Signboard Kannada/English bilingual text** | Real Bengaluru signs are bilingual. In-game signposts showing Kannada + English feels authentic. | LOW | Bilingual text rendering in dialogue box. Adds immersion without gameplay complexity. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but would hurt this specific project.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Combat system** | "It is Pokemon-style, add battles!" | Doubles scope. Requires balancing, enemy AI, HP systems, battle UI. The game is about exploration and nostalgia, not grinding. Combat-free is a design choice, not a limitation. | Rich NPC interactions and quest variety provide engagement without combat. |
| **Multiplayer / co-op** | "Explore with friends!" | Networking layer, state sync, server infrastructure. Massive scope increase for a city nostalgia game that works as a solitary stroll. | Shareable screenshots/moments. "Did you find X?" social discovery. |
| **Real-time clock / live events** | "Sync with real Bengaluru time!" | Locks content behind time. Players in different timezones miss things. Adds server dependency for a single-player game. | Optional day/night palette cycle (cosmetic only, no gameplay gating). |
| **Complex economy / shops** | "Let players buy and sell items, earn rupees" | Economy balancing is a black hole. Items should be found/collected, not ground for. Shops as NPC interactions work; economy as a system does not. | NPCs "give" you items as quest rewards or interactions. Shops are flavor (buy chai = trigger dialogue + get item), not economy. |
| **Open world / full Bengaluru** | "Map the entire city from day one!" | Bengaluru is enormous. Creating even one zone at quality takes significant effort. Scope creep is the number one project killer. | Start with MG Road/CBD. Expand zone by zone. Architecture must support expansion but v1 is one neighborhood done well. |
| **Procedural generation** | "Generate random NPCs/quests for replayability" | The value is handcrafted Bengaluru authenticity. Procedural content feels generic, the opposite of "I recognize that exact chai stall." | Handcrafted content with enough density that one zone feels rich. Expansion via new handcrafted zones. |
| **Minigames (cricket, cooking, etc.)** | "Add a cricket minigame at Chinnaswamy!" | Each minigame is a separate game to design, balance, and polish. Scope explosion. | v1: Minigames are out of scope. v2+: Consider one flagship minigame if the core loop is validated. Keep it on the radar but not in MVP. |
| **Character customization** | "Let me pick my outfit/skin tone" | Art pipeline cost multiplied. Every sprite sheet needs variants. For a nostalgia game about the city (not the player character), this is low-value high-cost. | One well-designed protagonist sprite. Maybe male/female toggle if assets allow. |
| **Voice acting** | "NPCs should have voice lines" | Massive production cost. Bengaluru dialogue needs authentic accents and multilingual delivery. One bad voice line kills immersion worse than text. | Expressive pixel art portraits + text + sound effects (Undertale/Stardew approach: character-specific "mumble" sounds). |

## Feature Dependencies

```
[Tile Movement System]
    |--requires--> [Tilemap + Collision Layer]
    |--requires--> [Camera System]
    |--requires--> [Player Sprite + Animation]
    |
    |--enables--> [NPC Interaction]
    |                |--requires--> [Dialogue Box System]
    |                |--enables--> [Quest System]
    |                |                |--requires--> [Inventory System]
    |                |                |--requires--> [Quest State Machine]
    |                |                |--enables--> [Discovery Journal]
    |                |
    |                |--enables--> [Shop Interactions (flavor)]
    |
    |--enables--> [Zone Transitions]
    |                |--requires--> [Scene Management]
    |                |--enables--> [Building Interiors]
    |                |--enables--> [Metro Fast-Travel]
    |                               |--requires--> [Metro Map UI]
    |
    |--enables--> [Location Signposts]

[Pause Menu]
    |--requires--> [Inventory System]
    |--requires--> [Quest Log UI]
    |--requires--> [Save/Load System]
    |--optionally uses--> [Area Map UI]

[Audio System]
    |--independent, can be layered in at any phase--
    |--enhances--> [Zone Transitions] (music crossfade)
    |--enhances--> [NPC Interaction] (SFX)
    |--enhances--> [Ambient Soundscape] (positional audio)

[Touch Controls]
    |--independent layer over--> [Tile Movement System]
    |--should be added early to validate mobile feel--

[Landmark Art]
    |--independent asset pipeline--
    |--enhances--> [Tilemap]
    |--feeds into--> [Discovery Journal]
```

### Dependency Notes

- **Quest System requires Dialogue + Inventory:** Quests are accepted via NPC dialogue, tracked in quest state, and often involve collecting/delivering items. All three must exist.
- **Metro Fast-Travel requires Zone Transitions:** Metro is a special case of zone transition. The zone/scene loading system must work first.
- **Discovery Journal requires Quest System + Landmark visits:** Journal tracks both quest completion and location discovery. Build after quests work.
- **Audio is independently layerable:** Sound can be added at any phase without blocking other features. But adding it early makes playtesting more enjoyable.
- **Touch Controls should be validated early:** If mobile is a target, the virtual controls need to feel right. Waiting until the end risks discovering the control scheme does not work.
- **Landmark Art is an independent pipeline:** Custom Bengaluru landmark tilesets can be created in parallel with gameplay programming. AI asset pipeline supports this.

## MVP Definition

### Launch With (v1)

Minimum viable product: "5-minute Bengaluru walk" -- player explores MG Road/CBD, talks to NPCs, completes one quest.

- [ ] **Tile-based movement with collision** -- The game exists because you can walk around
- [ ] **One complete zone (MG Road/CBD)** -- Recognizable landmarks: Chinnaswamy, UB City, Cubbon Park entrance, Vidhana Soudha, MG Road Metro
- [ ] **3-5 interactive NPCs** -- Chai-walla, auto driver, local guide, shopkeeper, park visitor
- [ ] **Dialogue box system** -- Typewriter text, multi-page, NPC names
- [ ] **1 simple quest** -- "Find the best filter coffee on MG Road" or similar
- [ ] **Basic inventory** -- Collect quest items and local items
- [ ] **Building interiors (2-3)** -- Metro station, one shop, one landmark interior
- [ ] **Zone transition (exterior to interior)** -- Door/entrance mechanics
- [ ] **Save/load** -- LocalStorage persistence (critical for mobile)
- [ ] **Basic SFX** -- Interaction chime, footsteps, door sound
- [ ] **1-2 BGM tracks** -- Outdoor theme, interior theme
- [ ] **Mobile touch controls** -- Virtual D-pad + action button
- [ ] **Location signpost** -- Area name display on entry

### Add After Validation (v1.x)

Features to add once the core 5-minute experience proves the concept works.

- [ ] **Metro fast-travel** -- Connects when second zone is added; can prototype with one station in v1
- [ ] **3-5 more quests** -- Variety: fetch, explore, photograph, talk-to-all-NPCs types
- [ ] **Pause menu with quest log** -- Track active and completed quests
- [ ] **Discovery journal** -- Track landmarks visited, NPCs met, items collected
- [ ] **Running shoes** -- 2x speed toggle for quality of life
- [ ] **Ambient soundscape** -- Layered city sounds, positional audio
- [ ] **Second zone** -- Malleshwaram, Lalbagh, or Indiranagar as expansion
- [ ] **Weather effects** -- Rain overlay, evening palette shift
- [ ] **More BGM tracks** -- Per-zone music identity
- [ ] **Bilingual signboards** -- Kannada + English text on signs

### Future Consideration (v2+)

Features to defer until product-market fit is established and the core loop is validated.

- [ ] **Multiple interconnected zones** -- Full Bengaluru neighborhood network with metro connecting them
- [ ] **Auto-rickshaw rides** -- Intra-zone fast travel with humor dialogue
- [ ] **Rich NPC schedules** -- NPCs move around during gameplay (Stardew-style)
- [ ] **Photo mode** -- Screenshot framing tool for sharing
- [ ] **Seasonal events** -- Dasara, Ugadi themed content
- [ ] **One flagship minigame** -- If data shows players want more interaction depth
- [ ] **Accessibility features** -- Font size options, colorblind palettes, screen reader hints
- [ ] **Community-submitted landmarks** -- Let Bengaluru locals suggest places to add

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Tile movement + collision | HIGH | MEDIUM | P1 |
| Player sprite + animation | HIGH | LOW | P1 |
| NPC interaction | HIGH | MEDIUM | P1 |
| Dialogue box system | HIGH | MEDIUM | P1 |
| Recognizable landmarks (art) | HIGH | HIGH | P1 |
| One complete zone | HIGH | HIGH | P1 |
| Basic quest (1 quest) | HIGH | MEDIUM | P1 |
| Basic inventory | MEDIUM | LOW | P1 |
| Save/load | HIGH | MEDIUM | P1 |
| Zone transitions (doors) | HIGH | MEDIUM | P1 |
| Building interiors | MEDIUM | MEDIUM | P1 |
| SFX | MEDIUM | LOW | P1 |
| BGM (1-2 tracks) | MEDIUM | LOW | P1 |
| Touch controls | HIGH | MEDIUM | P1 |
| Location signposts | MEDIUM | LOW | P1 |
| Camera follow | HIGH | LOW | P1 |
| Pause menu | MEDIUM | MEDIUM | P2 |
| Quest log UI | MEDIUM | MEDIUM | P2 |
| Metro fast-travel | HIGH | MEDIUM | P2 |
| Running shoes | MEDIUM | LOW | P2 |
| Discovery journal | MEDIUM | MEDIUM | P2 |
| Multiple quests (3-5) | HIGH | MEDIUM | P2 |
| Ambient soundscape | MEDIUM | MEDIUM | P2 |
| Weather/atmosphere | LOW | MEDIUM | P2 |
| Second zone | HIGH | HIGH | P2 |
| Bilingual signboards | LOW | LOW | P2 |
| Auto-rickshaw rides | MEDIUM | LOW | P3 |
| NPC schedules | LOW | HIGH | P3 |
| Seasonal events | LOW | HIGH | P3 |
| Photo mode | LOW | MEDIUM | P3 |
| Minigame | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for launch (the 5-minute Bengaluru walk)
- P2: Should have, add after core is validated
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | Pokemon FireRed/Emerald | A Short Hike | Stardew Valley | Our Approach |
|---------|------------------------|--------------|----------------|--------------|
| Movement | Grid-based, 4-dir, running shoes | Free movement, climbing | Grid-based, running | Grid-based 4-dir. Running shoes after v1. |
| NPC Interaction | Talk, trade, battle trigger | Talk, receive items | Talk, gift, schedule | Talk, receive items, quest-give. No battle. No schedule in v1. |
| Dialogue | Bottom box, typewriter, portraits (later gens) | Speech bubbles | Portrait + text box | Bottom box, typewriter, NPC name. Portraits in v1.x. |
| Quest System | Gym badges as progression, side missions informal | Organic discovery, no explicit quests | Community center bundles, NPC requests | Explicit quest log. Simple accept/complete flow. |
| Inventory | Bag with categories (items, key items, pokeballs) | Minimal (feathers, shells) | Extensive (tools, crops, fish, minerals) | Simple flat list. Quest items + collectible local items. No categories needed in v1. |
| Fast Travel | Fly (requires HM + badge) | None (world is small) | Minecarts, horse | Namma Metro. Unlocked by visiting stations. |
| Save | Save anywhere (one slot) | Auto-save | Save at bed (end of day) | Auto-save on zone transition + manual save in menu. |
| Exploration Reward | New Pokemon, items, areas | Golden feathers, secrets, views | Forageables, artifacts, geodes | Local items, landmark discoveries, NPC stories, quest completion. |
| Cultural Identity | Japanese RPG tropes, fictional world | Generic cozy island | Generic rural America | SPECIFIC to Bengaluru. Real landmarks, real culture, real language. This is the differentiator. |
| Audio | Town themes, route themes, battle music | Gentle guitar soundtrack | Seasonal music, ambient farm sounds | Area-specific BGM + layered ambient city soundscape. |
| World Scale | Multiple towns, routes, caves | One small island | One farm + town | One neighborhood (MG Road/CBD) done well. Expand to more neighborhoods over time. |

## Sources

- Pokemon FireRed/LeafGreen overworld mechanics via Bulbapedia: [Running Shoes](https://bulbapedia.bulbagarden.net/wiki/Running_Shoes), [Bicycle](https://bulbapedia.bulbagarden.net/wiki/Bicycle), [Time system](https://bulbapedia.bulbagarden.net/wiki/Time)
- Pokemon ROM hack feature analysis: [Pokemon Unbound](https://www.pokecommunity.com/threads/pok%C3%A9mon-unbound-completed.382178/), [Heart & Soul](https://www.pokecommunity.com/threads/heart-soul-completed-johto-gba-decomp-hack-v1-2-1-out-now.538287/)
- Stardew Valley feature analysis: [Britannica overview](https://www.britannica.com/topic/Stardew-Valley), [CNN anniversary piece](https://www.cnn.com/2026/02/26/style/stardew-valley-video-game-anniversary)
- Cozy/no-combat game design: [Games like A Short Hike](https://www.cidzor.com/classes/games-like/best-games-like-a-short-hike), [Upcoming no-combat open world games](https://gamerant.com/upcoming-new-2025-open-world-games-no-zero-combat/)
- Inventory UI design: [Zalance inventory design guide](https://zalance.net/articles/inventory-ui-design-for-indie-games/)
- Cultural heritage game design: [Serious Games in Cultural Heritage (MDPI)](https://www.mdpi.com/2227-7102/13/1/47), [Nostalgia in game design (MoldStud)](https://moldstud.com/articles/p-designing-games-with-cultural-heritage-preserving-traditions-through-interactive-experiences)
- Nostalgia as design strategy: [Nostalgia in Retro Game Design (ResearchGate)](https://www.researchgate.net/publication/389831503_Nostalgia_in_Retro_Game_Design)
- Phaser tilemap development: [Modular Game Worlds in Phaser 3](https://medium.com/@michaelwesthadley/modular-game-worlds-in-phaser-3-tilemaps-1-958fc7e6bbd6), [Phaser RPG template](https://github.com/remarkablegames/phaser-rpg)
- Mother 3 exploration design: [Mother 3 Wiki](https://earthbound.fandom.com/wiki/Mother_3), [Rare Gamer review](https://www.raregamer.co.uk/mother-3-review/)

---
*Feature research for: GBA-style Bengaluru city exploration game*
*Researched: 2026-03-19*
