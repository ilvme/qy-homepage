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

  return (
    <footer className="border-t border-border mt-12 pt-8 pb-8 text-sm text-secondary">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-2 font-mono">
          {/*<a*/}
          {/*  target="_blank"*/}
          {/*  href="https://creativecommons.org/licenses/by-nc-sa/4.0/"*/}
          {/*  className="hover:text-foreground transition-colors underline-offset-4 hover:underline font-mono"*/}
          {/*  rel="noopener noreferrer"*/}
          {/*>*/}
          {/*  CC BY-NC-SA 4.0*/}
          {/*</a>*/}
          {/*<span>·</span>*/}
          <Copyright size={14} />
          <span>2012-{new Date().getFullYear()}</span>
          <Link
            href="/about"
            className="hover:text-foreground underline-offset-4 hover:underline"
          >
            林深时觉寒
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
