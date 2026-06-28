import { fetchByType } from './lib/article-utils';
import { createMdHandler } from './lib/md-handler';
import type { PostMetadata } from './types';

/** 独立页面（简历 + 友情链接 + 书影音）→ content/pages */
const handler = createMdHandler<PostMetadata>({
  contentDir: 'content/pages',
  media: { mediaDir: 'public/notion-images/pages', mediaUrlPath: '/notion-images/pages' },
  getFileKey: (item) => item.slug,
  generateContent: (meta, content) => {
    const fm: string[] = [];
    fm.push(`title: "${meta.title.replace(/"/g, '\\"')}"`);
    fm.push(`slug: "${meta.slug}"`);
    fm.push(`date: "${meta.date}"`);
    fm.push(`page_id: "${meta.page_id}"`);
    fm.push(`last_edited_time: "${meta.last_edited_time}"`);
    fm.push(`last_fetch_time: "${meta.last_fetch_time}"`);
    fm.push(`type: "${meta.type}"`);
    return `---\n${fm.join('\n')}\n---\n\n${content}`;
  },
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
