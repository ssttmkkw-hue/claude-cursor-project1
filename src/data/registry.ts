import type { EnemyDef, MapDef, SkillDef, TilesetDef } from './types';
import tilesJson from './tiles.json';
import skillsJson from './skills.json';
import enemiesJson from './enemies.json';

/**
 * 数据注册表：所有 JSON 在这里汇总。
 * 地图自动发现：在 src/data/maps/ 放一个 <id>.json 即可，无需改代码。
 */
export const Tileset = tilesJson as TilesetDef;

export const Skills: Record<string, SkillDef> = Object.fromEntries(
  Object.entries(skillsJson as Record<string, Omit<SkillDef, 'id'>>).map(([id, s]) => [id, { id, ...s }]),
);

export const Enemies: Record<string, EnemyDef> = Object.fromEntries(
  Object.entries(enemiesJson as Record<string, Omit<EnemyDef, 'id'>>).map(([id, e]) => [id, { id, ...e }]),
);

const mapModules = import.meta.glob<MapDef>('./maps/*.json', { eager: true, import: 'default' });
export const Maps: Record<string, MapDef> = Object.fromEntries(
  Object.values(mapModules).map((m) => [m.id, m]),
);
