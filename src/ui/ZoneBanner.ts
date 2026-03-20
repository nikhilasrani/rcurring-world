import Phaser from 'phaser';
import { GAME_WIDTH } from '../utils/constants';

/**
 * ZoneBanner: Dark Souls-style area name display.
 *
 * Slides in from the top of the screen when the player enters a new zone,
 * holds for 2 seconds, then slides back out. Purely visual and non-blocking --
 * the player can keep moving while the banner is displayed.
 */
export class ZoneBanner {
  private container: Phaser.GameObjects.Container;
  private background: Phaser.GameObjects.Graphics;
  private bannerText: Phaser.GameObjects.Text;
  private scene: Phaser.Scene;
  private isShowing = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    // Background: full-width dark semi-transparent bar
    this.background = scene.add.graphics();
    this.background.fillStyle(0x111111, 0.7);
    this.background.fillRect(0, 0, GAME_WIDTH, 32);

    // Text: centered bold monospace
    this.bannerText = scene.add.text(GAME_WIDTH / 2, 16, '', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    this.bannerText.setOrigin(0.5, 0.5);

    // Container holds both elements, positioned off-screen above
    this.container = scene.add.container(0, -32, [
      this.background,
      this.bannerText,
    ]);
    this.container.setDepth(50);
    this.container.setVisible(false);
    this.container.setScrollFactor(0);
  }

  /**
   * Show the zone banner with a slide-in animation.
   * If a banner is already showing, the call is ignored (no stacking).
   */
  show(zoneName: string): void {
    if (this.isShowing) return;

    this.isShowing = true;
    this.bannerText.setText(zoneName);
    this.container.setVisible(true);
    this.container.y = -32;

    // Slide in from top
    this.scene.tweens.add({
      targets: this.container,
      y: 8,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        // Hold for 2 seconds, then slide out
        this.scene.time.delayedCall(2000, () => {
          this.scene.tweens.add({
            targets: this.container,
            y: -32,
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

  /**
   * Clean up all tweens and game objects.
   */
  destroy(): void {
    this.scene.tweens.killTweensOf(this.container);
    this.container.destroy();
  }
}
