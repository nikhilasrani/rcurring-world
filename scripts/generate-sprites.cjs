/**
 * Generate player spritesheets for male and female characters.
 *
 * Layout: 3 columns x 4 rows = 12 frames (48x64 pixels total)
 * Frame size: 16x16 pixels (Pokemon FR/E overworld style)
 *
 * Walk animation: ALL directions use the same pattern — one foot extends
 * 1 row lower (stepping forward) while the other stays up. A 2-row
 * waist/upper-leg area prevents any gaps between body and legs.
 *
 * Rows (Grid Engine walkingAnimationMapping convention):
 *   Row 0 (y=0):  Down  - walk1, idle, walk2
 *   Row 1 (y=16): Left  - walk1, idle, walk2
 *   Row 2 (y=32): Right - walk1, idle, walk2
 *   Row 3 (y=48): Up    - walk1, idle, walk2
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

const COLORS = {
  transparent: [0, 0, 0, 0],
  white: [248, 248, 248, 255],
  maleSkin: [232, 190, 152, 255],
  maleSkinShadow: [200, 156, 120, 255],
  maleHair: [48, 40, 32, 255],
  maleShirt: [72, 120, 200, 255],
  maleShirtShadow: [56, 96, 168, 255],
  malePants: [80, 96, 136, 255],
  maleShoes: [56, 48, 40, 255],
  maleEyes: [24, 24, 24, 255],
  maleBackpack: [160, 88, 56, 255],
  femaleSkin: [240, 200, 168, 255],
  femaleSkinShadow: [208, 168, 136, 255],
  femaleHair: [56, 32, 24, 255],
  femaleShirt: [72, 176, 104, 255],
  femaleShirtShadow: [56, 144, 80, 255],
  femalePants: [80, 96, 136, 255],
  femaleShoes: [56, 48, 40, 255],
  femaleEyes: [24, 24, 24, 255],
  femaleBackpack: [168, 72, 104, 255],
};

function createPNG() {
  const png = new PNG({ width: IMG_W, height: IMG_H });
  for (let y = 0; y < IMG_H; y++) {
    for (let x = 0; x < IMG_W; x++) {
      const idx = (IMG_W * y + x) << 2;
      png.data[idx] = 0;
      png.data[idx + 1] = 0;
      png.data[idx + 2] = 0;
      png.data[idx + 3] = 0;
    }
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

/**
 * Draw a Pokemon FR/E-style chibi character in a 16x16 tile.
 *
 * Proportions:
 *   Head:  rows 0-7   (8px, 50%) — 10px wide
 *   Body:  rows 8-9   (2px, 12%) — 6px wide
 *   Legs:  rows 10-13 (4px, 25%) — 4px wide
 *
 * Walk: identical stepping pattern for all 4 directions.
 *   idle:  both feet at row 13 (even)
 *   walk1: left foot at row 13 (stepped), right foot at row 12 (raised)
 *   walk2: right foot at row 13 (stepped), left foot at row 12 (raised)
 *   2-row waist (rows 10-11) fills the connection — no gaps ever.
 */
function drawCharacter(png, col, row, direction, pose, palette) {
  const ox = col * FRAME_W;
  const oy = row * FRAME_H;

  // === HAIR CROWN (rows 0-2, widening) ===
  fillRect(png, ox + 6, oy + 0, 4, 1, palette.hair);
  fillRect(png, ox + 4, oy + 1, 8, 1, palette.hair);
  fillRect(png, ox + 3, oy + 2, 10, 1, palette.hair);

  // === FACE (rows 3-6) ===
  if (direction === 'down') {
    fillRect(png, ox + 3, oy + 3, 1, 4, palette.hair);
    fillRect(png, ox + 12, oy + 3, 1, 4, palette.hair);
    fillRect(png, ox + 4, oy + 3, 8, 4, palette.skin);
    setPixel(png, ox + 5, oy + 4, palette.eyes);
    setPixel(png, ox + 10, oy + 4, palette.eyes);
    setPixel(png, ox + 7, oy + 6, palette.skinShadow);
    setPixel(png, ox + 8, oy + 6, palette.skinShadow);
  } else if (direction === 'up') {
    fillRect(png, ox + 3, oy + 3, 10, 4, palette.hair);
    if (palette.hasPonytail) {
      fillRect(png, ox + 7, oy + 7, 2, 2, palette.hair);
    }
  } else if (direction === 'left') {
    fillRect(png, ox + 3, oy + 3, 10, 4, palette.hair);
    fillRect(png, ox + 4, oy + 3, 5, 4, palette.skin);
    setPixel(png, ox + 5, oy + 4, palette.eyes);
    setPixel(png, ox + 5, oy + 6, palette.skinShadow);
    if (palette.hasPonytail) {
      fillRect(png, ox + 12, oy + 4, 2, 2, palette.hair);
    }
  } else if (direction === 'right') {
    fillRect(png, ox + 3, oy + 3, 10, 4, palette.hair);
    fillRect(png, ox + 7, oy + 3, 5, 4, palette.skin);
    setPixel(png, ox + 10, oy + 4, palette.eyes);
    setPixel(png, ox + 10, oy + 6, palette.skinShadow);
    if (palette.hasPonytail) {
      fillRect(png, ox + 2, oy + 4, 2, 2, palette.hair);
    }
  }

  // === CHIN (row 7) ===
  if (direction === 'up') {
    fillRect(png, ox + 4, oy + 7, 8, 1, palette.hair);
  } else {
    fillRect(png, ox + 5, oy + 7, 6, 1, palette.skin);
  }

  // === BODY (rows 8-9, 6px wide) ===
  fillRect(png, ox + 5, oy + 8, 6, 1, palette.shirt);
  fillRect(png, ox + 5, oy + 9, 6, 1, palette.shirtShadow);

  // Backpack
  if (direction === 'up') {
    fillRect(png, ox + 6, oy + 8, 4, 2, palette.backpack);
  } else if (direction === 'left') {
    fillRect(png, ox + 10, oy + 8, 1, 2, palette.backpack);
  } else if (direction === 'right') {
    fillRect(png, ox + 5, oy + 8, 1, 2, palette.backpack);
  }

  // === LEGS (rows 10-13) — same stepping for all directions ===
  // Waist / upper legs (2 rows — always present, prevents gaps)
  fillRect(png, ox + 6, oy + 10, 4, 2, palette.pants);

  if (pose === 'idle') {
    // Both feet even
    fillRect(png, ox + 6, oy + 12, 2, 1, palette.pants);
    fillRect(png, ox + 8, oy + 12, 2, 1, palette.pants);
    fillRect(png, ox + 6, oy + 13, 2, 1, palette.shoes);
    fillRect(png, ox + 8, oy + 13, 2, 1, palette.shoes);
  } else if (pose === 'walk1') {
    // Left foot steps forward (extends to row 13), right foot raised (shoe at row 12)
    fillRect(png, ox + 6, oy + 12, 2, 1, palette.pants);
    fillRect(png, ox + 6, oy + 13, 2, 1, palette.shoes);
    fillRect(png, ox + 8, oy + 12, 2, 1, palette.shoes);
  } else if (pose === 'walk2') {
    // Right foot steps forward (extends to row 13), left foot raised (shoe at row 12)
    fillRect(png, ox + 6, oy + 12, 2, 1, palette.shoes);
    fillRect(png, ox + 8, oy + 12, 2, 1, palette.pants);
    fillRect(png, ox + 8, oy + 13, 2, 1, palette.shoes);
  }
}

function generateSpritesheet(outputPath, palette) {
  const png = createPNG();
  const directions = ['down', 'left', 'right', 'up'];
  const poses = ['walk1', 'idle', 'walk2'];

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      drawCharacter(png, col, row, directions[row], poses[col], palette);
    }
  }

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const buffer = PNG.sync.write(png);
  fs.writeFileSync(outputPath, buffer);
  console.log(`Generated: ${outputPath} (${IMG_W}x${IMG_H})`);
}

const malePalette = {
  skin: COLORS.maleSkin,
  skinShadow: COLORS.maleSkinShadow,
  hair: COLORS.maleHair,
  eyes: COLORS.maleEyes,
  shirt: COLORS.maleShirt,
  shirtShadow: COLORS.maleShirtShadow,
  pants: COLORS.malePants,
  backpack: COLORS.maleBackpack,
  shoes: COLORS.maleShoes,
  hasPonytail: false,
};

const femalePalette = {
  skin: COLORS.femaleSkin,
  skinShadow: COLORS.femaleSkinShadow,
  hair: COLORS.femaleHair,
  eyes: COLORS.femaleEyes,
  shirt: COLORS.femaleShirt,
  shirtShadow: COLORS.femaleShirtShadow,
  pants: COLORS.femalePants,
  backpack: COLORS.femaleBackpack,
  shoes: COLORS.femaleShoes,
  hasPonytail: true,
};

const basePath = path.resolve(__dirname, '..');
generateSpritesheet(path.join(basePath, 'public/assets/sprites/player-male.png'), malePalette);
generateSpritesheet(path.join(basePath, 'public/assets/sprites/player-female.png'), femalePalette);

console.log('Done! Both spritesheets generated.');
