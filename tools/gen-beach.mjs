/**
 * 生成海边地图 beach.json（60×36）。
 * 运行：node tools/gen-beach.mjs
 */
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const W = 60, H = 36;
const ground = Array.from({ length: H }, () => Array(W).fill('.'));
const objects = Array.from({ length: H }, () => Array(W).fill('.'));
const setG = (x, y, c) => { if (x >= 0 && y >= 0 && x < W && y < H) ground[y][x] = c; };
const setO = (x, y, c) => { if (x >= 0 && y >= 0 && x < W && y < H) objects[y][x] = c; };

// 北边草地 + 往南过渡到沙滩再到海
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    if (y < 10) setG(x, y, (x + y) % 7 === 0 ? ',' : '.');
    else if (y < 16) setG(x, y, y < 13 ? '.' : ':');
    else if (y < 24) setG(x, y, ':');
    else setG(x, y, '~'); // 大海
  }
}

// 北入口土路
for (let y = 0; y < 18; y++) {
  setG(28, y, '=');
  setG(29, y, '=');
  setG(30, y, '=');
  setG(31, y, '=');
}
// 沙滩横向小路
for (let x = 8; x < W - 8; x++) {
  setG(x, 18, '=');
  setG(x, 19, '=');
}

// 东侧预留洞穴口附近石地
for (let y = 14; y <= 20; y++) {
  setG(W - 3, y, '_');
  setG(W - 2, y, '_');
  setG(W - 1, y, '_');
}

// 北侧树丛
for (let y = 0; y < 12; y++) {
  for (let x = 0; x < W; x++) {
    if (x >= 26 && x <= 33) continue;
    const n = Math.sin(x * 9.1 + y * 4.7) * 43758.5453;
    const r = n - Math.floor(n);
    if (ground[y][x] === '.' || ground[y][x] === ',') {
      if (r < 0.22) setO(x, y, r < 0.1 ? 'T' : (r < 0.16 ? 'P' : 'o'));
      else if (r > 0.93) setO(x, y, 'r');
    }
  }
}
// 沙滩石头
for (let i = 0; i < 12; i++) {
  const x = 5 + (i * 7) % (W - 10);
  const y = 16 + (i % 3);
  if (ground[y][x] === ':') setO(x, y, 'r');
}
// 清出路
for (let y = 0; y < 20; y++) for (let x = 27; x <= 32; x++) setO(x, y, '.');
for (let x = 8; x < W - 8; x++) { setO(x, 18, '.'); setO(x, 19, '.'); }

const map = {
  id: 'beach',
  name: '拾浪海滩',
  tint: '#fff0d8',
  bgm: 'bgm_beach',
  spawns: {
    default: { x: 29, y: 4 },
    from_village: { x: 29, y: 3 },
  },
  exits: [
    { x: 27, y: 0, w: 6, h: 1, to: 'village', spawn: 'from_beach' },
    { x: 59, y: 15, w: 1, h: 5, to: 'cave', spawn: 'from_beach' },
  ],
  npcs: [
    {
      id: 'fisher',
      x: 22,
      y: 17,
      sprite: 'npc_elder',
      name: '渔夫',
      dialog: [
        '海风真舒服啊……',
        '东边那块石头后面好像有个洞，不过我可不敢进去。',
        '潮水里偶尔能捡到发光的东西，你也去看看吧。',
      ],
    },
  ],
  enemies: [
    { type: 'slime', x: 12, y: 18 },
    { type: 'slime', x: 20, y: 5 },
    { type: 'mushroom', x: 40, y: 18 },
    { type: 'slime', x: 45, y: 10 },
    { type: 'slime', x: 10, y: 4 },
    { type: 'mushroom', x: 50, y: 18 },
    { type: 'slime', x: 36, y: 5 },
  ],
  pickups: [
    { id: 'beach_wind_orb', x: 48, y: 19, skill: 'wind_blade' },
  ],
  ground: ground.map((r) => r.join('')),
  objects: objects.map((r) => r.join('')),
};

const out = join(dirname(fileURLToPath(import.meta.url)), '../src/data/maps/beach.json');
writeFileSync(out, `${JSON.stringify(map, null, 2)}\n`);
console.log(`wrote ${out} (${W}×${H})`);
