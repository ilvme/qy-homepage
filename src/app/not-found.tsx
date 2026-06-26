import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="text-8xl font-bold text-muted-foreground/30">404</p>
      <h1 className="mt-6 text-2xl font-semibold tracking-tight">页面未找到</h1>
      <p className="mt-2 text-secondary text-sm max-w-sm leading-relaxed">
        你访问的页面不存在，或者已经被移动到其他位置。
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:opacity-90 transition-opacity"
      >
        ← 返回首页
      </Link>
    </div>
  );
}
