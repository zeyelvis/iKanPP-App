/**
 * iKanPP 专线对外开放 API (iKanPP Line Open API)
 *
 * 适用场景：
 * - 供外部项目（独立 App、小程序、聚合影视客户端、多端后台等）调用
 * - 一键获取 4K/1080P 超清免翻墙、零 403 阻断的 HLS (.m3u8) 视频直链
 * - 内置双轨防毒化自愈引擎：专线上游受阻时 0ms 自动调度全网顶级骨干源
 *
 * 请求方式：
 * - GET:  /api/ikanpp-line?title=我不是大师&episode=1
 * - POST: /api/ikanpp-line  Body: { "title": "我不是大师", "episode": 1 }
 *
 * 响应结构：
 * - 标准 JSON，默认包含正片播放地址 play_url 与全量剧集列表 episodes
 * - CORS 全域开放，支持浏览器/移动端无限制跨域调用
 */

import { NextRequest, NextResponse } from 'next/server';
import { resolveIkanppLineMedia } from '@/lib/services/ikanpp-line-resolver';

export const runtime = 'edge';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400',
};

function jsonResponse(body: Record<string, any>, status = 200, extraHeaders: Record<string, string> = {}) {
  return new NextResponse(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...CORS_HEADERS,
      ...extraHeaders,
    },
  });
}

/**
 * 跨域预检请求响应
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

/**
 * 核心请求处理逻辑
 */
async function handleRequest(params: {
  title?: string | null;
  id?: string | null;
  mediaKey?: string | null;
  episode?: string | number | null;
  category?: string | null;
  type?: string | null;
  year?: string | null;
  season?: string | number | null;
  aliases?: string[] | string | null;
  relayOrigin?: string;
}) {
  const title = (params.title || '').trim();
  const id = (params.id || '').trim();
  const mediaKey = (params.mediaKey || '').trim();

  if (!title && !id && !mediaKey) {
    return jsonResponse(
      {
        code: 400,
        success: false,
        error: '缺少必要参数：请提供 title（片名）或 id/mediaKey（专线识别码）',
      },
      400
    );
  }

  try {
    const resolved = await resolveIkanppLineMedia({
      title: title || undefined,
      id: id || undefined,
      mediaKey: mediaKey || undefined,
      category: params.category || params.type || undefined,
      year: params.year || undefined,
      season: params.season || undefined,
      aliases: params.aliases || undefined,
      relayOrigin: params.relayOrigin,
    });

    if (!resolved || !resolved.episodes || resolved.episodes.length === 0) {
      return jsonResponse(
        {
          code: 404,
          success: false,
          error: `暂未检索到《${title || id || mediaKey}》的专线可用片源`,
        },
        404
      );
    }

    // 智能定位指定集数 (支持 1-based 集数或 0-based 索引或名称模糊匹配)
    let selectedEpisode = resolved.episodes[0];
    let selectedIndex = 0;

    if (params.episode !== undefined && params.episode !== null && String(params.episode).trim() !== '') {
      const epStr = String(params.episode).trim();
      const epNum = parseInt(epStr.replace(/[^\d]/g, ''), 10);

      if (!isNaN(epNum) && epNum > 0) {
        // 优先按 episodeNumber 匹配
        const byNumIdx = resolved.episodes.findIndex(e => e.episodeNumber === epNum);
        if (byNumIdx !== -1) {
          selectedEpisode = resolved.episodes[byNumIdx];
          selectedIndex = byNumIdx;
        } else if (epNum <= resolved.episodes.length) {
          // 降级按 1-based 下标匹配
          selectedEpisode = resolved.episodes[epNum - 1];
          selectedIndex = epNum - 1;
        }
      } else {
        // 按名称模糊匹配
        const byNameIdx = resolved.episodes.findIndex(e => (e.name || '').includes(epStr));
        if (byNameIdx !== -1) {
          selectedEpisode = resolved.episodes[byNameIdx];
          selectedIndex = byNameIdx;
        }
      }
    }

    return jsonResponse(
      {
        code: 200,
        success: true,
        msg: 'ok',
        data: {
          title: resolved.vod_name,
          vod_id: resolved.vod_id,
          pic: resolved.vod_pic,
          year: resolved.vod_year || null,
          type: resolved.type_name,
          actor: resolved.vod_actor || null,
          director: resolved.vod_director || null,
          content: resolved.vod_content || null,
          remarks: resolved.vod_remarks || `共 ${resolved.total_episodes} 集`,
          total_episodes: resolved.total_episodes,
          current_episode: selectedEpisode.episodeNumber || (selectedIndex + 1),
          current_episode_name: selectedEpisode.name,
          play_url: selectedEpisode.url,
          source: resolved.source,
          quality: resolved.quality,
          healed: !!resolved.healed,
          episodes: resolved.episodes.map(ep => ({
            name: ep.name,
            url: ep.url,
            index: ep.index,
            episode_number: ep.episodeNumber || (ep.index + 1),
          })),
        },
      },
      200,
      {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=86400',
      }
    );
  } catch (err: any) {
    console.error('[iKanPP Line API] Error:', err);
    return jsonResponse(
      {
        code: 500,
        success: false,
        error: '专线调度处理异常，请稍后重试',
        details: err?.message || String(err),
      },
      500
    );
  }
}

/**
 * GET 请求处理器
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;

  const title = searchParams.get('title');
  const id = searchParams.get('id');
  const mediaKey = searchParams.get('mediaKey');
  const episode = searchParams.get('episode');
  const category = searchParams.get('category');
  const type = searchParams.get('type');
  const year = searchParams.get('year');
  const season = searchParams.get('season');
  const aliases = searchParams.get('aliases');

  return handleRequest({
    title,
    id,
    mediaKey,
    episode,
    category,
    type,
    year,
    season,
    aliases,
    relayOrigin: origin,
  });
}

/**
 * POST 请求处理器
 */
export async function POST(request: NextRequest) {
  const origin = request.nextUrl.origin;
  let body: Record<string, any> = {};

  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const { searchParams } = request.nextUrl;

  return handleRequest({
    title: body.title ?? searchParams.get('title'),
    id: body.id ?? searchParams.get('id'),
    mediaKey: body.mediaKey ?? searchParams.get('mediaKey'),
    episode: body.episode ?? searchParams.get('episode'),
    category: body.category ?? searchParams.get('category'),
    type: body.type ?? searchParams.get('type'),
    year: body.year ?? searchParams.get('year'),
    season: body.season ?? searchParams.get('season'),
    aliases: body.aliases ?? searchParams.get('aliases'),
    relayOrigin: origin,
  });
}
