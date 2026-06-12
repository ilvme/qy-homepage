import Link from 'next/link';

export default function Header() {
  return (
    <header className="flex justify-between py-6">
      <Link href="/">
        <h1 className="text-2xl font-bold">和光同尘</h1>
      </Link>
      <nav className="flex gap-2 text-lg">
        <Link href="/posts">文章</Link>
        <Link href="/posts">笔记</Link>
        <Link href="/tags">标签</Link>
        <Link href="/archives">归档</Link>
        <Link href="/words">说说</Link>
      </nav>
    </header>
  );
}
