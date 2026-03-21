import Phaser from 'phaser';

/**
 * JournalPanel: Discovery journal display inside PauseMenu.
 *
 * Shows zone completion header ("MG Road: N% explored"),
 * three sections (Places, NPCs Met, Items Found) with discovery counts,
 * discovered entry names, and "???" for undiscovered.
 * Scrollable when content exceeds panel height.
 * Empty state: "Your journal is empty." + "Start exploring to fill your journal!"
 */

interface JournalSection {
  discovered: { id: string; name: string }[];
  undiscovered: number;
  total: number;
}

interface JournalData {
  completion: number;
  places: JournalSection;
  npcs: JournalSection;
  items: JournalSection;
}

export class JournalPanel {
  private container: Phaser.GameObjects.Container;
  private completionText: Phaser.GameObjects.Text;
  private sectionElements: Phaser.GameObjects.Text[] = [];
  private emptyText: Phaser.GameObjects.Text;
  private emptySubtext: Phaser.GameObjects.Text;
  private panelX: number;
  private panelY: number;
  private panelHeight: number;
  private scene: Phaser.Scene;
  private mask: Phaser.Display.Masks.GeometryMask | null = null;
  private scrollOffset = 0;
  private contentHeight = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
    this.scene = scene;
    this.panelX = x;
    this.panelY = y;
    this.panelHeight = height;

    // Zone completion header
    this.completionText = scene.add.text(x, y, '', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#333333',
      fontStyle: 'bold',
    });
    this.completionText.setScrollFactor(0);

    // Empty state
    this.emptyText = scene.add.text(x, y + 24, 'Your journal is empty.', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#333333',
    });
    this.emptyText.setScrollFactor(0);

    this.emptySubtext = scene.add.text(x, y + 40, 'Start exploring to fill your journal!', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#666666',
    });
    this.emptySubtext.setScrollFactor(0);

    this.container = scene.add.container(0, 0, [
      this.completionText,
      this.emptyText,
      this.emptySubtext,
    ]);
    this.container.setDepth(71);
    this.container.setScrollFactor(0);
    this.container.setVisible(false);

    // Geometry mask to clip content to panel bounds
    const maskShape = scene.make.graphics({});
    maskShape.fillStyle(0xffffff);
    maskShape.fillRect(x, y, width, height);
    this.mask = maskShape.createGeometryMask();
    this.container.setMask(this.mask);

    // Mouse wheel scroll
    scene.input.on('wheel', (_pointer: Phaser.Input.Pointer, _gameObjects: any, _deltaX: number, deltaY: number) => {
      if (!this.container.visible) return;
      this.scroll(deltaY > 0 ? 20 : -20);
    });
  }

  private scroll(delta: number): void {
    const maxScroll = Math.max(0, this.contentHeight - this.panelHeight);
    this.scrollOffset = Phaser.Math.Clamp(this.scrollOffset + delta, 0, maxScroll);
    this.container.setY(-this.scrollOffset);
  }

  /** Update journal with discovery data. */
  update(data: JournalData): void {
    // Clear old section elements
    for (const elem of this.sectionElements) {
      elem.destroy();
    }
    this.sectionElements = [];
    this.scrollOffset = 0;
    this.container.setY(0);

    const totalDiscoveries = data.places.discovered.length +
      data.npcs.discovered.length +
      data.items.discovered.length;
    const totalAll = data.places.total + data.npcs.total + data.items.total;

    if (totalAll === 0 || (totalDiscoveries === 0 && data.completion === 0)) {
      this.completionText.setVisible(false);
      this.emptyText.setVisible(true);
      this.emptySubtext.setVisible(true);
      this.contentHeight = 0;
      return;
    }

    this.emptyText.setVisible(false);
    this.emptySubtext.setVisible(false);
    this.completionText.setVisible(true);

    // Zone completion header
    this.completionText.setText(`MG Road: ${data.completion}% explored`);

    let currentY = this.panelY + 20;

    // Render sections
    const sections: [string, JournalSection][] = [
      ['Places', data.places],
      ['NPCs Met', data.npcs],
      ['Items Found', data.items],
    ];

    for (const [header, section] of sections) {
      // Section header
      const headerText = this.scene.add.text(this.panelX, currentY, header, {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#333333',
        fontStyle: 'bold',
      });
      headerText.setScrollFactor(0);
      this.container.add(headerText);
      this.sectionElements.push(headerText);
      currentY += 14;

      // Discovery count
      const countText = this.scene.add.text(
        this.panelX,
        currentY,
        `${header}: ${section.discovered.length}/${section.total} discovered`,
        {
          fontFamily: 'monospace',
          fontSize: '10px',
          color: '#111111',
        },
      );
      countText.setScrollFactor(0);
      this.container.add(countText);
      this.sectionElements.push(countText);
      currentY += 14;

      // Discovered entries
      for (const entry of section.discovered) {
        const entryText = this.scene.add.text(this.panelX + 8, currentY, entry.name, {
          fontFamily: 'monospace',
          fontSize: '10px',
          color: '#111111',
        });
        entryText.setScrollFactor(0);
        this.container.add(entryText);
        this.sectionElements.push(entryText);
        currentY += 12;
      }

      // Undiscovered entries as "???"
      for (let i = 0; i < section.undiscovered; i++) {
        const unknownText = this.scene.add.text(this.panelX + 8, currentY, '???', {
          fontFamily: 'monospace',
          fontSize: '10px',
          color: '#666666',
        });
        unknownText.setScrollFactor(0);
        this.container.add(unknownText);
        this.sectionElements.push(unknownText);
        currentY += 12;
      }

      currentY += 4; // gap between sections
    }

    this.contentHeight = currentY - this.panelY;
  }

  show(): void {
    this.container.setVisible(true);
  }

  hide(): void {
    this.container.setVisible(false);
  }

  destroy(): void {
    for (const elem of this.sectionElements) {
      elem.destroy();
    }
    this.container.destroy();
  }
}
