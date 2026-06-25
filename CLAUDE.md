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
- `NOTION_MEDIA_DATABASE_ID` — 书影音数据库 ID（尚未使用）
- `NOTION_COLLECTIONS_DATABASE_ID` — 收藏数据库 ID（尚未使用）

## 架构

### 内容管线：Notion → 本地 MD → Next.js

1. **抓取脚本**（`scripts/`）通过 `@notionhq/client` 查询 Notion 数据库的 data_sources，分页获取已发布页面，调用 `notion.pages.retrieveMarkdown()` 获取 Markdown 内容，下载引用的图片到 `public/notion-images/<类型>/`，并将带 YAML frontmatter 的 `.md` 文件写入 `content/posts/` 或 `content/words/`。
2. **加载器**（`src/libs/content-loader.ts`、`words-loader.ts`）在请求时通过 `glob` + `gray-matter` 读取本地 MD 文件，解析 frontmatter 并按需返回正文内容。
3. **页面**渲染加载的数据——文章通过 `next-mdx-remote` 的 `serialize()`（服务端）+ `MDXRemote`（客户端组件）渲染，说说在 `WordCard` 中走类似流程。

`content/posts/` 和 `content/words/` 由脚本生成，不提交到 git。`content/about.md` 是手动维护的静态页面，直接提交。

文章和说说各自拥有独立的 Notion 数据库、抓取脚本和加载器——它们共享 `content-supports.ts` 中的工具函数（frontmatter 解析、标题提取、HTML 转 Markdown 清洗）以及图片下载辅助函数。

`scripts/` 目录结构为镜像布局：`articles/` 和 `words/` 各自包含 `*-fetcher.ts`（入口 + frontmatter 生成）、`notion-supports.ts`（Notion API 查询 + Markdown 获取）、`md-handler.ts`（增量检查 + 写文件）、`images-handler.ts`（图片下载与 URL 替换）。

### 增量同步

抓取脚本将每个 Notion 页面的 `last_edited_time` 与本地 MD 文件 frontmatter 中存储的 `last_edited_time` 进行比对，时间戳一致则跳过。

### 路由表

| 路由 | 文件 | 说明 |
|---|---|---|
| `/` | `app/page.tsx` | 首页，含 Hero 区域和导航网格 |
| `/posts` | `app/posts/page.tsx` | 文章列表，按年份分组 |
| `/posts/[slug]` | `app/posts/[slug]/page.tsx` | 单篇文章，含目录 + MDX 渲染 |
| `/words` | `app/words/page.tsx` | 说说流 |
| `/share` | `app/share/page.tsx` | 书影音分享（占位页） |
| `/about` | `app/(pages)/about/page.tsx` | 渲染 `content/about.md` 为 MDX |
| `/tags/[tag]` | `app/(pages)/tags/[tag]/page.tsx` | 按标签筛选文章 |
| `/friends` | `app/(pages)/friends/page.tsx` | 友链页（静态数据） |
| `/sponsor` | `app/(pages)/sponsor/page.tsx` | 赞赏页（占位） |

`(pages)` 是 Next.js 路由组，不影响 URL 路径，仅用于将非核心页面组织在一起。

### 组件组织

- `components/layout/` — Header（响应式导航，移动端汉堡菜单）、Footer
- `components/ui/` — MdxRenderer（`MDXRemote` 包装，`img` 映射为 ImageViewer）、ImageViewer（点击放大灯箱）、TableOfContents（桌面端侧边栏 + 移动端浮动面板）、Prose（`@tailwindcss/typography` 排版容器，关闭了 code 前后伪元素等默认样式）、Tag/TagCloud、PostItem/PostItemLite
- `app/words/_components/` — WordCard（逐卡片反序列化 MDX，提取图片与正文分离渲染）、WordImageGrid

### 设计系统

在 `src/assets/globals.css` 中以 CSS 变量定义设计令牌，支持亮色/暗色模式（`prefers-color-scheme`），暖中性色调（stone）。Tailwind v4 的 `@theme inline` 将令牌映射为工具类。字体使用 Geist 系列（`next/font`）。`next.config.ts` 允许来自 `**.notion.so`、`**.amazonaws.com`、`images.unsplash.com` 的远程图片。

### 关键模式

- **MDX 渲染链**：服务端组件调用 `serialize(content, { mdxOptions: { rehypePlugins: [rehypeSlug] } })` → 将 `MDXRemoteSerializeResult` 传递给客户端组件 `MdxRenderer`，后者在 `<Prose>` 内渲染 `<MDXRemote>` 并将 `img` 映射为自定义 `ImageViewer` 组件。`rehype-slug` 为标题添加 ID 以支持目录锚点链接。
- **说说文件命名**：以 Notion 的 `page_id`（UUID）作为文件名，不同于文章使用 `slug`。
- **Markdown 中图片处理**：通过正则提取图片 URL，使用 axios 流式下载，在保存前将 URL 替换为 `/notion-images/<类型>/<slug或id>/` 本地路径。
- **目录标题提取**：`content-supports.ts` 中的 `extractHeadings()` 复刻了 `rehype-slug` 的 slugify 逻辑，在服务端预计算标题 ID 供 TOC 组件使用。
- **WordCard 渲染策略**：先从 MDX 正文中通过正则分离图片链接和文本内容，图片交给 `WordImageGrid` 以网格展示，剩余文本再走 MDX 序列化渲染。无正文时退回到显示 `title`。
