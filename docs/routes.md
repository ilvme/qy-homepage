# 路由总览

## 公开页面

| 路由 | 说明 |
|------|------|
| `/` | 首页 |
| `/posts` | 文章列表，分页 |
| `/posts/[slug]` | 单篇文章 |
| `/archives` | 文章归档，按年分组 |
| `/categories` | 分类列表 |
| `/categories/[category]` | 按分类筛选 |
| `/tags` | 标签列表 |
| `/tags/[tag]` | 按标签筛选 |
| `/words` | 说说流，分页 |
| `/cooking` | 下厨画廊，分页 |
| `/cooking/[slug]` | 下厨详情 |
| `/awaken` | 分享列表 |
| `/awaken/[slug]` | 分享详情 |
| `/awaken/all` | 全部分享 |
| `/taste` | 书影音 |
| `/about` | 关于页 |
| `/friends` | 友链 |
| `/resume` | 简历 |
| `/sponsor` | 赞赏 |
| `/rss.xml` | RSS 订阅源 |

## 隐藏页面

| 路由 | 说明 |
|------|------|
| `/caidan` | 彩蛋入口 |
| `/caidan/daily-words` | 旧版说说 |

## 管理后台

| 路由 | 说明 |
|------|------|
| `/publish-words` | 说说发布页（需 PUBLISH_SECRET），支持 PWA 添加到桌面 |

## API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/words/publish` | POST | 写说说到 Notion |
