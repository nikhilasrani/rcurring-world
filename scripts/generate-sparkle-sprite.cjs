/**
 * Generate sparkle animation spritesheet.
 *
 * Layout: 64x16 (4 frames of 16x16)
 * Frame order (left to right):
 *   0: Small 4-point star, 4px wide, white
 *   1: Medium 4-point star, 6px wide, white + gold center
 *   2: Large 4-point star, 8px wide, gold
 *   3: Medium 4-point star, 6px wide, white + gold center
 *
 * A 4-point star = center pixel + 4 arms extending N/S/E/W.
 *
 * Run: node scripts/generate-sparkle-sprite.cjs
 */

const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const FRAME_W = 16;
const FRAME_H = 16;
const FRAMES = 4;
const IMG_W = FRAME_W * FRAMES; // 64
const IMG_H = FRAME_H;          // 16

function hex(h) {
  const r = parseInt(h.slice(1, 3), 16);
  const g = parseInt(h.slice(3, 5), 16);
  const b = parseInt(h.slice(5, 7), 16);
  return [r, g, b, 255];
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

/**
 * Draw a 4-point star (diamond/cross) centered at (cx, cy).
 * armLength = number of pixels each arm extends from center.
 */
function draw4PointStar(png, cx, cy, armLength, armColor, centerColor) {
  // Center pixel
  setPixel(png, cx, cy, centerColor || armColor);

  // Arms: N, S, E, W
  for (let i = 1; i <= armLength; i++) {
    setPixel(png, cx, cy - i, armColor); // North
    setPixel(png, cx, cy + i, armColor); // South
    setPixel(png, cx - i, cy, armColor); // West
    setPixel(png, cx + i, cy, armColor); // East
  }
}

const white = hex('#FFFFFF');
const gold = hex('#E8B830');

const png = createPNG();

// Frame 0: Small star, 4px wide (arm length = 2)
draw4PointStar(png, 0 * FRAME_W + 7, 7, 2, white, white);

// Frame 1: Medium star, 6px wide (arm length = 3), gold center
draw4PointStar(png, 1 * FRAME_W + 7, 7, 3, white, gold);

// Frame 2: Large star, 8px wide (arm length = 4), all gold
draw4PointStar(png, 2 * FRAME_W + 7, 7, 4, gold, gold);

// Frame 3: Medium star, 6px wide (arm length = 3), gold center (same as frame 1)
draw4PointStar(png, 3 * FRAME_W + 7, 7, 3, white, gold);

const outputDir = path.join(__dirname, '..', 'public', 'assets', 'sprites');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const outputPath = path.join(outputDir, 'sparkle.png');
const buffer = PNG.sync.write(png);
fs.writeFileSync(outputPath, buffer);
console.log(`Generated: ${outputPath} (${IMG_W}x${IMG_H}, ${FRAMES} sparkle frames)`);
