import type { JournalDiscoveries } from '../utils/types';

/**
 * Pure-logic journal/discovery aggregation. No Phaser imports.
 * Computes zone completion from discovery data on demand (stateless).
 */
export class JournalManager {
  private readonly data: JournalDiscoveries;

  constructor(discoveries: JournalDiscoveries) {
    this.data = discoveries;
  }

  /** Returns zone completion as 0-100 integer (rounded up). */
  getCompletionPercentage(
    discoveredLandmarks: string[],
    npcsMetIds: string[],
    inventoryItemIds: string[],
  ): number {
    const total = this.data.places.length + this.data.npcs.length + this.data.items.length;
    if (total === 0) return 0;

    const placesFound = this.data.places.filter((p) => discoveredLandmarks.includes(p.id)).length;
    const npcsFound = this.data.npcs.filter((n) => npcsMetIds.includes(n.id)).length;
    const itemsFound = this.data.items.filter((i) => inventoryItemIds.includes(i.id)).length;

    const discovered = placesFound + npcsFound + itemsFound;
    return Math.round((discovered / total) * 100);
  }

  /** Returns discovered places and undiscovered count. */
  getPlacesDiscovered(discoveredLandmarks: string[]): {
    discovered: { id: string; name: string }[];
    undiscovered: number;
    total: number;
  } {
    const discovered = this.data.places.filter((p) => discoveredLandmarks.includes(p.id));
    return {
      discovered,
      undiscovered: this.data.places.length - discovered.length,
      total: this.data.places.length,
    };
  }

  /** Returns met NPCs and undiscovered count. */
  getNPCsMet(npcsMetIds: string[]): {
    discovered: { id: string; name: string }[];
    undiscovered: number;
    total: number;
  } {
    const discovered = this.data.npcs.filter((n) => npcsMetIds.includes(n.id));
    return {
      discovered,
      undiscovered: this.data.npcs.length - discovered.length,
      total: this.data.npcs.length,
    };
  }

  /** Returns found items and undiscovered count. */
  getItemsFound(inventoryItemIds: string[]): {
    discovered: { id: string; name: string }[];
    undiscovered: number;
    total: number;
  } {
    const discovered = this.data.items.filter((i) => inventoryItemIds.includes(i.id));
    return {
      discovered,
      undiscovered: this.data.items.length - discovered.length,
      total: this.data.items.length,
    };
  }

  /** Returns the zone ID for this discovery set. */
  getZoneName(): string {
    return this.data.zone;
  }
}
