#!/usr/bin/env node
/**
 * Generate Chinnaswamy Stadium as a custom pre-rendered sprite.
 *
 * Outputs two PNGs:
 *   - chinnaswamy-stadium.png  (base: walls, seating, field — depth 1, below player)
 *   - chinnaswamy-roof.png     (roof canopies — depth 3, above player)
 *
 * The stadium is drawn as a circular/oval shape using ellipse math,
 * matching the AI-generated reference image of the real stadium.
 *
 * Size: 160x208 px (10x13 tiles @ 16px) to match tilemap footprint.
 *
 * Run: node scripts/generate-stadium-sprite.cjs
 */

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const W = 160; // 10 tiles
const H = 208; // 13 tiles

// Stadium center (slightly north of center to leave room for entrance at south)
const CX = W / 2;       // 80
const CY = 88;           // Center of oval, leaves room for entrance at bottom

// Ellipse radii for each ring (outer to inner)
const ROOF_RX = 72, ROOF_RY = 68;         // Outer roof canopy edge
const WALL_RX = 64, WALL_RY = 60;         // Outer wall
const SEAT_OUTER_RX = 60, SEAT_OUTER_RY = 56; // Outer seating edge
const SEAT_INNER_RX = 46, SEAT_INNER_RY = 42; // Inner seating edge
const WALK_RX = 42, WALK_RY = 38;         // Inner walkway
const FIELD_RX = 38, FIELD_RY = 34;       // Field boundary (white line)
const OUTFIELD_RX = 36, OUTFIELD_RY = 32; // Outfield grass
const PITCH_RX = 6, PITCH_RY = 18;        // Cricket pitch (rectangular-ish)

// ─── Colors ────────────────────────────────────────────────────────────────
const COL = {
  // Structure
  roofSteel:    [120, 130, 140],
  roofDark:     [90, 100, 110],
  roofHighlight:[160, 170, 180],
  wallBrick:    [180, 120, 80],
  wallBrickDk:  [150, 100, 65],
  wallBrickLt:  [200, 145, 100],
  concrete:     [190, 185, 175],
  concreteDk:   [165, 160, 150],

  // Seating
  seatBlue:     [60, 100, 180],
  seatBlueDk:   [40, 75, 140],
  seatBlueLt:   [90, 130, 210],
  seatRed:      [200, 60, 50],
  seatRedDk:    [160, 40, 35],
  seatRedLt:    [230, 90, 75],

  // Field
  grass1:       [60, 150, 50],
  grass2:       [50, 135, 42],
  grass3:       [70, 160, 58],
  grassMow1:    [55, 140, 45],
  grassMow2:    [65, 155, 55],
  boundary:     [255, 255, 255],
  pitchTan:     [210, 190, 140],
  pitchTanDk:   [190, 170, 120],
  creaseLine:   [240, 240, 240],

  // Details
  walkway:      [170, 165, 155],
  walkwayDk:    [150, 145, 135],
  signNavy:     [20, 30, 70],
  signText:     [255, 220, 50],
  floodGrey:    [140, 140, 140],
  floodLight:   [255, 255, 200],
  flagRed:      [220, 50, 30],
  flagBlue:     [30, 60, 160],
  flagGreen:    [30, 140, 50],
  flagOrange:   [255, 153, 51],
  flagWhite:    [255, 255, 255],
  entranceDark: [100, 80, 60],
  transparent:  [0, 0, 0, 0],
};

// ─── Helpers ───────────────────────────────────────────────────────────────

function ellipseDist(x, y, cx, cy, rx, ry) {
  const dx = (x - cx) / rx;
  const dy = (y - cy) / ry;
  return dx * dx + dy * dy;
}

function inEllipse(x, y, cx, cy, rx, ry) {
  return ellipseDist(x, y, cx, cy, rx, ry) <= 1.0;
}

function setPixel(data, x, y, w, r, g, b, a = 255) {
  if (x < 0 || x >= w || y < 0 || y >= H) return;
  const i = (y * w + x) * 4;
  data[i] = r;
  data[i + 1] = g;
  data[i + 2] = b;
  data[i + 3] = a;
}

function noise(x, y, seed = 0) {
  // Simple pseudo-random per-pixel variation
  return ((x * 7 + y * 13 + seed * 31) % 17) / 17;
}

function lerpColor(c1, c2, t) {
  return [
    Math.round(c1[0] + (c2[0] - c1[0]) * t),
    Math.round(c1[1] + (c2[1] - c1[1]) * t),
    Math.round(c1[2] + (c2[2] - c1[2]) * t),
  ];
}

// ─── Entrance gap check ───────────────────────────────────────────────────
// Entrance is a gap at the south of the stadium
function isEntrance(x, y) {
  // Entrance at bottom-center, ~20px wide
  return y > CY + 50 && Math.abs(x - CX) < 12;
}

// ─── Classify each pixel into a region ─────────────────────────────────────
function classifyPixel(x, y) {
  const d_roof = ellipseDist(x, y, CX, CY, ROOF_RX, ROOF_RY);
  const d_wall = ellipseDist(x, y, CX, CY, WALL_RX, WALL_RY);
  const d_seat_out = ellipseDist(x, y, CX, CY, SEAT_OUTER_RX, SEAT_OUTER_RY);
  const d_seat_in = ellipseDist(x, y, CX, CY, SEAT_INNER_RX, SEAT_INNER_RY);
  const d_walk = ellipseDist(x, y, CX, CY, WALK_RX, WALK_RY);
  const d_field = ellipseDist(x, y, CX, CY, FIELD_RX, FIELD_RY);
  const d_outfield = ellipseDist(x, y, CX, CY, OUTFIELD_RX, OUTFIELD_RY);

  if (d_roof > 1.0) return 'outside';

  // Entrance gap
  if (isEntrance(x, y)) {
    if (d_wall > 1.0) return 'entrance-path';
    if (d_seat_out > 1.0) return 'entrance-path';
    return 'entrance-path';
  }

  if (d_wall > 1.0) return 'roof';
  if (d_seat_out > 1.0) return 'wall';
  if (d_seat_in > 1.0) return 'seating';
  if (d_walk > 1.0) return 'walkway';
  if (d_field > 1.0) return 'boundary';
  if (d_outfield > 1.0) return 'outfield';
  return 'inner-field';
}

// ─── Generate base sprite ──────────────────────────────────────────────────
function generateBase() {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');
  const imageData = ctx.createImageData(W, H);
  const data = imageData.data;

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const region = classifyPixel(x, y);
      const n = noise(x, y);
      const n2 = noise(x, y, 42);
      let col;

      switch (region) {
        case 'outside':
          // Transparent — tilemap ground shows through
          continue;

        case 'roof':
          // Don't draw roof on base layer (it goes on roof sprite)
          // But draw concourse/walkway around the outside of walls
          col = n < 0.4 ? COL.concrete : n < 0.7 ? COL.concreteDk : COL.concrete;
          break;

        case 'wall': {
          // Brick wall with texture
          const brickRow = y % 4 < 3;
          const brickCol = (x + (Math.floor(y / 4) % 2) * 3) % 6 < 5;
          if (brickRow && brickCol) {
            col = n < 0.3 ? COL.wallBrickDk : n < 0.7 ? COL.wallBrick : COL.wallBrickLt;
          } else {
            col = COL.concreteDk; // mortar
          }
          break;
        }

        case 'seating': {
          // Alternating blue/red sections based on angle from center
          const angle = Math.atan2(y - CY, x - CX);
          const section = Math.floor((angle + Math.PI) / (Math.PI / 4)) % 8;
          const isBlue = section % 2 === 0;

          // Row texture (seats have individual rows)
          const seatRow = y % 3;
          if (isBlue) {
            col = seatRow === 0 ? COL.seatBlueDk : n < 0.5 ? COL.seatBlue : COL.seatBlueLt;
          } else {
            col = seatRow === 0 ? COL.seatRedDk : n < 0.5 ? COL.seatRed : COL.seatRedLt;
          }
          break;
        }

        case 'walkway':
          col = n < 0.5 ? COL.walkway : COL.walkwayDk;
          break;

        case 'boundary':
          // White boundary ring
          col = COL.boundary;
          break;

        case 'outfield': {
          // Mowed grass pattern (alternating light/dark stripes)
          const stripe = Math.floor(y / 5) % 2;
          col = stripe === 0
            ? (n < 0.5 ? COL.grass1 : COL.grassMow1)
            : (n < 0.5 ? COL.grass2 : COL.grassMow2);
          break;
        }

        case 'inner-field': {
          // Cricket pitch in center, otherwise outfield grass
          const inPitch = Math.abs(x - CX) < 5 && Math.abs(y - CY) < 16;
          if (inPitch) {
            col = n < 0.3 ? COL.pitchTanDk : COL.pitchTan;
            // Crease lines
            if ((Math.abs(y - (CY - 12)) < 1 || Math.abs(y - (CY + 12)) < 1) &&
                Math.abs(x - CX) < 4) {
              col = COL.creaseLine;
            }
            // Stumps
            if (Math.abs(x - CX) < 1 &&
                (Math.abs(y - (CY - 13)) < 1 || Math.abs(y - (CY + 13)) < 1)) {
              col = [80, 60, 40]; // Dark brown stumps
            }
          } else {
            const stripe = Math.floor(y / 5) % 2;
            col = stripe === 0
              ? (n < 0.5 ? COL.grass3 : COL.grassMow2)
              : (n < 0.5 ? COL.grass1 : COL.grassMow1);
          }
          break;
        }

        case 'entrance-path':
          // Concrete entrance path at south
          col = n < 0.4 ? COL.concrete : COL.concreteDk;
          break;

        default:
          continue;
      }

      setPixel(data, x, y, W, col[0], col[1], col[2], 255);
    }
  }

  // ── Draw stadium name sign ────────────────────────────────────────────
  // Sign board above entrance (south side)
  const signY = CY + WALL_RY + 6;
  const signX1 = CX - 24;
  const signX2 = CX + 24;
  for (let sy = signY; sy < signY + 8; sy++) {
    for (let sx = signX1; sx < signX2; sx++) {
      const border = sy === signY || sy === signY + 7 || sx === signX1 || sx === signX2 - 1;
      const c = border ? COL.signNavy : [30, 40, 80];
      setPixel(data, sx, sy, W, c[0], c[1], c[2]);
    }
  }
  // "CHINNASWAMY" text pixels (simplified blocky letters)
  drawText(data, W, 'CHINNASWAMY', CX - 22, signY + 2, COL.signText);

  // ── Draw floodlight towers at 4 corners ───────────────────────────────
  const floodPositions = [
    [CX - ROOF_RX + 4, CY - ROOF_RY + 4],  // NW
    [CX + ROOF_RX - 8, CY - ROOF_RY + 4],  // NE
    [CX - ROOF_RX + 4, CY + ROOF_RY - 8],  // SW
    [CX + ROOF_RX - 8, CY + ROOF_RY - 8],  // SE
  ];
  for (const [fx, fy] of floodPositions) {
    // Tower pole
    for (let ty = fy; ty < fy + 12; ty++) {
      setPixel(data, fx + 2, ty, W, ...COL.floodGrey);
      setPixel(data, fx + 3, ty, W, ...COL.floodGrey);
    }
    // Light panel base
    for (let tx = fx; tx < fx + 6; tx++) {
      setPixel(data, tx, fy, W, ...COL.floodGrey);
      setPixel(data, tx, fy + 1, W, ...COL.floodGrey);
    }
  }

  // ── Draw country flags along entrance path ────────────────────────────
  const flagColors = [
    [COL.flagOrange, COL.flagWhite, COL.flagGreen],  // India
    [COL.flagBlue, COL.flagWhite, COL.flagRed],       // Australia-ish
    [COL.flagRed, COL.flagWhite, COL.flagBlue],        // UK-ish
    [COL.flagGreen, COL.flagWhite, COL.flagOrange],    // India mirror
  ];
  const entrancePathY = CY + WALL_RY + 16;
  for (let fi = 0; fi < flagColors.length; fi++) {
    const fx = CX - 20 + fi * 14;
    const fc = flagColors[fi];
    for (let fy = entrancePathY; fy < entrancePathY + 6; fy++) {
      // Flag pole
      setPixel(data, fx, fy, W, 100, 100, 100);
      // Flag stripes
      const stripe = Math.floor((fy - entrancePathY) / 2);
      const sc = fc[Math.min(stripe, 2)];
      setPixel(data, fx + 1, fy, W, sc[0], sc[1], sc[2]);
      setPixel(data, fx + 2, fy, W, sc[0], sc[1], sc[2]);
      setPixel(data, fx + 3, fy, W, sc[0], sc[1], sc[2]);
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

// ─── Generate roof sprite ──────────────────────────────────────────────────
function generateRoof() {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');
  const imageData = ctx.createImageData(W, H);
  const data = imageData.data;

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      // Entrance gap — no roof over entrance
      if (isEntrance(x, y)) continue;

      const d_roof = ellipseDist(x, y, CX, CY, ROOF_RX, ROOF_RY);
      const d_wall = ellipseDist(x, y, CX, CY, WALL_RX, WALL_RY);

      // Roof canopy: between roof ellipse edge and wall
      if (d_roof <= 1.0 && d_wall > 1.0) {
        const n = noise(x, y, 99);

        // Angular canopy segments (wedge-shaped roofs)
        const angle = Math.atan2(y - CY, x - CX);
        const segment = Math.floor((angle + Math.PI) / (Math.PI / 6)) % 12;
        const segEdge = Math.abs(((angle + Math.PI) % (Math.PI / 6)) / (Math.PI / 6) - 0.5);

        let col;
        if (segEdge > 0.45) {
          // Structural beam between segments
          col = COL.roofDark;
        } else {
          // Roof panel
          col = n < 0.3 ? COL.roofDark : n < 0.7 ? COL.roofSteel : COL.roofHighlight;
        }

        // Roof gets slightly transparent toward outer edge for a canopy effect
        const edgeFade = Math.max(0, (d_roof - 0.85) / 0.15);
        const alpha = Math.round(255 - edgeFade * 60);

        setPixel(data, x, y, W, col[0], col[1], col[2], alpha);
      }

      // Floodlight tops (above player)
      const floodPositions = [
        [CX - ROOF_RX + 4, CY - ROOF_RY + 4],
        [CX + ROOF_RX - 8, CY - ROOF_RY + 4],
        [CX - ROOF_RX + 4, CY + ROOF_RY - 8],
        [CX + ROOF_RX - 8, CY + ROOF_RY - 8],
      ];
      for (const [fx, fy] of floodPositions) {
        // Light glow
        if (x >= fx - 1 && x < fx + 7 && y >= fy - 2 && y < fy) {
          setPixel(data, x, y, W, ...COL.floodLight, 200);
        }
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

// ─── Simple bitmap text renderer ───────────────────────────────────────────
// 3x5 pixel font for tiny text
const FONT_3X5 = {
  'C': [0b111,0b100,0b100,0b100,0b111],
  'H': [0b101,0b101,0b111,0b101,0b101],
  'I': [0b111,0b010,0b010,0b010,0b111],
  'N': [0b101,0b111,0b111,0b101,0b101],
  'A': [0b010,0b101,0b111,0b101,0b101],
  'S': [0b111,0b100,0b111,0b001,0b111],
  'W': [0b101,0b101,0b101,0b111,0b101],
  'M': [0b101,0b111,0b111,0b101,0b101],
  'Y': [0b101,0b101,0b010,0b010,0b010],
  ' ': [0b000,0b000,0b000,0b000,0b000],
};

function drawText(data, w, text, startX, startY, color) {
  let cx = startX;
  for (const ch of text) {
    const glyph = FONT_3X5[ch] || FONT_3X5[' '];
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 3; col++) {
        if (glyph[row] & (1 << (2 - col))) {
          setPixel(data, cx + col, startY + row, w, color[0], color[1], color[2]);
        }
      }
    }
    cx += 4; // 3px char + 1px gap
  }
}

// ─── Main ──────────────────────────────────────────────────────────────────
const outDir = path.resolve(__dirname, '..', 'public', 'assets', 'sprites');
fs.mkdirSync(outDir, { recursive: true });

console.log('Generating Chinnaswamy Stadium sprites...');

const baseCanvas = generateBase();
const basePath = path.join(outDir, 'chinnaswamy-stadium.png');
fs.writeFileSync(basePath, baseCanvas.toBuffer('image/png'));
console.log(`  Base sprite: ${basePath} (${W}x${H})`);

const roofCanvas = generateRoof();
const roofPath = path.join(outDir, 'chinnaswamy-roof.png');
fs.writeFileSync(roofPath, roofCanvas.toBuffer('image/png'));
console.log(`  Roof sprite: ${roofPath} (${W}x${H})`);

console.log('Done!');
