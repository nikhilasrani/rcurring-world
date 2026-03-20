import { test, expect } from '@playwright/test';

test.describe('Building Transitions', () => {
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

  test('interior tilemaps are loaded in cache', async ({ page }) => {
    const interiorLoaded = await page.evaluate(() => {
      const game = (window as any).__PHASER_GAME__;
      if (!game?.cache?.tilemap) return false;
      // Check that interior tilemaps were preloaded by BootScene
      return game.cache.tilemap.has('tilemap-interior-metro');
    });
    expect(interiorLoaded).toBe(true);
  });

  test('interior tileset is loaded in cache', async ({ page }) => {
    const tilesetLoaded = await page.evaluate(() => {
      const game = (window as any).__PHASER_GAME__;
      if (!game?.textures) return false;
      return game.textures.exists('tileset-interior');
    });
    expect(tilesetLoaded).toBe(true);
  });

  test('all 4 interior tilemaps are cached', async ({ page }) => {
    const allLoaded = await page.evaluate(() => {
      const game = (window as any).__PHASER_GAME__;
      if (!game?.cache?.tilemap) return false;
      return (
        game.cache.tilemap.has('tilemap-interior-metro') &&
        game.cache.tilemap.has('tilemap-interior-coffee') &&
        game.cache.tilemap.has('tilemap-interior-ubcity') &&
        game.cache.tilemap.has('tilemap-interior-library')
      );
    });
    expect(allLoaded).toBe(true);
  });
});
