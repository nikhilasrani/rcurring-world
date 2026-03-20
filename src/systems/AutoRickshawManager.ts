import Phaser from 'phaser';
import { Direction } from 'grid-engine';
import type { DialogueData } from '../utils/types';

/**
 * Route definition for an auto-rickshaw.
 * Autos move back and forth along a straight road segment.
 */
interface AutoRoute {
  id: string;
  /** Starting tile position */
  start: { x: number; y: number };
  /** Primary movement axis */
  axis: 'horizontal' | 'vertical';
  /** Min tile coordinate on the movement axis */
  min: number;
  /** Max tile coordinate on the movement axis */
  max: number;
  /** Movement speed (tiles per second) */
  speed: number;
  /** Initial direction */
  initialDirection: Direction;
  /** Driver name shown in dialogue */
  driverName: string;
  /** Dialogue lines when player interacts */
  dialogue: DialogueData;
}

interface AutoState {
  route: AutoRoute;
  currentDirection: Direction;
  sprite: Phaser.GameObjects.Sprite;
  stopped: boolean;
}

const SPRITE_KEY = 'auto-rickshaw';

/**
 * AutoRickshawManager: Spawns auto-rickshaws that drive along roads.
 *
 * Autos are registered as Grid Engine characters with collision enabled.
 * Standing in front of an auto blocks it. Pressing action triggers dialogue.
 */
export class AutoRickshawManager {
  private autos: Map<string, AutoState> = new Map();
  private scene: Phaser.Scene;
  private gridEngine: any;

  constructor(scene: Phaser.Scene, gridEngine: any) {
    this.scene = scene;
    this.gridEngine = gridEngine;
  }

  /** Define and spawn all auto-rickshaw routes */
  spawnAll(): void {
    const routes: AutoRoute[] = [
      {
        id: 'auto-mg-road-1',
        start: { x: 5, y: 30 },
        axis: 'horizontal',
        min: 3,
        max: 55,
        speed: 4,
        initialDirection: Direction.RIGHT,
        driverName: 'Raju',
        dialogue: {
          name: 'Raju',
          pages: [
            'Saar, where to? Majestic, Koramangala, anywhere!',
            'Meter? What meter saar... fixed rate only.',
          ],
        },
      },
      {
        id: 'auto-mg-road-2',
        start: { x: 50, y: 31 },
        axis: 'horizontal',
        min: 3,
        max: 55,
        speed: 3,
        initialDirection: Direction.LEFT,
        driverName: 'Venkatesh',
        dialogue: {
          name: 'Venkatesh',
          pages: [
            'MG Road traffic is always like this only.',
            'You want to go Indiranagar? 200 rupees, last price.',
          ],
        },
      },
      {
        id: 'auto-kasturba-1',
        start: { x: 20, y: 10 },
        axis: 'vertical',
        min: 3,
        max: 55,
        speed: 3,
        initialDirection: Direction.DOWN,
        driverName: 'Suresh',
        dialogue: {
          name: 'Suresh',
          pages: [
            'Kasturba Road... full jam every evening.',
            'I have been driving auto for 15 years in this area.',
          ],
        },
      },
      {
        id: 'auto-stmarks-1',
        start: { x: 36, y: 45 },
        axis: 'vertical',
        min: 3,
        max: 55,
        speed: 4,
        initialDirection: Direction.UP,
        driverName: 'Manjunath',
        dialogue: {
          name: 'Manjunath',
          pages: [
            'Namaskara! St. Marks Road is very nice area.',
            'You want chai? Best chai-walla is near Cubbon Park.',
          ],
        },
      },
      {
        id: 'auto-metro-road-1',
        start: { x: 45, y: 40 },
        axis: 'vertical',
        min: 35,
        max: 55,
        speed: 3,
        initialDirection: Direction.DOWN,
        driverName: 'Prasad',
        dialogue: {
          name: 'Prasad',
          pages: [
            'Metro station is just there only, why you need auto?',
            'Okay okay, I will take you. Sit sit.',
          ],
        },
      },
    ];

    for (const route of routes) {
      this.spawnAuto(route);
    }
  }

  private spawnAuto(route: AutoRoute): void {
    const sprite = this.scene.add.sprite(0, 0, SPRITE_KEY, 1);
    sprite.setDepth(2);

    this.registerAnimations();

    this.gridEngine.addCharacter({
      id: route.id,
      sprite,
      walkingAnimationMapping: 0,
      startPosition: route.start,
      speed: route.speed,
      collides: true,
    });

    this.autos.set(route.id, {
      route,
      currentDirection: route.initialDirection,
      sprite,
      stopped: false,
    });
  }

  private animsRegistered = false;
  private registerAnimations(): void {
    if (this.animsRegistered) return;
    this.animsRegistered = true;

    const anims = this.scene.anims;
    const frameRate = 8;

    const directions = [
      { key: 'walk-down', row: 0 },
      { key: 'walk-left', row: 1 },
      { key: 'walk-right', row: 2 },
      { key: 'walk-up', row: 3 },
    ];

    for (const dir of directions) {
      const animKey = `${SPRITE_KEY}-${dir.key}`;
      if (!anims.exists(animKey)) {
        anims.create({
          key: animKey,
          frames: anims.generateFrameNumbers(SPRITE_KEY, {
            start: dir.row * 3,
            end: dir.row * 3 + 2,
          }),
          frameRate,
          repeat: -1,
        });
      }
    }
  }

  /** Check if a character ID belongs to an auto-rickshaw */
  isAuto(charId: string): boolean {
    return this.autos.has(charId);
  }

  /** Get dialogue data for an auto-rickshaw */
  getDialogue(autoId: string): DialogueData | undefined {
    return this.autos.get(autoId)?.route.dialogue;
  }

  /** Stop an auto (e.g. during dialogue) */
  stopAuto(autoId: string): void {
    const state = this.autos.get(autoId);
    if (state) {
      state.stopped = true;
      this.gridEngine.stopMovement(autoId);
    }
  }

  /** Resume an auto after dialogue ends */
  resumeAuto(autoId: string): void {
    const state = this.autos.get(autoId);
    if (state) {
      state.stopped = false;
    }
  }

  /**
   * Called every frame from WorldScene.update().
   * Keeps autos moving and reverses direction at route boundaries.
   */
  update(): void {
    for (const [autoId, state] of this.autos) {
      if (state.stopped) continue;

      const pos = this.gridEngine.getPosition(autoId);
      const coord = state.route.axis === 'horizontal' ? pos.x : pos.y;

      if (state.route.axis === 'horizontal') {
        if (coord >= state.route.max && state.currentDirection === Direction.RIGHT) {
          state.currentDirection = Direction.LEFT;
        } else if (coord <= state.route.min && state.currentDirection === Direction.LEFT) {
          state.currentDirection = Direction.RIGHT;
        }
      } else {
        if (coord >= state.route.max && state.currentDirection === Direction.DOWN) {
          state.currentDirection = Direction.UP;
        } else if (coord <= state.route.min && state.currentDirection === Direction.UP) {
          state.currentDirection = Direction.DOWN;
        }
      }

      if (!this.gridEngine.isMoving(autoId)) {
        this.gridEngine.move(autoId, state.currentDirection);
      }
    }
  }

  destroy(): void {
    for (const state of this.autos.values()) {
      state.sprite.destroy();
    }
    this.autos.clear();
  }
}
