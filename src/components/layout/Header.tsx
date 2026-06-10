export default function Header() {
  return (
    <header className="flex justify-between">
      <h1>Home</h1>
      <nav className="flex gap-2">
        <a href="/shuoshuo">Words</a>
        <a href="/archives">Archives</a>
        <a href="/about">About</a>
      </nav>
    </header>
  );
}
