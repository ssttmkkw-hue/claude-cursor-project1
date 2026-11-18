import Phaser from 'phaser';
import { PLAYER_TUNING } from '@/config';
import { EventBus, GameEvents } from '@/core/EventBus';
import { GameState, expToNext } from '@/core/GameState';
import { tryCast, type CombatWorld } from '@/systems/SkillSystem';
import { Skills } from '@/data/registry';
import { InputMap } from '@/systems/InputMap';
import { Combatant } from './Combatant';

/** 玩家：8 方向移动 + 冲刺（带无敌帧）+ 4 个技能槽。stats 直接引用 GameState，不需要同步。 */
export class Player extends Combatant {
  readonly team = 'player' as const;
  inputLocked = false;
  /** 靠近可交互物时，A / E 优先交互（由 WorldScene 设置）。 */
  preferInteract = false;
  private controls: InputMap;
  private dashUntil = 0;
  private dashReadyAt = 0;
  private dashDir = new Phaser.Math.Vector2();
  private regenAcc = 0;

  constructor(private world: CombatWorld, x: number, y: number) {
    super(world, x, y, 'player', GameState.data.player);
    this.controls = new InputMap(world as unknown as Phaser.Scene);
    this.setCollideWorldBounds(true);
    this.onStatsChanged();
  }

  justPressedInteract() {
    return this.controls.justPressed('interact');
  }

  update(time: number, delta: number) {
    if (this.dead) return;
    this.regen(delta);
    if (this.inputLocked) { this.setVelocity(0, 0); this.animateMovement(0, 0, delta); this.controls.endFrame(); return; }
    if (time < this.stunUntil) { this.controls.endFrame(); return; }

    // --- 冲刺
    if (time < this.dashUntil) {
      this.setVelocity(this.dashDir.x * PLAYER_TUNING.dashSpeed, this.dashDir.y * PLAYER_TUNING.dashSpeed);
      this.controls.endFrame();
      return;
    }
    const v = this.controls.axis();
    if (v.x || v.y) this.facing.copy(v);

    if (this.controls.justPressed('dash') && time >= this.dashReadyAt) {
      this.dashDir.copy(v.x || v.y ? v : this.facing);
      this.dashUntil = time + PLAYER_TUNING.dashTime;
      this.dashReadyAt = time + PLAYER_TUNING.dashCooldown;
      this.invulnUntil = Math.max(this.invulnUntil, time + PLAYER_TUNING.dashTime + 60);
      this.spawnDashTrail();
      this.controls.endFrame();
      return;
    }

    this.setVelocity(v.x * PLAYER_TUNING.speed, v.y * PLAYER_TUNING.speed);
    this.animateMovement(v.x, v.y, delta);

    // --- 技能（靠近交互物时 A/技能0 让给交互）
    (['skill0', 'skill1', 'skill2', 'skill3'] as const).forEach((action, slot) => {
      if (!this.controls.justPressed(action)) return;
      if (slot === 0 && this.preferInteract) return;
      const id = GameState.data.slots[slot];
      if (id && tryCast(this.world, this, id, time)) {
        EventBus.emit(GameEvents.SKILL_CAST, { slot, skillId: id, cooldown: Skills[id].cooldown });
      }
    });

    this.controls.endFrame();
  }
  private regen(delta: number) {
    this.regenAcc += (delta / 1000) * PLAYER_TUNING.mpRegenPerSec;
    if (this.regenAcc >= 1 && this.stats.mp < this.stats.maxMp) {
      this.stats.mp = Math.min(this.stats.maxMp, this.stats.mp + Math.floor(this.regenAcc));
      this.regenAcc %= 1;
      this.onStatsChanged();
    } else if (this.stats.mp >= this.stats.maxMp) this.regenAcc = 0;
  }

  private spawnDashTrail() {
    for (let i = 0; i < 3; i++) {
      this.scene.time.delayedCall(i * 45, () => {
        if (!this.active) return;
        const ghost = this.scene.add.image(this.x, this.y, this.texture.key, this.frame.name)
          .setOrigin(0.5, 1).setAlpha(0.5).setTint(0xbff6ff).setDepth(this.depth - 1).setFlipX(this.flipX);
        this.scene.tweens.add({ targets: ghost, alpha: 0, duration: 220, onComplete: () => ghost.destroy() });
      });
    }
  }

  takeDamage(amount: number, fromX: number, fromY: number, knockback = 180) {
    return super.takeDamage(amount, fromX, fromY, knockback, PLAYER_TUNING.invulnAfterHit);
  }

  protected onStatsChanged() {
    const p = GameState.data.player;
    EventBus.emit(GameEvents.PLAYER_STATS, { ...p, nextExp: expToNext(p.level) });
  }

  protected onDeath() {
    this.setVelocity(0, 0);
    this.scene.events.emit('player-died');
  }
}
