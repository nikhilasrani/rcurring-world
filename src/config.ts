import Phaser from 'phaser';
import { GridEngine } from 'grid-engine';
import InputTextPlugin from 'phaser3-rex-plugins/plugins/inputtext-plugin.js';
import VirtualJoystickPlugin from 'phaser3-rex-plugins/plugins/virtualjoystick-plugin.js';
import { BootScene } from './scenes/BootScene.ts';
import { TitleScene } from './scenes/TitleScene.ts';
import { NameEntryScene } from './scenes/NameEntryScene.ts';
import { WorldScene } from './scenes/WorldScene.ts';
import { UIScene } from './scenes/UIScene.ts';

export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 320;

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  pixelArt: true,
  antialias: false,
  roundPixels: true,
  backgroundColor: '#000000',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  dom: {
    createContainer: true, // Required for Rex InputText (name entry)
  },
  plugins: {
    global: [
      {
        key: 'rexInputTextPlugin',
        plugin: InputTextPlugin,
        start: true,
      },
      {
        key: 'rexVirtualJoystick',
        plugin: VirtualJoystickPlugin,
        start: true,
      },
    ],
    scene: [
      {
        key: 'gridEngine',
        plugin: GridEngine,
        mapping: 'gridEngine',
      },
    ],
  },
  scene: [BootScene, TitleScene, NameEntryScene, WorldScene, UIScene],
};

export default config;
