import { eventsCenter } from '../utils/EventsCenter';
import { EVENTS } from '../utils/constants';
import audioConfig from '../data/audio/audio-config.json';

/**
 * Audio orchestration singleton. Manages BGM, SFX, ambient layers,
 * crossfades, ducking, and volume settings.
 *
 * No direct Phaser imports -- receives scene reference for sound/tween access.
 * Follows the same isolation pattern as QuestManager / InventoryManager.
 */
export class AudioManager {
  private scene: any;
  private bgmTracks: Record<string, any> = {};
  private sfxSounds: Record<string, any> = {};
  private ambientSounds: Record<string, any> = {};
  private currentBGMKey: string | null = null;
  private currentAmbientOverlayKey: string | null = null;
  private ambientBaseKey: string | null = null;
  private musicVolume: number = 0.7;
  private sfxVolume: number = 0.7;
  private isDucked: boolean = false;
  private isInInterior: boolean = false;
  private currentOutdoorZone: string | null = null;
  private activeCrossfadeTweens: any[] = [];

  constructor(scene: any) {
    this.scene = scene;
    this.initSounds();
    this.wireEvents();
  }

  /** Create all sound instances from audio config. */
  private initSounds(): void {
    for (const [name, entry] of Object.entries(audioConfig.bgm)) {
      this.bgmTracks[name] = this.scene.sound.add((entry as any).key);
    }
    for (const [name, entry] of Object.entries(audioConfig.sfx)) {
      this.sfxSounds[name] = this.scene.sound.add((entry as any).key);
    }
    for (const [name, entry] of Object.entries(audioConfig.ambient)) {
      this.ambientSounds[name] = this.scene.sound.add((entry as any).key);
    }
  }

  /** Subscribe to EventsCenter events. */
  private wireEvents(): void {
    eventsCenter.on(EVENTS.BUILDING_ENTER, this.onBuildingEnter, this);
    eventsCenter.on(EVENTS.BUILDING_EXIT, this.onBuildingExit, this);
    eventsCenter.on(EVENTS.ZONE_ENTER, this.onZoneEnter, this);
    eventsCenter.on(EVENTS.DIALOGUE_OPEN, this.duck, this);
    eventsCenter.on(EVENTS.DIALOGUE_CLOSE, this.unduck, this);
    eventsCenter.on(EVENTS.NPC_INTERACT, this.onNPCInteract, this);
    eventsCenter.on(EVENTS.PAUSE_MENU_OPEN, this.onPauseMenuOpen, this);
    eventsCenter.on(EVENTS.PAUSE_MENU_CLOSE, this.onPauseMenuClose, this);
    eventsCenter.on(EVENTS.ITEM_COLLECTED, this.onItemCollected, this);
    eventsCenter.on(EVENTS.QUEST_COMPLETE, this.onQuestComplete, this);
  }

  /** Update scene reference after scene restart. */
  setScene(scene: any): void {
    // Kill active crossfade tweens from old scene
    this.cancelActiveTweens();
    this.scene = scene;
  }

  // --- BGM ---

  /** Play a BGM track by name (e.g. 'outdoor'). Crossfades from current. */
  playBGM(trackName: string): void {
    if (trackName === this.currentBGMKey) return;
    this.crossfadeMusic(trackName);
  }

  /** Crossfade from current BGM to a new track. */
  crossfadeMusic(toKey: string, duration?: number): void {
    const fadeDuration = duration ?? audioConfig.crossfade.musicDurationMs;

    // Cancel any active crossfade tweens
    this.cancelActiveTweens();

    // Fade out current BGM
    const currentTrack = this.currentBGMKey ? this.bgmTracks[this.currentBGMKey] : null;
    if (currentTrack && currentTrack.isPlaying) {
      const fadeOutTween = this.scene.tweens.add({
        targets: currentTrack,
        volume: 0,
        duration: fadeDuration,
        onComplete: () => {
          currentTrack.stop();
        },
      });
      this.activeCrossfadeTweens.push(fadeOutTween);
    }

    // Fade in new BGM
    const newTrack = this.bgmTracks[toKey];
    if (newTrack) {
      newTrack.volume = 0;
      newTrack.play({ loop: true, volume: 0 });
      const targetVolume = this.isDucked
        ? this.musicVolume * audioConfig.crossfade.duckLevel
        : this.musicVolume;
      const fadeInTween = this.scene.tweens.add({
        targets: newTrack,
        volume: targetVolume,
        duration: fadeDuration,
      });
      this.activeCrossfadeTweens.push(fadeInTween);
    }

    this.currentBGMKey = toKey;
  }

  /** Cancel all active crossfade tweens. */
  private cancelActiveTweens(): void {
    for (const tween of this.activeCrossfadeTweens) {
      if (tween && tween.stop) {
        tween.stop();
      }
    }
    this.activeCrossfadeTweens = [];
  }

  // --- SFX ---

  /** Play a one-shot SFX by name. */
  playSFX(name: string): void {
    const sound = this.sfxSounds[name];
    if (!sound) return;
    // dialogue-tick is quieter
    const volume = name === 'dialogue-tick'
      ? this.sfxVolume * 0.3
      : this.sfxVolume;
    sound.play({ volume });
  }

  /** Start looping footstep sound. */
  startFootsteps(): void {
    const sound = this.sfxSounds['footstep'];
    if (sound) {
      sound.play({ loop: true, volume: this.sfxVolume * 0.5 });
    }
  }

  /** Stop footstep sound. */
  stopFootsteps(): void {
    const sound = this.sfxSounds['footstep'];
    if (sound) {
      sound.stop();
    }
  }

  // --- Ambient ---

  /** Set ambient overlay for a landmark zone. */
  setAmbientZone(landmarkId: string): void {
    const ambientKey = (audioConfig.zoneAmbientMap as Record<string, string>)[landmarkId];
    if (!ambientKey) return;
    if (ambientKey === this.currentAmbientOverlayKey) return;

    // Fade out current overlay
    if (this.currentAmbientOverlayKey && this.currentAmbientOverlayKey !== this.ambientBaseKey) {
      const currentOverlay = this.ambientSounds[this.currentAmbientOverlayKey];
      if (currentOverlay && currentOverlay.isPlaying) {
        this.scene.tweens.add({
          targets: currentOverlay,
          volume: 0,
          duration: audioConfig.crossfade.ambientDurationMs,
          onComplete: () => {
            currentOverlay.stop();
          },
        });
      }
    }

    // If the new ambient is same as base, don't start an overlay
    if (ambientKey === this.ambientBaseKey) {
      this.currentAmbientOverlayKey = ambientKey;
      return;
    }

    // Fade in new overlay
    const newOverlay = this.ambientSounds[ambientKey];
    if (newOverlay) {
      newOverlay.volume = 0;
      newOverlay.play({ loop: true, volume: 0 });
      this.scene.tweens.add({
        targets: newOverlay,
        volume: 0.6,
        duration: audioConfig.crossfade.ambientDurationMs,
      });
    }

    this.currentAmbientOverlayKey = ambientKey;
  }

  /** Play city-base ambient as the outdoor base layer. */
  startOutdoorAmbient(): void {
    const baseSound = this.ambientSounds['city-base'];
    if (baseSound) {
      baseSound.play({ loop: true, volume: 0.4 });
    }
    this.ambientBaseKey = 'city-base';
  }

  // --- Interior transitions ---

  /** Enter an interior: switch BGM and ambient. */
  enterInterior(interiorId: string): void {
    this.isInInterior = true;

    // Stop outdoor ambient base and overlay
    this.stopAllAmbient();

    // Start interior ambient
    const interiorAmbientKey = (audioConfig.interiorAmbientMap as Record<string, string>)[interiorId];
    if (interiorAmbientKey) {
      const interiorAmbient = this.ambientSounds[interiorAmbientKey];
      if (interiorAmbient) {
        interiorAmbient.play({ loop: true, volume: 0.5 });
      }
    }

    // Crossfade BGM to interior
    this.crossfadeMusic(audioConfig.interiorBGM);
  }

  /** Exit an interior: restore outdoor BGM and ambient. */
  exitInterior(): void {
    this.isInInterior = false;

    // Stop interior ambient
    this.stopAllAmbient();

    // Restart outdoor ambient base
    this.startOutdoorAmbient();

    // Restore outdoor zone overlay if we had one
    if (this.currentOutdoorZone) {
      this.currentAmbientOverlayKey = null; // Reset so setAmbientZone doesn't skip
      this.setAmbientZone(this.currentOutdoorZone);
    }

    // Crossfade BGM to outdoor
    this.crossfadeMusic(audioConfig.outdoorBGM);
  }

  /** Stop all ambient sounds (base + overlay). */
  private stopAllAmbient(): void {
    for (const sound of Object.values(this.ambientSounds)) {
      if (sound && sound.isPlaying) {
        sound.stop();
      }
    }
    this.currentAmbientOverlayKey = null;
    this.ambientBaseKey = null;
  }

  // --- Ducking ---

  /** Duck BGM and ambient volumes during dialogue. Idempotent. */
  duck(): void {
    if (this.isDucked) return;
    this.isDucked = true;

    const duckLevel = audioConfig.crossfade.duckLevel;
    const duration = audioConfig.crossfade.duckDurationMs;

    // Duck BGM
    if (this.currentBGMKey) {
      const bgm = this.bgmTracks[this.currentBGMKey];
      if (bgm) {
        this.scene.tweens.add({
          targets: bgm,
          volume: this.musicVolume * duckLevel,
          duration,
        });
      }
    }

    // Duck ambient
    for (const sound of Object.values(this.ambientSounds)) {
      if (sound && sound.isPlaying) {
        this.scene.tweens.add({
          targets: sound,
          volume: (sound as any).volume * duckLevel,
          duration,
        });
      }
    }
  }

  /** Restore BGM and ambient volumes after dialogue. */
  unduck(): void {
    if (!this.isDucked) return;
    this.isDucked = false;

    const duration = audioConfig.crossfade.duckDurationMs;

    // Restore BGM
    if (this.currentBGMKey) {
      const bgm = this.bgmTracks[this.currentBGMKey];
      if (bgm) {
        this.scene.tweens.add({
          targets: bgm,
          volume: this.musicVolume,
          duration,
        });
      }
    }

    // Restore ambient (base at 0.4, overlay at 0.6)
    if (this.ambientBaseKey) {
      const base = this.ambientSounds[this.ambientBaseKey];
      if (base && base.isPlaying) {
        this.scene.tweens.add({
          targets: base,
          volume: 0.4,
          duration,
        });
      }
    }
    if (this.currentAmbientOverlayKey && this.currentAmbientOverlayKey !== this.ambientBaseKey) {
      const overlay = this.ambientSounds[this.currentAmbientOverlayKey];
      if (overlay && overlay.isPlaying) {
        this.scene.tweens.add({
          targets: overlay,
          volume: 0.6,
          duration,
        });
      }
    }
  }

  // --- Volume settings ---

  /** Update music volume. Immediately applies to playing BGM if not ducked. */
  setMusicVolume(v: number): void {
    this.musicVolume = Math.max(0, Math.min(1, v));
    if (this.currentBGMKey && !this.isDucked) {
      const bgm = this.bgmTracks[this.currentBGMKey];
      if (bgm) {
        bgm.setVolume(this.musicVolume);
      }
    }
  }

  /** Update SFX volume for subsequent plays. */
  setSFXVolume(v: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, v));
  }

  /** Returns current volume settings for save integration. */
  getSettings(): { musicVolume: number; sfxVolume: number } {
    return { musicVolume: this.musicVolume, sfxVolume: this.sfxVolume };
  }

  /** Load volume settings from saved state. */
  loadSettings(settings: { musicVolume: number; sfxVolume: number }): void {
    this.musicVolume = settings.musicVolume;
    this.sfxVolume = settings.sfxVolume;
  }

  // --- Title music ---

  /** Play title screen BGM with loop, no ambient. */
  startTitleMusic(): void {
    const titleTrack = this.bgmTracks[audioConfig.titleBGM];
    if (titleTrack) {
      titleTrack.play({ loop: true, volume: this.musicVolume });
    }
    this.currentBGMKey = audioConfig.titleBGM;
  }

  /** Stop title screen BGM. */
  stopTitleMusic(): void {
    const titleTrack = this.bgmTracks[audioConfig.titleBGM];
    if (titleTrack) {
      titleTrack.stop();
    }
    this.currentBGMKey = null;
  }

  // --- Event handlers ---

  /** ZoneManager emits display names; resolve to landmark IDs via zoneNameToId. */
  onZoneEnter(zoneName: string): void {
    const zoneNameToId = (audioConfig as any).zoneNameToId as Record<string, string> | undefined;
    const landmarkId = zoneNameToId?.[zoneName];
    if (landmarkId) {
      this.currentOutdoorZone = landmarkId;
      if (!this.isInInterior) {
        this.setAmbientZone(landmarkId);
      }
    }
  }

  private onBuildingEnter(interiorId?: string): void {
    this.playSFX('door-open');
    if (interiorId) {
      this.enterInterior(interiorId);
    }
  }

  private onBuildingExit(): void {
    this.playSFX('door-close');
    this.exitInterior();
  }

  private onNPCInteract(): void {
    this.playSFX('npc-chime');
  }

  private onPauseMenuOpen(): void {
    this.playSFX('menu-open');
  }

  private onPauseMenuClose(): void {
    this.playSFX('menu-close');
  }

  private onItemCollected(): void {
    this.playSFX('item-collected');
  }

  private onQuestComplete(): void {
    this.playSFX('quest-complete');
  }

  // --- Cleanup ---

  /** Remove all EventsCenter listeners and stop all sounds. */
  destroy(): void {
    eventsCenter.off(EVENTS.BUILDING_ENTER, this.onBuildingEnter, this);
    eventsCenter.off(EVENTS.BUILDING_EXIT, this.onBuildingExit, this);
    eventsCenter.off(EVENTS.ZONE_ENTER, this.onZoneEnter, this);
    eventsCenter.off(EVENTS.DIALOGUE_OPEN, this.duck, this);
    eventsCenter.off(EVENTS.DIALOGUE_CLOSE, this.unduck, this);
    eventsCenter.off(EVENTS.NPC_INTERACT, this.onNPCInteract, this);
    eventsCenter.off(EVENTS.PAUSE_MENU_OPEN, this.onPauseMenuOpen, this);
    eventsCenter.off(EVENTS.PAUSE_MENU_CLOSE, this.onPauseMenuClose, this);
    eventsCenter.off(EVENTS.ITEM_COLLECTED, this.onItemCollected, this);
    eventsCenter.off(EVENTS.QUEST_COMPLETE, this.onQuestComplete, this);

    this.cancelActiveTweens();

    // Stop all sounds
    for (const sound of Object.values(this.bgmTracks)) {
      if (sound) sound.stop();
    }
    for (const sound of Object.values(this.sfxSounds)) {
      if (sound) sound.stop();
    }
    for (const sound of Object.values(this.ambientSounds)) {
      if (sound) sound.stop();
    }
  }
}
