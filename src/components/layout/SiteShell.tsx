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
      {/* 键盘用户可跳过导航直达正文 */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:border focus:border-border focus:bg-card focus:px-4 focus:py-2 focus:text-sm focus:text-foreground"
      >
        跳到正文
      </a>
      <Header wide={wide} />
      <LayoutContainer wide={wide} className="flex flex-1 flex-col">
        <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
          {children}
        </main>
        <Footer />
      </LayoutContainer>
    </>
  );
}
