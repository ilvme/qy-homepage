# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

个人主页/博客（"和光同尘"），基于 Next.js 16（App Router）、React 19、TypeScript 和 Tailwind CSS v4 构建。内容在 Notion 中编辑，通过脚本同步为本地 Markdown 文件（含 YAML frontmatter），MDX 通过 `@mdx-js/mdx` 的 `evaluate()` 在服务端渲染。

## 常用命令

```bash
pnpm dev              # 启动开发服务器（端口 3000）
pnpm build            # 生产构建（自动先跑 fetchAll）
pnpm lint             # Biome 检查（linter + formatter）
pnpm format           # Biome 格式化并写入
pnpm fetchAll         # 从 Notion 同步所有内容
pnpm fetchArticles    # 仅同步文章
pnpm fetchPages       # 仅同步页面
pnpm fetchShares      # 仅同步分享
pnpm fetchCooking     # 仅同步下厨
pnpm fetchWords       # 仅同步说说
```

`fetchAll` 加 `--force` 可强制全量重新同步（绕过增量检查）。

## 环境变量

复制 `.env.example` 为 `.env` 并填入：

| 变量 | 用途 | 位置 |
|------|------|------|
| `NOTION_TOKEN` | Notion Integration Token | 本地 + Vercel + GitHub Secrets |
| `NOTION_ARTICLES_DATABASE_ID` | 文章数据库（含 page 类型） | 同上 |
| `NOTION_WORDS_DATABASE_ID` | 说说数据库 | 同上 |
| `NOTION_SHARE_DATABASE_ID` | 分享数据库 | 同上 |
| `NOTION_COOKING_DATABASE_ID` | 下厨数据库 | 同上 |
| `NEXT_PUBLIC_SITE_URL` | 站点 URL | 仅 Vercel |
| `PUBLISH_SECRET` | 说说发布 API 密钥 | Vercel + 本地 |
| `MANAGE_PASSWORD` | 管理后台登录口令 | Vercel + 本地 |
| `VERCEL_DEPLOY_HOOK` | Vercel Deploy Hook URL | Vercel + 本地 |

## 目录约定

- `src/app/` — Next.js App Router 页面（`@/` 映射到 `src/`）
- `src/components/` — 通用 UI 组件
- `src/libs/` — 服务端工具：内容加载、frontmatter 解析、日期处理
- `scripts/` — Notion 同步脚本（`tsx` 执行）
- `content/` — 生成的 MD 文件
- `public/notion-images/` — 从 Notion 下载的图片
- Node 20，ES2022 target，tsconfig `strict: true`

## 架构

### 内容管线

```
Notion 数据库（4 个独立库：articles, words, shares, cooking）
        │
        ├── GitHub Action（每小时）──→ fetchAll → commit → GitHub 备份
        │                                        └── push 触发 Vercel 构建
        │
        └── /manage 手动触发 ──→ Deploy Hook ──→ Vercel 构建时 fetchAll ──→ 上线
```

1. **同步脚本**（`scripts/`）：每个内容类型一个独立 fetcher，查各自的 Notion 数据库（2026 API 通过 data_source 层），用 `notion-to-md` v4 转换页面为 Markdown（图片下载到 `public/notion-images/`、callout → `<Callout>`、column_list → `<Columns>`），生成带 YAML frontmatter 的 `.md` 文件。
2. **加载器**（`src/libs/`）：`content-loader.ts`、`words-loader.ts`、`cooking-loader.ts` 通过 `glob` + `gray-matter` 读取本地 MD，解析 frontmatter 返回。
3. **MDX 渲染**（`MarkdownRenderer`）：服务端组件，用 `@mdx-js/mdx` 的 `evaluate()` 渲染，`remarkGfm` + `rehypeShiki` + `rehypeSlug`，映射 `img` → `ImageViewer`、`pre` → `CodeBlock`。
4. **页面** 通过 `MarkdownRenderer` 或 `ImageGallery` 渲染内容。

### 四个内容类型

| 类型 | Notion 库 | Fetcher | Loader | 路由 |
|------|-----------|---------|--------|------|
| 文章 + 页面 | articles（type 字段区分） | articles-fetcher + pages-fetcher 共用 `fetchByType()` | content-loader | `/posts`、`/about` 等 |
| 说说 | words | words-fetcher | words-loader | `/words` |
| 分享 | shares | shares-fetcher | 暂无 | `/share`（占位） |
| 下厨 | cooking | cooking-fetcher | cooking-loader | `/cooking` |

每个 fetcher 完全独立：自己定义 Notion property → metadata 映射、自己显式声明 frontmatter 字段列表及顺序、自己拼接 MD 字符串。**不共用字段列表或格式化函数**。

### 脚本目录

```
scripts/
├── fetch-all.ts              # 统一入口
├── articles-fetcher.ts       # 文章（type: "article"）
├── pages-fetcher.ts          # 页面（type: "page"）
├── shares-fetcher.ts         # 分享（独立数据库）
├── cooking-fetcher.ts        # 下厨（独立数据库）
├── words-fetcher.ts          # 说说
├── types.ts                  # PostMetadata / ShareMetadata / WordMetadata
└── lib/
    ├── notion-client.ts      # fetchAllPages() 分页查询 + data_source 解析
    ├── notion-md-converter.ts # convertPageToMarkdown() + downloadImage()
    ├── md-handler.ts         # createMdHandler() 工厂：增量检查 → 转换 → 下载 cover → 写文件
    └── article-utils.ts      # mapArticlePage() / fetchByType() / createHandler()
```

`article-utils.ts` 只被 articles-fetcher、pages-fetcher、cooking-fetcher 使用（共用 `mapArticlePage` 和 `createHandler`）。shares 和 words 各自独立映射。

### 增量同步

比对 `last_edited_time`，一致则跳过。`--force` 模式设置 `FORCE_SYNC=true` 绕过。Cover 图片也会在同步时下载到本地（`md-handler.ts`）。

### Date 解析

`content-supports.ts` 导出 `parseDate()`：纯日期字符串（`YYYY-MM-DD`）追加 `T00:00:00` 强制本地时间解析，避免 JS 当 UTC 处理导致 8 小时偏差。所有 loader 的排序和过滤统一使用此函数。WordCard 显示端用 `dayjs` 显式指定格式。

### 鉴权

`src/proxy.ts` 拦截 `/manage/*`，检查 `manage_token` cookie 是否等于 `MANAGE_PASSWORD`。未登录跳 `/login`，登录页输口令后写 cookie（365 天有效），同时存 `localStorage` 实现后续自动登录。

### API 路由

| 端点 | 用途 |
|------|------|
| `POST /api/words/publish` | 写说说到 Notion → 触发部署。支持 text 字段按首个空格拆分为 title + markdown 正文 |
| `POST /api/deploy` | 触发 Vercel Deploy Hook 重新构建 |

均需 `Authorization: Bearer <PUBLISH_SECRET>`。

### 路由表

| 路由组 | 路由 | 说明 |
|--------|------|------|
| — | `/` | 首页 |
| `(blogs)` | `/posts`、`/posts/[slug]` | 文章列表（分页）+ 详情 |
| `(blogs)` | `/archives` | 归档（按年） |
| `(blogs)` | `/categories`、`/categories/[cat]` | 分类 |
| `(blogs)` | `/tags`、`/tags/[tag]` | 标签 |
| `(blogs)` | `/rss.xml` | RSS |
| — | `/words` | 说说流 |
| `(shares)` | `/share` | 分享（占位） |
| `(cooking)` | `/cooking`、`/cooking/[slug]` | 下厨画廊 + 详情 |
| `(pages)` | `/about`、`/friends`、`/resume`、`/sponsor` | 静态页面 |
| — | `/caidan`、`/caidan/daily-words` | 彩蛋 + 旧版说说 |
| `(admin)` | `/login` | 登录口 |
| `(admin)` | `/manage`、`/manage/publish` | 管理后台 + 说说发布 |
| — | 404 | `not-found.tsx` |

### 组件

- `src/components/layout/` — Header（导航从 `site.config.ts` 的 `navLinks` 读取）、Footer
- `src/components/ui/` — **MarkdownRenderer**、ImageViewer（`yet-another-react-lightbox` + Zoom）、TableOfContents、Prose、CodeBlock、Callout、Columns/Column、Typewriter（首页打字）、BackToTop、**PageHero**（页面标题区）、**EmptyShower**（空状态）
- `src/app/(blogs)/_components/` — PostItem、PostItemLite、PostMeta、Tag
- `src/app/(cooking)/_components/` — ImageGallery（图片网格）
- `src/app/words/_components/` — WordCard、WordImageGrid

### site.config.ts

集中管理：URL、标题、描述、作者、导航链接（`navLinks`）、RSS 配置、分页（`pageSize: 7`、`cookingPageSize: 8`）、Hero 文案。

### 设计系统

Tailwind v4 + `@tailwindcss/typography`，CSS 变量定义暖中性色调（stone），支持亮色/暗色模式。字体：霞鶜文楷屏幕版（直接导入 CSS，不用 `next/font`），回退 `system-ui`。`next.config.ts` 允许 Notion 和 Unsplash 远程图片。集成 `@vercel/analytics` 和 `@vercel/speed-insights`。

### CI/CD

`.github/workflows/sync-notion.yml` — 每小时自动 `pnpm fetchAll`，有变更时 commit + push，触发 Vercel 构建。也可手动 `workflow_dispatch` 触发。

### 依赖注意事项

- `pnpm.overrides` 强制 `unified@11.0.5`，解决 `@mdx-js/mdx` 与 `rehype-slug` 版本冲突
- `notion-to-md@4.0.0-alpha.7`（v4 alpha），API 与 v3 不兼容，2026 Notion API 需通过 data_source 层
- `dayjs` 日期格式化、`rss` RSS 生成、`yet-another-react-lightbox` 图片灯箱
- Git 提交使用简洁英文 message
