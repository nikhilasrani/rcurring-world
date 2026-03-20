import { eventsCenter } from '../utils/EventsCenter';
import { EVENTS } from '../utils/constants';
import type { LandmarkDef, DiscoveryState } from '../utils/types';

/**
 * ZoneManager: Tracks which zone the player is in and which landmarks
 * have been discovered.
 *
 * On each movement tick, WorldScene calls checkZone() with the player's
 * tile position. If the player has entered a new landmark zone, a
 * ZONE_ENTER event is emitted to trigger the zone banner display.
 *
 * Discovery state is persisted for Phase 3 journal integration.
 */
export class ZoneManager {
  private currentZone: string | null = null;
  private discoveredZones: Set<string> = new Set();
  private discoveredLandmarks: Set<string> = new Set();
  private landmarks: LandmarkDef[] = [];

  constructor(landmarks: LandmarkDef[]) {
    this.landmarks = landmarks;
  }

  /**
   * Check if the player's tile position is within any landmark zone.
   * Emits ZONE_ENTER only when entering a new zone (not on re-checks
   * while still in the same zone).
   *
   * Zone positions in mg-road.json are in tile coordinates.
   */
  checkZone(playerTilePos: { x: number; y: number }): void {
    let foundZone: string | null = null;
    let foundName: string | null = null;

    for (const landmark of this.landmarks) {
      if (
        playerTilePos.x >= landmark.position.x &&
        playerTilePos.x < landmark.position.x + landmark.size.width &&
        playerTilePos.y >= landmark.position.y &&
        playerTilePos.y < landmark.position.y + landmark.size.height
      ) {
        foundZone = landmark.id;
        foundName = landmark.name;
        break;
      }
    }

    if (foundZone && foundZone !== this.currentZone) {
      this.currentZone = foundZone;
      this.discoveredZones.add(foundZone);
      this.discoveredLandmarks.add(foundZone);
      eventsCenter.emit(EVENTS.ZONE_ENTER, foundName);
    } else if (!foundZone) {
      this.currentZone = null;
    }
  }

  /**
   * Emit zone banner for an interior and track it as discovered.
   */
  enterInterior(displayName: string): void {
    eventsCenter.emit(EVENTS.ZONE_ENTER, displayName);
    this.discoveredZones.add(displayName);
  }

  /**
   * Get the current discovery state snapshot.
   */
  getDiscoveryState(): DiscoveryState {
    return {
      discoveredZones: Array.from(this.discoveredZones),
      discoveredLandmarks: Array.from(this.discoveredLandmarks),
      currentZone: this.currentZone,
      currentInterior: null,
    };
  }

  /**
   * Check if a specific landmark has been discovered.
   */
  isDiscovered(landmarkId: string): boolean {
    return this.discoveredLandmarks.has(landmarkId);
  }

  /**
   * Get the number of landmarks discovered so far.
   */
  getDiscoveredCount(): number {
    return this.discoveredLandmarks.size;
  }

  /**
   * Get the total number of landmarks available.
   */
  getTotalLandmarks(): number {
    return this.landmarks.length;
  }
}
