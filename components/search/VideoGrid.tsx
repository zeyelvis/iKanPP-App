'use client';

import { useState, useRef, useCallback, useMemo, memo, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { VideoCard } from './VideoCard';
import { VideoGroupCard, GroupedVideo } from './VideoGroupCard';
import { settingsStore } from '@/lib/store/settings-store';
import { Video } from '@/lib/types';
import { extractCleanBaseTitle } from '@/lib/utils/search';
import { parseSeasonFromTitle } from '@/lib/utils/season-resolver';
import { useUserStore } from '@/lib/store/user-store';

// 黄金健康骨干源梯队优先（巨量1 > 光速2 > 暴风3 > 无尽4 > 最大5 > 极速6 > 新浪7 > 魔都8 > 360 9）
const SOURCE_PRIORITY_ORDER: Record<string, number> = {
  juliang: 1,
  guangsu: 2,
  baofeng: 3,
  wujin: 4,
  zuida: 5,
  jisu: 6,
  xinlang: 7,
  modu: 8,
  zy360: 9,
};

const RISKY_SOURCES = new Set(['subo', 'ikun', 'haitun', 'hongniu', 'huya', 'jinying', 'jingyu']);

/**
 * 智能提取片源聚合 Key（严格按「纯净母标题 + 季数」隔离，严禁多季互相吞并）
 */
function getGroupingKey(vodName: string): string {
  const parsedSeason = parseSeasonFromTitle(vodName);
  const seasonNum = parsedSeason ? parsedSeason.seasonNumber : 1;
  const rawBase = parsedSeason ? parsedSeason.baseTitle : vodName;

  // 清洗括号备注、画质与语言修饰词
  const cleanBase = rawBase
    .replace(/[\[\(（【].*?[\]\)）】]/g, '')
    .replace(/\s*(?:国语|粤语|英语|韩语|日语|中字|双字|原声|TC|HD|4K|1080P|720P|蓝光|抢先版|完结版)\s*$/i, '')
    .replace(/[:：\-—_]+$/, '')
    .trim()
    .toLowerCase();

  return `${cleanBase || vodName.toLowerCase().trim()}__s${seasonNum}`;
}

interface VideoGridProps {
  videos: Video[];
  className?: string;
  isPremium?: boolean;
  latencies?: Record<string, number>;
  onCardClick?: (videoId: string, videoUrl: string) => void;
}

export const VideoGrid = memo(function VideoGrid({
  videos,
  className = '',
  isPremium = false,
  latencies = {},
  onCardClick: externalCardClick,
}: VideoGridProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const user = useUserStore(state => state.user);

  const [displayMode, setDisplayMode] = useState<'normal' | 'grouped' | 'flat'>(() => {
    return settingsStore.getSettings().searchDisplayMode;
  });

  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(24);
  const gridRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    setVisibleCount(24);
    setActiveCardId(null);
  }, [videos.length]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 768;
      const isTv = (window as any).isTvPlatform ||
        (user && (user as any).isTvDevice) ||
        (typeof navigator !== 'undefined' && /smart-tv|android tv|googletv|appletv/i.test(navigator.userAgent));

      if (isMobile) {
        setDisplayMode('flat');
      } else if (isTv) {
        setDisplayMode('flat');
      } else {
        const urlMode = searchParams?.get('display');
        if (urlMode === 'grouped' || urlMode === 'flat' || urlMode === 'normal') {
          setDisplayMode(urlMode as any);
        } else {
          setDisplayMode(settingsStore.getSettings().searchDisplayMode);
        }
      }
    }

    const unsubscribe = settingsStore.subscribe(() => {
      const newSettings = settingsStore.getSettings();
      setDisplayMode(newSettings.searchDisplayMode);
    });

    return () => unsubscribe();
  }, [pathname, searchParams, videos.length]);

  // 搜索结果去重与智能排序：同名同季同年份的视频聚合为最优卡片，并严格按黄金骨干源与相关度排序
  const deduplicatedVideos = useMemo(() => {
    const groups = new Map<string, Video[]>();
    for (const video of videos) {
      const groupKey = getGroupingKey(video.vod_name);
      const year = video.vod_year || '';
      const key = `${groupKey}__${year}`;

      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(video);
    }

    const dedupedList = Array.from(groups.values()).map(group => {
      if (group.length === 1) {
        return {
          ...group[0],
          sourceCount: 1,
        };
      }

      // 保留最优的：黄金骨干梯队（巨量第一）优先，非风险源优先，最后比延迟
      const sorted = [...group].sort((a, b) => {
        const pA = SOURCE_PRIORITY_ORDER[a.source] ?? 99;
        const pB = SOURCE_PRIORITY_ORDER[b.source] ?? 99;
        if (pA !== pB) {
          return pA - pB;
        }

        const aIsRisky = RISKY_SOURCES.has(a.source);
        const bIsRisky = RISKY_SOURCES.has(b.source);
        if (aIsRisky !== bIsRisky) {
          return aIsRisky ? 1 : -1;
        }

        if (a.latency === undefined) return 1;
        if (b.latency === undefined) return -1;
        return a.latency - b.latency;
      });

      const best = { ...sorted[0] };
      // 聚合最高相关度分值，并根据多源热度加权
      const maxScore = Math.max(...group.map(v => (v as any).relevanceScore || 0));
      (best as any).relevanceScore = maxScore + Math.min(group.length * 10, 200);

      // 记录聚合的可用线路总数
      best.sourceCount = group.length;

      return best;
    });

    // 核心修复：去重后必须严格按相关度 (DESC) 然后按延迟 (ASC) 重排
    return dedupedList.sort((a, b) => {
      const scoreA = (a as any).relevanceScore || 0;
      const scoreB = (b as any).relevanceScore || 0;
      if (scoreB !== scoreA) {
        return scoreB - scoreA;
      }
      const latencyA = a.latency || 99999;
      const latencyB = b.latency || 99999;
      return latencyA - latencyB;
    });
  }, [videos]);

  if (deduplicatedVideos.length === 0) {
    return null;
  }

  // Group videos by name & season when in grouped mode
  const groupedVideos = useMemo<GroupedVideo[]>(() => {
    if (displayMode !== 'grouped') return [];

    const groups = new Map<string, Video[]>();

    videos.forEach(video => {
      const groupKey = getGroupingKey(video.vod_name);
      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey)!.push(video);
    });

    const groupList = Array.from(groups.entries()).map(([, groupVideos]) => {
      // 优先选取正片作为卡片代表源（严禁衍生音乐剧、舞台剧、解说抢占代表位），其次按延迟最优排序
      const sorted = [...groupVideos].sort((a, b) => {
        const aSub = ((a as any).vod_sub || '').toLowerCase();
        const bSub = ((b as any).vod_sub || '').toLowerCase();
        const aIsDeriv = aSub.includes('musical') || aSub.includes('broadway') || a.vod_name.includes('音乐剧') || a.vod_name.includes('舞台剧') || a.type_name?.includes('解说');
        const bIsDeriv = bSub.includes('musical') || bSub.includes('broadway') || b.vod_name.includes('音乐剧') || b.vod_name.includes('舞台剧') || b.type_name?.includes('解说');
        if (aIsDeriv !== bIsDeriv) {
          return aIsDeriv ? 1 : -1;
        }

        // 黄金健康骨干源梯队优先（巨量1 > 光速2 > 暴风3 > 无尽4 > 最大5 > 极速6 > 新浪7 > 魔都8 > 360 9）
        const pA = SOURCE_PRIORITY_ORDER[a.source] ?? 99;
        const pB = SOURCE_PRIORITY_ORDER[b.source] ?? 99;
        if (pA !== pB) {
          return pA - pB;
        }

        // 存在非标端口切片或旧域名 404 风险的源尽量不作为首选代表源
        const aIsRisky = RISKY_SOURCES.has(a.source);
        const bIsRisky = RISKY_SOURCES.has(b.source);
        if (aIsRisky !== bIsRisky) {
          return aIsRisky ? 1 : -1;
        }

        if (a.latency === undefined) return 1;
        if (b.latency === undefined) return -1;
        return a.latency - b.latency;
      });

      const maxScore = Math.max(...groupVideos.map(v => (v as any).relevanceScore || 0));
      const rep = { ...sorted[0] };
      (rep as any).relevanceScore = maxScore + Math.min(groupVideos.length * 10, 200);

      return {
        representative: rep,
        videos: sorted,
        name: sorted[0].vod_name,
      };
    });

    // 分组模式下同样严格按相关度从高到低排序
    return groupList.sort((a, b) => {
      const scoreA = (a.representative as any).relevanceScore || 0;
      const scoreB = (b.representative as any).relevanceScore || 0;
      if (scoreB !== scoreA) return scoreB - scoreA;
      return (b.videos.length) - (a.videos.length);
    });
  }, [videos, displayMode]);

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

  // Memoize the click handler（全站免费：无阻断直达播放）
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

