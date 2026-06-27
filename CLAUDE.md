# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

个人主页/博客（"和光同尘"），基于 Next.js 16（App Router）、React 19、TypeScript 和 Tailwind CSS v4 构建。内容在 Notion 中编辑，通过脚本同步为本地 Markdown 文件（含 YAML frontmatter），MDX 通过 `@mdx-js/mdx` 的 `evaluate()` 在服务端渲染。

## 常用命令

```bash
pnpm dev              # 启动开发服务器（端口 3000）
pnpm build            # 生产构建
pnpm lint             # Biome 检查（linter + formatter）
pnpm format           # Biome 格式化并写入
pnpm fetchAll         # 从 Notion 同步所有内容（文章、页面、分享、说说）
pnpm fetchArticles    # 仅同步文章
pnpm fetchPages       # 仅同步页面（关于、友链、简历等）
pnpm fetchShares      # 仅同步分享
pnpm fetchWords       # 仅同步说说
pnpm importWords      # 从 CSV 批量导入说说
pnpm cleanWordsCsv    # 清理 CSV 数据
```

`fetchAll` 加 `--force` 参数可绕过增量检查，强制全量重新同步。`--force` 会设置环境变量 `FORCE_SYNC=true`，各 fetcher 据此跳过增量逻辑。

## 环境变量

复制 `.env.example` 为 `.env` 并填入：

- `NOTION_TOKEN` — Notion Integration Token
- `NOTION_ARTICLES_DATABASE_ID` — 文章数据库 ID（文章、页面、分享共用此数据库，通过 `type` 字段区分）
- `NOTION_WORDS_DATABASE_ID` — 说说数据库 ID
- `NOTION_SHARE_DATABASE_ID` — 分享数据库 ID

`sites.config.ts` 使用 `NEXT_PUBLIC_SITE_URL` 作为站点 URL（默认 `https://ikangjia.cn`），生产环境需在 `.env` 中设置。

## 目录约定

- `src/app/` — Next.js App Router 页面（`@/` 别名映射到 `src/`）
- `src/components/` — 通用 UI 组件
- `src/libs/` — 服务端工具：内容加载、frontmatter 解析、标题提取
- `scripts/` — Notion 同步脚本（`tsx` 执行）
- `content/` — 生成的 MD 文件
- `public/notion-images/` — 从 Notion 下载的图片
- Node 20，ES2022 target，tsconfig `strict: true`

## 架构

### 内容管线：Notion → 本地 MD → Next.js

1. **同步脚本**（`scripts/`）通过 `@notionhq/client` 查询 Notion 数据库，按 `type` 字段过滤（article/page/share），分页获取已发布页面。使用 `notion-to-md` v4 的 `NotionConverter` + 自定义 `MDXRenderer` 将 Notion 页面转换为 Markdown：图片保留 alt 文本并下载到本地，callout 转为 `<Callout>` 组件，column_list 转为 `<Columns><Column>`。写入带 YAML frontmatter 的 `.md` 文件到 `content/` 下。
2. **加载器**（`src/libs/content-loader.ts`、`words-loader.ts`）在请求时通过 `glob` + `gray-matter` 读取本地 MD 文件，解析 frontmatter 并按需返回正文。
3. **MDX 渲染**（`src/components/ui/MarkdownRenderer.tsx`）是服务端组件，使用 `@mdx-js/mdx` 的 `evaluate()` 渲染 MDX。插件：`remarkGfm`（GFM 表格/任务列表）、`rehypeShiki`（双主题语法高亮，可选）、`rehypeSlug`（标题锚点，可选）。组件映射：`img` → `ImageViewer`、`pre` → `CodeBlock`、`Callout`、`Columns`/`Column`。
4. **页面** 通过 `MarkdownRenderer` 渲染。说说在 `WordCard` 中用 `MarkdownRenderer`（`highlight={false}` `slug={false}`）逐卡片渲染。

### site.config.ts

`src/site.config.ts` 集中管理站点元信息：URL、标题、描述、作者、关键词、RSS 配置、分页（`pagination.pageSize: 7`）、首页 Hero 文案（`hero.greeting` + `hero.intro`）。被 `layout.tsx`（metadata）、`page.tsx`（Hero）、RSS 路由等引用。

### RSS

`src/app/(blogs)/rss.xml/route.ts` 生成 RSS 2.0 订阅源，过滤已发布文章，配置缓存（默认 3600s）。根布局通过 `<link rel="alternate" type="application/rss+xml">` 注册。

### 脚本目录结构

```
scripts/
├── fetch-all.ts              # 统一入口，按顺序调用 articles → pages → shares → words
├── articles-fetcher.ts       # 文章同步（type: "article"）
├── pages-fetcher.ts          # 页面同步（type: "page"）：关于、友链、简历
├── shares-fetcher.ts         # 分享同步（type: "share"）
├── words-fetcher.ts          # 说说同步：文件键名用 title
├── types.ts                  # PostMetadata / WordMetadata 接口定义
├── words/
│   ├── import-csv.ts         # 从 CSV 批量导入说说
│   └── clean-csv.ts          # 清理 CSV 数据
└── lib/
    ├── notion-client.ts      # fetchAllPages() 分页查询
    ├── notion-md-converter.ts # convertPageToMarkdown()：notion-to-md v4 转换 + 自定义 transformer
    ├── md-handler.ts         # createMdHandler() 工厂：增量检查 → 转换 → 写文件
    └── article-utils.ts      # mapArticlePage()、generateMdContent()、fetchByType()、createHandler()
```

`articles-fetcher`、`pages-fetcher`、`shares-fetcher` 共用 `article-utils.ts` 中的 `fetchByType()` 和 `createHandler()`，通过 `type` 字段区分内容类型。`words-fetcher` 独立实现，文件命名用 `title`。

### 增量同步

将每个 Notion 页面的 `last_edited_time` 与本地 MD 文件 frontmatter 中的 `last_edited_time` 比对，一致则跳过。`--force` 模式设置 `FORCE_SYNC=true` 绕过此逻辑。

### Notion → MD 转换器

`scripts/lib/notion-md-converter.ts` 使用 `notion-to-md` v4 的 `NotionConverter` + 自定义 `MDXRenderer`，注册了以下 block transformer：

- **image**：保留 Notion 标题作为 alt 文本
- **callout**：转换为 `<Callout icon="..." color="...">`
- **column_list**：转换为 `<Columns cols={n}><Column>...</Column></Columns>`，列内图片手动下载并替换 URL
- 多个连续空行转为 `<br />` 标签

### 路由表

使用 Next.js 路由组组织：

| 路由组 | 路由 | 文件 | 说明 |
|--------|------|------|------|
| — | `/` | `src/app/page.tsx` | 首页，Hero 区域 + 导航卡片网格 |
| `(blogs)` | `/posts` | `src/app/(blogs)/posts/page.tsx` | 文章列表，分页 |
| `(blogs)` | `/posts/[slug]` | `src/app/(blogs)/posts/[slug]/page.tsx` | 单篇文章，TOC + MDX 渲染 |
| `(blogs)` | `/archives` | `src/app/(blogs)/archives/page.tsx` | 文章归档，按年份分组 + 字数统计 |
| `(blogs)` | `/categories` | `src/app/(blogs)/categories/page.tsx` | 分类列表 |
| `(blogs)` | `/categories/[category]` | `src/app/(blogs)/categories/[category]/page.tsx` | 按分类筛选 |
| `(blogs)` | `/tags` | `src/app/(blogs)/tags/page.tsx` | 标签列表 |
| `(blogs)` | `/tags/[tag]` | `src/app/(blogs)/tags/[tag]/page.tsx` | 按标签筛选 |
| `(blogs)` | `/rss.xml` | `src/app/(blogs)/rss.xml/route.ts` | RSS 2.0 订阅源 |
| — | `/words` | `src/app/words/page.tsx` | 说说流 |
| `(shares)` | `/share` | `src/app/(shares)/share/page.tsx` | 分享页（占位） |
| `(pages)` | `/about` | `src/app/(pages)/about/page.tsx` | 渲染 `content/pages/readme.md` |
| `(pages)` | `/friends` | `src/app/(pages)/friends/page.tsx` | 渲染 `content/pages/friends.md` |
| `(pages)` | `/resume` | `src/app/(pages)/resume/page.tsx` | 渲染 `content/pages/resume.md` |
| `(pages)` | `/sponsor` | `src/app/(pages)/sponsor/page.tsx` | 赞赏页（静态二维码图片） |
| — | 404 | `src/app/not-found.tsx` | 自定义 404 页面 |

`(blogs)`、`(pages)`、`(shares)` 是 Next.js 路由组，不影响 URL 路径。

### 组件组织

- `src/components/layout/` — Header（响应式导航，移动端汉堡菜单）、Footer
- `src/components/ui/` — **MarkdownRenderer**（服务端 MDX 渲染，`evaluate()` + 组件映射）、ImageViewer（`yet-another-react-lightbox` 灯箱，支持 Zoom 插件）、TableOfContents（桌面端侧边栏 + 移动端浮动面板）、Prose（排版容器，关闭了 code 伪元素）、CodeBlock（`<pre>` 包装，含语言标签、复制按钮、Shiki CSS 变量注入）、Callout（Notion 标注框，`icon` + `color`）、Columns/Column（多列布局）、Typewriter（首页打字动画）、BackToTop（返回顶部）、Tag
- `src/app/(blogs)/_components/` — PostItem、PostItemLite（归档页轻量版，仅标题+日期）、PostMeta（日期+分类+标签，支持 compact 模式）、Tag
- `src/app/words/_components/` — WordCard（从 MDX 正文分离图片和文本分别渲染）、WordImageGrid

### MDX 渲染链

`MarkdownRenderer` 服务端组件使用 `@mdx-js/mdx` 的 `evaluate()`：

```
content → remarkGfm → [rehypeShiki (双主题 light/dark)] → [rehypeSlug (标题锚点)] → MDXContent + components map
```

- `highlight={false}` 跳过语法高亮（说说卡片使用）
- `slug={false}` 跳过标题锚点（说说卡片使用）
- `rehypeShiki` 输出字符串形式的 `style` prop，`CodeBlock` 通过 `useRef` + `setAttribute` 处理
- `rehypeSlug` 为标题添加 ID，供 TOC 锚点跳转
- `components` 映射将 `img` → `ImageViewer`、`pre` → `CodeBlock`、`Callout`、`Columns`/`Column`

### 关键模式

- **content-loader 函数**：`getAllPosts()`、`getPostBySlug()`、`getPostsByTag()`、`getPostsByCategory()`、`getAllTags()`（含 count，按数量降序）、`getAllCategories()`、`getPostStats()`（`{ totalPosts, totalWords }`，中文字符 + 英文单词）。
- **PostMetadata** 含 `category: string` 字段，用于分类筛选和归档。
- **WordMetadata** 含 `from: string` 字段，表示说说来源（如"快捷指令"），显示在 WordCard 上。
- **说说文件命名**：以 `title` 作为文件名键（`words-fetcher.ts` 中 `getFileKey: (item) => item.title`）。
- **WordCard 渲染**：`extractImagesFromMdx()` 从 MDX 正文分离图片和文本 → 图片给 `WordImageGrid` 网格展示 → 剩余文本走 `MarkdownRenderer`（`highlight={false}` `slug={false}`）。
- **目录标题提取**：`content-supports.ts` 的 `extractHeadings()` 复刻 `rehype-slug` 的 slugify 逻辑，在服务端预计算标题 ID 供 TOC 组件使用。清理 Markdown 格式标记（bold/italic/code/link）后再 slugify。
- **CodeBlock 复制**：优先 `navigator.clipboard.writeText`，降级到 `document.execCommand('copy')`。
- **说说日期格式**：`2026/6/12 周五`（年月日 + 中文星期）。

### 设计系统

`src/assets/globals.css` 通过 `@plugin '@tailwindcss/typography'` 启用 `prose` 类，CSS 变量定义暖中性色调（stone），Tailwind v4 `@theme inline` 映射为工具类。大量自定义 `.prose` 覆盖（行内代码、Shiki 双主题、表格、引用、列表）。支持 `prefers-color-scheme` 亮色/暗色模式。字体：霞鶜文楷屏幕版（`lxgw-wenkai-screen-webfont`，直接导入 CSS，不使用 `next/font`），回退 `system-ui`。

`next.config.ts` 允许 `**.notion.so`、`**.amazonaws.com`、`images.unsplash.com` 远程图片。`postcss.config.mjs` 使用 `@tailwindcss/postcss` 插件。

根布局集成 `@vercel/analytics` 和 `@vercel/speed-insights`，配置完整的 SEO metadata（OpenGraph、Twitter Card、robots）。

### CI/CD

`.github/workflows/sync-notion.yml` — 已注释禁用。原本每小时同步 Notion 内容并自动 commit push，现需手动运行 `pnpm fetchAll`。

### 依赖注意事项

- `pnpm.overrides` 强制 `unified` 为 `11.0.5` — `@mdx-js/mdx` 与 `rehype-slug` 等插件对 unified 版本有冲突要求。
- `notion-to-md` 使用 v4 alpha（`4.0.0-alpha.7`），API 与 v3 不兼容。
- `dayjs` 用于日期格式化，`rss` 用于 RSS 生成。
- `yet-another-react-lightbox` 用于图片灯箱（带 Zoom 插件）。
- Git 提交 message 使用简单英文描述
