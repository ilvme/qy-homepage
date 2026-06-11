import 'dotenv/config';
import { Client } from '@notionhq/client';
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import type { PostMetadata } from '../types';

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

/**
 * 获取指定数据库下所有文章页面
 *
 * @param databaseId 数据源 ID
 */
export async function fetchAllPages(
  databaseId: string,
): Promise<WordMetadata[] | undefined> {
  // 1. 获取数据源ID
  const dbs = await notion.databases.retrieve({
    database_id: databaseId,
  });

  if (!dbs.data_sources || dbs.data_sources.length === 0) {
    console.error('No data sources found for this database.');
    return;
  }

  // 2. 选择数据源（如果数据库内有多个数据源，可能需要逻辑选择，这里取第一个）
  const dataSourceId = dbs.data_sources[0].id;

  // 3. 递归查询数据源，获取所有文章页面（处理分页）
  // 注意：Notion API 每次最多返回 100 条，需要使用 start_cursor 分页获取
  const allResults: any[] = [];
  let startCursor: string | undefined;

  do {
    const response = await notion.dataSources.query({
      data_source_id: dataSourceId,
      // filter: {
      //   property: 'status',
      //   select: { equals: 'published' },
      // },
      sorts: [{ property: 'date', direction: 'descending' }],
      start_cursor: startCursor,
      page_size: 100, // 每次最多获取 100 条
    });

    allResults.push(...response.results);
    startCursor = response.next_cursor || undefined;

    console.log(
      `Fetched ${response.results.length} posts, total: ${allResults.length}`,
    );
  } while (startCursor);

  return allResults.map((page: PageObjectResponse) => {
    return {
      page_id: page.id,
      last_edited_time: page.last_edited_time,
      title: page.properties.title?.title[0]?.plain_text,
      tags: page.properties.tags.multi_select.map((tag) => tag.name),
      date: page.properties.date.date?.start,
      status: page.properties.status.select?.name,
      from: page.properties.from.select?.name,
      last_fetch_time: page.properties.last_fetch_time.date?.start,
    };
  });
}

/**
 * 获取指定页面的纯 Markdown 内容
 * @param post 文章信息
 */
export async function fetchPagePureMdContent(post: PostMetadata) {
  try {
    const { markdown } = await notion.pages.retrieveMarkdown({
      page_id: post.page_id,
    });

    return markdown;
  } catch (error) {
    console.error(`✗ Failed to obtain [${post.title}] md content:`, error);
  }
}
