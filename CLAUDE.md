# CLAUDE.md

给 AI 编码工具的操作手册：命令、硬约定、已知陷阱。**只放代码里读不出来的东西**——项目介绍、站点结构、内容管线、环境变量说明在 `README.md`，需要背景去那里看。

## 命令

```bash
pnpm dev            # 先构建搜索索引，再启动 dev server（3000）
pnpm build          # 先构建搜索索引，再 next build（含类型检查）
pnpm lint           # Biome check
pnpm format         # Biome 格式化并写入
pnpm fetchAll       # Notion 全量同步（增量语义）
pnpm fetchAll --force
pnpm fetchArticles  # 也可 fetchPages / fetchShares / fetchCooking / fetchWords
```

`dev` / `build` 前置的 `tsx scripts/build-search-index.ts` 不能省——直接 `next dev` 会拿不到 `public/search-index.json`，搜索功能静默失效。

## 硬约定

- **图标只从 `@/components/icons` 具名导入**，不要 `from 'lucide-react'`。lucide 别名收在出口里，直接引入会绕过统一出口。
- **fetcher 之间不共用字段列表或格式化函数**。每个 fetcher 自己定义 property → frontmatter 映射、自己拼 MD 字符串，只共享 `scripts/lib/` 的纯函数。
- **Tailwind 类名必须是完整字面量**。`max-w-200${cond ? ' …' : ''}` 这种模板拼接会让 v4 扫描器把整条候选丢弃，规则根本不生成。宽窄路由见 `src/components/layout/wide-route.ts`。
- **loader 的重查询用 `React.cache()` 包裹**，同一次渲染内只读一次盘。
- **提交信息**：`type(scope): 中文描述`，如 `fix(sync): 图片清理正则不再排除空格`。类型用 conventional commits，描述用中文。
- **文档分工**：`README.md` 给人，本文件给 AI，设计 why 就近写代码注释。改代码不需要同步 README，改「用法」才需要。

## 已知陷阱

| 陷阱 | 说明 |
|------|------|
| 图片清理正则不能排除空白 | `scripts/lib/notion-md-converter.ts` 用正则判断「正文是否引用了该文件」，并据此删除未引用文件。目录名可能含空格（如 `words/Crazy DBX/`），字符类若排除 `\s` 会截断路径 → 图片被误判未引用 → 当场删除。曾因此丢过数据 |
| 说说抽图后残留 `<br />` | 空段落在 MD 里是 `<br />`，图片被 `extractImagesFromMdx` 抽走后留下孤立标签，`trim()` 清不掉，渲染成正文与图片之间的一段空白。只清首尾，中间空段落是作者有意留的 |
| 暗色图片降亮的作用域是 `article img` | 不是 `.prose img`。说说图片由 `WordImageGrid` 渲染，在 `.prose` 之外但仍在 `WordCard` 的 `<article>` 内。改作用域会漏掉或误伤画廊 |
| 暗色不要改成纯 CSS 媒体查询 | 配色挂在 `.dark` class 上，主题三态（system/light/dark）由 `ui/theme.ts` + 首帧内联脚本控制。用 `prefers-color-scheme` 会破坏用户手动选择 |
| Notion 2026 API 需要 data_source 层 | 查库/建页不能直接用 database_id，要先 `databases.retrieve()` 拿 `data_sources[0].id` |
| `notion-to-md` 是 v4 alpha | API 与 v3 不兼容，查用法别照 v3 文档抄 |
| `@11ty/gray-matter` 不是 `gray-matter` | 包名不同，frontmatter 解析统一用它 |

## 增量同步

状态在 `content/sync-state.json`，结构 `{ "<type>/<id>": last_edited_time }`。`needsStateSync()` 对比后决定是否处理，`FORCE_SYNC=true` 时无条件处理。

改同步逻辑时注意：Notion 里删掉的页面靠 `cleanOrphanedFiles()` 收尾，它同时删 `.md`、sync-state 条目和封面目录——多加一个「未引用就删」的判断就是加一次数据丢失风险。

## 搜索

构建期 `scripts/build-search-index.ts` 扫 `content/posts` 写出 `public/search-index.json`；查询侧 `SearchPalette` 懒加载 minisearch。**改分词前先读 `src/libs/search-tokenizer.ts` 的头注释**——中文必须按「整词 + unigram + 跨词边界 bigram」展开，少一层就会出现搜不到或 AND 语义退化。

## 质量门

没有测试框架，不要引入。判断改动是否安全靠：

- `pnpm build`（含类型检查）
- `pnpm lint` —— **目前不是绿的**：存量约 41 error + 37 warning，集中在 `scripts/`（`noExplicitAny`、`useNodejsImportProtocol`）与 `src/libs/words-loader.ts`（`noGlobalIsNan`）。这些是历史遗留，判断自己有没有搞坏东西，看新增报错是否落在你改过的文件里。

## 需要背景时

- 站点结构、内容管线、环境变量、部署 → `README.md`
- 设计 token 取值 → `src/assets/globals.css`；排版覆盖 → `src/assets/prose.css`
- 渲染链路 → `src/components/ui/MarkdownRenderer.tsx`
- 配置项（导航 / RSS / 分页）→ `src/site.config.ts`
