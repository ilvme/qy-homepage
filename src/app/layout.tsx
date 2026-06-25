import type { Metadata } from 'next';
import 'lxgw-wenkai-screen-webfont/lxgwwenkaigbscreen.css';
import '@/assets/globals.css';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  title: '和光同尘',
  description: '个人主页 - 记录生活与技术',
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

        <Analytics/>
        <SpeedInsights/>
      </body>
    </html>
  );
}
