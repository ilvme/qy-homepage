import { pageWidthClass } from './wide-route';

/**
 * 主题内容容器：宽窄由调用方显式传入，与 Header 共用同一份宽度类，避免各自推断路由导致错位。
 * 无宽度过渡动画（动画只在 Header 上），避免内容区重排卡顿。
 */
export default function LayoutContainer({
  wide,
  children,
  className = '',
}: {
  wide: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`${pageWidthClass(wide)} ${className}`}>{children}</div>
  );
}
