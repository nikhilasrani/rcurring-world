import Phaser from 'phaser';
import {
  SCENES,
  ASSETS,
  PLAYER_FRAME_WIDTH,
  PLAYER_FRAME_HEIGHT,
} from '../utils/constants.ts';

/**
 * BootScene: First scene to run. Loads all game assets and shows a loading progress bar.
 * Transitions to TitleScene when loading is complete.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.BOOT });
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
