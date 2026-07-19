'use client';

import { useEffect, useState } from 'react';
import type { NavCategory } from '@/libs/nav-loader';

interface SideNavProps {
  categories: NavCategory[];
}

export default function SideNav({ categories }: SideNavProps) {
  const [activeKey, setActiveKey] = useState('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveKey(entry.target.id);
          }
        }
      },
      { rootMargin: '-80px 0px -60% 0px' },
    );

    const sections = document.querySelectorAll('[data-nav-section]');
    for (const s of sections) observer.observe(s);

    return () => observer.disconnect();
  }, []);

  return (
    <nav className="space-y-0.5">
      <h4 className="text-sm font-semibold text-muted-foreground uppercase mb-3 px-2">
        分类
      </h4>
      {categories.map((cat) => (
        <a
          key={cat.key}
          href={`#${cat.key}`}
          className={`block px-2 py-1.5 text-xs 2xl:text-lg rounded-md transition-colors ${
            activeKey === cat.key
              ? 'bg-muted text-foreground font-medium'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          }`}
        >
          {cat.label}
          <span className="ml-1.5 text-xs text-muted-foreground/60">
            {cat.sites.length}
          </span>
        </a>
      ))}
    </nav>
  );
}
