/**
 * 宽页面路由：taste、cooking 列表页 + 博客/awaken 详情页
 * 使用最大 1024px 容器，其余页面保持 736px
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
 * 写成 `max-w-184${cond ? ' xl:max-w-256' : ''}` 时扫描器会把
 * `max-w-184$` 当成一个无效候选整体丢弃，导致窄版宽度规则根本不生成（页面变全宽）。
 *
 * 尺寸取 736 / 1024：内边距 24px 后正文净宽 688 与 976。
 * 688 在 16px 字号下约 43 字一行，落在中文正文舒适区的中位；
 * 976 = 688 正文 + 48 间距 + 240 目录列。目录本体 208（w-52，全站标题中位仅 4 字），
 * 靠列首排布，右侧余 32px——不贴 header 右缘，但也不像 288 时代那样空。
 */
const NARROW_WIDTH = 'mx-auto w-full px-4 sm:px-6 max-w-184';
const WIDE_WIDTH = 'mx-auto w-full px-4 sm:px-6 max-w-184 xl:max-w-256';

export const pageWidthClass = (wide: boolean) =>
  wide ? WIDE_WIDTH : NARROW_WIDTH;

/**
 * 详情页（文章 / 下厨 / 分享）栅格：有目录时 688 正文 + 右侧目录列，
 * 无目录时塌成单列、由 article 的 mx-auto 居中——避免右侧悬着一条空的 1fr 轨道。
 *
 * 三个详情页模板共用这一份，别再各写一遍：三处手写同一套栅格字符串，
 * 正是之前 cooking/awaken 漏掉「无目录塌单列」的原因。
 *
 * 只加 xl: 前缀：1280 以下不进入栅格，天然是单列满宽，与有无目录无关。
 */
export const detailGridClass = (hasToc: boolean) =>
  `relative py-8 xl:grid xl:gap-12 xl:items-start ${
    hasToc ? 'xl:grid-cols-[minmax(0,688px)_minmax(0,1fr)]' : 'xl:grid-cols-1'
  }`;

/**
 * 详情页正文列：688px ≈ 16px 字号下 43 字一行。
 * mx-auto 必须留：单列时 grid track 是 1024，只给 max-w 会让正文贴左。
 */
export const DETAIL_ARTICLE = 'mx-auto w-full max-w-172';
