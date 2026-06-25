import 'dotenv/config';
import { Client } from '@notionhq/client';
import type { MediaMetadata } from '../types';

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

/**
 * 获取指定数据库下所有书影音页面
 */
export async function fetchAllPages(
  databaseId: string,
): Promise<MediaMetadata[] | undefined> {
  const dbs = await notion.databases.retrieve({
    database_id: databaseId,
  });

  if (!dbs.data_sources || dbs.data_sources.length === 0) {
    console.error('No data sources found for this database.');
    return;
  }

  const dataSourceId = dbs.data_sources[0].id;

  const allResults: any[] = [];
  let startCursor: string | undefined;

  do {
    const response = await notion.dataSources.query({
      data_source_id: dataSourceId,
      filter: {
        property: 'status',
        select: { does_not_equal: 'private' },
      },
      sorts: [{ property: 'date', direction: 'descending' }],
      start_cursor: startCursor,
      page_size: 100,
    });

    allResults.push(...response.results);
    startCursor = response.next_cursor || undefined;

    console.log(
      `Fetched ${response.results.length} media items, total: ${allResults.length}`,
    );
  } while (startCursor);

  return allResults.map((page: any) => {
    return {
      page_id: page.id,
      last_edited_time: page.last_edited_time,
      title: page.properties.title?.title[0]?.plain_text ?? '',
      type: page.properties.type?.select?.name ?? '',
      creator: page.properties.creator?.rich_text[0]?.plain_text ?? '',
      rating: page.properties.rating?.number ?? 0,
      status: page.properties.status?.select?.name ?? '',
      date: page.properties.date?.date?.start ?? '',
      tags: page.properties.tags?.multi_select?.map((t) => t.name) ?? [],
      cover: page.properties.cover?.url ?? (page.cover?.type === 'external' ? page.cover.external.url : '') ?? '',
      comment: page.properties.comment?.rich_text[0]?.plain_text ?? '',
      link: page.properties.link?.url ?? '',
      last_fetch_time: page.properties.last_fetch_time?.date?.start ?? null,
    };
  });
}

/**
 * 获取指定页面的纯 Markdown 内容
 */
export async function fetchPagePureMdContent(post: MediaMetadata) {
  try {
    const { markdown } = await notion.pages.retrieveMarkdown({
      page_id: post.page_id,
    });

    return markdown;
  } catch (error) {
    console.error(`✗ Failed to obtain [${post.title}] md content:`, error);
  }
}
