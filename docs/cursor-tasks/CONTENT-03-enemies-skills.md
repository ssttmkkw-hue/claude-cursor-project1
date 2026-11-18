# CONTENT-03 · 新敌人与新技能
**类型**：内容（+ 占位美术）　**依赖**：无

## 目标
只用现有的技能类型（melee / projectile / aoe / heal）和 AI 类型（chaser / ranged），扩充内容。

## 要求
- 3 个新敌人（例：蜜蜂 —— 快速 chaser；石头人 —— 高血慢速、aoe 震地；花妖 —— ranged 三连射可用短冷却实现）。在 `enemies.json` 定义，`placeholders.ts` 加占位图（或直接画正式美术）。
- 3 个新玩家技能（例：火球 projectile 不穿透高伤；旋风斩 aoe 小范围低冷却；三连斩 melee 大扇形）。在 `skills.json` 定义，配图标/特效 key（占位或正式）。
- 把新技能宝珠和新敌人放进现有或新地图。

## 验收标准
- [ ] 数值平衡：Lv1 玩家用斩击 3–4 下打死普通敌人；新技能各有用途，不完全覆盖旧技能
- [ ] `npm run validate` 0 错误、`npm run build` 通过

## 注意
需要新的技能类型（如位移技能、召唤、持续伤害、减速）或新 AI 行为时，写进 HANDOFF 的“请求 Claude”。
