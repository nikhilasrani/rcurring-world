import Phaser from 'phaser';
import { TouchControls } from '../ui/TouchControls';
import { DialogBox } from '../ui/DialogBox';
import { ZoneBanner } from '../ui/ZoneBanner';
import { eventsCenter } from '../utils/EventsCenter';
import { SCENES, EVENTS } from '../utils/constants';
import type { DialogueData } from '../utils/types';

/**
 * UIScene: Parallel overlay scene for touch controls, dialogue box, and zone banner.
 *
 * UI elements position relative to the actual game dimensions, which dynamically
 * match the viewport aspect ratio (set by BootScene). No cropping, no hardcoded sizes.
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

    this.input.keyboard?.on('keydown-T', () => {
      this.touchControls.toggle();
    });

    this.dialogBox = new DialogBox(this);
    this.zoneBanner = new ZoneBanner(this);

    // Position UI to current game dimensions
    this.repositionUI();

    // Reposition on viewport resize
    this.scale.on('resize', () => this.repositionUI());

    eventsCenter.on(EVENTS.NPC_INTERACT, (dialogueData: DialogueData) => {
      this.dialogBox.show(dialogueData);
    });

    eventsCenter.on(EVENTS.SIGN_INTERACT, (dialogueData: DialogueData) => {
      this.dialogBox.show(dialogueData);
    });

    eventsCenter.on(EVENTS.ZONE_ENTER, (zoneName: string) => {
      this.zoneBanner.show(zoneName);
    });

    eventsCenter.on(EVENTS.TOUCH_ACTION, () => {
      if (this.dialogBox.isActive()) {
        this.dialogBox.advance();
      }
    });

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

  private repositionUI(): void {
    const { width, height } = this.scale.gameSize;
    const bounds = { x: 0, y: 0, width, height };
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
