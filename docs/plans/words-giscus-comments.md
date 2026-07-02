# 说说列表页集成 Giscus 评论

## 背景

用户希望在 `/words` 列表页为每条说说添加评论功能，使用已有的 giscus 系统，但**不做详情页**。核心挑战：所有说说在同一个页面，giscus 默认用 pathname 映射，无法区分不同说说的讨论。

## 方案

利用 giscus 的 `data-mapping="specific"` + `data-term="{page_id}"` 模式，每条说说对应独立的 GitHub Discussion。通过 React Context 管理互斥展开状态，保证同一时刻只有一个 giscus iframe。

## 架构

```
page.tsx (server)
  └── WordCommentProvider (新 client 组件，包裹列表)
       └── div
            └── WordCard (server) [×N]
                 ├── ...原有内容...
                 └── WordCommentToggle (新 client 组件)
                      └── Comment (修改，支持 term)
```

## 文件变更

### 1. `src/components/ui/Comment.tsx` — 修改

- Props 新增 `term?: string`
- 当 `term` 存在时，`data-mapping="specific"` + `data-term={term}`；否则保持 `pathname`
- useEffect 新增 cleanup：组件卸载时 `container.innerHTML = ''` + 重置 `loadedRef`，防止 toggle 模式下残留 DOM
- deps 数组加 `term`

### 2. `src/app/words/_components/WordCommentContext.tsx` — 新文件

- `WordCommentProvider`：薄 client provider，维护 `activeTerm: string | null` 状态
- `useWordComment()` hook：读取/写入 activeTerm

### 3. `src/app/words/_components/WordCommentToggle.tsx` — 新文件

- client 组件，接收 `term: string`（即 page_id）
- 通过 context 判断 `isOpen = activeTerm === term`
- 渲染切换按钮（💬 查看对话 / 收起评论），展开时渲染 `<Comment term={term} lazy={false} />`
- `term` 为空时 return null

### 4. `src/app/words/_components/WordCard.tsx` — 修改

- 引入 `WordCommentToggle`
- 在 `<WordImageGrid />` 后加 `<WordCommentToggle term={post.postMeta.page_id} />`
- WordCard 保持 server component

### 5. `src/app/words/page.tsx` — 修改

- 引入 `WordCommentProvider`
- 用 `<WordCommentProvider>` 包裹 word 列表 div
- 分页导航留在 provider 外

## 互斥机制

```
点 Card A "查看对话" → setActiveTerm("uuid-a") → Card A 展开
点 Card B "查看对话" → setActiveTerm("uuid-b") → Card A 卸载(cleanup清DOM) → Card B 展开
点 Card B "收起评论" → setActiveTerm(null)      → Card B 卸载
```

保证始终 0 或 1 个 giscus iframe。

## 边界情况

| 情况 | 处理 |
|------|------|
| page_id 缺失 | WordCommentToggle return null，无按钮 |
| giscus 禁用 | Comment 内部检查 `giscus.enabled`，不加载 |
| 翻页 | Provider 随页面卸载，状态重置 |
| 博客文章 | 不传 term，pathname 映射不受影响 |
| 快速连续点击 | useEffect cleanup 同步执行，`innerHTML=''` 清除后重新初始化 |

## 验证

1. `/words` 页面点击"查看对话"展开 giscus，再点"收起评论"收起
2. 展开 Card A，再展开 Card B，确认 A 自动收起（DOM 中只有 1 个 iframe）
3. 访问 `/posts/[slug]` 确认博客评论正常
4. 翻页后评论状态重置
5. 切换系统主题，giscus 主题跟随
