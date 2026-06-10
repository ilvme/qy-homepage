import { fetchAllPages, postsToMarkdown } from "./notion";

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

  await postsToMarkdown(posts);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
