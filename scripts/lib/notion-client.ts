import 'dotenv/config';
import { Client } from '@notionhq/client';

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

/** Notion data sources query 可用的过滤/排序参数 */
export interface QueryOptions {
  /** 状态过滤，如 { property: 'status', select: { equals: 'published' } } */
  filter?: Record<string, unknown>;
  /** 排序规则，默认按 date 降序 */
  sorts?: Array<{ property: string; direction: 'ascending' | 'descending' }>;
  /** 每次分页大小，默认 100 */
  pageSize?: number;
}

/**
 * 获取 Notion 数据库的所有页面（通过 data_sources 分页查询）
 *
 * @param databaseId - Notion 数据库 ID
 * @param mapPage    - 将原始 page 对象映射为元数据类型 T
 * @param options    - 可选的过滤/排序/分页参数
 */
export async function fetchAllPages<T>(
  databaseId: string,
  mapPage: (page: any) => T,
  options: QueryOptions = {},
): Promise<T[]> {
  const { filter, sorts, pageSize = 100 } = options;

  // 1. 获取数据源 ID
  const dbs = await notion.databases.retrieve({
    database_id: databaseId,
  });

  if (!dbs.data_sources || dbs.data_sources.length === 0) {
    console.error('No data sources found for this database.');
    return [];
  }

  const dataSourceId = dbs.data_sources[0].id;

  // 2. 分页查询
  const allResults: any[] = [];
  let startCursor: string | undefined;

  do {
    const response = await notion.dataSources.query({
      data_source_id: dataSourceId,
      filter: filter as any,
      sorts: sorts as any,
      start_cursor: startCursor,
      page_size: pageSize,
    });

    allResults.push(...response.results);
    startCursor = response.next_cursor || undefined;

    console.log(
      `Fetched ${response.results.length} pages, total: ${allResults.length}`,
    );
  } while (startCursor);

  return allResults.map(mapPage);
}

/**
 * 获取指定页面的纯 Markdown 内容
 */
export async function fetchPageMarkdown(
  pageId: string,
): Promise<string | undefined> {
  try {
    const { markdown } = await notion.pages.retrieveMarkdown({
      page_id: pageId,
    });
    return markdown;
  } catch (error) {
    console.error(`✗ Failed to obtain markdown for [${pageId}]:`, error);
    return undefined;
  }
}
