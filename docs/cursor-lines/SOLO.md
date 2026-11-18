# 单线开发说明（SOLO）

> 当前只用 **一个** Cursor Agent，按顺序把剩下的任务做完。多线方案（LINE-A / LINE-B / KICKOFF）已停用，不用管。

## 基本信息
- 仓库：`https://github.com/ssttmkkw-hue/claude-cursor-project1`
- **起点分支：`claude/magical-mendel-e0aji0`**（已包含线路 A、B 的全部成果 + Claude 的性能修复）
- **你的工作分支：`cursor/dev`**（从上面的起点新建；以后一直在这个分支上做，一个任务一个提交）

```bash
git fetch origin
```
```bash
git switch -c cursor/dev origin/claude/magical-mendel-e0aji0
```
```bash
npm install
```

> 如果你本地还在 `cursor/line-B`：那条线已经全部合进起点分支，直接按上面新建 `cursor/dev` 即可，不要再往 line-A / line-B 推。

## 已完成（不用再做）
ART-01 地面、ART-02 自然物体、ART-04 主角、ART-06 敌人、ART-07 特效/图标、FEAT-01 技能菜单。

## 任务队列（按顺序，一个任务一个提交）

| # | 任务卡 | 一句话 | 提交信息 |
|---|---|---|---|
| 1 | `docs/cursor-tasks/ART-03-village-props.md` | 房子/栅栏/告示牌/水井正式美术（村里现在还是占位房子） | `ART-03: 村庄建筑正式美术` |
| 2 | `docs/cursor-tasks/ART-05-npc-sprites.md` | 村长、澪，画风对齐已有主角 | `ART-05: NPC 正式美术` |
| 3 | `docs/cursor-tasks/ART-08-ui-skin.md` | HUD/对话框皮肤、字体、打字机效果；技能菜单也统一成同一套皮肤 | `ART-08: UI 皮肤` |
| 4 | `docs/cursor-tasks/FEAT-04-title-screen.md` | 标题画面：新游戏/继续 | `FEAT-04: 标题画面` |
| 5 | `docs/cursor-tasks/CONTENT-02-lake-map.md` | 湖畔地图（森林北出口） | `CONTENT-02: 湖畔地图` |
| 6 | `docs/cursor-tasks/CONTENT-01-beach-map.md` | 海边地图（村庄南出口） | `CONTENT-01: 海边地图` |
| 7 | `docs/cursor-tasks/CONTENT-03-enemies-skills.md` | 3 个新敌人 + 3 个新技能，放进湖/海边 | `CONTENT-03: 新敌人与技能` |
| 8 | `docs/cursor-tasks/FEAT-02-audio.md` | BGM + 音效（素材须 CC0/可商用，记 CREDITS） | `FEAT-02: 音频` |
| 9 | `docs/cursor-tasks/FEAT-03-gamepad.md` | 手柄支持 | `FEAT-03: 手柄` |

单线模式下，ART-02/ART-03 卡里的“可选加分”（新物体类型、房子变体）也可以做了，可以改 `src/data/tiles.json` 和 `placeholders.ts`。

## 规则（与 AGENTS.md 一致，重点几条）
- 不改 `src/core/`、`src/systems/`、`src/entities/Combatant.ts`；需要改就写进交接记录的“请求 Claude”，然后**跳过那部分继续做下一个任务**，不要卡住。
- 不改已有的 key / id / 出生点名。
- 每个任务完成：`npm run build` + `npm run validate` 通过 → `npm run dev` 浏览器里亲眼看 → 提交 → `git push origin cursor/dev`。
- 每个任务完成后在 `docs/handoff/SOLO.md` 里追加一段（做了什么 / 遗留 / 请求 Claude），随该任务一起提交。
- 同时把 `docs/cursor-tasks/README.md` 看板里对应任务改成“已完成”（单线模式下可以改）。
- 第一次推送后开 PR：`cursor/dev` → `main`，标题“Cursor 单线开发：v0.2 剩余任务”，之后的提交自动进这个 PR。

## 什么时候停下来叫 Claude
- 9 个任务做完（或剩下的都被“请求 Claude”卡住）
- `npm run build` 失败且原因在核心代码里
- 游戏明显卡顿 / 报错，且不是你改的部分引起的
