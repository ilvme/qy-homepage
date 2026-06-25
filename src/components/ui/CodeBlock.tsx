'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/** 从 code 元素的 className 中提取语言名 */
function extractLang(children: React.ReactNode): string | null {
  if (!children || typeof children !== 'object') return null;
  const codeEl = children as { props?: { className?: string } };
  const className = codeEl?.props?.className;
  if (typeof className !== 'string') return null;
  const match = className.match(/language-(\w+)/);
  return match ? match[1] : null;
}

/**
 * MDXRemote 传递的 style 可能是 shiki 生成的字符串（如 "--shiki-light:#xxx"），
 * React 的 style prop 只接受对象，字符串会被忽略。
 * 用 ref 直接写入 DOM 绕过这个限制。
 */
function useShikiStyle(
  ref: React.RefObject<HTMLPreElement | null>,
  style: string | React.CSSProperties | undefined,
) {
  useEffect(() => {
    if (ref.current && typeof style === 'string') {
      ref.current.setAttribute('style', style);
    }
  }, [ref, style]);
}

export default function CodeBlock({
  children,
  className: preClassName,
  style: preStyle,
}: {
  children: React.ReactNode;
  className?: string;
  style?: string | React.CSSProperties;
}) {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);
  const lang = extractLang(children);

  // 将 shiki 的字符串 style 注入 DOM
  useShikiStyle(preRef, preStyle);

  const handleCopy = useCallback(async () => {
    const text = preRef.current?.textContent ?? '';
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, []);

  return (
    <div className="relative group/code my-5">
      <div className="absolute right-2 top-3 flex items-center gap-2 opacity-0 group-hover/code:opacity-100 transition-opacity">
        {lang && (
          <span className="text-xs text-secondary select-none">
            {lang}
          </span>
        )}

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs px-2 py-1 rounded
                     bg-muted hover:bg-accent border border-border text-secondary"
        >
        {copied ? (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><title>已复制</title><polyline points="20 6 9 17 4 12" /></svg>
            已复制
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><title>复制</title><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
            复制
          </>
        )}
        </button>
      </div>

      <pre ref={preRef} className={preClassName}>
        {children}
      </pre>
    </div>
  );
}
