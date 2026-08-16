'use client';

import { memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Icons } from '@/components/ui/Icon';
import { LatencyBadge } from '@/components/ui/LatencyBadge';
import { FavoriteButton } from '@/components/favorites/FavoriteButton';
import { Video } from '@/lib/types';
import { parseVideoTitle } from '@/lib/utils/video';

interface VideoCardProps {
  video: Video;
  videoUrl: string;
  cardId: string;
  isActive: boolean;
  onCardClick: (e: React.MouseEvent, cardId: string, videoUrl: string) => void;
  isPremium?: boolean;
  latencies?: Record<string, number>;
}

export const VideoCard = memo<VideoCardProps>(({
  video,
  videoUrl,
  cardId,
  isActive,
  onCardClick,
  isPremium = false,
  latencies = {},
}) => {
  const displayLatency = latencies[video.source] ?? video.latency;
  const proxiedPic = video.vod_pic?.startsWith('http')
    ? `/api/img-proxy?url=${encodeURIComponent(video.vod_pic)}`
    : video.vod_pic;

  return (
    <div
      className="relative select-none"
      onMouseEnter={(e) => (e.currentTarget.style.zIndex = '100')}
      onMouseLeave={(e) => (e.currentTarget.style.zIndex = '1')}
    >
      <Link
        key={cardId}
        href={videoUrl}
        onClick={(e) => onCardClick(e, cardId, videoUrl)}
        role="listitem"
        aria-label={`${video.vod_name}${video.vod_remarks ? ` - ${video.vod_remarks}` : ''}`}
        prefetch={false}
        className="group cursor-pointer block h-full cinema-poster-card"
      >
        <Card
          className="p-0 flex flex-col h-full bg-[#0A0A0F]/60 backdrop-blur-md rounded-2xl overflow-hidden border border-white/10 shadow-lg group-hover:border-(--accent-color)/50 transition-all duration-300"
          hover={false}
          blur={false}
        >
          {/* 海报区域 */}
          <div className="relative aspect-2/3 bg-white/5 overflow-hidden">
            {proxiedPic ? (
              <Image
                src={proxiedPic}
                alt={video.vod_name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-108"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, (max-width: 1600px) 16vw, 12vw"
                loading="lazy"
                unoptimized
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.style.opacity = '0';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Icons.Film size={48} className="text-white/20" />
              </div>
            )}

            {/* 顶部标签容器 */}
            <div className="absolute top-2 left-2 right-2 z-10 flex items-center justify-between gap-1 pointer-events-none">
              <div className="flex items-center gap-1 min-w-0">
                {video.sourceName && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-(--accent-color) text-white shadow-md truncate max-w-22.5">
                    {video.sourceName}
                  </span>
                )}
                {video.type_name && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/60 backdrop-blur-md text-white/80 border border-white/10 truncate max-w-17.5">
                    {video.type_name}
                  </span>
                )}
              </div>

              {/* 收藏按钮 */}
              <div className="pointer-events-auto shrink-0">
                <FavoriteButton
                  videoId={video.vod_id}
                  source={video.source}
                  title={video.vod_name}
                  poster={video.vod_pic}
                  type={video.type_name}
                  year={video.vod_year}
                  remarks={video.vod_remarks}
                  isPremium={isPremium}
                  size={14}
                  className="w-7 h-7 bg-black/60 backdrop-blur-md border border-white/10 hover:bg-black/90 text-white rounded-full flex items-center justify-center shadow-md"
                />
              </div>
            </div>

            {/* 底部备注角标（清晰度/集数） */}
            {video.vod_remarks && (
              <div className="absolute bottom-2 left-2 z-10">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/75 backdrop-blur-md text-amber-300 border border-amber-400/20 shadow-md">
                  {video.vod_remarks}
                </span>
              </div>
            )}

            {/* 悬停播放遮罩 */}
            <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-3">
              <button className="w-full py-2 bg-(--accent-color) hover:brightness-110 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
                立即播放
              </button>
            </div>
          </div>

          {/* 底部标题与信息 */}
          <div className="p-3 flex flex-col justify-between flex-1">
            <h3 className="text-xs sm:text-sm font-bold text-white/90 line-clamp-1 group-hover:text-(--accent-color) transition-colors">
              {video.vod_name}
            </h3>

            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-[11px] text-white/40">
              <span className="truncate">{video.vod_year || video.vod_area || '全网片源'}</span>
              {displayLatency !== undefined && (
                <LatencyBadge latency={displayLatency} />
              )}
            </div>
          </div>
        </Card>
      </Link>
    </div>
  );
});
