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
    { url: `${baseUrl}/`, changeFrequency: 'daily' as const, priority: 1.0 },
    {
      url: `${baseUrl}/posts`,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/archives`,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/tags`,
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/categories`,
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/words`,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/cooking`,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/friends`,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/resume`,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/sponsor`,
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/awaken`,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/awaken/all`,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/taste`,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
  ];

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
