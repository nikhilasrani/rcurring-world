import Phaser from 'phaser';
import { TILE_SIZE } from '../utils/constants';

/**
 * ItemPickup: World-space sparkly collectible entity.
 *
 * Renders a sprite at tile-grid position with a bob + alpha pulse animation.
 * Depth 2 (above ground, below player/NPCs).
 *
 * Used for one-time world pickups (jasmine flowers, metro token, etc.).
 * Sparkle animation: vertical bob 2px, alpha pulse 0.7->1.0, 600ms cycle.
 */
export class ItemPickup {
  public sprite: Phaser.GameObjects.Sprite;
  public pickupId: string;
  public itemId: string;
  public tilePosition: { x: number; y: number };

  constructor(
    scene: Phaser.Scene,
    pickupId: string,
    itemId: string,
    tileX: number,
    tileY: number,
    spriteKey: string,
  ) {
    this.pickupId = pickupId;
    this.itemId = itemId;
    this.tilePosition = { x: tileX, y: tileY };

    // Position sprite at center of tile
    const pixelX = tileX * TILE_SIZE + TILE_SIZE / 2;
    const pixelY = tileY * TILE_SIZE + TILE_SIZE / 2;

    this.sprite = scene.add.sprite(pixelX, pixelY, spriteKey);
    this.sprite.setDepth(2);

    // Sparkle animation: bob + alpha pulse
    scene.tweens.add({
      targets: this.sprite,
      y: this.sprite.y - 2,
      alpha: { from: 0.7, to: 1 },
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  /** Destroy the pickup sprite and stop all tweens. */
  destroy(): void {
    if (this.sprite && this.sprite.scene) {
      this.sprite.scene.tweens.killTweensOf(this.sprite);
    }
    this.sprite.destroy();
  }

  /** Check if this pickup is at the given tile position. */
  isAtPosition(tileX: number, tileY: number): boolean {
    return this.tilePosition.x === tileX && this.tilePosition.y === tileY;
  }
}
