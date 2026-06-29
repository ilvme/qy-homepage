import type { PostMetadata } from '../types';
import { toLocalTime } from './sync-utils';

/**
 * 将 Notion 文章/页面数据库的原始 page 映射为 PostMetadata
 */
export function mapArticlePage(page: any): PostMetadata {
  const coverObj = page.cover;
  let coverUrl: string | undefined;
  if (coverObj) {
    coverUrl =
      coverObj.type === 'external'
        ? coverObj.external?.url
        : coverObj.file?.url;
  }

  const iconObj = page.icon;
  let iconUrl: string | undefined;
  if (iconObj) {
    iconUrl =
      iconObj.type === 'external' ? iconObj.external?.url : iconObj.file?.url;
  }

  return {
    page_id: page.id,
    last_edited_time: toLocalTime(page.last_edited_time)!,
    cover: coverUrl,
    icon: iconUrl,

    title: page.properties.title.title[0].plain_text,
    type: page.properties.type.select?.name,
    slug: page.properties.slug.rich_text[0].plain_text,
    category: page.properties.category.select?.name,
    tags: page.properties.tags?.multi_select?.map(
      (tag: { name: string }) => tag.name,
    ),
    date:
      toLocalTime(page.properties.date?.date?.start) ??
      toLocalTime(page.created_time)!,
    summary: page.properties.summary.rich_text[0]?.plain_text,
    status: page.properties.status.select?.name,
    last_fetched_time: toLocalTime(page.properties.last_fetched_time.date?.start) ?? null,
  };
}

/**
 * 获取并校验 NOTION_ARTICLES_DATABASE_ID
 */
export function getArticlesDatabaseId(): string {
  if (!process.env.NOTION_ARTICLES_DATABASE_ID) {
    console.error('Error: NOTION_ARTICLES_DATABASE_ID is not set in .env');
    process.exit(1);
  }
  return process.env.NOTION_ARTICLES_DATABASE_ID;
}
