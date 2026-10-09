/**
 * iKanPP 专线 Worker（ikanpp-core-worker）
 * 只提供专线解析：/api/shadowline/resolve、/api/ikanpp-line（主站 next.config.ts 转发；外部站点的播放线路也会实时调用）。
 * 2026-10-08 去掉了片库检索与每小时「边缘入库」（主站片库在 D1，由 ikanpp-ingest 负责）。
 *
 * 架构规范遵守：
 * 1. 轨道 A 铁律：100% 浏览器直连第三方源站 CDN，零代理、零切片修改
 * 2. 准则 12：华语内容安全阻断（日文假名、韩文、成人低俗词 100% 拦截）
 * 3. 原生 KV 边缘缓存：1 小时直连播放流高速秒开
 */

import { Env, ResolveParams, LineResponsePayload, isCleanChineseTitle } from './types';
import { getShadowLineConfig, searchShadowLine, getShadowLinePlayList, matchBestCandidate } from './shadowline';
import { searchCollectorSources } from './collector';

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400',
};

function jsonResponse(data: any, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...CORS_HEADERS,
      ...extraHeaders,
    },
  });
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // 1. 处理 OPTIONS 跨域预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS,
      });
    }

    // 2. 健康检查路由
    if (path === '/health' || path === '/') {
      return jsonResponse({
        status: 'healthy',
        worker: 'ikanpp-core-worker',
        version: env.VERSION || '1.0.0',
        environment: env.ENVIRONMENT || 'production',
        timestamp: new Date().toISOString(),
      });
    }

    // 3. 专线流直解路由 (/api/ikanpp-line, /api/ikanpp-line/resolve, /api/shadowline/resolve)
    if (
      path === '/api/ikanpp-line' ||
      path === '/api/ikanpp-line/resolve' ||
      path === '/api/shadowline/resolve'
    ) {
      return handleLineResolve(request, env, ctx);
    }

    // 4. 未匹配路由
    return jsonResponse({ success: false, error: 'Not Found' }, 404);
  },
};

async function handleLineResolve(
  request: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  const url = new URL(request.url);
  let params: ResolveParams = {};

  if (request.method === 'GET') {
    params = {
      title: url.searchParams.get('title') || url.searchParams.get('wd') || undefined,
      id: url.searchParams.get('id') || url.searchParams.get('vodId') || undefined,
      vodId: url.searchParams.get('vodId') || undefined,
      episode: url.searchParams.get('episode') || url.searchParams.get('ep') || undefined,
      source: url.searchParams.get('source') || undefined,
      category: url.searchParams.get('category') || undefined,
      year: url.searchParams.get('year') || undefined,
      expectedEpisodes: url.searchParams.get('expectedEpisodes') || undefined,
      season: url.searchParams.get('season') || undefined,
      aliases: url.searchParams.get('aliases') || undefined,
      onlyCandidates: url.searchParams.get('onlyCandidates') === 'true' || url.searchParams.get('action') === 'search',
      includeCandidates: url.searchParams.get('includeCandidates') === 'true' || url.searchParams.get('candidates') === 'true',
    };
  } else if (request.method === 'POST') {
    try {
      const body: any = await request.json();
      params = {
        title: body.title || body.wd,
        id: body.id || body.vodId,
        vodId: body.vodId,
        episode: body.episode || body.ep,
        source: body.source,
        category: body.category,
        year: body.year,
        expectedEpisodes: body.expectedEpisodes,
        season: body.season,
        aliases: body.aliases,
        onlyCandidates: Boolean(body.onlyCandidates || body.action === 'search'),
        includeCandidates: Boolean(body.includeCandidates || body.candidates),
      };
    } catch {
      return jsonResponse({ success: false, error: 'Invalid JSON request body' }, 400);
    }
  }

  const rawTitle = params.title || '';
  const targetId = params.id || params.vodId || '';

  if (!rawTitle && !targetId) {
    return jsonResponse({ success: false, error: 'Missing title or id parameter' }, 400);
  }

  // 内容安全把关 (AGENTS.md 准则 12)
  if (rawTitle && !isCleanChineseTitle(rawTitle)) {
    return jsonResponse({ success: false, error: '内容未收录或包含不合规字符' }, 403);
  }

  const cleanTitle = rawTitle.replace(/[《》【】\[\]（）()·\s:：\-]/g, ' ').trim();
  const epNum = params.episode ? parseInt(String(params.episode).replace(/[^\d]/g, ''), 10) : 1;
  const targetEpisodeIndex = !isNaN(epNum) && epNum > 0 ? epNum - 1 : 0;

  // 1. 优先查询 KV 高速缓存（1 小时缓存，秒级命中）
  // v2（2026-10-09）：分集改从 GetOnePlayList 取完整列表，旧缓存里只有第一集
  const cacheKey = `ikanpp:stream_cache:v2:${encodeURIComponent(cleanTitle || targetId)}:${targetEpisodeIndex + 1}`;
  if (!params.onlyCandidates) {
    try {
      const cached = await env.KVIDEO_KV.get(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        parsed.cached = true;
        return jsonResponse(parsed, 200, {
          'Cache-Control': 'public, s-maxage=3600, max-age=600',
          'X-Cache-Status': 'HIT',
        });
      }
    } catch {}
  }

  // 2. 第一调度层级：暗影专线 (ShadowLine Engine) 原生直解
  const shadowConfig = await getShadowLineConfig(env);
  let resolvedFromShadow = false;

  if (shadowConfig.enabled) {
    try {
      let candidateVodId = targetId && !isNaN(Number(targetId)) ? targetId : null;
      let matchedTitle = cleanTitle;
      let allCandidates: any[] = [];

      if (!candidateVodId && cleanTitle) {
        allCandidates = await searchShadowLine(cleanTitle, shadowConfig);

        if (params.onlyCandidates) {
          return jsonResponse({
            success: true,
            title: cleanTitle,
            total: allCandidates.length,
            candidates: allCandidates,
            timestamp: new Date().toISOString(),
          }, 200, {
            'Cache-Control': 'public, s-maxage=1800, max-age=600',
          });
        }

        if (allCandidates.length > 0) {
          const best = matchBestCandidate(allCandidates, {
            title: cleanTitle,
            year: params.year,
            category: params.category,
          });
          if (best) {
            candidateVodId = best.vod_id;
            matchedTitle = best.title || cleanTitle;
          }
        }
      }

      if (candidateVodId) {
        const playList = await getShadowLinePlayList(candidateVodId, shadowConfig);
        if (playList && playList.length > 0) {
          resolvedFromShadow = true;
          const selectedEp = playList[targetEpisodeIndex] || playList[0];
          const epList = playList.map((ep, idx) => ({
            name: ep.episode || (idx === 0 ? '4K 极清' : `第${idx + 1}集`),
            url: ep.url,
            index: idx,
          }));

          const payload: LineResponsePayload = {
            success: true,
            vodId: candidateVodId,
            title: matchedTitle || cleanTitle || '4K 原画',
            targetEpisode: {
              episode: selectedEp.episode || `第${targetEpisodeIndex + 1}集`,
              url: selectedEp.url,
              index: targetEpisodeIndex,
            },
            episodes: epList,
            play_url: selectedEp.url,
            raw_play_url: selectedEp.url,
            total_episodes: epList.length,
            current_episode: targetEpisodeIndex + 1,
            current_episode_name: selectedEp.episode || `第${targetEpisodeIndex + 1}集`,
            quality: '4K 原画 · 直连',
            line: 'ikanpp-line',
            source: 'shadowline',
            timestamp: new Date().toISOString(),
            data: {
              vod_id: candidateVodId,
              vod_name: matchedTitle || cleanTitle || '4K 原画',
              type_name: '4K 原画 · 直连',
              episodes: epList,
              play_url: selectedEp.url,
              raw_play_url: selectedEp.url,
              total_episodes: epList.length,
              current_episode: targetEpisodeIndex + 1,
              quality: '4K 原画 · 直连',
              source: 'shadowline',
            },
          };

          if (params.includeCandidates && allCandidates.length > 0) {
            payload.totalCandidates = allCandidates.length;
            payload.candidates = allCandidates;
          }

          // 写入 KV 缓存 1 小时
          ctx.waitUntil(
            env.KVIDEO_KV.put(cacheKey, JSON.stringify(payload), { expirationTtl: 3600 }).catch(() => {})
          );

          return jsonResponse(payload, 200, {
            'Cache-Control': 'public, s-maxage=3600, max-age=600',
            'X-Cache-Status': 'MISS',
          });
        }
      }
    } catch (err) {
      console.warn('[ShadowLine Resolve Warning]', err);
    }
  }

  // 3. 第二调度层级：骨干采集站（巨量、光速、暴风、无尽）自愈回退
  if (!resolvedFromShadow && cleanTitle) {
    try {
      const fallbackResult = await searchCollectorSources(cleanTitle, params.year);
      if (fallbackResult && fallbackResult.episodes.length > 0) {
        const playList = fallbackResult.episodes;
        const selectedEp = playList[targetEpisodeIndex] || playList[0];
        const epList = playList.map((ep, idx) => ({
          name: ep.episode || (idx === 0 ? '4K 极清' : `第${idx + 1}集`),
          url: ep.url,
          index: idx,
        }));

        const payload: LineResponsePayload = {
          success: true,
          title: fallbackResult.vodName || cleanTitle,
          targetEpisode: {
            episode: selectedEp.episode || `第${targetEpisodeIndex + 1}集`,
            url: selectedEp.url,
            index: targetEpisodeIndex,
          },
          episodes: epList,
          play_url: selectedEp.url,
          raw_play_url: selectedEp.url,
          total_episodes: epList.length,
          current_episode: targetEpisodeIndex + 1,
          current_episode_name: selectedEp.episode || `第${targetEpisodeIndex + 1}集`,
          quality: '1080P/4K · 自愈直连',
          line: 'ikanpp-line',
          source: fallbackResult.sourceId,
          timestamp: new Date().toISOString(),
          data: {
            vod_name: fallbackResult.vodName || cleanTitle,
            type_name: '1080P/4K · 自愈直连',
            episodes: epList,
            play_url: selectedEp.url,
            raw_play_url: selectedEp.url,
            total_episodes: epList.length,
            current_episode: targetEpisodeIndex + 1,
            quality: '1080P/4K · 自愈直连',
            source: fallbackResult.sourceId,
          },
        };

        // 写入 KV 缓存 1 小时
        ctx.waitUntil(
          env.KVIDEO_KV.put(cacheKey, JSON.stringify(payload), { expirationTtl: 3600 }).catch(() => {})
        );

        return jsonResponse(payload, 200, {
          'Cache-Control': 'public, s-maxage=3600, max-age=600',
          'X-Cache-Status': 'MISS_FALLBACK',
        });
      }
    } catch (fallbackErr) {
      console.warn('[Collector Fallback Warning]', fallbackErr);
    }
  }

  // 4. 彻底无可用播放流
  return jsonResponse({
    success: false,
    error: '暂无可用的播放流或专线调度正在维护中',
    timestamp: new Date().toISOString(),
  }, 404);
}
