import type { MetadataRoute } from 'next';
import { getAllAwaken } from '@/libs/awaken-loader';
import {
  getAllCategories,
  getAllPosts,
  getAllTags,
} from '@/libs/content-loader';
import { getAllCooking } from '@/libs/cooking-loader';
import { getAllWordTags, getWordsGroupedByMonth } from '@/libs/words-loader';
import { siteConfig } from '@/site.config';

/** 静态页面清单：新增静态路由时同步补这里，动态页由各自的 loader 派生 */
const STATIC_PATHS = [
  '/',
  '/posts',
  '/archives',
  '/tags',
  '/categories',
  '/words',
  '/words/tags',
  '/words/monthly',
  '/cooking',
  '/taste',
  '/awaken',
  '/awaken/all',
  '/about',
  '/friends',
  '/resume',
  '/sponsor',
];

/**
 * 内容页 lastModified 取 Notion 的最后编辑时间。
 * date 只是发布日：一篇 2021 年发布、2026 年改过的文章若报 2021，爬虫会当成陈旧内容不再重抓。
 */
function lastModified(meta: {
  date: string | null;
  last_edited_time: string;
}): Date | undefined {
  const raw = meta.last_edited_time || meta.date;
  return raw ? new Date(raw) : undefined;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;

  const [
    posts,
    cookingItems,
    awakenItems,
    tags,
    categories,
    wordTags,
    wordMonths,
  ] = await Promise.all([
    getAllPosts(),
    getAllCooking(),
    getAllAwaken(),
    getAllTags(),
    getAllCategories(),
    getAllWordTags(),
    getWordsGroupedByMonth(),
  ]);

  // 只给 URL，不写 priority / changeFrequency —— Google 已明确忽略这两个字段，
  // 手写一份没人读的权重表，只会让真正该维护的 URL 清单漏项。
  const staticPages: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${baseUrl}${path}`,
  }));

  const postEntries: MetadataRoute.Sitemap = posts
    .filter((post) => post.status === 'published')
    .map((post) => ({
      url: `${baseUrl}/posts/${post.slug}`,
      lastModified: lastModified(post),
    }));

  const cookingEntries: MetadataRoute.Sitemap = cookingItems
    .filter((item) => !item.status || item.status === 'published')
    .map((item) => ({
      url: `${baseUrl}/cooking/${item.slug}`,
      lastModified: lastModified(item),
    }));

  const awakenEntries: MetadataRoute.Sitemap = awakenItems.map((item) => ({
    url: `${baseUrl}/awaken/${item.slug}`,
    lastModified: lastModified(item),
  }));

  const tagEntries: MetadataRoute.Sitemap = tags.map((tag) => ({
    url: `${baseUrl}/tags/${encodeURIComponent(tag.label)}`,
  }));

  const categoryEntries: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${baseUrl}/categories/${encodeURIComponent(cat)}`,
  }));

  // 说说没有详情页，内容散在 /words 的分页里；标签页与月刊是唯一可按主题直达的独立 URL
  const wordTagEntries: MetadataRoute.Sitemap = wordTags.map((tag) => ({
    url: `${baseUrl}/words/tags/${encodeURIComponent(tag.label)}`,
  }));

  const wordMonthEntries: MetadataRoute.Sitemap = wordMonths.map((group) => ({
    url: `${baseUrl}/words/monthly/${encodeURIComponent(group.key)}`,
  }));

  return [
    ...staticPages,
    ...postEntries,
    ...cookingEntries,
    ...awakenEntries,
    ...tagEntries,
    ...categoryEntries,
    ...wordTagEntries,
    ...wordMonthEntries,
  ];
}
