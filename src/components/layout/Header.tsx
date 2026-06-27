'use client';

import Link from 'next/link';
import { useState } from 'react';
import { siteConfig } from '@/site.config';

const navLinks = [
  { href: '/posts', label: '文章' },
  { href: '/words', label: '说说' },
  { href: '/archives', label: '归档' },
  { href: '/share', label: '分享' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="relative flex items-center justify-between py-6 border-b border-border mb-6">
      <Link
        href="/"
        className="text-xl font-bold tracking-tight hover:opacity-80 transition-opacity"
      >
        {siteConfig.title}
      </Link>

      {/* 桌面端导航 */}
      <nav className="hidden sm:flex items-center gap-1">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="px-2 py-1 rounded-md hover:bg-muted transition-colors text-secondary hover:text-foreground"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* 移动端：汉堡按钮 */}
      <div className="sm:hidden">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? '关闭菜单' : '打开菜单'}
          className="p-1.5 rounded-md hover:bg-muted transition-colors text-secondary hover:text-foreground"
        >
          {menuOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="4" y1="8" x2="20" y2="8" />
              <line x1="4" y1="16" x2="20" y2="16" />
            </svg>
          )}
        </button>
      </div>

      {/* 移动端下拉菜单 */}
      {menuOpen && (
        <nav className="absolute top-full left-0 right-0 z-50 bg-background border-b border-border shadow-lg sm:hidden">
          <div className="flex flex-col py-2 px-4">
            {navLinks.map((link) => (
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
        </nav>
      )}
    </header>
  );
}
