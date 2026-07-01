# 部署架构

```
GitHub (代码 + 内容备份)
    │
    ├── git push ──→ Vercel 自动构建 ──→ 上线
    │
    └── GitHub Action (每小时)
            │
            └── pnpm fetchAll → commit → push ──→ Vercel 构建
                    │
                    └── 内容变更时才 push（增量检查）
```

## 环境变量

| 变量 | 用途 | 位置 |
|------|------|------|
| `NOTION_TOKEN` | Notion Integration Token | 本地 `.env` + Vercel + GitHub Secrets |
| `NOTION_ARTICLES_DATABASE_ID` | 文章数据库 ID | 同上 |
| `NOTION_WORDS_DATABASE_ID` | 说说数据库 ID | 同上 |
| `NOTION_SHARE_DATABASE_ID` | 分享数据库 ID | 同上 |
| `NOTION_COOKING_DATABASE_ID` | 做饭数据库 ID | 同上 |
| `NEXT_PUBLIC_SITE_URL` | 站点 URL | 仅 Vercel |
| `PUBLISH_SECRET` | 说说发布 API 密钥 | Vercel + 本地 `.env` |
