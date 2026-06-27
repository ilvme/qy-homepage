import { Client } from '@notionhq/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // 1. 鉴权
  const auth = request.headers.get('authorization');
  const secret = process.env.PUBLISH_SECRET;
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. 解析请求
  let body: { text?: string; tags?: string[]; from?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const text = body.text?.trim();
  if (!text) {
    return NextResponse.json({ error: 'text is required' }, { status: 400 });
  }

  const tags = body.tags ?? [];
  const from = body.from ?? 'Web';

  // 3. 校验环境变量
  const token = process.env.NOTION_TOKEN;
  const databaseId = process.env.NOTION_WORDS_DATABASE_ID;
  if (!token || !databaseId) {
    return NextResponse.json(
      { error: 'Server config missing' },
      { status: 500 },
    );
  }

  // 4. 写入 Notion（2026 API：通过 data_source 层）
  const notion = new Client({ auth: token });

  let pageId: string;
  try {
    // 先获取 data_source_id
    const db = (await notion.databases.retrieve({
      database_id: databaseId,
    })) as any;
    const dataSourceId = db.data_sources?.[0]?.id;
    if (!dataSourceId) {
      return NextResponse.json(
        { error: 'No data source found' },
        { status: 500 },
      );
    }

    const page = await notion.pages.create({
      parent: { data_source_id: dataSourceId },
      properties: {
        title: { title: [{ text: { content: text } }] },
        // date: { date: { start: now } },
        status: { select: { name: 'published' } },
        from: { select: { name: from } },
        tags: { multi_select: tags.map((t) => ({ name: t })) },
      },
    });
    pageId = page.id;
  } catch (error: any) {
    console.error('Notion API error:', error);
    return NextResponse.json(
      { error: 'Failed to create page', detail: error.message },
      { status: 500 },
    );
  }

  // 5. 触发部署（fire-and-forget，失败也不影响已写入的 Notion 数据）
  const deployHook = process.env.VERCEL_DEPLOY_HOOK;
  if (deployHook) {
    fetch(deployHook, { method: 'POST' }).catch((e) =>
      console.error('Deploy hook failed:', e),
    );
  }

  return NextResponse.json({ ok: true, page_id: pageId });
}
