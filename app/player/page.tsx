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
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { getSourceName } from '@/lib/utils/source-names';
import { RelatedKeywords } from '@/components/search/RelatedKeywords';
import { ContentRail, RailMovie } from '@/components/home/ContentRail';
import { normalizeVideoType } from '@/lib/utils/taxonomy';
import { JsonLd, generateMediaJsonLd, generateBreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { Crown, Lock, Sparkles } from 'lucide-react';

function PlayerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isPremium = searchParams.get('premium') === '1';
  const { addToHistory } = useHistory(isPremium);

  const videoId = searchParams.get('id');
  const source = searchParams.get('source');
  const title = searchParams.get('title');
  const episodeParam = searchParams.get('episode');
  const epCountParam = searchParams.get('epCount');
  const groupedSourcesParam = searchParams.get('groupedSources');
  // 消歧义参数：从首页传入的内容类型和年份
  const expectedType = searchParams.get('type'); // 'movie' | 'tv' | null
  const expectedYear = searchParams.get('year'); // e.g. '2025' | null
  // 底部同类推荐片单状态
  const [relatedMovies, setRelatedMovies] = useState<RailMovie[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(true);

  // === Title-only mode: auto-search all sources and redirect to best match ===
  // Initial state: if we have title but no id/source, we're already in search mode
  const [titleSearching, setTitleSearching] = useState(() => !videoId && !source && !!title);
  const [titleSearchError, setTitleSearchError] = useState('');

  useEffect(() => {
    // Only trigger when we have a title but no video ID/source
    if (videoId || source || !title) return;

    let cancelled = false;
    setTitleSearching(true);
    setTitleSearchError('');

    const settings = settingsStore.getSettings();
    const sourcesForMode = isPremium ? settings.premiumSources : settings.sources;
    let allSources = sourcesForMode?.filter((s: VideoSource) => s.enabled !== false) || [];
    if (allSources.length === 0) {
      allSources = isPremium ? (PREMIUM_SOURCES as VideoSource[]) : (DEFAULT_SOURCES as VideoSource[]);
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
                // 0. 过滤掉解说类或短视频
                const isCommentary = (v: any) => {
                  const name = (v.vod_name || '').toLowerCase();
                  const typeName = (v.type_name || '').toLowerCase();
                  return name.includes('解说') || typeName.includes('解说') || name.includes('预告');
                };
                const validVideos = data.videos.filter((v: any) => !isCommentary(v));
                const videoPool = validVideos.length > 0 ? validVideos : data.videos;

                // 1. 精确匹配（支持番号匹配）
                const exactMatches = videoPool.filter((v: any) => {
                  const vName = (v.vod_name || '').toLowerCase().trim();
                  if (videoCode && vName.toUpperCase().includes(videoCode)) return true;
                  return vName === normalizedTitle || vName === title.toLowerCase().trim();
                });

                // 2. 核心词双向包含匹配
                const partialMatches = exactMatches.length === 0
                  ? videoPool.filter((v: any) => {
                    const vName = (v.vod_name || '').toLowerCase().trim();
                    if (videoCode && vName.toUpperCase().includes(videoCode)) return true;
                    return vName.includes(normalizedTitle) || normalizedTitle.includes(vName);
                  })
                  : [];

                // 3. 最佳匹配候选
                const candidates = exactMatches.length > 0 ? exactMatches : (partialMatches.length > 0 ? partialMatches : videoPool);
                const match = candidates[0];

                if (match && !cancelled) {
                  anyFound = true;
                  foundSources.push({
                    id: match.vod_id,
                    source: match.source,
                    sourceName: match.sourceDisplayName || getSourceName(match.source),
                    latency: match.latency,
                    pic: match.vod_pic,
                    typeName: match.type_name,
                  });

                  // 只要搜到第一个可用匹配，立即执行快速播放跳转
                  if (!redirected) {
                    redirected = true;
                    const params = new URLSearchParams();
                    params.set('id', String(match.vod_id));
                    params.set('source', match.source);
                    params.set('title', title);
                    if (expectedType) params.set('type', expectedType);
                    if (isPremium) params.set('premium', '1');
                    if (foundSources.length > 0) {
                      params.set('groupedSources', JSON.stringify(foundSources));
                    }
                    router.replace(`/player?${params.toString()}`, { scroll: false });
                  }
                }
              }
            } catch { /* ignore parse errors */ }
          }
        }

        // 流结束后的兜底检查
        if (!redirected && !anyFound && !cancelled) {
          setTitleSearchError('全网 108 条数据源未检索到该片，请检查片名或在首页重新搜索');
          setTitleSearching(false);
        }
      } catch (err: any) {
        if (!cancelled && !redirected && err?.name !== 'AbortError') {
          setTitleSearchError('网络请求异常，请点击重试');
          setTitleSearching(false);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [videoId, source, title, isPremium, router, expectedType, expectedYear]);

  // Track settings - use mode-specific store
  const modeStore = isPremium ? premiumModeSettingsStore : settingsStore;
  const [isReversed, setIsReversed] = useState(() =>
    typeof window !== 'undefined' ? modeStore.getSettings().episodeReverseOrder : false
  );

  // Mobile tab state
  const [activeTab, setActiveTab] = useState<'episodes' | 'info'>('episodes');

  // Sync with store changes
  useEffect(() => {
    setIsReversed(modeStore.getSettings().episodeReverseOrder);
  }, []);

  // Handle auto-fallback when current source is unavailable (defined later, uses ref)
  const sourceUnavailableRef = useRef<(() => void) | undefined>(undefined);
  const pendingFallbackRef = useRef(false);

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
  } = useVideoPlayer(videoId || '', source || '', episodeParam, isReversed, useCallback(() => {
    sourceUnavailableRef.current?.();
  }, []));

  // Parse grouped sources if available
  const [discoveredSources, setDiscoveredSources] = useState<SourceInfo[]>([]);

  // Title-only mode guard: redirect if no title, id, or source
  const isTitleOnlyMode = !videoId || !source;

  const groupedSources = useMemo<SourceInfo[]>(() => {
    let sources: SourceInfo[] = [];
    if (groupedSourcesParam) {
      try {
        sources = JSON.parse(groupedSourcesParam);
      } catch {
        sources = [];
      }
    }

    // Merge in discovered sources (from background search)
    if (discoveredSources.length > 0) {
      for (const ds of discoveredSources) {
        if (!sources.find(s => s.source === ds.source)) {
          sources.push(ds);
        }
      }
    }

    // Always ensure the current source is in the list
    if (source && !sources.find(s => s.source === source)) {
      sources.unshift({
        id: videoId || '',
        source: source,
        sourceName: getSourceName(source),
        pic: videoData?.vod_pic
      });
    }

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

  // Wire up the source unavailable handler now that groupedSources is defined
  sourceUnavailableRef.current = () => {
    const alternatives = groupedSources.filter(s => s.source !== source);
    if (alternatives.length === 0) {
      // No alternatives yet — mark pending so we retry when discovered sources arrive
      pendingFallbackRef.current = true;
      return;
    }

    pendingFallbackRef.current = false;
    const best = [...alternatives].sort((a, b) => {
      const latA = a.latency ?? Infinity;
      const latB = b.latency ?? Infinity;
      return latA - latB;
    })[0];

    const params = new URLSearchParams();
    params.set('id', String(best.id));
    params.set('source', best.source);
    params.set('title', title || '');
    if (episodeParam) params.set('episode', episodeParam);
    if (groupedSourcesParam) params.set('groupedSources', groupedSourcesParam);
    if (isPremium) params.set('premium', '1');
    router.replace(`/player?${params.toString()}`, { scroll: false });
  };

  // Retry pending fallback when discovered sources arrive
  useEffect(() => {
    if (pendingFallbackRef.current && discoveredSources.length > 0) {
      sourceUnavailableRef.current?.();
    }
  }, [discoveredSources]);

  // Background fetch alternative sources when none provided or when existing ones lack full info
  useEffect(() => {
    if (!title || isTitleOnlyMode) return;

    // Check if existing grouped sources already have full info (pic + latency)
    let existingSources: SourceInfo[] = [];
    if (groupedSourcesParam) {
      try { existingSources = JSON.parse(groupedSourcesParam); } catch { }
    }
    // Always fetch alternatives if there's a pending fallback (source unavailable)
    const hasFullInfo = !pendingFallbackRef.current && existingSources.length > 1 &&
      existingSources.every(s => s.pic || s.latency !== undefined);
    if (hasFullInfo) return;

    let cancelled = false;

    const settings = settingsStore.getSettings();
    const sourcesForMode = isPremium ? settings.premiumSources : settings.sources;
    const allSources = sourcesForMode?.filter((s: VideoSource) => s.enabled !== false) || [];
    // Only search other sources (not the current one)
    const otherSources = allSources.filter((s: VideoSource) => s.id !== source);
    if (otherSources.length === 0) return;

    (async () => {
      try {
        const response = await fetch('/api/search-parallel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: title, sources: otherSources, page: 1 }),
        });
        if (cancelled || !response.ok || !response.body) return;

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        const found: SourceInfo[] = [];
        const normalizedTitle = title.toLowerCase().trim();

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
              if (data.type === 'videos' && data.videos && data.videos.length > 0) {
                // 过滤解说类视频
                const pool = data.videos.filter((v: any) => {
                  const name = (v.vod_name || '').toLowerCase();
                  const tn = (v.type_name || '').toLowerCase();
                  return !name.includes('解说') && !tn.includes('解说');
                });
                const videoPool = pool.length > 0 ? pool : data.videos;

                const match = videoPool.find((v: any) =>
                  v.vod_name?.toLowerCase().trim() === normalizedTitle
                ) || videoPool.find((v: any) =>
                  v.vod_name?.toLowerCase().trim().includes(normalizedTitle) ||
                  normalizedTitle.includes(v.vod_name?.toLowerCase().trim())
                ) || videoPool[0];

                if (match && !cancelled) {
                  found.push({
                    id: match.vod_id,
                    source: match.source,
                    sourceName: match.sourceDisplayName || getSourceName(match.source),
                    latency: match.latency,
                    pic: match.vod_pic,
                    typeName: match.type_name,
                  });
                  // Update state incrementally
                  setDiscoveredSources([...found]);
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
  }, [title, source, groupedSourcesParam, isPremium, isTitleOnlyMode, expectedType]);

  // Track current source for switching
  const [currentSourceId, setCurrentSourceId] = useState(source);
  const playerTimeRef = useRef(0);

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
        { vod_actor: videoData.vod_actor, type_name: videoData.type_name, vod_area: videoData.vod_area }
      );
    }
  }, [videoData, playUrl, videoId, currentEpisode, source, title, addToHistory]);

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
      { name: '首页', url: 'https://www.ikanpp.com/' },
      { name: isMovieType ? '电影' : '电视剧', url: `https://www.ikanpp.com/${isMovieType ? 'movie' : 'tv'}` },
      { name: currentTitle, url: typeof window !== 'undefined' ? window.location.href : `https://www.ikanpp.com/player?title=${encodeURIComponent(currentTitle)}` },
    ]);

    return [mediaLd, breadcrumbLd];
  }, [currentTitle, mediaType, isMovieType, videoData]);

  // Redirect if no params at all
  if (isTitleOnlyMode && !titleSearching && !titleSearchError && !title) {
    router.push('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-(--bg-color)">
      {/* Google 富媒体 SEO JSON-LD */}
      <JsonLd data={jsonLdData} />

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
            onBack={() => router.back()}
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
            onBack={() => router.back()}
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
                onBack={() => router.back()}
                totalEpisodes={videoData?.episodes?.length || 0}
                onNextEpisode={handleNextEpisode}
                isReversed={isReversed}
                isPremium={isPremium}
                videoTitle={videoData?.vod_name || title || ''}
                episodeName={videoData?.episodes?.[currentEpisode]?.name || ''}
                externalTimeRef={playerTimeRef}
                nextEpisodeUrl={nextEpisodeUrl}
              />

              {/* 移动端专属：位于播放器正下方的紧凑流光信息卡片 */}
              <div className="lg:hidden bg-linear-to-b from-white/8 to-white/3 backdrop-blur-2xl rounded-2xl border border-white/10 p-3.5 space-y-3 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                {/* 标签栏 */}
                <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                  {videoData?.type_name && (
                    <span className="px-2.5 py-0.5 rounded-full font-bold bg-(--accent-color) text-white shadow-sm shadow-(--accent-color)/30">
                      {normalizeVideoType(videoData.type_name, videoData.vod_name || title || '').standardType}
                    </span>
                  )}
                  {videoData?.vod_year && (
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/90 font-medium">
                      {videoData.vod_year}
                    </span>
                  )}
                  {videoData?.vod_area && (
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/80">
                      {videoData.vod_area}
                    </span>
                  )}
                  {videoData?.vod_remarks && (
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/80">
                      {videoData.vod_remarks}
                    </span>
                  )}
                </div>

                {/* 片名与当前播放指示 */}
                <div className="space-y-1">
                  <h1 className="text-lg font-black text-white leading-tight tracking-tight">
                    {videoData?.vod_name || title}
                  </h1>
                  {videoData?.episodes?.[currentEpisode]?.name && (
                    <div className="text-xs text-(--accent-color) font-semibold flex items-center gap-1.5 pt-0.5">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-(--accent-color) opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-(--accent-color)"></span>
                      </span>
                      <span>正在播放：{videoData.episodes[currentEpisode].name}</span>
                    </div>
                  )}
                </div>

                {/* 移动端快捷操作栏（收藏、分享与当前线路信息） */}
                <div className="flex items-center justify-between pt-2.5 border-t border-white/10 text-xs">
                  <div className="flex items-center gap-3">
                    {videoData && videoId && (
                      <div className="flex items-center gap-1.5 text-white/80 hover:text-white transition-colors cursor-pointer">
                        <FavoriteButton
                          videoId={videoId}
                          source={source || ''}
                          title={videoData.vod_name || title || '未知视频'}
                          poster={videoData.vod_pic}
                          type={videoData.type_name}
                          year={videoData.vod_year}
                          size={18}
                          isPremium={isPremium}
                        />
                        <span className="text-xs">收藏</span>
                      </div>
                    )}
                    <ShareButton title={videoData?.vod_name || title || ''} size={18} />
                  </div>

                  {/* 当前线路胶囊提示 */}
                  {source && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-white/70">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      <span>{getSourceName(source)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 桌面端完整详情 */}
              <div className="hidden lg:block">
                <VideoMetadata
                  videoData={videoData}
                  source={source}
                  title={title}
                />
              </div>

              {/* 桌面端收藏与分享按钮 */}
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
                  <div className="ml-auto">
                    <ShareButton title={videoData.vod_name || title || ''} size={20} />
                  </div>
                </div>
              )}

              {/* 智能相关影视与长尾词推荐 */}
              {(videoData?.vod_name || title) && (
                <RelatedKeywords
                  query={videoData?.vod_name || title || ''}
                  onKeywordClick={(keyword) => {
                    router.push(`/?q=${encodeURIComponent(keyword)}`);
                  }}
                />
              )}
            </div>

            {/* Sidebar with sticky wrapper */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-28 space-y-4 sm:space-y-6">
                {/* Mobile Tabs */}
                <SegmentedControl
                  options={[
                    { label: `选集 (${videoData?.episodes?.length || 1})`, value: 'episodes' },
                    { label: '剧情简介', value: 'info' },
                  ]}
                  value={activeTab}
                  onChange={setActiveTab}
                  className="lg:hidden"
                />

                {/* Info Tab Content - Mobile Only */}
                <div className={activeTab !== 'info' ? 'hidden' : 'block lg:hidden'}>
                  <VideoMetadata
                    videoData={videoData}
                    source={source}
                    title={title}
                  />
                </div>

                {/* Episode List with integrated source selector - Visible if desktop OR active mobile tab */}
                <div className={activeTab !== 'episodes' ? 'hidden lg:block' : 'block'}>
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
