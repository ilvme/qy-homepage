import Link from 'next/link';
import { getAllPosts } from '@/libs/content-loader';
import { parseDate } from '@/libs/content-supports';
import { getAllWords } from '@/libs/words-loader';

const FEED_LIMIT = 4;
const EXCERPT_MAX = 60;

interface FeedItem {
  key: string;
  kind: 'post' | 'word';
  href: string;
  title: string;
  date: string;
}

const IMAGE_REGEX = /!\[[^\]]*\]\([^)]*\)/g;

/** 说说没有标题，取正文纯文本开头作为条目文本 */
function toExcerpt(md: string): string {
  const text = md
    .replace(IMAGE_REGEX, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_~|`]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > EXCERPT_MAX ? `${text.slice(0, EXCERPT_MAX)}…` : text;
}

/** 首页时间流：文章与说说混排，按日期倒序取最近若干条 */
export default async function HomeFeed() {
  const [posts, words] = await Promise.all([getAllPosts(), getAllWords()]);

  const postItems: FeedItem[] = posts
    .filter((post) => post.status === 'published')
    .map((post) => ({
      key: `post-${post.slug}`,
      kind: 'post',
      href: `/posts/${post.slug}`,
      title: post.title,
      date: post.date ?? '',
    }));

  // 说说按时间倒序排列，最近几条必在 /words 第一页，直接落列表即可
  const wordItems: FeedItem[] = words
    .map((word) => ({
      key: `word-${word.postMeta.page_id}`,
      kind: 'word' as const,
      href: '/words',
      title: toExcerpt(word.content) || word.postMeta.title,
      date: word.postMeta.date ?? '',
    }))
    .filter((item) => item.title);

  const items = [...postItems, ...wordItems]
    .sort((a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime())
    .slice(0, FEED_LIMIT);

  if (items.length === 0) return null;

  return (
    <ul className="">
      {items.map((item) => (
        <li key={item.key}>
          <Link href={item.href} className="group flex items-center gap-2 py-2">
            <span className="shrink-0 text-xs text-muted-foreground">
              {item.kind === 'post' ? '文章' : '说说'}
            </span>
            <span className="min-w-0 flex-1 truncate text-sm text-foreground transition-colors group-hover:text-brand">
              {item.title}
            </span>
            <time
              dateTime={item.date}
              className="shrink-0 text-xs text-muted-foreground tabular-nums"
            >
              {item.date.slice(5, 10)}
            </time>
          </Link>
        </li>
      ))}
    </ul>
  );
}
