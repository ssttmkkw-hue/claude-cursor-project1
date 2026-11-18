import Phaser from 'phaser';
import { EventBus, GameEvents } from '@/core/EventBus';
import { GameState } from '@/core/GameState';
import type { EnemyDef } from '@/data/types';
import { tryCast, type CombatWorld } from '@/systems/SkillSystem';
import { Combatant } from './Combatant';
import { getAI, type AIContext } from './ai';

export class Enemy extends Combatant {
  readonly team = 'enemy' as const;
  home: Phaser.Math.Vector2;
  memory = { nextWander: 0, wanderVec: [0, 0] as [number, number] };
  private ai;

  constructor(private world: CombatWorld, x: number, y: number, readonly def: EnemyDef) {
    super(world, x, y, def.texture, { hp: def.hp, maxHp: def.hp, mp: 999, maxMp: 999 });
    this.home = new Phaser.Math.Vector2(x, y);
    this.ai = getAI(def.ai);
    this.setCollideWorldBounds(true);
    if (def.bodyScale) this.setScale(def.bodyScale);
  }

  move(vx: number, vy: number) { this.setVelocity(vx, vy); }
  faceToward(t: { x: number; y: number }) { this.facing.set(t.x - this.x, t.y - this.y).normalize(); }
  castNext(time: number) { for (const id of this.def.skills) if (tryCast(this.world, this, id, time)) return true; return false; }

  update(ctx: AIContext) {
    if (this.dead || ctx.time < this.stunUntil) return;
    this.ai(this, ctx);
    const b = this.body as Phaser.Physics.Arcade.Body;
    this.animateMovement(Math.sign(b.velocity.x), Math.sign(b.velocity.y), ctx.delta);
  }

  protected onDeath() {
    EventBus.emit(GameEvents.ENEMY_KILLED, { type: this.def.id, exp: this.def.exp });
    GameState.addExp(this.def.exp);
    this.body!.enable = false;
    this.scene.tweens.add({
      targets: this, alpha: 0, scaleX: 1.4, scaleY: 0.3, duration: 260,
      onComplete: () => this.destroy(),
    });
  }
}
