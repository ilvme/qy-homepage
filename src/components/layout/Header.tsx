export default function Header() {
  return (
    <header className="flex justify-between py-8">
      <h1 className="text-xl">和光同尘</h1>
      <nav className="flex gap-2 text-lg">
        <a href="/posts">文章</a>
        <a href="/archives">归档</a>
        <a href="/shuoshuo">说说</a>
      </nav>
    </header>
  );
}
