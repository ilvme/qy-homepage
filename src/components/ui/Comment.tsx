'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { siteConfig } from '@/site.config';
import { THEME_EVENT_NAME } from './theme';

const GISCUS_ORIGIN = 'https://giscus.app';

function getGiscusTheme(): string {
  if (typeof window === 'undefined') return 'noborder_light';
  return document.documentElement.classList.contains('dark')
    ? 'noborder_gray'
    : 'noborder_light';
}

interface CommentProps {
  /** 是否视口进入时才加载（默认 true） */
  lazy?: boolean;
  /** 收起态标题，默认「评论」。页面想用别的措辞（如友链页的「留言板」）时传这个，
   *  避免标题写在 Notion 内容里、组件在代码里，两边靠位置巧合拼在一起 */
  title?: string;
}

export default function Comment({ lazy = true, title = '评论' }: CommentProps) {
  /** 默认收起 */
  const [open, setOpen] = useState(false);
  /** giscus 元数据回传的评论总数，未拿到前按 0 显示 */
  const [count, setCount] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);

  const sendTheme = useCallback((theme: string) => {
    const iframe = document.querySelector<HTMLIFrameElement>(
      'iframe.giscus-frame',
    );
    iframe?.contentWindow?.postMessage(
      { giscus: { setConfig: { theme } } },
      GISCUS_ORIGIN,
    );
  }, []);

  // 监听主题变化（手动切换或系统偏好变更），同步更新 Giscus
  useEffect(() => {
    const handleChange = () => {
      sendTheme(getGiscusTheme());
    };
    document.addEventListener(THEME_EVENT_NAME, handleChange);
    return () => document.removeEventListener(THEME_EVENT_NAME, handleChange);
  }, [sendTheme]);

  // 接收 giscus 元数据，取评论数（评论 + 回复）
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== GISCUS_ORIGIN) return;
      const discussion = event.data?.giscus?.discussion;
      if (!discussion) return;
      setCount(
        (discussion.totalCommentCount ?? 0) +
          (discussion.totalReplyCount ?? 0),
      );
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

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
      script.src = `${GISCUS_ORIGIN}/client.js`;
      script.setAttribute('data-repo', giscus.repo);
      script.setAttribute('data-repo-id', giscus.repoId);
      script.setAttribute('data-category', giscus.category);
      script.setAttribute('data-category-id', giscus.categoryId);
      script.setAttribute('data-mapping', 'pathname');
      script.setAttribute('data-strict', '0');
      script.setAttribute('data-reactions-enabled', '0');
      // 回传评论数，供收起态标题显示
      script.setAttribute('data-emit-metadata', '1');
      script.setAttribute('data-input-position', 'top');
      script.setAttribute('data-theme', theme);
      script.setAttribute('data-lang', 'zh-CN');
      // 收起时容器高度为 0，需 eager 才会加载
      script.setAttribute('data-loading', 'eager');
      script.crossOrigin = 'anonymous';
      script.async = true;

      container.appendChild(script);
    };

    if (lazy) {
      // 观察外层（收起态容器高度为 0，零尺寸元素不会触发相交）
      const target = sectionRef.current;
      if (!target) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            loadGiscus();
            observer.disconnect();
          }
        },
        { rootMargin: '200px' },
      );
      observer.observe(target);
      return () => observer.disconnect();
    }

    loadGiscus();
  }, [lazy]);

  const label = `${title}（${count}）`;

  return (
    <div className="mt-12" ref={sectionRef}>
      {!open && (
        <div className="flex ">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            className="text-base font-extrabold hover:cursor-pointer"
          >
            {label}
          </button>
        </div>
      )}

      {/* 收起时高度为 0，保留 iframe 宽度与加载状态，展开不重复请求 */}
      <div
        ref={containerRef}
        aria-hidden={!open}
        className={open ? '' : 'h-0 overflow-hidden'}
      />
    </div>
  );
}
