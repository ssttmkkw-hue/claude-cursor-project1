# Cursor 任务看板

## 工作流程

1. 读 [`/AGENTS.md`](../../AGENTS.md)（规则与文件所有权）
2. 在下表挑一个 **待领取** 且依赖已完成的任务，把状态改为 `进行中 (agent名/日期)`
3. 按任务卡做；任务卡里的“验收标准”全部满足
4. `npm run build` + `npm run validate` 通过
5. 状态改为 `已完成`，在 [`docs/HANDOFF.md`](../HANDOFF.md) 追加记录，提交（信息以任务编号开头）

多个 Cursor Agent 并行时：**每个 agent 只领一张卡**，美术卡之间互不冲突可以并行；改同一个文件（如 `manifest.ts`）时只追加行，不重排。

## 看板

| 编号 | 任务 | 类型 | 依赖 | 状态 |
|---|---|---|---|---|
| [ART-01](ART-01-ground-tiles.md) | 地面瓦片 | 美术 | — | 待领取 |
| [ART-02](ART-02-nature-objects.md) | 树木/石头/灌木等自然物体 | 美术 | — | 待领取 |
| [ART-03](ART-03-village-props.md) | 房子/栅栏/告示牌/水井 | 美术 | — | 待领取 |
| [ART-04](ART-04-player-sprite.md) | 主角 4 方向行走 spritesheet | 美术 | — | 待领取 |
| [ART-05](ART-05-npc-sprites.md) | NPC 立绘（村长、澪） | 美术 | ART-04（统一画风） | 待领取 |
| [ART-06](ART-06-enemy-sprites.md) | 敌人（史莱姆、孢子菇） | 美术 | — | 待领取 |
| [ART-07](ART-07-skill-fx-icons.md) | 技能特效 + 技能图标 | 美术 | — | 待领取 |
| [ART-08](ART-08-ui-skin.md) | HUD / 对话框 / 字体 皮肤 | 美术+UI | — | 待领取 |
| [FEAT-01](FEAT-01-skill-menu.md) | 技能装备菜单 | 功能 | — | 待领取 |
| [FEAT-02](FEAT-02-audio.md) | 音频系统（BGM/音效） | 功能 | — | 待领取 |
| [FEAT-03](FEAT-03-gamepad.md) | 手柄支持 | 功能 | — | 待领取 |
| [FEAT-04](FEAT-04-title-screen.md) | 标题画面 / 新游戏 / 继续 | 功能 | — | 待领取 |
| [CONTENT-01](CONTENT-01-beach-map.md) | 海边地图 `beach` | 内容 | ART-01 建议先做 | 待领取 |
| [CONTENT-02](CONTENT-02-lake-map.md) | 湖畔地图 `lake` | 内容 | — | 待领取 |
| [CONTENT-03](CONTENT-03-enemies-skills.md) | 新敌人 ×3、新技能 ×3（仅用已有类型） | 内容 | — | 待领取 |

## 新任务卡模板

```markdown
# <编号> · <标题>
**类型**：美术 / 功能 / 内容　**依赖**：…
## 目标
## 涉及文件
## 规格
## 验收标准
- [ ] …
- [ ] npm run build / npm run validate 通过
## 注意
```
