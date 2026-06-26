# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

个人主页/博客（"和光同尘"），基于 Next.js 16（App Router）、React 19、TypeScript 和 Tailwind CSS v4 构建。内容在 Notion 中编辑，通过脚本同步为本地 Markdown 文件（含 YAML frontmatter），MDX 通过 `next-mdx-remote` 在客户端渲染。

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
- `src/libs/` — 服务端工具：内容加载、MDX 序列化、frontmatter 解析、标题提取
- `scripts/` — Notion 同步脚本（`tsx` 执行）
- `content/` — 生成的 MD 文件
- `public/notion-images/` — 从 Notion 下载的图片
- Node 20，ES2022 target，tsconfig `strict: true`

`content/posts/`、`content/words/`、`content/shares/` 不提交 git。`content/pages/` 中的静态页面 MD（about/friends/resume）提交到 git。

## 架构

### 内容管线：Notion → 本地 MD → Next.js

1. **同步脚本**（`scripts/`）通过 `@notionhq/client` 查询 Notion 数据库，按 `type` 字段过滤（article/page/share），分页获取已发布页面，调用 `notion.pages.retrieveMarkdown()` 获取 Markdown 内容，清理 Notion 特有标记（`<empty-block/>`、`{color="..."}`、`<span>`），下载引用的图片，写入带 YAML frontmatter 的 `.md` 文件到 `content/` 下。
2. **加载器**（`src/libs/content-loader.ts`、`words-loader.ts`）在请求时通过 `glob` + `gray-matter` 读取本地 MD 文件，解析 frontmatter 并按需返回正文。
3. **MDX 序列化**（`src/libs/mdx-serializer.ts`）提供两个函数：`serializeMdx()`（完整版：rehype-raw + Shiki 高亮 + slug 锚点）和 `serializeMdxLite()`（轻量版：仅 rehype-raw，用于说说卡片）。
4. **页面** 渲染序列化后的数据 — 文章/关于/友链/简历通过 `serializeMdx()` + `MdxRenderer` 渲染，说说在 `WordCard` 中逐卡片用 `serializeMdxLite()` 序列化。

### site.config.ts

`src/site.config.ts` 集中管理站点元信息：URL、标题、描述、作者、关键词、RSS 配置、首页 Hero 文案。被 `layout.tsx`（metadata）、`page.tsx`（Hero）、RSS 路由等引用。

### RSS

`src/app/rss.xml/route.ts` 生成 RSS 2.0 订阅源，过滤已发布文章，配置缓存（默认 3600s）。根布局通过 `<link rel="alternate" type="application/rss+xml">` 注册。

### 脚本目录结构

```
scripts/
├── fetch-all.ts           # 统一入口，按顺序调用 articles → pages → shares → words
├── articles-fetcher.ts    # 文章同步（type: "article"）
├── pages-fetcher.ts       # 页面同步（type: "page"）：关于、友链、简历
├── shares-fetcher.ts      # 分享同步（type: "share"）
├── words-fetcher.ts       # 说说同步：文件键名用 page_id 而非 slug
├── types.ts               # PostMetadata / WordMetadata 接口定义
└── lib/
    ├── notion-client.ts   # fetchAllPages() 分页查询, fetchPageMarkdown()
    ├── md-handler.ts      # createMdHandler() 工厂：增量检查 → 下载图片 → 写文件
    ├── images-handler.ts  # 图片正则提取 + axios 下载 + URL 替换为本地路径
    ├── article-utils.ts   # mapArticlePage()、generateMdContent()、fetchByType()、createHandler()
    └── notion-utils.ts    # cleanNotionMarkdown()：清理 Notion 特有标记
```

`articles-fetcher`、`pages-fetcher`、`shares-fetcher` 共用 `article-utils.ts` 中的 `fetchByType()` 和 `createHandler()`，通过 `type` 字段区分内容类型。`words-fetcher` 独立实现，文件命名用 `page_id`。

### 增量同步

将每个 Notion 页面的 `last_edited_time` 与本地 MD 文件 frontmatter 中的 `last_edited_time` 比对，一致则跳过。`--force` 模式设置 `FORCE_SYNC=true` 绕过此逻辑。

### 路由表

| 路由            | 文件                                      | 说明                           |
| --------------- | ----------------------------------------- | ------------------------------ |
| `/`             | `src/app/page.tsx`                        | 首页，Hero 区域 + 导航卡片网格 |
| `/posts`        | `src/app/posts/page.tsx`                  | 文章列表，按年份分组           |
| `/posts/[slug]` | `src/app/posts/[slug]/page.tsx`           | 单篇文章，TOC + MDX 渲染       |
| `/words`        | `src/app/words/page.tsx`                  | 说说流                         |
| `/share`        | `src/app/share/page.tsx`                  | 分享页（占位）                 |
| `/about`        | `src/app/(pages)/about/page.tsx`          | 渲染 `content/pages/readme.md` |
| `/friends`      | `src/app/(pages)/friends/page.tsx`        | 渲染 `content/pages/friends.md` |
| `/resume`       | `src/app/(pages)/resume/page.tsx`         | 渲染 `content/pages/resume.md` |
| `/sponsor`      | `src/app/(pages)/sponsor/page.tsx`        | 赞赏页（静态二维码图片）       |
| `/tags/[tag]`   | `src/app/(pages)/tags/[tag]/page.tsx`     | 按标签筛选文章                 |
| `/rss.xml`      | `src/app/rss.xml/route.ts`                | RSS 2.0 订阅源                 |

`(pages)` 是 Next.js 路由组，不影响 URL 路径。

### 组件组织

- `src/components/layout/` — Header（响应式导航，移动端汉堡菜单）、Footer
- `src/components/ui/` — MdxRenderer（`MDXRemote` 包装，`img` → `ImageViewer`，`pre` → `CodeBlock`）、ImageViewer（灯箱）、TableOfContents（桌面端侧边栏 + 移动端浮动面板）、Prose（排版容器，关闭了 code 伪元素）、CodeBlock（`<pre>` 包装，含语言标签、复制按钮、Shiki CSS 变量注入）、BackToTop（返回顶部）、Tag/TagCloud、PostItem/PostItemLite
- `src/app/words/_components/` — WordCard（逐卡片反序列化 MDX）、WordImageGrid

### MDX 渲染链

**标准渲染**（文章、关于、友链、简历）：
`serializeMdx(content)` → `rehypeRaw`（解析 HTML，passThrough 保护 MDX 节点）→ `rehypeShiki`（双主题 light/dark 语法高亮）→ `rehypeSlug`（标题锚点）→ `MdxRenderer` 客户端渲染。

**轻量渲染**（说说卡片）：
`serializeMdxLite(content)` → 仅 `rehypeRaw` → `WordCard` 客户端渲染。

- `rehypeShiki` 输出**字符串**形式的 `style` prop，React 无法直接处理，`CodeBlock` 通过 `useRef` + `setAttribute` 绕过此限制。
- `rehypeSlug` 为标题添加 ID，供 TOC 锚点跳转。
- `rehypeRaw` 的 `passThrough` 配置保护 MDX 特殊节点（`mdxJsxFlowElement` 等）不被误解析。

### 关键模式

- **Markdown 清理**：`scripts/lib/notion-utils.ts`（同步侧）和 `src/libs/content-supports.ts`（渲染侧）各有一份 `cleanNotionMarkdown` / `cleanMarkdown`，处理 `<empty-block/>`、`{color="..."}`、`<span>` 标签。两者逻辑基本一致但渲染侧多处理表格 `align` 属性和空段落。
- **图片处理**：脚本侧用正则提取 Markdown 图片 URL → axios 流式下载到 `public/notion-images/<类型>/<key>/` → 替换为本地路径。页面侧 `ImageViewer` 提供点击放大灯箱。
- **说说文件命名**：以 Notion `page_id`（UUID）作为文件名，不同于文章的 `slug`。
- **WordCard 渲染策略**：用正则从 MDX 正文分离图片和文本 → 图片给 `WordImageGrid` 网格展示 → 剩余文本走 `serializeMdxLite()`。无正文时退回到显示 `title`。
- **目录标题提取**：`content-supports.ts` 的 `extractHeadings()` 复刻 `rehype-slug` 的 slugify 逻辑，在服务端预计算标题 ID 供 TOC 组件使用。清理 Markdown 格式标记（bold/italic/code/link）后再 slugify。
- **CodeBlock 复制**：优先 `navigator.clipboard.writeText`，降级到 `document.execCommand('copy')` 兼容旧浏览器。
- **说说日期格式**：`2026/6/12 周五`（年月日 + 中文星期）。

### 设计系统

`src/assets/globals.css` 通过 `@plugin '@tailwindcss/typography'` 启用 `prose` 类，CSS 变量定义暖中性色调（stone），Tailwind v4 `@theme inline` 映射为工具类。大量自定义 `.prose` 覆盖（行内代码、Shiki 双主题、表格、引用、列表）。支持 `prefers-color-scheme` 亮色/暗色模式。字体：霞鶜文楷屏幕版（`lxgw-wenkai-screen-webfont`，直接导入 CSS，不使用 `next/font`），回退 `system-ui`。

`next.config.ts` 允许 `**.notion.so`、`**.amazonaws.com`、`images.unsplash.com` 远程图片，配置 `transpilePackages: ['next-mdx-remote']` 以兼容 Turbopack。`postcss.config.mjs` 使用 `@tailwindcss/postcss` 插件。

根布局集成 `@vercel/analytics` 和 `@vercel/speed-insights`，配置完整的 SEO metadata（OpenGraph、Twitter Card、robots）。

### CI/CD

`.github/workflows/sync-notion.yml` — 每小时（`0 * * * *`）运行 `pnpm fetchAll`，有变更时自动 commit 并 push。可手动触发（`workflow_dispatch`）。使用 Node 20 + pnpm 9.1.1。

### 依赖注意事项

- `pnpm.overrides` 强制 `unified` 为 `11.0.5` — `next-mdx-remote` 与 `rehype-slug` 等插件对 unified 版本有冲突要求，此覆盖统一解析。
- `next-mdx-remote` 需要 `transpilePackages` 配置才能兼容 Turbopack。
- `dayjs` 用于日期格式化，`rss` 用于 RSS 生成，`axios` 用于图片下载。
