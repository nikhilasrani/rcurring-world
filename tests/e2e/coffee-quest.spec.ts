import { test, expect } from '@playwright/test';

test.describe('Coffee Quest', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('canvas').waitFor({ timeout: 15000 });

    // Skip through opening sequence to reach WorldScene
    await page.waitForTimeout(2000);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);
  });

  test('quest manager exists in registry', async ({ page }) => {
    const hasQuestManager = await page.evaluate(() => {
      const game = (window as any).__PHASER_GAME__;
      const qm = game?.registry?.get('questManager');
      return qm !== undefined && qm !== null;
    });
    expect(hasQuestManager).toBe(true);
  });

  test('no active quest at game start', async ({ page }) => {
    const hasActive = await page.evaluate(() => {
      const game = (window as any).__PHASER_GAME__;
      const qm = game?.registry?.get('questManager');
      return qm?.hasActiveQuest() ?? false;
    });
    expect(hasActive).toBe(false);
  });

  test('quest state is empty initially', async ({ page }) => {
    const questState = await page.evaluate(() => {
      const game = (window as any).__PHASER_GAME__;
      const qm = game?.registry?.get('questManager');
      if (!qm) return null;
      return qm.getState();
    });
    expect(questState).toBeDefined();
    expect(questState).not.toBeNull();
    expect(Object.keys(questState as Record<string, unknown>)).toHaveLength(0);
  });

  test('chai-walla NPC exists in world', async ({ page }) => {
    const hasChaiWalla = await page.evaluate(() => {
      const game = (window as any).__PHASER_GAME__;
      const world = game?.scene?.getScene('WorldScene');
      if (!world?.gridEngine) return false;
      const chars: string[] = world.gridEngine.getAllCharacters();
      return chars.some((c: string) => c.includes('chai'));
    });
    expect(hasChaiWalla).toBe(true);
  });

  test('inventory manager exists and is empty at start', async ({ page }) => {
    const inventory = await page.evaluate(() => {
      const game = (window as any).__PHASER_GAME__;
      const inv = game?.registry?.get('inventoryManager');
      if (!inv) return null;
      return inv.getItems();
    });
    expect(inventory).toBeDefined();
    expect(inventory).not.toBeNull();
    expect(inventory).toHaveLength(0);
  });
});
