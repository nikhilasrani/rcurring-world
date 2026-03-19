import { Direction } from 'grid-engine';

export interface PlayerState {
  name: string;
  gender: 'male' | 'female';
  position: { x: number; y: number };
  facing: Direction;
  isRunning: boolean;
}

export interface ZoneConfig {
  id: string;
  name: string;
  displayName: string;
  tilemapKey: string;
  tilesetKeys: string[];
  playerSpawn: { x: number; y: number };
  landmarks: LandmarkDef[];
}

export interface LandmarkDef {
  id: string;
  name: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

export interface TouchInputState {
  direction: Direction | null;
  actionPressed: boolean;
  cancelPressed: boolean;
}
