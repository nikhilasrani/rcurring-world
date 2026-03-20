# Phase 2: World Interaction - Research

**Researched:** 2026-03-20
**Domain:** NPC interaction, dialogue system, building interiors, zone detection (Phaser 3 + Grid Engine + rexrainbow)
**Confidence:** HIGH

## Summary

Phase 2 transforms the walkable MG Road map from Phase 1 into an interactive world. The core technical challenges are: (1) a GBA-style dialogue box with typewriter text and multi-page support, (2) NPC entities with patrol movement and face-toward-player behavior, (3) building interior tilemaps with fade transitions, and (4) zone banner overlays with landmark discovery tracking.

The existing codebase provides strong foundations: Grid Engine already handles tile-locked movement and has built-in APIs for NPC random movement (`moveRandomly`), facing direction control (`turnTowards`), and runtime character addition (`addCharacter`). The rexrainbow `TextTyping` plugin is already installed and provides the typewriter effect. The UIScene parallel overlay pattern is established and ready for dialogue box rendering. The EventsCenter singleton handles cross-scene communication.

**Primary recommendation:** Build the dialogue system as a custom component in UIScene (not rexUI TextBox) using Phaser graphics primitives + the standalone `TextTyping` behavior class. This avoids pulling in the full rexUI framework (which has complex layout dependencies) while still getting the typewriter effect from the already-installed `phaser3-rex-plugins`. NPCs should use Grid Engine's `addCharacter` + `moveRandomly` for patrol behavior, and `turnTowards` to face the player on interaction.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Classic GBA-style dialogue box: white/light box at screen bottom with dark pixel border
- NPC name displayed in top-left corner of the box
- 2 lines of text per page, box takes ~25% of screen height (80px of 320px)
- Typewriter text reveal at medium speed (~30ms per character)
- Tap anywhere on screen or press action button (A / Enter / Space) to advance: first tap completes current page text instantly, second tap goes to next page
- Down-arrow indicator when more pages follow
- Player movement is frozen while dialogue is active
- NPC turns to face player when dialogue starts (NPC-03)
- Signs use the same dialogue box but without NPC name label (SIGN-02)
- Small 'A' button icon appears above interactable NPCs/signs when player is on adjacent tile and facing them
- Interaction range: adjacent tile only, player must be facing the target
- 5 NPCs, each placed near a landmark (chai-walla, auto driver, jogger, shopkeeper, guard)
- All NPCs have simple patrol routes (2-3 tile back-and-forth paths), not stationary
- Same 16x24 chibi sprite style as player, with unique outfits per NPC
- Walk + idle animations for all NPCs (same spritesheet format as player)
- Culturally authentic language: light Kannada sprinkle in mostly English dialogue
- 4 enterable buildings: MG Road Metro station, Chai/coffee shop, UB City mall entrance, Cubbon Park library/museum
- Door transition: fade to black, load interior tilemap, fade back in
- Each interior is a separate tilemap file, loaded on demand
- Small room sizes: 10-15 tiles wide (10x8 to 15x12)
- Player exits by walking to door tile, same fade transition
- Zone banner: slides down from top, white text on semi-transparent dark band, stays 2-3 seconds, slides back up
- Non-blocking -- player can keep moving during banner
- Banner triggered by zone boundary tiles (zones layer), shows once per zone entry
- Landmark discovery: auto-discover on zone entry, stored in game state for Phase 3 journal

### Claude's Discretion
- Dialogue box pixel art details (exact border style, font choice, padding)
- NPC dialogue content (specific lines -- follow Kannada sprinkle and character personality guidelines)
- Interior tileset design (furniture, decoration placement within room layouts)
- Zone boundary shapes on outdoor tilemap (as long as they cover landmark areas)
- How NPC patrol routes are defined in data (tilemap objects vs JSON config)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| NPC-01 | 3-5 interactive NPCs placed in the world | Grid Engine `addCharacter()` for runtime NPC spawning; JSON-driven NPC definitions; programmatic sprite generation pipeline from Phase 1 |
| NPC-02 | Player can walk up to NPC and press action to talk | Grid Engine `getFacingPosition()` to detect adjacent NPC; `TOUCH_ACTION` event already wired; interaction prompt icon system |
| NPC-03 | NPCs face toward player when spoken to | Grid Engine `turnTowards(charId, direction)` API -- turns character without moving |
| NPC-04 | Dialogue in bottom-of-screen box with typewriter text and tap-to-advance | Custom DialogBox component in UIScene using Phaser Graphics + rexrainbow `TextTyping` behavior for typewriter effect |
| NPC-05 | Dialogue supports multi-page messages and displays NPC name | Custom page management in DialogBox; NPC name from JSON data; page indicator arrow |
| NPC-06 | Culturally authentic language (English with Kannada words) | Content in JSON dialogue data files; no technical dependency |
| SIGN-01 | Player can interact with signs, notice boards, and plaques | Same interaction system as NPCs; signs defined as interactable objects in tilemap or JSON |
| SIGN-02 | Sign text uses same dialogue box as NPC dialogue | DialogBox component accepts optional `name` parameter; signs pass no name |
| EXPL-02 | Enter/exit 2-3 building interiors via door tiles | Separate tilemap files for interiors; camera fade effect for transitions; scene restart with interior tilemap data |
| EXPL-03 | Area name banner slides in on zone/building transition | Phaser tween animation on UIScene text; zone detection via player position vs tilemap zone objects |
| EXPL-04 | Discover and visit all major landmarks | Zone objects already exist in tilemap; discovery tracking in game state (Registry or dedicated store) |
</phase_requirements>

## Standard Stack

### Core (already installed -- no new dependencies needed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| phaser | 3.90.0 | Game engine -- rendering, tilemaps, camera effects, tweens, text | Already installed. Camera fade, tweens, and text rendering cover all Phase 2 UI needs. |
| grid-engine | 2.48.2 | NPC movement, patrol routes, facing direction, character collision | Already installed. Has `addCharacter`, `moveRandomly`, `turnTowards`, `getFacingPosition`, `steppedOn` -- all needed for Phase 2. |
| phaser3-rex-plugins | 1.80.19 | TextTyping behavior for typewriter effect | Already installed. Import standalone `TextTyping` class, not full rexUI. Lightweight. |

### Supporting (no new packages)

No new npm packages are required for Phase 2. All needed functionality exists in the already-installed stack:

- **Phaser Camera Effects** -- `camera.fade()` and `camera.fadeIn()` for door transitions
- **Phaser Tweens** -- `scene.tweens.add()` for zone banner slide animation
- **Phaser Graphics** -- `scene.add.graphics()` for dialogue box background with pixel border
- **Phaser Text** -- `scene.add.text()` for dialogue text, NPC name, zone banner text
- **rexrainbow TextTyping** -- `new TextTyping(textObject, { speed: 30 })` for typewriter effect
- **pngjs** (dev dependency, already used) -- for programmatic NPC sprite generation

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom DialogBox | rexUI TextBox | TextBox pulls in rexUI framework with complex Sizer layout dependencies; overkill for a simple 2-line box. Custom is ~150 lines and pixel-perfect controllable. |
| Custom DialogBox | rexUI Dialog | Same issue -- Dialog is a heavyweight component. We need a simple text box, not a multi-button dialog. |
| Camera fade | Custom overlay tween | Camera fade is built-in, well-tested, and the standard approach. No reason to custom-build. |
| TextTyping behavior | Manual character-by-character timer | TextTyping handles edge cases (wrapping, pause/resume, speed changes). Reinventing is a waste. |

## Architecture Patterns

### Recommended Project Structure (Phase 2 additions)

```
src/
  entities/
    Player.ts             # Existing
    NPC.ts                # NEW: NPC entity class (sprite, animations, interaction)
  ui/
    TouchControls.ts      # Existing
    DialogBox.ts          # NEW: GBA-style dialogue box with typewriter + paging
    InteractionPrompt.ts  # NEW: 'A' button icon above interactable targets
    ZoneBanner.ts         # NEW: Slide-in zone name banner
  systems/
    NPCManager.ts         # NEW: Spawns NPCs from data, manages patrol routes
    InteractionSystem.ts  # NEW: Detects adjacent interactables, handles action input
    ZoneManager.ts        # NEW: Zone detection, banner triggers, discovery tracking
    TransitionManager.ts  # NEW: Building enter/exit fade transitions
  scenes/
    WorldScene.ts         # MODIFY: Add NPC spawning, interaction checks, door triggers
    UIScene.ts            # MODIFY: Add DialogBox, ZoneBanner, InteractionPrompt
    BootScene.ts          # MODIFY: Load NPC sprites, interior tilemaps
  data/
    zones/
      mg-road.json        # MODIFY: Add NPC placements, sign locations, door positions
    npcs/
      chai-walla.json     # NEW: Dialogue data for each NPC
      auto-driver.json
      jogger.json
      shopkeeper.json
      guard.json
    signs/
      signs.json          # NEW: Sign text data
    interiors/
      metro-station.json  # NEW: Interior metadata (tilemap key, spawn point, zone name)
      coffee-shop.json
      ub-city-mall.json
      cubbon-library.json
  utils/
    constants.ts          # MODIFY: Add new EVENTS, ASSETS, LAYERS constants
    types.ts              # MODIFY: Add NPC, dialogue, interior type interfaces
public/
  assets/
    sprites/
      npc-chai-walla.png     # NEW: NPC spritesheets (same 3x4 format as player)
      npc-auto-driver.png
      npc-jogger.png
      npc-shopkeeper.png
      npc-guard.png
    tilesets/
      interior.png           # NEW: Interior tileset (furniture, floors, walls)
    tilemaps/
      interior-metro.json    # NEW: Interior tilemaps (generated programmatically)
      interior-coffee.json
      interior-ubcity.json
      interior-library.json
```

### Pattern 1: Interaction Detection via Grid Engine Position Check

**What:** On each frame (or on action button press), check if the tile the player is facing contains an NPC or interactable object using Grid Engine's `getFacingPosition()` and `getCharactersAt()`.

**When to use:** Every time the player presses the action button (A / Enter / Space).

**Example:**
```typescript
// In InteractionSystem.ts
checkInteraction(gridEngine: any, playerCharId: string): InteractionTarget | null {
  const facingPos = gridEngine.getFacingPosition(playerCharId);

  // Check for NPC at facing position
  const charsAtPos = gridEngine.getCharactersAt(facingPos);
  const npcId = charsAtPos.find(id => id !== playerCharId);
  if (npcId) {
    return { type: 'npc', id: npcId, position: facingPos };
  }

  // Check for sign/door at facing position (from tilemap object layer)
  const interactable = this.getInteractableAt(facingPos);
  if (interactable) {
    return { type: interactable.type, id: interactable.id, position: facingPos };
  }

  return null;
}
```

### Pattern 2: Dialogue Box as UIScene Component

**What:** The dialogue box lives in UIScene (not WorldScene) so it renders above the game world. It uses Phaser Graphics for the box background, Phaser Text for the content, and rexrainbow TextTyping for the typewriter effect. Communication with WorldScene happens via EventsCenter.

**When to use:** For all NPC and sign interactions.

**Example:**
```typescript
// In DialogBox.ts
export class DialogBox {
  private background: Phaser.GameObjects.Graphics;
  private nameText: Phaser.GameObjects.Text;
  private contentText: Phaser.GameObjects.Text;
  private typing: TextTyping;
  private pages: string[];
  private currentPage: number = 0;
  private isTypingComplete: boolean = false;

  constructor(scene: Phaser.Scene) {
    // Box dimensions: 480px wide, 80px tall, at bottom of screen
    const boxY = 320 - 80; // GAME_HEIGHT - box height

    this.background = scene.add.graphics();
    this.background.fillStyle(0xf8f8f8, 0.95); // Light background
    this.background.fillRect(4, boxY + 4, 472, 72);
    this.background.lineStyle(2, 0x222222, 1); // Dark pixel border
    this.background.strokeRect(4, boxY + 4, 472, 72);

    this.nameText = scene.add.text(12, boxY + 8, '', {
      fontFamily: 'monospace', fontSize: '10px', color: '#333333'
    });

    this.contentText = scene.add.text(12, boxY + 24, '', {
      fontFamily: 'monospace', fontSize: '10px', color: '#111111',
      wordWrap: { width: 456 }
    });

    // TextTyping behavior attached to the content text object
    this.typing = new TextTyping(this.contentText, {
      speed: 30, // 30ms per character
      wrap: true
    });

    this.typing.on('complete', () => {
      this.isTypingComplete = true;
    });

    this.hide();
  }

  show(dialogue: { name?: string; pages: string[] }): void {
    this.pages = dialogue.pages;
    this.currentPage = 0;
    this.nameText.setText(dialogue.name || '');
    this.typePage(0);
    this.setVisible(true);
    eventsCenter.emit(EVENTS.DIALOGUE_OPEN);
  }

  advance(): void {
    if (!this.isTypingComplete) {
      // First tap: complete current page instantly
      this.typing.stop(true);
      this.isTypingComplete = true;
    } else if (this.currentPage < this.pages.length - 1) {
      // Next page
      this.currentPage++;
      this.typePage(this.currentPage);
    } else {
      // Last page done -- close dialogue
      this.hide();
      eventsCenter.emit(EVENTS.DIALOGUE_CLOSE);
    }
  }
}
```

### Pattern 3: NPC Patrol via Grid Engine moveRandomly with Radius

**What:** NPCs use Grid Engine's `moveRandomly(charId, delay, radius)` for simple patrol behavior. The `radius` parameter constrains movement to a small area around the NPC's start position (2-3 tiles), creating natural-looking patrol routes without custom pathfinding.

**When to use:** For all 5 NPCs that should walk back and forth in small areas.

**Example:**
```typescript
// In NPCManager.ts -- after adding NPC character to Grid Engine
spawnNPC(scene: Phaser.Scene, gridEngine: any, npcDef: NPCDef): void {
  const sprite = scene.add.sprite(0, 0, npcDef.spriteKey, 1);
  sprite.setDepth(2);

  gridEngine.addCharacter({
    id: npcDef.id,
    sprite: sprite,
    walkingAnimationMapping: 0,
    startPosition: npcDef.position,
    speed: 2, // Slower than player (NPCs stroll)
    facingDirection: npcDef.facing,
    offsetY: -4, // Same as player for 16x24 sprites
  });

  // Start patrol: move randomly within 2-tile radius, 1500ms delay between moves
  gridEngine.moveRandomly(npcDef.id, 1500, 2);
}
```

### Pattern 4: Building Transition via Camera Fade

**What:** When the player steps on a door tile, the scene fades to black using `camera.fade()`, loads the interior tilemap data, repositions the player, and fades back in with `camera.fadeIn()`. The WorldScene is NOT restarted -- instead, the tilemap layers are swapped in place to preserve UIScene state.

**When to use:** For all building enter/exit transitions.

**Example:**
```typescript
// In TransitionManager.ts
enterBuilding(scene: WorldScene, interiorKey: string): void {
  const cam = scene.cameras.main;

  // Stop player movement
  eventsCenter.emit(EVENTS.MOVEMENT_FREEZE, true);

  // Fade to black (250ms)
  cam.fade(250, 0, 0, 0);

  cam.once('camerafadeoutcomplete', () => {
    // Load interior tilemap (already preloaded in BootScene)
    this.loadInterior(scene, interiorKey);

    // Fade back in (250ms)
    cam.fadeIn(250, 0, 0, 0);

    // Show zone banner after fade completes
    cam.once('camerafadeincomplete', () => {
      eventsCenter.emit(EVENTS.ZONE_ENTER, interiorKey);
      eventsCenter.emit(EVENTS.MOVEMENT_FREEZE, false);
    });
  });
}
```

**Alternative approach (scene restart):** If swapping tilemaps in-place proves too complex (different tileset requirements, collision layer differences), restart WorldScene with interior parameters:
```typescript
cam.once('camerafadeoutcomplete', () => {
  scene.scene.restart({
    mode: 'interior',
    interiorKey: interiorKey,
    returnPosition: currentPlayerPos
  });
});
```
The restart approach is simpler but destroys and recreates all game objects. Given the small interior sizes (10x8 to 15x12 tiles), this is acceptable.

### Pattern 5: Zone Detection via Position Overlap Check

**What:** On player movement, check if the player's new tile position falls within any zone rectangle defined in the tilemap's `zones` object layer. If the player enters a new zone, emit a zone-enter event for the banner and discovery tracking.

**When to use:** In WorldScene update loop or via Grid Engine's `positionChangeFinished` observable.

**Example:**
```typescript
// In ZoneManager.ts
private currentZone: string | null = null;
private discoveredZones: Set<string> = new Set();

checkZone(playerPos: { x: number; y: number }, zones: ZoneObject[]): void {
  const pixelX = playerPos.x * TILE_SIZE;
  const pixelY = playerPos.y * TILE_SIZE;

  for (const zone of zones) {
    if (pixelX >= zone.x && pixelX < zone.x + zone.width &&
        pixelY >= zone.y && pixelY < zone.y + zone.height) {
      if (this.currentZone !== zone.name) {
        this.currentZone = zone.name;
        this.discoveredZones.add(zone.name);
        eventsCenter.emit(EVENTS.ZONE_ENTER, zone.displayName);
      }
      return;
    }
  }
  this.currentZone = null;
}
```

### Anti-Patterns to Avoid

- **Hardcoded dialogue text in scene code:** All NPC dialogue and sign text MUST be in JSON data files. The code reads definitions; it never contains specific dialogue strings.
- **Checking interaction on every frame:** Only check for interactable targets when the action button is pressed, not every frame. Checking for the interaction prompt icon can use Grid Engine's `positionChangeFinished` observable (fires only on tile changes, not every frame).
- **Creating a separate Phaser Scene per interior:** This would bloat the scene array and complicate config.ts. Instead, reuse WorldScene with different tilemap parameters.
- **Using rexUI Sizer framework for dialogue box:** Overkill. The dialogue box is a simple fixed-position rectangle. Phaser Graphics + Text is sufficient and avoids rexUI layout complexity.
- **Polling zone detection every frame:** Use Grid Engine's `positionChangeFinished` observable to check zones only when the player actually moves to a new tile.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Typewriter text effect | Custom timer-based character reveal | rexrainbow `TextTyping` behavior | Handles wrapping, pause/resume, speed changes, edge cases with line breaks |
| NPC patrol movement | Custom waypoint/state machine | Grid Engine `moveRandomly(id, delay, radius)` | Built-in radius constraint, delay between moves, collision-aware pathfinding |
| NPC facing toward player | Manual direction calculation | Grid Engine `turnTowards(charId, direction)` | Already integrated with the animation system |
| Tile-position-based detection | Custom coordinate math | Grid Engine `getFacingPosition()`, `getCharactersAt()` | Accounts for character layers, multi-tile characters, grid alignment |
| Camera fade transitions | Manual alpha tween on overlay | Phaser `camera.fade()` / `camera.fadeIn()` | Built-in, handles timing, fires completion events |
| Slide-in animation | Manual position updates in update() | Phaser `scene.tweens.add()` | Handles easing, duration, callbacks, automatic cleanup |
| NPC sprite generation | Manual pixel drawing | pngjs programmatic pipeline (established in Phase 1) | Reproducible, CI-compatible, same pattern as player sprites |

**Key insight:** Grid Engine already provides 80% of the NPC behavior needed for this phase. The dialogue box is the only significant custom component, and even that leverages rexrainbow's TextTyping for the hardest part.

## Common Pitfalls

### Pitfall 1: Event Listener Accumulation on Dialogue Open/Close

**What goes wrong:** Each time dialogue opens, new event listeners are registered for advance/close. After 10+ interactions, duplicate listeners cause double-firing, phantom dialogues, and memory growth.

**Why it happens:** Event listeners in `on()` calls are additive. Opening dialogue adds listeners; closing dialogue doesn't remove them if cleanup uses `off()` without the exact same function reference.

**How to avoid:** Use `once()` for per-interaction listeners, or store handler references and call `off(event, handler)` on close. Better yet, use a state machine: DialogBox has an `isActive` boolean, and all input checks that first.

**Warning signs:** Dialogue advances two pages at once; dialogue box flickers on open; memory grows after many NPC interactions.

### Pitfall 2: Grid Engine moveRandomly Persists After NPC Interaction

**What goes wrong:** NPC continues walking during dialogue because `moveRandomly` is an autonomous movement that Grid Engine manages independently. The NPC walks away while the player is reading dialogue.

**Why it happens:** `moveRandomly` is a persistent behavior -- it doesn't stop when `turnTowards` is called. Grid Engine treats `turnTowards` as a separate operation.

**How to avoid:** Call `gridEngine.stopMovement(npcId)` before `turnTowards` when dialogue starts. Call `gridEngine.moveRandomly(npcId, delay, radius)` again after dialogue closes to resume patrol.

**Warning signs:** NPC sprite moves away from its dialogue position while text is displaying.

### Pitfall 3: Interior Tilemap Uses Different Tilesets

**What goes wrong:** Interior tilemaps need furniture/indoor tiles that don't exist in the outdoor tileset. Loading a new tileset for each interior bloats BootScene preload and wastes memory.

**Why it happens:** Outdoor tilesets (ground, buildings, nature, decorations) don't have indoor tiles (tables, chairs, counters, bookshelves).

**How to avoid:** Create ONE shared interior tileset (`interior.png`) used by all 4 interior tilemaps. Load it once in BootScene alongside the outdoor tilesets. Keep it small (8x8 or 12x8 tiles = 128x128 or 192x128 pixels). Generate it programmatically using the same pngjs pipeline as outdoor tilesets.

**Warning signs:** More than 5 tilesets being loaded; interiors looking inconsistent because they use different tile styles.

### Pitfall 4: Zone Banner Blocks Player Input

**What goes wrong:** Zone banner implementation accidentally pauses player input or steals touch/click events from the game.

**Why it happens:** The banner is rendered in UIScene with interactive elements, or the banner tween interferes with input processing.

**How to avoid:** The zone banner must be purely visual -- no `setInteractive()` on any banner element. It's just a graphics rectangle + text with a tween. Player continues moving underneath. The banner does NOT emit any blocking events.

**Warning signs:** Player freezes for 2-3 seconds when entering a zone; touch controls stop responding during banner display.

### Pitfall 5: Interaction Prompt Not Updating When NPC Moves

**What goes wrong:** The 'A' button icon appears above an NPC's previous position because the prompt position is set once and never updated as the NPC patrols.

**Why it happens:** The interaction prompt checks on player position change but doesn't account for NPC position changes. When NPC moves, the prompt stays at the old position.

**How to avoid:** Update the interaction prompt position every frame (or on Grid Engine's `positionChangeFinished` for the NPC character). Alternatively, recalculate prompt visibility whenever either the player or any nearby NPC moves.

**Warning signs:** 'A' icon floats in empty space; icon appears but pressing action does nothing (NPC has moved away).

### Pitfall 6: Camera Bounds Wrong After Interior Transition

**What goes wrong:** After entering a building interior (small tilemap), the camera still has bounds from the large outdoor map, causing the view to show black areas or the interior to be off-center.

**Why it happens:** Camera bounds from the outdoor 60x60 map aren't updated when switching to a 10x8 interior tilemap.

**How to avoid:** After loading the interior tilemap, immediately update camera bounds: `camera.setBounds(0, 0, interiorMap.widthInPixels, interiorMap.heightInPixels)`. For small interiors that fit in one screen, also call `camera.stopFollow()` and center the camera manually.

**Warning signs:** Interior room appears in the corner of the screen with black void visible; camera scrolls beyond the interior room edges.

## Code Examples

### NPC Data Schema (JSON)

```json
// src/data/npcs/chai-walla.json
{
  "id": "npc-chai-walla",
  "name": "Raju",
  "spriteKey": "npc-chai-walla",
  "position": { "x": 42, "y": 36 },
  "facing": "down",
  "patrolRadius": 2,
  "patrolDelay": 1500,
  "speed": 2,
  "dialogue": {
    "pages": [
      "Namaskara! Best filter coffee on MG Road, saar!",
      "Twenty rupees only. Fresh decoction, none of that instant-instant business."
    ]
  }
}
```

### NPC Sprite Generation (pngjs, follows Phase 1 pattern)

```typescript
// scripts/generate-npc-sprites.ts (follows same pattern as generate-player-sprites.ts)
// Each NPC gets a 48x96 spritesheet (3 cols x 4 rows of 16x24 frames)
// Row 0: walk-down (left-foot, idle, right-foot)
// Row 1: walk-left
// Row 2: walk-right
// Row 3: walk-up
// Color palettes per NPC:
//   Chai-walla: white lungi (#F0F0E0) + vest (#8B4513)
//   Auto driver: khaki (#C3B091) uniform
//   Jogger: track suit (#2E5090)
//   Shopkeeper: kurta (#E8D8C0)
//   Guard: uniform (#4A5530)
```

### Interaction Prompt (A Button Icon)

```typescript
// In InteractionPrompt.ts
export class InteractionPrompt {
  private icon: Phaser.GameObjects.Text; // Simple "A" text or small image

  constructor(scene: Phaser.Scene) {
    // Small floating "A" icon, positioned above interactable targets
    this.icon = scene.add.text(0, 0, 'A', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 2, y: 1 },
    });
    this.icon.setDepth(10);
    this.icon.setVisible(false);
  }

  showAt(tileX: number, tileY: number): void {
    // Position above the target tile (in pixel coords)
    this.icon.setPosition(tileX * TILE_SIZE + 4, tileY * TILE_SIZE - 10);
    this.icon.setVisible(true);
  }

  hide(): void {
    this.icon.setVisible(false);
  }
}
```

### Interior Tilemap Generation (programmatic, follows Phase 1 pattern)

```typescript
// scripts/generate-interior-tilemaps.ts
// Each interior is a separate Tiled-format JSON with:
// - ground layer (floor tiles)
// - buildings layer (furniture, walls, counters)
// - above-player layer (ceiling details if any)
// - collision layer (walls + furniture blocking)
// - spawn-points object layer (player entry position)
// - zones object layer (single zone covering entire interior)
// Same layer naming convention as outdoor tilemap.
```

### Zone Banner Animation (Phaser tween)

```typescript
// In ZoneBanner.ts
show(zoneName: string): void {
  this.bannerBg.setAlpha(0.7);
  this.bannerText.setText(zoneName);

  // Start off-screen above
  this.container.setY(-30);
  this.container.setVisible(true);

  // Slide down
  this.scene.tweens.add({
    targets: this.container,
    y: 8,
    duration: 300,
    ease: 'Power2',
    onComplete: () => {
      // Hold for 2 seconds, then slide back up
      this.scene.time.delayedCall(2000, () => {
        this.scene.tweens.add({
          targets: this.container,
          y: -30,
          duration: 300,
          ease: 'Power2',
          onComplete: () => {
            this.container.setVisible(false);
          }
        });
      });
    }
  });
}
```

### Event Flow for NPC Interaction

```typescript
// constants.ts additions
export const EVENTS = {
  // ... existing events ...
  DIALOGUE_OPEN: 'dialogue-open',
  DIALOGUE_CLOSE: 'dialogue-close',
  DIALOGUE_ADVANCE: 'dialogue-advance',
  NPC_INTERACT: 'npc-interact',
  SIGN_INTERACT: 'sign-interact',
  ZONE_ENTER: 'zone-enter',
  MOVEMENT_FREEZE: 'movement-freeze',
  BUILDING_ENTER: 'building-enter',
  BUILDING_EXIT: 'building-exit',
} as const;

// Flow:
// 1. Player presses action -> WorldScene checks facing position
// 2. NPC found -> eventsCenter.emit(EVENTS.NPC_INTERACT, npcData)
// 3. WorldScene: gridEngine.stopMovement(npcId), gridEngine.turnTowards(npcId, oppositeDir)
// 4. UIScene: DialogBox.show({ name: npcData.name, pages: npcData.dialogue.pages })
// 5. eventsCenter.emit(EVENTS.DIALOGUE_OPEN) -> WorldScene freezes player movement
// 6. Player taps -> DialogBox.advance() cycles through pages
// 7. Last page done -> DialogBox.hide(), eventsCenter.emit(EVENTS.DIALOGUE_CLOSE)
// 8. WorldScene: unfreeze player, gridEngine.moveRandomly(npcId) resumes patrol
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| rexUI TextBox for dialogue | Custom DialogBox + TextTyping behavior | Current recommendation | Avoids full rexUI dependency; more control over pixel-perfect GBA style |
| Phaser Arcade Physics overlap for zone detection | Grid Engine position observables | Grid Engine 2.x | More efficient, grid-aligned, no physics body overhead |
| Separate scene per building | WorldScene restart with different params | Phaser 3 best practice | Fewer scenes to manage, UIScene persists across transitions |
| Manual NPC waypoint walking | Grid Engine moveRandomly with radius | Grid Engine 2.x | Zero custom code for patrol behavior |

**Deprecated/outdated:**
- `this.game.events` for custom events: Use EventsCenter singleton (avoids Phaser internal event name collisions)
- Creating physics bodies for zone detection: Unnecessary overhead when Grid Engine position tracking is available

## Open Questions

1. **Interior tilemap loading strategy: swap or restart?**
   - What we know: Both approaches work. Swapping tilemap layers in-place preserves all game objects. Restarting WorldScene is simpler but destroys/recreates everything.
   - What's unclear: Whether Grid Engine handles tilemap replacement gracefully (it needs to be re-created with the new tilemap). The restart approach is safer.
   - Recommendation: Use scene restart for interiors. Simpler, well-tested. Store return position in Registry. UIScene is unaffected since it runs in parallel.

2. **NPC collision with player during patrol**
   - What we know: Grid Engine handles character-to-character collision by default (`collides: true`). NPCs won't walk through the player.
   - What's unclear: Whether `moveRandomly` gracefully handles being blocked by the player (does it wait, pick another direction, or get stuck?).
   - Recommendation: Test this early. If NPCs get stuck, set a short delay (500ms) so they try a new direction quickly. Grid Engine's collision system should handle this.

3. **Font rendering at pixel scale**
   - What we know: Phaser's text objects use canvas-rendered text which can look blurry at low resolution. Bitmap fonts are pixel-perfect but require a font atlas.
   - What's unclear: Whether `monospace` at 10px looks acceptable at 480x320 resolution with `pixelArt: true`.
   - Recommendation: Start with canvas text. If it looks bad, generate a simple bitmap font atlas (pngjs). This is a polish issue, not a blocker.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 (unit) + Playwright 1.58.2 (E2E) |
| Config file | `vitest.config.ts` + `playwright.config.ts` |
| Quick run command | `npm test` |
| Full suite command | `npm run test:all` |

### Phase Requirements -> Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| NPC-01 | 5 NPCs spawned in world at correct positions | unit | `npx vitest run tests/unit/npc-manager.test.ts -t "spawns NPCs"` | Wave 0 |
| NPC-02 | Action button triggers NPC interaction when adjacent and facing | unit + e2e | `npx vitest run tests/unit/interaction.test.ts` | Wave 0 |
| NPC-03 | NPC faces player direction on interaction | unit | `npx vitest run tests/unit/npc-facing.test.ts` | Wave 0 |
| NPC-04 | Dialogue box shows with typewriter text | e2e | `npx playwright test tests/e2e/dialogue.spec.ts` | Wave 0 |
| NPC-05 | Multi-page dialogue with NPC name | unit | `npx vitest run tests/unit/dialogue-box.test.ts` | Wave 0 |
| NPC-06 | Dialogue contains Kannada phrases | unit | `npx vitest run tests/unit/npc-dialogue-content.test.ts` | Wave 0 |
| SIGN-01 | Signs are interactable | unit | `npx vitest run tests/unit/interaction.test.ts -t "sign"` | Wave 0 |
| SIGN-02 | Signs use dialogue box without name | unit | `npx vitest run tests/unit/dialogue-box.test.ts -t "no name"` | Wave 0 |
| EXPL-02 | Building enter/exit transitions work | e2e | `npx playwright test tests/e2e/building-transition.spec.ts` | Wave 0 |
| EXPL-03 | Zone banner slides in on zone entry | e2e | `npx playwright test tests/e2e/zone-banner.spec.ts` | Wave 0 |
| EXPL-04 | Landmark discovery tracked | unit | `npx vitest run tests/unit/zone-manager.test.ts -t "discovery"` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test` (unit tests, <10s)
- **Per wave merge:** `npm run test:all` (unit + E2E, <60s)
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/unit/npc-manager.test.ts` -- covers NPC-01, NPC-03
- [ ] `tests/unit/interaction.test.ts` -- covers NPC-02, SIGN-01
- [ ] `tests/unit/dialogue-box.test.ts` -- covers NPC-04, NPC-05, SIGN-02
- [ ] `tests/unit/npc-dialogue-content.test.ts` -- covers NPC-06
- [ ] `tests/unit/zone-manager.test.ts` -- covers EXPL-03, EXPL-04
- [ ] `tests/e2e/dialogue.spec.ts` -- covers NPC-04 visual
- [ ] `tests/e2e/building-transition.spec.ts` -- covers EXPL-02
- [ ] `tests/e2e/zone-banner.spec.ts` -- covers EXPL-03 visual

## Sources

### Primary (HIGH confidence)
- Grid Engine TypeScript definitions (`node_modules/grid-engine/dist/mjs/src/IGridEngine.d.ts`, `GridEngine.d.ts`) -- verified `turnTowards`, `moveRandomly`, `addCharacter`, `getFacingPosition`, `getCharactersAt`, `stopMovement`, `steppedOn` APIs
- Grid Engine v2.48.2 installed package -- verified version and API compatibility
- rexrainbow TextTyping TypeScript definitions (`node_modules/phaser3-rex-plugins/plugins/behaviors/texttyping/TextTyping.d.ts`) -- verified `start`, `stop`, `speed`, `isTyping`, events
- [Grid Engine Documentation](https://annoraaq.github.io/grid-engine/) -- random movement, facing direction examples
- [Rex TextTyping Docs](https://rexrainbow.github.io/phaser3-rex-notes/docs/site/texttyping/) -- TypeTyping API and events
- [Rex TextBox Docs](https://rexrainbow.github.io/phaser3-rex-notes/docs/site/ui-textbox/) -- TextBox component (evaluated and rejected in favor of custom)
- [Phaser Camera Fade](https://phaser.io/examples/v3/view/camera/camera-fade-in-and-out) -- `camera.fade()` / `camera.fadeIn()` API

### Secondary (MEDIUM confidence)
- [Phaser Forum: Scene Transition with Camera Fade](https://phaser.discourse.group/t/scene-transition-with-camera-fade-issue/2950) -- pattern for `camerafadeoutcomplete` event
- [Ourcade: Fade Out Scene Transition](https://blog.ourcade.co/posts/2020/phaser-3-fade-out-scene-transition/) -- confirmed fade transition pattern
- Phase 1 codebase (existing `src/`) -- established patterns for EventsCenter, Player entity, UIScene overlay, programmatic asset generation

### Tertiary (LOW confidence)
- None -- all findings verified against installed packages or official documentation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all libraries already installed, APIs verified from TypeScript definitions
- Architecture: HIGH - patterns extend Phase 1 foundations with well-documented Grid Engine and Phaser APIs
- Pitfalls: HIGH - pitfalls derived from Phase 1 experience and verified Grid Engine behavior
- Dialogue system: HIGH - TextTyping API verified from installed type definitions; custom DialogBox is straightforward Phaser Graphics + Text
- Building transitions: MEDIUM - camera fade API is well-documented but interior tilemap swapping vs scene restart needs testing

**Research date:** 2026-03-20
**Valid until:** 2026-04-20 (stable stack, no version changes expected)
