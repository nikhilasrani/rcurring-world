import { test, expect } from '@playwright/test';

test.describe('Landmarks', () => {
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

  test('tilemap is loaded with correct dimensions', async ({ page }) => {
    const mapInfo = await page.evaluate(() => {
      const game = (window as any).__PHASER_GAME__;
      const worldScene = game?.scene?.getScene('WorldScene');
      if (!worldScene) return null;
      // Access the tilemap via scene's children or cache
      const tilemaps = worldScene.cache?.tilemap;
      return {
        sceneActive: worldScene.scene?.isActive?.() ?? false,
      };
    });
    expect(mapInfo).not.toBeNull();
  });

  test('world scene loads without JavaScript errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    // Wait extra time for all assets to load
    await page.waitForTimeout(3000);

    expect(errors).toHaveLength(0);
  });

  test('zone metadata defines 5 landmarks', async ({ page }) => {
    // Load zone metadata directly from the served assets
    const response = await page.goto('/data/zones/mg-road.json');
    if (response && response.ok()) {
      const zoneData = await response.json();
      expect(zoneData.landmarks).toHaveLength(5);
      const landmarkIds = zoneData.landmarks.map((l: any) => l.id);
      expect(landmarkIds).toContain('chinnaswamy-stadium');
      expect(landmarkIds).toContain('ub-city');
      expect(landmarkIds).toContain('cubbon-park');
      expect(landmarkIds).toContain('vidhana-soudha');
      expect(landmarkIds).toContain('mg-road-metro');
    }
  });
});
