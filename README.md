# 林深时觉寒

个人主页 / 博客。内容在 Notion 中编辑，同步为本地 Markdown，MDX 在服务端渲染，部署在 Vercel。

站点：<https://ikangjia.cn>

## 技术栈

- **框架**：Next.js 16（App Router）、React 19、TypeScript 5
- **样式**：Tailwind CSS v4、`@tailwindcss/typography`
- **内容**：MDX（`@mdx-js/mdx` 的 `evaluate()`）、Notion API（`@notionhq/client`）、`notion-to-md` v4、`@11ty/gray-matter`
- **代码高亮**：Shiki（`@shikijs/rehype`，`github-light` / `monokai` 双主题）
- **搜索**：MiniSearch，索引在构建期生成，查询纯前端完成
- **图片**：`yet-another-react-lightbox` 灯箱；`sharp` 在同步阶段统一转 webp
- **评论**：Giscus
- **工程化**：Biome 2、tsx、pnpm 9、GitHub Actions、Vercel

## 站点结构

| 路由 | 内容 |
|------|------|
| `/` | 首页（信息流 + 探索卡片） |
| `/posts`、`/posts/[slug]` | 文章列表（分页）+ 详情 |
| `/archives` | 归档，按年聚合并承载标签/分类入口 |
| `/categories`、`/categories/[category]` | 分类 |
| `/tags`、`/tags/[tag]` | 标签 |
| `/rss.xml` | 文章 RSS（全文输出，最近 20 篇） |
| `/words`、`/words/tags`、`/words/tags/[tag]` | 说说流（分页 30）+ 说说标签 |
| `/words/monthly`、`/words/monthly/[month]` | 说说月刊（按月归档） |
| `/words/rss.xml` | 说说 RSS（全文输出，最新 50 条） |
| `/awaken`、`/awaken/[slug]`、`/awaken/all` | 分享（列表 + 详情 + 全部） |
| `/taste` | 书影音画廊 |
| `/cooking`、`/cooking/[slug]` | 下厨画廊 + 详情 |
| `/about`、`/friends`、`/resume`、`/sponsor` | 静态页面 |
| `/caidan`、`/caidan/daily-words` | 彩蛋 + 旧版说说 |

`/tags`、`/categories` 目前没有站内入口（导航里 `surfaces: []`），页面保留、靠外链直达。

## 内容管线

### 数据流

```
Notion（4 个数据库）
  articles ─┬─ type: article ──→ content/posts/
            └─ type: page    ──→ content/pages/
  words ─────────────────────→ content/words/
  shares ──┬─ type: awaken  ──→ content/shares/awaken/
           └─ type: taste   ──→ content/shares/taste/
  cooking ───────────────────→ content/cooking/
        │
        ├─ 图片 ──→ public/notion-images/<类型>/<页面标题>/
        │
        └─ GitHub Action 每小时跑 fetchAll → commit → push → Vercel 构建

运行时：content/*.md
  ──→ src/libs/*-loader.ts（glob + gray-matter 解析 frontmatter）
  ──→ MarkdownRenderer（@mdx-js/mdx evaluate，服务端渲染）
  ──→ 页面
```

分享与书影音共用一个 Notion 数据库，靠 `type` 字段分流到两个目录、两个 loader。

### 同步机制

- **每个 fetcher 完全自包含**：自己查库、自己定义 Notion property → frontmatter 的映射、自己拼 MD 字符串。只有 `scripts/lib/` 里的纯函数（查库、转 MD、增量判断、封面下载）被共享。
- **增量**：`content/sync-state.json` 记录每页的 `last_edited_time`，未变则跳过。`pnpm fetchAll --force` 绕过。
- **删除传播**：Notion 里删掉页面后，下次同步时 `cleanOrphanedFiles()` 会清掉对应 `.md`、sync-state 条目与封面目录。
- **图片**：按 URL path 的 md5 前 8 位命名（`img_<hash>.webp`，避开签名参数变化导致的重复下载），统一转 webp（长边 1600 / 质量 80，SVG 与 GIF 原样保留）。每页转换结束后清理本页目录里未被正文引用的文件。
- **预发布**：说说支持未来日期，`date` 未到则不入列表。

## 目录结构

```
src/
├── app/                    App Router 页面与路由
│   ├── (blogs)/            文章、归档、分类、标签、RSS
│   ├── (shares)/           分享、书影音
│   ├── (pages)/            关于、友链、简历、赞赏
│   ├── words/              说说流、标签、月刊、RSS
│   ├── cooking/            下厨
│   ├── caidan/             彩蛋
│   └── api/words/publish   发布接口（快捷指令用，无 Web 页面）
├── components/
│   ├── ui/                 渲染与交互组件（MarkdownRenderer、ImageViewer、SearchPalette 等）
│   ├── layout/             SiteShell、Header、Footer、宽窄路由
│   └── icons/              统一图标出口
├── libs/                   内容加载、frontmatter 解析、分页、分词、RSS 拼装
├── assets/                 globals.css（token）、prose.css（排版覆盖）
├── site.config.ts          导航、RSS、分页、Hero、Giscus 的唯一配置源
scripts/                    Notion 同步脚本 + 搜索索引构建
content/                    同步产物（MD + sync-state.json）
public/notion-images/       同步产物（图片）
```

## 本地开发

```bash
cp .env.example .env
pnpm install
pnpm dev            # 构建搜索索引后启动，http://localhost:3000
pnpm build          # 生产构建
pnpm lint           # Biome 检查
pnpm format         # Biome 格式化并写入
```

`dev` / `build` 会先执行 `tsx scripts/build-search-index.ts` 生成 `public/search-index.json`；直接跑 `next dev` 拿不到搜索数据。

### 同步内容

```bash
pnpm fetchAll          # 全量同步（增量语义，只处理有改动的）
pnpm fetchAll --force  # 忽略增量状态，强制重拉
pnpm fetchArticles     # 仅文章
pnpm fetchPages        # 仅页面
pnpm fetchShares       # 仅分享
pnpm fetchCooking      # 仅下厨
pnpm fetchWords        # 仅说说
```

### 环境变量

| 变量 | 用途 | 需要配置的位置 |
|------|------|----------------|
| `NOTION_TOKEN` | Notion Integration Token | 本地 + Vercel + GitHub Secrets |
| `NOTION_ARTICLES_DATABASE_ID` | 文章数据库（含 page 类型） | 同上 |
| `NOTION_WORDS_DATABASE_ID` | 说说数据库 | 同上 |
| `NOTION_SHARE_DATABASE_ID` | 分享 / 书影音数据库 | 同上 |
| `NOTION_COOKING_DATABASE_ID` | 下厨数据库 | 同上 |
| `PUBLISH_SECRET` | 说说发布接口密钥（`Authorization: Bearer`） | 本地 + Vercel |
| `VERCEL_DEPLOY_HOOK` | 发布说说后触发重新部署 | Vercel |
| `NEXT_PUBLIC_SITE_URL` | 站点绝对 URL（RSS / sitemap / metadataBase） | Vercel |
| `FORCE_SYNC` | 设为 `true` 等价于 `--force` | 本地临时用 |

## 部署与自动化

- **托管**：Vercel，push `main` 即构建。
- **内容同步**：`.github/workflows/sync-notion.yml` 每小时（`cron: "0 * * * *"`）执行 `pnpm fetchAll`，有变更时提交 `content/` 与 `public/notion-images/` 并 push，从而触发 Vercel 重新构建。需要 5 个 GitHub Secrets（token + 4 个数据库 ID）。
- **说说发布**：`POST /api/words/publish` 写入 Notion 后 fire-and-forget 触发 Deploy Hook——新说说要等下一次构建才会上线，所以这里主动催一次。

## 设计系统

- **配色**：CSS 变量定义的暖中性色（stone）。亮暗两套值在 `src/assets/globals.css`，通过 `@theme inline` 映射成 Tailwind 类名。
- **暗色**：挂在 `<html class="dark">` 上，主题三态 `system → light → dark`，存 `localStorage.theme`；首帧由内联脚本定档，避免刷新闪烁。
- **字体**：思源黑体（`next/font` 的 `Noto_Sans_SC`），构建期自托管中文切片，正文取可变轴 450。
- **边框两档**：`--border`（卡片、表格、浮层、Header 分割）与 `--border-subtle`（`hr`、卡片内部分割线），刻意做轻，对比度约 1.16 / 1.08。
- **图片**：暗色模式下 `<article>` 内的图片统一压暗（`brightness(0.78)`），避免白底截图在深色背景上形成刺眼光块；灯箱是独立 DOM，不受影响。

## 关于文档

| 文件 | 面向 | 内容 |
|------|------|------|
| `README.md` | 人 | 项目介绍、站点结构、内容管线、开发与部署（本文件） |
| `CLAUDE.md` | AI 编码工具 | 命令、硬约定、已知陷阱——只放代码里读不出来的东西 |
| `AGENTS.md` | 其他 AI 工具 | 指向 `CLAUDE.md` |

设计细节与「为什么这么做」就近写在代码注释里（如 `layout/wide-route.ts`、`ui/Columns.tsx`、`libs/search-tokenizer.ts`），改代码时顺手更新，不在文档里重复维护。
