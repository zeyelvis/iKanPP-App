/**
 * 瓜子影视 (gz360.tv) API 路由
 *
 * 功能：
 * - GET /api/gz360?q=关键词&page=1 — 搜索
 * - GET /api/gz360?id=113276 — 获取视频详情（含完整分集 m3u8 直链）
 * - GET /api/gz360?hot=1 — 获取热搜榜
 */

import { NextRequest, NextResponse } from 'next/server';
import { searchGz360, getGz360Detail, getGz360HotSearch } from '@/lib/server/gz360';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || searchParams.get('keyword');
  const id = searchParams.get('id');
  const hot = searchParams.get('hot');
  const page = parseInt(searchParams.get('page') || '1', 10);

  try {
    // 1. 视频详情直出
    if (id) {
      const detail = await getGz360Detail(id);
      if (!detail) {
        return NextResponse.json(
          { success: false, error: '未找到该影片信息' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: detail });
    }

    // 2. 搜索
    if (query) {
      const result = await searchGz360(query, page);
      return NextResponse.json({
        success: true,
        data: {
          list: result.results,
          total: result.total,
          page,
        },
      });
    }

    // 3. 热搜榜
    if (hot) {
      const hotData = await getGz360HotSearch();
      if (!hotData) {
        return NextResponse.json(
          { success: false, error: '热搜数据获取失败' },
          { status: 500 }
        );
      }
      return NextResponse.json({ success: true, data: hotData });
    }

    return NextResponse.json(
      { success: false, error: '缺少参数: q (搜索) 或 id (详情) 或 hot=1 (热搜)' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('[gz360 route] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || '内部错误' },
      { status: 500 }
    );
  }
}
