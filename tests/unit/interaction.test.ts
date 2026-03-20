import { describe, it, expect, vi } from 'vitest';
import { InteractionSystem } from '../../src/systems/InteractionSystem';
import type { SignDef, InteriorDef } from '../../src/utils/types';

const mockGridEngine = {
  getFacingPosition: vi.fn(),
  getCharactersAt: vi.fn(() => []),
};

const testSigns: SignDef[] = [
  {
    id: 'sign-bus-stop',
    type: 'road-sign',
    position: { x: 10, y: 5 },
    dialogue: { pages: ['Bus stop ahead'] },
  },
  {
    id: 'sign-library',
    type: 'landmark-plaque',
    position: { x: 20, y: 15 },
    dialogue: { pages: ['State Central Library'] },
  },
];

const testInteriors: InteriorDef[] = [
  {
    id: 'metro-station',
    name: 'metro-station',
    displayName: 'Metro Station',
    tilemapKey: 'tilemap-interior-metro',
    tilesetKey: 'tileset-interior',
    doorPosition: { x: 30, y: 25 },
    playerSpawn: { x: 5, y: 8 },
    exitPosition: { x: 5, y: 9 },
    returnPosition: { x: 30, y: 26 },
    size: { width: 16, height: 12 },
  },
];

describe('InteractionSystem.checkInteraction', () => {
  it('returns sign when facing position matches a sign position', () => {
    const system = new InteractionSystem(testSigns, testInteriors);
    mockGridEngine.getFacingPosition.mockReturnValue({ x: 10, y: 5 });
    mockGridEngine.getCharactersAt.mockReturnValue([]);

    const result = system.checkInteraction(mockGridEngine, 'player');

    expect(result).not.toBeNull();
    expect(result!.type).toBe('sign');
    expect(result!.id).toBe('sign-bus-stop');
    expect(result!.position).toEqual({ x: 10, y: 5 });
  });

  it('returns door when facing position matches an interior doorPosition', () => {
    const system = new InteractionSystem(testSigns, testInteriors);
    mockGridEngine.getFacingPosition.mockReturnValue({ x: 30, y: 25 });
    mockGridEngine.getCharactersAt.mockReturnValue([]);

    const result = system.checkInteraction(mockGridEngine, 'player');

    expect(result).not.toBeNull();
    expect(result!.type).toBe('door');
    expect(result!.id).toBe('metro-station');
  });

  it('returns null when facing position has nothing interactable', () => {
    const system = new InteractionSystem(testSigns, testInteriors);
    mockGridEngine.getFacingPosition.mockReturnValue({ x: 99, y: 99 });
    mockGridEngine.getCharactersAt.mockReturnValue([]);

    const result = system.checkInteraction(mockGridEngine, 'player');

    expect(result).toBeNull();
  });

  it('returns NPC when facing position has a non-player character', () => {
    const system = new InteractionSystem(testSigns, testInteriors);
    mockGridEngine.getFacingPosition.mockReturnValue({ x: 15, y: 10 });
    mockGridEngine.getCharactersAt.mockReturnValue(['player', 'npc-chai-walla']);

    const result = system.checkInteraction(mockGridEngine, 'player');

    expect(result).not.toBeNull();
    expect(result!.type).toBe('npc');
    expect(result!.id).toBe('npc-chai-walla');
  });

  it('ignores player character in getCharactersAt results', () => {
    const system = new InteractionSystem(testSigns, testInteriors);
    mockGridEngine.getFacingPosition.mockReturnValue({ x: 99, y: 99 });
    mockGridEngine.getCharactersAt.mockReturnValue(['player']);

    const result = system.checkInteraction(mockGridEngine, 'player');

    expect(result).toBeNull();
  });

  it('NPC detection takes priority over sign detection', () => {
    // NPC standing on a sign position
    const system = new InteractionSystem(testSigns, testInteriors);
    mockGridEngine.getFacingPosition.mockReturnValue({ x: 10, y: 5 });
    mockGridEngine.getCharactersAt.mockReturnValue(['npc-guard']);

    const result = system.checkInteraction(mockGridEngine, 'player');

    expect(result).not.toBeNull();
    expect(result!.type).toBe('npc');
    expect(result!.id).toBe('npc-guard');
  });

  it('getSignData returns correct SignDef', () => {
    const system = new InteractionSystem(testSigns, testInteriors);
    const sign = system.getSignData('sign-bus-stop');
    expect(sign).toBeDefined();
    expect(sign!.type).toBe('road-sign');
  });

  it('getSignData returns undefined for unknown sign', () => {
    const system = new InteractionSystem(testSigns, testInteriors);
    expect(system.getSignData('nonexistent')).toBeUndefined();
  });

  it('getInteriorData returns correct InteriorDef', () => {
    const system = new InteractionSystem(testSigns, testInteriors);
    const interior = system.getInteriorData('metro-station');
    expect(interior).toBeDefined();
    expect(interior!.displayName).toBe('Metro Station');
  });

  it('getInteriorData returns undefined for unknown interior', () => {
    const system = new InteractionSystem(testSigns, testInteriors);
    expect(system.getInteriorData('nonexistent')).toBeUndefined();
  });
});
