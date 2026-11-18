# SOLO 单线开发交接

## ART-03 · 村庄建筑正式美术
- 做了什么：新增 `house` / `fence` / `sign` / `well` SVG（规格见 ART_SPEC），并登记到 `manifest.ts` ART-03 分区。门在房子底边正中。
- 遗留：未做可选房子变体（不同屋顶色）。
- 请求 Claude：无

## ART-05 · NPC 正式美术
- 做了什么：`npc_elder`（白发白须淡紫袍+杖）、`npc_girl`（橙双马尾粉裙）朝下单帧 SVG 32×48，画风对齐主角描边/头身，已登记 ART-05。
- 遗留：未做半身立绘 portrait；NPC 仍为单帧（程序化呼吸）。
- 请求 Claude：无

## ART-08 · UI 皮肤
- 做了什么：引入站酷快乐体（OFL，`public/assets/fonts/`）；`src/ui/skin.ts` 统一深青+浅青描边；`UIScene` HUD/技能栏/横幅/对话框换肤；对话框打字机（E 先补全再翻页）；`SkillMenuScene` 共用皮肤；`ui_panel`/`ui_slot` 登记。
- 遗留：无。
- 请求 Claude：无

## FEAT-04 · 标题画面
- 做了什么：`TitleScene`（新游戏/继续/设置占位）；Boot 改为进入 Title；无存档时「继续」置灰；背景用草地瓦片+房子微动。
- 遗留：设置项仅为占位。
- 请求 Claude：无

## CONTENT-02 · 湖畔地图
- 做了什么：`src/data/maps/lake.json`（64×44，中央湖+环湖路+木桥小岛，`heal` 宝珠）；`tools/gen-lake.mjs`；tint `#e0f0ff`；与森林双向连通。
- 遗留：无。
- 请求 Claude：无

## CONTENT-01 · 海边地图
- 做了什么：`src/data/maps/beach.json`（60×36，北入口/沙滩/大海）；渔夫 NPC；东出口预留 `cave`；`tools/gen-beach.mjs`；与村庄双向连通。
- 遗留：可选贝壳/棕榈未做；洞穴未开放。
- 请求 Claude：无

## CONTENT-03 · 新敌人与技能
- 做了什么：敌人 `bee`/`golem`/`flower` + 技能 `fireball`/`whirlwind`/`triple_slash`（及对应敌人技能）；SVG 美术与占位；湖畔放石头人/花妖与火球·旋风宝珠，海边放嗡嗡蜂与三连斩宝珠。
- 遗留：无。
- 请求 Claude：无

## FEAT-02 · 音频
- 做了什么：`AudioManager`（听 EventBus）；自制 CC0 WAV（`tools/gen-audio.mjs` + CREDITS）；四图 BGM + 6 音效；UI 场景挂载；音量存 localStorage。
- 遗留：受击音需 `COMBATANT_HIT` 事件。
- 请求 Claude：在 `GameEvents` 增加 `COMBATANT_HIT`，于 `Combatant.takeDamage` emit，便于补受击音效。

## FEAT-03 · 手柄
- 做了什么：`InputMap`（键盘+手柄，死区 0.2，斜向归一化）；`Player` 改为走 InputMap；`main` 开启 `gamepad`；靠近交互物时 A 优先交互。
- 遗留：标题/技能菜单尚未接手柄导航（仍可用键盘）。
- 请求 Claude：无
