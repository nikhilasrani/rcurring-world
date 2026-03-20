import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EVENTS } from '../../src/utils/constants';

// Mock EventsCenter to avoid loading Phaser (needs browser window).
// vi.mock is hoisted, so the factory cannot reference outer variables.
vi.mock('../../src/utils/EventsCenter', () => ({
  eventsCenter: {
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  },
}));

// Import after mock is registered (vitest hoists vi.mock automatically)
import { ZoneManager } from '../../src/systems/ZoneManager';
import { eventsCenter } from '../../src/utils/EventsCenter';

// Test landmarks matching mg-road.json data
const testLandmarks = [
  {
    id: 'cubbon-park',
    name: 'Cubbon Park',
    position: { x: 1, y: 5 },
    size: { width: 18, height: 23 },
  },
  {
    id: 'vidhana-soudha',
    name: 'Vidhana Soudha',
    position: { x: 8, y: 2 },
    size: { width: 10, height: 6 },
  },
  {
    id: 'mg-road-metro',
    name: 'MG Road Metro Station',
    position: { x: 43, y: 33 },
    size: { width: 5, height: 4 },
  },
];

describe('ZoneManager', () => {
  let zoneManager: ZoneManager;
  const mockEmit = eventsCenter.emit as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    zoneManager = new ZoneManager(testLandmarks);
    mockEmit.mockClear();
  });

  it('emits ZONE_ENTER when player enters a landmark zone', () => {
    // Position inside Cubbon Park (x:1-18, y:5-27)
    zoneManager.checkZone({ x: 5, y: 10 });

    expect(mockEmit).toHaveBeenCalledWith(EVENTS.ZONE_ENTER, 'Cubbon Park');
  });

  it('does not re-emit ZONE_ENTER when already in same zone', () => {
    zoneManager.checkZone({ x: 5, y: 10 }); // Enter Cubbon Park
    mockEmit.mockClear();

    zoneManager.checkZone({ x: 6, y: 11 }); // Still in Cubbon Park

    expect(mockEmit).not.toHaveBeenCalled();
  });

  it('returns null currentZone when outside all zones', () => {
    // Position outside all landmark zones
    zoneManager.checkZone({ x: 30, y: 30 });

    const state = zoneManager.getDiscoveryState();
    expect(state.currentZone).toBeNull();
    expect(mockEmit).not.toHaveBeenCalled();
  });

  it('tracks discovered landmarks after entering zone', () => {
    zoneManager.checkZone({ x: 5, y: 10 }); // Enter Cubbon Park

    expect(zoneManager.isDiscovered('cubbon-park')).toBe(true);
  });

  it('reports correct discovered count after visiting multiple zones', () => {
    zoneManager.checkZone({ x: 5, y: 10 }); // Enter Cubbon Park
    zoneManager.checkZone({ x: 30, y: 30 }); // Leave (outside all zones)
    zoneManager.checkZone({ x: 44, y: 34 }); // Enter MG Road Metro

    expect(zoneManager.getDiscoveredCount()).toBe(2);
  });

  it('getDiscoveryState returns correct shape', () => {
    zoneManager.checkZone({ x: 5, y: 10 }); // Enter Cubbon Park

    const state = zoneManager.getDiscoveryState();

    expect(state).toEqual({
      discoveredZones: ['cubbon-park'],
      discoveredLandmarks: ['cubbon-park'],
      currentZone: 'cubbon-park',
      currentInterior: null,
    });
  });

  it('does not mark unvisited landmarks as discovered', () => {
    // Don't visit Vidhana Soudha
    expect(zoneManager.isDiscovered('vidhana-soudha')).toBe(false);
  });

  it('emits new ZONE_ENTER when moving between zones', () => {
    zoneManager.checkZone({ x: 5, y: 10 }); // Enter Cubbon Park
    mockEmit.mockClear();

    zoneManager.checkZone({ x: 30, y: 30 }); // Leave all zones
    zoneManager.checkZone({ x: 44, y: 34 }); // Enter MG Road Metro

    expect(mockEmit).toHaveBeenCalledWith(
      EVENTS.ZONE_ENTER,
      'MG Road Metro Station'
    );
  });

  it('reports total landmarks count', () => {
    expect(zoneManager.getTotalLandmarks()).toBe(3);
  });
});
