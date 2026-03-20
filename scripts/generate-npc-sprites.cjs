/**
 * Generate NPC spritesheets for 5 NPCs with distinct color palettes.
 *
 * Layout: 3 columns x 4 rows = 12 frames (48x64 pixels total)
 * Frame size: 16x16 pixels (Pokemon FR/E overworld style)
 *
 * Walk animation: ALL directions use the same stepping pattern —
 * one foot extends 1 row lower while the other stays up.
 *
 * Run: node scripts/generate-npc-sprites.cjs
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

const NPC_DEFS = [
  {
    name: 'npc-chai-walla',
    skin: hex('#C8956C'),
    skinShadow: hex('#A87A54'),
    hair: hex('#222222'),
    eyes: hex('#111111'),
    top: hex('#8B4513'),
    topShadow: hex('#6B3310'),
    bottom: hex('#F0F0E0'),
    bottomShadow: hex('#D0D0C0'),
    shoes: hex('#6B4226'),
    hasHeadwear: false,
    headwear: null,
    hasApron: true,
  },
  {
    name: 'npc-auto-driver',
    skin: hex('#C8956C'),
    skinShadow: hex('#A87A54'),
    hair: hex('#333333'),
    eyes: hex('#111111'),
    top: hex('#C3B091'),
    topShadow: hex('#A39071'),
    bottom: hex('#B0A080'),
    bottomShadow: hex('#908060'),
    shoes: hex('#333333'),
    hasHeadwear: true,
    headwear: hex('#5C4033'),
    hasApron: false,
  },
  {
    name: 'npc-jogger',
    skin: hex('#D4A76A'),
    skinShadow: hex('#B48A50'),
    hair: hex('#333333'),
    eyes: hex('#111111'),
    top: hex('#2E5090'),
    topShadow: hex('#1E4070'),
    bottom: hex('#2E5090'),
    bottomShadow: hex('#1E4070'),
    shoes: hex('#F0F0F0'),
    hasHeadwear: false,
    headwear: null,
    hasApron: false,
    hasStripe: true,
    stripe: hex('#F0F0F0'),
  },
  {
    name: 'npc-shopkeeper',
    skin: hex('#C8956C'),
    skinShadow: hex('#A87A54'),
    hair: hex('#6B4226'),
    eyes: hex('#111111'),
    top: hex('#E8D8C0'),
    topShadow: hex('#C8B8A0'),
    bottom: hex('#E8D8C0'),
    bottomShadow: hex('#C8B8A0'),
    shoes: hex('#8B6914'),
    hasHeadwear: false,
    headwear: null,
    hasApron: false,
  },
  {
    name: 'npc-guard',
    skin: hex('#C8956C'),
    skinShadow: hex('#A87A54'),
    hair: hex('#222222'),
    eyes: hex('#111111'),
    top: hex('#4A5530'),
    topShadow: hex('#3A4520'),
    bottom: hex('#4A5530'),
    bottomShadow: hex('#3A4520'),
    shoes: hex('#222222'),
    hasHeadwear: true,
    headwear: hex('#4A5530'),
    hasApron: false,
    hasBelt: true,
    belt: hex('#8B4513'),
  },
];

const TOWEL_COLOR = [240, 240, 220, 255];

/**
 * Draw a Pokemon FR/E-style chibi NPC in a 16x16 tile.
 * Same stepping animation as player for all 4 directions.
 */
function drawNPC(png, col, row, direction, pose, pal) {
  const ox = col * FRAME_W;
  const oy = row * FRAME_H;

  // === HAIR CROWN (rows 0-2) ===
  fillRect(png, ox + 6, oy + 0, 4, 1, pal.hair);
  fillRect(png, ox + 4, oy + 1, 8, 1, pal.hair);
  fillRect(png, ox + 3, oy + 2, 10, 1, pal.hair);

  // Headwear (cap)
  if (pal.hasHeadwear && pal.headwear) {
    fillRect(png, ox + 6, oy + 0, 4, 1, pal.headwear);
    fillRect(png, ox + 4, oy + 1, 8, 1, pal.headwear);
    fillRect(png, ox + 3, oy + 2, 10, 1, pal.headwear);
    if (direction === 'down') {
      fillRect(png, ox + 3, oy + 3, 10, 1, darker(pal.headwear));
    }
  }

  // === FACE (rows 3-6) ===
  if (direction === 'down') {
    fillRect(png, ox + 3, oy + 3, 1, 4, pal.hair);
    fillRect(png, ox + 12, oy + 3, 1, 4, pal.hair);
    fillRect(png, ox + 4, oy + 3, 8, 4, pal.skin);
    if (pal.hasHeadwear && pal.headwear) {
      fillRect(png, ox + 3, oy + 3, 10, 1, darker(pal.headwear));
    }
    setPixel(png, ox + 5, oy + 4, pal.eyes);
    setPixel(png, ox + 10, oy + 4, pal.eyes);
    setPixel(png, ox + 7, oy + 6, pal.skinShadow);
    setPixel(png, ox + 8, oy + 6, pal.skinShadow);
  } else if (direction === 'up') {
    fillRect(png, ox + 3, oy + 3, 10, 4, pal.hair);
  } else if (direction === 'left') {
    fillRect(png, ox + 3, oy + 3, 10, 4, pal.hair);
    fillRect(png, ox + 4, oy + 3, 5, 4, pal.skin);
    setPixel(png, ox + 5, oy + 4, pal.eyes);
    setPixel(png, ox + 5, oy + 6, pal.skinShadow);
  } else if (direction === 'right') {
    fillRect(png, ox + 3, oy + 3, 10, 4, pal.hair);
    fillRect(png, ox + 7, oy + 3, 5, 4, pal.skin);
    setPixel(png, ox + 10, oy + 4, pal.eyes);
    setPixel(png, ox + 10, oy + 6, pal.skinShadow);
  }

  // === CHIN (row 7) ===
  if (direction === 'up') {
    fillRect(png, ox + 4, oy + 7, 8, 1, pal.hair);
  } else {
    fillRect(png, ox + 5, oy + 7, 6, 1, pal.skin);
  }

  // === BODY (rows 8-9) ===
  fillRect(png, ox + 5, oy + 8, 6, 1, pal.top);
  fillRect(png, ox + 5, oy + 9, 6, 1, pal.topShadow);

  if (pal.hasBelt && pal.belt) {
    fillRect(png, ox + 5, oy + 9, 6, 1, pal.belt);
  }
  if (pal.hasApron) {
    if (direction === 'down' || direction === 'up') {
      setPixel(png, ox + 4, oy + 8, TOWEL_COLOR);
      setPixel(png, ox + 4, oy + 9, TOWEL_COLOR);
    } else if (direction === 'left') {
      setPixel(png, ox + 10, oy + 8, TOWEL_COLOR);
    } else if (direction === 'right') {
      setPixel(png, ox + 5, oy + 8, TOWEL_COLOR);
    }
  }
  if (pal.hasStripe && pal.stripe) {
    if (direction === 'down' || direction === 'up') {
      setPixel(png, ox + 5, oy + 8, pal.stripe);
      setPixel(png, ox + 10, oy + 8, pal.stripe);
    }
  }

  // === LEGS (rows 10-13) — same stepping for all directions ===
  fillRect(png, ox + 6, oy + 10, 4, 2, pal.bottom);  // waist/upper legs

  if (pose === 'idle') {
    fillRect(png, ox + 6, oy + 12, 2, 1, pal.bottom);
    fillRect(png, ox + 8, oy + 12, 2, 1, pal.bottom);
    fillRect(png, ox + 6, oy + 13, 2, 1, pal.shoes);
    fillRect(png, ox + 8, oy + 13, 2, 1, pal.shoes);
  } else if (pose === 'walk1') {
    // Left foot steps forward (row 13), right foot raised (shoe at row 12)
    fillRect(png, ox + 6, oy + 12, 2, 1, pal.bottom);
    fillRect(png, ox + 6, oy + 13, 2, 1, pal.shoes);
    fillRect(png, ox + 8, oy + 12, 2, 1, pal.shoes);
  } else if (pose === 'walk2') {
    // Right foot steps forward (row 13), left foot raised (shoe at row 12)
    fillRect(png, ox + 6, oy + 12, 2, 1, pal.shoes);
    fillRect(png, ox + 8, oy + 12, 2, 1, pal.bottom);
    fillRect(png, ox + 8, oy + 13, 2, 1, pal.shoes);
  }

  // Stripe on legs
  if (pal.hasStripe && pal.stripe) {
    setPixel(png, ox + 6, oy + 11, pal.stripe);
    setPixel(png, ox + 9, oy + 11, pal.stripe);
  }
}

function generateSpritesheet(outputPath, pal) {
  const png = createPNG();
  const directions = ['down', 'left', 'right', 'up'];
  const poses = ['walk1', 'idle', 'walk2'];

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      drawNPC(png, col, row, directions[row], poses[col], pal);
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

const basePath = path.resolve(__dirname, '..');
const spritesDir = path.join(basePath, 'public', 'assets', 'sprites');

for (const npc of NPC_DEFS) {
  generateSpritesheet(path.join(spritesDir, `${npc.name}.png`), npc);
}

console.log(`Done! ${NPC_DEFS.length} NPC spritesheets generated.`);
