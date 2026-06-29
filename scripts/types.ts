export interface PageMetadata {
  page_id: string;
  last_edited_time: string;
  last_fetched_time: string | null;
  title: string;
  tags: string[];
  date: string;
  status: string;
}

export interface PostMetadata extends PageMetadata {
  cover?: string;
  icon?: string;
  type: string;
  slug: string;
  category: string;
  summary?: string;
}

export interface ShareMetadata extends PostMetadata {
  author?: string;
  link?: string;
}

export interface WordMetadata extends PageMetadata {
  from: string;
}
