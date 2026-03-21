import Phaser from 'phaser';
import TextTyping from 'phaser3-rex-plugins/plugins/behaviors/texttyping/TextTyping';
import { eventsCenter } from '../utils/EventsCenter';
import { EVENTS } from '../utils/constants';
import { DialogueController } from './DialogueController';
import type { DialogueData } from '../utils/types';

// Re-export for consumers that import from DialogBox
export { DialogueController } from './DialogueController';

/**
 * DialogBox: GBA-style dialogue box with typewriter text and multi-page paging.
 *
 * Positioned at the bottom of the visible viewport (adapts to ENVELOP cropping).
 * Background: #F8F8F8 at 0.95 alpha with #222222 2px border.
 * NPC name in bold monospace, content in regular monospace with word wrap.
 * Page indicator (down-triangle) when more pages exist.
 * Typewriter effect at 30ms per character via rexrainbow TextTyping plugin.
 *
 * Input handling: advance() is called externally by WorldScene/UIScene input handler.
 * Does NOT use setInteractive() on any element.
 *
 * Events: Emits DIALOGUE_OPEN on show(), DIALOGUE_CLOSE on last-page advance.
 */
export class DialogBox {
  private background: Phaser.GameObjects.Graphics;
  private nameText: Phaser.GameObjects.Text;
  private contentText: Phaser.GameObjects.Text;
  private pageIndicator: Phaser.GameObjects.Text;
  private typing: TextTyping;
  private controller: DialogueController;
  private isTypingComplete: boolean = true;

  // Choice mechanic
  private choiceTexts: Phaser.GameObjects.Text[] = [];
  private cursorText!: Phaser.GameObjects.Text;
  private choiceIndex: number = 0;
  private isInChoiceMode: boolean = false;
  private scene: Phaser.Scene;

  // Layout constants
  private static readonly BOX_HEIGHT = 72;
  private static readonly BOX_MARGIN = 4;
  private static readonly TEXT_PADDING = 8;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.controller = new DialogueController([]);

    // Create elements at origin — reposition() sets actual positions
    this.background = scene.add.graphics();
    this.background.setDepth(60);
    this.background.setScrollFactor(0);
    this.background.setVisible(false);

    this.nameText = scene.add.text(0, 0, '', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#333333',
      fontStyle: 'bold',
    });
    this.nameText.setDepth(61);
    this.nameText.setScrollFactor(0);
    this.nameText.setVisible(false);

    this.contentText = scene.add.text(0, 0, '', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#111111',
      wordWrap: { width: 456 },
    });
    this.contentText.setDepth(61);
    this.contentText.setScrollFactor(0);
    this.contentText.setVisible(false);

    this.pageIndicator = scene.add.text(0, 0, '', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#666666',
    });
    this.pageIndicator.setDepth(61);
    this.pageIndicator.setScrollFactor(0);
    this.pageIndicator.setVisible(false);

    this.typing = new TextTyping(this.contentText, { speed: 30 });
    this.typing.on('complete', () => {
      this.isTypingComplete = true;
      // If this page is a choice page, show choices after typing completes
      if (this.controller.isChoicePage()) {
        this.showChoices();
      }
    });

    // Choice cursor ">" indicator (hidden until choice mode)
    this.cursorText = scene.add.text(0, 0, '>', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#E8B830',
    });
    this.cursorText.setDepth(62);
    this.cursorText.setScrollFactor(0);
    this.cursorText.setVisible(false);
  }

  /**
   * Reposition all elements relative to the visible viewport bounds.
   * Called by UIScene on create and on resize.
   */
  reposition(bounds: { x: number; y: number; width: number; height: number }): void {
    const m = DialogBox.BOX_MARGIN;
    const boxW = bounds.width - m * 2;
    const boxX = bounds.x + m;
    const boxY = bounds.y + bounds.height - DialogBox.BOX_HEIGHT - m;

    this.background.clear();
    this.background.fillStyle(0xF8F8F8, 0.95);
    this.background.fillRect(boxX, boxY, boxW, DialogBox.BOX_HEIGHT);
    this.background.lineStyle(2, 0x222222, 1);
    this.background.strokeRect(boxX, boxY, boxW, DialogBox.BOX_HEIGHT);

    this.nameText.setPosition(boxX + DialogBox.TEXT_PADDING, boxY + 4);
    this.contentText.setPosition(boxX + DialogBox.TEXT_PADDING, boxY + 20);
    this.contentText.setWordWrapWidth(boxW - DialogBox.TEXT_PADDING * 2);
    this.pageIndicator.setPosition(boxX + boxW - 16, boxY + DialogBox.BOX_HEIGHT - 16);
  }

  /** Show dialogue box with NPC/sign dialogue data */
  show(dialogue: DialogueData): void {
    this.controller.reset(dialogue.pages, dialogue.name);
    // Set up choice data if present
    if (dialogue.choicePage !== undefined && dialogue.choices) {
      this.controller.setChoiceData(dialogue.choicePage, dialogue.choices);
    }
    this.nameText.setText(dialogue.name || '');
    this.setAllVisible(true);
    this.typePage(0);
    eventsCenter.emit(EVENTS.DIALOGUE_OPEN);
  }

  /**
   * Advance dialogue:
   * - If typing incomplete: stop typing and show full text
   * - If typing complete and more pages: go to next page
   * - If typing complete on last page: hide and emit DIALOGUE_CLOSE
   */
  advance(): void {
    if (!this.isTypingComplete) {
      this.typing.stop(true);
      this.isTypingComplete = true;
      // After fast-completing text, check for choice page
      if (this.controller.isChoicePage()) {
        this.showChoices();
      }
      return;
    }

    // If in choice mode, emit choice event and continue
    if (this.isInChoiceMode) {
      const choiceText = this.controller.selectChoice(this.choiceIndex);
      eventsCenter.emit(EVENTS.DIALOGUE_CHOICE, {
        choiceIndex: this.choiceIndex,
        choiceText,
      });
      this.hideChoices();
      // Continue to close dialogue (choice page is always last effective page)
      this.hide();
      eventsCenter.emit(EVENTS.DIALOGUE_CLOSE);
      return;
    }

    if (this.controller.hasMorePages()) {
      this.controller.nextPage();
      this.typePage(0);
      return;
    }

    this.hide();
    eventsCenter.emit(EVENTS.DIALOGUE_CLOSE);
  }

  /** Display choice options with cursor indicator */
  private showChoices(): void {
    const choices = this.controller.getChoices();
    this.contentText.setVisible(false);
    this.pageIndicator.setVisible(false);

    const baseX = this.nameText.x + 8;
    const baseY = this.nameText.y + 20;

    // Create or reuse choice text objects
    for (let i = 0; i < choices.length; i++) {
      if (this.choiceTexts[i]) {
        this.choiceTexts[i].setText(choices[i]);
        this.choiceTexts[i].setPosition(baseX, baseY + i * 14);
        this.choiceTexts[i].setVisible(true);
      } else {
        const choiceText = this.scene.add.text(baseX, baseY + i * 14, choices[i], {
          fontFamily: 'monospace',
          fontSize: '10px',
          color: i === 0 ? '#111111' : '#666666',
        });
        choiceText.setDepth(61);
        choiceText.setScrollFactor(0);
        this.choiceTexts.push(choiceText);
      }
    }

    // Position cursor at first choice
    this.choiceIndex = 0;
    this.cursorText.setPosition(baseX - 8, baseY);
    this.cursorText.setVisible(true);
    this.updateChoiceColors();

    this.isInChoiceMode = true;
  }

  /** Hide choice elements and reset state */
  private hideChoices(): void {
    for (const ct of this.choiceTexts) {
      ct.setVisible(false);
    }
    this.cursorText.setVisible(false);
    this.isInChoiceMode = false;
    this.choiceIndex = 0;
  }

  /** Move choice cursor up or down */
  moveChoiceCursor(direction: 'up' | 'down'): void {
    if (!this.isInChoiceMode) return;

    const count = this.controller.getChoiceCount();
    if (direction === 'up' && this.choiceIndex > 0) {
      this.choiceIndex--;
    } else if (direction === 'down' && this.choiceIndex < count - 1) {
      this.choiceIndex++;
    }

    // Update cursor position
    const baseY = this.nameText.y + 20;
    this.cursorText.setY(baseY + this.choiceIndex * 14);
    this.updateChoiceColors();
  }

  /** Update choice text colors based on current selection */
  private updateChoiceColors(): void {
    for (let i = 0; i < this.choiceTexts.length; i++) {
      this.choiceTexts[i].setColor(i === this.choiceIndex ? '#111111' : '#666666');
    }
  }

  /** Returns true if the dialogue is currently in choice selection mode */
  isChoiceActive(): boolean {
    return this.isInChoiceMode;
  }

  private typePage(_pageIndex: number): void {
    this.isTypingComplete = false;
    this.typing.start(this.controller.getCurrentPage());
    if (this.controller.shouldShowPageIndicator()) {
      this.pageIndicator.setText('\u25BC');
      this.pageIndicator.setVisible(true);
    } else {
      this.pageIndicator.setText('');
      this.pageIndicator.setVisible(this.background.visible);
    }
  }

  hide(): void {
    this.hideChoices();
    this.setAllVisible(false);
  }

  isActive(): boolean {
    return this.background.visible;
  }

  private setAllVisible(visible: boolean): void {
    this.background.setVisible(visible);
    this.nameText.setVisible(visible);
    this.contentText.setVisible(visible);
    this.pageIndicator.setVisible(visible);
  }

  destroy(): void {
    this.background.destroy();
    this.nameText.destroy();
    this.contentText.destroy();
    this.pageIndicator.destroy();
    for (const ct of this.choiceTexts) {
      ct.destroy();
    }
    this.choiceTexts = [];
    this.cursorText.destroy();
  }
}
