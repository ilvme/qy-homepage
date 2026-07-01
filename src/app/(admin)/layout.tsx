import type { Metadata } from 'next';

export const metadata: Metadata = {
  appleWebApp: {
    capable: true,
    title: '发布说说',
    statusBarStyle: 'default',
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
