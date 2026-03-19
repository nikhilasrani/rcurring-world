#!/usr/bin/env node
/**
 * Generate GBA-quality pixel art tilesets for MG Road / CBD zone.
 *
 * Each tileset is a grid of 16x16 tiles with a strict limited palette.
 * Outputs raw (pre-extrusion) PNGs to raw-tilesets/.
 *
 * Run: node scripts/generate-tilesets.js
 */

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const TILE = 16;
const RAW_DIR = path.resolve(__dirname, '..', 'raw-tilesets');

fs.mkdirSync(RAW_DIR, { recursive: true });

// ─── GBA-Inspired Palette ──────────────────────────────────────────────────
const PAL = {
  // Ground
  asphalt:       '#4a4a4a',
  asphaltDark:   '#3a3a3a',
  sidewalk:      '#b8b0a0',
  sidewalkLight: '#d0c8b8',
  crosswalk:     '#e8e0d0',
  grass1:        '#58a028',
  grass2:        '#489020',
  grass3:        '#68b030',
  lawn:          '#60a830',
  dirt:          '#a08050',
  dirtLight:     '#b89060',
  pavedPath:     '#c0b098',
  water:         '#3880c0',
  waterLight:    '#50a0d8',
  metroFloor:    '#909088',
  indoorFloor:   '#c8b898',

  // Elevation
  stairLight:    '#c8c0b0',
  stairMid:      '#a8a098',
  stairDark:     '#888078',
  elevatedPath:  '#d8d0c0',
  overpassRoad:  '#585858',
  overpassEdge:  '#686868',

  // Buildings
  brick:         '#b85030',
  brickDark:     '#984028',
  concrete:      '#a0a0a0',
  concreteDark:  '#808080',
  glass:         '#78b8d8',
  glassDark:     '#6098b0',
  sandstone:     '#d8c890',
  sandstoneDark: '#c0b078',
  cream:         '#e8d8b0',
  creamDark:     '#d0c098',
  steel:         '#a8b0b8',
  steelDark:     '#8898a0',
  door:          '#705030',
  doorFrame:     '#886040',
  roof:          '#785040',
  roofDark:      '#604030',
  pillar:        '#d0c8b8',
  pillarDark:    '#b0a898',
  railing:       '#707070',
  railingLight:  '#909090',

  // Nature
  treeTrunk:     '#705830',
  treeCanopy:    '#388020',
  treeCanopyL:   '#48a028',
  coconutTrunk:  '#907048',
  palmLeaf:      '#389828',
  bougainvillea: '#d848a0',
  bougainvGreen: '#48a030',
  hedge:         '#308018',
  hedgeDark:     '#287010',
  flower1:       '#e84040',
  flower2:       '#e8d040',
  pot:           '#b07040',
  benchWood:     '#906838',
  benchMetal:    '#686868',
  fountainStone: '#b0a898',
  fountainWater: '#60b8e0',
  fencePole:     '#808080',
  fenceWire:     '#a0a0a0',
  stoneWall:     '#989088',

  // Decorations
  cartWood:      '#a07838',
  cartCloth:     '#e04030',
  fruit1:        '#e0a020',
  fruit2:        '#c83020',
  sugarcane:     '#90b850',
  flowerBasket:  '#d070b0',
  autoYellow:    '#d8c020',
  autoGreen:     '#38a030',
  autoBody:      '#c8b818',
  twoWheeler:    '#484848',
  lamppost:      '#606060',
  lampGlow:      '#f8e870',
  trafficLight:  '#505050',
  trafficRed:    '#e03030',
  trafficGreen:  '#30c030',
  hydrant:       '#d03030',
  dustbin:       '#607048',
  signBoard:     '#3060a0',
  signText:      '#e8e8e8',
  shopSign:      '#c85020',
  busSign:       '#206898',
  metroPillar:   '#b0b0b0',
  metroSign:     '#0060a0',

  // Common
  black:         '#000000',
  white:         '#f8f8f8',
  shadow:        '#282828',
  transparent:   '#00000000',
};

// ─── Helpers ────────────────────────────────────────────────────────────────

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

function savePNG(canvas, name) {
  const buf = canvas.toBuffer('image/png');
  const out = path.join(RAW_DIR, name);
  fs.writeFileSync(out, buf);
  console.log(`  Written: ${out} (${buf.length} bytes)`);
}

// ─── GROUND TILESET ─────────────────────────────────────────────────────────
// 16 columns x 2 rows = 32 tiles max, using ~24
function generateGround() {
  const cols = 16, rows = 2;
  const canvas = createCanvas(cols * TILE, rows * TILE);
  const ctx = canvas.getContext('2d');

  // Tile 0: asphalt road
  fillTile(ctx, 0, 0, PAL.asphalt);
  // Subtle texture dots
  for (let i = 0; i < 6; i++) {
    pixel(ctx, 0, 0, (i*3+2)%16, (i*5+1)%16, PAL.asphaltDark);
  }

  // Tile 1: asphalt dark (variation)
  fillTile(ctx, 1, 0, PAL.asphaltDark);
  for (let i = 0; i < 4; i++) {
    pixel(ctx, 1, 0, (i*5+3)%16, (i*3+4)%16, PAL.asphalt);
  }

  // Tile 2: sidewalk
  fillTile(ctx, 2, 0, PAL.sidewalk);
  // Grid pattern for paving stones
  hline(ctx, 2, 0, 0, 7, 16, PAL.sidewalkLight);
  vline(ctx, 2, 0, 7, 0, 16, PAL.sidewalkLight);

  // Tile 3: sidewalk (light variant)
  fillTile(ctx, 3, 0, PAL.sidewalkLight);
  hline(ctx, 3, 0, 0, 7, 16, PAL.sidewalk);
  vline(ctx, 3, 0, 7, 0, 16, PAL.sidewalk);

  // Tile 4: crosswalk stripes
  fillTile(ctx, 4, 0, PAL.asphalt);
  for (let y = 0; y < 16; y += 4) {
    rect(ctx, 4, 0, 0, y, 16, 2, PAL.crosswalk);
  }

  // Tile 5: grass 1
  fillTile(ctx, 5, 0, PAL.grass1);
  for (let i = 0; i < 8; i++) {
    pixel(ctx, 5, 0, (i*7+1)%16, (i*5+2)%16, PAL.grass2);
  }

  // Tile 6: grass 2
  fillTile(ctx, 6, 0, PAL.grass2);
  for (let i = 0; i < 8; i++) {
    pixel(ctx, 6, 0, (i*5+3)%16, (i*7+1)%16, PAL.grass3);
  }

  // Tile 7: grass 3
  fillTile(ctx, 7, 0, PAL.grass3);
  for (let i = 0; i < 6; i++) {
    pixel(ctx, 7, 0, (i*3+4)%16, (i*11+3)%16, PAL.grass1);
  }

  // Tile 8: trimmed lawn
  fillTile(ctx, 8, 0, PAL.lawn);
  for (let x = 0; x < 16; x += 2) {
    pixel(ctx, 8, 0, x, (x*3+2)%16, PAL.grass1);
  }

  // Tile 9: indoor floor
  fillTile(ctx, 9, 0, PAL.indoorFloor);
  hline(ctx, 9, 0, 0, 7, 16, PAL.sidewalk);
  vline(ctx, 9, 0, 7, 0, 16, PAL.sidewalk);
  hline(ctx, 9, 0, 0, 15, 16, PAL.sidewalk);
  vline(ctx, 9, 0, 15, 0, 16, PAL.sidewalk);

  // Tile 10: metro station floor
  fillTile(ctx, 10, 0, PAL.metroFloor);
  hline(ctx, 10, 0, 0, 7, 16, PAL.concreteDark);
  vline(ctx, 10, 0, 7, 0, 16, PAL.concreteDark);

  // Tile 11: dirt path
  fillTile(ctx, 11, 0, PAL.dirt);
  for (let i = 0; i < 10; i++) {
    pixel(ctx, 11, 0, (i*7+2)%16, (i*3+5)%16, PAL.dirtLight);
  }

  // Tile 12: paved walkway
  fillTile(ctx, 12, 0, PAL.pavedPath);
  hline(ctx, 12, 0, 0, 3, 16, PAL.sidewalk);
  hline(ctx, 12, 0, 0, 11, 16, PAL.sidewalk);

  // Tile 13: water
  fillTile(ctx, 13, 0, PAL.water);
  for (let y = 2; y < 14; y += 4) {
    hline(ctx, 13, 0, 2, y, 4, PAL.waterLight);
    hline(ctx, 13, 0, 10, y + 2, 4, PAL.waterLight);
  }

  // Tile 14: stair steps (top-view, 3 gradations)
  fillTile(ctx, 14, 0, PAL.stairLight);
  rect(ctx, 14, 0, 0, 0, 16, 5, PAL.stairDark);
  rect(ctx, 14, 0, 0, 5, 16, 5, PAL.stairMid);
  rect(ctx, 14, 0, 0, 10, 16, 6, PAL.stairLight);
  // Step edges
  hline(ctx, 14, 0, 0, 4, 16, PAL.shadow);
  hline(ctx, 14, 0, 0, 9, 16, PAL.stairDark);

  // Tile 15: elevated path surface
  fillTile(ctx, 15, 0, PAL.elevatedPath);
  // Light shadow at edges to show it's raised
  hline(ctx, 15, 0, 0, 0, 16, PAL.stairMid);
  hline(ctx, 15, 0, 0, 15, 16, PAL.stairMid);
  for (let i = 0; i < 5; i++) {
    pixel(ctx, 15, 0, (i*5+3)%16, (i*3+4)%16, PAL.stairLight);
  }

  // Row 2
  // Tile 16: overpass road surface
  fillTile(ctx, 0, 1, PAL.overpassRoad);
  hline(ctx, 0, 1, 0, 0, 16, PAL.overpassEdge);
  hline(ctx, 0, 1, 0, 15, 16, PAL.overpassEdge);
  // Center line dashes
  for (let x = 2; x < 16; x += 6) {
    hline(ctx, 0, 1, x, 7, 3, PAL.crosswalk);
  }

  // Tile 17: stair steps (2 step variant)
  fillTile(ctx, 1, 1, PAL.stairMid);
  rect(ctx, 1, 1, 0, 0, 16, 8, PAL.stairDark);
  rect(ctx, 1, 1, 0, 8, 16, 8, PAL.stairLight);
  hline(ctx, 1, 1, 0, 7, 16, PAL.shadow);

  // Tile 18: road with center marking
  fillTile(ctx, 2, 1, PAL.asphalt);
  hline(ctx, 2, 1, 0, 7, 16, PAL.crosswalk);
  hline(ctx, 2, 1, 0, 8, 16, PAL.crosswalk);

  // Tile 19: grass-to-path transition
  fillTile(ctx, 3, 1, PAL.grass1);
  rect(ctx, 3, 1, 8, 0, 8, 16, PAL.dirt);
  vline(ctx, 3, 1, 8, 0, 16, PAL.dirtLight);

  // Tile 20: pond edge
  fillTile(ctx, 4, 1, PAL.grass1);
  rect(ctx, 4, 1, 0, 8, 16, 8, PAL.water);
  hline(ctx, 4, 1, 0, 8, 16, PAL.waterLight);

  // Tile 21: road vertical marking
  fillTile(ctx, 5, 1, PAL.asphalt);
  vline(ctx, 5, 1, 7, 0, 16, PAL.crosswalk);
  vline(ctx, 5, 1, 8, 0, 16, PAL.crosswalk);

  // Tile 22: elevated walkway edge (left)
  fillTile(ctx, 6, 1, PAL.elevatedPath);
  vline(ctx, 6, 1, 0, 0, 16, PAL.stairDark);
  vline(ctx, 6, 1, 1, 0, 16, PAL.stairMid);

  // Tile 23: elevated walkway edge (right)
  fillTile(ctx, 7, 1, PAL.elevatedPath);
  vline(ctx, 7, 1, 14, 0, 16, PAL.stairMid);
  vline(ctx, 7, 1, 15, 0, 16, PAL.stairDark);

  savePNG(canvas, 'ground.png');
  return { cols, rows, tileCount: cols * rows };
}

// ─── BUILDINGS TILESET ──────────────────────────────────────────────────────
// 16 columns x 3 rows = 48 tiles max, using ~32
function generateBuildings() {
  const cols = 16, rows = 3;
  const canvas = createCanvas(cols * TILE, rows * TILE);
  const ctx = canvas.getContext('2d');

  // Tile 0: brick wall
  fillTile(ctx, 0, 0, PAL.brick);
  for (let y = 0; y < 16; y += 4) {
    hline(ctx, 0, 0, 0, y, 16, PAL.brickDark);
    const off = (y % 8 === 0) ? 0 : 4;
    for (let x = off; x < 16; x += 8) {
      vline(ctx, 0, 0, x, y, 4, PAL.brickDark);
    }
  }

  // Tile 1: concrete wall
  fillTile(ctx, 1, 0, PAL.concrete);
  for (let i = 0; i < 5; i++) {
    pixel(ctx, 1, 0, (i*7+3)%16, (i*5+1)%16, PAL.concreteDark);
  }

  // Tile 2: glass facade
  fillTile(ctx, 2, 0, PAL.glass);
  vline(ctx, 2, 0, 3, 0, 16, PAL.glassDark);
  vline(ctx, 2, 0, 7, 0, 16, PAL.glassDark);
  vline(ctx, 2, 0, 11, 0, 16, PAL.glassDark);
  hline(ctx, 2, 0, 0, 7, 16, PAL.glassDark);

  // Tile 3: Chinnaswamy - curved wall (cream)
  fillTile(ctx, 3, 0, PAL.cream);
  hline(ctx, 3, 0, 0, 0, 16, PAL.creamDark);
  hline(ctx, 3, 0, 0, 15, 16, PAL.creamDark);
  // Curved appearance: darker at edges
  vline(ctx, 3, 0, 0, 0, 16, PAL.creamDark);
  vline(ctx, 3, 0, 15, 0, 16, PAL.creamDark);
  // Structural lines
  hline(ctx, 3, 0, 2, 5, 12, PAL.creamDark);
  hline(ctx, 3, 0, 2, 10, 12, PAL.creamDark);

  // Tile 4: Chinnaswamy - entrance arch
  fillTile(ctx, 4, 0, PAL.cream);
  // Arch shape
  rect(ctx, 4, 0, 3, 0, 10, 2, PAL.creamDark);
  vline(ctx, 4, 0, 3, 2, 14, PAL.creamDark);
  vline(ctx, 4, 0, 12, 2, 14, PAL.creamDark);
  // Arch top curve
  rect(ctx, 4, 0, 4, 2, 8, 3, PAL.shadow);
  rect(ctx, 4, 0, 5, 5, 6, 11, PAL.shadow);

  // Tile 5: Chinnaswamy - column
  fillTile(ctx, 5, 0, PAL.cream);
  rect(ctx, 5, 0, 5, 0, 6, 16, PAL.pillar);
  vline(ctx, 5, 0, 5, 0, 16, PAL.pillarDark);
  vline(ctx, 5, 0, 10, 0, 16, PAL.pillarDark);
  rect(ctx, 5, 0, 4, 0, 8, 2, PAL.pillar);
  rect(ctx, 5, 0, 4, 14, 8, 2, PAL.pillar);

  // Tile 6: UB City - modern glass/steel
  fillTile(ctx, 6, 0, PAL.glass);
  for (let y = 0; y < 16; y += 4) {
    hline(ctx, 6, 0, 0, y, 16, PAL.steel);
  }
  for (let x = 0; x < 16; x += 8) {
    vline(ctx, 6, 0, x, 0, 16, PAL.steelDark);
  }

  // Tile 7: UB City - mall entrance
  fillTile(ctx, 7, 0, PAL.steel);
  rect(ctx, 7, 0, 4, 4, 8, 12, PAL.glassDark);
  rect(ctx, 7, 0, 5, 5, 6, 11, PAL.glass);
  hline(ctx, 7, 0, 3, 3, 10, PAL.steelDark);

  // Tile 8: Vidhana Soudha - sandstone wall
  fillTile(ctx, 8, 0, PAL.sandstone);
  hline(ctx, 8, 0, 0, 3, 16, PAL.sandstoneDark);
  hline(ctx, 8, 0, 0, 7, 16, PAL.sandstoneDark);
  hline(ctx, 8, 0, 0, 11, 16, PAL.sandstoneDark);
  hline(ctx, 8, 0, 0, 15, 16, PAL.sandstoneDark);

  // Tile 9: Vidhana Soudha - dome base
  fillTile(ctx, 9, 0, PAL.sandstone);
  // Dome curve
  rect(ctx, 9, 0, 2, 4, 12, 12, PAL.sandstoneDark);
  rect(ctx, 9, 0, 4, 2, 8, 2, PAL.sandstoneDark);
  rect(ctx, 9, 0, 3, 3, 10, 11, PAL.sandstone);
  rect(ctx, 9, 0, 5, 1, 6, 2, PAL.sandstone);
  // Top ornament
  rect(ctx, 9, 0, 7, 0, 2, 2, PAL.sandstoneDark);

  // Tile 10: Vidhana Soudha - pillar column
  fillTile(ctx, 10, 0, PAL.sandstone);
  rect(ctx, 10, 0, 4, 0, 8, 16, PAL.pillar);
  vline(ctx, 10, 0, 4, 0, 16, PAL.pillarDark);
  vline(ctx, 10, 0, 11, 0, 16, PAL.pillarDark);
  // Capital and base
  rect(ctx, 10, 0, 3, 0, 10, 3, PAL.pillar);
  rect(ctx, 10, 0, 3, 13, 10, 3, PAL.pillar);
  hline(ctx, 10, 0, 3, 2, 10, PAL.pillarDark);

  // Tile 11: Metro station entrance
  fillTile(ctx, 11, 0, PAL.concrete);
  rect(ctx, 11, 0, 2, 0, 12, 3, PAL.metroSign);
  rect(ctx, 11, 0, 4, 4, 8, 12, PAL.concreteDark);
  rect(ctx, 11, 0, 5, 5, 6, 11, PAL.shadow);
  // "M" letter
  pixel(ctx, 11, 0, 5, 1, PAL.white);
  pixel(ctx, 11, 0, 6, 2, PAL.white);
  pixel(ctx, 11, 0, 7, 1, PAL.white);
  pixel(ctx, 11, 0, 8, 2, PAL.white);
  pixel(ctx, 11, 0, 9, 1, PAL.white);

  // Tile 12: Metro signage tile
  fillTile(ctx, 12, 0, PAL.metroSign);
  rect(ctx, 12, 0, 1, 3, 14, 10, PAL.white);
  rect(ctx, 12, 0, 2, 4, 12, 8, PAL.metroSign);
  // Text lines
  hline(ctx, 12, 0, 4, 6, 8, PAL.white);
  hline(ctx, 12, 0, 4, 9, 8, PAL.white);

  // Tile 13: Metro railing
  fillTile(ctx, 13, 0, PAL.transparent);
  hline(ctx, 13, 0, 0, 2, 16, PAL.railing);
  hline(ctx, 13, 0, 0, 3, 16, PAL.railingLight);
  vline(ctx, 13, 0, 0, 2, 14, PAL.railing);
  vline(ctx, 13, 0, 7, 2, 14, PAL.railing);
  vline(ctx, 13, 0, 15, 2, 14, PAL.railing);

  // Tile 14: Cubbon Park - ornamental gate
  fillTile(ctx, 14, 0, PAL.transparent);
  // Gate posts
  rect(ctx, 14, 0, 0, 0, 3, 16, PAL.stoneWall);
  rect(ctx, 14, 0, 13, 0, 3, 16, PAL.stoneWall);
  // Gate arch
  hline(ctx, 14, 0, 3, 2, 10, PAL.railing);
  hline(ctx, 14, 0, 3, 3, 10, PAL.railingLight);
  // Gate bars
  for (let x = 4; x < 13; x += 2) {
    vline(ctx, 14, 0, x, 3, 13, PAL.railing);
  }

  // Tile 15: Park boundary wall
  fillTile(ctx, 15, 0, PAL.stoneWall);
  hline(ctx, 15, 0, 0, 0, 16, PAL.concreteDark);
  hline(ctx, 15, 0, 0, 7, 16, PAL.concreteDark);
  hline(ctx, 15, 0, 0, 15, 16, PAL.concreteDark);

  // Row 2
  // Tile 16: generic roof
  fillTile(ctx, 0, 1, PAL.roof);
  for (let y = 0; y < 16; y += 2) {
    hline(ctx, 0, 1, 0, y, 16, PAL.roofDark);
  }

  // Tile 17: door
  fillTile(ctx, 1, 1, PAL.door);
  rect(ctx, 1, 1, 0, 0, 16, 2, PAL.doorFrame);
  vline(ctx, 1, 1, 0, 0, 16, PAL.doorFrame);
  vline(ctx, 1, 1, 15, 0, 16, PAL.doorFrame);
  // Door knob
  pixel(ctx, 1, 1, 12, 9, PAL.lampGlow);
  // Panel lines
  vline(ctx, 1, 1, 7, 3, 12, PAL.doorFrame);
  hline(ctx, 1, 1, 2, 7, 12, PAL.doorFrame);

  // Tile 18: stair railing (left side)
  fillTile(ctx, 2, 1, PAL.transparent);
  vline(ctx, 2, 1, 2, 0, 16, PAL.railing);
  vline(ctx, 2, 1, 3, 0, 16, PAL.railingLight);
  hline(ctx, 2, 1, 0, 0, 4, PAL.railing);
  hline(ctx, 2, 1, 0, 15, 4, PAL.railing);

  // Tile 19: stair railing (right side)
  fillTile(ctx, 3, 1, PAL.transparent);
  vline(ctx, 3, 1, 12, 0, 16, PAL.railingLight);
  vline(ctx, 3, 1, 13, 0, 16, PAL.railing);
  hline(ctx, 3, 1, 12, 0, 4, PAL.railing);
  hline(ctx, 3, 1, 12, 15, 4, PAL.railing);

  // Tile 20: overpass support pillar
  fillTile(ctx, 4, 1, PAL.transparent);
  rect(ctx, 4, 1, 5, 0, 6, 16, PAL.concrete);
  vline(ctx, 4, 1, 5, 0, 16, PAL.concreteDark);
  vline(ctx, 4, 1, 10, 0, 16, PAL.concreteDark);

  // Tile 21: elevated platform edge (top)
  fillTile(ctx, 5, 1, PAL.concrete);
  hline(ctx, 5, 1, 0, 0, 16, PAL.concreteDark);
  hline(ctx, 5, 1, 0, 1, 16, PAL.concreteDark);
  rect(ctx, 5, 1, 0, 2, 16, 14, PAL.elevatedPath);

  // Tile 22: elevated walkway railing (top)
  fillTile(ctx, 6, 1, PAL.transparent);
  hline(ctx, 6, 1, 0, 2, 16, PAL.railing);
  hline(ctx, 6, 1, 0, 3, 16, PAL.railingLight);
  for (let x = 0; x < 16; x += 4) {
    vline(ctx, 6, 1, x, 2, 6, PAL.railing);
  }

  // Tile 23: generic shop front
  fillTile(ctx, 7, 1, PAL.brick);
  rect(ctx, 7, 1, 2, 6, 12, 10, PAL.glassDark);
  rect(ctx, 7, 1, 3, 7, 10, 8, PAL.glass);
  rect(ctx, 7, 1, 0, 0, 16, 5, PAL.shopSign);
  hline(ctx, 7, 1, 2, 2, 12, PAL.signText);
  hline(ctx, 7, 1, 3, 3, 10, PAL.signText);

  // Tile 24: Vidhana Soudha - upper wall
  fillTile(ctx, 8, 1, PAL.sandstone);
  // Decorative molding
  hline(ctx, 8, 1, 0, 0, 16, PAL.sandstoneDark);
  hline(ctx, 8, 1, 0, 1, 16, PAL.sandstoneDark);
  rect(ctx, 8, 1, 0, 4, 16, 2, PAL.sandstoneDark);
  // Window recess
  rect(ctx, 8, 1, 4, 7, 8, 8, PAL.concreteDark);
  rect(ctx, 8, 1, 5, 8, 6, 6, PAL.glassDark);

  // Tile 25: building corner
  fillTile(ctx, 9, 1, PAL.concrete);
  vline(ctx, 9, 1, 0, 0, 16, PAL.concreteDark);
  hline(ctx, 9, 1, 0, 0, 16, PAL.concreteDark);

  // Tile 26: Chinnaswamy seating
  fillTile(ctx, 10, 1, PAL.cream);
  for (let y = 0; y < 16; y += 3) {
    hline(ctx, 10, 1, 0, y, 16, PAL.concrete);
    hline(ctx, 10, 1, 0, y+1, 16, PAL.concreteDark);
  }

  // Tile 27: Chinnaswamy field
  fillTile(ctx, 11, 1, PAL.grass3);
  // Cricket pitch markings
  rect(ctx, 11, 1, 6, 0, 4, 16, PAL.lawn);
  vline(ctx, 11, 1, 6, 0, 16, PAL.crosswalk);
  vline(ctx, 11, 1, 9, 0, 16, PAL.crosswalk);

  // Tile 28: UB City upper glass
  fillTile(ctx, 12, 1, PAL.glass);
  hline(ctx, 12, 1, 0, 3, 16, PAL.steel);
  hline(ctx, 12, 1, 0, 7, 16, PAL.steel);
  hline(ctx, 12, 1, 0, 11, 16, PAL.steel);
  for (let x = 0; x < 16; x += 5) {
    vline(ctx, 12, 1, x, 0, 16, PAL.steelDark);
  }

  // Tile 29: generic building wall top
  fillTile(ctx, 13, 1, PAL.concrete);
  hline(ctx, 13, 1, 0, 14, 16, PAL.concreteDark);
  hline(ctx, 13, 1, 0, 15, 16, PAL.concreteDark);

  // Tile 30-31: empty
  fillTile(ctx, 14, 1, PAL.transparent);
  fillTile(ctx, 15, 1, PAL.transparent);

  // Row 3
  // Tile 32: overpass railing left
  fillTile(ctx, 0, 2, PAL.transparent);
  vline(ctx, 0, 2, 0, 0, 16, PAL.railing);
  vline(ctx, 0, 2, 1, 0, 16, PAL.railingLight);
  hline(ctx, 0, 2, 0, 4, 4, PAL.railing);
  hline(ctx, 0, 2, 0, 12, 4, PAL.railing);

  // Tile 33: overpass railing right
  fillTile(ctx, 1, 2, PAL.transparent);
  vline(ctx, 1, 2, 14, 0, 16, PAL.railingLight);
  vline(ctx, 1, 2, 15, 0, 16, PAL.railing);
  hline(ctx, 1, 2, 12, 4, 4, PAL.railing);
  hline(ctx, 1, 2, 12, 12, 4, PAL.railing);

  // Tile 34: overpass deck (for above-player layer)
  fillTile(ctx, 2, 2, PAL.overpassRoad);
  hline(ctx, 2, 2, 0, 7, 16, PAL.overpassEdge);

  // Tile 35: Vidhana Soudha dome top
  fillTile(ctx, 3, 2, PAL.transparent);
  rect(ctx, 3, 2, 4, 6, 8, 10, PAL.sandstone);
  rect(ctx, 3, 2, 5, 4, 6, 2, PAL.sandstone);
  rect(ctx, 3, 2, 6, 2, 4, 2, PAL.sandstone);
  rect(ctx, 3, 2, 7, 0, 2, 2, PAL.sandstoneDark);

  // Tile 36: roof tile variation
  fillTile(ctx, 4, 2, PAL.roofDark);
  for (let x = 0; x < 16; x += 4) {
    rect(ctx, 4, 2, x, 0, 2, 16, PAL.roof);
  }

  // Tile 37: tree canopy piece (for above-player)
  fillTile(ctx, 5, 2, PAL.treeCanopy);
  for (let i = 0; i < 12; i++) {
    pixel(ctx, 5, 2, (i*5+2)%16, (i*3+1)%16, PAL.treeCanopyL);
  }

  // Fill rest with transparent
  for (let x = 6; x < 16; x++) {
    fillTile(ctx, x, 2, PAL.transparent);
  }

  savePNG(canvas, 'buildings.png');
  return { cols, rows, tileCount: cols * rows };
}

// ─── NATURE TILESET ─────────────────────────────────────────────────────────
// 16 columns x 2 rows = 32 tiles, using ~20
function generateNature() {
  const cols = 16, rows = 2;
  const canvas = createCanvas(cols * TILE, rows * TILE);
  const ctx = canvas.getContext('2d');

  // Tile 0: rain tree trunk (large, part of 2x2)
  fillTile(ctx, 0, 0, PAL.transparent);
  rect(ctx, 0, 0, 4, 0, 8, 16, PAL.treeTrunk);
  vline(ctx, 0, 0, 4, 0, 16, '#604820');
  vline(ctx, 0, 0, 11, 0, 16, '#604820');
  // Root details
  rect(ctx, 0, 0, 2, 12, 2, 4, PAL.treeTrunk);
  rect(ctx, 0, 0, 12, 12, 2, 4, PAL.treeTrunk);

  // Tile 1: rain tree canopy (above-player, top-left of 2x2)
  fillTile(ctx, 1, 0, PAL.transparent);
  rect(ctx, 1, 0, 0, 2, 16, 14, PAL.treeCanopy);
  rect(ctx, 1, 0, 2, 0, 14, 2, PAL.treeCanopy);
  for (let i = 0; i < 15; i++) {
    pixel(ctx, 1, 0, (i*5+2)%16, (i*3+1)%16, PAL.treeCanopyL);
  }

  // Tile 2: rain tree canopy (top-right of 2x2)
  fillTile(ctx, 2, 0, PAL.transparent);
  rect(ctx, 2, 0, 0, 2, 16, 14, PAL.treeCanopy);
  rect(ctx, 2, 0, 0, 0, 14, 2, PAL.treeCanopy);
  for (let i = 0; i < 15; i++) {
    pixel(ctx, 2, 0, (i*7+1)%16, (i*5+3)%16, PAL.treeCanopyL);
  }

  // Tile 3: coconut palm trunk
  fillTile(ctx, 3, 0, PAL.transparent);
  rect(ctx, 3, 0, 6, 0, 4, 16, PAL.coconutTrunk);
  // Ring marks
  for (let y = 2; y < 16; y += 3) {
    hline(ctx, 3, 0, 6, y, 4, '#806038');
  }

  // Tile 4: coconut palm leaves (above-player)
  fillTile(ctx, 4, 0, PAL.transparent);
  // Leaf fronds radiating out
  rect(ctx, 4, 0, 4, 4, 8, 8, PAL.palmLeaf);
  rect(ctx, 4, 0, 2, 6, 12, 4, PAL.palmLeaf);
  rect(ctx, 4, 0, 6, 2, 4, 12, PAL.palmLeaf);
  pixel(ctx, 4, 0, 1, 3, PAL.palmLeaf);
  pixel(ctx, 4, 0, 14, 3, PAL.palmLeaf);
  pixel(ctx, 4, 0, 1, 12, PAL.palmLeaf);
  pixel(ctx, 4, 0, 14, 12, PAL.palmLeaf);
  // Coconuts
  pixel(ctx, 4, 0, 7, 7, '#906838');
  pixel(ctx, 4, 0, 8, 7, '#906838');

  // Tile 5: generic park tree trunk
  fillTile(ctx, 5, 0, PAL.transparent);
  rect(ctx, 5, 0, 6, 4, 4, 12, PAL.treeTrunk);
  vline(ctx, 5, 0, 6, 4, 12, '#604820');

  // Tile 6: generic park tree canopy (above-player)
  fillTile(ctx, 6, 0, PAL.transparent);
  rect(ctx, 6, 0, 2, 2, 12, 12, PAL.treeCanopy);
  rect(ctx, 6, 0, 4, 0, 8, 2, PAL.treeCanopy);
  rect(ctx, 6, 0, 0, 4, 2, 8, PAL.treeCanopy);
  rect(ctx, 6, 0, 14, 4, 2, 8, PAL.treeCanopy);
  for (let i = 0; i < 10; i++) {
    pixel(ctx, 6, 0, (i*5+3)%16, (i*3+2)%16, PAL.treeCanopyL);
  }

  // Tile 7: bougainvillea bush
  fillTile(ctx, 7, 0, PAL.bougainvGreen);
  for (let i = 0; i < 30; i++) {
    pixel(ctx, 7, 0, (i*7+2)%16, (i*5+1)%16, PAL.bougainvillea);
  }
  // Green variation
  for (let i = 0; i < 10; i++) {
    pixel(ctx, 7, 0, (i*3+5)%16, (i*11+3)%16, PAL.hedge);
  }

  // Tile 8: hedge
  fillTile(ctx, 8, 0, PAL.hedge);
  hline(ctx, 8, 0, 0, 0, 16, PAL.hedgeDark);
  hline(ctx, 8, 0, 0, 15, 16, PAL.hedgeDark);
  for (let i = 0; i < 10; i++) {
    pixel(ctx, 8, 0, (i*5+1)%16, (i*3+2)%16, PAL.grass1);
  }

  // Tile 9: garden bush
  fillTile(ctx, 9, 0, PAL.transparent);
  rect(ctx, 9, 0, 2, 4, 12, 12, PAL.hedge);
  rect(ctx, 9, 0, 4, 2, 8, 2, PAL.hedge);
  for (let i = 0; i < 8; i++) {
    pixel(ctx, 9, 0, (i*5+3)%16, (i*3+5)%16, PAL.grass3);
  }

  // Tile 10: flower bed
  fillTile(ctx, 10, 0, PAL.dirt);
  for (let i = 0; i < 12; i++) {
    const c = i % 3 === 0 ? PAL.flower1 : i % 3 === 1 ? PAL.flower2 : PAL.bougainvillea;
    pixel(ctx, 10, 0, (i*5+1)%16, (i*3+2)%16, c);
    pixel(ctx, 10, 0, (i*5+2)%16, (i*3+2)%16, c);
  }

  // Tile 11: potted plant
  fillTile(ctx, 11, 0, PAL.transparent);
  rect(ctx, 11, 0, 5, 10, 6, 6, PAL.pot);
  rect(ctx, 11, 0, 6, 11, 4, 4, '#985830');
  // Plant
  rect(ctx, 11, 0, 5, 2, 6, 8, PAL.hedge);
  for (let i = 0; i < 5; i++) {
    pixel(ctx, 11, 0, (i*3+5)%16, (i*2+3)%16, PAL.grass3);
  }

  // Tile 12: bench (horizontal)
  fillTile(ctx, 12, 0, PAL.transparent);
  rect(ctx, 12, 0, 1, 5, 14, 3, PAL.benchWood);
  hline(ctx, 12, 0, 1, 5, 14, '#805830');
  rect(ctx, 12, 0, 1, 9, 14, 2, PAL.benchWood);
  // Legs
  rect(ctx, 12, 0, 2, 11, 2, 4, PAL.benchMetal);
  rect(ctx, 12, 0, 12, 11, 2, 4, PAL.benchMetal);

  // Tile 13: fountain base
  fillTile(ctx, 13, 0, PAL.transparent);
  rect(ctx, 13, 0, 2, 4, 12, 12, PAL.fountainStone);
  rect(ctx, 13, 0, 4, 2, 8, 2, PAL.fountainStone);
  rect(ctx, 13, 0, 4, 6, 8, 8, PAL.fountainWater);
  // Water spray
  rect(ctx, 13, 0, 7, 3, 2, 3, PAL.fountainWater);

  // Tile 14: fence post
  fillTile(ctx, 14, 0, PAL.transparent);
  rect(ctx, 14, 0, 6, 0, 4, 16, PAL.fencePole);
  hline(ctx, 14, 0, 0, 3, 16, PAL.fenceWire);
  hline(ctx, 14, 0, 0, 10, 16, PAL.fenceWire);

  // Tile 15: thick hedge (map boundary)
  fillTile(ctx, 15, 0, PAL.hedgeDark);
  for (let i = 0; i < 20; i++) {
    pixel(ctx, 15, 0, (i*3+1)%16, (i*5+2)%16, PAL.hedge);
  }
  hline(ctx, 15, 0, 0, 0, 16, '#206010');
  hline(ctx, 15, 0, 0, 15, 16, '#206010');

  // Row 2
  // Tile 16: stone wall boundary
  fillTile(ctx, 0, 1, PAL.stoneWall);
  hline(ctx, 0, 1, 0, 3, 16, PAL.concreteDark);
  hline(ctx, 0, 1, 0, 7, 16, PAL.concreteDark);
  hline(ctx, 0, 1, 0, 11, 16, PAL.concreteDark);
  vline(ctx, 0, 1, 5, 0, 16, PAL.concreteDark);
  vline(ctx, 0, 1, 11, 0, 16, PAL.concreteDark);

  // Tile 17: pond/lake edge
  fillTile(ctx, 1, 1, PAL.water);
  rect(ctx, 1, 1, 0, 0, 16, 4, PAL.grass1);
  hline(ctx, 1, 1, 0, 4, 16, '#307818');
  // Water ripples
  hline(ctx, 1, 1, 3, 8, 5, PAL.waterLight);
  hline(ctx, 1, 1, 9, 11, 5, PAL.waterLight);

  // Tile 18: tree shadow on grass
  fillTile(ctx, 2, 1, PAL.grass2);
  // Circular shadow
  rect(ctx, 2, 1, 2, 2, 12, 12, '#408020');
  rect(ctx, 2, 1, 4, 0, 8, 2, '#408020');
  rect(ctx, 2, 1, 0, 4, 2, 8, '#408020');

  // Tile 19: bamboo
  fillTile(ctx, 3, 1, PAL.transparent);
  vline(ctx, 3, 1, 3, 0, 16, PAL.palmLeaf);
  vline(ctx, 3, 1, 7, 0, 16, '#60a030');
  vline(ctx, 3, 1, 11, 0, 16, PAL.palmLeaf);
  // Nodes
  for (let x of [3, 7, 11]) {
    for (let y = 3; y < 16; y += 5) {
      hline(ctx, 3, 1, x - 1, y, 3, '#508028');
    }
  }

  // Fill rest transparent
  for (let x = 4; x < 16; x++) {
    fillTile(ctx, x, 1, PAL.transparent);
  }

  savePNG(canvas, 'nature.png');
  return { cols, rows, tileCount: cols * rows };
}

// ─── DECORATIONS TILESET ────────────────────────────────────────────────────
// 16 columns x 2 rows = 32 tiles, using ~24
function generateDecorations() {
  const cols = 16, rows = 2;
  const canvas = createCanvas(cols * TILE, rows * TILE);
  const ctx = canvas.getContext('2d');

  // Tile 0: fruit cart
  fillTile(ctx, 0, 0, PAL.transparent);
  rect(ctx, 0, 0, 1, 6, 14, 8, PAL.cartWood);
  rect(ctx, 0, 0, 2, 3, 12, 3, PAL.cartCloth); // canopy
  // Fruits
  rect(ctx, 0, 0, 2, 7, 4, 3, PAL.fruit1);
  rect(ctx, 0, 0, 6, 7, 4, 3, PAL.fruit2);
  rect(ctx, 0, 0, 10, 7, 4, 3, PAL.fruit1);
  // Wheels
  rect(ctx, 0, 0, 2, 14, 2, 2, PAL.shadow);
  rect(ctx, 0, 0, 12, 14, 2, 2, PAL.shadow);

  // Tile 1: sugarcane juice stall
  fillTile(ctx, 1, 0, PAL.transparent);
  rect(ctx, 1, 0, 2, 4, 12, 10, PAL.cartWood);
  rect(ctx, 1, 0, 1, 2, 14, 2, PAL.cartCloth);
  // Sugarcane bundles
  vline(ctx, 1, 0, 4, 5, 8, PAL.sugarcane);
  vline(ctx, 1, 0, 6, 5, 8, PAL.sugarcane);
  vline(ctx, 1, 0, 8, 5, 8, '#80a848');
  // Machine
  rect(ctx, 1, 0, 10, 6, 3, 6, PAL.benchMetal);

  // Tile 2: flower basket
  fillTile(ctx, 2, 0, PAL.transparent);
  rect(ctx, 2, 0, 3, 8, 10, 6, PAL.cartWood);
  // Flowers
  for (let i = 0; i < 8; i++) {
    const c = i % 2 === 0 ? PAL.flowerBasket : PAL.flower2;
    pixel(ctx, 2, 0, (i*3+4)%10+3, (i*2+3)%6+3, c);
    pixel(ctx, 2, 0, (i*3+5)%10+3, (i*2+4)%6+3, c);
  }
  // Basket weave
  hline(ctx, 2, 0, 3, 10, 10, '#906030');

  // Tile 3: auto-rickshaw (iconic yellow-green)
  fillTile(ctx, 3, 0, PAL.transparent);
  // Body
  rect(ctx, 3, 0, 2, 4, 12, 8, PAL.autoYellow);
  rect(ctx, 3, 0, 2, 2, 12, 2, PAL.autoGreen);
  // Roof
  rect(ctx, 3, 0, 3, 1, 10, 2, PAL.autoBody);
  // Windshield
  rect(ctx, 3, 0, 3, 4, 4, 4, PAL.glass);
  // Wheels
  rect(ctx, 3, 0, 3, 12, 2, 3, PAL.shadow);
  rect(ctx, 3, 0, 11, 12, 2, 3, PAL.shadow);

  // Tile 4: parked two-wheeler
  fillTile(ctx, 4, 0, PAL.transparent);
  rect(ctx, 4, 0, 5, 4, 6, 8, PAL.twoWheeler);
  // Handlebars
  hline(ctx, 4, 0, 3, 3, 10, PAL.benchMetal);
  // Seat
  rect(ctx, 4, 0, 5, 6, 6, 2, '#383838');
  // Wheels
  rect(ctx, 4, 0, 4, 12, 3, 3, PAL.shadow);
  rect(ctx, 4, 0, 9, 12, 3, 3, PAL.shadow);

  // Tile 5: bus stop sign
  fillTile(ctx, 5, 0, PAL.transparent);
  rect(ctx, 5, 0, 6, 4, 4, 12, PAL.fencePole);
  rect(ctx, 5, 0, 2, 0, 12, 5, PAL.busSign);
  // Text
  hline(ctx, 5, 0, 4, 2, 8, PAL.white);
  hline(ctx, 5, 0, 5, 3, 6, PAL.white);

  // Tile 6: lamppost
  fillTile(ctx, 6, 0, PAL.transparent);
  rect(ctx, 6, 0, 7, 4, 2, 12, PAL.lamppost);
  // Lamp head
  rect(ctx, 6, 0, 5, 0, 6, 4, PAL.lamppost);
  rect(ctx, 6, 0, 6, 1, 4, 2, PAL.lampGlow);

  // Tile 7: traffic light
  fillTile(ctx, 7, 0, PAL.transparent);
  rect(ctx, 7, 0, 7, 6, 2, 10, PAL.trafficLight);
  rect(ctx, 7, 0, 5, 0, 6, 8, PAL.trafficLight);
  // Lights
  rect(ctx, 7, 0, 6, 1, 4, 2, PAL.trafficRed);
  rect(ctx, 7, 0, 6, 3, 4, 2, PAL.lampGlow);
  rect(ctx, 7, 0, 6, 5, 4, 2, PAL.trafficGreen);

  // Tile 8: fire hydrant
  fillTile(ctx, 8, 0, PAL.transparent);
  rect(ctx, 8, 0, 5, 6, 6, 8, PAL.hydrant);
  rect(ctx, 8, 0, 4, 4, 8, 3, PAL.hydrant);
  rect(ctx, 8, 0, 6, 2, 4, 2, PAL.hydrant);
  // Highlights
  vline(ctx, 8, 0, 6, 6, 8, '#e04848');

  // Tile 9: dustbin
  fillTile(ctx, 9, 0, PAL.transparent);
  rect(ctx, 9, 0, 4, 4, 8, 10, PAL.dustbin);
  rect(ctx, 9, 0, 3, 2, 10, 3, PAL.dustbin);
  hline(ctx, 9, 0, 3, 2, 10, '#506038');

  // Tile 10: road name board
  fillTile(ctx, 10, 0, PAL.transparent);
  rect(ctx, 10, 0, 7, 6, 2, 10, PAL.fencePole);
  rect(ctx, 10, 0, 1, 0, 14, 7, PAL.signBoard);
  rect(ctx, 10, 0, 2, 1, 12, 5, PAL.white);
  // "MG" text hint
  hline(ctx, 10, 0, 3, 2, 4, PAL.signBoard);
  hline(ctx, 10, 0, 3, 4, 6, PAL.signBoard);

  // Tile 11: generic shop sign
  fillTile(ctx, 11, 0, PAL.transparent);
  rect(ctx, 11, 0, 0, 2, 16, 8, PAL.shopSign);
  rect(ctx, 11, 0, 1, 3, 14, 6, PAL.transparent);
  // Lines
  hline(ctx, 11, 0, 2, 4, 12, PAL.signText);
  hline(ctx, 11, 0, 3, 6, 10, PAL.signText);

  // Tile 12: BMTC bus stop board
  fillTile(ctx, 12, 0, PAL.transparent);
  rect(ctx, 12, 0, 7, 4, 2, 12, PAL.fencePole);
  rect(ctx, 12, 0, 2, 0, 12, 5, PAL.busSign);
  // BMTC text
  hline(ctx, 12, 0, 4, 1, 8, PAL.white);
  hline(ctx, 12, 0, 3, 3, 10, PAL.white);

  // Tile 13: metro pillar
  fillTile(ctx, 13, 0, PAL.transparent);
  rect(ctx, 13, 0, 4, 0, 8, 16, PAL.metroPillar);
  vline(ctx, 13, 0, 4, 0, 16, PAL.concreteDark);
  vline(ctx, 13, 0, 11, 0, 16, PAL.concreteDark);
  // Base
  rect(ctx, 13, 0, 3, 12, 10, 4, PAL.metroPillar);

  // Tile 14: metro sign
  fillTile(ctx, 14, 0, PAL.transparent);
  rect(ctx, 14, 0, 2, 2, 12, 10, PAL.metroSign);
  rect(ctx, 14, 0, 3, 3, 10, 8, PAL.white);
  // "M" logo
  pixel(ctx, 14, 0, 5, 5, PAL.metroSign);
  pixel(ctx, 14, 0, 6, 6, PAL.metroSign);
  pixel(ctx, 14, 0, 7, 5, PAL.metroSign);
  pixel(ctx, 14, 0, 8, 6, PAL.metroSign);
  pixel(ctx, 14, 0, 9, 5, PAL.metroSign);
  hline(ctx, 14, 0, 5, 7, 5, PAL.metroSign);

  // Tile 15: parked auto variation (facing down)
  fillTile(ctx, 15, 0, PAL.transparent);
  rect(ctx, 15, 0, 2, 2, 12, 10, PAL.autoGreen);
  rect(ctx, 15, 0, 3, 1, 10, 2, PAL.autoYellow);
  rect(ctx, 15, 0, 4, 4, 8, 4, PAL.glass);
  rect(ctx, 15, 0, 3, 12, 2, 2, PAL.shadow);
  rect(ctx, 15, 0, 11, 12, 2, 2, PAL.shadow);

  // Row 2
  // Tile 16: vendor umbrella (above player)
  fillTile(ctx, 0, 1, PAL.transparent);
  rect(ctx, 0, 1, 1, 1, 14, 10, PAL.cartCloth);
  // Stripes
  for (let x = 1; x < 15; x += 4) {
    rect(ctx, 0, 1, x, 1, 2, 10, PAL.crosswalk);
  }
  // Pole
  rect(ctx, 0, 1, 7, 8, 2, 8, PAL.cartWood);

  // Tile 17: manhole cover
  fillTile(ctx, 1, 1, PAL.asphalt);
  rect(ctx, 1, 1, 3, 3, 10, 10, PAL.benchMetal);
  rect(ctx, 1, 1, 5, 5, 6, 6, PAL.concreteDark);
  // Cross pattern
  hline(ctx, 1, 1, 4, 7, 8, PAL.benchMetal);
  vline(ctx, 1, 1, 7, 4, 8, PAL.benchMetal);

  // Tile 18: pothole
  fillTile(ctx, 2, 1, PAL.asphalt);
  rect(ctx, 2, 1, 5, 5, 6, 6, PAL.asphaltDark);
  rect(ctx, 2, 1, 6, 6, 4, 4, PAL.shadow);

  // Tile 19: road arrow marking (up)
  fillTile(ctx, 3, 1, PAL.asphalt);
  vline(ctx, 3, 1, 7, 4, 10, PAL.crosswalk);
  vline(ctx, 3, 1, 8, 4, 10, PAL.crosswalk);
  pixel(ctx, 3, 1, 6, 5, PAL.crosswalk);
  pixel(ctx, 3, 1, 9, 5, PAL.crosswalk);
  pixel(ctx, 3, 1, 5, 6, PAL.crosswalk);
  pixel(ctx, 3, 1, 10, 6, PAL.crosswalk);

  // Tile 20: newspaper stand
  fillTile(ctx, 4, 1, PAL.transparent);
  rect(ctx, 4, 1, 3, 4, 10, 10, PAL.cartWood);
  rect(ctx, 4, 1, 4, 2, 8, 3, PAL.signBoard);
  // Papers
  for (let y = 5; y < 12; y += 2) {
    hline(ctx, 4, 1, 4, y, 8, PAL.white);
  }

  // Tile 21: bollard
  fillTile(ctx, 5, 1, PAL.transparent);
  rect(ctx, 5, 1, 5, 4, 6, 10, PAL.concrete);
  rect(ctx, 5, 1, 6, 2, 4, 2, PAL.concrete);
  hline(ctx, 5, 1, 5, 5, 6, PAL.lampGlow);

  // Tile 22: bench (vertical facing)
  fillTile(ctx, 6, 1, PAL.transparent);
  rect(ctx, 6, 1, 3, 2, 3, 12, PAL.benchMetal);
  rect(ctx, 6, 1, 6, 3, 7, 10, PAL.benchWood);
  hline(ctx, 6, 1, 6, 3, 7, '#805830');
  hline(ctx, 6, 1, 6, 12, 7, '#805830');

  // Tile 23: trash can
  fillTile(ctx, 7, 1, PAL.transparent);
  rect(ctx, 7, 1, 5, 4, 6, 10, '#507048');
  rect(ctx, 7, 1, 4, 2, 8, 3, '#607050');
  // Lid
  hline(ctx, 7, 1, 4, 2, 8, '#708060');

  // Fill rest transparent
  for (let x = 8; x < 16; x++) {
    fillTile(ctx, x, 1, PAL.transparent);
  }

  savePNG(canvas, 'decorations.png');
  return { cols, rows, tileCount: cols * rows };
}

// ─── Main ───────────────────────────────────────────────────────────────────
console.log('Generating GBA-quality tilesets...');
const ground = generateGround();
console.log(`  ground: ${ground.cols}x${ground.rows} = ${ground.tileCount} tiles`);

const buildings = generateBuildings();
console.log(`  buildings: ${buildings.cols}x${buildings.rows} = ${buildings.tileCount} tiles`);

const nature = generateNature();
console.log(`  nature: ${nature.cols}x${nature.rows} = ${nature.tileCount} tiles`);

const decorations = generateDecorations();
console.log(`  decorations: ${decorations.cols}x${decorations.rows} = ${decorations.tileCount} tiles`);

console.log('\nAll raw tilesets generated. Run tile-extruder next.');
