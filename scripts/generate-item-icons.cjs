/**
 * Generate item icon spritesheet for inventory system.
 *
 * Layout: 128x16 (8 frames of 16x16)
 * Frame order (left to right):
 *   0: Filter Coffee   -- steel tumbler with steam
 *   1: Masala Dosa      -- golden folded crepe on plate
 *   2: Jasmine Flowers  -- white flower cluster with green stem
 *   3: Namma Metro Token-- round purple coin with M
 *   4: Cubbon Park Leaf -- large green leaf with veins
 *   5: UB City Shopping Bag -- pink/red bag with white handles
 *   6: Old Bengaluru Photo -- sepia rectangle with border
 *   7: Best Filter Coffee -- gold-rimmed steel tumbler with star
 *
 * Run: node scripts/generate-item-icons.cjs
 */

const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const FRAME_W = 16;
const FRAME_H = 16;
const FRAMES = 8;
const IMG_W = FRAME_W * FRAMES; // 128
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

function fillRect(png, x, y, w, h, color) {
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      setPixel(png, x + dx, y + dy, color);
    }
  }
}

// --- Frame 0: Filter Coffee (steel tumbler with steam) ---
function drawFilterCoffee(png, ox) {
  const steel = hex('#A0A0A0');
  const steelDark = hex('#808080');
  const brown = hex('#6B3A2A');

  // Steam wisps
  setPixel(png, ox + 6, 1, brown);
  setPixel(png, ox + 9, 2, brown);
  setPixel(png, ox + 7, 3, brown);

  // Tumbler body (tapered)
  fillRect(png, ox + 5, 5, 6, 1, steel);    // rim
  fillRect(png, ox + 5, 6, 6, 6, steelDark); // body
  fillRect(png, ox + 6, 12, 4, 1, steel);    // base
  // Highlight on left edge
  setPixel(png, ox + 5, 7, steel);
  setPixel(png, ox + 5, 8, steel);
  setPixel(png, ox + 5, 9, steel);
}

// --- Frame 1: Masala Dosa (golden crepe on plate) ---
function drawMasalaDosa(png, ox) {
  const gold = hex('#D4A843');
  const goldDark = hex('#B08830');
  const plate = hex('#F0E6D0');

  // Plate
  fillRect(png, ox + 2, 11, 12, 2, plate);
  fillRect(png, ox + 3, 13, 10, 1, plate);

  // Dosa -- triangle/fold shape
  fillRect(png, ox + 3, 7, 10, 1, gold);
  fillRect(png, ox + 4, 8, 9, 1, gold);
  fillRect(png, ox + 5, 9, 8, 1, goldDark);
  fillRect(png, ox + 5, 10, 7, 1, gold);
  fillRect(png, ox + 6, 11, 5, 1, goldDark);
}

// --- Frame 2: Jasmine Flowers (white cluster + green stem) ---
function drawJasmineFlowers(png, ox) {
  const white = hex('#FFFFFF');
  const cream = hex('#F0F0E0');
  const green = hex('#3A7A3A');
  const greenDark = hex('#2A5A2A');

  // Stem
  fillRect(png, ox + 7, 10, 2, 4, green);
  setPixel(png, ox + 6, 12, greenDark);

  // Flower cluster
  setPixel(png, ox + 7, 4, white);
  setPixel(png, ox + 8, 4, white);
  fillRect(png, ox + 5, 5, 6, 1, white);
  fillRect(png, ox + 4, 6, 8, 1, cream);
  fillRect(png, ox + 5, 7, 6, 1, white);
  fillRect(png, ox + 5, 8, 6, 1, cream);
  fillRect(png, ox + 6, 9, 4, 1, white);
}

// --- Frame 3: Namma Metro Token (purple coin with M) ---
function drawMetroToken(png, ox) {
  const purple = hex('#8B45A6');
  const purpleDark = hex('#6B2586');
  const silver = hex('#D4D4D4');

  // Circle coin shape
  fillRect(png, ox + 5, 3, 6, 1, purple);
  fillRect(png, ox + 4, 4, 8, 1, purple);
  fillRect(png, ox + 3, 5, 10, 6, purple);
  fillRect(png, ox + 4, 11, 8, 1, purpleDark);
  fillRect(png, ox + 5, 12, 6, 1, purpleDark);

  // Letter M in silver
  setPixel(png, ox + 5, 6, silver);
  setPixel(png, ox + 5, 7, silver);
  setPixel(png, ox + 5, 8, silver);
  setPixel(png, ox + 5, 9, silver);
  setPixel(png, ox + 6, 7, silver);
  setPixel(png, ox + 7, 8, silver);
  setPixel(png, ox + 8, 7, silver);
  setPixel(png, ox + 9, 6, silver);
  setPixel(png, ox + 9, 7, silver);
  setPixel(png, ox + 9, 8, silver);
  setPixel(png, ox + 9, 9, silver);
}

// --- Frame 4: Cubbon Park Leaf (large green leaf with veins) ---
function drawCubbonParkLeaf(png, ox) {
  const green = hex('#2D7A2D');
  const vein = hex('#1A5C1A');

  // Leaf shape
  setPixel(png, ox + 7, 2, green);
  fillRect(png, ox + 6, 3, 4, 1, green);
  fillRect(png, ox + 5, 4, 6, 1, green);
  fillRect(png, ox + 4, 5, 8, 1, green);
  fillRect(png, ox + 3, 6, 10, 1, green);
  fillRect(png, ox + 3, 7, 10, 1, green);
  fillRect(png, ox + 4, 8, 8, 1, green);
  fillRect(png, ox + 4, 9, 8, 1, green);
  fillRect(png, ox + 5, 10, 6, 1, green);
  fillRect(png, ox + 6, 11, 4, 1, green);
  setPixel(png, ox + 7, 12, green);

  // Center vein
  setPixel(png, ox + 7, 3, vein);
  setPixel(png, ox + 7, 4, vein);
  setPixel(png, ox + 7, 5, vein);
  setPixel(png, ox + 7, 6, vein);
  setPixel(png, ox + 7, 7, vein);
  setPixel(png, ox + 7, 8, vein);
  setPixel(png, ox + 7, 9, vein);
  setPixel(png, ox + 7, 10, vein);

  // Side veins
  setPixel(png, ox + 5, 6, vein);
  setPixel(png, ox + 9, 6, vein);
  setPixel(png, ox + 5, 8, vein);
  setPixel(png, ox + 9, 8, vein);

  // Stem
  fillRect(png, ox + 7, 13, 1, 2, vein);
}

// --- Frame 5: UB City Shopping Bag (pink/red bag with white handles) ---
function drawShoppingBag(png, ox) {
  const pink = hex('#CC4466');
  const pinkDark = hex('#AA2244');
  const white = hex('#FFFFFF');

  // Handles
  setPixel(png, ox + 5, 3, white);
  setPixel(png, ox + 10, 3, white);
  setPixel(png, ox + 5, 4, white);
  setPixel(png, ox + 10, 4, white);

  // Bag body
  fillRect(png, ox + 4, 5, 8, 8, pink);
  fillRect(png, ox + 4, 13, 8, 1, pinkDark);

  // Bottom shadow
  fillRect(png, ox + 5, 12, 6, 1, pinkDark);

  // UB text hint (simple white dots)
  setPixel(png, ox + 6, 8, white);
  setPixel(png, ox + 6, 9, white);
  setPixel(png, ox + 7, 10, white);
  setPixel(png, ox + 9, 8, white);
  setPixel(png, ox + 9, 9, white);
  setPixel(png, ox + 8, 9, white);
}

// --- Frame 6: Old Bengaluru Photo (sepia rectangle with border) ---
function drawOldPhoto(png, ox) {
  const sepia = hex('#C4A872');
  const border = hex('#8B7344');
  const sepiaLight = hex('#D4B882');

  // Border
  fillRect(png, ox + 3, 3, 10, 10, border);
  // Inner sepia fill
  fillRect(png, ox + 4, 4, 8, 8, sepia);
  // Photo "content" hint
  fillRect(png, ox + 5, 6, 3, 2, sepiaLight);
  fillRect(png, ox + 9, 7, 2, 3, sepiaLight);
  // Corner accents
  setPixel(png, ox + 3, 3, border);
  setPixel(png, ox + 12, 3, border);
  setPixel(png, ox + 3, 12, border);
  setPixel(png, ox + 12, 12, border);
}

// --- Frame 7: Best Filter Coffee (gold-rimmed tumbler with star) ---
function drawBestFilterCoffee(png, ox) {
  const steel = hex('#A0A0A0');
  const steelDark = hex('#808080');
  const gold = hex('#E8B830');
  const goldDark = hex('#C89810');

  // Gold rim at top
  fillRect(png, ox + 5, 4, 6, 1, gold);
  fillRect(png, ox + 4, 5, 8, 1, gold);

  // Tumbler body
  fillRect(png, ox + 5, 6, 6, 6, steelDark);
  fillRect(png, ox + 6, 12, 4, 1, steel);

  // Highlight
  setPixel(png, ox + 5, 7, steel);
  setPixel(png, ox + 5, 8, steel);

  // Gold base rim
  fillRect(png, ox + 5, 12, 6, 1, goldDark);

  // Star on body
  setPixel(png, ox + 7, 7, gold);
  setPixel(png, ox + 8, 7, gold);
  setPixel(png, ox + 6, 8, gold);
  setPixel(png, ox + 7, 8, gold);
  setPixel(png, ox + 8, 8, gold);
  setPixel(png, ox + 9, 8, gold);
  setPixel(png, ox + 7, 9, gold);
  setPixel(png, ox + 8, 9, gold);
}

// --- Main ---
const png = createPNG();

drawFilterCoffee(png, 0 * FRAME_W);
drawMasalaDosa(png, 1 * FRAME_W);
drawJasmineFlowers(png, 2 * FRAME_W);
drawMetroToken(png, 3 * FRAME_W);
drawCubbonParkLeaf(png, 4 * FRAME_W);
drawShoppingBag(png, 5 * FRAME_W);
drawOldPhoto(png, 6 * FRAME_W);
drawBestFilterCoffee(png, 7 * FRAME_W);

const outputDir = path.join(__dirname, '..', 'public', 'assets', 'sprites');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const outputPath = path.join(outputDir, 'item-icons.png');
const buffer = PNG.sync.write(png);
fs.writeFileSync(outputPath, buffer);
console.log(`Generated: ${outputPath} (${IMG_W}x${IMG_H}, ${FRAMES} item icons)`);
