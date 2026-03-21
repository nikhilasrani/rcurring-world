import Phaser from 'phaser';

/**
 * ItemNotification: "Got {item name}!" slide-down popup.
 *
 * Follows ZoneBanner slide-in pattern.
 * Background: 32px tall, full viewport width, #111111 at 0.7 alpha.
 * Text: "Got {item name}!" in 12px bold monospace #FFFFFF, centered.
 * Animation: slide from y=-32 to y=8, hold 2000ms, slide to y=-32.
 * Depth 55, scrollFactor 0.
 */
export class ItemNotification {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private background: Phaser.GameObjects.Graphics;
  private notificationText: Phaser.GameObjects.Text;
  private isShowing: boolean = false;
  private visibleTop: number = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    this.background = scene.add.graphics();
    this.notificationText = scene.add.text(0, 16, '', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#FFFFFF',
      fontStyle: 'bold',
    });
    this.notificationText.setOrigin(0.5, 0.5);

    this.container = scene.add.container(0, -32, [
      this.background,
      this.notificationText,
    ]);
    this.container.setDepth(55);
    this.container.setVisible(false);
    this.container.setScrollFactor(0);
  }

  /** Show notification with "Got {itemName}!" text. */
  show(itemName: string): void {
    if (this.isShowing) return;

    this.isShowing = true;
    this.notificationText.setText(`Got ${itemName}!`);
    this.container.setVisible(true);
    this.container.y = this.visibleTop - 32;

    this.scene.tweens.add({
      targets: this.container,
      y: this.visibleTop + 8,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        this.scene.time.delayedCall(2000, () => {
          this.scene.tweens.add({
            targets: this.container,
            y: this.visibleTop - 32,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
              this.container.setVisible(false);
              this.isShowing = false;
            },
          });
        });
      },
    });
  }

  /** Reposition relative to viewport bounds. */
  reposition(bounds: { x: number; y: number; width: number; height: number }): void {
    this.visibleTop = bounds.y;

    this.background.clear();
    this.background.fillStyle(0x111111, 0.7);
    this.background.fillRect(0, 0, bounds.width, 32);

    this.notificationText.setPosition(bounds.width / 2, 16);
    this.container.x = bounds.x;
  }

  destroy(): void {
    this.scene.tweens.killTweensOf(this.container);
    this.container.destroy();
  }
}
