'use client';

import { useCallback, useEffect, useRef } from 'react';
import { siteConfig } from '@/site.config';

function getGiscusTheme(): string {
  if (typeof window === 'undefined') return 'noborder_light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'noborder_gray'
    : 'noborder_light';
}

interface CommentProps {
  /** 是否视口进入时才加载（默认 true） */
  lazy?: boolean;
}

export default function Comment({ lazy = true }: CommentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);

  const sendTheme = useCallback((theme: string) => {
    const iframe = document.querySelector<HTMLIFrameElement>(
      'iframe.giscus-frame',
    );
    iframe?.contentWindow?.postMessage(
      { giscus: { setConfig: { theme } } },
      'https://giscus.app',
    );
  }, []);

  // 监听系统主题变化，同步更新 Giscus
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      sendTheme(getGiscusTheme());
    };
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, [sendTheme]);

  useEffect(() => {
    if (loadedRef.current) return;

    const container = containerRef.current;
    if (!container) return;

    const { giscus } = siteConfig;
    if (!giscus.enabled) return;

    const theme = getGiscusTheme();

    const loadGiscus = () => {
      if (loadedRef.current) return;
      loadedRef.current = true;

      const script = document.createElement('script');
      script.src = 'https://giscus.app/client.js';
      script.setAttribute('data-repo', giscus.repo);
      script.setAttribute('data-repo-id', giscus.repoId);
      script.setAttribute('data-category', giscus.category);
      script.setAttribute('data-category-id', giscus.categoryId);
      script.setAttribute('data-mapping', 'pathname');
      script.setAttribute('data-strict', '0');
      script.setAttribute('data-reactions-enabled', '1');
      script.setAttribute('data-emit-metadata', '0');
      script.setAttribute('data-input-position', 'top');
      script.setAttribute('data-theme', theme);
      script.setAttribute('data-lang', 'zh-CN');
      script.setAttribute('data-loading', 'lazy');
      script.crossOrigin = 'anonymous';
      script.async = true;

      container.appendChild(script);
    };

    if (lazy) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            loadGiscus();
            observer.disconnect();
          }
        },
        { rootMargin: '200px' },
      );
      observer.observe(container);
      return () => observer.disconnect();
    }

    loadGiscus();
  }, [lazy]);

  return (
    <div className="mt-12 pt-6 border-t border-border">
      <div ref={containerRef} />
    </div>
  );
}
