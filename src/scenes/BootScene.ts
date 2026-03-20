import Phaser from 'phaser';
import {
  SCENES,
  ASSETS,
  GAME_HEIGHT,
  PLAYER_FRAME_WIDTH,
  PLAYER_FRAME_HEIGHT,
  NPC_FRAME_WIDTH,
  NPC_FRAME_HEIGHT,
} from '../utils/constants.ts';

/**
 * BootScene: First scene to run. Loads all game assets and shows a loading progress bar.
 * Transitions to TitleScene when loading is complete.
 *
 * On init, resizes the game canvas width to match the viewport aspect ratio.
 * This eliminates letterboxing while keeping FIT mode (no cropping).
 * Height stays fixed at GAME_HEIGHT (320) so UI anchored to bottom always works.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.BOOT });
  }

  init(): void {
    // Match game aspect ratio to viewport — eliminates letterbox bars
    this.matchViewportAspectRatio();
    this.scale.on('resize', () => this.matchViewportAspectRatio());
  }

  private matchViewportAspectRatio(): void {
    const parent = this.scale.parent as HTMLElement;
    if (!parent || !parent.clientWidth || !parent.clientHeight) return;
    const ratio = parent.clientWidth / parent.clientHeight;
    const newWidth = Math.round(GAME_HEIGHT * ratio);
    if (newWidth !== this.scale.gameSize.width) {
      this.scale.resize(newWidth, GAME_HEIGHT);
    }
  }

  preload(): void {
    // === Loading progress bar ===
    const { width, height } = this.cameras.main;
    const barWidth = 200;
    const barHeight = 16;
    const barX = (width - barWidth) / 2;
    const barY = height / 2;

    // Background bar (dark outline)
    const barBg = this.add.graphics();
    barBg.fillStyle(0x222222, 1);
    barBg.fillRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);

    // Progress bar (fills as assets load)
    const progressBar = this.add.graphics();

    // Loading text
    const loadingText = this.add.text(width / 2, barY - 24, 'Loading...', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#cccccc',
    });
    loadingText.setOrigin(0.5, 0.5);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0x48a868, 1); // GBA green
      progressBar.fillRect(barX, barY, barWidth * value, barHeight);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      barBg.destroy();
      loadingText.destroy();
    });

    // === Load assets ===

    // Player spritesheets
    this.load.spritesheet(ASSETS.SPRITE_PLAYER_MALE, 'assets/sprites/player-male.png', {
      frameWidth: PLAYER_FRAME_WIDTH,
      frameHeight: PLAYER_FRAME_HEIGHT,
    });
    this.load.spritesheet(ASSETS.SPRITE_PLAYER_FEMALE, 'assets/sprites/player-female.png', {
      frameWidth: PLAYER_FRAME_WIDTH,
      frameHeight: PLAYER_FRAME_HEIGHT,
    });

    // Title background
    this.load.image('title-bg', 'assets/ui/title-bg.png');

    // Tilemap and tilesets -- conditional, may not exist yet (plan 03 creates them)
    // Load inside a try/catch-style approach: if file doesn't exist, Phaser logs a warning
    // but continues. We handle the loaderror event below.
    this.load.tilemapTiledJSON(ASSETS.TILEMAP_MG_ROAD, 'assets/tilemaps/mg-road.json');
    this.load.image(ASSETS.TILESET_GROUND, 'assets/tilesets/ground.png');
    this.load.image(ASSETS.TILESET_BUILDINGS, 'assets/tilesets/buildings.png');
    this.load.image(ASSETS.TILESET_NATURE, 'assets/tilesets/nature.png');
    this.load.image(ASSETS.TILESET_DECORATIONS, 'assets/tilesets/decorations.png');

    // UI assets (touch controls)
    this.load.image(ASSETS.UI_JOYSTICK_BASE, 'assets/ui/joystick-base.png');
    this.load.image(ASSETS.UI_JOYSTICK_THUMB, 'assets/ui/joystick-thumb.png');
    this.load.image(ASSETS.UI_BUTTON_A, 'assets/ui/button-a.png');
    this.load.image(ASSETS.UI_BUTTON_B, 'assets/ui/button-b.png');

    // NPC spritesheets (same frame size as player)
    this.load.spritesheet(ASSETS.SPRITE_NPC_CHAI_WALLA, 'assets/sprites/npc-chai-walla.png', {
      frameWidth: NPC_FRAME_WIDTH, frameHeight: NPC_FRAME_HEIGHT,
    });
    this.load.spritesheet(ASSETS.SPRITE_NPC_AUTO_DRIVER, 'assets/sprites/npc-auto-driver.png', {
      frameWidth: NPC_FRAME_WIDTH, frameHeight: NPC_FRAME_HEIGHT,
    });
    this.load.spritesheet(ASSETS.SPRITE_NPC_JOGGER, 'assets/sprites/npc-jogger.png', {
      frameWidth: NPC_FRAME_WIDTH, frameHeight: NPC_FRAME_HEIGHT,
    });
    this.load.spritesheet(ASSETS.SPRITE_NPC_SHOPKEEPER, 'assets/sprites/npc-shopkeeper.png', {
      frameWidth: NPC_FRAME_WIDTH, frameHeight: NPC_FRAME_HEIGHT,
    });
    this.load.spritesheet(ASSETS.SPRITE_NPC_GUARD, 'assets/sprites/npc-guard.png', {
      frameWidth: NPC_FRAME_WIDTH, frameHeight: NPC_FRAME_HEIGHT,
    });

    // Interior tileset and tilemaps
    this.load.image(ASSETS.TILESET_INTERIOR, 'assets/tilesets/interior.png');
    this.load.tilemapTiledJSON(ASSETS.TILEMAP_INTERIOR_METRO, 'assets/tilemaps/interior-metro.json');
    this.load.tilemapTiledJSON(ASSETS.TILEMAP_INTERIOR_COFFEE, 'assets/tilemaps/interior-coffee.json');
    this.load.tilemapTiledJSON(ASSETS.TILEMAP_INTERIOR_UBCITY, 'assets/tilemaps/interior-ubcity.json');
    this.load.tilemapTiledJSON(ASSETS.TILEMAP_INTERIOR_LIBRARY, 'assets/tilemaps/interior-library.json');

    // Zone metadata
    this.load.json('zone-mg-road', 'data/zones/mg-road.json');

    // Handle load errors gracefully (missing assets are expected until later plans)
    this.load.on('loaderror', (fileObj: Phaser.Loader.File) => {
      console.warn(`[BootScene] Failed to load: ${fileObj.key} (${fileObj.url}) -- may not exist yet`);
    });
  }

  create(): void {
    this.scene.start(SCENES.TITLE);
  }
}
