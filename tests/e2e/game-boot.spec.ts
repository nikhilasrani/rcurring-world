import { test, expect } from '@playwright/test';

test.describe('Game Boot', () => {
  test('game canvas renders', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 15000 });
  });

  test('Phaser game instance exists in dev mode', async ({ page }) => {
    await page.goto('/');
    // Wait for canvas to appear (Phaser has initialized)
    await page.locator('canvas').waitFor({ timeout: 15000 });

    // Check the dev test hook
    const hasGame = await page.evaluate(() => {
      return typeof (window as any).__PHASER_GAME__ !== 'undefined';
    });
    expect(hasGame).toBe(true);
  });

  test('game has correct base resolution', async ({ page }) => {
    await page.goto('/');
    await page.locator('canvas').waitFor({ timeout: 15000 });

    const dimensions = await page.evaluate(() => {
      const game = (window as any).__PHASER_GAME__;
      return {
        width: game?.config?.width,
        height: game?.config?.height,
      };
    });
    expect(dimensions.width).toBe(480);
    expect(dimensions.height).toBe(320);
  });
});
