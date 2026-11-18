import Phaser from 'phaser';
import { TILE } from '@/config';

/**
 * 程序化占位美术。只在 manifest 没提供同名 key 时生成。
 * 这里的尺寸 = 正式美术应遵守的尺寸（见 docs/ART_SPEC.md）。
 * 风格目标：清新日式动漫，低饱和粉彩 + 柔和描边。
 */
type Painter = (g: Phaser.GameObjects.Graphics) => void;
interface Placeholder { w: number; h: number; paint: Painter; }

const C = {
  outline: 0x3a4a52,
  grass: 0x9fdc8a, grassDark: 0x86c977, grassLight: 0xb8e8a0,
  path: 0xe8d6a8, pathDark: 0xd8c290,
  sand: 0xf2e3b6, water: 0x7ccbe8, waterLight: 0xb4e6f5,
  stone: 0xc9cdd2, wood: 0xb98a5a, woodDark: 0x8f6540,
  leaf: 0x6cc77a, leafDark: 0x4fae66, leafLight: 0x9fe09a,
  roof: 0xe58f8f, wall: 0xfff4e0,
  skin: 0xffe3cf, hair: 0x6b8fd6, cloth: 0xffffff, accent: 0x7fd3c4,
} as const;

function speckle(g: Phaser.GameObjects.Graphics, color: number, n: number, seed: number) {
  const rnd = new Phaser.Math.RandomDataGenerator([String(seed)]);
  g.fillStyle(color, 1);
  for (let i = 0; i < n; i++) g.fillRect(rnd.between(2, TILE - 4), rnd.between(2, TILE - 4), 2, 3);
}

function grass(seed: number): Painter {
  return (g) => { g.fillStyle(C.grass).fillRect(0, 0, TILE, TILE); speckle(g, C.grassDark, 6, seed); speckle(g, C.grassLight, 3, seed + 7); };
}

/** 角色：32x48，脚底在底边中点。占位只画单帧（朝下）。 */
function character(hair: number, cloth: number): Placeholder {
  return {
    w: 32, h: 48,
    paint: (g) => {
      g.lineStyle(2, C.outline);
      g.fillStyle(cloth).fillRoundedRect(8, 24, 16, 18, 5).strokeRoundedRect(8, 24, 16, 18, 5); // 身体
      g.fillStyle(C.outline).fillRect(10, 42, 4, 5).fillRect(18, 42, 4, 5); // 腿
      g.fillStyle(C.skin).fillCircle(16, 16, 11).strokeCircle(16, 16, 11); // 头
      g.fillStyle(hair).fillEllipse(16, 9, 24, 12); // 头发
      g.fillStyle(C.outline).fillEllipse(12, 18, 3, 5).fillEllipse(20, 18, 3, 5); // 大眼睛
      g.fillStyle(0xffffff).fillRect(11, 16, 1, 2).fillRect(19, 16, 1, 2);
      g.fillStyle(0xffb3b3, 0.7).fillCircle(9, 21, 2).fillCircle(23, 21, 2); // 腮红
    },
  };
}

function orbIcon(color: number, glyph: Painter): Placeholder {
  return { w: 32, h: 32, paint: (g) => { g.fillStyle(0x24343c).fillRoundedRect(0, 0, 32, 32, 6); g.fillStyle(color).fillCircle(16, 16, 11); glyph(g); } };
}

export const PLACEHOLDERS: Record<string, Placeholder> = {
  // ---------- 地面 32x32 ----------
  tile_grass: { w: TILE, h: TILE, paint: grass(1) },
  tile_grass_1: { w: TILE, h: TILE, paint: grass(2) },
  tile_grass_2: { w: TILE, h: TILE, paint: grass(3) },
  tile_flowers: { w: TILE, h: TILE, paint: (g) => { grass(4)(g); g.fillStyle(0xffffff).fillCircle(8, 9, 2).fillCircle(22, 20, 2); g.fillStyle(0xffb7d5).fillCircle(14, 25, 2).fillCircle(25, 7, 2); } },
  tile_path: { w: TILE, h: TILE, paint: (g) => { g.fillStyle(C.path).fillRect(0, 0, TILE, TILE); speckle(g, C.pathDark, 5, 9); } },
  tile_sand: { w: TILE, h: TILE, paint: (g) => { g.fillStyle(C.sand).fillRect(0, 0, TILE, TILE); speckle(g, C.pathDark, 3, 11); } },
  tile_water: { w: TILE, h: TILE, paint: (g) => { g.fillStyle(C.water).fillRect(0, 0, TILE, TILE); g.fillStyle(C.waterLight).fillRect(5, 9, 10, 2).fillRect(18, 22, 9, 2); } },
  tile_bridge: { w: TILE, h: TILE, paint: (g) => { g.fillStyle(C.water).fillRect(0, 0, TILE, TILE); g.fillStyle(C.wood); for (let x = 0; x < TILE; x += 8) g.fillRect(x, 2, 7, 28); g.fillStyle(C.woodDark).fillRect(0, 2, TILE, 2).fillRect(0, 28, TILE, 2); } },
  tile_stone: { w: TILE, h: TILE, paint: (g) => { g.fillStyle(C.stone).fillRect(0, 0, TILE, TILE); g.lineStyle(1, 0xaab0b6).strokeRect(0.5, 0.5, 15, 15).strokeRect(16.5, 16.5, 15, 15); } },

  // ---------- 物体（底边中点锚定，可向上超出格子） ----------
  obj_tree: { w: 64, h: 80, paint: (g) => {
    g.fillStyle(C.woodDark).fillRect(27, 50, 10, 26);
    g.fillStyle(C.leafDark).fillCircle(32, 34, 28); g.fillStyle(C.leaf).fillCircle(28, 28, 22); g.fillStyle(C.leafLight).fillCircle(22, 20, 8);
  } },
  obj_pine: { w: 48, h: 80, paint: (g) => {
    g.fillStyle(C.woodDark).fillRect(20, 62, 8, 16);
    g.fillStyle(0x3f9c6a).fillTriangle(24, 4, 4, 66, 44, 66); g.fillStyle(0x5bbf86).fillTriangle(24, 4, 10, 46, 30, 46);
  } },
  obj_bush: { w: 32, h: 32, paint: (g) => { g.fillStyle(C.leafDark).fillEllipse(16, 20, 30, 22); g.fillStyle(C.leaf).fillEllipse(13, 16, 18, 14); g.fillStyle(0xff9fb8).fillCircle(22, 14, 2); } },
  obj_rock: { w: 32, h: 32, paint: (g) => { g.fillStyle(0x9aa3ab).fillEllipse(16, 21, 28, 20); g.fillStyle(0xc7ced4).fillEllipse(13, 17, 14, 9); } },
  obj_fence: { w: 32, h: 32, paint: (g) => { g.fillStyle(C.wood).fillRect(3, 8, 5, 22).fillRect(24, 8, 5, 22).fillRect(0, 13, 32, 4).fillRect(0, 22, 32, 4); } },
  obj_sign: { w: 32, h: 40, paint: (g) => { g.fillStyle(C.woodDark).fillRect(14, 20, 4, 20); g.fillStyle(C.wood).fillRoundedRect(3, 6, 26, 16, 3); g.fillStyle(C.woodDark).fillRect(7, 11, 18, 2).fillRect(7, 15, 12, 2); } },
  obj_well: { w: 32, h: 48, paint: (g) => { g.fillStyle(C.woodDark).fillRect(4, 8, 3, 26).fillRect(25, 8, 3, 26); g.fillStyle(C.roof).fillTriangle(16, 0, 0, 12, 32, 12); g.fillStyle(C.stone).fillEllipse(16, 38, 30, 18); g.fillStyle(C.water).fillEllipse(16, 36, 18, 8); } },
  obj_house: { w: 96, h: 112, paint: (g) => {
    g.fillStyle(C.wall).fillRect(8, 48, 80, 62); g.lineStyle(2, C.outline).strokeRect(8, 48, 80, 62);
    g.fillStyle(C.roof).fillTriangle(48, 4, 0, 54, 96, 54); g.fillStyle(0xf2b0a6).fillTriangle(48, 14, 16, 48, 80, 48);
    g.fillStyle(C.wood).fillRect(40, 78, 16, 32); g.fillStyle(0xa8dcf0).fillRect(16, 62, 16, 14).fillRect(64, 62, 16, 14);
  } },

  // ---------- 角色 / NPC 32x48 ----------
  player: character(C.hair, C.cloth),
  npc_elder: character(0xdddddd, 0xb6a6e0),
  npc_girl: character(0xf2a35e, 0xffc6d9),

  // ---------- 敌人 ----------
  enemy_slime: { w: 32, h: 28, paint: (g) => {
    g.fillStyle(0x7fd36b).fillEllipse(16, 18, 30, 20).fillCircle(16, 12, 10); g.fillStyle(0xc9f5b8).fillEllipse(11, 10, 6, 4);
    g.fillStyle(C.outline).fillCircle(12, 16, 2).fillCircle(20, 16, 2);
  } },
  enemy_mushroom: { w: 32, h: 36, paint: (g) => {
    g.fillStyle(0xfff0dc).fillRoundedRect(10, 16, 12, 18, 4); g.fillStyle(0xc58be8).fillEllipse(16, 13, 30, 20);
    g.fillStyle(0xffffff).fillCircle(9, 10, 3).fillCircle(21, 7, 2).fillCircle(23, 15, 2); g.fillStyle(C.outline).fillCircle(13, 25, 1.5).fillCircle(19, 25, 1.5);
  } },
  enemy_bee: { w: 28, h: 28, paint: (g) => {
    g.fillStyle(0xcfefff, 0.7).fillEllipse(8, 12, 10, 6).fillEllipse(20, 12, 10, 6);
    g.fillStyle(0xf2d35e).fillEllipse(14, 16, 18, 14); g.fillStyle(C.outline).fillRect(6, 13, 16, 2).fillRect(6, 17, 16, 2);
    g.fillStyle(C.outline).fillCircle(11, 14, 1.3).fillCircle(17, 14, 1.3);
  } },
  enemy_golem: { w: 40, h: 44, paint: (g) => {
    g.fillStyle(0x8a939c).fillRect(12, 28, 6, 12).fillRect(22, 28, 6, 12);
    g.fillStyle(0x9aa3ab).fillRoundedRect(8, 14, 24, 18, 4); g.fillStyle(0xb0b8c0).fillRoundedRect(11, 4, 18, 14, 4);
    g.fillStyle(C.outline).fillCircle(15, 11, 2).fillCircle(25, 11, 2);
  } },
  enemy_flower: { w: 32, h: 40, paint: (g) => {
    g.fillStyle(0x5cba74).fillRect(14, 22, 4, 16); g.fillStyle(0xff9fb8).fillCircle(16, 5, 5).fillCircle(8, 12, 5).fillCircle(24, 12, 5);
    g.fillStyle(0xffe28a).fillCircle(16, 14, 5); g.fillStyle(C.outline).fillCircle(13, 13, 1.3).fillCircle(19, 13, 1.3);
  } },

  // ---------- 通用 ----------
  shadow: { w: 32, h: 12, paint: (g) => { g.fillStyle(0x000000, 0.22).fillEllipse(16, 6, 28, 10); } },
  pickup_orb: { w: 24, h: 24, paint: (g) => { g.fillStyle(0xbff6ff, 0.5).fillCircle(12, 12, 12); g.fillStyle(0xffffff).fillCircle(12, 12, 7); g.fillStyle(0x7fe0ff).fillCircle(12, 12, 5); } },
  interact_hint: { w: 16, h: 16, paint: (g) => { g.fillStyle(0xffffff).fillRoundedRect(0, 0, 16, 16, 4); g.fillStyle(C.outline).fillRect(7, 3, 2, 7).fillRect(7, 12, 2, 2); } },

  // ---------- 技能特效 ----------
  fx_slash: { w: 64, h: 64, paint: (g) => { g.lineStyle(6, 0xffffff, 0.9); g.beginPath(); g.arc(32, 32, 26, -1.0, 1.0); g.strokePath(); g.lineStyle(3, 0xbff6ff, 0.8); g.beginPath(); g.arc(32, 32, 20, -0.8, 0.8); g.strokePath(); } },
  fx_wind_blade: { w: 32, h: 16, paint: (g) => { g.fillStyle(0x9ff0d8, 0.9).fillEllipse(16, 8, 30, 10); g.fillStyle(0xffffff).fillEllipse(20, 8, 14, 4); } },
  fx_frost_nova: { w: 64, h: 64, paint: (g) => { g.lineStyle(4, 0xa8d8ff).strokeCircle(32, 32, 29); g.fillStyle(0xe0f2ff, 0.35).fillCircle(32, 32, 27); } },
  fx_heal: { w: 48, h: 48, paint: (g) => { g.fillStyle(0xffe28a, 0.35).fillCircle(24, 24, 22); g.fillStyle(0xfff6d0).fillRect(21, 10, 6, 28).fillRect(10, 21, 28, 6); } },
  fx_spore: { w: 16, h: 16, paint: (g) => { g.fillStyle(0xd7a6ff).fillCircle(8, 8, 6); g.fillStyle(0xffffff).fillCircle(6, 6, 2); } },
  fx_hit: { w: 24, h: 24, paint: (g) => { g.fillStyle(0xffffff).fillTriangle(12, 0, 15, 12, 9, 12).fillTriangle(12, 24, 9, 12, 15, 12).fillTriangle(0, 12, 12, 9, 12, 15).fillTriangle(24, 12, 12, 15, 12, 9); } },

  // ---------- 技能图标 32x32 ----------
  icon_slash: orbIcon(0xe9f6ff, (g) => { g.lineStyle(3, C.outline); g.lineBetween(10, 22, 22, 10); }),
  icon_wind_blade: orbIcon(0x9ff0d8, (g) => { g.fillStyle(0xffffff).fillEllipse(16, 16, 16, 5); }),
  icon_frost_nova: orbIcon(0xa8d8ff, (g) => { g.lineStyle(2, 0xffffff).strokeCircle(16, 16, 6); }),
  icon_heal: orbIcon(0xffe28a, (g) => { g.fillStyle(0xffffff).fillRect(14, 9, 4, 14).fillRect(9, 14, 14, 4); }),
  fx_fireball: { w: 24, h: 24, paint: (g) => { g.fillStyle(0xff8f5a).fillCircle(12, 12, 9); g.fillStyle(0xffd07a).fillCircle(12, 12, 6); } },
  fx_whirlwind: { w: 64, h: 64, paint: (g) => { g.fillStyle(0x9ff0d8, 0.25).fillCircle(32, 32, 28); g.lineStyle(4, 0x9ff0d8, 0.9); g.beginPath(); g.arc(32, 32, 22, 0, 4.5); g.strokePath(); } },
  fx_triple_slash: { w: 64, h: 64, paint: (g) => { g.lineStyle(3, 0xffffff, 0.9); g.beginPath(); g.arc(32, 28, 22, -0.8, 0.6); g.strokePath(); g.beginPath(); g.arc(32, 34, 22, -0.6, 0.8); g.strokePath(); } },
  icon_fireball: orbIcon(0xff8f5a, (g) => { g.fillStyle(0xffd07a).fillCircle(16, 16, 6); }),
  icon_whirlwind: orbIcon(0x9ff0d8, (g) => { g.lineStyle(2, 0xffffff); g.beginPath(); g.arc(16, 16, 7, 0, 4); g.strokePath(); }),
  icon_triple_slash: orbIcon(0xe9f6ff, (g) => { g.lineStyle(2, C.outline); g.lineBetween(9, 11, 22, 9); g.lineBetween(9, 16, 23, 16); g.lineBetween(9, 21, 22, 23); }),
};

/** 为所有缺失的 key 生成占位纹理。 */
export function generateMissingPlaceholders(scene: Phaser.Scene) {
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  for (const [key, ph] of Object.entries(PLACEHOLDERS)) {
    if (scene.textures.exists(key)) continue;
    g.clear();
    ph.paint(g);
    g.generateTexture(key, ph.w, ph.h);
  }
  g.destroy();
}

/** 兜底：任何地方引用了不存在的纹理，用醒目的洋红方块代替并在控制台提示。 */
export function ensureTexture(scene: Phaser.Scene, key: string, w = 32, h = 32): string {
  if (scene.textures.exists(key)) return key;
  console.warn(`[art] missing texture "${key}" — add it to src/art/placeholders.ts or src/art/manifest.ts`);
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  g.fillStyle(0xff00ff).fillRect(0, 0, w, h);
  g.generateTexture(key, w, h);
  g.destroy();
  return key;
}
