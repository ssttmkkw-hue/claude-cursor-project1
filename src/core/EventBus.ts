import Phaser from 'phaser';

/** 跨 Scene 通信总线（WorldScene ⇄ UIScene ⇄ 系统）。事件名统一在 GameEvents 里登记。 */
export const EventBus = new Phaser.Events.EventEmitter();

export const GameEvents = {
  PLAYER_STATS: 'player:stats', // payload: PlayerStatsPayload
  SKILL_SLOTS: 'skills:slots', // payload: (string|null)[]
  SKILL_CAST: 'skills:cast', // payload: { slot, skillId, cooldown }
  SKILL_LEARNED: 'skills:learned', // payload: { skillId }
  MAP_ENTERED: 'map:entered', // payload: { mapId, name }
  TOAST: 'ui:toast', // payload: string
  DIALOG_OPEN: 'dialog:open', // payload: { speaker?, lines: string[], portrait? }
  DIALOG_CLOSED: 'dialog:closed',
  ENEMY_KILLED: 'enemy:killed', // payload: { type, exp }
  LEVEL_UP: 'player:levelup', // payload: { level }
  COMBATANT_HIT: 'combat:hit', // payload: CombatantHitPayload
  SKILL_ACTION: 'skills:action', // payload: { team, skillId, x, y } —— 任何单位成功施放技能
} as const;

export interface CombatantHitPayload {
  team: 'player' | 'enemy'; amount: number; x: number; y: number; killed: boolean;
}

export interface PlayerStatsPayload {
  hp: number; maxHp: number; mp: number; maxMp: number; level: number; exp: number; nextExp: number;
}
