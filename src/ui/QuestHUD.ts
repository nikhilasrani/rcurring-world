import Phaser from 'phaser';

/**
 * QuestHUD: Corner indicator showing active quest progress.
 *
 * UI-SPEC: top-right corner, 8px offset from edges.
 * Background #111111 at 0.7 alpha, 4px horizontal + 2px vertical padding.
 * Text "1/3" format in 8px monospace #E8B830.
 * Depth 55 (below dialogue, above banner).
 * Only visible when a quest is active.
 */
export class QuestHUD {
  private container: Phaser.GameObjects.Container;
  private background: Phaser.GameObjects.Graphics;
  private progressText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.background = scene.add.graphics();
    this.background.setScrollFactor(0);

    this.progressText = scene.add.text(0, 0, '', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#E8B830',
    });
    this.progressText.setScrollFactor(0);
    this.progressText.setOrigin(1, 0);

    this.container = scene.add.container(0, 0, [
      this.background,
      this.progressText,
    ]);
    this.container.setDepth(55);
    this.container.setScrollFactor(0);
    this.container.setVisible(false);
  }

  /** Update quest progress display. Shows indicator. */
  update(completed: number, total: number): void {
    const text = `${completed}/${total}`;
    this.progressText.setText(text);
    this.container.setVisible(true);
    this.drawBackground();
  }

  /** Hide the HUD indicator (no active quest). */
  hide(): void {
    this.container.setVisible(false);
  }

  /** Reposition based on viewport bounds. */
  reposition(bounds: { x: number; y: number; width: number; height: number }): void {
    // Position text at top-right, 8px from edges
    const textX = bounds.x + bounds.width - 8;
    const textY = bounds.y + 8;
    this.progressText.setPosition(textX, textY);

    if (this.container.visible) {
      this.drawBackground();
    }
  }

  destroy(): void {
    this.container.destroy();
  }

  private drawBackground(): void {
    this.background.clear();

    const textWidth = this.progressText.width;
    const textHeight = this.progressText.height;
    const padH = 4;
    const padV = 2;

    const bgX = this.progressText.x - textWidth - padH;
    const bgY = this.progressText.y - padV;
    const bgW = textWidth + padH * 2;
    const bgH = textHeight + padV * 2;

    this.background.fillStyle(0x111111, 0.7);
    this.background.fillRect(bgX, bgY, bgW, bgH);
  }
}
