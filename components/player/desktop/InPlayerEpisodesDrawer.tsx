'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Play, ArrowUpDown } from 'lucide-react';
import { cleanEpisodeName, formatEpisodeGridLabel } from '@/lib/utils/episode-resolver';

interface EpisodeItem {
  name?: string;
  url: string;
}

interface InPlayerEpisodesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  episodes: EpisodeItem[];
  currentEpisode: number;
  onSelectEpisode: (index: number) => void;
}

const PAGE_SIZE = 25;

export function InPlayerEpisodesDrawer({
  isOpen,
  onClose,
  episodes,
  currentEpisode,
  onSelectEpisode,
}: InPlayerEpisodesDrawerProps) {
  const [isReversed, setIsReversed] = useState(false);
  const [activePage, setActivePage] = useState(0);
  const activeEpisodeRef = useRef<HTMLButtonElement | null>(null);

  const total = episodes?.length || 0;
  const pageCount = Math.ceil(total / PAGE_SIZE);

  // 初始化或当前集变化时，自动将分页定位到当前集所在页面
  useEffect(() => {
    if (total > 0) {
      const pageIndex = Math.floor(currentEpisode / PAGE_SIZE);
      setActivePage(pageIndex);
    }
  }, [currentEpisode, total]);

  // 打开抽屉时平滑滚动到当前集数
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        activeEpisodeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // ESC 键关闭抽屉
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, onClose]);

  if (!isOpen || total === 0) return null;

  // 计算当前分页的剧集
  const startIndex = activePage * PAGE_SIZE;
  const pageEpisodes = episodes.slice(startIndex, startIndex + PAGE_SIZE).map((ep, idx) => ({
    episode: ep,
    originalIndex: startIndex + idx,
  }));

  const displayList = isReversed ? [...pageEpisodes].reverse() : pageEpisodes;

  return (
    <div
      data-player-layer="true"
      className="absolute inset-0 z-50 flex justify-end bg-black/60 transition-opacity duration-300 animate-fade-in"
      onPointerDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div
        className="w-80 sm:w-96 h-full bg-[#141416]/98 border-l border-white/10 shadow-2xl flex flex-col pointer-events-auto transform transition-transform duration-300 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部标题栏 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            <h3 className="text-base font-bold tracking-wide">剧集选集</h3>
            <span className="text-xs text-white/50 bg-white/10 px-2 py-0.5 rounded-full font-mono">
              共 {total} 集
            </span>
          </div>

          <div className="flex items-center gap-2">
            {total > 1 && (
              <button
                type="button"
                onClick={() => setIsReversed(!isReversed)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-colors cursor-pointer"
                title={isReversed ? '切换为正序' : '切换为倒序'}
              >
                <ArrowUpDown size={16} />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-colors cursor-pointer"
              title="关闭 (Esc)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* 分页 Tab 栏（超过 25 集时显示） */}
        {pageCount > 1 && (
          <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/5 overflow-x-auto scrollbar-none shrink-0">
            {Array.from({ length: pageCount }).map((_, i) => {
              const start = i * PAGE_SIZE + 1;
              const end = Math.min((i + 1) * PAGE_SIZE, total);
              const isActive = activePage === i;
              const hasCurrent = currentEpisode >= i * PAGE_SIZE && currentEpisode < (i + 1) * PAGE_SIZE;

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActivePage(i)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                      : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                  } ${hasCurrent && !isActive ? 'ring-1 ring-red-500/50 text-red-300' : ''}`}
                >
                  {start}-{end}
                </button>
              );
            })}
          </div>
        )}

        {/* 选集网格列表 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          <div className="grid grid-cols-4 gap-2.5">
            {displayList.map(({ episode, originalIndex }) => {
              const isCurrent = originalIndex === currentEpisode;
              const fullLabel = cleanEpisodeName(episode.name) || `第${originalIndex + 1}集`;
              const gridLabel = formatEpisodeGridLabel(episode.name, originalIndex);

              return (
                <button
                  key={originalIndex}
                  ref={isCurrent ? activeEpisodeRef : null}
                  type="button"
                  onClick={() => {
                    onSelectEpisode(originalIndex);
                    onClose();
                  }}
                  className={`relative py-3 px-2 rounded-xl text-center font-semibold transition-all duration-200 cursor-pointer flex flex-col items-center justify-center min-h-12.5 border ${
                    isCurrent
                      ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-600/40 ring-2 ring-red-400/50 scale-105'
                      : 'bg-white/5 hover:bg-white/15 text-white/80 hover:text-white border-white/10 hover:border-white/20 hover:scale-102'
                  }`}
                  title={fullLabel}
                >
                  {isCurrent ? (
                    <div className="flex items-center gap-1">
                      <Play size={12} className="fill-white animate-pulse" />
                      <span className="text-xs font-bold truncate max-w-[55px]">
                        {gridLabel}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs truncate max-w-[65px]">
                      {gridLabel}
                    </span>
                  )}

                  {isCurrent && (
                    <span className="text-[9px] font-normal text-white/80 mt-0.5">在看</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 底部当前播放提示 */}
        <div className="px-5 py-3 border-t border-white/10 bg-black/60 shrink-0 text-xs text-white/60 flex items-center justify-between">
          <span>当前播放：第 {currentEpisode + 1} 集</span>
          <span className="text-white/40">点击任意集数秒切</span>
        </div>
      </div>
    </div>
  );
}
