'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Close, Menu, Search } from '@/components/icons';
import SearchPalette from '@/components/ui/SearchPalette';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { siteConfig } from '@/site.config';
import { isActiveNav } from './nav-active';
import { pageWidthClass } from './wide-route';

export default function Header({ wide }: { wide: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLElement>(null);

  // 移动端菜单开合的可达性：打开时焦点移入菜单，Escape 关闭并归还焦点
  useEffect(() => {
    if (!menuOpen) return;
    menuRef.current?.querySelector<HTMLElement>('a')?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setMenuOpen(false);
      menuButtonRef.current?.focus();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

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
      className={`relative ${pageWidthClass(wide)} mb-6 transition-[max-width] duration-500 ease-out`}
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
            className="p-1.5 transition-colors text-secondary hover:text-foreground"
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
                      ? 'text-foreground font-medium'
                      : 'text-secondary hover:text-foreground'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
          </nav>
          <ThemeToggle />
        </div>

        {/* 移动端：搜索 + 汉堡按钮（命中区 44px，符合触控推荐） */}
        <div className="flex items-center gap-1 sm:hidden">
          <button
            type="button"
            aria-label="搜索文章"
            onClick={() => setSearchOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-lg transition-colors text-secondary hover:text-foreground"
          >
            <Search size={20} />
          </button>
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? '关闭菜单' : '打开菜单'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="flex h-11 w-11 items-center justify-center rounded-lg hover:bg-muted transition-colors text-secondary hover:text-foreground"
          >
            {menuOpen ? <Close size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* 移动端下拉菜单 */}
      {menuOpen && (
        <nav
          id="mobile-menu"
          ref={menuRef}
          className="absolute top-full left-0 right-0 z-50 bg-background border-b border-border shadow-lg sm:hidden"
        >
          <div className="flex flex-col py-2 px-4">
            {siteConfig.navLinks
              .filter((l) => l.location === 'header')
              .map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`py-3 px-2 transition-colors text-sm underline-offset-4 hover:underline ${
                    isActiveNav(link.href, pathname)
                      ? 'text-foreground font-medium'
                      : 'text-secondary hover:text-foreground'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
          </div>
          <div className="flex items-center gap-3 px-4 py-2">
            <ThemeToggle className="flex h-11 w-11 items-center justify-center" />
          </div>
        </nav>
      )}

      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
