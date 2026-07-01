# 本地开发

## 环境准备

```bash
cp .env.example .env        # 填入环境变量
pnpm install
pnpm dev                     # http://localhost:3000
```

## 构建

```bash
pnpm build                   # next build
```

## 代码检查

```bash
pnpm lint                    # biome check
pnpm format                  # biome format --write
```

## 手动同步 Notion

```bash
pnpm fetchAll                # 全量同步
pnpm fetchArticles           # 仅文章
pnpm fetchPages              # 仅页面
pnpm fetchShares             # 仅分享
pnpm fetchCooking            # 仅下厨
pnpm fetchWords              # 仅说说
```

## 技术栈

Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4 + MDX，部署在 Vercel。
