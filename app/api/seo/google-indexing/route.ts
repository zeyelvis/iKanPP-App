import { NextRequest, NextResponse } from 'next/server';
import { batchPublishGoogleIndexing, publishGoogleIndexingUrl } from '@/lib/services/google-indexing';

export const runtime = 'edge';

const CRON_SECRET = process.env.CRON_SECRET;

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  const secretParam = req.nextUrl.searchParams.get('secret');

  // 鉴权保护：缺失 CRON_SECRET 或 token 不匹配时 100% Fail-Closed
  if (!CRON_SECRET || (token !== CRON_SECRET && secretParam !== CRON_SECRET)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const urls = Array.isArray(body.urls) ? body.urls : (body.url ? [body.url] : []);
    
    if (urls.length === 0) {
      return NextResponse.json({ error: 'Missing urls parameter in request body' }, { status: 400 });
    }

    // 🌟 Google 官方铁律：普通影视页面坚决阻断，防止全站因 API 滥用被降权
    const liveUrls = urls.filter((u: string) => typeof u === 'string' && u.includes('/live/'));
    if (liveUrls.length === 0) {
      return NextResponse.json({
        error: 'Google Indexing API is strictly reserved for BroadcastEvent / JobPosting. Ordinary titles must rely on XML Sitemap and IndexNow.',
        rejectedUrls: urls,
      }, { status: 400 });
    }

    const type = body.type === 'URL_DELETED' ? 'URL_DELETED' : 'URL_UPDATED';

    if (liveUrls.length === 1) {
      const result = await publishGoogleIndexingUrl(liveUrls[0], type, { isLiveBroadcast: true });
      return NextResponse.json(result);
    }

    const batchResult = await batchPublishGoogleIndexing(liveUrls, body.maxCount || 50);
    return NextResponse.json(batchResult);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 });
  }
}
