import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NPCManager } from '../../src/systems/NPCManager';
import type { NPCDef } from '../../src/utils/types';

const mockGridEngine = {
  addCharacter: vi.fn(),
  moveRandomly: vi.fn(),
  stopMovement: vi.fn(),
};

const mockScene = {
  add: {
    sprite: vi.fn(() => ({
      setDepth: vi.fn().mockReturnThis(),
      destroy: vi.fn(),
      anims: { play: vi.fn(), currentAnim: null },
    })),
  },
  anims: {
    exists: vi.fn(() => false),
    create: vi.fn(),
    generateFrameNumbers: vi.fn(() => []),
  },
} as any;

const testNPCDef: NPCDef = {
  id: 'npc-chai-walla',
  name: 'Chai Walla',
  spriteKey: 'npc-chai-walla',
  position: { x: 10, y: 15 },
  facing: 'down' as any,
  patrolRadius: 3,
  patrolDelay: 2000,
  speed: 2,
  dialogue: {
    name: 'Chai Walla',
    pages: ['Namaste! Want some chai?', 'Best filter coffee in Bengaluru!'],
  },
};

const testNPCDef2: NPCDef = {
  id: 'npc-guard',
  name: 'Security Guard',
  spriteKey: 'npc-guard',
  position: { x: 20, y: 25 },
  facing: 'left' as any,
  patrolRadius: 2,
  patrolDelay: 3000,
  speed: 1,
  dialogue: {
    name: 'Guard',
    pages: ['No entry beyond this point.'],
  },
};

describe('NPCManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getNPCData returns correct NPCDef after spawnNPC', () => {
    const manager = new NPCManager();
    manager.spawnNPC(mockScene, mockGridEngine, testNPCDef);

    const data = manager.getNPCData('npc-chai-walla');
    expect(data).toBeDefined();
    expect(data!.name).toBe('Chai Walla');
    expect(data!.position).toEqual({ x: 10, y: 15 });
  });

  it('getAllNPCIds returns all spawned NPC IDs', () => {
    const manager = new NPCManager();
    manager.spawnNPC(mockScene, mockGridEngine, testNPCDef);
    manager.spawnNPC(mockScene, mockGridEngine, testNPCDef2);

    const ids = manager.getAllNPCIds();
    expect(ids).toContain('npc-chai-walla');
    expect(ids).toContain('npc-guard');
    expect(ids).toHaveLength(2);
  });

  it('getNPCData returns undefined for unknown NPC ID', () => {
    const manager = new NPCManager();
    expect(manager.getNPCData('nonexistent')).toBeUndefined();
  });

  it('spawnNPC calls gridEngine.addCharacter', () => {
    const manager = new NPCManager();
    manager.spawnNPC(mockScene, mockGridEngine, testNPCDef);

    expect(mockGridEngine.addCharacter).toHaveBeenCalledTimes(1);
    const config = mockGridEngine.addCharacter.mock.calls[0][0];
    expect(config.id).toBe('npc-chai-walla');
    expect(config.startPosition).toEqual({ x: 10, y: 15 });
  });

  it('spawnNPC calls gridEngine.moveRandomly with patrol params', () => {
    const manager = new NPCManager();
    manager.spawnNPC(mockScene, mockGridEngine, testNPCDef);

    expect(mockGridEngine.moveRandomly).toHaveBeenCalledWith(
      'npc-chai-walla',
      2000,
      3
    );
  });

  it('stopNPCPatrol calls gridEngine.stopMovement', () => {
    const manager = new NPCManager();
    manager.stopNPCPatrol(mockGridEngine, 'npc-chai-walla');

    expect(mockGridEngine.stopMovement).toHaveBeenCalledWith('npc-chai-walla');
  });

  it('spawnAll spawns multiple NPCs', () => {
    const manager = new NPCManager();
    manager.spawnAll(mockScene, mockGridEngine, [testNPCDef, testNPCDef2]);

    expect(mockGridEngine.addCharacter).toHaveBeenCalledTimes(2);
    expect(mockGridEngine.moveRandomly).toHaveBeenCalledTimes(2);
    expect(manager.getAllNPCIds()).toHaveLength(2);
  });
});
