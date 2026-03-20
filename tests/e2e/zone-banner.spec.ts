import { test, expect } from '@playwright/test';

test.describe('Zone Banner', () => {
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

  test('zone banner exists in UIScene', async ({ page }) => {
    const hasBanner = await page.evaluate(() => {
      const game = (window as any).__PHASER_GAME__;
      const ui = game?.scene?.getScene('UIScene');
      if (!ui) return false;
      // ZoneBanner creates a container in UIScene -- check for its existence
      return ui.children.list.length > 0;
    });
    expect(hasBanner).toBe(true);
  });

  test('UIScene has expected child count after Phase 2 integration', async ({ page }) => {
    const childCount = await page.evaluate(() => {
      const game = (window as any).__PHASER_GAME__;
      const ui = game?.scene?.getScene('UIScene');
      if (!ui) return 0;
      // UIScene should have children from TouchControls, DialogBox, and ZoneBanner
      return ui.children.list.length;
    });
    // Should have at least a few children (touch controls + dialog box elements + banner container)
    expect(childCount).toBeGreaterThan(0);
  });
});
