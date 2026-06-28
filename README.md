# 和光同尘

个人主页 / 博客，基于 Next.js 16 + React 19 + Tailwind CSS v4。内容在 Notion 中编辑，通过脚本同步为本地 Markdown，MDX 服务端渲染。部署在 Vercel。

## 目录

- [内容管线](#内容管线)
- [路由总览](#路由总览)
- [内容发布流程](#内容发布流程)
- [管理后台](#管理后台)
- [环境变量](#环境变量)
- [本地开发](#本地开发)
- [部署架构](#部署架构)

---

## 内容管线

```
Notion 数据库 (唯一数据源)
        │
        ├── GitHub Action (每小时) ──→ fetchAll → commit → push → GitHub 备份
        │                                                         │
        │                                                    Vercel 自动构建
        │
        └── /manage 手动触发 ──→ Deploy Hook ──→ Vercel 构建时 fetchAll ──→ 上线
```

- **增量同步**：比对 `last_edited_time`，未变更跳过
- **预发布**：说说 `date` 设为未来时间 → 到时间自动可见
- **同步脚本**：`pnpm fetchAll` → `tsx scripts/fetch-all.ts`

---

## 路由总览

### 公开页面

| 路由 | 说明 |
|------|------|
| `/` | 首页，Hero + 导航卡片 |
| `/posts` | 文章列表，分页 |
| `/posts/[slug]` | 单篇文章，TOC + MDX |
| `/archives` | 文章归档，按年分组 |
| `/categories` | 分类列表 |
| `/categories/[category]` | 按分类筛选 |
| `/tags` | 标签列表 |
| `/tags/[tag]` | 按标签筛选 |
| `/words` | 说说流 |
| `/cooking` | 下厨画廊，分页 |
| `/cooking/[slug]` | 下厨详情 |
| `/share` | 分享（占位） |
| `/about` | 关于页 |
| `/friends` | 友链 |
| `/resume` | 简历 |
| `/sponsor` | 赞赏 |
| `/rss.xml` | RSS 订阅源 |

### 隐藏页面（不受保护）

| 路由 | 说明 |
|------|------|
| `/caidan` | 彩蛋入口 |
| `/caidan/daily-words` | 旧版说说（582 条），分页展示 |
| `/login` | 管理后台登录口 |

### 管理后台（需登录）

| 路由 | 说明 |
|------|------|
| `/manage` | 管理菜单 |
| `/manage/publish` | 说说发布页 |

### API

| 端点 | 方法 | 鉴权 | 说明 |
|------|------|------|------|
| `/api/words/publish` | POST | Bearer SECRET | 写说说到 Notion → 部署 |
| `/api/deploy` | POST | Bearer SECRET | 触发 Vercel 构建 |

---

## 内容发布流程

### 文章（长文）

```
Notion 写文章 (status: published)
        │
        ├── GitHub Action 每小时自动同步 → commit → push → Vercel 部署
        │
        └── 打开 /manage → 点「更新网站」→ 90 秒后上线
```

### 说说（碎片文字）

```
方式一：Notion 直接写
   Notion Words 数据库 → 同上

方式二：Web 发布页
   /manage/publish → 填内容/选标签 → POST /api/words/publish
        │
        ├── 写入 Notion (data_source 层)
        └── 触发 Vercel Deploy Hook → 90 秒后上线

方式三：iOS 快捷指令（可配）
   快捷指令 POST /api/words/publish → 同上
```

### 预发布（仅说说）

Notion 中 `date` 字段设为未来时间 → 渲染时自动过滤，时间到后自动可见。无需额外操作。

---

## 管理后台

### 鉴权流程

```
访问 /manage/*
    │
    ├── cookie 有效 ──→ 放行
    │
    └── 无 cookie ──→ /login?redirect=原路径
                          │
                          └── 输入口令 → 写 cookie(365天) → 跳回原路径
```

- 中间件：`src/middleware.ts`，拦截 `/manage/*`
- 密码：环境变量 `MANAGE_PASSWORD`
- Cookie：`manage_token`，Lax，365 天

### 管理功能

| 功能 | 入口 | 说明 |
|------|------|------|
| 发布说说 | `/manage/publish` | 表单 → Notion → 部署 |
| 更新网站 | `/manage` 底部按钮 | 触发构建，Notion 新内容上线 |

---

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
| `MANAGE_PASSWORD` | 管理后台登录口令 | Vercel + 本地 `.env` |
| `VERCEL_DEPLOY_HOOK` | Vercel Deploy Hook URL | Vercel + 本地 `.env` |

---

## 本地开发

```bash
cp .env.example .env        # 填入环境变量
pnpm install
pnpm dev                     # http://localhost:3000
```

构建：

```bash
pnpm build                   # pnpm fetchAll && next build
```

代码检查：

```bash
pnpm lint                    # biome check
pnpm format                  # biome format --write
```

手动同步 Notion：

```bash
pnpm fetchAll                # 全量
pnpm fetchArticles           # 仅文章
pnpm fetchPages              # 仅页面
pnpm fetchShares             # 仅分享
pnpm fetchCooking            # 仅下厨
pnpm fetchWords              # 仅说说
```

---

## 部署架构

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

发布 API 写 Notion 后会等下一次 Action 同步上线（最长 1 小时）。
手动 /manage 点「更新」可触发 Deploy Hook 即时构建。
```
