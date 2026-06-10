import { fetchAllPages, postsToMarkdown } from "./notion";
import type { PostMetadata } from "./types";

async function main() {
  if (!process.env.NOTION_ARTICLES_DATABASE_ID) {
    console.error(
      "Error: NOTION_ARTICLES_DATABASE_ID is not set in .env.local",
    );
    process.exit(1);
  }

  console.log("Fetching posts from Notion...");
  const posts = await fetchAllPages(process.env.NOTION_ARTICLES_DATABASE_ID);

  if (!posts || posts.length === 0) {
    console.log("No posts found.");
    return;
  }

  console.log(`Found ${posts.length} posts...\n`);

  const updates: PostMetadata[] = [];

  // 添加逻辑，判断是否需要更新，判断逻辑如下：
  // 1. 和本地 /content/post 下所有文件进行对比，如果本地不存在，则更新
  // 2. 判断 post 的 last_fetch_time 是否存在，不存在，则更新
  // 3. 如果 last_fetch_time 存在，判断 post 的 updated_time 是否比 last_fetch_time 大，如果大，则更新

  await postsToMarkdown(posts);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
