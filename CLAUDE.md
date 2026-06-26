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
pnpm fetchAll         # 从 Notion 同步所有内容到本地 MD 文件
pnpm fetchArticles    # 仅同步文章
pnpm fetchWords       # 仅同步说说
```

`fetchAll` 加 `--force` 参数可绕过增量检查，强制全量重新同步。`--force` 会设置环境变量 `FORCE_SYNC=true`，各 fetcher 据此跳过增量逻辑。

## 环境变量

复制 `.env.example` 为 `.env` 并填入：

- `NOTION_TOKEN` — Notion Integration Token
- `NOTION_ARTICLES_DATABASE_ID` — 文章数据库 ID
- `NOTION_WORDS_DATABASE_ID` — 说说数据库 ID
- `NOTION_SHARE_DATABASE_ID` — 分享数据库 ID（尚未使用）

## 目录约定

- `src/app/` — Next.js App Router 页面（`@/` 别名映射到 `src/`）
- `src/components/` — 通用 UI 组件
- `src/libs/` — 服务端工具：内容加载、frontmatter 解析、标题提取
- `scripts/` — Notion 同步脚本（`tsx` 执行）
- `content/` — 生成的 MD 文件（不提交 git）
- `public/notion-images/` — 从 Notion 下载的图片（不提交 git）
- Node 20，ES2022 target，tsconfig `strict: true`

## 架构

### 内容管线：Notion → 本地 MD → Next.js

1. **同步脚本**（`scripts/`）通过 `@notionhq/client` 查询 Notion 数据库的 `data_sources` 端点，分页获取已发布页面，调用 `notion.pages.retrieveMarkdown()` 获取 Markdown 内容，下载引用的图片，写入带 YAML frontmatter 的 `.md` 文件到 `content/` 下。
2. **加载器**（`src/libs/content-loader.ts`、`words-loader.ts`）在请求时通过 `glob` + `gray-matter` 读取本地 MD 文件，解析 frontmatter 并按需返回正文。
3. **页面** 渲染加载的数据 — 文章和关于页通过 `serialize()`（服务端）+ `MDXRemote`（客户端）渲染，说说在 `WordCard` 中逐卡片序列化。

`content/about.md` 是唯一手动维护的静态 MD 文件，直接提交到 git。

### 脚本目录结构

```
scripts/
├── fetch-all.ts           # 统一入口，按顺序调用 articles + words fetcher
├── articles-fetcher.ts    # 文章同步：mapPage → generateContent → createMdHandler
├── words-fetcher.ts       # 说说同步：同上模式，文件键名用 page_id 而非 slug
├── types.ts               # PostMetadata / WordMetadata 接口定义
└── lib/
    ├── notion-client.ts   # fetchAllPages() 分页查询, fetchPageMarkdown()
    ├── md-handler.ts      # createMdHandler() 工厂：增量检查 → 下载图片 → 写文件
    └── images-handler.ts  # 图片正则提取 + axios 下载 + URL 替换为本地路径
```

`articles-fetcher` 和 `words-fetcher` 共享 `lib/` 中的通用逻辑，通过 `createMdHandler<T>()` 工厂函数进行参数化（输出目录、图片路径、文件标识符、frontmatter 生成函数不同）。

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
| `/about`        | `src/app/(pages)/about/page.tsx`          | 渲染 `content/about.md` 为 MDX |
| `/tags/[tag]`   | `src/app/(pages)/tags/[tag]/page.tsx`     | 按标签筛选文章                 |
| `/friends`      | `src/app/(pages)/friends/page.tsx`        | 友链页（静态数据）             |
| `/sponsor`      | `src/app/(pages)/sponsor/page.tsx`        | 赞赏页（占位）                 |

`(pages)` 是 Next.js 路由组，不影响 URL 路径。

### 组件组织

- `src/components/layout/` — Header（响应式导航，移动端汉堡菜单）、Footer
- `src/components/ui/` — MdxRenderer（`MDXRemote` 包装）、ImageViewer（灯箱）、TableOfContents（桌面端侧边栏 + 移动端浮动面板）、Prose（排版容器，关闭了 code 伪元素）、CodeBlock（`<pre>` 包装，含语言标签、复制按钮、Shiki CSS 变量注入）、BackToTop（返回顶部）、Tag/TagCloud、PostItem/PostItemLite
- `src/app/words/_components/` — WordCard（逐卡片反序列化 MDX）、WordImageGrid

### MDX 渲染链

服务端：`serialize(content, { mdxOptions: { rehypePlugins: [rehypeShiki, rehypeSlug] } })` → 将 `MDXRemoteSerializeResult` 传给客户端 `MdxRenderer`，它在 `<Prose>` 内渲染 `<MDXRemote>`，`img` 映射为 `ImageViewer`，`pre` 映射为 `CodeBlock`。

- `rehypeShiki`（`@shikijs/rehype`）提供语法高亮，通过 CSS 变量注入主题色。Shiki 输出的是**字符串**形式的 `style` prop，React 无法直接处理，`CodeBlock` 通过 `useRef` + `setAttribute` 绕过此限制。
- `rehypeSlug` 为标题添加 ID，供 TOC 锚点跳转。

### 关键模式

- **图片处理**：脚本侧用正则提取 Markdown 图片 URL → axios 流式下载到 `public/notion-images/<类型>/<key>/` → 替换为本地路径。页面侧 `ImageViewer` 提供点击放大灯箱。
- **说说文件命名**：以 Notion `page_id`（UUID）作为文件名，不同于文章的 `slug`。
- **WordCard 渲染策略**：用正则从 MDX 正文分离图片和文本 → 图片给 `WordImageGrid` 网格展示 → 剩余文本走 MDX 序列化。无正文时退回到显示 `title`。
- **目录标题提取**：`content-supports.ts` 的 `extractHeadings()` 复刻 `rehype-slug` 的 slugify 逻辑，在服务端预计算标题 ID 供 TOC 组件使用。清理 Markdown 格式标记（bold/italic/code/link）后再 slugify。
- **CodeBlock 复制**：优先 `navigator.clipboard.writeText`，降级到 `document.execCommand('copy')` 兼容旧浏览器。
- **说说日期格式**：`2026/6/12 周五`（年月日 + 中文星期）。

### 设计系统

`src/assets/globals.css` 以 CSS 变量定义暖中性色调（stone），Tailwind v4 `@theme inline` 映射为工具类。支持 `prefers-color-scheme` 亮色/暗色模式。字体：Geist（`next/font`）+ 霞鹜文楷屏幕版（`lxgw-wenkai-screen-webfont`）。`next.config.ts` 允许 `**.notion.so`、`**.amazonaws.com`、`images.unsplash.com` 远程图片，并配置 `transpilePackages: ['next-mdx-remote']` 以兼容 Turbopack。

### CI/CD

`.github/workflows/sync-notion.yml` — 每小时（`0 * * * *`）运行 `pnpm fetchAll`，有变更时自动 commit 并 push。可手动触发（`workflow_dispatch`）。使用 Node 20 + pnpm 9.1.1。

### 依赖注意事项

`pnpm.overrides` 强制 `unified` 为 `11.0.5` — `next-mdx-remote` 与 `rehype-slug` 等插件对 unified 版本有冲突要求，此覆盖统一解析。
