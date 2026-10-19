/** 判断导航项是否激活：首页精确匹配，其余前缀匹配子路由 */
export function isActiveNav(href: string, pathname: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}
