'use client';

import { useEffect, useState } from 'react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  headings: TocItem[];
}

export default function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const [showBtn, setShowBtn] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '-80px 0px -80% 0px' },
    );

    for (const heading of headings) {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [headings]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBtn(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (headings.length === 0) return null;

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveId(id);
    }
  };

  return (
    <>
      {/*
        桌面端：fixed 定位在页面左侧，滚动时固定在视口左上方
        left calc: 800px 主体容器居中，TOC 在其左侧 32px 处
      */}
      <div className="hidden xl:block xl:fixed top-20 left-[calc((100vw-800px)/2-12rem)] w-48">
        <nav className="border-l-2 border-border pl-3 space-y-1 max-h-[calc(100vh-8rem)] overflow-y-auto">
          <div className="text-base font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            目录
          </div>
          {headings.map((heading) => (
            <a
              key={heading.id}
              href={`#${heading.id}`}
              onClick={(e) => {
                e.preventDefault();
                scrollToHeading(heading.id);
              }}
              className={`block text-sm leading-relaxed transition-colors ${
                heading.level === 3 ? 'pl-4' : ''
              } ${
                activeId === heading.id
                  ? 'text-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:underline underline-offset-4'
              }`}
            >
              {heading.text}
            </a>
          ))}
        </nav>
      </div>

      {/* 移动端/平板：浮动目录按钮 + 弹出面板 */}
      <div className="xl:hidden fixed bottom-16 left-4 z-40">
        {isOpen && (
          <div className="mb-2 w-64 max-h-80 overflow-y-auto bg-card border border-border rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-foreground">目录</span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-0.5 rounded hover:bg-muted transition-colors text-secondary"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <title>关闭</title>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <nav className="border-l-2 border-border pl-3 space-y-1">
              {headings.map((heading) => (
                <a
                  key={heading.id}
                  href={`#${heading.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToHeading(heading.id);
                    setIsOpen(false);
                  }}
                  className={`block text-sm leading-relaxed transition-colors ${
                    heading.level === 3 ? 'pl-3' : ''
                  } ${
                    activeId === heading.id
                      ? 'text-foreground font-medium'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {heading.text}
                </a>
              ))}
            </nav>
          </div>
        )}

        {showBtn && !isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            aria-label="显示目录"
            className="w-10 h-10 rounded-full bg-card border border-border shadow-lg flex items-center justify-center text-secondary hover:text-foreground transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <title>目录</title>
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
          </button>
        )}
      </div>
    </>
  );
}
