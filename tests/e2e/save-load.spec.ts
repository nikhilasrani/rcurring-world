import { test, expect } from '@playwright/test';

test.describe('Save/Load', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any previous save data before each test
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.removeItem('rcurring-world-save');
    });
    await page.reload();
    await page.locator('canvas').waitFor({ timeout: 15000 });
  });

  test('no save exists at fresh start', async ({ page }) => {
    const hasSave = await page.evaluate(() => {
      return localStorage.getItem('rcurring-world-save') !== null;
    });
    expect(hasSave).toBe(false);
  });

  test('title screen shows CONTINUE greyed out when no save', async ({ page }) => {
    await page.waitForTimeout(2000);

    const continueState = await page.evaluate(() => {
      const game = (window as any).__PHASER_GAME__;
      const title = game?.scene?.getScene('TitleScene');
      if (!title) return null;
      // Find the CONTINUE text object and check its color
      for (const child of title.children.list) {
        if (child.type === 'Text' && child.text === 'CONTINUE') {
          return {
            text: child.text,
            color: child.style?.color ?? '',
          };
        }
      }
      return null;
    });
    expect(continueState).not.toBeNull();
    expect(continueState?.text).toBe('CONTINUE');
    // Greyed out = #666666
    expect(continueState?.color).toBe('#666666');
  });

  test('title screen shows Continue selectable when save exists', async ({ page }) => {
    // Set valid save data
    await page.evaluate(() => {
      localStorage.setItem(
        'rcurring-world-save',
        JSON.stringify({
          version: 1,
          timestamp: Date.now(),
          player: {
            name: 'Test',
            gender: 'male',
            position: { x: 45, y: 35 },
            facing: 'down',
            isRunning: false,
            currentZone: 'mg-road',
            isInInterior: false,
          },
          quests: {},
          inventory: [],
          discovery: {
            zones: ['mg-road'],
            landmarks: [],
            npcsMetIds: [],
            collectedPickupIds: [],
          },
          settings: { musicVolume: 1, sfxVolume: 1, runDefault: false },
        }),
      );
    });
    await page.reload();
    await page.locator('canvas').waitFor({ timeout: 15000 });
    await page.waitForTimeout(2000);

    const continueState = await page.evaluate(() => {
      const game = (window as any).__PHASER_GAME__;
      const title = game?.scene?.getScene('TitleScene');
      if (!title) return null;
      for (const child of title.children.list) {
        if (child.type === 'Text' && child.text === 'CONTINUE') {
          return {
            text: child.text,
            color: child.style?.color ?? '',
          };
        }
      }
      return null;
    });
    expect(continueState).not.toBeNull();
    expect(continueState?.text).toBe('CONTINUE');
    // Selectable = white #FFFFFF
    expect(continueState?.color.toUpperCase()).toBe('#FFFFFF');
  });

  test('save data persists in localStorage after manual save', async ({ page }) => {
    // Navigate to world
    await page.waitForTimeout(2000);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);

    // Open pause menu
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Navigate to Save tab (4th tab, index 3) -- press Right 3 times from QUESTS
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(200);
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(200);
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(200);

    // Activate save -- press Enter/Space to trigger save action
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    // Check localStorage for save data
    const hasSave = await page.evaluate(() => {
      return localStorage.getItem('rcurring-world-save') !== null;
    });
    expect(hasSave).toBe(true);

    // Verify save data has correct structure
    const saveData = await page.evaluate(() => {
      const raw = localStorage.getItem('rcurring-world-save');
      if (!raw) return null;
      return JSON.parse(raw);
    });
    expect(saveData).not.toBeNull();
    expect(saveData?.version).toBe(1);
    expect(saveData?.player).toBeDefined();
    expect(saveData?.quests).toBeDefined();
    expect(saveData?.inventory).toBeDefined();
    expect(saveData?.discovery).toBeDefined();
    expect(saveData?.settings).toBeDefined();
  });

  test('save manager exists in game registry', async ({ page }) => {
    // Navigate to world
    await page.waitForTimeout(2000);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);

    const hasSaveManager = await page.evaluate(() => {
      const game = (window as any).__PHASER_GAME__;
      const sm = game?.registry?.get('saveManager');
      return sm !== undefined && sm !== null;
    });
    expect(hasSaveManager).toBe(true);
  });

  test('new game warning appears when save exists', async ({ page }) => {
    // Set save data first
    await page.evaluate(() => {
      localStorage.setItem(
        'rcurring-world-save',
        JSON.stringify({
          version: 1,
          timestamp: Date.now(),
          player: {
            name: 'Test',
            gender: 'male',
            position: { x: 45, y: 35 },
            facing: 'down',
            isRunning: false,
            currentZone: 'mg-road',
            isInInterior: false,
          },
          quests: {},
          inventory: [],
          discovery: {
            zones: ['mg-road'],
            landmarks: [],
            npcsMetIds: [],
            collectedPickupIds: [],
          },
          settings: { musicVolume: 1, sfxVolume: 1, runDefault: false },
        }),
      );
    });
    await page.reload();
    await page.locator('canvas').waitFor({ timeout: 15000 });
    await page.waitForTimeout(2000);

    // Navigate down to NEW GAME (save exists, so CONTINUE is selected first)
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(300);

    // Press Enter to select NEW GAME
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    // Verify overwrite warning text is visible
    const warningVisible = await page.evaluate(() => {
      const game = (window as any).__PHASER_GAME__;
      const title = game?.scene?.getScene('TitleScene');
      if (!title) return false;
      for (const child of title.children.list) {
        if (
          child.type === 'Text' &&
          child.visible &&
          child.text?.includes('overwrite')
        ) {
          return true;
        }
      }
      return false;
    });
    expect(warningVisible).toBe(true);
  });
});
