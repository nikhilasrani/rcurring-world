import Phaser from 'phaser';
import { Direction } from 'grid-engine';
import { eventsCenter } from '../utils/EventsCenter';
import { EVENTS, ASSETS, GAME_WIDTH, GAME_HEIGHT } from '../utils/constants';

/**
 * TouchControls: Floating joystick (left half) + GBA-style A/B buttons (bottom-right).
 *
 * - Initially invisible. Controls appear on first touch or desktop T-key toggle.
 * - Joystick spawns at touch position on left half of screen.
 * - A button = interact/confirm (bottom-right).
 * - B button = cancel/run (bottom-right, to the left of A).
 * - B held while moving doubles speed via EventsCenter RUN_BUTTON events.
 * - Semi-transparent (alpha 0.5-0.7) to not obscure central gameplay.
 * - Uses rexrainbow VirtualJoystick plugin for 4-direction snap.
 */
export class TouchControls {
  private joystick: any; // rexrainbow VirtualJoystick instance
  private buttonA: Phaser.GameObjects.Image;
  private buttonB: Phaser.GameObjects.Image;
  private isVisible = false;
  private previousDirection: Direction | null = null;

  constructor(scene: Phaser.Scene) {

    // --- Floating Joystick ---
    // Initially off-screen and invisible, spawns at touch position on left half
    const joystickBase = scene.add
      .image(0, 0, ASSETS.UI_JOYSTICK_BASE)
      .setDisplaySize(64, 64)
      .setAlpha(0.5)
      .setDepth(100);
    const joystickThumb = scene.add
      .image(0, 0, ASSETS.UI_JOYSTICK_THUMB)
      .setDisplaySize(24, 24)
      .setAlpha(0.7)
      .setDepth(101);

    this.joystick = (scene.plugins.get('rexVirtualJoystick') as any).add(
      scene,
      {
        x: -100, // Off-screen initially
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

    this.joystick.base.setVisible(false);
    this.joystick.thumb.setVisible(false);

    // --- A Button (interact/confirm) ---
    this.buttonA = scene.add
      .image(GAME_WIDTH - 40, GAME_HEIGHT - 50, ASSETS.UI_BUTTON_A)
      .setDisplaySize(36, 36)
      .setAlpha(0.6)
      .setScrollFactor(0)
      .setInteractive()
      .setVisible(false)
      .setDepth(100);

    this.buttonA.on('pointerdown', () => {
      eventsCenter.emit(EVENTS.TOUCH_ACTION, true);
      this.buttonA.setAlpha(0.9);
    });
    this.buttonA.on('pointerup', () => {
      eventsCenter.emit(EVENTS.TOUCH_ACTION, false);
      this.buttonA.setAlpha(0.6);
    });
    this.buttonA.on('pointerout', () => {
      eventsCenter.emit(EVENTS.TOUCH_ACTION, false);
      this.buttonA.setAlpha(0.6);
    });

    // --- B Button (cancel/run) ---
    this.buttonB = scene.add
      .image(GAME_WIDTH - 80, GAME_HEIGHT - 30, ASSETS.UI_BUTTON_B)
      .setDisplaySize(36, 36)
      .setAlpha(0.6)
      .setScrollFactor(0)
      .setInteractive()
      .setVisible(false)
      .setDepth(100);

    this.buttonB.on('pointerdown', () => {
      eventsCenter.emit(EVENTS.RUN_BUTTON_DOWN);
      this.buttonB.setAlpha(0.9);
    });
    this.buttonB.on('pointerup', () => {
      eventsCenter.emit(EVENTS.RUN_BUTTON_UP);
      this.buttonB.setAlpha(0.6);
    });
    this.buttonB.on('pointerout', () => {
      eventsCenter.emit(EVENTS.RUN_BUTTON_UP);
      this.buttonB.setAlpha(0.6);
    });

    // --- Floating joystick: spawn at touch position on left half ---
    scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.x < GAME_WIDTH / 2) {
        this.showControls();
        this.joystick.setPosition(pointer.x, pointer.y);
        this.joystick.base.setPosition(pointer.x, pointer.y);
        this.joystick.thumb.setPosition(pointer.x, pointer.y);
      }
    });
  }

  /** Show all touch controls (joystick + buttons). Called on first touch. */
  showControls(): void {
    if (this.isVisible) return;
    this.isVisible = true;
    this.joystick.base.setVisible(true);
    this.joystick.thumb.setVisible(true);
    this.buttonA.setVisible(true);
    this.buttonB.setVisible(true);
  }

  /**
   * Poll joystick direction each frame and emit via EventsCenter.
   * Only emits when direction changes to reduce event spam.
   * Called from UIScene.update().
   */
  update(): void {
    if (!this.isVisible) return;

    const cursorKeys = this.joystick.createCursorKeys();
    let direction: Direction | null = null;

    if (cursorKeys.left.isDown) direction = Direction.LEFT;
    else if (cursorKeys.right.isDown) direction = Direction.RIGHT;
    else if (cursorKeys.up.isDown) direction = Direction.UP;
    else if (cursorKeys.down.isDown) direction = Direction.DOWN;

    // Only emit when direction changes to reduce event spam
    if (direction !== this.previousDirection) {
      eventsCenter.emit(EVENTS.TOUCH_DIRECTION, direction);
      this.previousDirection = direction;
    }
  }

  /** Toggle visibility (for desktop dev shortcut T key). */
  toggle(): void {
    if (this.isVisible) {
      this.isVisible = false;
      this.joystick.base.setVisible(false);
      this.joystick.thumb.setVisible(false);
      this.buttonA.setVisible(false);
      this.buttonB.setVisible(false);
      // Cancel any active direction when hiding
      eventsCenter.emit(EVENTS.TOUCH_DIRECTION, null);
      eventsCenter.emit(EVENTS.RUN_BUTTON_UP);
    } else {
      this.showControls();
    }
  }

  /** Clean up game objects and plugin instance. */
  destroy(): void {
    this.joystick.destroy();
    this.buttonA.destroy();
    this.buttonB.destroy();
  }
}
