export interface PageMetadata {
  page_id: string;
  last_edited_time: string;
  last_fetched_time: string | null;
  title: string;
  tags: string[];
  date: string | null;
  status: string;
}

export interface PostMetadata extends PageMetadata {
  cover?: string;
  icon?: string;
  type: string;
  slug: string;
  category: string;
  summary?: string;
  /** 是否开启评论，默认 true。设为 false 则关闭该文章评论 */
  comments?: boolean;
}

export interface ShareMetadata extends PostMetadata {
  author?: string;
  link?: string;
}

export interface WordMetadata extends PageMetadata {
  from: string;
}
