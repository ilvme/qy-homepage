import Link from 'next/link';
import { siteConfig } from '@/site.config';

const rightLinks = [
  ...siteConfig.navLinks.filter((l) => l.location === 'footer').map((l) => ({ label: l.label, href: l.href })),
  { label: '赞赏', href: '/sponsor' },
  { label: 'RSS', href: '/rss.xml' },
];

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

        <div className="flex items-center gap-2">
          {rightLinks.map((link, i) => (
            <span key={link.href} className="flex items-center gap-2">
              {i > 0 && <span>·</span>}
              <Link
                href={link.href}
                className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
              >
                {link.label}
              </Link>
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
