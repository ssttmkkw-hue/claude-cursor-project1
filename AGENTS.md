# AGENTS.md —— 给 AI 协作者的开工须知

本项目由 **Claude（核心框架）** 和 **Cursor / Cursor Agent（美术、内容、外围功能）** 协作开发。
Cursor 开工前请按顺序读：本文件 → `docs/cursor-tasks/README.md` → 你领取的任务卡 → 任务卡里列出的文档。

## 分工与“所有权”

| 区域 | 负责人 | Cursor 可以做什么 |
|---|---|---|
| `src/core/`、`src/systems/`、`src/entities/Combatant.ts` | Claude | **只读**。需要改动时，在 `docs/HANDOFF.md` 的“请求 Claude”里写需求 |
| `src/art/placeholders.ts` | 共有 | 可以新增占位图 key；不要删除已有 key |
| `src/art/manifest.ts` | Cursor | 登记正式美术资源（主要工作入口） |
| `public/assets/**` | Cursor | 放美术/音频文件 |
| `src/data/**`（JSON） | Cursor | 新地图、技能、敌人。改完必须 `npm run validate` |
| `src/scenes/UIScene.ts`、`src/entities/ai/`、新 Scene / 新 UI 组件 | Cursor | 可以修改、扩展 |
| `docs/cursor-tasks/` | 共有 | 领任务时改状态；完成时写结果 |

## 硬性规则

1. **游戏任何时候都必须能跑**：提交前跑 `npm run build` 和 `npm run validate`，都要通过。
2. **不改 key 名**：纹理 key、技能 id、敌人 id、地图 id、出生点名一旦被引用就不要改名。
3. **占位图兜底机制不能破坏**：manifest 里登记的文件加载失败时会回落到占位图，这是设计行为。
4. **一个任务卡 = 一个提交（或一个分支）**，提交信息以任务编号开头，如 `ART-01: 地面瓦片正式美术`。
5. 完成后在 `docs/HANDOFF.md` 追加一条记录（做了什么、有什么遗留、需要 Claude 做什么）。
6. 不引入新的运行时依赖（npm dependencies）除非任务卡允许；工具类 devDependencies 可以，写明用途。
7. 文本、注释用中文；代码标识符用英文。

## 常用命令

```bash
npm run dev        # 开发服务器 http://localhost:5173
npm run build      # 类型检查 + 打包（提交前必跑）
npm run validate   # 数据校验（改 src/data 后必跑）
```

调试：浏览器控制台里 `__game.scene.getScene('World')` 可拿到世界场景，例如
`__game.scene.getScene('World').goTo('forest', 'from_village')` 直接切图。
