import { test, expect } from '@playwright/test';

const EXPECTED_AUDIO_KEYS = [
  // BGM (3)
  'bgm-title', 'bgm-outdoor', 'bgm-interior',
  // SFX (9)
  'sfx-footstep', 'sfx-door-open', 'sfx-door-close', 'sfx-npc-chime',
  'sfx-menu-open', 'sfx-menu-close', 'sfx-dialogue-tick',
  'sfx-item-collected', 'sfx-quest-complete',
  // Ambient (4)
  'amb-city-base', 'amb-cubbon-park', 'amb-metro-interior', 'amb-shop-interior',
];

test.describe('Audio Boot', () => {
  test('all 16 audio assets are loaded after BootScene', async ({ page }) => {
    await page.goto('/');

    // Wait for Phaser game to boot (same pattern as game-boot.spec.ts)
    await page.locator('canvas').waitFor({ timeout: 15000 });
    await page.waitForFunction(
      () => (window as any).__PHASER_GAME__?.isBooted,
      { timeout: 15000 }
    );

    // Wait for TitleScene to be active (BootScene has finished loading all assets)
    await page.waitForFunction(
      () => {
        const game = (window as any).__PHASER_GAME__;
        return game?.scene?.isActive('TitleScene');
      },
      { timeout: 15000 }
    );

    // Check that all expected audio keys are in the Phaser audio cache
    // BootScene uses this.load.audio() which populates game.cache.audio
    const loadedKeys = await page.evaluate((keys: string[]) => {
      const game = (window as any).__PHASER_GAME__;
      return keys.filter(key => game.cache.audio.exists(key));
    }, EXPECTED_AUDIO_KEYS);

    expect(loadedKeys).toHaveLength(EXPECTED_AUDIO_KEYS.length);
    expect(loadedKeys.sort()).toEqual(EXPECTED_AUDIO_KEYS.sort());
  });
});
