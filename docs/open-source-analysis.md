# 开源化分析报告

> 本文档梳理将"和光同尘"个人博客开源为通用博客框架前需要处理的所有事项。
>
> 评估日期：2026-08-19

## 一、项目定位与开源可行性

本项目基于 **Next.js 16 (App Router) + React 19 + TypeScript 5 + Tailwind CSS v4**，内容在 Notion 中编辑、通过脚本同步为本地 Markdown，MDX 经 `@mdx-js/mdx` 的 `evaluate()` 在服务端渲染，部署在 Vercel。

**结论**：架构成熟、文档完善（CLAUDE.md + docs/ 6 篇），代码质量高，**开源化完全可行**。但当前代码与个人身份强耦合，需要做一次系统性的"去个人化 + 框架化"改造。

**核心矛盾**：代码是框架级的，但内容（`content/` 约 1MB / 166 个 MD 文件 + `public/notion-images/` **359MB** 个人图片）、文案、域名、Giscus `repoId` 都是硬编码的个人数据。

## 二、代码与模块功能总览

架构详见 [CLAUDE.md](../CLAUDE.md)，此处仅从开源视角列模块清单：

| 模块 | 位置 | 开源评价 |
|------|------|----------|
| 内容管线 | `scripts/`（6 个独立 fetcher + `lib/`） | ✅ 设计干净，每个 fetcher 自包含 |
| 加载器 | `src/libs/`（5 个 loader + `content-supports.ts`） | ✅ 纯函数，可复用 |
| MDX 渲染 | `src/components/ui/MarkdownRenderer` | ✅ 服务端 `evaluate()`，方案优秀 |
| 路由 | `src/app/` 下 6 个路由组 | ⚠️ 含彩蛋页 `/caidan` 需剥离 |
| 配置 | `src/site.config.ts` | ⚠️ 个人数据与框架配置混在一起 |
| 布局 | `src/app/layout.tsx` | ⚠️ Vercel Analytics 硬注入 |
| 文档 | `docs/`（6 篇）+ `CLAUDE.md` + `README.md` | ✅ 基础齐全 |

### 路由组

| 路由组 | 路由 | 说明 |
|--------|------|------|
| — | `/` | 首页 |
| `(blogs)` | `/posts`、`/posts/[slug]`、`/archives`、`/categories/[cat]`、`/tags/[tag]`、`/rss.xml` | 博客文章 |
| — | `/words`、`/words/tags/[tag]` | 说说流 |
| `(shares)` | `/awaken`、`/awaken/[slug]`、`/awaken/all`、`/taste`、`/nav` | 分享·觉晓 / 品味 / 导航 |
| `(cooking)` | `/cooking`、`/cooking/[slug]` | 下厨画廊 |
| `(pages)` | `/about`、`/friends`、`/resume`、`/sponsor` | 静态页面 |
| `(admin)` | `/publish-words` | Web 端说说发布（支持 PWA） |
| — | `/caidan`、`/caidan/daily-words` | ⚠️ 彩蛋 + 旧版说说（私人页面） |
| — | `robots.ts`、`sitemap.ts`、`not-found.tsx` | SEO + 404 |

### 内容类型映射

| 类型 | Notion 库 | Fetcher | Loader |
|------|-----------|---------|--------|
| 文章 + 页面 | articles（type 区分） | articles-fetcher + pages-fetcher | content-loader |
| 说说 | words | words-fetcher | words-loader |
| 分享·觉晓 | shares（type: "awaken"） | shares-fetcher | awaken-loader |
| 分享·品味 | shares（type: "taste"） | shares-fetcher | taste-loader |
| 导航 | 本地 `content/nav.ts` | — | nav-loader（直接 import） |
| 下厨 | cooking | cooking-fetcher | cooking-loader |

## 三、开源化待办清单（按优先级）

### 🔴 P0 — 必删个人数据（影响仓库体积与隐私）

| 项目 | 位置 | 规模 | 处理方式 |
|------|------|------|----------|
| Notion 图片 | `public/notion-images/` | **359MB** | 整目录清空，加 `.gitkeep` |
| 个人文章 | `content/posts/` | 37 篇 | 清空，留 1–2 篇示例 MD |
| 个人说说 | `content/words/` | 70 篇 | 清空 |
| 个人分享 | `content/shares/` | 31 篇 | 清空（保留 nav 示例） |
| 下厨记录 | `content/cooking/` | 20 篇 | 清空 |
| 旧版说说 | `content/old-words/` | 5 文件 | 删除 |
| 赞助二维码 | `public/images/wechat-sponsor-qr.jpg` | — | 删除 |
| 个人页面内容 | `content/pages/` | 3 篇 | 清空，留示例 |

### 🟠 P1 — 必参数化的个人身份

#### `src/site.config.ts`

```typescript
url: 'https://ikangjia.cn'                                // → 改占位 https://example.com
author: { name: 'kangjia', displayName: '林深时觉寒' }    // → 占位
hero: { greeting: '你好，我是林深时觉寒', intro: '...' }   // → 占位文案
giscus: { repo: 'ilvme/site-comments', repoId: 'R_kgDOQGPClw', ... }  // → 留空字段 + 文档
```

**建议方案**（任选其一）：

- 方案 A：`site.config.ts` → 改名为 `site.config.example.ts`，新增 `site.config.local.ts` 并加入 `.gitignore`。
- 方案 B：身份相关字段全部走环境变量（`NEXT_PUBLIC_SITE_URL`、`NEXT_PUBLIC_AUTHOR_NAME` 等）。

#### 各页面硬编码文案位置

| 文件 | 内容 |
|------|------|
| `src/app/page.tsx` | 首页 Hero 文案展示 |
| `src/app/(pages)/about/page.tsx` | 关于页正文 |
| `src/app/(pages)/resume/page.tsx` | 简历页内容路径硬编码 |
| `src/app/(pages)/sponsor/page.tsx` | 赞助页微信二维码路径 |
| `src/app/(pages)/friends/page.tsx` | 友链页文案 |
| `src/app/not-found.tsx` | 自定义 404 文案 |
| `src/app/(shares)/nav/page.tsx` | 导航页文案 |
| `src/components/layout/Footer.tsx` | Footer 中的个人名称 |

### 🟡 P2 — 平台绑定需解耦

#### Vercel Analytics / Speed Insights 硬注入

`src/app/layout.tsx` 第 67–68 行：

```tsx
<Analytics />        // @vercel/analytics — Vercel 专属
<SpeedInsights />    // @vercel/speed-insights — Vercel 专属
```

**处理**：

- 用 `process.env.NEXT_PUBLIC_VERCEL` 条件渲染，或
- 在 `site.config.ts` 加 `analytics: { enabled: boolean }` 开关。

否则非 Vercel 用户（Cloudflare Pages / Netlify）部署会失效或报错。

### 🟡 P2 — 彩蛋/私人页面剥离

| 文件 | 说明 |
|------|------|
| `src/app/caidan/page.tsx` | 个人彩蛋页 |
| `src/app/caidan/daily-words/page.tsx` | 旧版说说页 |

**处理**：

- 开源版删除 `src/app/caidan/` 整个目录；或
- 移到 `examples/private-pages/` 作为"如何加私人页"的示范。

### 🟢 P3 — 第三方服务文档化

| 服务 | 配置位置 | 开源后用户需做 |
|------|----------|----------------|
| Notion | `NOTION_TOKEN` + 4 个 DB ID | 建 Notion Integration + 4 个数据库 |
| Giscus | `src/site.config.ts` 的 `giscus` 字段 | 建评论 repo + 在 giscus.app 配置 |
| GitHub Actions | `.github/workflows/sync-notion.yml` | 配 5 个 GitHub Secrets |
| Vercel Analytics | `src/app/layout.tsx` 硬注入 | Vercel 部署自动启用，否则需关闭 |
| 字体 | npm 包 `lxgw-wenkai-screen-webfont` | ✅ 无需处理，是 npm 依赖 |
| RSS / sitemap / robots | `src/app/` 下纯本地生成 | ✅ 无外部依赖，可直接开源 |

### 🟢 P3 — 开源标配文件（全部缺失）

需新增：

- `LICENSE` — 选 MIT 或 Apache-2.0
- `CONTRIBUTING.md`
- `CODE_OF_CONDUCT.md`
- `.github/ISSUE_TEMPLATE/`（bug + feature 模板）
- `.github/PULL_REQUEST_TEMPLATE.md`
- `CHANGELOG.md`（可选）

### 🟢 P3 — 配置不一致修复

`.env.example` 与 `CLAUDE.md` 不一致：

| 变量 | `.env.example` | `CLAUDE.md` | 处理 |
|------|-----------------|-------------|------|
| `NEXT_PUBLIC_SITE_URL` | ❌ 缺 | ✅ 有 | 补上 |
| `MANAGE_PASSWORD` | ✅ 有 | ❌ 未提 | 核实用途，补文档或删 |

### 🟢 P3 — `next.config.ts` 潜在问题

`next.config.ts` 当前是空对象。`CLAUDE.md` 注明"若生产加载 Notion/Unsplash 外部图片遇问题需加 `images.remotePatterns`"。开源后用户会遇到，建议预置示例配置（注释掉）：

```typescript
const nextConfig: NextConfig = {
  // images: {
  //   remotePatterns: [
  //     { protocol: 'https', hostname: 'prod-files-secure.s3.us-west-2.amazonaws.com' },
  //     { protocol: 'https', hostname: 'images.unsplash.com' },
  //   ],
  // },
};
```

## 四、建议的开源化工作流

按 5 个阶段分批提交，每阶段一次提交，便于回溯：

```
Phase 1: 清空数据（机械操作）
  └─ 删 public/notion-images/* + content/* 全清
  └─ 保留 content/nav.ts 作为示例 + 留 1 篇示例 post
  └─ public/images/ 删个人图片，保留框架资源

Phase 2: 参数化配置
  └─ site.config.ts → 占位值 + Giscus 字段留空
  └─ 修复 .env.example 不一致（补 NEXT_PUBLIC_SITE_URL）

Phase 3: 解耦平台绑定
  └─ layout.tsx Analytics 条件化
  └─ 删 src/app/caidan/

Phase 4: 补开源标配
  └─ LICENSE + CONTRIBUTING + CODE_OF_CONDUCT
  └─ .github/ISSUE_TEMPLATE/ + PULL_REQUEST_TEMPLATE.md

Phase 5: 文档润色
  └─ README 加"快速开始"章节
  └─ 新增 docs/notion-setup.md 教用户建数据库
  └─ CLAUDE.md 中 Co-Authored-By: Claude 的提交规范需说明
  └─ next.config.ts 预置 images.remotePatterns 示例（注释）
```

## 五、一句话总结

代码本身开源度很高（约 90% 就绪），主要工作量在 **清理 359MB 个人图片** 和 **剥离 `site.config.ts` + 各页面文案的个人身份**，预计 **4–6 次提交** 可完成框架化。
