# FEAT-02 · 音频系统
**类型**：功能　**依赖**：无

## 目标
BGM 按地图切换（`MapDef.bgm`），技能/受击/拾取/升级音效。

## 涉及文件
- 新建：`src/systems/AudioManager.ts`（作为 Cursor 拥有的新系统）
- 修改：`src/main.ts`（初始化）、`src/art/manifest.ts`（登记 `type: 'audio'`）、地图 JSON 加 `bgm`
- 音频文件：`public/assets/audio/bgm/`、`public/assets/audio/sfx/`（使用 CC0 / 自制素材，在 `public/assets/audio/CREDITS.md` 记来源与许可）

## 实现要点
- **只监听 EventBus**，不改核心：`MAP_ENTERED`（按 `Maps[mapId].bgm` 切 BGM，淡入淡出，同曲不重启）、`SKILL_CAST`、`SKILL_LEARNED`、`LEVEL_UP`、`ENEMY_KILLED`、`TOAST`。
- 受击音效需要新事件：在 `GameEvents` 里追加 `COMBATANT_HIT` 并请求 Claude 在 `Combatant.takeDamage` 里 emit（写到 HANDOFF）；在此之前可先不做受击音。
- 音频 key 不存在时静默跳过（游戏不能因缺音频报错）。
- 浏览器需要用户首次输入后才能播放，处理好解锁。
- 音量设置：主音量 / BGM / SFX 存 localStorage。

## 验收标准
- [ ] 村庄/森林不同 BGM，切图平滑过渡
- [ ] 至少 5 个音效
- [ ] 没有音频文件时游戏照常运行
- [ ] `npm run build` 通过
