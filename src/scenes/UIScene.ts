import Phaser from 'phaser';
import { TouchControls } from '../ui/TouchControls';
import { DialogBox } from '../ui/DialogBox';
import { ZoneBanner } from '../ui/ZoneBanner';
import { eventsCenter } from '../utils/EventsCenter';
import { SCENES, EVENTS, GAME_WIDTH, GAME_HEIGHT } from '../utils/constants';
import type { DialogueData } from '../utils/types';

/**
 * UIScene: Parallel overlay scene for touch controls, dialogue box, and zone banner.
 *
 * All UI elements are positioned relative to the visible viewport bounds,
 * accounting for ENVELOP scaling which may crop edges on different aspect ratios.
 */
export class UIScene extends Phaser.Scene {
  private touchControls!: TouchControls;
  private dialogBox!: DialogBox;
  private zoneBanner!: ZoneBanner;

  constructor() {
    super({ key: SCENES.UI });
  }

  create(): void {
    this.touchControls = new TouchControls(this);

    // Desktop dev shortcut: press T to toggle touch controls visibility
    this.input.keyboard?.on('keydown-T', () => {
      this.touchControls.toggle();
    });

    this.dialogBox = new DialogBox(this);
    this.zoneBanner = new ZoneBanner(this);

    // Position UI to visible viewport
    this.repositionUI();

    // Reposition on viewport resize
    this.scale.on('resize', () => this.repositionUI());

    // Listen for NPC dialogue events from WorldScene
    eventsCenter.on(EVENTS.NPC_INTERACT, (dialogueData: DialogueData) => {
      this.dialogBox.show(dialogueData);
    });

    // Listen for sign interaction events from WorldScene
    eventsCenter.on(EVENTS.SIGN_INTERACT, (dialogueData: DialogueData) => {
      this.dialogBox.show(dialogueData);
    });

    // Listen for zone entry events
    eventsCenter.on(EVENTS.ZONE_ENTER, (zoneName: string) => {
      this.zoneBanner.show(zoneName);
    });

    // Handle dialogue advance: touch action button (when dialogue active)
    eventsCenter.on(EVENTS.TOUCH_ACTION, () => {
      if (this.dialogBox.isActive()) {
        this.dialogBox.advance();
      }
    });

    // Keyboard advance: Enter or Space
    this.input.keyboard?.on('keydown-ENTER', () => {
      if (this.dialogBox.isActive()) {
        this.dialogBox.advance();
      }
    });
    this.input.keyboard?.on('keydown-SPACE', () => {
      if (this.dialogBox.isActive()) {
        this.dialogBox.advance();
      }
    });
  }

  /**
   * Compute the visible viewport bounds in game coordinates.
   * With ENVELOP scaling, the canvas covers the viewport and edges are cropped.
   * This returns the sub-rectangle of the game that is actually visible.
   */
  private getVisibleBounds(): { x: number; y: number; width: number; height: number } {
    const parentW = this.scale.parentSize.width;
    const parentH = this.scale.parentSize.height;

    // ENVELOP uses the larger scale factor to cover the viewport
    const scaleRatio = Math.max(parentW / GAME_WIDTH, parentH / GAME_HEIGHT);
    const visibleW = parentW / scaleRatio;
    const visibleH = parentH / scaleRatio;
    const offsetX = (GAME_WIDTH - visibleW) / 2;
    const offsetY = (GAME_HEIGHT - visibleH) / 2;

    return { x: offsetX, y: offsetY, width: visibleW, height: visibleH };
  }

  private repositionUI(): void {
    const bounds = this.getVisibleBounds();
    this.dialogBox.reposition(bounds);
    this.zoneBanner.reposition(bounds);
    this.touchControls.reposition(bounds);
  }

  update(): void {
    this.touchControls.update();
  }

  shutdown(): void {
    this.dialogBox?.destroy();
    this.zoneBanner?.destroy();
    this.touchControls?.destroy();
    this.scale.off('resize');
    eventsCenter.off(EVENTS.NPC_INTERACT);
    eventsCenter.off(EVENTS.SIGN_INTERACT);
    eventsCenter.off(EVENTS.ZONE_ENTER);
  }
}
