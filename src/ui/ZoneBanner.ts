import Phaser from 'phaser';

/**
 * ZoneBanner: Dark Souls-style area name display.
 *
 * Slides in from the top of the visible viewport when the player enters a new zone,
 * holds for 2 seconds, then slides back out. Purely visual and non-blocking.
 */
export class ZoneBanner {
  private container: Phaser.GameObjects.Container;
  private background: Phaser.GameObjects.Graphics;
  private bannerText: Phaser.GameObjects.Text;
  private scene: Phaser.Scene;
  private isShowing = false;
  private visibleTop = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    this.background = scene.add.graphics();
    this.bannerText = scene.add.text(0, 16, '', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    this.bannerText.setOrigin(0.5, 0.5);

    this.container = scene.add.container(0, -32, [
      this.background,
      this.bannerText,
    ]);
    this.container.setDepth(50);
    this.container.setVisible(false);
    this.container.setScrollFactor(0);
  }

  /**
   * Reposition relative to visible viewport bounds.
   */
  reposition(bounds: { x: number; y: number; width: number; height: number }): void {
    this.visibleTop = bounds.y;

    this.background.clear();
    this.background.fillStyle(0x111111, 0.7);
    this.background.fillRect(0, 0, bounds.width, 32);

    this.bannerText.setPosition(bounds.width / 2, 16);
    this.container.x = bounds.x;
  }

  show(zoneName: string): void {
    if (this.isShowing) return;

    this.isShowing = true;
    this.bannerText.setText(zoneName);
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

  destroy(): void {
    this.scene.tweens.killTweensOf(this.container);
    this.container.destroy();
  }
}
