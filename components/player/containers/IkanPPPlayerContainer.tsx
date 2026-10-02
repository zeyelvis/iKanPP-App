'use client';

import { memo, useEffect, useMemo, useState, useCallback, useRef, type ReactNode } from 'react';
import { useSearchParams, useRouter, type ReadonlyURLSearchParams } from 'next/navigation';
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
import { rankSourcesByPerformance, DEFAULT_LINE_TOP_ORDER, AD_PRONE_SOURCES, type LineStats } from '@/lib/utils/line-ranking';
import { ContentRail, RailMovie } from '@/components/home/ContentRail';
import Link from 'next/link';
import Image from 'next/image';
import { User } from 'lucide-react';
import { JsonLd, generateMediaJsonLd, generateBreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { PREBAKED_AVATARS } from '@/lib/data/prebaked-avatars';
import { extractSeasonAndEpisodeNumber, cleanEpisodeName } from '@/lib/utils/episode-resolver';
import { FloatingMiniPlayer } from '@/components/player/FloatingMiniPlayer';
import { analyzeTitle, isSeriesTypeName } from '@/components/player/utils/title-analyzer';
import { useTitleSearchScheduler } from '@/components/player/hooks/useTitleSearchScheduler';
import { usePlayerSkipMarkers } from '@/components/player/hooks/usePlayerSkipMarkers';
import { formatTimeSeconds } from '@/lib/player/skip-markers';

export interface IkanPPPlayerProps {
  /** The playback state, in the form /player keeps in its query string. */
  params: URLSearchParams | ReadonlyURLSearchParams;
  /** Replaces the state (on /player: router.replace of the query string). */
  replace: (query: string) => void;
  /** Opens another title by its state (on /player: a new /player page). */
  open: (query: string) => void;
  /** The player's back button; none when absent (embedded in a title page). */
  onBack?: () => void;
  /** 'page': the whole /player page. 'embedded': only the player with its lines and episodes. */
  variant?: 'page' | 'embedded';
  /** Embedded: shown under the player, beside its lines and episodes (the title page's header). */
  below?: ReactNode;
}

const noop = () => {};

/**
 * The /player page: its query string holds the playback state, which the player replaces as
 * the viewer changes episode or line.
 */
export function IkanPPPlayerContainer() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const replace = useCallback((query: string) => router.replace(`/player?${query}`, { scroll: false }), [router]);
  const open = useCallback((query: string) => router.push(`/player?${query}`), [router]);
  const back = useCallback(() => {
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
  return <IkanPPPlayer params={searchParams} replace={replace} open={open} onBack={back} variant="page" />;
}

/**
 * Playback of a main-site title: finds the lines by title, plays, switches line on failure,
 * records history. On /player (variant 'page') and embedded in a title page ('embedded').
 */
export const IkanPPPlayer = memo(function IkanPPPlayer({ params: searchParams, replace, open, onBack, variant = 'page', below }: IkanPPPlayerProps) {
  const embedded = variant === 'embedded';
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

  // 地区线路质量学习数据缓存（非阻塞静默拉取，失败自动降级到默认基准 TOP_ORDER）
  const lineRankDataRef = useRef<{
    country: string;
    countryStats: Record<string, LineStats>;
    globalStats: Record<string, LineStats>;
  }>({ country: 'XX', countryStats: {}, globalStats: {} });

  useEffect(() => {
    fetch('/api/line-rank')
      .then(res => res.json())
      .then(d => {
        if (d && d.success) {
          lineRankDataRef.current = {
            country: d.country || 'XX',
            countryStats: d.countryStats || {},
            globalStats: d.globalStats || {},
          };
        }
      })
      .catch(() => {});
  }, []);

  const playerTimeRef = useRef(0);
  const failedSourcesRef = useRef<Set<string>>(new Set());

  // === Title-only 模式：300ms 毫秒级流式秒播仲裁 ===
  const {
    needsTitleSearch,
    titleSearching,
    titleSearchError,
  } = useTitleSearchScheduler({
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
  });

  // === 播放核心状态 ===
  const [currentSourceId, setCurrentSourceId] = useState<string>(source || '');
  const [isReversed, setIsReversed] = useState(() => {
    return settingsStore.getSettings().episodeReverseOrder || false;
  });

  // 片头片尾自定义记忆打点
  const {
    skipMarkers,
    skipToast,
    handleMarkIntro,
    handleMarkOutro,
    handleClearMarker,
  } = usePlayerSkipMarkers(title, playerTimeRef);

  const handleSourceUnavailable = useCallback(() => {
    if (source) {
      failedSourcesRef.current.add(source);
    }
  }, [source]);

  const expectedEpisodes = useMemo(() => {
    let rawList: any[] = [];
    if (gsKeyParam) {
      const cached = retrieveGroupedSources(gsKeyParam);
      if (cached && Array.isArray(cached)) rawList = cached;
    }
    if (rawList.length === 0 && groupedSourcesParam) {
      try {
        rawList = JSON.parse(groupedSourcesParam);
      } catch {}
    }
    const counts: number[] = [];
    for (const s of rawList) {
      const r = s?.remarks;
      if (r) {
        const m = String(r).match(/(?:更新至|更新到|连载至|连载到|全|共|ep)\s*(?:第)?\s*(\d+)\s*(?:集|话|期)?/i) ||
                  String(r).match(/第\s*(\d+)\s*(?:集|话|期)/i) ||
                  String(r).match(/(\d+)\s*(?:集|话)/i);
        if (m && m[1]) {
          const num = parseInt(m[1], 10);
          if (num > 0 && num < 2000) counts.push(num);
        }
      }
    }
    if (counts.length === 0) return null;
    counts.sort((a, b) => a - b);
    const mid = Math.floor(counts.length / 2);
    return counts.length % 2 === 0
      ? Math.round((counts[mid - 1] + counts[mid]) / 2)
      : counts[mid];
  }, [gsKeyParam, groupedSourcesParam]);

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
  } = useVideoPlayer(
    videoId || '',
    source || '',
    episodeParam,
    isReversed,
    handleSourceUnavailable,
    title,
    seasonParam,
    expectedEpisodes,
    null,
    searchParams
  );

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

    // 注入 iKanPP专线 (作为候补极速专线，绝不抢占首发主力骨干源)
    if (title && !failedSourcesRef.current.has('ikanpp')) {
      rawList.push({
        id: 'ikanpp',
        source: 'ikanpp',
        sourceName: '⚡ iKanPP专线',
        pic: videoData?.vod_pic,
      });
    }

    // 注入暗影自愈专线 (仅在有片名且未被熔断时作为候补自愈/4K原画备选)
    if (title && !failedSourcesRef.current.has('shadowline')) {
      rawList.push({
        id: 'shadowline',
        source: 'shadowline',
        sourceName: '⚡ 暗影专线 · 4K原画',
        pic: videoData?.vod_pic,
      });
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
  }, [groupedSourcesParam, gsKeyParam, source, videoId, videoData?.vod_pic, discoveredSources, title]);

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
          replace(params.toString());
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
      replace(params.toString());
    }
  }, [videoError, videoData, title, source, groupedSources, searchParams, entityParam, episodeParam, expectedType, expectedYear, replace]);

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
        replace(params.toString());
      }
    }
  }, [videoData, title, expectedType, expectedYear, source, entityParam, replace]);

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
    // Only the /player page shows related titles (a title page has its own).
    if (embedded) return;
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
  }, [videoData?.type_name, expectedType, embedded]);

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
    const rankedCandidates = rankSourcesByPerformance(
      validCandidates,
      lineRankDataRef.current.countryStats,
      lineRankDataRef.current.globalStats,
      lineRankDataRef.current.country
    );
    const candidate = rankedCandidates[0];

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
      replace(params.toString());
      return true;
    }
    return false;
  }, [currentSourceId, source, groupedSources, title, expectedType, expectedYear, currentEpisode, videoData?.episodes, replace]);

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
    replace(params.toString());
  }, [searchParams, replace, setCurrentEpisode, setPlayUrl, setVideoError]);

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
    replace(params.toString());
  }, [title, entityParam, expectedType, expectedYear, currentEpisode, videoData?.episodes, groupedSources, replace]);

  const handleBack = onBack ?? noop;

  // 页面标题同步
  const currentTitle = videoData?.vod_name || title || '热门影视';
  useEffect(() => {
    // A title page keeps its own title.
    if (typeof document === 'undefined' || embedded) return;
    document.title = `${currentTitle} - 4K超清免翻极速播放 | iKanPP 爱看片片`;
  }, [currentTitle, embedded]);

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
    if (embedded) return;
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
  }, [directorsList, actorsList, embedded]);

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

  // === 终端连接态停滞看门狗：防止任何单线因上游死锁或网络阻断导致停滞超过 6 秒 ===
  useEffect(() => {
    if (!isConnecting || isSearchingTitle || !title) return;

    const timer = setTimeout(() => {
      console.warn(`[Player] Connecting timeout on source '${currentSourceId || source}'. Triggering auto-heal fallback...`);
      handlePlaybackError('线路连接超时');
    }, 6000);

    return () => clearTimeout(timer);
  }, [isConnecting, isSearchingTitle, title, currentSourceId, source, handlePlaybackError]);

  if (embedded && needsTitleSearch && titleSearchError) {
    return <EmbeddedNotice text="暂时没有找到可播放的片源，请稍后再试。" retry below={below} />;
  }

  if (embedded && videoError && !videoData && !isSearchingTitle) {
    return title ? (
      <EmbeddedNotice text="当前线路响应异常，正在为您切换线路…" busy below={below} />
    ) : (
      <EmbeddedNotice text={videoError} retry below={below} />
    );
  }

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
              open(params.toString());
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

  // 标准网格布局：左侧播放器及操作行，右侧线路与选集
  // 布局对齐参考标准：左侧画面（手机上贴边），右侧依次为集名与上一集/下一集/追剧/分享、片头片尾打点、
  // 线路与选集；详情页的片名信息（below）放在整块下方
  const stage = (
    <div>
      <div className="grid lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="lg:col-span-2">
          <div id="main-player-stage" className={embedded ? '-mx-3 sm:mx-0' : '-mx-4 sm:mx-0'}>
            <VideoPlayer
              params={searchParams}
              playUrl={playUrl}
              videoId={videoId || undefined}
              currentEpisode={currentEpisode}
              onBack={onBack}
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
              skipMarkers={skipMarkers}
            />
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-28 space-y-4 sm:space-y-5">
            <div className="relative space-y-3 select-none">
              <div className="flex flex-wrap items-center justify-between gap-2">
                {videoData?.episodes && videoData.episodes.length > 1 ? (
                  <span className="text-base sm:text-lg font-semibold text-white truncate min-w-0">
                    {episodeHeading(cleanEpisodeName(videoData.episodes[currentEpisode]?.name), currentEpisode)}
                  </span>
                ) : (
                  <span className="text-base sm:text-lg font-semibold text-white">
                    正片
                  </span>
                )}
                {/* 右侧：‹ 上一集、下一集 ›、＋ 追剧、分享 */}
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  {/* ‹ 上一集 */}
                  {videoData?.episodes && videoData.episodes.length > 1 && (
                    <button
                      type="button"
                      disabled={currentEpisode <= 0}
                      onClick={() => {
                        if (currentEpisode > 0 && videoData.episodes?.[currentEpisode - 1]) {
                          handleEpisodeClick(videoData.episodes[currentEpisode - 1], currentEpisode - 1);
                        }
                      }}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                        currentEpisode > 0
                          ? 'bg-white/5 hover:bg-white/10 text-white/90 hover:text-white border-white/10 cursor-pointer'
                          : 'opacity-40 text-white/40 border-white/5 cursor-not-allowed'
                      }`}
                      title={currentEpisode > 0 ? '播放上一集' : '已是第一集'}
                    >
                      <span>‹ 上一集</span>
                    </button>
                  )}

                  {/* 下一集 › */}
                  {videoData?.episodes && videoData.episodes.length > 1 && (
                    <button
                      type="button"
                      disabled={!videoData.episodes || currentEpisode >= videoData.episodes.length - 1}
                      onClick={handleNextEpisode}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                        videoData.episodes && currentEpisode < videoData.episodes.length - 1
                          ? 'bg-white/5 hover:bg-white/10 text-white/90 hover:text-white border-white/10 cursor-pointer'
                          : 'opacity-40 text-white/40 border-white/5 cursor-not-allowed'
                      }`}
                      title={videoData.episodes && currentEpisode < videoData.episodes.length - 1 ? '播放下一集' : '已是最后一集'}
                    >
                      <span>下一集 ›</span>
                    </button>
                  )}

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
                        size={16}
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
                      size={16}
                    />
                  )}
                </div>
              </div>

              {/* 片头片尾打点：多集时才有意义（以后每集自动跳过片头、到片尾连播） */}
              {videoData?.episodes && videoData.episodes.length > 1 ? (
                <div className="flex flex-wrap items-center gap-2">
                  {/* 片头打点 */}
                  <button
                    type="button"
                    onClick={handleMarkIntro}
                    className={`flex items-center gap-1 h-8 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                      skipMarkers.intro !== null
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
                        : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                    title={skipMarkers.intro !== null ? `已标记片头至 ${formatTimeSeconds(skipMarkers.intro)}，点击重新打点` : '记录当前播放时间为片头，后续集数自动跳过'}
                  >
                    <span>{skipMarkers.intro !== null ? `片头 ${formatTimeSeconds(skipMarkers.intro)}` : '片头到这'}</span>
                    {skipMarkers.intro !== null && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClearMarker('intro');
                        }}
                        className="hover:text-red-400 p-0.5 ml-0.5 text-xs opacity-70 hover:opacity-100"
                        title="清除片头标记"
                      >
                        ×
                      </span>
                    )}
                  </button>

                  {/* 片尾打点 */}
                  <button
                    type="button"
                    onClick={handleMarkOutro}
                    className={`flex items-center gap-1 h-8 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                      skipMarkers.outro !== null
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
                        : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                    title={skipMarkers.outro !== null ? `已标记片尾至 ${formatTimeSeconds(skipMarkers.outro)}，点击重新打点` : '记录当前播放时间为片尾，播至此处自动连播下一集'}
                  >
                    <span>{skipMarkers.outro !== null ? `片尾 ${formatTimeSeconds(skipMarkers.outro)}` : '片尾从这'}</span>
                    {skipMarkers.outro !== null && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClearMarker('outro');
                        }}
                        className="hover:text-red-400 p-0.5 ml-0.5 text-xs opacity-70 hover:opacity-100"
                        title="清除片尾标记"
                      >
                        ×
                      </span>
                    )}
                  </button>
                </div>
              ) : null}

              {/* 快捷操作反馈 Toast */}
              {skipToast && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300 animate-in fade-in zoom-in-95">
                  <div className="px-3.5 py-1.5 rounded-full bg-black/90 border border-amber-500/40 text-amber-300 text-xs font-medium shadow-2xl flex items-center gap-2 whitespace-nowrap">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    <span>{skipToast}</span>
                  </div>
                </div>
              )}
            </div>

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

            {/* 键盘快捷键提示条 (对齐现代化高级流媒体体验) */}
            <div className="hidden lg:flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#141416]/70 border border-white/5 text-[11px] text-white/40 select-none">
              <span>快捷键：空格 暂停 · ← → 快退进 · ↑ ↓ 音量 · &lt; &gt; 调倍速 · F 全屏</span>
            </div>
          </div>
        </div>
      </div>
      {embedded && below ? <div className="mt-8">{below}</div> : null}
    </div>
  );

  // 视口脱离智能伴随浮动小窗
  const miniPlayer = (
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
  );

  if (embedded) {
    return (
      <>
        {stage}
        {miniPlayer}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-(--bg-color)">
      <JsonLd data={jsonLdData} />
      <Navbar variant="player" isPremiumMode={false} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-18 pb-16">
        {stage}

        {/* 影视基本信息区 */}
        <div className="mt-8 space-y-6">
          <div className="p-5 sm:p-6 rounded-2xl bg-[#16161A] border border-white/10 shadow-xl">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {currentTitle}
                </h1>
                {videoData?.episodes && videoData.episodes.length > 1 && (
                  <span className="text-xs font-bold text-red-400 bg-red-500/15 border border-red-500/30 px-2 py-0.5 rounded-full">
                    {videoData.episodes[currentEpisode]?.name || `第 ${currentEpisode + 1} 集`}
                  </span>
                )}
              </div>

              {/* 真实事实信息行：年份 · 地区 · 类型 */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-white/60">
                {videoData?.vod_year && <span>{videoData.vod_year}</span>}
                {videoData?.vod_area && <span>· {videoData.vod_area}</span>}
                {videoData?.type_name && <span>· {videoData.type_name}</span>}
              </div>
            </div>
          </div>

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
              open(params.toString());
            }}
          />
        </div>
      </main>

      <FavoritesSidebar isPremium={false} />

      {miniPlayer}
    </div>
  );
});

/** The episode as a heading: a bare number from the source ("01") reads 第01集. */
function episodeHeading(name: string | undefined, index: number): string {
  if (!name) return `第${index + 1}集`;
  return /^\d+$/.test(name) ? `第${name}集` : name;
}

/** A message in place of the player, embedded in a title page. */
function EmbeddedNotice({ text, busy = false, retry = false, below }: { text: string; busy?: boolean; retry?: boolean; below?: ReactNode }) {
  return (
    <div>
      <div className="grid lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="lg:col-span-2 -mx-3 sm:mx-0">
          <div className="aspect-video w-full sm:rounded-xl bg-black/60 sm:border sm:border-white/10 flex flex-col items-center justify-center gap-4 px-6 text-center">
            {busy ? <div className="w-10 h-10 rounded-full border-2 border-red-500 border-t-transparent animate-spin" /> : null}
            <p className="text-sm text-white/80">{text}</p>
            {retry ? (
              <button type="button" onClick={() => window.location.reload()} className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-sm text-white">
                重试
              </button>
            ) : null}
          </div>
        </div>
      </div>
      {below ? <div className="mt-8">{below}</div> : null}
    </div>
  );
}
