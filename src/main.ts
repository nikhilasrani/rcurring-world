import Phaser from 'phaser';
import config from './config';

const game = new Phaser.Game(config);

// Expose game instance for E2E test hooks (dev only)
if (import.meta.env.DEV) {
  (window as unknown as Record<string, unknown>).__PHASER_GAME__ = game;
}

export default game;
