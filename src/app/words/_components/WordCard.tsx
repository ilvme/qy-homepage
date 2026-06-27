import dayjs from 'dayjs';
import WordImageGrid from '@/app/words/_components/WordImageGrid';
import MarkdownRenderer from '@/components/ui/MarkdownRenderer';
import type { WordMetadata } from '../../../../scripts/types';
import 'dayjs/locale/zh-cn';

dayjs.locale('zh-cn');

interface WordCardProps {
  post: {
    postMeta: WordMetadata;
    content: string;
  };
}

/**
 * 格式化日期为更友好的显示格式：2026/6/12 14:30 周五
 */
function formatDate(dateStr: string): string {
  return dayjs(dateStr).format('YYYY/M/D HH:mm ddd');
}

export default async function WordCard({ post }: WordCardProps) {
  const { images, cleanedContent } = extractImagesFromMdx(post.content);
  const hasContent = cleanedContent.length > 0;

  const waitToRender = hasContent ? cleanedContent : post.postMeta.title;

  // 获取并格式化显示日期
  const dateStr = post.postMeta.date || post.postMeta.last_edited_time || '';
  const displayDate = formatDate(dateStr);

  return (
    <article className="border border-border rounded-xl p-5 mb-4 bg-card">
      <section className="flex items-center flex-wrap justify-between gap-y-2 text-secondary">
        <div className="flex items-center gap-x-4 flex-wrap gap-y-2">
          <time dateTime={dateStr} className="flex items-center gap-2">
            {/* 日历图标 */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="shrink-0 text-muted-foreground"
            >
              <title>日期</title>
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
              <line x1="16" x2="16" y1="2" y2="6" />
              <line x1="8" x2="8" y1="2" y2="6" />
              <line x1="3" x2="21" y1="10" y2="10" />
            </svg>
            <span className="font-medium">{displayDate}</span>
          </time>
          {post.postMeta.tags.length > 0 && (
            <div className="flex gap-2">
              {post.postMeta.tags.map((tag) => (
                <span key={tag} className="text-sm">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
        {post.postMeta.from && (
          <span className="text-sm px-2 py-0.5 rounded-full bg-muted">
            来自: {post.postMeta.from}
          </span>
        )}
      </section>

      <hr className="mb-3 mt-2 border-border" />

      <div>
        <MarkdownRenderer
          content={waitToRender ?? ''}
          highlight={false}
          slug={false}
          className="text-base 2xl:text-lg"
        />
      </div>

      <WordImageGrid images={images} />
    </article>
  );
}

const IMAGE_REGEX = /!\[([^\]]*)\]\(([^)]+)\)/g;

function extractImagesFromMdx(content: string): {
  images: string[];
  cleanedContent: string;
} {
  const images: string[] = [];

  const withoutImages = content.replace(IMAGE_REGEX, (_, _alt, url: string) => {
    images.push(url.trim());
    return '';
  });

  // Collapse 3+ consecutive newlines into 2 (one blank line)
  const cleanedContent = withoutImages.replace(/\n{3,}/g, '\n\n').trim();

  // 判断是否有实质文字内容：去掉所有 HTML 标签后检查
  const hasText = cleanedContent.replace(/<[^>]+>/g, '').trim().length > 0;

  return { images, cleanedContent: hasText ? cleanedContent : '' };
}
