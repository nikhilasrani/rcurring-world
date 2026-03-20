#!/usr/bin/env node
/**
 * Generate a Tiled-format JSON tilemap for MG Road / CBD zone.
 *
 * Outputs: public/assets/tilemaps/mg-road.json
 *
 * The map is ~60x60 tiles, faithful to real MG Road / CBD geography:
 *   - North: Vidhana Soudha, Cubbon Park entrance
 *   - Middle: MG Road (east-west), UB City (south of road), Cubbon Park (west)
 *   - South: Chinnaswamy Stadium (SW), streets
 *   - East: MG Road Metro station (player spawn)
 *
 * Run: node scripts/generate-tilemap.js
 */

const fs = require('fs');
const path = require('path');

const MAP_W = 60;
const MAP_H = 60;
const TILE = 16;

// ─── Tileset GID offsets (1-indexed for Tiled format) ──────────────────────
// ground:      32 tiles -> GID 1..32
// buildings:   48 tiles -> GID 33..80
// nature:      32 tiles -> GID 81..112
// decorations: 32 tiles -> GID 113..144

const G = { // Ground tiles (add 1 for GID since firstgid=1)
  ASPHALT:       1,
  ASPHALT_DARK:  2,
  SIDEWALK:      3,
  SIDEWALK_LT:   4,
  CROSSWALK:     5,
  GRASS1:        6,
  GRASS2:        7,
  GRASS3:        8,
  LAWN:          9,
  INDOOR_FLOOR:  10,
  METRO_FLOOR:   11,
  DIRT:          12,
  PAVED_PATH:    13,
  WATER:         14,
  STAIRS:        15,
  ELEVATED_PATH: 16,
  OVERPASS_ROAD: 17,
  STAIRS_2STEP:  18,
  ROAD_CENTER:   19,
  GRASS_PATH:    20,
  POND_EDGE:     21,
  ROAD_VERT:     22,
  ELEV_EDGE_L:   23,
  ELEV_EDGE_R:   24,
};

const B = { // Buildings tiles (firstgid=33)
  BRICK:         33,
  CONCRETE:      34,
  GLASS:         35,
  CHINNA_WALL:   36,
  CHINNA_ARCH:   37,
  CHINNA_COL:    38,
  UB_GLASS:      39,
  UB_ENTRANCE:   40,
  VS_SANDSTONE:  41,
  VS_DOME:       42,
  VS_PILLAR:     43,
  METRO_ENTER:   44,
  METRO_SIGN:    45,
  METRO_RAIL:    46,
  PARK_GATE:     47,
  PARK_WALL:     48,
  ROOF:          49,
  DOOR:          50,
  STAIR_RAIL_L:  51,
  STAIR_RAIL_R:  52,
  OVERPASS_PIL:  53,
  ELEV_PLAT_TOP: 54,
  WALKWAY_RAIL:  55,
  SHOP_FRONT:    56,
  VS_UPPER:      57,
  BLDG_CORNER:   58,
  CHINNA_SEAT:   59,
  CHINNA_FIELD:  60,
  UB_UPPER:      61,
  BLDG_WALL_TOP: 62,
  CHINNA_SEAT_R: 63,   // Red seating
  CHINNA_SIGN:   64,   // Stadium name sign
  // Row 3
  OVERP_RAIL_L:  65,
  OVERP_RAIL_R:  66,
  OVERP_DECK:    67,
  VS_DOME_TOP:   68,
  ROOF_VAR:      69,
  TREE_CANOPY:   70,
  CHINNA_ROOF:   71,   // Stadium roof canopy
  CHINNA_FLOOD:  72,   // Floodlight tower base
  CHINNA_FLOOD_T:73,   // Floodlight tower top (above-player)
  CHINNA_PITCH:  74,   // Cricket pitch with stumps
  CHINNA_SCORE:  75,   // Scoreboard
  CHINNA_CORNER: 76,   // Wall corner piece
  CHINNA_DIRSIGN:77,   // Direction signboard
  CHINNA_PAVE:   78,   // Concourse pavement
  CHINNA_FLAG:   79,   // Country flag
  CHINNA_GATE:   80,   // Turnstile/entry gate
  // Row 4
  CHINNA_BND_T:  81,   // Field boundary line (top)
  CHINNA_BND_B:  82,   // Field boundary line (bottom)
  CHINNA_BND_L:  83,   // Field boundary line (left)
  CHINNA_BND_R:  84,   // Field boundary line (right)
  CHINNA_WALK:   85,   // Inner walkway/concourse
  CHINNA_SEAT_BT:86,   // Blue seating with structural top
  CHINNA_SEAT_RT:87,   // Red seating with structural top
  CHINNA_PALM:   88,   // Palm tree
};

const N = { // Nature tiles (firstgid=97, buildings expanded to 64 tiles)
  RAIN_TRUNK:    97,
  RAIN_CAN_TL:   98,
  RAIN_CAN_TR:   99,
  COCONUT_TRUNK: 100,
  COCONUT_LEAF:  101,
  PARK_TRUNK:    102,
  PARK_CANOPY:   103,
  BOUGAINVILLEA: 104,
  HEDGE:         105,
  GARDEN_BUSH:   106,
  FLOWER_BED:    107,
  POTTED_PLANT:  108,
  BENCH_H:       109,
  FOUNTAIN:      110,
  FENCE:         111,
  THICK_HEDGE:   112,
  STONE_WALL:    113,
  POND_EDGE:     114,
  TREE_SHADOW:   115,
  BAMBOO:        116,
};

const D = { // Decorations tiles (firstgid=129)
  FRUIT_CART:    129,
  SUGARCANE:     130,
  FLOWER_BASK:   131,
  AUTO_RICK:     132,
  TWO_WHEELER:   133,
  BUS_STOP:      134,
  LAMPPOST:      135,
  TRAFFIC_LIGHT: 136,
  FIRE_HYDRANT:  137,
  DUSTBIN:       138,
  ROAD_SIGN:     139,
  SHOP_SIGN:     140,
  BMTC_SIGN:     141,
  METRO_PILLAR:  142,
  METRO_SIGN_D:  143,
  AUTO_RICK_2:   144,
  VENDOR_UMBRELLA: 145,
  MANHOLE:       146,
  POTHOLE:       147,
  ROAD_ARROW:    148,
  NEWS_STAND:    149,
  BOLLARD:       150,
  BENCH_V:       151,
  TRASH_CAN:     152,
};

// ─── Layer Data ─────────────────────────────────────────────────────────────

function createLayer(fill = 0) {
  return new Array(MAP_W * MAP_H).fill(fill);
}

function idx(x, y) {
  if (x < 0 || x >= MAP_W || y < 0 || y >= MAP_H) return -1;
  return y * MAP_W + x;
}

function set(layer, x, y, tile) {
  const i = idx(x, y);
  if (i >= 0) layer[i] = tile;
}

function fill(layer, x1, y1, x2, y2, tile) {
  for (let y = y1; y <= y2; y++) {
    for (let x = x1; x <= x2; x++) {
      set(layer, x, y, tile);
    }
  }
}

function fillRandom(layer, x1, y1, x2, y2, tiles) {
  for (let y = y1; y <= y2; y++) {
    for (let x = x1; x <= x2; x++) {
      set(layer, x, y, tiles[(x * 7 + y * 13) % tiles.length]);
    }
  }
}

// ─── Build Layers ───────────────────────────────────────────────────────────

const ground = createLayer(0);
const groundDetail = createLayer(0);
const buildings = createLayer(0);
const abovePlayer = createLayer(0);
const collision = createLayer(0);

// COLLISION TILE: We use a single tile from ground to mark collision.
// In the tileset definition we set ge_collide:true on the tiles that are
// used in the collision layer. We'll use ASPHALT_DARK (GID 2) as collision marker.
const COLL = G.ASPHALT_DARK;

// ═══════════════════════════════════════════════════════════════════════════
// GROUND LAYER
// ═══════════════════════════════════════════════════════════════════════════

// Fill entire map with grass first
fillRandom(ground, 0, 0, 59, 59, [G.GRASS1, G.GRASS2, G.GRASS3, G.GRASS1, G.GRASS2]);

// ── Roads ───────────────────────────────────────────────────────────────
// MG Road: runs east-west, roughly at y=30-31 (row 30-31)
fill(ground, 0, 29, 59, 32, G.ASPHALT);
// Center line
fill(ground, 0, 30, 59, 31, G.ROAD_CENTER);

// Sidewalks along MG Road
fill(ground, 0, 28, 59, 28, G.SIDEWALK);
fill(ground, 0, 33, 59, 33, G.SIDEWALK);

// Kasturba Road: runs north-south at roughly x=20-21
fill(ground, 20, 0, 21, 59, G.ASPHALT);
fill(ground, 20, 0, 21, 59, G.ROAD_VERT);
fill(ground, 19, 0, 19, 59, G.SIDEWALK);
fill(ground, 22, 0, 22, 59, G.SIDEWALK);

// Race Course Road / St. Marks Road: runs N-S at roughly x=35-36
fill(ground, 35, 0, 36, 59, G.ASPHALT);
fill(ground, 35, 0, 36, 59, G.ROAD_VERT);
fill(ground, 34, 0, 34, 59, G.SIDEWALK);
fill(ground, 37, 0, 37, 59, G.SIDEWALK);

// Cubbon Road: runs N-S at x=12-13
fill(ground, 12, 0, 13, 28, G.ASPHALT);
fill(ground, 12, 0, 13, 28, G.ROAD_VERT);
fill(ground, 11, 0, 11, 28, G.SIDEWALK);
fill(ground, 14, 0, 14, 28, G.SIDEWALK);

// Small road south connecting to Chinnaswamy: x=8-9, y=34-40 (stops before stadium)
fill(ground, 8, 34, 9, 40, G.ASPHALT);
fill(ground, 7, 34, 7, 40, G.SIDEWALK);
fill(ground, 10, 34, 10, 40, G.SIDEWALK);
// Road continues south past stadium: x=7-8, y=54-59
fill(ground, 7, 54, 8, 59, G.ASPHALT);
fill(ground, 6, 54, 6, 59, G.SIDEWALK);
fill(ground, 9, 54, 9, 59, G.SIDEWALK);

// Road south of MG Road near metro: x=45-46 going south
fill(ground, 45, 33, 46, 59, G.ASPHALT);
fill(ground, 44, 33, 44, 59, G.SIDEWALK);
fill(ground, 47, 33, 47, 59, G.SIDEWALK);

// ── Crosswalks ──────────────────────────────────────────────────────────
// At intersections
fill(ground, 20, 28, 21, 28, G.CROSSWALK); // Kasturba x MG Road
fill(ground, 20, 33, 21, 33, G.CROSSWALK);
fill(ground, 35, 28, 36, 28, G.CROSSWALK); // St Marks x MG Road
fill(ground, 35, 33, 36, 33, G.CROSSWALK);

// ── Cubbon Park ─────────────────────────────────────────────────────────
// Large green zone: x=1..18, y=5..27
fillRandom(ground, 1, 5, 18, 27, [G.GRASS1, G.GRASS2, G.GRASS3, G.LAWN, G.GRASS1]);
// Park paths (dirt/paved)
fill(ground, 5, 5, 5, 27, G.PAVED_PATH); // Vertical path
fill(ground, 1, 15, 18, 15, G.PAVED_PATH); // Horizontal path
fill(ground, 10, 5, 10, 27, G.DIRT); // Secondary path

// Terraced elevated area in park (elevation transition)
fill(ground, 2, 8, 8, 12, G.ELEVATED_PATH);
fill(ground, 2, 12, 8, 12, G.STAIRS); // Stairs down from terrace
fill(ground, 2, 8, 2, 12, G.ELEV_EDGE_L);
fill(ground, 8, 8, 8, 12, G.ELEV_EDGE_R);

// Small pond in park
fill(ground, 14, 20, 17, 23, G.WATER);
fill(ground, 14, 19, 17, 19, G.POND_EDGE);

// ── Vidhana Soudha area (N, left of Kasturba Rd) ───────────────────────
// Building footprint: x=8..17, y=2..7
fill(ground, 8, 2, 17, 7, G.SIDEWALK_LT); // Courtyard

// ── Chinnaswamy Stadium area (SW) ───────────────────────────────────────
// Expanded footprint: x=3..12, y=41..53 (10 wide x 13 tall)
// Outer concourse pavement
fill(ground, 2, 40, 13, 54, G.SIDEWALK_LT);
// Stadium interior - lawn base
fill(ground, 3, 41, 12, 53, G.LAWN);
// Green outfield (inner area between stands)
fill(ground, 5, 45, 10, 50, G.GRASS3);
// Walkway concrete between stands and field
fill(ground, 4, 44, 4, 51, G.METRO_FLOOR);
fill(ground, 11, 44, 11, 51, G.METRO_FLOOR);
fill(ground, 5, 44, 10, 44, G.METRO_FLOOR);
fill(ground, 5, 51, 10, 51, G.METRO_FLOOR);

// ── UB City area ────────────────────────────────────────────────────────
// x=25..30, y=34..41
fill(ground, 25, 34, 30, 41, G.SIDEWALK_LT); // plaza

// ── MG Road Metro Station ───────────────────────────────────────────────
// x=43..47, y=33..36
fill(ground, 43, 33, 47, 36, G.METRO_FLOOR);
// Elevated platform area
fill(ground, 43, 33, 47, 34, G.ELEVATED_PATH);
// Stairs from elevated platform to street level
fill(ground, 44, 35, 46, 35, G.STAIRS);

// ── Overpass / Flyover near Chinnaswamy (y=40, crossing x=4..14) ────────
// The overpass itself is on the above-player layer; ground under it stays road
fill(ground, 4, 39, 14, 40, G.ASPHALT);
fill(ground, 3, 39, 3, 40, G.SIDEWALK);
fill(ground, 15, 39, 15, 40, G.SIDEWALK);

// ═══════════════════════════════════════════════════════════════════════════
// GROUND DETAIL LAYER
// ═══════════════════════════════════════════════════════════════════════════

// Road markings at intersections
for (let x = 18; x <= 22; x += 2) {
  set(groundDetail, x, 30, G.CROSSWALK);
  set(groundDetail, x, 31, G.CROSSWALK);
}
for (let x = 33; x <= 37; x += 2) {
  set(groundDetail, x, 30, G.CROSSWALK);
  set(groundDetail, x, 31, G.CROSSWALK);
}

// Stair step markings at metro station exit
set(groundDetail, 44, 35, G.STAIRS_2STEP);
set(groundDetail, 45, 35, G.STAIRS_2STEP);
set(groundDetail, 46, 35, G.STAIRS_2STEP);

// Park stair detail
for (let x = 3; x <= 7; x++) {
  set(groundDetail, x, 12, G.STAIRS_2STEP);
}

// Some pothole/manhole decorations on roads
set(groundDetail, 25, 30, D.MANHOLE);
set(groundDetail, 40, 31, D.POTHOLE);
set(groundDetail, 15, 30, D.MANHOLE);

// Arrow markings on road
set(groundDetail, 30, 30, D.ROAD_ARROW);
set(groundDetail, 50, 30, D.ROAD_ARROW);

// ═══════════════════════════════════════════════════════════════════════════
// BUILDINGS LAYER
// ═══════════════════════════════════════════════════════════════════════════

// ── Vidhana Soudha (x=8..17, y=2..7) ───────────────────────────────────
fill(buildings, 8, 2, 17, 3, B.VS_SANDSTONE);
fill(buildings, 8, 4, 17, 5, B.VS_UPPER);
fill(buildings, 8, 6, 17, 7, B.VS_SANDSTONE);
// Dome
set(buildings, 12, 2, B.VS_DOME);
set(buildings, 13, 2, B.VS_DOME);
// Pillars
set(buildings, 9, 6, B.VS_PILLAR);
set(buildings, 11, 6, B.VS_PILLAR);
set(buildings, 14, 6, B.VS_PILLAR);
set(buildings, 16, 6, B.VS_PILLAR);
// Door
set(buildings, 12, 7, B.DOOR);
set(buildings, 13, 7, B.DOOR);

// ── Cubbon Park entrance (gate at south edge) ──────────────────────────
set(buildings, 5, 27, B.PARK_GATE);
set(buildings, 10, 27, B.PARK_GATE);
// Boundary wall segments
fill(buildings, 1, 5, 1, 27, B.PARK_WALL);
fill(buildings, 18, 5, 18, 27, B.PARK_WALL);
fill(buildings, 1, 5, 18, 5, B.PARK_WALL);

// ── Cubbon Park Library (x=13..16, y=16..17) ────────────────────────────
// Small library building south of the horizontal path in Cubbon Park
fill(buildings, 13, 16, 16, 16, B.ROOF);      // Roof/top row
fill(buildings, 13, 17, 16, 17, B.CONCRETE);   // Front row with door
set(buildings, 15, 17, B.DOOR);                 // Library door

// ── Chinnaswamy Stadium (x=3..12, y=41..53) ────────────────────────────
// Visuals handled by composite sprite (chinnaswamy-stadium.png + chinnaswamy-roof.png).
// Buildings layer left empty in this area; collision layer still defines walkable zones.

// ── UB City (x=25..30, y=34..41) ───────────────────────────────────────
fill(buildings, 25, 34, 25, 41, B.UB_GLASS);
fill(buildings, 30, 34, 30, 41, B.UB_GLASS);
fill(buildings, 25, 34, 30, 34, B.UB_UPPER);
fill(buildings, 26, 35, 29, 38, B.UB_GLASS);
fill(buildings, 26, 39, 29, 41, B.UB_UPPER);
// Entrance
set(buildings, 27, 41, B.UB_ENTRANCE);
set(buildings, 28, 41, B.UB_ENTRANCE);

// ── MG Road Metro Station (x=43..47, y=33..36) ─────────────────────────
fill(buildings, 43, 33, 47, 33, B.CONCRETE);
fill(buildings, 43, 34, 43, 36, B.CONCRETE);
fill(buildings, 47, 34, 47, 36, B.CONCRETE);
set(buildings, 43, 33, B.METRO_ENTER);
set(buildings, 44, 33, B.DOOR); // Metro door -- player faces this from (44, 34)
// Metro signage
set(buildings, 45, 33, B.METRO_SIGN);
// Railings along elevated platform
fill(buildings, 43, 34, 47, 34, B.METRO_RAIL);
// Stair railings at metro exit
set(buildings, 43, 35, B.STAIR_RAIL_L);
set(buildings, 47, 35, B.STAIR_RAIL_R);

// ── Overpass pillars ────────────────────────────────────────────────────
set(buildings, 6, 39, B.OVERPASS_PIL);
set(buildings, 6, 40, B.OVERPASS_PIL);
set(buildings, 12, 39, B.OVERPASS_PIL);
set(buildings, 12, 40, B.OVERPASS_PIL);

// ── Generic shops/buildings along MG Road (south side) ──────────────────
// East section shops: x=38..42, y=34..36
fill(buildings, 38, 34, 42, 34, B.SHOP_FRONT);
fill(buildings, 38, 35, 42, 36, B.BRICK);
set(buildings, 40, 36, B.DOOR);

// West section shops: x=23..24, y=34..36
fill(buildings, 23, 34, 24, 34, B.SHOP_FRONT);
fill(buildings, 23, 35, 24, 36, B.BRICK);
set(buildings, 23, 36, B.DOOR);

// North side buildings: x=23..30, y=26..28
fill(buildings, 23, 26, 30, 26, B.BLDG_WALL_TOP);
fill(buildings, 23, 27, 30, 27, B.CONCRETE);
fill(buildings, 23, 28, 30, 28, B.SHOP_FRONT);
set(buildings, 26, 28, B.DOOR);
set(buildings, 29, 28, B.DOOR);

// Buildings along Kasturba Road
fill(buildings, 23, 10, 27, 14, B.CONCRETE);
fill(buildings, 23, 14, 27, 14, B.SHOP_FRONT);
set(buildings, 25, 14, B.DOOR);

// Buildings along St. Marks Road
fill(buildings, 38, 10, 42, 14, B.BRICK);
fill(buildings, 38, 14, 42, 14, B.SHOP_FRONT);
set(buildings, 40, 14, B.DOOR);

// More buildings south area
fill(buildings, 25, 50, 30, 54, B.CONCRETE);
fill(buildings, 38, 50, 42, 54, B.BRICK);

// ═══════════════════════════════════════════════════════════════════════════
// ABOVE-PLAYER LAYER
// ═══════════════════════════════════════════════════════════════════════════

// ── Overpass deck (y=39-40, x=4..14) ────────────────────────────────────
fill(abovePlayer, 4, 39, 14, 40, B.OVERP_DECK);
// Overpass railings
fill(abovePlayer, 4, 38, 14, 38, B.OVERP_RAIL_L);
fill(abovePlayer, 4, 41, 14, 41, B.OVERP_RAIL_R);

// ── Vidhana Soudha dome top ────────────────────────────────────────────
set(abovePlayer, 12, 1, B.VS_DOME_TOP);
set(abovePlayer, 13, 1, B.VS_DOME_TOP);

// ── Tree canopies in Cubbon Park ────────────────────────────────────────
// Rain trees (large canopy 2x2)
set(abovePlayer, 3, 8, N.RAIN_CAN_TL);
set(abovePlayer, 4, 8, N.RAIN_CAN_TR);
set(abovePlayer, 3, 9, N.RAIN_CAN_TL);
set(abovePlayer, 4, 9, N.RAIN_CAN_TR);

set(abovePlayer, 7, 17, N.RAIN_CAN_TL);
set(abovePlayer, 8, 17, N.RAIN_CAN_TR);
set(abovePlayer, 7, 18, N.RAIN_CAN_TL);
set(abovePlayer, 8, 18, N.RAIN_CAN_TR);

set(abovePlayer, 15, 10, N.RAIN_CAN_TL);
set(abovePlayer, 16, 10, N.RAIN_CAN_TR);

// Park trees canopies
set(abovePlayer, 2, 20, N.PARK_CANOPY);
set(abovePlayer, 6, 22, N.PARK_CANOPY);
set(abovePlayer, 12, 8, N.PARK_CANOPY);
set(abovePlayer, 16, 14, N.PARK_CANOPY);

// Coconut palm leaves
set(abovePlayer, 9, 24, N.COCONUT_LEAF);
set(abovePlayer, 17, 24, N.COCONUT_LEAF);

// ── Tree canopies along MG Road ─────────────────────────────────────────
set(abovePlayer, 28, 28, N.PARK_CANOPY);
set(abovePlayer, 32, 28, N.PARK_CANOPY);
set(abovePlayer, 42, 28, N.PARK_CANOPY);
set(abovePlayer, 50, 28, N.PARK_CANOPY);
set(abovePlayer, 55, 28, N.PARK_CANOPY);

// ── Roof overhangs on shops ─────────────────────────────────────────────
fill(abovePlayer, 38, 34, 42, 34, B.ROOF);
fill(abovePlayer, 23, 34, 24, 34, B.ROOF);
fill(abovePlayer, 23, 26, 30, 26, B.ROOF);

// ── Vendor umbrellas ────────────────────────────────────────────────────
set(abovePlayer, 33, 33, D.VENDOR_UMBRELLA);
set(abovePlayer, 48, 33, D.VENDOR_UMBRELLA);

// ── Chinnaswamy Stadium roof — handled by chinnaswamy-roof.png sprite ──

// ── More tree canopies south ────────────────────────────────────────────
set(abovePlayer, 15, 45, N.PARK_CANOPY);
set(abovePlayer, 32, 50, N.PARK_CANOPY);
set(abovePlayer, 50, 45, N.RAIN_CAN_TL);
set(abovePlayer, 51, 45, N.RAIN_CAN_TR);

// ═══════════════════════════════════════════════════════════════════════════
// COLLISION LAYER
// ═══════════════════════════════════════════════════════════════════════════

// Map boundaries (row 0, row 59, col 0, col 59)
fill(collision, 0, 0, 59, 0, COLL);
fill(collision, 0, 59, 59, 59, COLL);
fill(collision, 0, 0, 0, 59, COLL);
fill(collision, 59, 0, 59, 59, COLL);

// Vidhana Soudha building interior
fill(collision, 8, 2, 17, 6, COLL);
// Leave row 7 partially passable (pillar bases block, door passable)
set(collision, 9, 7, COLL);
set(collision, 11, 7, COLL);
set(collision, 14, 7, COLL);
set(collision, 16, 7, COLL);
set(collision, 8, 7, COLL);
set(collision, 10, 7, COLL);
set(collision, 15, 7, COLL);
set(collision, 17, 7, COLL);

// Cubbon Park boundary walls
fill(collision, 1, 5, 1, 27, COLL);
fill(collision, 18, 5, 18, 27, COLL);
fill(collision, 1, 5, 18, 5, COLL);
// Gate passable at x=5 and x=10

// Cubbon Park Library building
fill(collision, 13, 16, 16, 16, COLL); // Roof row
fill(collision, 13, 17, 14, 17, COLL); // Front left of door
set(collision, 15, 17, COLL);          // Door tile (player faces from south)
set(collision, 16, 17, COLL);          // Front right of door

// Water in park
fill(collision, 14, 19, 17, 23, COLL);

// Chinnaswamy Stadium walls (expanded layout x=3..12, y=42..52)
fill(collision, 3, 42, 12, 42, COLL);     // North wall
fill(collision, 3, 52, 12, 52, COLL);     // South wall
fill(collision, 3, 42, 3, 52, COLL);      // West wall
fill(collision, 12, 42, 12, 52, COLL);    // East wall
// Entrance passable at 7-8 on south wall (gates block at 6,9)
set(collision, 7, 52, 0);                  // Clear entrance left
set(collision, 8, 52, 0);                  // Clear entrance right
// Seating stands are collision
fill(collision, 4, 43, 11, 44, COLL);     // North stand (2 rows)
fill(collision, 4, 50, 11, 51, COLL);     // South stand (2 rows)
fill(collision, 3, 45, 4, 50, COLL);      // West stand (2 cols)
fill(collision, 11, 45, 12, 50, COLL);    // East stand (2 cols)
// Floodlight tower bases
set(collision, 2, 41, COLL);
set(collision, 13, 41, COLL);
set(collision, 2, 53, COLL);
set(collision, 13, 53, COLL);
// Scoreboard
set(collision, 7, 41, COLL);
set(collision, 8, 41, COLL);
// Direction signs
set(collision, 2, 47, COLL);
set(collision, 13, 47, COLL);
// Palm trees
set(collision, 2, 44, COLL);
set(collision, 13, 44, COLL);
set(collision, 2, 50, COLL);
set(collision, 13, 50, COLL);

// UB City building
fill(collision, 25, 34, 30, 40, COLL);
// Entrance at y=41 -- door tiles with collision so player faces them to enter
fill(collision, 25, 41, 30, 41, COLL);

// Metro Station walls
fill(collision, 43, 33, 47, 33, COLL);
fill(collision, 43, 34, 43, 36, COLL);
fill(collision, 47, 34, 47, 36, COLL);

// Overpass pillars
set(collision, 6, 39, COLL);
set(collision, 6, 40, COLL);
set(collision, 12, 39, COLL);
set(collision, 12, 40, COLL);

// Shop/building blocks along roads
fill(collision, 38, 34, 42, 35, COLL);
// Door tiles: collision so player faces them from adjacent tile to interact
set(collision, 40, 36, COLL); // Coffee shop door
fill(collision, 38, 36, 39, 36, COLL); // Coffee shop front wall (non-door)
fill(collision, 41, 36, 42, 36, COLL); // Coffee shop front wall (non-door)
fill(collision, 23, 34, 24, 35, COLL);
fill(collision, 23, 36, 24, 36, COLL); // West shop front wall + door
fill(collision, 23, 26, 30, 27, COLL);
fill(collision, 23, 10, 27, 13, COLL);
fill(collision, 38, 10, 42, 13, COLL);
fill(collision, 25, 50, 30, 54, COLL);
fill(collision, 38, 50, 42, 54, COLL);

// Dense tree trunks as collision in park
set(collision, 3, 10, COLL); // Rain tree trunk
set(collision, 4, 10, COLL);
set(collision, 7, 19, COLL);
set(collision, 8, 19, COLL);
set(collision, 15, 11, COLL);
set(collision, 16, 11, COLL);

// Additional boundary: thick hedges/fences at edges
fill(collision, 1, 1, 59, 1, COLL); // Second row boundary
fill(collision, 1, 58, 59, 58, COLL);
fill(collision, 1, 1, 1, 58, COLL);
fill(collision, 58, 1, 58, 58, COLL);

// ═══════════════════════════════════════════════════════════════════════════
// DECORATIONS (placed on buildings or ground-detail layers)
// ═══════════════════════════════════════════════════════════════════════════

// Street vendors along MG Road south sidewalk
set(buildings, 23, 33, D.FRUIT_CART);
set(buildings, 26, 33, D.SUGARCANE);
set(buildings, 33, 33, D.FLOWER_BASK);
set(buildings, 48, 33, D.FRUIT_CART);

// Auto-rickshaws — now handled by moving AutoRickshawManager sprites

// Two-wheelers
set(buildings, 40, 32, D.TWO_WHEELER);
set(buildings, 24, 29, D.TWO_WHEELER);

// Bus stops
set(buildings, 28, 33, D.BUS_STOP);
set(buildings, 50, 33, D.BMTC_SIGN);

// Lampposts along MG Road
for (let x = 5; x < 58; x += 8) {
  set(buildings, x, 28, D.LAMPPOST);
  // Skip x=45 on south sidewalk (metro station area, would overwrite METRO_SIGN)
  if (x !== 45) {
    set(buildings, x, 33, D.LAMPPOST);
  }
}

// Traffic lights at intersections
set(buildings, 19, 29, D.TRAFFIC_LIGHT);
set(buildings, 22, 29, D.TRAFFIC_LIGHT);
set(buildings, 34, 29, D.TRAFFIC_LIGHT);
set(buildings, 37, 29, D.TRAFFIC_LIGHT);

// Road signs
set(buildings, 20, 28, D.ROAD_SIGN);
set(buildings, 35, 28, D.ROAD_SIGN);

// Park decorations
set(buildings, 3, 15, N.BENCH_H);
set(buildings, 8, 15, N.BENCH_H);
set(buildings, 13, 15, N.FOUNTAIN);
set(buildings, 6, 20, N.FLOWER_BED);
set(buildings, 2, 22, N.POTTED_PLANT);
set(buildings, 11, 22, N.POTTED_PLANT);

// Tree trunks in park
set(buildings, 3, 10, N.RAIN_TRUNK);
set(buildings, 7, 19, N.RAIN_TRUNK);
set(buildings, 15, 11, N.RAIN_TRUNK);
set(buildings, 9, 25, N.COCONUT_TRUNK);
set(buildings, 17, 25, N.COCONUT_TRUNK);
set(buildings, 2, 21, N.PARK_TRUNK);
set(buildings, 6, 23, N.PARK_TRUNK);
set(buildings, 12, 9, N.PARK_TRUNK);
set(buildings, 16, 15, N.PARK_TRUNK);

// Bougainvillea in park
set(buildings, 4, 14, N.BOUGAINVILLEA);
set(buildings, 9, 7, N.BOUGAINVILLEA);
set(buildings, 16, 20, N.BOUGAINVILLEA);

// Hedges along park boundary
fill(buildings, 2, 4, 17, 4, N.HEDGE);

// Boundary trees/hedges at map edges
fill(buildings, 2, 0, 57, 0, N.THICK_HEDGE);
fill(buildings, 0, 2, 0, 57, N.THICK_HEDGE);
fill(buildings, 59, 2, 59, 57, N.THICK_HEDGE);
fill(buildings, 2, 59, 57, 59, N.THICK_HEDGE);
// Corners
set(buildings, 0, 0, N.THICK_HEDGE);
set(buildings, 0, 1, N.THICK_HEDGE);
set(buildings, 1, 0, N.THICK_HEDGE);
set(buildings, 59, 0, N.THICK_HEDGE);
set(buildings, 59, 1, N.THICK_HEDGE);
set(buildings, 58, 0, N.THICK_HEDGE);
set(buildings, 0, 59, N.THICK_HEDGE);
set(buildings, 0, 58, N.THICK_HEDGE);
set(buildings, 1, 59, N.THICK_HEDGE);
set(buildings, 59, 59, N.THICK_HEDGE);
set(buildings, 59, 58, N.THICK_HEDGE);
set(buildings, 58, 59, N.THICK_HEDGE);

// Metro pillars near station
set(buildings, 44, 28, D.METRO_PILLAR);
set(buildings, 46, 28, D.METRO_PILLAR);
set(buildings, 48, 28, D.METRO_PILLAR);

// Metro sign
set(buildings, 45, 28, D.METRO_SIGN_D);

// Dustbins, hydrants, bollards
set(buildings, 22, 33, D.DUSTBIN);
set(buildings, 37, 33, D.DUSTBIN);
set(buildings, 28, 29, D.FIRE_HYDRANT);
set(buildings, 50, 29, D.BOLLARD);

// Additional decorations south
set(buildings, 14, 45, D.LAMPPOST);
set(buildings, 32, 45, D.LAMPPOST);
set(buildings, 50, 45, D.LAMPPOST);
set(buildings, 40, 45, D.TWO_WHEELER);
set(buildings, 30, 55, D.BUS_STOP);

// News stands
set(buildings, 34, 33, D.NEWS_STAND);

// Collision for decorations that should be blocking
// Vendor carts
set(collision, 23, 33, COLL);
set(collision, 26, 33, COLL);
set(collision, 33, 33, COLL);
set(collision, 48, 33, COLL);
// Auto-rickshaws — now moving sprites, no static collision
// Tree trunks in park
set(collision, 9, 25, COLL);
set(collision, 17, 25, COLL);
set(collision, 2, 21, COLL);
set(collision, 6, 23, COLL);
set(collision, 12, 9, COLL);
set(collision, 16, 15, COLL);
// Fountain
set(collision, 13, 15, COLL);
// Metro pillars along road
set(collision, 44, 28, COLL);
set(collision, 46, 28, COLL);
set(collision, 48, 28, COLL);

// ═══════════════════════════════════════════════════════════════════════════
// Build Tiled JSON
// ═══════════════════════════════════════════════════════════════════════════

// Tileset definitions with collision properties
function buildTilesetDef(name, source, firstgid, tilecount, columns, imageW, imageH, collisionTileIds) {
  const tiles = {};
  if (collisionTileIds && collisionTileIds.length > 0) {
    for (const localId of collisionTileIds) {
      tiles[localId] = {
        properties: [{
          name: 'ge_collide',
          type: 'bool',
          value: true,
        }],
      };
    }
  }

  return {
    columns,
    firstgid,
    image: source,
    imageheight: imageH,
    imagewidth: imageW,
    margin: 1,
    name,
    spacing: 2,
    tilecount,
    tileheight: TILE,
    tilewidth: TILE,
    tiles: Object.keys(tiles).length > 0 ? Object.entries(tiles).map(([id, data]) => ({
      id: parseInt(id),
      ...data,
    })) : undefined,
  };
}

// Collision tiles by local ID (0-indexed within each tileset):
// Ground: water(13), we use GID 2 (ASPHALT_DARK, localId=1) as generic collision marker
// Buildings: all building wall tiles are collision by nature of being placed in collision layer
// Nature: thick hedge(15=localId), stone wall(16=localId 0 row2), fence(14=localId)
// But actually, collision is managed via a separate collision LAYER, not tile properties.
// Grid Engine can use EITHER tile properties OR a separate collision layer.
// We'll use tile properties on the collision marker tile.

const tilesets = [
  buildTilesetDef(
    'ground', '../tilesets/ground.png', 1, 32, 16, 288, 36,
    [1] // localId 1 = ASPHALT_DARK used as collision marker
  ),
  buildTilesetDef(
    'buildings', '../tilesets/buildings.png', 33, 64, 16, 288, 72,
    [] // Collision handled by collision layer
  ),
  buildTilesetDef(
    'nature', '../tilesets/nature.png', 97, 32, 16, 288, 36,
    [15] // thick hedge is collision-marked
  ),
  buildTilesetDef(
    'decorations', '../tilesets/decorations.png', 129, 32, 16, 288, 36,
    []
  ),
];

// Build tile layer
function buildTileLayer(name, data, visible = true) {
  return {
    data,
    height: MAP_H,
    id: 0, // will be set
    name,
    opacity: 1,
    type: 'tilelayer',
    visible,
    width: MAP_W,
    x: 0,
    y: 0,
  };
}

// Build object layer
function buildObjectLayer(name, objects) {
  return {
    draworder: 'topdown',
    id: 0,
    name,
    objects,
    opacity: 1,
    type: 'objectgroup',
    visible: true,
    x: 0,
    y: 0,
  };
}

// Spawn point: MG Road Metro station exit at tile (45, 35)
const spawnPoints = [{
  id: 1,
  name: 'player-spawn',
  type: 'spawn',
  x: 45 * TILE,
  y: 35 * TILE,
  width: TILE,
  height: TILE,
  visible: true,
  properties: [{
    name: 'direction',
    type: 'string',
    value: 'down',
  }],
}];

// Zone definitions for all 5 landmarks
const zones = [
  {
    id: 2,
    name: 'chinnaswamy-stadium',
    type: 'landmark',
    x: 3 * TILE,
    y: 41 * TILE,
    width: 10 * TILE,
    height: 13 * TILE,
    visible: true,
    properties: [{
      name: 'displayName',
      type: 'string',
      value: 'Chinnaswamy Stadium',
    }],
  },
  {
    id: 3,
    name: 'ub-city',
    type: 'landmark',
    x: 25 * TILE,
    y: 34 * TILE,
    width: 6 * TILE,
    height: 8 * TILE,
    visible: true,
    properties: [{
      name: 'displayName',
      type: 'string',
      value: 'UB City',
    }],
  },
  {
    id: 4,
    name: 'cubbon-park',
    type: 'landmark',
    x: 1 * TILE,
    y: 5 * TILE,
    width: 18 * TILE,
    height: 23 * TILE,
    visible: true,
    properties: [{
      name: 'displayName',
      type: 'string',
      value: 'Cubbon Park',
    }],
  },
  {
    id: 5,
    name: 'vidhana-soudha',
    type: 'landmark',
    x: 8 * TILE,
    y: 2 * TILE,
    width: 10 * TILE,
    height: 6 * TILE,
    visible: true,
    properties: [{
      name: 'displayName',
      type: 'string',
      value: 'Vidhana Soudha',
    }],
  },
  {
    id: 6,
    name: 'mg-road-metro',
    type: 'landmark',
    x: 43 * TILE,
    y: 33 * TILE,
    width: 5 * TILE,
    height: 4 * TILE,
    visible: true,
    properties: [{
      name: 'displayName',
      type: 'string',
      value: 'MG Road Metro Station',
    }],
  },
];

// Assemble layers with IDs
const layers = [
  { ...buildTileLayer('ground', ground), id: 1 },
  { ...buildTileLayer('ground-detail', groundDetail), id: 2 },
  { ...buildTileLayer('buildings', buildings), id: 3 },
  { ...buildTileLayer('above-player', abovePlayer), id: 4 },
  { ...buildTileLayer('collision', collision, false), id: 5 },
  { ...buildObjectLayer('spawn-points', spawnPoints), id: 6 },
  { ...buildObjectLayer('zones', zones), id: 7 },
];

// Final tilemap JSON
const tilemap = {
  compressionlevel: -1,
  height: MAP_H,
  infinite: false,
  layers,
  nextlayerid: 8,
  nextobjectid: 7,
  orientation: 'orthogonal',
  renderorder: 'right-down',
  tiledversion: '1.12.0',
  tileheight: TILE,
  tilesets,
  tilewidth: TILE,
  type: 'map',
  version: '1.10',
  width: MAP_W,
};

// ═══════════════════════════════════════════════════════════════════════════
// Write output
// ═══════════════════════════════════════════════════════════════════════════

const outDir = path.resolve(__dirname, '..', 'public', 'assets', 'tilemaps');
fs.mkdirSync(outDir, { recursive: true });

const outPath = path.join(outDir, 'mg-road.json');
fs.writeFileSync(outPath, JSON.stringify(tilemap, null, 2));
console.log(`Tilemap written: ${outPath}`);

// Stats
const nonZeroGround = ground.filter(t => t > 0).length;
const nonZeroDetail = groundDetail.filter(t => t > 0).length;
const nonZeroBuildings = buildings.filter(t => t > 0).length;
const nonZeroAbove = abovePlayer.filter(t => t > 0).length;
const nonZeroCollision = collision.filter(t => t > 0).length;
console.log(`  Ground: ${nonZeroGround}/${MAP_W * MAP_H} tiles filled`);
console.log(`  Ground-detail: ${nonZeroDetail} tiles`);
console.log(`  Buildings: ${nonZeroBuildings} tiles`);
console.log(`  Above-player: ${nonZeroAbove} tiles`);
console.log(`  Collision: ${nonZeroCollision} tiles blocked`);
console.log(`  Spawn points: ${spawnPoints.length}`);
console.log(`  Zone definitions: ${zones.length}`);
