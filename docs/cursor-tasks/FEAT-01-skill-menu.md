# FEAT-01 · 技能装备菜单
**类型**：功能　**依赖**：无

## 目标
按 `Tab` 打开技能菜单：左边列出已习得技能（图标、名称、描述、MP、冷却），右边 4 个槽位，可以把技能装到任意槽或卸下。

## 涉及文件
- 新建：`src/scenes/SkillMenuScene.ts`
- 修改：`src/main.ts`（注册 Scene）、`src/config.ts`（KEYS 里加 `menu: ['TAB']`）

## 接口（只用这些，不要改核心）
- 读：`GameState.data.learned`、`GameState.data.slots`、`Skills[id]`
- 写：`GameState.equip(slot, skillId | null)`（会自动广播 `SKILL_SLOTS`，HUD 自动更新）
- 打开菜单时暂停世界：`this.scene.pause('World')`，关闭时 `resume`。

## 验收标准
- [ ] Tab 开关；键盘可完整操作（方向键选择、J/Enter 确认、Esc/Tab 关闭）
- [ ] 换装后 HUD 技能栏立即更新，切图/刷新后保持（存档在下次切图时写入；可在关闭菜单时调用 `GameState.save()`）
- [ ] 同一技能不能同时装在两个槽（装到新槽时从旧槽移除）
- [ ] `npm run build` 通过
