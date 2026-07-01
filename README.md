# 和光同尘

个人主页 / 博客。内容在 Notion 中编辑，MDX 服务端渲染，部署在 Vercel。

## 技术栈

- **框架**: Next.js 16 (App Router), React 19, TypeScript 5
- **样式**: Tailwind CSS v4, `@tailwindcss/typography`
- **内容**: MDX (`@mdx-js/mdx`), Notion API (`@notionhq/client`), `notion-to-md` v4, gray-matter, glob
- **代码高亮**: Shiki (`@shikijs/rehype`, `shiki`)
- **Markdown 插件**: remark-gfm, rehype-slug
- **字体**: 霞鶜文楷 (`lxgw-wenkai-screen-webfont`)
- **图片灯箱**: `yet-another-react-lightbox`
- **评论**: Giscus
- **工具库**: dayjs, rss, dotenv
- **分析**: `@vercel/analytics`, `@vercel/speed-insights`
- **工程化**: Biome 2, tsx, pnpm 9, GitHub Actions
- **部署**: Vercel

## 本地开发

```bash
cp .env.example .env
pnpm install
pnpm dev                     # http://localhost:3000
pnpm build                   # 生产构建
pnpm lint                    # Biome 检查
```

## 同步 Notion 内容

```bash
pnpm fetchAll                # 全量同步
pnpm fetchArticles           # 仅文章
pnpm fetchWords              # 仅说说
```

## 详细文档

- [内容管线与发布流程](docs/content-pipeline.md)
- [路由与 API](docs/routes.md)
- [部署架构与环境变量](docs/deployment.md)
- [本地开发](docs/development.md)
