/**
 * Generate auto-rickshaw spritesheet for moving traffic.
 *
 * Layout: 3 columns x 4 rows = 12 frames (48x64 pixels total)
 * Frame size: 16x16 pixels (same as NPC/player sprites)
 *
 * Directions: down (row 0), left (row 1), right (row 2), up (row 3)
 * Frames: walk1, idle, walk2 (wheel rotation / body bounce)
 *
 * Based on Bangalore's iconic yellow-green auto-rickshaws.
 *
 * Run: node scripts/generate-auto-sprites.cjs
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

// ── Colors ─────────────────────────────────────────────────────────────────
const C = {
  yellow:     [216, 192, 32, 255],   // Body yellow
  yellowDk:   [190, 168, 24, 255],   // Body shadow
  yellowLt:   [235, 215, 60, 255],   // Body highlight
  green:      [56, 160, 48, 255],    // Lower stripe green
  greenDk:    [40, 130, 35, 255],    // Green shadow
  greenLt:    [75, 185, 65, 255],    // Green highlight
  glass:      [120, 184, 216, 255],  // Windshield blue
  glassDk:    [90, 150, 190, 255],   // Glass shadow
  glassHi:    [160, 210, 240, 255],  // Glass highlight
  wheel:      [50, 45, 40, 255],     // Tire dark
  wheelHi:    [80, 75, 65, 255],     // Tire highlight (hub)
  axle:       [100, 95, 85, 255],    // Axle/fender
  frame:      [60, 55, 50, 255],     // Frame/structure
  seat:       [140, 100, 60, 255],   // Seat brown
  headlight:  [255, 240, 180, 255],  // Headlight
  taillight:  [220, 40, 30, 255],    // Tail light
  roof:       [45, 130, 40, 255],    // Roof green (slightly different)
  roofEdge:   [35, 110, 30, 255],    // Roof edge
  shadow:     [40, 40, 40, 80],      // Ground shadow
  black:      [30, 28, 25, 255],     // Outline/dark details
  driver:     [200, 150, 108, 255],  // Driver skin
  driverHair: [50, 40, 30, 255],     // Driver hair
  driverTop:  [195, 176, 145, 255],  // Driver shirt (khaki)
};

function createPNG() {
  const png = new PNG({ width: IMG_W, height: IMG_H });
  // Initialize transparent
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
  // Alpha blending for shadow
  if (color[3] < 255) {
    const a = color[3] / 255;
    const existing = [png.data[idx], png.data[idx+1], png.data[idx+2], png.data[idx+3]];
    if (existing[3] > 0) return; // Don't overwrite existing pixels with shadow
  }
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

// ── Draw auto facing DOWN (rear view) ──────────────────────────────────
function drawAutoDown(png, ox, oy, frame) {
  const bounce = frame === 0 ? -1 : frame === 2 ? 1 : 0;
  const wheelPhase = frame; // 0, 1, 2

  // Ground shadow
  fillRect(png, ox + 3, oy + 14, 10, 2, C.shadow);

  // Roof (green canopy top) - rows 1-2
  fillRect(png, ox + 3, oy + 1, 10, 1, C.roofEdge);
  fillRect(png, ox + 4, oy + 2, 8, 1, C.roof);

  // Body rear (yellow) - rows 3-7
  fillRect(png, ox + 3, oy + 3, 10, 5, C.yellow);
  // Side shadows
  fillRect(png, ox + 3, oy + 3, 1, 5, C.yellowDk);
  fillRect(png, ox + 12, oy + 3, 1, 5, C.yellowDk);
  // Rear panel detail
  fillRect(png, ox + 5, oy + 4, 6, 2, C.yellowDk);

  // Tail lights
  setPixel(png, ox + 4, oy + 5, C.taillight);
  setPixel(png, ox + 11, oy + 5, C.taillight);

  // Green stripe (lower body) - rows 8-10
  fillRect(png, ox + 3, oy + 8, 10, 3, C.green);
  fillRect(png, ox + 3, oy + 8, 1, 3, C.greenDk);
  fillRect(png, ox + 12, oy + 8, 1, 3, C.greenDk);

  // License plate area
  fillRect(png, ox + 6, oy + 9, 4, 1, [240, 240, 200, 255]);

  // Wheel wells and wheels - rows 11-13
  fillRect(png, ox + 3, oy + 11, 3, 2, C.frame);  // Left fender
  fillRect(png, ox + 10, oy + 11, 3, 2, C.frame); // Right fender
  // Left wheel
  fillRect(png, ox + 3, oy + 11 + (wheelPhase === 0 ? 1 : 0), 2, 2, C.wheel);
  setPixel(png, ox + 4, oy + 12, C.wheelHi);
  // Right wheel
  fillRect(png, ox + 11, oy + 11 + (wheelPhase === 2 ? 1 : 0), 2, 2, C.wheel);
  setPixel(png, ox + 11, oy + 12, C.wheelHi);

  // Undercarriage center
  fillRect(png, ox + 6, oy + 11, 4, 2, C.frame);
}

// ── Draw auto facing UP (front view) ───────────────────────────────────
function drawAutoUp(png, ox, oy, frame) {
  const wheelPhase = frame;

  // Ground shadow
  fillRect(png, ox + 3, oy + 14, 10, 2, C.shadow);

  // Roof (green canopy top) - rows 1-2
  fillRect(png, ox + 3, oy + 1, 10, 1, C.roofEdge);
  fillRect(png, ox + 4, oy + 2, 8, 1, C.roof);

  // Windshield - rows 3-5
  fillRect(png, ox + 3, oy + 3, 10, 3, C.glass);
  fillRect(png, ox + 4, oy + 3, 8, 2, C.glassHi);
  // Windshield frame
  setPixel(png, ox + 3, oy + 3, C.frame);
  setPixel(png, ox + 12, oy + 3, C.frame);
  setPixel(png, ox + 3, oy + 5, C.frame);
  setPixel(png, ox + 12, oy + 5, C.frame);
  // Windshield divider
  setPixel(png, ox + 8, oy + 3, C.frame);
  setPixel(png, ox + 8, oy + 4, C.frame);

  // Driver visible through windshield
  fillRect(png, ox + 6, oy + 4, 2, 2, C.driver);
  setPixel(png, ox + 6, oy + 4, C.driverHair);
  setPixel(png, ox + 7, oy + 4, C.driverHair);

  // Body front (yellow) - rows 6-7
  fillRect(png, ox + 3, oy + 6, 10, 2, C.yellow);
  fillRect(png, ox + 3, oy + 6, 1, 2, C.yellowDk);
  fillRect(png, ox + 12, oy + 6, 1, 2, C.yellowDk);

  // Headlights
  setPixel(png, ox + 4, oy + 6, C.headlight);
  setPixel(png, ox + 11, oy + 6, C.headlight);

  // Green stripe (lower body) - rows 8-10
  fillRect(png, ox + 3, oy + 8, 10, 3, C.green);
  fillRect(png, ox + 3, oy + 8, 1, 3, C.greenDk);
  fillRect(png, ox + 12, oy + 8, 1, 3, C.greenDk);

  // Front bumper
  fillRect(png, ox + 4, oy + 10, 8, 1, C.greenDk);

  // Wheels - rows 11-13
  fillRect(png, ox + 3, oy + 11, 3, 2, C.frame);
  fillRect(png, ox + 10, oy + 11, 3, 2, C.frame);
  // Single front wheel center
  fillRect(png, ox + 7, oy + 11, 2, 2, C.wheel);
  setPixel(png, ox + 7, oy + 12, C.wheelHi);
  // Side wheels
  fillRect(png, ox + 3, oy + 11 + (wheelPhase === 0 ? 1 : 0), 2, 2, C.wheel);
  fillRect(png, ox + 11, oy + 11 + (wheelPhase === 2 ? 1 : 0), 2, 2, C.wheel);
}

// ── Draw auto facing LEFT (side view) ──────────────────────────────────
function drawAutoLeft(png, ox, oy, frame) {
  const wheelPhase = frame;

  // Ground shadow
  fillRect(png, ox + 1, oy + 14, 14, 2, C.shadow);

  // Roof/canopy - rows 1-2
  fillRect(png, ox + 2, oy + 1, 12, 1, C.roofEdge);
  fillRect(png, ox + 3, oy + 2, 10, 1, C.roof);
  // Roof support pole at front
  setPixel(png, ox + 3, oy + 3, C.frame);
  setPixel(png, ox + 3, oy + 4, C.frame);

  // Body (yellow) - rows 3-7
  fillRect(png, ox + 4, oy + 3, 10, 5, C.yellow);
  // Top highlight
  fillRect(png, ox + 5, oy + 3, 8, 1, C.yellowLt);
  // Bottom shadow
  fillRect(png, ox + 4, oy + 7, 10, 1, C.yellowDk);

  // Windshield (front of auto = left side)
  fillRect(png, ox + 2, oy + 3, 2, 4, C.glass);
  setPixel(png, ox + 2, oy + 3, C.glassHi);
  setPixel(png, ox + 3, oy + 3, C.glassHi);

  // Driver
  fillRect(png, ox + 5, oy + 4, 2, 3, C.driverTop);
  setPixel(png, ox + 5, oy + 4, C.driver);
  setPixel(png, ox + 6, oy + 4, C.driverHair);

  // Passenger area (open side)
  fillRect(png, ox + 8, oy + 4, 5, 3, C.seat);
  fillRect(png, ox + 9, oy + 5, 3, 1, [160, 115, 75, 255]); // Seat cushion

  // Green stripe (lower body) - rows 8-10
  fillRect(png, ox + 2, oy + 8, 12, 3, C.green);
  fillRect(png, ox + 2, oy + 8, 12, 1, C.greenLt); // Top of green stripe lighter
  fillRect(png, ox + 2, oy + 10, 12, 1, C.greenDk);

  // Headlight at front
  setPixel(png, ox + 2, oy + 7, C.headlight);
  // Tail light at rear
  setPixel(png, ox + 13, oy + 7, C.taillight);

  // Wheels - rows 11-13
  // Front wheel (single)
  fillRect(png, ox + 3, oy + 11, 3, 2, C.wheel);
  setPixel(png, ox + 4, oy + 11 + (wheelPhase === 0 ? 0 : 1), C.wheelHi);
  // Rear wheel
  fillRect(png, ox + 10, oy + 11, 3, 2, C.wheel);
  setPixel(png, ox + 11, oy + 11 + (wheelPhase === 2 ? 0 : 1), C.wheelHi);

  // Axle/fender
  fillRect(png, ox + 6, oy + 11, 4, 1, C.frame);
  fillRect(png, ox + 2, oy + 10, 1, 3, C.frame); // Front fender
  fillRect(png, ox + 13, oy + 10, 1, 3, C.frame); // Rear fender
}

// ── Draw auto facing RIGHT (side view, mirrored) ──────────────────────
function drawAutoRight(png, ox, oy, frame) {
  const wheelPhase = frame;

  // Ground shadow
  fillRect(png, ox + 1, oy + 14, 14, 2, C.shadow);

  // Roof/canopy - rows 1-2
  fillRect(png, ox + 2, oy + 1, 12, 1, C.roofEdge);
  fillRect(png, ox + 3, oy + 2, 10, 1, C.roof);
  // Roof support pole at front (right side)
  setPixel(png, ox + 12, oy + 3, C.frame);
  setPixel(png, ox + 12, oy + 4, C.frame);

  // Body (yellow) - rows 3-7
  fillRect(png, ox + 2, oy + 3, 10, 5, C.yellow);
  fillRect(png, ox + 3, oy + 3, 8, 1, C.yellowLt);
  fillRect(png, ox + 2, oy + 7, 10, 1, C.yellowDk);

  // Windshield (front = right side)
  fillRect(png, ox + 12, oy + 3, 2, 4, C.glass);
  setPixel(png, ox + 12, oy + 3, C.glassHi);
  setPixel(png, ox + 13, oy + 3, C.glassHi);

  // Driver
  fillRect(png, ox + 9, oy + 4, 2, 3, C.driverTop);
  setPixel(png, ox + 10, oy + 4, C.driver);
  setPixel(png, ox + 9, oy + 4, C.driverHair);

  // Passenger area (open side)
  fillRect(png, ox + 3, oy + 4, 5, 3, C.seat);
  fillRect(png, ox + 4, oy + 5, 3, 1, [160, 115, 75, 255]);

  // Green stripe - rows 8-10
  fillRect(png, ox + 2, oy + 8, 12, 3, C.green);
  fillRect(png, ox + 2, oy + 8, 12, 1, C.greenLt);
  fillRect(png, ox + 2, oy + 10, 12, 1, C.greenDk);

  // Headlight at front (right)
  setPixel(png, ox + 13, oy + 7, C.headlight);
  // Tail light at rear (left)
  setPixel(png, ox + 2, oy + 7, C.taillight);

  // Wheels - rows 11-13
  // Rear wheel (left)
  fillRect(png, ox + 3, oy + 11, 3, 2, C.wheel);
  setPixel(png, ox + 4, oy + 11 + (wheelPhase === 0 ? 0 : 1), C.wheelHi);
  // Front wheel (right, single)
  fillRect(png, ox + 10, oy + 11, 3, 2, C.wheel);
  setPixel(png, ox + 11, oy + 11 + (wheelPhase === 2 ? 0 : 1), C.wheelHi);

  // Axle/fender
  fillRect(png, ox + 6, oy + 11, 4, 1, C.frame);
  fillRect(png, ox + 2, oy + 10, 1, 3, C.frame);
  fillRect(png, ox + 13, oy + 10, 1, 3, C.frame);
}

// ── Generate spritesheet ───────────────────────────────────────────────
function generate() {
  const png = createPNG();
  const drawFns = [drawAutoDown, drawAutoLeft, drawAutoRight, drawAutoUp];
  const frames = [0, 1, 2]; // walk1, idle, walk2

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const ox = col * FRAME_W;
      const oy = row * FRAME_H;
      drawFns[row](png, ox, oy, frames[col]);
    }
  }

  return png;
}

// ── Main ───────────────────────────────────────────────────────────────
const outDir = path.resolve(__dirname, '..', 'public', 'assets', 'sprites');
fs.mkdirSync(outDir, { recursive: true });

const png = generate();
const outPath = path.join(outDir, 'auto-rickshaw.png');
const buffer = PNG.sync.write(png);
fs.writeFileSync(outPath, buffer);
console.log(`Generated: ${outPath} (${IMG_W}x${IMG_H})`);
console.log('Done!');
