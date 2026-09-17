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

            // 智能提取副标题（例如 "爱情公寓：辣味英雄传" 提取 "辣味英雄传"）
            const extractSearchSubtitle = (raw: string): string | null => {
              if (!raw) return null;
              const parts = raw.split(/[:：\-—·/]/).map(p => p.trim()).filter(Boolean);
              if (parts.length >= 2) {
                const sub = parts[parts.length - 1];
                if (!/^(?:第?\s*[0-9一二两三四五六七八九十]+\s*[季部期集]|全\s*\d+\s*集|国语|粤语|原声|高清|TC|HD|4K|预告)$/i.test(sub)) {
                  if (sub.length >= 2 && sub.length <= 15) {
                    return sub;
                  }
                }
              }
              return null;
            };

            // 智能构建采集站搜索关键词序列（多层级回退，避免特殊标点导致 CMS 拦截）
            const parsedSeason = parseSeasonFromTitle(query.trim());
            const seasonVariants = parsedSeason ? generateSeasonSearchVariants(query.trim()) : [];
            
            const queriesToTry: string[] = [];
            if (seasonVariants.length > 0) {
              for (const sv of seasonVariants) {
                const c = sv.replace(/\s+/g, '');
                if (!queriesToTry.includes(c)) queriesToTry.push(c);
              }
            } else {
              const clean = query.trim();
              const noSpace = clean.replace(/\s+/g, '');
              queriesToTry.push(noSpace);

              const noPunctuation = clean.replace(/[:：\-—·/]/g, '').replace(/\s+/g, '');
              if (noPunctuation !== noSpace && !queriesToTry.includes(noPunctuation)) {
                queriesToTry.push(noPunctuation);
              }

              const sub = extractSearchSubtitle(clean);
              if (sub && !queriesToTry.includes(sub)) {
                queriesToTry.push(sub);
              }
            }

            let videos: any[] = [];
            let result: any = null;

            for (const q of queriesToTry) {
              try {
                const searchPromise = searchVideos(q, [source], 1);
                const raceResult: any = await Promise.race([searchPromise, timeoutPromise]);
                const found = raceResult[0]?.results || [];
                if (found.length > 0) {
                  videos = found;
                  result = raceResult;
                  break; // 一旦当前关键词命中有效片源，立即收敛并流式推送
                }
              } catch {
                // 单次查询超时或异常，若还有备用关键词则继续尝试
              }
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


