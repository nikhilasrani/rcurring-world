/**
 * Generate UI control assets: joystick base/thumb, A/B buttons
 * GBA-style pixel art for touch controls overlay
 */
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'assets', 'ui');

function setPixel(png, x, y, r, g, b, a = 255) {
  if (x < 0 || x >= png.width || y < 0 || y >= png.height) return;
  const idx = (png.width * y + x) << 2;
  png.data[idx] = r;
  png.data[idx + 1] = g;
  png.data[idx + 2] = b;
  png.data[idx + 3] = a;
}

function fillCircle(png, cx, cy, radius, r, g, b, a = 255) {
  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= radius * radius) {
        setPixel(png, x, y, r, g, b, a);
      }
    }
  }
}

function drawCircleOutline(png, cx, cy, radius, r, g, b, a = 255, thickness = 1) {
  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist >= radius - thickness && dist <= radius + thickness) {
        setPixel(png, x, y, r, g, b, a);
      }
    }
  }
}

function drawLetter(png, letter, startX, startY, r, g, b, a = 255) {
  // Simple 5x7 pixel font for A and B
  const letters = {
    A: [
      '  #  ',
      ' # # ',
      '#   #',
      '#####',
      '#   #',
      '#   #',
      '#   #',
    ],
    B: [
      '#### ',
      '#   #',
      '#   #',
      '#### ',
      '#   #',
      '#   #',
      '#### ',
    ],
  };

  const pattern = letters[letter];
  if (!pattern) return;

  for (let row = 0; row < pattern.length; row++) {
    for (let col = 0; col < pattern[row].length; col++) {
      if (pattern[row][col] === '#') {
        setPixel(png, startX + col, startY + row, r, g, b, a);
      }
    }
  }
}

function savePNG(png, filename) {
  const filePath = path.join(OUTPUT_DIR, filename);
  const buffer = PNG.sync.write(png);
  fs.writeFileSync(filePath, buffer);
  console.log(`Created: ${filePath}`);
}

// --- Joystick Base: 64x64 dark semi-transparent circle with direction hints ---
function generateJoystickBase() {
  const size = 64;
  const png = new PNG({ width: size, height: size });
  // Fill transparent
  for (let i = 0; i < png.data.length; i += 4) {
    png.data[i] = 0;
    png.data[i + 1] = 0;
    png.data[i + 2] = 0;
    png.data[i + 3] = 0;
  }

  const cx = 31;
  const cy = 31;

  // Dark fill circle
  fillCircle(png, cx, cy, 28, 32, 32, 48, 160);

  // Lighter border ring
  drawCircleOutline(png, cx, cy, 28, 128, 128, 160, 200, 2);

  // Direction hint lines (dashed cross)
  // Horizontal line
  for (let x = cx - 20; x <= cx + 20; x++) {
    if (Math.abs(x - cx) > 6 && (x % 3 !== 0)) { // dashed, skip center
      setPixel(png, x, cy, 96, 96, 128, 100);
    }
  }
  // Vertical line
  for (let y = cy - 20; y <= cy + 20; y++) {
    if (Math.abs(y - cy) > 6 && (y % 3 !== 0)) { // dashed, skip center
      setPixel(png, cx, y, 96, 96, 128, 100);
    }
  }

  // Small arrow hints at cardinal directions
  // Up arrow
  setPixel(png, cx, cy - 22, 160, 160, 200, 180);
  setPixel(png, cx - 1, cy - 21, 160, 160, 200, 180);
  setPixel(png, cx + 1, cy - 21, 160, 160, 200, 180);
  // Down arrow
  setPixel(png, cx, cy + 22, 160, 160, 200, 180);
  setPixel(png, cx - 1, cy + 21, 160, 160, 200, 180);
  setPixel(png, cx + 1, cy + 21, 160, 160, 200, 180);
  // Left arrow
  setPixel(png, cx - 22, cy, 160, 160, 200, 180);
  setPixel(png, cx - 21, cy - 1, 160, 160, 200, 180);
  setPixel(png, cx - 21, cy + 1, 160, 160, 200, 180);
  // Right arrow
  setPixel(png, cx + 22, cy, 160, 160, 200, 180);
  setPixel(png, cx + 21, cy - 1, 160, 160, 200, 180);
  setPixel(png, cx + 21, cy + 1, 160, 160, 200, 180);

  savePNG(png, 'joystick-base.png');
}

// --- Joystick Thumb: 24x24 lighter circle nub ---
function generateJoystickThumb() {
  const size = 24;
  const png = new PNG({ width: size, height: size });
  for (let i = 0; i < png.data.length; i += 4) {
    png.data[i] = 0;
    png.data[i + 1] = 0;
    png.data[i + 2] = 0;
    png.data[i + 3] = 0;
  }

  const cx = 11;
  const cy = 11;

  // White-ish fill
  fillCircle(png, cx, cy, 9, 200, 200, 220, 180);

  // Lighter highlight on top-left
  fillCircle(png, cx - 2, cy - 2, 4, 240, 240, 255, 200);

  // Subtle border
  drawCircleOutline(png, cx, cy, 9, 160, 160, 180, 220, 1);

  savePNG(png, 'joystick-thumb.png');
}

// --- Button A: 32x32 GBA-style red/orange with "A" text ---
function generateButtonA() {
  const size = 32;
  const png = new PNG({ width: size, height: size });
  for (let i = 0; i < png.data.length; i += 4) {
    png.data[i] = 0;
    png.data[i + 1] = 0;
    png.data[i + 2] = 0;
    png.data[i + 3] = 0;
  }

  const cx = 15;
  const cy = 15;

  // Red-orange fill (GBA A button style)
  fillCircle(png, cx, cy, 13, 200, 72, 56, 220);

  // Lighter highlight
  fillCircle(png, cx - 2, cy - 2, 6, 232, 104, 80, 200);

  // Border
  drawCircleOutline(png, cx, cy, 13, 160, 48, 40, 240, 1);

  // "A" letter centered (5x7 font, centered in 32x32)
  drawLetter(png, 'A', 13, 9, 255, 240, 232, 255);

  savePNG(png, 'button-a.png');
}

// --- Button B: 32x32 GBA-style blue with "B" text ---
function generateButtonB() {
  const size = 32;
  const png = new PNG({ width: size, height: size });
  for (let i = 0; i < png.data.length; i += 4) {
    png.data[i] = 0;
    png.data[i + 1] = 0;
    png.data[i + 2] = 0;
    png.data[i + 3] = 0;
  }

  const cx = 15;
  const cy = 15;

  // Blue fill (GBA B button style)
  fillCircle(png, cx, cy, 13, 56, 80, 200, 220);

  // Lighter highlight
  fillCircle(png, cx - 2, cy - 2, 6, 80, 112, 232, 200);

  // Border
  drawCircleOutline(png, cx, cy, 13, 40, 56, 160, 240, 1);

  // "B" letter centered
  drawLetter(png, 'B', 13, 9, 232, 240, 255, 255);

  savePNG(png, 'button-b.png');
}

// --- Main ---
fs.mkdirSync(OUTPUT_DIR, { recursive: true });
generateJoystickBase();
generateJoystickThumb();
generateButtonA();
generateButtonB();
console.log('UI assets generated successfully!');
