import type { Metadata } from 'next';
import path from 'path';
import { EmptyShower } from '@/components/ui/EmptyShower';
import MarkdownRenderer from '@/components/ui/MarkdownRenderer';
import { parseMdFromFile } from '@/libs/content-supports';

export const metadata: Metadata = {
  title: '关于',
  description: '关于我和这个站点',
};

export default async function AboutMe() {
  const CONTENT_DIR = path.resolve(process.cwd(), 'content');
  const filePath = path.join(CONTENT_DIR, 'pages', 'readme.md');
  const fileContent = parseMdFromFile(filePath, true);
  if (!fileContent?.content) {
    return <EmptyShower />;
  }

  return (
    <MarkdownRenderer
      content={fileContent.content}
      className="text-base lg:text-lg"
    />
  );
}
