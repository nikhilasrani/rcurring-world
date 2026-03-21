import Phaser from 'phaser';
import type { InventoryItem } from '../utils/types';

/**
 * InventoryPanel: 2x6 item grid with selection highlight and item detail display.
 *
 * UI-SPEC: 24x24 slots, 4px gap, 2 rows of 6.
 * Empty slots: #CCCCCC 1px outline. Filled: 16x16 item icon centered.
 * Selected slot: 2px #E8B830 border.
 * Below grid: item name (12px bold), flavor text (10px word-wrapped).
 * Empty state: "No items collected yet." + "Explore MG Road to find Bengaluru souvenirs!"
 */
export class InventoryPanel {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private slots: Phaser.GameObjects.Graphics[] = [];
  private itemIcons: (Phaser.GameObjects.Image | null)[] = [];
  private selectedIndex: number = 0;
  private selectionHighlight: Phaser.GameObjects.Graphics;
  private itemNameText: Phaser.GameObjects.Text;
  private itemDescText: Phaser.GameObjects.Text;
  private emptyText: Phaser.GameObjects.Text;
  private emptySubtext: Phaser.GameObjects.Text;
  private headingText: Phaser.GameObjects.Text;

  private currentItems: InventoryItem[] = [];
  private panelX: number;
  private panelY: number;
  private panelWidth: number;

  private static readonly SLOT_SIZE = 24;
  private static readonly SLOT_GAP = 4;
  private static readonly COLS = 6;
  private static readonly ROWS = 2;
  private static readonly ICON_SIZE = 16;

  constructor(scene: Phaser.Scene, x: number, y: number, width: number, _height: number) {
    this.scene = scene;
    this.panelX = x;
    this.panelY = y;
    this.panelWidth = width;

    // Heading
    this.headingText = scene.add.text(x, y, 'INVENTORY', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#333333',
      fontStyle: 'bold',
    });
    this.headingText.setScrollFactor(0);

    // Calculate grid dimensions
    const gridWidth = InventoryPanel.COLS * InventoryPanel.SLOT_SIZE +
      (InventoryPanel.COLS - 1) * InventoryPanel.SLOT_GAP;
    const gridStartX = x + Math.floor((width - gridWidth) / 2);
    const gridStartY = y + 20; // below heading

    // Create 12 slot backgrounds
    for (let row = 0; row < InventoryPanel.ROWS; row++) {
      for (let col = 0; col < InventoryPanel.COLS; col++) {
        const sx = gridStartX + col * (InventoryPanel.SLOT_SIZE + InventoryPanel.SLOT_GAP);
        const sy = gridStartY + row * (InventoryPanel.SLOT_SIZE + InventoryPanel.SLOT_GAP);

        const slotGfx = scene.add.graphics();
        slotGfx.setScrollFactor(0);
        slotGfx.lineStyle(1, 0xCCCCCC, 1);
        slotGfx.strokeRect(sx, sy, InventoryPanel.SLOT_SIZE, InventoryPanel.SLOT_SIZE);
        this.slots.push(slotGfx);
        this.itemIcons.push(null);
      }
    }

    // Selection highlight
    this.selectionHighlight = scene.add.graphics();
    this.selectionHighlight.setScrollFactor(0);

    // Item detail: name
    const detailY = gridStartY + InventoryPanel.ROWS * (InventoryPanel.SLOT_SIZE + InventoryPanel.SLOT_GAP) + 24;
    this.itemNameText = scene.add.text(x, detailY, '', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#333333',
      fontStyle: 'bold',
    });
    this.itemNameText.setScrollFactor(0);

    // Item detail: description
    this.itemDescText = scene.add.text(x, detailY + 16, '', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#111111',
      wordWrap: { width: width },
    });
    this.itemDescText.setScrollFactor(0);

    // Empty state text
    this.emptyText = scene.add.text(x, y + 40, 'No items collected yet.', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#333333',
    });
    this.emptyText.setScrollFactor(0);

    this.emptySubtext = scene.add.text(x, y + 56, 'Explore MG Road to find Bengaluru souvenirs!', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#666666',
    });
    this.emptySubtext.setScrollFactor(0);

    // Assemble container
    this.container = scene.add.container(0, 0, [
      this.headingText,
      ...this.slots,
      this.selectionHighlight,
      this.itemNameText,
      this.itemDescText,
      this.emptyText,
      this.emptySubtext,
    ]);
    this.container.setDepth(71);
    this.container.setScrollFactor(0);
    this.container.setVisible(false);
  }

  /** Refresh grid with current inventory items. */
  update(items: InventoryItem[]): void {
    this.currentItems = items;

    // Calculate grid positions
    const gridWidth = InventoryPanel.COLS * InventoryPanel.SLOT_SIZE +
      (InventoryPanel.COLS - 1) * InventoryPanel.SLOT_GAP;
    const gridStartX = this.panelX + Math.floor((this.panelWidth - gridWidth) / 2);
    const gridStartY = this.panelY + 20;

    // Clear old icons
    for (let i = 0; i < this.itemIcons.length; i++) {
      if (this.itemIcons[i]) {
        this.itemIcons[i]!.destroy();
        this.itemIcons[i] = null;
      }
    }

    // Redraw slots and add icons for items that exist
    for (let i = 0; i < InventoryPanel.ROWS * InventoryPanel.COLS; i++) {
      const row = Math.floor(i / InventoryPanel.COLS);
      const col = i % InventoryPanel.COLS;
      const sx = gridStartX + col * (InventoryPanel.SLOT_SIZE + InventoryPanel.SLOT_GAP);
      const sy = gridStartY + row * (InventoryPanel.SLOT_SIZE + InventoryPanel.SLOT_GAP);

      // Redraw slot background
      this.slots[i].clear();
      this.slots[i].lineStyle(1, 0xCCCCCC, 1);
      this.slots[i].strokeRect(sx, sy, InventoryPanel.SLOT_SIZE, InventoryPanel.SLOT_SIZE);

      if (i < items.length) {
        // Place item icon centered in slot
        const icon = this.scene.add.image(
          sx + InventoryPanel.SLOT_SIZE / 2,
          sy + InventoryPanel.SLOT_SIZE / 2,
          items[i].iconKey,
        );
        icon.setDisplaySize(InventoryPanel.ICON_SIZE, InventoryPanel.ICON_SIZE);
        icon.setScrollFactor(0);
        icon.setDepth(71);
        this.itemIcons[i] = icon;
        this.container.add(icon);
      }
    }

    // Show/hide empty state
    const hasItems = items.length > 0;
    this.emptyText.setVisible(!hasItems);
    this.emptySubtext.setVisible(!hasItems);
    this.itemNameText.setVisible(hasItems);
    this.itemDescText.setVisible(hasItems);

    // Clamp selection
    if (this.selectedIndex >= items.length && items.length > 0) {
      this.selectedIndex = items.length - 1;
    }

    this.updateSelection();
  }

  /** Navigate selection in 2D grid. */
  navigate(direction: 'up' | 'down' | 'left' | 'right'): void {
    if (this.currentItems.length === 0) return;

    const row = Math.floor(this.selectedIndex / InventoryPanel.COLS);
    const col = this.selectedIndex % InventoryPanel.COLS;

    let newRow = row;
    let newCol = col;

    switch (direction) {
      case 'up': newRow = Math.max(0, row - 1); break;
      case 'down': newRow = Math.min(InventoryPanel.ROWS - 1, row + 1); break;
      case 'left': newCol = Math.max(0, col - 1); break;
      case 'right': newCol = Math.min(InventoryPanel.COLS - 1, col + 1); break;
    }

    const newIndex = newRow * InventoryPanel.COLS + newCol;
    if (newIndex < this.currentItems.length) {
      this.selectedIndex = newIndex;
      this.updateSelection();
    }
  }

  show(): void {
    this.container.setVisible(true);
    // Also show any item icons
    for (const icon of this.itemIcons) {
      if (icon) icon.setVisible(true);
    }
  }

  hide(): void {
    this.container.setVisible(false);
    // Also hide any item icons
    for (const icon of this.itemIcons) {
      if (icon) icon.setVisible(false);
    }
  }

  destroy(): void {
    for (const icon of this.itemIcons) {
      if (icon) icon.destroy();
    }
    this.container.destroy();
  }

  private updateSelection(): void {
    if (this.currentItems.length === 0) {
      this.selectionHighlight.clear();
      return;
    }

    const gridWidth = InventoryPanel.COLS * InventoryPanel.SLOT_SIZE +
      (InventoryPanel.COLS - 1) * InventoryPanel.SLOT_GAP;
    const gridStartX = this.panelX + Math.floor((this.panelWidth - gridWidth) / 2);
    const gridStartY = this.panelY + 20;

    const row = Math.floor(this.selectedIndex / InventoryPanel.COLS);
    const col = this.selectedIndex % InventoryPanel.COLS;
    const sx = gridStartX + col * (InventoryPanel.SLOT_SIZE + InventoryPanel.SLOT_GAP);
    const sy = gridStartY + row * (InventoryPanel.SLOT_SIZE + InventoryPanel.SLOT_GAP);

    this.selectionHighlight.clear();
    this.selectionHighlight.lineStyle(2, 0xE8B830, 1);
    this.selectionHighlight.strokeRect(sx - 1, sy - 1, InventoryPanel.SLOT_SIZE + 2, InventoryPanel.SLOT_SIZE + 2);

    // Update detail text
    const item = this.currentItems[this.selectedIndex];
    if (item) {
      this.itemNameText.setText(item.name);
      this.itemDescText.setText(item.description);
      this.itemNameText.setVisible(true);
      this.itemDescText.setVisible(true);
    }
  }
}
