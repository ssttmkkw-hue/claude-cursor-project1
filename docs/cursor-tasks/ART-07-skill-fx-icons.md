# ART-07 · 技能特效与图标
**类型**：美术　**依赖**：无

## 规格
特效（中心锚点）：`fx_slash` 64×64（朝右的弧形刀光）、`fx_wind_blade` 32×16（朝右）、`fx_frost_nova` 64×64（冰环）、`fx_heal` 48×48、`fx_spore` 16×16、`fx_hit` 24×24。
图标（32×32，圆角方形底）：`icon_slash`、`icon_wind_blade`、`icon_frost_nova`、`icon_heal`。

- 特效用半透明 + 亮色，不要描边；代码会做淡出/缩放。
- 图标风格统一：同一个底框，内部是元素符号。

## 验收标准
- [ ] 所有 key 登记并显示
- [ ] 斩击朝 4 个方向时弧光方向正确
- [ ] `npm run build` 通过

## 注意
想做逐帧特效（spritesheet）时，需要 SkillSystem 支持播放特效动画 —— 在 HANDOFF 里提请求。
