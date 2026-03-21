import type { InventoryItem } from '../utils/types';

/**
 * Pure-logic inventory manager. No Phaser imports.
 * Manages item collection with 12-slot capacity and no duplicates.
 */
export class InventoryManager {
  private items: InventoryItem[] = [];
  private readonly capacity = 12;

  /** Adds an item. Returns false if full or duplicate id. */
  addItem(item: InventoryItem): boolean {
    if (this.items.length >= this.capacity) return false;
    if (this.items.some((i) => i.id === item.id)) return false;

    this.items.push({ ...item });
    return true;
  }

  /** Checks if an item has been collected. */
  hasItem(itemId: string): boolean {
    return this.items.some((i) => i.id === itemId);
  }

  /** Returns a readonly view of collected items. */
  getItems(): readonly InventoryItem[] {
    return this.items;
  }

  /** Returns current item count. */
  getCount(): number {
    return this.items.length;
  }

  /** Restores inventory from a save file. */
  loadState(items: InventoryItem[]): void {
    this.items = items.map((i) => ({ ...i }));
  }

  /** Returns a snapshot of inventory for saving. */
  getState(): InventoryItem[] {
    return this.items.map((i) => ({ ...i }));
  }
}
