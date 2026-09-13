'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Tv, CheckCircle2 } from 'lucide-react';
import { useHistoryStore } from '@/lib/store/history-store';

interface EpisodesSelectorProps {
  entityId: string;
  title: string;
  type: string;
  totalEpisodes?: number;
}

export function EpisodesSelector({
  entityId,
  title,
  type,
  totalEpisodes = 24,
}: EpisodesSelectorProps) {
  const router = useRouter();
  const { viewingHistory } = useHistoryStore();

  // 默认集数保障（至少 1 集，支持超长连载年番动漫如斗罗大陆 300+ 集、名侦探柯南 1100+ 集）
  const count = Math.max(1, totalEpisodes || (type === 'tv' ? 24 : 1));

  const [currentEpisode, setCurrentEpisode] = useState<number>(1);
  const [watchedEpisodes, setWatchedEpisodes] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState<number>(0);

  // 集数分页：≤50 集不分组，51~200 集每组 50，201+ 集每组 100
  const GROUP_SIZE = count <= 50 ? count : count <= 200 ? 50 : 100;
  const groupsCount = Math.ceil(count / GROUP_SIZE);

  useEffect(() => {
    // 从播放历史中定位该影视的观看集数
    const historyItem = viewingHistory.find(
      h => h.title?.trim().toLowerCase() === title.trim().toLowerCase()
    );

    if (historyItem) {
      const ep = (historyItem.episodeIndex ?? 0) + 1;
      setCurrentEpisode(ep);
      // 将所在的组设为活动组
      const groupIdx = Math.floor((ep - 1) / GROUP_SIZE);
      setActiveTab(groupIdx);

      // 将小于当前集数的记为已看
      const set = new Set<number>();
      for (let i = 1; i <= ep; i++) {
        set.add(i);
      }
      setWatchedEpisodes(set);
    }
  }, [title, viewingHistory]);

  const handleSelectEpisode = (ep: number) => {
    const params = new URLSearchParams({
      entity: entityId,
      title,
      type: type === 'tv' ? 'tv' : 'movie',
      episode: String(ep),
    });
    router.push(`/player?${params.toString()}`);
  };

  // 生成当前分页的集数数组
  const startEp = activeTab * GROUP_SIZE + 1;
  const endEp = Math.min(count, (activeTab + 1) * GROUP_SIZE);
  const episodeList: number[] = [];
  for (let i = startEp; i <= endEp; i++) {
    episodeList.push(i);
  }

  return (
    <div className="w-full">
      {/* 头部标题与分页切换 */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-red-600/10 border border-red-500/20 text-red-500">
            <Tv className="w-4 h-4" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <span>剧集列表</span>
            <span className="text-xs font-normal text-white/40">
              (共 {count} 集 · 极速连播)
            </span>
          </h3>
        </div>

        {/* 分页切换器（仅在总集数大于 25 集时呈现） */}
        {groupsCount > 1 && (
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10 overflow-x-auto max-w-full">
            {Array.from({ length: groupsCount }).map((_, idx) => {
              const gStart = idx * GROUP_SIZE + 1;
              const gEnd = Math.min(count, (idx + 1) * GROUP_SIZE);
              const isActive = idx === activeTab;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveTab(idx)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-red-600 text-white shadow-md'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {gStart}-{gEnd}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 集数矩阵网格 */}
      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2 sm:gap-2.5">
        {episodeList.map(ep => {
          const isCurrent = ep === currentEpisode;
          const isWatched = watchedEpisodes.has(ep);

          return (
            <button
              key={ep}
              onClick={() => handleSelectEpisode(ep)}
              className={`group relative flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl border text-center transition-all duration-150 cursor-pointer ${
                isCurrent
                  ? 'bg-red-600/20 border-red-500 text-white font-black shadow-lg shadow-red-500/10 hover:bg-red-600/30 scale-[1.02]'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20 text-white/80 hover:text-white'
              }`}
              title={`播放第 ${ep} 集`}
            >
              {/* 集数编号 */}
              <span className="text-sm sm:text-base font-bold tracking-tight">
                {ep}
              </span>

              {/* 状态角标 */}
              {isCurrent && (
                <span className="absolute -top-1.5 -right-1 px-1 py-0.2 rounded bg-red-600 text-[10px] font-black text-white leading-tight shadow">
                  在看
                </span>
              )}

              {/* 悬停微播放三角 */}
              <Play className="w-3 h-3 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
