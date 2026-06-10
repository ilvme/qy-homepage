export type PostMetadata = {
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
};
