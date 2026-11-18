# FEAT-04 · 标题画面
**类型**：功能 + 美术　**依赖**：无

## 目标
Boot 之后进入标题画面：游戏标题（暂定“风之旅人”）、背景（可以是村庄地图的慢速平移镜头或一张插画）、菜单：新游戏 / 继续（无存档时置灰）/ 设置（占位）。

## 涉及文件
- 新建：`src/scenes/TitleScene.ts`
- 修改：`src/main.ts`（注册）、`src/scenes/BootScene.ts` 的 `create()` 末尾：改为 `this.scene.start('Title')`（这几行允许 Cursor 修改）

## 接口
- 新游戏：`GameState.reset()` → `scene.start('World', { mapId: START_MAP, spawn: 'default' })` → `scene.launch('UI')`
- 继续：`GameState.load()` → `scene.start('World', { mapId: GameState.data.mapId, spawn: GameState.data.spawn })` → `scene.launch('UI')`

## 验收标准
- [ ] 新游戏 / 继续 都正常
- [ ] 键盘可操作
- [ ] `npm run build` 通过
