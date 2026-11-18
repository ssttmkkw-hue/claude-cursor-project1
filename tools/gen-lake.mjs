/**
 * 生成翠风湖畔地图 lake.json（64×44）。
 * 运行：node tools/gen-lake.mjs
 */
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const W = 64, H = 44;
const ground = Array.from({ length: H }, () => Array(W).fill('.'));
const objects = Array.from({ length: H }, () => Array(W).fill('.'));

const setG = (x, y, c) => { if (x >= 0 && y >= 0 && x < W && y < H) ground[y][x] = c; };
const setO = (x, y, c) => { if (x >= 0 && y >= 0 && x < W && y < H) objects[y][x] = c; };

// 中央大湖（椭圆）
const cx = 32, cy = 20, rx = 18, ry = 11;
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const nx = (x - cx) / rx, ny = (y - cy) / ry;
    if (nx * nx + ny * ny <= 1) setG(x, y, '~');
  }
}

// 湖心小岛
const ix = 32, iy = 18, ir = 4;
for (let y = iy - ir; y <= iy + ir; y++) {
  for (let x = ix - ir; x <= ix + ir; x++) {
    if ((x - ix) ** 2 + (y - iy) ** 2 <= ir * ir) setG(x, y, ',');
  }
}
setG(ix, iy, '_');

// 南岸小路环湖 + 通往小岛的桥（从南岸）
for (let x = 8; x < W - 8; x++) {
  setG(x, 33, '=');
  setG(x, 34, '=');
}
for (let y = 8; y <= 33; y++) {
  setG(10, y, '=');
  setG(11, y, '=');
  setG(52, y, '=');
  setG(53, y, '=');
}
for (let x = 10; x <= 53; x++) {
  setG(x, 8, '=');
  setG(x, 9, '=');
}

// 桥：南岸 (32,33) → 小岛 (32,22)
for (let y = 22; y <= 33; y++) {
  setG(31, y, 'b');
  setG(32, y, 'b');
  setG(33, y, 'b');
}

// 南入口通道
for (let y = 34; y < H; y++) {
  setG(31, y, '=');
  setG(32, y, '=');
  setG(33, y, '=');
}

// 花草点缀
for (let i = 0; i < 40; i++) {
  const x = 2 + ((i * 17) % (W - 4));
  const y = 2 + ((i * 11) % (H - 4));
  if (ground[y][x] === '.') setG(x, y, ',');
}

// 树环绕（避开路/水/桥/岛中心）
const treeOk = (x, y) => {
  const g = ground[y]?.[x];
  return g === '.' || g === ',';
};
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    if (!treeOk(x, y)) continue;
    const edge = x < 3 || x > W - 4 || y < 2 || y > H - 3;
    const dens = edge ? 0.55 : 0.12;
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    const r = n - Math.floor(n);
    if (r < dens) setO(x, y, r < dens * 0.45 ? 'P' : (r < dens * 0.75 ? 'T' : 'o'));
    else if (r > 0.92) setO(x, y, 'r');
  }
}
// 清出入口与桥附近物体
for (let y = 30; y < H; y++) for (let x = 28; x <= 36; x++) setO(x, y, '.');
for (let y = 8; y <= 34; y++) for (let x = 30; x <= 34; x++) if (ground[y][x] === 'b' || ground[y][x] === '=') setO(x, y, '.');
for (let y = iy - 2; y <= iy + 2; y++) for (let x = ix - 2; x <= ix + 2; x++) setO(x, y, '.');
setO(8, 36, 's');

const map = {
  id: 'lake',
  name: '翠风湖畔',
  tint: '#e0f0ff',
  bgm: 'bgm_lake',
  spawns: {
    default: { x: 32, y: 38 },
    from_forest: { x: 32, y: 40 },
  },
  exits: [
    { x: 30, y: 43, w: 5, h: 1, to: 'forest', spawn: 'from_lake' },
  ],
  npcs: [],
  enemies: [
    { type: 'slime', x: 14, y: 33 },
    { type: 'slime', x: 18, y: 9 },
    { type: 'mushroom', x: 22, y: 34 },
    { type: 'slime', x: 40, y: 33 },
    { type: 'mushroom', x: 52, y: 20 },
    { type: 'slime', x: 50, y: 9 },
    { type: 'slime', x: 11, y: 20 },
    { type: 'mushroom', x: 44, y: 9 },
    { type: 'slime', x: 26, y: 9 },
  ],
  pickups: [
    { id: 'lake_heal_orb', x: 32, y: 18, skill: 'heal' },
  ],
  ground: ground.map((r) => r.join('')),
  objects: objects.map((r) => r.join('')),
};

const out = join(dirname(fileURLToPath(import.meta.url)), '../src/data/maps/lake.json');
writeFileSync(out, `${JSON.stringify(map, null, 2)}\n`);
console.log(`wrote ${out} (${W}×${H})`);
