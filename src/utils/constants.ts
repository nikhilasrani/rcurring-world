export const TILE_SIZE = 16;
export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 320;
export const VISIBLE_TILES_X = 30; // 480 / 16
export const VISIBLE_TILES_Y = 20; // 320 / 16
export const MAP_WIDTH_TILES = 60;
export const MAP_HEIGHT_TILES = 60;

// Movement speeds (tiles per second)
export const WALK_SPEED = 4; // ~0.25s per tile
export const RUN_SPEED = 8; // ~0.125s per tile

// Grid Engine collision property name (must match Tiled tileset property)
export const COLLISION_PROPERTY = 'ge_collide';

// Scene keys
export const SCENES = {
  BOOT: 'BootScene',
  TITLE: 'TitleScene',
  NAME_ENTRY: 'NameEntryScene',
  WORLD: 'WorldScene',
  UI: 'UIScene',
} as const;

// Event names for EventsCenter
export const EVENTS = {
  PLAYER_MOVE: 'player-move',
  PLAYER_RUN_TOGGLE: 'player-run-toggle',
  TOUCH_DIRECTION: 'touch-direction',
  TOUCH_ACTION: 'touch-action',
  TOUCH_CANCEL: 'touch-cancel',
  RUN_BUTTON_DOWN: 'run-button-down',
  RUN_BUTTON_UP: 'run-button-up',
  SCENE_READY: 'scene-ready',
  GAME_STARTED: 'game-started',
  DIALOGUE_OPEN: 'dialogue-open',
  DIALOGUE_CLOSE: 'dialogue-close',
  DIALOGUE_ADVANCE: 'dialogue-advance',
  NPC_INTERACT: 'npc-interact',
  SIGN_INTERACT: 'sign-interact',
  ZONE_ENTER: 'zone-enter',
  MOVEMENT_FREEZE: 'movement-freeze',
  BUILDING_ENTER: 'building-enter',
  BUILDING_EXIT: 'building-exit',
} as const;

// Player sprite dimensions
export const PLAYER_FRAME_WIDTH = 16;
export const PLAYER_FRAME_HEIGHT = 24; // Chibi style: taller than wide

// Asset keys
export const ASSETS = {
  TILESET_GROUND: 'tileset-ground',
  TILESET_BUILDINGS: 'tileset-buildings',
  TILESET_NATURE: 'tileset-nature',
  TILESET_DECORATIONS: 'tileset-decorations',
  TILEMAP_MG_ROAD: 'tilemap-mg-road',
  SPRITE_PLAYER_MALE: 'player-male',
  SPRITE_PLAYER_FEMALE: 'player-female',
  UI_JOYSTICK_BASE: 'joystick-base',
  UI_JOYSTICK_THUMB: 'joystick-thumb',
  UI_BUTTON_A: 'button-a',
  UI_BUTTON_B: 'button-b',
  SPRITE_NPC_CHAI_WALLA: 'npc-chai-walla',
  SPRITE_NPC_AUTO_DRIVER: 'npc-auto-driver',
  SPRITE_NPC_JOGGER: 'npc-jogger',
  SPRITE_NPC_SHOPKEEPER: 'npc-shopkeeper',
  SPRITE_NPC_GUARD: 'npc-guard',
  TILESET_INTERIOR: 'tileset-interior',
  TILEMAP_INTERIOR_METRO: 'tilemap-interior-metro',
  TILEMAP_INTERIOR_COFFEE: 'tilemap-interior-coffee',
  TILEMAP_INTERIOR_UBCITY: 'tilemap-interior-ubcity',
  TILEMAP_INTERIOR_LIBRARY: 'tilemap-interior-library',
} as const;

// Tilemap layer names (must match Tiled export)
export const LAYERS = {
  GROUND: 'ground',
  GROUND_DETAIL: 'ground-detail',
  BUILDINGS: 'buildings',
  ABOVE_PLAYER: 'above-player',
  COLLISION: 'collision',
  SPAWN_POINTS: 'spawn-points',
  ZONES: 'zones',
  DECORATIONS: 'decorations',
  INTERACTABLES: 'interactables',
  DOORS: 'doors',
} as const;

// NPC sprite dimensions (same as player)
export const NPC_FRAME_WIDTH = 16;
export const NPC_FRAME_HEIGHT = 24;
