import { createHandler, fetchByType } from './lib/article-utils';

/** 分享 → content/shares */
const handler = createHandler(
  'content/shares',
  'public/notion-images/shares',
  '/notion-images/shares',
);

export async function fetchShares() {
  await fetchByType('share', handler, 'Shares');
}

export async function main() {
  await fetchShares();
}

// 支持独立运行
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
