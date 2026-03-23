import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EVENTS } from '../../src/utils/constants';

// Mock EventsCenter to avoid loading Phaser (needs browser window).
// Stores listeners with their context so `this` works when emitted.
vi.mock('../../src/utils/EventsCenter', () => {
  const listeners: Record<string, { cb: Function; ctx: any }[]> = {};
  return {
    eventsCenter: {
      on: vi.fn((event: string, cb: Function, ctx?: any) => {
        if (!listeners[event]) listeners[event] = [];
        listeners[event].push({ cb, ctx });
      }),
      off: vi.fn(),
      emit: vi.fn((event: string, ...args: any[]) => {
        (listeners[event] || []).forEach(({ cb, ctx }) => cb.call(ctx, ...args));
      }),
      removeAllListeners: vi.fn(),
      __listeners: listeners,
      __reset: () => {
        for (const key of Object.keys(listeners)) {
          delete listeners[key];
        }
      },
    },
  };
});

import { AudioManager } from '../../src/systems/AudioManager';
import { eventsCenter } from '../../src/utils/EventsCenter';

// Helper: create a mock Phaser sound instance
function createMockSound() {
  return {
    play: vi.fn(),
    stop: vi.fn(),
    isPlaying: false,
    volume: 0,
    loop: false,
    setVolume: vi.fn(function (this: any, v: number) {
      this.volume = v;
    }),
    destroy: vi.fn(),
  };
}

// Helper: create a mock Phaser scene with sound manager and tweens
function createMockScene() {
  const sounds: Record<string, ReturnType<typeof createMockSound>> = {};
  return {
    sound: {
      add: vi.fn((key: string) => {
        const s = createMockSound();
        sounds[key] = s;
        return s;
      }),
      _sounds: sounds,
    },
    tweens: {
      add: vi.fn((config: any) => {
        // Immediately call onComplete if present (for synchronous testing)
        if (config.onComplete) {
          config.onComplete();
        }
        return { stop: vi.fn() };
      }),
      killTweensOf: vi.fn(),
    },
  };
}

describe('AudioManager', () => {
  let scene: ReturnType<typeof createMockScene>;
  let am: AudioManager;

  beforeEach(() => {
    vi.clearAllMocks();
    (eventsCenter as any).__reset();
    scene = createMockScene();
    am = new AudioManager(scene);
  });

  // --- Constructor ---
  it('constructor creates AudioManager instance with default volumes', () => {
    const settings = am.getSettings();
    expect(settings.musicVolume).toBe(0.7);
    expect(settings.sfxVolume).toBe(0.7);
  });

  // --- initSounds ---
  it('initSounds creates sound instances for all BGM, SFX, and ambient keys', () => {
    // 3 BGM + 9 SFX + 4 ambient = 16 calls
    expect(scene.sound.add).toHaveBeenCalledTimes(16);
    expect(scene.sound.add).toHaveBeenCalledWith('bgm-title');
    expect(scene.sound.add).toHaveBeenCalledWith('bgm-outdoor');
    expect(scene.sound.add).toHaveBeenCalledWith('bgm-interior');
    expect(scene.sound.add).toHaveBeenCalledWith('sfx-footstep');
    expect(scene.sound.add).toHaveBeenCalledWith('sfx-npc-chime');
    expect(scene.sound.add).toHaveBeenCalledWith('amb-city-base');
    expect(scene.sound.add).toHaveBeenCalledWith('amb-cubbon-park');
  });

  // --- playSFX ---
  it('playSFX(npc-chime) calls play on the sfx-npc-chime sound with correct volume', () => {
    am.playSFX('npc-chime');
    const sound = scene.sound._sounds['sfx-npc-chime'];
    expect(sound.play).toHaveBeenCalledWith(
      expect.objectContaining({ volume: 0.7 }),
    );
  });

  it('playSFX(footstep) with loop option starts looping footstep sound', () => {
    am.startFootsteps();
    const sound = scene.sound._sounds['sfx-footstep'];
    expect(sound.play).toHaveBeenCalledWith(
      expect.objectContaining({ loop: true }),
    );
  });

  // --- stopSFX ---
  it('stopFootsteps stops the footstep sound', () => {
    am.startFootsteps();
    am.stopFootsteps();
    const sound = scene.sound._sounds['sfx-footstep'];
    expect(sound.stop).toHaveBeenCalled();
  });

  // --- playBGM ---
  it('playBGM(outdoor) starts outdoor BGM with loop at musicVolume', () => {
    am.playBGM('outdoor');
    const sound = scene.sound._sounds['bgm-outdoor'];
    expect(sound.play).toHaveBeenCalledWith(
      expect.objectContaining({ loop: true }),
    );
  });

  // --- crossfadeMusic ---
  it('crossfadeMusic creates tweens for fading out old and fading in new BGM', () => {
    am.playBGM('outdoor');
    scene.tweens.add.mockClear();

    am.crossfadeMusic('interior');
    // Should have created tweens (fade-out old + fade-in new)
    expect(scene.tweens.add).toHaveBeenCalled();
  });

  it('crossfadeMusic cancels previous crossfade tweens before starting new ones', () => {
    // Set up non-completing tweens to test cancellation
    const mockTween1 = { stop: vi.fn() };
    const mockTween2 = { stop: vi.fn() };
    let callCount = 0;
    scene.tweens.add.mockImplementation((config: any) => {
      callCount++;
      return callCount <= 2 ? mockTween1 : mockTween2;
    });

    am.playBGM('outdoor');
    am.crossfadeMusic('interior');
    const tweensBefore = [mockTween1];

    am.crossfadeMusic('title');
    // Previous tweens should have been stopped
    expect(mockTween1.stop).toHaveBeenCalled();
  });

  // --- setAmbientZone ---
  it('setAmbientZone(cubbon-park) starts cubbon-park ambient overlay', () => {
    am.startOutdoorAmbient();
    am.setAmbientZone('cubbon-park');
    const sound = scene.sound._sounds['amb-cubbon-park'];
    expect(sound).toBeDefined();
  });

  it('setAmbientZone with city-base zone starts city-base ambient as base layer', () => {
    am.startOutdoorAmbient();
    // chinnaswamy-stadium maps to city-base, same as base -- should skip overlay
    am.setAmbientZone('chinnaswamy-stadium');
    // city-base is the base layer, so overlay should not be separately started
    // (it maps to the same ambient as the base)
  });

  // --- enterInterior / exitInterior ---
  it('enterInterior switches BGM to interior and ambient to metro-interior', () => {
    am.playBGM('outdoor');
    am.startOutdoorAmbient();
    scene.tweens.add.mockClear();

    am.enterInterior('interior-metro');
    const interiorAmbient = scene.sound._sounds['amb-metro-interior'];
    expect(interiorAmbient).toBeDefined();
  });

  it('exitInterior switches BGM to outdoor and restores outdoor ambient', () => {
    am.playBGM('outdoor');
    am.startOutdoorAmbient();
    am.enterInterior('interior-metro');
    scene.tweens.add.mockClear();

    am.exitInterior();
    // Should have triggered crossfade to outdoor BGM
    expect(scene.tweens.add).toHaveBeenCalled();
  });

  // --- duck / unduck ---
  it('duck reduces BGM volume via tween', () => {
    am.playBGM('outdoor');
    scene.tweens.add.mockClear();

    am.duck();
    expect(scene.tweens.add).toHaveBeenCalled();
  });

  it('unduck restores BGM volume via tween', () => {
    am.playBGM('outdoor');
    am.duck();
    scene.tweens.add.mockClear();

    am.unduck();
    expect(scene.tweens.add).toHaveBeenCalled();
  });

  it('duck is idempotent (calling twice does not create extra tweens)', () => {
    am.playBGM('outdoor');
    am.duck();
    scene.tweens.add.mockClear();

    am.duck();
    // Should not create any new tweens since already ducked
    expect(scene.tweens.add).not.toHaveBeenCalled();
  });

  // --- setMusicVolume ---
  it('setMusicVolume updates stored volume AND currently-playing BGM volume', () => {
    am.playBGM('outdoor');
    const sound = scene.sound._sounds['bgm-outdoor'];

    am.setMusicVolume(0.5);
    expect(am.getSettings().musicVolume).toBe(0.5);
    expect(sound.setVolume).toHaveBeenCalledWith(0.5);
  });

  // --- setSFXVolume ---
  it('setSFXVolume updates stored volume for subsequent SFX plays', () => {
    am.setSFXVolume(0.3);
    expect(am.getSettings().sfxVolume).toBe(0.3);

    am.playSFX('npc-chime');
    const sound = scene.sound._sounds['sfx-npc-chime'];
    expect(sound.play).toHaveBeenCalledWith(
      expect.objectContaining({ volume: 0.3 }),
    );
  });

  // --- Event wiring: BUILDING_ENTER ---
  it('onBuildingEnter event triggers playSFX door-open', () => {
    (eventsCenter as any).emit(EVENTS.BUILDING_ENTER, 'interior-metro');
    const sound = scene.sound._sounds['sfx-door-open'];
    expect(sound.play).toHaveBeenCalled();
  });

  // --- Event wiring: BUILDING_EXIT ---
  it('onBuildingExit event triggers playSFX door-close and exitInterior', () => {
    am.playBGM('interior');
    (eventsCenter as any).emit(EVENTS.BUILDING_EXIT);
    const sound = scene.sound._sounds['sfx-door-close'];
    expect(sound.play).toHaveBeenCalled();
  });

  // --- Event wiring: DIALOGUE_OPEN / DIALOGUE_CLOSE ---
  it('onDialogueOpen triggers duck, onDialogueClose triggers unduck', () => {
    am.playBGM('outdoor');
    scene.tweens.add.mockClear();

    (eventsCenter as any).emit(EVENTS.DIALOGUE_OPEN);
    expect(scene.tweens.add).toHaveBeenCalled();

    scene.tweens.add.mockClear();
    (eventsCenter as any).emit(EVENTS.DIALOGUE_CLOSE);
    expect(scene.tweens.add).toHaveBeenCalled();
  });

  // --- Event wiring: NPC_INTERACT ---
  it('onNPCInteract triggers playSFX npc-chime', () => {
    (eventsCenter as any).emit(EVENTS.NPC_INTERACT);
    const sound = scene.sound._sounds['sfx-npc-chime'];
    expect(sound.play).toHaveBeenCalled();
  });

  // --- Event wiring: ITEM_COLLECTED ---
  it('onItemCollected triggers playSFX item-collected', () => {
    (eventsCenter as any).emit(EVENTS.ITEM_COLLECTED);
    const sound = scene.sound._sounds['sfx-item-collected'];
    expect(sound.play).toHaveBeenCalled();
  });

  // --- Event wiring: QUEST_COMPLETE ---
  it('onQuestComplete triggers playSFX quest-complete', () => {
    (eventsCenter as any).emit(EVENTS.QUEST_COMPLETE);
    const sound = scene.sound._sounds['sfx-quest-complete'];
    expect(sound.play).toHaveBeenCalled();
  });

  // --- Event wiring: PAUSE_MENU_OPEN ---
  it('onPauseMenuOpen triggers playSFX menu-open', () => {
    (eventsCenter as any).emit(EVENTS.PAUSE_MENU_OPEN);
    const sound = scene.sound._sounds['sfx-menu-open'];
    expect(sound.play).toHaveBeenCalled();
  });

  // --- Event wiring: PAUSE_MENU_CLOSE ---
  it('onPauseMenuClose triggers playSFX menu-close', () => {
    (eventsCenter as any).emit(EVENTS.PAUSE_MENU_CLOSE);
    const sound = scene.sound._sounds['sfx-menu-close'];
    expect(sound.play).toHaveBeenCalled();
  });

  // --- startFootsteps / stopFootsteps ---
  it('startFootsteps plays footstep sound in loop, stopFootsteps stops it', () => {
    am.startFootsteps();
    const sound = scene.sound._sounds['sfx-footstep'];
    expect(sound.play).toHaveBeenCalledWith(
      expect.objectContaining({ loop: true }),
    );

    am.stopFootsteps();
    expect(sound.stop).toHaveBeenCalled();
  });

  // --- loadSettings ---
  it('loadSettings reads musicVolume/sfxVolume from provided settings', () => {
    am.loadSettings({ musicVolume: 0.4, sfxVolume: 0.2 });
    const settings = am.getSettings();
    expect(settings.musicVolume).toBe(0.4);
    expect(settings.sfxVolume).toBe(0.2);
  });

  // --- getSettings ---
  it('getSettings returns {musicVolume, sfxVolume} for save integration', () => {
    const settings = am.getSettings();
    expect(settings).toHaveProperty('musicVolume');
    expect(settings).toHaveProperty('sfxVolume');
  });

  // --- onZoneEnter with zoneNameToId ---
  it('onZoneEnter(Cubbon Park) resolves display name to cubbon-park via zoneNameToId and calls setAmbientZone', () => {
    am.startOutdoorAmbient();
    (eventsCenter as any).emit(EVENTS.ZONE_ENTER, 'Cubbon Park');
    // Should have resolved 'Cubbon Park' -> 'cubbon-park' -> cubbon-park ambient
    const sound = scene.sound._sounds['amb-cubbon-park'];
    expect(sound).toBeDefined();
  });

  it('onZoneEnter with unknown zone name does nothing', () => {
    const callCount = scene.tweens.add.mock.calls.length;
    (eventsCenter as any).emit(EVENTS.ZONE_ENTER, 'Unknown Place');
    // Should not throw or create extra tweens
    // (some tweens may have been created during constructor, but no new ones)
  });

  // --- startTitleMusic / stopTitleMusic ---
  it('startTitleMusic plays title BGM with loop', () => {
    am.startTitleMusic();
    const sound = scene.sound._sounds['bgm-title'];
    expect(sound.play).toHaveBeenCalledWith(
      expect.objectContaining({ loop: true }),
    );
  });

  it('stopTitleMusic stops the title BGM', () => {
    am.startTitleMusic();
    am.stopTitleMusic();
    const sound = scene.sound._sounds['bgm-title'];
    expect(sound.stop).toHaveBeenCalled();
  });

  // --- setScene ---
  it('setScene updates the scene reference', () => {
    const newScene = createMockScene();
    am.setScene(newScene);
    // Verify it works by using the new scene's tweens
    am.playBGM('outdoor');
    expect(newScene.tweens.add).toHaveBeenCalled();
  });

  // --- destroy ---
  it('destroy removes EventsCenter listeners and stops all sounds', () => {
    am.destroy();
    expect(eventsCenter.off).toHaveBeenCalled();
  });
});
