# 线路 B 交接
- ART-04：完成。`public/assets/characters/player.png` 128×192 四方向×4 帧行走 spritesheet；`tools/build-sprites.mjs`（sharp）可重生成；已登记 manifest ART-04 分区。
- ART-06：完成。`enemy_slime` / `enemy_mushroom` SVG（32×28 / 32×36），可爱果冻史莱姆与紫伞盖孢子菇。
- ART-07：完成。`fx_slash`（朝右）、`fx_wind_blade`、`fx_frost_nova`、`fx_heal`、`fx_spore`、`fx_hit` 与四枚圆角技能图标，均已登记 ART-07 分区。
- FEAT-01：完成。`SkillMenuScene`（Tab 开关，暂停 World）；方向键/WASD 导航，J/Enter 确认，Esc/Tab 关闭；换装经 `GameState.equip`，装到新槽时先清旧槽；关闭时 `GameState.save()`。
- 遗留问题：主角攻击动作帧仍未做（当前用特效表现）；敌人目前为单帧 SVG，未做 idle 呼吸动画。
- 请求 Claude：无
