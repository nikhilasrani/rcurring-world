import Phaser from 'phaser';
import { TILE_SIZE } from '../utils/constants';

/**
 * InteractionPrompt: Floating "A" button icon above interactable targets.
 *
 * Rendered in WorldScene (scrolls with the world).
 * Shows a small "A" label centered above the target tile with a vertical bob animation.
 *
 * Style: 8px monospace white text on #333333 background, depth 10.
 * Animation: 2px vertical bob, 800ms Sine yoyo loop (400ms each direction).
 */
export class InteractionPrompt {
  private icon: Phaser.GameObjects.Text;
  private bobTween: Phaser.Tweens.Tween | null = null;
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    this.icon = scene.add.text(0, 0, 'A', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 2, y: 1 },
    });
    this.icon.setDepth(10);
    this.icon.setVisible(false);
  }

  /** Show prompt icon above the given tile coordinates */
  showAt(tileX: number, tileY: number): void {
    // Stop any existing bob tween
    if (this.bobTween) {
      this.bobTween.stop();
      this.bobTween = null;
    }

    const baseX = tileX * TILE_SIZE + 4; // Center offset within 16px tile
    const baseY = tileY * TILE_SIZE - 10; // Above the tile

    this.icon.setPosition(baseX, baseY);
    this.icon.setVisible(true);

    // Start bob tween: 2px vertical oscillation
    this.bobTween = this.scene.tweens.add({
      targets: this.icon,
      y: baseY - 2,
      duration: 400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  /** Hide the prompt icon and stop bob animation */
  hide(): void {
    this.icon.setVisible(false);
    if (this.bobTween) {
      this.bobTween.stop();
      this.bobTween = null;
    }
  }

  /** Clean up game objects and tween */
  destroy(): void {
    if (this.bobTween) {
      this.bobTween.stop();
      this.bobTween = null;
    }
    this.icon.destroy();
  }
}
