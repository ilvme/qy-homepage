'use client';

import { useState } from 'react';
import { Check, Copy } from '@/components/icons';

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for older browsers
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 text-xs text-secondary/60 hover:text-secondary transition-colors"
    >
      {copied ? (
        <Check size={14} />
      ) : (
        <Copy size={14} />
      )}
      {copied ? '已复制' : '复制'}
    </button>
  );
}
