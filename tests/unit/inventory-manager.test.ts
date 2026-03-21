import { describe, it, expect, beforeEach } from 'vitest';
import { InventoryManager } from '../../src/systems/InventoryManager';
import type { InventoryItem } from '../../src/utils/types';

function makeItem(id: string): InventoryItem {
  return { id, name: `Item ${id}`, description: `Desc ${id}`, iconKey: `icon-${id}`, source: 'world-pickup' };
}

describe('InventoryManager', () => {
  let inv: InventoryManager;

  beforeEach(() => {
    inv = new InventoryManager();
  });

  it('addItem succeeds for first item', () => {
    const result = inv.addItem(makeItem('filter-coffee'));
    expect(result).toBe(true);
    expect(inv.getCount()).toBe(1);
    expect(inv.hasItem('filter-coffee')).toBe(true);
  });

  it('addItem rejects duplicate itemId', () => {
    inv.addItem(makeItem('filter-coffee'));
    const result = inv.addItem(makeItem('filter-coffee'));
    expect(result).toBe(false);
    expect(inv.getCount()).toBe(1);
  });

  it('addItem rejects when at capacity (12 slots)', () => {
    for (let i = 0; i < 12; i++) {
      inv.addItem(makeItem(`item-${i}`));
    }
    expect(inv.getCount()).toBe(12);

    const result = inv.addItem(makeItem('item-13'));
    expect(result).toBe(false);
    expect(inv.getCount()).toBe(12);
  });

  it('hasItem returns false for uncollected items', () => {
    expect(inv.hasItem('nope')).toBe(false);
  });

  it('getItems returns readonly array', () => {
    inv.addItem(makeItem('filter-coffee'));
    const items = inv.getItems();
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe('filter-coffee');
  });

  it('loadState/getState round-trip preserves items', () => {
    inv.addItem(makeItem('filter-coffee'));
    inv.addItem(makeItem('masala-dosa'));

    const snapshot = inv.getState();
    const inv2 = new InventoryManager();
    inv2.loadState(snapshot);

    expect(inv2.getCount()).toBe(2);
    expect(inv2.hasItem('filter-coffee')).toBe(true);
    expect(inv2.hasItem('masala-dosa')).toBe(true);
  });
});
