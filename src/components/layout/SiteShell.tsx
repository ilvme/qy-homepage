'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';
import Header from './Header';
import LayoutContainer from './LayoutContainer';
import { isWideRoute } from './wide-route';

/**
 * 站点外框：路由只在这里解析一次，宽窄通过显式 prop 下发给 Header 与正文容器，
 * 两者不再各自推断，新增宽版页面只需改 wide-route.ts。
 */
export default function SiteShell({ children }: { children: React.ReactNode }) {
  const wide = isWideRoute(usePathname());

  return (
    <>
      <Header wide={wide} />
      <LayoutContainer wide={wide} className="flex flex-1 flex-col">
        <main className="flex-1">{children}</main>
        <Footer />
      </LayoutContainer>
    </>
  );
}
