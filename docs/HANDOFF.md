# 交接记录（HANDOFF）

汇总记录。并行开发时各任务的交接写在 `docs/handoff/<任务编号>.md`，合并后由 Claude 汇总到这里。

## 请求 Claude（需要改核心代码的需求）

> 格式：`- [ ] (来源任务) 需求描述 —— 原因`

- （暂无）

---

## 记录

### 2026-11-18 · Claude · 合并线路 A/B，转为单线开发
- 合并 `cursor/line-B`（ART-04、ART-06、ART-07、FEAT-01，全部完成）和 `cursor/line-A`（ART-01、ART-02 完成；ART-03、CONTENT-02 未做）到 `claude/magical-mendel-e0aji0`，无冲突。
- 核心修复：`MapBuilder` 地面绘制改为按纹理分组批量绘制（beginDraw/batchDrawFrame/endDraw）。原先逐格绘制在换上 SVG 美术后，进森林会卡死主线程约 57 秒（无头浏览器测得），修复后瞬间完成。
- 实测：村庄/森林/斩击/敌人/技能菜单正常；build、validate 通过。
- 之后改为单个 Cursor Agent 按 `docs/cursor-lines/SOLO.md` 顺序开发，分支 `cursor/dev`。

### 2026-11-18 · Claude · v0.1.0 基础框架
- 完成：Phaser+TS+Vite 工程；数据驱动的地图（字符网格 JSON，出入口切图）、技能系统（melee/projectile/aoe/heal 四类，可注册新类型）、战斗单位基类、玩家（8 向移动/冲刺/4 技能槽）、敌人 + AI 注册表、NPC 对话、技能宝珠拾取、经验升级、存档、HUD。
- 美术：全部为 `src/art/placeholders.ts` 的程序化占位图，等待 ART-* 任务替换。
- 内容：清风村、翠风森林两张图；`beach`、`lake` 两个出口已预留但地图未创建（CONTENT-01/02）。
