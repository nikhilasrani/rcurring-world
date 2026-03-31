import Phaser from 'phaser';

/**
 * SettingsPanel: Volume sliders and run toggle inside PauseMenu.
 *
 * "Music" label + slider bar (120px, #CCCCCC track / #E8B830 fill, 8x8 dot).
 * "SFX" label + slider bar (same style).
 * "Run by default" label + ON/OFF toggle.
 * Sliders respond to keyboard (up/down navigate, left/right adjust) and pointer (click/drag).
 * Volume values are applied to AudioManager on PAUSE_MENU_CLOSE via UIScene.
 */

interface SettingsState {
  musicVolume: number;
  sfxVolume: number;
  runDefault: boolean;
}

export class SettingsPanel {
  private container: Phaser.GameObjects.Container;
  private sliderGraphics: Phaser.GameObjects.Graphics;

  // Labels
  private musicLabel: Phaser.GameObjects.Text;
  private sfxLabel: Phaser.GameObjects.Text;
  private runLabel: Phaser.GameObjects.Text;
  private runToggleText: Phaser.GameObjects.Text;

  // Pointer hit zones for sliders and toggle
  private musicHitZone: Phaser.GameObjects.Zone;
  private sfxHitZone: Phaser.GameObjects.Zone;
  private toggleHitZone: Phaser.GameObjects.Zone;

  // Internal state
  private settings: SettingsState = { musicVolume: 0.7, sfxVolume: 0.7, runDefault: false };
  private selectedItem: number = 0; // 0=music, 1=sfx, 2=runDefault
  private panelX: number;
  private panelY: number;
  private sliderX: number;
  private draggingSlider: 'music' | 'sfx' | null = null;

  private static readonly SLIDER_WIDTH = 120;
  private static readonly ITEM_SPACING = 48;
  private static readonly HIT_HEIGHT = 20; // generous hit area height for pointer

  constructor(scene: Phaser.Scene, x: number, y: number, _width: number, _height: number) {
    this.panelX = x;
    this.panelY = y;
    this.sliderX = x + 80;

    const labelX = x;
    const sliderX = this.sliderX;

    // Music label
    this.musicLabel = scene.add.text(labelX, y, 'Music', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#333333',
      fontStyle: 'bold',
    });
    this.musicLabel.setScrollFactor(0);

    // SFX label
    this.sfxLabel = scene.add.text(labelX, y + SettingsPanel.ITEM_SPACING, 'SFX', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#333333',
      fontStyle: 'bold',
    });
    this.sfxLabel.setScrollFactor(0);

    // Run by default label
    this.runLabel = scene.add.text(labelX, y + SettingsPanel.ITEM_SPACING * 2, 'Run by default', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#333333',
      fontStyle: 'bold',
    });
    this.runLabel.setScrollFactor(0);

    // Run toggle text
    this.runToggleText = scene.add.text(
      sliderX,
      y + SettingsPanel.ITEM_SPACING * 2,
      'OFF',
      {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#666666',
        fontStyle: 'bold',
      },
    );
    this.runToggleText.setScrollFactor(0);

    // Slider graphics (drawn dynamically)
    this.sliderGraphics = scene.add.graphics();
    this.sliderGraphics.setScrollFactor(0);

    // --- Pointer hit zones for slider interaction ---
    const hitH = SettingsPanel.HIT_HEIGHT;
    const hitW = SettingsPanel.SLIDER_WIDTH;

    // Music slider hit zone (origin 0,0 so x,y is top-left)
    this.musicHitZone = scene.add.zone(sliderX + hitW / 2, y + 6, hitW, hitH);
    this.musicHitZone.setScrollFactor(0);
    this.musicHitZone.setInteractive({ useHandCursor: true });

    // SFX slider hit zone
    this.sfxHitZone = scene.add.zone(
      sliderX + hitW / 2,
      y + SettingsPanel.ITEM_SPACING + 6,
      hitW,
      hitH,
    );
    this.sfxHitZone.setScrollFactor(0);
    this.sfxHitZone.setInteractive({ useHandCursor: true });

    // Run toggle hit zone
    this.toggleHitZone = scene.add.zone(
      sliderX + 20,
      y + SettingsPanel.ITEM_SPACING * 2 + 6,
      40,
      hitH,
    );
    this.toggleHitZone.setScrollFactor(0);
    this.toggleHitZone.setInteractive({ useHandCursor: true });

    // Wire pointer events
    this.musicHitZone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.selectedItem = 0;
      this.setSliderFromPointer(0, pointer.x);
      this.draggingSlider = 'music';
    });
    this.sfxHitZone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.selectedItem = 1;
      this.setSliderFromPointer(1, pointer.x);
      this.draggingSlider = 'sfx';
    });
    this.toggleHitZone.on('pointerdown', () => {
      this.selectedItem = 2;
      this.settings.runDefault = !this.settings.runDefault;
      this.drawSliders();
      this.updateToggle();
    });

    // Drag support: listen on the scene for pointermove and pointerup
    scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!this.container.visible || !this.draggingSlider) return;
      const sliderIndex = this.draggingSlider === 'music' ? 0 : 1;
      this.setSliderFromPointer(sliderIndex, pointer.x);
    });
    scene.input.on('pointerup', () => {
      this.draggingSlider = null;
    });

    this.container = scene.add.container(0, 0, [
      this.musicLabel,
      this.sfxLabel,
      this.runLabel,
      this.runToggleText,
      this.sliderGraphics,
      this.musicHitZone,
      this.sfxHitZone,
      this.toggleHitZone,
    ]);
    this.container.setDepth(71);
    this.container.setScrollFactor(0);
    this.container.setVisible(false);

    this.drawSliders();
  }

  /** Update settings display from external state. */
  update(settings: SettingsState): void {
    this.settings = { ...settings };
    this.drawSliders();
    this.updateToggle();
  }

  /** Navigate between settings items (up/down). */
  navigate(direction: 'up' | 'down'): void {
    if (direction === 'up') {
      this.selectedItem = Math.max(0, this.selectedItem - 1);
    } else {
      this.selectedItem = Math.min(2, this.selectedItem + 1);
    }
    this.drawSliders();
    this.updateToggle();
  }

  /** Adjust value of currently selected setting (left/right). */
  adjustValue(direction: 'left' | 'right'): void {
    const delta = direction === 'right' ? 0.1 : -0.1;

    switch (this.selectedItem) {
      case 0: // Music
        this.settings.musicVolume = Math.max(0, Math.min(1, this.settings.musicVolume + delta));
        break;
      case 1: // SFX
        this.settings.sfxVolume = Math.max(0, Math.min(1, this.settings.sfxVolume + delta));
        break;
      case 2: // Run toggle
        this.settings.runDefault = !this.settings.runDefault;
        break;
    }

    this.drawSliders();
    this.updateToggle();
  }

  /** Get current settings state. */
  getSettings(): SettingsState {
    return { ...this.settings };
  }

  show(): void {
    this.container.setVisible(true);
  }

  hide(): void {
    this.container.setVisible(false);
  }

  destroy(): void {
    this.container.destroy();
  }

  /** Convert a pointer x-position to a 0..1 slider value and apply it. */
  private setSliderFromPointer(sliderIndex: number, pointerX: number): void {
    const w = SettingsPanel.SLIDER_WIDTH;
    const value = Math.max(0, Math.min(1, (pointerX - this.sliderX) / w));

    if (sliderIndex === 0) {
      this.settings.musicVolume = Math.round(value * 10) / 10;
    } else {
      this.settings.sfxVolume = Math.round(value * 10) / 10;
    }

    this.drawSliders();
    this.updateToggle();
  }

  private drawSliders(): void {
    this.sliderGraphics.clear();
    const sliderX = this.panelX + 80;

    // Music slider
    this.drawSlider(sliderX, this.panelY + 2, this.settings.musicVolume, this.selectedItem === 0);

    // SFX slider
    this.drawSlider(
      sliderX,
      this.panelY + SettingsPanel.ITEM_SPACING + 2,
      this.settings.sfxVolume,
      this.selectedItem === 1,
    );
  }

  private drawSlider(x: number, y: number, value: number, isSelected: boolean): void {
    const w = SettingsPanel.SLIDER_WIDTH;
    const trackY = y + 4;

    // Track background
    this.sliderGraphics.lineStyle(2, 0xCCCCCC, 1);
    this.sliderGraphics.beginPath();
    this.sliderGraphics.moveTo(x, trackY);
    this.sliderGraphics.lineTo(x + w, trackY);
    this.sliderGraphics.strokePath();

    // Filled portion
    const fillW = Math.round(w * value);
    if (fillW > 0) {
      this.sliderGraphics.lineStyle(2, 0xE8B830, 1);
      this.sliderGraphics.beginPath();
      this.sliderGraphics.moveTo(x, trackY);
      this.sliderGraphics.lineTo(x + fillW, trackY);
      this.sliderGraphics.strokePath();
    }

    // Dot indicator
    const dotX = x + fillW;
    const dotColor = isSelected ? 0xE8B830 : 0x666666;
    this.sliderGraphics.fillStyle(dotColor, 1);
    this.sliderGraphics.fillRect(dotX - 4, trackY - 4, 8, 8);
  }

  private updateToggle(): void {
    if (this.settings.runDefault) {
      this.runToggleText.setText('ON');
      this.runToggleText.setColor('#E8B830');
    } else {
      this.runToggleText.setText('OFF');
      this.runToggleText.setColor('#666666');
    }
  }
}
