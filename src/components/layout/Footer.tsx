import Link from 'next/link';
import { Copyright } from '@/components/icons';
import { siteConfig } from '@/site.config';

/**
 * 页脚：只保留版权与年份。
 * 内容类型归顶栏/首页；文章的归档·标签·分类·RSS 归 /posts 与 /archives 自身。
 * footerLinks 逻辑保留，将来要往页脚加链接时给 navLinks 补 footer surface 即可。
 */
export default function Footer() {
  const footerLinks = siteConfig.navLinks
    .filter((l) => l.surfaces.includes('footer'))
    .map((l) => ({ label: l.label, href: l.href }));

  const currentYear = new Date().getFullYear();
  const copyrightYears =
    siteConfig.startYear === currentYear
      ? `${currentYear}`
      : `${siteConfig.startYear}-${currentYear}`;

  return (
    <footer className="mt-12 pt-8 pb-8 text-sm text-secondary">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-2 font-mono">
          <Copyright size={14} />
          <span>{copyrightYears}</span>
          <Link
            href="/about"
            className="hover:text-foreground underline-offset-4 hover:underline"
          >
            {siteConfig.author.displayName}
          </Link>
        </div>

        {footerLinks.length > 0 && (
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
        )}
      </div>
    </footer>
  );
}
