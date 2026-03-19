import { describe, it, expect } from 'vitest';
import { getMovementDirection } from '../../src/entities/Player';
import {
  WALK_SPEED,
  RUN_SPEED,
  COLLISION_PROPERTY,
  TILE_SIZE,
  MAP_WIDTH_TILES,
  MAP_HEIGHT_TILES,
} from '../../src/utils/constants';

describe('Movement Constants', () => {
  it('walk speed is 4 tiles per second', () => {
    expect(WALK_SPEED).toBe(4);
  });

  it('run speed is 8 tiles per second', () => {
    expect(RUN_SPEED).toBe(8);
  });

  it('tile size is 16px', () => {
    expect(TILE_SIZE).toBe(16);
  });

  it('map is 60x60 tiles', () => {
    expect(MAP_WIDTH_TILES).toBe(60);
    expect(MAP_HEIGHT_TILES).toBe(60);
  });

  it('collision property matches Grid Engine convention', () => {
    expect(COLLISION_PROPERTY).toBe('ge_collide');
  });
});

describe('Direction Priority', () => {
  it('returns null when nothing pressed', () => {
    expect(
      getMovementDirection({
        left: false,
        right: false,
        up: false,
        down: false,
      })
    ).toBeNull();
  });

  it('only one direction returned even with multiple keys', () => {
    const dir = getMovementDirection({
      left: true,
      right: false,
      up: true,
      down: false,
    });
    expect(typeof dir).toBe('string');
    // Should return exactly one direction, not a composite
    expect(['left', 'right', 'up', 'down']).toContain(dir);
  });
});
