/**
 * Detail API Route
 * Fetches video details including episodes and M3U8 URLs with automatic source validation
 */

import { NextRequest, NextResponse } from 'next/server';
import { getVideoDetail, searchVideos } from '@/lib/api/client';
import { getSourceById } from '@/lib/api/video-sources';
import { isSafeExternalUrl } from '@/lib/utils/security';
import { PREMIUM_SOURCES } from '@/lib/api/premium-sources';
import { DEFAULT_SOURCES } from '@/lib/api/default-sources';
import { fetchJableVideoDetail } from '@/lib/server/jable-scraper';
import { fetchIkanbotDetail } from '@/lib/server/ikanbot';
import { parseEpisodes } from '@/lib/api/parsers';

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

  // 1. 专属支持 Jable 原生视频流直解与智能热备（严格限定：显式 jable 源，或无 source 且符合番号规范且非主站 ik 实体）
  const codeMatch = id.match(/([A-Za-z0-9]{2,8}[-_][0-9]{3,8}|FC2[-_]PPV[-_][0-9]{5,8}|T28[-_][0-9]{3,5})/i);
  const isJableExplicit = sourceId === 'jable';
  const isJableSource = isJableExplicit || (!sourceId && !!codeMatch && !id.startsWith('ik'));

  if (isJableSource) {
    try {
      // 提取番号
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
    // 智能自愈防线二：若线路未配置/已废弃，但携带了片名 titleParam，自动从骨干主力源（暴风/巨量/光速）智能自愈拉取！
    if (titleParam && titleParam.trim().length > 0) {
      try {
        const cleanTitle = titleParam.replace(/[《》【】\[\]（）()·\s:：\-]/g, ' ').trim();
        const fallbackSources = DEFAULT_SOURCES.filter(s => s.enabled !== false).slice(0, 3);
        const searchRes = await searchVideos(cleanTitle, fallbackSources, 1);
        for (const res of searchRes) {
          const candidates = res.results || [];
          const matched = candidates.find(c => {
            const cName = (c.vod_name || '').replace(/[《》【】\[\]（）()·\s:：\-]/g, '').toLowerCase();
            const tName = cleanTitle.replace(/\s+/g, '').toLowerCase();
            return cName === tName;
          }) || candidates.find(c => {
            const cName = (c.vod_name || '').replace(/[《》【】\[\]（）()·\s:：\-]/g, '').toLowerCase();
            const tName = cleanTitle.replace(/\s+/g, '').toLowerCase();
            return cName.includes(tName) || tName.includes(cName);
          });

          if (matched && matched.vod_id) {
            const matchedSource = getSourceById(res.source);
            if (matchedSource) {
              const healedDetail = await getVideoDetail(matched.vod_id, matchedSource);
              if (healedDetail && healedDetail.episodes && healedDetail.episodes.length > 0) {
                return NextResponse.json({
                  success: true,
                  data: healedDetail,
                  healed: true,
                  healedSource: matchedSource.id,
                  healedId: matched.vod_id,
                });
              }
            }
          }
        }
      } catch (fallbackHealErr) {
        console.warn(`[DetailAPI] Missing source fallback heal failed for ${titleParam}:`, fallbackHealErr);
      }
    }

    return NextResponse.json(
      { success: false, error: '暂未配置该视频线路' },
      { status: 200 }
    );
  }

  try {
    const videoDetail = await getVideoDetail(id, sourceConfig, titleParam || undefined);

    return NextResponse.json({
      success: true,
      data: videoDetail,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    // 智能自愈：若根据原 ID 获取失败且提供了片名（如历史截断大数 ID、死链或源站升级），以片名发起单源补救搜源
    if (titleParam && titleParam.trim().length > 0) {
      try {
        const cleanTitle = titleParam.replace(/[《》【】\[\]（）()·\s:：\-]/g, ' ').trim();
        const searchRes = await searchVideos(cleanTitle, [sourceConfig], 1);
        const candidates = searchRes[0]?.results || [];

        const isCleanTitleMatch = (candStr: string, tgtStr: string) => {
          if (candStr === tgtStr) return true;
          if (candStr.includes(tgtStr)) return true;
          if (tgtStr.includes(candStr) && Math.abs(tgtStr.length - candStr.length) <= 1) return true;
          return false;
        };

        const matched = candidates.find(c => {
          const cName = (c.vod_name || '').replace(/[《》【】\[\]（）()·\s:：\-]/g, '').replace(/(19\d\d|20\d\d)$/g, '').toLowerCase();
          const tName = cleanTitle.replace(/\s+/g, '').toLowerCase();
          return cName === tName;
        }) || candidates.find(c => {
          const cName = (c.vod_name || '').replace(/[《》【】\[\]（）()·\s:：\-]/g, '').replace(/(19\d\d|20\d\d)$/g, '').toLowerCase();
          const tName = cleanTitle.replace(/\s+/g, '').toLowerCase();
          return isCleanTitleMatch(cName, tName);
        });

        if (matched) {
          const matchedAny = matched as any;
          // 若候选条目已自带播放流（如巨量资源自带完整 vod_play_url），直接解析返回，无需二次调不支持 ids 的接口
          if (matchedAny.vod_play_url) {
            const playFrom = (matchedAny.vod_play_from || '').split('$$$');
            const playUrls = (matchedAny.vod_play_url || '').split('$$$');
            let selectedIndex = 0;
            for (let i = 0; i < playFrom.length; i++) {
              if (playFrom[i].toLowerCase().includes('m3u8') && playUrls[i]?.trim()) {
                selectedIndex = i;
                break;
              }
            }
            const episodes = parseEpisodes(playUrls[selectedIndex] || '');
            if (episodes.length > 0) {
              return NextResponse.json({
                success: true,
                data: {
                  vod_id: matched.vod_id,
                  vod_name: matched.vod_name,
                  vod_pic: matched.vod_pic,
                  vod_remarks: matched.vod_remarks,
                  vod_year: matched.vod_year,
                  vod_area: matched.vod_area,
                  vod_actor: matched.vod_actor,
                  vod_director: matched.vod_director,
                  vod_content: matched.vod_content,
                  type_name: matched.type_name,
                  vod_lang: matched.vod_lang,
                  episodes,
                  source: sourceConfig.id,
                  source_code: playFrom[selectedIndex] || '',
                },
                healed: true,
                healedSource: sourceConfig.id,
                healedId: matched.vod_id,
              });
            }
          }

          if (matched.vod_id && String(matched.vod_id) !== String(id)) {
            const healedDetail = await getVideoDetail(matched.vod_id, sourceConfig, cleanTitle);
            if (healedDetail && healedDetail.episodes && healedDetail.episodes.length > 0) {
              return NextResponse.json({
                success: true,
                data: healedDetail,
                healed: true,
                healedSource: sourceConfig.id,
                healedId: matched.vod_id,
              });
            }
          }
        }

        // 若原源单源搜不到，使用骨干主力源跨源自愈抢救
        const fallbackSources = DEFAULT_SOURCES.filter(s => s.enabled !== false && s.id !== sourceConfig.id).slice(0, 2);
        const crossSearchRes = await searchVideos(cleanTitle, fallbackSources, 1);
        for (const res of crossSearchRes) {
          const crossCandidates = res.results || [];
          const crossMatched = crossCandidates.find(c => {
            const cName = (c.vod_name || '').replace(/[《》【】\[\]（）()·\s:：\-]/g, '').replace(/(19\d\d|20\d\d)$/g, '').toLowerCase();
            const tName = cleanTitle.replace(/\s+/g, '').toLowerCase();
            return isCleanTitleMatch(cName, tName);
          });
          if (crossMatched && crossMatched.vod_id) {
            const crossSource = getSourceById(res.source);
            if (crossSource) {
              const crossDetail = await getVideoDetail(crossMatched.vod_id, crossSource, cleanTitle);
              if (crossDetail && crossDetail.episodes && crossDetail.episodes.length > 0) {
                return NextResponse.json({
                  success: true,
                  data: crossDetail,
                  healed: true,
                  healedSource: crossSource.id,
                  healedId: crossMatched.vod_id,
                });
              }
            }
          }
        }
      } catch (healErr) {
        console.warn(`[DetailAPI] Auto-heal detail search failed for ${titleParam}:`, healErr);
      }
    }

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
