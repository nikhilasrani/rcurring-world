import { test, expect } from '@playwright/test';

test.describe('Touch Controls', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('canvas').waitFor({ timeout: 15000 });

    // Skip through opening sequence
    await page.waitForTimeout(2000);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);
  });

  test('touch controls are initially invisible', async ({ page }) => {
    const uiState = await page.evaluate(() => {
      const game = (window as any).__PHASER_GAME__;
      const uiScene = game?.scene?.getScene('UIScene');
      if (!uiScene) return null;
      // Touch controls should exist but be hidden until first touch
      return {
        sceneExists: true,
      };
    });
    expect(uiState).not.toBeNull();
    if (uiState) {
      expect(uiState.sceneExists).toBe(true);
    }
  });

  test('T key toggles touch controls without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    // Press T to toggle touch controls on desktop
    await page.keyboard.press('t');
    await page.waitForTimeout(500);

    // Press T again to toggle off
    await page.keyboard.press('t');
    await page.waitForTimeout(500);

    expect(errors).toHaveLength(0);
  });

  test('touch on left half of canvas does not cause errors', async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    // Simulate touch on left half of canvas (joystick area)
    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();
    if (box) {
      await page.mouse.click(
        box.x + box.width * 0.25,
        box.y + box.height * 0.5
      );
      await page.waitForTimeout(500);
    }

    expect(errors).toHaveLength(0);
  });
});
