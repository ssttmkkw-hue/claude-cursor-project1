import Phaser from 'phaser';
import { ASSETS } from '@/art/manifest';
import { generateMissingPlaceholders } from '@/art/placeholders';
import { GameState } from '@/core/GameState';

/** 加载 manifest 里的正式美术 → 缺的用占位图补 → 进入标题画面。 */
export class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }

  preload() {
    const { width, height } = this.scale;
    const bar = this.add.rectangle(width / 2 - 150, height / 2, 0, 8, 0x9ff0d8).setOrigin(0, 0.5);
    this.load.on('progress', (p: number) => bar.setSize(300 * p, 8));
    this.load.on('loaderror', (f: Phaser.Loader.File) => console.warn(`[art] failed to load ${f.key} (${f.url}), using placeholder`));
    for (const a of ASSETS) {
      switch (a.type) {
        case 'image': this.load.image(a.key, a.url); break;
        case 'svg': this.load.svg(a.key, a.url, a.width && a.height ? { width: a.width, height: a.height } : undefined); break;
        case 'spritesheet': this.load.spritesheet(a.key, a.url, { frameWidth: a.frameWidth, frameHeight: a.frameHeight }); break;
        case 'audio': this.load.audio(a.key, a.url); break;
      }
    }
  }

  create() {
    generateMissingPlaceholders(this);
    const hasSave = GameState.load();
    this.registry.set('hasSave', hasSave);
    this.scene.start('Title');
  }
}
