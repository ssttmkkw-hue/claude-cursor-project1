# ART-04 · 主角 spritesheet
**类型**：美术　**依赖**：无（但它决定所有角色的画风，建议优先）

## 目标
主角 4 方向 × 4 帧行走动画。

## 涉及文件
`public/assets/characters/player.png`（或 svg）、`src/art/manifest.ts`

## 规格
- 帧 32×48，整图 128×192，布局见 `docs/ART_SPEC.md` → 角色 spritesheet 布局。
- 形象：Q 版 2.5 头身，蓝发（`#6b8fd6` 附近），白色冒险服 + 青绿 `#7fd3c4` 点缀，大眼睛，腮红。
- 每行列 0 为站立帧，列 1–3 与列 0 组成 4 帧走路循环（迈左脚—并步—迈右脚—并步 均可）。
- 朝左朝右可以对称，但两行都要画（代码不翻转 spritesheet）。

```ts
{ key: 'player', type: 'spritesheet', url: 'assets/characters/player.png', frameWidth: 32, frameHeight: 48 },
```

## 验收标准
- [ ] 四个方向移动时播放对应行走动画，停止时显示站立帧
- [ ] 冲刺残影正常（残影使用当前帧）
- [ ] `npm run build` 通过

## 注意
- 如果用 SVG 写，可以写一个 `tools/build-sprites.mjs` 用 devDependency（如 `sharp`）把逐帧 SVG 拼成 PNG spritesheet，脚本一起提交。
- 攻击动作帧暂不需要（目前用特效表现）。需要时在 HANDOFF 里提出，Claude 扩展动画约定。
