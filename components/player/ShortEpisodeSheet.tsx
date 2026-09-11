'use client';

import React, { useState, useMemo } from 'react';
import { Icons } from '@/components/ui/Icon';
import { ShortDramaEpisode } from '@/lib/api/short-drama-sources';

interface ShortEpisodeSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  episodes: ShortDramaEpisode[];
  currentEpIndex: number; // 1-indexed
  onSelectEpisode: (epIndex: number) => void;
}

const EPISODES_PER_TAB = 30;

export function ShortEpisodeSheet({
  isOpen,
  onClose,
  title,
  episodes,
  currentEpIndex,
  onSelectEpisode,
}: ShortEpisodeSheetProps) {
  const total = episodes.length;

  // 计算分组 Tab，如 1-30, 31-60, 61-90
  const tabs = useMemo(() => {
    if (total <= EPISODES_PER_TAB) return [];
    const groupCount = Math.ceil(total / EPISODES_PER_TAB);
    return Array.from({ length: groupCount }, (_, i) => {
      const start = i * EPISODES_PER_TAB + 1;
      const end = Math.min((i + 1) * EPISODES_PER_TAB, total);
      return { label: `${start}-${end}`, start, end, index: i };
    });
  }, [total]);

  // 根据当前集初始化活跃 Tab
  const initialTabIndex = useMemo(() => {
    if (total <= EPISODES_PER_TAB) return 0;
    return Math.floor((Math.max(1, currentEpIndex) - 1) / EPISODES_PER_TAB);
  }, [currentEpIndex, total]);

  const [activeTabIndex, setActiveTabIndex] = useState(initialTabIndex);

  if (!isOpen) return null;

  // 当前 Tab 下的剧集
  const currentTab = tabs[activeTabIndex];
  const displayEpisodes = tabs.length > 0
    ? episodes.slice(currentTab.start - 1, currentTab.end)
    : episodes;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/70 backdrop-blur-md transition-all duration-300 animate-fadeIn">
      {/* 遮罩点击关闭 */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* 底部面板 */}
      <div className="relative z-10 w-full max-w-xl mx-auto bg-[#14141E]/95 border-t border-white/10 rounded-t-3xl p-5 shadow-2xl flex flex-col max-h-[75vh] animate-slideUp">
        {/* 顶部拖拽指示条 */}
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-3" />

        {/* 标题栏 */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h3 className="text-base sm:text-lg font-black text-white truncate max-w-[260px] sm:max-w-md">
              {title}
            </h3>
            <p className="text-xs text-white/50 mt-0.5">
              当前播放：<span className="text-(--accent-color) font-bold">第 {currentEpIndex} 集</span>
              {total > 0 && <span> / 共 {total} 集</span>}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer"
          >
            <Icons.X size={16} />
          </button>
        </div>

        {/* 分组 Tab（超过30集时出现） */}
        {tabs.length > 0 && (
          <div className="flex items-center gap-2 py-3 overflow-x-auto no-scrollbar border-b border-white/5">
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

        {/* 剧集网格 (自适应 5 列) */}
        <div className="flex-1 overflow-y-auto py-4 pr-1 grid grid-cols-5 sm:grid-cols-6 gap-2.5">
          {displayEpisodes.map((ep, idx) => {
            const actualEpNumber = tabs.length > 0 ? currentTab.start + idx : idx + 1;
            const isPlaying = actualEpNumber === currentEpIndex;

            return (
              <button
                key={ep.url || actualEpNumber}
                onClick={() => {
                  onSelectEpisode(actualEpNumber);
                  onClose();
                }}
                className={`relative py-3 rounded-xl text-sm font-bold flex flex-col items-center justify-center transition-all cursor-pointer active:scale-95 ${
                  isPlaying
                    ? 'bg-(--accent-color) text-white shadow-lg shadow-(--accent-color)/30 ring-2 ring-(--accent-color)'
                    : 'bg-white/5 text-white/80 hover:bg-white/15 hover:text-white border border-white/5'
                }`}
              >
                <span>{actualEpNumber}</span>
                {isPlaying && (
                  <span className="text-[10px] text-white/90 font-normal mt-0.5 animate-pulse">
                    播放中
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 底部关闭按钮 */}
        <div className="pt-2 border-t border-white/10">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all cursor-pointer text-center"
          >
            收起选集
          </button>
        </div>
      </div>
    </div>
  );
}
