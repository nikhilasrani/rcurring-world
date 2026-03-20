import Phaser from 'phaser';
import { Direction, NumberOfDirections } from 'grid-engine';
import { Player, getMovementDirection } from '../entities/Player';
import { NPCManager } from '../systems/NPCManager';
import { InteractionSystem } from '../systems/InteractionSystem';
import { ZoneManager } from '../systems/ZoneManager';
import { TransitionManager } from '../systems/TransitionManager';
import { InteractionPrompt } from '../ui/InteractionPrompt';
import { eventsCenter } from '../utils/EventsCenter';
import {
  SCENES,
  ASSETS,
  LAYERS,
  TILE_SIZE,
  COLLISION_PROPERTY,
  EVENTS,
  GAME_WIDTH,
  GAME_HEIGHT,
} from '../utils/constants';
import type { PlayerState, NPCDef, SignDef, InteriorDef, LandmarkDef } from '../utils/types';

// NPC data (imported as JSON modules via Vite)
import chaiWallaData from '../data/npcs/chai-walla.json';
import autoDriverData from '../data/npcs/auto-driver.json';
import joggerData from '../data/npcs/jogger.json';
import shopkeeperData from '../data/npcs/shopkeeper.json';
import guardData from '../data/npcs/guard.json';

// Sign data
import signsData from '../data/signs/signs.json';

// Interior metadata
import metroInterior from '../data/interiors/metro-station.json';
import coffeeInterior from '../data/interiors/coffee-shop.json';
import ubcityInterior from '../data/interiors/ub-city-mall.json';
import libraryInterior from '../data/interiors/cubbon-library.json';

// Zone data
import zoneData from '../data/zones/mg-road.json';

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
  private gridEngine!: any; // Grid Engine plugin (typed via scene mapping)
  private touchDirection: Direction | null = null;
  private runButtonHeld = false;

  // Phase 2 systems
  private npcManager!: NPCManager;
  private interactionSystem!: InteractionSystem;
  private zoneManager!: ZoneManager;
  private transitionManager!: TransitionManager;
  private interactionPrompt!: InteractionPrompt;
  private movementFrozen = false;
  private isInInterior = false;
  private sceneMode: SceneModeData = { mode: 'outdoor' };

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
    // Reset state for scene restart
    this.movementFrozen = false;

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

    // --- Touch Input (from UIScene via EventsCenter) ---
    eventsCenter.on(EVENTS.TOUCH_DIRECTION, (dir: Direction | null) => {
      this.touchDirection = dir;
    });
    eventsCenter.on(EVENTS.RUN_BUTTON_DOWN, () => {
      this.runButtonHeld = true;
    });
    eventsCenter.on(EVENTS.RUN_BUTTON_UP, () => {
      this.runButtonHeld = false;
    });

    // === Phase 2: NPC, Interaction, Zone, and Transition Systems ===

    // Spawn NPCs
    const npcDefs = [
      chaiWallaData,
      autoDriverData,
      joggerData,
      shopkeeperData,
      guardData,
    ] as NPCDef[];
    this.npcManager = new NPCManager();
    this.npcManager.spawnAll(this, this.gridEngine, npcDefs);

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

    // Movement freeze listener
    eventsCenter.on(EVENTS.MOVEMENT_FREEZE, (freeze: boolean) => {
      this.movementFrozen = freeze;
    });
    eventsCenter.on(EVENTS.DIALOGUE_OPEN, () => {
      this.movementFrozen = true;
    });
    eventsCenter.on(EVENTS.DIALOGUE_CLOSE, () => {
      this.movementFrozen = false;
      // Resume NPC patrol if one was stopped
      const lastInteractedNPC = this.registry.get('lastInteractedNPC') as
        | string
        | undefined;
      if (lastInteractedNPC) {
        this.npcManager.resumeNPCPatrol(this.gridEngine, lastInteractedNPC);
        this.registry.remove('lastInteractedNPC');
      }
    });

    // Action button handler (keyboard)
    this.input.keyboard?.on('keydown-ENTER', () => this.handleAction());
    this.input.keyboard?.on('keydown-SPACE', () => this.handleAction());

    // Action button handler (touch -- from EventsCenter)
    eventsCenter.on(EVENTS.TOUCH_ACTION, () => {
      this.handleAction();
    });

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

    // Add interior tileset with extrusion margins (margin: 1, spacing: 2)
    const interiorTileset = tilemap.addTilesetImage(
      'interior',
      ASSETS.TILESET_INTERIOR,
      TILE_SIZE,
      TILE_SIZE,
      1,
      2
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

    this.cameras.main.setBounds(0, 0, interiorPixelW, interiorPixelH);
    this.cameras.main.setRoundPixels(true);

    // For small interiors that fit on screen, center the camera instead of following
    if (interiorPixelW <= GAME_WIDTH && interiorPixelH <= GAME_HEIGHT) {
      this.cameras.main.stopFollow();
      this.cameras.main.centerOn(interiorPixelW / 2, interiorPixelH / 2);
    } else {
      this.cameras.main.startFollow(this.player.sprite, true);
    }

    // --- Keyboard Input ---
    this.cursors = this.input.keyboard!.createCursorKeys();

    // --- Touch Input ---
    eventsCenter.on(EVENTS.TOUCH_DIRECTION, (dir: Direction | null) => {
      this.touchDirection = dir;
    });
    eventsCenter.on(EVENTS.RUN_BUTTON_DOWN, () => {
      this.runButtonHeld = true;
    });
    eventsCenter.on(EVENTS.RUN_BUTTON_UP, () => {
      this.runButtonHeld = false;
    });

    // --- Transition Manager for exit handling ---
    this.transitionManager = new TransitionManager(this);
    // Set the outdoor return state so exitBuilding() works
    this.transitionManager.enterBuilding({
      id: mode.interiorId!,
      name: mode.interiorId!,
      displayName: mode.interiorDisplayName!,
      tilemapKey: mode.interiorKey!,
      tilesetKey: mode.tilesetKey!,
      doorPosition: { x: 0, y: 0 }, // not needed for exit
      playerSpawn: mode.playerSpawn!,
      exitPosition: { x: 0, y: 0 }, // not needed here
      returnPosition: mode.returnPosition!,
      size: mode.interiorSize!,
    } as any);
    // Immediately clear the transitioning flag since we're already in the interior
    this.transitionManager.setTransitionComplete();

    // Movement freeze listener
    eventsCenter.on(EVENTS.MOVEMENT_FREEZE, (freeze: boolean) => {
      this.movementFrozen = freeze;
    });

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
    if (this.isInInterior) return;
    if (!this.interactionSystem) return;

    const target = this.interactionSystem.checkInteraction(
      this.gridEngine,
      'player'
    );
    if (!target) return;

    if (target.type === 'npc') {
      const npcData = this.npcManager.getNPCData(target.id);
      if (!npcData) return;

      // Stop NPC patrol and face player
      this.npcManager.stopNPCPatrol(this.gridEngine, target.id);
      const playerFacing = this.gridEngine.getFacingDirection('player');
      const oppositeDir = this.getOppositeDirection(playerFacing);
      this.gridEngine.turnTowards(target.id, oppositeDir);
      this.registry.set('lastInteractedNPC', target.id);

      // Trigger dialogue in UIScene
      eventsCenter.emit(EVENTS.NPC_INTERACT, npcData.dialogue);
    } else if (target.type === 'sign') {
      const signData = this.interactionSystem.getSignData(target.id);
      if (!signData) return;
      eventsCenter.emit(EVENTS.SIGN_INTERACT, signData.dialogue);
    } else if (target.type === 'door') {
      const interiorData = this.interactionSystem.getInteriorData(target.id);
      if (!interiorData) return;
      this.transitionManager.enterBuilding(interiorData);
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

    // Determine direction from keyboard
    const keyDirection = getMovementDirection({
      left: this.cursors.left.isDown,
      right: this.cursors.right.isDown,
      up: this.cursors.up.isDown,
      down: this.cursors.down.isDown,
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

  shutdown(): void {
    // Clean up event listeners to prevent memory leaks
    eventsCenter.off(EVENTS.TOUCH_DIRECTION);
    eventsCenter.off(EVENTS.RUN_BUTTON_DOWN);
    eventsCenter.off(EVENTS.RUN_BUTTON_UP);
    eventsCenter.off(EVENTS.MOVEMENT_FREEZE);
    eventsCenter.off(EVENTS.DIALOGUE_OPEN);
    eventsCenter.off(EVENTS.DIALOGUE_CLOSE);
    eventsCenter.off(EVENTS.TOUCH_ACTION);
    this.npcManager?.destroy();
    this.interactionPrompt?.destroy();
    this.player?.destroy();
  }
}
