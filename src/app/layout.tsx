import type { Metadata } from 'next';
import 'lxgw-wenkai-screen-webfont/lxgwwenkaigbscreen.css';
import '@/assets/globals.css';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import LayoutContainer from '@/components/layout/LayoutContainer';
import BackToTop from '@/components/ui/BackToTop';
import { siteConfig } from '@/site.config';

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s - ${siteConfig.title}`,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  authors: [{ name: siteConfig.author.name }],
  alternates: {
    types: {
      'application/rss+xml': siteConfig.rss.path,
    },
  },
  openGraph: {
    type: 'website',
    siteName: siteConfig.title,
    title: siteConfig.title,
    description: siteConfig.description,
    locale: 'zh_CN',
  },
  twitter: {
    card: 'summary',
    title: siteConfig.title,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <head>
        {/* 主题初始化：优先用户选择，默认跟随系统；在首帧渲染前避免闪烁 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme')||'system';var dark=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',dark);}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full">
        <Header />
        <LayoutContainer>
          <main className="min-h-[calc(100vh-200px)]">{children}</main>
          <Footer />
        </LayoutContainer>

        <BackToTop />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
