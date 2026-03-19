const fs = require('fs');
const PNG = require('pngjs').PNG;

for (const f of ['public/assets/sprites/player-male.png', 'public/assets/sprites/player-female.png']) {
  const img = PNG.sync.read(fs.readFileSync(f));
  if (img.width !== 48 || img.height !== 96) {
    console.error(f + ': WRONG dimensions ' + img.width + 'x' + img.height);
    process.exit(1);
  }
  // Check for transparency (alpha channel)
  let hasTransparent = false;
  for (let i = 0; i < img.data.length; i += 4) {
    if (img.data[i + 3] === 0) {
      hasTransparent = true;
      break;
    }
  }
  if (!hasTransparent) {
    console.error(f + ': No transparent pixels found');
    process.exit(1);
  }
  console.log(f + ': ' + img.width + 'x' + img.height + ' OK (has transparency)');
}
console.log('All sprites verified!');
