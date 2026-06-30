import type { MetadataRoute } from 'next';
import { getAllAwaken } from '@/libs/awaken-loader';
import {
  getAllCategories,
  getAllPosts,
  getAllTags,
} from '@/libs/content-loader';
import { getAllCooking } from '@/libs/cooking-loader';
import { siteConfig } from '@/site.config';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;

  // 静态页面
  const staticPages: MetadataRoute.Sitemap = [
    { url: '/', changeFrequency: 'daily', priority: 1.0 },
    { url: '/posts', changeFrequency: 'daily', priority: 0.9 },
    { url: '/archives', changeFrequency: 'weekly', priority: 0.6 },
    { url: '/tags', changeFrequency: 'weekly', priority: 0.5 },
    { url: '/categories', changeFrequency: 'weekly', priority: 0.5 },
    { url: '/words', changeFrequency: 'daily', priority: 0.8 },
    { url: '/cooking', changeFrequency: 'weekly', priority: 0.7 },
    { url: '/about', changeFrequency: 'monthly', priority: 0.7 },
    { url: '/friends', changeFrequency: 'monthly', priority: 0.5 },
    { url: '/resume', changeFrequency: 'monthly', priority: 0.5 },
    { url: '/sponsor', changeFrequency: 'monthly', priority: 0.3 },
    { url: '/awaken', changeFrequency: 'weekly', priority: 0.6 },
    { url: '/awaken/all', changeFrequency: 'weekly', priority: 0.6 },
    { url: '/taste', changeFrequency: 'weekly', priority: 0.6 },
  ].map((entry) => ({ ...entry, url: `${baseUrl}${entry.url}` }));

  // 文章详情页
  const posts = await getAllPosts();
  const postEntries: MetadataRoute.Sitemap = posts
    .filter((post) => post.status === 'published')
    .map((post) => ({
      url: `${baseUrl}/posts/${post.slug}`,
      lastModified: post.date ? new Date(post.date) : undefined,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

  // 下厨详情页
  const cookingItems = await getAllCooking();
  const cookingEntries: MetadataRoute.Sitemap = cookingItems
    .filter((item) => !item.status || item.status === 'published')
    .map((item) => ({
      url: `${baseUrl}/cooking/${item.slug}`,
      lastModified: item.date ? new Date(item.date) : undefined,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));

  // 语录详情页（slug 为 title）
  const awakenItems = await getAllAwaken();
  const awakenEntries: MetadataRoute.Sitemap = awakenItems.map((item) => ({
    url: `${baseUrl}/awaken/${encodeURIComponent(item.title)}`,
    lastModified: item.date ? new Date(item.date) : undefined,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // 标签页
  const tags = await getAllTags();
  const tagEntries: MetadataRoute.Sitemap = tags.map((tag) => ({
    url: `${baseUrl}/tags/${encodeURIComponent(tag.label)}`,
    changeFrequency: 'weekly' as const,
    priority: 0.4,
  }));

  // 分类页
  const categories = await getAllCategories();
  const categoryEntries: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${baseUrl}/categories/${encodeURIComponent(cat)}`,
    changeFrequency: 'weekly' as const,
    priority: 0.4,
  }));

  return [
    ...staticPages,
    ...postEntries,
    ...cookingEntries,
    ...awakenEntries,
    ...tagEntries,
    ...categoryEntries,
  ];
}
