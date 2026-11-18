import type { Metadata } from 'next';
// 只引入实际使用的完整版：style.css 会额外带入 GB 版（同族名、被完整版覆盖）
// 与两个 R 变体（全站未引用），纯属多出约 270KB 渲染阻塞 CSS。
import 'lxgw-wenkai-screen-webfont/lxgwwenkaiscreen.css';
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
      'application/rss+xml': [
        { url: siteConfig.rss.path, title: '文章 RSS' },
        { url: siteConfig.rss.wordsPath, title: '说说 RSS' },
      ],
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
    <html lang="zh-CN" className="h-full antialiased" suppressHydrationWarning>
      <head>
        {/* 主题初始化：优先用户选择，默认跟随系统；在首帧渲染前避免闪烁 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme')||'system';var dark=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',dark);}catch(e){}})();`,
          }}
        />
      </head>
      <body className="flex min-h-dvh flex-col">
        <Header />
        <LayoutContainer className="flex flex-1 flex-col">
          <main className="flex-1">{children}</main>
          <Footer />
        </LayoutContainer>

        <BackToTop />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
