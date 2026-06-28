import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const auth = request.headers.get('authorization');
  const secret = process.env.PUBLISH_SECRET;
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const hook = process.env.VERCEL_DEPLOY_HOOK;
  if (!hook) {
    return NextResponse.json(
      { error: 'VERCEL_DEPLOY_HOOK not configured' },
      { status: 500 },
    );
  }

  try {
    const res = await fetch(hook, { method: 'POST' });
    if (!res.ok) {
      return NextResponse.json(
        { error: `Deploy hook returned ${res.status}` },
        { status: 500 },
      );
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
