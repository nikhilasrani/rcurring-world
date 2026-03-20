import Phaser from 'phaser';
import { Direction } from 'grid-engine';
import {
  WALK_SPEED,
  RUN_SPEED,
  ASSETS,
} from '../utils/constants';
import type { PlayerState } from '../utils/types';

export class Player {
  public sprite: Phaser.GameObjects.Sprite;
  public state: PlayerState;
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, state: PlayerState) {
    this.scene = scene;
    this.state = state;

    // Create sprite at pixel position (Grid Engine will manage actual position)
    const spriteKey =
      state.gender === 'male'
        ? ASSETS.SPRITE_PLAYER_MALE
        : ASSETS.SPRITE_PLAYER_FEMALE;
    this.sprite = scene.add.sprite(0, 0, spriteKey, 1); // Frame 1 = idle facing down

    // Sprite depth: between buildings layer and above-player layer
    this.sprite.setDepth(2);

    // Register all walk and idle animations with Phaser AnimationManager
    this.registerAnimations(spriteKey);
  }

  /**
   * Register walk and idle animations with Phaser's AnimationManager.
   * Grid Engine's walkingAnimationMapping:0 expects pre-registered Phaser anims
   * OR it can auto-play from spritesheet rows. However, idle animations require
   * explicit registration since Grid Engine only handles walk animations.
   *
   * Spritesheet layout (3 cols x 4 rows, 16x16 frames):
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

    // Idle animations (4 directions -- subtle loop using walk frame 0 and 1)
    // Per CONTEXT.md: "Idle animation: subtle loop (breathing, looking around) when standing still."
    // Use the stand frame (middle) with a slow oscillation to the first walk frame
    // to simulate breathing/weight-shifting.
    const idleDirections = [
      { key: 'idle-down', frames: [1, 1, 0, 1] }, // stand, stand, shift, stand
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

  /**
   * Play the idle animation for the given facing direction.
   * Called from WorldScene.update() when gridEngine.isMoving('player') is false.
   */
  playIdleAnimation(facing: Direction): void {
    const spriteKey =
      this.state.gender === 'male'
        ? ASSETS.SPRITE_PLAYER_MALE
        : ASSETS.SPRITE_PLAYER_FEMALE;
    const dirMap: Record<string, string> = {
      [Direction.DOWN]: 'idle-down',
      [Direction.LEFT]: 'idle-left',
      [Direction.RIGHT]: 'idle-right',
      [Direction.UP]: 'idle-up',
    };
    const animKey = `${spriteKey}-${dirMap[facing] || 'idle-down'}`;
    if (this.sprite.anims.currentAnim?.key !== animKey) {
      this.sprite.anims.play(animKey, true);
    }
  }

  /** Returns the Grid Engine character config for this player */
  getGridEngineCharacterConfig() {
    return {
      id: 'player',
      sprite: this.sprite,
      walkingAnimationMapping: 0,
      startPosition: { x: this.state.position.x, y: this.state.position.y },
      speed: WALK_SPEED,
      facingDirection: this.state.facing,
      offsetY: 0, // 16x16 sprite fits exactly on 16x16 grid
    };
  }

  /** Call in WorldScene.update() -- handles speed toggle */
  updateSpeed(isRunning: boolean): number {
    const speed = isRunning ? RUN_SPEED : WALK_SPEED;
    this.state.isRunning = isRunning;
    return speed;
  }

  destroy(): void {
    this.sprite.destroy();
  }
}

/** Pure function for unit testing: calculate speed based on run state */
export function getPlayerSpeed(isRunning: boolean): number {
  return isRunning ? RUN_SPEED : WALK_SPEED;
}

/** Pure function for unit testing: determine movement direction from input */
export function getMovementDirection(cursors: {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
}): Direction | null {
  if (cursors.left) return Direction.LEFT;
  if (cursors.right) return Direction.RIGHT;
  if (cursors.up) return Direction.UP;
  if (cursors.down) return Direction.DOWN;
  return null;
}
