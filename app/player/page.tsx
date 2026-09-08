'use client';

import { Suspense, useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { VideoPlayer } from '@/components/player/VideoPlayer';
import { VideoMetadata } from '@/components/player/VideoMetadata';
import { EpisodeList } from '@/components/player/EpisodeList';
import { PlayerError } from '@/components/player/PlayerError';
import { SourceInfo } from '@/components/player/EpisodeList';
import type { VideoSource } from '@/lib/types';
import { useVideoPlayer } from '@/lib/hooks/useVideoPlayer';
import { useHistory } from '@/lib/store/history-store';
import { FavoritesSidebar } from '@/components/favorites/FavoritesSidebar';
import { FavoriteButton } from '@/components/favorites/FavoriteButton';
import { ShareButton } from '@/components/player/ShareButton';
import { Navbar } from '@/components/layout/Navbar';
import { settingsStore } from '@/lib/store/settings-store';
import { premiumModeSettingsStore } from '@/lib/store/premium-mode-settings';
import { DEFAULT_SOURCES } from '@/lib/api/default-sources';
import { PREMIUM_SOURCES } from '@/lib/api/premium-sources';
import { getSourceName } from '@/lib/utils/source-names';
import { ContentRail, RailMovie } from '@/components/home/ContentRail';
import { normalizeVideoType } from '@/lib/utils/taxonomy';
import { JsonLd, generateMediaJsonLd, generateBreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { Crown, Lock, Sparkles } from 'lucide-react';

interface TitleAnalysis {
  rawTitle: string;
  pureTitle: string;           // 剥除所有季数、年份、版本、标点后的核心剧名
  seasonNumber: number | null; // 提取出来的季数（如 第一季 -> 1，S4 -> 4）
}

function analyzeTitle(titleStr: string): TitleAnalysis {
  const raw = (titleStr || '').trim();

  // 提取季数
  let seasonNumber: number | null = null;
  const sMatch = raw.match(/第([一二三四五六七八九十\d]+)[季部期]/i) || 
                 raw.match(/\bseason\s*(\d+)\b/i) || 
                 raw.match(/\bS(\d{1,2})\b/i);
  if (sMatch) {
    const sStr = sMatch[1];
    const cnMap: Record<string, number> = { '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10 };
    seasonNumber = cnMap[sStr] ?? (parseInt(sStr, 10) || null);
  }

  // 剥除年份、季数、篇章词、版本词、符号
  const pure = raw
    .replace(/[\(（]?(19\d\d|20\d\d)[\)）]?/g, '')
    .replace(/第[一二三四五六七八九十\d]+[季部期]/gi, '')
    .replace(/season\s*\d+/gi, '')
    .replace(/\bS\d{1,2}\b/gi, '')
    .replace(/(前篇|后篇|最终季|终章|完结篇|序章|特别篇|剧场版)/gi, '')
    .replace(/(国语版|粤语版|双语版|原声版|中字版|纯享版|未删减版|加长版)/gi, '')
    .replace(/[《》【】\[\]（）()·\s:：\-]/g, '')
    .toLowerCase()
    .trim();

  return { rawTitle: raw, pureTitle: pure, seasonNumber };
}

function isSeriesTypeName(typeName: string): boolean {
  if (!typeName) return false;
  const tn = typeName.toLowerCase();
  if (tn.endsWith('片') && !tn.includes('纪录片')) return false;
  return (
    tn.includes('连续剧') ||
    tn.includes('电视剧') ||
    tn.includes('动漫') ||
    tn.includes('动画') ||
    (tn.includes('剧') && !tn.includes('剧情') && !tn.includes('喜剧'))
  );
}

function PlayerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isPremium = searchParams.get('premium') === '1';
  const { addToHistory } = useHistory(isPremium);

  const videoId = searchParams.get('id');
  const source = searchParams.get('source');
  const title = searchParams.get('title');
  const episodeParam = searchParams.get('episode') || searchParams.get('ep');
  const epCountParam = searchParams.get('epCount');
  const groupedSourcesParam = searchParams.get('groupedSources');
  // 消歧义参数：从首页传入的内容类型和年份
  const expectedType = searchParams.get('type'); // 'movie' | 'tv' | null
  const expectedYear = searchParams.get('year'); // e.g. '2025' | null
  // 底部同类推荐片单状态
  const [relatedMovies, setRelatedMovies] = useState<RailMovie[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(true);

  // === Title-only mode: auto-search all sources and redirect to best match ===
  // 核心自愈防线：只要有 title 且缺少 videoId，无论是否附带 source，都必须启动自动匹配寻找有效 videoId
  const needsTitleSearch = !videoId && !!title;
  const [titleSearching, setTitleSearching] = useState(() => needsTitleSearch);
  const [titleSearchError, setTitleSearchError] = useState('');

  useEffect(() => {
    // 只有当 videoId 存在（能直接按 ID 拉取详情），或者连 title 都没有时，才跳过搜索
    if (videoId || !title) return;

    let cancelled = false;
    setTitleSearching(true);
    setTitleSearchError('');

    const settings = settingsStore.getSettings();
    const sourcesForMode = isPremium ? settings.premiumSources : settings.sources;
    let allSources = sourcesForMode?.filter((s: VideoSource) => s.enabled !== false) || [];
    if (allSources.length === 0) {
      allSources = isPremium ? (PREMIUM_SOURCES as VideoSource[]) : (DEFAULT_SOURCES as VideoSource[]);
    }

    // 若 URL 附带了 source，优先提升该源为第一检索目标以实现精准续播
    if (source) {
      const preferredSource = allSources.find(s => s.id === source);
      if (preferredSource) {
        allSources = [preferredSource, ...allSources.filter(s => s.id !== source)];
      }
    }

    // 清洗片名（去除书名号、括号说明、第X季等干扰词）
    const cleanTitle = title.replace(/[《》【】\[\]（）()]/g, ' ').replace(/\s+/g, ' ').trim();
    const normalizedTitle = cleanTitle.toLowerCase();
    
    // 智能提取番号（如 IPZZ-870, SSIS-123, FC2-PPV-123456, MIDE-999 等）
    const codeMatch = title.match(/([A-Za-z0-9]{2,8}[-_][0-9]{3,8}|FC2[-_]PPV[-_][0-9]{5,8}|T28[-_][0-9]{3,5})/i);
    const videoCode = codeMatch ? codeMatch[0].toUpperCase() : null;

    // 如果提取出了番号（如 IPZZ-870），搜索词直接使用番号！
    const searchQuery = isPremium && videoCode ? videoCode : cleanTitle;
    let redirected = false;
    let anyFound = false;

    (async () => {
      try {
        const response = await fetch('/api/search-parallel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: searchQuery, sources: allSources, page: 1 }),
        });

        if (cancelled) return;

        if (!response.ok || !response.body) {
          if (!cancelled && !redirected) {
            setTitleSearchError('全网搜索暂时繁忙，请点击下方重试');
            setTitleSearching(false);
          }
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        const foundSources: SourceInfo[] = [];

        // 目标基准元数据
        const targetAnalysis = analyzeTitle(title);
        const targetYear = expectedYear ? parseInt(expectedYear, 10) : null;

        // 第一梯队顶级秒播大源白名单（片库庞大且 443 端口稳定存活的大型骨干源）
        const TOP_TIER_SOURCES = new Set(['wujin', 'zuida', 'guangsu', 'modu', 'zy360']);

        let ikanbotDone = false;
        let ikanbotFound = false;



        // 优先并发请求 ikanbot 实时逆向清洗引擎（秒级直出 20~30 条黄金线路，第 1 条 100% 锁定为光速资源）
        const ikanbotFetchPromise = (!isPremium) ? (async () => {
          try {
            const seasonParam = targetAnalysis.seasonNumber ?? '';
            const res = await fetch(`/api/ikanbot?title=${encodeURIComponent(cleanTitle)}&year=${expectedYear || ''}&season=${seasonParam}`);
            if (res.ok) {
              const data = await res.json();
              if (!cancelled && !redirected && data?.success && data?.data?.lines?.length > 0) {
                const { data: ikanData } = data;
                const isSeriesItem = targetAnalysis.seasonNumber !== null || expectedType === 'tv' || ikanData.lines[0]?.episodes?.length > 1;
                const ikanSources: SourceInfo[] = ikanData.lines.map((l: any) => ({
                  id: ikanData.vod_id,
                  source: l.sourceId,
                  sourceName: l.sourceName,
                  pic: ikanData.vod_pic,
                  typeName: isSeriesItem ? '连续剧' : '电影',
                }));

                let playSourceId = ikanData.lines[0]?.sourceId;
                let playVodId = String(ikanData.vod_id);

                const firstLine = ikanData.lines[0];
                if (playSourceId && !redirected && !cancelled) {
                  redirected = true;
                  ikanbotFound = true;
                  ikanbotDone = true;
                  const params = new URLSearchParams();
                  params.set('id', playVodId);
                  params.set('source', playSourceId);
                  params.set('title', title);
                  if (episodeParam) {
                    params.set('episode', episodeParam);
                  }
                  const resolvedType = expectedType || (isSeriesItem ? 'tv' : 'movie');
                  params.set('type', resolvedType);
                  if (expectedYear || ikanData.vod_year) {
                    params.set('year', expectedYear || ikanData.vod_year);
                  }
                  params.set('groupedSources', JSON.stringify(ikanSources));
                  router.replace(`/player?${params.toString()}`, { scroll: false });
                  return true;
                }
              }
            }
          } catch {
            // ikanbot 解析失败或超时，放行采集站流式兜底
          }
          ikanbotDone = true;
          return false;
        })() : Promise.resolve(false);

        // 备选最佳匹配（用于在未遇到秒跳完美年份源时的次优候选）
        let pendingBestCandidate: { video: any; score: number; isSeries: boolean } | null = null;
        let yearMismatchedCount = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done || cancelled || redirected) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'videos' && Array.isArray(data.videos) && data.videos.length > 0) {
                for (const v of data.videos) {
                  const rawName = (v.vod_name || '').trim();
                  const typeName = (v.type_name || '').toLowerCase();
                  const remarks = (v.vod_remarks || '').toLowerCase();

                  // 1. 过滤明显解说或预告
                  const isTrailer = remarks.includes('预告') || rawName.includes('预告') || remarks.includes('片花') || rawName.includes('片花');
                  const isCommentary = typeName.includes('解说') || rawName.includes('解说');

                  // 1.1 过滤未指定时的衍生音乐剧/舞台剧/百老汇演出（如将 2025 音乐剧误当 2013 动画片）
                  const subTitle = (v.vod_sub || '').toLowerCase();
                  const targetSpecifiedMusical = title.includes('音乐剧') || title.includes('舞台剧') || title.toLowerCase().includes('musical');
                  const isMusical = !targetSpecifiedMusical && (
                    subTitle.includes('musical') ||
                    subTitle.includes('broadway') ||
                    rawName.includes('音乐剧') ||
                    rawName.includes('舞台剧') ||
                    remarks.includes('音乐剧') ||
                    remarks.includes('舞台剧') ||
                    typeName.includes('舞台剧')
                  );

                  // 1.2 过滤已知彻底废弃注销的死链切片域名（如暴风早期已报废的 bvvvvvvvvv1f.com，100% 404）
                  const playUrl = v.vod_play_url || '';
                  const isDeadUrl = playUrl.includes('bvvvvvvvvv1f.com');
                  if (isDeadUrl) continue;

                  // 2. 季数与片名深度解析
                  const candAnalysis = analyzeTitle(rawName);
                  const isSeriesItem = candAnalysis.seasonNumber !== null ||
                    remarks.includes('集') ||
                    remarks.includes('季') ||
                    isSeriesTypeName(typeName) ||
                    expectedType === 'tv';

                  // 3. 提取候选年份
                  let candYear: number | null = null;
                  if (v.vod_year) {
                    const yMatch = String(v.vod_year).match(/\b(19\d\d|20\d\d)\b/);
                    if (yMatch) candYear = parseInt(yMatch[1], 10);
                  }
                  if (!candYear) {
                    const nameYearMatch = rawName.match(/[\(（]?(19\d\d|20\d\d)[\)）]?/);
                    if (nameYearMatch) candYear = parseInt(nameYearMatch[1], 10);
                  }

                  // 4. 年份冲突与亲和力判定
                  let yearScore = 0;
                  let isYearMismatched = false; // 是否为严重冲突老片（相差 >= 3 年）
                  let isExactYearMatch = false;

                  if (isSeriesItem) {
                    // 连续剧/电视剧跨越多年播出（如怪奇物语从2016跨到2025），绝不实行年代一票否决！
                    if (targetYear && candYear && candYear === targetYear) {
                      yearScore = 30;
                    }
                  } else {
                    // 电影单片严格实行年份防撞车（如诺兰《奥德赛2026》vs 法国《奥德赛2016》）
                    if (targetYear) {
                      if (candYear) {
                        const diff = Math.abs(candYear - targetYear);
                        if (diff === 0) {
                          yearScore = 150; // 年份完全精准吻合！
                          isExactYearMatch = true;
                        } else if (diff === 1) {
                          yearScore = 80; // 跨年上映误差
                        } else if (diff === 2) {
                          yearScore = 10;
                        } else {
                          // 差距 >= 3 年：100% 为同名异片
                          isYearMismatched = true;
                          yearScore = -1000;
                          yearMismatchedCount++;
                        }
                      } else {
                        // 候选未标明年份（很多新上线采集站未填 vod_year）
                        yearScore = 20;
                      }
                    }
                  }

                  // 5. 片名与季数匹配得分
                  let nameScore = 0;
                  let isExactName = false;
                  if (videoCode && rawName.toUpperCase().includes(videoCode)) {
                    nameScore = 200;
                    isExactName = true;
                  } else if (candAnalysis.pureTitle === targetAnalysis.pureTitle) {
                    isExactName = true;
                    if (isSeriesItem) {
                      // 连续剧季数优选逻辑
                      if (targetAnalysis.seasonNumber !== null) {
                        if (candAnalysis.seasonNumber === targetAnalysis.seasonNumber) {
                          nameScore = 180; // 目标指定季完全吻合（如明确搜第4季）
                        } else {
                          nameScore = 60; // 其它季作为合法备用源
                        }
                      } else {
                        // 用户未指定季数（如首页点击《怪奇物语》），优先推首季
                        if (candAnalysis.seasonNumber === 1 || candAnalysis.seasonNumber === null) {
                          nameScore = 160; // 首季秒播
                        } else {
                          nameScore = 100; // 后续季（2~5季）同样作为优质源入库备选
                        }
                      }
                    } else {
                      nameScore = 120; // 单片电影核心名完全命中
                    }
                  } else if (
                    (candAnalysis.pureTitle.length >= 2 && targetAnalysis.pureTitle.includes(candAnalysis.pureTitle)) ||
                    (targetAnalysis.pureTitle.length >= 2 && candAnalysis.pureTitle.includes(targetAnalysis.pureTitle))
                  ) {
                    nameScore = 30;
                  } else {
                    nameScore = -200;
                  }

                  // 6. 质量与类型加减分
                  let qualityScore = 0;
                  if (remarks.includes('4k') || remarks.includes('2160')) qualityScore += 30;
                  if (remarks.includes('1080') || remarks.includes('hd') || remarks.includes('正片')) qualityScore += 20;
                  if (remarks.includes('tc') || remarks.includes('抢先')) qualityScore += 10;
                  if (isTrailer || isCommentary) qualityScore -= 500;
                  // 严禁未指定时的音乐剧/舞台剧截胡正规电影/动画正片（如将 2025 音乐剧当成 2013 动画长片）
                  if (isMusical) qualityScore -= 400;
                  // 针对动画片/动漫电影给予正向优先加分，满足主流动画观众诉求
                  if (typeName.includes('动画') || typeName.includes('动漫')) {
                    qualityScore += 60;
                  }
                  // 对全量标准 443 端口切片且极高存活率的无尽资源 (wujin) 与最大资源 (zuida) 给予黄金秒播加分
                  if (v.source === 'wujin' || v.source === 'zuida') qualityScore += 80;

                  // 对切片经常部署在非标端口（如 :999, :9999, :65, :18443）的源适度降权，避免抢跑故障
                  const NON_STANDARD_PORT_SOURCES = new Set(['jisu', 'xinlang', 'subo', 'ikun', 'haitun', 'hongniu', 'huya', 'jinying', 'jingyu']);
                  if (NON_STANDARD_PORT_SOURCES.has(v.source)) {
                    qualityScore -= 60;
                  }

                  // 总得分
                  const totalScore = nameScore + yearScore + qualityScore;

                  // 记录为可用来源供清晰度切换（必须严格精确吻合核心片名，严禁预告/解说/非目标音乐剧/严重年代冲突老片）
                  const isStrictCandidate = !isTrailer && !isCommentary && !isMusical && !isYearMismatched && isExactName && 
                    (isSeriesItem || !targetYear || !candYear || Math.abs(candYear - targetYear) <= 1);

                  if (isStrictCandidate) {
                    anyFound = true;
                    // 同一个采集站只能保留 1 个最佳线路，杜绝同一个 source 重复出现（例如 11 个海豚资源）
                    const existingIdx = foundSources.findIndex(s => s.source === v.source);
                    const newSourceItem: SourceInfo & { _score?: number } = {
                      id: v.vod_id,
                      source: v.source,
                      sourceName: v.sourceDisplayName || getSourceName(v.source),
                      latency: v.latency,
                      pic: v.vod_pic,
                      typeName: v.type_name,
                      _score: totalScore,
                    };
                    if (existingIdx === -1) {
                      foundSources.push(newSourceItem);
                    } else {
                      const oldItem = foundSources[existingIdx] as any;
                      if ((oldItem._score ?? 0) < totalScore) {
                        foundSources[existingIdx] = newSourceItem;
                      }
                    }
                  }

                  // 7. 自动播放重定向决策（Auto-Redirect Decision）
                  const isQualified = !isTrailer && !isCommentary && !isMusical && !isYearMismatched && isExactName && totalScore >= 80;

                  if (isQualified && !redirected && !cancelled) {
                    // 判断是否具备立即秒播资格：
                    // - 番号精确匹配；
                    // - 或者剧集命中第 1 季（或指定目标季）；
                    // - 或者电影年份精准吻合（或无指定年份）
                    const isTopTarget = (videoCode && rawName.toUpperCase().includes(videoCode)) ||
                      (isSeriesItem && (targetAnalysis.seasonNumber !== null ? candAnalysis.seasonNumber === targetAnalysis.seasonNumber : (candAnalysis.seasonNumber === 1 || candAnalysis.seasonNumber === null))) ||
                      (!isSeriesItem && (isExactYearMatch || !targetYear));

                    const isTopTier = TOP_TIER_SOURCES.has(v.source) || isPremium;

                    // 核心逻辑：在普通影视模式下，严禁非第一梯队（如海豚资源 haitun、虎牙等）抢先抢跑！
                    // 只有是第一梯队秒播源（如光速、极速、新浪），或者 ikanbot 已经明确完成且未收录时，才直接触发采集源跳转
                    if (isTopTarget && (isTopTier || ikanbotDone)) {
                      redirected = true;
                      const params = new URLSearchParams();
                      params.set('id', String(v.vod_id));
                      params.set('source', v.source);
                      params.set('title', title);
                      if (episodeParam) {
                        params.set('episode', episodeParam);
                      }
                      // 智能类型纠偏：如果是剧集则打上 tv，避免首页标签误打成 movie 导致选集列表渲染问题
                      const resolvedType = isSeriesItem ? 'tv' : (expectedType || 'movie');
                      params.set('type', resolvedType);
                      if (expectedYear) params.set('year', expectedYear);
                      if (isPremium) params.set('premium', '1');
                      if (foundSources.length > 0) {
                        params.set('groupedSources', JSON.stringify(foundSources));
                      }
                      router.replace(`/player?${params.toString()}`, { scroll: false });
                      break;
                    }

                    // 暂存为最优候选（以防未遇到第一梯队时，流结束后兜底播放）
                    if (!pendingBestCandidate || totalScore > pendingBestCandidate.score) {
                      pendingBestCandidate = { video: v, score: totalScore, isSeries: isSeriesItem };
                    }
                  }
                }
              }
            } catch { /* ignore parse errors */ }
          }
          if (redirected) break;
        }

        // 流结束后的兜底检查与候选决议
        if (!redirected && !cancelled) {
          // 如果流结束了，但 ikanbot 仍在请求中，再给予最后 1.5 秒等待 ikanbot 直出第一梯队光速资源
          if (!ikanbotDone && !isPremium) {
            await Promise.race([
              ikanbotFetchPromise,
              new Promise(r => setTimeout(r, 1500))
            ]);
          }

          // 若 ikanbot 仍未命中，且有合格的兜底采集候选（如海豚资源），则降级启用候选源
          if (!redirected && !cancelled) {
            if (pendingBestCandidate) {
              // 启用合格合法正片源进行兜底跳转
              redirected = true;
              const bestVideo = pendingBestCandidate.video;
              const params = new URLSearchParams();
              params.set('id', String(bestVideo.vod_id));
              params.set('source', bestVideo.source);
              params.set('title', title);
              if (episodeParam) {
                params.set('episode', episodeParam);
              }
              const resolvedType = pendingBestCandidate.isSeries ? 'tv' : (expectedType || 'movie');
              params.set('type', resolvedType);
              if (expectedYear) params.set('year', expectedYear);
              if (isPremium) params.set('premium', '1');
              if (foundSources.length > 0) {
                params.set('groupedSources', JSON.stringify(foundSources));
              }
              router.replace(`/player?${params.toString()}`, { scroll: false });
            } else if (yearMismatchedCount > 0) {
              // 全网只有相差 3 年以上的同名老片，绝不误播张冠李戴
              setTitleSearchError(`全网暂未检索到 ${targetYear ? targetYear + ' 年' : ''}《${title}》正片数字资源。系统已为您自动拦截早期同名老片，避免误播。`);
              setTitleSearching(false);
            } else {
              setTitleSearchError('全网 108 条数据源未检索到该片，请检查片名或在首页重新搜索');
              setTitleSearching(false);
            }
          }
        }
      } catch (err: any) {
        if (!cancelled && !redirected && err?.name !== 'AbortError') {
          setTitleSearchError('网络请求异常，请点击重试');
          setTitleSearching(false);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [videoId, source, title, isPremium, router, expectedType, expectedYear, episodeParam]);

  // Track settings - use mode-specific store
  const modeStore = isPremium ? premiumModeSettingsStore : settingsStore;
  const [isReversed, setIsReversed] = useState(() =>
    typeof window !== 'undefined' ? modeStore.getSettings().episodeReverseOrder : false
  );



  // Sync with store changes
  useEffect(() => {
    setIsReversed(modeStore.getSettings().episodeReverseOrder);
  }, []);

  // 零成本播放失败与不可用自愈：记录当前播放会话中失败的线路
  const failedSourcesRef = useRef<Set<string>>(new Set());

  // 当指定线路或指定 videoId 失效/下架/404/无剧集时的全自动自愈处理
  const handleSourceUnavailable = useCallback(() => {
    let knownSources: SourceInfo[] = [];
    if (groupedSourcesParam) {
      try { knownSources = JSON.parse(groupedSourcesParam); } catch {}
    }
    const currentActiveSource = source || '';
    if (currentActiveSource) {
      failedSourcesRef.current.add(currentActiveSource);
    }
    // 1. 尝试在已知备选线路中寻找未失败的健康源（优先选择 443 纯净健康源）
    const validCandidates = knownSources.filter(
      s => s.source && s.source !== currentActiveSource && !failedSourcesRef.current.has(s.source)
    );
    const candidate = validCandidates.sort((a, b) => {
      const topSet = new Set(['wujin', 'zuida', 'guangsu', 'modu', 'zy360']);
      const aTop = topSet.has(a.source);
      const bTop = topSet.has(b.source);
      if (aTop !== bTop) return aTop ? -1 : 1;
      const badSet = new Set(['baofeng', 'jisu', 'xinlang', 'subo', 'ikun', 'haitun', 'hongniu', 'huya', 'jinying', 'jingyu']);
      const aBad = badSet.has(a.source);
      const bBad = badSet.has(b.source);
      if (aBad !== bBad) return aBad ? 1 : -1;
      return 0;
    })[0];
    if (candidate) {
      console.info(`[Auto-Fallback] 当前线路(${currentActiveSource})不可用，自动切换至备选线路: ${candidate.sourceName}`);
      const params = new URLSearchParams();
      params.set('id', String(candidate.id));
      params.set('source', candidate.source);
      params.set('title', title || '');
      if (expectedType) params.set('type', expectedType);
      if (expectedYear) params.set('year', expectedYear);
      if (episodeParam) params.set('episode', episodeParam);
      if (knownSources.length > 0) params.set('groupedSources', JSON.stringify(knownSources));
      if (isPremium) params.set('premium', '1');
      router.replace(`/player?${params.toString()}`, { scroll: false });
      return;
    }

    // 2. 无可用备选源，但有 title：说明当前 URL 中的 id 已失效，自动剥离 id 启动全网并发搜索自愈！
    if (title && (videoId || source)) {
      console.info(`[Auto-Fallback] 当前影片 ID (${videoId}) 已失效，自动启动全网按片名《${title}》并发重搜自愈！`);
      const params = new URLSearchParams();
      params.set('title', title);
      if (expectedType) params.set('type', expectedType);
      if (expectedYear) params.set('year', expectedYear);
      if (episodeParam) params.set('episode', episodeParam);
      if (isPremium) params.set('premium', '1');
      router.replace(`/player?${params.toString()}`, { scroll: false });
    }
  }, [groupedSourcesParam, source, title, expectedType, expectedYear, episodeParam, isPremium, router, videoId]);

  // useVideoPlayer must be called unconditionally (React hooks rules)
  // When videoId/source are null (title-only mode), pass empty strings - the hook will just be idle
  const {
    videoData,
    loading,
    videoError,
    currentEpisode,
    playUrl,
    setCurrentEpisode,
    setPlayUrl,
    setVideoError,
    fetchVideoDetails,
  } = useVideoPlayer(videoId || '', source || '', episodeParam, isReversed, handleSourceUnavailable, title);

  // Parse grouped sources if available
  const [discoveredSources, setDiscoveredSources] = useState<SourceInfo[]>([]);


  // Title-only mode guard: redirect if no title, id, or source
  const isTitleOnlyMode = !videoId || !source;

  const groupedSources = useMemo<SourceInfo[]>(() => {
    let rawList: SourceInfo[] = [];
    if (groupedSourcesParam) {
      try {
        rawList = JSON.parse(groupedSourcesParam);
      } catch {
        rawList = [];
      }
    }

    // Merge in discovered sources (from background search)
    if (discoveredSources.length > 0) {
      rawList.push(...discoveredSources);
    }

    // Always ensure the current source is in the list
    if (source) {
      rawList.unshift({
        id: videoId || '',
        source: source,
        sourceName: getSourceName(source),
        pic: videoData?.vod_pic
      });
    }

    // 核心防线：对同一 source 严格唯一去重，绝不允许任何同源重复项
    const sourceMap = new Map<string, SourceInfo>();
    for (const s of rawList) {
      if (s && s.source && !sourceMap.has(s.source)) {
        sourceMap.set(s.source, s);
      }
    }

    let sources = Array.from(sourceMap.values());

    // Use current video's poster as fallback pic for sources that don't have one
    const fallbackPic = videoData?.vod_pic;
    if (fallbackPic) {
      sources = sources.map(s => s.pic ? s : { ...s, pic: fallbackPic });
    }



    return sources;
  }, [groupedSourcesParam, source, videoId, videoData?.vod_pic, discoveredSources]);

  // 拉取同类高分影视推荐
  useEffect(() => {
    let isMounted = true;
    const fetchRelated = async () => {
      setLoadingRelated(true);
      try {
        const recommendTag = videoData?.type_name || (expectedType === 'tv' ? '热门' : '豆瓣高分');
        const type = expectedType || (videoData?.type_name?.includes('剧') ? 'tv' : 'movie');
        const res = await fetch(`/api/douban/recommend?tag=${encodeURIComponent(recommendTag)}&type=${type}&page_limit=14&page_start=0`);
        const data = await res.json();
        if (isMounted) {
          setRelatedMovies(data.subjects || []);
        }
      } catch (err) {
        console.error('Fetch related movies error:', err);
      } finally {
        if (isMounted) setLoadingRelated(false);
      }
    };

    fetchRelated();
    return () => {
      isMounted = false;
    };
  }, [videoData?.type_name, expectedType]);



  // Background fetch alternative sources when none provided or when existing ones lack full info
  useEffect(() => {
    if (!title || isTitleOnlyMode) return;

    // Check if existing grouped sources already have full info
    let existingSources: SourceInfo[] = [];
    if (groupedSourcesParam) {
      try { existingSources = JSON.parse(groupedSourcesParam); } catch { }
    }
    const hasIkanbotLines = existingSources.some(s => s.source.startsWith('ikanbot_'));
    const needsIkanbot = !isPremium && !hasIkanbotLines;
    const hasFullInfo = existingSources.length >= 10 && existingSources.every(s => s.pic) && (isPremium || hasIkanbotLines);
    if (hasFullInfo) return;

    let cancelled = false;

    const settings = settingsStore.getSettings();
    const sourcesForMode = isPremium ? settings.premiumSources : settings.sources;
    const allSources = sourcesForMode?.filter((s: VideoSource) => s.enabled !== false) || [];
    // Only search other sources (not the current one)
    const otherSources = allSources.filter((s: VideoSource) => s.id !== source);

    (async () => {
      try {
        const cleanTitle = (title || '').replace(/[《》【】\[\]（）()]/g, ' ').replace(/\s+/g, ' ').trim();
        const targetAnalysis = analyzeTitle(cleanTitle);
        const currentNameAnalysis = analyzeTitle(videoData?.vod_name || '');
        const effectiveSeason = targetAnalysis.seasonNumber ?? currentNameAnalysis.seasonNumber;

        // 优先并发从 ikanbot 注入丰富线路
        if (needsIkanbot) {
          const seasonParam = effectiveSeason ?? '';
          fetch(`/api/ikanbot?title=${encodeURIComponent(cleanTitle)}&year=${expectedYear || ''}&season=${seasonParam}`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
              if (cancelled || !data?.success || !data?.data?.lines?.length) return;
              const { data: ikanData } = data;
              const isSeriesItem = effectiveSeason !== null || expectedType === 'tv' || (videoData?.type_name || '').includes('剧') || ikanData.lines[0]?.episodes?.length > 1;
              const ikanSources: SourceInfo[] = ikanData.lines.map((l: any) => ({
                id: ikanData.vod_id,
                source: l.sourceId,
                sourceName: l.sourceName,
                pic: ikanData.vod_pic,
                typeName: isSeriesItem ? '连续剧' : '电影',
              }));
              setDiscoveredSources(prev => {
                const map = new Map<string, SourceInfo>();
                for (const s of prev) map.set(s.source, s);
                for (const s of ikanSources) {
                  if (!map.has(s.source)) map.set(s.source, s);
                }
                return Array.from(map.values());
              });
            })
            .catch(() => {});
        }

        if (otherSources.length === 0) return;

        const codeMatch = (title || '').match(/([A-Za-z0-9]{2,8}[-_][0-9]{3,8}|FC2[-_]PPV[-_][0-9]{5,8}|T28[-_][0-9]{3,5})/i);
        const videoCode = codeMatch ? codeMatch[0].toUpperCase() : null;
        const targetYear = expectedYear ? parseInt(expectedYear, 10) : null;
        const searchQuery = isPremium && videoCode ? videoCode : cleanTitle;

        const response = await fetch('/api/search-parallel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: searchQuery, sources: otherSources, page: 1 }),
        });
        if (cancelled || !response.ok || !response.body) return;

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        const found: SourceInfo[] = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done || cancelled) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'videos' && Array.isArray(data.videos) && data.videos.length > 0) {
                for (const v of data.videos) {
                  const rawName = (v.vod_name || '').trim();
                  const typeName = (v.type_name || '').toLowerCase();
                  const remarks = (v.vod_remarks || '').toLowerCase();

                  // 1. 严格过滤解说、预告、片花
                  if (remarks.includes('预告') || rawName.includes('预告') || remarks.includes('片花') || rawName.includes('片花')) {
                    continue;
                  }
                  if (typeName.includes('解说') || rawName.includes('解说')) {
                    continue;
                  }

                  // 2. 提取候选季数与片名
                  const candAnalysis = analyzeTitle(rawName);
                  const isSeriesItem = candAnalysis.seasonNumber !== null ||
                    remarks.includes('集') ||
                    remarks.includes('季') ||
                    isSeriesTypeName(typeName) ||
                    expectedType === 'tv';

                  // 3. 提取候选年份
                  let candYear: number | null = null;
                  if (v.vod_year) {
                    const yMatch = String(v.vod_year).match(/\b(19\d\d|20\d\d)\b/);
                    if (yMatch) candYear = parseInt(yMatch[1], 10);
                  }
                  if (!candYear) {
                    const nameYearMatch = rawName.match(/[\(（]?(19\d\d|20\d\d)[\)）]?/);
                    if (nameYearMatch) candYear = parseInt(nameYearMatch[1], 10);
                  }

                  // 4. 年代校验：单片电影相差 > 1 年绝对一票否决；连续剧跨年播出放行
                  if (!isSeriesItem && targetYear && candYear && Math.abs(candYear - targetYear) > 1) {
                    continue;
                  }

                  // 5. 季数对齐校验：若当前正在播特定季，候选也标明了季数，两季必须相同
                  if (effectiveSeason !== null && candAnalysis.seasonNumber !== null && candAnalysis.seasonNumber !== effectiveSeason) {
                    continue;
                  }

                  // 6. 清洗片名并严格精确比对核心名称
                  const isCodeMatch = videoCode && rawName.toUpperCase().includes(videoCode);
                  const isExactName = candAnalysis.pureTitle === targetAnalysis.pureTitle;

                  // 必须是严格精确匹配核心片名或番号
                  if (!isCodeMatch && !isExactName) {
                    continue;
                  }

                  if (!cancelled) {
                    const existingIdx = found.findIndex(s => s.source === v.source);
                    const newItem: SourceInfo = {
                      id: v.vod_id,
                      source: v.source,
                      sourceName: v.sourceDisplayName || getSourceName(v.source),
                      latency: v.latency,
                      pic: v.vod_pic,
                      typeName: v.type_name,
                    };
                    if (existingIdx === -1) {
                      found.push(newItem);
                      setDiscoveredSources([...found]);
                    }
                  }
                }
              }
            } catch { /* ignore parse errors */ }
          }
        }
      } catch {
        // Silently ignore - this is a background enhancement
      }
    })();

    return () => { cancelled = true; };
  }, [title, source, groupedSourcesParam, isPremium, isTitleOnlyMode, expectedType, expectedYear, videoData?.vod_name]);

  // Track current source for switching
  const [currentSourceId, setCurrentSourceId] = useState(source);
  const playerTimeRef = useRef(0);


  const handlePlaybackError = useCallback((_error: string) => {
    const currentActiveSource = currentSourceId || source || '';
    if (currentActiveSource) {
      failedSourcesRef.current.add(currentActiveSource);
    }

    // 在已发现的可用源中寻找尚未失败的其他健康线路（优先选择 443 纯净健康源）
    const validCandidates = groupedSources.filter(
      (s) => s.source && s.source !== currentActiveSource && !failedSourcesRef.current.has(s.source)
    );
    const candidate = validCandidates.sort((a, b) => {
      const TOP_ORDER: Record<string, number> = { wujin: 1, zuida: 2, guangsu: 3, modu: 4, zy360: 5 };
      const aOrder = TOP_ORDER[a.source] ?? 99;
      const bOrder = TOP_ORDER[b.source] ?? 99;
      if (aOrder !== bOrder) return aOrder - bOrder;
      const badSet = new Set(['baofeng', 'jisu', 'xinlang', 'subo', 'ikun', 'haitun', 'hongniu', 'huya', 'jinying', 'jingyu']);
      const aBad = badSet.has(a.source);
      const bBad = badSet.has(b.source);
      if (aBad !== bBad) return aBad ? 1 : -1;
      return 0;
    })[0];

    if (candidate) {
      console.info(`[Auto-Fallback] 线路 ${currentActiveSource} 异常，正在自动无缝切换至健康线路: ${candidate.sourceName} (${candidate.source})`);
      const params = new URLSearchParams();
      params.set('id', String(candidate.id));
      params.set('source', candidate.source);
      params.set('title', title || '');
      if (expectedType) params.set('type', expectedType);
      if (expectedYear) params.set('year', expectedYear);
      params.set('episode', currentEpisode.toString());
      if (playerTimeRef.current > 1) {
        params.set('t', Math.floor(playerTimeRef.current).toString());
      }
      if (groupedSources.length > 0) {
        params.set('groupedSources', JSON.stringify(groupedSources));
      }
      if (isPremium) {
        params.set('premium', '1');
      }
      setCurrentSourceId(candidate.source);
      router.replace(`/player?${params.toString()}`, { scroll: false });
      return true; // 成功接管自愈
    }

    // 若无其他已发现的备用线路，返回 false 让 VideoPlayer 自动尝试智能代理 (proxyMode: retry) 救活非标端口切片或跨域被拦截的片源
    return false;
  }, [currentSourceId, source, groupedSources, title, expectedType, expectedYear, currentEpisode, isPremium, router]);



  // Add initial history entry when video data is loaded
  useEffect(() => {
    if (videoData && playUrl && videoId) {
      // Map episodes to include index
      const mappedEpisodes = videoData.episodes?.map((ep, idx) => ({
        name: ep.name || `第${idx + 1}集`,
        url: ep.url,
        index: idx,
      })) || [];

      addToHistory(
        videoId,
        videoData.vod_name || title || '未知视频',
        playUrl,
        currentEpisode,
        source || '',
        0, // Initial playback position
        0, // Will be updated by VideoPlayer
        videoData.vod_pic,
        mappedEpisodes,
        { vod_actor: videoData.vod_actor, type_name: videoData.type_name, vod_area: videoData.vod_area, isPremium }
      );
    }
  }, [videoData, playUrl, videoId, currentEpisode, source, title, isPremium, addToHistory]);

  const handleEpisodeClick = useCallback((episode: any, index: number) => {
    setCurrentEpisode(index);
    setPlayUrl(episode.url);
    setVideoError('');

    // Update URL to reflect current episode
    const params = new URLSearchParams(searchParams.toString());
    params.set('episode', index.toString());
    router.replace(`/player?${params.toString()}`, { scroll: false });
  }, [searchParams, router, setCurrentEpisode, setPlayUrl, setVideoError]);

  const handleToggleReverse = (reversed: boolean) => {
    setIsReversed(reversed);
    const settings = modeStore.getSettings();
    modeStore.saveSettings({
      ...settings,
      episodeReverseOrder: reversed
    });
  };

  // Handle auto-next episode
  const handleNextEpisode = useCallback(() => {
    const episodes = videoData?.episodes;
    if (!episodes) return;

    let nextIndex;
    if (!isReversed) {
      if (currentEpisode >= episodes.length - 1) return;
      nextIndex = currentEpisode + 1;
    } else {
      if (currentEpisode <= 0) return;
      nextIndex = currentEpisode - 1;
    }

    const nextEpisode = episodes[nextIndex];
    if (nextEpisode) {
      handleEpisodeClick(nextEpisode, nextIndex); // handleEpisodeClick relies on state setters, which are stable
    }
  }, [videoData, currentEpisode, isReversed, router, searchParams]);

  // 计算下一集的播放 URL（用于预加载）
  const nextEpisodeUrl = useMemo(() => {
    const episodes = videoData?.episodes;
    if (!episodes || episodes.length <= 1) return null;
    const nextIdx = isReversed ? currentEpisode - 1 : currentEpisode + 1;
    if (nextIdx < 0 || nextIdx >= episodes.length) return null;
    const nextEp = episodes[nextIdx];
    return nextEp?.url || null;
  }, [videoData, currentEpisode, isReversed]); // handleEpisodeClick is not memoized, but uses stable hooks setters. wait, handleEpisodeClick is inline too!

  // 构建 Google 富媒体 Schema.org 结构化数据 (JSON-LD)
  const currentTitle = videoData?.vod_name || title || '热门影视';

  // 动态同步浏览器标签页 Title，彻底隔离 iKanX 与 iKanPP 品牌
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (isPremium) {
      document.title = `${currentTitle} - iKanX 4K极速秒播`;
    } else {
      document.title = `${currentTitle} - 4K超清免翻极速播放 | iKanPP 爱看片片`;
    }
  }, [currentTitle, isPremium]);
  const isMovieType = expectedType === 'movie' || (!expectedType && (videoData?.type_name?.includes('电影') || videoData?.episodes?.length === 1));
  const mediaType: 'movie' | 'tv' | 'anime' = isMovieType ? 'movie' : (videoData?.type_name?.includes('动漫') || videoData?.type_name?.includes('动画') ? 'anime' : 'tv');

  const jsonLdData = useMemo(() => {
    // 严密保护主站 SEO 与 GEO：午夜成人播放页 100% 禁止生成 iKanPP 结构化数据与外链
    if (isPremium) return null;

    const mediaLd = generateMediaJsonLd({
      title: currentTitle,
      type: mediaType,
      url: typeof window !== 'undefined' ? window.location.href : `https://www.ikanpp.com/player?title=${encodeURIComponent(currentTitle)}`,
      image: videoData?.vod_pic,
      description: videoData?.vod_content?.replace(/<[^>]+>/g, '').slice(0, 160) || `在 iKanPP 免费在线观看《${currentTitle}》高清完整版。`,
      datePublished: videoData?.vod_year || undefined,
      actors: videoData?.vod_actor ? videoData.vod_actor.split(/[,，/ ]/).map(s => s.trim()).filter(Boolean).slice(0, 5) : undefined,
      director: videoData?.vod_director?.split(/[,，/ ]/)[0]?.trim() || undefined,
      numberOfEpisodes: videoData?.episodes?.length || undefined,
    });

    const breadcrumbLd = generateBreadcrumbJsonLd([
      { name: '首页', url: 'https://www.ikanpp.com/' },
      { name: isMovieType ? '电影' : '电视剧', url: `https://www.ikanpp.com/${isMovieType ? 'movie' : 'tv'}` },
      { name: currentTitle, url: typeof window !== 'undefined' ? window.location.href : `https://www.ikanpp.com/player?title=${encodeURIComponent(currentTitle)}` },
    ]);

    return [mediaLd, breadcrumbLd];
  }, [currentTitle, mediaType, isMovieType, videoData, isPremium]);

  // 核心返回路由处理器（午夜版绝对定向到 /premium，频道专属来源绝对返回该频道大厅，普通版安全后退）
  const handleBack = useCallback(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('ikanpp_playing_from_hub');
    }
    if (isPremium) {
      router.push('/');
      return;
    }
    const fromChannel = searchParams.get('from');
    if (fromChannel) {
      router.push(fromChannel.startsWith('/') ? fromChannel : `/${fromChannel}`);
      return;
    }
    const lastHub = typeof window !== 'undefined' ? sessionStorage.getItem('ikanpp_last_hub') : null;
    if (lastHub && lastHub !== '/') {
      router.push(lastHub);
      return;
    }
    if (typeof window !== 'undefined' && window.history.length > 1 && document.referrer.includes(window.location.host)) {
      router.back();
    } else {
      router.push('/');
    }
  }, [isPremium, searchParams, router]);

  // 记录当前播放来源频道，并为手机浏览器手势滑动返回建立守卫锚点
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isPremium) {
      sessionStorage.setItem('ikanpp_playing_from_hub', '/');
    } else {
      const from = searchParams.get('from');
      if (from) {
        sessionStorage.setItem('ikanpp_playing_from_hub', from.startsWith('/') ? from : `/${from}`);
      }
    }
  }, [isPremium, searchParams]);

  // Redirect if no params at all
  if (isTitleOnlyMode && !titleSearching && !titleSearchError && !title) {
    const fromChannel = searchParams.get('from');
    router.push(isPremium ? '/' : (fromChannel ? `/${fromChannel}` : '/'));
    return null;
  }

  return (
    <div className="min-h-screen bg-(--bg-color)">
      {/* Google 富媒体 SEO JSON-LD */}
      {jsonLdData && <JsonLd data={jsonLdData} />}

      {/* Glass Navbar */}
      <Navbar variant="player" isPremiumMode={isPremium} />

      <main className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 pt-1 sm:pt-2 pb-24">
        {isTitleOnlyMode && titleSearching ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-(--accent-color) border-t-transparent mb-6"></div>
            <p className="text-lg font-medium text-(--text-color)">正在搜索最佳片源...</p>
            <p className="text-sm text-(--text-color-secondary) mt-2">{title}</p>
          </div>
        ) : isTitleOnlyMode && titleSearchError ? (
          <PlayerError
            error={titleSearchError}
            onBack={handleBack}
            onRetry={() => {
              setTitleSearchError('');
              setTitleSearching(true);
              window.location.reload();
            }}
          />
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-(--accent-color) border-t-transparent mb-4"></div>
            <p className="text-(--text-color-secondary)">正在加载视频详情...</p>
          </div>
        ) : videoError && !videoData ? (
          <PlayerError
            error={videoError}
            onBack={handleBack}
            onRetry={fetchVideoDetails}
          />
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Video Player Section */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              <VideoPlayer
                playUrl={playUrl}
                videoId={videoId || undefined}
                currentEpisode={currentEpisode}
                onBack={handleBack}
                totalEpisodes={videoData?.episodes?.length || 0}
                onNextEpisode={handleNextEpisode}
                isReversed={isReversed}
                isPremium={isPremium}
                videoTitle={videoData?.vod_name || title || ''}
                episodeName={videoData?.episodes?.[currentEpisode]?.name || ''}
                externalTimeRef={playerTimeRef}
                nextEpisodeUrl={nextEpisodeUrl}
                onPlaybackError={handlePlaybackError}
              />

              {/* 桌面端完整详情 */}
              <div className="hidden lg:block">
                <VideoMetadata
                  videoData={videoData}
                  source={source}
                  title={title}
                />
              </div>

              {/* 桌面端收藏、线路快捷指示与分享按钮 */}
              {videoData && videoId && (
                <div className="hidden lg:flex items-center gap-3 mt-4">
                  <FavoriteButton
                    videoId={videoId}
                    source={source || ''}
                    title={videoData.vod_name || title || '未知视频'}
                    poster={videoData.vod_pic}
                    type={videoData.type_name}
                    year={videoData.vod_year}
                    size={20}
                    isPremium={isPremium}
                  />
                  <span className="text-sm text-(--text-color-secondary)">
                    收藏这个视频
                  </span>
                  <div className="ml-auto flex items-center gap-3">
                    {source && (
                      <button
                        type="button"
                        onClick={() => {
                          const el = document.getElementById('source-selector-section');
                          if (el) {
                            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-xs text-purple-200 hover:text-white transition-all cursor-pointer font-medium"
                        title="点击平滑定位至右侧多线路面板"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>正在播放：{getSourceName(source)}</span>
                        {groupedSources.length > 1 && (
                          <span className="text-purple-300/80 text-[11px] font-bold">
                            ({groupedSources.length} 条专线可用 ⇄)
                          </span>
                        )}
                      </button>
                    )}
                    <ShareButton
                      title={videoData.vod_name || title || ''}
                      poster={videoData.vod_pic}
                      episodeName={videoData.episodes?.[currentEpisode]?.name}
                      year={videoData.vod_year}
                      type={videoData.type_name}
                      size={20}
                    />
                  </div>
                </div>
              )}


            </div>

            {/* Sidebar with sticky wrapper */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-28 space-y-4 sm:space-y-6">
                {/* 线路选择与选集面板（移动端在播放器下方无缝直接展现，无需多余 Tab） */}
                <EpisodeList
                  episodes={videoData?.episodes || null}
                  currentEpisode={currentEpisode}
                  isReversed={isReversed}
                  onEpisodeClick={handleEpisodeClick}
                  onToggleReverse={handleToggleReverse}
                  sources={groupedSources.length > 0 ? groupedSources : undefined}
                  currentSource={currentSourceId || source || ''}
                  onSourceChange={(newSource) => {
                      const params = new URLSearchParams();
                      params.set('id', String(newSource.id));
                      params.set('source', newSource.source);
                      params.set('title', title || '');
                      if (expectedType) params.set('type', expectedType);
                      if (expectedYear) params.set('year', expectedYear);
                      // Preserve current episode index
                      params.set('episode', currentEpisode.toString());
                      // Preserve playback position for seamless source switch
                      if (playerTimeRef.current > 1) {
                        params.set('t', Math.floor(playerTimeRef.current).toString());
                      }
                      // Pass all known sources so switching persists
                      const allSources = groupedSources.length > 0 ? groupedSources : [];
                      if (allSources.length > 1) {
                        params.set('groupedSources', JSON.stringify(allSources));
                      } else if (groupedSourcesParam) {
                        params.set('groupedSources', groupedSourcesParam);
                      }
                      if (isPremium) {
                        params.set('premium', '1');
                      }
                      setCurrentSourceId(newSource.source);
                      router.replace(`/player?${params.toString()}`, { scroll: false });
                    }}
                  />
              </div>
            </div>
          </div>
        )}

        {/* 底部：同类口碑影视精选推荐 */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <ContentRail
            title="🍿 喜欢这部影视的观众还在看"
            icon="✨"
            badge="RECOMMENDED"
            movies={relatedMovies}
            loading={loadingRelated}
            onMovieClick={(movie) => {
              const params = new URLSearchParams();
              params.set('title', movie.title);
              if (isPremium) params.set('premium', '1');
              router.push(`/player?${params.toString()}`);
            }}
          />
        </div>
      </main>

      {/* Favorites Sidebar - Left */}
      <FavoritesSidebar isPremium={isPremium} />

    </div>
  );
}

export default function PlayerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-(--bg-color)">
        <div className="brand-spinner" />
      </div>
    }>
      <PlayerContent />
    </Suspense>
  );
}
