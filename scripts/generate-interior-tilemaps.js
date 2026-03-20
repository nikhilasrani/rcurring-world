#!/usr/bin/env node
/**
 * Generate 4 interior tilemaps in Tiled JSON format.
 *
 * Interiors:
 *   1. Metro station  (15x10)
 *   2. Coffee shop     (12x10)
 *   3. UB City mall    (15x12)
 *   4. Cubbon Park library (12x10)
 *
 * Each tilemap uses the shared interior tileset (interior.png, 64 tiles).
 *
 * Layer structure matches outdoor map convention:
 *   - ground (tile layer): floor tiles
 *   - buildings (tile layer): walls, furniture, counters, shelves
 *   - above-player (tile layer): ceiling details
 *   - collision (tile layer): invisible blocking tiles
 *   - spawn-points (object layer): player-spawn object
 *   - zones (object layer): zone rectangle covering entire interior
 *   - doors (object layer): exit door with returnZone/returnX/returnY
 *
 * Run: node scripts/generate-interior-tilemaps.js
 */

const fs = require('fs');
const path = require('path');

const TILE = 16;

// ── Interior Tile GIDs (1-indexed, single tileset with firstgid=1) ─────

const T = {
  // Row 0: Floors
  GRAY_FLOOR:      1,  // metro
  WOOD_FLOOR:      2,  // coffee
  MARBLE_FLOOR:    3,  // UB City
  DARK_WOOD_FLOOR: 4,  // library
  TILE_FLOOR:      5,
  CARPET:          6,
  CHECKERED:       7,
  WELCOME_MAT:     8,

  // Row 1: Walls
  GRAY_WALL:       9,
  BRICK_WALL:      10,
  WHITE_WALL:      11,
  WOOD_PANEL_WALL: 12,
  WALL_WINDOW:     13,
  WALL_POSTER:     14,
  WALL_TOP_EDGE:   15,
  WALL_CORNER:     16,

  // Row 2: Furniture
  TABLE_TL:        17,
  TABLE_TR:        18,
  CHAIR_LEFT:      19,
  CHAIR_RIGHT:     20,
  COUNTER_LEFT:    21,
  COUNTER_MID:     22,
  COUNTER_RIGHT:   23,
  BENCH:           24,

  // Row 3: Shelves & Displays
  BOOKSHELF_FULL:  25,
  BOOKSHELF_HALF:  26,
  DISPLAY_CASE:    27,
  MENU_BOARD:      28,
  METRO_MAP:       29,
  PHOTO_FRAME:     30,
  EMPTY_SHELF:     31,
  POTTED_PLANT:    32,

  // Row 4: Doors & Transitions
  DOOR_CLOSED:     33,
  DOOR_OPEN:       34,
  EXIT_MAT:        35,
  STAIRS_UP:       36,
  ESCALATOR:       37,
  TURNSTILE:       38,
  PLATFORM_EDGE:   39,
  RAILING:         40,

  // Row 5: Decorative
  STEAMING_CUP:    41,
  CASH_REGISTER:   42,
  TICKET_MACHINE:  43,
  TRASH_BIN:       44,
  NEWSPAPER:       45,
  FLOWER_VASE:     46,
  CEILING_LIGHT:   47,
  AIR_CONDITIONER: 48,

  // Row 6: Collision markers
  COLL1: 49, COLL2: 50, COLL3: 51, COLL4: 52,
  COLL5: 53, COLL6: 54, COLL7: 55, COLL8: 56,
};

// Collision tile
const COLL = T.COLL1;

// ── Helpers ────────────────────────────────────────────────────────────────

function createLayer(w, h, fill = 0) {
  return new Array(w * h).fill(fill);
}

function idx(x, y, w) {
  if (x < 0 || x >= w || y < 0) return -1;
  return y * w + x;
}

function set(layer, x, y, tile, w) {
  const i = idx(x, y, w);
  if (i >= 0 && i < layer.length) layer[i] = tile;
}

function fill(layer, x1, y1, x2, y2, tile, w) {
  for (let y = y1; y <= y2; y++) {
    for (let x = x1; x <= x2; x++) {
      set(layer, x, y, tile, w);
    }
  }
}

function buildTileLayer(name, data, w, h, id, visible = true) {
  return {
    data,
    height: h,
    id,
    name,
    opacity: 1,
    type: 'tilelayer',
    visible,
    width: w,
    x: 0,
    y: 0,
  };
}

function buildObjectLayer(name, objects, id) {
  return {
    draworder: 'topdown',
    id,
    name,
    objects,
    opacity: 1,
    type: 'objectgroup',
    visible: true,
    x: 0,
    y: 0,
  };
}

function buildTileset() {
  // Collision tile properties: tiles 49-56 (local IDs 48-55)
  // plus furniture: 17-24 (local 16-23), shelves: 25-31 (local 24-30)
  const collisionLocalIds = [];
  // Collision marker tiles (row 6)
  for (let i = 48; i <= 55; i++) collisionLocalIds.push(i);
  // Furniture tiles that should block
  for (let i = 16; i <= 23; i++) collisionLocalIds.push(i);
  // Shelves tiles that should block
  for (let i = 24; i <= 30; i++) collisionLocalIds.push(i);

  const tiles = collisionLocalIds.map(id => ({
    id,
    properties: [{
      name: 'ge_collide',
      type: 'bool',
      value: true,
    }],
  }));

  return {
    columns: 8,
    firstgid: 1,
    image: '../tilesets/interior.png',
    imageheight: 128,
    imagewidth: 128,
    margin: 0,
    name: 'interior',
    spacing: 0,
    tilecount: 64,
    tileheight: TILE,
    tilewidth: TILE,
    tiles,
  };
}

function buildTilemap(name, w, h, layers, objectLayers) {
  const allLayers = [
    ...layers,
    ...objectLayers,
  ];

  return {
    compressionlevel: -1,
    height: h,
    infinite: false,
    layers: allLayers,
    nextlayerid: allLayers.length + 1,
    nextobjectid: 100,
    orientation: 'orthogonal',
    renderorder: 'right-down',
    tiledversion: '1.10.2',
    tileheight: TILE,
    tilesets: [buildTileset()],
    tilewidth: TILE,
    type: 'map',
    version: '1.10',
    width: w,
  };
}

function makeSpawnPoint(id, x, y) {
  return {
    id,
    name: 'player-spawn',
    type: 'spawn',
    x: x * TILE,
    y: y * TILE,
    width: TILE,
    height: TILE,
    visible: true,
    properties: [{
      name: 'direction',
      type: 'string',
      value: 'up',
    }],
  };
}

function makeZone(id, name, displayName, w, h) {
  return {
    id,
    name,
    type: 'zone',
    x: 0,
    y: 0,
    width: w * TILE,
    height: h * TILE,
    visible: true,
    properties: [{
      name: 'displayName',
      type: 'string',
      value: displayName,
    }],
  };
}

function makeExitDoor(id, x, y, returnZone, returnX, returnY) {
  return {
    id,
    name: 'exit',
    type: 'door',
    x: x * TILE,
    y: y * TILE,
    width: TILE,
    height: TILE,
    visible: true,
    properties: [
      { name: 'returnZone', type: 'string', value: returnZone },
      { name: 'returnX', type: 'int', value: returnX },
      { name: 'returnY', type: 'int', value: returnY },
    ],
  };
}

// ── Metro Station (15x10) ──────────────────────────────────────────────────

function generateMetro() {
  const W = 15, H = 10;

  const ground = createLayer(W, H);
  const buildings = createLayer(W, H);
  const abovePlayer = createLayer(W, H);
  const collision = createLayer(W, H);

  // Floor: gray throughout
  fill(ground, 0, 0, W - 1, H - 1, T.GRAY_FLOOR, W);

  // Platform edge along south side (y=8-9)
  fill(ground, 0, 8, W - 1, 8, T.PLATFORM_EDGE, W);
  fill(ground, 0, 9, W - 1, 9, T.TILE_FLOOR, W);

  // Welcome mat at entrance
  set(ground, 7, 9, T.WELCOME_MAT, W);

  // Walls: north, east, west
  fill(buildings, 0, 0, W - 1, 0, T.GRAY_WALL, W);
  fill(buildings, 0, 0, 0, H - 1, T.GRAY_WALL, W);
  fill(buildings, W - 1, 0, W - 1, H - 1, T.GRAY_WALL, W);

  // Corners
  set(buildings, 0, 0, T.WALL_CORNER, W);
  set(buildings, W - 1, 0, T.WALL_CORNER, W);

  // Metro map poster on north wall
  set(buildings, 7, 0, T.METRO_MAP, W);
  set(buildings, 8, 0, T.WALL_POSTER, W);

  // Ticket counter (counter tiles) at x=2..5, y=3
  set(buildings, 2, 3, T.COUNTER_LEFT, W);
  set(buildings, 3, 3, T.COUNTER_MID, W);
  set(buildings, 4, 3, T.COUNTER_MID, W);
  set(buildings, 5, 3, T.COUNTER_RIGHT, W);

  // Ticket machine near counter
  set(buildings, 6, 3, T.TICKET_MACHINE, W);

  // Benches (y=5, y=6)
  set(buildings, 2, 5, T.BENCH, W);
  set(buildings, 5, 5, T.BENCH, W);
  set(buildings, 9, 5, T.BENCH, W);
  set(buildings, 12, 5, T.BENCH, W);

  // Turnstile near entrance (y=7)
  set(buildings, 6, 7, T.TURNSTILE, W);
  set(buildings, 8, 7, T.TURNSTILE, W);

  // Trash bins
  set(buildings, 1, 7, T.TRASH_BIN, W);
  set(buildings, 13, 7, T.TRASH_BIN, W);

  // Ceiling lights
  set(abovePlayer, 4, 1, T.CEILING_LIGHT, W);
  set(abovePlayer, 10, 1, T.CEILING_LIGHT, W);

  // Collision: walls
  fill(collision, 0, 0, W - 1, 0, COLL, W); // north wall
  fill(collision, 0, 0, 0, H - 1, COLL, W); // west wall
  fill(collision, W - 1, 0, W - 1, H - 1, COLL, W); // east wall
  // Counter
  fill(collision, 2, 3, 6, 3, COLL, W);
  // Benches
  set(collision, 2, 5, COLL, W);
  set(collision, 5, 5, COLL, W);
  set(collision, 9, 5, COLL, W);
  set(collision, 12, 5, COLL, W);
  // Turnstiles
  set(collision, 6, 7, COLL, W);
  set(collision, 8, 7, COLL, W);
  // Trash bins
  set(collision, 1, 7, COLL, W);
  set(collision, 13, 7, COLL, W);
  // Platform edge blocks (gap at x=7 for exit path)
  fill(collision, 0, 8, 6, 8, COLL, W);
  fill(collision, 8, 8, W - 1, 8, COLL, W);

  // Objects
  const spawnPoints = [makeSpawnPoint(1, 7, 6)];
  const zones = [makeZone(2, 'interior-metro', 'Metro Station', W, H)];
  const doors = [makeExitDoor(3, 7, 9, 'mg-road', 45, 36)];

  const tileLayers = [
    buildTileLayer('ground', ground, W, H, 1),
    buildTileLayer('buildings', buildings, W, H, 2),
    buildTileLayer('above-player', abovePlayer, W, H, 3),
    buildTileLayer('collision', collision, W, H, 4, false),
  ];
  const objectLayers = [
    buildObjectLayer('spawn-points', spawnPoints, 5),
    buildObjectLayer('zones', zones, 6),
    buildObjectLayer('doors', doors, 7),
  ];

  return buildTilemap('interior-metro', W, H, tileLayers, objectLayers);
}

// ── Coffee Shop (12x10) ───────────────────────────────────────────────────

function generateCoffee() {
  const W = 12, H = 10;

  const ground = createLayer(W, H);
  const buildings = createLayer(W, H);
  const abovePlayer = createLayer(W, H);
  const collision = createLayer(W, H);

  // Floor: warm wood
  fill(ground, 0, 0, W - 1, H - 1, T.WOOD_FLOOR, W);

  // Welcome mat at entrance (south center)
  set(ground, 5, 9, T.WELCOME_MAT, W);

  // Carpet accent area in middle
  fill(ground, 3, 4, 8, 6, T.CARPET, W);

  // Walls: north, east, west
  fill(buildings, 0, 0, W - 1, 0, T.BRICK_WALL, W);
  fill(buildings, 0, 0, 0, H - 1, T.BRICK_WALL, W);
  fill(buildings, W - 1, 0, W - 1, H - 1, T.BRICK_WALL, W);

  // South wall with door opening at x=5
  fill(buildings, 0, 9, 4, 9, T.BRICK_WALL, W);
  fill(buildings, 6, 9, W - 1, 9, T.BRICK_WALL, W);

  // Counter along north wall (y=1) with steaming cups
  set(buildings, 2, 1, T.COUNTER_LEFT, W);
  set(buildings, 3, 1, T.COUNTER_MID, W);
  set(buildings, 4, 1, T.COUNTER_MID, W);
  set(buildings, 5, 1, T.COUNTER_MID, W);
  set(buildings, 6, 1, T.COUNTER_RIGHT, W);
  // Steaming cups on counter
  set(buildings, 3, 0, T.STEAMING_CUP, W);
  set(buildings, 5, 0, T.STEAMING_CUP, W);
  // Cash register
  set(buildings, 7, 1, T.CASH_REGISTER, W);

  // Menu board on east wall
  set(buildings, W - 1, 3, T.MENU_BOARD, W);

  // 3 tables (2x1) with chairs
  // Table 1
  set(buildings, 2, 4, T.TABLE_TL, W);
  set(buildings, 3, 4, T.TABLE_TR, W);
  set(buildings, 1, 4, T.CHAIR_LEFT, W);
  set(buildings, 4, 4, T.CHAIR_RIGHT, W);

  // Table 2
  set(buildings, 7, 4, T.TABLE_TL, W);
  set(buildings, 8, 4, T.TABLE_TR, W);
  set(buildings, 6, 4, T.CHAIR_LEFT, W);
  set(buildings, 9, 4, T.CHAIR_RIGHT, W);

  // Table 3
  set(buildings, 4, 7, T.TABLE_TL, W);
  set(buildings, 5, 7, T.TABLE_TR, W);
  set(buildings, 3, 7, T.CHAIR_LEFT, W);
  set(buildings, 6, 7, T.CHAIR_RIGHT, W);

  // Potted plants in corners
  set(buildings, 1, 1, T.POTTED_PLANT, W);
  set(buildings, 10, 1, T.POTTED_PLANT, W);

  // Flower vase decoration
  set(buildings, 1, 8, T.FLOWER_VASE, W);

  // Ceiling lights
  set(abovePlayer, 3, 2, T.CEILING_LIGHT, W);
  set(abovePlayer, 8, 2, T.CEILING_LIGHT, W);

  // Air conditioner on north wall
  set(abovePlayer, 9, 0, T.AIR_CONDITIONER, W);

  // Collision: walls
  fill(collision, 0, 0, W - 1, 0, COLL, W);
  fill(collision, 0, 0, 0, H - 1, COLL, W);
  fill(collision, W - 1, 0, W - 1, H - 1, COLL, W);
  // South wall (except door)
  fill(collision, 0, 9, 4, 9, COLL, W);
  fill(collision, 6, 9, W - 1, 9, COLL, W);
  // Counter
  fill(collision, 2, 1, 7, 1, COLL, W);
  // Tables & chairs
  fill(collision, 1, 4, 4, 4, COLL, W);
  fill(collision, 6, 4, 9, 4, COLL, W);
  fill(collision, 3, 7, 6, 7, COLL, W);
  // Potted plants
  set(collision, 1, 1, COLL, W);
  set(collision, 10, 1, COLL, W);

  // Objects
  const spawnPoints = [makeSpawnPoint(1, 5, 8)];
  const zones = [makeZone(2, 'interior-coffee', 'Coffee Shop', W, H)];
  const doors = [makeExitDoor(3, 5, 9, 'mg-road', 27, 42)];

  const tileLayers = [
    buildTileLayer('ground', ground, W, H, 1),
    buildTileLayer('buildings', buildings, W, H, 2),
    buildTileLayer('above-player', abovePlayer, W, H, 3),
    buildTileLayer('collision', collision, W, H, 4, false),
  ];
  const objectLayers = [
    buildObjectLayer('spawn-points', spawnPoints, 5),
    buildObjectLayer('zones', zones, 6),
    buildObjectLayer('doors', doors, 7),
  ];

  return buildTilemap('interior-coffee', W, H, tileLayers, objectLayers);
}

// ── UB City Mall (15x12) ──────────────────────────────────────────────────

function generateUBCity() {
  const W = 15, H = 12;

  const ground = createLayer(W, H);
  const buildings = createLayer(W, H);
  const abovePlayer = createLayer(W, H);
  const collision = createLayer(W, H);

  // Floor: marble with checkered pattern accent
  fill(ground, 0, 0, W - 1, H - 1, T.MARBLE_FLOOR, W);
  // Checkered center aisle
  fill(ground, 3, 3, 11, 8, T.CHECKERED, W);

  // Welcome mat
  set(ground, 7, 11, T.WELCOME_MAT, W);

  // Walls: north, east, west
  fill(buildings, 0, 0, W - 1, 0, T.WHITE_WALL, W);
  fill(buildings, 0, 0, 0, H - 1, T.WHITE_WALL, W);
  fill(buildings, W - 1, 0, W - 1, H - 1, T.WHITE_WALL, W);

  // South wall with door opening
  fill(buildings, 0, 11, 6, 11, T.WHITE_WALL, W);
  fill(buildings, 8, 11, W - 1, 11, T.WHITE_WALL, W);

  // Wall windows
  set(buildings, 3, 0, T.WALL_WINDOW, W);
  set(buildings, 7, 0, T.WALL_WINDOW, W);
  set(buildings, 11, 0, T.WALL_WINDOW, W);

  // Escalator on west side
  set(buildings, 1, 3, T.ESCALATOR, W);
  set(buildings, 1, 4, T.ESCALATOR, W);
  set(buildings, 1, 5, T.ESCALATOR, W);

  // Display cases along walls
  set(buildings, 3, 1, T.DISPLAY_CASE, W);
  set(buildings, 5, 1, T.DISPLAY_CASE, W);
  set(buildings, 9, 1, T.DISPLAY_CASE, W);
  set(buildings, 11, 1, T.DISPLAY_CASE, W);
  // East wall display cases
  set(buildings, W - 1, 3, T.DISPLAY_CASE, W);
  set(buildings, W - 1, 5, T.DISPLAY_CASE, W);
  set(buildings, W - 1, 7, T.DISPLAY_CASE, W);

  // Potted plants
  set(buildings, 2, 2, T.POTTED_PLANT, W);
  set(buildings, 12, 2, T.POTTED_PLANT, W);
  set(buildings, 2, 9, T.POTTED_PLANT, W);
  set(buildings, 12, 9, T.POTTED_PLANT, W);

  // Photo frames / posters on walls
  set(buildings, 0, 5, T.PHOTO_FRAME, W);
  set(buildings, 0, 8, T.WALL_POSTER, W);

  // Benches in center
  set(buildings, 5, 6, T.BENCH, W);
  set(buildings, 9, 6, T.BENCH, W);

  // Ceiling lights
  set(abovePlayer, 4, 2, T.CEILING_LIGHT, W);
  set(abovePlayer, 10, 2, T.CEILING_LIGHT, W);
  set(abovePlayer, 7, 5, T.CEILING_LIGHT, W);

  // Air conditioners
  set(abovePlayer, 5, 0, T.AIR_CONDITIONER, W);
  set(abovePlayer, 9, 0, T.AIR_CONDITIONER, W);

  // Collision: walls
  fill(collision, 0, 0, W - 1, 0, COLL, W);
  fill(collision, 0, 0, 0, H - 1, COLL, W);
  fill(collision, W - 1, 0, W - 1, H - 1, COLL, W);
  // South wall except door
  fill(collision, 0, 11, 6, 11, COLL, W);
  fill(collision, 8, 11, W - 1, 11, COLL, W);
  // Escalator
  fill(collision, 1, 3, 1, 5, COLL, W);
  // Display cases on north
  set(collision, 3, 1, COLL, W);
  set(collision, 5, 1, COLL, W);
  set(collision, 9, 1, COLL, W);
  set(collision, 11, 1, COLL, W);
  // Potted plants
  set(collision, 2, 2, COLL, W);
  set(collision, 12, 2, COLL, W);
  set(collision, 2, 9, COLL, W);
  set(collision, 12, 9, COLL, W);
  // Benches
  set(collision, 5, 6, COLL, W);
  set(collision, 9, 6, COLL, W);

  // Objects
  const spawnPoints = [makeSpawnPoint(1, 7, 10)];
  const zones = [makeZone(2, 'interior-ubcity', 'UB City', W, H)];
  const doors = [makeExitDoor(3, 7, 11, 'mg-road', 28, 41)];

  const tileLayers = [
    buildTileLayer('ground', ground, W, H, 1),
    buildTileLayer('buildings', buildings, W, H, 2),
    buildTileLayer('above-player', abovePlayer, W, H, 3),
    buildTileLayer('collision', collision, W, H, 4, false),
  ];
  const objectLayers = [
    buildObjectLayer('spawn-points', spawnPoints, 5),
    buildObjectLayer('zones', zones, 6),
    buildObjectLayer('doors', doors, 7),
  ];

  return buildTilemap('interior-ubcity', W, H, tileLayers, objectLayers);
}

// ── Cubbon Park Library (12x10) ────────────────────────────────────────────

function generateLibrary() {
  const W = 12, H = 10;

  const ground = createLayer(W, H);
  const buildings = createLayer(W, H);
  const abovePlayer = createLayer(W, H);
  const collision = createLayer(W, H);

  // Floor: dark wood
  fill(ground, 0, 0, W - 1, H - 1, T.DARK_WOOD_FLOOR, W);

  // Carpet area in reading section
  fill(ground, 3, 4, 8, 7, T.CARPET, W);

  // Welcome mat
  set(ground, 5, 9, T.WELCOME_MAT, W);

  // Walls: north, east, west (wood panel)
  fill(buildings, 0, 0, W - 1, 0, T.WOOD_PANEL_WALL, W);
  fill(buildings, 0, 0, 0, H - 1, T.WOOD_PANEL_WALL, W);
  fill(buildings, W - 1, 0, W - 1, H - 1, T.WOOD_PANEL_WALL, W);

  // South wall with door opening
  fill(buildings, 0, 9, 4, 9, T.WOOD_PANEL_WALL, W);
  fill(buildings, 6, 9, W - 1, 9, T.WOOD_PANEL_WALL, W);

  // Bookshelves covering north wall (y=0, on top of wall)
  fill(buildings, 1, 0, W - 2, 0, T.BOOKSHELF_FULL, W);

  // Bookshelves on east wall
  set(buildings, W - 1, 2, T.BOOKSHELF_FULL, W);
  set(buildings, W - 1, 3, T.BOOKSHELF_FULL, W);
  set(buildings, W - 1, 4, T.BOOKSHELF_HALF, W);
  set(buildings, W - 1, 5, T.BOOKSHELF_FULL, W);
  set(buildings, W - 1, 6, T.BOOKSHELF_FULL, W);
  set(buildings, W - 1, 7, T.BOOKSHELF_HALF, W);

  // Additional bookshelf row (freestanding, y=2)
  set(buildings, 2, 2, T.BOOKSHELF_FULL, W);
  set(buildings, 3, 2, T.BOOKSHELF_FULL, W);
  set(buildings, 4, 2, T.BOOKSHELF_HALF, W);

  // Reading table 1 with chairs
  set(buildings, 4, 5, T.TABLE_TL, W);
  set(buildings, 5, 5, T.TABLE_TR, W);
  set(buildings, 3, 5, T.CHAIR_LEFT, W);
  set(buildings, 6, 5, T.CHAIR_RIGHT, W);

  // Reading table 2 with chairs
  set(buildings, 7, 5, T.TABLE_TL, W);
  set(buildings, 8, 5, T.TABLE_TR, W);
  set(buildings, 9, 5, T.CHAIR_RIGHT, W);

  // Photo frames on south wall
  set(buildings, 2, 9, T.PHOTO_FRAME, W);
  set(buildings, 8, 9, T.PHOTO_FRAME, W);

  // Potted plant in corner
  set(buildings, 1, 8, T.POTTED_PLANT, W);
  set(buildings, 10, 1, T.POTTED_PLANT, W);

  // Newspaper stack on a table
  set(buildings, 1, 5, T.NEWSPAPER, W);

  // Flower vase
  set(buildings, 10, 8, T.FLOWER_VASE, W);

  // Ceiling lights
  set(abovePlayer, 3, 1, T.CEILING_LIGHT, W);
  set(abovePlayer, 8, 1, T.CEILING_LIGHT, W);

  // Collision: walls
  fill(collision, 0, 0, W - 1, 0, COLL, W);
  fill(collision, 0, 0, 0, H - 1, COLL, W);
  fill(collision, W - 1, 0, W - 1, H - 1, COLL, W);
  // South wall except door
  fill(collision, 0, 9, 4, 9, COLL, W);
  fill(collision, 6, 9, W - 1, 9, COLL, W);
  // Freestanding bookshelves
  fill(collision, 2, 2, 4, 2, COLL, W);
  // Tables & chairs
  fill(collision, 3, 5, 6, 5, COLL, W);
  fill(collision, 7, 5, 9, 5, COLL, W);
  // Potted plants
  set(collision, 1, 8, COLL, W);
  set(collision, 10, 1, COLL, W);
  // Newspaper
  set(collision, 1, 5, COLL, W);

  // Objects
  const spawnPoints = [makeSpawnPoint(1, 5, 8)];
  const zones = [makeZone(2, 'interior-library', 'Cubbon Park Library', W, H)];
  const doors = [makeExitDoor(3, 5, 9, 'mg-road', 10, 28)];

  const tileLayers = [
    buildTileLayer('ground', ground, W, H, 1),
    buildTileLayer('buildings', buildings, W, H, 2),
    buildTileLayer('above-player', abovePlayer, W, H, 3),
    buildTileLayer('collision', collision, W, H, 4, false),
  ];
  const objectLayers = [
    buildObjectLayer('spawn-points', spawnPoints, 5),
    buildObjectLayer('zones', zones, 6),
    buildObjectLayer('doors', doors, 7),
  ];

  return buildTilemap('interior-library', W, H, tileLayers, objectLayers);
}

// ── Main ───────────────────────────────────────────────────────────────────

const outDir = path.resolve(__dirname, '..', 'public', 'assets', 'tilemaps');
fs.mkdirSync(outDir, { recursive: true });

const maps = [
  { name: 'interior-metro', gen: generateMetro },
  { name: 'interior-coffee', gen: generateCoffee },
  { name: 'interior-ubcity', gen: generateUBCity },
  { name: 'interior-library', gen: generateLibrary },
];

for (const { name, gen } of maps) {
  const tilemap = gen();
  const outPath = path.join(outDir, `${name}.json`);
  fs.writeFileSync(outPath, JSON.stringify(tilemap, null, 2));
  console.log(`Tilemap written: ${outPath} (${tilemap.width}x${tilemap.height})`);
}

console.log(`\nAll ${maps.length} interior tilemaps generated.`);
