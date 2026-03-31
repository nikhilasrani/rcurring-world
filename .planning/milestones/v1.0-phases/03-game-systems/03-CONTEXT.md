# Phase 3: Game Systems - Context

**Gathered:** 2026-03-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Exploration has purpose -- player can accept quests, collect items, track progress in a journal, fast-travel via metro, and save their game. This includes: quest system with dialogue-embedded acceptance, inventory with pixel art icons, discovery journal with completion tracking, metro map UI with fast-travel transition, save/load persistence with localStorage, pause menu with tabbed navigation, and title screen Continue option. No audio, no new zones, no combat -- those are other phases.

</domain>

<decisions>
## Implementation Decisions

### Quest System
- Quests are dialogue-embedded: NPC dialogue naturally leads to a quest offer with Accept/Decline choice
- Dialogue system extended with choice mechanic -- special pages present 2 options, player selects with up/down + A
- One active quest at a time. If player talks to another quest NPC while one is active, they're told to come back later
- Quest states: not started, offered (dialogue seen), accepted, in-progress, complete
- NPC dialogue changes based on quest state (before quest, active, complete) -- dialogue only, no behavior changes
- Declining a quest is always re-offerable -- NPC offers again on next interaction
- Subtle HUD indicator in screen corner shows active quest progress (e.g., "1/3")
- Quest completion triggers a fanfare banner (zone banner style) showing "Quest Complete!" + item received
- Quest rewards: unique collectible item AND unlocked new NPC dialogue lines

### Coffee Quest ("Find the Best Filter Coffee")
- Visit and taste coffee at 3 spots, then return to chai-walla to declare his the best
- Coffee spot 1: Chai-walla cart (outdoor, existing NPC)
- Coffee spot 2: Coffee Shop interior (add counter NPC or use interactable counter -- already built)
- Coffee spot 3: Cubbon Park stall (new small NPC near park or interactable cart object)
- Reward: "Best Filter Coffee" item + chai-walla's grateful dialogue
- Quest NPCs use extended NPC JSON data -- `questDialogue` section added to existing NPC files with state-specific dialogue

### Inventory
- Grid layout with pixel art item icons (Pokemon bag style)
- Select an item to see name + flavor text description below the grid
- Items are purely collectible souvenirs -- no use, consume, trade, combine, or equip mechanics
- Items collected via two sources: NPC gifts through dialogue AND world sparkly pickups
- Both trigger a "Got [item]!" notification
- Inventory capacity: 12 slots (shown as 2 rows of 6)

### World Item Pickups
- One-time pickups: sparkly animation sprite on tile, press A to collect, disappears permanently
- 5 pickups placed near landmarks (thematic placement):
  1. Jasmine Flowers -- near Cubbon Park entrance
  2. Metro Token -- on metro station platform floor (interior)
  3. Masala Dosa -- near food stall on MG Road sidewalk
  4. Park Leaf -- deeper in Cubbon Park, off main path
  5. Shopping Bag -- outside UB City entrance
- Collected state tracked in save data

### Bengaluru Items (6-8 curated)
- Filter Coffee -- "Steel tumbler, strong decoction"
- Masala Dosa -- "Crispy, with coconut chutney"
- Jasmine Flowers -- "Malli hoo for the hair"
- Namma Metro Token -- "Namma Metro Purple Line"
- Cubbon Park Leaf -- "From a 100-year rain tree"
- UB City Shopping Bag -- "UB City premium retail"
- Old Bengaluru Photo -- quest reward from exploring
- Best Filter Coffee -- coffee quest reward, "The pride of MG Road"

### Pause Menu
- Full-screen tabbed overlay with tabs: Quests | Inventory | Journal | Save | Settings
- Opened via Escape key (desktop) + hamburger button in top-right corner (touch devices)
- Closed via B button or Escape
- Navigation: left/right to switch tabs, up/down to navigate items within tab
- Both keyboard and touch input supported -- tap tabs, tap items, tap X to close

### Journal
- Three sub-sections within journal tab: Places, NPCs Met, Items Found
- Each entry shows pixel art icon + name + short flavor text
- Zone completion percentage displayed at top (e.g., "MG Road: 60%")
- Undiscovered entries shown as "???" placeholders with locked icon -- player sees how many remain without spoilers
- Discovery counts: "Places: 2/5 discovered"

### Save/Load
- localStorage as storage backend -- JSON string with player, quests, inventory, discovery data
- Single save slot -- "Save Game" overwrites previous save
- Auto-save triggers on zone transitions with tiny save icon (floppy disk) flash in bottom-right corner for 1.5 seconds
- Manual save from pause menu Save tab
- Title screen shows New Game + Continue -- Continue greyed out if no save exists
- New Game warns if it will overwrite existing save ("This will overwrite your saved game. Continue?")
- Corrupt/missing save: show warning message, start fresh ("Save data couldn't be loaded. Starting a new game.")
- Saved state includes: player position, quest progress, inventory, discovered zones/landmarks/NPCs, collected pickups

### Settings Tab
- Minimal for v1: Music volume slider, SFX volume slider, Run default toggle
- Volume sliders ready for Phase 4 audio integration

### Metro Fast-Travel
- Namma Metro Purple Line diagram showing station dots along a line
- Player accesses metro map by interacting with metro map wall object inside metro station interior (press A)
- Current station (MG Road) highlighted on the diagram
- Other stations visible but greyed out/unselectable with "Coming in future update" message
- Travel transition: 3-part animation (doors slide shut 0.5s, ride screen with "Next stop: [station]" 1.5s, doors slide open 0.5s)
- In v1 with only one zone, metro map is functional UI but travel destinations are locked -- sets up v2 expansion

### Claude's Discretion
- Quest data JSON schema details (as long as it supports state-based dialogue and follows existing NPC JSON patterns)
- Exact pixel art style for item icons, sparkle animation, menu borders
- Menu font and spacing within the GBA aesthetic
- Save data schema version handling
- Metro line diagram visual details (exact station positions, line colors)
- Coffee quest NPC placement (counter NPC vs interactable object in coffee shop)
- HUD indicator positioning and styling

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` -- Project vision, core value ("feel like Bengaluru"), constraints, key decisions
- `.planning/REQUIREMENTS.md` -- Phase 3 requirements: QUST-01..04, INVT-01..03, JRNL-01..03, MTRO-01..03, SAVE-01..04, PLAT-04
- `.planning/ROADMAP.md` -- Phase 3 success criteria, dependency on Phase 2

### Prior Phase Context
- `.planning/phases/01-foundation-and-movement/01-CONTEXT.md` -- Foundation decisions: tile size, EventsCenter, Grid Engine, UIScene overlay, JSON-driven content
- `.planning/phases/02-world-interaction/02-CONTEXT.md` -- World interaction decisions: dialogue system, NPC data, building interiors, zone banners, transition manager

### Research (from Phase 1 -- still relevant)
- `.planning/research/STACK.md` -- Phaser 3.90.0, Grid Engine, rexrainbow plugins
- `.planning/research/ARCHITECTURE.md` -- Scene architecture, data-driven content pattern

### Existing Code (key integration points)
- `src/scenes/WorldScene.ts` -- Main game scene, where quest triggers, item pickups, and metro interactions integrate
- `src/scenes/UIScene.ts` -- Overlay scene for HUD, dialogue, menus
- `src/scenes/TitleScene.ts` -- Title screen, needs Continue option added
- `src/ui/DialogBox.ts` -- Dialogue system to extend with choice mechanic
- `src/ui/DialogueController.ts` -- Dialogue state management
- `src/systems/ZoneManager.ts` -- Zone/landmark discovery tracking (journal data source)
- `src/systems/TransitionManager.ts` -- Building enter/exit transitions (metro travel builds on this)
- `src/systems/InteractionSystem.ts` -- Interaction detection (extend for item pickups)
- `src/systems/NPCManager.ts` -- NPC management (extend for quest-state dialogue)
- `src/utils/constants.ts` -- EVENTS, ASSETS, SCENES constants to extend
- `src/utils/types.ts` -- Type definitions (PlayerState, DiscoveryState, NPCDef, etc.)
- `src/data/npcs/*.json` -- NPC data files to extend with questDialogue sections

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `DialogBox` (src/ui/DialogBox.ts): Typewriter text, multi-page, NPC name display -- extend with choice mechanic for quest accept/decline
- `ZoneBanner` (src/ui/ZoneBanner.ts): Slide-down banner animation -- reuse pattern for quest completion fanfare and item pickup notifications
- `InteractionPrompt` (src/ui/InteractionPrompt.ts): A button icon above interactables -- extend for item pickup prompts
- `ZoneManager` (src/systems/ZoneManager.ts): Already tracks discovered zones and landmarks -- journal consumes this data directly
- `TransitionManager` (src/systems/TransitionManager.ts): Fade transition orchestration -- metro travel builds similar sequence
- `EventsCenter` (src/utils/EventsCenter.ts): Cross-scene event bus for quest events, save events, menu events
- `TouchControls` (src/ui/TouchControls.ts): A/B button pattern -- add hamburger menu button here

### Established Patterns
- JSON-driven content: NPC, sign, interior, zone data all in `src/data/` as plain JSON -- quest, item, and journal data follow same pattern
- Programmatic asset generation via pngjs/canvas: Item icons and sparkle sprites can use same pipeline
- Scene composition: WorldScene + UIScene parallel pattern -- pause menu renders in UIScene or new MenuScene
- Interior mode via scene restart with data object: Metro travel can use similar restart pattern
- ES module JSON imports for Vite compatibility

### Integration Points
- `WorldScene.create()`: Where item pickup entities spawn, quest interaction handlers register
- `WorldScene.update()`: Where pickup proximity detection runs
- `UIScene`: HUD quest indicator, pause menu overlay, metro map overlay
- `TitleScene`: Add Continue/New Game menu options
- `BootScene.preload()`: Load item icon sprites, menu assets, sparkle sprite
- `NPCManager`: Needs quest state awareness to select correct dialogue
- `InteractionSystem`: Extend interaction target types for item pickups and metro map wall

</code_context>

<specifics>
## Specific Ideas

- Coffee quest should feel like a walking tour -- "go try three coffees and come back" is a natural exploration motivator that uses the existing map
- Items are Bengaluru souvenirs, not RPG consumables. Each one should evoke a specific Bengaluru experience ("malli hoo for the hair", "steel tumbler, strong decoction")
- Metro map should feel like the actual Namma Metro Purple Line diagram you see in stations -- authentic visual reference
- The pause menu tabbed interface should feel like a GBA menu -- pixel borders, clean tabs, keyboard-navigable
- Journal ??? placeholders create a "gotta catch 'em all" exploration pull without spoiling what's where
- Save icon flash (floppy disk) is a subtle retro touch that fits the GBA aesthetic
- Title screen Continue option is important -- players should be able to leave and come back to their 5-minute walk

</specifics>

<deferred>
## Deferred Ideas

None -- discussion stayed within phase scope.

</deferred>

---

*Phase: 03-game-systems*
*Context gathered: 2026-03-21*
