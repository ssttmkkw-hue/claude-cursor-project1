import Phaser from 'phaser';
import { DEPTH, TILE } from '@/config';
import { Tileset } from '@/data/registry';
import type { MapDef, MapExit } from '@/data/types';
import { ensureTexture } from '@/art/placeholders';

/**
 * 地图构建：把 MapDef（字符网格 JSON）变成 Phaser 对象。
 *  - ground 层 → 一张 RenderTexture（一次绘制，性能好）
 *  - objects 层 → 独立 Image，按脚底 y 排序 → 2.5D 遮挡
 *  - 碰撞 → StaticGroup（水面按行合并，减少物理体数量）
 *  - exits → Zone，玩家进入即切图
 */
export interface BuiltMap {
  def: MapDef;
  cols: number; rows: number;
  widthPx: number; heightPx: number;
  solids: Phaser.Physics.Arcade.StaticGroup;
  exits: { zone: Phaser.GameObjects.Zone; exit: MapExit }[];
  spawnPoint(name: string): Phaser.Math.Vector2;
}

/** 简单确定性哈希，让草地变体每次加载都一样 */
const hash = (x: number, y: number) => ((x * 73856093) ^ (y * 19349663)) >>> 0;

export function buildMap(scene: Phaser.Scene, def: MapDef): BuiltMap {
  const rows = def.ground.length;
  const cols = Math.max(...def.ground.map((r) => r.length));
  const widthPx = cols * TILE, heightPx = rows * TILE;
  const groundLegend = { ...Tileset.legend.ground, ...def.legend?.ground };
  const objectLegend = { ...Tileset.legend.objects, ...def.legend?.objects };
  const solids = scene.physics.add.staticGroup();

  const addSolid = (x: number, y: number, w: number, h: number) => {
    const z = scene.add.zone(x + w / 2, y + h / 2, w, h);
    solids.add(z);
  };

  // ---------- 地面
  const rt = scene.add.renderTexture(0, 0, widthPx, heightPx).setOrigin(0, 0).setDepth(DEPTH.GROUND);
  // 先按纹理分组收集，再一次 beginDraw/endDraw 批量绘制。
  // 逐格 rt.drawFrame 会每格切一次 framebuffer，大地图在 WebGL 下会卡几十秒。
  const draws = new Map<string, [number, number][]>();
  for (let y = 0; y < rows; y++) {
    let runStart = -1;
    for (let x = 0; x <= cols; x++) {
      const ch = def.ground[y][x] ?? '.';
      const tileId = groundLegend[ch] ?? 'grass';
      const tile = Tileset.ground[tileId] ?? Tileset.ground.grass;
      const solid = x < cols && !!tile.solid;
      if (x < cols) {
        const v = tile.variants ? hash(x, y) % tile.variants : 0;
        const key = v > 0 && scene.textures.exists(`${tile.texture}_${v}`) ? `${tile.texture}_${v}` : tile.texture;
        const k = ensureTexture(scene, key);
        if (!draws.has(k)) draws.set(k, []);
        draws.get(k)!.push([x * TILE, y * TILE]);
      }
      if (solid && runStart < 0) runStart = x;
      if (!solid && runStart >= 0) { addSolid(runStart * TILE, y * TILE, (x - runStart) * TILE, TILE); runStart = -1; }
    }
  }

  rt.beginDraw();
  for (const [key, list] of draws) for (const [x, y] of list) rt.batchDrawFrame(key, undefined, x, y);
  rt.endDraw();

  // ---------- 物体
  def.objects.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      const objId = objectLegend[ch];
      if (!objId) return;
      const obj = Tileset.objects[objId];
      if (!obj) { console.warn(`[map] unknown object "${objId}"`); return; }
      const fw = obj.footprint?.w ?? 1, fh = obj.footprint?.h ?? 1;
      const baseX = x * TILE + (fw * TILE) / 2, baseY = (y + fh) * TILE;
      scene.add.image(baseX, baseY, ensureTexture(scene, obj.texture)).setOrigin(0.5, 1).setDepth(baseY);
      if (obj.solid) addSolid(x * TILE + 3, y * TILE + 6, fw * TILE - 6, fh * TILE - 8);
    });
  });
  solids.refresh();

  // ---------- 出口
  const exits = def.exits.map((exit) => {
    const zone = scene.add.zone((exit.x + exit.w / 2) * TILE, (exit.y + exit.h / 2) * TILE, exit.w * TILE, exit.h * TILE);
    scene.physics.add.existing(zone, true);
    return { zone, exit };
  });

  if (def.tint) {
    const c = Phaser.Display.Color.HexStringToColor(def.tint).color;
    scene.add.rectangle(0, 0, widthPx, heightPx, c, 0.18).setOrigin(0).setDepth(1e6).setBlendMode(Phaser.BlendModes.MULTIPLY);
  }

  return {
    def, cols, rows, widthPx, heightPx, solids, exits,
    spawnPoint(name) {
      const s = def.spawns[name] ?? def.spawns.default ?? { x: cols / 2, y: rows / 2 };
      return new Phaser.Math.Vector2((s.x + 0.5) * TILE, (s.y + 1) * TILE - 2);
    },
  };
}
