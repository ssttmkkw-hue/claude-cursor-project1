# 单线开发说明 · 第 2 轮（SOLO-2）

> v0.2 已全部完成并合并。本轮任务**只依赖已有接口**，与 Claude 正在做的 v0.3 核心（状态效果、剧情脚本、门/宝箱、Boss）互不冲突，可以同时进行。

## 分支
- 继续用 **`cursor/dev`**。开工前先把 Claude 的最新成果合进来：
```bash
git fetch origin
```
```bash
git merge origin/claude/magical-mendel-e0aji0
```
- 规则、提交、交接方式同 `SOLO.md`：一个任务一个提交，提交信息以任务编号开头；交接继续追加到 `docs/handoff/SOLO.md`。
- **本轮不要改** `src/scenes/WorldScene.ts`、`src/entities/`（`ai/` 除外）、`src/core/`、`src/systems/`（`InputMap.ts`、`AudioManager.ts` 除外）——Claude 正在改这些。

## 任务队列

### 1. `SFX-01` 受击音效
- 监听新事件 `GameEvents.COMBATANT_HIT`（payload：`team, amount, x, y, killed`），在 `AudioManager` 里播：玩家受击、敌人受击、敌人被击杀三种不同音效。
- 也可以监听 `SKILL_ACTION`（任何单位施放技能）给敌人技能加音效。
- 验收：三种音效可区分；同一帧多次命中不叠成爆音（做简单节流）。

### 2. `UI-01` 界面细节
- 对话框打开时隐藏技能栏（现在技能栏透出在对话框上）。
- 对话头像：`DIALOG_OPEN` payload 新增可选 `portrait`（纹理 key）。有头像时在对话框左侧显示，文字右移。
- 验收：有/无头像两种对话都正常。

### 3. `ART-09` 对话头像
- `portrait_elder`、`portrait_girl`、`portrait_fisher`（渔夫，按你在海边地图里用的 NPC）——256×256 半身像，清新日系，透明背景，登记 manifest。
- 在地图 JSON 的 NPC 里加 `"portrait": "portrait_elder"` 等字段。
- 验收：与村长、澪、渔夫对话时显示头像。

### 4. `ART-10` 主角动作帧
- 规格见 `docs/ART_SPEC.md` →「动作帧」：在 player spritesheet 行走 4 行下面加 `attack` 4 行（128×384）；可选再加 `cast` 4 行（128×576），并在 `skills.json` 里给法术类技能（风刃、霜华、治愈、火球…）写 `"anim": "cast"`。
- 用你的 `tools/build-sprites.mjs` 生成。
- 验收：按 J 挥砍有攻击动作，四方向正确；动作结束后恢复行走/站立。

### 5. `ART-11` 敌人动画
- 5 种敌人（slime / mushroom / bee / golem / flower）做成 4×4 行走 spritesheet（方向约定同角色，帧尺寸 = 各自现有尺寸），manifest 改为 spritesheet 登记（key 不变）。
- 可选：给 golem 加 attack 行。
- 验收：敌人移动时有动画。

### 6. `INPUT-01` 菜单手柄导航
- 标题画面、技能菜单支持手柄（十字键/摇杆 选择，A 确认，B 返回，Start/Select 开关技能菜单），走 `InputMap`。
- 验收：不碰键盘也能从标题进游戏、打开并操作技能菜单。

### 7. `ART-12` 物体扩充
- 房子变体 2 种（不同屋顶色）、海边：棕榈树、贝壳、浮木；森林/湖：树桩、蘑菇丛、芦苇。
- 在 `tiles.json` 加物体类型与字符（不要占用已有字符），`placeholders.ts` 加占位，地图里点缀使用。
- 验收：`npm run validate` 通过；村庄/海边/湖边视觉更丰富。

### 8. `CONTENT-04` 洞穴地图 `cave`
- 海边东出口已指向 `cave`（出生点 `from_beach`）。做一张约 56×40 的洞穴：`"tint": "#b8c0e0"` 偏暗，地面可新增 `cave_floor`/`cave_wall` 类型（`cave_wall` 为 solid），2–3 个新敌人（蝙蝠等，用已有 AI 类型）。
- 洞穴最深处留一块约 12×10 的空旷区域，**放一个告示牌标记“Boss 区域（v0.3 接入）”**，先不要放 Boss。
- 验收：海边 ⇄ 洞穴双向连通，`npm run validate` 通过。

## 全部完成后
推送 `cursor/dev`，在 PR 里贴验收勾选情况，然后停下来，等 Claude 的 v0.3 核心合流后再领下一轮（剧情、Boss）。
