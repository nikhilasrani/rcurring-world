import { describe, it, expect } from 'vitest';
import {
  TILE_SIZE,
  GAME_WIDTH,
  GAME_HEIGHT,
  WALK_SPEED,
  RUN_SPEED,
  COLLISION_PROPERTY,
  EVENTS,
  ASSETS,
} from '../../src/utils/constants';

describe('Game Constants', () => {
  it('has correct tile size', () => {
    expect(TILE_SIZE).toBe(16);
  });

  it('has correct game dimensions', () => {
    expect(GAME_WIDTH).toBe(480);
    expect(GAME_HEIGHT).toBe(320);
  });

  it('has correct movement speeds', () => {
    expect(WALK_SPEED).toBe(4);
    expect(RUN_SPEED).toBe(8);
    expect(RUN_SPEED).toBe(WALK_SPEED * 2);
  });

  it('has collision property name matching Grid Engine convention', () => {
    expect(COLLISION_PROPERTY).toBe('ge_collide');
  });

  it('visible tiles match game dimensions divided by tile size', () => {
    expect(GAME_WIDTH / TILE_SIZE).toBe(30);
    expect(GAME_HEIGHT / TILE_SIZE).toBe(20);
  });

  // Phase 3 event constants
  describe('Phase 3 EVENTS', () => {
    it('has quest event constants', () => {
      expect(EVENTS.QUEST_OFFERED).toBe('quest-offered');
      expect(EVENTS.QUEST_ACCEPTED).toBe('quest-accepted');
      expect(EVENTS.QUEST_OBJECTIVE_COMPLETE).toBe('quest-objective-complete');
      expect(EVENTS.QUEST_COMPLETE).toBe('quest-complete');
      expect(EVENTS.QUEST_DECLINED).toBe('quest-declined');
    });

    it('has inventory event constants', () => {
      expect(EVENTS.ITEM_COLLECTED).toBe('item-collected');
      expect(EVENTS.ITEM_PICKUP_INTERACT).toBe('item-pickup-interact');
    });

    it('has journal event constants', () => {
      expect(EVENTS.NPC_MET).toBe('npc-met');
    });

    it('has menu event constants', () => {
      expect(EVENTS.PAUSE_MENU_OPEN).toBe('pause-menu-open');
      expect(EVENTS.PAUSE_MENU_CLOSE).toBe('pause-menu-close');
    });

    it('has save event constants', () => {
      expect(EVENTS.GAME_SAVED).toBe('game-saved');
      expect(EVENTS.GAME_LOADED).toBe('game-loaded');
      expect(EVENTS.SAVE_ICON_SHOW).toBe('save-icon-show');
    });

    it('has dialogue choice and metro events', () => {
      expect(EVENTS.DIALOGUE_CHOICE).toBe('dialogue-choice');
      expect(EVENTS.METRO_MAP_OPEN).toBe('metro-map-open');
      expect(EVENTS.METRO_TRAVEL_START).toBe('metro-travel-start');
    });

    it('preserves existing Phase 1-2 events', () => {
      expect(EVENTS.PLAYER_MOVE).toBe('player-move');
      expect(EVENTS.DIALOGUE_OPEN).toBe('dialogue-open');
      expect(EVENTS.DIALOGUE_CLOSE).toBe('dialogue-close');
      expect(EVENTS.NPC_INTERACT).toBe('npc-interact');
      expect(EVENTS.ZONE_ENTER).toBe('zone-enter');
      expect(EVENTS.BUILDING_ENTER).toBe('building-enter');
      expect(EVENTS.BUILDING_EXIT).toBe('building-exit');
    });
  });

  // Phase 3 asset constants
  describe('Phase 3 ASSETS', () => {
    it('has Phase 3 sprite and icon asset keys', () => {
      expect(ASSETS.SPRITE_ITEM_ICONS).toBe('item-icons');
      expect(ASSETS.SPRITE_SPARKLE).toBe('sparkle');
      expect(ASSETS.SPRITE_SAVE_ICON).toBe('save-icon');
      expect(ASSETS.SPRITE_HAMBURGER).toBe('hamburger-icon');
      expect(ASSETS.SPRITE_NPC_PARK_COFFEE).toBe('npc-park-coffee-vendor');
    });

    it('preserves existing asset keys', () => {
      expect(ASSETS.TILESET_GROUND).toBe('tileset-ground');
      expect(ASSETS.SPRITE_PLAYER_MALE).toBe('player-male');
      expect(ASSETS.SPRITE_NPC_CHAI_WALLA).toBe('npc-chai-walla');
    });
  });
});
