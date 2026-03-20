import Phaser from 'phaser';
import type { NPCDef } from '../utils/types';

/**
 * NPC entity wrapping a Phaser sprite with Grid Engine integration.
 *
 * Follows the same animation pattern as Player.ts:
 * - Spritesheet layout: 3 cols x 4 rows of 16x24 frames
 * - Walk animations (8 FPS) + Idle animations (2 FPS)
 * - walkingAnimationMapping: 0 for Grid Engine auto walk animation
 */
export class NPC {
  public sprite: Phaser.GameObjects.Sprite;
  public def: NPCDef;
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, def: NPCDef) {
    this.scene = scene;
    this.def = def;

    // Create sprite at (0,0) -- Grid Engine manages actual position
    this.sprite = scene.add.sprite(0, 0, def.spriteKey, 1); // Frame 1 = idle facing down
    this.sprite.setDepth(2);

    // Register walk and idle animations (same pattern as Player.ts)
    this.registerAnimations(def.spriteKey);
  }

  /**
   * Register walk and idle animations with Phaser's AnimationManager.
   *
   * Spritesheet layout (3 cols x 4 rows, 16x24 frames):
   *   Row 0 (frames 0,1,2): walk-down  (left-foot, idle, right-foot)
   *   Row 1 (frames 3,4,5): walk-left
   *   Row 2 (frames 6,7,8): walk-right
   *   Row 3 (frames 9,10,11): walk-up
   */
  private registerAnimations(spriteKey: string): void {
    const anims = this.scene.anims;
    const frameRate = 8; // 8 FPS for walk cycle (GBA-appropriate)
    const idleFrameRate = 2; // Slow rate for idle breathing/looking

    // Walk animations (4 directions, 3 frames each)
    const directions = [
      { key: 'walk-down', row: 0 },
      { key: 'walk-left', row: 1 },
      { key: 'walk-right', row: 2 },
      { key: 'walk-up', row: 3 },
    ];

    for (const dir of directions) {
      const animKey = `${spriteKey}-${dir.key}`;
      if (!anims.exists(animKey)) {
        anims.create({
          key: animKey,
          frames: anims.generateFrameNumbers(spriteKey, {
            start: dir.row * 3,
            end: dir.row * 3 + 2,
          }),
          frameRate,
          repeat: -1,
        });
      }
    }

    // Idle animations (4 directions -- subtle loop using walk frames)
    const idleDirections = [
      { key: 'idle-down', frames: [1, 1, 0, 1] },
      { key: 'idle-left', frames: [4, 4, 3, 4] },
      { key: 'idle-right', frames: [7, 7, 6, 7] },
      { key: 'idle-up', frames: [10, 10, 9, 10] },
    ];

    for (const idle of idleDirections) {
      const animKey = `${spriteKey}-${idle.key}`;
      if (!anims.exists(animKey)) {
        anims.create({
          key: animKey,
          frames: idle.frames.map((f) => ({ key: spriteKey, frame: f })),
          frameRate: idleFrameRate,
          repeat: -1,
        });
      }
    }
  }

  /** Returns Grid Engine character configuration for this NPC */
  getGridEngineCharacterConfig() {
    return {
      id: this.def.id,
      sprite: this.sprite,
      walkingAnimationMapping: 0,
      startPosition: this.def.position,
      speed: this.def.speed,
      facingDirection: this.def.facing,
      offsetY: -4, // Adjust for 16x24 sprite on 16x16 grid
      collides: true,
    };
  }

  destroy(): void {
    this.sprite.destroy();
  }
}
