# 内容管线

```
Notion 数据库 (唯一数据源)
        │
        └── GitHub Action (每小时) ──→ fetchAll → commit → push → Vercel 自动构建
```

- **增量同步**：比对 `last_edited_time`，未变更跳过
- **预发布**：说说 `date` 设为未来时间 → 渲染时自动过滤，时间到后自动可见
- **同步脚本**：`pnpm fetchAll` → `tsx scripts/fetch-all.ts`

## 内容发布流程

### 文章

Notion 中写文章（`status: published`）→ GitHub Action 每小时自动同步 → commit → push → Vercel 自动部署。

### 说说

- **Notion 直接写** → 同上自动同步上线。
- **Web 发布页**：`/publish-words`，填写标题、正文、标签 → `POST /api/words/publish` → 写入 Notion → 自动同步上线。支持添加到手机桌面作为独立应用使用。
- **快捷指令**：`POST /api/words/publish`，`text` 字段首段自动截取为标题。

### 预发布（仅说说）

Notion 中 `date` 字段设为未来时间 → 渲染时自动过滤，时间到后自动可见。
