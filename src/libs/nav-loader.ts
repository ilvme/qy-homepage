import { glob } from 'glob';
import path from 'path';
import { parseMdFromFile } from '@/libs/content-supports';
import type { ShareMetadata } from '../../scripts/types';

export interface NavSite {
  title: string;
  icon: string;
  description: string;
  url: string;
  category: string;
}

export interface NavCategory {
  key: string;
  label: string;
  sites: NavSite[];
}

const SHARES_DIR = path.join(process.cwd(), 'content/shares');

/** 预定义分类展示顺序，未列出的分类追加到末尾 */
const CATEGORY_ORDER = [
  'AI 导航',
  'React 生态',
  'Vue 生态',
  'JavaScript 生态',
  'CSS 生态',
  '跨平台',
  'Java 生态',
  '社区',
  '周刊与博客',
];

export async function getAllNavSites(): Promise<NavCategory[]> {
  const pattern = path.join(SHARES_DIR, '*.md');
  const files = await glob(pattern);

  const sites: NavSite[] = files
    .map((file) => {
      const parsed = parseMdFromFile(file);
      if (!parsed?.postMeta) return null;
      const meta = parsed.postMeta as ShareMetadata;
      if (meta.type !== 'nav') return null;
      return {
        title: meta.title ?? '',
        icon: meta.cover ?? meta.icon ?? '',
        description: meta.summary ?? '',
        url: meta.link ?? '',
        category: meta.category ?? '',
      };
    })
    .filter((s): s is NavSite => s != null && s.title !== '');

  // 按 category 分组
  const categoryMap = new Map<string, NavSite[]>();
  for (const site of sites) {
    const cat = site.category || '其他';
    if (!categoryMap.has(cat)) categoryMap.set(cat, []);
    categoryMap.get(cat)!.push(site);
  }

  // 按预定义顺序输出
  const grouped: NavCategory[] = [];
  for (const cat of CATEGORY_ORDER) {
    const list = categoryMap.get(cat);
    if (list && list.length > 0) {
      grouped.push({ key: cat, label: cat, sites: list });
      categoryMap.delete(cat);
    }
  }

  // 剩余未预定义的分类追加到末尾
  for (const [cat, list] of categoryMap) {
    grouped.push({ key: cat, label: cat, sites: list });
  }

  return grouped;
}
