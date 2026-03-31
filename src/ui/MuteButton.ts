/**
 * MuteButton: HTML overlay button for muting/unmuting all game audio.
 *
 * Absolutely positioned in the top-right corner of the game container.
 * Implemented as a DOM element (not Phaser) so it's always accessible
 * regardless of scene state.
 *
 * Uses Phaser's SoundManager.mute for global mute toggle.
 */
export class MuteButton {
  private button: HTMLButtonElement;
  private game: Phaser.Game;
  private muted = false;

  constructor(game: Phaser.Game) {
    this.game = game;

    this.button = document.createElement('button');
    this.button.id = 'mute-btn';
    this.button.setAttribute('aria-label', 'Toggle audio mute');
    this.button.textContent = 'Sound: ON';

    // Style: small pixel-art themed button in top-right corner
    Object.assign(this.button.style, {
      position: 'absolute',
      top: '8px',
      right: '8px',
      zIndex: '1000',
      padding: '4px 10px',
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#ffffff',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      border: '1px solid #888888',
      borderRadius: '2px',
      cursor: 'pointer',
      userSelect: 'none',
      outline: 'none',
      lineHeight: '1.2',
    });

    // Hover effect
    this.button.addEventListener('mouseenter', () => {
      this.button.style.backgroundColor = 'rgba(40, 40, 40, 0.8)';
    });
    this.button.addEventListener('mouseleave', () => {
      this.button.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
    });

    // Click handler
    this.button.addEventListener('click', (e: MouseEvent) => {
      e.stopPropagation();
      this.toggle();
    });

    // Attach to game container (the parent div that wraps the canvas)
    const container = this.game.canvas.parentElement;
    if (container) {
      // Ensure container is positioned for absolute child
      const pos = getComputedStyle(container).position;
      if (pos === 'static' || pos === '') {
        container.style.position = 'relative';
      }
      container.appendChild(this.button);
    }
  }

  /** Toggle mute state. */
  toggle(): void {
    this.muted = !this.muted;
    this.game.sound.mute = this.muted;
    this.button.textContent = this.muted ? 'Sound: OFF' : 'Sound: ON';
  }

  /** Programmatically set mute state. */
  setMuted(muted: boolean): void {
    this.muted = muted;
    this.game.sound.mute = this.muted;
    this.button.textContent = this.muted ? 'Sound: OFF' : 'Sound: ON';
  }

  /** Check current mute state. */
  isMuted(): boolean {
    return this.muted;
  }

  /** Remove button from DOM. */
  destroy(): void {
    this.button.remove();
  }
}
