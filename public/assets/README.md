# 正式美术与音频

| 目录 | 内容 |
|---|---|
| `tiles/` | 地面瓦片 32×32 |
| `objects/` | 树、石头、房子等物体 |
| `characters/` | 主角、NPC（spritesheet 32×48 帧） |
| `enemies/` | 敌人 |
| `fx/` | 技能特效 |
| `ui/` | 图标、面板、对话框 |
| `fonts/` | 字体（记录许可证） |
| `audio/bgm`、`audio/sfx` | 音乐、音效（在 `audio/CREDITS.md` 记录来源与许可） |

放进来后要在 `src/art/manifest.ts` 登记才会被加载。规格见 `docs/ART_SPEC.md`。
