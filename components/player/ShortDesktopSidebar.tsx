'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { Icons } from '@/components/ui/Icon';
import { ShortDramaEpisode } from '@/lib/api/short-drama-sources';
import { getOptimizedImageUrl } from '@/lib/utils/image-utils';

interface ShortDesktopSidebarProps {
  title: string;
  poster: string;
  episodes: ShortDramaEpisode[];
  currentEpIndex: number; // 1-indexed
  onSelectEpisode: (epIndex: number) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

const EPISODES_PER_TAB = 30;

export function ShortDesktopSidebar({
  title,
  poster,
  episodes,
  currentEpIndex,
  onSelectEpisode,
  isOpen,
  onToggleOpen,
}: ShortDesktopSidebarProps) {
  const total = episodes.length;

  // 分组 Tab (1-30, 31-60, 61-90 等)
  const tabs = useMemo(() => {
    if (total <= EPISODES_PER_TAB) return [];
    const groupCount = Math.ceil(total / EPISODES_PER_TAB);
    return Array.from({ length: groupCount }, (_, i) => {
      const start = i * EPISODES_PER_TAB + 1;
      const end = Math.min((i + 1) * EPISODES_PER_TAB, total);
      return { label: `${start}-${end}`, start, end, index: i };
    });
  }, [total]);

  // 根据当前播放集数自动定位活跃 Tab
  const initialTabIndex = useMemo(() => {
    if (total <= EPISODES_PER_TAB) return 0;
    return Math.floor((Math.max(1, currentEpIndex) - 1) / EPISODES_PER_TAB);
  }, [currentEpIndex, total]);

  const [activeTabIndex, setActiveTabIndex] = useState(initialTabIndex);

  const currentTab = tabs[activeTabIndex];
  const displayEpisodes =
    tabs.length > 0
      ? episodes.slice(currentTab.start - 1, currentTab.end)
      : episodes;

  if (!isOpen) {
    return (
      <div className="hidden lg:flex flex-col justify-center ml-3 z-30">
        <button
          onClick={onToggleOpen}
          title="展开选集列表"
          className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/10 text-white shadow-2xl transition-all cursor-pointer group flex flex-col items-center gap-2"
        >
          <Icons.ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-[11px] font-black tracking-widest [writing-mode:vertical-rl]">
            展开选集
          </span>
          <span className="w-5 h-5 rounded-full bg-(--accent-color) text-[10px] font-black flex items-center justify-center">
            {total || 1}
          </span>
        </button>
      </div>
    );
  }

  return (
    <aside className="hidden lg:flex flex-col w-[360px] xl:w-[390px] h-[92vh] max-h-[880px] ml-4 bg-[#12121A]/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-2xl z-30 transition-all duration-300 select-none">
      {/* 头部剧集信息与收起按钮 */}
      <div className="flex items-start justify-between gap-3 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3 min-w-0">
          {poster && (
            <div className="relative w-12 h-16 rounded-xl overflow-hidden bg-white/5 border border-white/10 shrink-0">
              <Image
                src={getOptimizedImageUrl(poster)}
                alt={title}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )}
          <div className="min-w-0">
            <h2 className="text-sm xl:text-base font-black text-white truncate drop-shadow" title={title}>
              {title}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded-md bg-(--accent-color)/20 text-(--accent-color) border border-(--accent-color)/30 text-[11px] font-bold">
                正片 · 第 {currentEpIndex} 集
              </span>
              <span className="text-xs text-white/50">
                {total > 0 ? `全 ${total} 集` : '连载中'}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onToggleOpen}
          title="收起选集面板"
          className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-white/60 hover:text-white transition-all cursor-pointer shrink-0"
        >
          <Icons.ChevronRight size={18} />
        </button>
      </div>

      {/* 分组 Tab 切换栏（超过 30 集时展示） */}
      {tabs.length > 0 && (
        <div className="flex items-center gap-1.5 py-3 overflow-x-auto no-scrollbar border-b border-white/5 shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.index}
              onClick={() => setActiveTabIndex(tab.index)}
              className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                activeTabIndex === tab.index
                  ? 'bg-(--accent-color) text-white shadow-md'
                  : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* 选集网格 (自适应 4 列网格) */}
      <div className="flex-1 overflow-y-auto pr-1 py-3 grid grid-cols-4 gap-2.5 content-start custom-scrollbar">
        {displayEpisodes.map((ep, idx) => {
          const actualEpNumber = tabs.length > 0 ? currentTab.start + idx : idx + 1;
          const isPlaying = actualEpNumber === currentEpIndex;

          return (
            <button
              key={ep.url || actualEpNumber}
              onClick={() => onSelectEpisode(actualEpNumber)}
              className={`relative py-3 rounded-2xl text-xs xl:text-sm font-black flex flex-col items-center justify-center transition-all cursor-pointer group ${
                isPlaying
                  ? 'bg-(--accent-color) text-white shadow-lg shadow-(--accent-color)/30 ring-2 ring-(--accent-color) scale-[1.02]'
                  : 'bg-white/5 text-white/80 hover:bg-white/15 hover:text-white border border-white/5'
              }`}
            >
              <span>{actualEpNumber}</span>
              {isPlaying ? (
                <span className="text-[10px] text-white/90 font-normal mt-0.5 flex items-center gap-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  播放中
                </span>
              ) : (
                <span className="text-[10px] text-white/40 group-hover:text-white/60 font-normal mt-0.5">
                  第{actualEpNumber}集
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 底部键盘快捷键提示 */}
      <div className="pt-3 border-t border-white/10 flex flex-col gap-1.5 text-[11px] text-white/40 shrink-0">
        <div className="flex items-center justify-between">
          <span className="font-bold text-white/60">⌨️ 网页快捷键支持：</span>
          <span className="text-[10px] text-white/30">无需鼠标点选</span>
        </div>
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
          <div className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-white/70">空格</kbd>
            <span>暂停 / 播放</span>
          </div>
          <div className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-white/70">↑ / ↓</kbd>
            <span>上 / 下一集</span>
          </div>
          <div className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-white/70">← / →</kbd>
            <span>快退 / 快进 5秒</span>
          </div>
          <div className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-white/70">M / F</kbd>
            <span>静音 / 全屏</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
