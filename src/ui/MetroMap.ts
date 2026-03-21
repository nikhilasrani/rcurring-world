import Phaser from 'phaser';
import { eventsCenter } from '../utils/EventsCenter';
import { EVENTS } from '../utils/constants';

/**
 * MetroMap: Full-screen overlay displaying Namma Metro Purple Line diagram.
 *
 * Shows 3 stations (Majestic, MG Road, Indiranagar) on a horizontal purple line.
 * Current station (MG Road) highlighted in #E8B830 gold, locked stations in #666666.
 * Locked stations show "Coming in future update" tooltip.
 *
 * Travel transition: 3-part animation
 * 1. Doors close (500ms) - two black rectangles slide from edges to center
 * 2. Ride screen (1500ms) - "Next stop: {station}" text on black
 * 3. Doors open (500ms) - rectangles slide from center to edges
 *
 * UI-SPEC: depth 70, 448x288 overlay (16px margin), #F8F8F8 bg, #222222 border,
 * #8B45A6 Purple Line, 6px station dots, 12px bold title, 10px labels.
 */
export class MetroMap {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private overlay: Phaser.GameObjects.Graphics;
  private mapBg: Phaser.GameObjects.Graphics;
  private titleText: Phaser.GameObjects.Text;
  private closeButton: Phaser.GameObjects.Text;
  private stationDots: Phaser.GameObjects.Graphics;
  private stationLabels: Phaser.GameObjects.Text[] = [];
  private tooltipText: Phaser.GameObjects.Text;
  private isOpen: boolean = false;
  private bounds: { x: number; y: number; width: number; height: number } = {
    x: 0,
    y: 0,
    width: 480,
    height: 320,
  };
  private selectedStationIndex: number = 1; // MG Road = index 1

  private static readonly OUTER_MARGIN = 16;

  /** Station data for v1 -- 3 stations on Namma Metro Purple Line */
  private static readonly STATIONS = [
    { id: 'majestic', name: 'Majestic', unlocked: false },
    { id: 'mg-road', name: 'MG Road', unlocked: true },
    { id: 'indiranagar', name: 'Indiranagar', unlocked: false },
  ];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    // Dark overlay covering full viewport
    this.overlay = scene.add.graphics();
    this.overlay.setDepth(70);
    this.overlay.setScrollFactor(0);
    this.overlay.setVisible(false);

    // Map background
    this.mapBg = scene.add.graphics();
    this.mapBg.setScrollFactor(0);

    // Station dots graphics
    this.stationDots = scene.add.graphics();
    this.stationDots.setScrollFactor(0);

    // Title text
    this.titleText = scene.add.text(0, 0, 'Namma Metro - Purple Line', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#333333',
      fontStyle: 'bold',
    });
    this.titleText.setScrollFactor(0);
    this.titleText.setOrigin(0.5, 0);

    // Close button
    this.closeButton = scene.add.text(0, 0, 'X', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#333333',
      fontStyle: 'bold',
    });
    this.closeButton.setScrollFactor(0);
    this.closeButton.setOrigin(0.5, 0.5);
    this.closeButton.setInteractive({ useHandCursor: true });
    this.closeButton.on('pointerdown', () => {
      this.close();
    });

    // Station labels
    for (let i = 0; i < MetroMap.STATIONS.length; i++) {
      const station = MetroMap.STATIONS[i];
      const label = scene.add.text(0, 0, station.name, {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: station.unlocked ? '#E8B830' : '#666666',
      });
      label.setScrollFactor(0);
      label.setOrigin(0.5, 0);
      label.setInteractive({ useHandCursor: true });
      label.on('pointerdown', () => {
        this.selectStation(i);
      });
      this.stationLabels.push(label);
    }

    // Tooltip text for locked stations
    this.tooltipText = scene.add.text(0, 0, 'Coming in future update', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#666666',
    });
    this.tooltipText.setScrollFactor(0);
    this.tooltipText.setOrigin(0.5, 0);
    this.tooltipText.setVisible(false);

    // Assemble container
    this.container = scene.add.container(0, 0, [
      this.mapBg,
      this.stationDots,
      this.titleText,
      this.closeButton,
      ...this.stationLabels,
      this.tooltipText,
    ]);
    this.container.setDepth(70);
    this.container.setScrollFactor(0);
    this.container.setVisible(false);
  }

  /** Open the metro map overlay. */
  open(): void {
    if (this.isOpen) return;
    this.isOpen = true;

    this.overlay.setVisible(true);
    this.container.setVisible(true);

    // Reset selection to current station
    this.selectedStationIndex = 1; // MG Road
    this.updateStationDisplay();

    // Fade in
    this.overlay.setAlpha(0);
    this.container.setAlpha(0);
    this.scene.tweens.add({
      targets: [this.overlay, this.container],
      alpha: 1,
      duration: 150,
      ease: 'Power2',
    });

    eventsCenter.emit(EVENTS.MOVEMENT_FREEZE, true);
  }

  /** Close the metro map overlay. */
  close(): void {
    if (!this.isOpen) return;
    this.isOpen = false;

    this.scene.tweens.add({
      targets: [this.overlay, this.container],
      alpha: 0,
      duration: 150,
      ease: 'Power2',
      onComplete: () => {
        this.overlay.setVisible(false);
        this.container.setVisible(false);
      },
    });

    eventsCenter.emit(EVENTS.MOVEMENT_FREEZE, false);
  }

  /** Select a station by index. Shows tooltip if locked. */
  selectStation(index: number): void {
    if (index < 0 || index >= MetroMap.STATIONS.length) return;
    this.selectedStationIndex = index;
    this.updateStationDisplay();

    const station = MetroMap.STATIONS[index];
    if (!station.unlocked) {
      this.tooltipText.setVisible(true);
    } else {
      this.tooltipText.setVisible(false);
    }
  }

  /** Navigate selection left or right between stations. */
  navigateStation(direction: 'left' | 'right'): void {
    if (direction === 'left' && this.selectedStationIndex > 0) {
      this.selectStation(this.selectedStationIndex - 1);
    } else if (direction === 'right' && this.selectedStationIndex < MetroMap.STATIONS.length - 1) {
      this.selectStation(this.selectedStationIndex + 1);
    }
  }

  /** Confirm travel to the selected station. If locked, shows tooltip. */
  confirmStation(): void {
    const station = MetroMap.STATIONS[this.selectedStationIndex];
    if (!station.unlocked) {
      this.tooltipText.setVisible(true);
      return;
    }

    // Trigger travel transition
    this.playTravelTransition(station.name);
  }

  /** Returns whether the metro map is currently open. */
  isMapOpen(): boolean {
    return this.isOpen;
  }

  /** Reposition all elements relative to viewport bounds. */
  reposition(bounds: { x: number; y: number; width: number; height: number }): void {
    this.bounds = bounds;

    const m = MetroMap.OUTER_MARGIN;
    const menuX = bounds.x + m;
    const menuY = bounds.y + m;
    const menuW = bounds.width - m * 2;
    const menuH = bounds.height - m * 2;

    // Overlay: full viewport dim
    this.overlay.clear();
    this.overlay.fillStyle(0x111111, 0.7);
    this.overlay.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);

    // Map background: #F8F8F8 at 0.95 with #222222 2px border
    this.mapBg.clear();
    this.mapBg.fillStyle(0xF8F8F8, 0.95);
    this.mapBg.fillRect(menuX, menuY, menuW, menuH);
    this.mapBg.lineStyle(2, 0x222222, 1);
    this.mapBg.strokeRect(menuX, menuY, menuW, menuH);

    // Title centered at top
    this.titleText.setPosition(menuX + menuW / 2, menuY + 8);

    // Close button top-right
    this.closeButton.setPosition(menuX + menuW - 10, menuY + 12);

    // Station layout: horizontal purple line centered vertically
    const lineY = menuY + menuH / 2;
    const lineStartX = menuX + 60;
    const lineEndX = menuX + menuW - 60;

    // Draw the purple line and station dots
    this.stationDots.clear();

    // Purple line: 2px stroke #8B45A6
    this.stationDots.lineStyle(2, 0x8B45A6, 1);
    this.stationDots.beginPath();
    this.stationDots.moveTo(lineStartX, lineY);
    this.stationDots.lineTo(lineEndX, lineY);
    this.stationDots.strokePath();

    // Station dots along the line
    const stationCount = MetroMap.STATIONS.length;
    const spacing = (lineEndX - lineStartX) / (stationCount - 1);

    for (let i = 0; i < stationCount; i++) {
      const station = MetroMap.STATIONS[i];
      const dotX = lineStartX + spacing * i;

      if (station.unlocked) {
        // Current station: #E8B830 filled dot (6px diameter = 3px radius)
        this.stationDots.fillStyle(0xE8B830, 1);
        this.stationDots.fillCircle(dotX, lineY, 3);
      } else {
        // Locked station: #666666 hollow dot
        this.stationDots.lineStyle(2, 0x666666, 1);
        this.stationDots.strokeCircle(dotX, lineY, 3);
        // Restore line style for the next segment
        this.stationDots.lineStyle(2, 0x8B45A6, 1);
      }

      // Selected station indicator: larger ring
      if (i === this.selectedStationIndex) {
        this.stationDots.lineStyle(2, 0xE8B830, 1);
        this.stationDots.strokeCircle(dotX, lineY, 6);
        this.stationDots.lineStyle(2, 0x8B45A6, 1);
      }

      // Station label below the dot
      this.stationLabels[i].setPosition(dotX, lineY + 10);
    }

    // Tooltip at bottom center
    this.tooltipText.setPosition(menuX + menuW / 2, menuY + menuH - 24);
  }

  /** Destroy all elements. */
  destroy(): void {
    this.scene.tweens.killTweensOf(this.overlay);
    this.scene.tweens.killTweensOf(this.container);
    this.overlay.destroy();
    this.container.destroy();
  }

  /**
   * Play the 3-part travel transition animation.
   *
   * 1. Doors close (500ms): black rectangles slide from edges to center, Quad.easeInOut
   * 2. Ride screen (1500ms): black bg + "Next stop: {station}" text
   * 3. Doors open (500ms): rectangles slide from center to edges, Quad.easeInOut
   */
  playTravelTransition(destinationName: string): void {
    // Close the map first (instant)
    this.isOpen = false;
    this.overlay.setVisible(false);
    this.container.setVisible(false);

    const vx = this.bounds.x;
    const vy = this.bounds.y;
    const vw = this.bounds.width;
    const vh = this.bounds.height;
    const halfW = vw / 2;

    // Create door panels at depth 80 (above everything)
    const leftDoor = this.scene.add.graphics();
    leftDoor.setDepth(80);
    leftDoor.setScrollFactor(0);
    leftDoor.fillStyle(0x000000, 1);
    leftDoor.fillRect(0, 0, halfW, vh);
    leftDoor.setPosition(vx - halfW, vy); // Start off-screen left

    const rightDoor = this.scene.add.graphics();
    rightDoor.setDepth(80);
    rightDoor.setScrollFactor(0);
    rightDoor.fillStyle(0x000000, 1);
    rightDoor.fillRect(0, 0, halfW, vh);
    rightDoor.setPosition(vx + vw, vy); // Start off-screen right

    // Ride screen elements (created but hidden until doors close)
    const rideBg = this.scene.add.graphics();
    rideBg.setDepth(79);
    rideBg.setScrollFactor(0);
    rideBg.fillStyle(0x000000, 1);
    rideBg.fillRect(vx, vy, vw, vh);
    rideBg.setVisible(false);

    const rideText = this.scene.add.text(
      vx + vw / 2,
      vy + vh / 2,
      `Next stop: ${destinationName}`,
      {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#FFFFFF',
        fontStyle: 'bold',
      },
    );
    rideText.setDepth(79);
    rideText.setScrollFactor(0);
    rideText.setOrigin(0.5, 0.5);
    rideText.setVisible(false);

    // Phase 1: Doors close (500ms)
    this.scene.tweens.add({
      targets: leftDoor,
      x: vx,
      duration: 500,
      ease: 'Quad.easeInOut',
    });

    this.scene.tweens.add({
      targets: rightDoor,
      x: vx + halfW,
      duration: 500,
      ease: 'Quad.easeInOut',
      onComplete: () => {
        // Phase 2: Ride screen (1500ms)
        rideBg.setVisible(true);
        rideText.setVisible(true);

        this.scene.time.delayedCall(1500, () => {
          // Phase 3: Doors open (500ms)
          rideBg.setVisible(false);
          rideText.setVisible(false);

          this.scene.tweens.add({
            targets: leftDoor,
            x: vx - halfW,
            duration: 500,
            ease: 'Quad.easeInOut',
          });

          this.scene.tweens.add({
            targets: rightDoor,
            x: vx + vw,
            duration: 500,
            ease: 'Quad.easeInOut',
            onComplete: () => {
              // Cleanup
              leftDoor.destroy();
              rightDoor.destroy();
              rideBg.destroy();
              rideText.destroy();

              // Emit travel event
              eventsCenter.emit(EVENTS.METRO_TRAVEL_START, {
                stationId: MetroMap.STATIONS[this.selectedStationIndex].id,
                stationName: destinationName,
              });

              eventsCenter.emit(EVENTS.MOVEMENT_FREEZE, false);
            },
          });
        });
      },
    });
  }

  /** Update station dot display based on current selection. */
  private updateStationDisplay(): void {
    // Re-draw station dots and labels with selection state
    this.reposition(this.bounds);
  }
}
