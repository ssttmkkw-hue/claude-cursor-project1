# FEAT-03 · 手柄支持
**类型**：功能　**依赖**：无

## 目标
左摇杆/十字键移动，A=技能1、X=技能2、Y=技能3、B=冲刺、RB=技能4、交互=A（靠近可交互物时优先交互）。

## 涉及文件
- 新建：`src/systems/InputMap.ts`：把键盘和手柄统一成“动作”查询（`isDown('up')`、`justPressed('skill0')`、`axis()`）
- 修改：`src/main.ts`（`input: { gamepad: true }`）

## 注意
`src/entities/Player.ts` 目前直接读键盘。请先完成 `InputMap.ts` 并写好用法，然后在 HANDOFF 里请求 Claude 把 Player 切到 InputMap（或者经 Claude 同意后自行修改 Player 的输入部分，**只改输入读取，不改移动/技能逻辑**）。

## 验收标准
- [ ] 键盘 + 手柄同时可用
- [ ] 摇杆有死区（0.2），斜向移动速度不超过直线
- [ ] `npm run build` 通过
