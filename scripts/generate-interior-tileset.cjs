#!/usr/bin/env node
/**
 * Generate interior tileset for building interiors.
 *
 * 8 columns x 8 rows = 64 tiles at 16x16 pixels = 128x128 pixels.
 * Used by all 4 interior tilemaps (metro, coffee shop, UB City, library).
 *
 * Unlike outdoor tilesets which go through tile-extruder, interior tileset
 * is written directly to public/assets/tilesets/interior.png.
 *
 * Run: node scripts/generate-interior-tileset.cjs
 */

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const TILE = 16;
const COLS = 8;
const ROWS = 8;
const IMG_W = COLS * TILE; // 128
const IMG_H = ROWS * TILE; // 128

const OUT_DIR = path.resolve(__dirname, '..', 'public', 'assets', 'tilesets');
fs.mkdirSync(OUT_DIR, { recursive: true });

// ── Helpers ────────────────────────────────────────────────────────────────

function fillTile(ctx, tx, ty, color) {
  ctx.fillStyle = color;
  ctx.fillRect(tx * TILE, ty * TILE, TILE, TILE);
}

function pixel(ctx, tx, ty, px, py, color) {
  ctx.fillStyle = color;
  ctx.fillRect(tx * TILE + px, ty * TILE + py, 1, 1);
}

function rect(ctx, tx, ty, px, py, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(tx * TILE + px, ty * TILE + py, w, h);
}

function hline(ctx, tx, ty, px, py, len, color) {
  rect(ctx, tx, ty, px, py, len, 1, color);
}

function vline(ctx, tx, ty, px, py, len, color) {
  rect(ctx, tx, ty, px, py, 1, len, color);
}

// ── Generate Interior Tileset ──────────────────────────────────────────────

function generateInterior() {
  const canvas = createCanvas(IMG_W, IMG_H);
  const ctx = canvas.getContext('2d');

  // Fill entire canvas transparent first
  ctx.clearRect(0, 0, IMG_W, IMG_H);

  // ─── Row 0: General Floors ──────────────────────────────────────────

  // Tile 1 (0,0): Gray floor - metro
  fillTile(ctx, 0, 0, '#808080');
  hline(ctx, 0, 0, 0, 7, 16, '#787878');
  vline(ctx, 0, 0, 7, 0, 16, '#787878');

  // Tile 2 (1,0): Wood floor - coffee shop
  fillTile(ctx, 1, 0, '#8B6914');
  for (let y = 0; y < 16; y += 4) {
    hline(ctx, 1, 0, 0, y, 16, '#7A5A10');
  }
  // Wood grain
  for (let i = 0; i < 6; i++) {
    pixel(ctx, 1, 0, (i * 5 + 2) % 16, (i * 3 + 1) % 16, '#9B7924');
  }

  // Tile 3 (2,0): Marble floor - UB City
  fillTile(ctx, 2, 0, '#E8E0D0');
  for (let i = 0; i < 5; i++) {
    pixel(ctx, 2, 0, (i * 7 + 3) % 16, (i * 5 + 2) % 16, '#D8D0C0');
  }
  hline(ctx, 2, 0, 0, 7, 16, '#D0C8B8');
  vline(ctx, 2, 0, 7, 0, 16, '#D0C8B8');

  // Tile 4 (3,0): Dark wood floor - library
  fillTile(ctx, 3, 0, '#5C3A1E');
  for (let y = 0; y < 16; y += 4) {
    hline(ctx, 3, 0, 0, y, 16, '#4C2A0E');
  }
  for (let i = 0; i < 5; i++) {
    pixel(ctx, 3, 0, (i * 5 + 1) % 16, (i * 7 + 3) % 16, '#6C4A2E');
  }

  // Tile 5 (4,0): Tile floor - generic
  fillTile(ctx, 4, 0, '#C0C0C0');
  hline(ctx, 4, 0, 0, 7, 16, '#A8A8A8');
  vline(ctx, 4, 0, 7, 0, 16, '#A8A8A8');
  hline(ctx, 4, 0, 0, 15, 16, '#A8A8A8');
  vline(ctx, 4, 0, 15, 0, 16, '#A8A8A8');

  // Tile 6 (5,0): Carpet - accent
  fillTile(ctx, 5, 0, '#8B3A3A');
  for (let i = 0; i < 8; i++) {
    pixel(ctx, 5, 0, (i * 3 + 2) % 16, (i * 5 + 1) % 16, '#9B4A4A');
  }
  // Border pattern
  hline(ctx, 5, 0, 0, 0, 16, '#7B2A2A');
  hline(ctx, 5, 0, 0, 15, 16, '#7B2A2A');

  // Tile 7 (6,0): Checkered floor (2-color pattern)
  for (let py = 0; py < 16; py++) {
    for (let px = 0; px < 16; px++) {
      const checkX = Math.floor(px / 4);
      const checkY = Math.floor(py / 4);
      ctx.fillStyle = (checkX + checkY) % 2 === 0 ? '#E8E0D0' : '#C0B8A8';
      ctx.fillRect(6 * TILE + px, 0 * TILE + py, 1, 1);
    }
  }

  // Tile 8 (7,0): Welcome mat
  fillTile(ctx, 7, 0, '#6B8E23');
  rect(ctx, 7, 0, 1, 1, 14, 14, '#7B9E33');
  rect(ctx, 7, 0, 2, 2, 12, 12, '#6B8E23');
  // Text-like lines
  hline(ctx, 7, 0, 4, 6, 8, '#8BAE43');
  hline(ctx, 7, 0, 5, 9, 6, '#8BAE43');

  // ─── Row 1: Walls ───────────────────────────────────────────────────

  // Tile 9 (0,1): Gray wall
  fillTile(ctx, 0, 1, '#606060');
  hline(ctx, 0, 1, 0, 15, 16, '#505050');
  hline(ctx, 0, 1, 0, 0, 16, '#707070');

  // Tile 10 (1,1): Brick wall
  fillTile(ctx, 1, 1, '#A0522D');
  for (let y = 0; y < 16; y += 4) {
    hline(ctx, 1, 1, 0, y, 16, '#8B4226');
    const off = (y % 8 === 0) ? 0 : 4;
    for (let x = off; x < 16; x += 8) {
      vline(ctx, 1, 1, x, y, 4, '#8B4226');
    }
  }

  // Tile 11 (2,1): White wall
  fillTile(ctx, 2, 1, '#E8E8E8');
  hline(ctx, 2, 1, 0, 15, 16, '#D0D0D0');
  hline(ctx, 2, 1, 0, 0, 16, '#F0F0F0');

  // Tile 12 (3,1): Wood panel wall
  fillTile(ctx, 3, 1, '#6B4226');
  vline(ctx, 3, 1, 3, 0, 16, '#5B3216');
  vline(ctx, 3, 1, 7, 0, 16, '#5B3216');
  vline(ctx, 3, 1, 11, 0, 16, '#5B3216');
  hline(ctx, 3, 1, 0, 0, 16, '#7B5236');
  hline(ctx, 3, 1, 0, 15, 16, '#5B3216');

  // Tile 13 (4,1): Wall with window
  fillTile(ctx, 4, 1, '#606060');
  rect(ctx, 4, 1, 3, 3, 10, 10, '#78B8D8'); // light blue window
  rect(ctx, 4, 1, 4, 4, 8, 8, '#88C8E8');
  // Window frame
  hline(ctx, 4, 1, 3, 7, 10, '#505050');
  vline(ctx, 4, 1, 7, 3, 10, '#505050');

  // Tile 14 (5,1): Wall with poster
  fillTile(ctx, 5, 1, '#606060');
  rect(ctx, 5, 1, 3, 3, 10, 10, '#D85030'); // colored poster
  rect(ctx, 5, 1, 4, 4, 8, 8, '#E86040');
  // Poster text lines
  hline(ctx, 5, 1, 5, 5, 6, '#F8F8F8');
  hline(ctx, 5, 1, 5, 8, 6, '#F8F8F8');

  // Tile 15 (6,1): Wall top edge
  fillTile(ctx, 6, 1, '#606060');
  hline(ctx, 6, 1, 0, 0, 16, '#505050');
  hline(ctx, 6, 1, 0, 1, 16, '#505050');
  rect(ctx, 6, 1, 0, 2, 16, 14, '#686868');

  // Tile 16 (7,1): Wall corner
  fillTile(ctx, 7, 1, '#606060');
  vline(ctx, 7, 1, 0, 0, 16, '#505050');
  hline(ctx, 7, 1, 0, 0, 16, '#505050');
  vline(ctx, 7, 1, 15, 0, 16, '#707070');
  hline(ctx, 7, 1, 0, 15, 16, '#707070');

  // ─── Row 2: Furniture ───────────────────────────────────────────────

  // Tile 17 (0,2): Table top-left
  fillTile(ctx, 0, 2, '#00000000');
  ctx.clearRect(0 * TILE, 2 * TILE, TILE, TILE);
  rect(ctx, 0, 2, 0, 2, 16, 12, '#8B6914');
  hline(ctx, 0, 2, 0, 2, 16, '#7A5A10');
  vline(ctx, 0, 2, 0, 2, 12, '#7A5A10');
  // Table leg
  rect(ctx, 0, 2, 2, 14, 2, 2, '#5C3A1E');

  // Tile 18 (1,2): Table top-right
  fillTile(ctx, 1, 2, '#00000000');
  ctx.clearRect(1 * TILE, 2 * TILE, TILE, TILE);
  rect(ctx, 1, 2, 0, 2, 16, 12, '#8B6914');
  hline(ctx, 1, 2, 0, 2, 16, '#7A5A10');
  vline(ctx, 1, 2, 15, 2, 12, '#7A5A10');
  // Table leg
  rect(ctx, 1, 2, 12, 14, 2, 2, '#5C3A1E');

  // Tile 19 (2,2): Chair left
  fillTile(ctx, 2, 2, '#00000000');
  ctx.clearRect(2 * TILE, 2 * TILE, TILE, TILE);
  rect(ctx, 2, 2, 2, 0, 12, 4, '#705830'); // back
  rect(ctx, 2, 2, 2, 4, 12, 8, '#906838'); // seat
  // Legs
  rect(ctx, 2, 2, 3, 12, 2, 4, '#604820');
  rect(ctx, 2, 2, 11, 12, 2, 4, '#604820');

  // Tile 20 (3,2): Chair right
  fillTile(ctx, 3, 2, '#00000000');
  ctx.clearRect(3 * TILE, 2 * TILE, TILE, TILE);
  rect(ctx, 3, 2, 2, 0, 12, 4, '#705830');
  rect(ctx, 3, 2, 2, 4, 12, 8, '#906838');
  rect(ctx, 3, 2, 3, 12, 2, 4, '#604820');
  rect(ctx, 3, 2, 11, 12, 2, 4, '#604820');

  // Tile 21 (4,2): Counter left
  fillTile(ctx, 4, 2, '#00000000');
  ctx.clearRect(4 * TILE, 2 * TILE, TILE, TILE);
  rect(ctx, 4, 2, 0, 2, 16, 10, '#8B6914');
  hline(ctx, 4, 2, 0, 2, 16, '#7A5A10');
  rect(ctx, 4, 2, 0, 12, 16, 4, '#6B4226');
  vline(ctx, 4, 2, 0, 2, 14, '#7A5A10');

  // Tile 22 (5,2): Counter middle
  fillTile(ctx, 5, 2, '#00000000');
  ctx.clearRect(5 * TILE, 2 * TILE, TILE, TILE);
  rect(ctx, 5, 2, 0, 2, 16, 10, '#8B6914');
  hline(ctx, 5, 2, 0, 2, 16, '#7A5A10');
  rect(ctx, 5, 2, 0, 12, 16, 4, '#6B4226');

  // Tile 23 (6,2): Counter right
  fillTile(ctx, 6, 2, '#00000000');
  ctx.clearRect(6 * TILE, 2 * TILE, TILE, TILE);
  rect(ctx, 6, 2, 0, 2, 16, 10, '#8B6914');
  hline(ctx, 6, 2, 0, 2, 16, '#7A5A10');
  rect(ctx, 6, 2, 0, 12, 16, 4, '#6B4226');
  vline(ctx, 6, 2, 15, 2, 14, '#7A5A10');

  // Tile 24 (7,2): Bench
  fillTile(ctx, 7, 2, '#00000000');
  ctx.clearRect(7 * TILE, 2 * TILE, TILE, TILE);
  rect(ctx, 7, 2, 1, 5, 14, 3, '#906838');
  hline(ctx, 7, 2, 1, 5, 14, '#805830');
  rect(ctx, 7, 2, 1, 9, 14, 2, '#906838');
  // Legs
  rect(ctx, 7, 2, 2, 11, 2, 4, '#686868');
  rect(ctx, 7, 2, 12, 11, 2, 4, '#686868');

  // ─── Row 3: Shelves & Displays ──────────────────────────────────────

  // Tile 25 (0,3): Bookshelf full
  fillTile(ctx, 0, 3, '#6B4226');
  // Shelves
  for (let y = 0; y < 16; y += 5) {
    hline(ctx, 0, 3, 0, y, 16, '#5B3216');
  }
  // Books
  for (let y = 1; y < 15; y += 5) {
    const colors = ['#C83020', '#2060A0', '#208040', '#D8A030', '#8030A0'];
    for (let x = 1; x < 15; x += 3) {
      rect(ctx, 0, 3, x, y, 2, 4, colors[(x + y) % colors.length]);
    }
  }

  // Tile 26 (1,3): Bookshelf half
  fillTile(ctx, 1, 3, '#6B4226');
  hline(ctx, 1, 3, 0, 0, 16, '#5B3216');
  hline(ctx, 1, 3, 0, 7, 16, '#5B3216');
  hline(ctx, 1, 3, 0, 15, 16, '#5B3216');
  // Books only top half
  const topColors = ['#2060A0', '#C83020', '#208040'];
  for (let x = 1; x < 15; x += 3) {
    rect(ctx, 1, 3, x, 1, 2, 6, topColors[x % topColors.length]);
  }

  // Tile 27 (2,3): Display case
  fillTile(ctx, 2, 3, '#00000000');
  ctx.clearRect(2 * TILE, 3 * TILE, TILE, TILE);
  rect(ctx, 2, 3, 1, 2, 14, 12, '#A8B0B8'); // steel frame
  rect(ctx, 2, 3, 2, 3, 12, 10, '#78B8D8'); // glass front
  rect(ctx, 2, 3, 3, 4, 10, 8, '#88C8E8'); // inner glass
  // Items inside
  rect(ctx, 2, 3, 5, 6, 3, 4, '#D8A030');
  rect(ctx, 2, 3, 9, 7, 3, 3, '#C83020');

  // Tile 28 (3,3): Menu board
  fillTile(ctx, 3, 3, '#2F4F2F');
  rect(ctx, 3, 3, 1, 1, 14, 14, '#3F5F3F');
  // Text lines
  hline(ctx, 3, 3, 3, 3, 10, '#E8E8E0');
  hline(ctx, 3, 3, 3, 6, 8, '#E8E8E0');
  hline(ctx, 3, 3, 3, 9, 10, '#E8E8E0');
  hline(ctx, 3, 3, 3, 12, 6, '#E8E8E0');

  // Tile 29 (4,3): Metro map poster
  fillTile(ctx, 4, 3, '#F0F0E8');
  rect(ctx, 4, 3, 0, 0, 16, 1, '#404040'); // frame top
  rect(ctx, 4, 3, 0, 15, 16, 1, '#404040'); // frame bottom
  vline(ctx, 4, 3, 0, 0, 16, '#404040');
  vline(ctx, 4, 3, 15, 0, 16, '#404040');
  // Metro lines (colored)
  hline(ctx, 4, 3, 2, 5, 12, '#8020A0'); // purple line
  vline(ctx, 4, 3, 8, 2, 12, '#20A040'); // green line
  // Stations
  pixel(ctx, 4, 3, 4, 5, '#C83020');
  pixel(ctx, 4, 3, 8, 5, '#C83020');
  pixel(ctx, 4, 3, 12, 5, '#C83020');
  pixel(ctx, 4, 3, 8, 4, '#C83020');
  pixel(ctx, 4, 3, 8, 10, '#C83020');

  // Tile 30 (5,3): Photo frame
  fillTile(ctx, 5, 3, '#00000000');
  ctx.clearRect(5 * TILE, 3 * TILE, TILE, TILE);
  rect(ctx, 5, 3, 2, 2, 12, 12, '#8B6914'); // frame
  rect(ctx, 5, 3, 3, 3, 10, 10, '#C8E8F0'); // photo bg
  rect(ctx, 5, 3, 5, 5, 6, 6, '#90B850'); // landscape

  // Tile 31 (6,3): Empty shelf
  fillTile(ctx, 6, 3, '#6B4226');
  hline(ctx, 6, 3, 0, 0, 16, '#5B3216');
  hline(ctx, 6, 3, 0, 7, 16, '#5B3216');
  hline(ctx, 6, 3, 0, 15, 16, '#5B3216');

  // Tile 32 (7,3): Potted plant
  fillTile(ctx, 7, 3, '#00000000');
  ctx.clearRect(7 * TILE, 3 * TILE, TILE, TILE);
  rect(ctx, 7, 3, 5, 10, 6, 6, '#B07040'); // pot
  rect(ctx, 7, 3, 6, 11, 4, 4, '#985830');
  // Plant leaves
  rect(ctx, 7, 3, 4, 2, 8, 8, '#228B22');
  rect(ctx, 7, 3, 6, 0, 4, 2, '#228B22');
  for (let i = 0; i < 5; i++) {
    pixel(ctx, 7, 3, (i * 3 + 5) % 10 + 3, (i * 2 + 1) % 8 + 1, '#30A030');
  }

  // ─── Row 4: Doors & Transitions ─────────────────────────────────────

  // Tile 33 (0,4): Door closed
  fillTile(ctx, 0, 4, '#705030');
  rect(ctx, 0, 4, 0, 0, 16, 2, '#886040'); // frame top
  vline(ctx, 0, 4, 0, 0, 16, '#886040');   // frame left
  vline(ctx, 0, 4, 15, 0, 16, '#886040');  // frame right
  // Door panels
  vline(ctx, 0, 4, 7, 3, 12, '#886040');
  hline(ctx, 0, 4, 2, 7, 12, '#886040');
  // Handle
  pixel(ctx, 0, 4, 12, 9, '#F8E870');

  // Tile 34 (1,4): Door open
  fillTile(ctx, 1, 4, '#282828'); // dark inside
  rect(ctx, 1, 4, 0, 0, 16, 2, '#886040'); // frame top
  vline(ctx, 1, 4, 0, 0, 16, '#886040');
  vline(ctx, 1, 4, 15, 0, 16, '#886040');
  // Open door visible on side
  rect(ctx, 1, 4, 12, 2, 3, 14, '#705030');
  pixel(ctx, 1, 4, 12, 9, '#F8E870');

  // Tile 35 (2,4): Exit mat / arrow
  fillTile(ctx, 2, 4, '#8B3A3A');
  // Arrow pointing down
  vline(ctx, 2, 4, 7, 2, 10, '#F8F8F8');
  vline(ctx, 2, 4, 8, 2, 10, '#F8F8F8');
  pixel(ctx, 2, 4, 5, 10, '#F8F8F8');
  pixel(ctx, 2, 4, 6, 11, '#F8F8F8');
  pixel(ctx, 2, 4, 9, 11, '#F8F8F8');
  pixel(ctx, 2, 4, 10, 10, '#F8F8F8');

  // Tile 36 (3,4): Stairs up
  fillTile(ctx, 3, 4, '#B0A898');
  for (let y = 0; y < 16; y += 4) {
    const shade = 0x70 + Math.floor((y / 16) * 0x40);
    ctx.fillStyle = `rgb(${shade},${shade - 8},${shade - 16})`;
    ctx.fillRect(3 * TILE, 4 * TILE + y, TILE, 4);
    ctx.fillStyle = '#282828';
    ctx.fillRect(3 * TILE, 4 * TILE + y, TILE, 1);
  }

  // Tile 37 (4,4): Escalator
  fillTile(ctx, 4, 4, '#A8A8A8');
  // Steps
  for (let y = 0; y < 16; y += 3) {
    hline(ctx, 4, 4, 2, y, 12, '#888888');
    hline(ctx, 4, 4, 2, y + 1, 12, '#989898');
  }
  // Handrails
  vline(ctx, 4, 4, 1, 0, 16, '#606060');
  vline(ctx, 4, 4, 14, 0, 16, '#606060');

  // Tile 38 (5,4): Turnstile / gate
  fillTile(ctx, 5, 4, '#00000000');
  ctx.clearRect(5 * TILE, 4 * TILE, TILE, TILE);
  rect(ctx, 5, 4, 0, 4, 16, 8, '#A8B0B8'); // body
  rect(ctx, 5, 4, 2, 0, 2, 4, '#808080');   // arm top left
  rect(ctx, 5, 4, 12, 0, 2, 4, '#808080');  // arm top right
  // Slot
  rect(ctx, 5, 4, 6, 6, 4, 4, '#404040');
  pixel(ctx, 5, 4, 7, 7, '#30C030'); // green light

  // Tile 39 (6,4): Platform edge (yellow safety line)
  fillTile(ctx, 6, 4, '#808080');
  rect(ctx, 6, 4, 0, 12, 16, 4, '#D8C020'); // yellow safety line
  hline(ctx, 6, 4, 0, 11, 16, '#606060');
  // Textured pattern on yellow
  for (let x = 0; x < 16; x += 4) {
    pixel(ctx, 6, 4, x, 13, '#C0A818');
  }

  // Tile 40 (7,4): Railing
  fillTile(ctx, 7, 4, '#00000000');
  ctx.clearRect(7 * TILE, 4 * TILE, TILE, TILE);
  hline(ctx, 7, 4, 0, 2, 16, '#707070');
  hline(ctx, 7, 4, 0, 3, 16, '#909090');
  vline(ctx, 7, 4, 0, 2, 14, '#707070');
  vline(ctx, 7, 4, 7, 2, 14, '#707070');
  vline(ctx, 7, 4, 15, 2, 14, '#707070');

  // ─── Row 5: Decorative ──────────────────────────────────────────────

  // Tile 41 (0,5): Steaming cup
  fillTile(ctx, 0, 5, '#00000000');
  ctx.clearRect(0 * TILE, 5 * TILE, TILE, TILE);
  rect(ctx, 0, 5, 4, 6, 8, 8, '#F0F0E0'); // cup body
  rect(ctx, 0, 5, 5, 7, 6, 6, '#E0E0D0');
  // Handle
  rect(ctx, 0, 5, 12, 8, 2, 4, '#E0E0D0');
  // Steam
  pixel(ctx, 0, 5, 6, 3, '#C0C0C0');
  pixel(ctx, 0, 5, 8, 2, '#D0D0D0');
  pixel(ctx, 0, 5, 7, 4, '#B0B0B0');
  // Liquid
  rect(ctx, 0, 5, 5, 9, 6, 3, '#6B4226');

  // Tile 42 (1,5): Cash register
  fillTile(ctx, 1, 5, '#00000000');
  ctx.clearRect(1 * TILE, 5 * TILE, TILE, TILE);
  rect(ctx, 1, 5, 2, 4, 12, 10, '#484848'); // body
  rect(ctx, 1, 5, 3, 2, 10, 3, '#585858');  // screen area
  rect(ctx, 1, 5, 4, 2, 8, 2, '#30A060');   // screen
  // Buttons
  for (let x = 3; x < 13; x += 3) {
    for (let y = 7; y < 13; y += 3) {
      pixel(ctx, 1, 5, x, y, '#808080');
    }
  }
  // Drawer
  rect(ctx, 1, 5, 2, 13, 12, 1, '#404040');

  // Tile 43 (2,5): Ticket machine
  fillTile(ctx, 2, 5, '#00000000');
  ctx.clearRect(2 * TILE, 5 * TILE, TILE, TILE);
  rect(ctx, 2, 5, 3, 1, 10, 14, '#606060'); // body
  rect(ctx, 2, 5, 4, 2, 8, 4, '#3080C0');   // screen
  // Buttons
  for (let x = 5; x < 11; x += 2) {
    pixel(ctx, 2, 5, x, 8, '#A0A0A0');
    pixel(ctx, 2, 5, x, 10, '#A0A0A0');
  }
  // Card slot
  rect(ctx, 2, 5, 5, 12, 6, 1, '#404040');

  // Tile 44 (3,5): Trash bin
  fillTile(ctx, 3, 5, '#00000000');
  ctx.clearRect(3 * TILE, 5 * TILE, TILE, TILE);
  rect(ctx, 3, 5, 4, 4, 8, 10, '#607048');
  rect(ctx, 3, 5, 3, 2, 10, 3, '#607050');
  hline(ctx, 3, 5, 3, 2, 10, '#708060');

  // Tile 45 (4,5): Newspaper stack
  fillTile(ctx, 4, 5, '#00000000');
  ctx.clearRect(4 * TILE, 5 * TILE, TILE, TILE);
  // Stack of papers
  for (let i = 0; i < 4; i++) {
    rect(ctx, 4, 5, 3, 8 + i * 2, 10, 2, i % 2 === 0 ? '#F0F0E0' : '#E0E0D0');
    hline(ctx, 4, 5, 4, 9 + i * 2, 6, '#808080');
  }

  // Tile 46 (5,5): Flower vase
  fillTile(ctx, 5, 5, '#00000000');
  ctx.clearRect(5 * TILE, 5 * TILE, TILE, TILE);
  rect(ctx, 5, 5, 5, 8, 6, 8, '#B07040'); // vase
  rect(ctx, 5, 5, 6, 9, 4, 6, '#985830');
  // Flowers
  pixel(ctx, 5, 5, 6, 3, '#E84040');
  pixel(ctx, 5, 5, 8, 2, '#E8D040');
  pixel(ctx, 5, 5, 10, 4, '#D848A0');
  // Stems
  vline(ctx, 5, 5, 7, 4, 4, '#228B22');
  vline(ctx, 5, 5, 9, 5, 3, '#228B22');

  // Tile 47 (6,5): Ceiling light
  fillTile(ctx, 6, 5, '#00000000');
  ctx.clearRect(6 * TILE, 5 * TILE, TILE, TILE);
  rect(ctx, 6, 5, 6, 0, 4, 3, '#808080'); // fixture
  rect(ctx, 6, 5, 4, 3, 8, 2, '#808080'); // shade
  // Glow
  rect(ctx, 6, 5, 5, 5, 6, 4, '#F8E870');
  pixel(ctx, 6, 5, 7, 4, '#F8F0A0');

  // Tile 48 (7,5): Air conditioner
  fillTile(ctx, 7, 5, '#00000000');
  ctx.clearRect(7 * TILE, 5 * TILE, TILE, TILE);
  rect(ctx, 7, 5, 1, 2, 14, 10, '#E0E0E0');
  rect(ctx, 7, 5, 2, 3, 12, 8, '#D0D0D0');
  // Vents
  for (let y = 4; y < 10; y += 2) {
    hline(ctx, 7, 5, 3, y, 10, '#B0B0B0');
  }
  // Power indicator
  pixel(ctx, 7, 5, 12, 4, '#30C030');

  // ─── Row 6-7: Collision & Reserved ──────────────────────────────────

  // Tiles 49-56 (Row 6): Collision tiles (solid, used as invisible blockers)
  for (let x = 0; x < 8; x++) {
    fillTile(ctx, x, 6, '#FF00FF'); // magenta collision marker (invisible in game)
  }

  // Tiles 57-64 (Row 7): Reserved/empty
  for (let x = 0; x < 8; x++) {
    ctx.clearRect(x * TILE, 7 * TILE, TILE, TILE);
  }

  // ── Save ───────────────────────────────────────────────────────────────

  const buf = canvas.toBuffer('image/png');
  const outPath = path.join(OUT_DIR, 'interior.png');
  fs.writeFileSync(outPath, buf);
  console.log(`Interior tileset written: ${outPath} (${IMG_W}x${IMG_H}, ${buf.length} bytes)`);
}

generateInterior();
console.log('Interior tileset generation complete.');
