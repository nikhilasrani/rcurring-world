import type { QuestState } from '../utils/types';

/**
 * Pure-logic quest state machine. No Phaser imports.
 * Tracks quest lifecycle: offered -> accepted -> in-progress -> complete.
 * Enforces one-active-quest-at-a-time constraint.
 */
export class QuestManager {
  private quests: Map<string, QuestState> = new Map();
  private activeQuestId: string | null = null;
  private onStateChange?: (questId: string, state: QuestState) => void;

  constructor(onStateChange?: (questId: string, state: QuestState) => void) {
    this.onStateChange = onStateChange;
  }

  hasActiveQuest(): boolean {
    return this.activeQuestId !== null;
  }

  getActiveQuestId(): string | null {
    return this.activeQuestId;
  }

  getQuestState(questId: string): QuestState | undefined {
    return this.quests.get(questId);
  }

  /** Creates a quest entry with status 'offered'. Idempotent -- does not overwrite existing quests. */
  offerQuest(questId: string, totalObjectives: number): void {
    if (this.quests.has(questId)) return;

    const state: QuestState = {
      id: questId,
      status: 'offered',
      objectivesCompleted: [],
      objectivesTotal: totalObjectives,
    };
    this.quests.set(questId, state);
    this.onStateChange?.(questId, state);
  }

  /** Accepts a quest. Returns false if another quest is active, quest not found, or quest already complete. */
  acceptQuest(questId: string): boolean {
    const quest = this.quests.get(questId);
    if (!quest) return false;
    if (quest.status === 'complete') return false;
    if (this.activeQuestId !== null) return false;

    quest.status = 'accepted';
    this.activeQuestId = questId;
    this.onStateChange?.(questId, quest);
    return true;
  }

  /** Declines a quest -- keeps it in 'offered' status so it can be re-offered. */
  declineQuest(questId: string): void {
    // No-op: quest stays in 'offered' status. Intent is logged but status unchanged.
    const quest = this.quests.get(questId);
    if (quest) {
      this.onStateChange?.(questId, quest);
    }
  }

  /** Completes an objective. Transitions to 'in-progress', then 'complete' when all done. */
  completeObjective(questId: string, objectiveId: string): boolean {
    const quest = this.quests.get(questId);
    if (!quest) return false;
    if (quest.status === 'complete' || quest.status === 'offered' || quest.status === 'not-started') return false;
    if (quest.objectivesCompleted.includes(objectiveId)) return false;

    quest.objectivesCompleted.push(objectiveId);

    if (quest.objectivesCompleted.length >= quest.objectivesTotal) {
      quest.status = 'complete';
      if (this.activeQuestId === questId) {
        this.activeQuestId = null;
      }
    } else {
      quest.status = 'in-progress';
    }

    this.onStateChange?.(questId, quest);
    return true;
  }

  /** Returns progress counts for a quest, or null if quest not found. */
  getProgress(questId: string): { completed: number; total: number } | null {
    const quest = this.quests.get(questId);
    if (!quest) return null;
    return { completed: quest.objectivesCompleted.length, total: quest.objectivesTotal };
  }

  /** Restores quest state from a save file. */
  loadState(questStates: Record<string, QuestState>): void {
    this.quests.clear();
    this.activeQuestId = null;

    for (const [id, state] of Object.entries(questStates)) {
      this.quests.set(id, { ...state });
      // Restore activeQuestId from accepted/in-progress quest
      if (state.status === 'accepted' || state.status === 'in-progress') {
        this.activeQuestId = id;
      }
    }
  }

  /** Returns a snapshot of all quest states for saving. */
  getState(): Record<string, QuestState> {
    const result: Record<string, QuestState> = {};
    for (const [id, state] of this.quests.entries()) {
      result[id] = { ...state, objectivesCompleted: [...state.objectivesCompleted] };
    }
    return result;
  }
}
