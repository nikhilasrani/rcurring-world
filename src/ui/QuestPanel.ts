import Phaser from 'phaser';
import type { QuestState } from '../utils/types';

interface QuestObjectiveInfo {
  id: string;
  description: string;
  completed: boolean;
}

/**
 * QuestPanel: Active quest display panel inside PauseMenu.
 *
 * Shows active quest name, progress "X/Y objectives", objective checklist,
 * or "No active quests" empty state.
 * Completed quests show name + "Complete" in #44AA44.
 */
export class QuestPanel {
  private container: Phaser.GameObjects.Container;
  private headingText: Phaser.GameObjects.Text;
  private questNameText: Phaser.GameObjects.Text;
  private progressText: Phaser.GameObjects.Text;
  private emptyText: Phaser.GameObjects.Text;
  private objectiveTexts: Phaser.GameObjects.Text[] = [];
  private scene: Phaser.Scene;
  private panelX: number;
  private panelY: number;

  constructor(scene: Phaser.Scene, x: number, y: number, width: number, _height: number) {
    this.scene = scene;
    this.panelX = x;
    this.panelY = y;

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

  /** Update quest display with objective details. */
  update(questState: QuestState | null, questName: string, objectives?: QuestObjectiveInfo[]): void {
    // Clear old objective texts
    for (const t of this.objectiveTexts) {
      t.destroy();
    }
    this.objectiveTexts = [];

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

    // Show objective checklist
    if (objectives && objectives.length > 0) {
      let currentY = this.panelY + 60;
      for (const obj of objectives) {
        const check = obj.completed ? '\u2713' : '\u25CB';
        const color = obj.completed ? '#44AA44' : '#333333';
        const text = this.scene.add.text(
          this.panelX + 4,
          currentY,
          `${check} ${obj.description}`,
          {
            fontFamily: 'monospace',
            fontSize: '10px',
            color,
          },
        );
        text.setScrollFactor(0);
        this.container.add(text);
        this.objectiveTexts.push(text);
        currentY += 14;
      }
    }
  }

  show(): void {
    this.container.setVisible(true);
  }

  hide(): void {
    this.container.setVisible(false);
  }

  destroy(): void {
    for (const t of this.objectiveTexts) {
      t.destroy();
    }
    this.container.destroy();
  }
}
