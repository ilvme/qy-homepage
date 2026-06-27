import type { Metadata } from 'next';
import path from 'path';
import MarkdownRenderer from '@/components/ui/MarkdownRenderer';
import { parseMdFromFile } from '@/libs/content-supports';

export const metadata: Metadata = {
  title: '友情链接',
  description: '那些在数字世界中相遇的朋友们',
};

export default async function FriendsPage() {
  const CONTENT_DIR = path.resolve(process.cwd(), 'content');
  const filePath = path.join(CONTENT_DIR, 'pages', 'friends.md');
  const fileContent = parseMdFromFile(filePath, true);
  if (!fileContent?.content) {
    return (
      <div className="py-8 space-y-8">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">友情链接</h1>
        </header>
        <div className="py-16 text-center text-secondary">
          <p className="text-4xl mb-4">🤝</p>
          <p>暂无内容</p>
          <p className="text-xs mt-2">
            请在 Notion 中配置「友情链接」页面后拉取。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">友情链接</h1>
      </header>
      <MarkdownRenderer content={fileContent.content} className="text-base lg:text-lg" />
    </div>
  );
}
