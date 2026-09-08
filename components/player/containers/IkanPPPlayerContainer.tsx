'use client';

import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { VideoPlayer } from '@/components/player/VideoPlayer';
import { VideoMetadata } from '@/components/player/VideoMetadata';
import { EpisodeList, SourceInfo } from '@/components/player/EpisodeList';
import { PlayerError } from '@/components/player/PlayerError';
import type { VideoSource } from '@/lib/types';
import { useVideoPlayer } from '@/lib/hooks/useVideoPlayer';
import { useHistory } from '@/lib/store/history-store';
import { FavoritesSidebar } from '@/components/favorites/FavoritesSidebar';
import { FavoriteButton } from '@/components/favorites/FavoriteButton';
import { ShareButton } from '@/components/player/ShareButton';
import { Navbar } from '@/components/layout/Navbar';
import { settingsStore } from '@/lib/store/settings-store';
import { DEFAULT_SOURCES } from '@/lib/api/default-sources';
import { getSourceName } from '@/lib/utils/source-names';
import { ContentRail, RailMovie } from '@/components/home/ContentRail';
import { JsonLd, generateMediaJsonLd, generateBreadcrumbJsonLd } from '@/components/seo/JsonLd';

interface TitleAnalysis {
  rawTitle: string;
  pureTitle: string;
  seasonNumber: number | null;
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

export function IkanPPPlayerContainer() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToHistory } = useHistory(false);

  const videoId = searchParams.get('id');
  const source = searchParams.get('source');
  const title = searchParams.get('title');
  const episodeParam = searchParams.get('episode') || searchParams.get('ep');
  const epCountParam = searchParams.get('epCount');
  const groupedSourcesParam = searchParams.get('groupedSources');
  const expectedType = searchParams.get('type');
  const expectedYear = searchParams.get('year');

  const [relatedMovies, setRelatedMovies] = useState<RailMovie[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(true);

  // === Title-only 模式：300ms 毫秒级流式秒播仲裁 ===
  const needsTitleSearch = !videoId && !!title;
  const [titleSearching, setTitleSearching] = useState(() => needsTitleSearch);
  const [titleSearchError, setTitleSearchError] = useState('');

  useEffect(() => {
    if (videoId || !title) return;

    let cancelled = false;
    setTitleSearching(true);
    setTitleSearchError('');

    const appSettings = settingsStore.getSettings();
    let allSources = appSettings.sources?.filter((s: VideoSource) => s.enabled !== false) || [];
    if (allSources.length === 0) {
      allSources = DEFAULT_SOURCES as VideoSource[];
    }

    if (source) {
      const preferredSource = allSources.find(s => s.id === source);
      if (preferredSource) {
        allSources = [preferredSource, ...allSources.filter(s => s.id !== source)];
      }
    }

    const cleanTitle = title.replace(/[《》【】\[\]（）()]/g, ' ').replace(/\s+/g, ' ').trim();
    let redirected = false;

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
        let pendingBestCandidate: { video: any; score: number; isSeries: boolean } | null = null;

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
                      } else {
                        yearScore = -400;
                        isYearMismatched = true;
                      }
                    } else {
                      yearScore = 20;
                    }
                  }

                  const isSeriesItem = isSeriesTypeName(v.type_name || '') || (v.vod_remarks && /更新|全\d+集|第\d+集|连载/i.test(v.vod_remarks)) || candAnalysis.seasonNumber !== null;

                  let nameScore = 0;
                  let isExactName = false;
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
                      nameScore = 120;
                    }
                  } else if (
                    (candAnalysis.pureTitle.length >= 2 && targetAnalysis.pureTitle.includes(candAnalysis.pureTitle)) ||
                    (targetAnalysis.pureTitle.length >= 2 && candAnalysis.pureTitle.includes(targetAnalysis.pureTitle))
                  ) {
                    nameScore = 30;
                  } else {
                    nameScore = -200;
                  }

                  let qualityScore = 0;
                  if (remarks.includes('4k') || remarks.includes('2160')) qualityScore += 30;
                  if (remarks.includes('1080') || remarks.includes('hd') || remarks.includes('正片')) qualityScore += 20;
                  if (isTrailer || isCommentary) qualityScore -= 500;
                  if (isMusical) qualityScore -= 400;
                  if (typeName.includes('动画') || typeName.includes('动漫')) qualityScore += 60;
                  if (v.source === 'wujin' || v.source === 'zuida') qualityScore += 80;

                  const totalScore = nameScore + yearScore + qualityScore;

                  const isStrictCandidate = !isTrailer && !isCommentary && !isMusical && !isYearMismatched && isExactName && 
                    (isSeriesItem || !targetYear || !candYear || Math.abs(candYear - targetYear) <= 1);

                  if (isStrictCandidate) {
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

                  // 极速秒播裁决：一旦命中合法正片片源，立即秒跳！绝不阻塞！
                  const isQualified = !isTrailer && !isCommentary && !isMusical && !isYearMismatched && isExactName && totalScore >= 80;
                  if (isQualified && !redirected && !cancelled) {
                    const isTopTarget = 
                      (isSeriesItem && (targetAnalysis.seasonNumber !== null ? candAnalysis.seasonNumber === targetAnalysis.seasonNumber : (candAnalysis.seasonNumber === 1 || candAnalysis.seasonNumber === null))) ||
                      (!isSeriesItem && (isExactYearMatch || !targetYear));

                    if (isTopTarget) {
                      redirected = true;
                      const params = new URLSearchParams();
                      params.set('id', String(v.vod_id));
                      params.set('source', v.source);
                      params.set('title', title);
                      if (episodeParam) {
                        params.set('episode', episodeParam);
                      }
                      const resolvedType = isSeriesItem ? 'tv' : (expectedType || 'movie');
                      params.set('type', resolvedType);
                      if (expectedYear) params.set('year', expectedYear);
                      if (foundSources.length > 0) {
                        params.set('groupedSources', JSON.stringify(foundSources));
                      }
                      router.replace(`/player?${params.toString()}`, { scroll: false });
                      break;
                    }

                    if (!pendingBestCandidate || totalScore > pendingBestCandidate.score) {
                      pendingBestCandidate = { video: v, score: totalScore, isSeries: isSeriesItem };
                    }
                  }
                }
              }
            } catch { /* ignore */ }
          }
          if (redirected) break;
        }

        if (!redirected && !cancelled) {
          if (pendingBestCandidate) {
            redirected = true;
            const bestVideo = pendingBestCandidate.video;
            const params = new URLSearchParams();
            params.set('id', String(bestVideo.vod_id));
            params.set('source', bestVideo.source);
            params.set('title', title);
            if (episodeParam) params.set('episode', episodeParam);
            const resolvedType = pendingBestCandidate.isSeries ? 'tv' : (expectedType || 'movie');
            params.set('type', resolvedType);
            if (expectedYear) params.set('year', expectedYear);
            if (foundSources.length > 0) {
              params.set('groupedSources', JSON.stringify(foundSources));
            }
            router.replace(`/player?${params.toString()}`, { scroll: false });
          } else {
            setTitleSearchError('未找到与该片名匹配的高质量正片片源，请尝试精确片名搜索');
            setTitleSearching(false);
          }
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
  } = useVideoPlayer(videoId || '', source || '', episodeParam, isReversed, handleSourceUnavailable, title);

  const [discoveredSources, setDiscoveredSources] = useState<SourceInfo[]>([]);

  const groupedSources = useMemo<SourceInfo[]>(() => {
    let rawList: SourceInfo[] = [];
    if (groupedSourcesParam) {
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
  }, [groupedSourcesParam, source, videoId, videoData?.vod_pic, discoveredSources]);

  // 后台补充更多可用源（无感异步）
  useEffect(() => {
    if (!title || needsTitleSearch) return;

    let existingSources: SourceInfo[] = [];
    if (groupedSourcesParam) {
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
                  if (candAnalysis.pureTitle === targetAnalysis.pureTitle) {
                    const existingIdx = found.findIndex(s => s.source === v.source);
                    if (existingIdx === -1) {
                      found.push({
                        id: v.vod_id,
                        source: v.source,
                        sourceName: v.sourceDisplayName || getSourceName(v.source),
                        latency: v.latency,
                        pic: v.vod_pic,
                        typeName: v.type_name,
                      });
                      setDiscoveredSources([...found]);
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
      const TOP_ORDER: Record<string, number> = { wujin: 1, zuida: 2, guangsu: 3, modu: 4, zy360: 5 };
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
      if (expectedType) params.set('type', expectedType);
      if (expectedYear) params.set('year', expectedYear);
      params.set('episode', currentEpisode.toString());
      if (playerTimeRef.current > 1) {
        params.set('t', Math.floor(playerTimeRef.current).toString());
      }
      if (groupedSources.length > 0) {
        params.set('groupedSources', JSON.stringify(groupedSources));
      }
      setCurrentSourceId(candidate.source);
      router.replace(`/player?${params.toString()}`, { scroll: false });
      return true;
    }
    return false;
  }, [currentSourceId, source, groupedSources, title, expectedType, expectedYear, currentEpisode, router]);

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
    params.set('episode', index.toString());
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
      url: typeof window !== 'undefined' ? window.location.href : `https://www.ikanpp.com/player?title=${encodeURIComponent(currentTitle)}`,
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
      { name: currentTitle, url: typeof window !== 'undefined' ? window.location.href : '/' },
    ]);

    return [mediaLd, breadcrumbLd];
  }, [currentTitle, mediaType, videoData, expectedYear]);

  if (needsTitleSearch && titleSearching) {
    return (
      <div className="min-h-screen bg-(--bg-color) flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 relative flex items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-(--accent-color) animate-spin" />
          <span className="absolute text-xl">⚡</span>
        </div>
        <h2 className="text-xl font-bold text-white mb-2 tracking-wide">正在极速检索全网片源...</h2>
        <p className="text-sm text-white/50 max-w-sm text-center">
          正在为您秒级穿透全网主流骨干云源，并智能比对最优画质与切片专线
        </p>
      </div>
    );
  }

  if (needsTitleSearch && titleSearchError) {
    return (
      <PlayerError
        error={titleSearchError}
        onBack={handleBack}
        onRetry={() => {
          setTitleSearchError('');
          setTitleSearching(true);
          window.location.reload();
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-(--bg-color)">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-(--accent-color) border-t-transparent mb-4" />
        <p className="text-(--text-color-secondary)">正在加载视频详情...</p>
      </div>
    );
  }

  if (videoError && !videoData) {
    return (
      <PlayerError
        error={videoError}
        onBack={handleBack}
        onRetry={fetchVideoDetails}
      />
    );
  }

  return (
    <div className="min-h-screen bg-(--bg-color)">
      <JsonLd data={jsonLdData} />
      <Navbar variant="player" isPremiumMode={false} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
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
            />

            <div className="hidden lg:block">
              <VideoMetadata
                videoData={videoData}
                source={source}
                title={title}
              />
            </div>

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
                  isPremium={false}
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
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-xs text-purple-200 hover:text-white transition-all cursor-pointer font-medium"
                      title="点击平滑定位至右侧多线路面板"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
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
                onSourceChange={(newSource) => {
                  const params = new URLSearchParams();
                  params.set('id', String(newSource.id));
                  params.set('source', newSource.source);
                  params.set('title', title || '');
                  if (expectedType) params.set('type', expectedType);
                  if (expectedYear) params.set('year', expectedYear);
                  params.set('episode', currentEpisode.toString());
                  if (playerTimeRef.current > 1) {
                    params.set('t', Math.floor(playerTimeRef.current).toString());
                  }
                  if (groupedSources.length > 1) {
                    params.set('groupedSources', JSON.stringify(groupedSources));
                  }
                  setCurrentSourceId(newSource.source);
                  router.replace(`/player?${params.toString()}`, { scroll: false });
                }}
              />
            </div>
          </div>
        </div>

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
    </div>
  );
}
