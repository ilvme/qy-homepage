import type { ReactNode } from 'react';

interface PageHeroProps {
  title: string;
  description?: string;
  children?: ReactNode;
}

export function PageHero({ title, description, children }: PageHeroProps) {
  return (
    <header className="mb-8">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      {description && (
        <p className="text-secondary text-base mt-1">{description}</p>
      )}
      {children}
    </header>
  );
}
