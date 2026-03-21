import Phaser from 'phaser';

/**
 * SettingsPanel: Volume sliders and run toggle inside PauseMenu.
 *
 * "Music" label + slider bar (120px, #CCCCCC track / #E8B830 fill, 8x8 dot).
 * "SFX" label + slider bar (same style).
 * "Run by default" label + ON/OFF toggle.
 * Sliders are visual-only for now (Phase 4 wires audio).
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

  // Internal state
  private settings: SettingsState = { musicVolume: 0.7, sfxVolume: 0.7, runDefault: false };
  private selectedItem: number = 0; // 0=music, 1=sfx, 2=runDefault
  private panelX: number;
  private panelY: number;

  private static readonly SLIDER_WIDTH = 120;
  private static readonly ITEM_SPACING = 48;

  constructor(scene: Phaser.Scene, x: number, y: number, _width: number, _height: number) {
    this.panelX = x;
    this.panelY = y;

    const labelX = x;
    const sliderX = x + 80;

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

    this.container = scene.add.container(0, 0, [
      this.musicLabel,
      this.sfxLabel,
      this.runLabel,
      this.runToggleText,
      this.sliderGraphics,
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
