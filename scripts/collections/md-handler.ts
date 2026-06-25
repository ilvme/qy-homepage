import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type { CollectionMetadata } from '../types';
import { downloadAndReplaceImages } from '../articles/images-handler';
import { fetchPagePureMdContent } from './notion-supports';

const CONTENT_DIR = path.join(process.cwd(), 'content', 'collections');
const IMAGES_DIR = path.join(process.cwd(), 'public', 'notion-images', 'collections');

/**
 * 从本地 MD 文件读取上次同步的元信息
 */
function readLocalMeta(pageId: string): { last_edited_time: string | null } | null {
  const filePath = path.join(CONTENT_DIR, `${pageId}.md`);
  if (!fs.existsSync(filePath)) return null;

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const { data } = matter(content);
    return { last_edited_time: data.last_edited_time ?? null };
  } catch {
    return null;
  }
}

/**
 * 判断是否需要更新
 */
function needsUpdate(post: CollectionMetadata): boolean {
  const local = readLocalMeta(post.page_id);
  if (!local) return true;
  return post.last_edited_time !== local.last_edited_time;
}

/**
 * 生成 Collection MD frontmatter + content
 */
function generateCollectionMdContent(meta: CollectionMetadata, content: string): string {
  return `---
title: "${meta.title.replace(/"/g, '\\"')}"
category: "${meta.category}"
tags: [${meta.tags.map((tag) => `"${tag}"`).join(', ')}]
date: "${meta.date}"
status: "${meta.status}"
summary: "${meta.summary.replace(/"/g, '\\"')}"
last_fetch_time: "${meta.last_fetch_time}"
last_edited_time: "${meta.last_edited_time}"
page_id: "${meta.page_id}"
---

${content}`;
}

/**
 * 将 Notion 页面转换为 Markdown
 */
export async function toLocalMarkdown(posts: CollectionMetadata[]) {
  if (!fs.existsSync(CONTENT_DIR)) {
    fs.mkdirSync(CONTENT_DIR, { recursive: true });
  }
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
  }

  let updated = 0;
  let skipped = 0;

  for (const post of posts) {
    try {
      if (!needsUpdate(post)) {
        skipped++;
        console.log(`⊘ Skipped (up-to-date): ${post.title}`);
        continue;
      }

      console.log(`→ Fetching: ${post.title}`);

      const markdown = await fetchPagePureMdContent(post);
      if (!markdown) {
        console.error(`✗ No content returned for: ${post.title}`);
        continue;
      }

      const processedMarkdown = await downloadAndReplaceImages(
        markdown,
        IMAGES_DIR,
        post.page_id,
      );

      const now = new Date().toISOString();
      const postWithFetchTime = { ...post, last_fetch_time: now };

      const fullContent = generateCollectionMdContent(postWithFetchTime, processedMarkdown);

      const fileName = `${post.page_id}.md`;
      const filePath = path.join(CONTENT_DIR, fileName);

      fs.writeFileSync(filePath, fullContent, 'utf-8');
      console.log(`✓ Saved: ${fileName}`);
      updated++;
    } catch (error) {
      console.error(`✗ Failed to process collection "${post.title}":`, error);
    }
  }

  console.log(`\nDone: ${updated} updated, ${skipped} skipped, ${posts.length} total`);
}
