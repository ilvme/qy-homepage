# 网站性能分析报告

> 分析日期：2026-08-17 · 基于当前 `main` 分支代码与本地构建产物（`.next` 为 dev 缓存，产物体积数据仅作量级参考）
> 结论先行：**最大的性能瓶颈是图片**（345MB 原图直出、无任何优化），其次是**客户端 bundle 与动态页面无缓存**。

## 概览

| 指标 | 实测值 | 评价 |
|------|--------|------|
| 图片总量 | `public/notion-images/` 345MB，258 张 | ❌ 严重：最大单图 4.7MB，98 张 PNG |
| 图片加载方式 | 全部原生 `<img src="原图">` | ❌ 无响应式/无格式转换/无尺寸限制 |
| 客户端组件 | 11 个 'use client' 组件 | ⚠️ 每图一个 Lightbox 实例、每代码块一个客户端组件 |
| 动态渲染页面 | `/posts`、`/words`、`/cooking`、`/awaken`、`/awaken/all`、`/nav`、`/tags/[tag]`、`/categories/[cat]`、`/caidan/daily-words` | ⚠️ 每次请求全量扫描文件系统 + 无缓存 |
| 服务端产物 | `.next/server/chunks` 18MB（dev） | ⚠️ shiki 全量语言 + MDX 引擎占大头，影响冷启动 |
| 字体 | 源 19MB / 97 个 unicode-range 子集 / 产物 4.5MB | ✅ 子集化正确，小优化空间 |
| 评论组件 | IntersectionObserver 懒加载 Giscus | ✅ 已做对，无需改动 |

---

## P0-1 图片：345MB 原图直出，全站最严重瓶颈

### 现状

全部图片用原生 `<img>` 直接加载 Notion 下载的原图，只有 `loading="lazy"`：

- `src/components/ui/ImageViewer.tsx:33` — 文章正文 + 说说所有图片（WordImageGrid 全部走这里）
- `src/app/cooking/_components/ImageGallery.tsx:24` — 下厨网格
- `src/app/(shares)/taste/_components/TasteGallery.tsx:23` — 品味画廊
- `src/app/(shares)/nav/_components/NavCard.tsx:30` — 导航封面

资源现状（实测）：

```
public/notion-images/  345MB / 258 张
  最大: words/绿意山景寄哀情/IMG_1439_*.jpeg  4.7MB
  cooking/jia-chang-xiang-guo/*               4.2MB × 2
  posts/2024-summary/*.png                    4.2MB × 2
  posts/2025-summary/image_*.png              3.8MB
  格式: 102 jpeg + 98 png + 22 jpg + 35 webp + 1 svg
```

### 影响

1. **首屏/滚动加载慢**：手机端一次请求下载 4.7MB 原图；说说列表一页 10 条，图片全是原图
2. **无响应式尺寸**：800px 宽的文章容器也会下载 4000px 的原图
3. **无格式转换**：98 张 PNG 未经压缩（Notion 截图类），转 WebP/AVIF 通常可省 60-80%
4. **无 `width`/`height`** → CLS（文章内图片加载完布局跳动，ImageViewer 虽有 `width=800 height=500` 默认值但没落在 `<img>` 标签上）
5. **后续风险**：`next.config.ts` 为空，无 `images.remotePatterns` 配置，即使换 `next/image` 也会踩外部域名坑

### 建议（按收益排序）

1. **全站换 `next/image`**：Vercel 免费 Image Optimization 自动做 WebP/AVIF + 响应式缩放 + 尺寸校验
   - 先补 `next.config.ts` 的 `images` 配置（`localPatterns` 或 `remotePatterns` + `formats: ['image/webp']`）
   - `ImageViewer` 内替换 `<img>` → `<Image>`，并补 `width`/`height`（从 Notion 同步时 frontmatter 已有尺寸更好，目前宽高是写死默认值，需要来源数据）
   - `ImageGallery`/`TasteGallery`/`NavCard` 同理
2. **同步脚本侧压缩**（`scripts/lib/notion-md-converter.ts`）：下载后用 sharp 压缩（转 webp + 限制最大边 2000px + 质量 80），从源头减少仓库体积。注意 CI 里 `fetchAll` 会重新下载，需在脚本层做，不依赖 `next/image` 也能立刻省一半带宽
3. **说说图片生成缩略图**：`words/绿意山景寄哀情` 这类 4 张 × 4.5MB 的说说，网格缩略图与灯箱原图应分离（缩略图 300px 边）
4. **顺带修死代码**：`ImageGallery.tsx:1` `import Image from 'next/image'` 从未使用

> 即使什么都不改，先压缩存量 345MB 图片 + 同步脚本加压缩，是性价比最高的一步。

---

## P0-2 客户端 bundle：Lightbox × 每张图 + CodeBlock × 每个代码块

### 现状

- `ImageViewer`（'use client'）：`yet-another-react-lightbox` + Zoom 插件，CSS 全局 import
  - 每张图片都渲染一个完整的 `<Lightbox>` 组件实例（即使从未打开）
  - 图片出现在文章详情和说说流 → **这两个页面的客户端 JS 都被 Lightbox 拖大**（本地 dev 产物中最大 chunk 224KB）
- `CodeBlock`（'use client'）：文章里每个代码块一个客户端组件实例，全部参与 hydration
- `Header`（'use client'）：全站布局级客户端组件，只为移动端汉堡菜单
- `BackToTop`、`Typewriter`：小，但全站/首页必带
- 全程没有用 `next/dynamic` 做任何代码分割

### 影响

- 文章详情页 / 说说页的 JS 下载 + hydration 成本被无谓放大；移动端尤其明显
- 图片多的页面（说说列表）hydration 成本 = 图片数 × Lightbox 实例成本

### 建议

1. **Lightbox 按需加载**：`next/dynamic` 动态导入 Lightbox，仅首次点击图片时加载（`ssr: false`）；或改用极轻的替代（原生 `dialog` + `zoom` 手势）
2. **ImageViewer 拆两层**：缩略图层保持服务端组件（纯 `<img>`/`<Image>` + onClick），Lightbox 层用动态导入懒加载
3. **CodeBlock 轻量化**：复制按钮是唯一交互。可改纯 CSS 复制方案（`<details>` + 系统级），或保留但接受成本（每个代码块 ~1KB hydrate）；至少确保 `pre` 本体不参与 hydration
4. **Header 优化**：汉堡菜单可用纯 CSS `<details>`/`:checked` 实现，Header 转为服务端组件，全站少一个客户端组件；或拆出移动菜单为独立客户端小组件，避免整块 Header 客户端化
5. 给 `next build` 挂 `@next/bundle-analyzer`，先拿到真实 bundle 构成再动手

---

## P0-3 动态渲染页面：每次请求全量扫文件 + 无缓存

### 现状

以下页面在 Next 16 中因使用 `searchParams`（或显式 `force-dynamic`）而**每次请求都重新执行**：

| 页面 | 动态原因 | 每次请求的开销 |
|------|----------|----------------|
| `/posts?page=N` | `searchParams`（posts/page.tsx:19） | glob 扫描 + 解析全部 ~120 篇文章 frontmatter + `console.log` |
| `/words?page=N` | `searchParams`（words/page.tsx:22） | 同上 + 读取全部 157 个 words 全文 + **每页 10 次 MDX `evaluate()`** |
| `/cooking?category=&page=` | `searchParams` | 全量解析 cooking MD |
| `/awaken/all?category=&page=` | `searchParams` | 全量解析 awaken（且 `getAllAwakenCategories` 内部再调一次 `getAllAwaken`，同请求重复扫描） |
| `/awaken` | `force-dynamic`（awaken/page.tsx:12，随机一条） | 全量扫描 + **1 次 MDX `evaluate()` 且默认 `highlight: true` → 每次请求都跑 Shiki 高亮** |
| `/nav` | `force-dynamic`（nav/page.tsx:13） | 全量解析 nav MD。**没有理由动态**，nav 也是同步的本地内容 |
| `/tags/[tag]` `/categories/[cat]` | 无 `generateStaticParams` | 全量扫描 + 过滤（`getAllPosts` 被 metadata 和页面各调一次） |
| `/caidan/daily-words` | `searchParams` | 读 580+ 条 CSV + 分页 |

而 `/posts/[slug]`、`/cooking/[slug]`、`/awaken/[slug]` 有 `generateStaticParams`，构建时渲染、运行时零成本（这部分是对的）。

### 影响

- 每个动态请求都做 **glob + 100+ 次 `readFileSync` + gray-matter 解析**，无任何缓存层
- `/awaken` 每次请求跑一次完整 Shiki 高亮（CPU 密集，且结果随"随机一条"不同不可复用）
- `/words` 每次请求做 10 次 MDX 编译
- `console.log('本地文章数：…')`（content-loader.ts:26、words-loader.ts:33）每次请求向生产日志输出，拖慢请求 + 浪费日志配额

### 建议

1. **内容层加缓存**：在 loader 上包 `unstable_cache`（或 React `cache()`）——本地内容由每小时 GitHub Action 重新构建部署驱动，**缓存安全**。Vercel 上 `unstable_cache` 可直接把全量扫描降到一次/15 分钟
2. **能静态的全部静态化**：
   - `/nav` 去掉 `force-dynamic`（无随机逻辑）
   - `/posts`、`/words`、`/cooking`、`/awaken/all` 用 `generateStaticParams` 预生成全部分页（内容量固定、变更由构建驱动），彻底退出动态渲染
   - `/tags/[tag]`、`/categories/[cat]` 加 `generateStaticParams`
3. **`/awaken` 随机逻辑移到客户端**：服务端静态渲染"随机卡片容器"，客户端 fetch 一个轻量 API（或内嵌全部条目的 JSON）做随机；避免每次请求跑 Shiki
4. **删掉生产 `console.log`**：loader 里的日志改为仅在 `process.env.NODE_ENV !== 'production'` 时输出
5. **`MarkdownRenderer` 加 memo**：用 React `cache()` 包裹 `evaluate()` 结果（同一请求内重复内容只编译一次），构建时也可减少重复劳动

---

## P1-1 服务端 bundle：Shiki 全量语言 + MDX 引擎

### 现状

- `.next/server/chunks` 约 18MB（dev 产物，量级参考）：`@shikijs/rehype` 默认打包全部 bundled languages + `@mdx-js/mdx` 编译引擎
- 站点实际代码语言有限（TS/JS/JSON/Bash/Markdown/CSS 为主）

### 影响

- Vercel serverless 函数体积大 → **冷启动变慢**（每次部署后首次访问、扩缩容后首次访问）
- 构建时间也受影响

### 建议

1. Shiki 显式声明语言白名单，例如：

```ts
rehypePlugins.push([
  rehypeShiki,
  {
    themes: { light: 'github-light', dark: 'monokai' },
    defaultColor: false,
    addLanguageClass: true,
    languages: ['ts', 'tsx', 'js', 'jsx', 'json', 'bash', 'css', 'html', 'md', 'python', 'sql', 'yaml'],
  },
]);
```

2. 跑一次 `pnpm build` 后用 `@next/bundle-analyzer` 或 `next build` 的 Route Size 输出核对实际体积变化

---

## P1-2 字体：子集化正确，缺 preload

### 现状

- `layout.tsx:2` 直接 import `lxgwwenkaigbscreen.css`：97 个 `@font-face`，每个都是 unicode-range 子集（每个子集 ~46-72KB），`font-display: swap`
- 构建产物 `.next/static/media` 4.5MB（全部子集文件被复制）
- 无 `preload`、无关键子集优先

### 影响

- 浏览器按需下载子集，实际使用通常只命中其中若干个（正文中文字符覆盖约 20-40 个子集），**这部分设计是对的**
- 中文字体无 preload 时，正文首屏会短暂 fallback 到 system-ui 再 swap（swap 可接受，但首屏渲染两套字形）

### 建议（低优先级）

1. 保持现状可接受；若要优化：用 `next/font/local` 接管，可声明 `preload: true` + `display: 'swap'`，并让 Next 管理子集资源
2. 仓库里 `node_modules/lxgw-wenkai-screen-webfont/files` 19MB 中有 390 个文件，但 CSS 只引用 97 个 gb 变体子集——无碍运行，仅提示磁盘占用

---

## P1-3 CLS 与图片尺寸缺失

- 文章内图片：`ImageViewer` 的 `<img>` 无 `width`/`height` 属性（props 默认 800×500 只存在于组件签名，没落到标签上）→ 加载完成时布局跳动
- `ImageGallery`/`TasteGallery` 网格已有 `aspect-square`/`aspect-[2/3]` 容器，没有此问题
- 建议：`ImageViewer` 内 `<img>` 补 `width={800} height={500}`（或从同步管线把真实尺寸写进 frontmatter），配合 `next/image` 一并解决

---

## P2 小问题清单

| 问题 | 位置 | 说明 |
|------|------|------|
| 死 import | `cooking/_components/ImageGallery.tsx:1` | `import Image from 'next/image'` 未使用 |
| 生产日志 | `content-loader.ts:26`、`words-loader.ts:33` | 每次请求 `console.log` |
| 同请求重复扫描 | `awaken/all/page.tsx:27,51` | `getAllAwaken` 被调两次（categories 内部再调一次） |
| 无缓存头配置 | 无 `vercel.json` | 动态页面无法配 `Cache-Control`；全站无安全头显式声明 |
| 无 bundle 分析 | 无 `@next/bundle-analyzer` | 客户端/服务端体积不可见，建议加 |
| 本地磁盘 | `.next/` 4.4GB | 全部是 Turbopack dev 缓存，非生产问题；`rm -rf .next` 可清理 |
| 构建时间 | — | 全站 ~157 个 MD 全部在构建时 `evaluate()` + Shiki，未实测；配合 loader 缓存与 Shiki 白名单可缩短 |
| 无测试 | — | 无 jest/vitest；上述重构（图片、缓存、动态→静态）回归风险高，建议至少给 loader 加单测 |

---

## 优化优先级总表

| 优先级 | 事项 | 预期收益 | 工作量 |
|--------|------|----------|--------|
| **P0** | 图片压缩 + 换 `next/image` | 页面体积减 70%+、移动端体验质变 | 中（涉及同步脚本 + 4 个组件 + config） |
| **P0** | Lightbox 懒加载、CodeBlock/Header 轻量化 | 文章/说说页 JS -50%+ | 中 |
| **P0** | 动态页面静态化 + loader 缓存 + 删日志 | TTFB 稳定、服务端每请求开销归零 | 小-中 |
| P1 | Shiki 语言白名单 | 冷启动/构建时间下降 | 小 |
| P1 | 图片尺寸落地（CLS） | LCP/CLS 达标 | 小 |
| P1 | 字体 preload | 首屏字形更稳定 | 小 |
| P2 | 死代码/重复扫描/安全头/分析器 | 可维护性 | 小 |

**建议先做 P0 第一项（图片）**：存量 345MB 图片是当前用户感知最大的问题，且压缩脚本 + `next/image` 是标准做法，风险可控。
