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

/** NPC definition loaded from JSON data files */
export interface NPCDef {
  id: string;
  name: string;
  spriteKey: string;
  position: { x: number; y: number };
  facing: Direction;
  patrolRadius: number;
  patrolDelay: number;
  speed: number;
  dialogue: DialogueData;
}

/** Dialogue data for NPCs and signs */
export interface DialogueData {
  name?: string;      // NPC name shown in dialogue box (omit for signs)
  pages: string[];    // Each string is one page of text (2 lines per page)
}

/** Sign definition for interactable signs/plaques */
export interface SignDef {
  id: string;
  type: 'road-sign' | 'notice-board' | 'shop-front' | 'landmark-plaque';
  position: { x: number; y: number };
  dialogue: DialogueData;
}

/** Interior building metadata */
export interface InteriorDef {
  id: string;
  name: string;
  displayName: string;
  tilemapKey: string;
  tilesetKey: string;
  doorPosition: { x: number; y: number };      // outdoor tile where door is
  playerSpawn: { x: number; y: number };        // where player appears inside
  exitPosition: { x: number; y: number };       // interior tile for exit door
  returnPosition: { x: number; y: number };     // outdoor tile to return to
  size: { width: number; height: number };       // interior tilemap size in tiles
}

/** Target found by interaction system */
export interface InteractionTarget {
  type: 'npc' | 'sign' | 'door';
  id: string;
  position: { x: number; y: number };
}

/** Game state tracking for zone discovery */
export interface DiscoveryState {
  discoveredZones: string[];
  discoveredLandmarks: string[];
  currentZone: string | null;
  currentInterior: string | null;
}
