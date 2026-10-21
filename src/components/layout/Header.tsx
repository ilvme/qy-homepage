'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Close, Menu, Search } from '@/components/icons';
import AccentToggle from '@/components/ui/AccentToggle';
import SearchPalette from '@/components/ui/SearchPalette';
import { siteConfig } from '@/site.config';
import { isActiveNav } from './nav-active';
import { isWideRoute } from './wide-route';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const isWide = isWideRoute(pathname);

  // ⌘K / Ctrl+K 全局唤起/关闭搜索
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <header
      className={`relative mx-auto w-full px-4 sm:px-6 mb-6 transition-[max-width] duration-500 ease-out ${
        isWide ? 'max-w-288' : 'max-w-200'
      }`}
    >
      {/* padding 放在外层，border-b 才能与正文/页脚分隔线同宽（对齐文字） */}
      <div className="flex items-center justify-between py-6 border-b border-border">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight hover:opacity-80 transition-opacity"
        >
          {siteConfig.title}
        </Link>

        {/* 桌面端导航 */}
        <div className="hidden sm:flex items-center gap-1">
          <button
            type="button"
            aria-label="搜索文章（⌘K）"
            onClick={() => setSearchOpen(true)}
            className="p-1.5 transition-colors text-secondary hover:text-brand"
          >
            <Search size={18} />
          </button>
          <nav className="flex items-center gap-1">
            {siteConfig.navLinks
              .filter((l) => l.location === 'header')
              .map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-2 py-1 transition-colors underline-offset-4 hover:underline ${
                    isActiveNav(link.href, pathname)
                      ? 'text-brand font-medium'
                      : 'text-secondary hover:text-brand'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
          </nav>
          <AccentToggle />
        </div>

        {/* 移动端：搜索 + 汉堡按钮 */}
        <div className="flex items-center gap-1 sm:hidden">
          <button
            type="button"
            aria-label="搜索文章"
            onClick={() => setSearchOpen(true)}
            className="p-1.5 transition-colors text-secondary hover:text-brand"
          >
            <Search size={20} />
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? '关闭菜单' : '打开菜单'}
            className="p-1.5 rounded-md hover:bg-muted transition-colors text-secondary hover:text-foreground"
          >
            {menuOpen ? <Close size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* 移动端下拉菜单 */}
      {menuOpen && (
        <nav className="absolute top-full left-0 right-0 z-50 bg-background border-b border-border shadow-lg sm:hidden">
          <div className="flex flex-col py-2 px-4">
            {siteConfig.navLinks
              .filter((l) => l.location === 'header')
              .map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`py-2.5 px-2 transition-colors text-sm underline-offset-4 hover:underline ${
                    isActiveNav(link.href, pathname)
                      ? 'text-brand font-medium'
                      : 'text-secondary hover:text-brand'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
          </div>
          <div className="flex items-center gap-3 px-4 py-2">
            <AccentToggle />
          </div>
        </nav>
      )}

      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
