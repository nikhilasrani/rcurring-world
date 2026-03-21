import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SaveManager } from '../../src/systems/SaveManager';
import type { GameState } from '../../src/utils/types';

function makeGameState(): GameState {
  return {
    version: 1,
    timestamp: Date.now(),
    player: {
      name: 'Test',
      gender: 'male',
      position: { x: 45, y: 35 },
      facing: 'down',
      isRunning: false,
      currentZone: 'mg-road',
      isInInterior: false,
    },
    quests: {},
    inventory: [],
    discovery: {
      zones: ['mg-road'],
      landmarks: ['cubbon-park'],
      npcsMetIds: ['npc-chai-walla'],
      collectedPickupIds: [],
    },
    settings: {
      musicVolume: 0.8,
      sfxVolume: 1.0,
      runDefault: false,
    },
  };
}

describe('SaveManager', () => {
  let save: SaveManager;
  let storage: Record<string, string>;

  beforeEach(() => {
    storage = {};
    // Mock localStorage
    const mockStorage = {
      getItem: vi.fn((key: string) => storage[key] ?? null),
      setItem: vi.fn((key: string, value: string) => { storage[key] = value; }),
      removeItem: vi.fn((key: string) => { delete storage[key]; }),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(() => null),
    };
    vi.stubGlobal('localStorage', mockStorage);
    save = new SaveManager();
  });

  it('save writes GameState to localStorage', () => {
    const state = makeGameState();
    const result = save.save(state);

    expect(result).toBe(true);
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'rcurring-world-save',
      expect.any(String),
    );
  });

  it('load reads GameState from localStorage', () => {
    const state = makeGameState();
    save.save(state);

    const loaded = save.load();
    expect(loaded).not.toBeNull();
    expect(loaded!.player.name).toBe('Test');
    expect(loaded!.version).toBe(1);
    expect(loaded!.discovery.landmarks).toContain('cubbon-park');
  });

  it('load returns null for missing save', () => {
    const loaded = save.load();
    expect(loaded).toBeNull();
  });

  it('load returns null for corrupt JSON', () => {
    storage['rcurring-world-save'] = '{invalid json!!!';
    const loaded = save.load();
    expect(loaded).toBeNull();
  });

  it('hasSave returns true when save exists', () => {
    save.save(makeGameState());
    expect(save.hasSave()).toBe(true);
  });

  it('hasSave returns false when no save exists', () => {
    expect(save.hasSave()).toBe(false);
  });

  it('deleteSave removes the key', () => {
    save.save(makeGameState());
    save.deleteSave();

    expect(save.hasSave()).toBe(false);
    expect(localStorage.removeItem).toHaveBeenCalledWith('rcurring-world-save');
  });

  it('save returns false on QuotaExceededError', () => {
    vi.mocked(localStorage.setItem).mockImplementationOnce(() => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError');
    });

    const result = save.save(makeGameState());
    expect(result).toBe(false);
  });
});
