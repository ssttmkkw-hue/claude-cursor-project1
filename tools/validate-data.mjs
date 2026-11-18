#!/usr/bin/env node
// 数据校验：npm run validate
// 检查地图网格尺寸、图例字符、出生点/NPC/拾取物/敌人是否站在可走格、引用的技能/敌人/地图是否存在。
// Cursor / 任何人修改 src/data 后都应该跑一次。
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('../src/data/', import.meta.url).pathname;
const read = (p) => JSON.parse(readFileSync(join(root, p), 'utf8'));
const tiles = read('tiles.json');
const skills = read('skills.json');
const enemies = read('enemies.json');
const mapFiles = readdirSync(join(root, 'maps')).filter((f) => f.endsWith('.json'));
const maps = Object.fromEntries(mapFiles.map((f) => { const m = read(`maps/${f}`); return [m.id, { ...m, _file: f }]; }));

let errors = 0, warnings = 0;
const err = (m) => { errors++; console.log(`  ✗ ${m}`); };
const warn = (m) => { warnings++; console.log(`  ! ${m}`); };

for (const [id, e] of Object.entries(enemies)) for (const s of e.skills) if (!skills[s]) err(`enemy ${id}: unknown skill ${s}`);

for (const m of Object.values(maps)) {
  console.log(`map ${m.id} (${m._file})`);
  if (`${m.id}.json` !== m._file) warn(`file name should be ${m.id}.json`);
  const gl = { ...tiles.legend.ground, ...m.legend?.ground };
  const ol = { ...tiles.legend.objects, ...m.legend?.objects };
  const H = m.ground.length, W = m.ground[0].length;
  if (m.objects.length !== H) err(`objects has ${m.objects.length} rows, ground has ${H}`);
  m.ground.forEach((r, y) => { if (r.length !== W) err(`ground row ${y} length ${r.length} != ${W}`); [...r].forEach((c, x) => { if (!gl[c]) err(`ground (${x},${y}) unknown char '${c}'`); }); });
  m.objects.forEach((r, y) => { if (r.length !== W) err(`objects row ${y} length ${r.length} != ${W}`); [...r].forEach((c, x) => { if (c !== '.' && c !== ' ' && !ol[c]) err(`objects (${x},${y}) unknown char '${c}'`); }); });

  // 可走性网格
  const blocked = Array.from({ length: H }, (_, y) => Array.from({ length: W }, (_, x) => !!tiles.ground[gl[m.ground[y][x]]]?.solid));
  m.objects.forEach((r, y) => [...r].forEach((c, x) => {
    const o = tiles.objects[ol[c]]; if (!o?.solid) return;
    const fw = o.footprint?.w ?? 1, fh = o.footprint?.h ?? 1;
    for (let yy = y; yy < y + fh; yy++) for (let xx = x; xx < x + fw; xx++) if (blocked[yy]) blocked[yy][xx] = true;
  }));
  const walk = (what, x, y) => { if (x < 0 || y < 0 || x >= W || y >= H) err(`${what} (${x},${y}) out of bounds`); else if (blocked[y][x]) err(`${what} (${x},${y}) is on a blocked tile`); };

  if (!m.spawns.default) warn('no "default" spawn');
  for (const [n, s] of Object.entries(m.spawns)) walk(`spawn ${n}`, s.x, s.y);
  for (const n of m.npcs ?? []) walk(`npc ${n.id}`, n.x, n.y);
  for (const p of m.pickups ?? []) { walk(`pickup ${p.id}`, p.x, p.y); if (p.skill && !skills[p.skill]) err(`pickup ${p.id}: unknown skill ${p.skill}`); }
  for (const e of m.enemies ?? []) { walk(`enemy ${e.type}`, e.x, e.y); if (!enemies[e.type]) err(`unknown enemy type ${e.type}`); }
  for (const ex of m.exits) {
    if (!maps[ex.to]) warn(`exit → "${ex.to}" (map not created yet — 游戏内显示“道路尚未开放”)`);
    else if (!maps[ex.to].spawns[ex.spawn]) err(`exit → ${ex.to}: target spawn "${ex.spawn}" missing`);
  }
}
console.log(`\n${errors} error(s), ${warnings} warning(s)`);
process.exit(errors ? 1 : 0);
