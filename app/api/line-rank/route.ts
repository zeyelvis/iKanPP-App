import { NextRequest, NextResponse } from 'next/server';
import { kvGet } from '@/lib/server/kv';


/**
 * 地区自适应线路质量排行与连通率接口 (Line Rank API)
 * 根据访问者 IP 所在国家返回近 7 天学习所得的线路平滑成功率与首选权重
 */
export async function GET(request: NextRequest) {
  try {
    const country = (request.headers.get('cf-ipcountry') || 'XX').toUpperCase();

    // 并行拉取该国线路画像与全球汇总基准
    const [countryRaw, globalRaw] = await Promise.all([
      kvGet(`line-rank:${country}`),
      kvGet('line-rank:*'),
    ]);

    let countryStats: Record<string, { ok: number; fail: number }> = {};
    let globalStats: Record<string, { ok: number; fail: number }> = {};

    if (countryRaw) {
      try {
        countryStats = JSON.parse(countryRaw);
      } catch {}
    }
    if (globalRaw) {
      try {
        globalStats = JSON.parse(globalRaw);
      } catch {}
    }

    return NextResponse.json(
      {
        success: true,
        country,
        countryStats,
        globalStats,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch {
    return NextResponse.json(
      { success: false, countryStats: {}, globalStats: {} },
      { status: 200 }
    );
  }
}
