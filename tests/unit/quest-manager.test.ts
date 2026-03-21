import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QuestManager } from '../../src/systems/QuestManager';
import type { QuestState } from '../../src/utils/types';

describe('QuestManager', () => {
  let qm: QuestManager;
  let onStateChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onStateChange = vi.fn();
    qm = new QuestManager(onStateChange);
  });

  it('offerQuest creates entry with offered status', () => {
    qm.offerQuest('coffee-quest', 3);

    const state = qm.getQuestState('coffee-quest');
    expect(state).toBeDefined();
    expect(state!.status).toBe('offered');
    expect(state!.objectivesTotal).toBe(3);
    expect(state!.objectivesCompleted).toEqual([]);
  });

  it('offerQuest is idempotent - does not overwrite existing quest', () => {
    qm.offerQuest('coffee-quest', 3);
    qm.acceptQuest('coffee-quest');
    qm.offerQuest('coffee-quest', 3); // re-offer should not reset

    const state = qm.getQuestState('coffee-quest');
    expect(state!.status).toBe('accepted');
  });

  it('acceptQuest succeeds when no active quest', () => {
    qm.offerQuest('coffee-quest', 2);
    const result = qm.acceptQuest('coffee-quest');

    expect(result).toBe(true);
    expect(qm.getQuestState('coffee-quest')!.status).toBe('accepted');
    expect(qm.getActiveQuestId()).toBe('coffee-quest');
    expect(qm.hasActiveQuest()).toBe(true);
  });

  it('acceptQuest fails when another quest is active', () => {
    qm.offerQuest('coffee-quest', 2);
    qm.offerQuest('metro-quest', 1);
    qm.acceptQuest('coffee-quest');

    const result = qm.acceptQuest('metro-quest');
    expect(result).toBe(false);
    expect(qm.getActiveQuestId()).toBe('coffee-quest');
  });

  it('acceptQuest returns false for non-existent quest', () => {
    expect(qm.acceptQuest('nope')).toBe(false);
  });

  it('acceptQuest returns false for completed quest', () => {
    qm.offerQuest('q', 1);
    qm.acceptQuest('q');
    qm.completeObjective('q', 'obj-1');
    // quest is now complete
    expect(qm.acceptQuest('q')).toBe(false);
  });

  it('completeObjective transitions to in-progress', () => {
    qm.offerQuest('coffee-quest', 3);
    qm.acceptQuest('coffee-quest');

    qm.completeObjective('coffee-quest', 'obj-1');
    expect(qm.getQuestState('coffee-quest')!.status).toBe('in-progress');
    expect(qm.getQuestState('coffee-quest')!.objectivesCompleted).toContain('obj-1');
  });

  it('completeObjective on final objective sets complete and clears activeQuestId', () => {
    qm.offerQuest('coffee-quest', 2);
    qm.acceptQuest('coffee-quest');

    qm.completeObjective('coffee-quest', 'obj-1');
    qm.completeObjective('coffee-quest', 'obj-2');

    expect(qm.getQuestState('coffee-quest')!.status).toBe('complete');
    expect(qm.getActiveQuestId()).toBeNull();
    expect(qm.hasActiveQuest()).toBe(false);
  });

  it('getProgress returns correct counts', () => {
    qm.offerQuest('coffee-quest', 3);
    qm.acceptQuest('coffee-quest');
    qm.completeObjective('coffee-quest', 'obj-1');

    const progress = qm.getProgress('coffee-quest');
    expect(progress).toEqual({ completed: 1, total: 3 });
  });

  it('getProgress returns null for unknown quest', () => {
    expect(qm.getProgress('nope')).toBeNull();
  });

  it('loadState/getState round-trip preserves quest data', () => {
    qm.offerQuest('coffee-quest', 2);
    qm.acceptQuest('coffee-quest');
    qm.completeObjective('coffee-quest', 'obj-1');

    const snapshot = qm.getState();

    const qm2 = new QuestManager();
    qm2.loadState(snapshot);

    expect(qm2.getQuestState('coffee-quest')!.status).toBe('in-progress');
    expect(qm2.getQuestState('coffee-quest')!.objectivesCompleted).toContain('obj-1');
    expect(qm2.getActiveQuestId()).toBe('coffee-quest');
  });

  it('declineQuest keeps status as offered (re-offerable)', () => {
    qm.offerQuest('coffee-quest', 2);
    qm.declineQuest('coffee-quest');

    expect(qm.getQuestState('coffee-quest')!.status).toBe('offered');
  });

  it('calls onStateChange callback on mutations', () => {
    qm.offerQuest('coffee-quest', 2);
    expect(onStateChange).toHaveBeenCalledWith('coffee-quest', expect.objectContaining({ status: 'offered' }));

    onStateChange.mockClear();
    qm.acceptQuest('coffee-quest');
    expect(onStateChange).toHaveBeenCalledWith('coffee-quest', expect.objectContaining({ status: 'accepted' }));
  });
});
