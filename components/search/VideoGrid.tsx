'use client';

import { useState, useRef, useCallback, useMemo, memo, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { VideoCard } from './VideoCard';
import { VideoGroupCard, GroupedVideo } from './VideoGroupCard';
import { settingsStore } from '@/lib/store/settings-store';
import { Video } from '@/lib/types';

interface VideoGridProps {
  videos: Video[];
  className?: string;
  isPremium?: boolean;
  latencies?: Record<string, number>;
}

export const VideoGrid = memo(function VideoGrid({
  videos,
  className = '',
  isPremium = false,
  latencies = {}
}: VideoGridProps) {
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(24);
  const [displayMode, setDisplayMode] = useState<'normal' | 'grouped'>('normal');
  const gridRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Load display mode from settings
  useEffect(() => {
    const settings = settingsStore.getSettings();
    setDisplayMode(settings.searchDisplayMode);

    // Initial load: Check for saved scroll position to ensure we render enough items
    const params = searchParams.toString();
    const scrollKey = `scroll-pos:${pathname}${params ? '?' + params : ''}`;
    const savedPos = sessionStorage.getItem(scrollKey);

    if (savedPos && settings.rememberScrollPosition) {
      const position = parseInt(savedPos, 10);
      if (!isNaN(position) && position > 500) {
        // Approximate visible count needed: 
        // 500 is roughly where the second/third row starts.
        // Each row is ~300-400px high on most screens. 
        // 24 items is 4-6 rows.
        // If scroll is deep, we force a larger initial visible count.
        // 24, 48, 72, 96...
        const estimatedRowsNeeded = Math.ceil(position / 300) + 2;
        // Match CSS breakpoints: sm: 3, md: 4, lg: 5, xl: 6
        const itemsPerRow = window.innerWidth >= 1280 ? 6 :
          (window.innerWidth >= 1024 ? 5 :
            (window.innerWidth >= 768 ? 4 :
              (window.innerWidth >= 640 ? 3 : 2)));
        const neededCount = Math.min(videos.length, estimatedRowsNeeded * itemsPerRow);

        if (neededCount > 24) {
          setVisibleCount(Math.ceil(neededCount / 24) * 24);
        }
      }
    }

    const unsubscribe = settingsStore.subscribe(() => {
      const newSettings = settingsStore.getSettings();
      setDisplayMode(newSettings.searchDisplayMode);
    });

    return () => unsubscribe();
  }, [pathname, searchParams, videos.length]);

  // 搜索结果去重：同名同年份的视频只保留最优的一个
  const deduplicatedVideos = useMemo(() => {
    if (displayMode === 'grouped') return videos;

    const groups = new Map<string, Video[]>();
    for (const video of videos) {
      // 标准化名称：去掉括号里的年份后缀，统一大小写
      const normalizedName = video.vod_name
        .toLowerCase()
        .trim()
        .replace(/\s*[\(（]\d{4}[\)）]\s*$/, '')  // 去掉 (2026) 或 （2026）
        .replace(/\d{4}$/, '');                    // 去掉末尾年份如 "除恶2026"

      const year = video.vod_year || '';
      const key = `${normalizedName}__${year}`;

      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(video);
    }

    return Array.from(groups.values()).map(group => {
      if (group.length === 1) return group[0];

      // 保留最优的：优先延迟最低的
      const sorted = [...group].sort((a, b) => {
        if (a.latency === undefined) return 1;
        if (b.latency === undefined) return -1;
        return a.latency - b.latency;
      });

      const best = { ...sorted[0] };
      // 在备注中标注合并了多少个来源
      if (group.length > 1) {
        const sourceCount = group.length;
        const existingRemarks = best.vod_remarks || '';
        best.vod_remarks = existingRemarks
          ? `${existingRemarks} · ${sourceCount}个来源`
          : `${sourceCount}个来源`;
      }
      return best;
    });
  }, [videos, displayMode]);

  if (deduplicatedVideos.length === 0) {
    return null;
  }

  // Group videos by name when in grouped mode
  const groupedVideos = useMemo<GroupedVideo[]>(() => {
    if (displayMode !== 'grouped') return [];

    const groups = new Map<string, Video[]>();

    deduplicatedVideos.forEach(video => {
      const name = video.vod_name.toLowerCase().trim();
      if (!groups.has(name)) {
        groups.set(name, []);
      }
      groups.get(name)!.push(video);
    });

    return Array.from(groups.entries()).map(([, groupVideos]) => {
      // Sort by latency (lowest first) 
      const sorted = [...groupVideos].sort((a, b) => {
        if (a.latency === undefined) return 1;
        if (b.latency === undefined) return -1;
        return a.latency - b.latency;
      });

      return {
        representative: sorted[0],
        videos: sorted,
        name: sorted[0].vod_name,
      };
    });
  }, [deduplicatedVideos, displayMode]);

  // Callback ref for the load more trigger
  const loadMoreRef = useCallback((node: HTMLDivElement | null) => {
    if (observerRef.current) observerRef.current.disconnect();

    if (node) {
      observerRef.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
          setVisibleCount(prev => prev + 24);
        }
      }, { rootMargin: '400px' });

      observerRef.current.observe(node);
    }
  }, []);

  // Memoize the click handler
  const handleCardClick = useCallback((e: React.MouseEvent, videoId: string, videoUrl: string) => {
    const isMobile = window.innerWidth < 1024;

    if (isMobile) {
      if (activeCardId === videoId) {
        window.location.href = videoUrl;
      } else {
        e.preventDefault();
        setActiveCardId(videoId);
      }
    }
  }, [activeCardId]);

  // Normal mode items
  const videoItems = useMemo(() => {
    if (displayMode === 'grouped') return [];

    return deduplicatedVideos.map((video, index) => {
      const params: Record<string, string> = {
        id: String(video.vod_id),
        source: video.source,
        title: video.vod_name,
      };

      if (isPremium) {
        params.premium = '1';
      }

      const videoUrl = `/player?${new URLSearchParams(params).toString()}`;

      const cardId = `${video.vod_id}-${index}`;

      return { video, videoUrl, cardId };
    });
  }, [deduplicatedVideos, displayMode, isPremium]);

  // Grouped mode items
  const groupItems = useMemo(() => {
    if (displayMode !== 'grouped') return [];

    return groupedVideos.map((group, index) => ({
      group,
      cardId: `group-${group.representative.vod_id}-${index}`,
    }));
  }, [groupedVideos, displayMode]);

  const totalItems = displayMode === 'grouped' ? groupItems.length : videoItems.length;

  return (
    <>
      <div
        ref={gridRef}
        className={`movie-fluid-grid ${className}`}
        role="list"
        aria-label="视频搜索结果"
      >
        {displayMode === 'grouped' ? (
          // Grouped mode
          groupItems.slice(0, visibleCount).map(({ group, cardId }) => {
            const isActive = activeCardId === cardId;
            return (
              <VideoGroupCard
                key={cardId}
                group={group}
                cardId={cardId}
                isActive={isActive}
                onCardClick={handleCardClick}
                isPremium={isPremium}
                latencies={latencies}
              />
            );
          })
        ) : (
          // Normal mode
          videoItems.slice(0, visibleCount).map(({ video, videoUrl, cardId }) => {
            const isActive = activeCardId === cardId;
            return (
              <VideoCard
                key={cardId}
                video={video}
                videoUrl={videoUrl}
                cardId={cardId}
                isActive={isActive}
                onCardClick={handleCardClick}
                isPremium={isPremium}
                latencies={latencies}
              />
            );
          })
        )}
      </div>

      {/* Load more trigger */}
      {visibleCount < totalItems && (
        <div
          ref={loadMoreRef}
          className="h-20 w-full flex items-center justify-center opacity-0 pointer-events-none"
          aria-hidden="true"
        />
      )}
    </>
  );
});

