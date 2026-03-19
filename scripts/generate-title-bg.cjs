/**
 * Generate title background image: 480x320 pixel art
 * Dark/night Bengaluru skyline silhouette with stars
 * GBA palette constraint
 */
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const WIDTH = 480;
const HEIGHT = 320;

// GBA-style limited color palette for night scene
const COLORS = {
  skyTop: [8, 8, 32],        // Deep dark blue-black
  skyMid: [16, 16, 56],      // Dark blue
  skyLow: [32, 24, 64],      // Purple-blue horizon
  horizonGlow: [56, 32, 72], // Faint purple glow at horizon
  star: [248, 248, 200],     // Warm white stars
  starDim: [160, 160, 128],  // Dimmer stars
  buildingSilhouette: [16, 16, 24],   // Nearly black buildings
  buildingDetail: [24, 24, 40],       // Slightly lighter building details
  windowLit: [232, 200, 96],          // Lit windows (warm yellow)
  windowDim: [168, 136, 64],          // Dimmer windows
  ground: [12, 12, 20],              // Ground level
  treeSilhouette: [12, 20, 16],      // Dark green-black trees
};

function createPNG() {
  const png = new PNG({ width: WIDTH, height: HEIGHT });
  return png;
}

function setPixel(png, x, y, r, g, b) {
  if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) return;
  const idx = (WIDTH * y + x) << 2;
  png.data[idx] = r;
  png.data[idx + 1] = g;
  png.data[idx + 2] = b;
  png.data[idx + 3] = 255;
}

function fillRect(png, x, y, w, h, color) {
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      setPixel(png, x + dx, y + dy, color[0], color[1], color[2]);
    }
  }
}

function lerp(a, b, t) {
  return Math.round(a + (b - a) * t);
}

function lerpColor(c1, c2, t) {
  return [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)];
}

// Seeded random for reproducibility
let seed = 42;
function seededRandom() {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x7fffffff;
}

function generateTitleBg() {
  const png = createPNG();

  // === SKY GRADIENT ===
  const skyBottom = 220; // where buildings start
  for (let y = 0; y < HEIGHT; y++) {
    let color;
    if (y < skyBottom * 0.3) {
      // Top portion: deep dark
      const t = y / (skyBottom * 0.3);
      color = lerpColor(COLORS.skyTop, COLORS.skyMid, t);
    } else if (y < skyBottom * 0.7) {
      // Middle: dark blue
      const t = (y - skyBottom * 0.3) / (skyBottom * 0.4);
      color = lerpColor(COLORS.skyMid, COLORS.skyLow, t);
    } else if (y < skyBottom) {
      // Lower: purple horizon glow
      const t = (y - skyBottom * 0.7) / (skyBottom * 0.3);
      color = lerpColor(COLORS.skyLow, COLORS.horizonGlow, t);
    } else {
      color = COLORS.ground;
    }
    for (let x = 0; x < WIDTH; x++) {
      setPixel(png, x, y, color[0], color[1], color[2]);
    }
  }

  // === STARS ===
  for (let i = 0; i < 80; i++) {
    const x = Math.floor(seededRandom() * WIDTH);
    const y = Math.floor(seededRandom() * (skyBottom * 0.7));
    const bright = seededRandom() > 0.5;
    const col = bright ? COLORS.star : COLORS.starDim;
    setPixel(png, x, y, col[0], col[1], col[2]);
    // Some stars are 2px for twinkle effect
    if (bright && seededRandom() > 0.6) {
      setPixel(png, x + 1, y, col[0], col[1], col[2]);
    }
  }

  // === BENGALURU SKYLINE SILHOUETTE ===
  const buildingColor = COLORS.buildingSilhouette;
  const detailColor = COLORS.buildingDetail;

  // Helper: draw a building block
  function drawBuilding(x, y, w, h) {
    fillRect(png, x, y, w, h, buildingColor);
    // Add window grid
    for (let wy = y + 3; wy < y + h - 2; wy += 4) {
      for (let wx = x + 2; wx < x + w - 2; wx += 4) {
        if (seededRandom() > 0.4) {
          const wCol = seededRandom() > 0.5 ? COLORS.windowLit : COLORS.windowDim;
          setPixel(png, wx, wy, wCol[0], wCol[1], wCol[2]);
          setPixel(png, wx + 1, wy, wCol[0], wCol[1], wCol[2]);
        }
      }
    }
  }

  // Draw tree silhouettes
  function drawTree(cx, baseY, size) {
    const col = COLORS.treeSilhouette;
    // Trunk
    fillRect(png, cx - 1, baseY - size, 2, size, col);
    // Canopy (circle-ish)
    for (let dy = -size; dy < 0; dy++) {
      const r = Math.floor(size * 0.6 * Math.sqrt(1 - (dy / size) * (dy / size)));
      for (let dx = -r; dx <= r; dx++) {
        setPixel(png, cx + dx, baseY + dy - size * 0.3, col[0], col[1], col[2]);
      }
    }
  }

  const groundY = HEIGHT; // bottom of screen
  const skylineBase = 220;

  // Far background buildings (shorter, near horizon)
  drawBuilding(20, skylineBase - 30, 30, 30 + (groundY - skylineBase));
  drawBuilding(55, skylineBase - 20, 20, 20 + (groundY - skylineBase));
  drawBuilding(80, skylineBase - 40, 25, 40 + (groundY - skylineBase));
  drawBuilding(110, skylineBase - 25, 35, 25 + (groundY - skylineBase));

  // Vidhana Soudha silhouette (recognizable dome shape) - center-left
  const vsX = 160;
  const vsBase = skylineBase;
  // Main building body
  fillRect(png, vsX, vsBase - 50, 60, 50 + (groundY - vsBase), buildingColor);
  // Columns at front
  for (let cx = vsX + 5; cx < vsX + 55; cx += 10) {
    fillRect(png, cx, vsBase - 48, 3, 48, detailColor);
  }
  // Central dome
  for (let dy = 0; dy < 15; dy++) {
    const r = Math.floor(12 * Math.sqrt(1 - (dy / 15) * (dy / 15)));
    fillRect(png, vsX + 30 - r, vsBase - 50 - 15 + dy, r * 2, 1, buildingColor);
  }
  // Dome pinnacle
  fillRect(png, vsX + 29, vsBase - 68, 2, 4, buildingColor);
  // Windows
  for (let wy = vsBase - 40; wy < vsBase - 5; wy += 6) {
    for (let wx = vsX + 8; wx < vsX + 52; wx += 10) {
      const wCol = seededRandom() > 0.3 ? COLORS.windowLit : COLORS.windowDim;
      fillRect(png, wx, wy, 2, 3, wCol);
    }
  }

  // UB City / modern tower (tall, right side)
  const ubX = 340;
  drawBuilding(ubX, skylineBase - 80, 20, 80 + (groundY - skylineBase));
  drawBuilding(ubX + 22, skylineBase - 65, 18, 65 + (groundY - skylineBase));
  // Antenna on top
  fillRect(png, ubX + 9, skylineBase - 88, 2, 8, detailColor);
  setPixel(png, ubX + 10, skylineBase - 89, COLORS.windowLit[0], COLORS.windowLit[1], COLORS.windowLit[2]);

  // Chinnaswamy Stadium silhouette (wide, low, curved top) - right
  const csX = 380;
  const csBase = skylineBase;
  // Curved stadium roof
  for (let dx = 0; dx < 60; dx++) {
    const t = dx / 60;
    const h = Math.floor(25 * Math.sin(t * Math.PI));
    fillRect(png, csX + dx, csBase - h, 1, h + (groundY - csBase), buildingColor);
  }
  // Floodlight towers
  fillRect(png, csX + 5, csBase - 45, 2, 25, detailColor);
  fillRect(png, csX + 53, csBase - 45, 2, 25, detailColor);
  setPixel(png, csX + 5, csBase - 46, COLORS.windowLit[0], COLORS.windowLit[1], COLORS.windowLit[2]);
  setPixel(png, csX + 6, csBase - 46, COLORS.windowLit[0], COLORS.windowLit[1], COLORS.windowLit[2]);
  setPixel(png, csX + 53, csBase - 46, COLORS.windowLit[0], COLORS.windowLit[1], COLORS.windowLit[2]);
  setPixel(png, csX + 54, csBase - 46, COLORS.windowLit[0], COLORS.windowLit[1], COLORS.windowLit[2]);

  // More background buildings to fill gaps
  drawBuilding(240, skylineBase - 35, 25, 35 + (groundY - skylineBase));
  drawBuilding(270, skylineBase - 55, 18, 55 + (groundY - skylineBase));
  drawBuilding(292, skylineBase - 30, 22, 30 + (groundY - skylineBase));
  drawBuilding(318, skylineBase - 45, 16, 45 + (groundY - skylineBase));
  drawBuilding(445, skylineBase - 25, 35, 25 + (groundY - skylineBase));

  // Trees (rain trees / Cubbon Park greenery silhouettes)
  drawTree(10, skylineBase + 5, 12);
  drawTree(150, skylineBase + 3, 10);
  drawTree(235, skylineBase + 5, 14);
  drawTree(460, skylineBase + 3, 11);

  // Ground level fill
  fillRect(png, 0, skylineBase + 10, WIDTH, HEIGHT - skylineBase - 10, COLORS.ground);

  // === Write file ===
  const outputDir = path.resolve(__dirname, '..', 'public', 'assets', 'ui');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const outputPath = path.join(outputDir, 'title-bg.png');
  const buffer = PNG.sync.write(png);
  fs.writeFileSync(outputPath, buffer);
  console.log('Generated: ' + outputPath + ' (' + WIDTH + 'x' + HEIGHT + ')');
}

generateTitleBg();
