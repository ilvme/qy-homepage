import "dotenv/config";
import { Client } from "@notionhq/client";
import fs from "fs";
import path from "path";
import type { PostMetadata } from "./types";

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

export async function fetchAllPages(
  databaseId: string,
): Promise<PostMetadata[] | undefined> {
  // 1. 获取数据源ID
  const dbs = await notion.databases.retrieve({
    database_id: databaseId,
  });

  if (!dbs.data_sources || dbs.data_sources.length === 0) {
    console.error("No data sources found for this database.");
    return;
  }

  // 2. 选择数据源（如果数据库内有多个数据源，可能需要逻辑选择，这里取第一个）
  const dataSourceId = dbs.data_sources[0].id;

  // 3. 递归查询数据源，获取所有文章页面（处理分页）
  // 注意：Notion API 每次最多返回 100 条，需要使用 start_cursor 分页获取
  const allResults: any[] = [];
  let startCursor: string | undefined;

  do {
    const response = await notion.dataSources.query({
      data_source_id: dataSourceId,
      filter: {
        property: "status",
        select: { equals: "published" },
      },
      sorts: [{ property: "date", direction: "descending" }],
      start_cursor: startCursor,
      page_size: 100, // 每次最多获取 100 条
    });

    allResults.push(...response.results);
    startCursor = response.next_cursor || undefined;

    console.log(
      `Fetched ${response.results.length} posts, total: ${allResults.length}`,
    );
  } while (startCursor);

  return allResults.map((page) => {
    return {
      page_id: page.id,
      last_edited_time: page.last_edited_time,
      cover: page.cover?.external?.url,
      icon: page.icon?.external?.url,

      title: page.properties.title.title[0].plain_text,
      type: page.properties.type.select?.name,
      slug: page.properties.slug.rich_text[0].plain_text,
      category: page.properties.category.select?.name,
      tags: page.properties.tags.multi_select.map((tag) => tag.name),
      date: page.properties.date.date?.start,
      summary: page.properties.summary.rich_text[0]?.plain_text,
      status: page.properties.status.select?.name,
      last_fetch_time: page.properties.last_fetch_time.date?.start,
    };
  });
}

export async function postsToMarkdown(posts: PostMetadata[]) {
  const contentDir = path.join(process.cwd(), "content", "posts");
  const imagesDir = path.join(process.cwd(), "public", "notion-images");

  // 确保目录存在
  if (!fs.existsSync(contentDir)) {
    fs.mkdirSync(contentDir, { recursive: true });
  }
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  for (const post of posts) {
    try {
      // 4. 遍历页面，获取Markdown内容
      const pageId = post.page_id;
      // 使用新的Markdown接口，直接获取Markdown格式的内容
      const { markdown } = await notion.pages.retrieveMarkdown({
        page_id: pageId,
      });

      // 构建 Frontmatter
      const frontmatter = [
        "---",
        `title: "${post.title.replace(/"/g, '\\"')}"`,
        `slug: "${post.slug}"`,
        `date: "${post.date}"`,
        `category: "${post.category}"`,
        `tags: [${post.tags.map((tag) => `"${tag}"`).join(", ")}]`,
        `status: "${post.status}"`,
        `type: "${post.type}"`,
        `last_fetch_time: "${post.last_fetch_time}"`,
        `last_edited_time: "${post.last_edited_time}"`,
        `page_id: "${pageId}"`,

        post.summary ? `summary: "${post.summary.replace(/"/g, '\\"')}"` : "",
        post.cover ? `cover: "${post.cover}"` : "",
        post.icon ? `icon: "${post.icon}"` : "",
        "---",
        "",
      ]
        // .filter(Boolean)
        .join("\n");

      // 从 markdown 中读取图片链接，并下载图片到 public/notion-images 目录, 并替换 markdown 中的图片链接

      // 组合 Frontmatter 和 Markdown 内容
      const fullContent = `${frontmatter}\n\n${markdown}`;

      // 生成文件名
      const fileName = `${post.slug}.md`;
      const filePath = path.join(contentDir, fileName);

      // 写入文件
      fs.writeFileSync(filePath, fullContent, "utf-8");
      console.log(`✓ Saved: ${fileName}`);
    } catch (error) {
      console.error(`✗ Failed to process post "${post.title}":`, error.message);
    }
  }

  console.log(`\nTotal processed: ${posts.length} posts`);
}
