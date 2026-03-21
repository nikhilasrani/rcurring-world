import Phaser from 'phaser';
import { Direction, NumberOfDirections } from 'grid-engine';
import { Player, getMovementDirection } from '../entities/Player';
import { NPCManager } from '../systems/NPCManager';
import { InteractionSystem } from '../systems/InteractionSystem';
import { ZoneManager } from '../systems/ZoneManager';
import { TransitionManager } from '../systems/TransitionManager';
import { AutoRickshawManager } from '../systems/AutoRickshawManager';
import { QuestManager } from '../systems/QuestManager';
import { InventoryManager } from '../systems/InventoryManager';
import { JournalManager } from '../systems/JournalManager';
import { SaveManager } from '../systems/SaveManager';
import { ItemPickup } from '../entities/ItemPickup';
import { InteractionPrompt } from '../ui/InteractionPrompt';
import { eventsCenter } from '../utils/EventsCenter';
import {
  SCENES,
  ASSETS,
  LAYERS,
  TILE_SIZE,
  COLLISION_PROPERTY,
  EVENTS,
} from '../utils/constants';
import type {
  PlayerState,
  NPCDef,
  SignDef,
  InteriorDef,
  LandmarkDef,
  InventoryItem,
  GameState,
  InteriorInteractable,
} from '../utils/types';

// NPC data (imported as JSON modules via Vite)
import chaiWallaData from '../data/npcs/chai-walla.json';
import autoDriverData from '../data/npcs/auto-driver.json';
import joggerData from '../data/npcs/jogger.json';
import shopkeeperData from '../data/npcs/shopkeeper.json';
import guardData from '../data/npcs/guard.json';
import parkCoffeeVendorData from '../data/npcs/park-coffee-vendor.json';

// Sign data
import signsData from '../data/signs/signs.json';

// Interior metadata
import metroInterior from '../data/interiors/metro-station.json';
import coffeeInterior from '../data/interiors/coffee-shop.json';
import ubcityInterior from '../data/interiors/ub-city-mall.json';
import libraryInterior from '../data/interiors/cubbon-library.json';

// Zone data
import zoneData from '../data/zones/mg-road.json';

// Phase 3 data
import pickupsData from '../data/pickups/mg-road-pickups.json';
import itemsData from '../data/items/items.json';
import questData from '../data/quests/best-filter-coffee.json';
import journalData from '../data/journal/mg-road-discoveries.json';

/** Scene mode data passed via scene restart for interior/outdoor transitions */
interface SceneModeData {
  mode: 'outdoor' | 'interior';
  interiorKey?: string;
  tilesetKey?: string;
  playerSpawn?: { x: number; y: number };
  interiorSize?: { width: number; height: number };
  interiorId?: string;
  interiorDisplayName?: string;
  returnPosition?: { x: number; y: number };
  returnTilemapKey?: string;
}

/**
 * WorldScene: Main gameplay scene.
 * Loads the tilemap, initializes Grid Engine for tile-locked movement,
 * creates the player entity, sets up camera follow with bounds,
 * processes keyboard + touch input for 4-direction movement,
 * toggles walk/run speed, and triggers idle animation when stationary.
 *
 * Phase 2: Spawns NPCs, handles NPC/sign/door interaction,
 * detects zone boundaries, manages building transitions.
 */
export class WorldScene extends Phaser.Scene {
  private player!: Player;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys!: Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;
  private gridEngine!: any; // Grid Engine plugin (typed via scene mapping)
  private touchDirection: Direction | null = null;
  private runButtonHeld = false;

  // Phase 2 systems
  private npcManager!: NPCManager;
  private interactionSystem!: InteractionSystem;
  private zoneManager!: ZoneManager;
  private transitionManager!: TransitionManager;
  private autoRickshawManager!: AutoRickshawManager;
  private interactionPrompt!: InteractionPrompt;
  private movementFrozen = false;
  private isInInterior = false;
  private sceneMode: SceneModeData = { mode: 'outdoor' };

  // Phase 3 game systems
  private questManager!: QuestManager;
  private inventoryManager!: InventoryManager;
  private journalManager!: JournalManager;
  private saveManager!: SaveManager;
  private itemPickups: ItemPickup[] = [];
  private npcsMetIds: Set<string> = new Set();
  private collectedPickupIds: Set<string> = new Set();

  // Bound event handlers (stored so shutdown can remove only OUR listeners)
  private boundHandlers: Record<string, (...args: any[]) => void> = {};

  constructor() {
    super({ key: SCENES.WORLD });
  }

  init(data: any): void {
    // data can be PlayerState (from NameEntry) or interior/outdoor transition data
    if (data?.mode === 'interior' || data?.mode === 'outdoor') {
      // Store transition data for create() to use
      this.sceneMode = data as SceneModeData;
      // Keep existing playerState in registry
    } else {
      const playerState = data?.name
        ? data
        : (this.registry.get('playerState') as PlayerState);

      if (playerState) {
        this.registry.set('playerState', playerState);
      }
      this.sceneMode = { mode: 'outdoor' };
    }
  }

  create(): void {
    // Wire shutdown() to Phaser's SHUTDOWN event so it runs on scene.restart().
    // Phaser does NOT auto-call a scene's shutdown() method — only init/create/update.
    // Without this, AutoRickshawManager persists with stale character IDs, crashing
    // gridEngine.getPosition() in update() and breaking the game loop (black screen).
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);

    // Reset state for scene restart
    this.movementFrozen = false;
    this.touchDirection = null;
    this.runButtonHeld = false;

    if (this.sceneMode.mode === 'interior') {
      this.createInterior();
    } else {
      this.createOutdoor();
    }
  }

  /**
   * Create the outdoor world with NPCs, zones, and interaction systems.
   */
  private createOutdoor(): void {
    this.isInInterior = false;

    const playerState = (this.registry.get('playerState') as PlayerState) || {
      name: 'Explorer',
      gender: 'male' as const,
      position: { x: 45, y: 35 },
      facing: Direction.DOWN,
      isRunning: false,
    };

    // If returning from interior, use the return position
    if (this.sceneMode.playerSpawn) {
      playerState.position = this.sceneMode.playerSpawn;
    }

    // --- Create Tilemap ---
    const tilemap = this.make.tilemap({ key: ASSETS.TILEMAP_MG_ROAD });

    // Add tilesets with extrusion margins (margin: 1, spacing: 2)
    const groundTileset = tilemap.addTilesetImage(
      'ground',
      ASSETS.TILESET_GROUND,
      TILE_SIZE,
      TILE_SIZE,
      1,
      2
    );
    const buildingsTileset = tilemap.addTilesetImage(
      'buildings',
      ASSETS.TILESET_BUILDINGS,
      TILE_SIZE,
      TILE_SIZE,
      1,
      2
    );
    const natureTileset = tilemap.addTilesetImage(
      'nature',
      ASSETS.TILESET_NATURE,
      TILE_SIZE,
      TILE_SIZE,
      1,
      2
    );
    const decorationsTileset = tilemap.addTilesetImage(
      'decorations',
      ASSETS.TILESET_DECORATIONS,
      TILE_SIZE,
      TILE_SIZE,
      1,
      2
    );

    const allTilesets = [
      groundTileset,
      buildingsTileset,
      natureTileset,
      decorationsTileset,
    ].filter(Boolean) as Phaser.Tilemaps.Tileset[];

    // --- Create Tile Layers ---
    const groundLayer = tilemap.createLayer(LAYERS.GROUND, allTilesets);
    const groundDetailLayer = tilemap.createLayer(
      LAYERS.GROUND_DETAIL,
      allTilesets
    );
    const buildingsLayer = tilemap.createLayer(LAYERS.BUILDINGS, allTilesets);
    const abovePlayerLayer = tilemap.createLayer(
      LAYERS.ABOVE_PLAYER,
      allTilesets
    );

    // Collision layer: invisible, used by Grid Engine
    const collisionLayer = tilemap.createLayer(LAYERS.COLLISION, allTilesets);
    if (collisionLayer) {
      collisionLayer.setVisible(false);
    }

    // Set depth ordering
    if (groundLayer) groundLayer.setDepth(0);
    if (groundDetailLayer) groundDetailLayer.setDepth(0);
    if (buildingsLayer) buildingsLayer.setDepth(1);
    // Player/NPC sprite depth = 2 (set in Player/NPC class)
    if (abovePlayerLayer) abovePlayerLayer.setDepth(3);

    // Chinnaswamy Stadium composite sprites (replaces tile-based stadium visuals)
    // Stadium footprint: tile (3,41), size 10x13 tiles = pixel (48, 656), 160x208px
    const stadiumX = 3 * TILE_SIZE;
    const stadiumY = 41 * TILE_SIZE;
    this.add.image(stadiumX, stadiumY, ASSETS.SPRITE_CHINNASWAMY)
      .setOrigin(0, 0)
      .setDepth(1);
    this.add.image(stadiumX, stadiumY, ASSETS.SPRITE_CHINNASWAMY_ROOF)
      .setOrigin(0, 0)
      .setDepth(3);

    // --- Create Player ---
    this.player = new Player(this, playerState);

    // --- Initialize Grid Engine ---
    const gridEngineConfig = {
      characters: [this.player.getGridEngineCharacterConfig()],
      numberOfDirections: NumberOfDirections.FOUR,
      collisionTilePropertyName: COLLISION_PROPERTY,
    };
    this.gridEngine.create(tilemap, gridEngineConfig);

    // --- Camera Setup ---
    this.cameras.main.setZoom(1); // Reset zoom from interior scenes
    this.cameras.main.startFollow(this.player.sprite, true);
    this.cameras.main.setBounds(
      0,
      0,
      tilemap.widthInPixels,
      tilemap.heightInPixels
    );
    this.cameras.main.setRoundPixels(true);

    // --- Keyboard Input ---
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasdKeys = this.input.keyboard!.addKeys('W,A,S,D') as Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;

    // --- Touch Input (from UIScene via EventsCenter) ---
    // Store handler references so shutdown() removes only OUR listeners,
    // not UIScene's listeners on the same global eventsCenter.
    this.boundHandlers = {};
    this.boundHandlers.touchDirection = (dir: Direction | null) => { this.touchDirection = dir; };
    this.boundHandlers.runButtonDown = () => { this.runButtonHeld = true; };
    this.boundHandlers.runButtonUp = () => { this.runButtonHeld = false; };
    this.boundHandlers.movementFreeze = (freeze: boolean) => { this.movementFrozen = freeze; };
    this.boundHandlers.dialogueOpen = () => { this.movementFrozen = true; };
    this.boundHandlers.dialogueClose = () => {
      // Defer unfreeze by one frame so the closing keypress doesn't
      // immediately re-trigger handleAction() on the same interactable
      this.time.delayedCall(1, () => {
        this.movementFrozen = false;
      });
      // Resume NPC patrol if one was stopped
      const lastInteractedNPC = this.registry.get('lastInteractedNPC') as
        | string
        | undefined;
      if (lastInteractedNPC) {
        this.npcManager.resumeNPCPatrol(this.gridEngine, lastInteractedNPC);
        this.registry.remove('lastInteractedNPC');
      }
      // Resume auto-rickshaw if one was stopped
      const lastInteractedAuto = this.registry.get('lastInteractedAuto') as
        | string
        | undefined;
      if (lastInteractedAuto) {
        this.autoRickshawManager?.resumeAuto(lastInteractedAuto);
        this.registry.remove('lastInteractedAuto');
      }
    };
    this.boundHandlers.touchAction = () => { this.handleAction(); };
    this.boundHandlers.dialogueChoice = ({ choiceIndex }: { choiceIndex: number }) => {
      if (choiceIndex === 0) {
        if (!this.questManager.hasActiveQuest()) {
          this.questManager.acceptQuest(questData.id);
          eventsCenter.emit(EVENTS.QUEST_ACCEPTED, { questId: questData.id });
        }
      } else {
        eventsCenter.emit(EVENTS.QUEST_DECLINED, { questId: questData.id });
      }
    };
    this.boundHandlers.npcInteract = () => {
      const lastNPC = this.registry.get('lastInteractedNPC') as string | undefined;
      if (lastNPC && !this.npcsMetIds.has(lastNPC)) {
        this.npcsMetIds.add(lastNPC);
        eventsCenter.emit(EVENTS.NPC_MET, { npcId: lastNPC });
      }
    };
    this.boundHandlers.buildingEnter = () => { this.performAutoSave(); };
    this.boundHandlers.buildingExit = () => { this.performAutoSave(); };
    this.boundHandlers.saveGame = () => { this.performManualSave(); };

    eventsCenter.on(EVENTS.TOUCH_DIRECTION, this.boundHandlers.touchDirection);
    eventsCenter.on(EVENTS.RUN_BUTTON_DOWN, this.boundHandlers.runButtonDown);
    eventsCenter.on(EVENTS.RUN_BUTTON_UP, this.boundHandlers.runButtonUp);

    // === Phase 2: NPC, Interaction, Zone, and Transition Systems ===

    // Spawn NPCs (including Phase 3 park coffee vendor)
    const npcDefs = [
      chaiWallaData,
      autoDriverData,
      joggerData,
      shopkeeperData,
      guardData,
      parkCoffeeVendorData,
    ] as NPCDef[];
    this.npcManager = new NPCManager();
    this.npcManager.spawnAll(this, this.gridEngine, npcDefs);

    // Spawn auto-rickshaws (ambient traffic on roads)
    this.autoRickshawManager = new AutoRickshawManager(this, this.gridEngine);
    this.autoRickshawManager.spawnAll();

    // Set up interaction system
    const interiorDefs = [
      metroInterior,
      coffeeInterior,
      ubcityInterior,
      libraryInterior,
    ] as InteriorDef[];
    this.interactionSystem = new InteractionSystem(
      signsData as SignDef[],
      interiorDefs
    );

    // Set up zone manager
    this.zoneManager = new ZoneManager(zoneData.landmarks as LandmarkDef[]);

    // Set up transition manager
    this.transitionManager = new TransitionManager(this);

    // Interaction prompt (renders in WorldScene -- scrolls with world)
    this.interactionPrompt = new InteractionPrompt(this);

    // === Phase 3: Game Systems (Quest, Inventory, Journal, Save) ===

    // Initialize managers
    this.questManager = new QuestManager((questId, state) => {
      eventsCenter.emit(EVENTS.QUEST_OBJECTIVE_COMPLETE, { questId, state });
      if (state.status === 'complete') {
        eventsCenter.emit(EVENTS.QUEST_COMPLETE, { questId, state });
      }
    });
    this.inventoryManager = new InventoryManager();
    this.journalManager = new JournalManager(journalData);
    this.saveManager = new SaveManager();

    // Connect quest manager to NPC manager for quest-state dialogue
    this.npcManager.setQuestManager(this.questManager);

    // Store managers and discovery state in registry for UIScene access
    this.registry.set('questManager', this.questManager);
    this.registry.set('inventoryManager', this.inventoryManager);
    this.registry.set('journalManager', this.journalManager);
    this.registry.set('saveManager', this.saveManager);
    this.registry.set('zoneManager', this.zoneManager);
    this.registry.set('npcsMetIds', this.npcsMetIds);
    this.registry.set('collectedPickupIds', this.collectedPickupIds);

    // Restore state from loaded game if present
    const loadedGameState = this.registry.get('loadedGameState') as GameState | undefined;
    if (loadedGameState) {
      this.questManager.loadState(loadedGameState.quests);
      this.inventoryManager.loadState(loadedGameState.inventory);
      this.npcsMetIds = new Set(loadedGameState.discovery.npcsMetIds);
      this.collectedPickupIds = new Set(loadedGameState.discovery.collectedPickupIds);
      this.registry.remove('loadedGameState'); // consume once
    }

    // Offer the filter coffee quest if not yet encountered
    this.questManager.offerQuest(questData.id, questData.objectives.length);

    // Spawn item pickups (skip collected ones)
    pickupsData.forEach((pickup) => {
      if (!this.collectedPickupIds.has(pickup.id)) {
        const entity = new ItemPickup(
          this,
          pickup.id,
          pickup.itemId,
          pickup.position.x,
          pickup.position.y,
          ASSETS.SPRITE_SPARKLE,
        );
        this.itemPickups.push(entity);
      }
    });

    // Set pickup defs on InteractionSystem
    this.interactionSystem.setPickupDefs(pickupsData, [...this.collectedPickupIds]);

    // Quest event listeners
    eventsCenter.on(EVENTS.DIALOGUE_CHOICE, this.boundHandlers.dialogueChoice);

    // Track NPC meetings for journal
    eventsCenter.on(EVENTS.NPC_INTERACT, this.boundHandlers.npcInteract);

    // Auto-save on building transitions
    eventsCenter.on(EVENTS.BUILDING_ENTER, this.boundHandlers.buildingEnter);
    eventsCenter.on(EVENTS.BUILDING_EXIT, this.boundHandlers.buildingExit);

    // Manual save from pause menu (needs Grid Engine for current position)
    eventsCenter.on(EVENTS.SAVE_GAME, this.boundHandlers.saveGame);

    // Movement freeze listener
    eventsCenter.on(EVENTS.MOVEMENT_FREEZE, this.boundHandlers.movementFreeze);
    eventsCenter.on(EVENTS.DIALOGUE_OPEN, this.boundHandlers.dialogueOpen);
    eventsCenter.on(EVENTS.DIALOGUE_CLOSE, this.boundHandlers.dialogueClose);

    // Action button handler (keyboard)
    this.input.keyboard?.on('keydown-ENTER', () => this.handleAction());
    this.input.keyboard?.on('keydown-SPACE', () => this.handleAction());

    // Action button handler (touch -- from EventsCenter)
    eventsCenter.on(EVENTS.TOUCH_ACTION, this.boundHandlers.touchAction);

    // Zone detection + interaction prompt update on player movement
    this.gridEngine.positionChangeFinished().subscribe(
      ({ charId, enterTile }: { charId: string; enterTile: { x: number; y: number } }) => {
        if (charId === 'player') {
          this.zoneManager.checkZone(enterTile);
          this.updateInteractionPrompt();
        }
      }
    );

    // --- Launch UIScene (runs in parallel, renders above WorldScene) ---
    if (!this.scene.isActive(SCENES.UI)) {
      this.scene.launch(SCENES.UI);
    }

    // Fade in if returning from interior
    if (this.sceneMode.playerSpawn) {
      this.cameras.main.fadeIn(250, 0, 0, 0);
    }

    // Signal that world is ready
    eventsCenter.emit(EVENTS.SCENE_READY, SCENES.WORLD);
  }

  /**
   * Create an interior scene (building interior after door transition).
   */
  private createInterior(): void {
    this.isInInterior = true;
    const mode = this.sceneMode;

    const playerState = (this.registry.get('playerState') as PlayerState) || {
      name: 'Explorer',
      gender: 'male' as const,
      position: mode.playerSpawn || { x: 7, y: 8 },
      facing: Direction.DOWN,
      isRunning: false,
    };

    // Override player position with interior spawn
    if (mode.playerSpawn) {
      playerState.position = mode.playerSpawn;
    }

    // --- Create Interior Tilemap ---
    const tilemap = this.make.tilemap({ key: mode.interiorKey! });

    // Interior tileset has no extrusion (unlike outdoor tilesets)
    const interiorTileset = tilemap.addTilesetImage(
      'interior',
      ASSETS.TILESET_INTERIOR,
      TILE_SIZE,
      TILE_SIZE,
      0,
      0
    );

    const tilesets = [interiorTileset].filter(
      Boolean
    ) as Phaser.Tilemaps.Tileset[];

    // Create layers (interior tilemaps have the same layer structure)
    const groundLayer = tilemap.createLayer(LAYERS.GROUND, tilesets);
    const groundDetailLayer = tilemap.createLayer(LAYERS.GROUND_DETAIL, tilesets);
    const buildingsLayer = tilemap.createLayer(LAYERS.BUILDINGS, tilesets);
    const abovePlayerLayer = tilemap.createLayer(LAYERS.ABOVE_PLAYER, tilesets);
    const collisionLayer = tilemap.createLayer(LAYERS.COLLISION, tilesets);

    if (collisionLayer) collisionLayer.setVisible(false);
    if (groundLayer) groundLayer.setDepth(0);
    if (groundDetailLayer) groundDetailLayer.setDepth(0);
    if (buildingsLayer) buildingsLayer.setDepth(1);
    if (abovePlayerLayer) abovePlayerLayer.setDepth(3);

    // --- Create Player ---
    this.player = new Player(this, playerState);

    // --- Initialize Grid Engine (player only, no NPCs in interiors) ---
    const gridEngineConfig = {
      characters: [this.player.getGridEngineCharacterConfig()],
      numberOfDirections: NumberOfDirections.FOUR,
      collisionTilePropertyName: COLLISION_PROPERTY,
    };
    this.gridEngine.create(tilemap, gridEngineConfig);

    // --- Camera Setup for Interior ---
    const interiorPixelW = tilemap.widthInPixels;
    const interiorPixelH = tilemap.heightInPixels;

    // Zoom to fill viewport, follow player freely (walls contain movement)
    const { width: viewW, height: viewH } = this.scale.gameSize;
    const zoom = Math.max(viewW / interiorPixelW, viewH / interiorPixelH);
    this.cameras.main.setZoom(zoom);
    this.cameras.main.removeBounds();
    this.cameras.main.startFollow(this.player.sprite, true);
    this.cameras.main.setRoundPixels(true);

    // --- Keyboard Input ---
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasdKeys = this.input.keyboard!.addKeys('W,A,S,D') as Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;

    // --- Touch Input ---
    // Reuse bound handlers from createOutdoor or create fresh ones for interior-first entry
    if (!this.boundHandlers.touchDirection) {
      this.boundHandlers = {};
      this.boundHandlers.touchDirection = (dir: Direction | null) => { this.touchDirection = dir; };
      this.boundHandlers.runButtonDown = () => { this.runButtonHeld = true; };
      this.boundHandlers.runButtonUp = () => { this.runButtonHeld = false; };
      this.boundHandlers.touchAction = () => { this.handleAction(); };
      this.boundHandlers.movementFreeze = (freeze: boolean) => { this.movementFrozen = freeze; };
    }
    eventsCenter.on(EVENTS.TOUCH_DIRECTION, this.boundHandlers.touchDirection);
    eventsCenter.on(EVENTS.RUN_BUTTON_DOWN, this.boundHandlers.runButtonDown);
    eventsCenter.on(EVENTS.RUN_BUTTON_UP, this.boundHandlers.runButtonUp);

    // --- Transition Manager for exit handling ---
    this.transitionManager = new TransitionManager(this);
    // Set return state so exitBuilding() knows where to go back to
    this.transitionManager.setReturnState({
      id: mode.interiorId!,
      name: mode.interiorId!,
      displayName: mode.interiorDisplayName!,
      tilemapKey: mode.interiorKey!,
      tilesetKey: mode.tilesetKey!,
      doorPosition: { x: 0, y: 0 },
      playerSpawn: mode.playerSpawn!,
      exitPosition: { x: 0, y: 0 },
      returnPosition: mode.returnPosition!,
      size: mode.interiorSize!,
    } as InteriorDef);

    // --- Phase 3: Interior interaction system ---
    // Find matching interior def to check for interactables
    const interiorDefs = [metroInterior, coffeeInterior, ubcityInterior, libraryInterior];
    const matchedInterior = interiorDefs.find(i => i.tilemapKey === mode.interiorKey);
    if (matchedInterior && (matchedInterior as any).interactables) {
      this.interactionSystem = new InteractionSystem([], []);
      this.interactionSystem.setInteriorInteractables(
        (matchedInterior as any).interactables as InteriorInteractable[],
      );
    }

    // Restore managers from registry (persisted from outdoor scene)
    this.questManager = this.registry.get('questManager') as QuestManager;
    this.inventoryManager = this.registry.get('inventoryManager') as InventoryManager;
    this.journalManager = this.registry.get('journalManager') as JournalManager;
    this.saveManager = this.registry.get('saveManager') as SaveManager;

    // Action button handler for interior interactions
    this.input.keyboard?.on('keydown-ENTER', () => this.handleAction());
    this.input.keyboard?.on('keydown-SPACE', () => this.handleAction());
    eventsCenter.on(EVENTS.TOUCH_ACTION, this.boundHandlers.touchAction);

    // Movement freeze listener
    eventsCenter.on(EVENTS.MOVEMENT_FREEZE, this.boundHandlers.movementFreeze);

    // Exit door detection: when player reaches exit position, trigger exit
    const exitPos = this.findExitPosition(tilemap, mode);

    this.gridEngine.positionChangeFinished().subscribe(
      ({ charId, enterTile }: { charId: string; enterTile: { x: number; y: number } }) => {
        if (charId === 'player' && exitPos) {
          if (enterTile.x === exitPos.x && enterTile.y === exitPos.y) {
            this.transitionManager.exitBuilding();
          }
        }
      }
    );

    // Launch UIScene if not active
    if (!this.scene.isActive(SCENES.UI)) {
      this.scene.launch(SCENES.UI);
    }

    // Fade in and show zone banner
    this.cameras.main.fadeIn(250, 0, 0, 0);
    this.cameras.main.once(
      Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE,
      () => {
        // Show interior zone banner
        if (mode.interiorDisplayName) {
          eventsCenter.emit(EVENTS.ZONE_ENTER, mode.interiorDisplayName);
        }
      }
    );

    eventsCenter.emit(EVENTS.SCENE_READY, SCENES.WORLD);
  }

  /**
   * Find the exit position for the current interior.
   * First tries the doors object layer in the tilemap, then falls back to mode data.
   */
  private findExitPosition(
    tilemap: Phaser.Tilemaps.Tilemap,
    mode: SceneModeData
  ): { x: number; y: number } | null {
    // Try doors object layer first
    const doorsLayer = tilemap.getObjectLayer(LAYERS.DOORS);
    if (doorsLayer && doorsLayer.objects.length > 0) {
      const doorObj = doorsLayer.objects[0];
      return {
        x: Math.floor((doorObj.x ?? 0) / TILE_SIZE),
        y: Math.floor((doorObj.y ?? 0) / TILE_SIZE),
      };
    }

    // Find the matching interior def from our imported data
    const interiorDefs = [metroInterior, coffeeInterior, ubcityInterior, libraryInterior];
    const matchedInterior = interiorDefs.find(i => i.tilemapKey === mode.interiorKey);
    if (matchedInterior) {
      return matchedInterior.exitPosition;
    }

    return null;
  }

  /**
   * Handle action button press (Enter/Space/A).
   * Checks for NPC/sign/door interaction at player's facing position.
   * No interactions available inside building interiors (no NPCs/signs/doors there).
   */
  private handleAction(): void {
    // If dialogue is active, advance is handled by UIScene. Do nothing here.
    if (this.movementFrozen) return;

    // Interior interaction handling
    if (this.isInInterior) {
      if (!this.interactionSystem) return;
      const target = this.interactionSystem.checkInteraction(this.gridEngine, 'player');
      if (!target) return;

      if (target.type === 'metro-map') {
        eventsCenter.emit(EVENTS.METRO_MAP_OPEN);
      } else if (target.type === 'counter' || target.type === 'object') {
        const interactable = this.interactionSystem.getInteractableData(target.id);
        if (interactable?.dialogue) {
          // Check quest state for objective completion
          if (this.questManager?.hasActiveQuest()) {
            const questId = this.questManager.getActiveQuestId()!;
            this.questManager.completeObjective(questId, target.id);
          }
          eventsCenter.emit(EVENTS.SIGN_INTERACT, interactable.dialogue);
        }
      }
      return;
    }

    if (!this.interactionSystem) return;

    const target = this.interactionSystem.checkInteraction(
      this.gridEngine,
      'player'
    );
    if (!target) return;

    if (target.type === 'npc') {
      // Check if it's an auto-rickshaw
      if (this.autoRickshawManager?.isAuto(target.id)) {
        const dialogue = this.autoRickshawManager.getDialogue(target.id);
        if (!dialogue) return;

        // Stop the auto during dialogue
        this.autoRickshawManager.stopAuto(target.id);
        this.registry.set('lastInteractedAuto', target.id);

        eventsCenter.emit(EVENTS.NPC_INTERACT, dialogue);
        return;
      }

      const npcData = this.npcManager.getNPCData(target.id);
      if (!npcData) return;

      // Stop NPC patrol and face player
      this.npcManager.stopNPCPatrol(this.gridEngine, target.id);
      const playerFacing = this.gridEngine.getFacingDirection('player');
      const oppositeDir = this.getOppositeDirection(playerFacing);
      this.gridEngine.turnTowards(target.id, oppositeDir);
      this.registry.set('lastInteractedNPC', target.id);

      // Track NPC meeting for journal
      if (!this.npcsMetIds.has(target.id)) {
        this.npcsMetIds.add(target.id);
      }

      // Use quest-state-aware dialogue if available
      const dialogue = this.npcManager.getDialogueForNPC(target.id);
      if (dialogue) {
        // Check quest objective completion for NPC interactions
        if (this.questManager?.hasActiveQuest()) {
          const questId = this.questManager.getActiveQuestId()!;
          // Try to complete an objective matching this NPC
          const objective = questData.objectives.find(o => o.targetId === target.id);
          if (objective) {
            this.questManager.completeObjective(questId, objective.id);
          }
        }
        eventsCenter.emit(EVENTS.NPC_INTERACT, dialogue);
      }
    } else if (target.type === 'sign') {
      const signData = this.interactionSystem.getSignData(target.id);
      if (!signData) return;
      eventsCenter.emit(EVENTS.SIGN_INTERACT, signData.dialogue);
    } else if (target.type === 'door') {
      const interiorData = this.interactionSystem.getInteriorData(target.id);
      if (!interiorData) return;
      this.transitionManager.enterBuilding(interiorData);
    } else if (target.type === 'pickup') {
      const pickupDef = this.interactionSystem.getPickupData(target.id);
      if (!pickupDef) return;
      const itemDef = itemsData.find(i => i.id === pickupDef.itemId);
      if (!itemDef) return;
      const item: InventoryItem = {
        id: itemDef.id,
        name: itemDef.name,
        description: itemDef.description,
        iconKey: itemDef.iconKey,
        source: 'world-pickup',
      };
      if (this.inventoryManager.addItem(item)) {
        // Remove pickup from world
        const pickupEntity = this.itemPickups.find(p => p.pickupId === target.id);
        pickupEntity?.destroy();
        this.itemPickups = this.itemPickups.filter(p => p.pickupId !== target.id);
        this.collectedPickupIds.add(target.id);
        this.interactionSystem.markPickupCollected(target.id);
        eventsCenter.emit(EVENTS.ITEM_COLLECTED, { item, source: 'world-pickup' });
      }
    }
  }

  /**
   * Get the opposite direction (for NPC facing toward player).
   */
  private getOppositeDirection(dir: Direction): Direction {
    switch (dir) {
      case Direction.UP:
        return Direction.DOWN;
      case Direction.DOWN:
        return Direction.UP;
      case Direction.LEFT:
        return Direction.RIGHT;
      case Direction.RIGHT:
        return Direction.LEFT;
      default:
        return Direction.DOWN;
    }
  }

  /**
   * Update the interaction prompt visibility based on what's at the player's facing position.
   */
  private updateInteractionPrompt(): void {
    if (!this.interactionSystem || !this.interactionPrompt) return;

    const target = this.interactionSystem.checkInteraction(
      this.gridEngine,
      'player'
    );
    if (target) {
      this.interactionPrompt.showAt(target.position.x, target.position.y);
    } else {
      this.interactionPrompt.hide();
    }
  }

  update(): void {
    if (!this.player || !this.gridEngine) return;

    // Always update auto-rickshaws (traffic doesn't freeze during dialogue)
    if (this.autoRickshawManager) {
      this.autoRickshawManager.update();
    }

    if (this.movementFrozen) return;

    // Determine run state: Shift key OR B button held
    const isRunning = this.cursors.shift?.isDown || this.runButtonHeld;
    const speed = this.player.updateSpeed(isRunning);

    // Update Grid Engine speed at runtime
    try {
      this.gridEngine.setSpeed('player', speed);
    } catch {
      // Fallback: Grid Engine may not have setSpeed() as a public method.
      console.warn(
        'gridEngine.setSpeed not available, using fallback speed mechanism'
      );
    }

    // Determine direction from keyboard (arrow keys + WASD)
    const wasd = this.wasdKeys;
    const keyDirection = getMovementDirection({
      left: this.cursors.left.isDown || wasd.A.isDown,
      right: this.cursors.right.isDown || wasd.D.isDown,
      up: this.cursors.up.isDown || wasd.W.isDown,
      down: this.cursors.down.isDown || wasd.S.isDown,
    });

    // Touch direction takes precedence if active, otherwise use keyboard
    const direction = this.touchDirection ?? keyDirection;

    // Move player via Grid Engine
    if (direction) {
      this.gridEngine.move('player', direction);
    }

    // --- Idle Animation ---
    if (!this.gridEngine.isMoving('player')) {
      const facing = this.gridEngine.getFacingDirection('player');
      this.player.playIdleAnimation(facing);
    }
  }

  /**
   * Build current GameState and auto-save. Emits SAVE_ICON_SHOW on success.
   */
  private performAutoSave(): void {
    if (!this.saveManager || !this.questManager || !this.inventoryManager) return;

    const playerState = this.registry.get('playerState') as PlayerState;
    if (!playerState) return;

    const currentPos = this.gridEngine
      ? this.gridEngine.getPosition('player')
      : playerState.position;

    const gameState: GameState = {
      version: 1,
      timestamp: Date.now(),
      player: {
        name: playerState.name,
        gender: playerState.gender,
        position: currentPos,
        facing: this.gridEngine
          ? this.gridEngine.getFacingDirection('player')
          : playerState.facing,
        isRunning: playerState.isRunning,
        currentZone: 'mg-road',
        isInInterior: this.isInInterior,
        interiorId: this.isInInterior ? this.sceneMode.interiorId : undefined,
      },
      quests: this.questManager.getState(),
      inventory: this.inventoryManager.getState(),
      discovery: {
        zones: ['mg-road'],
        landmarks: [],
        npcsMetIds: [...this.npcsMetIds],
        collectedPickupIds: [...this.collectedPickupIds],
      },
      settings: {
        musicVolume: 100,
        sfxVolume: 100,
        runDefault: false,
      },
    };

    if (this.saveManager.save(gameState)) {
      eventsCenter.emit(EVENTS.SAVE_ICON_SHOW);
    }
  }

  /**
   * Manual save triggered from pause menu. Same as auto-save but emits
   * GAME_SAVED so UIScene can show feedback with the correct timestamp.
   */
  private performManualSave(): void {
    if (!this.saveManager || !this.questManager || !this.inventoryManager) return;

    const playerState = this.registry.get('playerState') as PlayerState;
    if (!playerState) return;

    const currentPos = this.gridEngine
      ? this.gridEngine.getPosition('player')
      : playerState.position;

    const gameState: GameState = {
      version: 1,
      timestamp: Date.now(),
      player: {
        name: playerState.name,
        gender: playerState.gender,
        position: currentPos,
        facing: this.gridEngine
          ? this.gridEngine.getFacingDirection('player')
          : playerState.facing,
        isRunning: playerState.isRunning,
        currentZone: 'mg-road',
        isInInterior: this.isInInterior,
        interiorId: this.isInInterior ? this.sceneMode.interiorId : undefined,
      },
      quests: this.questManager.getState(),
      inventory: this.inventoryManager.getState(),
      discovery: {
        zones: ['mg-road'],
        landmarks: [],
        npcsMetIds: [...this.npcsMetIds],
        collectedPickupIds: [...this.collectedPickupIds],
      },
      settings: {
        musicVolume: 100,
        sfxVolume: 100,
        runDefault: false,
      },
    };

    if (this.saveManager.save(gameState)) {
      eventsCenter.emit(EVENTS.SAVE_ICON_SHOW);
      eventsCenter.emit(EVENTS.GAME_SAVED, { timestamp: gameState.timestamp });
    }
  }

  shutdown(): void {
    // Clean up eventsCenter listeners (global emitter — NOT cleared by Phaser's scene cleanup).
    // Use handler references so we only remove OUR listeners, not UIScene's.
    const h = this.boundHandlers;
    if (h.touchDirection) eventsCenter.off(EVENTS.TOUCH_DIRECTION, h.touchDirection);
    if (h.runButtonDown) eventsCenter.off(EVENTS.RUN_BUTTON_DOWN, h.runButtonDown);
    if (h.runButtonUp) eventsCenter.off(EVENTS.RUN_BUTTON_UP, h.runButtonUp);
    if (h.movementFreeze) eventsCenter.off(EVENTS.MOVEMENT_FREEZE, h.movementFreeze);
    if (h.dialogueOpen) eventsCenter.off(EVENTS.DIALOGUE_OPEN, h.dialogueOpen);
    if (h.dialogueClose) eventsCenter.off(EVENTS.DIALOGUE_CLOSE, h.dialogueClose);
    if (h.touchAction) eventsCenter.off(EVENTS.TOUCH_ACTION, h.touchAction);
    if (h.dialogueChoice) eventsCenter.off(EVENTS.DIALOGUE_CHOICE, h.dialogueChoice);
    if (h.npcInteract) eventsCenter.off(EVENTS.NPC_INTERACT, h.npcInteract);
    if (h.buildingEnter) eventsCenter.off(EVENTS.BUILDING_ENTER, h.buildingEnter);
    if (h.buildingExit) eventsCenter.off(EVENTS.BUILDING_EXIT, h.buildingExit);
    if (h.saveGame) eventsCenter.off(EVENTS.SAVE_GAME, h.saveGame);
    this.boundHandlers = {};

    // Clear system manager references — Phaser's DisplayList.shutdown() already
    // destroys all game objects (sprites, etc.), so we only need to clear internal
    // state (like AutoRickshawManager.autos) to prevent update() from calling
    // gridEngine.getPosition() on characters that no longer exist after restart.
    this.autoRickshawManager?.destroy();
    this.npcManager?.destroy();
    this.itemPickups = [];
  }
}
