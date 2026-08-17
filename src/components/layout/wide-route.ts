/**
 * 宽页面路由：taste、cooking、nav 列表页 + 博客/awaken 详情页
 * 使用最大 1200px 容器，其余页面保持 800px
 */
export const isWideRoute = (pathname: string) =>
  pathname === '/taste' ||
  pathname === '/cooking' ||
  pathname === '/nav' ||
  /^\/posts\/[^/]+$/.test(pathname) || // 博客文章详情
  /^\/cooking\/[^/]+$/.test(pathname) || // 下厨详情
  (/^\/awaken\/[^/]+$/.test(pathname) && pathname !== '/awaken/all'); // awaken 详情（排除全部页）
