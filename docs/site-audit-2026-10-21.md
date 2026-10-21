# 站点全局审视报告（功能差距 + 样式改进 + 工程质量）

> 审视日期：2026-10-21 · 基于当前 `main`（2b95cff）全量源码走读
> 参照系：主流个人博客方案（Hexo Butterfly/Stellar/Solitude、Hugo PaperMod/Stack、Astro AstroPaper/Fuwari）的功能基线
> 结论先行：**基础盘很好**（现代栈 + 成熟内容管线 + 完整的主题系统），但有 **3 个 Bug 级缺陷**、**一条持续恶化的性能债**（图片 398MB），以及「分享链路（OG/JSON-LD/canonical）全缺、首页不做内容分发、互动层近乎为零」三大结构性短板。

---

## 一、总体评价

### 做得好的（超出多数个人博客的部分）

| 能力 | 位置 | 评价 |
|------|------|------|
| 技术栈 | Next 16 App Router / React 19 / Tailwind v4 / strict TS | ✅ 现代且一致 |
| 内容管线 | Notion → 增量同步（`last_edited_time` 比对）→ MD + frontmatter | ✅ 成熟，含封面下载、图片重试 |
| 主题系统 | 亮/暗/跟随系统 + 5 组主题色 + View Transitions 涟漪（`AccentToggle.tsx`） | ✅ 精致，少见 |
| 站内搜索 | ⌘K 命令面板 + MiniSearch + 构建期索引 + 中文分词（`SearchPalette.tsx`） | ✅ 体验完整 |
| 目录 | IntersectionObserver 高亮 + 桌面 sticky / 移动端浮动（`TableOfContents.tsx`） | ✅ 标准做法 |
| 代码块 | Shiki 双主题 + 语言标签 + 复制按钮 | ✅ |
| 评论 | Giscus 懒加载 + 主题跟随（`Comment.tsx`） | ✅ |
| 订阅 | 文章 + 说说双 RSS 全文输出 | ✅ |
| SEO 基础 | sitemap / robots / OG 文本标签 / twitter card | ✅ 基本盘齐 |
| 规范 | Biome + organizeImports + CLAUDE.md 文档 | ✅ |

### 三大结构性短板（后文详述）

1. **分享链路全缺**：无 OG 图片、无 JSON-LD、无 canonical——链接发到微信/X/Telegram 没有预览卡片，搜索引擎富摘要为零。
2. **首页不做内容分发**：首页只有 Hero + 7 个入口卡片，**一篇最新文章都不展示**，内容曝光全靠用户主动点进子页面。
3. **互动层近乎为零**：无阅读量、无分享按钮、无点赞；评论只覆盖文章页和友链页。

---

## 二、现状盘点

| 维度 | 数据 |
|------|------|
| 内容 | 文章 40 篇 · 说说 96 条 · 下厨 23 篇 · awaken 12 条 · taste 17 条 |
| 图片 | `public/notion-images/` **398MB / 326 张入库**（最大单图 4.7MB） |
| Git 仓库 | `.git` **274MB**（图片历史膨胀） |
| 源码 | ~65 个 ts/tsx，11 个 `'use client'` 组件 |
| 测试 | **0**（无任何测试框架与用例） |
| CI | 仅 `sync-notion.yml`（每小时同步），**无 build/lint 检查工作流** |
| 缓存 | 全站 **0 处** `revalidate` / `cache()`（grep 验证） |
| 错误边界 | **无** `loading.tsx` / `error.tsx` / `global-error.tsx` |

---

## 三、P0：Bug 级缺陷（建议本周修）

### P0-1 首页 `<h1>` 在 SSR HTML 里是空的

`src/components/ui/Typewriter.tsx:28` 用 `useState('')` 起步，打字效果纯客户端渲染。后果：

- **SEO**：首页 SSR 输出的 h1 为空字符串，"你好，我是林深时觉寒" 这句关键文案搜索引擎抓不到；
- **无 JS 环境 / 爬虫**：首页 hero 完全空白；
- 顺带一个真实泄漏：`Typewriter.tsx:33-46` 里 `setTimeout` 回调内 `return () => clearInterval(...)` 永远不会执行（setTimeout 不消费返回值），组件卸载时若打字未完成，interval 一直跑；
- 未处理 `prefers-reduced-motion`。

**修法**（保住打字效果的最低成本方案）：SSR 直接渲染全文 + `visibility` 隐藏（或 `sr-only` 副本），客户端水合后再启动打字动画；同时把 interval 引用提升到 effect 作用域统一清理。

### P0-2 移动端代码块「复制」按钮不可达

`src/components/ui/CodeBlock.tsx:70-72`：

```
className="... opacity-0 group-hover/code:opacity-100 ..."
```

触屏设备没有 hover，按钮永远 `opacity-0`（仍占位但不可见不可用）。而文章页移动端阅读占比通常过半。**修法**：触屏下常显（`@media (hover: none)` 直接显示，或 `opacity-100 sm:opacity-0 sm:group-hover/code:opacity-100`）。

### P0-3 宽表格在移动端横向溢出

`src/assets/globals.css:135-145` 的 `.prose table` 设了 `width: 100%`，但没有任何滚动容器。宽表格（Notion 同步过来的数据库表格很常见）会撑破 800px 容器，在手机上直接横向溢出产生页面级横滚。**修法**：`.prose table { display: block; overflow-x: auto; }` 或在 MDX 映射里给 table 包一层 `overflow-x-auto` 的 wrapper。

### P0-4 无任何路由级 loading / error 边界

全项目没有 `loading.tsx`、`error.tsx`、`global-error.tsx`。任何一篇 MD 的 frontmatter 损坏、`evaluate()` 抛错、loader 异常都会以裸 500 白屏呈现。**修法**：至少加 `src/app/error.tsx`（客户端兜底页 + 重试按钮）和列表页 `loading.tsx` 骨架。

### P0-5 键盘焦点样式全站缺失

`globals.css` 无任何 `:focus-visible` 规则；`SearchPalette.tsx:234` 搜索输入框还是 `outline-none`。Tab 键用户完全无法感知焦点位置。**修法**：全局 `:focus-visible { outline: 2px solid var(--brand); outline-offset: 2px; }` 一行即可覆盖全站。

### P0-6 零缓存策略 + 重复全量扫盘

- 所有 loader 每次请求都 `glob` + `gray-matter` 全量解析（40 篇文章 + 96 说说 + 若干 MD 的磁盘 IO）；
- `src/app/(blogs)/posts/[slug]/page.tsx:53` 为算上下篇又调了一次 `getAllPosts()`——同一请求里扫两遍盘；
- 无 `export const revalidate`，动态页（`/posts`、`/words` 等）每请求重建。

**修法**（三行级别改动）：`getAllPosts` 等加载函数包 `React.cache()`；详情页复用 cache 结果；列表/详情页加 `export const revalidate = 3600`（内容由每小时 CI 同步，ISR 3600s 完全够）。收益：服务器 TTFB 显著下降 + 消除重复 IO。

### P0-7 图片性能债持续恶化（8 月已知，尚未落地）

`docs/performance-analysis.md`（2026-08-17）已识别 345MB 原图直出问题，**两个月后涨到 398MB**（+53MB，326 张入库，`.git` 274MB）。`next/image` 仅 2 处使用（`ImageGallery.tsx`、`sponsor/page.tsx`），承载全站文章/说说图片的 `ImageViewer.tsx:35` 仍是原生 `<img>`。这不是新发现，是**已知债务在复利**，建议优先落地 8 月报告中的方案（脚本侧 sharp 压缩 + `next/image` 替换），否则每次同步都在加大仓库与带宽成本。

---

## 四、与主流博客的功能差距

对照 Hexo Butterfly/Stellar、Hugo PaperMod/Stack、Astro AstroPaper/Fuwari 等主流主题的功能基线：

| 分类 | 能力 | 主流标配 | 本站 | 差距说明 |
|------|------|:--:|:--:|------|
| **分享/SEO** | OG 图片（动态生成分享卡片） | ✅ | ❌ | 发微信/X 无预览图，最影响传播 |
| | JSON-LD 结构化数据（BlogPosting/Breadcrumb） | ✅ | ❌ | 无富摘要资格 |
| | canonical URL | ✅ | ❌ | 分页/带参 URL 无去重信号 |
| | sitemap / robots / OG 文本标签 | ✅ | ✅ | 已齐 |
| **阅读体验** | 阅读时长 + 字数 | ✅ | ❌ | `getPostStats()` 已能算字数，差临门一脚 |
| | 阅读进度条 | ✅ | ❌ | 长文体验项 |
| | 标题锚点链接（hover 显示 #） | ✅ | ❌ | rehype-slug 已生成 id，只差 UI |
| | 相关文章推荐 | ✅ | ❌ | 标签数据齐备，可做 Jaccard 相似 |
| | 文章更新时间展示 | ✅ | ❌ | frontmatter 已同步 `last_edited_time` |
| | 文章封面图 | ✅ | ❌ | **cover 已下载到本地但文章页从未使用** |
| | 暗色模式 / TOC / 代码复制 / 灯箱 / 上下篇 | ✅ | ✅ | 已齐 |
| **互动** | 文章分享按钮（复制链接/系统分享） | ✅ | ❌ | 一个 `navigator.share` 的事 |
| | 浏览量/热度展示 | ✅ | ❌ | 有 Vercel Analytics 但未展示 |
| | 评论 | ✅ | ⚠️ | 仅文章页 + 友链页；下厨详情/awaken 详情无 |
| **内容发现** | 首页最新文章 | ✅ | ❌ | 首页零内容曝光（详见样式节） |
| | 全站搜索 | ✅ | ⚠️ | 搜索只索引 `content/posts`（`scripts/build-search-index.ts:11`），说说/下厨/awaken 搜不到 |
| | 归档/标签/分类 | ✅ | ✅ | 已齐（归档可再按月分组） |
| | 随机文章 | ⚠️ | ❌ | 锦上添花，可选 |
| **订阅** | RSS | ✅ | ⚠️ | 文章 + 说说有；下厨无 feed |
| | Newsletter 邮件订阅 | ⚠️ | ❌ | 可选，维护成本高 |
| **站长侧** | PWA（可安装） | ⚠️ | ❌ | CLAUDE.md 写了「支持 PWA」但**没有 `manifest.ts`/webmanifest**，文档与实现不符 |
| | 测试 / CI 检查 | ⚠️ | ❌ | 无测试；CI 无 build/lint 门禁 |

### 高性价比落地建议（按收益排序）

1. **OG 分享卡片**：`src/app/(blogs)/posts/[slug]/opengraph-image.tsx` + `next/og` 的 `ImageResponse`，构建期为每篇文章生成 1200×630 卡片（标题 + 站名 + 主题色），一处新增零侵入。这是**单项收益最大的功能补齐**。
2. **阅读时长 + 字数**：`PostMeta` 加一项（中文按 ~400 字/分钟估算，`getPostStats` 里已有字数统计逻辑可复用为单篇版）。
3. **canonical + JSON-LD**：`generateMetadata` 里补 `alternates.canonical`；`page.tsx` 里 `<script type="application/ld+json">` 输出 BlogPosting（title/date/tags/url）+ BreadcrumbList。
4. **文章封面 + 列表卡片化**：cover 数据在 frontmatter、图片在本地，只需在 `posts/[slug]/page.tsx` 标题上方和 `PostItem` 列表里渲染即可，列表观感立刻对齐主流博客。
5. **分享按钮**：文章底部加「分享」（`navigator.share` + 剪贴板降级）。
6. **相关文章**：同分类 + 标签 Jaccard 重合度取 top 3，渲染在评论区上方。
7. **搜索覆盖全站**：`build-search-index.ts` 把 words/cooking/awaken 也索引进去，`SearchPalette` 按 `type` 分组展示并跳对应路由。
8. **更新时间**：`PostMeta` 支持 `updated`，与发布日期并列展示（`date !== last_edited_time` 时显示）。

---

## 五、样式与交互改进

按影响排序：

### 5-1 首页信息密度（最重要的样式问题）

现状 `src/app/page.tsx`：Hero + 7 个入口卡片，**没有任何内容**。主流博客首页 = 站点门面 + 内容分发器。建议在「探索」区下追加：

- **最近文章 5 篇**（复用 `PostItemLite`，一屏内）；
- **最新说说 2-3 条**（复用 `WordCard` 精简版）或「最近下厨」一张图；
- 一条统计行（`getPostStats()` 现成：40 篇 · N 万字 · 96 条说说）。

改动量小（都是现成组件），首页从「目录页」变成「杂志封面」。

### 5-2 导航可达性

- `site.config.ts:31-38`：header 只暴露 文章/说说/食者 3 项，**书影音/分享/归档 4 个板块只在 footer**，移动端汉堡菜单同样只有 3 项。用户在手机上进入任一文章后，想看「书影音」需要滚到页脚。建议 header 放 5-6 项（文字导航很轻），或汉堡菜单并入 footer 链接。
- Header 不 sticky：长文读到底想切栏目必须靠 BackToTop 滚回去。建议滚动向上时 reveal 的 sticky header（主流做法，与现有非 sticky 首屏也不冲突）。

### 5-3 排版细节

- **字体策略**：全站正文用霞鹜文楷（`globals.css:86`），风格强烈但**长文可读性是双刃剑**。主流做法是「标题/品牌用特色字体，正文用无衬线」。建议至少给 `.prose` 正文换回系统无衬线，标题与 Hero 保留文楷，风格不减、可读性回升。
- **字号阶梯**：`posts/[slug]/page.tsx:80` 与 `WordCard` 的 `2xl:text-lg`（只在 ≥1536px 放大正文）逻辑奇怪——大屏用户的正文字号与小屏不同，与主流「容器变宽、字号恒定」相反，建议移除。
- **标题锚点**：`.prose h2/h3` 加 hover 显示的 `#` 链接（rehype-slug 的 id 已就绪，纯 CSS + 少量 JS）。
- **代码块增强**（可选）：行号、长行换行开关、文件名标签。
- **外链标识**：`.prose a` 可加外部链接小图标 + `target="_blank"`，`siteConfig` 化。

### 5-4 定位与冗余代码

- `BackToTop.tsx:28`：`left: min(calc(50% + 416px), calc(100vw - 3rem))` 硬编码绑定 800px 容器，宽路由（1152px，`wide-route.ts`）下按钮与正文错位。建议改 CSS 变量或与 TOC 按钮共用一套定位逻辑。
- `TableOfContents.tsx:62-63`：外层 div 与内层 nav 都是 `max-h-[calc(100vh-8rem)] overflow-y-auto`，双层滚动容器冗余，去掉一层。

### 5-5 状态页

- **404 页**（`not-found.tsx`）：只有「返回首页」，建议加常用栏目快捷链接（文章/说说/搜索）。
- **加载骨架**：列表页（分页切换时）无任何 loading 态，可加 `loading.tsx` 骨架。
- **空状态**：`EmptyShower` 已有，OK。

### 5-6 响应式与可访问性

- 表格溢出见 P0-3；复制按钮见 P0-2；focus-visible 见 P0-5。
- `Typewriter` / `scrollIntoView({behavior:'smooth'})` 未响应 `prefers-reduced-motion`（AccentToggle 倒是处理了，标准不统一）。

### 5-7 打印样式

`/resume` 是简历页却**没有任何 print CSS**——打印/导出 PDF 会带上 header/footer/主题色背景。给 resume 页加 `@media print`（隐藏站点 chrome、黑白化、A4 分页）是简历页的基本修养。

---

## 六、工程质量

| 项 | 现状 | 建议 |
|----|------|------|
| 测试 | 0 用例 | vitest 先覆盖纯函数：`content-supports.ts`（parseDate/slugify/extractHeadings）、`paginate.ts`、`words` 的图片提取、`search-tokenizer.ts`——全是无 IO 纯函数，性价比极高 |
| CI | 仅内容同步 | 加 `ci.yml`：`pnpm lint && pnpm build`（tsc 类型检查在 build 内），防住类型/构建回归 |
| `next.config.ts` | 空对象 | 至少加 `headers()`：`/notion-images/:path*` 设 `Cache-Control: immutable, max-age=31536000`（图片文件名含 UUID，天然不可变）；安全头可选 |
| CLAUDE.md 漂移 | `wordsPageSize: 10` 实为 30；路由组写作 `(cooking)` 实际是 `src/app/cooking`；NavCard 已不存在 | 顺手修订，避免 AI 辅助开发被误导 |
| `.env` | 已 gitignore | ✅ |

---

## 七、行动路线图

### P0（本周，约 1-2 天）
1. Typewriter SSR 修复 + interval 清理（P0-1）
2. 代码块复制按钮移动端常显（P0-2，一行 className）
3. 表格横向滚动（P0-3，一行 CSS）
4. 全局 `:focus-visible`（P0-5，一行 CSS）
5. `app/error.tsx` + 列表 `loading.tsx`（P0-4）
6. loader 包 `React.cache()` + `revalidate = 3600`（P0-6）
7. 图片压缩落地（P0-7，按 8 月报告执行，别再拖）

### P1（两周内）
8. OG 分享卡片（`opengraph-image.tsx` + next/og）
9. 首页加最近文章 + 最新说说 + 统计行
10. 阅读时长 + 字数 + 更新时间
11. 文章封面 + 列表卡片化
12. canonical + JSON-LD
13. 导航补全 + 404 快捷链接
14. search index 扩展到全站内容
15. CI 加 lint/build 门禁；vitest 纯函数单测

### P2（长期）
16. 相关文章推荐
17. 分享按钮 / 浏览量展示
18. sticky reveal header
19. 正文/标题字体分层
20. PWA manifest（或从 CLAUDE.md 删除该说法）
21. 代码块行号/换行、标题锚点、resume print CSS

### 不建议做（收益/成本不划算）
- **数据库/CMS 化**：当前 Notion + MD 管线是个人博客最优解之一；
- **i18n**：单语受众，纯增维护面；
- **自建浏览量统计**：Vercel Analytics 已在采集，缺的只是展示层；
- **webmention**：中文博客圈渗透率极低，优先级远低于 OG 卡片。

---

## 附：本次审视核实过的关键文件

- `src/app/page.tsx` · `layout.tsx` · `sitemap.ts` · `robots.ts` · `not-found.tsx`
- `src/app/(blogs)/posts/page.tsx` · `posts/[slug]/page.tsx` · `archives/page.tsx`
- `src/components/ui/`：Typewriter / CodeBlock / TableOfContents / SearchPalette / BackToTop / ImageViewer / Comment / AccentToggle / Prose
- `src/components/layout/`：Header / Footer / site.config.ts
- `src/assets/globals.css`（427 行全读）
- `scripts/build-search-index.ts` · `src/app/api/words/publish/route.ts`
- `docs/performance-analysis.md`（2026-08-17 前期报告）
