/**
 * Generate player spritesheets for male and female characters.
 *
 * Layout: 3 columns x 4 rows = 12 frames (48x96 pixels total)
 * Frame size: 16x24 pixels (chibi GBA style)
 *
 * Rows (Grid Engine walkingAnimationMapping convention):
 *   Row 0 (y=0):  Down  - walk1, idle, walk2
 *   Row 1 (y=24): Left  - walk1, idle, walk2
 *   Row 2 (y=48): Right - walk1, idle, walk2
 *   Row 3 (y=72): Up    - walk1, idle, walk2
 */

const fs = require('fs');
const path = require('path');

// We'll create raw PNG files using pngjs (available via tile-extruder dependency)
const { PNG } = require('pngjs');

const FRAME_W = 16;
const FRAME_H = 24;
const COLS = 3;
const ROWS = 4;
const IMG_W = FRAME_W * COLS; // 48
const IMG_H = FRAME_H * ROWS; // 96

// GBA-style color palette (limited, hard pixel edges, no gradients)
const COLORS = {
  transparent: [0, 0, 0, 0],
  // Male colors
  maleSkin: [232, 190, 152, 255],
  maleSkinShadow: [200, 156, 120, 255],
  maleHair: [48, 40, 32, 255],
  maleShirt: [72, 120, 200, 255],      // Blue T-shirt
  maleShirtShadow: [56, 96, 168, 255],
  malePants: [80, 96, 136, 255],       // Jeans
  malePantsShadow: [64, 80, 112, 255],
  maleBackpack: [160, 88, 56, 255],    // Brown backpack
  maleShoes: [56, 48, 40, 255],
  maleEyes: [24, 24, 24, 255],
  // Female colors
  femaleSkin: [240, 200, 168, 255],
  femaleSkinShadow: [208, 168, 136, 255],
  femaleHair: [56, 32, 24, 255],
  femalePonytail: [56, 32, 24, 255],
  femaleShirt: [72, 176, 104, 255],     // Green T-shirt
  femaleShirtShadow: [56, 144, 80, 255],
  femalePants: [80, 96, 136, 255],
  femalePantsShadow: [64, 80, 112, 255],
  femaleBackpack: [168, 72, 104, 255],  // Pink backpack
  femaleShoes: [56, 48, 40, 255],
  femaleEyes: [24, 24, 24, 255],
  // Shared
  white: [248, 248, 248, 255],
  outline: [24, 24, 40, 255],
};

function createPNG() {
  const png = new PNG({ width: IMG_W, height: IMG_H });
  // Initialize all pixels to transparent
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
 * Draw a chibi character frame at the given frame position.
 *
 * @param {PNG} png - The PNG image
 * @param {number} col - Column (0-2)
 * @param {number} row - Row (0-3)
 * @param {string} direction - 'down', 'left', 'right', 'up'
 * @param {string} pose - 'walk1', 'idle', 'walk2'
 * @param {object} palette - Color palette for this gender
 */
function drawCharacter(png, col, row, direction, pose, palette) {
  const ox = col * FRAME_W; // origin x
  const oy = row * FRAME_H; // origin y

  // Chibi proportions: head ~10px tall, body ~14px tall
  // Total height: 24px, width centered in 16px

  // Leg offset for walk animation
  let leftLegOffset = 0;
  let rightLegOffset = 0;
  let bodyBob = 0;
  if (pose === 'walk1') {
    leftLegOffset = -1;
    rightLegOffset = 1;
    bodyBob = 0;
  } else if (pose === 'walk2') {
    leftLegOffset = 1;
    rightLegOffset = -1;
    bodyBob = 0;
  }

  // === HEAD (rows 1-10 of 24, centered) ===
  const headTop = oy + 1 + bodyBob;

  // Hair top (rows 1-3)
  fillRect(png, ox + 5, headTop, 6, 1, palette.hair);       // top of hair
  fillRect(png, ox + 4, headTop + 1, 8, 1, palette.hair);   // hair row 2
  fillRect(png, ox + 4, headTop + 2, 8, 1, palette.hair);   // hair row 3

  if (direction === 'down') {
    // Face facing down - show full face
    fillRect(png, ox + 4, headTop + 3, 8, 1, palette.hair);   // hair edge
    fillRect(png, ox + 4, headTop + 4, 1, 3, palette.hair);   // left hair side
    fillRect(png, ox + 11, headTop + 4, 1, 3, palette.hair);  // right hair side
    fillRect(png, ox + 5, headTop + 3, 6, 5, palette.skin);   // face
    fillRect(png, ox + 4, headTop + 4, 1, 2, palette.skin);   // left cheek
    fillRect(png, ox + 11, headTop + 4, 1, 2, palette.skin);  // right cheek
    // Eyes
    setPixel(png, ox + 6, headTop + 5, palette.eyes);
    setPixel(png, ox + 9, headTop + 5, palette.eyes);
    // Mouth
    setPixel(png, ox + 7, headTop + 7, palette.skinShadow);
    setPixel(png, ox + 8, headTop + 7, palette.skinShadow);

    // Ponytail for female - visible behind head when facing down
    if (palette.hasPonytail) {
      setPixel(png, ox + 7, headTop - 1, palette.hair);
      setPixel(png, ox + 8, headTop - 1, palette.hair);
    }
  } else if (direction === 'up') {
    // Back of head - all hair
    fillRect(png, ox + 4, headTop + 3, 8, 5, palette.hair);
    // Ponytail
    if (palette.hasPonytail) {
      fillRect(png, ox + 7, headTop + 8, 2, 3, palette.hair);
      setPixel(png, ox + 7, headTop + 11, palette.hair);
    }
  } else if (direction === 'left') {
    // Side view facing left
    fillRect(png, ox + 4, headTop + 3, 8, 5, palette.hair);
    fillRect(png, ox + 4, headTop + 3, 5, 5, palette.skin);  // face on left side
    fillRect(png, ox + 4, headTop + 3, 1, 2, palette.hair);   // hair in front
    setPixel(png, ox + 5, headTop + 5, palette.eyes);          // one eye visible
    setPixel(png, ox + 5, headTop + 7, palette.skinShadow);    // mouth
    // Ponytail (sticks out right when facing left)
    if (palette.hasPonytail) {
      fillRect(png, ox + 11, headTop + 4, 2, 2, palette.hair);
      setPixel(png, ox + 12, headTop + 6, palette.hair);
    }
  } else if (direction === 'right') {
    // Side view facing right
    fillRect(png, ox + 4, headTop + 3, 8, 5, palette.hair);
    fillRect(png, ox + 7, headTop + 3, 5, 5, palette.skin);   // face on right side
    fillRect(png, ox + 11, headTop + 3, 1, 2, palette.hair);   // hair in front
    setPixel(png, ox + 10, headTop + 5, palette.eyes);         // one eye visible
    setPixel(png, ox + 10, headTop + 7, palette.skinShadow);   // mouth
    // Ponytail (sticks out left when facing right)
    if (palette.hasPonytail) {
      fillRect(png, ox + 2, headTop + 4, 2, 2, palette.hair);
      setPixel(png, ox + 2, headTop + 6, palette.hair);
    }
  }

  // === BODY (rows 9-17 from top) ===
  const bodyTop = oy + 9 + bodyBob;

  // Neck
  fillRect(png, ox + 7, bodyTop, 2, 1, palette.skin);

  // Shirt
  fillRect(png, ox + 5, bodyTop + 1, 6, 4, palette.shirt);
  fillRect(png, ox + 4, bodyTop + 2, 1, 2, palette.shirt);    // left sleeve
  fillRect(png, ox + 11, bodyTop + 2, 1, 2, palette.shirt);   // right sleeve
  // Shirt shadow
  fillRect(png, ox + 5, bodyTop + 3, 6, 2, palette.shirtShadow);

  // Arms
  fillRect(png, ox + 4, bodyTop + 4, 1, 1, palette.skin);     // left hand
  fillRect(png, ox + 11, bodyTop + 4, 1, 1, palette.skin);    // right hand

  // Backpack (visible from back and sides)
  if (direction === 'up') {
    fillRect(png, ox + 5, bodyTop + 1, 6, 4, palette.backpack);
    // Backpack straps
    setPixel(png, ox + 6, bodyTop + 1, palette.shirt);
    setPixel(png, ox + 9, bodyTop + 1, palette.shirt);
  } else if (direction === 'left') {
    fillRect(png, ox + 10, bodyTop + 1, 2, 4, palette.backpack);
  } else if (direction === 'right') {
    fillRect(png, ox + 4, bodyTop + 1, 2, 4, palette.backpack);
  }
  // When facing down, backpack is behind and not visible

  // === LEGS (rows 14-21 from top) ===
  const legTop = oy + 14 + bodyBob;

  // Pants
  fillRect(png, ox + 6, legTop, 4, 1, palette.pants);         // waist

  // Left leg
  const leftLegX = ox + 6;
  fillRect(png, leftLegX, legTop + 1 + leftLegOffset, 2, 4, palette.pants);
  fillRect(png, leftLegX, legTop + 3 + leftLegOffset, 2, 1, palette.pantsShadow);
  // Left shoe
  fillRect(png, leftLegX, legTop + 5 + leftLegOffset, 2, 1, palette.shoes);

  // Right leg
  const rightLegX = ox + 8;
  fillRect(png, rightLegX, legTop + 1 + rightLegOffset, 2, 4, palette.pants);
  fillRect(png, rightLegX, legTop + 3 + rightLegOffset, 2, 1, palette.pantsShadow);
  // Right shoe
  fillRect(png, rightLegX, legTop + 5 + rightLegOffset, 2, 1, palette.shoes);

  // === OUTLINE (optional - makes sprite more readable) ===
  // Add subtle outline on bottom pixels for grounding
  // Skip if it would go out of frame bounds
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

  // Ensure output directory exists
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const buffer = PNG.sync.write(png);
  fs.writeFileSync(outputPath, buffer);
  console.log(`Generated: ${outputPath} (${IMG_W}x${IMG_H})`);
}

// Male palette
const malePalette = {
  skin: COLORS.maleSkin,
  skinShadow: COLORS.maleSkinShadow,
  hair: COLORS.maleHair,
  eyes: COLORS.maleEyes,
  shirt: COLORS.maleShirt,
  shirtShadow: COLORS.maleShirtShadow,
  pants: COLORS.malePants,
  pantsShadow: COLORS.malePantsShadow,
  backpack: COLORS.maleBackpack,
  shoes: COLORS.maleShoes,
  hasPonytail: false,
};

// Female palette
const femalePalette = {
  skin: COLORS.femaleSkin,
  skinShadow: COLORS.femaleSkinShadow,
  hair: COLORS.femaleHair,
  eyes: COLORS.femaleEyes,
  shirt: COLORS.femaleShirt,
  shirtShadow: COLORS.femaleShirtShadow,
  pants: COLORS.femalePants,
  pantsShadow: COLORS.femalePantsShadow,
  backpack: COLORS.femaleBackpack,
  shoes: COLORS.femaleShoes,
  hasPonytail: true,
};

const basePath = path.resolve(__dirname, '..');
generateSpritesheet(path.join(basePath, 'public/assets/sprites/player-male.png'), malePalette);
generateSpritesheet(path.join(basePath, 'public/assets/sprites/player-female.png'), femalePalette);

console.log('Done! Both spritesheets generated.');
