/**
 * Detail API Route
 * Fetches video details including episodes and M3U8 URLs with automatic source validation
 */

import { NextRequest, NextResponse } from 'next/server';
import { getVideoDetail } from '@/lib/api/client';
import { getSourceById } from '@/lib/api/video-sources';
import { isSafeExternalUrl } from '@/lib/utils/security';
import { PREMIUM_SOURCES } from '@/lib/api/premium-sources';
import { fetchJableVideoDetail } from '@/lib/server/jable-scraper';
import { fetchIkanbotDetail } from '@/lib/server/ikanbot';


export const runtime = 'edge';

/**
 * Shared handler for fetching video details
 */
async function handleDetailRequest(id: string | null, source: any, method: string, request?: NextRequest, titleParam?: string | null) {
  if (!id) {
    return NextResponse.json(
      { success: false, error: 'Missing video ID parameter' },
      { status: 400 }
    );
  }

  const sourceId = typeof source === 'object' && source !== null ? source.id : source;

  // 1. 专属支持 Jable 原生视频流直解与智能热备
  if (sourceId === 'jable' || !sourceId) {
    try {
      // 提取番号
      const codeMatch = id.match(/([A-Za-z0-9]{2,8}[-_][0-9]{3,8}|FC2[-_]PPV[-_][0-9]{5,8}|T28[-_][0-9]{3,5})/i);
      const videoCode = codeMatch ? codeMatch[0].toUpperCase() : id;

      // 尝试直解 Jable
      const detail = await fetchJableVideoDetail(id);
      if (detail && detail.hlsUrl) {
        const proxiedStreamUrl = detail.hlsUrl.includes('.m3u8')
          ? `/api/proxy?url=${encodeURIComponent(detail.hlsUrl)}&referer=${encodeURIComponent('https://jable.tv/')}`
          : detail.hlsUrl;

        return NextResponse.json({
          success: true,
          data: {
            vod_id: id,
            vod_name: detail.title || titleParam || id,
            vod_pic: detail.cover,
            vod_actor: detail.actors?.join(', ') || '',
            type_name: detail.tags?.join(', ') || '午夜大片',
            episodes: [
              {
                name: '4K 原画',
                url: proxiedStreamUrl,
              }
            ]
          }
        });
      }

      // 若 Jable 直解未果，向 36 大专线发起番号与片名双轨热备
      const origin = request ? request.nextUrl.origin : 'http://localhost:3000';
      const searchQueries = [
        videoCode,
        videoCode ? videoCode.replace(/[-_]/g, '') : '', // 如 JUR-837 -> JUR837
        titleParam ? titleParam.replace(/([A-Za-z0-9]{2,8}[-_][0-9]{3,8})/gi, '').replace(/[《》【】\[\]（）()·\s:：\-]/g, ' ').trim().slice(0, 15) : ''
      ].filter(Boolean);

      let matchedVideos: any[] = [];

      for (const query of searchQueries) {
        const fallbackRes = await fetch(`${origin}/api/premium/category`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sources: PREMIUM_SOURCES,
            category: query,
            page: '1',
            limit: '5'
          })
        });

        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          if (fallbackData.videos && fallbackData.videos.length > 0) {
            matchedVideos = fallbackData.videos;
            break;
          }
        }
      }

        for (const matched of matchedVideos.slice(0, 3)) {
          // 1. 如果已有完整的 vod_play_url，直接提取
          if (matched && matched.vod_play_url) {
            const playList = matched.vod_play_url.split('#');
            const firstEp = playList[0];
            const rawUrl = firstEp.includes('$') ? firstEp.split('$')[1] : firstEp;

            if (rawUrl && rawUrl.startsWith('http')) {
              const proxiedUrl = rawUrl.includes('.m3u8')
                ? `/api/proxy?url=${encodeURIComponent(rawUrl)}`
                : rawUrl;

              return NextResponse.json({
                success: true,
                data: {
                  vod_id: String(matched.vod_id),
                  vod_name: matched.vod_name || id,
                  vod_pic: matched.vod_pic,
                  vod_actor: matched.vod_actor || '',
                  type_name: matched.type_name || '4K 蓝光',
                  episodes: [
                    {
                      name: '4K 极清',
                      url: proxiedUrl,
                    }
                  ],
                  source: matched.source,
                }
              });
            }
          }

          // 2. 搜索列表只有 vod_id 时，调用对应源的 getVideoDetail 拉取真实播放流
          const matchedSourceConfig = PREMIUM_SOURCES.find(s => s.id === matched.source);
          if (matchedSourceConfig && matched.vod_id) {
            try {
              const fullDetail = await getVideoDetail(matched.vod_id, matchedSourceConfig);
              if (fullDetail && fullDetail.episodes && fullDetail.episodes.length > 0) {
                return NextResponse.json({
                  success: true,
                  data: {
                    vod_id: String(matched.vod_id),
                    vod_name: fullDetail.vod_name || matched.vod_name || id,
                    vod_pic: fullDetail.vod_pic || matched.vod_pic,
                    vod_actor: fullDetail.vod_actor || matched.vod_actor || '',
                    type_name: fullDetail.type_name || '4K 蓝光',
                    episodes: fullDetail.episodes.map((ep, idx) => ({
                      name: ep.name || (idx === 0 ? '4K 极清' : `第${idx + 1}集`),
                      url: ep.url.includes('.m3u8')
                        ? `/api/proxy?url=${encodeURIComponent(ep.url)}`
                        : ep.url,
                    })),
                    source: matched.source,
                    source_code: fullDetail.source_code,
                  }
                });
              }
            } catch (detailErr) {
              console.warn(`[DetailAPI] Fallback source ${matched.source} detail fetch failed:`, detailErr);
            }
        }
      }
    } catch (e) {
      console.error('[DetailAPI] Jable stream resolve error:', e);
    }

    return NextResponse.json({
      success: false,
      error: '该影片暂无可用播放流，正在为您调度其他线路...',
    }, { status: 404 });
  }

  // 2. 专属支持 ikanbot 聚合专线直解
  if (sourceId === 'ikanbot' || (typeof sourceId === 'string' && sourceId.startsWith('ikanbot_'))) {
    try {
      const lineFlag = typeof sourceId === 'string' && sourceId.startsWith('ikanbot_')
        ? sourceId.replace('ikanbot_', '')
        : '';
      const detail = await fetchIkanbotDetail(id);
      if (detail && detail.lines.length > 0) {
        const matchedLine = detail.lines.find(l => l.sourceId === sourceId)
          || detail.lines.find(l => l.flag === lineFlag)
          || detail.lines[0];
        if (matchedLine) {
          return NextResponse.json({
            success: true,
            data: {
              vod_id: id,
              vod_name: detail.vod_name,
              vod_pic: detail.vod_pic,
              vod_year: detail.vod_year,
              vod_content: detail.vod_content,
              episodes: matchedLine.episodes,
            }
          });
        }
      }
    } catch (e) {
      console.error('[DetailAPI] ikanbot resolve error:', e);
    }
  }


  // 3. 传统采集源查询
  let sourceConfig;
  if (typeof source === 'object') {
    sourceConfig = source;
  } else {
    sourceConfig = getSourceById(source);
  }

  // 若找不到 sourceConfig，尝试在 PREMIUM_SOURCES 中再查一遍
  if (!sourceConfig) {
    sourceConfig = PREMIUM_SOURCES.find(s => s.id === source || s.name === source);
  }

  if (!sourceConfig || !isSafeExternalUrl(sourceConfig.baseUrl)) {
    return NextResponse.json(
      { success: false, error: '暂未配置该视频线路' },
      { status: 200 }
    );
  }

  try {
    const videoDetail = await getVideoDetail(id, sourceConfig);

    return NextResponse.json({
      success: true,
      data: videoDetail,
    });
  } catch (error) {
    console.error('Detail API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch video detail',
      },
      { status: 200 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const source = searchParams.get('source');
    const title = searchParams.get('title');

    return await handleDetailRequest(id, source, 'GET', request, title);
  } catch (error) {
    console.error('Detail API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, source, title } = body;

    return await handleDetailRequest(id, source, 'POST', request, title);
  } catch (error) {
    console.error('Detail API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
