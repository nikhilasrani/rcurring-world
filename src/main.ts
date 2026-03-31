import Phaser from 'phaser';
import config from './config';
import { MuteButton } from './ui/MuteButton';

const game = new Phaser.Game(config);

// Create HTML mute toggle button once the game canvas is ready
game.events.once('ready', () => {
  const muteBtn = new MuteButton(game);
  // Store in registry so scenes can access if needed
  game.registry.set('muteButton', muteBtn);
});

// Expose game instance for E2E test hooks (dev only)
if (import.meta.env.DEV) {
  (window as unknown as Record<string, unknown>).__PHASER_GAME__ = game;
}

export default game;
