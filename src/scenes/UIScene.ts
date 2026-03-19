import Phaser from 'phaser';
import { TouchControls } from '../ui/TouchControls';
import { SCENES } from '../utils/constants';

/**
 * UIScene: Parallel overlay scene for touch controls.
 *
 * Runs simultaneously with WorldScene. Renders above WorldScene
 * so that touch controls (joystick, A/B buttons) are always visible.
 * Launched by WorldScene.create() via this.scene.launch(SCENES.UI).
 */
export class UIScene extends Phaser.Scene {
  private touchControls!: TouchControls;

  constructor() {
    super({ key: SCENES.UI });
  }

  create(): void {
    this.touchControls = new TouchControls(this);

    // Desktop dev shortcut: press T to toggle touch controls visibility
    this.input.keyboard?.on('keydown-T', () => {
      this.touchControls.toggle();
    });
  }

  update(): void {
    this.touchControls.update();
  }

  shutdown(): void {
    this.touchControls?.destroy();
  }
}
