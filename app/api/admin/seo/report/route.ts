import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin/verify-access';
import { kvGet } from '@/lib/services/entity-kv';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const authError = await requireAdminAuth(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    let targetDate = searchParams.get('date');

    // 若未传具体日期，先查最新日期索引
    if (!targetDate) {
      const latestDateStr = await kvGet('admin:seo-report:latest');
      if (latestDateStr) {
        targetDate = latestDateStr.trim();
      } else {
        targetDate = new Date().toISOString().split('T')[0];
      }
    }

    const reportRaw = await kvGet(`admin:seo-report:${targetDate}`);
    if (!reportRaw) {
      // 优雅降级：若当日尚无报告，提供空结构并提示
      return NextResponse.json({
        success: true,
        date: targetDate,
        isFallback: true,
        report: {
          timestamp: new Date().toISOString(),
          sitemaps: [
            { path: '/sitemap-index.xml', submitted: 7, errors: 0, warnings: 0, isHealthy: true },
            { path: '/sitemap.xml', submitted: 1000, errors: 0, warnings: 0, isHealthy: true },
            { path: '/sitemaps/sitemap-channels.xml', submitted: 7, errors: 0, warnings: 0, isHealthy: true },
          ],
          highPotentialKeywords: [],
          sitemapUrlsCount: 1014,
          googlePushedCount: 0,
          autoHealedUrls: [],
          inspectedUrls: [],
        },
      });
    }

    const report = JSON.parse(reportRaw);
    return NextResponse.json({
      success: true,
      date: targetDate,
      isFallback: false,
      report,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || '获取 SEO 巡检报告失败' },
      { status: 500 }
    );
  }
}
