'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Tv, Sparkles } from 'lucide-react';
import { useHistoryStore } from '@/lib/store/history-store';
import { extractEpisodeNumber } from '@/lib/utils/episode-resolver';
import { parseSeasonFromTitle } from '@/lib/utils/season-resolver';
import { fetchTitleProbe, subscribeTitleProbe, getCachedTitleProbe } from '@/lib/utils/title-probe';
import { isValidSourceId } from '@/lib/api/video-sources';

interface SpecialEpisodeItem {
  name: string;
  index: number;
}

interface EpisodesSelectorProps {
  entityId: string;
  title: string;
  type: string;
  totalEpisodes?: number;
  numberOfSeasons?: number;
  currentSeason?: number;
}

export function EpisodesSelector({
  entityId,
  title,
  type,
  totalEpisodes = 24,
  numberOfSeasons = 1,
  currentSeason = 1,
}: EpisodesSelectorProps) {
  const router = useRouter();
  const { viewingHistory } = useHistoryStore();

  // 智能提取母片名与当前季数
  const parsed = parseSeasonFromTitle(title);
  const baseTitle = parsed ? parsed.baseTitle : title;
  const initialSeason = currentSeason || (parsed ? parsed.seasonNumber : 1);
  const [selectedSeason, setSelectedSeason] = useState<number>(initialSeason);

  // 动态构建当前选中的季播探测标题
  const activeTitle = selectedSeason > 1
    ? `${baseTitle}第${selectedSeason}季`
    : (parsed && parsed.seasonNumber === 1 ? `${baseTitle}第1季` : (numberOfSeasons > 1 ? `${baseTitle}第1季` : title));

  // 动态真实集数状态（初始以传入的 totalEpisodes 兜底，探测到真实源后自动精确对齐）
  const [realTotalEpisodes, setRealTotalEpisodes] = useState<number | null>(null);
  const [realEpisodeNames, setRealEpisodeNames] = useState<Record<number, string>>({});
  const [specialEpisodes, setSpecialEpisodes] = useState<SpecialEpisodeItem[]>([]);
  const [realSource, setRealSource] = useState<string | null>(null);
  const [realVodId, setRealVodId] = useState<string | number | null>(null);

  const count = Math.max(1, realTotalEpisodes ?? totalEpisodes ?? (type === 'tv' ? 24 : 1));

  const [currentEpisode, setCurrentEpisode] = useState<number>(1);
  const [watchedEpisodes, setWatchedEpisodes] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState<number>(0);

  // 集数分页：≤50 集不分组，51~200 集每组 50，201+ 集每组 100
  const GROUP_SIZE = count <= 50 ? count : count <= 200 ? 50 : 100;
  const groupsCount = Math.ceil(count / GROUP_SIZE);

  // 异步探测全网片源的真实可播集数（彻底解决 TMDB 预告排期与采集站实际切片不一致的问题）
  useEffect(() => {
    let cancelled = false;
    setRealTotalEpisodes(null);
    setRealEpisodeNames({});
    setSpecialEpisodes([]);

    // 1. 本地播放历史优先快速填充
    const historyItem = viewingHistory.find(
      h => h.title?.trim().toLowerCase() === activeTitle.trim().toLowerCase() ||
           h.title?.trim().toLowerCase() === title.trim().toLowerCase()
    );

    if (historyItem?.episodes && historyItem.episodes.length > 0) {
      if (historyItem.source && isValidSourceId(historyItem.source)) {
        setRealSource(historyItem.source);
        if (historyItem.videoId) setRealVodId(historyItem.videoId);
      } else {
        setRealSource(null);
        setRealVodId(null);
      }

      const nameMap: Record<number, string> = {};
      let maxHistoryEp = 0;
      const historySpecials: SpecialEpisodeItem[] = [];

      historyItem.episodes.forEach((ep, i) => {
        if (!ep || !ep.name) return;
        const epNum = extractEpisodeNumber(ep.name);
        if (epNum !== null) {
          nameMap[epNum] = ep.name;
          if (epNum > maxHistoryEp) maxHistoryEp = epNum;
        } else {
          historySpecials.push({ name: ep.name, index: i });
        }
      });

      // 若历史切片中解析出了正片编号，以正片最大编号为准，杜绝特别篇导致虚高
      if (maxHistoryEp > 0) {
        setRealTotalEpisodes(maxHistoryEp);
      } else {
        setRealTotalEpisodes(historyItem.episodes.length);
      }
      setRealEpisodeNames(nameMap);
      if (historySpecials.length > 0) {
        setSpecialEpisodes(historySpecials);
      }
    }

    // 2. 异步毫秒级探测骨干源最新收录切片集数（共用全局单例合并与缓存，0ms 共享）
    const applyProbeData = (data: any) => {
      if (cancelled) return;
      if (data && data.success && data.totalEpisodes && data.totalEpisodes > 0) {
        setRealTotalEpisodes(data.totalEpisodes);
        if (data.source && isValidSourceId(data.source)) setRealSource(data.source);
        if (data.id) setRealVodId(data.id);

        if (Array.isArray(data.specialEpisodes) && data.specialEpisodes.length > 0) {
          setSpecialEpisodes(data.specialEpisodes);
        }

        if (Array.isArray(data.episodes)) {
          const nameMap: Record<number, string> = {};
          data.episodes.forEach((ep: any) => {
            if (ep.episodeNumber) {
              nameMap[ep.episodeNumber] = ep.name;
            } else if (ep.name) {
              const epNum = extractEpisodeNumber(ep.name);
              if (epNum !== null) {
                nameMap[epNum] = ep.name;
              }
            }
          });
          setRealEpisodeNames(nameMap);
        }
      }
    };

    fetchTitleProbe(activeTitle).then(data => {
      if (data) applyProbeData(data);
    });

    const unsubscribe = subscribeTitleProbe(activeTitle, applyProbeData);

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [activeTitle, title, viewingHistory]);

  useEffect(() => {
    // 从播放历史中定位该影视的观看集数
    const historyItem = viewingHistory.find(
      h => h.title?.trim().toLowerCase() === activeTitle.trim().toLowerCase() ||
           h.title?.trim().toLowerCase() === title.trim().toLowerCase()
    );

    if (historyItem) {
      // 优先从历史切片名称精确提取真实正片编号，杜绝因特别篇插塞导致的下标偏移
      const currentEpObj = historyItem.episodes?.[historyItem.episodeIndex];
      const parsedEp = currentEpObj ? extractEpisodeNumber(currentEpObj.name) : null;

      const rawEp = parsedEp ?? ((historyItem.episodeIndex ?? 0) + 1);
      const ep = Math.min(count, Math.max(1, rawEp));
      setCurrentEpisode(ep);
      // 将所在的组设为活动组
      const groupIdx = Math.floor((ep - 1) / GROUP_SIZE);
      setActiveTab(groupIdx);

      // 将小于等于当前集数的记为已看
      const set = new Set<number>();
      for (let i = 1; i <= ep; i++) {
        set.add(i);
      }
      setWatchedEpisodes(set);
    }
  }, [activeTitle, title, viewingHistory, count, GROUP_SIZE]);

  const handleSelectEpisode = (ep: number) => {
    let playId = realVodId;
    let playSource = realSource;

    const cached = getCachedTitleProbe(activeTitle);
    if (cached?.source === 'juliang' && cached.id) {
      playId = cached.id;
      playSource = 'juliang';
    }

    const params = new URLSearchParams({
      entity: entityId,
      title: activeTitle,
      type: type === 'tv' ? 'tv' : 'movie',
      episode: String(ep),
    });
    if (selectedSeason && selectedSeason > 0) {
      params.set('season', String(selectedSeason));
    }
    if (playId && playSource && isValidSourceId(playSource)) {
      params.set('id', String(playId));
      params.set('source', playSource);
    } else {
      params.set('source', 'juliang');
    }
    router.push(`/player?${params.toString()}`);
  };

  const handleSelectSpecial = (special: SpecialEpisodeItem) => {
    let playId = realVodId;
    let playSource = realSource;

    const cached = getCachedTitleProbe(activeTitle);
    if (cached?.source === 'juliang' && cached.id) {
      playId = cached.id;
      playSource = 'juliang';
    }

    const params = new URLSearchParams({
      entity: entityId,
      title: activeTitle,
      type: type === 'tv' ? 'tv' : 'movie',
      episode: special.name,
    });
    if (selectedSeason && selectedSeason > 0) {
      params.set('season', String(selectedSeason));
    }
    if (playId && playSource && isValidSourceId(playSource)) {
      params.set('id', String(playId));
      params.set('source', playSource);
    } else {
      params.set('source', 'juliang');
    }
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
      {/* 多季快速切换选项卡（仅在存在多季时优雅呈现） */}
      {numberOfSeasons && numberOfSeasons > 1 && (
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/5 overflow-x-auto scrollbar-none">
          <span className="text-xs font-bold text-white/50 shrink-0 mr-1 flex items-center gap-1">
            <span>📺</span>
            <span>选择季数：</span>
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            {Array.from({ length: numberOfSeasons }).map((_, idx) => {
              const s = idx + 1;
              const isSelected = selectedSeason === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setSelectedSeason(s);
                    setActiveTab(0);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-red-600 text-white shadow-lg shadow-red-950/40 scale-105'
                      : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10'
                  }`}
                >
                  第 {s} 季
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 头部标题与分页切换 */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-red-600/10 border border-red-500/20 text-red-500">
            <Tv className="w-4 h-4" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <span>{numberOfSeasons > 1 ? `第 ${selectedSeason} 季剧集` : '剧集列表'}</span>
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
              title={realEpisodeNames[ep] ? `播放 ${realEpisodeNames[ep]}` : `播放第 ${ep} 集`}
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

      {/* 剧场版 / 特别篇独立导视栏 */}
      {specialEpisodes.length > 0 && (
        <div className="mt-5 pt-4 border-t border-white/5 flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold px-2.5 py-1 rounded-lg bg-amber-400/10 border border-amber-400/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>剧场·特别篇</span>
          </div>
          {specialEpisodes.map((sp) => (
            <button
              key={sp.index}
              onClick={() => handleSelectSpecial(sp)}
              className="group flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-amber-500/15 border border-white/10 hover:border-amber-500/30 text-white/90 hover:text-amber-300 text-xs font-semibold transition-all duration-150 cursor-pointer shadow-sm"
              title={`播放特别篇: ${sp.name}`}
            >
              <Play className="w-3 h-3 text-amber-400 group-hover:scale-110 transition-transform fill-amber-400/40" />
              <span>{sp.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

