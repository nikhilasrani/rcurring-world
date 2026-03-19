import { describe, it, expect } from 'vitest';
import {
  TILE_SIZE,
  GAME_WIDTH,
  GAME_HEIGHT,
  WALK_SPEED,
  RUN_SPEED,
  COLLISION_PROPERTY,
} from '../../src/utils/constants';

describe('Game Constants', () => {
  it('has correct tile size', () => {
    expect(TILE_SIZE).toBe(16);
  });

  it('has correct game dimensions', () => {
    expect(GAME_WIDTH).toBe(480);
    expect(GAME_HEIGHT).toBe(320);
  });

  it('has correct movement speeds', () => {
    expect(WALK_SPEED).toBe(4);
    expect(RUN_SPEED).toBe(8);
    expect(RUN_SPEED).toBe(WALK_SPEED * 2);
  });

  it('has collision property name matching Grid Engine convention', () => {
    expect(COLLISION_PROPERTY).toBe('ge_collide');
  });

  it('visible tiles match game dimensions divided by tile size', () => {
    expect(GAME_WIDTH / TILE_SIZE).toBe(30);
    expect(GAME_HEIGHT / TILE_SIZE).toBe(20);
  });
});
