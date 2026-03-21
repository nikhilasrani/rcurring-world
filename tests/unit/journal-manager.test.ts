import { describe, it, expect, beforeEach } from 'vitest';
import { JournalManager } from '../../src/systems/JournalManager';
import type { JournalDiscoveries } from '../../src/utils/types';

const testDiscoveries: JournalDiscoveries = {
  zone: 'mg-road',
  places: [
    { id: 'chinnaswamy-stadium', name: 'Chinnaswamy Stadium' },
    { id: 'ub-city', name: 'UB City' },
    { id: 'cubbon-park', name: 'Cubbon Park' },
  ],
  npcs: [
    { id: 'npc-chai-walla', name: 'Raju' },
    { id: 'npc-auto-driver', name: 'Auto Driver' },
  ],
  items: [
    { id: 'filter-coffee', name: 'Filter Coffee' },
    { id: 'masala-dosa', name: 'Masala Dosa' },
    { id: 'jasmine-flowers', name: 'Jasmine Flowers' },
  ],
};

describe('JournalManager', () => {
  let journal: JournalManager;

  beforeEach(() => {
    journal = new JournalManager(testDiscoveries);
  });

  it('getCompletionPercentage returns 0 with no discoveries', () => {
    const pct = journal.getCompletionPercentage([], [], []);
    expect(pct).toBe(0);
  });

  it('getCompletionPercentage computes correct partial percentage', () => {
    // 1 place + 1 npc + 1 item = 3 out of 8 total = 37.5 => 38 (rounded)
    const pct = journal.getCompletionPercentage(
      ['chinnaswamy-stadium'],
      ['npc-chai-walla'],
      ['filter-coffee'],
    );
    expect(pct).toBe(38);
  });

  it('getCompletionPercentage returns 100 with full discovery', () => {
    const pct = journal.getCompletionPercentage(
      ['chinnaswamy-stadium', 'ub-city', 'cubbon-park'],
      ['npc-chai-walla', 'npc-auto-driver'],
      ['filter-coffee', 'masala-dosa', 'jasmine-flowers'],
    );
    expect(pct).toBe(100);
  });

  it('getPlacesDiscovered returns correct discovered and undiscovered', () => {
    const result = journal.getPlacesDiscovered(['chinnaswamy-stadium']);
    expect(result.discovered).toEqual([{ id: 'chinnaswamy-stadium', name: 'Chinnaswamy Stadium' }]);
    expect(result.undiscovered).toBe(2);
    expect(result.total).toBe(3);
  });

  it('getNPCsMet returns correct counts', () => {
    const result = journal.getNPCsMet(['npc-chai-walla', 'npc-auto-driver']);
    expect(result.discovered).toHaveLength(2);
    expect(result.undiscovered).toBe(0);
    expect(result.total).toBe(2);
  });

  it('getItemsFound returns correct counts', () => {
    const result = journal.getItemsFound([]);
    expect(result.discovered).toEqual([]);
    expect(result.undiscovered).toBe(3);
    expect(result.total).toBe(3);
  });

  it('getZoneName returns zone id', () => {
    expect(journal.getZoneName()).toBe('mg-road');
  });
});
