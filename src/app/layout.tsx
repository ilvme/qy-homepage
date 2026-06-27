import type { Metadata } from 'next';
import 'lxgw-wenkai-screen-webfont/lxgwwenkaigbscreen.css';
import '@/assets/globals.css';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import BackToTop from '@/components/ui/BackToTop';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
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
      <body className="min-h-full max-w-[800px] mx-auto px-4 sm:px-6">
        <Header />
        <main className="min-h-[calc(100vh-200px)]">{children}</main>
        <Footer />

        <BackToTop />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
