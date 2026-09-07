'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { settingsStore } from '@/lib/store/settings-store';

interface VideoData {
  vod_id: string;
  vod_name: string;
  vod_pic?: string;
  vod_content?: string;
  vod_actor?: string;
  vod_director?: string;
  vod_year?: string;
  vod_area?: string;
  vod_lang?: string;
  vod_remarks?: string;
  type_name?: string;
  episodes?: Array<{ name?: string; url: string }>;
}

interface UseVideoPlayerReturn {
  videoData: VideoData | null;
  loading: boolean;
  videoError: string;
  currentEpisode: number;
  playUrl: string;
  setCurrentEpisode: (index: number) => void;
  setPlayUrl: (url: string) => void;
  setVideoError: (error: string) => void;
  fetchVideoDetails: () => Promise<void>;
}

export function useVideoPlayer(
  videoId: string | null,
  source: string | null,
  episodeParam: string | null,
  isReversed: boolean = false,
  onSourceUnavailable?: () => void
): UseVideoPlayerReturn {
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  // Initialize loading to true if we have the necessary params to start fetching
  const [loading, setLoading] = useState(!!(videoId && source));
  const [currentEpisode, setCurrentEpisode] = useState(0);
  const [playUrl, setPlayUrl] = useState('');
  const [videoError, setVideoError] = useState<string>('');

  // Refs to keep track of latest values for the fetch function without re-triggering it
  // This solves the stale closure problem while keeping fetchVideoDetails stable for the player
  const episodeParamRef = useRef(episodeParam);
  const isReversedRef = useRef(isReversed);
  const onSourceUnavailableRef = useRef(onSourceUnavailable);

  useEffect(() => {
    episodeParamRef.current = episodeParam;
  }, [episodeParam]);

  useEffect(() => {
    isReversedRef.current = isReversed;
  }, [isReversed]);

  useEffect(() => {
    onSourceUnavailableRef.current = onSourceUnavailable;
  }, [onSourceUnavailable]);



  const fetchVideoDetails = useCallback(async () => {
    if (!videoId || !source) return;

    try {
      // Don't clear error immediately if we are just retrying silently, 
      // but for manual retry or initial load we should.
      // Let's clear it to show loading state if we want, or keep it.
      // Standard behavior: clear error and show loading.
      setVideoError('');
      setLoading(true);

      const settings = settingsStore.getSettings();
      const allSources = [
        ...settings.sources,
        ...settings.premiumSources,
        ...settings.subscriptions,
      ];

      const sourceConfig = allSources.find(s => s.id === source);
      let response;

      if (sourceConfig) {
        response = await fetch('/api/detail', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: videoId, source: sourceConfig })
        });
      } else {
        response = await fetch(`/api/detail?id=${videoId}&source=${source}`);
      }

      const data = await response.json();

      if (!response.ok) {
        setVideoError(data.error || '该视频源不可用。请返回并尝试其他来源。');
        setLoading(false);
        onSourceUnavailableRef.current?.();
        return;
      }

      if (data.success && data.data) {
        if (data.data.episodes && data.data.episodes.length > 0) {
          setVideoData(data.data);
          setLoading(false);
          // 智能选集：优先 HD/高清，避免 TC/抢先版
          const episodes = data.data.episodes;
          const latestIsReversed = isReversedRef.current;
          const latestEpisodeParam = episodeParamRef.current;

          let defaultIndex = latestIsReversed ? episodes.length - 1 : 0;

          // 如果没有手动指定集数，智能选择最佳画质
          if (!latestEpisodeParam) {
            const hdKeywords = ['hd', '高清', '蓝光', '4k', '1080', '超清', '720'];
            const lowKeywords = ['tc', '抢先', '枪版', 'ts', 'cam', '预告'];

            // 优先找 HD/高清集
            const hdIndex = episodes.findIndex((ep: { name?: string }) => {
              const name = (ep.name || '').toLowerCase();
              return hdKeywords.some(kw => name.includes(kw));
            });

            if (hdIndex !== -1) {
              defaultIndex = hdIndex;
            } else {
              // 如果第一集是 TC/抢先，尝试选下一个非低质的
              const firstName = (episodes[defaultIndex]?.name || '').toLowerCase();
              const isLowQuality = lowKeywords.some(kw => firstName.includes(kw));
              if (isLowQuality && episodes.length > 1) {
                const betterIndex = episodes.findIndex((ep: { name?: string }, i: number) => {
                  if (i === defaultIndex) return false;
                  const name = (ep.name || '').toLowerCase();
                  return !lowKeywords.some(kw => name.includes(kw));
                });
                if (betterIndex !== -1) defaultIndex = betterIndex;
              }
            }
          }

          const episodeIndex = latestEpisodeParam ? parseInt(latestEpisodeParam, 10) : defaultIndex;
          const validIndex = (episodeIndex >= 0 && episodeIndex < episodes.length) ? episodeIndex : defaultIndex;

          const episodeUrl = episodes[validIndex].url;
          setCurrentEpisode(validIndex);
          setPlayUrl(episodeUrl);
        } else {
          setVideoError('该来源没有可播放的剧集');
          setLoading(false);
          // 触发自动切换到其他源
          onSourceUnavailableRef.current?.();
        }
      } else {
        throw new Error(data.error || '来自 API 的响应无效');
      }
    } catch (error) {
      console.error('Failed to fetch video details:', error);
      setVideoError(error instanceof Error ? error.message : '加载视频详情失败。');
      setLoading(false);
      onSourceUnavailableRef.current?.();
    }
  }, [videoId, source]);

  // EFFECT: Retry logic when settings change (e.g., sources loaded from subscriptions)
  useEffect(() => {
    if (!videoId || !source || !videoError) return;

    const unsubscribe = settingsStore.subscribe(() => {
      // If we are currently in an error state (likely "Invalid source configuration"),
      // and settings updated (likely new sources arrived), try fetching again.
      // We can be smarter: check if the source ID now exists in the store.
      const settings = settingsStore.getSettings();
      const allSources = [
        ...settings.sources,
        ...settings.premiumSources,
        ...settings.subscriptions, // note: subscription items aren't usually video sources directly but let's check broadly
      ];

      // We really need to check if the specific source ID is now available
      // But since 'subscriptions' in store expands into 'sources'/'premiumSources',
      // we just check if any sources exist now.
      if (allSources.length > 0) {
        console.log("Settings updated, retrying video fetch...");
        fetchVideoDetails();
      }
    });

    return () => unsubscribe();
  }, [videoId, source, videoError, fetchVideoDetails]);

  // Sync state from params if they change externally (e.g. back/forward navigation)
  useEffect(() => {
    if (videoData?.episodes && episodeParam !== null) {
      const index = parseInt(episodeParam, 10);
      if (!isNaN(index) && index >= 0 && index < videoData.episodes.length) {
        if (index !== currentEpisode) {
          setCurrentEpisode(index);
          setPlayUrl(videoData.episodes[index].url);
        }
      }
    }
  }, [episodeParam, videoData, currentEpisode]);

  useEffect(() => {
    if (videoId && source) {
      // Reset state when source changes to ensure clean fetch
      setVideoData(null);
      setCurrentEpisode(0);
      setPlayUrl('');
      fetchVideoDetails();
    } else {
      // 当没有 videoId 或 source（如进入按片名全网重搜自愈模式），彻底重置播放器状态
      setVideoData(null);
      setPlayUrl('');
      setCurrentEpisode(0);
      setVideoError('');
      setLoading(false);
    }
  }, [videoId, source, fetchVideoDetails]);

  return {
    videoData,
    loading,
    videoError,
    currentEpisode,
    playUrl,
    setCurrentEpisode,
    setPlayUrl,
    setVideoError,
    fetchVideoDetails,
  };
}
