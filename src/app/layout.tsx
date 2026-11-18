import type { Metadata } from 'next';
import { Noto_Sans_SC } from 'next/font/google';
import '@/assets/globals.css';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import SiteShell from '@/components/layout/SiteShell';
import BackToTop from '@/components/ui/BackToTop';
import { siteConfig } from '@/site.config';

// 思源黑体（OFL 1.1，可自托管、无需署名）。中文切片由 next/font 在构建期下载并自托管，
// preload 必须关闭：否则 Next 会把上百个 unicode-range 切片全部塞进 preload，首屏反受其累。
// 不指定 weight，走可变字体（wght 100-900 连续轴），正文才能取 450 这类中间值。
const notoSansSC = Noto_Sans_SC({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-noto-sans',
});

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
    images: [
      { url: '/og.png', width: 1200, height: 630, alt: siteConfig.title },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
    images: ['/og.png'],
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
    <html
      lang="zh-CN"
      className={`h-full antialiased ${notoSansSC.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* 主题初始化：优先用户选择，默认跟随系统；在首帧渲染前避免闪烁 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme')||'system';var dark=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',dark);}catch(e){}})();`,
          }}
        />
      </head>
      <body className="flex min-h-dvh flex-col">
        <SiteShell>{children}</SiteShell>

        <BackToTop />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
