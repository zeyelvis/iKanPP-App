import { NextRequest, NextResponse } from 'next/server';
import { batchPublishGoogleIndexing, publishGoogleIndexingUrl } from '@/lib/services/google-indexing';

export const runtime = 'edge';

const CRON_SECRET = process.env.CRON_SECRET || 'ikanpp-cron-sync-secret';

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  const secretParam = req.nextUrl.searchParams.get('secret');

  // 鉴权保护
  if (token !== CRON_SECRET && secretParam !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const urls = Array.isArray(body.urls) ? body.urls : (body.url ? [body.url] : []);
    
    if (urls.length === 0) {
      return NextResponse.json({ error: 'Missing urls parameter in request body' }, { status: 400 });
    }

    const type = body.type === 'URL_DELETED' ? 'URL_DELETED' : 'URL_UPDATED';

    if (urls.length === 1) {
      const result = await publishGoogleIndexingUrl(urls[0], type);
      return NextResponse.json(result);
    }

    const batchResult = await batchPublishGoogleIndexing(urls, body.maxCount || 50);
    return NextResponse.json(batchResult);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 });
  }
}
