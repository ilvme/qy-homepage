# AGENTS.md

This file provides guidance to Qoder (qoder.com) when working with code in this repository.

## 项目概述

个人主页/博客（"和光同尘"），基于 Next.js 16（App Router）、React 19、TypeScript 和 Tailwind CSS v4 构建。内容在 Notion 中编辑，通过脚本同步为本地 Markdown 文件（含 YAML frontmatter），MDX 通过 `@mdx-js/mdx` 的 `evaluate()` 在服务端渲染。部署在 Vercel。

- 包管理器：`pnpm@9.1.1`
- Node 20，ES2022 target，`strict: true`，`moduleResolution: bundler`
- 路径别名：`@/` → `src/`

## 常用命令

```bash
pnpm dev              # 启动开发服务器（端口 3000）
pnpm build            # 生产构建
pnpm lint             # Biome 检查（linter + formatter）
pnpm format           # Biome 格式化并写入
pnpm fetchAll         # 从 Notion 同步所有内容（加 --force 强制全量）
pnpm fetchArticles    # 仅同步文章
pnpm fetchPages       # 仅同步页面
pnpm fetchShares      # 仅同步分享
pnpm fetchCooking     # 仅同步下厨
pnpm fetchWords       # 仅同步说说
```

项目当前无测试框架。

## Biome 配置

缩进 2 空格，单引号，`organizeImports: on`。`content/` 目录排除（含 YAML frontmatter 的 MD 文件 Biome 无法解析）。`suspicious.noUnknownAtRules: off` 以兼容 Tailwind v4 的 `@theme`/`@plugin` 等指令。启用 `next: recommended` 和 `react: recommended` 领域规则。

## 架构

### 内容管线

```
Notion 数据库（4 个独立库：articles, words, shares, cooking）
        │
        ├── GitHub Action（每小时）──→ fetchAll → commit → push → Vercel 构建
        │
        └── /manage 手动触发 ──→ Deploy Hook ──→ Vercel 构建时 fetchAll ──→ 上线
```

1. **同步脚本**（`scripts/`）：每个内容类型一个独立 fetcher，查各自的 Notion 数据库（2026 API 通过 data_source 层），用 `notion-to-md` v4 转 Markdown（图片下载到 `public/notion-images/`、callout → `<Callout>`、column_list → `<Columns>`），生成带 YAML frontmatter 的 `.md` 文件。
2. **加载器**（`src/libs/`）：`content-loader.ts`、`words-loader.ts`、`cooking-loader.ts` 通过 `glob` + `gray-matter` 读取本地 MD，解析 frontmatter 返回。
3. **MDX 渲染**（`MarkdownRenderer`）：服务端组件，用 `@mdx-js/mdx` 的 `evaluate()` 渲染，`remarkGfm` + `rehypeShiki`（双主题）+ `rehypeSlug`，映射 `img` → `ImageViewer`、`pre` → `CodeBlock`。

### 四个内容类型

| 类型 | Fetcher | Loader | 路由 |
|------|---------|--------|------|
| 文章 + 页面 | articles-fetcher + pages-fetcher（共用 `fetchByType()`） | content-loader | `/posts`、`/about` 等 |
| 说说 | words-fetcher | words-loader | `/words` |
| 分享 | shares-fetcher | 暂无 | `/share`（占位） |
| 下厨 | cooking-fetcher | cooking-loader | `/cooking` |

每个 fetcher 完全自包含：自己查库、自己循环处理、自己写文件。仅通过 `scripts/lib/` 中的纯函数共享基础设施。

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
    ├── sync-utils.ts         # needsSync() 增量检查 + syncCover() 封面下载
    └── mappers.ts            # mapArticlePage() + getArticlesDatabaseId()
```

### 增量同步

比对 `last_edited_time`，一致则跳过。`--force` 模式设置 `FORCE_SYNC=true` 绕过。Cover 图片通过 `syncCover()` 下载到本地。

### Date 解析

`content-supports.ts` 的 `parseDate()` 对纯日期字符串（`YYYY-MM-DD`）手动构造 `new Date(y, m-1, d)` 强制本地时间，避免 JS 当 UTC 处理导致 8 小时偏差。所有 loader 排序和过滤统一使用此函数。

该文件还导出：`parseMdFromFile()`、`extractHeadings()`、`slugify()`（与 rehype-slug 一致，支持中文）。

### Content Loader API

`content-loader.ts`：`getAllPosts()`、`getPostBySlug()`、`getPostsByTag()`、`getPostsByCategory()`、`getAllTags()`、`getAllCategories()`、`getPostStats()`。

`cooking-loader.ts`：`getAllCooking()`、`getCookingBySlug()`、`getAllCookingCategories()`、`getCookingByCategory()`。

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

### API 路由

| 端点 | 方法 | 鉴权 | 说明 |
|------|------|------|------|
| `/api/words/publish` | POST | `Bearer <PUBLISH_SECRET>` | 写说说到 Notion → 触发部署 |

### 管理后台

- 中间件 `src/middleware.ts` 拦截 `/manage/*`，检查 cookie（`manage_token`，365 天）
- 密码：环境变量 `MANAGE_PASSWORD`
- `/manage/publish` 发布说说，`/manage` 底部按钮触发 Deploy Hook

### 关键组件

- `src/components/layout/` — Header（导航从 `site.config.ts` 的 `navLinks` 读取）、Footer
- `src/components/ui/` — MarkdownRenderer、ImageViewer（lightbox）、TableOfContents、Prose、CodeBlock、Callout、Columns/Column、Typewriter、BackToTop、PageHero、EmptyShower
- `src/app/(blogs)/_components/` — PostItem、PostItemLite、PostMeta、Tag
- `src/app/(cooking)/_components/` — ImageGallery
- `src/app/words/_components/` — WordCard、WordImageGrid

### site.config.ts

集中管理：URL、标题、描述、作者、导航链接（`navLinks`）、RSS 配置、分页（`pageSize: 7`、`cookingPageSize: 8`）、Hero 文案。

### 设计系统

Tailwind v4 + `@tailwindcss/typography`，CSS 变量定义暖中性色调（stone），亮色/暗色模式（`prefers-color-scheme: dark`）。字体：霞鶜文楷屏幕版（直接导入 CSS，不用 `next/font`），回退 `system-ui`。

`globals.css` 中 `.prose` 有大量覆盖：代码块、表格、引用块、任务列表、10 色 callout、`<details>/<summary>`、多栏布局。Shiki 双主题通过 CSS 变量（`--shiki-light`/`--shiki-dark`）切换。

Root Layout：`<html lang="zh-CN">`，`max-w-[800px] mx-auto` 居中。全局注入 `<Analytics>`、`<SpeedInsights>`、`<BackToTop>`。

### CI/CD

`.github/workflows/sync-notion.yml` — 每小时自动 `pnpm fetchAll`，有变更时 commit + push 触发 Vercel 构建。也可 `workflow_dispatch` 手动触发。

### 依赖注意事项

- `pnpm.overrides` 强制 `unified@11.0.5`，解决 `@mdx-js/mdx` 与 `rehype-slug` 版本冲突
- `notion-to-md@4.0.0-alpha.7`（v4 alpha），API 与 v3 不兼容，2026 Notion API 需通过 data_source 层
- Git 提交使用简洁英文 message
