'use client';

import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { VideoPlayer } from '@/components/player/VideoPlayer';
import { VideoMetadata } from '@/components/player/VideoMetadata';
import { EpisodeList, SourceInfo } from '@/components/player/EpisodeList';
import { PlayerError } from '@/components/player/PlayerError';
import type { VideoSource } from '@/lib/types';
import { useVideoPlayer } from '@/lib/hooks/useVideoPlayer';
import { usePremiumHistoryStore } from '@/lib/store/history-store';
import { FavoritesSidebar } from '@/components/favorites/FavoritesSidebar';
import { FavoriteButton } from '@/components/favorites/FavoriteButton';
import { ShareButton } from '@/components/player/ShareButton';
import { Navbar } from '@/components/layout/Navbar';
import { settingsStore } from '@/lib/store/settings-store';
import { PREMIUM_SOURCES } from '@/lib/api/premium-sources';
import { getSourceName } from '@/lib/utils/source-names';
import { extractSeasonAndEpisodeNumber } from '@/lib/utils/episode-resolver';

export function IkanXPlayerContainer() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const addToHistory = usePremiumHistoryStore((s) => s.addToHistory);

  const videoId = searchParams.get('id');
  const source = searchParams.get('source');
  const title = searchParams.get('title');
  const episodeParam = searchParams.get('episode') || searchParams.get('ep');
  const groupedSourcesParam = searchParams.get('groupedSources');

  // 初始化时第一时间强制隔离浏览器标签页 Title，杜绝根布局 iKanPP 品牌残留
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.title = title ? `${title} - iKanX 4K极速秒播` : 'iKanX 4K极速秒播 | 顶级影音';
  }, [title]);

  // === Title-only 模式：番号与午夜成人专源精准直达 ===
  const needsTitleSearch = !videoId && !!title;
  const [titleSearching, setTitleSearching] = useState(() => needsTitleSearch);
  const [titleSearchError, setTitleSearchError] = useState('');

  useEffect(() => {
    if (videoId || !title) return;

    let cancelled = false;
    setTitleSearching(true);
    setTitleSearchError('');

    const appSettings = settingsStore.getSettings();
    let allSources = appSettings.premiumSources?.filter((s: VideoSource) => s.enabled !== false) || [];
    if (allSources.length === 0) {
      allSources = PREMIUM_SOURCES as VideoSource[];
    }

    if (source) {
      const preferredSource = allSources.find(s => s.id === source);
      if (preferredSource) {
        allSources = [preferredSource, ...allSources.filter(s => s.id !== source)];
      }
    }

    // 智能提取番号（如 IPZZ-870, SSIS-123, FC2-PPV-123456, MIDE-999 等）
    const codeMatch = title.match(/([A-Za-z0-9]{2,8}[-_][0-9]{3,8}|FC2[-_]PPV[-_][0-9]{5,8}|T28[-_][0-9]{3,5})/i);
    const videoCode = codeMatch ? codeMatch[0].toUpperCase() : null;
    const cleanTitle = title.replace(/[《》【】\[\]（）()]/g, ' ').replace(/\s+/g, ' ').trim();
    const searchQuery = videoCode || cleanTitle;
    let redirected = false;

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
            setTitleSearchError('专区专线暂时繁忙，请点击重试');
            setTitleSearching(false);
          }
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let pendingCandidate: any = null;

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
                  const rawName = (v.vod_name || '').trim().toUpperCase();
                  const isHit = videoCode ? rawName.includes(videoCode) : rawName.includes(cleanTitle.toUpperCase());

                  if (isHit && !redirected && !cancelled) {
                    redirected = true;
                    const params = new URLSearchParams();
                    params.set('id', String(v.vod_id));
                    params.set('source', v.source);
                    params.set('title', title);
                    params.set('premium', '1');
                    if (episodeParam) params.set('episode', episodeParam);
                    router.replace(`/player?${params.toString()}`, { scroll: false });
                    break;
                  }

                  if (!pendingCandidate) {
                    pendingCandidate = v;
                  }
                }
              }
            } catch { /* ignore */ }
          }
          if (redirected) break;
        }

        if (!redirected && !cancelled) {
          if (pendingCandidate) {
            redirected = true;
            const params = new URLSearchParams();
            params.set('id', String(pendingCandidate.vod_id));
            params.set('source', pendingCandidate.source);
            params.set('title', title);
            params.set('premium', '1');
            if (episodeParam) params.set('episode', episodeParam);
            router.replace(`/player?${params.toString()}`, { scroll: false });
          } else {
            setTitleSearchError('未检索到该番号专线资源，请确认番号是否输入正确');
            setTitleSearching(false);
          }
        }
      } catch (err: any) {
        if (!cancelled && !redirected) {
          setTitleSearchError(err.message || '搜索失败，请点击重试');
          setTitleSearching(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [videoId, title, source, episodeParam, router]);

  // === 播放核心状态 ===
  const [currentSourceId, setCurrentSourceId] = useState<string>(source || '');
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
  } = useVideoPlayer(videoId || '', source || '', episodeParam, false, handleSourceUnavailable, title);

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

  const playerTimeRef = useRef(0);

  const handlePlaybackError = useCallback((_error: string) => {
    const currentActiveSource = currentSourceId || source || '';
    if (currentActiveSource) {
      failedSourcesRef.current.add(currentActiveSource);
    }

    const validCandidates = groupedSources.filter(
      (s) => s.source && s.source !== currentActiveSource && !failedSourcesRef.current.has(s.source)
    );
    if (validCandidates.length === 0) return false;

    const candidate = validCandidates[0];
    const params = new URLSearchParams();
    params.set('id', String(candidate.id));
    params.set('source', candidate.source);
    params.set('title', title || '');
    params.set('premium', '1');
    if (playerTimeRef.current > 1) {
      params.set('t', Math.floor(playerTimeRef.current).toString());
    }
    if (groupedSources.length > 0) {
      params.set('groupedSources', JSON.stringify(groupedSources));
    }
    setCurrentSourceId(candidate.source);
    router.replace(`/player?${params.toString()}`, { scroll: false });
    return true;
  }, [currentSourceId, source, groupedSources, title, router]);

  // 历史记录记录（私密隔离）
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
        { vod_actor: videoData.vod_actor, type_name: videoData.type_name, vod_area: videoData.vod_area, isPremium: true }
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
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/premium/player';
    router.replace(`${currentPath}?${params.toString()}`, { scroll: false });
  }, [searchParams, router, setCurrentEpisode, setPlayUrl, setVideoError]);

  const handleBack = useCallback(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('ikanpp_playing_from_hub');
    }
    router.push('/');
  }, [router]);

  if (needsTitleSearch && titleSearching) {
    return (
      <div className="min-h-screen bg-(--bg-color) flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 relative flex items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-full border-4 border-rose-500/20 border-t-rose-500 animate-spin" />
          <span className="absolute text-xl">🔞</span>
        </div>
        <h2 className="text-xl font-bold text-white mb-2 tracking-wide">正在连通专属加密通道...</h2>
        <p className="text-sm text-white/50 max-w-sm text-center">
          正在为您穿透专线防盗链中继，准备极速超清免翻播放
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
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-rose-500 border-t-transparent mb-4" />
        <p className="text-(--text-color-secondary)">正在穿透加密专线...</p>
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
      {/* 严密隔离：绝不渲染主站 SEO 结构化数据 */}
      <Navbar variant="player" isPremiumMode={true} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <VideoPlayer
              playUrl={playUrl}
              videoId={videoId || undefined}
              currentEpisode={currentEpisode}
              onBack={handleBack}
              totalEpisodes={videoData?.episodes?.length || 0}
              isReversed={false}
              isPremium={true}
              videoTitle={videoData?.vod_name || title || ''}
              episodeName={videoData?.episodes?.[currentEpisode]?.name || ''}
              externalTimeRef={playerTimeRef}
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
                  isPremium={true}
                />
                <span className="text-sm text-(--text-color-secondary)">
                  加入私密收藏
                </span>
                <div className="ml-auto flex items-center gap-3">
                  {source && (
                    <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-xs text-rose-200 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                      <span>VIP 专线：{getSourceName(source)}</span>
                    </div>
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
                isReversed={false}
                onEpisodeClick={handleEpisodeClick}
                sources={groupedSources.length > 0 ? groupedSources : undefined}
                currentSource={currentSourceId || source || ''}
                onSourceChange={(newSource) => {
                  const params = new URLSearchParams();
                  params.set('id', String(newSource.id));
                  params.set('source', newSource.source);
                  params.set('title', title || '');
                  params.set('premium', '1');
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
      </main>

      <FavoritesSidebar isPremium={true} />
    </div>
  );
}
