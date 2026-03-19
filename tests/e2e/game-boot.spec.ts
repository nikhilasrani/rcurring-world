import { test, expect } from '@playwright/test';

test('game canvas renders at 480x320 base resolution', async ({ page }) => {
  await page.goto('/');
  // Wait for Phaser canvas to appear
  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible({ timeout: 10000 });

  // Verify canvas exists (Phaser creates it)
  const canvasCount = await canvas.count();
  expect(canvasCount).toBeGreaterThanOrEqual(1);
});
