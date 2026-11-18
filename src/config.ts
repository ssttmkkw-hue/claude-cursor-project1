/** 全局常量。改数值前先读 docs/ARCHITECTURE.md。 */
export const TILE = 32;
export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;

/** 深度规则：地面最底；世界物体按脚底 y 排序（2.5D 遮挡）；FX 在物体上方；UI 在独立 Scene。 */
export const DEPTH = {
  GROUND: -100000,
  SHADOW_OFFSET: -1, // 影子 = 角色深度 - 1
  FX_OFFSET: 5000,
} as const;

export const UI_FONT = '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif';

/** 按键绑定（Phaser KeyCodes 名称）。技能槽位 0..3 对应 SKILL_KEYS。 */
export const KEYS = {
  up: ['W', 'UP'],
  down: ['S', 'DOWN'],
  left: ['A', 'LEFT'],
  right: ['D', 'RIGHT'],
  dash: ['SPACE'],
  interact: ['E'],
  skills: ['J', 'K', 'L', 'I'],
  menu: ['TAB'],
} as const;

export const PLAYER_TUNING = {
  speed: 190,
  dashSpeed: 520,
  dashTime: 160, // ms
  dashCooldown: 550, // ms
  invulnAfterHit: 700, // ms
  mpRegenPerSec: 2,
} as const;

export const START_MAP = 'village';
export const SAVE_KEY = 'ccp1.save.v1';
