export interface PostMetadata {
  page_id: string;
  last_edited_time: string;
  cover?: string;
  icon?: string;

  title: string;
  type: string;
  slug: string;
  category: string;
  tags: string[];
  date: string;
  summary?: string;
  status: string;
  last_fetch_time: string | null;
}

export interface WordMetadata {
  page_id: string;
  last_edited_time: string;
  last_fetch_time: string | null;

  from: string;

  title: string;
  tags: string[];
  date: string;
  status: string;
}

export interface MediaMetadata {
  page_id: string;
  last_edited_time: string;
  last_fetch_time: string | null;

  title: string;
  /** 书 / 电影 / 音乐 */
  type: string;
  /** 作者/导演/艺术家 */
  creator: string;
  /** 评分 1-5 */
  rating: number;
  /** 已读/在读/想读 等状态 */
  status: string;
  date: string;
  tags: string[];
  /** 封面 URL */
  cover: string;
  /** 个人评论/感想 */
  comment: string;
  /** 豆瓣/外部链接 */
  link: string;
}

export interface CollectionMetadata {
  page_id: string;
  last_edited_time: string;
  last_fetch_time: string | null;

  title: string;
  /** 分类：知识点 / 传统文化 / etc. */
  category: string;
  tags: string[];
  date: string;
  status: string;
  summary: string;
}
