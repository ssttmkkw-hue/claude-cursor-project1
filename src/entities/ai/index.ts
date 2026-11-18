import Phaser from 'phaser';
import type { Enemy } from '../Enemy';
import type { Player } from '../Player';

/**
 * 敌人 AI 注册表。enemies.json 里的 "ai" 字段对应这里的 key。
 * 新 AI：registerAI('boss_x', (e, ctx) => { ... })，在 update 里设置速度并按需 e.castNext()。
 */
export interface AIContext { player: Player; time: number; delta: number; }
export type AIFn = (e: Enemy, ctx: AIContext) => void;

const registry = new Map<string, AIFn>();
export function registerAI(name: string, fn: AIFn) { registry.set(name, fn); }
export function getAI(name: string | undefined): AIFn { return registry.get(name ?? 'chaser') ?? registry.get('chaser')!; }

/** 闲逛：在出生点附近随机走动 */
function wander(e: Enemy, time: number) {
  if (time > e.memory.nextWander) {
    e.memory.nextWander = time + Phaser.Math.Between(1200, 2600);
    const back = Phaser.Math.Distance.Between(e.x, e.y, e.home.x, e.home.y) > 96;
    const a = back ? Phaser.Math.Angle.Between(e.x, e.y, e.home.x, e.home.y) : Math.random() * Math.PI * 2;
    e.memory.wanderVec = Math.random() < 0.35 && !back ? [0, 0] : [Math.cos(a), Math.sin(a)];
  }
  const [x, y] = e.memory.wanderVec;
  e.move(x * e.def.speed * 0.5, y * e.def.speed * 0.5);
}

registerAI('chaser', (e, { player, time }) => {
  const d = Phaser.Math.Distance.Between(e.x, e.y, player.x, player.y);
  if (player.dead || d > e.def.aggroRange) return wander(e, time);
  const a = Phaser.Math.Angle.Between(e.x, e.y, player.x, player.y);
  e.faceToward(player);
  if (d < 40) { e.move(0, 0); e.castNext(time); return; }
  e.move(Math.cos(a) * e.def.speed, Math.sin(a) * e.def.speed);
});

registerAI('ranged', (e, { player, time }) => {
  const d = Phaser.Math.Distance.Between(e.x, e.y, player.x, player.y);
  if (player.dead || d > e.def.aggroRange) return wander(e, time);
  const a = Phaser.Math.Angle.Between(e.x, e.y, player.x, player.y);
  e.faceToward(player);
  const s = d < 110 ? -1 : d > 190 ? 1 : 0;
  e.move(Math.cos(a) * e.def.speed * s, Math.sin(a) * e.def.speed * s);
  e.castNext(time);
});
