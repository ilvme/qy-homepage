/**
 * 宽页面路由：taste、cooking 列表页 + 博客/awaken 详情页
 * 使用最大 1152px 容器，其余页面保持 800px
 */
export const isWideRoute = (pathname: string) =>
  pathname === '/taste' ||
  pathname === '/cooking' ||
  /^\/posts\/[^/]+$/.test(pathname) || // 博客文章详情
  /^\/cooking\/[^/]+$/.test(pathname) || // 下厨详情
  (/^\/awaken\/[^/]+$/.test(pathname) && pathname !== '/awaken/all'); // awaken 详情（排除全部页）

/**
 * Header 与正文容器共用的宽度类。
 * 收在一处，新增宽版页面时不必再同时维护两个组件的宽度声明。
 */
export const pageWidthClass = (wide: boolean) =>
  `mx-auto w-full px-4 sm:px-6 max-w-200${wide ? ' xl:max-w-288' : ''}`;
