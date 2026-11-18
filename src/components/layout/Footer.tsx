import Link from 'next/link';
import { siteConfig } from '@/site.config';

/** 页脚：只放元信息与站点工具，内容类型一律不在这里重复 */
export default function Footer() {
  const footerLinks = [
    ...siteConfig.navLinks
      .filter((l) => l.surfaces.includes('footer'))
      .map((l) => ({ label: l.label, href: l.href })),
    { label: 'RSS', href: siteConfig.rss.path },
  ];

  return (
    <footer className="border-t border-border mt-12 pt-8 pb-8 text-sm text-secondary">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-2">
          <a
            target="_blank"
            href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
            className="hover:text-foreground transition-colors underline-offset-4 hover:underline font-mono"
            rel="noopener noreferrer"
          >
            CC BY-NC-SA 4.0
          </a>
          <span>·</span>
          <span className="font-mono">2012 - {new Date().getFullYear()}</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
          {footerLinks.map((link, i) => (
            <span key={link.href} className="flex items-center gap-2">
              {i > 0 && <span>·</span>}
              <Link
                href={link.href}
                className="transition-colors underline-offset-4 hover:text-foreground hover:underline"
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
