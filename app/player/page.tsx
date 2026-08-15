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
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { getSourceName } from '@/lib/utils/source-names';
import { RelatedKeywords } from '@/components/search/RelatedKeywords';

function PlayerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isPremium = searchParams.get('premium') === '1';
  const { addToHistory } = useHistory(isPremium);

  const videoId = searchParams.get('id');
  const source = searchParams.get('source');
  const title = searchParams.get('title');
  const episodeParam = searchParams.get('episode');
  const groupedSourcesParam = searchParams.get('groupedSources');
  // 消歧义参数：从首页传入的内容类型和年份
  const expectedType = searchParams.get('type'); // 'movie' | 'tv' | null
  const expectedYear = searchParams.get('year'); // e.g. '2025' | null

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
    const allSources = sourcesForMode?.filter((s: VideoSource) => s.enabled !== false) || [];

    if (allSources.length === 0) {
      setTitleSearchError('没有可用的视频源');
      setTitleSearching(false);
      return;
    }

    const normalizedTitle = title.toLowerCase().trim();
    let redirected = false;


    (async () => {
      try {
        const response = await fetch('/api/search-parallel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: title, sources: allSources, page: 1 }),
        });

        if (cancelled) return;

        if (!response.ok || !response.body) {
          if (!cancelled) {
            setTitleSearchError('搜索失败，请返回重试');
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
              if (data.type === 'videos' && data.videos && data.videos.length > 0) {
                // 0. 过滤掉解说类视频
                const isCommentary = (v: any) => {
                  const name = (v.vod_name || '').toLowerCase();
                  const typeName = (v.type_name || '').toLowerCase();
                  return name.includes('解说') || typeName.includes('解说');
                };
                const noCommentary = data.videos.filter((v: any) => !isCommentary(v));
                const videoPool = noCommentary.length > 0 ? noCommentary : data.videos;

                // 1. 精确匹配同名结果
                const exactMatches = videoPool.filter((v: any) =>
                  v.vod_name?.toLowerCase().trim() === normalizedTitle
                );
                // 2. 部分匹配
                const partialMatches = exactMatches.length === 0
                  ? videoPool.filter((v: any) =>
                    v.vod_name?.toLowerCase().trim().includes(normalizedTitle) ||
                    normalizedTitle.includes(v.vod_name?.toLowerCase().trim())
                  )
                  : [];

                // 3. 选择最佳匹配
                let candidates = exactMatches.length > 0 ? exactMatches : partialMatches;
                if (candidates.length === 0) candidates = [videoPool[0]];

                const match = candidates[0];

                if (match && !cancelled) {
                  foundSources.push({
                    id: match.vod_id,
                    source: match.source,
                    sourceName: match.sourceDisplayName || getSourceName(match.source),
                    latency: match.latency,
                    pic: match.vod_pic,
                    typeName: match.type_name,
                  });

                  // Redirect to the first match immediately for fast playback
                  if (!redirected) {
                    redirected = true;
                    const params = new URLSearchParams();
                    params.set('id', String(match.vod_id));
                    params.set('source', match.source);
                    params.set('title', title);
                    if (expectedType) params.set('type', expectedType); // 保留类型参数
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

        // After all sources responded
        if (!redirected && !cancelled) {
          setTitleSearchError('未找到匹配的视频，请尝试搜索其他关键词');
          setTitleSearching(false);
        }
      } catch (err: any) {
        if (!cancelled && err?.name !== 'AbortError') {
          setTitleSearchError('搜索出错，请返回重试');
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

  // Redirect if no params at all
  if (isTitleOnlyMode && !titleSearching && !titleSearchError && !title) {
    router.push('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--bg-color)]">
      {/* Glass Navbar */}
      <Navbar variant="player" isPremiumMode={isPremium} />

      <main className="fluid-container pb-20">
        {isTitleOnlyMode && titleSearching ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[var(--accent-color)] border-t-transparent mb-6"></div>
            <p className="text-lg font-medium text-[var(--text-color)]">正在搜索最佳片源...</p>
            <p className="text-sm text-[var(--text-color-secondary)] mt-2">{title}</p>
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
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[var(--accent-color)] border-t-transparent mb-4"></div>
            <p className="text-[var(--text-color-secondary)]">正在加载视频详情...</p>
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
            <div className="lg:col-span-2 space-y-6">
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
              <div className="hidden lg:block">
                <VideoMetadata
                  videoData={videoData}
                  source={source}
                  title={title}
                />
              </div>

              {/* Favorite Button for current video */}
              {videoData && videoId && (
                <div className="flex items-center gap-3 mt-4">
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
                  <span className="text-sm text-[var(--text-color-secondary)]">
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
              <div className="lg:sticky lg:top-32 space-y-6">
                {/* Mobile Tabs */}
                <SegmentedControl
                  options={[
                    { label: '选集', value: 'episodes' },
                    { label: '简介', value: 'info' },
                  ]}
                  value={activeTab}
                  onChange={setActiveTab}
                  className="lg:hidden mb-4"
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
      </main>

      {/* Favorites Sidebar - Left */}
      <FavoritesSidebar isPremium={isPremium} />
    </div>
  );
}

export default function PlayerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-color)]">
        <div className="brand-spinner" />
      </div>
    }>
      <PlayerContent />
    </Suspense>
  );
}
