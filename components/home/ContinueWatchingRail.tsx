'use client';

import { useHistory } from '@/lib/store/history-store';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Icons } from '@/components/ui/Icon';
import { getOptimizedImageUrl } from '@/lib/utils/image-utils';
import { getSourceName } from '@/lib/utils/source-names';
import { storeGroupedSources } from '@/lib/utils/grouped-sources-cache';
import { getEpisodeDisplayInfo } from '@/lib/utils/episode-resolver';

import { useState } from 'react';

function ContinueWatchingCard({
  item,
  idx,
  onPlay,
}: {
  item: any;
  idx: number;
  onPlay: (item: any) => void;
}) {
  const [imgError, setImgError] = useState(false);

  const progressPercent = item.duration && item.duration > 0
    ? Math.min(100, Math.round((item.playbackPosition / item.duration) * 100))
    : 0;

  const proxiedPoster = getOptimizedImageUrl(item.poster);
  const epDisplay = getEpisodeDisplayInfo(item.episodes, item.episodeIndex);
  const showFallback = imgError || !item.poster || proxiedPoster === '/placeholder-poster.svg';

  return (
    <div
      key={item.showIdentifier || item.title || idx}
      onClick={() => onPlay(item)}
      className="group relative shrink-0 w-64 sm:w-72 bg-[#0A0A0F]/80 backdrop-blur-xl border border-white/10 hover:border-(--accent-color)/50 rounded-2xl p-3 flex gap-3.5 items-center cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 select-none"
    >
      {/* 海报缩略图 */}
      <div className="relative w-16 h-22 sm:w-18 sm:h-24 rounded-xl overflow-hidden shrink-0 bg-gradient-to-br from-white/10 to-white/5 border border-white/10 shadow-md flex items-center justify-center">
        {showFallback ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-[#161622]">
            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center mb-1 text-white/40">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/>
              </svg>
            </div>
            <span className="text-[10px] font-bold text-white/50 line-clamp-1 leading-tight">
              {item.title}
            </span>
          </div>
        ) : (
          <Image
            src={proxiedPoster}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="100px"
            unoptimized
            onError={() => setImgError(true)}
          />
        )}
        {/* 悬浮播放微图标 */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-7 h-7 rounded-full bg-(--accent-color) text-white flex items-center justify-center shadow-lg">
            <svg className="w-3.5 h-3.5 fill-current ml-0.5" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* 右侧信息 */}
      <div className="min-w-0 flex-1 flex flex-col justify-between h-full py-0.5">
        <div>
          <h4 className="text-sm font-bold text-white truncate group-hover:text-(--accent-color) transition-colors">
            {item.title}
          </h4>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-white/50">
            <span className="px-1.5 py-0.5 rounded bg-white/10 text-[11px] font-medium text-white/80">
              {epDisplay.label}
            </span>
            {progressPercent > 0 && (
              <span className="text-[11px] text-amber-300 font-semibold">
                已看 {progressPercent}%
              </span>
            )}
          </div>
        </div>

        {/* 进度条 */}
        <div className="mt-2.5 space-y-1">
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-(--accent-color) rounded-full"
              style={{ width: `${progressPercent || 5}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ContinueWatchingRail() {
  const router = useRouter();
  const { viewingHistory } = useHistory(false);

  if (!viewingHistory || viewingHistory.length === 0) return null;

  // 仅展示最近 6 条观看记录
  const recentHistory = viewingHistory.slice(0, 6);

  const handleResumePlay = (item: any) => {
    const params = new URLSearchParams();
    if (item.videoId !== undefined && item.videoId !== null && item.videoId !== '') {
      params.set('id', String(item.videoId));
    }
    params.set('title', item.title);
    if (item.source) params.set('source', item.source);
    
    const displayInfo = getEpisodeDisplayInfo(item.episodes, item.episodeIndex);
    if (displayInfo.paramValue) {
      params.set('episode', displayInfo.paramValue);
    }
    if (item.playbackPosition && item.playbackPosition > 1) {
      params.set('t', Math.floor(item.playbackPosition).toString());
    }
    // 携带多线路切源数据 (通过 sessionStorage 缓存短 key 替代 URL 膨胀)
    if (item.sourceMap && Object.keys(item.sourceMap).length > 1) {
      const groupData = Object.entries(item.sourceMap).map(([sourceName, vid]) => ({
        id: vid as string,
        source: sourceName,
        sourceName: getSourceName(sourceName),
      }));
      const gsKey = storeGroupedSources(groupData);
      if (gsKey) {
        params.set('gsKey', gsKey);
      }
    }
    if (item.type_name) {
      const isTv = item.type_name.includes('剧') || item.type_name.includes('动漫') || (item.episodeIndex && item.episodeIndex > 0);
      params.set('type', isTv ? 'tv' : 'movie');
    }
    if (item.isPremium) params.set('premium', '1');
    router.push(`/player?${params.toString()}`);
  };

  return (
    <div className="mb-10 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">🎬</span>
          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
            <span>继续观看</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-(--accent-color)/20 text-(--accent-color) border border-(--accent-color)/30">
              {viewingHistory.length} 部未播完
            </span>
          </h2>
        </div>
        <span className="text-xs text-white/40">点击直接从断点继续播放</span>
      </div>

      {/* 滚动横幅列表 */}
      <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {recentHistory.map((item, idx) => (
          <ContinueWatchingCard
            key={item.showIdentifier || item.title || idx}
            item={item}
            idx={idx}
            onPlay={handleResumePlay}
          />
        ))}
      </div>
    </div>
  );
}
