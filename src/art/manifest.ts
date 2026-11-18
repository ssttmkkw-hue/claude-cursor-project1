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
  // ↓↓↓ Cursor：在此追加资源 ↓↓↓
];
