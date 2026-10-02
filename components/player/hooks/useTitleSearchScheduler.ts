import { useState, useEffect, useCallback, type MutableRefObject } from 'react';
import type { VideoSource } from '@/lib/types';
import { settingsStore } from '@/lib/store/settings-store';
import { DEFAULT_SOURCES } from '@/lib/api/default-sources';
import { DEPRECATED_SOURCES } from '@/lib/api/video-sources';
import { getSourceName } from '@/lib/utils/source-names';
import { DEFAULT_LINE_TOP_ORDER, AD_PRONE_SOURCES } from '@/lib/utils/line-ranking';
import { storeGroupedSources } from '@/lib/utils/grouped-sources-cache';
import type { SourceInfo } from '@/components/player/EpisodeList';
import { analyzeTitle, isSeriesTypeName } from '@/components/player/utils/title-analyzer';

interface TitleSearchSchedulerProps {
  videoId: string | null;
  source: string | null;
  title: string | null;
  expectedYear: string | null;
  expectedType: string | null;
  episodeParam: string | null;
  seasonParam: string | null;
  entityParam: string | null;
  replace: (query: string) => void;
  failedSourcesRef: MutableRefObject<Set<string>>;
}

export function useTitleSearchScheduler({
  videoId,
  source,
  title,
  expectedYear,
  expectedType,
  episodeParam,
  seasonParam,
  entityParam,
  replace,
  failedSourcesRef,
}: TitleSearchSchedulerProps) {
  const needsTitleSearch = (!videoId || !source) && !!title;
  const [titleSearching, setTitleSearching] = useState(() => needsTitleSearch);
  const [titleSearchError, setTitleSearchError] = useState('');
  const [retryTrigger, setRetryTrigger] = useState(0);

  const retryTitleSearch = useCallback(() => {
    setRetryTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if ((videoId && source) || !title) {
      setTitleSearching(false);
      return;
    }

    let cancelled = false;
    setTitleSearching(true);
    setTitleSearchError('');

    const appSettings = settingsStore.getSettings();
    let allSources = appSettings.sources?.filter((s: VideoSource) => s.enabled !== false) || [];
    if (allSources.length === 0) {
      allSources = DEFAULT_SOURCES as VideoSource[];
    }

    allSources = allSources.filter(
      (s) => !DEPRECATED_SOURCES.has(s.id) && !failedSourcesRef.current.has(s.id)
    );

    allSources = [...allSources].sort((a, b) => {
      const getOrder = (id: string) => {
        const idx = (DEFAULT_LINE_TOP_ORDER as readonly string[]).indexOf(id);
        return idx === -1 ? 999 : idx;
      };
      return getOrder(a.id) - getOrder(b.id);
    });

    if (source) {
      const preferredSource = allSources.find((s) => s.id === source);
      if (preferredSource) {
        allSources = [preferredSource, ...allSources.filter((s) => s.id !== source)];
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
          const resolvedType = isSeries ? 'tv' : expectedType || 'movie';
          params.set('type', resolvedType);
          if (expectedYear) params.set('year', expectedYear);
          if (foundSources.length > 0) {
            const gsKey = storeGroupedSources(foundSources);
            if (gsKey) params.set('gsKey', gsKey);
          }
          replace(params.toString());
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

                  const isTrailer =
                    remarks.includes('预告') ||
                    rawName.includes('预告') ||
                    remarks.includes('花絮') ||
                    rawName.includes('花絮');
                  const isCommentary =
                    rawName.includes('解说') || remarks.includes('解说') || rawName.includes('看点');
                  const isMusical =
                    rawName.includes('音乐剧') || rawName.includes('舞台剧') || remarks.includes('音乐剧');

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

                  const isSeriesItem =
                    isSeriesTypeName(v.type_name || '') ||
                    (v.vod_remarks && /更新|全\d+集|第\d+集|连载/i.test(v.vod_remarks)) ||
                    candAnalysis.seasonNumber !== null;

                  let typeScore = 0;
                  let isTypeMismatched = false;
                  if (expectedType === 'movie' && isSeriesItem) {
                    typeScore = -800;
                    isTypeMismatched = true;
                  } else if (expectedType === 'tv' && !isSeriesItem && !seasonParam) {
                    typeScore = -200;
                  }

                  let episodeScore = 0;
                  let isEpisodeInsufficient = false;
                  if (episodeParam) {
                    const epNum = parseInt(episodeParam, 10);
                    if (!isNaN(epNum) && epNum > 1) {
                      const totalEpMatch =
                        remarks.match(/全(\d+)集/) ||
                        remarks.match(/更新至(\d+)集/) ||
                        remarks.match(/共(\d+)集/);
                      if (totalEpMatch) {
                        const totalEps = parseInt(totalEpMatch[1], 10);
                        if (!isNaN(totalEps) && totalEps < epNum) {
                          isEpisodeInsufficient = true;
                          episodeScore = -500;
                        }
                      }
                    }
                  }

                  let nameScore = 0;
                  const isExactName = candAnalysis.pureTitle === targetAnalysis.pureTitle;

                  const hasSharedSubtitle =
                    targetAnalysis.subtitles.length > 1
                      ? targetAnalysis.subtitles.slice(1).some((st) => st.length >= 2 && candAnalysis.pureTitle.includes(st))
                      : targetAnalysis.subtitles.some((st) => st.length >= 3 && candAnalysis.pureTitle.includes(st));

                  const lenDiff = Math.abs(candAnalysis.pureTitle.length - targetAnalysis.pureTitle.length);
                  const isLengthCompatible =
                    targetAnalysis.pureTitle.length > 3
                      ? lenDiff <= 4
                      : lenDiff <= 1 ||
                        candAnalysis.pureTitle.replace(/(19\d\d|20\d\d)$/, '') === targetAnalysis.pureTitle;

                  const isHighConfidenceMatch =
                    (candAnalysis.pureTitle.includes(targetAnalysis.pureTitle) ||
                      targetAnalysis.pureTitle.includes(candAnalysis.pureTitle)) &&
                    isLengthCompatible &&
                    (hasSharedSubtitle || lenDiff <= 2);

                  if (isExactName) {
                    nameScore = 300;
                  } else if (isHighConfidenceMatch) {
                    nameScore = 150;
                  } else if (candAnalysis.pureTitle.includes(targetAnalysis.pureTitle)) {
                    nameScore = 40;
                  } else {
                    nameScore = -200;
                  }

                  let qualityScore = 0;
                  if (remarks.includes('4k') || remarks.includes('2160p')) qualityScore += 60;
                  if (remarks.includes('1080p') || remarks.includes('超清') || remarks.includes('蓝光') || remarks.includes('hd')) qualityScore += 30;

                  const isAdSource = AD_PRONE_SOURCES.has(v.source);
                  let sourceScore = 0;
                  if (!isAdSource) {
                    sourceScore = 100;
                  } else {
                    sourceScore = 20;
                  }

                  const totalScore = nameScore + yearScore + qualityScore + episodeScore + sourceScore + typeScore;

                  if (!isTrailer && !isCommentary && !isMusical && !isTypeMismatched && totalScore > 0) {
                    fallbackCandidates.push({ _video: v, _score: totalScore, _isSeries: isSeriesItem });
                  }

                  const isNameMatched = isExactName || isHighConfidenceMatch;
                  const isStrictCandidate =
                    !isTrailer &&
                    !isCommentary &&
                    !isMusical &&
                    !isYearMismatched &&
                    !isTypeMismatched &&
                    isNameMatched &&
                    !isEpisodeInsufficient &&
                    (isSeriesItem || !targetYear || !candYear || Math.abs(candYear - targetYear) <= 2);

                  if (isStrictCandidate) {
                    const existingIdx = foundSources.findIndex((s) => s.source === v.source);
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

                  const isQualified =
                    !isTrailer &&
                    !isCommentary &&
                    !isMusical &&
                    !isYearMismatched &&
                    !isTypeMismatched &&
                    isNameMatched &&
                    !isEpisodeInsufficient &&
                    totalScore >= 70;

                  if (isQualified && !redirected && !cancelled) {
                    const isSeasonOrYearMatched =
                      (isSeriesItem &&
                        (targetAnalysis.seasonNumber !== null
                          ? candAnalysis.seasonNumber === targetAnalysis.seasonNumber
                          : candAnalysis.seasonNumber === 1 || candAnalysis.seasonNumber === null)) ||
                      (!isSeriesItem &&
                        (isExactYearMatch ||
                          !targetYear ||
                          !candYear ||
                          Math.abs(candYear - (targetYear || 0)) <= 2));

                    if (isSeasonOrYearMatched) {
                      const elapsed = Date.now() - searchStartTime;
                      const isCleanBackbone = !isAdSource && totalScore >= 100;

                      if (isCleanBackbone || elapsed > 800) {
                        performRedirect(v, isSeriesItem);
                        break;
                      }
                    }
                  }
                }
              }
            } catch {
              /* ignore */
            }
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
  }, [
    videoId,
    title,
    source,
    expectedYear,
    expectedType,
    episodeParam,
    seasonParam,
    entityParam,
    replace,
    retryTrigger,
    failedSourcesRef,
  ]);

  return {
    needsTitleSearch,
    titleSearching,
    titleSearchError,
    retryTitleSearch,
  };
}
