'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Play, Loader2, Sparkles } from 'lucide-react';
import { useHistoryStore } from '@/lib/store/history-store';
import { TitleEntity } from '@/lib/types/entity';
import { getOptimizedImageUrl } from '@/lib/utils/image-utils';
import { getEpisodeDisplayInfo, EpisodeDisplayInfo } from '@/lib/utils/episode-resolver';

import { fetchTitleProbe, subscribeTitleProbe, resolvePlayTarget } from '@/lib/utils/title-probe';
import { isValidSourceId } from '@/lib/api/video-sources';

interface StickyBottomPlayCTAProps {
  entity: TitleEntity;
  playTitle?: string;
}

export function StickyBottomPlayCTA({ entity, playTitle }: StickyBottomPlayCTAProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isVisible, setIsVisible] = useState(false);
  const { viewingHistory } = useHistoryStore();
  const [episodeInfo, setEpisodeInfo] = useState<EpisodeDisplayInfo>({
    label: '第 1 集',
    paramValue: '1',
    episodeNumber: 1,
    isSpecial: false,
  });
  const [historySource, setHistorySource] = useState<string | null>(null);
  const [historyVodId, setHistoryVodId] = useState<string | number | null>(null);
  const [probedTarget, setProbedTarget] = useState<{ id?: string | number; source?: string }>({});

  const effectiveTitle = playTitle || entity.title;

  useEffect(() => {
    // 提前订阅骨干源的真实 ID，打通 0ms 直达快车道
    fetchTitleProbe(effectiveTitle);
    const unsubscribe = subscribeTitleProbe(effectiveTitle, (res) => {
      if (res && res.id && res.source) {
        setProbedTarget({ id: res.id, source: res.source });
      }
    });
    return () => unsubscribe();
  }, [effectiveTitle]);

  useEffect(() => {
    // 检查历史进度
    const historyItem = viewingHistory.find(
      h => h.title?.trim().toLowerCase() === effectiveTitle.trim().toLowerCase() ||
           h.title?.trim().toLowerCase() === entity.title.trim().toLowerCase()
    );
    if (historyItem) {
      setEpisodeInfo(getEpisodeDisplayInfo(historyItem.episodes, historyItem.episodeIndex));
      if (historyItem.source && isValidSourceId(historyItem.source)) {
        setHistorySource(historyItem.source);
        if (historyItem.videoId) setHistoryVodId(historyItem.videoId);
      } else {
        setHistorySource(null);
        setHistoryVodId(null);
      }
    }

    // 监听主播放区域 `#main-play-cta` 是否滑出视口
    const target = document.getElementById('main-play-cta');
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // 当主按钮离开屏幕上方时显示吸底条
        setIsVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0.1 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [entity.title, effectiveTitle, viewingHistory]);

  const handlePlay = async () => {
    let playId: string | number | null | undefined = null;
    let playSource: string | null | undefined = null;

    // 1. 黄金第一优先级：若当前已探测命中巨量资源，新老用户均 100% 绝对优先以巨量起播
    if (probedTarget.source === 'juliang' && probedTarget.id) {
      playId = probedTarget.id;
      playSource = 'juliang';
    } else {
      // 2. 超短竞速 100ms 抢抓骨干源探测（优先巨量 Anycast 纯净源，杜绝主线程卡顿）
      const fast = await resolvePlayTarget(effectiveTitle, 100);
      if (fast.source === 'juliang' && fast.id) {
        playId = fast.id;
        playSource = 'juliang';
      } else if (isValidSourceId(probedTarget.source) && probedTarget.id) {
        playId = probedTarget.id;
        playSource = probedTarget.source;
      } else if (fast.id && fast.source && isValidSourceId(fast.source)) {
        playId = fast.id;
        playSource = fast.source;
      } else {
        // 默认兜底以巨量资源起播
        playSource = 'juliang';
      }
    }

    startTransition(() => {
      const params = new URLSearchParams({
        entity: entity.entityId,
        title: effectiveTitle,
        type: entity.type === 'tv' ? 'tv' : 'movie',
        episode: episodeInfo.paramValue,
      });
      if (episodeInfo.seasonNumber) params.set('season', String(episodeInfo.seasonNumber));
      if (playId) params.set('id', String(playId));
      if (playSource) params.set('source', playSource);
      router.push(`/player?${params.toString()}`);
    });
  };

  return (
    <aside
      aria-label="快捷播放"
      className={`md:hidden fixed bottom-[calc(56px+env(safe-area-inset-bottom))] left-0 right-0 z-900 p-2.5 sm:p-3 bg-[#0A0A0F]/95 backdrop-blur-2xl border-t border-white/10 shadow-[0_-8px_30px_rgba(0,0,0,0.8)] transition-all duration-300 transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      <div className="max-w-md mx-auto flex items-center justify-between gap-3">
        {/* 左侧：小海报与片名 */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative w-10 h-14 rounded-lg overflow-hidden shrink-0 border border-white/10 bg-black/40">
            {entity.cover && (
              <Image
                src={getOptimizedImageUrl(entity.cover)}
                alt={entity.title}
                fill
                sizes="40px"
                className="object-cover"
              />
            )}
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-sm text-white truncate">
              {entity.title}
            </h4>
            <div className="flex items-center gap-1.5 text-xs text-white/50 mt-0.5">
              <span>{entity.year || '2024'}</span>
              <span>·</span>
              <span className="text-amber-400 font-medium">★ {entity.rate || '8.5'}</span>
              {entity.type === 'tv' && (
                <>
                  <span>·</span>
                  <span className="text-red-400">{episodeInfo.label}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 右侧：单手大拇指大播放按钮 */}
        <button
          onClick={handlePlay}
          disabled={isPending}
          className="shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 active:bg-red-700 text-white font-black text-sm shadow-lg shadow-red-600/30 cursor-pointer disabled:opacity-75"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4 fill-white text-white" />
          )}
          <span>
            {entity.type === 'tv' ? `播放 ${episodeInfo.label}` : '立即播放'}
          </span>
        </button>
      </div>
    </aside>
  );
}
