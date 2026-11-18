/**
 * 美术资源清单 —— Cursor 美术任务的唯一接入点。
 *
 * 规则：
 *  1. 把文件放进 public/assets/<分类>/，在下面加一行即可替换占位图（key 必须与占位图 key 相同）。
 *  2. 没有登记或加载失败的 key 会自动使用 src/art/placeholders.ts 里的程序化占位图，游戏永远能跑。
 *  3. 所有 key 的规格（尺寸、锚点、帧布局）见 docs/ART_SPEC.md。
 *
 * 示例：
 *   { key: 'tile_grass', type: 'image', url: 'assets/tiles/grass.svg' },
 *   { key: 'player', type: 'spritesheet', url: 'assets/characters/player.png', frameWidth: 32, frameHeight: 48 },
 */
export type AssetEntry =
  | { key: string; type: 'image'; url: string }
  | { key: string; type: 'svg'; url: string; width?: number; height?: number }
  | { key: string; type: 'spritesheet'; url: string; frameWidth: number; frameHeight: number }
  | { key: string; type: 'audio'; url: string | string[] };

export const ASSETS: AssetEntry[] = [
  // 多个 Agent 并行时：只在自己任务的分区里追加，避免合并冲突。
  // ===== ART-01 地面瓦片 =====
  { key: 'tile_grass', type: 'svg', url: 'assets/tiles/grass.svg', width: 32, height: 32 },
  { key: 'tile_grass_1', type: 'svg', url: 'assets/tiles/grass_1.svg', width: 32, height: 32 },
  { key: 'tile_grass_2', type: 'svg', url: 'assets/tiles/grass_2.svg', width: 32, height: 32 },
  { key: 'tile_flowers', type: 'svg', url: 'assets/tiles/flowers.svg', width: 32, height: 32 },
  { key: 'tile_path', type: 'svg', url: 'assets/tiles/path.svg', width: 32, height: 32 },
  { key: 'tile_sand', type: 'svg', url: 'assets/tiles/sand.svg', width: 32, height: 32 },
  { key: 'tile_water', type: 'svg', url: 'assets/tiles/water.svg', width: 32, height: 32 },
  { key: 'tile_bridge', type: 'svg', url: 'assets/tiles/bridge.svg', width: 32, height: 32 },
  { key: 'tile_stone', type: 'svg', url: 'assets/tiles/stone.svg', width: 32, height: 32 },

  // ===== ART-02 自然物体 =====

  // ===== ART-03 村庄建筑 =====

  // ===== ART-04 主角 =====

  // ===== ART-05 NPC =====

  // ===== ART-06 敌人 =====

  // ===== ART-07 技能特效/图标 =====

  // ===== ART-08 UI/字体 =====

  // ===== FEAT-02 音频 =====

  // ===== FEAT-04 标题画面 =====

  // ===== CONTENT-* 新内容用到的资源 =====
];
