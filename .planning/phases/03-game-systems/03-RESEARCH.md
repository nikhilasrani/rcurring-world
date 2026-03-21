# Phase 3: Game Systems - Research

**Researched:** 2026-03-21
**Domain:** RPG game systems (quest state machine, inventory, journal, fast-travel, save/load) in Phaser 3 with established codebase patterns
**Confidence:** HIGH

## Summary

Phase 3 adds five interconnected game systems to the existing Phaser 3 exploration game: quest management, inventory, discovery journal, metro fast-travel, and save/load persistence. The codebase already has well-established patterns from Phases 1--2 (EventsCenter for cross-scene communication, JSON-driven data, scene restart for transitions, programmatic asset generation, parallel UIScene overlay, DialogBox with typewriter text) that Phase 3 systems MUST follow.

The key architectural insight is that all five systems share a single `GameState` object that gets serialized to localStorage on save and deserialized on load. Every system (QuestManager, InventoryManager, JournalManager) reads/writes to this shared state, and the SaveManager handles persistence. This centralized state design makes save/load straightforward -- one JSON blob captures everything.

The existing DialogBox needs extending with a choice mechanic (up/down selection + A to confirm) for quest acceptance. The existing ZoneBanner pattern can be reused for quest completion fanfare and item pickup notifications. The existing TransitionManager fade pattern can be adapted for metro travel transitions. The pause menu is a new full-screen overlay scene (or UIScene layer) with tabbed navigation.

**Primary recommendation:** Build systems as pure TypeScript managers in `src/systems/` (testable without Phaser), expose them via EventsCenter events, render their UI through the existing UIScene overlay pattern, and serialize their state through a centralized SaveManager that wraps localStorage.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Quests are dialogue-embedded: NPC dialogue naturally leads to a quest offer with Accept/Decline choice
- Dialogue system extended with choice mechanic -- special pages present 2 options, player selects with up/down + A
- One active quest at a time. If player talks to another quest NPC while one is active, they're told to come back later
- Quest states: not started, offered (dialogue seen), accepted, in-progress, complete
- NPC dialogue changes based on quest state (before quest, active, complete) -- dialogue only, no behavior changes
- Declining a quest is always re-offerable -- NPC offers again on next interaction
- Subtle HUD indicator in screen corner shows active quest progress (e.g., "1/3")
- Quest completion triggers a fanfare banner (zone banner style) showing "Quest Complete!" + item received
- Quest rewards: unique collectible item AND unlocked new NPC dialogue lines
- Coffee Quest ("Find the Best Filter Coffee"): Visit and taste coffee at 3 spots, then return to chai-walla to declare his the best
- Coffee spot 1: Chai-walla cart (outdoor, existing NPC); Coffee spot 2: Coffee Shop interior; Coffee spot 3: Cubbon Park stall (new small NPC or interactable)
- Reward: "Best Filter Coffee" item + chai-walla's grateful dialogue
- Quest NPCs use extended NPC JSON data -- `questDialogue` section added to existing NPC files with state-specific dialogue
- Grid layout with pixel art item icons (Pokemon bag style), select item to see name + flavor text
- Items are purely collectible souvenirs -- no use, consume, trade, combine, or equip mechanics
- Items collected via NPC gifts through dialogue AND world sparkly pickups
- Both trigger a "Got [item]!" notification
- Inventory capacity: 12 slots (shown as 2 rows of 6)
- One-time world pickups: sparkly animation sprite on tile, press A to collect, disappears permanently
- 5 pickups placed near landmarks (Jasmine Flowers, Metro Token, Masala Dosa, Park Leaf, Shopping Bag)
- 6-8 curated Bengaluru items with flavor text
- Pause menu: full-screen tabbed overlay with tabs: Quests | Inventory | Journal | Save | Settings
- Opened via Escape key (desktop) + hamburger button in top-right corner (touch devices)
- Closed via B button or Escape
- Navigation: left/right to switch tabs, up/down to navigate items within tab
- Both keyboard and touch input supported
- Journal: three sub-sections (Places, NPCs Met, Items Found) with pixel art icons, flavor text, zone completion %, "???" placeholders
- localStorage as storage backend -- JSON string with player, quests, inventory, discovery data
- Single save slot -- "Save Game" overwrites previous save
- Auto-save triggers on zone transitions with tiny save icon (floppy disk) flash
- Manual save from pause menu Save tab
- Title screen shows New Game + Continue -- Continue greyed out if no save exists
- New Game warns if it will overwrite existing save
- Corrupt/missing save: show warning message, start fresh
- Saved state includes: player position, quest progress, inventory, discovered zones/landmarks/NPCs, collected pickups
- Settings tab: Music volume slider, SFX volume slider, Run default toggle (ready for Phase 4)
- Metro: Namma Metro Purple Line diagram, interact with metro map wall object inside metro station
- Current station (MG Road) highlighted; other stations greyed out with "Coming in future update"
- Travel transition: doors slide shut 0.5s, ride screen 1.5s, doors slide open 0.5s
- In v1 only one zone, so metro map is functional UI but destinations locked

### Claude's Discretion
- Quest data JSON schema details (as long as it supports state-based dialogue and follows existing NPC JSON patterns)
- Exact pixel art style for item icons, sparkle animation, menu borders
- Menu font and spacing within the GBA aesthetic
- Save data schema version handling
- Metro line diagram visual details (exact station positions, line colors)
- Coffee quest NPC placement (counter NPC vs interactable object in coffee shop)
- HUD indicator positioning and styling

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| QUST-01 | Player can accept a quest from an NPC through dialogue | DialogBox choice mechanic extension + QuestManager state machine + questDialogue NPC JSON schema |
| QUST-02 | Player can track quest objectives (accepted -> in-progress -> complete) | QuestManager with state enum + HUD quest indicator in UIScene + EventsCenter quest events |
| QUST-03 | At least 1 complete quest: "Find the best filter coffee" | Coffee quest JSON data + 3 coffee spot interactions + quest objective tracking + reward delivery |
| QUST-04 | Quest completion triggers a reward (item, NPC reaction, new dialogue) | QuestManager completion event -> InventoryManager.addItem() + NPC dialogue state switch |
| INVT-01 | Player can collect items into an inventory | InventoryManager system + world pickup entities + NPC gift events |
| INVT-02 | Player can view collected items with pixel art icons and flavor text | Pause menu Inventory tab with grid layout + item data JSON + programmatic icon sprites |
| INVT-03 | Collectible items include Bengaluru-specific local items | 8 curated items JSON catalog with culturally authentic names and flavor text |
| JRNL-01 | Player has a discovery journal that records landmarks visited | JournalManager consuming existing ZoneManager discovery state |
| JRNL-02 | Journal tracks NPCs met and items collected | JournalManager tracking NPC interaction events + inventory additions |
| JRNL-03 | Journal shows completion percentage for current zone | JournalManager computing discovered/total for Places, NPCs, Items per zone |
| MTRO-01 | Player can enter metro station and access metro map UI | Metro map wall interactable inside existing metro station interior + map overlay UI |
| MTRO-02 | Player can select a destination and fast-travel | Metro map UI with station selection (all locked except MG Road in v1) |
| MTRO-03 | Metro travel includes transition animation (doors close, ride, doors open) | 3-part tween sequence in MetroTravelManager using Phaser camera/overlay transitions |
| SAVE-01 | Player can manually save from pause menu | SaveManager.save() triggered from pause menu Save tab |
| SAVE-02 | Game auto-saves on zone transitions | SaveManager.autoSave() called on BUILDING_ENTER/BUILDING_EXIT events |
| SAVE-03 | Saved state includes position, quests, inventory, landmarks, journal | Centralized GameState interface serialized as single JSON blob to localStorage |
| SAVE-04 | Player can load saved game and resume | TitleScene Continue option + SaveManager.load() + state restoration across all managers |
| PLAT-04 | Pause menu accessible via menu button/key with sections | PauseMenu overlay in UIScene with Escape/hamburger trigger, tabbed navigation |
</phase_requirements>

## Standard Stack

### Core (already installed)

| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| Phaser | 3.90.0 | Game engine -- scenes, tweens, camera, input, sprites | Installed |
| grid-engine | 2.48.2 | Tile-locked movement, collision, NPC pathing | Installed |
| phaser3-rex-plugins | 1.80.19 | TextTyping (already used in DialogBox), VirtualJoystick (already used) | Installed |
| Vitest | 4.1.0 | Unit testing for pure-logic managers | Installed |
| Playwright | 1.58.2 | E2E testing for integrated flows | Installed |

### No New Dependencies Required

Phase 3 does NOT require any new npm packages. All systems are built with:
- Phaser built-in APIs (tweens, cameras, graphics, text, sprites, input)
- rexrainbow TextTyping plugin (already used in DialogBox)
- localStorage (browser-native API)
- Custom TypeScript managers following existing patterns

**Note on Rex Quest plugin:** The rexrainbow `Quest` plugin is designed for quiz/survey-style question-answer flows, NOT for RPG quest state tracking (accepted/in-progress/complete with objectives). A custom QuestManager is the correct approach here -- it is simpler, matches the project's data-driven JSON pattern, and avoids forcing an ill-fitting abstraction.

## Architecture Patterns

### Recommended Project Structure (Phase 3 additions)

```
src/
├── systems/
│   ├── QuestManager.ts        # NEW: Quest state machine, objective tracking
│   ├── InventoryManager.ts    # NEW: Item collection, capacity management
│   ├── JournalManager.ts      # NEW: Discovery tracking aggregation
│   ├── SaveManager.ts         # NEW: localStorage serialization/deserialization
│   ├── NPCManager.ts          # EXTEND: quest-state-aware dialogue selection
│   ├── InteractionSystem.ts   # EXTEND: item pickup + metro map interaction types
│   ├── ZoneManager.ts         # EXISTING: journal data source (no changes needed)
│   └── TransitionManager.ts   # EXISTING: pattern reference for metro transitions
├── ui/
│   ├── PauseMenu.ts           # NEW: Full-screen tabbed overlay
│   ├── InventoryPanel.ts      # NEW: Grid layout with item icons
│   ├── QuestPanel.ts          # NEW: Quest list/details in pause menu
│   ├── JournalPanel.ts        # NEW: Discovery journal display
│   ├── SavePanel.ts           # NEW: Save/load controls
│   ├── SettingsPanel.ts       # NEW: Volume sliders, run toggle
│   ├── MetroMap.ts            # NEW: Purple Line diagram overlay
│   ├── QuestHUD.ts            # NEW: Corner quest progress indicator
│   ├── ItemNotification.ts    # NEW: "Got [item]!" popup (ZoneBanner-style)
│   ├── DialogBox.ts           # EXTEND: choice mechanic (up/down + A)
│   ├── ZoneBanner.ts          # EXISTING: reuse pattern for quest complete fanfare
│   └── TouchControls.ts       # EXTEND: hamburger menu button
├── entities/
│   ├── ItemPickup.ts          # NEW: Sparkly collectible world entity
│   └── NPC.ts                 # EXISTING: no changes needed
├── data/
│   ├── quests/
│   │   └── best-filter-coffee.json  # NEW: Quest definition
│   ├── items/
│   │   └── items.json               # NEW: Item catalog (8 items)
│   ├── journal/
│   │   └── mg-road-discoveries.json # NEW: Full discovery checklist
│   ├── npcs/
│   │   ├── chai-walla.json          # EXTEND: add questDialogue section
│   │   └── [other npcs].json        # EXTEND: quest-aware dialogue
│   └── pickups/
│       └── mg-road-pickups.json     # NEW: World pickup positions
├── scenes/
│   ├── WorldScene.ts          # EXTEND: pickup spawning, metro map trigger, auto-save
│   ├── UIScene.ts             # EXTEND: pause menu, HUD quest indicator, notifications
│   └── TitleScene.ts          # EXTEND: Continue/New Game menu options
└── utils/
    ├── constants.ts           # EXTEND: new EVENTS, ASSETS, SCENES constants
    └── types.ts               # EXTEND: new interfaces for game state
```

### Pattern 1: Centralized Game State

**What:** A single `GameState` interface that captures the entire saveable game state. All managers read/write to this shared state. The SaveManager serializes it to localStorage.

**When to use:** Always. This is the core pattern for save/load.

**Example:**
```typescript
// src/utils/types.ts -- additions
export interface GameState {
  version: number;               // Schema version for migration
  timestamp: number;             // Save timestamp
  player: {
    name: string;
    gender: 'male' | 'female';
    position: { x: number; y: number };
    facing: string;
    isRunning: boolean;
    currentZone: string;
    isInInterior: boolean;
    interiorId?: string;
  };
  quests: Record<string, QuestState>;
  inventory: InventoryItem[];
  discovery: {
    zones: string[];
    landmarks: string[];
    npcsMetIds: string[];
    collectedPickupIds: string[];
  };
  settings: {
    musicVolume: number;
    sfxVolume: number;
    runDefault: boolean;
  };
}

export type QuestStatus = 'not-started' | 'offered' | 'accepted' | 'in-progress' | 'complete';

export interface QuestState {
  id: string;
  status: QuestStatus;
  objectivesCompleted: string[];  // IDs of completed objectives
  objectivesTotal: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  iconKey: string;
  source: 'quest-reward' | 'npc-gift' | 'world-pickup';
}

export interface QuestDef {
  id: string;
  name: string;
  description: string;
  giverNpcId: string;
  objectives: QuestObjective[];
  reward: {
    itemId: string;
    dialogueUnlock?: string;
  };
}

export interface QuestObjective {
  id: string;
  description: string;
  type: 'interact-npc' | 'visit-location' | 'collect-item';
  targetId: string;
}

export interface ItemDef {
  id: string;
  name: string;
  description: string;
  iconKey: string;
}

export interface PickupDef {
  id: string;
  itemId: string;
  position: { x: number; y: number };
  zone: string;
}
```

### Pattern 2: Manager-as-Pure-Logic (Testable Without Phaser)

**What:** System managers (QuestManager, InventoryManager, JournalManager, SaveManager) are pure TypeScript classes with NO Phaser imports. They communicate via callbacks or the EventsCenter. This makes them unit-testable with Vitest without mocking Phaser.

**When to use:** For ALL new system managers.

**Why:** This is the established pattern -- DialogueController was extracted from DialogBox specifically for this reason (per STATE.md: "DialogueController extracted to separate file to avoid Phaser import chain in unit tests"). InteractionSystem similarly has no Phaser dependency.

**Example:**
```typescript
// src/systems/QuestManager.ts
export class QuestManager {
  private quests: Map<string, QuestState> = new Map();
  private activeQuestId: string | null = null;
  private onStateChange?: (questId: string, state: QuestState) => void;

  constructor(onStateChange?: (questId: string, state: QuestState) => void) {
    this.onStateChange = onStateChange;
  }

  acceptQuest(questId: string, totalObjectives: number): boolean {
    if (this.activeQuestId) return false; // One at a time
    this.quests.set(questId, {
      id: questId,
      status: 'accepted',
      objectivesCompleted: [],
      objectivesTotal: totalObjectives,
    });
    this.activeQuestId = questId;
    this.onStateChange?.(questId, this.quests.get(questId)!);
    return true;
  }

  // ... pure logic, no Phaser dependency
}
```

### Pattern 3: NPC Quest-State Dialogue Selection

**What:** Extend NPC JSON data with a `questDialogue` section containing state-keyed dialogue variants. NPCManager checks QuestManager state before returning dialogue to the DialogBox.

**When to use:** For any NPC that participates in a quest.

**Example (extended NPC JSON):**
```json
{
  "id": "npc-chai-walla",
  "name": "Raju",
  "spriteKey": "npc-chai-walla",
  "position": { "x": 40, "y": 36 },
  "facing": "down",
  "patrolRadius": 2,
  "patrolDelay": 1500,
  "speed": 2,
  "dialogue": {
    "name": "Raju",
    "pages": [
      "Namaskara! Best filter coffee on MG Road, saar!"
    ]
  },
  "questDialogue": {
    "questId": "best-filter-coffee",
    "offer": {
      "name": "Raju",
      "pages": [
        "You like filter coffee? I tell you what -- go try coffee at three places.",
        "Try mine here, try at the coffee shop inside, and try at Cubbon Park stall.",
        "Then come back and tell me whose is best!"
      ],
      "choicePage": 3,
      "choices": ["Accept: Okay, challenge accepted!", "Decline: Maybe later, Raju."]
    },
    "active": {
      "name": "Raju",
      "pages": [
        "Still trying the coffees? Come back when you've tried all three, saar!"
      ]
    },
    "complete": {
      "name": "Raju",
      "pages": [
        "So? Whose coffee is best?",
        "Haha! I knew it! My grandfather's recipe is unbeatable!",
        "Here, take this -- my special tumbler. Best Filter Coffee, saar!"
      ]
    },
    "done": {
      "name": "Raju",
      "pages": [
        "Ah, my favorite customer! Come back anytime for a fresh cup, saar."
      ]
    }
  }
}
```

### Pattern 4: DialogBox Choice Extension

**What:** Extend the existing DialogBox to support choice pages. When a page has choices, two selectable options appear below the dialogue text. Player uses up/down to highlight and A to confirm.

**When to use:** Quest offer dialogue (Accept/Decline).

**Implementation approach:**
- Add `choices` and `choiceIndex` state to DialogBox
- On a choice page, render two option texts with a cursor indicator (`>`)
- Up/Down arrows move the cursor, A confirms the selection
- Choice result returned via EventsCenter event (`DIALOGUE_CHOICE`)
- Choice pages do NOT auto-advance -- they wait for explicit selection

### Pattern 5: Pause Menu as UIScene Overlay

**What:** The pause menu renders as a full-screen overlay within UIScene (or a new PauseMenuScene launched in parallel). It darkens the background, shows tabbed content, and pauses WorldScene.

**When to use:** When Escape is pressed or hamburger button is tapped.

**Implementation approach:**
- Pause menu is a container within UIScene (simplest approach -- UIScene already handles overlays)
- When opened: emit MOVEMENT_FREEZE, render dark overlay + menu container
- Tab navigation via left/right arrows or tab buttons (touch)
- Each tab is a separate panel class (InventoryPanel, QuestPanel, JournalPanel, SavePanel, SettingsPanel)
- When closed: emit MOVEMENT_FREEZE(false), destroy/hide menu container
- WorldScene pauses input but continues rendering (world visible behind dark overlay)

### Anti-Patterns to Avoid

- **God Scene for menus:** Do NOT put all pause menu rendering logic in UIScene.create(). Extract panel classes (InventoryPanel, QuestPanel, etc.) into separate files in `src/ui/`.
- **Hardcoded quest logic:** Do NOT put "if npc is chai-walla then check coffee quest" in WorldScene. Quest logic lives in QuestManager, quest data in JSON. WorldScene only routes events.
- **Saving raw Phaser objects:** Do NOT serialize Phaser GameObjects, sprites, or scene references. Only serialize plain data (strings, numbers, arrays of primitives/objects).
- **Multiple localStorage keys:** Use a SINGLE key (`rcurring-world-save`) with the entire GameState as a JSON blob. This avoids partial-save corruption where some keys update but others do not.
- **Polling for quest completion:** Do NOT check quest state every frame in update(). Use EventsCenter events to react to state changes.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Typewriter text effect | Custom char-by-char timer | rexrainbow TextTyping plugin (already used) | Handles speed, skip-to-end, completion callback |
| Save data compression | Custom binary serialization | JSON.stringify + localStorage | 5MB limit is ample for this game's state size; premature optimization |
| Tab navigation system | Custom focus/key management | Phaser input events + index tracking | Simple array index with modular arithmetic handles wrap-around |
| Animated sparkle | Frame-by-frame animation code | Phaser Animation + spritesheet | Define frames in Phaser AnimationManager, let Phaser handle timing |
| Schema migration | Ad-hoc version checks | Explicit version number + migration function map | Pattern: `migrations[savedVersion]?.(data)` chains up to current version |

**Key insight:** The codebase already has all the UI patterns needed (DialogBox for text display, ZoneBanner for notifications, InteractionPrompt for indicators, TransitionManager for transitions). Phase 3 systems should reuse these patterns -- not invent new ones.

## Common Pitfalls

### Pitfall 1: EventsCenter Listener Leaks on Scene Restart
**What goes wrong:** WorldScene registers EventsCenter listeners in create(), but scene restart does NOT call shutdown() unless explicitly wired. Listeners accumulate, causing duplicate handler calls.
**Why it happens:** Phaser scene restart creates a new context but may not fire shutdown for the old one if not properly configured.
**How to avoid:** WorldScene already has a shutdown() method that cleans up EventsCenter listeners. When adding NEW events (quest events, save events, menu events), ALWAYS add corresponding cleanup in shutdown(). Also clean up in UIScene.shutdown() for any new listeners.
**Warning signs:** Actions firing twice, duplicate notifications, double saves.

### Pitfall 2: Save State Version Mismatch After Code Changes
**What goes wrong:** Player loads a save from before a code change. New fields are undefined, causing crashes.
**Why it happens:** No schema versioning or migration logic.
**How to avoid:** Include a `version` field in GameState. On load, check version against current. If mismatched, run migration functions. For missing fields, provide defaults. NEVER assume all fields exist in loaded data.
**Warning signs:** "Cannot read property X of undefined" errors on game load.

### Pitfall 3: Circular Event Dependencies
**What goes wrong:** QuestManager emits QUEST_COMPLETE, which triggers InventoryManager to emit ITEM_COLLECTED, which triggers QuestManager to check objectives, creating an infinite loop.
**Why it happens:** Tightly coupled event chains without guards.
**How to avoid:** Use one-directional event flow: Quest -> Inventory is direct method call (not event), Inventory -> UI is event. OR use a transaction pattern: batch state changes, then emit a single summary event.
**Warning signs:** Stack overflow errors, infinite loops, events firing hundreds of times per frame.

### Pitfall 4: Interior Scene Has No Interaction System
**What goes wrong:** Player enters coffee shop interior to interact with counter/NPC for the quest, but `handleAction()` returns early because `this.isInInterior === true` (line 531 of WorldScene.ts).
**Why it happens:** Phase 2 deliberately disabled interactions in interiors ("No interactions available inside building interiors" -- WorldScene comment). Phase 3 needs interactions inside interiors for quest objectives (coffee shop counter, metro map wall).
**How to avoid:** Modify the interior creation to optionally initialize InteractionSystem and NPCManager for interiors that have interactable objects. Add interior NPC/interactable data to interior JSON definitions.
**Warning signs:** Player enters coffee shop but cannot interact with anything to progress the quest.

### Pitfall 5: Dialogue Choices Not Working With Existing Input Flow
**What goes wrong:** Both WorldScene and UIScene listen for Enter/Space to advance dialogue. Adding up/down for choice selection conflicts with movement input.
**Why it happens:** The existing input flow was designed for linear dialogue only.
**How to avoid:** When DialogBox is in choice mode, it should consume up/down input events (prevent them from reaching WorldScene movement). Movement is already frozen during dialogue, but the input routing needs to be explicit. The DialogBox.advance() path needs to branch: if on choice page, up/down move cursor, A confirms. Only after choice is made does the dialogue advance.
**Warning signs:** Player selects a choice but also moves after dialogue closes, or choice selection does not work.

### Pitfall 6: localStorage Quota and Error Handling
**What goes wrong:** Save fails silently, player loses progress.
**Why it happens:** localStorage can throw QuotaExceededError (5MB limit), or be unavailable in private browsing modes.
**How to avoid:** Wrap ALL localStorage calls in try/catch. Show a visible error message to the player if save fails. The GameState for this game will be well under 1KB -- quota is not a realistic risk, but error handling is still essential for robustness.
**Warning signs:** No indication of save success/failure, blank data on load.

## Code Examples

### Quest Manager (Pure Logic, Testable)
```typescript
// src/systems/QuestManager.ts
export type QuestStatus = 'not-started' | 'offered' | 'accepted' | 'in-progress' | 'complete';

export interface QuestState {
  id: string;
  status: QuestStatus;
  objectivesCompleted: string[];
  objectivesTotal: number;
}

export class QuestManager {
  private quests: Map<string, QuestState> = new Map();
  private activeQuestId: string | null = null;

  hasActiveQuest(): boolean {
    return this.activeQuestId !== null;
  }

  getActiveQuestId(): string | null {
    return this.activeQuestId;
  }

  getQuestState(questId: string): QuestState | undefined {
    return this.quests.get(questId);
  }

  offerQuest(questId: string, totalObjectives: number): void {
    if (!this.quests.has(questId)) {
      this.quests.set(questId, {
        id: questId,
        status: 'offered',
        objectivesCompleted: [],
        objectivesTotal: totalObjectives,
      });
    }
  }

  acceptQuest(questId: string): boolean {
    if (this.activeQuestId) return false;
    const quest = this.quests.get(questId);
    if (!quest || quest.status === 'complete') return false;
    quest.status = 'accepted';
    this.activeQuestId = questId;
    return true;
  }

  completeObjective(questId: string, objectiveId: string): boolean {
    const quest = this.quests.get(questId);
    if (!quest || quest.status === 'complete') return false;
    if (quest.objectivesCompleted.includes(objectiveId)) return false;
    quest.objectivesCompleted.push(objectiveId);
    quest.status = 'in-progress';
    if (quest.objectivesCompleted.length >= quest.objectivesTotal) {
      quest.status = 'complete';
      this.activeQuestId = null;
    }
    return true;
  }

  getProgress(questId: string): { completed: number; total: number } | null {
    const quest = this.quests.get(questId);
    if (!quest) return null;
    return { completed: quest.objectivesCompleted.length, total: quest.objectivesTotal };
  }

  /** Restore from save data */
  loadState(questStates: Record<string, QuestState>): void {
    this.quests.clear();
    this.activeQuestId = null;
    for (const [id, state] of Object.entries(questStates)) {
      this.quests.set(id, state);
      if (state.status === 'accepted' || state.status === 'in-progress') {
        this.activeQuestId = id;
      }
    }
  }

  /** Snapshot for save data */
  getState(): Record<string, QuestState> {
    return Object.fromEntries(this.quests);
  }
}
```

### SaveManager (localStorage Wrapper)
```typescript
// src/systems/SaveManager.ts
const SAVE_KEY = 'rcurring-world-save';
const CURRENT_VERSION = 1;

export class SaveManager {
  save(state: GameState): boolean {
    try {
      const json = JSON.stringify({ ...state, version: CURRENT_VERSION });
      localStorage.setItem(SAVE_KEY, json);
      return true;
    } catch (e) {
      console.error('[SaveManager] Save failed:', e);
      return false;
    }
  }

  load(): GameState | null {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      return this.migrate(data);
    } catch (e) {
      console.error('[SaveManager] Load failed:', e);
      return null;
    }
  }

  hasSave(): boolean {
    return localStorage.getItem(SAVE_KEY) !== null;
  }

  deleteSave(): void {
    localStorage.removeItem(SAVE_KEY);
  }

  private migrate(data: any): GameState {
    // Future: chain migration functions per version
    // if (data.version < 2) data = migrateV1toV2(data);
    return data as GameState;
  }
}
```

### Inventory Manager (Pure Logic)
```typescript
// src/systems/InventoryManager.ts
export class InventoryManager {
  private items: InventoryItem[] = [];
  private readonly capacity = 12;

  addItem(item: InventoryItem): boolean {
    if (this.items.length >= this.capacity) return false;
    if (this.items.some(i => i.id === item.id)) return false; // No duplicates
    this.items.push(item);
    return true;
  }

  hasItem(itemId: string): boolean {
    return this.items.some(i => i.id === itemId);
  }

  getItems(): readonly InventoryItem[] {
    return this.items;
  }

  getCount(): number {
    return this.items.length;
  }

  loadState(items: InventoryItem[]): void {
    this.items = [...items];
  }

  getState(): InventoryItem[] {
    return [...this.items];
  }
}
```

### EventsCenter Constants (Phase 3 additions)
```typescript
// Additions to src/utils/constants.ts EVENTS object
export const EVENTS = {
  // ... existing events ...
  // Quest events
  QUEST_OFFERED: 'quest-offered',
  QUEST_ACCEPTED: 'quest-accepted',
  QUEST_OBJECTIVE_COMPLETE: 'quest-objective-complete',
  QUEST_COMPLETE: 'quest-complete',
  QUEST_DECLINED: 'quest-declined',
  // Inventory events
  ITEM_COLLECTED: 'item-collected',
  ITEM_PICKUP_INTERACT: 'item-pickup-interact',
  // Journal events
  NPC_MET: 'npc-met',
  // Menu events
  PAUSE_MENU_OPEN: 'pause-menu-open',
  PAUSE_MENU_CLOSE: 'pause-menu-close',
  // Save events
  GAME_SAVED: 'game-saved',
  GAME_LOADED: 'game-loaded',
  SAVE_ICON_SHOW: 'save-icon-show',
  // Dialogue choice
  DIALOGUE_CHOICE: 'dialogue-choice',
  // Metro
  METRO_MAP_OPEN: 'metro-map-open',
  METRO_TRAVEL_START: 'metro-travel-start',
} as const;
```

### Item Pickup Entity (World-space sparkly collectible)
```typescript
// src/entities/ItemPickup.ts
import Phaser from 'phaser';
import { TILE_SIZE } from '../utils/constants';

export class ItemPickup {
  public sprite: Phaser.GameObjects.Sprite;
  public pickupId: string;
  public itemId: string;
  public tilePosition: { x: number; y: number };

  constructor(
    scene: Phaser.Scene,
    pickupId: string,
    itemId: string,
    tileX: number,
    tileY: number,
    spriteKey: string
  ) {
    this.pickupId = pickupId;
    this.itemId = itemId;
    this.tilePosition = { x: tileX, y: tileY };

    this.sprite = scene.add.sprite(
      tileX * TILE_SIZE + TILE_SIZE / 2,
      tileY * TILE_SIZE + TILE_SIZE / 2,
      spriteKey
    );
    this.sprite.setDepth(2);

    // Sparkle animation (vertical bob + alpha pulse)
    scene.tweens.add({
      targets: this.sprite,
      y: this.sprite.y - 2,
      alpha: { from: 0.7, to: 1 },
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  destroy(): void {
    this.sprite.destroy();
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Rex Quest plugin for RPG quests | Custom QuestManager state machine | Always (rex Quest is for Q&A flows) | Simpler, fits RPG state model better |
| IndexedDB for game saves | localStorage with JSON.stringify | Appropriate for game state < 100KB | Simpler API, synchronous, sufficient capacity |
| Separate scene for each menu | UIScene overlay with panel components | Phaser 3 parallel scene pattern | Avoids scene transition flicker, keeps world visible |
| Per-system save keys | Single JSON blob save | Best practice | Atomic save/load, no partial corruption |

## Open Questions

1. **Interior NPC spawning for quests**
   - What we know: Current interior creation does NOT spawn NPCs or enable interactions (WorldScene line 406: "player only, no NPCs in interiors"). Coffee quest requires interactions inside the coffee shop interior.
   - What's unclear: Whether to add a full NPC spawn system to interiors or use a simpler "interactable object" approach for the coffee counter.
   - Recommendation: Add optional `interactables` array to InteriorDef JSON. Coffee shop gets a counter interactable at a specific tile. Metro station gets a metro-map-wall interactable. This avoids full NPC spawning in interiors while supporting the needed interactions. The `createInterior()` method gets a lightweight InteractionSystem for these.

2. **Cubbon Park coffee stall NPC placement**
   - What we know: CONTEXT says "new small NPC near park or interactable cart object" for coffee spot 3.
   - What's unclear: Whether this is an outdoor NPC (like the existing 5) or an interactable object.
   - Recommendation: Add a new outdoor NPC (park-coffee-vendor) at a position near Cubbon Park. This follows the existing NPC pattern and requires only a new JSON file + sprite. Simpler than a new entity type.

3. **Metro map wall interaction trigger**
   - What we know: Player interacts with a wall object inside the metro station interior. Current interior has no interaction system.
   - Recommendation: Add the metro map wall as an interior interactable (see Q1). When activated, it opens the MetroMap overlay in UIScene.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 (unit) + Playwright 1.58.2 (E2E) |
| Config file | `vitest.config.ts` (unit), `playwright.config.ts` (E2E) |
| Quick run command | `vitest run --reporter=verbose` |
| Full suite command | `npm run test:all` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| QUST-01 | Quest acceptance via dialogue choice | unit | `vitest run tests/unit/quest-manager.test.ts -t "accept" --reporter=verbose` | No -- Wave 0 |
| QUST-02 | Quest objective tracking state machine | unit | `vitest run tests/unit/quest-manager.test.ts -t "objective" --reporter=verbose` | No -- Wave 0 |
| QUST-03 | Coffee quest full playthrough | E2E | `playwright test tests/e2e/coffee-quest.spec.ts` | No -- Wave 0 |
| QUST-04 | Quest completion reward delivery | unit | `vitest run tests/unit/quest-manager.test.ts -t "complete" --reporter=verbose` | No -- Wave 0 |
| INVT-01 | Item collection into inventory | unit | `vitest run tests/unit/inventory-manager.test.ts --reporter=verbose` | No -- Wave 0 |
| INVT-02 | Inventory view with icons and text | E2E | `playwright test tests/e2e/pause-menu.spec.ts` | No -- Wave 0 |
| INVT-03 | Bengaluru-specific items exist in catalog | unit | `vitest run tests/unit/item-catalog.test.ts --reporter=verbose` | No -- Wave 0 |
| JRNL-01 | Journal records landmarks | unit | `vitest run tests/unit/journal-manager.test.ts -t "landmark" --reporter=verbose` | No -- Wave 0 |
| JRNL-02 | Journal tracks NPCs met and items | unit | `vitest run tests/unit/journal-manager.test.ts -t "npc\|item" --reporter=verbose` | No -- Wave 0 |
| JRNL-03 | Zone completion percentage | unit | `vitest run tests/unit/journal-manager.test.ts -t "completion" --reporter=verbose` | No -- Wave 0 |
| MTRO-01 | Metro map UI accessible from station | E2E | `playwright test tests/e2e/metro-travel.spec.ts` | No -- Wave 0 |
| MTRO-02 | Station selection (locked in v1) | unit | `vitest run tests/unit/metro-manager.test.ts --reporter=verbose` | No -- Wave 0 |
| MTRO-03 | Travel transition animation | E2E | `playwright test tests/e2e/metro-travel.spec.ts` | No -- Wave 0 |
| SAVE-01 | Manual save from pause menu | unit | `vitest run tests/unit/save-manager.test.ts -t "save" --reporter=verbose` | No -- Wave 0 |
| SAVE-02 | Auto-save on zone transitions | unit | `vitest run tests/unit/save-manager.test.ts -t "auto" --reporter=verbose` | No -- Wave 0 |
| SAVE-03 | Save state includes all progress data | unit | `vitest run tests/unit/save-manager.test.ts -t "state" --reporter=verbose` | No -- Wave 0 |
| SAVE-04 | Load and resume from saved game | unit + E2E | `vitest run tests/unit/save-manager.test.ts -t "load" --reporter=verbose` | No -- Wave 0 |
| PLAT-04 | Pause menu with tabbed sections | E2E | `playwright test tests/e2e/pause-menu.spec.ts` | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `vitest run --reporter=verbose`
- **Per wave merge:** `npm run test:all`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/unit/quest-manager.test.ts` -- covers QUST-01, QUST-02, QUST-04
- [ ] `tests/unit/inventory-manager.test.ts` -- covers INVT-01, INVT-03
- [ ] `tests/unit/journal-manager.test.ts` -- covers JRNL-01, JRNL-02, JRNL-03
- [ ] `tests/unit/save-manager.test.ts` -- covers SAVE-01, SAVE-02, SAVE-03, SAVE-04
- [ ] `tests/unit/item-catalog.test.ts` -- covers INVT-03
- [ ] `tests/unit/metro-manager.test.ts` -- covers MTRO-02
- [ ] `tests/e2e/pause-menu.spec.ts` -- covers PLAT-04, INVT-02
- [ ] `tests/e2e/coffee-quest.spec.ts` -- covers QUST-03
- [ ] `tests/e2e/metro-travel.spec.ts` -- covers MTRO-01, MTRO-03

## Sources

### Primary (HIGH confidence)
- Existing codebase analysis: `src/systems/`, `src/ui/`, `src/scenes/`, `src/data/`, `src/utils/` -- all source files read directly
- Phase 1-2 architecture research: `.planning/research/ARCHITECTURE.md`, `.planning/research/STACK.md`
- Phase 3 CONTEXT.md: `.planning/phases/03-game-systems/03-CONTEXT.md` -- all user decisions
- Phaser 3.90 game config and scene patterns: verified via existing codebase (working code)
- rexrainbow TextTyping: already integrated in DialogBox.ts (verified working)

### Secondary (MEDIUM confidence)
- [Rex Quest Plugin docs](https://rexrainbow.github.io/phaser3-rex-notes/docs/site/quest/) -- verified as quiz/Q&A-style, NOT suitable for RPG quest tracking
- [Rex Dialog-Quest Plugin docs](https://rexrainbow.github.io/phaser3-rex-notes/docs/site/dialog-quest/) -- flow control for question managers with dialog
- [Phaser forum: Pause Menu pattern](https://phaser.discourse.group/t/creating-a-menu-pause-the-game/9455) -- scene pause/resume approach
- [localStorage best practices](https://phaser.discourse.group/t/best-practices-for-storing-dynamic-data-about-tiles-collected-items-settings-etc/7265) -- namespace, versioning, error handling
- [Phaser forum: Persistent UI objects](https://phaser.discourse.group/t/persistent-ui-objects-components-on-scenes/2359) -- UIScene overlay pattern

### Tertiary (LOW confidence)
- None -- all findings verified against existing codebase patterns or official documentation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new dependencies needed; all technology already in use and verified
- Architecture: HIGH -- follows patterns established in Phases 1-2 with documented code
- Pitfalls: HIGH -- identified from direct codebase analysis (e.g., interior interaction gap is visible in WorldScene.ts line 531)
- Quest/Inventory/Journal patterns: HIGH -- straightforward state machine patterns; no exotic requirements
- Save/Load: HIGH -- well-understood localStorage pattern with documented best practices
- Metro transition: MEDIUM -- transition animation is standard Phaser tweens but exact visual treatment is discretionary

**Research date:** 2026-03-21
**Valid until:** 2026-04-21 (stable -- no moving dependencies, all patterns from existing codebase)
