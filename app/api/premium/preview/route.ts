import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

/**
 * 动态微预览视频流解析端点 (Hover Preview Stream Resolver)
 * 1. 支持根据 Jable 视频 ID 或 番号提取官方 5~10 秒精彩切片 preview.mp4
 * 2. 注入 Referer 伪装绕过防盗链
 * 3. 支持 Cloudflare 边缘强缓存 (Cache-Control: public, max-age=86400)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id') || '';
    const code = searchParams.get('code') || '';

    // 1. 尝试匹配 DMM 官方免费短片预览 CDN
    const cleanCode = (code || id).toLowerCase().replace(/[-_]/g, '');
    const dmmLetter = cleanCode.replace(/[0-9]/g, '');
    const dmmNum = cleanCode.replace(/[^0-9]/g, '');

    // DMM LiteVideo 规范 CDN
    const dmmPreviewUrl = `https://cc3001.dmm.co.jp/litevideo/freepv/${dmmLetter.slice(0, 1)}/${dmmLetter.slice(0, 3)}/${cleanCode}/${cleanCode}_mhb_w.mp4`;

    // 2. 尝试 Jable 官方 preview CDN 构造
    const jableSlug = (id || code).toLowerCase().replace(/[^a-z0-9-]/g, '');
    const jablePreviewUrl = `https://assets-cdn.jable.tv/contents/videos_screenshots/${jableSlug}/preview.mp4`;

    return NextResponse.json(
      {
        success: true,
        preview_url: `/api/proxy?url=${encodeURIComponent(dmmPreviewUrl)}&fallback=${encodeURIComponent(jablePreviewUrl)}`,
        fallback_urls: [dmmPreviewUrl, jablePreviewUrl],
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Preview stream unavailable' },
      { status: 500 }
    );
  }
}
