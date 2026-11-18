# ART-01 · 地面瓦片
**类型**：美术　**依赖**：无

## 目标
把 8 个地面瓦片从占位图换成正式美术，奠定整个游戏的“清新”基调。

## 涉及文件
- 新建：`public/assets/tiles/*.svg`（或 png）
- 修改：`src/art/manifest.ts`（追加登记）

## 规格
见 `docs/ART_SPEC.md` → 地面。key：`tile_grass` `tile_grass_1` `tile_grass_2` `tile_flowers` `tile_path` `tile_sand` `tile_water` `tile_bridge` `tile_stone`，全部 32×32。
- 三个草地变体颜色一致，只是草叶/小点分布不同，铺在一起看不出网格。
- 四边无缝拼接（左边缘能接右边缘，上接下）。
- 水面：浅青蓝，带 1–2 道高光波纹。
- 本任务**不做**地形过渡（草→沙的边缘），那需要 autotile，见“注意”。

## 验收标准
- [ ] 9 个 key 都已在 manifest 登记并正常显示（控制台无 `failed to load`）
- [ ] 清风村、翠风森林大面积草地看不出明显重复网格
- [ ] 截图前后对比放进 HANDOFF 记录（可选）
- [ ] `npm run build` 通过

## 注意
- 需要地形过渡（autotile）时，在 HANDOFF 的“请求 Claude”里提，MapBuilder 需要支持。
