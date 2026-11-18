# 架构

## 总体

```
BootScene ──加载 manifest 资源 → 生成缺失占位图 → 读档──▶ WorldScene（一张地图）
                                                   └──▶ UIScene（HUD，常驻，叠加在上层）

WorldScene ⇄ UIScene 之间只通过 EventBus（src/core/EventBus.ts）通信。
持久数据只存在 GameState（src/core/GameState.ts），实体只是它的“视图”。
```

## 2.5D 的实现方式

- 俯视 3/4 视角，所有世界物体（角色、树、房子）**原点在脚底**（origin 0.5, 1）。
- `depth = y`：越靠下画得越靠前 → 角色能自然地走到树后、房子后。
- 物理碰撞体只覆盖“脚部”（角色）或“占地格”（物体），画面可以向上超出格子（树冠、屋顶）。
- 地面层一次性画进 RenderTexture，depth 最低。
- 角色脚下有半透明影子（纹理 key `shadow`）。

## 地图与切换

- 地图 = `src/data/maps/<id>.json`，**放进去自动注册**（`import.meta.glob`）。
- 每张图有若干命名出生点 `spawns` 和出口 `exits`（矩形区域 → 目标地图 + 目标出生点）。
- 切图 = `WorldScene.goTo(mapId, spawn)`：淡出 → `scene.restart` → 淡入。
- 目标地图不存在时不会报错，显示“道路尚未开放”并把玩家推回 —— 所以可以先留出口、后补地图。
- 地图大小不限（目前 50×34、70×48 格）；镜头跟随并限制在地图内。

## 战斗 / 技能

- `Combatant`（src/entities/Combatant.ts）：玩家/敌人/未来同伴/Boss 的共同基类。HP/MP、受击、击退、无敌帧、伤害数字、影子、动画。
- `SkillSystem`（src/systems/SkillSystem.ts）：
  - 技能 = JSON 数据 + 类型处理器。`tryCast(world, caster, skillId, time)` 是唯一施放入口（统一处理冷却和 MP）。
  - 内置类型：`melee`（扇形）、`projectile`（飞行道具，可穿透）、`aoe`（自身范围）、`heal`。
  - 新类型：`registerSkillType('dash_strike', (ctx) => {...})`。处理器只依赖 `CombatWorld` 接口（`hostilesOf(team)`、`solids`）。
  - 敌人也用同一套技能系统（`enemies.json` 的 `skills` 字段）。
- 技能获得：地图上的技能宝珠（`pickups[].skill`）→ `GameState.learn()` → 自动进入空槽。以后可以加：NPC 传授、升级获得、技能书、技能树。
- 技能槽：`GameState.data.slots`（4 个）。换装 UI 见任务 FEAT-01。

## 敌人 AI

- `src/entities/ai/index.ts` 注册表：`registerAI(name, fn)`，`enemies.json` 用 `"ai": "name"` 选用。
- 内置：`chaser`（追击近战）、`ranged`（保持距离射击）。闲置时在出生点附近游荡。

## 美术接入

- `src/art/manifest.ts`：登记正式资源（image / svg / spritesheet / audio）。
- `src/art/placeholders.ts`：每个 key 的程序化占位图；**尺寸即规格**。
- 加载顺序：manifest → 缺失的 key 用占位图生成 → 再缺失的（拼错 key）显示洋红方块并在控制台警告。
- 角色动画约定见 `src/systems/CharacterAnimator.ts` 与 docs/ART_SPEC.md。

## 存档

- `GameState.save()`：localStorage，key `ccp1.save.v1`；每次进入地图自动保存。
- 新增存档字段：加默认值到 `defaultSave()`；结构不兼容时 bump `version` 并写迁移。
- 清档：浏览器控制台 `localStorage.clear()` 后刷新。

## 扩展点一览

| 想加的东西 | 怎么加 | 需要改核心吗 |
|---|---|---|
| 新地图 | `src/data/maps/xxx.json` + 在相邻地图加 exit | 否 |
| 新地面/物体类型 | `tiles.json` + 占位图/美术 | 否 |
| 新技能（已有类型） | `skills.json` | 否 |
| 新技能类型 | `registerSkillType` | 否（新文件里注册即可，在 main.ts import） |
| 新敌人 | `enemies.json` + 纹理 | 否 |
| 新 AI | `registerAI` | 否 |
| 新 UI 面板 | 新 Scene 或 UIScene 内组件，走 EventBus | 否 |
| 新事件 | `GameEvents` 里登记 | 轻微（共享文件，追加即可） |
| 同伴、装备、任务系统、剧情脚本 | — | 是，交给 Claude（见 ROADMAP） |
