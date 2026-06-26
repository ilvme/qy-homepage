import 'dotenv/config';

/**
 * 统一同步脚本入口
 * 按顺序执行所有 Notion 数据同步任务
 *
 * 用法：
 *   tsx scripts/fetch-all.ts         # 同步所有内容
 *   tsx scripts/fetch-all.ts --force # 强制全量同步（忽略增量检查）
 */

import { main as fetchArticles } from './articles-fetcher';
import { main as fetchPages } from './pages-fetcher';
import { main as fetchShares } from './shares-fetcher';
import { main as fetchWords } from './words-fetcher';

const forceMode = process.argv.includes('--force');

if (forceMode) {
  // 设置环境变量，各 fetcher 可根据此跳过增量检查
  process.env.FORCE_SYNC = 'true';
  console.log('⚡ Force sync mode enabled\n');
}

async function main() {
  const start = Date.now();
  console.log('═══════════════════════════════════════');
  console.log(' Notion → Local Sync');
  console.log('═══════════════════════════════════════\n');

  const tasks = [
    { name: 'Articles', fn: fetchArticles },
    { name: 'Pages', fn: fetchPages },
    { name: 'Shares', fn: fetchShares },
    { name: 'Words', fn: fetchWords },
  ];

  for (const task of tasks) {
    console.log(`\n─────────────────────────────────────`);
    console.log(` Syncing: ${task.name}`);
    console.log(`─────────────────────────────────────`);
    try {
      await task.fn();
    } catch (error) {
      console.error(`✗ Failed to sync ${task.name}:`, error);
    }
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(2);
  console.log(`\n═══════════════════════════════════════`);
  console.log(` Done in ${elapsed}s`);
  console.log('═══════════════════════════════════════\n');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
