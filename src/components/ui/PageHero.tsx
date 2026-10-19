import type { ReactNode } from 'react';

interface PageHeroProps {
  title: string;
  description?: string;
  /** 标题行右侧操作区（如 RSS 图标） */
  action?: ReactNode;
  children?: ReactNode;
}

export function PageHero({
  title,
  description,
  action,
  children,
}: PageHeroProps) {
  return (
    <header className="mb-8">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-normal">{title}</h1>
        {action && <div className="shrink-0 pt-1.5">{action}</div>}
      </div>
      {description && (
        <p className="text-secondary text-base mt-1">{description}</p>
      )}
      {children}
    </header>
  );
}
