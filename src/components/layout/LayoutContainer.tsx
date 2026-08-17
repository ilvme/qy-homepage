'use client';

import { usePathname } from 'next/navigation';
import { isWideRoute } from './wide-route';

/**
 * 主题内容容器：宽页面 1200px，其余 800px。
 * 无宽度过渡动画（动画只在 Header 上），避免内容区重排卡顿。
 */
export default function LayoutContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isWide = isWideRoute(pathname);

  return (
    <div
      className={`mx-auto w-full px-4 sm:px-6 ${
        isWide ? 'max-w-[1200px]' : 'max-w-[800px]'
      }`}
    >
      {children}
    </div>
  );
}
