import Phaser from 'phaser';
import { Direction, NumberOfDirections } from 'grid-engine';
import { Player, getMovementDirection } from '../entities/Player';
import { eventsCenter } from '../utils/EventsCenter';
import {
  SCENES,
  ASSETS,
  LAYERS,
  TILE_SIZE,
  COLLISION_PROPERTY,
  EVENTS,
} from '../utils/constants';
import type { PlayerState } from '../utils/types';

/**
 * WorldScene: Main gameplay scene.
 * Loads the tilemap, initializes Grid Engine for tile-locked movement,
 * creates the player entity, sets up camera follow with bounds,
 * processes keyboard + touch input for 4-direction movement,
 * toggles walk/run speed, and triggers idle animation when stationary.
 */
export class WorldScene extends Phaser.Scene {
  private player!: Player;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private gridEngine!: any; // Grid Engine plugin (typed via scene mapping)
  private touchDirection: Direction | null = null;
  private runButtonHeld = false;

  constructor() {
    super({ key: SCENES.WORLD });
  }

  init(data: PlayerState): void {
    // Receive player state from NameEntryScene or from registry
    const playerState = data?.name
      ? data
      : (this.registry.get('playerState') as PlayerState);

    if (playerState) {
      this.registry.set('playerState', playerState);
    }
  }

  create(): void {
    const playerState = (this.registry.get('playerState') as PlayerState) || {
      name: 'Explorer',
      gender: 'male' as const,
      position: { x: 45, y: 35 },
      facing: Direction.DOWN,
      isRunning: false,
    };

    // --- Create Tilemap ---
    const tilemap = this.make.tilemap({ key: ASSETS.TILEMAP_MG_ROAD });

    // Add tilesets with extrusion margins (margin: 1, spacing: 2)
    // The first argument must match the tileset name in the Tiled JSON
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
    // Player sprite depth = 2 (set in Player class)
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

    // --- Launch UIScene (runs in parallel, renders above WorldScene) ---
    // UIScene may not be registered yet (plan 05); guard the launch
    if (this.scene.manager.keys[SCENES.UI]) {
      this.scene.launch(SCENES.UI);
    }

    // Signal that world is ready
    eventsCenter.emit(EVENTS.SCENE_READY, SCENES.WORLD);
  }

  update(): void {
    if (!this.player || !this.gridEngine) return;

    // Determine run state: Shift key OR B button held
    const isRunning = this.cursors.shift?.isDown || this.runButtonHeld;
    const speed = this.player.updateSpeed(isRunning);

    // Update Grid Engine speed at runtime
    try {
      this.gridEngine.setSpeed('player', speed);
    } catch {
      // Fallback: Grid Engine may not have setSpeed() as a public method.
      // If setSpeed() is unavailable, speed changes won't take effect until
      // the character is re-created. Log once and continue.
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
    // When the player is NOT moving, play the idle animation for their facing direction.
    // Grid Engine handles walk animations automatically via walkingAnimationMapping,
    // but idle must be triggered manually.
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
    this.player?.destroy();
  }
}
