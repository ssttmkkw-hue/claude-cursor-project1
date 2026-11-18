import Phaser from 'phaser';
import type { MapNpc, MapPickup } from '@/data/types';
import { TILE } from '@/config';

/** 可交互物（NPC、告示牌、宝箱…）的统一接口：靠近 + 按 E 触发。 */
export interface Interactable {
  x: number; y: number;
  radius: number;
  interact(): void;
}

export class Npc extends Phaser.GameObjects.Image implements Interactable {
  radius = 40;
  constructor(scene: Phaser.Scene, readonly def: MapNpc, private onTalk: (n: Npc) => void) {
    super(scene, (def.x + 0.5) * TILE, (def.y + 1) * TILE, def.sprite);
    scene.add.existing(this);
    this.setOrigin(0.5, 1).setDepth(this.y);
    scene.add.image(this.x, this.y - 1, 'shadow').setDepth(this.y - 1);
    // 待机呼吸
    scene.tweens.add({ targets: this, scaleY: 1.03, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }
  interact() { this.onTalk(this); }
}

/** 地图拾取物：技能宝珠 / 回复。拾取后写 flag，不再刷新。 */
export class Pickup extends Phaser.GameObjects.Image {
  constructor(scene: Phaser.Scene, readonly def: MapPickup) {
    super(scene, (def.x + 0.5) * TILE, (def.y + 0.5) * TILE, 'pickup_orb');
    scene.add.existing(this);
    this.setDepth(this.y + 16);
    scene.tweens.add({ targets: this, y: this.y - 6, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }
}
