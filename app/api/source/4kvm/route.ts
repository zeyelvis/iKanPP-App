import { NextRequest, NextResponse } from 'next/server';
import { get4kvmMovieDetail, get4kvmStreamUrl } from '@/lib/server/fourk-vm';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || searchParams.get('q');
  const episodeParam = searchParams.get('episode') || searchParams.get('ep');
  const episodeIndex = episodeParam ? parseInt(episodeParam, 10) : 1;

  if (!title) {
    return NextResponse.json(
      { success: false, error: 'Missing title parameter' },
      { status: 400 }
    );
  }

  try {
    const detail = await get4kvmMovieDetail(title);
    if (!detail || detail.episodes.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No matching video found in 4kvm' },
        { status: 404 }
      );
    }

    // 获取当前请求集数的真实播放流
    const streamUrl = await get4kvmStreamUrl(detail, episodeIndex);
    if (!streamUrl) {
      return NextResponse.json(
        { success: false, error: 'Target episode stream not available or requires VIP' },
        { status: 404 }
      );
    }

    // 若客户端要求直接播放流（如 Hls.js 或 video src），直接 302 重定向至真实 m3u8
    const format = searchParams.get('format');
    const wantsRedirect = searchParams.get('redirect') === '1' || format === 'stream';
    if (wantsRedirect) {
      return NextResponse.redirect(streamUrl, {
        status: 302,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=1800',
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        vod_id: `4kvm_${detail.id}`,
        vod_name: detail.title,
        vod_pic: detail.cover,
        source: '4kvm',
        sourceName: '🔥 4K蓝光专线',
        current_episode: episodeIndex,
        stream_url: streamUrl,
        episodes: detail.episodes.map(ep => ({
          name: ep.name,
          index: ep.index,
          dataId: ep.dataId,
          secretKey: ep.secretKey,
          // 选集直链可直接 302 播放
          url: `/api/source/4kvm?title=${encodeURIComponent(detail.title)}&episode=${ep.index}&redirect=1`,
        })),
      },
    });
  } catch (error: any) {
    console.error('[4kvm API Error]:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
