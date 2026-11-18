# 线路 B · 角色 / 敌人 / 技能表现 + 技能菜单

> 双开模式下的第 2 个 Cursor Agent。另一个 Agent 走线路 A（场景美术），两条线改的文件不重叠，可以同时进行。

## 基本信息
- 仓库：`https://github.com/ssttmkkw-hue/claude-cursor-project1`
- 起点分支：`main`（如果 `main` 上还没有 `src/` 和 `AGENTS.md`，改用 `claude/magical-mendel-e0aji0`）
- **你的工作分支：`cursor/line-B`**（整条线都在这个分支上，一个任务一个提交）

## 开工前必读
1. `AGENTS.md`
2. `docs/ART_SPEC.md`（美术规格，重点看“角色 spritesheet 布局”）
3. `docs/ARCHITECTURE.md`（做技能菜单时读）

## 任务队列（按顺序做，做完一个提交一个）

| 顺序 | 任务卡 | 产出 | 提交信息 |
|---|---|---|---|
| 1 | `docs/cursor-tasks/ART-04-player-sprite.md` | `public/assets/characters/player.*` 4 方向行走 spritesheet | `ART-04: 主角行走动画` |
| 2 | `docs/cursor-tasks/ART-06-enemy-sprites.md` | `public/assets/enemies/` 史莱姆、孢子菇 | `ART-06: 敌人正式美术` |
| 3 | `docs/cursor-tasks/ART-07-skill-fx-icons.md` | `public/assets/fx/`、`public/assets/ui/` 特效与图标 | `ART-07: 技能特效与图标` |
| 4 | `docs/cursor-tasks/FEAT-01-skill-menu.md` | `src/scenes/SkillMenuScene.ts` | `FEAT-01: 技能装备菜单` |

## 你可以改的文件
- `public/assets/characters/`、`enemies/`、`fx/`、`ui/`（新增文件）
- `src/art/manifest.ts` —— **只在 `ART-04`、`ART-06`、`ART-07` 三个分区里追加**
- `src/scenes/SkillMenuScene.ts`（新建）、`src/main.ts`（注册场景）、`src/config.ts`（只加 `menu` 按键）
- `tools/` 下新建自己的脚本（如 SVG 拼 spritesheet 脚本，可加 devDependency）
- `docs/handoff/LINE-B.md`（新建，交接记录）

## 不要碰（线路 A 或 Claude 在用）
- `src/core/`、`src/systems/`、`src/entities/`、`src/data/`
- `src/art/placeholders.ts`
- manifest 里其它任务的分区

## 每个任务完成时
1. `npm run build` 和 `npm run validate` 都通过
2. `npm run dev` 打开浏览器亲眼看：四方向走路动画、去森林打怪看敌人和技能特效（技能宝珠在森林里，K/L 键释放）、Tab 打开技能菜单
3. `git commit`（提交信息见上表），`git push origin cursor/line-B`
4. 第一次推送后开一个 PR：`cursor/line-B` → `main`，标题“线路 B：角色/敌人/技能表现 + 技能菜单”；之后的提交会自动进这个 PR

## 全部完成后
新建 `docs/handoff/LINE-B.md`：
```markdown
# 线路 B 交接
- ART-04：完成 / 说明…
- ART-06：…
- ART-07：…
- FEAT-01：…
- 遗留问题：…
- 请求 Claude：…（没有写“无”）
```
提交 `LINE-B: 交接记录` 并推送，在 PR 描述里贴上每张任务卡验收标准的勾选情况。
