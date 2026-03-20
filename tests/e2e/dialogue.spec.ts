import { test, expect } from '@playwright/test';

test.describe('NPC Dialogue', () => {
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

  test('NPCs exist in the world', async ({ page }) => {
    const npcCount = await page.evaluate(() => {
      const game = (window as any).__PHASER_GAME__;
      const world = game?.scene?.getScene('WorldScene');
      if (!world?.gridEngine) return 0;
      // Check if Grid Engine has NPC characters (IDs starting with "npc-")
      const chars: string[] = world.gridEngine.getAllCharacters();
      return chars.filter((c: string) => c.startsWith('npc-')).length;
    });
    expect(npcCount).toBeGreaterThanOrEqual(5);
  });

  test('dialogue box elements exist in UIScene', async ({ page }) => {
    const hasDialogBox = await page.evaluate(() => {
      const game = (window as any).__PHASER_GAME__;
      const ui = game?.scene?.getScene('UIScene');
      if (!ui) return false;
      // UIScene should have more children after Phase 2 (DialogBox, ZoneBanner, TouchControls)
      return ui.children.list.length > 0;
    });
    expect(hasDialogBox).toBe(true);
  });

  test('world scene loads without JavaScript errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    // Wait for all systems to initialize
    await page.waitForTimeout(3000);

    expect(errors).toHaveLength(0);
  });
});
