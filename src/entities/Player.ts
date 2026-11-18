import Phaser from 'phaser';
import { KEYS, PLAYER_TUNING } from '@/config';
import { EventBus, GameEvents } from '@/core/EventBus';
import { GameState, expToNext } from '@/core/GameState';
import { tryCast, type CombatWorld } from '@/systems/SkillSystem';
import { Skills } from '@/data/registry';
import { Combatant } from './Combatant';

type KeyGroup = Phaser.Input.Keyboard.Key[];

/** 玩家：8 方向移动 + 冲刺（带无敌帧）+ 4 个技能槽。stats 直接引用 GameState，不需要同步。 */
export class Player extends Combatant {
  readonly team = 'player' as const;
  inputLocked = false;
  private keys: Record<'up' | 'down' | 'left' | 'right' | 'dash' | 'interact', KeyGroup>;
  private skillKeys: Phaser.Input.Keyboard.Key[];
  private dashUntil = 0;
  private dashReadyAt = 0;
  private dashDir = new Phaser.Math.Vector2();
  private regenAcc = 0;

  constructor(private world: CombatWorld, x: number, y: number) {
    super(world, x, y, 'player', GameState.data.player);
    const kb = world.input.keyboard!;
    const group = (names: readonly string[]) => names.map((n) => kb.addKey(n));
    this.keys = {
      up: group(KEYS.up), down: group(KEYS.down), left: group(KEYS.left), right: group(KEYS.right),
      dash: group(KEYS.dash), interact: group(KEYS.interact),
    };
    this.skillKeys = KEYS.skills.map((k) => kb.addKey(k));
    this.setCollideWorldBounds(true);
    this.onStatsChanged();
  }

  private down(g: KeyGroup) { return g.some((k) => k.isDown); }
  justPressedInteract() { return this.keys.interact.some((k) => Phaser.Input.Keyboard.JustDown(k)); }

  update(time: number, delta: number) {
    if (this.dead) return;
    this.regen(delta);
    if (this.inputLocked) { this.setVelocity(0, 0); this.animateMovement(0, 0, delta); return; }
    if (time < this.stunUntil) return;

    // --- 冲刺
    if (time < this.dashUntil) {
      this.setVelocity(this.dashDir.x * PLAYER_TUNING.dashSpeed, this.dashDir.y * PLAYER_TUNING.dashSpeed);
      return;
    }
    const ix = (this.down(this.keys.right) ? 1 : 0) - (this.down(this.keys.left) ? 1 : 0);
    const iy = (this.down(this.keys.down) ? 1 : 0) - (this.down(this.keys.up) ? 1 : 0);
    const v = new Phaser.Math.Vector2(ix, iy).normalize();
    if (ix || iy) this.facing.copy(v);

    if (this.keys.dash.some((k) => Phaser.Input.Keyboard.JustDown(k)) && time >= this.dashReadyAt) {
      this.dashDir.copy(ix || iy ? v : this.facing);
      this.dashUntil = time + PLAYER_TUNING.dashTime;
      this.dashReadyAt = time + PLAYER_TUNING.dashCooldown;
      this.invulnUntil = Math.max(this.invulnUntil, time + PLAYER_TUNING.dashTime + 60);
      this.spawnDashTrail();
      return;
    }

    this.setVelocity(v.x * PLAYER_TUNING.speed, v.y * PLAYER_TUNING.speed);
    this.animateMovement(v.x, v.y, delta);

    // --- 技能
    this.skillKeys.forEach((key, slot) => {
      if (!Phaser.Input.Keyboard.JustDown(key)) return;
      const id = GameState.data.slots[slot];
      if (id && tryCast(this.world, this, id, time)) {
        EventBus.emit(GameEvents.SKILL_CAST, { slot, skillId: id, cooldown: Skills[id].cooldown });
      }
    });
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
