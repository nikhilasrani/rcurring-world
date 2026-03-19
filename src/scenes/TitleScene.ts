import Phaser from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT } from '../utils/constants.ts';

/**
 * TitleScene: Shows the game title over a pixel art Bengaluru skyline.
 * "Press Start" prompt blinks. Any key or tap transitions to NameEntryScene.
 */
export class TitleScene extends Phaser.Scene {
  private started = false;

  constructor() {
    super({ key: SCENES.TITLE });
  }

  create(): void {
    this.started = false;

    // Title background image (pixel art Bengaluru skyline)
    const bg = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'title-bg');
    bg.setOrigin(0.5, 0.5);

    // Game title text
    this.add.text(GAME_WIDTH / 2, 80, 'RECURRING WORLD', {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5, 0.5);

    // Subtitle
    this.add.text(GAME_WIDTH / 2, 108, 'Bengaluru Explorer', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#c8c8c8',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5, 0.5);

    // "Press Start" prompt with blinking animation
    const pressStart = this.add.text(GAME_WIDTH / 2, 240, 'PRESS START', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5, 0.5);

    this.tweens.add({
      targets: pressStart,
      alpha: { from: 1.0, to: 0.3 },
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    // Listen for any key press or any pointer down to start
    this.input.keyboard?.on('keydown', () => this.startGame());
    this.input.on('pointerdown', () => this.startGame());
  }

  private startGame(): void {
    // Prevent double transitions
    if (this.started) return;
    this.started = true;

    this.scene.start(SCENES.NAME_ENTRY);
  }
}
