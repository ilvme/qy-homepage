import Link from 'next/link';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  /** 基础路径，如 /posts、/cooking */
  basePath: string;
  /** 需要透传的查询参数（如分类），分页跳转时保持上下文 */
  query?: Record<string, string | undefined>;
}

function buildHref(
  basePath: string,
  query: Record<string, string | undefined> | undefined,
  page: number,
) {
  const search = new URLSearchParams();
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value != null) search.set(key, value);
    }
  }
  search.set('page', String(page));
  return `${basePath}?${search.toString()}`;
}

export default function Pagination({
  currentPage,
  totalPages,
  basePath,
  query,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav className="flex items-center justify-between mt-10 pt-6 border-t border-border">
      <div className="w-20">
        {currentPage > 1 && (
          <Link
            href={buildHref(basePath, query, currentPage - 1)}
            className="text-sm text-secondary hover:text-foreground transition-colors"
          >
            ← 上一页
          </Link>
        )}
      </div>

      <span className="text-sm text-secondary">
        {currentPage} / {totalPages}
      </span>

      <div className="w-20 text-right">
        {currentPage < totalPages && (
          <Link
            href={buildHref(basePath, query, currentPage + 1)}
            className="text-sm text-secondary hover:text-foreground transition-colors"
          >
            下一页 →
          </Link>
        )}
      </div>
    </nav>
  );
}
