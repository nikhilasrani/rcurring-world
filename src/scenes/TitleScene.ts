import Phaser from 'phaser';
import { SCENES } from '../utils/constants';
import { SaveManager } from '../systems/SaveManager';
import { AudioManager } from '../systems/AudioManager';

/**
 * TitleScene: Shows the game title over a pixel art Bengaluru skyline.
 * Phase 3: Shows CONTINUE + NEW GAME menu with save detection.
 *
 * CONTINUE is greyed out (#666666) when no save exists.
 * NEW GAME shows overwrite warning when a save exists.
 * Cursor ">" in #E8B830 gold indicates selected option.
 */
export class TitleScene extends Phaser.Scene {
  private started = false;
  private saveManager!: SaveManager;
  private hasSave = false;

  // Menu state
  private selectedIndex = 0;
  private menuTexts: Phaser.GameObjects.Text[] = [];
  private cursorText!: Phaser.GameObjects.Text;

  // Overwrite warning state
  private showingOverwriteWarning = false;
  private warningTexts: Phaser.GameObjects.Text[] = [];
  private warningCursorText!: Phaser.GameObjects.Text;
  private warningSelectedIndex = 0;

  constructor() {
    super({ key: SCENES.TITLE });
  }

  create(): void {
    this.started = false;
    this.showingOverwriteWarning = false;
    this.selectedIndex = 0;
    this.warningSelectedIndex = 0;
    this.menuTexts = [];
    this.warningTexts = [];

    // Check for existing save
    this.saveManager = new SaveManager();
    this.hasSave = this.saveManager.hasSave();

    // Initialize AudioManager if not already in registry (first boot)
    let audioManager = this.registry.get('audioManager') as AudioManager | undefined;
    if (!audioManager) {
      audioManager = new AudioManager(this);
      this.registry.set('audioManager', audioManager);
    } else {
      audioManager.setScene(this);
    }

    // Load volume settings from saved game if available
    if (this.hasSave) {
      const loadedState = this.saveManager.load();
      if (loadedState?.settings) {
        audioManager.loadSettings({
          musicVolume: loadedState.settings.musicVolume <= 1 ? loadedState.settings.musicVolume : loadedState.settings.musicVolume / 100,
          sfxVolume: loadedState.settings.sfxVolume <= 1 ? loadedState.settings.sfxVolume : loadedState.settings.sfxVolume / 100,
        });
      }
    }

    // Start title BGM — defer if AudioContext is locked (Chrome autoplay policy)
    if (this.sound.locked) {
      this.sound.once('unlocked', () => {
        audioManager!.startTitleMusic();
      });
    } else {
      audioManager.startTitleMusic();
    }

    const { width } = this.scale.gameSize;

    // Title background image (pixel art Bengaluru skyline)
    const bg = this.add.image(width / 2, 160, 'title-bg');
    bg.setOrigin(0.5, 0.5);

    // Game title text
    this.add.text(width / 2, 80, 'RECURRING WORLD', {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5, 0.5);

    // Subtitle
    this.add.text(width / 2, 108, 'Bengaluru Explorer', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#c8c8c8',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5, 0.5);

    // === Menu items ===
    const menuX = width / 2;
    const menuY = 228;
    const menuSpacing = 24;

    // CONTINUE option
    const continueText = this.add.text(menuX, menuY, 'CONTINUE', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: this.hasSave ? '#FFFFFF' : '#666666',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5, 0.5);
    continueText.setInteractive({ useHandCursor: this.hasSave });
    continueText.on('pointerdown', () => {
      if (this.hasSave) {
        this.selectedIndex = 0;
        this.updateCursor();
        this.confirmSelection();
      }
    });
    this.menuTexts.push(continueText);

    // NEW GAME option
    const newGameText = this.add.text(menuX, menuY + menuSpacing, 'NEW GAME', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5, 0.5);
    newGameText.setInteractive({ useHandCursor: true });
    newGameText.on('pointerdown', () => {
      this.selectedIndex = 1;
      this.updateCursor();
      this.confirmSelection();
    });
    this.menuTexts.push(newGameText);

    // Cursor ">" indicator
    this.cursorText = this.add.text(0, 0, '>', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#E8B830',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5, 0.5);

    // Default selection: CONTINUE if save exists, otherwise NEW GAME
    this.selectedIndex = this.hasSave ? 0 : 1;
    this.updateCursor();

    // === Overwrite warning text (hidden initially) ===
    const warningY = menuY + menuSpacing * 2 + 16;

    const warningMsg = this.add.text(menuX, warningY, 'This will overwrite your saved game.', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#FF6666',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5, 0.5);
    warningMsg.setVisible(false);
    this.warningTexts.push(warningMsg);

    const yesText = this.add.text(menuX, warningY + 20, 'Yes, start new', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5, 0.5);
    yesText.setVisible(false);
    yesText.setInteractive({ useHandCursor: true });
    yesText.on('pointerdown', () => {
      this.warningSelectedIndex = 0;
      this.confirmOverwriteSelection();
    });
    this.warningTexts.push(yesText);

    const noText = this.add.text(menuX, warningY + 40, 'No, go back', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5, 0.5);
    noText.setVisible(false);
    noText.setInteractive({ useHandCursor: true });
    noText.on('pointerdown', () => {
      this.warningSelectedIndex = 1;
      this.confirmOverwriteSelection();
    });
    this.warningTexts.push(noText);

    // Warning cursor
    this.warningCursorText = this.add.text(0, 0, '>', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#E8B830',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5, 0.5);
    this.warningCursorText.setVisible(false);

    // === Keyboard input ===
    this.input.keyboard?.on('keydown-UP', () => {
      if (this.showingOverwriteWarning) {
        if (this.warningSelectedIndex > 0) {
          this.warningSelectedIndex--;
          this.updateWarningCursor();
        }
      } else {
        this.navigateMenu(-1);
      }
    });

    this.input.keyboard?.on('keydown-DOWN', () => {
      if (this.showingOverwriteWarning) {
        if (this.warningSelectedIndex < 1) {
          this.warningSelectedIndex++;
          this.updateWarningCursor();
        }
      } else {
        this.navigateMenu(1);
      }
    });

    this.input.keyboard?.on('keydown-ENTER', () => {
      if (this.showingOverwriteWarning) {
        this.confirmOverwriteSelection();
      } else {
        this.confirmSelection();
      }
    });

    this.input.keyboard?.on('keydown-SPACE', () => {
      if (this.showingOverwriteWarning) {
        this.confirmOverwriteSelection();
      } else {
        this.confirmSelection();
      }
    });
  }

  /** Navigate menu up/down, skipping CONTINUE if no save. */
  private navigateMenu(delta: number): void {
    const newIndex = this.selectedIndex + delta;
    if (newIndex < 0 || newIndex > 1) return;

    // Skip CONTINUE if no save exists
    if (newIndex === 0 && !this.hasSave) return;

    this.selectedIndex = newIndex;
    this.updateCursor();
  }

  /** Update cursor position next to selected menu item. */
  private updateCursor(): void {
    const selected = this.menuTexts[this.selectedIndex];
    this.cursorText.setPosition(
      selected.x - selected.width / 2 - 12,
      selected.y,
    );
  }

  /** Update warning cursor position. */
  private updateWarningCursor(): void {
    // warningTexts[1] = "Yes", warningTexts[2] = "No"
    const selected = this.warningTexts[this.warningSelectedIndex + 1];
    this.warningCursorText.setPosition(
      selected.x - selected.width / 2 - 8,
      selected.y,
    );
  }

  /** Confirm the current menu selection. */
  private confirmSelection(): void {
    if (this.selectedIndex === 0 && this.hasSave) {
      // CONTINUE: load save and start game
      this.loadAndStart();
    } else if (this.selectedIndex === 1) {
      // NEW GAME
      if (this.hasSave) {
        // Show overwrite warning
        this.showOverwriteWarning();
      } else {
        // No save, go directly to name entry
        this.startNewGame();
      }
    }
  }

  /** Show the overwrite warning sub-menu. */
  private showOverwriteWarning(): void {
    this.showingOverwriteWarning = true;
    this.warningSelectedIndex = 0;
    for (const t of this.warningTexts) {
      t.setVisible(true);
    }
    this.warningCursorText.setVisible(true);
    this.updateWarningCursor();
  }

  /** Hide the overwrite warning sub-menu. */
  private hideOverwriteWarning(): void {
    this.showingOverwriteWarning = false;
    for (const t of this.warningTexts) {
      t.setVisible(false);
    }
    this.warningCursorText.setVisible(false);
  }

  /** Confirm overwrite warning selection. */
  private confirmOverwriteSelection(): void {
    if (this.warningSelectedIndex === 0) {
      // Yes, start new - delete save and start
      this.saveManager.deleteSave();
      this.startNewGame();
    } else {
      // No, go back
      this.hideOverwriteWarning();
    }
  }

  /** Load saved game and start WorldScene. */
  private loadAndStart(): void {
    if (this.started) return;
    this.started = true;

    const loadedState = this.saveManager.load();
    if (loadedState) {
      // Store loaded state in registry for WorldScene to consume
      this.registry.set('loadedGameState', loadedState);

      // Set player state from save
      this.registry.set('playerState', {
        name: loadedState.player.name,
        gender: loadedState.player.gender,
        position: loadedState.player.position,
        facing: loadedState.player.facing,
        isRunning: loadedState.player.isRunning,
      });

      // Stop title music before transitioning
      const audioManager = this.registry.get('audioManager') as AudioManager | undefined;
      audioManager?.stopTitleMusic();

      this.scene.start(SCENES.WORLD);
    }
  }

  /** Start a new game via NameEntryScene. */
  private startNewGame(): void {
    if (this.started) return;
    this.started = true;

    // Stop title music before transitioning
    const audioManager = this.registry.get('audioManager') as AudioManager | undefined;
    audioManager?.stopTitleMusic();

    this.scene.start(SCENES.NAME_ENTRY);
  }
}
