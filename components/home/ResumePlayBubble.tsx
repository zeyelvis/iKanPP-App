'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Play, X, Clock, Sparkles } from 'lucide-react';
import { useHistoryStore } from '@/lib/store/history-store';
import type { VideoHistoryItem } from '@/lib/types';
import { getSourceName } from '@/lib/utils/source-names';
import { storeGroupedSources } from '@/lib/utils/grouped-sources-cache';
import { getEpisodeDisplayInfo } from '@/lib/utils/episode-resolver';
import { getCachedTitleProbe } from '@/lib/utils/title-probe';

export function ResumePlayBubble() {
  const router = useRouter();
  const { viewingHistory } = useHistoryStore();
  const [latestItem, setLatestItem] = useState<VideoHistoryItem | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // 检查历史记录
    if (!viewingHistory || viewingHistory.length === 0) return;

    // 获取最近观看且未看完的一条（进度在 5 秒以上，且小于 95%）
    const item = viewingHistory[0];
    if (!item) return;

    // 检查是否是 7 天以内的记录
    const isRecent = Date.now() - item.timestamp < 7 * 24 * 60 * 60 * 1000;
    const hasProgress = item.playbackPosition > 5;
    const notFinished = item.duration > 0 ? (item.playbackPosition / item.duration) < 0.95 : true;
    const isDismissedInSession = typeof window !== 'undefined'
      && sessionStorage.getItem('kvideo_resume_dismissed') === item.showIdentifier;

    if (isRecent && hasProgress && notFinished && !isDismissedInSession) {
      setLatestItem(item);
      // 延迟 1.5 秒后平滑浮现，避免打扰用户刚进入页面的第一眼视觉
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [viewingHistory]);

  if (!latestItem || !isVisible || isDismissed) return null;

  // 格式化时间为 mm:ss 或 hh:mm:ss
  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '00:00';
    const hours = Math.floor(seconds / 3600);
    if (hours > 0) {
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = Math.floor(seconds % 60);
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = latestItem.duration > 0
    ? Math.min(100, Math.round((latestItem.playbackPosition / latestItem.duration) * 100))
    : 0;

  const handleResume = () => {
    // 跳转到播放页
    const displayInfo = getEpisodeDisplayInfo(latestItem.episodes, latestItem.episodeIndex);
    
    let activeSource = latestItem.source;
    let activeId = latestItem.videoId;

    // 非午夜特区下，老用户历史记录优先无缝升级为巨量资源
    if (!latestItem.isPremium) {
      if (latestItem.sourceMap && latestItem.sourceMap['juliang']) {
        activeSource = 'juliang';
        activeId = latestItem.sourceMap['juliang'];
      } else {
        const cached = getCachedTitleProbe(latestItem.title);
        if (cached?.source === 'juliang' && cached.id) {
          activeSource = 'juliang';
          activeId = cached.id;
        }
      }
    }

    const query = new URLSearchParams({
      id: String(activeId),
      title: latestItem.title,
      source: activeSource,
      episode: displayInfo.paramValue,
    });
    if (latestItem.playbackPosition && latestItem.playbackPosition > 1) {
      query.set('t', Math.floor(latestItem.playbackPosition).toString());
    }
    // 携带多线路切源数据 (通过 sessionStorage 缓存短 key 替代 URL 膨胀)
    if (latestItem.sourceMap && Object.keys(latestItem.sourceMap).length > 1) {
      const groupData = Object.entries(latestItem.sourceMap).map(([sourceName, vid]) => ({
        id: vid as string,
        source: sourceName,
        sourceName: getSourceName(sourceName),
      }));
      const gsKey = storeGroupedSources(groupData);
      if (gsKey) {
        query.set('gsKey', gsKey);
      }
    }
    if (latestItem.type_name) {
      const isTv = latestItem.type_name.includes('剧') || latestItem.type_name.includes('动漫') || (latestItem.episodeIndex !== undefined && latestItem.episodeIndex > 0);
      query.set('type', isTv ? 'tv' : 'movie');
    }
    if (latestItem.isPremium) {
      query.set('premium', '1');
    }
    router.push(`/player?${query.toString()}`);
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(false);
    setIsDismissed(true);
    if (latestItem) {
      sessionStorage.setItem('kvideo_resume_dismissed', latestItem.showIdentifier);
    }
  };

  return (
    <aside
      aria-label="继续播放提示"
      className="fixed resume-bubble-floating left-3 right-3 sm:left-auto sm:right-6 z-40 max-w-sm sm:w-auto animate-slide-up select-none"
    >
      <div
        onClick={handleResume}
        className="group relative flex items-center gap-3.5 p-3 rounded-2xl bg-[#12131A]/95 backdrop-blur-2xl border border-amber-500/30 hover:border-amber-400/60 shadow-2xl shadow-black/80 hover:shadow-amber-500/15 transition-all duration-300 cursor-pointer hover:-translate-y-1"
      >
        {/* 顶部微光流动条 */}
        <div className="absolute -top-px left-6 right-6 h-px bg-gradient-to-r from-transparent via-amber-400/80 to-transparent" />

        {/* 封面海报缩略图 */}
        <div className="relative w-12 h-16 rounded-xl overflow-hidden shrink-0 bg-neutral-800 shadow-md">
          {latestItem.poster ? (
            <Image
              src={latestItem.poster}
              alt={latestItem.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="48px"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-white/5 text-white/30 text-xs">
              无图
            </div>
          )}
          {/* 播放角标 */}
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Play size={16} className="text-white fill-white" />
          </div>
        </div>

        {/* 文字与进度信息 */}
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="flex items-center gap-1 text-[10px] font-black text-amber-400 tracking-wider uppercase">
              <Sparkles size={10} className="animate-pulse" />
              继续播放
            </span>
            {latestItem.episodeIndex !== undefined && (
              <span className="text-[10px] text-white/50 bg-white/5 px-1.5 py-0.2 rounded-md">
                {getEpisodeDisplayInfo(latestItem.episodes, latestItem.episodeIndex).label}
              </span>
            )}
          </div>

          <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-amber-300 transition-colors">
            {latestItem.title}
          </h4>

          <div className="flex items-center gap-2 mt-1 text-[11px] text-white/60">
            <span className="flex items-center gap-1">
              <Clock size={11} className="text-amber-400/80" />
              {formatTime(latestItem.playbackPosition)}
            </span>
            {latestItem.duration > 0 && (
              <>
                <span>/</span>
                <span>{formatTime(latestItem.duration)}</span>
                <span className="text-amber-400 font-medium">({progressPercent}%)</span>
              </>
            )}
          </div>

          {/* 迷你进度条 */}
          {latestItem.duration > 0 && (
            <div className="w-full h-1 bg-white/10 rounded-full mt-1.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}
        </div>

        {/* 一键继续播放按钮 */}
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-black font-bold shadow-lg shadow-amber-500/20 group-hover:scale-110 active:scale-95 transition-all shrink-0">
          <Play size={14} className="fill-black ml-0.5" />
        </div>

        {/* 关闭按钮 */}
        <button
          onClick={handleDismiss}
          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-neutral-800 border border-white/20 text-white/60 hover:text-white hover:bg-neutral-700 flex items-center justify-center text-xs transition-all shadow-md"
          title="关闭"
          aria-label="关闭继续播放提示"
        >
          <X size={12} />
        </button>
      </div>
    </aside>
  );
}
