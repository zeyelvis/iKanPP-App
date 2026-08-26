import { NextRequest, NextResponse } from 'next/server';
import { fetchHuarenHomepage, extractHuarenPlayUrl } from '@/lib/server/huaren-scraper';

export const runtime = 'nodejs'; // 需要 Node.js runtime 才能做服务端 HTML 解析

/**
 * GET /api/huaren?mode=home           → 返回首页所有板块真实数据
 * GET /api/huaren?mode=play&id=201103 → 返回 vodId 对应的播放流地址
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('mode') || 'home';

  try {
    if (mode === 'play') {
      // 提取播放 URL
      const vodId = searchParams.get('id');
      if (!vodId) {
        return NextResponse.json({ error: '缺少 vodId 参数' }, { status: 400 });
      }
      const playUrl = await extractHuarenPlayUrl(vodId);
      return NextResponse.json({ vodId, playUrl });
    }

    // 默认: 返回首页板块数据
    const sections = await fetchHuarenHomepage();
    return NextResponse.json(
      { sections, ts: Date.now() },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
        },
      }
    );
  } catch (err) {
    console.error('[api/huaren] 异常:', err);
    return NextResponse.json({ error: '华人专区数据加载失败', sections: [] }, { status: 500 });
  }
}
