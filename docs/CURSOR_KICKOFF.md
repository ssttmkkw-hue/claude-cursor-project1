# Cursor 开工说明（多线并行版）

> **只开两个 Agent（双开）时**，直接用 [`docs/cursor-lines/LINE-A.md`](cursor-lines/LINE-A.md) 和 [`LINE-B.md`](cursor-lines/LINE-B.md)，下面的分波计划可以跳过。

## 0. 仓库与分支

- 仓库：`https://github.com/ssttmkkw-hue/claude-cursor-project1`
- **主线分支：`main`**。所有任务分支都从最新的 `main` 拉出，做完以 PR 合回 `main`。
- 任务分支命名：`cursor/<任务编号>`，例如 `cursor/ART-01`。
- Claude 的分支：`claude/...`，Cursor 不要往上面推。
- 版本备份：每一波合并完，在 `main` 上打 tag（`v0.2.0` …），见 `docs/ROADMAP.md`。

> 前置条件：v0.1.0 框架必须已经合进 `main`（`main` 上能看到 `src/`、`AGENTS.md`、本文件）。没有的话先在 GitHub 上把 `claude/magical-mendel-e0aji0` 合并进 `main`。

## 1. 环境准备（每个工作目录做一次）

```bash
git clone https://github.com/ssttmkkw-hue/claude-cursor-project1.git
```
```bash
cd claude-cursor-project1 && npm install && npm run dev
```

浏览器打开 http://localhost:5173 ，能走动、按 J 攻击就说明环境正常。

## 2. 并行的方式（重要）

**多个 Agent 不能共用同一个文件夹同时切不同分支**，否则会互相覆盖。二选一：

- **方式 A（推荐）：Cursor Background Agents / 云端 Agent**。每个 Agent 有自己的仓库副本，直接给它下面第 4 节的提示词即可。
- **方式 B：本地 git worktree**，每个任务一个独立目录，各开一个 Cursor 窗口：
  ```bash
  git worktree add ../p1-ART-01 -b cursor/ART-01 main
  ```
  然后在 Cursor 里打开 `../p1-ART-01`，在该目录 `npm install`。做完合并后 `git worktree remove ../p1-ART-01`。

## 3. 分波计划

同一波里的任务互不依赖、改的文件基本不重叠，可以同时开工。**一波全部合进 main 之后再开下一波。**

### 第 1 波（8 个 Agent 并行）

| Agent | 任务卡 | 会改的共享文件 |
|---|---|---|
| 1 | ART-01 地面瓦片 | manifest.ts（ART-01 分区） |
| 2 | ART-02 自然物体 | manifest.ts（ART-02 分区） |
| 3 | ART-03 村庄建筑 | manifest.ts（ART-03 分区） |
| 4 | ART-04 主角 spritesheet | manifest.ts（ART-04 分区） |
| 5 | ART-06 敌人 | manifest.ts（ART-06 分区） |
| 6 | ART-07 技能特效/图标 | manifest.ts（ART-07 分区） |
| 7 | FEAT-01 技能装备菜单 | main.ts、config.ts |
| 8 | CONTENT-02 湖畔地图 | 只新增 maps/lake.json |

第 1 波额外约束：**不要改 `src/data/tiles.json`、`placeholders.ts` 和已有地图**（ART-02/03 卡里“可选加分”的新物体类型留到第 2 波以后再做）。

### 第 2 波（7 个 Agent 并行，第 1 波合并后开始）

| Agent | 任务卡 | 备注 |
|---|---|---|
| 1 | ART-05 NPC | 画风对齐已合并的 ART-04 主角 |
| 2 | ART-08 UI 皮肤 | 改 UIScene.ts、index.html、config.ts 的 UI_FONT |
| 3 | FEAT-02 音频 | 改 main.ts |
| 4 | FEAT-03 手柄 | 改 main.ts |
| 5 | FEAT-04 标题画面 | 改 main.ts、BootScene.ts 末尾 |
| 6 | CONTENT-01 海边地图 | 可加新物体类型（tiles.json / placeholders.ts） |
| 7 | CONTENT-03 新敌人与技能 | 改 skills.json、enemies.json、placeholders.ts |

第 2 波里 FEAT-02/03/04 都会在 `main.ts` 注册东西，CONTENT-01/03 可能都追加 `placeholders.ts`，合并时会有**小冲突**：逐个合并，冲突处两边都保留即可。

### 第 2 波之后

全部合并、打 tag `v0.2.0`，然后交给 Claude 做 v0.3 核心系统（见 ROADMAP）。

## 4. 给每个 Agent 的提示词（复制后改两处 `<>`）

```text
你在 GitHub 仓库 ssttmkkw-hue/claude-cursor-project1 上工作（Phaser 3 + TypeScript 的 2.5D 日式动漫风 ARPG）。
你的任务：<任务编号，如 ART-01>，任务卡文件 docs/cursor-tasks/<任务卡文件名>。

步骤：
1. 依次阅读：AGENTS.md → docs/CURSOR_KICKOFF.md → 你的任务卡 → 任务卡提到的文档（通常是 docs/ART_SPEC.md 或 docs/DATA_FORMATS.md）。
2. 从最新的 main 新建分支 cursor/<任务编号>，只做这一张任务卡的内容。
3. 规则：
   - 不修改 src/core/、src/systems/、src/entities/Combatant.ts；需要改核心就写进交接记录的“请求 Claude”。
   - 不改已有的纹理 key、技能/敌人/地图 id、出生点名。
   - src/art/manifest.ts 只在自己任务的分区里追加。
   - 不改 docs/HANDOFF.md 和任务看板的状态表。
   - 不新增运行时依赖。
4. 完成后：npm run build 和 npm run validate 都必须通过；用 npm run dev 在浏览器里亲眼确认效果。
5. 新建 docs/handoff/<任务编号>.md 写交接记录（完成了什么 / 遗留 / 请求 Claude）。
6. 提交，提交信息以 "<任务编号>: " 开头；推送分支 cursor/<任务编号>，并开 PR 到 main，PR 描述贴上验收标准的勾选情况。
```

## 5. 合并（由你，或专门开一个“合并 Agent”来做）

每个 PR：
1. 看 PR 的验收清单和截图
2. 合进 `main`（有冲突就两边都保留，再跑一遍检查）
3. 在 `main` 上跑 `npm run build && npm run validate`，打开游戏看一眼
4. 更新 `docs/cursor-tasks/README.md` 看板状态为“已完成”

一波全部合完后：
```bash
git tag -a v0.2.0 -m "第 1/2 波：正式美术与外围功能"
```
```bash
git push origin v0.2.0
```

## 6. 什么时候叫 Claude

- `docs/handoff/` 里出现了“请求 Claude”
- 一波合并完，准备进入下一版本（v0.3 核心系统）
- 合并后游戏跑不起来、且问题在核心代码里
