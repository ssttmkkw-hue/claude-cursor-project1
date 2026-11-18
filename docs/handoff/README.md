# 任务交接记录（每个任务一个文件）

并行开发时，每个任务完成后新建 `docs/handoff/<任务编号>.md`（例如 `ART-01.md`），避免多人同时改一个文件产生冲突：

```markdown
# ART-01 · 地面瓦片
- 分支：cursor/ART-01
- 完成：…
- 遗留：…
- 请求 Claude：…（没有写“无”）
```

Claude 开工时会读这个目录下所有文件，并把“请求 Claude”汇总到 `docs/HANDOFF.md`。
