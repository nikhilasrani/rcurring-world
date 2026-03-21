import Phaser from 'phaser';

/**
 * SavePanel: Save/load controls inside PauseMenu.
 *
 * "SAVE GAME" button (interactive), last-saved timestamp display,
 * and success/failure feedback text that auto-hides after 2 seconds.
 * Success: "Game saved!" in #44AA44. Failure: "Save failed. Storage may be full." in #CC4444.
 */
export class SavePanel {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private saveButton: Phaser.GameObjects.Text;
  private saveButtonBg: Phaser.GameObjects.Graphics;
  private timestampText: Phaser.GameObjects.Text;
  private feedbackText: Phaser.GameObjects.Text;
  private feedbackTimer: Phaser.Time.TimerEvent | null = null;
  private saveCallback: (() => void) | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, width: number, _height: number) {
    this.scene = scene;

    // Save button background
    const btnW = 120;
    const btnH = 24;
    const btnX = x + Math.floor((width - btnW) / 2);
    const btnY = y + 24;

    this.saveButtonBg = scene.add.graphics();
    this.saveButtonBg.setScrollFactor(0);
    this.saveButtonBg.fillStyle(0xCCCCCC, 1);
    this.saveButtonBg.fillRect(btnX, btnY, btnW, btnH);
    this.saveButtonBg.lineStyle(2, 0x222222, 1);
    this.saveButtonBg.strokeRect(btnX, btnY, btnW, btnH);

    // Save button text
    this.saveButton = scene.add.text(
      btnX + btnW / 2,
      btnY + btnH / 2,
      'SAVE GAME',
      {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#333333',
        fontStyle: 'bold',
      },
    );
    this.saveButton.setScrollFactor(0);
    this.saveButton.setOrigin(0.5, 0.5);
    this.saveButton.setInteractive({ useHandCursor: true });
    this.saveButton.on('pointerdown', () => {
      if (this.saveCallback) {
        this.saveCallback();
      }
    });

    // Last saved timestamp
    this.timestampText = scene.add.text(x, btnY + btnH + 16, 'No saved game.', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#666666',
    });
    this.timestampText.setScrollFactor(0);

    // Feedback text (hidden by default)
    this.feedbackText = scene.add.text(x, btnY + btnH + 34, '', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#44AA44',
    });
    this.feedbackText.setScrollFactor(0);
    this.feedbackText.setVisible(false);

    this.container = scene.add.container(0, 0, [
      this.saveButtonBg,
      this.saveButton,
      this.timestampText,
      this.feedbackText,
    ]);
    this.container.setDepth(71);
    this.container.setScrollFactor(0);
    this.container.setVisible(false);
  }

  /** Update the last-saved timestamp display. */
  update(lastSaved: number | null): void {
    if (lastSaved === null) {
      this.timestampText.setText('No saved game.');
    } else {
      const date = new Date(lastSaved);
      const timeStr = date.toLocaleString();
      this.timestampText.setText(`Last saved: ${timeStr}`);
    }
  }

  /** Show success or failure feedback for 2 seconds. */
  showFeedback(success: boolean): void {
    if (this.feedbackTimer) {
      this.feedbackTimer.destroy();
    }

    if (success) {
      this.feedbackText.setText('Game saved!');
      this.feedbackText.setColor('#44AA44');
    } else {
      this.feedbackText.setText('Save failed. Storage may be full.');
      this.feedbackText.setColor('#CC4444');
    }

    this.feedbackText.setVisible(true);

    this.feedbackTimer = this.scene.time.delayedCall(2000, () => {
      this.feedbackText.setVisible(false);
      this.feedbackTimer = null;
    });
  }

  /** Set the callback for when save button is pressed. */
  set onSave(callback: () => void) {
    this.saveCallback = callback;
  }

  show(): void {
    this.container.setVisible(true);
  }

  hide(): void {
    this.container.setVisible(false);
  }

  destroy(): void {
    if (this.feedbackTimer) {
      this.feedbackTimer.destroy();
    }
    this.container.destroy();
  }
}
