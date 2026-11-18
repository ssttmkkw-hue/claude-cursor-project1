# ART-05 · NPC
**类型**：美术　**依赖**：ART-04（统一画风）

## 目标
`npc_elder`（村长）、`npc_girl`（澪）。

## 规格
- 32×48 单帧即可（NPC 目前只站立，有程序化呼吸动画）；做成 spritesheet 也兼容。
- 村长：白发、白胡子、淡紫长袍、拄杖。澪：橙色双马尾、粉色连衣裙、开朗。
- 朝下（面向镜头）。

## 验收标准
- [ ] 两个 key 登记并正常显示，画风与主角一致
- [ ] `npm run build` 通过

## 注意
可选：为对话框做 NPC 半身立绘（`portrait_elder` 等，建议 256×256），并在 HANDOFF 里请求 Claude 在对话系统里支持 `portrait` 字段 —— 或者自己在 UIScene 里实现（UIScene 归 Cursor 可改）。
