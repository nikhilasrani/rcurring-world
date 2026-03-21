import Phaser from 'phaser';
import { eventsCenter } from '../utils/EventsCenter';
import { EVENTS } from '../utils/constants';
/** Panel interface -- all pause menu tab panels implement show/hide/destroy */
interface PanelChild {
  show(): void;
  hide(): void;
  destroy(): void;
}

/**
 * PauseMenu: Full-screen tabbed overlay with 5 tabs.
 *
 * Tabs: QUESTS | INVENTORY | JOURNAL | SAVE | SETTINGS
 * Opens with dark overlay (depth 70), GBA-style panel with #F8F8F8 bg.
 * Close via X button (touch) or external key handler.
 * Navigation: switchTab / navigateTab for keyboard, tab text interactive for touch.
 *
 * UI-SPEC: 16px outer margin, 16px tab bar, 10px bold tab labels,
 * #E8B830 active underline, #222222 2px border, #F8F8F8 0.95 bg.
 */
export class PauseMenu {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private overlay: Phaser.GameObjects.Graphics;
  private panelBg: Phaser.GameObjects.Graphics;
  private tabTexts: Phaser.GameObjects.Text[] = [];
  private tabUnderline: Phaser.GameObjects.Graphics;
  private closeButton: Phaser.GameObjects.Text;
  private activeTabIndex: number = 0;
  private isOpen: boolean = false;
  private bounds: { x: number; y: number; width: number; height: number } = { x: 0, y: 0, width: 480, height: 320 };

  // Panel references (set via setPanels)
  private panels: { show(): void; hide(): void }[] = [];

  private static readonly TAB_LABELS = ['QUESTS', 'INVENTORY', 'JOURNAL', 'SAVE', 'SETTINGS'];
  private static readonly OUTER_MARGIN = 16;
  private static readonly TAB_HEIGHT = 16;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    // Dark overlay covering full viewport
    this.overlay = scene.add.graphics();
    this.overlay.setDepth(70);
    this.overlay.setScrollFactor(0);
    this.overlay.setVisible(false);

    // Panel background
    this.panelBg = scene.add.graphics();
    this.panelBg.setScrollFactor(0);

    // Tab underline
    this.tabUnderline = scene.add.graphics();
    this.tabUnderline.setScrollFactor(0);

    // Create tab text labels
    for (let i = 0; i < PauseMenu.TAB_LABELS.length; i++) {
      const tab = scene.add.text(0, 0, PauseMenu.TAB_LABELS[i], {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#333333',
        fontStyle: 'bold',
      });
      tab.setScrollFactor(0);
      tab.setOrigin(0.5, 0);
      tab.setInteractive({ useHandCursor: true });
      tab.on('pointerdown', () => {
        this.switchTab(i);
      });
      this.tabTexts.push(tab);
    }

    // Close button
    this.closeButton = scene.add.text(0, 0, 'X', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#333333',
      fontStyle: 'bold',
    });
    this.closeButton.setScrollFactor(0);
    this.closeButton.setOrigin(0.5, 0.5);
    this.closeButton.setInteractive({ useHandCursor: true });
    this.closeButton.on('pointerdown', () => {
      this.close();
    });

    // Assemble into container
    this.container = scene.add.container(0, 0, [
      this.panelBg,
      this.tabUnderline,
      ...this.tabTexts,
      this.closeButton,
    ]);
    this.container.setDepth(70);
    this.container.setScrollFactor(0);
    this.container.setVisible(false);
  }

  /**
   * Set panel instances for tab switching. Order must match TAB_LABELS:
   * quests(0), inventory(1), journal(2), save(3), settings(4).
   */
  setPanels(
    quests: PanelChild,
    inventory: PanelChild,
    journal: PanelChild,
    save: PanelChild,
    settings: PanelChild,
  ): void {
    this.panels = [quests, inventory, journal, save, settings];
  }

  /** Open the pause menu with fade-in animation. */
  open(): void {
    if (this.isOpen) return;
    this.isOpen = true;

    this.overlay.setVisible(true);
    this.container.setVisible(true);

    // Show active panel
    this.showActivePanel();

    // Fade in
    this.overlay.setAlpha(0);
    this.container.setAlpha(0);
    this.scene.tweens.add({
      targets: [this.overlay, this.container],
      alpha: 1,
      duration: 150,
      ease: 'Power2',
    });

    // Also fade in the active panel
    if (this.panels[this.activeTabIndex]) {
      // Panels are separate containers, just show them
    }

    eventsCenter.emit(EVENTS.PAUSE_MENU_OPEN);
    eventsCenter.emit(EVENTS.MOVEMENT_FREEZE, true);
  }

  /** Close the pause menu with fade-out animation. */
  close(): void {
    if (!this.isOpen) return;
    this.isOpen = false;

    this.scene.tweens.add({
      targets: [this.overlay, this.container],
      alpha: 0,
      duration: 150,
      ease: 'Power2',
      onComplete: () => {
        this.overlay.setVisible(false);
        this.container.setVisible(false);
        this.hideAllPanels();
      },
    });

    eventsCenter.emit(EVENTS.PAUSE_MENU_CLOSE);
    eventsCenter.emit(EVENTS.MOVEMENT_FREEZE, false);
  }

  /** Switch to the tab at the given index. */
  switchTab(index: number): void {
    if (index < 0 || index >= PauseMenu.TAB_LABELS.length) return;
    this.activeTabIndex = index;
    this.updateUnderline();
    this.showActivePanel();
  }

  /** Navigate tabs left or right with wrap-around. */
  navigateTab(direction: 'left' | 'right'): void {
    if (direction === 'left') {
      this.switchTab(
        (this.activeTabIndex - 1 + PauseMenu.TAB_LABELS.length) % PauseMenu.TAB_LABELS.length,
      );
    } else {
      this.switchTab((this.activeTabIndex + 1) % PauseMenu.TAB_LABELS.length);
    }
  }

  /** Returns whether the menu is currently open. */
  isMenuOpen(): boolean {
    return this.isOpen;
  }

  /** Reposition all elements relative to viewport bounds. */
  reposition(bounds: { x: number; y: number; width: number; height: number }): void {
    this.bounds = bounds;

    const m = PauseMenu.OUTER_MARGIN;
    const menuX = bounds.x + m;
    const menuY = bounds.y + m;
    const menuW = bounds.width - m * 2;
    const menuH = bounds.height - m * 2;

    // Overlay: full viewport dim
    this.overlay.clear();
    this.overlay.fillStyle(0x111111, 0.7);
    this.overlay.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);

    // Panel background: #F8F8F8 at 0.95 with #222222 2px border
    this.panelBg.clear();
    this.panelBg.fillStyle(0xF8F8F8, 0.95);
    this.panelBg.fillRect(menuX, menuY, menuW, menuH);
    this.panelBg.lineStyle(2, 0x222222, 1);
    this.panelBg.strokeRect(menuX, menuY, menuW, menuH);

    // Tab labels: evenly spaced across the width
    const tabCount = PauseMenu.TAB_LABELS.length;
    const tabSpacing = menuW / tabCount;
    for (let i = 0; i < tabCount; i++) {
      const tx = menuX + tabSpacing * i + tabSpacing / 2;
      const ty = menuY + 3; // slight padding from top
      this.tabTexts[i].setPosition(tx, ty);
    }

    // Close button: top-right corner of menu
    this.closeButton.setPosition(menuX + menuW - 10, menuY + 8);

    // Update underline
    this.updateUnderline();
  }

  /** Get the panel content area bounds for child panel positioning. */
  getPanelBounds(): { x: number; y: number; width: number; height: number } {
    const m = PauseMenu.OUTER_MARGIN;
    const menuX = this.bounds.x + m;
    const menuY = this.bounds.y + m;
    const menuW = this.bounds.width - m * 2;
    const menuH = this.bounds.height - m * 2;
    const padding = 16; // inner padding

    return {
      x: menuX + padding,
      y: menuY + PauseMenu.TAB_HEIGHT + padding,
      width: menuW - padding * 2,
      height: menuH - PauseMenu.TAB_HEIGHT - padding * 2,
    };
  }

  destroy(): void {
    this.overlay.destroy();
    this.container.destroy();
    // Panels are owned by whoever calls setPanels -- not destroyed here
  }

  private updateUnderline(): void {
    const m = PauseMenu.OUTER_MARGIN;
    const menuX = this.bounds.x + m;
    const menuY = this.bounds.y + m;
    const menuW = this.bounds.width - m * 2;
    const tabCount = PauseMenu.TAB_LABELS.length;
    const tabSpacing = menuW / tabCount;

    const activeTab = this.tabTexts[this.activeTabIndex];
    const tabWidth = activeTab.width;

    this.tabUnderline.clear();
    this.tabUnderline.lineStyle(2, 0xE8B830, 1);

    const underlineX = menuX + tabSpacing * this.activeTabIndex + tabSpacing / 2 - tabWidth / 2;
    const underlineY = menuY + PauseMenu.TAB_HEIGHT - 2;

    this.tabUnderline.beginPath();
    this.tabUnderline.moveTo(underlineX, underlineY);
    this.tabUnderline.lineTo(underlineX + tabWidth, underlineY);
    this.tabUnderline.strokePath();
  }

  private showActivePanel(): void {
    this.hideAllPanels();
    if (this.panels[this.activeTabIndex]) {
      this.panels[this.activeTabIndex].show();
    }
  }

  private hideAllPanels(): void {
    for (const panel of this.panels) {
      panel.hide();
    }
  }
}
