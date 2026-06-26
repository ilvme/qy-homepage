import type { Metadata } from 'next';
import 'lxgw-wenkai-screen-webfont/lxgwwenkaigbscreen.css';
import '@/assets/globals.css';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';

export const metadata: Metadata = {
  metadataBase: new URL('https://ikangjia.cn'),
  title: {
    default: '和光同尘',
    template: '%s | 和光同尘',
  },
  description: '个人主页 — 记录生活与技术，分享思考与创造。',
  keywords: ['博客', '技术', '生活', '前端', '个人主页'],
  authors: [{ name: 'kangjia' }],
  alternates: {
    types: {
      'application/rss+xml': '/rss.xml',
    },
  },
  openGraph: {
    type: 'website',
    siteName: '和光同尘',
    title: '和光同尘',
    description: '个人主页 — 记录生活与技术，分享思考与创造。',
    locale: 'zh_CN',
  },
  twitter: {
    card: 'summary',
    title: '和光同尘',
    description: '个人主页 — 记录生活与技术，分享思考与创造。',
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
      <body className="min-h-full max-w-[800px] mx-auto px-4 sm:px-6">
        <Header />
        <main className="min-h-[calc(100vh-200px)]">{children}</main>
        <Footer />

        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
