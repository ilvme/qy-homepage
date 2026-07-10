'use client';

import type { NavSite } from '@/libs/nav-loader';

interface NavCardProps {
  site: NavSite;
}

export default function NavCard({ site }: NavCardProps) {
  const isSvgIcon =
    site.icon && typeof site.icon === 'object' && 'svg' in site.icon;

  return (
    <a
      href={site.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex items-start gap-2.5 p-3 rounded-xl bg-muted/20 border border-border/50 shadow-sm hover:shadow-md hover:border-border hover:bg-muted/40 transition-all duration-200"
    >
      {/* Icon */}
      <div className="shrink-0 w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center overflow-hidden">
        {isSvgIcon ? (
          <span
            className="w-6 h-6 inline-flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
            dangerouslySetInnerHTML={{
              __html: (site.icon as { svg: string }).svg,
            }}
          />
        ) : typeof site.icon === 'string' && site.icon ? (
          <img
            src={site.icon}
            alt=""
            className="w-7 h-7 object-contain"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <span className="text-lg font-bold text-muted-foreground/60">
            {site.title.charAt(0)}
          </span>
        )}
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-bold truncate group-hover:text-foreground transition-colors">
          {site.title}
        </h3>
        {site.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
            {site.description}
          </p>
        )}
      </div>

      {/* Badge — 右上角 */}
      {site.badge && (
        <span className="absolute top-2 right-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] text-muted-foreground/70 bg-muted/60">
          {site.badge}
        </span>
      )}
    </a>
  );
}
