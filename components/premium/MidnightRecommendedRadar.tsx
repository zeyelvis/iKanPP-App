'use client';

import React from 'react';
import { Sparkles, Compass, Flame, ArrowRight } from 'lucide-react';
import { JableVideoCard } from './JableVideoCard';

interface MidnightRecommendedRadarProps {
  videos: any[];
  onPlayVideo: (video: any) => void;
  onExploreMore?: () => void;
}

export function MidnightRecommendedRadar({
  videos = [],
  onPlayVideo,
  onExploreMore,
}: MidnightRecommendedRadarProps) {
  // 选取 4 部高分大作作为智能推荐
  const recommendedList = videos.slice(4, 8);

  if (recommendedList.length === 0) return null;

  return (
    <section className="space-y-4 pt-2">
      {/* 标题 */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-4 bg-gradient-to-b from-pink-500 to-rose-600 rounded-full" />
          <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
            <Compass size={18} className="text-pink-400" />
            <span>智能雷达 · 懂你的私密推荐</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-500/15 text-pink-300 border border-pink-500/30">
              AI 兴趣匹配
            </span>
          </h3>
        </div>

        {onExploreMore && (
          <button
            onClick={onExploreMore}
            className="text-xs text-white/50 hover:text-white flex items-center gap-1 font-bold transition-colors cursor-pointer group"
          >
            <span>换一批</span>
            <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>

      {/* 4 部精选卡片 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {recommendedList.map((video, idx) => (
          <JableVideoCard
            key={`radar-${video.vod_id}-${idx}`}
            video={video}
            onClick={() => onPlayVideo(video)}
            index={idx}
          />
        ))}
      </div>
    </section>
  );
}
