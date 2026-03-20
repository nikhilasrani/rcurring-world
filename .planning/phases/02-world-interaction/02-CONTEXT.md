# Phase 2: World Interaction - Context

**Gathered:** 2026-03-20
**Status:** Ready for planning

<domain>
## Phase Boundary

The world feels alive -- player can talk to NPCs, read signs, enter buildings, and discover landmarks. This includes: dialogue system, 5 NPCs with culturally authentic dialogue, readable signs, 4 building interiors with door transitions, zone name banners, and landmark discovery tracking. No quests, no inventory, no journal UI, no audio -- those are Phase 3+.

</domain>

<decisions>
## Implementation Decisions

### Dialogue System
- Classic GBA-style dialogue box: white/light box at screen bottom with dark pixel border
- NPC name displayed in top-left corner of the box
- 2 lines of text per page, box takes ~25% of screen height (80px of 320px)
- Typewriter text reveal at medium speed (~30ms per character)
- Tap anywhere on screen or press action button (A / Enter / Space) to advance: first tap completes current page text instantly, second tap goes to next page
- Down-arrow indicator (▼) when more pages follow
- Player movement is frozen while dialogue is active
- NPC turns to face player when dialogue starts (NPC-03)
- Signs use the same dialogue box but without NPC name label (SIGN-02)
- Small 'A' button icon appears above interactable NPCs/signs when player is on adjacent tile and facing them
- Interaction range: adjacent tile only, player must be facing the target (standard Pokemon behavior)

### NPC Characters
- 5 NPCs, each placed near a landmark:
  1. **Chai-walla / filter coffee vendor** -- near MG Road, street vendor with cart. Sets up Phase 3 coffee quest.
  2. **Auto-rickshaw driver** -- roadside near metro station. Offers local tips, complains about traffic.
  3. **Cubbon Park walker / jogger** -- inside Cubbon Park area. Talks about park history, rain trees.
  4. **Shopkeeper** -- near UB City. Comments on old vs new Bengaluru contrast.
  5. **Security guard** -- near Vidhana Soudha. Talks about grand architecture, "Government work, saar."
- All NPCs have simple patrol routes (2-3 tile back-and-forth paths), not stationary
- Same 16x24 chibi sprite style as player, with unique outfits per NPC:
  - Chai-walla: white lungi + vest
  - Auto driver: khaki uniform
  - Jogger: track suit
  - Shopkeeper: kurta
  - Guard: uniform
- Walk + idle animations for all NPCs (same spritesheet format as player: 4 directions, 3 frames each)
- Culturally authentic language: light Kannada sprinkle in mostly English dialogue. 2-3 Kannada words per NPC ("saar", "guru", "namaskara", "banni", "oota aitha?"). Natural code-switching understandable without knowing Kannada.

### Building Interiors
- 4 enterable buildings:
  1. **MG Road Metro station** -- ticket counter, platform area, metro map on wall. Sets up Phase 3 fast-travel.
  2. **Chai/coffee shop** -- counter, tables, menu board, steaming cups. Ties to chai-walla NPC.
  3. **UB City mall entrance** -- marble floors, decorative escalator, shop fronts. Modern Bengaluru.
  4. **Cubbon Park library/museum** -- bookshelves, reading tables, old Bengaluru photos. Heritage feel.
- Door transition: fade to black, load interior tilemap, fade back in. Zone banner slides in after fade completes.
- Each interior is a separate tilemap file (not part of main 60x60 map). Loaded on demand when entering.
- Small room sizes: 10-15 tiles wide (10x8 to 15x12). Most fit in one screen with no scrolling needed.
- Player exits building by walking to door tile, same fade transition back to outdoor map.

### Zone Banners and Discovery
- Zone banner: slides down from top of screen, white text on semi-transparent dark band. Stays 2-3 seconds, slides back up. Non-blocking -- player can keep moving.
- Banner triggered by zone boundary tiles (already defined in tilemap's zones layer). Shows once per zone entry -- doesn't repeat if player is already in the zone.
- Every zone transition triggers a banner: outdoor zones AND building entries (consistent behavior).
- Landmark discovery: auto-discover on zone entry. Walking into a landmark's zone marks it as discovered in game state. No special interaction needed. Discovery data stored for Phase 3 journal.

### Claude's Discretion
- Dialogue box pixel art details (exact border style, font choice, padding)
- NPC dialogue content (specific lines -- as long as they follow the Kannada sprinkle and character personality guidelines)
- Interior tileset design (furniture, decoration placement within the room layouts)
- Zone boundary shapes on the outdoor tilemap (as long as they cover the landmark areas)
- How NPC patrol routes are defined in data (tilemap objects vs JSON config)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` -- Project vision, core value ("feel like Bengaluru"), constraints, key decisions
- `.planning/REQUIREMENTS.md` -- Phase 2 requirements: NPC-01..06, SIGN-01..02, EXPL-02..04
- `.planning/ROADMAP.md` -- Phase 2 success criteria and dependency on Phase 1

### Phase 1 Foundation (existing code)
- `.planning/phases/01-foundation-and-movement/01-CONTEXT.md` -- Phase 1 decisions: tile size, map layout, sprite style, touch controls, EventsCenter pattern
- `.planning/phases/01-foundation-and-movement/01-VERIFICATION.md` -- What was verified in Phase 1

### Research (from Phase 1 -- still relevant)
- `.planning/research/STACK.md` -- Phaser 3.90.0, Grid Engine, rexrainbow plugins
- `.planning/research/ARCHITECTURE.md` -- Scene architecture, data-driven content pattern
- `.planning/research/PITFALLS.md` -- Known issues and workarounds

### Existing Code
- `src/scenes/WorldScene.ts` -- Where NPC spawning, zone detection, and building transitions will integrate
- `src/scenes/UIScene.ts` -- Where dialogue box overlay will be added
- `src/utils/constants.ts` -- EVENTS, SCENES, ASSETS constants to extend
- `src/utils/EventsCenter.ts` -- Cross-scene communication for dialogue triggers
- `src/data/zones/mg-road.json` -- Zone metadata with 5 landmarks (extend with NPC/sign data)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `UIScene` (src/scenes/UIScene.ts): Parallel overlay scene -- dialogue box should render here, above WorldScene
- `EventsCenter` (src/utils/EventsCenter.ts): Cross-scene event bus. Use for dialogue triggers (NPC_INTERACT, SIGN_INTERACT events)
- `TouchControls` (src/ui/TouchControls.ts): A button already wired to TOUCH_ACTION event -- can trigger NPC interaction on mobile
- `constants.ts`: EVENTS and ASSETS registries ready to extend with dialogue/NPC constants
- Zone objects in tilemap: 5 landmark zones already exist in the zones layer with IDs

### Established Patterns
- Grid Engine for tile-locked movement: NPCs can use the same plugin for patrol routes and face-direction
- Programmatic asset generation via pngjs: NPC sprites can use same pipeline as player sprites
- Programmatic tilemap generation: Interior tilemaps can use same pattern as outdoor map
- Scene composition: WorldScene + UIScene parallel pattern. Dialogue box fits naturally in UIScene

### Integration Points
- `WorldScene.create()`: Where NPC entities spawn, zone detection listeners register, and door tile handlers connect
- `WorldScene.update()`: Where interaction prompt visibility checks run (adjacent NPC/sign detection)
- `UIScene`: Dialogue box rendering, zone banner animation
- `BootScene.preload()`: Where NPC sprites and interior tilemap assets load
- `src/config.ts`: Scene array needs interior scenes or dynamic scene loading

</code_context>

<specifics>
## Specific Ideas

- NPCs should feel like real Bengaluru people you'd pass on the street, not generic RPG townsfolk. The auto driver's dialogue about traffic, the chai-walla's pride in his filter coffee, the guard's bureaucratic manner -- these details are what make it Bengaluru.
- The metro station interior is the most important building because it directly sets up Phase 3 metro fast-travel. Make sure it has a visible metro map on the wall and platform area.
- The interaction prompt (A button icon above NPCs) is important for mobile discoverability -- without it, touch-only players won't know they can talk to NPCs.
- Zone banners should feel like the Dark Souls area name reveal -- understated, elegant, non-blocking. Not a popup that demands attention.

</specifics>

<deferred>
## Deferred Ideas

None -- discussion stayed within phase scope.

</deferred>

---

*Phase: 02-world-interaction*
*Context gathered: 2026-03-20*
