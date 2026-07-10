'use client';

import type { NavSite } from '@/libs/nav-loader';

interface NavCardProps {
  site: NavSite;
}

export default function NavCard({ site }: NavCardProps) {
  return (
    <a
      href={site.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start gap-2.5 p-3 rounded-xl bg-muted/20 border border-border/50 shadow-sm hover:shadow-md hover:border-border hover:bg-muted/40 transition-all duration-200"
    >
      {/* Icon */}
      <div className="shrink-0 w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center overflow-hidden">
        {site.icon ? (
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
        <h3 className="text-sm font-medium truncate group-hover:text-foreground transition-colors">
          {site.title}
        </h3>
        {site.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
            {site.description}
          </p>
        )}
      </div>
    </a>
  );
}
