/**
 * Generate park coffee vendor NPC spritesheet.
 *
 * Layout: 48x64 (3 cols x 4 rows of 16x16 frames)
 * Matches existing NPC sprite layout from generate-npc-sprites.cjs.
 *
 * Row order: down(0), left(1), right(2), up(3)
 * Col order: walk1(0), idle(1), walk2(2)
 * walkingAnimationMapping: 0
 *
 * Character: Park coffee vendor
 *   - Warm brown skin (#8B5E3C)
 *   - White apron/shirt (#FFFFFF)
 *   - Dark hair (#333333)
 *   - Carrying a tray (visible from front/sides)
 *
 * Run: node scripts/generate-park-coffee-npc.cjs
 */

const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const FRAME_W = 16;
const FRAME_H = 16;
const COLS = 3;
const ROWS = 4;
const IMG_W = FRAME_W * COLS; // 48
const IMG_H = FRAME_H * ROWS; // 64

function hex(h) {
  const r = parseInt(h.slice(1, 3), 16);
  const g = parseInt(h.slice(3, 5), 16);
  const b = parseInt(h.slice(5, 7), 16);
  return [r, g, b, 255];
}

function darker(color, amount = 30) {
  return [
    Math.max(0, color[0] - amount),
    Math.max(0, color[1] - amount),
    Math.max(0, color[2] - amount),
    255,
  ];
}

function createPNG() {
  const png = new PNG({ width: IMG_W, height: IMG_H });
  for (let i = 0; i < png.data.length; i += 4) {
    png.data[i] = 0;
    png.data[i + 1] = 0;
    png.data[i + 2] = 0;
    png.data[i + 3] = 0;
  }
  return png;
}

function setPixel(png, x, y, color) {
  if (x < 0 || x >= IMG_W || y < 0 || y >= IMG_H) return;
  const idx = (IMG_W * y + x) << 2;
  png.data[idx] = color[0];
  png.data[idx + 1] = color[1];
  png.data[idx + 2] = color[2];
  png.data[idx + 3] = color[3];
}

function fillRect(png, x, y, w, h, color) {
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      setPixel(png, x + dx, y + dy, color);
    }
  }
}

// Palette
const SKIN = hex('#8B5E3C');
const SKIN_SHADOW = darker(SKIN);
const HAIR = hex('#333333');
const EYES = hex('#111111');
const APRON = hex('#FFFFFF');
const APRON_SHADOW = hex('#E0E0E0');
const SHIRT = hex('#EEEEEE');
const SHIRT_SHADOW = hex('#CCCCCC');
const PANTS = hex('#555555');
const PANTS_SHADOW = hex('#444444');
const SHOES = hex('#3A2A1A');
const TRAY = hex('#8B6914');
const TRAY_DARK = hex('#6B4914');

/**
 * Draw coffee vendor NPC in a 16x16 frame.
 * Same structure as existing NPCs: hair crown, face, chin, body, legs.
 */
function drawNPC(png, col, row, direction, pose) {
  const ox = col * FRAME_W;
  const oy = row * FRAME_H;

  // === HAIR CROWN (rows 0-2) ===
  fillRect(png, ox + 6, oy + 0, 4, 1, HAIR);
  fillRect(png, ox + 4, oy + 1, 8, 1, HAIR);
  fillRect(png, ox + 3, oy + 2, 10, 1, HAIR);

  // === FACE (rows 3-6) ===
  if (direction === 'down') {
    fillRect(png, ox + 3, oy + 3, 1, 4, HAIR);
    fillRect(png, ox + 12, oy + 3, 1, 4, HAIR);
    fillRect(png, ox + 4, oy + 3, 8, 4, SKIN);
    setPixel(png, ox + 5, oy + 4, EYES);
    setPixel(png, ox + 10, oy + 4, EYES);
    // Slight smile
    setPixel(png, ox + 7, oy + 6, SKIN_SHADOW);
    setPixel(png, ox + 8, oy + 6, SKIN_SHADOW);
  } else if (direction === 'up') {
    fillRect(png, ox + 3, oy + 3, 10, 4, HAIR);
  } else if (direction === 'left') {
    fillRect(png, ox + 3, oy + 3, 10, 4, HAIR);
    fillRect(png, ox + 4, oy + 3, 5, 4, SKIN);
    setPixel(png, ox + 5, oy + 4, EYES);
    setPixel(png, ox + 5, oy + 6, SKIN_SHADOW);
  } else if (direction === 'right') {
    fillRect(png, ox + 3, oy + 3, 10, 4, HAIR);
    fillRect(png, ox + 7, oy + 3, 5, 4, SKIN);
    setPixel(png, ox + 10, oy + 4, EYES);
    setPixel(png, ox + 10, oy + 6, SKIN_SHADOW);
  }

  // === CHIN (row 7) ===
  if (direction === 'up') {
    fillRect(png, ox + 4, oy + 7, 8, 1, HAIR);
  } else {
    fillRect(png, ox + 5, oy + 7, 6, 1, SKIN);
  }

  // === BODY (rows 8-9): White apron/shirt ===
  fillRect(png, ox + 5, oy + 8, 6, 1, APRON);
  fillRect(png, ox + 5, oy + 9, 6, 1, APRON_SHADOW);

  // Tray/pot carried -- visible from front and sides
  if (direction === 'down') {
    // Tray in front
    fillRect(png, ox + 3, oy + 9, 2, 1, TRAY);
    fillRect(png, ox + 11, oy + 9, 2, 1, TRAY);
  } else if (direction === 'left') {
    // Tray on left hand side
    fillRect(png, ox + 2, oy + 8, 3, 1, TRAY);
    setPixel(png, ox + 2, oy + 9, TRAY_DARK);
  } else if (direction === 'right') {
    // Tray on right hand side
    fillRect(png, ox + 11, oy + 8, 3, 1, TRAY);
    setPixel(png, ox + 13, oy + 9, TRAY_DARK);
  } else if (direction === 'up') {
    // Tray visible as arms extending
    setPixel(png, ox + 4, oy + 8, TRAY);
    setPixel(png, ox + 4, oy + 9, TRAY_DARK);
  }

  // === LEGS (rows 10-13) ===
  fillRect(png, ox + 6, oy + 10, 4, 2, PANTS);

  if (pose === 'idle') {
    fillRect(png, ox + 6, oy + 12, 2, 1, PANTS);
    fillRect(png, ox + 8, oy + 12, 2, 1, PANTS);
    fillRect(png, ox + 6, oy + 13, 2, 1, SHOES);
    fillRect(png, ox + 8, oy + 13, 2, 1, SHOES);
  } else if (pose === 'walk1') {
    fillRect(png, ox + 6, oy + 12, 2, 1, PANTS);
    fillRect(png, ox + 6, oy + 13, 2, 1, SHOES);
    fillRect(png, ox + 8, oy + 12, 2, 1, SHOES);
  } else if (pose === 'walk2') {
    fillRect(png, ox + 6, oy + 12, 2, 1, SHOES);
    fillRect(png, ox + 8, oy + 12, 2, 1, PANTS);
    fillRect(png, ox + 8, oy + 13, 2, 1, SHOES);
  }
}

// --- Main ---
const png = createPNG();
const directions = ['down', 'left', 'right', 'up'];
const poses = ['walk1', 'idle', 'walk2'];

for (let row = 0; row < ROWS; row++) {
  for (let col = 0; col < COLS; col++) {
    drawNPC(png, col, row, directions[row], poses[col]);
  }
}

const outputDir = path.join(__dirname, '..', 'public', 'assets', 'sprites');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const outputPath = path.join(outputDir, 'npc-park-coffee-vendor.png');
const buffer = PNG.sync.write(png);
fs.writeFileSync(outputPath, buffer);
console.log(`Generated: ${outputPath} (${IMG_W}x${IMG_H})`);
