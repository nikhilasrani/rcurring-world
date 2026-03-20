/**
 * Generate NPC spritesheets for 5 NPCs with distinct color palettes.
 *
 * Layout: 3 columns x 4 rows = 12 frames (48x96 pixels total)
 * Frame size: 16x24 pixels (chibi GBA style)
 *
 * Rows (Grid Engine walkingAnimationMapping convention):
 *   Row 0 (y=0):  Down  - walk1, idle, walk2
 *   Row 1 (y=24): Left  - walk1, idle, walk2
 *   Row 2 (y=48): Right - walk1, idle, walk2
 *   Row 3 (y=72): Up    - walk1, idle, walk2
 *
 * NPCs:
 *   1. chai-walla:   White lungi, brown vest
 *   2. auto-driver:  Khaki uniform, dark brown cap
 *   3. jogger:       Blue track suit, white shoes
 *   4. shopkeeper:   Cream kurta, brown hair
 *   5. guard:        Olive uniform, black boots
 *
 * Run: node scripts/generate-npc-sprites.cjs
 */

const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const FRAME_W = 16;
const FRAME_H = 24;
const COLS = 3;
const ROWS = 4;
const IMG_W = FRAME_W * COLS; // 48
const IMG_H = FRAME_H * ROWS; // 96

// ── Helpers ────────────────────────────────────────────────────────────────

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

// Parse hex color to [r, g, b, 255]
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

// ── NPC Palettes ───────────────────────────────────────────────────────────

const NPC_DEFS = [
  {
    name: 'npc-chai-walla',
    skin: hex('#C8956C'),
    skinShadow: hex('#A87A54'),
    hair: hex('#222222'),
    eyes: hex('#111111'),
    // Chai-walla: white lungi (lower), brown vest (upper)
    top: hex('#8B4513'),        // vest
    topShadow: hex('#6B3310'),
    bottom: hex('#F0F0E0'),     // lungi
    bottomShadow: hex('#D0D0C0'),
    shoes: hex('#6B4226'),
    hasHeadwear: false,
    headwear: null,
    hasApron: true,             // distinct: apron/towel on shoulder
  },
  {
    name: 'npc-auto-driver',
    skin: hex('#C8956C'),
    skinShadow: hex('#A87A54'),
    hair: hex('#333333'),
    eyes: hex('#111111'),
    // Khaki uniform, dark brown cap
    top: hex('#C3B091'),        // uniform shirt
    topShadow: hex('#A39071'),
    bottom: hex('#B0A080'),     // uniform pants
    bottomShadow: hex('#908060'),
    shoes: hex('#333333'),
    hasHeadwear: true,
    headwear: hex('#5C4033'),   // cap
    hasApron: false,
  },
  {
    name: 'npc-jogger',
    skin: hex('#D4A76A'),       // lighter skin tone
    skinShadow: hex('#B48A50'),
    hair: hex('#333333'),
    eyes: hex('#111111'),
    // Blue track suit, white shoes
    top: hex('#2E5090'),        // track jacket
    topShadow: hex('#1E4070'),
    bottom: hex('#2E5090'),     // track pants (same)
    bottomShadow: hex('#1E4070'),
    shoes: hex('#F0F0F0'),      // white shoes
    hasHeadwear: false,
    headwear: null,
    hasApron: false,
    hasStripe: true,            // distinct: white stripe on sides
    stripe: hex('#F0F0F0'),
  },
  {
    name: 'npc-shopkeeper',
    skin: hex('#C8956C'),
    skinShadow: hex('#A87A54'),
    hair: hex('#6B4226'),
    eyes: hex('#111111'),
    // Cream kurta (long, covers body), brown sandals
    top: hex('#E8D8C0'),        // kurta top
    topShadow: hex('#C8B8A0'),
    bottom: hex('#E8D8C0'),     // kurta extends to legs
    bottomShadow: hex('#C8B8A0'),
    shoes: hex('#8B6914'),      // brown sandals
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
    // Olive uniform, black boots, cap, belt
    top: hex('#4A5530'),        // olive uniform
    topShadow: hex('#3A4520'),
    bottom: hex('#4A5530'),     // olive pants
    bottomShadow: hex('#3A4520'),
    shoes: hex('#222222'),      // black boots
    hasHeadwear: true,
    headwear: hex('#4A5530'),   // olive cap
    hasApron: false,
    hasBelt: true,
    belt: hex('#8B4513'),
  },
];

// ── Drawing ────────────────────────────────────────────────────────────────

function drawNPC(png, col, row, direction, pose, pal) {
  const ox = col * FRAME_W;
  const oy = row * FRAME_H;

  // Walk animation leg offsets
  let leftLegOffset = 0;
  let rightLegOffset = 0;
  if (pose === 'walk1') {
    leftLegOffset = -1;
    rightLegOffset = 1;
  } else if (pose === 'walk2') {
    leftLegOffset = 1;
    rightLegOffset = -1;
  }

  // === HEAD (rows 1-10) ===
  const headTop = oy + 1;

  // Hair base (rows 1-3)
  fillRect(png, ox + 5, headTop, 6, 1, pal.hair);
  fillRect(png, ox + 4, headTop + 1, 8, 1, pal.hair);
  fillRect(png, ox + 4, headTop + 2, 8, 1, pal.hair);

  // Headwear (cap for auto-driver and guard)
  if (pal.hasHeadwear && pal.headwear) {
    fillRect(png, ox + 3, headTop, 10, 3, pal.headwear);
    // Visor on front-facing
    if (direction === 'down') {
      fillRect(png, ox + 3, headTop + 2, 10, 1, darker(pal.headwear));
    }
  }

  if (direction === 'down') {
    // Face facing down
    fillRect(png, ox + 4, headTop + 3, 8, 1, pal.hair);
    fillRect(png, ox + 4, headTop + 4, 1, 3, pal.hair);
    fillRect(png, ox + 11, headTop + 4, 1, 3, pal.hair);
    fillRect(png, ox + 5, headTop + 3, 6, 5, pal.skin);
    fillRect(png, ox + 4, headTop + 4, 1, 2, pal.skin);
    fillRect(png, ox + 11, headTop + 4, 1, 2, pal.skin);
    // Eyes
    setPixel(png, ox + 6, headTop + 5, pal.eyes);
    setPixel(png, ox + 9, headTop + 5, pal.eyes);
    // Mouth
    setPixel(png, ox + 7, headTop + 7, pal.skinShadow);
    setPixel(png, ox + 8, headTop + 7, pal.skinShadow);
  } else if (direction === 'up') {
    fillRect(png, ox + 4, headTop + 3, 8, 5, pal.hair);
  } else if (direction === 'left') {
    fillRect(png, ox + 4, headTop + 3, 8, 5, pal.hair);
    fillRect(png, ox + 4, headTop + 3, 5, 5, pal.skin);
    fillRect(png, ox + 4, headTop + 3, 1, 2, pal.hair);
    setPixel(png, ox + 5, headTop + 5, pal.eyes);
    setPixel(png, ox + 5, headTop + 7, pal.skinShadow);
  } else if (direction === 'right') {
    fillRect(png, ox + 4, headTop + 3, 8, 5, pal.hair);
    fillRect(png, ox + 7, headTop + 3, 5, 5, pal.skin);
    fillRect(png, ox + 11, headTop + 3, 1, 2, pal.hair);
    setPixel(png, ox + 10, headTop + 5, pal.eyes);
    setPixel(png, ox + 10, headTop + 7, pal.skinShadow);
  }

  // === BODY (rows 9-17) ===
  const bodyTop = oy + 9;

  // Neck
  fillRect(png, ox + 7, bodyTop, 2, 1, pal.skin);

  // Shirt / top
  fillRect(png, ox + 5, bodyTop + 1, 6, 4, pal.top);
  fillRect(png, ox + 4, bodyTop + 2, 1, 2, pal.top);    // left sleeve
  fillRect(png, ox + 11, bodyTop + 2, 1, 2, pal.top);   // right sleeve
  // Shadow
  fillRect(png, ox + 5, bodyTop + 3, 6, 2, pal.topShadow);

  // Arms (skin at ends of sleeves)
  fillRect(png, ox + 4, bodyTop + 4, 1, 1, pal.skin);
  fillRect(png, ox + 11, bodyTop + 4, 1, 1, pal.skin);

  // Belt for guard
  if (pal.hasBelt && pal.belt) {
    fillRect(png, ox + 5, bodyTop + 5, 6, 1, pal.belt);
  }

  // Apron/towel on shoulder for chai-walla
  if (pal.hasApron) {
    if (direction === 'down' || direction === 'up') {
      fillRect(png, ox + 4, bodyTop + 1, 1, 3, [240, 240, 220, 255]); // towel on left shoulder
    } else if (direction === 'left') {
      fillRect(png, ox + 10, bodyTop + 1, 2, 2, [240, 240, 220, 255]);
    } else if (direction === 'right') {
      fillRect(png, ox + 4, bodyTop + 1, 2, 2, [240, 240, 220, 255]);
    }
  }

  // Stripe for jogger (white line on side of top)
  if (pal.hasStripe && pal.stripe) {
    if (direction === 'down') {
      setPixel(png, ox + 5, bodyTop + 1, pal.stripe);
      setPixel(png, ox + 5, bodyTop + 2, pal.stripe);
      setPixel(png, ox + 10, bodyTop + 1, pal.stripe);
      setPixel(png, ox + 10, bodyTop + 2, pal.stripe);
    } else if (direction === 'up') {
      setPixel(png, ox + 5, bodyTop + 1, pal.stripe);
      setPixel(png, ox + 5, bodyTop + 2, pal.stripe);
      setPixel(png, ox + 10, bodyTop + 1, pal.stripe);
      setPixel(png, ox + 10, bodyTop + 2, pal.stripe);
    }
  }

  // === LEGS (rows 14-21) ===
  const legTop = oy + 14;

  // Waist
  fillRect(png, ox + 6, legTop, 4, 1, pal.bottom);

  // Left leg
  const leftLegX = ox + 6;
  fillRect(png, leftLegX, legTop + 1 + leftLegOffset, 2, 4, pal.bottom);
  fillRect(png, leftLegX, legTop + 3 + leftLegOffset, 2, 1, pal.bottomShadow);
  // Left shoe
  fillRect(png, leftLegX, legTop + 5 + leftLegOffset, 2, 1, pal.shoes);

  // Right leg
  const rightLegX = ox + 8;
  fillRect(png, rightLegX, legTop + 1 + rightLegOffset, 2, 4, pal.bottom);
  fillRect(png, rightLegX, legTop + 3 + rightLegOffset, 2, 1, pal.bottomShadow);
  // Right shoe
  fillRect(png, rightLegX, legTop + 5 + rightLegOffset, 2, 1, pal.shoes);

  // Stripe on pants for jogger
  if (pal.hasStripe && pal.stripe) {
    if (direction === 'down' || direction === 'up') {
      setPixel(png, leftLegX, legTop + 1 + leftLegOffset, pal.stripe);
      setPixel(png, leftLegX, legTop + 2 + leftLegOffset, pal.stripe);
      setPixel(png, rightLegX + 1, legTop + 1 + rightLegOffset, pal.stripe);
      setPixel(png, rightLegX + 1, legTop + 2 + rightLegOffset, pal.stripe);
    }
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

// ── Main ───────────────────────────────────────────────────────────────────

const basePath = path.resolve(__dirname, '..');
const spritesDir = path.join(basePath, 'public', 'assets', 'sprites');

for (const npc of NPC_DEFS) {
  generateSpritesheet(path.join(spritesDir, `${npc.name}.png`), npc);
}

console.log(`Done! ${NPC_DEFS.length} NPC spritesheets generated.`);
