import Phaser from 'phaser';
import { Direction } from 'grid-engine';
import { eventsCenter } from '../utils/EventsCenter';
import { EVENTS, ASSETS } from '../utils/constants';

/**
 * TouchControls: Fullscreen mobile overlay with floating joystick + A/B buttons.
 *
 * Layout adapts to the visible viewport (accounts for ENVELOP cropping):
 * - Joystick: bottom-left of visible area
 * - A button: bottom-right of visible area (interact/confirm)
 * - B button: offset left+up from A (run/cancel)
 *
 * Auto-shows on touch devices, hidden on desktop (toggle with T key).
 */
export class TouchControls {
  private joystick: any;
  private buttonA: Phaser.GameObjects.Image;
  private buttonB: Phaser.GameObjects.Image;
  private isVisible = false;
  private previousDirection: Direction | null = null;

  private static readonly BTN_SIZE = 40;
  private static readonly JOYSTICK_BASE_SIZE = 80;
  private static readonly JOYSTICK_THUMB_SIZE = 32;

  constructor(scene: Phaser.Scene) {
    const joystickBase = scene.add
      .image(0, 0, ASSETS.UI_JOYSTICK_BASE)
      .setDisplaySize(TouchControls.JOYSTICK_BASE_SIZE, TouchControls.JOYSTICK_BASE_SIZE)
      .setAlpha(0.4)
      .setScrollFactor(0)
      .setDepth(100);
    const joystickThumb = scene.add
      .image(0, 0, ASSETS.UI_JOYSTICK_THUMB)
      .setDisplaySize(TouchControls.JOYSTICK_THUMB_SIZE, TouchControls.JOYSTICK_THUMB_SIZE)
      .setAlpha(0.6)
      .setScrollFactor(0)
      .setDepth(101);

    this.joystick = (scene.plugins.get('rexVirtualJoystick') as any).add(
      scene,
      {
        x: -100,
        y: -100,
        radius: 40,
        base: joystickBase,
        thumb: joystickThumb,
        dir: '4dir',
        forceMin: 16,
        fixed: true,
        enable: true,
      }
    );

    this.buttonA = scene.add
      .image(0, 0, ASSETS.UI_BUTTON_A)
      .setDisplaySize(TouchControls.BTN_SIZE, TouchControls.BTN_SIZE)
      .setAlpha(0.5)
      .setScrollFactor(0)
      .setInteractive()
      .setDepth(100);

    this.buttonA.on('pointerdown', () => {
      eventsCenter.emit(EVENTS.TOUCH_ACTION, true);
      this.buttonA.setAlpha(0.9);
    });
    this.buttonA.on('pointerup', () => {
      eventsCenter.emit(EVENTS.TOUCH_ACTION, false);
      this.buttonA.setAlpha(0.5);
    });
    this.buttonA.on('pointerout', () => {
      eventsCenter.emit(EVENTS.TOUCH_ACTION, false);
      this.buttonA.setAlpha(0.5);
    });

    this.buttonB = scene.add
      .image(0, 0, ASSETS.UI_BUTTON_B)
      .setDisplaySize(TouchControls.BTN_SIZE, TouchControls.BTN_SIZE)
      .setAlpha(0.5)
      .setScrollFactor(0)
      .setInteractive()
      .setDepth(100);

    this.buttonB.on('pointerdown', () => {
      eventsCenter.emit(EVENTS.RUN_BUTTON_DOWN);
      this.buttonB.setAlpha(0.9);
    });
    this.buttonB.on('pointerup', () => {
      eventsCenter.emit(EVENTS.RUN_BUTTON_UP);
      this.buttonB.setAlpha(0.5);
    });
    this.buttonB.on('pointerout', () => {
      eventsCenter.emit(EVENTS.RUN_BUTTON_UP);
      this.buttonB.setAlpha(0.5);
    });

    if (scene.sys.game.device.input.touch) {
      this.showControls();
    }

    this.setVisibility(this.isVisible);
  }

  /**
   * Reposition controls relative to the visible viewport bounds.
   */
  reposition(bounds: { x: number; y: number; width: number; height: number }): void {
    const jx = bounds.x + 60;
    const jy = bounds.y + bounds.height - 60;
    this.joystick.setPosition(jx, jy);
    this.joystick.base.setPosition(jx, jy);
    this.joystick.thumb.setPosition(jx, jy);

    this.buttonA.setPosition(bounds.x + bounds.width - 36, bounds.y + bounds.height - 48);
    this.buttonB.setPosition(bounds.x + bounds.width - 80, bounds.y + bounds.height - 28);
  }

  showControls(): void {
    if (this.isVisible) return;
    this.isVisible = true;
    this.setVisibility(true);
  }

  private setVisibility(visible: boolean): void {
    this.joystick.base.setVisible(visible);
    this.joystick.thumb.setVisible(visible);
    this.buttonA.setVisible(visible);
    this.buttonB.setVisible(visible);
  }

  update(): void {
    if (!this.isVisible) return;

    const cursorKeys = this.joystick.createCursorKeys();
    let direction: Direction | null = null;

    if (cursorKeys.left.isDown) direction = Direction.LEFT;
    else if (cursorKeys.right.isDown) direction = Direction.RIGHT;
    else if (cursorKeys.up.isDown) direction = Direction.UP;
    else if (cursorKeys.down.isDown) direction = Direction.DOWN;

    if (direction !== this.previousDirection) {
      eventsCenter.emit(EVENTS.TOUCH_DIRECTION, direction);
      this.previousDirection = direction;
    }
  }

  toggle(): void {
    if (this.isVisible) {
      this.isVisible = false;
      this.setVisibility(false);
      eventsCenter.emit(EVENTS.TOUCH_DIRECTION, null);
      eventsCenter.emit(EVENTS.RUN_BUTTON_UP);
    } else {
      this.showControls();
    }
  }

  destroy(): void {
    this.joystick.destroy();
    this.buttonA.destroy();
    this.buttonB.destroy();
  }
}
