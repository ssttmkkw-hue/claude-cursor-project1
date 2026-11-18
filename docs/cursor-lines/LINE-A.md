# 线路 A · 场景美术 + 湖畔地图

> 双开模式下的第 1 个 Cursor Agent。另一个 Agent 走线路 B（角色/战斗），两条线改的文件不重叠，可以同时进行。

## 基本信息
- 仓库：`https://github.com/ssttmkkw-hue/claude-cursor-project1`
- 起点分支：`main`（如果 `main` 上还没有 `src/` 和 `AGENTS.md`，改用 `claude/magical-mendel-e0aji0`）
- **你的工作分支：`cursor/line-A`**（整条线都在这个分支上，一个任务一个提交）

## 开工前必读
1. `AGENTS.md`
2. `docs/ART_SPEC.md`（美术规格）
3. `docs/DATA_FORMATS.md`（做地图时读）

## 任务队列（按顺序做，做完一个提交一个）

| 顺序 | 任务卡 | 产出 | 提交信息 |
|---|---|---|---|
| 1 | `docs/cursor-tasks/ART-01-ground-tiles.md` | `public/assets/tiles/*.svg` 9 个地面瓦片 | `ART-01: 地面瓦片正式美术` |
| 2 | `docs/cursor-tasks/ART-02-nature-objects.md` | `public/assets/objects/` 树/松/灌木/石头 | `ART-02: 自然物体正式美术` |
| 3 | `docs/cursor-tasks/ART-03-village-props.md` | `public/assets/objects/` 房子/栅栏/告示牌/水井 | `ART-03: 村庄建筑正式美术` |
| 4 | `docs/cursor-tasks/CONTENT-02-lake-map.md` | `src/data/maps/lake.json` | `CONTENT-02: 湖畔地图` |

## 你可以改的文件
- `public/assets/tiles/`、`public/assets/objects/`（新增文件）
- `src/art/manifest.ts` —— **只在 `ART-01`、`ART-02`、`ART-03` 三个分区里追加**
- `src/data/maps/lake.json`（新建）
- `tools/` 下新建自己的脚本（如地图生成脚本）
- `docs/handoff/LINE-A.md`（新建，交接记录）

## 不要碰（线路 B 或 Claude 在用）
- `src/main.ts`、`src/config.ts`、`src/scenes/`、`src/entities/`、`src/core/`、`src/systems/`
- `src/art/placeholders.ts`、`src/data/tiles.json`、`skills.json`、`enemies.json`、已有地图
- manifest 里其它任务的分区

## 每个任务完成时
1. `npm run build` 和 `npm run validate` 都通过
2. `npm run dev` 打开浏览器亲眼看（村庄、森林；湖从森林北出口进）
3. `git commit`（提交信息见上表），`git push origin cursor/line-A`
4. 第一次推送后开一个 PR：`cursor/line-A` → `main`，标题“线路 A：场景美术 + 湖畔地图”；之后的提交会自动进这个 PR

## 全部完成后
新建 `docs/handoff/LINE-A.md`：
```markdown
# 线路 A 交接
- ART-01：完成 / 说明…
- ART-02：…
- ART-03：…
- CONTENT-02：…
- 遗留问题：…
- 请求 Claude：…（没有写“无”）
```
提交 `LINE-A: 交接记录` 并推送，在 PR 描述里贴上每张任务卡验收标准的勾选情况。
