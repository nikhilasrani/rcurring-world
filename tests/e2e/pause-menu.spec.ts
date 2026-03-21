import { test, expect } from '@playwright/test';

test.describe('Pause Menu', () => {
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

  test('Escape key opens pause menu', async ({ page }) => {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    const isOpen = await page.evaluate(() => {
      const game = (window as any).__PHASER_GAME__;
      const ui = game?.scene?.getScene('UIScene');
      // PauseMenu container should be visible when open
      const children = ui?.children?.list ?? [];
      // Look for pause menu container at high depth (70)
      return children.some(
        (c: any) => c.type === 'Container' && c.depth === 70 && c.visible,
      );
    });
    expect(isOpen).toBe(true);
  });

  test('pause menu has 5 tabs', async ({ page }) => {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    const tabLabels = await page.evaluate(() => {
      const game = (window as any).__PHASER_GAME__;
      const ui = game?.scene?.getScene('UIScene');
      if (!ui) return [];
      // Find text objects that match the known tab labels
      const labels = ['QUESTS', 'INVENTORY', 'JOURNAL', 'SAVE', 'SETTINGS'];
      const found: string[] = [];
      for (const child of ui.children.list) {
        if (child.type === 'Text' && labels.includes(child.text)) {
          found.push(child.text);
        }
        // Also check inside containers
        if (child.type === 'Container' && child.list) {
          for (const inner of child.list) {
            if (inner.type === 'Text' && labels.includes(inner.text)) {
              found.push(inner.text);
            }
          }
        }
      }
      return [...new Set(found)];
    });
    expect(tabLabels).toHaveLength(5);
    expect(tabLabels).toContain('QUESTS');
    expect(tabLabels).toContain('INVENTORY');
    expect(tabLabels).toContain('JOURNAL');
    expect(tabLabels).toContain('SAVE');
    expect(tabLabels).toContain('SETTINGS');
  });

  test('Escape key closes pause menu', async ({ page }) => {
    // Open
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Close
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    const isOpen = await page.evaluate(() => {
      const game = (window as any).__PHASER_GAME__;
      const ui = game?.scene?.getScene('UIScene');
      const children = ui?.children?.list ?? [];
      return children.some(
        (c: any) => c.type === 'Container' && c.depth === 70 && c.visible,
      );
    });
    expect(isOpen).toBe(false);
  });

  test('left/right arrows switch tabs', async ({ page }) => {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Press Right to switch tab
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(300);

    // Verify tab changed by checking underline position or active state
    // The PauseMenu tracks activeTabIndex internally
    const tabSwitched = await page.evaluate(() => {
      const game = (window as any).__PHASER_GAME__;
      const ui = game?.scene?.getScene('UIScene');
      if (!ui) return false;
      // After pressing Right once from default (QUESTS = index 0),
      // the active tab should now be INVENTORY (index 1)
      // We verify by checking which tab text has the active color (#E8B830)
      for (const child of ui.children.list) {
        if (child.type === 'Text' && child.text === 'INVENTORY') {
          // Active tab uses gold color #E8B830 = 0xE8B830
          const color = child.style?.color ?? '';
          return color === '#E8B830' || color === '#e8b830';
        }
        if (child.type === 'Container' && child.list) {
          for (const inner of child.list) {
            if (inner.type === 'Text' && inner.text === 'INVENTORY') {
              const color = inner.style?.color ?? '';
              return color === '#E8B830' || color === '#e8b830';
            }
          }
        }
      }
      return false;
    });
    expect(tabSwitched).toBe(true);
  });

  test('UIScene exists and has Phase 3 UI children', async ({ page }) => {
    const hasPhase3UI = await page.evaluate(() => {
      const game = (window as any).__PHASER_GAME__;
      const ui = game?.scene?.getScene('UIScene');
      if (!ui) return false;
      // UIScene should have many children after Phase 3 integration
      // (TouchControls, DialogBox, ZoneBanner, PauseMenu container, QuestHUD, etc.)
      return ui.children.list.length >= 5;
    });
    expect(hasPhase3UI).toBe(true);
  });
});
