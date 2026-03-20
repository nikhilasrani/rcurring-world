#!/bin/bash
# Re-extrude all tilesets from raw sources
# Run this whenever raw tileset PNGs are updated
#
# Extrusion adds a 1px border around each 16x16 tile to prevent
# tile bleeding artifacts during camera movement and fractional scaling.
#
# After extrusion, tilesets must be loaded in Phaser with:
#   margin: 1, spacing: 2
set -e

TILE_W=16
TILE_H=16
RAW_DIR="./raw-tilesets"
OUT_DIR="./public/assets/tilesets"

mkdir -p "$OUT_DIR"

for tileset in ground buildings nature decorations; do
  echo "Extruding $tileset..."
  npx tile-extruder \
    --tileWidth $TILE_W \
    --tileHeight $TILE_H \
    --input "$RAW_DIR/$tileset.png" \
    --output "$OUT_DIR/$tileset.png"
done

# Interior tileset (generated directly to output dir, not from raw-tilesets)
echo "Extruding interior..."
npx tile-extruder \
  --tileWidth $TILE_W \
  --tileHeight $TILE_H \
  --input "$OUT_DIR/interior.png" \
  --output "$OUT_DIR/interior.png"

echo "All tilesets extruded successfully."
