import type { GameState } from '../utils/types';

/**
 * Pure-logic save/load manager. No Phaser imports.
 * Serializes GameState to/from localStorage.
 */
export class SaveManager {
  private static readonly SAVE_KEY = 'rcurring-world-save';
  private static readonly CURRENT_VERSION = 1;

  /** Saves game state to localStorage. Returns false on error (e.g. QuotaExceeded). */
  save(state: GameState): boolean {
    try {
      const data = JSON.stringify(state);
      localStorage.setItem(SaveManager.SAVE_KEY, data);
      return true;
    } catch {
      return false;
    }
  }

  /** Loads game state from localStorage. Returns null if missing or corrupt. */
  load(): GameState | null {
    try {
      const raw = localStorage.getItem(SaveManager.SAVE_KEY);
      if (raw === null) return null;
      const data = JSON.parse(raw) as GameState;
      return this.migrate(data);
    } catch {
      return null;
    }
  }

  /** Returns true if a save exists in localStorage. */
  hasSave(): boolean {
    return localStorage.getItem(SaveManager.SAVE_KEY) !== null;
  }

  /** Deletes the save from localStorage. */
  deleteSave(): void {
    localStorage.removeItem(SaveManager.SAVE_KEY);
  }

  /** Future version migration hook. Currently a pass-through. */
  private migrate(data: GameState): GameState {
    // When CURRENT_VERSION changes, add migration logic here.
    if (data.version < SaveManager.CURRENT_VERSION) {
      // Future migrations go here per version bump
    }
    return data;
  }
}
