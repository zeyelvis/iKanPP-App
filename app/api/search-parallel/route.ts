/**
 * Parallel Streaming Search API Route
 * Searches all sources in parallel and streams results immediately as they arrive
 * No waiting - results flow in real-time
 */

import { NextRequest } from 'next/server';
import { searchVideos } from '@/lib/api/client';
import { getSourceById } from '@/lib/api/video-sources';
import { getSourceName } from '@/lib/utils/source-names';
import { isSafeExternalUrl } from '@/lib/utils/security';
import { searchAndEnrichFromTMDB } from '@/lib/services/entity-enrichment';
import { parseSeasonFromTitle, generateSeasonSearchVariants } from '@/lib/utils/season-resolver';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const body = await request.json();
        const { query, sources: sourceConfigs, page = 1 } = body;

        // Validate input
        if (!query || typeof query !== 'string' || query.trim().length === 0) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'error',
            message: 'Invalid query'
          })}\n\n`));
          controller.close();
          return;
        }

        // MED-1 修复：SSRF 校验，过滤掉指向内网或非法协议的恶意数据源
        const sources = Array.isArray(sourceConfigs) && sourceConfigs.length > 0
          ? sourceConfigs.filter((s: any) => s && isSafeExternalUrl(s.baseUrl))
          : [];

        if (sources.length === 0) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'error',
            message: 'No valid sources provided'
          })}\n\n`));
          controller.close();
          return;
        }

        // Send initial status
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'start',
          totalSources: sources.length
        })}\n\n`));



        // Track progress
        let completedSources = 0;
        let totalVideosFound = 0;
        let maxPageCount = 1;

        // Search all sources in PARALLEL with Circuit Breaker (Max 2500ms timeout per source)
        const searchPromises = sources.map(async (source: any) => {
          const startTime = performance.now();
          try {
            // 设置单源熔断保护（巨量Anycast骨干源允许 5500ms 跨洋握手与查询，其他源 3500ms）
            const timeoutMs = source.id === 'juliang' ? 5500 : 3500;
            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Source request timeout')), timeoutMs)
            );

            // 若关键词含有季数（如 "时光代理人第3季"），国内采集站通常使用中文数字立项（"时光代理人第三季"）
            // 且采集站 CMS 会将空格拆分成 OR 导致脱靶，因此使用无空格变体优先搜索
            const parsedSeason = parseSeasonFromTitle(query.trim());
            const variants = parsedSeason ? generateSeasonSearchVariants(query.trim()) : [query.trim()];
            const primaryQuery = variants[0] ? variants[0].replace(/\s+/g, '') : query.trim();

            let searchPromise = searchVideos(primaryQuery, [source], 1);
            let result: any = await Promise.race([searchPromise, timeoutPromise]);
            let videos = result[0]?.results || [];

            // 若首选变体未查到且还有原 query，进行快速兜底
            const cleanRawQuery = query.trim().replace(/\s+/g, '');
            if (videos.length === 0 && primaryQuery !== cleanRawQuery) {
              try {
                const fallbackPromise = searchVideos(cleanRawQuery, [source], 1);
                const fallbackResult: any = await Promise.race([fallbackPromise, timeoutPromise]);
                if (fallbackResult[0]?.results?.length) {
                  videos = fallbackResult[0].results;
                  result = fallbackResult;
                }
              } catch {}
            }

            const endTime = performance.now();
            const latency = Math.round(endTime - startTime);
            const pagecount = result[0]?.pagecount ?? 1;

            completedSources++;
            totalVideosFound += videos.length;

            // Stream page 1 videos immediately
            if (videos.length > 0) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                type: 'videos',
                videos: videos.map((video: any) => ({
                  ...video,
                  sourceDisplayName: source.name || getSourceName(source.id),
                  latency,
                })),
                source: source.id,
                completedSources,
                totalSources: sources.length,
                latency,
              })}\n\n`));
            }

            // Send progress update for page 1
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'progress',
              completedSources,
              totalSources: sources.length,
              totalVideosFound
            })}\n\n`));

            // Auto-fetch remaining pages if pagecount > 1 (Limited to page 2 for top sources to maintain extreme speed)
            if (pagecount > 1 && pagecount <= 3) {
              const remainingPages = Array.from({ length: Math.min(pagecount - 1, 2) }, (_, i) => i + 2);
              const pagePromises = remainingPages.map(async (pg) => {
                try {
                  const pageResult = await searchVideos(query.trim(), [source], pg);
                  const pageVideos = pageResult[0]?.results || [];

                  totalVideosFound += pageVideos.length;

                  if (pageVideos.length > 0) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                      type: 'videos',
                      videos: pageVideos.map((video: any) => ({
                        ...video,
                        sourceDisplayName: source.name || getSourceName(source.id),
                        latency,
                      })),
                      source: source.id,
                      completedSources,
                      totalSources: sources.length,
                      latency,
                    })}\n\n`));
                  }
                } catch {}
              });

              await Promise.all(pagePromises);
            }

          } catch (error) {
            const endTime = performance.now();
            const latency = Math.round(endTime - startTime);
            completedSources++;

            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'progress',
              completedSources,
              totalSources: sources.length,
              totalVideosFound
            })}\n\n`));
          }
        });

        // Wait for all sources to complete
        await Promise.all(searchPromises);

        // 长尾片库自扩充钩子 (On-Demand Entity Enrichment)
        // 若搜索到有效视频线路且片名有效，后台非阻塞触发 TMDB 补全与实体沉淀
        if (totalVideosFound > 0 && query.trim().length >= 1 && query.trim().length <= 40) {
          try {
            searchAndEnrichFromTMDB(query.trim()).catch(() => {});
          } catch {
            // 忽略异步异常，保证核心搜索流毫秒响应
          }
        }

        // Send completion signal
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'complete',
          totalVideosFound,
          totalSources: sources.length,
          maxPageCount
        })}\n\n`));

        controller.close();

      } catch (error) {
        console.error('Search error:', error);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'error',
          message: error instanceof Error ? error.message : 'Unknown error'
        })}\n\n`));
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}


