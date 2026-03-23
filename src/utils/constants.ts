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
  // Quest events
  QUEST_OFFERED: 'quest-offered',
  QUEST_ACCEPTED: 'quest-accepted',
  QUEST_OBJECTIVE_COMPLETE: 'quest-objective-complete',
  QUEST_COMPLETE: 'quest-complete',
  QUEST_DECLINED: 'quest-declined',
  // Inventory events
  ITEM_COLLECTED: 'item-collected',
  ITEM_PICKUP_INTERACT: 'item-pickup-interact',
  // Journal events
  NPC_MET: 'npc-met',
  // Menu events
  PAUSE_MENU_OPEN: 'pause-menu-open',
  PAUSE_MENU_CLOSE: 'pause-menu-close',
  // Save events
  SAVE_GAME: 'save-game',
  GAME_SAVED: 'game-saved',
  GAME_LOADED: 'game-loaded',
  SAVE_ICON_SHOW: 'save-icon-show',
  // Dialogue choice
  DIALOGUE_CHOICE: 'dialogue-choice',
  // Metro
  METRO_MAP_OPEN: 'metro-map-open',
  METRO_TRAVEL_START: 'metro-travel-start',
} as const;

// Player sprite dimensions
export const PLAYER_FRAME_WIDTH = 16;
export const PLAYER_FRAME_HEIGHT = 16; // Pokemon FR/E chibi: fits one tile

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
  SPRITE_AUTO_RICKSHAW: 'auto-rickshaw',
  SPRITE_CHINNASWAMY: 'chinnaswamy-stadium',
  SPRITE_CHINNASWAMY_ROOF: 'chinnaswamy-roof',
  TILESET_INTERIOR: 'tileset-interior',
  TILEMAP_INTERIOR_METRO: 'tilemap-interior-metro',
  TILEMAP_INTERIOR_COFFEE: 'tilemap-interior-coffee',
  TILEMAP_INTERIOR_UBCITY: 'tilemap-interior-ubcity',
  TILEMAP_INTERIOR_LIBRARY: 'tilemap-interior-library',
  SPRITE_ITEM_ICONS: 'item-icons',
  SPRITE_SPARKLE: 'sparkle',
  SPRITE_SAVE_ICON: 'save-icon',
  SPRITE_HAMBURGER: 'hamburger-icon',
  SPRITE_NPC_PARK_COFFEE: 'npc-park-coffee-vendor',
  // Audio assets (Phase 4)
  AUDIO_BGM_TITLE: 'bgm-title',
  AUDIO_BGM_OUTDOOR: 'bgm-outdoor',
  AUDIO_BGM_INTERIOR: 'bgm-interior',
  AUDIO_SFX_FOOTSTEP: 'sfx-footstep',
  AUDIO_SFX_DOOR_OPEN: 'sfx-door-open',
  AUDIO_SFX_DOOR_CLOSE: 'sfx-door-close',
  AUDIO_SFX_NPC_CHIME: 'sfx-npc-chime',
  AUDIO_SFX_MENU_OPEN: 'sfx-menu-open',
  AUDIO_SFX_MENU_CLOSE: 'sfx-menu-close',
  AUDIO_SFX_DIALOGUE_TICK: 'sfx-dialogue-tick',
  AUDIO_SFX_ITEM_COLLECTED: 'sfx-item-collected',
  AUDIO_SFX_QUEST_COMPLETE: 'sfx-quest-complete',
  AUDIO_AMB_CITY_BASE: 'amb-city-base',
  AUDIO_AMB_CUBBON_PARK: 'amb-cubbon-park',
  AUDIO_AMB_METRO_INTERIOR: 'amb-metro-interior',
  AUDIO_AMB_SHOP_INTERIOR: 'amb-shop-interior',
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
export const NPC_FRAME_HEIGHT = 16;
