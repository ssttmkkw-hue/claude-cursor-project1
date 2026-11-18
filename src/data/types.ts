/** 所有数据文件（src/data 下的 JSON）的类型定义。格式说明见 docs/DATA_FORMATS.md。 */

export interface GroundTileDef { texture: string; solid?: boolean; variants?: number; }
export interface ObjectDef {
  texture: string;
  solid?: boolean;
  /** 占地（格），从图例字符所在格向右/向下延伸。默认 1x1 */
  footprint?: { w: number; h: number };
}
export interface TilesetDef {
  ground: Record<string, GroundTileDef>;
  objects: Record<string, ObjectDef>;
  legend: { ground: Record<string, string>; objects: Record<string, string> };
}

export interface MapExit {
  /** 格坐标的矩形区域 */
  x: number; y: number; w: number; h: number;
  to: string; // 目标地图 id
  spawn: string; // 目标地图的出生点名
}
export interface MapNpc { id: string; x: number; y: number; sprite: string; name?: string; dialog: string[]; }
export interface MapEnemy { type: string; x: number; y: number; }
export interface MapPickup { id: string; x: number; y: number; skill?: string; heal?: number; }

export interface MapDef {
  id: string;
  name: string;
  /** 可选：本图专用图例，覆盖 tiles.json 默认图例 */
  legend?: Partial<TilesetDef['legend']>;
  /** 地面层，每个字符 = 一格 */
  ground: string[];
  /** 物体层（树/石头/房子…），'.' 或空格 = 无。y 排序产生 2.5D 遮挡 */
  objects: string[];
  spawns: Record<string, { x: number; y: number }>;
  exits: MapExit[];
  npcs?: MapNpc[];
  enemies?: MapEnemy[];
  pickups?: MapPickup[];
  bgm?: string;
  /** 环境色调（乘色），如 "#ffe8d0" 做黄昏；可选 */
  tint?: string;
}

export type SkillType = 'melee' | 'projectile' | 'aoe' | 'heal' | string;
export interface SkillDef {
  id: string;
  name: string;
  description: string;
  type: SkillType;
  icon: string; // 纹理 key
  fx?: string; // 纹理 key
  color?: string; // 占位特效颜色
  cooldown: number; // ms
  mp: number;
  damage?: number;
  heal?: number;
  range?: number; // melee: 半径；projectile: 最大飞行距离
  arc?: number; // melee: 扇形角度（度）
  radius?: number; // aoe
  speed?: number; // projectile
  knockback?: number;
  /** 自定义参数，给扩展技能类型使用 */
  params?: Record<string, number | string | boolean>;
}

export interface EnemyDef {
  id: string;
  name: string;
  texture: string;
  hp: number;
  speed: number;
  contactDamage: number;
  aggroRange: number;
  /** 敌人也用技能系统；按顺序尝试释放 */
  skills: string[];
  exp: number;
  /** AI 类型，见 src/entities/ai/ */
  ai?: 'chaser' | 'ranged' | string;
  bodyScale?: number;
}
