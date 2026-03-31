# Phase 1: Foundation and Movement - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Player can walk around a recognizable MG Road / CBD neighborhood rendered in GBA-style pixel art, on both desktop (keyboard) and mobile (touch controls). This includes: project scaffold, Phaser config, tilemap, player sprite with movement, collision, camera, touch controls, and deployment to GitHub Pages. No NPCs, no dialogue, no interiors, no audio — those are Phase 2+.

</domain>

<decisions>
## Implementation Decisions

### Map Layout and Scale
- Faithful geographic layout of MG Road / CBD — real street grid simplified into tiles. If you know the area, you can orient yourself.
- Medium map size: ~60x60 tiles. A few screens worth — enough to feel like a real neighborhood.
- Player spawns at MG Road Metro station exit — natural "arriving by metro" entry point.
- 5 landmarks: Chinnaswamy Stadium, UB City, Cubbon Park entrance, Vidhana Soudha, MG Road Metro station.
- Hard boundaries at map edges (trees/fences/barriers) — clear "end of area" signal.
- Visual elevation layers — stairs, elevated paths, overpasses for depth. Not flat.

### Placeholder Art Style
- GBA-quality placeholder tiles — actual pixel art, not developer rectangles.
- Tile source: mix of open-source base tiles (roads, trees, generic) + AI-generated tiles for Bengaluru-specific landmarks.
- Strict GBA 15-bit color palette (32,768 colors, limited palette per sprite/tile). Authentic constraint.
- 16x16 pixel tiles (classic GBA size).
- 480x320 base resolution (2x GBA) — gives 30x20 visible tiles.
- Asset tasks broken down by area (e.g., "Cubbon Park tiles", "MG Road tiles", "Chinnaswamy area") rather than by tile type.

### Map Decoration Density
- Dense, Pokemon-like — every tile has something. No empty space. Feels lived-in.
- Bengaluru-specific decorative elements:
  - Street vendors/carts: fruit carts, sugarcane juice stalls, flower baskets on sidewalks (decorative only in Phase 1)
  - Traffic elements: parked autos, buses at stops, two-wheelers (static)
  - Vegetation: rain trees, bougainvillea, Cubbon Park greenery — garden city vibe
  - Signage: BMTC bus stop signs, road name boards, shop fronts with pixel text

### Touch Controls
- Floating joystick: touch anywhere on left half to spawn. 4-direction snap (matches tile grid, no diagonals).
- A/B buttons in GBA style: A (interact/confirm) bottom-right, B (cancel/run) bottom-right.
- Controls appear on first touch — invisible until player touches the screen. Cleaner when not actively playing.
- B held while moving = run (2x speed). Two-thumb coordination like real GBA.
- Toggle-able on desktop: hidden by default, dev shortcut shows them for testing without a phone.

### Player Character
- Generic young explorer in casual Bengaluru clothes: T-shirt, jeans, backpack.
- Male/female choice at game start (side-by-side sprites, player picks one — like Pokemon FireRed's Oak intro).
- Chibi sprite style (16x16 or 16x24) — big head, small body. Iconic GBA RPG look.
- Player names their character via HTML text input field (works on mobile keyboards).
- Walk animation: 4 directions, minimum 3 frames each (12 frames per gender).
- Idle animation: subtle loop (breathing, looking around) when standing still.

### Animation and Movement Feel
- Walk speed: Pokemon pace (~0.25 seconds per tile). Deliberate, not rushed.
- Run speed: 2x walk (~0.125 seconds per tile) when B/run held.
- Smooth lerp interpolation between tiles. Fluid slide, not pixel-step.

### Camera Behavior
- Camera centered on player at all times.
- Camera stops at map edges — player walks off-center near boundaries. Standard Pokemon behavior.

### Opening Sequence
- Title screen → Name entry → Gender pick → Spawn at MG Road Metro exit.
- Title screen: pixel art game logo over pixel art Bengaluru skyline silhouette. "Press Start" prompt.
- Name entry: HTML text input field overlaid on game canvas.
- Gender selection: two chibi sprites side by side, player picks one.

### Scaling and Orientation
- Integer scaling + letterbox: scale by whole numbers (2x, 3x, 4x). Black bars if aspect ratio doesn't match. Crispest pixels.
- Support both landscape and portrait orientation on mobile. Portrait will letterbox with bars top/bottom.

### Deployment Pipeline
- GitHub Pages hosting with custom domain.
- Auto-deploy on push to main via GitHub Actions.

### Playwright Testing
- Boot + input + screenshot strategy: game loads, simulate keyboard/touch input, verify player position changes via screenshot comparison.
- Tests run locally for now. CI integration later when there are more tests.
- Vitest for unit testing movement logic, collision, state separately from the canvas.

### Claude's Discretion
- Street layout: which specific streets to include between landmarks (as long as faithful to real MG Road / CBD layout)
- Door treatment on buildings: solid blocks vs visible-but-locked doors (whatever sets up Phase 2 best)
- Time of day: fixed lighting — whatever looks best for GBA aesthetic and shows off landmarks
- Landmark rendering technique: multi-tile buildings vs large sprites (whatever Phaser/Tiled handles best)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — Project vision, core value, constraints, key decisions
- `.planning/REQUIREMENTS.md` — Full v1 requirements, Phase 1 maps to MOVE-01..05, EXPL-01, PLAT-01..03
- `.planning/ROADMAP.md` — Phase 1 success criteria and dependency structure

### Research
- `.planning/research/STACK.md` — Phaser 3.90.0, Vite, TypeScript, Grid Engine plugin, rexrainbow plugins, Capacitor 8 recommendations
- `.planning/research/ARCHITECTURE.md` — Scene architecture, Grid Engine, data-driven content pattern, project structure
- `.planning/research/PITFALLS.md` — Tileset bleeding (use tile-extruder), layer count limits, iOS gotchas, AI asset cleanup needs
- `.planning/research/FEATURES.md` — Feature dependencies, MVP definition, table stakes vs differentiators
- `.planning/research/SUMMARY.md` — Synthesized research findings and roadmap implications

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — greenfield project. Empty repo.

### Established Patterns
- None — patterns will be established in this phase. Research recommends:
  - Parallel scene composition (WorldScene + UIScene)
  - EventsCenter singleton for cross-scene communication
  - Grid Engine plugin for tile-locked movement
  - JSON-driven content from day one

### Integration Points
- This phase establishes the foundation that all subsequent phases build on.
- Phase 2 (World Interaction) will need: tilemap with door tiles, NPC spawn points, sign object layers.
- Phase 3 (Game Systems) will need: scene management, player state, zone transition hooks.
- Phase 4 (Audio) will need: scene lifecycle hooks for music crossfade.

</code_context>

<specifics>
## Specific Ideas

- Player spawning at MG Road Metro exit frames the entire game as "you just arrived by metro" — sets up the commuter/explorer framing naturally.
- Decoration density should make the map feel like a real Bengaluru street — not empty generic tile space. Parked autos, BMTC bus stops, fruit carts, rain trees — these are what make it Bengaluru.
- The floating joystick + A/B button layout is a hybrid: modern touch UX (floating joystick) with GBA authenticity (A/B buttons). 4-direction snap keeps it aligned with tile grid.
- Asset pipeline organized by area so each AI agent task has full context for one section of the map rather than disconnected tile types.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-foundation-and-movement*
*Context gathered: 2026-03-19*
