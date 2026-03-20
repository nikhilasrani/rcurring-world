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
 * Position: bottom of screen (y=244), 472x72px with 4px inset from edges.
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

  constructor(scene: Phaser.Scene) {
    this.controller = new DialogueController([]);

    // Background: filled rect with stroke border
    this.background = scene.add.graphics();
    this.background.fillStyle(0xF8F8F8, 0.95);
    this.background.fillRect(4, 244, 472, 72);
    this.background.lineStyle(2, 0x222222, 1);
    this.background.strokeRect(4, 244, 472, 72);
    this.background.setDepth(60);
    this.background.setScrollFactor(0);
    this.background.setVisible(false);

    // NPC name text
    this.nameText = scene.add.text(12, 248, '', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#333333',
      fontStyle: 'bold',
    });
    this.nameText.setDepth(61);
    this.nameText.setScrollFactor(0);
    this.nameText.setVisible(false);

    // Content text with word wrap
    this.contentText = scene.add.text(12, 264, '', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#111111',
      wordWrap: { width: 456 },
    });
    this.contentText.setDepth(61);
    this.contentText.setScrollFactor(0);
    this.contentText.setVisible(false);

    // Page indicator (down-triangle unicode)
    this.pageIndicator = scene.add.text(460, 304, '', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#666666',
    });
    this.pageIndicator.setDepth(61);
    this.pageIndicator.setScrollFactor(0);
    this.pageIndicator.setVisible(false);

    // TextTyping plugin for typewriter effect
    this.typing = new TextTyping(this.contentText, { speed: 30 });
    this.typing.on('complete', () => {
      this.isTypingComplete = true;
    });
  }

  /** Show dialogue box with NPC/sign dialogue data */
  show(dialogue: DialogueData): void {
    this.controller.reset(dialogue.pages, dialogue.name);
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
      return;
    }

    if (this.controller.hasMorePages()) {
      this.controller.nextPage();
      this.typePage(0); // argument unused, uses controller state
      return;
    }

    // Last page, typing complete -> close
    this.hide();
    eventsCenter.emit(EVENTS.DIALOGUE_CLOSE);
  }

  /** Type the current page with typewriter effect */
  private typePage(_pageIndex: number): void {
    this.isTypingComplete = false;
    this.typing.start(this.controller.getCurrentPage());
    // Update page indicator
    if (this.controller.shouldShowPageIndicator()) {
      this.pageIndicator.setText('\u25BC'); // Down-pointing triangle
      this.pageIndicator.setVisible(true);
    } else {
      this.pageIndicator.setText('');
      this.pageIndicator.setVisible(this.background.visible); // keep consistent
    }
  }

  /** Hide the dialogue box */
  hide(): void {
    this.setAllVisible(false);
  }

  /** Check if dialogue box is currently visible/active */
  isActive(): boolean {
    return this.background.visible;
  }

  /** Set visibility on all dialogue elements */
  private setAllVisible(visible: boolean): void {
    this.background.setVisible(visible);
    this.nameText.setVisible(visible);
    this.contentText.setVisible(visible);
    this.pageIndicator.setVisible(visible);
  }

  /** Clean up all game objects */
  destroy(): void {
    this.background.destroy();
    this.nameText.destroy();
    this.contentText.destroy();
    this.pageIndicator.destroy();
  }
}
