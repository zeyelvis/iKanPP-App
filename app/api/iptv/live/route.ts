import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const liveId = searchParams.get('id') || '538';

  try {
    const targetUrl = `https://huaren.live/liveplay/${liveId}-1.html`;
    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': USER_AGENT,
        'Referer': 'https://huaren.live/',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: `上游服务响应异常: ${res.status}` },
        { status: 502 }
      );
    }

    const html = await res.text();
    // 提取 playUrl = '...'
    const match = html.match(/playUrl\s*=\s*'([^']+)'/);

    if (!match || !match[1]) {
      return NextResponse.json(
        { success: false, error: '该频道暂未开通或正在维护中' },
        { status: 404 }
      );
    }

    let playPath = match[1];
    let embedUrl = playPath.startsWith('/') ? `https://huaren.live${playPath}` : playPath;

    return NextResponse.json(
      {
        success: true,
        liveId,
        embedUrl,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '服务器网络波动，请稍后刷新重试';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
