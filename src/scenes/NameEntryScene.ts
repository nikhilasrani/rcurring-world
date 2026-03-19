import Phaser from 'phaser';
import { Direction } from 'grid-engine';
import InputText from 'phaser3-rex-plugins/plugins/inputtext.js';
import {
  SCENES,
  ASSETS,
  GAME_WIDTH,
} from '../utils/constants.ts';
import type { PlayerState } from '../utils/types.ts';

/**
 * NameEntryScene: Player enters their name via HTML text input (triggers mobile keyboard)
 * and selects their character gender by choosing between two chibi sprites.
 * Passes a complete PlayerState to WorldScene on confirm.
 */
export class NameEntryScene extends Phaser.Scene {
  private playerName = '';
  private selectedGender: 'male' | 'female' = 'male';
  private maleSprite!: Phaser.GameObjects.Sprite;
  private femaleSprite!: Phaser.GameObjects.Sprite;
  private selectionBox!: Phaser.GameObjects.Graphics;
  private confirmed = false;

  constructor() {
    super({ key: SCENES.NAME_ENTRY });
  }

  create(): void {
    this.confirmed = false;
    this.playerName = '';
    this.selectedGender = 'male';

    // Black background
    this.cameras.main.setBackgroundColor('#000000');

    // === Name Entry Section ===

    // Prompt text
    this.add.text(GAME_WIDTH / 2, 60, "What's your name?", {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#ffffff',
    }).setOrigin(0.5, 0.5);

    // HTML text input via Rex InputText (triggers mobile keyboard)
    const inputText = new InputText(this, GAME_WIDTH / 2, 100, 200, 30, {
      type: 'text',
      placeholder: 'Enter name...',
      maxLength: 12,
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#ffffff',
      backgroundColor: '#333333',
      borderColor: '#888888',
      border: 2,
      align: 'center',
    });
    this.add.existing(inputText);

    inputText.on('textchange', (input: InputText) => {
      this.playerName = input.text;
    });

    // === Gender Selection Section ===

    this.add.text(GAME_WIDTH / 2, 160, 'Choose your character:', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#c8c8c8',
    }).setOrigin(0.5, 0.5);

    // Male sprite (idle facing down = frame 1)
    const maleX = GAME_WIDTH / 2 - 40;
    const femaleX = GAME_WIDTH / 2 + 40;
    const spriteY = 200;

    this.maleSprite = this.add.sprite(maleX, spriteY, ASSETS.SPRITE_PLAYER_MALE, 1);
    this.maleSprite.setScale(2); // Scale up for visibility
    this.maleSprite.setInteractive({ useHandCursor: true });
    this.maleSprite.on('pointerdown', () => this.selectGender('male'));

    // Male label
    this.add.text(maleX, spriteY + 30, 'Boy', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#aaaaaa',
    }).setOrigin(0.5, 0.5);

    // Female sprite (idle facing down = frame 1)
    this.femaleSprite = this.add.sprite(femaleX, spriteY, ASSETS.SPRITE_PLAYER_FEMALE, 1);
    this.femaleSprite.setScale(2);
    this.femaleSprite.setInteractive({ useHandCursor: true });
    this.femaleSprite.on('pointerdown', () => this.selectGender('female'));

    // Female label
    this.add.text(femaleX, spriteY + 30, 'Girl', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#aaaaaa',
    }).setOrigin(0.5, 0.5);

    // Selection highlight box
    this.selectionBox = this.add.graphics();
    this.drawSelectionBox();

    // Arrow key left/right to switch selection
    this.input.keyboard?.on('keydown-LEFT', () => this.selectGender('male'));
    this.input.keyboard?.on('keydown-RIGHT', () => this.selectGender('female'));

    // === Confirm Section ===

    const goText = this.add.text(GAME_WIDTH / 2, 270, '[ PRESS ENTER TO START ]', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#48a868',
    }).setOrigin(0.5, 0.5);
    goText.setInteractive({ useHandCursor: true });
    goText.on('pointerdown', () => this.confirmSelection());

    // Subtle blink on the GO text
    this.tweens.add({
      targets: goText,
      alpha: { from: 1.0, to: 0.5 },
      duration: 1000,
      yoyo: true,
      repeat: -1,
    });

    // Enter key to confirm
    this.input.keyboard?.on('keydown-ENTER', () => this.confirmSelection());
  }

  private selectGender(gender: 'male' | 'female'): void {
    this.selectedGender = gender;
    this.drawSelectionBox();
  }

  private drawSelectionBox(): void {
    this.selectionBox.clear();
    this.selectionBox.lineStyle(2, 0xffffff, 1);

    const targetSprite = this.selectedGender === 'male' ? this.maleSprite : this.femaleSprite;
    const boxSize = 36; // Slightly larger than scaled sprite
    this.selectionBox.strokeRect(
      targetSprite.x - boxSize / 2,
      targetSprite.y - boxSize / 2,
      boxSize,
      boxSize,
    );
  }

  private confirmSelection(): void {
    if (this.confirmed) return;
    this.confirmed = true;

    // Default name if empty
    const name = this.playerName.trim() || 'Explorer';

    // Build PlayerState
    const playerState: PlayerState = {
      name,
      gender: this.selectedGender,
      position: { x: 30, y: 45 }, // MG Road Metro station exit
      facing: Direction.DOWN,
      isRunning: false,
    };

    // Store in registry for global access
    this.registry.set('playerState', playerState);

    // Transition to WorldScene with player state as data
    this.scene.start(SCENES.WORLD, playerState);
  }
}
