/**
 * Generate placeholder MP3 files (silence) for all audio assets.
 *
 * Creates minimal valid MPEG Audio Layer 3 frames containing silence.
 * BGM and ambient files are ~1s, SFX files are ~0.1s.
 *
 * Frame format: 128kbps 44100Hz stereo = 417 bytes per frame (~26ms).
 * - SFX: 4 frames (~0.1s)
 * - BGM/ambient: 38 frames (~1s)
 *
 * Run: node scripts/generate-placeholder-audio.cjs
 */

const fs = require('fs');
const path = require('path');

const BASE_DIR = path.resolve(__dirname, '..', 'public', 'assets', 'audio');

// MPEG frame header: 0xFF 0xFB = sync word + MPEG1 Layer3, 0x90 = 128kbps 44100Hz, 0x00 = stereo padding
const FRAME_HEADER = Buffer.from([0xFF, 0xFB, 0x90, 0x00]);
const FRAME_SIZE = 417; // bytes per frame at 128kbps 44100Hz

function createSilentFrame() {
  const frame = Buffer.alloc(FRAME_SIZE, 0);
  FRAME_HEADER.copy(frame, 0);
  return frame;
}

function createSilentMP3(frameCount) {
  const frame = createSilentFrame();
  const buffers = [];
  for (let i = 0; i < frameCount; i++) {
    buffers.push(Buffer.from(frame));
  }
  return Buffer.concat(buffers);
}

const BGM_FILES = [
  'bgm/title-theme.mp3',
  'bgm/outdoor-theme.mp3',
  'bgm/interior-theme.mp3',
];

const SFX_FILES = [
  'sfx/footstep.mp3',
  'sfx/door-open.mp3',
  'sfx/door-close.mp3',
  'sfx/npc-chime.mp3',
  'sfx/menu-open.mp3',
  'sfx/menu-close.mp3',
  'sfx/dialogue-tick.mp3',
  'sfx/item-collected.mp3',
  'sfx/quest-complete.mp3',
];

const AMBIENT_FILES = [
  'ambient/city-base.mp3',
  'ambient/cubbon-park.mp3',
  'ambient/metro-interior.mp3',
  'ambient/shop-interior.mp3',
];

const SFX_FRAMES = 4;     // ~0.1s
const LONG_FRAMES = 38;   // ~1s

// Create directories
const dirs = ['bgm', 'sfx', 'ambient'];
for (const dir of dirs) {
  const fullPath = path.join(BASE_DIR, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`Created directory: ${fullPath}`);
  }
}

// Generate BGM files (~1s silence)
for (const file of BGM_FILES) {
  const filePath = path.join(BASE_DIR, file);
  const mp3 = createSilentMP3(LONG_FRAMES);
  fs.writeFileSync(filePath, mp3);
  console.log(`Generated: ${file} (${mp3.length} bytes, ${LONG_FRAMES} frames)`);
}

// Generate SFX files (~0.1s silence)
for (const file of SFX_FILES) {
  const filePath = path.join(BASE_DIR, file);
  const mp3 = createSilentMP3(SFX_FRAMES);
  fs.writeFileSync(filePath, mp3);
  console.log(`Generated: ${file} (${mp3.length} bytes, ${SFX_FRAMES} frames)`);
}

// Generate ambient files (~1s silence)
for (const file of AMBIENT_FILES) {
  const filePath = path.join(BASE_DIR, file);
  const mp3 = createSilentMP3(LONG_FRAMES);
  fs.writeFileSync(filePath, mp3);
  console.log(`Generated: ${file} (${mp3.length} bytes, ${LONG_FRAMES} frames)`);
}

const total = BGM_FILES.length + SFX_FILES.length + AMBIENT_FILES.length;
console.log(`\nDone! ${total} placeholder MP3 files generated.`);
