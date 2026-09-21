'use client';

import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { VideoPlayer } from '@/components/player/VideoPlayer';
import { VideoMetadata } from '@/components/player/VideoMetadata';
import { EpisodeList, SourceInfo } from '@/components/player/EpisodeList';
import { PlayerError } from '@/components/player/PlayerError';
import { ClassicNoSourceState } from '@/components/player/ClassicNoSourceState';
import type { VideoSource } from '@/lib/types';
import { useVideoPlayer } from '@/lib/hooks/useVideoPlayer';
import { useHistoryStore } from '@/lib/store/history-store';
import { FavoritesSidebar } from '@/components/favorites/FavoritesSidebar';
import { FavoriteButton } from '@/components/favorites/FavoriteButton';
import { ShareButton } from '@/components/player/ShareButton';
import { Navbar } from '@/components/layout/Navbar';
import { settingsStore } from '@/lib/store/settings-store';
import { DEFAULT_SOURCES } from '@/lib/api/default-sources';
import { DEPRECATED_SOURCES, isValidSourceId } from '@/lib/api/video-sources';
import { getSourceName } from '@/lib/utils/source-names';
import { storeGroupedSources, retrieveGroupedSources } from '@/lib/utils/grouped-sources-cache';
import { ContentRail, RailMovie } from '@/components/home/ContentRail';
import Link from 'next/link';
import Image from 'next/image';
import { Tv, Clapperboard, Sparkles, User, Star, Film, MonitorPlay, Layers, CheckCircle2 } from 'lucide-react';
import { JsonLd, generateMediaJsonLd, generateBreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { PREBAKED_AVATARS } from '@/lib/data/prebaked-avatars';
import { extractSeasonAndEpisodeNumber, cleanEpisodeName, formatEpisodeGridLabel } from '@/lib/utils/episode-resolver';
import { FloatingMiniPlayer } from '@/components/player/FloatingMiniPlayer';

interface TitleAnalysis {
  rawTitle: string;
  pureTitle: string;
  seasonNumber: number | null;
  subtitles: string[];
}

function analyzeTitle(titleStr: string): TitleAnalysis {
  const raw = (titleStr || '').trim();

  let seasonNumber: number | null = null;
  const sMatch = raw.match(/第([一二三四五六七八九十\d]+)[季部期]/i) || 
                 raw.match(/\bseason\s*(\d+)\b/i) || 
                 raw.match(/\bS(\d{1,2})\b/i);
  if (sMatch) {
    const sStr = sMatch[1];
    const cnMap: Record<string, number> = { '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10 };
    seasonNumber = cnMap[sStr] ?? (parseInt(sStr, 10) || null);
  }

  // 提取冒号、空格、破折号拆解的有效子词（如 "爱情公寓：辣味英雄传" 拆解为 ["爱情公寓", "辣味英雄传"]）
  const subtitles = raw
    .split(/[:：·•\-\s_／/]+/)
    .map(s => s.replace(/[《》【】\[\]（）()]/g, '').trim().toLowerCase())
    .filter(s => s.length >= 2);

  const pure = raw
    .replace(/[\(（]?(19\d\d|20\d\d)[\)）]?/g, '')
    .replace(/第[一二三四五六七八九十\d]+[季部期]/gi, '')
    .replace(/season\s*\d+/gi, '')
    .replace(/\bS\d{1,2}\b/gi, '')
    .replace(/(前篇|后篇|最终季|终章|完结篇|序章|特别篇|剧场版|番外篇|番外|大电影|电影版|真人版|动画版|重制版|重置版|精选版|典藏版)/gi, '')
    .replace(/(国语版|粤语版|双语版|原声版|中字版|纯享版|未删减版|加长版)/gi, '')
    .replace(/[《》【】\[\]（）()·\s:：\-—_]/g, '')
    .replace(/(19\d\d|20\d\d)$/g, '') // 🌟 核心防线：剥离末尾紧随的4位年份（如"生化危机：爆发夜2026" -> "生化危机爆发夜"）
    .toLowerCase()
    .trim();

  return { rawTitle: raw, pureTitle: pure, seasonNumber, subtitles };
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

export function IkanPPPlayerContainer() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const addToHistory = useHistoryStore((s) => s.addToHistory);

  const rawVideoId = searchParams.get('id');
  const rawSource = searchParams.get('source');
  const title = searchParams.get('title');
  const entityParam = searchParams.get('entity');
  const episodeParam = searchParams.get('episode') || searchParams.get('ep');
  const seasonParam = searchParams.get('season');
  const epCountParam = searchParams.get('epCount');
  const groupedSourcesParam = searchParams.get('groupedSources');
  const gsKeyParam = searchParams.get('gsKey');
  const expectedType = searchParams.get('type');
  const expectedYear = searchParams.get('year');

  // 若传入的线路已知废弃（如 ole_vip）或不合法，直接丢弃该废弃线路与 ID，自动触发 Title-only 骨干秒播仲裁
  const isSourceDeprecated = rawSource ? DEPRECATED_SOURCES.has(rawSource) : false;
  const isSourceValid = rawSource ? (isValidSourceId(rawSource) && !isSourceDeprecated) : false;
  const videoId = (rawSource && !isSourceValid) ? null : rawVideoId;
  const source = isSourceValid ? rawSource : null;

  const [relatedMovies, setRelatedMovies] = useState<RailMovie[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(true);
  const [entityPoster, setEntityPoster] = useState<string | null>(null);
  const [entityRating, setEntityRating] = useState<string | number | null>(null);

  useEffect(() => {
    if (entityParam) {
      fetch(`/api/detail?id=${entityParam}`)
        .then(r => r.json())
        .then(d => {
          if (d.data?.cover) setEntityPoster(d.data.cover);
          if (d.data?.score || d.data?.rating) setEntityRating(d.data.score || d.data.rating);
        })
        .catch(() => {});
    }
  }, [entityParam]);

  // === Title-only 模式：300ms 毫秒级流式秒播仲裁 ===
  const needsTitleSearch = (!videoId || !source) && !!title;
  const [titleSearching, setTitleSearching] = useState(() => needsTitleSearch);
  const [titleSearchError, setTitleSearchError] = useState('');

  useEffect(() => {
    if ((videoId && source) || !title) return;

    let cancelled = false;
    setTitleSearching(true);
    setTitleSearchError('');

    const appSettings = settingsStore.getSettings();
    let allSources = appSettings.sources?.filter((s: VideoSource) => s.enabled !== false) || [];
    if (allSources.length === 0) {
      allSources = DEFAULT_SOURCES as VideoSource[];
    }

    // 过滤掉已下线的废弃源和已知失败源
    allSources = allSources.filter(s => !DEPRECATED_SOURCES.has(s.id) && !failedSourcesRef.current.has(s.id));

    if (source) {
      const preferredSource = allSources.find(s => s.id === source);
      if (preferredSource) {
        allSources = [preferredSource, ...allSources.filter(s => s.id !== source)];
      }
    }

    const cleanTitle = title.replace(/[《》【】\[\]（）()]/g, ' ').replace(/\s+/g, ' ').trim();
    let redirected = false;
    const searchStartTime = Date.now();

    (async () => {
      try {
        const response = await fetch('/api/search-parallel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: cleanTitle, sources: allSources, page: 1 }),
        });

        if (cancelled) return;

        if (!response.ok || !response.body) {
          if (!cancelled && !redirected) {
            setTitleSearchError('全网搜索暂时繁忙，请点击重试');
            setTitleSearching(false);
          }
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        const foundSources: SourceInfo[] = [];

        const targetAnalysis = analyzeTitle(title);
        const targetYear = expectedYear ? parseInt(expectedYear, 10) : null;
        const fallbackCandidates: Array<{ _video: any; _score: number; _isSeries: boolean }> = [];

        const performRedirect = (targetVideo: any, isSeries: boolean) => {
          if (redirected || cancelled) return;
          redirected = true;
          const params = new URLSearchParams();
          params.set('id', String(targetVideo.vod_id));
          params.set('source', targetVideo.source);
          params.set('title', title);
          if (entityParam) params.set('entity', entityParam);
          if (episodeParam) {
            params.set('episode', episodeParam);
          }
          if (seasonParam) {
            params.set('season', seasonParam);
          }
          const resolvedType = isSeries ? 'tv' : (expectedType || 'movie');
          params.set('type', resolvedType);
          if (expectedYear) params.set('year', expectedYear);
          if (foundSources.length > 0) {
            const gsKey = storeGroupedSources(foundSources);
            if (gsKey) params.set('gsKey', gsKey);
          }
          router.replace(`/player?${params.toString()}`, { scroll: false });
        };

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
                  const candAnalysis = analyzeTitle(rawName);

                  const isTrailer = remarks.includes('预告') || rawName.includes('预告') || remarks.includes('花絮') || rawName.includes('花絮');
                  const isCommentary = rawName.includes('解说') || remarks.includes('解说') || rawName.includes('看点');
                  const isMusical = rawName.includes('音乐剧') || rawName.includes('舞台剧') || remarks.includes('音乐剧');

                  let candYear: number | null = null;
                  if (v.vod_year) {
                    const parsed = parseInt(String(v.vod_year).trim(), 10);
                    if (!isNaN(parsed) && parsed > 1900 && parsed < 2100) candYear = parsed;
                  }
                  if (!candYear) {
                    const ym = rawName.match(/\b(19\d\d|20\d\d)\b/);
                    if (ym) candYear = parseInt(ym[1], 10);
                  }

                  let isExactYearMatch = false;
                  let yearScore = 0;
                  let isYearMismatched = false;

                  if (targetYear) {
                    if (candYear) {
                      if (candYear === targetYear) {
                        yearScore = 150;
                        isExactYearMatch = true;
                      } else if (Math.abs(candYear - targetYear) === 1) {
                        yearScore = 80;
                      } else if (Math.abs(candYear - targetYear) <= 2) {
                        yearScore = 30;
                      } else {
                        yearScore = -300;
                        isYearMismatched = true;
                      }
                    } else {
                      yearScore = 20;
                    }
                  }

                  const isSeriesItem = isSeriesTypeName(v.type_name || '') || (v.vod_remarks && /更新|全\d+集|第\d+集|连载/i.test(v.vod_remarks)) || candAnalysis.seasonNumber !== null;

                  // 🌟 核心防线：影视类型硬性隔离门禁（电影与连续剧绝对隔离）
                  let typeScore = 0;
                  let isTypeMismatched = false;
                  if (expectedType === 'movie' && isSeriesItem) {
                    typeScore = -800;
                    isTypeMismatched = true;
                  } else if (expectedType === 'tv' && !isSeriesItem && !seasonParam) {
                    typeScore = -120;
                  }

                  let nameScore = 0;
                  let isExactName = false;
                  let isHighConfidenceMatch = false;

                  if (candAnalysis.pureTitle === targetAnalysis.pureTitle) {
                    isExactName = true;
                    if (isSeriesItem) {
                      if (targetAnalysis.seasonNumber !== null) {
                        if (candAnalysis.seasonNumber === targetAnalysis.seasonNumber) {
                          nameScore = 180;
                        } else {
                          nameScore = 60;
                        }
                      } else {
                        if (candAnalysis.seasonNumber === 1 || candAnalysis.seasonNumber === null) {
                          nameScore = 160;
                        } else {
                          nameScore = 100;
                        }
                      }
                    } else {
                      nameScore = 140;
                    }
                  } else {
                    // 二级高置信度模糊匹配：
                    // A. 目标有特异副标题时，候选必须包含该特异副标题（如目标"生化危机：爆发夜"，候选必须包含"爆发夜"）
                    const hasSharedSpecificSubtitle = targetAnalysis.subtitles.length > 1
                      ? targetAnalysis.subtitles.slice(1).some(st => st.length >= 2 && candAnalysis.pureTitle.includes(st))
                      : targetAnalysis.subtitles.some(st => st.length >= 3 && candAnalysis.pureTitle.includes(st));

                    // B. 纯片名互相包含且重合长度 >= 3，但严格防范短母题吞噬长子题与短片名被长片名反向吞噬（杜绝 2 字"希望"被 6 字"有希望的男人"冒充）
                    const lenDiff = Math.abs(candAnalysis.pureTitle.length - targetAnalysis.pureTitle.length);
                    const isCandValidLonger = candAnalysis.pureTitle.includes(targetAnalysis.pureTitle) && (
                      targetAnalysis.pureTitle.length > 3
                        ? lenDiff <= 4
                        : (lenDiff <= 1 || candAnalysis.pureTitle.replace(/(19\d\d|20\d\d)$/, '') === targetAnalysis.pureTitle)
                    );
                    const isTargetValidLonger = targetAnalysis.pureTitle.includes(candAnalysis.pureTitle) && lenDiff <= 1;
                    const isSubstringOverlap = isCandValidLonger || isTargetValidLonger;

                    if (hasSharedSpecificSubtitle || isSubstringOverlap) {
                      isHighConfidenceMatch = true;
                      nameScore = hasSharedSpecificSubtitle ? 140 : 110;
                    } else if (
                      targetAnalysis.subtitles.length <= 1 &&
                      targetAnalysis.pureTitle.length > 3 &&
                      ((candAnalysis.pureTitle.length >= 4 && targetAnalysis.pureTitle.includes(candAnalysis.pureTitle)) ||
                       (targetAnalysis.pureTitle.length >= 4 && candAnalysis.pureTitle.includes(targetAnalysis.pureTitle)))
                    ) {
                      nameScore = 50;
                    } else {
                      nameScore = -300;
                    }
                  }

                  let qualityScore = 0;
                  if (remarks.includes('4k') || remarks.includes('2160')) qualityScore += 30;
                  if (remarks.includes('1080') || remarks.includes('hd') || remarks.includes('正片')) qualityScore += 20;
                  if (isTrailer || isCommentary) qualityScore -= 500;
                  if (isMusical) qualityScore -= 400;

                  let episodeScore = 0;
                  let isEpisodeInsufficient = false;
                  if (episodeParam && isSeriesItem) {
                    const reqEpNum = parseInt(episodeParam, 10);
                    if (!isNaN(reqEpNum) && reqEpNum > 0) {
                      let maxEpInSource: number | null = null;
                      const epMatch = remarks.match(/(?:更新至|更新到|连载至|连载到|全|共|ep)\s*(?:第)?\s*(\d+)\s*(?:集|话|期)?/i) ||
                                      remarks.match(/第\s*(\d+)\s*(?:集|话|期)/i) ||
                                      remarks.match(/(\d+)\s*(?:集|话)/i);
                      if (epMatch) {
                        const parsed = parseInt(epMatch[1], 10);
                        if (!isNaN(parsed) && parsed > 0 && parsed < 2000) {
                          maxEpInSource = parsed;
                        }
                      }
                      if (maxEpInSource !== null) {
                        if (maxEpInSource >= reqEpNum) {
                          episodeScore = 60;
                        } else {
                          episodeScore = -500;
                          isEpisodeInsufficient = true;
                        }
                      }
                    }
                  }

                  let sourceScore = 0;
                  // 黄金调度优先级：巨量香港Anycast纯净全站No.1首选，光速全球高速高可用第二首选，暴风高并发第三首选，无尽、最大紧随其后
                  if (v.source === 'juliang') sourceScore = 160;
                  else if (v.source === 'guangsu') sourceScore = 140;
                  else if (v.source === 'baofeng') sourceScore = 130;
                  else if (v.source === 'zuida') sourceScore = 120;
                  else if (v.source === 'wujin') sourceScore = 110;
                  else if (v.source === 'jisu') sourceScore = 90;
                  else if (v.source === 'xinlang') sourceScore = 80;
                  else if (v.source === 'modu') sourceScore = 60;
                  else if (v.source === 'zy360') sourceScore = 50;

                  const totalScore = nameScore + yearScore + qualityScore + episodeScore + sourceScore + typeScore;

                  // 记录非预告片的所有相关备选源，用于最终兜底保障
                  if (!isTrailer && !isCommentary && !isMusical && !isTypeMismatched && totalScore > 0) {
                    fallbackCandidates.push({ _video: v, _score: totalScore, _isSeries: isSeriesItem });
                  }

                  const isNameMatched = isExactName || isHighConfidenceMatch;
                  const isStrictCandidate = !isTrailer && !isCommentary && !isMusical && !isYearMismatched && !isTypeMismatched && isNameMatched && !isEpisodeInsufficient &&
                    (isSeriesItem || !targetYear || !candYear || Math.abs(candYear - targetYear) <= 2);

                  if (isStrictCandidate) {
                    const existingIdx = foundSources.findIndex(s => s.source === v.source);
                    const newSourceItem: SourceInfo & { _score?: number; _video?: any; _isSeries?: boolean } = {
                      id: v.vod_id,
                      source: v.source,
                      sourceName: v.sourceDisplayName || getSourceName(v.source),
                      latency: v.latency,
                      pic: v.vod_pic,
                      typeName: v.type_name,
                      _score: totalScore,
                      _video: v,
                      _isSeries: isSeriesItem,
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

                  // 极速秒播裁决：
                  // 1. 全站 No.1 黄金首选巨量资源 (juliang) 无论何时到达，只要匹配立即秒播直出；
                  // 2. 光速/暴风/最大等高质量骨干源 (totalScore >= 100)：给巨量 800ms 优先冲刺窗口，若巨量超时仍未到达则弹性秒播直出，拒绝白屏干等！
                  const isQualified = !isTrailer && !isCommentary && !isMusical && !isYearMismatched && !isTypeMismatched && isNameMatched && !isEpisodeInsufficient && totalScore >= 70;
                  if (isQualified && !redirected && !cancelled) {
                    const isSeasonOrYearMatched = 
                      (isSeriesItem && (targetAnalysis.seasonNumber !== null ? candAnalysis.seasonNumber === targetAnalysis.seasonNumber : (candAnalysis.seasonNumber === 1 || candAnalysis.seasonNumber === null))) ||
                      (!isSeriesItem && (isExactYearMatch || !targetYear || !candYear || Math.abs(candYear - (targetYear || 0)) <= 2));

                    if (isSeasonOrYearMatched) {
                      const elapsed = Date.now() - searchStartTime;
                      const isJuliang = v.source === 'juliang';
                      const isHighQualityBackbone = (v.source === 'guangsu' || v.source === 'baofeng' || v.source === 'zuida') && totalScore >= 100;

                      if (isJuliang || (isHighQualityBackbone && elapsed > 800)) {
                        performRedirect(v, isSeriesItem);
                        break;
                      }
                    }
                  }
                }
              }
            } catch { /* ignore */ }
          }
          if (redirected) break;
        }

        if (!redirected && !cancelled) {
          if (foundSources.length > 0) {
            const best = (foundSources as any[]).sort((a, b) => (b._score ?? 0) - (a._score ?? 0))[0];
            if (best?._video) {
              performRedirect(best._video, best._isSeries ?? false);
            } else {
              tryFallbackPlay();
            }
          } else {
            tryFallbackPlay();
          }
        }

        function tryFallbackPlay() {
          if (fallbackCandidates.length > 0) {
            const bestFallback = fallbackCandidates.sort((a, b) => b._score - a._score)[0];
            if (bestFallback?._video) {
              performRedirect(bestFallback._video, bestFallback._isSeries);
              return;
            }
          }
          setTitleSearchError('未找到与该片名匹配的高质量正片片源，请尝试精确片名搜索');
          setTitleSearching(false);
        }
      } catch (err: any) {
        if (!cancelled && !redirected) {
          setTitleSearchError(err.message || '全网搜索失败，请点击重试');
          setTitleSearching(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [videoId, title, source, expectedYear, expectedType, episodeParam, router]);

  // === 播放核心状态 ===
  const [currentSourceId, setCurrentSourceId] = useState<string>(source || '');
  const [isReversed, setIsReversed] = useState(() => {
    return settingsStore.getSettings().episodeReverseOrder || false;
  });

  const failedSourcesRef = useRef<Set<string>>(new Set());
  const handleSourceUnavailable = useCallback(() => {
    if (source) {
      failedSourcesRef.current.add(source);
    }
  }, [source]);

  const {
    videoData,
    playUrl,
    loading,
    videoError,
    currentEpisode,
    setCurrentEpisode,
    setPlayUrl,
    setVideoError,
    fetchVideoDetails,
  } = useVideoPlayer(videoId || '', source || '', episodeParam, isReversed, handleSourceUnavailable, title, seasonParam);

  const [discoveredSources, setDiscoveredSources] = useState<SourceInfo[]>([]);

  const groupedSources = useMemo<SourceInfo[]>(() => {
    let rawList: SourceInfo[] = [];
    if (gsKeyParam) {
      const cached = retrieveGroupedSources(gsKeyParam);
      if (cached && Array.isArray(cached)) {
        rawList = cached;
      }
    }
    if (rawList.length === 0 && groupedSourcesParam) {
      try {
        rawList = JSON.parse(groupedSourcesParam);
      } catch {
        rawList = [];
      }
    }

    if (discoveredSources.length > 0) {
      rawList.push(...discoveredSources);
    }

    if (source) {
      rawList.unshift({
        id: videoId || '',
        source: source,
        sourceName: getSourceName(source),
        pic: videoData?.vod_pic
      });
    }

    const sourceMap = new Map<string, SourceInfo>();
    for (const s of rawList) {
      if (s && s.source && !sourceMap.has(s.source)) {
        sourceMap.set(s.source, s);
      }
    }

    let sources = Array.from(sourceMap.values());
    const fallbackPic = videoData?.vod_pic;
    if (fallbackPic) {
      sources = sources.map(s => s.pic ? s : { ...s, pic: fallbackPic });
    }
    return sources;
  }, [groupedSourcesParam, gsKeyParam, source, videoId, videoData?.vod_pic, discoveredSources]);

  // === 终端自愈防线三：当指定线路获取失败且有片名时，自动平滑切源或秒播仲裁自愈 ===
  const autoHealTriggeredRef = useRef(false);
  useEffect(() => {
    if (videoError && !videoData && title && !autoHealTriggeredRef.current) {
      autoHealTriggeredRef.current = true;
      if (source) {
        failedSourcesRef.current.add(source);
      }

      // 1. 若已有健康备选线路，立即平滑切换到下一条健康线路
      if (groupedSources.length > 0) {
        const nextCandidate = groupedSources.find(
          s => s.source && s.source !== source && !failedSourcesRef.current.has(s.source) && isValidSourceId(s.source)
        );
        if (nextCandidate) {
          const params = new URLSearchParams(searchParams.toString());
          params.set('id', String(nextCandidate.id));
          params.set('source', nextCandidate.source);
          router.replace(`/player?${params.toString()}`, { scroll: false });
          return;
        }
      }

      // 2. 清除失效的 id 与 source 参数，自动转入秒播仲裁重新匹配骨干线路
      const params = new URLSearchParams();
      params.set('title', title);
      if (entityParam) params.set('entity', entityParam);
      if (episodeParam) params.set('episode', episodeParam);
      if (expectedType) params.set('type', expectedType);
      if (expectedYear) params.set('year', expectedYear);
      router.replace(`/player?${params.toString()}`, { scroll: false });
    }
  }, [videoError, videoData, title, source, groupedSources, searchParams, entityParam, episodeParam, expectedType, expectedYear, router]);

  // === 终端自愈防线四：串台脱靶自愈拦截（杜绝电影误播放同名母题连续剧） ===
  const misdirectHealTriggeredRef = useRef(false);
  useEffect(() => {
    if (!videoData || !title || misdirectHealTriggeredRef.current) return;

    if (expectedType === 'movie') {
      const loadedIsSeries = (videoData.episodes && videoData.episodes.length > 2) || isSeriesTypeName(videoData.type_name || '');
      const targetAnalysis = analyzeTitle(title);
      const loadedAnalysis = analyzeTitle(videoData.vod_name || '');

      const hasSpecificSubtitle = targetAnalysis.subtitles.length > 1;
      const loadedMatchesSubtitle = hasSpecificSubtitle
        ? targetAnalysis.subtitles.slice(1).some(st => st.length >= 2 && loadedAnalysis.pureTitle.includes(st))
        : loadedAnalysis.pureTitle === targetAnalysis.pureTitle;

      if (loadedIsSeries && !loadedMatchesSubtitle) {
        console.warn(`[Player] Detected series-movie mismatch: target '${title}' (movie) but loaded '${videoData.vod_name}'. Auto-healing...`);
        misdirectHealTriggeredRef.current = true;
        if (source) {
          failedSourcesRef.current.add(source);
        }
        const params = new URLSearchParams();
        params.set('title', title);
        if (entityParam) params.set('entity', entityParam);
        params.set('type', 'movie');
        if (expectedYear) params.set('year', expectedYear);
        router.replace(`/player?${params.toString()}`, { scroll: false });
      }
    }
  }, [videoData, title, expectedType, expectedYear, source, entityParam, router]);

  // 后台补充更多可用源（无感异步）
  useEffect(() => {
    if (!title || needsTitleSearch) return;

    let existingSources: SourceInfo[] = [];
    if (gsKeyParam) {
      const cached = retrieveGroupedSources(gsKeyParam);
      if (cached && Array.isArray(cached)) existingSources = cached;
    }
    if (existingSources.length === 0 && groupedSourcesParam) {
      try { existingSources = JSON.parse(groupedSourcesParam); } catch { }
    }
    if (existingSources.length >= 8) return;

    let cancelled = false;
    const settings = settingsStore.getSettings();
    const allSources = settings.sources?.filter((s: VideoSource) => s.enabled !== false) || [];
    const otherSources = allSources.filter((s: VideoSource) => s.id !== source);
    if (otherSources.length === 0) return;

    (async () => {
      try {
        const cleanTitle = (title || '').replace(/[《》【】\[\]（）()]/g, ' ').replace(/\s+/g, ' ').trim();
        const targetAnalysis = analyzeTitle(cleanTitle);

        const response = await fetch('/api/search-parallel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: cleanTitle, sources: otherSources, page: 1 }),
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
              if (data.type === 'videos' && Array.isArray(data.videos)) {
                for (const v of data.videos) {
                  const rawName = (v.vod_name || '').trim();
                  const candAnalysis = analyzeTitle(rawName);
                  const isSeriesItem = isSeriesTypeName(v.type_name || '') || (v.vod_remarks && /更新|全\d+集|第\d+集|连载/i.test(v.vod_remarks)) || candAnalysis.seasonNumber !== null;

                  // 电影类型隔离：若期待电影，严禁把连续剧塞进备选线路
                  if (expectedType === 'movie' && isSeriesItem) continue;

                  // 年份核验（若期待特定年份，且候选年份相差超过 2 年，直接硬性隔离）
                  let candYear: number | null = null;
                  if (v.vod_year) {
                    const parsed = parseInt(String(v.vod_year).trim(), 10);
                    if (!isNaN(parsed) && parsed > 1900 && parsed < 2100) candYear = parsed;
                  }
                  if (!candYear) {
                    const ym = rawName.match(/\b(19\d\d|20\d\d)\b/);
                    if (ym) candYear = parseInt(ym[1], 10);
                  }
                  const targetYearNum = expectedYear ? parseInt(expectedYear, 10) : null;
                  if (targetYearNum && candYear && Math.abs(candYear - targetYearNum) > 2) {
                    continue;
                  }

                  const isExact = candAnalysis.pureTitle === targetAnalysis.pureTitle;
                  const hasSharedSpecificSubtitle = targetAnalysis.subtitles.length > 1
                    ? targetAnalysis.subtitles.slice(1).some(st => st.length >= 2 && candAnalysis.pureTitle.includes(st))
                    : targetAnalysis.subtitles.some(st => st.length >= 3 && candAnalysis.pureTitle.includes(st));
                  const lenDiff = Math.abs(candAnalysis.pureTitle.length - targetAnalysis.pureTitle.length);
                  
                  // 严格防范短片名被长片名反向吞噬（杜绝 2 字"希望"被 6 字"有希望的男人"冒充）
                  const isCandValidLonger = candAnalysis.pureTitle.includes(targetAnalysis.pureTitle) && (
                    targetAnalysis.pureTitle.length > 3
                      ? lenDiff <= 4
                      : (lenDiff <= 1 || candAnalysis.pureTitle.replace(/(19\d\d|20\d\d)$/, '') === targetAnalysis.pureTitle)
                  );
                  const isTargetValidLonger = targetAnalysis.pureTitle.includes(candAnalysis.pureTitle) && lenDiff <= 1;
                  const isSubstringOverlap = isCandValidLonger || isTargetValidLonger;

                  if (isExact || hasSharedSpecificSubtitle || isSubstringOverlap) {
                    const candidateScore = (isExact ? 200 : 0) + (hasSharedSpecificSubtitle ? 100 : 0) + (isSubstringOverlap ? 50 : 0) + (targetYearNum && candYear && candYear === targetYearNum ? 50 : 0);
                    const existingIdx = found.findIndex(s => s.source === v.source);
                    const newFoundItem = {
                      id: v.vod_id,
                      source: v.source,
                      sourceName: v.sourceDisplayName || getSourceName(v.source),
                      latency: v.latency,
                      pic: v.vod_pic,
                      typeName: v.type_name,
                      _score: candidateScore,
                    };

                    if (existingIdx === -1) {
                      found.push(newFoundItem as any);
                      setDiscoveredSources([...found]);
                    } else {
                      // 同源择优替换：若后到达的候选完全精确同名或匹配分更高，立即覆盖劣质占位候选！
                      const prevItem = found[existingIdx] as any;
                      if (candidateScore > (prevItem._score || 0)) {
                        found[existingIdx] = newFoundItem as any;
                        setDiscoveredSources([...found]);
                      }
                    }
                  }
                }
              }
            } catch { /* ignore */ }
          }
        }
      } catch { /* ignore */ }
    })();

    return () => { cancelled = true; };
  }, [title, source, groupedSourcesParam, needsTitleSearch]);

  // 拉取豆瓣同类高分推荐
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

  const playerTimeRef = useRef(0);
  const sourceErrorCountsRef = useRef<Map<string, number>>(new Map());

  // 线路异常智能自愈
  const handlePlaybackError = useCallback((_error: string) => {
    const currentActiveSource = currentSourceId || source || '';
    if (currentActiveSource) {
      failedSourcesRef.current.add(currentActiveSource);
    }

    const validCandidates = groupedSources.filter(
      (s) => s.source && s.source !== currentActiveSource && !failedSourcesRef.current.has(s.source)
    );
    const candidate = validCandidates.sort((a, b) => {
      const TOP_ORDER: Record<string, number> = { juliang: 0, guangsu: 1, baofeng: 2, wujin: 3, zuida: 4, jisu: 5, xinlang: 6, dytt: 7, modu: 8, zy360: 9 };
      const aOrder = TOP_ORDER[a.source] ?? 99;
      const bOrder = TOP_ORDER[b.source] ?? 99;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return 0;
    })[0];

    if (candidate) {
      const params = new URLSearchParams();
      params.set('id', String(candidate.id));
      params.set('source', candidate.source);
      params.set('title', title || '');
      if (entityParam) params.set('entity', entityParam);
      if (expectedType) params.set('type', expectedType);
      if (expectedYear) params.set('year', expectedYear);
      const currentEpName = videoData?.episodes?.[currentEpisode]?.name;
      const { seasonNumber, episodeNumber } = extractSeasonAndEpisodeNumber(currentEpName);
      const curDisplayNum = episodeNumber !== null ? String(episodeNumber) : (currentEpisode + 1).toString();
      params.set('episode', curDisplayNum);
      if (seasonNumber !== null) {
        params.set('season', String(seasonNumber));
      }
      if (playerTimeRef.current > 1) {
        params.set('t', Math.floor(playerTimeRef.current).toString());
      }
      if (groupedSources.length > 0) {
        const gsKey = storeGroupedSources(groupedSources);
        if (gsKey) params.set('gsKey', gsKey);
      }
      setCurrentSourceId(candidate.source);
      router.replace(`/player?${params.toString()}`, { scroll: false });
      return true;
    }
    return false;
  }, [currentSourceId, source, groupedSources, title, expectedType, expectedYear, currentEpisode, videoData?.episodes, router]);

  // 历史记录记录
  useEffect(() => {
    if (videoData && playUrl && videoId) {
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
        0,
        0,
        videoData.vod_pic,
        mappedEpisodes,
        { vod_actor: videoData.vod_actor, type_name: videoData.type_name, vod_area: videoData.vod_area, isPremium: false }
      );
    }
  }, [videoData, playUrl, videoId, currentEpisode, source, title, addToHistory]);

  const handleEpisodeClick = useCallback((episode: any, index: number) => {
    setCurrentEpisode(index);
    setPlayUrl(episode.url);
    setVideoError('');
    const params = new URLSearchParams(searchParams.toString());
    const { seasonNumber, episodeNumber } = extractSeasonAndEpisodeNumber(episode?.name);
    const epDisplayNum = episodeNumber !== null ? String(episodeNumber) : (index + 1).toString();
    params.set('episode', epDisplayNum);
    if (seasonNumber !== null) {
      params.set('season', String(seasonNumber));
    } else {
      params.delete('season');
    }
    router.replace(`/player?${params.toString()}`, { scroll: false });
  }, [searchParams, router, setCurrentEpisode, setPlayUrl, setVideoError]);

  const handleToggleReverse = (reversed: boolean) => {
    setIsReversed(reversed);
    const s = settingsStore.getSettings();
    settingsStore.saveSettings({ ...s, episodeReverseOrder: reversed });
  };

  const nextEpisodeUrl = useMemo(() => {
    if (!videoData?.episodes) return undefined;
    const nextIdx = currentEpisode + 1;
    if (nextIdx < videoData.episodes.length) {
      return videoData.episodes[nextIdx]?.url;
    }
    return undefined;
  }, [videoData, currentEpisode]);

  const handleNextEpisode = useCallback(() => {
    if (!videoData?.episodes) return;
    const nextIdx = currentEpisode + 1;
    if (nextIdx < videoData.episodes.length) {
      handleEpisodeClick(videoData.episodes[nextIdx], nextIdx);
    }
  }, [videoData, currentEpisode, handleEpisodeClick]);

  const handleSelectEpisodeInPlayer = useCallback((idx: number) => {
    if (videoData?.episodes?.[idx]) {
      handleEpisodeClick(videoData.episodes[idx], idx);
    }
  }, [videoData?.episodes, handleEpisodeClick]);

  const handleSourceChange = useCallback((newSource: { id: string | number; source: string }) => {
    const params = new URLSearchParams();
    params.set('id', String(newSource.id));
    params.set('source', newSource.source);
    params.set('title', title || '');
    if (entityParam) params.set('entity', entityParam);
    if (expectedType) params.set('type', expectedType);
    if (expectedYear) params.set('year', expectedYear);
    const currentEpName = videoData?.episodes?.[currentEpisode]?.name;
    const { seasonNumber, episodeNumber } = extractSeasonAndEpisodeNumber(currentEpName);
    const curDisplayNum = episodeNumber !== null ? String(episodeNumber) : (currentEpisode + 1).toString();
    params.set('episode', curDisplayNum);
    if (seasonNumber !== null) {
      params.set('season', String(seasonNumber));
    }
    if (playerTimeRef.current > 1) {
      params.set('t', Math.floor(playerTimeRef.current).toString());
    }
    if (groupedSources.length > 1) {
      const gsKey = storeGroupedSources(groupedSources);
      if (gsKey) params.set('gsKey', gsKey);
    }
    setCurrentSourceId(newSource.source);
    router.replace(`/player?${params.toString()}`, { scroll: false });
  }, [title, entityParam, expectedType, expectedYear, currentEpisode, videoData?.episodes, groupedSources, router]);

  // 影院巨幕模式 (Cinema Stage Mode)
  const [isCinemaMode, setIsCinemaMode] = useState(false);
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ikanpp_cinema_mode');
      if (saved === 'true') setIsCinemaMode(true);
    } catch {}
  }, []);

  const toggleCinemaMode = () => {
    setIsCinemaMode((prev) => {
      const next = !prev;
      try { localStorage.setItem('ikanpp_cinema_mode', String(next)); } catch {}
      return next;
    });
  };

  const handleBack = useCallback(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('ikanpp_playing_from_hub');
    }
    const fromChannel = searchParams.get('from');
    if (fromChannel) {
      router.push(`/${fromChannel}`);
      return;
    }
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  }, [router, searchParams]);

  // 页面标题同步
  const currentTitle = videoData?.vod_name || title || '热门影视';
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.title = `${currentTitle} - 4K超清免翻极速播放 | iKanPP 爱看片片`;
  }, [currentTitle]);

  const isMovieType = expectedType === 'movie' || (!expectedType && (videoData?.type_name?.includes('电影') || videoData?.episodes?.length === 1));
  const mediaType: 'movie' | 'tv' | 'anime' = isMovieType ? 'movie' : (videoData?.type_name?.includes('动漫') || videoData?.type_name?.includes('动画') ? 'anime' : 'tv');

  const jsonLdData = useMemo(() => {
    const mediaLd = generateMediaJsonLd({
      title: currentTitle,
      type: mediaType,
      url: `https://www.ikanpp.com/player?title=${encodeURIComponent(currentTitle)}`,
      image: videoData?.vod_pic,
      description: videoData?.vod_content?.replace(/<[^>]+>/g, '').slice(0, 160) || `在 iKanPP 免费在线观看《${currentTitle}》高清完整版。`,
      datePublished: videoData?.vod_year || undefined,
      actors: videoData?.vod_actor ? videoData.vod_actor.split(/[,，/ ]/).map(s => s.trim()).filter(Boolean).slice(0, 5) : undefined,
      director: videoData?.vod_director?.split(/[,，/ ]/)[0]?.trim() || undefined,
      numberOfEpisodes: videoData?.episodes?.length || undefined,
    });

    const breadcrumbLd = generateBreadcrumbJsonLd([
      { name: '首页', url: '/' },
      { name: mediaType === 'movie' ? '电影' : mediaType === 'anime' ? '动漫' : '剧集', url: `/${mediaType}` },
      { name: currentTitle, url: `https://www.ikanpp.com/player?title=${encodeURIComponent(currentTitle)}` },
    ]);

    return [mediaLd, breadcrumbLd];
  }, [currentTitle, mediaType, videoData, expectedYear]);

  // 解析演职员（导演与演员）用于 Netflix 风格肖像滑轨（Hooks 必须在所有 early return 之前无条件调用）
  const directorsList = useMemo(() => {
    if (!videoData?.vod_director) return [];
    return videoData.vod_director
      .split(/[,，/ ]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 3);
  }, [videoData?.vod_director]);

  const actorsList = useMemo(() => {
    if (!videoData?.vod_actor) return [];
    return videoData.vod_actor
      .split(/[,，/ ]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 8);
  }, [videoData?.vod_actor]);

  // 演职员真实头像状态（初始值直接读预烘焙字典，0ms 秒开无白屏）
  const [avatarsMap, setAvatarsMap] = useState<Record<string, string>>(() => PREBAKED_AVATARS);

  useEffect(() => {
    const allPeople = [...directorsList, ...actorsList].filter(Boolean);
    const missing = allPeople.filter((name) => !avatarsMap[name]);
    if (missing.length === 0) return;

    fetch(`/api/person-avatars?names=${encodeURIComponent(missing.join(','))}`)
      .then((res) => res.json())
      .then((data: any) => {
        if (data?.avatars && Object.keys(data.avatars).length > 0) {
          setAvatarsMap((prev) => ({ ...prev, ...data.avatars }));
        }
      })
      .catch(() => {});
  }, [directorsList, actorsList]);

  // 计算平滑内嵌在播放器内的连接态文案（彻底取代全屏跳变）
  const isSearchingTitle = needsTitleSearch && titleSearching;
  const isConnecting = isSearchingTitle || loading || (!playUrl && !videoError && !titleSearchError);
  const connectingMessage = isSearchingTitle
    ? '正在智能匹配全网最优片源...'
    : loading
    ? '正在连接极速播放专线...'
    : !playUrl
    ? '正在加载流媒体...'
    : undefined;

  if (needsTitleSearch && titleSearchError) {
    return (
      <div className="min-h-screen bg-(--bg-color)">
        <Navbar variant="player" isPremiumMode={false} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <ClassicNoSourceState
            title={title || '经典影视'}
            expectedYear={expectedYear}
            expectedType={expectedType}
            entityId={entityParam}
            poster={entityPoster}
            relatedMovies={relatedMovies}
            loadingRelated={loadingRelated}
            onSelectMovie={(movie) => {
              const params = new URLSearchParams();
              params.set('title', movie.title);
              router.push(`/player?${params.toString()}`);
            }}
            onBack={handleBack}
          />
        </main>
      </div>
    );
  }

  if (videoError && !videoData && !isSearchingTitle) {
    if (title) {
      return (
        <div className="min-h-screen bg-(--bg-color)">
          <Navbar variant="player" isPremiumMode={false} />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
              <div className="relative w-14 h-14">
                <div className="absolute inset-0 rounded-full border-2 border-red-500/20 animate-ping" />
                <div className="w-14 h-14 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
              </div>
              <p className="text-white/80 font-medium">当前线路响应异常，正在为您自动切换极速健康线路...</p>
            </div>
          </main>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-(--bg-color)">
        <Navbar variant="player" isPremiumMode={false} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <PlayerError
            error={videoError}
            onBack={handleBack}
            onRetry={fetchVideoDetails}
          />
        </main>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isCinemaMode ? 'bg-[#050505]' : 'bg-(--bg-color)'}`}>
      <JsonLd data={jsonLdData} />
      <Navbar variant="player" isPremiumMode={false} />

      {/* 巨幕模式下的全宽顶部播放器舞台 */}
      {isCinemaMode ? (
        <div id="main-player-stage" className="relative w-full bg-black pt-16 pb-6 border-b border-white/5 shadow-2xl overflow-hidden">
          {/* 影院级环境光晕氛围层 (Cinema Ambient Glow) */}
          <div 
            className="absolute -top-24 left-1/2 -translate-x-1/2 w-[120%] h-[300px] bg-gradient-to-b from-purple-900/20 via-red-950/15 to-transparent blur-3xl pointer-events-none -z-0"
            aria-hidden="true"
          />
          <div className="relative max-w-[1680px] mx-auto px-2 sm:px-4 lg:px-6 z-10">
            <VideoPlayer
              playUrl={playUrl}
              videoId={videoId || undefined}
              currentEpisode={currentEpisode}
              onBack={handleBack}
              totalEpisodes={videoData?.episodes?.length || 0}
              onNextEpisode={handleNextEpisode}
              isReversed={isReversed}
              isPremium={false}
              videoTitle={videoData?.vod_name || title || ''}
              episodeName={videoData?.episodes?.[currentEpisode]?.name || ''}
              externalTimeRef={playerTimeRef}
              nextEpisodeUrl={nextEpisodeUrl}
              onPlaybackError={handlePlaybackError}
              connectingMessage={connectingMessage}
              isLoadingSource={isConnecting}
              episodes={videoData?.episodes || []}
              onSelectEpisode={handleSelectEpisodeInPlayer}
              sources={groupedSources}
              currentSource={currentSourceId || source || ''}
              onSelectSource={handleSourceChange}
              rating={entityRating || (videoData as { vod_score?: number | string } | null)?.vod_score || null}
            />
          </div>
        </div>
      ) : null}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-18 pb-16">
        {/* 标准模式下的网格布局 */}
        {!isCinemaMode ? (
          <div className="grid lg:grid-cols-3 gap-6">
            <div id="main-player-stage" className="lg:col-span-2 space-y-4 sm:space-y-6">
              <VideoPlayer
                playUrl={playUrl}
                videoId={videoId || undefined}
                currentEpisode={currentEpisode}
                onBack={handleBack}
                totalEpisodes={videoData?.episodes?.length || 0}
                onNextEpisode={handleNextEpisode}
                isReversed={isReversed}
                isPremium={false}
                videoTitle={videoData?.vod_name || title || ''}
                episodeName={videoData?.episodes?.[currentEpisode]?.name || ''}
                externalTimeRef={playerTimeRef}
                nextEpisodeUrl={nextEpisodeUrl}
                onPlaybackError={handlePlaybackError}
                connectingMessage={connectingMessage}
                isLoadingSource={isConnecting}
                episodes={videoData?.episodes || []}
                onSelectEpisode={handleSelectEpisodeInPlayer}
                sources={groupedSources}
                currentSource={currentSourceId || source || ''}
                onSelectSource={handleSourceChange}
                rating={entityRating || (videoData as { vod_score?: number | string } | null)?.vod_score || null}
              />
            </div>

            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-28 space-y-4 sm:space-y-6">
                <EpisodeList
                  episodes={videoData?.episodes || null}
                  currentEpisode={currentEpisode}
                  isReversed={isReversed}
                  onEpisodeClick={handleEpisodeClick}
                  onToggleReverse={handleToggleReverse}
                  sources={groupedSources.length > 0 ? groupedSources : undefined}
                  currentSource={currentSourceId || source || ''}
                  onSourceChange={handleSourceChange}
                />
              </div>
            </div>
          </div>
        ) : null}

        {/* Netflix 级影院信息控制台 */}
        <div className="mt-8 space-y-6">
          {/* 标题、品质认证徽章与控制按钮行 */}
          <div className="p-6 rounded-2xl bg-[#16161A]/90 border border-white/10 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {currentTitle}
                </h1>
                {videoData?.episodes && videoData.episodes.length > 1 && (
                  <span className="text-sm font-bold text-red-400 bg-red-500/15 border border-red-500/30 px-2.5 py-0.5 rounded-full">
                    {videoData.episodes[currentEpisode]?.name || `第 ${currentEpisode + 1} 集`}
                  </span>
                )}
              </div>

              {/* 认证徽章 */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-white/70">
                <span className="px-2 py-0.5 rounded bg-red-600 text-white font-black tracking-wider text-[11px]">
                  Ultra HD 4K
                </span>
                <span className="px-2 py-0.5 rounded bg-white/15 text-white font-bold border border-white/20 text-[11px]">
                  HDR10
                </span>
                <span className="px-2 py-0.5 rounded bg-white/15 text-white font-bold border border-white/20 text-[11px]">
                  5.1 环绕声
                </span>
                {videoData?.vod_year && (
                  <span className="text-white/50">· {videoData.vod_year}</span>
                )}
                {videoData?.vod_area && (
                  <span className="text-white/50">· {videoData.vod_area}</span>
                )}
                {videoData?.type_name && (
                  <span className="text-white/50">· {videoData.type_name}</span>
                )}
              </div>
            </div>

            {/* 操作控制区 */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {/* 巨幕影院模式切换按钮 */}
              <button
                type="button"
                onClick={toggleCinemaMode}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  isCinemaMode
                    ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-600/30'
                    : 'bg-white/10 hover:bg-white/20 text-white/90 hover:text-white border-white/15'
                }`}
                title={isCinemaMode ? '退出巨幕影院模式' : '开启巨幕影院模式'}
              >
                <MonitorPlay size={16} />
                <span>{isCinemaMode ? '退出巨幕' : '巨幕影院'}</span>
              </button>

              {/* 追剧清单收藏 */}
              {videoData && videoId && (
                <div className="flex items-center">
                  <FavoriteButton
                    videoId={videoId}
                    source={source || ''}
                    title={videoData.vod_name || title || '未知视频'}
                    poster={videoData.vod_pic}
                    type={videoData.type_name}
                    year={videoData.vod_year}
                    size={18}
                    isPremium={false}
                  />
                </div>
              )}

              {/* 分享按钮 */}
              {videoData && (
                <ShareButton
                  title={videoData.vod_name || title || ''}
                  poster={videoData.vod_pic}
                  episodeName={videoData.episodes?.[currentEpisode]?.name}
                  year={videoData.vod_year}
                  type={videoData.type_name}
                  size={18}
                />
              )}

              {/* 正在播放线路指示 */}
              {source && (
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('source-selector-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-xs text-purple-200 hover:text-white transition-all cursor-pointer font-medium"
                  title="点击定位至专线面板"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{getSourceName(source)}</span>
                  {groupedSources.length > 1 && (
                    <span className="text-purple-300 font-bold">
                      ({groupedSources.length} 线)
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* 巨幕模式下的选集面板 */}
          {isCinemaMode && videoData?.episodes && videoData.episodes.length > 1 && (
            <div className="p-6 rounded-2xl bg-[#16161A]/90 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Layers size={18} className="text-red-500" />
                  <h3 className="text-base font-bold text-white">全剧集选集</h3>
                  <span className="text-xs text-white/50 bg-white/10 px-2 py-0.5 rounded-full">
                    共 {videoData.episodes.length} 集
                  </span>
                </div>
                <span className="text-xs text-white/40">在播放器内可直接按 E 键或点击「选集」抽屉秒切</span>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2 max-h-60 overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-white/20">
                {videoData.episodes.map((ep, idx) => {
                  const isCurrent = idx === currentEpisode;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleEpisodeClick(ep, idx)}
                      title={cleanEpisodeName(ep.name) || `第 ${idx + 1} 集`}
                      className={`py-2 px-1 rounded-xl text-xs font-semibold text-center transition-all cursor-pointer border ${
                        isCurrent
                          ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/30 ring-2 ring-red-400/50'
                          : 'bg-white/5 hover:bg-white/15 text-white/70 hover:text-white border-white/10'
                      }`}
                    >
                      {formatEpisodeGridLabel(ep.name, idx)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 演职员圆形肖像滑轨 */}
          {(directorsList.length > 0 || actorsList.length > 0) && (
            <div className="p-6 rounded-2xl bg-[#16161A]/90 border border-white/10 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <User size={18} className="text-red-500" />
                <span>导演与主演阵容</span>
              </h3>

              <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-none">
                {directorsList.map((dir) => {
                  const avatarUrl = avatarsMap[dir];
                  return (
                    <Link
                      key={dir}
                      href={`/director/${encodeURIComponent(dir)}`}
                      className="group flex flex-col items-center gap-2 shrink-0 p-2 rounded-xl hover:bg-white/5 transition-all text-center"
                    >
                      <div className="relative w-14 h-14 rounded-full overflow-hidden p-0.5 bg-gradient-to-tr from-red-600/70 to-purple-600/50 border border-red-500/30 shadow-lg group-hover:scale-105 group-hover:border-red-500 transition-all">
                        {avatarUrl ? (
                          <div className="relative w-full h-full rounded-full overflow-hidden">
                            <Image
                              src={avatarUrl}
                              alt={dir}
                              fill
                              sizes="56px"
                              className="object-cover object-top"
                            />
                          </div>
                        ) : (
                          <div className="w-full h-full rounded-full bg-red-600/20 flex items-center justify-center text-white font-bold text-base">
                            {dir.slice(0, 1)}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white/90 group-hover:text-red-400 transition-colors">
                          {dir}
                        </p>
                        <span className="text-[10px] text-white/40">导演</span>
                      </div>
                    </Link>
                  );
                })}

                {actorsList.map((actor) => {
                  const avatarUrl = avatarsMap[actor];
                  return (
                    <Link
                      key={actor}
                      href={`/actor/${encodeURIComponent(actor)}`}
                      className="group flex flex-col items-center gap-2 shrink-0 p-2 rounded-xl hover:bg-white/5 transition-all text-center"
                    >
                      <div className="relative w-14 h-14 rounded-full overflow-hidden p-0.5 bg-gradient-to-tr from-amber-500/60 to-white/10 border border-white/20 shadow-lg group-hover:scale-105 group-hover:border-amber-500 transition-all">
                        {avatarUrl ? (
                          <div className="relative w-full h-full rounded-full overflow-hidden">
                            <Image
                              src={avatarUrl}
                              alt={actor}
                              fill
                              sizes="56px"
                              className="object-cover object-top"
                            />
                          </div>
                        ) : (
                          <div className="w-full h-full rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-base">
                            {actor.slice(0, 1)}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white/90 group-hover:text-amber-400 transition-colors">
                          {actor}
                        </p>
                        <span className="text-[10px] text-white/40">主演</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* 剧情简介 */}
          {videoData?.vod_content && (
            <div className="p-6 rounded-2xl bg-[#16161A]/90 border border-white/10 space-y-2">
              <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider">
                故事梗概
              </h3>
              <p className="text-sm text-white/80 leading-relaxed">
                {videoData.vod_content.replace(/<[^>]+>/g, '').trim()}
              </p>
            </div>
          )}
        </div>

        {/* 猜你喜欢 */}
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
              router.push(`/player?${params.toString()}`);
            }}
          />
        </div>
      </main>

      <FavoritesSidebar isPremium={false} />

      {/* 视口脱离智能伴随浮动小窗 */}
      <FloatingMiniPlayer
        videoTitle={videoData?.vod_name || title || ''}
        episodeName={videoData?.episodes?.[currentEpisode]?.name || ''}
        isPlaying={true}
        onScrollToTop={() => {
          const el = document.getElementById('main-player-stage');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        targetElementId="main-player-stage"
      />
    </div>
  );
}
