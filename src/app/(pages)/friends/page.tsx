import type { Metadata } from 'next';
import path from 'path';
import Comment from '@/components/ui/Comment';
import { EmptyShower } from '@/components/ui/EmptyShower';
import MarkdownRenderer from '@/components/ui/MarkdownRenderer';
import { PageHero } from '@/components/ui/PageHero';
import { parseMdFromFile } from '@/libs/content-supports';
import { siteConfig } from '@/site.config';

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
        <PageHero title="友情链接" />

        <EmptyShower />
      </div>
    );
  }

  return (
    <div className="py-8 space-y-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-normal">友情链接</h1>
      </header>
      <MarkdownRenderer
        content={fileContent.content}
        className="text-base 2xl:text-lg"
      />

      {/* 互换友链、留言咨询：Giscus 按 pathname 建独立讨论区，无需额外配置 */}
      {siteConfig.giscus.enabled && <Comment />}
    </div>
  );
}
