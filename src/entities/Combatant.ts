import Phaser from 'phaser';
import { DEPTH } from '@/config';
import { ensureCharacterAnims, dirFromVector, type Dir } from '@/systems/CharacterAnimator';

export type Team = 'player' | 'enemy';
export interface Stats { hp: number; maxHp: number; mp: number; maxMp: number; }

/**
 * 所有能战斗的东西的基类（玩家、敌人、未来的同伴/Boss）。
 * - 原点在脚底 (0.5, 1)，depth = y → 自动 2.5D 遮挡
 * - 物理体只覆盖脚部，能“走到树后面”
 */
export abstract class Combatant extends Phaser.Physics.Arcade.Sprite {
  abstract readonly team: Team;
  stats: Stats;
  facing = new Phaser.Math.Vector2(0, 1);
  dir: Dir = 'down';
  cooldowns = new Map<string, number>();
  invulnUntil = 0;
  stunUntil = 0;
  dead = false;
  /** 受击半径（技能命中判定用） */
  hitRadius = 12;

  protected shadow: Phaser.GameObjects.Image;
  private hasSheet: boolean;
  private bobT = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, stats: Stats) {
    super(scene, x, y, texture);
    this.stats = stats;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0.5, 1);
    const bw = Math.max(10, this.width * 0.55), bh = Math.max(8, this.height * 0.22);
    this.body!.setSize(bw, bh);
    (this.body as Phaser.Physics.Arcade.Body).setOffset((this.width - bw) / 2, this.height - bh);
    this.hitRadius = Math.max(10, this.width * 0.4);
    this.shadow = scene.add.image(x, y, 'shadow').setOrigin(0.5, 0.5);
    this.shadow.setScale(this.width / 32, 1);
    this.hasSheet = ensureCharacterAnims(scene, texture);
  }

  /** 身体中心（技能/特效的发射点） */
  get centerY() { return this.y - this.height * 0.45; }

  isInvulnerable(time: number) { return time < this.invulnUntil; }

  canAfford(mp: number) { return this.stats.mp >= mp; }
  spendMp(mp: number) { this.stats.mp = Math.max(0, this.stats.mp - mp); this.onStatsChanged(); }

  heal(n: number) {
    if (this.dead) return;
    this.stats.hp = Math.min(this.stats.maxHp, this.stats.hp + n);
    this.onStatsChanged();
  }

  takeDamage(amount: number, fromX: number, fromY: number, knockback = 180, invulnMs = 250): boolean {
    const now = this.scene.time.now;
    if (this.dead || this.isInvulnerable(now)) return false;
    this.stats.hp = Math.max(0, this.stats.hp - amount);
    this.invulnUntil = now + invulnMs;
    this.stunUntil = now + 160;
    const v = new Phaser.Math.Vector2(this.x - fromX, this.y - fromY).normalize().scale(knockback);
    this.setVelocity(v.x, v.y);
    this.setTintFill(0xffffff);
    this.scene.time.delayedCall(80, () => this.active && this.clearTint());
    this.spawnDamageNumber(amount);
    this.onStatsChanged();
    if (this.stats.hp <= 0) { this.dead = true; this.onDeath(); }
    return true;
  }

  /** 根据速度播放动画；无 spritesheet 时做程序化弹跳。子类每帧在设置速度后调用。 */
  protected animateMovement(vx: number, vy: number, delta: number) {
    const moving = vx !== 0 || vy !== 0;
    if (moving) { this.dir = dirFromVector(vx, vy, this.dir); }
    if (this.hasSheet) {
      this.anims.play(`${this.texture.key}_${moving ? 'walk' : 'idle'}_${this.dir}`, true);
    } else {
      if (this.dir === 'left') this.setFlipX(true); else if (this.dir === 'right') this.setFlipX(false);
      this.bobT = moving ? this.bobT + delta * 0.018 : 0;
      this.setScale(1 + Math.sin(this.bobT * 2) * 0.03, 1 - Math.abs(Math.sin(this.bobT)) * 0.07);
    }
  }

  private spawnDamageNumber(n: number) {
    const color = this.team === 'player' ? '#ff8a8a' : '#ffffff';
    const t = this.scene.add.text(this.x, this.y - this.height, String(n), {
      fontFamily: 'sans-serif', fontSize: '16px', fontStyle: 'bold', color, stroke: '#3a4a52', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(this.y + DEPTH.FX_OFFSET);
    this.scene.tweens.add({ targets: t, y: t.y - 24, alpha: 0, duration: 650, ease: 'Cubic.easeOut', onComplete: () => t.destroy() });
  }

  protected onStatsChanged() {}
  protected abstract onDeath(): void;

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    this.setDepth(this.y);
    this.shadow.setPosition(this.x, this.y - 1).setDepth(this.y + DEPTH.SHADOW_OFFSET).setVisible(this.visible);
    if (this.isInvulnerable(time) && this.team === 'player') this.setAlpha(Math.floor(time / 60) % 2 ? 0.45 : 1);
    else this.setAlpha(1);
  }

  destroy(fromScene?: boolean) {
    this.shadow?.destroy();
    super.destroy(fromScene);
  }
}
