# 数据格式

改完任何数据都要跑 `npm run validate`。类型定义在 `src/data/types.ts`。

## 地图 `src/data/maps/<id>.json`

```jsonc
{
  "id": "forest",              // 必须与文件名一致
  "name": "翠风森林",           // 进入时显示的地名
  "spawns": {                  // 命名出生点（格坐标），至少要有 default
    "default": { "x": 3, "y": 23 },
    "from_village": { "x": 2, "y": 23 }
  },
  "exits": [                   // 出口：格坐标矩形，玩家碰到即切图
    { "x": 0, "y": 21, "w": 1, "h": 5, "to": "village", "spawn": "from_forest" }
  ],
  "npcs":    [{ "id": "elder", "x": 27, "y": 14, "sprite": "npc_elder", "name": "村长", "dialog": ["第一句", "第二句"] }],
  "enemies": [{ "type": "slime", "x": 14, "y": 33 }],
  "pickups": [{ "id": "wind_orb", "x": 30, "y": 8, "skill": "wind_blade" }],  // id 在本图内唯一；拾取后永久消失
  "legend":  { "objects": { "X": "rock" } },   // 可选：本图追加/覆盖图例
  "tint": "#ffd9b0",           // 可选：环境色调（黄昏、洞穴等）
  "bgm": "bgm_forest",         // 可选：预留，音频系统见 FEAT-02
  "ground":  ["....==....", "..."],   // 地面层：每个字符一格
  "objects": ["T..P....r.", "..."]    // 物体层：'.' = 空
}
```

### 规则

- `ground` 和 `objects` 行数相同、每行长度相同（= 地图宽度）。
- 坐标都是**格坐标**，左上角 (0,0)，1 格 = 32px。
- 出生点、NPC、拾取物、敌人必须放在可走格（validate 会检查）。
- 出口建议做在地图边缘，并在**对面地图**放一个对应的出生点，出生点离出口 2 格以上（避免一出生就又触发）。
- 物体字符标记的是占地区域的**左上角格**，占地向右/下延伸（如房子 3×2）；图像底边对齐占地底边，可以向上超出。
- 出口指向尚不存在的地图是允许的（validate 给警告，游戏里显示“道路尚未开放”）。

### 默认图例（`src/data/tiles.json`）

| 地面字符 | 类型 | | 物体字符 | 类型 |
|---|---|---|---|---|
| `.` | grass 草地（3 变体） | | `T` | tree 阔叶树 |
| `,` | flowers 花草地 | | `P` | pine 松树 |
| `=` | path 土路 | | `o` | bush 灌木 |
| `:` | sand 沙地 | | `r` | rock 石头 |
| `~` | water 水（不可走） | | `f` | fence 栅栏 |
| `b` | bridge 桥 | | `s` | sign 告示牌 |
| `_` | stone 石板 | | `H` | house 房子（3×2） |
| | | | `w` | well 水井 |

新增类型：在 `tiles.json` 的 `ground`/`objects` 加定义 + `legend` 加字符 + 提供纹理（占位图或美术）。

### 编写大地图的建议

手写 70×48 的字符网格容易出错。推荐写一个一次性生成脚本（放 `tools/`，可提交）生成 JSON，再手工微调。

## 技能 `src/data/skills.json`

```jsonc
"wind_blade": {
  "name": "风刃", "description": "射出一道穿透的风之刃。",
  "type": "projectile",        // melee | projectile | aoe | heal | 自定义注册类型
  "icon": "icon_wind_blade",   // 技能栏图标纹理 key（32x32）
  "fx": "fx_wind_blade",       // 特效纹理 key
  "color": "#9ff0d8",          // 无特效纹理时的占位颜色
  "cooldown": 700,             // 毫秒
  "mp": 6,
  "damage": 16,
  "speed": 460, "range": 380,  // projectile：速度、最大距离
  "knockback": 120,
  "params": { "pierce": true } // 类型特有参数
}
```

各类型使用的字段：

| 类型 | 字段 |
|---|---|
| melee | damage, range（半径 px）, arc（角度）, knockback |
| projectile | damage, speed, range, knockback, params.pierce |
| aoe | damage, radius, knockback |
| heal | heal |

## 敌人 `src/data/enemies.json`

```jsonc
"slime": {
  "name": "绿团子", "texture": "enemy_slime",
  "hp": 30, "speed": 70,
  "contactDamage": 6,     // 碰到玩家造成的伤害
  "aggroRange": 170,      // 发现玩家距离（px）
  "skills": ["slime_tackle"],  // 按顺序尝试释放
  "exp": 5,
  "ai": "chaser",         // chaser | ranged | 自定义
  "bodyScale": 1          // 可选：缩放（做大号变种）
}
```
