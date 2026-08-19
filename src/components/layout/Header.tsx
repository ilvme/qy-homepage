'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Close, Menu } from '@/components/icons';
import { siteConfig } from '@/site.config';
import AccentToggle from '@/components/ui/AccentToggle';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { isWideRoute } from './wide-route';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const isWide = isWideRoute(pathname);

  return (
    <header
      className={`relative mx-auto w-full px-4 sm:px-6 flex items-center justify-between py-6 border-b border-border mb-6 transition-[max-width] duration-500 ease-out ${
        isWide ? 'max-w-300' : 'max-w-200'
      }`}
    >
      <Link
        href="/"
        className="text-xl font-bold tracking-tight hover:opacity-80 transition-opacity"
      >
        {siteConfig.title}
      </Link>

      {/* 桌面端导航 */}
      <div className="hidden sm:flex items-center gap-1">
        <nav className="flex items-center gap-1">
          {siteConfig.navLinks.filter((l) => l.location === 'header').map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-2 py-1 rounded-md hover:bg-muted transition-colors text-secondary hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <AccentToggle />
        <ThemeToggle />
      </div>

      {/* 移动端：汉堡按钮 */}
      <div className="sm:hidden">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? '关闭菜单' : '打开菜单'}
          className="p-1.5 rounded-md hover:bg-muted transition-colors text-secondary hover:text-foreground"
        >
          {menuOpen ? <Close size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* 移动端下拉菜单 */}
      {menuOpen && (
        <nav className="absolute top-full left-0 right-0 z-50 bg-background border-b border-border shadow-lg sm:hidden">
          <div className="flex flex-col py-2 px-4">
            {siteConfig.navLinks.filter((l) => l.location === 'header').map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="py-2.5 px-2 rounded-md hover:bg-muted transition-colors text-secondary hover:text-foreground text-sm"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-3 px-4 py-2">
            <span className="text-xs text-secondary">主题色</span>
            <AccentToggle />
          </div>
          <ThemeToggle />
        </nav>
      )}
    </header>
  );
}
