import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '@/config';
import { BootScene } from '@/scenes/BootScene';
import { TitleScene } from '@/scenes/TitleScene';
import { WorldScene } from '@/scenes/WorldScene';
import { UIScene } from '@/scenes/UIScene';
import { SkillMenuScene } from '@/scenes/SkillMenuScene';

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#1d2b35',
  pixelArt: false,
  roundPixels: true,
  physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 0 }, debug: false } },
  input: { gamepad: true },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [BootScene, TitleScene, WorldScene, UIScene, SkillMenuScene],
});

// 调试用：浏览器控制台里可访问 window.__game
(window as unknown as { __game: Phaser.Game }).__game = game;
