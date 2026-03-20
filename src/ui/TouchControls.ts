import Phaser from 'phaser';
import { Direction } from 'grid-engine';
import { eventsCenter } from '../utils/EventsCenter';
import { EVENTS, ASSETS, GAME_WIDTH, GAME_HEIGHT } from '../utils/constants';

/**
 * TouchControls: Fullscreen mobile overlay with floating joystick + A/B buttons.
 *
 * Layout (positioned relative to game canvas edges):
 * - Joystick: bottom-left corner, fixed position
 * - A button: bottom-right, primary action (interact/confirm)
 * - B button: bottom-right, offset left+up from A (run/cancel)
 *
 * Auto-shows on touch devices, hidden on desktop (toggle with T key).
 * Semi-transparent so the map is always visible underneath.
 */
export class TouchControls {
  private joystick: any; // rexrainbow VirtualJoystick instance
  private buttonA: Phaser.GameObjects.Image;
  private buttonB: Phaser.GameObjects.Image;
  private isVisible = false;
  private previousDirection: Direction | null = null;

  // Button layout constants (relative to game canvas edges)
  private static readonly JOYSTICK_X = 60;
  private static readonly JOYSTICK_Y = GAME_HEIGHT - 60;
  private static readonly BTN_A_X = GAME_WIDTH - 36;
  private static readonly BTN_A_Y = GAME_HEIGHT - 48;
  private static readonly BTN_B_X = GAME_WIDTH - 80;
  private static readonly BTN_B_Y = GAME_HEIGHT - 28;
  private static readonly BTN_SIZE = 40;
  private static readonly JOYSTICK_BASE_SIZE = 80;
  private static readonly JOYSTICK_THUMB_SIZE = 32;

  constructor(scene: Phaser.Scene) {

    // --- Fixed Joystick (bottom-left) ---
    const joystickBase = scene.add
      .image(TouchControls.JOYSTICK_X, TouchControls.JOYSTICK_Y, ASSETS.UI_JOYSTICK_BASE)
      .setDisplaySize(TouchControls.JOYSTICK_BASE_SIZE, TouchControls.JOYSTICK_BASE_SIZE)
      .setAlpha(0.4)
      .setScrollFactor(0)
      .setDepth(100);
    const joystickThumb = scene.add
      .image(TouchControls.JOYSTICK_X, TouchControls.JOYSTICK_Y, ASSETS.UI_JOYSTICK_THUMB)
      .setDisplaySize(TouchControls.JOYSTICK_THUMB_SIZE, TouchControls.JOYSTICK_THUMB_SIZE)
      .setAlpha(0.6)
      .setScrollFactor(0)
      .setDepth(101);

    this.joystick = (scene.plugins.get('rexVirtualJoystick') as any).add(
      scene,
      {
        x: TouchControls.JOYSTICK_X,
        y: TouchControls.JOYSTICK_Y,
        radius: 40,
        base: joystickBase,
        thumb: joystickThumb,
        dir: '4dir',
        forceMin: 16,
        fixed: true,
        enable: true,
      }
    );

    // --- A Button (interact/confirm) — bottom-right ---
    this.buttonA = scene.add
      .image(TouchControls.BTN_A_X, TouchControls.BTN_A_Y, ASSETS.UI_BUTTON_A)
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

    // --- B Button (cancel/run) — left+up of A ---
    this.buttonB = scene.add
      .image(TouchControls.BTN_B_X, TouchControls.BTN_B_Y, ASSETS.UI_BUTTON_B)
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

    // Auto-show on touch devices
    if (scene.sys.game.device.input.touch) {
      this.showControls();
    }

    // Start hidden — all elements invisible until shown
    this.setVisibility(this.isVisible);
  }

  /** Show all touch controls. */
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

  /**
   * Poll joystick direction each frame and emit via EventsCenter.
   * Only emits when direction changes to reduce event spam.
   */
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

  /** Toggle visibility (desktop dev shortcut T key). */
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
