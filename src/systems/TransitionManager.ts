import Phaser from 'phaser';
import { eventsCenter } from '../utils/EventsCenter';
import { EVENTS, ASSETS } from '../utils/constants';
import type { InteriorDef } from '../utils/types';

/**
 * TransitionManager: Orchestrates building enter/exit transitions.
 *
 * Handles the fade-to-black sequence when entering or exiting buildings:
 * 1. Freeze player movement
 * 2. Fade camera to black
 * 3. Restart WorldScene with interior/outdoor data
 *
 * The actual scene restart handling (rebuilding tilemap, reinitializing
 * Grid Engine) is wired in Plan 05 when WorldScene.init() is modified.
 * TransitionManager only orchestrates the fade + restart trigger.
 */
export class TransitionManager {
  private scene: Phaser.Scene;
  private isTransitioning = false;
  private currentInterior: InteriorDef | null = null;
  private outdoorState: {
    tilemapKey: string;
    returnPosition: { x: number; y: number };
  } | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Enter a building interior with a fade transition.
   * Freezes movement, fades to black, then restarts WorldScene
   * with interior configuration data.
   */
  enterBuilding(interiorDef: InteriorDef): void {
    if (this.isTransitioning) return;

    this.isTransitioning = true;
    this.currentInterior = interiorDef;
    this.outdoorState = {
      tilemapKey: ASSETS.TILEMAP_MG_ROAD,
      returnPosition: interiorDef.returnPosition,
    };

    // Freeze player movement
    eventsCenter.emit(EVENTS.MOVEMENT_FREEZE, true);

    // Fade to black
    this.scene.cameras.main.fade(250, 0, 0, 0);

    this.scene.cameras.main.once(
      Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
      () => {
        // Restart WorldScene with interior data
        this.scene.scene.restart({
          mode: 'interior',
          interiorKey: interiorDef.tilemapKey,
          tilesetKey: interiorDef.tilesetKey,
          playerSpawn: interiorDef.playerSpawn,
          interiorSize: interiorDef.size,
          interiorId: interiorDef.id,
          interiorDisplayName: interiorDef.displayName,
          returnPosition: interiorDef.returnPosition,
          returnTilemapKey: ASSETS.TILEMAP_MG_ROAD,
        });
      }
    );
  }

  /**
   * Exit the current building and return to the outdoor world.
   * Freezes movement, fades to black, then restarts WorldScene
   * with the saved outdoor return position.
   */
  exitBuilding(): void {
    if (this.isTransitioning || !this.outdoorState) return;

    this.isTransitioning = true;

    // Freeze player movement
    eventsCenter.emit(EVENTS.MOVEMENT_FREEZE, true);

    // Fade to black
    this.scene.cameras.main.fade(250, 0, 0, 0);

    this.scene.cameras.main.once(
      Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
      () => {
        // Restart WorldScene with outdoor data
        this.scene.scene.restart({
          mode: 'outdoor',
          playerSpawn: this.outdoorState!.returnPosition,
        });
      }
    );
  }

  /**
   * Check if currently inside a building interior.
   */
  isInInterior(): boolean {
    return this.currentInterior !== null;
  }

  /**
   * Get the current interior definition, or null if outdoors.
   */
  getCurrentInterior(): InteriorDef | null {
    return this.currentInterior;
  }

  /**
   * Signal that a transition has completed.
   * Called by WorldScene after scene restart completes.
   * This is the handshake point between TransitionManager and WorldScene.
   */
  setTransitionComplete(): void {
    this.isTransitioning = false;
  }

  /**
   * Set return state for when already inside an interior (after scene restart).
   * Unlike enterBuilding(), this does NOT freeze movement or trigger a fade.
   */
  setReturnState(interiorDef: InteriorDef): void {
    this.currentInterior = interiorDef;
    this.outdoorState = {
      tilemapKey: ASSETS.TILEMAP_MG_ROAD,
      returnPosition: interiorDef.returnPosition,
    };
  }

  /**
   * Reset state to outdoor mode.
   * Clears currentInterior and outdoorState.
   */
  resetToOutdoor(): void {
    this.currentInterior = null;
    this.outdoorState = null;
  }
}
