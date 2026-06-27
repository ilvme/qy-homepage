import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-border mt-16 pt-8 pb-8 text-sm text-secondary">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-2">
          <a
            target="_blank"
            href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
            className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
            rel="noopener noreferrer"
          >
            CC BY-NC-SA 4.0
          </a>
          <span>·</span>
          <span>2012 - PRESENT</span>
          <span>·</span>
          <Link
            href="/"
            className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
          >
            林深时觉寒
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/sponsor"
            className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
          >
            赞赏
          </Link>
          <span>·</span>
          <a
            href="/src/app/(blogs)/rss.xml"
            className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
          >
            RSS
          </a>
        </div>
      </div>
    </footer>
  );
}
