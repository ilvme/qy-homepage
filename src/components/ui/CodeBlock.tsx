'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Copy } from '@/components/icons';

function extractLang(children: React.ReactNode): string | null {
  if (!children || typeof children !== 'object') return null;
  const codeEl = children as { props?: { className?: string } };
  const className = codeEl?.props?.className;
  if (typeof className !== 'string') return null;
  const match = className.match(/language-(\w+)/);
  return match ? match[1] : null;
}

/** Shiki 输出字符串 style，React 不接受，用 ref 绕过 */
function useShikiStyle(
  ref: React.RefObject<HTMLPreElement | null>,
  style: string | undefined,
) {
  useEffect(() => {
    if (ref.current && typeof style === 'string') {
      ref.current.setAttribute('style', style);
    }
  }, [ref, style]);
}

export default function CodeBlock({
  children,
  style: shikiStyle,
}: {
  children?: React.ReactNode;
  style?: string;
}) {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);
  const lang = extractLang(children);

  useShikiStyle(preRef, shikiStyle);

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
      {lang && (
        <span className="absolute left-3 top-2 text-sm text-secondary select-none">
          {lang}
        </span>
      )}
      <button
        type="button"
        onClick={handleCopy}
        className="absolute right-2 top-2 flex items-center gap-1 text-xs px-2 py-1 rounded
                   bg-muted hover:bg-accent border border-border text-secondary
                   opacity-0 group-hover/code:opacity-100 transition-opacity z-10
                   [@media(hover:none)]:opacity-100 focus-visible:opacity-100"
      >
        {copied ? (
          <>
            <Check size={14} />
            已复制
          </>
        ) : (
          <>
            <Copy size={14} />
            复制
          </>
        )}
      </button>
      <pre ref={preRef}>{children}</pre>
    </div>
  );
}
