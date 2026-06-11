export default function Footer() {
  return (
    <footer className="text-secondary pt-12 pb-12 text-center text-sm min-sm:flex min-sm:justify-between">
      <div>
        <a
          target="_blank"
          href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
          className="underline-offset-4 hover:underline"
          rel="noopener"
        >
          CC BY-NC-SA 4.0
        </a>
        <span>&nbsp;&nbsp;2012 - PRESENT</span>
        <span>&nbsp;© </span>
        <a href="/" className="underline-offset-4 hover:underline">
          林深时觉寒
        </a>
      </div>

      <div>
        <a href="/rss.xml" className="underline-offset-4 hover:underline">
          RSS
        </a>
        <span>&nbsp;·&nbsp;</span>
        <a href="/sponsor" className="underline-offset-4 hover:underline">
          Sponsor
        </a>
      </div>
    </footer>
  );
}
