import Phaser from 'phaser';
import { NPC } from '../entities/NPC';
import type { NPCDef, DialogueData } from '../utils/types';
import type { QuestManager } from './QuestManager';

/** Quest dialogue variant data from NPC JSON */
interface QuestDialogueData {
  questId: string;
  questObjectiveId?: string;
  offer?: DialogueData;
  active?: DialogueData;
  complete?: DialogueData;
  done?: DialogueData;
  afterObjective?: DialogueData;
}

/** Extended NPC definition with optional quest dialogue */
interface NPCDefWithQuest extends NPCDef {
  questDialogue?: QuestDialogueData;
}

/**
 * NPCManager: Spawns NPCs from JSON data, manages patrol routes via Grid Engine.
 *
 * Responsibilities:
 * - Create NPC sprite entities and register them with Grid Engine
 * - Start/stop/resume random patrol movement
 * - Provide NPC data lookup by ID
 * - Select quest-state-appropriate dialogue when QuestManager is available
 */
export class NPCManager {
  private npcs: Map<string, NPC> = new Map();
  private npcDefs: Map<string, NPCDefWithQuest> = new Map();
  private questManager: QuestManager | null = null;

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

  /** Set quest manager reference for quest-state dialogue selection */
  setQuestManager(qm: QuestManager): void {
    this.questManager = qm;
  }

  /** Get NPC definition data by ID */
  getNPCData(npcId: string): NPCDef | undefined {
    return this.npcDefs.get(npcId);
  }

  /**
   * Get quest-state-appropriate dialogue for an NPC.
   * Falls back to regular dialogue if no quest dialogue exists or quest manager is not set.
   */
  getDialogueForNPC(npcId: string): DialogueData | undefined {
    const def = this.npcDefs.get(npcId);
    if (!def) return undefined;

    const questDialogue = def.questDialogue;

    // If no quest dialogue or no quest manager, return regular dialogue
    if (!questDialogue || !this.questManager) {
      return def.dialogue;
    }

    const questState = this.questManager.getQuestState(questDialogue.questId);

    // No quest state — quest not yet encountered, use offer if this is the quest giver
    if (!questState) {
      if (questDialogue.offer) {
        return questDialogue.offer;
      }
      return def.dialogue;
    }

    switch (questState.status) {
      case 'offered':
        // Quest was offered before but not accepted — re-offer
        return questDialogue.offer || def.dialogue;

      case 'accepted':
      case 'in-progress': {
        // Check if this NPC has a specific objective and if it's completed
        if (questDialogue.questObjectiveId) {
          const objectiveCompleted = questState.objectivesCompleted.includes(
            questDialogue.questObjectiveId,
          );
          if (objectiveCompleted) {
            return questDialogue.afterObjective || def.dialogue;
          }
        }
        return questDialogue.active || def.dialogue;
      }

      case 'complete':
        return questDialogue.complete || questDialogue.done || def.dialogue;

      default:
        return def.dialogue;
    }
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
