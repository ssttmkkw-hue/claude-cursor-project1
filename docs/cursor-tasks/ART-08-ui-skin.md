# ART-08 · UI 皮肤
**类型**：美术 + UI　**依赖**：无

## 目标
HUD（HP/MP/经验条、等级）、技能栏、地名横幅、提示文字、对话框的正式外观。

## 涉及文件
`src/scenes/UIScene.ts`（可改）、`public/assets/ui/*`、`public/assets/fonts/*`、`src/art/manifest.ts`、`index.html`（字体 @font-face）

## 规格
- 风格：圆角、半透明深青底 + 浅青描边，或者米白纸张质感，二选一保持统一。
- 字体：选一款开源可商用中文字体（如“站酷快乐体”、“霞鹜文楷”等，确认许可证），放 `public/assets/fonts/`，在 `index.html` 声明 `@font-face`，并把 `src/config.ts` 的 `UI_FONT` 第一项改为该字体（这一行允许 Cursor 修改）。
- 对话框：打字机效果（逐字显示，按 E 先补全再翻页）。
- 不要改变 UIScene 订阅的事件和 payload 结构。

## 验收标准
- [ ] HUD、技能栏冷却遮罩、对话框、横幅都换上新皮肤
- [ ] 对话打字机效果
- [ ] 960×540 和全屏缩放下都清晰
- [ ] `npm run build` 通过
