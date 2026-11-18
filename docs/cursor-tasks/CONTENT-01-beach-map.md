# CONTENT-01 · 海边地图 `beach`
**类型**：内容　**依赖**：无（ART-01 先做效果更好）

## 目标
清风村南出口已经指向 `beach`（出生点 `from_village`），现在把这张图做出来。

## 涉及文件
新建 `src/data/maps/beach.json`（格式见 `docs/DATA_FORMATS.md`）；可新建 `tools/gen-beach.mjs` 生成网格。

## 内容要求
- 尺寸约 60×36。北边是入口（与村庄南出口对接），往南是沙滩和大海（`~` 水作为南边界）。
- 出生点：`default`、`from_village`（北侧入口内 2 格处）。
- 出口：北边回村庄 → `{ "to": "village", "spawn": "from_beach" }`（村庄已有该出生点）。
- 再预留一个东出口 → `cave`（未开放，出生点 `from_beach`）。
- 敌人 6–8 个（用已有 slime / mushroom 或 CONTENT-03 新敌人）。
- 1 个 NPC（渔夫，`sprite` 可先用 `npc_elder`），对话 2–3 句。
- 可选：沙滩上的物体（贝壳、棕榈树）需新增物体类型 → 改 `tiles.json` + `placeholders.ts` 加占位图。

## 验收标准
- [ ] `npm run validate` 0 错误
- [ ] 村庄 ⇄ 海边 双向可走通
- [ ] `npm run build` 通过
