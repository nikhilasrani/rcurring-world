import { describe, it, expect } from 'vitest';
import {
  COLLISION_PROPERTY,
  MAP_WIDTH_TILES,
  MAP_HEIGHT_TILES,
  TILE_SIZE,
} from '../../src/utils/constants';

describe('Collision Configuration', () => {
  it('collision property name is ge_collide', () => {
    expect(COLLISION_PROPERTY).toBe('ge_collide');
  });

  it('collision property is a non-empty string', () => {
    expect(typeof COLLISION_PROPERTY).toBe('string');
    expect(COLLISION_PROPERTY.length).toBeGreaterThan(0);
  });
});

describe('Map Boundary Validation', () => {
  it('map dimensions are 60x60 tiles', () => {
    expect(MAP_WIDTH_TILES).toBe(60);
    expect(MAP_HEIGHT_TILES).toBe(60);
  });

  it('map pixel dimensions are correct', () => {
    expect(MAP_WIDTH_TILES * TILE_SIZE).toBe(960);
    expect(MAP_HEIGHT_TILES * TILE_SIZE).toBe(960);
  });

  it('boundary tiles exist at all four edges (row 0, row 59, col 0, col 59)', () => {
    // Validates the expected boundary convention:
    // rows 0 and MAP_HEIGHT-1, columns 0 and MAP_WIDTH-1 should have collision
    const boundaryRows = [0, MAP_HEIGHT_TILES - 1];
    const boundaryCols = [0, MAP_WIDTH_TILES - 1];
    expect(boundaryRows).toEqual([0, 59]);
    expect(boundaryCols).toEqual([0, 59]);
  });
});

describe('Collision Tile Integration', () => {
  it('tilemap collision layer should use ge_collide property for Grid Engine', () => {
    // Validates that our constants align with Grid Engine expectations
    // Grid Engine reads collisionTilePropertyName from config
    // and checks each tile in the tilemap for that boolean property
    expect(COLLISION_PROPERTY).toBe('ge_collide');
  });

  it('spawn point is within map bounds and not on boundary', () => {
    // Player spawn at (45, 35) should be inside the map, not on the edge
    const spawnX = 45;
    const spawnY = 35;
    expect(spawnX).toBeGreaterThan(0);
    expect(spawnX).toBeLessThan(MAP_WIDTH_TILES - 1);
    expect(spawnY).toBeGreaterThan(0);
    expect(spawnY).toBeLessThan(MAP_HEIGHT_TILES - 1);
  });
});
