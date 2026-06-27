import { fetchByType } from './lib/article-utils';
import { createMdHandler } from './lib/md-handler';
import type { PostMetadata } from './types';

/**
 * 生成独立页面的 MD 文件内容（精简 frontmatter）
 */
function generatePageMdContent(pageMeta: PostMetadata, content: string) {
  return `---
title: "${pageMeta.title.replace(/"/g, '\\"')}"
slug: "${pageMeta.slug}"
date: "${pageMeta.date}"
page_id: "${pageMeta.page_id}"
last_edited_time: "${pageMeta.last_edited_time}"
last_fetch_time: "${pageMeta.last_fetch_time}"
type: "${pageMeta.type}"
---

${content}`;
}

/** 独立页面（简历 + 友情链接 + 书影音）→ content/pages */
const handler = createMdHandler<PostMetadata>({
  contentDir: 'content/pages',
  media: { mediaDir: 'public/notion-images/pages', mediaUrlPath: '/notion-images/pages' },
  getFileKey: (item) => item.slug,
  generateContent: generatePageMdContent,
});

export async function fetchPages() {
  await fetchByType('page', handler, 'Pages');
}

export async function main() {
  await fetchPages();
}

// 支持独立运行
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
