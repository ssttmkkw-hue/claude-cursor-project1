import { SAVE_KEY, START_MAP } from '@/config';
import { EventBus, GameEvents } from './EventBus';

/** 存档结构。新增字段时：加默认值到 defaultSave()，并 bump version + 在 migrate() 里处理旧档。 */
export interface SaveData {
  version: 1;
  mapId: string;
  spawn: string;
  player: { hp: number; maxHp: number; mp: number; maxMp: number; level: number; exp: number };
  learned: string[];
  slots: (string | null)[]; // 4 个技能槽
  flags: Record<string, boolean | number | string>;
}

function defaultSave(): SaveData {
  return {
    version: 1,
    mapId: START_MAP,
    spawn: 'default',
    player: { hp: 100, maxHp: 100, mp: 40, maxMp: 40, level: 1, exp: 0 },
    learned: ['slash'],
    slots: ['slash', null, null, null],
    flags: {},
  };
}

export const expToNext = (level: number) => 20 + (level - 1) * 15;

/** 全局唯一的“持久状态”。场景切换/读档都只走这里，实体只是它的视图。 */
class GameStateImpl {
  data: SaveData = defaultSave();

  reset() { this.data = defaultSave(); }

  save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(this.data)); } catch { /* 隐私模式等 */ }
  }

  load(): boolean {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      this.data = { ...defaultSave(), ...JSON.parse(raw) };
      return true;
    } catch { return false; }
  }

  learn(skillId: string): boolean {
    if (this.data.learned.includes(skillId)) return false;
    this.data.learned.push(skillId);
    const empty = this.data.slots.indexOf(null);
    if (empty >= 0) this.data.slots[empty] = skillId;
    EventBus.emit(GameEvents.SKILL_LEARNED, { skillId });
    EventBus.emit(GameEvents.SKILL_SLOTS, this.data.slots);
    return true;
  }

  equip(slot: number, skillId: string | null) {
    if (skillId && !this.data.learned.includes(skillId)) return;
    this.data.slots[slot] = skillId;
    EventBus.emit(GameEvents.SKILL_SLOTS, this.data.slots);
  }

  addExp(n: number) {
    const p = this.data.player;
    p.exp += n;
    while (p.exp >= expToNext(p.level)) {
      p.exp -= expToNext(p.level);
      p.level++;
      p.maxHp += 12; p.maxMp += 5;
      p.hp = p.maxHp; p.mp = p.maxMp;
      EventBus.emit(GameEvents.LEVEL_UP, { level: p.level });
    }
  }

  getFlag<T extends boolean | number | string>(key: string, fallback: T): T {
    return (this.data.flags[key] as T) ?? fallback;
  }
  setFlag(key: string, value: boolean | number | string) { this.data.flags[key] = value; }
}

export const GameState = new GameStateImpl();
