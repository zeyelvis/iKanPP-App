import { NextRequest, NextResponse } from 'next/server';
import { PREMIUM_SOURCES } from '@/lib/api/premium-sources';
import { getVideoDetail } from '@/lib/api/client';

export const runtime = 'edge';

/**
 * 极速动态微预览视频流调度引擎 (Fast Hover Preview Dispatcher)
 * 1. 根据番号/ID/源，在 100ms 内提取出该影片的真实 M3U8/MP4 片段
 * 2. 注入 Proxy 跨域与防盗链伪装
 * 3. 毫秒级缓存，确保卡片悬停极速起播
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id') || '';
    const code = searchParams.get('code') || '';
    const sourceId = searchParams.get('source') || 'hsck';

    // 1. 如果有明确的 sourceId 与 id，直接提取该片详情中的首个播放流
    const sourceConfig = PREMIUM_SOURCES.find(s => s.id === sourceId) || PREMIUM_SOURCES[0];

    if (id && sourceConfig) {
      try {
        const detail = await getVideoDetail(id, sourceConfig);
        const playUrl = detail.episodes?.[0]?.url;

        if (playUrl && playUrl.startsWith('http')) {
          const proxiedUrl = playUrl.includes('.m3u8')
            ? `/api/proxy?url=${encodeURIComponent(playUrl)}`
            : playUrl;

          return NextResponse.json(
            {
              success: true,
              preview_url: proxiedUrl,
              is_m3u8: playUrl.includes('.m3u8'),
            },
            {
              headers: {
                'Cache-Control': 'public, max-age=3600, s-maxage=3600',
              },
            }
          );
        }
      } catch {
        // 忽略单源异常，继续尝试备用方案
      }
    }

    // 2. 尝试 DMM 官方公开预览流
    if (code) {
      const cleanCode = code.toLowerCase().replace(/[-_]/g, '');
      const dmmLetter = cleanCode.replace(/[0-9]/g, '');
      if (dmmLetter.length >= 2) {
        const dmmUrl = `https://cc3001.dmm.co.jp/litevideo/freepv/${dmmLetter.slice(0, 1)}/${dmmLetter.slice(0, 3)}/${cleanCode}/${cleanCode}_mhb_w.mp4`;
        return NextResponse.json({
          success: true,
          preview_url: `/api/proxy?url=${encodeURIComponent(dmmUrl)}`,
          is_m3u8: false,
        });
      }
    }

    return NextResponse.json(
      { success: false, error: 'Preview not found' },
      { status: 404 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Preview internal error' },
      { status: 500 }
    );
  }
}
