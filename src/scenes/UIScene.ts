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
 * Runs simultaneously with WorldScene. Renders above WorldScene
 * so that touch controls (joystick, A/B buttons), dialogue, and banners
 * are always visible. Launched by WorldScene.create() via this.scene.launch(SCENES.UI).
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

    // --- Dialogue Box ---
    this.dialogBox = new DialogBox(this);

    // --- Zone Banner ---
    this.zoneBanner = new ZoneBanner(this);

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

  update(): void {
    this.touchControls.update();
  }

  shutdown(): void {
    this.dialogBox?.destroy();
    this.zoneBanner?.destroy();
    this.touchControls?.destroy();
    eventsCenter.off(EVENTS.NPC_INTERACT);
    eventsCenter.off(EVENTS.SIGN_INTERACT);
    eventsCenter.off(EVENTS.ZONE_ENTER);
  }
}
