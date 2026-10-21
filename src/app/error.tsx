'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="text-8xl font-bold text-muted-foreground/30">500</p>
      <h1 className="mt-6 text-2xl font-medium tracking-normal">页面出错了</h1>
      <p className="mt-2 text-secondary text-sm max-w-sm leading-relaxed">
        渲染这个页面时发生了异常。可以重试一次，或者先回首页逛逛。
      </p>
      <div className="mt-8 flex items-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-background hover:opacity-90 transition-opacity"
        >
          重试
        </button>
        <Link
          href="/"
          className="rounded-lg border border-border px-5 py-2.5 text-sm text-secondary hover:bg-muted transition-colors"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}
