/**
 * Generate UI icon sprites: save icon and hamburger menu icon.
 *
 * 1. Save icon: 12x12 classic floppy disk silhouette
 *    Output: public/assets/sprites/save-icon.png
 *
 * 2. Hamburger menu icon: 16x16 three horizontal bars
 *    Output: public/assets/sprites/hamburger-icon.png
 *
 * Run: node scripts/generate-ui-icons.cjs
 */

const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

function setPixel(png, x, y, color) {
  if (x < 0 || x >= png.width || y < 0 || y >= png.height) return;
  const idx = (png.width * y + x) << 2;
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

function hex(h) {
  const r = parseInt(h.slice(1, 3), 16);
  const g = parseInt(h.slice(3, 5), 16);
  const b = parseInt(h.slice(5, 7), 16);
  return [r, g, b, 255];
}

function createTransparentPNG(w, h) {
  const png = new PNG({ width: w, height: h });
  for (let i = 0; i < png.data.length; i += 4) {
    png.data[i] = 0;
    png.data[i + 1] = 0;
    png.data[i + 2] = 0;
    png.data[i + 3] = 0;
  }
  return png;
}

const outputDir = path.join(__dirname, '..', 'public', 'assets', 'sprites');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// --- Save icon: 12x12 floppy disk ---
function generateSaveIcon() {
  const png = createTransparentPNG(12, 12);
  const body = hex('#666666');
  const slider = hex('#999999');
  const label = hex('#444444');
  const border = hex('#555555');

  // Border/outline (1px)
  fillRect(png, 0, 0, 12, 12, border);
  // Body fill (inner area)
  fillRect(png, 1, 1, 10, 10, body);

  // Metal slider at top (centered, 6x3)
  fillRect(png, 3, 0, 6, 3, slider);

  // Label area at bottom (centered, 8x4)
  fillRect(png, 2, 7, 8, 4, label);

  const savePath = path.join(outputDir, 'save-icon.png');
  const buffer = PNG.sync.write(png);
  fs.writeFileSync(savePath, buffer);
  console.log(`Generated: ${savePath} (12x12)`);
}

// --- Hamburger menu icon: 16x16 three bars ---
function generateHamburgerIcon() {
  const png = createTransparentPNG(16, 16);
  const white = hex('#FFFFFF');

  // Three horizontal bars, 10px wide, 2px tall, centered (x=3)
  // Top bar at y=3
  fillRect(png, 3, 3, 10, 2, white);
  // Middle bar at y=7
  fillRect(png, 3, 7, 10, 2, white);
  // Bottom bar at y=11
  fillRect(png, 3, 11, 10, 2, white);

  const hamburgerPath = path.join(outputDir, 'hamburger-icon.png');
  const buffer = PNG.sync.write(png);
  fs.writeFileSync(hamburgerPath, buffer);
  console.log(`Generated: ${hamburgerPath} (16x16)`);
}

generateSaveIcon();
generateHamburgerIcon();
console.log('UI icons generated successfully!');
