import Phaser from 'phaser';
import { DEPTH } from '@/config';
import { Skills } from '@/data/registry';
import type { SkillDef } from '@/data/types';
import type { Combatant, Team } from '@/entities/Combatant';

/**
 * 技能系统 —— 战斗的核心。
 * 技能 = 数据（src/data/skills.json）+ 类型处理器（本文件 / 自定义注册）。
 * 新增“同类型”技能：只改 JSON。新增“新类型”技能：registerSkillType('xxx', handler)。
 */

/** WorldScene 实现这个接口，技能系统只依赖它。 */
export interface CombatWorld extends Phaser.Scene {
  hostilesOf(team: Team): Combatant[];
  solids: Phaser.Physics.Arcade.StaticGroup;
}

export interface CastContext {
  world: CombatWorld;
  caster: Combatant;
  skill: SkillDef;
  /** 归一化的施放方向 */
  dir: Phaser.Math.Vector2;
}
export type SkillHandler = (ctx: CastContext) => void;

const handlers = new Map<string, SkillHandler>();
export function registerSkillType(type: string, handler: SkillHandler) { handlers.set(type, handler); }

/** 统一施放入口：检查冷却/MP → 执行 → 记冷却。返回是否成功。 */
export function tryCast(world: CombatWorld, caster: Combatant, skillId: string, time: number): boolean {
  const skill = Skills[skillId];
  if (!skill || caster.dead) return false;
  if ((caster.cooldowns.get(skillId) ?? 0) > time) return false;
  if (!caster.canAfford(skill.mp)) return false;
  const handler = handlers.get(skill.type);
  if (!handler) { console.warn(`[skill] no handler for type "${skill.type}"`); return false; }
  caster.spendMp(skill.mp);
  caster.cooldowns.set(skillId, time + skill.cooldown);
  handler({ world, caster, skill, dir: caster.facing.clone().normalize() });
  return true;
}

export function cooldownRemaining(caster: Combatant, skillId: string, time: number) {
  return Math.max(0, (caster.cooldowns.get(skillId) ?? 0) - time);
}

// ---------------------------------------------------------------- helpers

export function applyHit(ctx: CastContext, target: Combatant, damage = ctx.skill.damage ?? 0) {
  const hit = target.takeDamage(damage, ctx.caster.x, ctx.caster.y, ctx.skill.knockback ?? 160);
  if (hit) {
    const fx = ctx.world.add.image(target.x, target.centerY, 'fx_hit').setDepth(target.y + DEPTH.FX_OFFSET);
    ctx.world.tweens.add({ targets: fx, scale: 1.6, alpha: 0, duration: 180, onComplete: () => fx.destroy() });
    ctx.world.cameras.main.shake(60, 0.002);
  }
  return hit;
}

function colorOf(skill: SkillDef) { return Phaser.Display.Color.HexStringToColor(skill.color ?? '#ffffff').color; }

// ---------------------------------------------------------------- 内置类型

/** 近战扇形 */
registerSkillType('melee', (ctx) => {
  const { world, caster, skill, dir } = ctx;
  const range = skill.range ?? 48, halfArc = Phaser.Math.DegToRad((skill.arc ?? 90) / 2);
  const angle = dir.angle();
  const cx = caster.x, cy = caster.centerY;
  if (skill.fx && world.textures.exists(skill.fx)) {
    const fx = world.add.image(cx + dir.x * range * 0.45, cy + dir.y * range * 0.45, skill.fx)
      .setRotation(angle).setDepth(caster.y + DEPTH.FX_OFFSET).setScale(range / 40);
    world.tweens.add({ targets: fx, alpha: 0, scale: fx.scale * 1.2, duration: 160, onComplete: () => fx.destroy() });
  }
  for (const t of world.hostilesOf(caster.team)) {
    const dx = t.x - cx, dy = t.centerY - cy;
    if (Math.hypot(dx, dy) > range + t.hitRadius) continue;
    if (Math.abs(Phaser.Math.Angle.Wrap(Math.atan2(dy, dx) - angle)) > halfArc) continue;
    applyHit(ctx, t);
  }
});

/** 直线飞行道具；params.pierce = 穿透 */
registerSkillType('projectile', (ctx) => {
  const { world, caster, skill, dir } = ctx;
  const speed = skill.speed ?? 400, maxDist = skill.range ?? 320, pierce = !!skill.params?.pierce;
  const p = world.physics.add.image(caster.x + dir.x * 14, caster.centerY + dir.y * 14, skill.fx ?? 'fx_spore');
  p.setRotation(dir.angle()).setVelocity(dir.x * speed, dir.y * speed);
  (p.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
  const sx = p.x, sy = p.y, hitSet = new Set<Combatant>();
  const tick = () => {
    if (!p.active) return;
    p.setDepth(p.y + 16);
    if (Phaser.Math.Distance.Between(sx, sy, p.x, p.y) > maxDist || world.physics.overlap(p, world.solids)) return end();
    for (const t of world.hostilesOf(caster.team)) {
      if (hitSet.has(t) || t.dead) continue;
      if (Phaser.Math.Distance.Between(p.x, p.y, t.x, t.centerY) < t.hitRadius + 8) {
        hitSet.add(t); applyHit(ctx, t);
        if (!pierce) return end();
      }
    }
  };
  const end = () => { world.events.off(Phaser.Scenes.Events.UPDATE, tick); p.destroy(); };
  world.events.on(Phaser.Scenes.Events.UPDATE, tick);
  p.once(Phaser.GameObjects.Events.DESTROY, () => world.events.off(Phaser.Scenes.Events.UPDATE, tick));
});

/** 以施法者为中心的范围伤害 */
registerSkillType('aoe', (ctx) => {
  const { world, caster, skill } = ctx;
  const r = skill.radius ?? 80;
  const fxKey = skill.fx && world.textures.exists(skill.fx) ? skill.fx : null;
  const fx = fxKey
    ? world.add.image(caster.x, caster.centerY, fxKey).setScale(0.2)
    : world.add.circle(caster.x, caster.centerY, r, colorOf(skill), 0.35).setScale(0.2);
  fx.setDepth(caster.y + DEPTH.FX_OFFSET);
  world.tweens.add({ targets: fx, scale: fxKey ? (r * 2) / fx.width : 1, alpha: 0, duration: 380, ease: 'Cubic.easeOut', onComplete: () => fx.destroy() });
  for (const t of world.hostilesOf(caster.team)) {
    if (Phaser.Math.Distance.Between(caster.x, caster.centerY, t.x, t.centerY) <= r + t.hitRadius) applyHit(ctx, t);
  }
});

/** 自我治疗 */
registerSkillType('heal', (ctx) => {
  const { world, caster, skill } = ctx;
  caster.heal(skill.heal ?? 20);
  const fx = world.add.image(caster.x, caster.centerY, skill.fx ?? 'fx_heal').setDepth(caster.y + DEPTH.FX_OFFSET);
  world.tweens.add({ targets: fx, y: fx.y - 20, alpha: 0, duration: 600, onComplete: () => fx.destroy() });
});
