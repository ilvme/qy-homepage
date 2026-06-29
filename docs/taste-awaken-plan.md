# 拆分 share 模块为 taste + awaken

## 背景

当前 `/share` 是空壳页面，`content/shares/` 下已有 4 条内容（分类: tv/saying/anime）。需要将两类内容拆分为独立路由：

- **taste（风味）**：书影音动漫小说收藏 — 卡片展示封面图，点击跳外链
- **awaken（唤醒）**：台词、句子、古诗词古文 — 文字卡片列表，点击进详情页渲染 Markdown

## 架构

```
Notion Share DB (同一个)
       |
  shares-fetcher.ts (新增 share_type 字段: link 存在 → taste，否则 → awaken)
       |
  content/shares/*.md
      /            \
taste-loader.ts   awaken-loader.ts
(过滤 taste)       (过滤 awaken)
      |                |
(taste)/taste     (awaken)/awaken
  page.tsx           page.tsx + [slug]/page.tsx
(画廊, 外链,        (文字列表, 分页,
 无详情页)           有详情页 + MarkdownRenderer)
```

## 实施步骤

### 1. 更新类型定义
- **文件**: `scripts/types.ts`
- 在 `ShareMetadata` 新增 `share_type?: 'taste' | 'awaken'`

### 2. 更新 fetcher
- **文件**: `scripts/shares-fetcher.ts`
- `mapSharePage()`: 提前提取 `link`，计算 `share_type: link ? 'taste' : 'awaken'`
- `formatFrontmatter()`: 输出 `share_type` 到 frontmatter

### 3. 创建 loader
- **新建**: `src/libs/taste-loader.ts` — 从 `content/shares/` 读取，过滤 `share_type === 'taste'`（兼容旧文件无 share_type 时按 link 是否存在判断）
- **新建**: `src/libs/awaken-loader.ts` — 同上，过滤 `share_type === 'awaken'`
- 各导出 4 个函数：`getAllXxx()`, `getXxxBySlug()`, `getAllXxxCategories()`, `getXxxByCategory()`
- 严格遵循 `cooking-loader.ts` 模式

### 4. 创建 taste 路由
- **新建**: `src/app/(taste)/_components/TasteGallery.tsx` — 仿 `ImageGallery.tsx`，关键差异：卡片用 `<a target="_blank">` 跳外链而非 `<Link>` 跳内部路由
- **新建**: `src/app/(taste)/taste/page.tsx` — 列表页，仿 `cooking/page.tsx`（category tabs + 分页），使用 `tastePageSize`
- **无** `[slug]/page.tsx` — taste 不需要详情页

### 5. 创建 awaken 路由
- **新建**: `src/app/(awaken)/_components/AwakenCard.tsx` — 仿 `PostItem.tsx`，显示标题(Link)、作者、摘要(line-clamp)、日期
- **新建**: `src/app/(awaken)/awaken/page.tsx` — 列表页，仿 `posts/page.tsx` + category tabs，使用 `awakenPageSize`
- **新建**: `src/app/(awaken)/awaken/[slug]/page.tsx` — 详情页，仿 `cooking/[slug]/page.tsx`，含 `generateStaticParams`、`generateMetadata`、MarkdownRenderer

### 6. 更新 site.config.ts
- `navLinks`: 替换 `{ href: '/share', label: '分享' }` 为 `{ href: '/taste', label: '风味' }` + `{ href: '/awaken', label: '唤醒' }`
- `pagination`: 新增 `tastePageSize: 12` + `awakenPageSize: 10`

### 7. 更新首页
- **文件**: `src/app/page.tsx`
- 替换 share 卡片为 taste + awaken 两张卡片（从 6 项变 7 项）
- 3 列 grid 7 项会留孤项，改为 4 列 (`sm:grid-cols-4`)

### 8. 清理
- **删除**: `src/app/(shares)/share/page.tsx`
- **删除**: 空目录 `src/app/(shares)/`

### 9. 验证
1. 运行 fetcher 重新生成带 `share_type` 的内容
2. `pnpm dev` → 访问 `/taste`、`/awaken`、`/awaken/[slug]`
3. 确认 category 过滤、分页、外链跳转均正常
4. 确认 `/share` 返回 404
5. `pnpm build` 通过
