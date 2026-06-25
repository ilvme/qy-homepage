import { glob } from 'glob';
import path from 'path';
import { cleanMarkdown, parseMdFromFile } from '@/libs/content-supports';
import type { PostMetadata } from '../../scripts/types';

export interface PostWithContent extends PostMetadata {
  content: string;
}

const POSTS_DIR = path.join(process.cwd(), 'content/posts');

/**
 * 获取所有文章
 */
export async function getAllPosts() {
  const pattern = path.join(POSTS_DIR, '*.md');
  const files = await glob(pattern);

  const posts = files
    .map((file) => parseMdFromFile(file))
    .filter((item): item is NonNullable<typeof item> => item != null)
    .map((item) => item.postMeta as PostMetadata)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  console.log('本地文章数：', posts.length);

  return posts;
}

/**
 * 获取指定 slug 的文章
 *
 * @param slug slug
 */
export async function getPostBySlug(slug: string): Promise<PostWithContent | null> {
  const filePath = path.join(POSTS_DIR, `${slug}.md`);
  const parsed = parseMdFromFile(filePath, true);
  if (!parsed?.postMeta) return null;

  return {
    ...(parsed.postMeta as PostMetadata),
    content: cleanMarkdown(parsed.content ?? ''),
  };
}

/**
 * 获取指定标签的文章
 * @param tag 标签
 */
export async function getPostsByTag(tag: string) {
  const posts = await getAllPosts();
  return posts.filter((post) => post.tags.includes(tag));
}

/**
 * 获取所有标签
 */
export async function getAllTags(): Promise<
  { label: string; count: number }[]
> {
  const posts = await getAllPosts();
  const tagSet = new Set<string>();
  posts.forEach((post) => post.tags.forEach((tag) => tagSet.add(tag)));

  // 统计每个标签的文章数量
  const tagCount = new Map<string, number>();
  posts.forEach((post) => {
    post.tags.forEach((tag) => {
      tagCount.set(tag, (tagCount.get(tag) ?? 0) + 1);
    });
  });
  return Array.from(tagSet)
    .map((tag) => ({
      label: tag,
      count: tagCount.get(tag) ?? 0,
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * 统计文章总数和总字数
 */
export async function getPostStats() {
  const pattern = path.join(POSTS_DIR, '*.md');
  const files = await glob(pattern);

  let totalPosts = 0;
  let totalWords = 0;

  for (const file of files) {
    const parsed = parseMdFromFile(file, true);
    if (!parsed) continue;
    totalPosts++;
    // 统计中文字符 + 英文单词
    const content = parsed.content as string;
    const chineseChars = (content.match(/[一-鿿]/g) || []).length;
    const englishWords = (content.match(/[a-zA-Z]+/g) || []).length;
    totalWords += chineseChars + englishWords;
  }

  return { totalPosts, totalWords };
}

/**
 * 获取所有分类
 */
export async function getAllCategories() {
  const posts = await getAllPosts();
  const categorySet = new Set<string>();
  posts.forEach((post) => categorySet.add(post.category));
  return Array.from(categorySet).sort();
}
