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
      next: { revalidate: 300 }, // 边缘缓存 5 分钟
    });

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: `Upstream error: ${res.status}` },
        { status: 502 }
      );
    }

    const html = await res.text();
    // 提取 playUrl = '...'
    const match = html.match(/playUrl\s*=\s*'([^']+)'/);

    if (!match || !match[1]) {
      return NextResponse.json(
        { success: false, error: 'Live stream not found or requires authentication' },
        { status: 404 }
      );
    }

    let playPath = match[1];
    let embedUrl = playPath.startsWith('/') ? `https://huaren.live${playPath}` : playPath;

    // 返回经过认证可播放的嵌入 URL
    return NextResponse.json(
      {
        success: true,
        liveId,
        embedUrl,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
