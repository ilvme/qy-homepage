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
 *
 * 注意：必须是完整独立的类名字面量。Tailwind v4 靠文本扫描生成工具类，
 * 写成 `max-w-200${cond ? ' xl:max-w-288' : ''}` 时扫描器会把
 * `max-w-200$` 当成一个无效候选整体丢弃，导致窄版宽度规则根本不生成（页面变全宽）。
 */
const NARROW_WIDTH = 'mx-auto w-full px-4 sm:px-6 max-w-200';
const WIDE_WIDTH = 'mx-auto w-full px-4 sm:px-6 max-w-200 xl:max-w-288';

export const pageWidthClass = (wide: boolean) =>
  wide ? WIDE_WIDTH : NARROW_WIDTH;
