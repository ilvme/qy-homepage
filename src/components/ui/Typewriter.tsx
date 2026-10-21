'use client';

import { useEffect, useState } from 'react';

interface TypewriterProps {
  text: string;
  /** 每个字符的间隔时间（ms） */
  speed?: number;
  /** 开始前的延迟（ms） */
  delay?: number;
  className?: string;
}

/**
 * 打字机效果。
 * 初始渲染与服务端一致输出全文（SEO 与无 JS 环境下文案可见），
 * 客户端挂载后再重置为空重新打字——避免 SSR 输出空标题。
 */
export default function Typewriter({
  text,
  speed = 160,
  delay = 0,
  className,
}: TypewriterProps) {
  const [displayed, setDisplayed] = useState(text);
  const [reduced, setReduced] = useState(false);
  const [cursor, setCursor] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    // 减弱动效偏好：保持全文，不做动画
    if (mq.matches) return;

    let interval: ReturnType<typeof setInterval> | undefined;
    let i = 0;
    setDisplayed('');

    const timer = setTimeout(() => {
      interval = setInterval(() => {
        i += 1;
        setDisplayed(text.slice(0, i));
        if (i >= text.length && interval) {
          clearInterval(interval);
          interval = undefined;
        }
      }, speed);
    }, delay);

    return () => {
      clearTimeout(timer);
      if (interval) clearInterval(interval);
    };
  }, [text, speed, delay]);

  // 光标闪烁
  useEffect(() => {
    const blink = setInterval(() => setCursor((c) => !c), 530);
    return () => clearInterval(blink);
  }, []);

  if (reduced) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className}>
      {/* 屏幕阅读器读取完整文案，逐字动画对辅助技术隐藏 */}
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {displayed}
        <span
          className="inline-block w-[0.4em] h-[0.08em] bg-current align-bottom mb-[0.15em] ml-[0.02em] transition-opacity duration-100"
          style={{ opacity: cursor ? 1 : 0 }}
        />
      </span>
    </span>
  );
}
