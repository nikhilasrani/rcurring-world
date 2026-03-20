import Phaser from 'phaser';
import { NPC } from '../entities/NPC';
import type { NPCDef } from '../utils/types';

/**
 * NPCManager: Spawns NPCs from JSON data, manages patrol routes via Grid Engine.
 *
 * Responsibilities:
 * - Create NPC sprite entities and register them with Grid Engine
 * - Start/stop/resume random patrol movement
 * - Provide NPC data lookup by ID
 */
export class NPCManager {
  private npcs: Map<string, NPC> = new Map();
  private npcDefs: Map<string, NPCDef> = new Map();

  /** Spawn a single NPC: create entity, register with Grid Engine, start patrol */
  spawnNPC(scene: Phaser.Scene, gridEngine: any, npcDef: NPCDef): void {
    const npc = new NPC(scene, npcDef);
    this.npcs.set(npcDef.id, npc);
    this.npcDefs.set(npcDef.id, npcDef);

    gridEngine.addCharacter(npc.getGridEngineCharacterConfig());
    gridEngine.moveRandomly(npcDef.id, npcDef.patrolDelay, npcDef.patrolRadius);
  }

  /** Spawn all NPCs from an array of definitions */
  spawnAll(scene: Phaser.Scene, gridEngine: any, npcDefs: NPCDef[]): void {
    for (const def of npcDefs) {
      this.spawnNPC(scene, gridEngine, def);
    }
  }

  /** Stop patrol movement for a specific NPC */
  stopNPCPatrol(gridEngine: any, npcId: string): void {
    gridEngine.stopMovement(npcId);
  }

  /** Resume random patrol movement for a specific NPC */
  resumeNPCPatrol(gridEngine: any, npcId: string): void {
    const def = this.npcDefs.get(npcId);
    if (def) {
      gridEngine.moveRandomly(npcId, def.patrolDelay, def.patrolRadius);
    }
  }

  /** Get NPC definition data by ID */
  getNPCData(npcId: string): NPCDef | undefined {
    return this.npcDefs.get(npcId);
  }

  /** Get all spawned NPC IDs */
  getAllNPCIds(): string[] {
    return Array.from(this.npcs.keys());
  }

  /** Clean up all NPC instances */
  destroy(): void {
    for (const npc of this.npcs.values()) {
      npc.destroy();
    }
    this.npcs.clear();
    this.npcDefs.clear();
  }
}
