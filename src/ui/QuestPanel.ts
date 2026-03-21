import Phaser from 'phaser';
import type { QuestState } from '../utils/types';

/**
 * QuestPanel: Active quest display panel inside PauseMenu.
 *
 * Shows active quest name, progress "X/Y objectives", or "No active quests".
 * Completed quests show name + "Complete" in #44AA44.
 */
export class QuestPanel {
  private container: Phaser.GameObjects.Container;
  private headingText: Phaser.GameObjects.Text;
  private questNameText: Phaser.GameObjects.Text;
  private progressText: Phaser.GameObjects.Text;
  private emptyText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number, width: number, _height: number) {
    // Heading
    this.headingText = scene.add.text(x, y, 'QUESTS', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#333333',
      fontStyle: 'bold',
    });
    this.headingText.setScrollFactor(0);

    // Quest name
    this.questNameText = scene.add.text(x, y + 24, '', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#333333',
      fontStyle: 'bold',
      wordWrap: { width },
    });
    this.questNameText.setScrollFactor(0);

    // Progress
    this.progressText = scene.add.text(x, y + 42, '', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#111111',
    });
    this.progressText.setScrollFactor(0);

    // Empty state
    this.emptyText = scene.add.text(x, y + 24, 'No active quests', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#666666',
    });
    this.emptyText.setScrollFactor(0);

    this.container = scene.add.container(0, 0, [
      this.headingText,
      this.questNameText,
      this.progressText,
      this.emptyText,
    ]);
    this.container.setDepth(71);
    this.container.setScrollFactor(0);
    this.container.setVisible(false);
  }

  /** Update quest display. Pass null for no active quest. */
  update(questState: QuestState | null, questName: string): void {
    if (!questState) {
      this.questNameText.setVisible(false);
      this.progressText.setVisible(false);
      this.emptyText.setVisible(true);
      return;
    }

    this.emptyText.setVisible(false);
    this.questNameText.setVisible(true);
    this.progressText.setVisible(true);

    this.questNameText.setText(questName);

    if (questState.status === 'complete') {
      this.progressText.setText('Complete');
      this.progressText.setColor('#44AA44');
    } else {
      const completed = questState.objectivesCompleted.length;
      const total = questState.objectivesTotal;
      this.progressText.setText(`${completed}/${total} objectives`);
      this.progressText.setColor('#111111');
    }
  }

  show(): void {
    this.container.setVisible(true);
  }

  hide(): void {
    this.container.setVisible(false);
  }

  destroy(): void {
    this.container.destroy();
  }
}
