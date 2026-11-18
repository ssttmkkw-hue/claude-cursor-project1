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
