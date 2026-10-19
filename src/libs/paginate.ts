/**
 * 通用分页计算
 * @param items 待分页的完整列表（需已排好序/过滤）
 * @param pageParam URL 中的 page 参数（未解析的字符串）
 * @param pageSize 每页条数
 */
export function paginate<T>(
  items: T[],
  pageParam: string | undefined,
  pageSize: number,
) {
  const currentPage = Math.max(1, parseInt(pageParam ?? '1', 10) || 1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  // 越界页码钳制到最后一页，避免渲染空列表
  const safePage = Math.min(currentPage, totalPages);

  return {
    currentPage: safePage,
    totalPages,
    pagedItems: items.slice((safePage - 1) * pageSize, safePage * pageSize),
  };
}
