import type { Metadata } from 'next';
import path from 'path';
import BlogBadges from '@/components/ui/BlogBadges';
import Comment from '@/components/ui/Comment';
import { EmptyShower } from '@/components/ui/EmptyShower';
import MarkdownRenderer from '@/components/ui/MarkdownRenderer';
import { PageHero } from '@/components/ui/PageHero';
import { parseMdFromFile } from '@/libs/content-supports';
import { getNavTitle, siteConfig } from '@/site.config';

export const metadata: Metadata = {
  // 顶栏导航用「友链」，页面此前写「友情链接」，两处漂移；统一取导航文案
  title: getNavTitle('/friends'),
  description: '那些在数字世界中相遇的朋友们',
};

export default async function FriendsPage() {
  const navTitle = getNavTitle('/friends');
  const CONTENT_DIR = path.resolve(process.cwd(), 'content');
  const filePath = path.join(CONTENT_DIR, 'pages', 'friends.md');
  const fileContent = parseMdFromFile(filePath, true);
  if (!fileContent?.content) {
    return (
      <div className="py-8 space-y-8">
        <PageHero title={navTitle} />

        <EmptyShower />
      </div>
    );
  }

  return (
    <div className="py-8 space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-normal">{navTitle}</h1>
      </header>

      <MarkdownRenderer
        content={fileContent.content}
        className="text-base 2xl:text-lg"
      />

      <BlogBadges className="mt-4" label="" />

      {/* 互换友链、留言咨询：Giscus 按 pathname 建独立讨论区。标题由组件渲染，
          不再写在 Notion 内容里——原先的 md h2 与评论组件只靠位置相邻凑成一节 */}
      {siteConfig.giscus.enabled && <Comment title="留言板" />}
    </div>
  );
}
