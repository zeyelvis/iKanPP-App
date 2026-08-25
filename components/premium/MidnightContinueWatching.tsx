'use client';

import React from 'react';
import Image from 'next/image';
import { Play, Clock, Sparkles, Trash2 } from 'lucide-react';
import { useHistory } from '@/lib/store/history-store';
import type { VideoHistoryItem } from '@/lib/types';

interface MidnightContinueWatchingProps {
  onPlayVideo: (video: any) => void;
}

export function MidnightContinueWatching({ onPlayVideo }: MidnightContinueWatchingProps) {
  const { viewingHistory, removeFromHistory } = useHistory(true);

  // 筛选出有效断点的午夜历史（观看时长 > 5秒）
  const activeHistory = viewingHistory.filter(item => item.playbackPosition > 5).slice(0, 6);

  if (activeHistory.length === 0) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleContinue = (item: VideoHistoryItem) => {
    onPlayVideo({
      vod_id: item.videoId,
      vod_name: item.title,
      vod_pic: item.poster || '',
      source: item.source || 'hsck',
    });
  };

  return (
    <section className="mt-6 mb-8 animate-fade-in">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-5 rounded-full bg-gradient-to-b from-amber-400 to-yellow-600" />
          <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
            <span>私密接着看</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
              {activeHistory.length} 部未完
            </span>
          </h3>
        </div>
      </div>

      {/* 横向滑动卡片 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {activeHistory.map((item, idx) => {
          // 提取番号
          const codeMatch = item.title.match(/([A-Za-z0-9]{2,8}[-_][0-9]{3,8}|FC2[-_]PPV[-_][0-9]{5,8}|T28[-_][0-9]{3,5})/i);
          const videoCode = codeMatch ? codeMatch[0].toUpperCase() : null;

          return (
            <div
              key={`continue-${item.videoId}-${idx}`}
              onClick={() => handleContinue(item)}
              className="group relative flex flex-col rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-amber-500/40 shadow-lg hover:shadow-amber-500/10 transition-all duration-300 overflow-hidden cursor-pointer hover:-translate-y-1"
            >
              {/* 封面与播放按钮 */}
              <div className="relative aspect-[16/10] bg-black/60 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10" />

                {/* 番号徽章 */}
                {videoCode && (
                  <div className="absolute top-2 left-2 z-20 px-1.5 py-0.5 rounded-md bg-amber-500/90 text-black text-[9px] font-black uppercase tracking-wider shadow-sm">
                    {videoCode}
                  </div>
                )}

                {/* 删除记录小按钮 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromHistory(item.title);
                  }}
                  className="absolute top-2 right-2 z-20 w-6 h-6 rounded-full bg-black/60 hover:bg-red-500/80 text-white/60 hover:text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all"
                  title="删除此记录"
                >
                  <Trash2 size={11} />
                </button>

                {/* 居中浮现播放图标 */}
                <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-10 h-10 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-lg shadow-amber-500/40 scale-75 group-hover:scale-100 transition-transform">
                    <Play size={16} className="fill-current ml-0.5" />
                  </div>
                </div>

                {/* 底部续播时间 */}
                <div className="absolute bottom-2 left-2.5 right-2.5 z-20 flex items-center justify-between text-[10px] text-white/70">
                  <span className="flex items-center gap-1">
                    <Clock size={10} className="text-amber-400" />
                    上次看到
                  </span>
                  <span className="font-mono text-amber-300 font-bold">
                    {formatTime(item.playbackPosition)}
                  </span>
                </div>
              </div>

              {/* 进度光条 */}
              <div className="w-full h-1 bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                  style={{ width: '45%' }} // 默认进度展示
                />
              </div>

              {/* 标题 */}
              <div className="p-2.5">
                <h4 className="text-xs font-bold text-white/90 line-clamp-1 group-hover:text-amber-300 transition-colors">
                  {item.title}
                </h4>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
