'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Play, Loader2, Sparkles } from 'lucide-react';
import { useHistoryStore } from '@/lib/store/history-store';
import { TitleEntity } from '@/lib/types/entity';
import { getOptimizedImageUrl } from '@/lib/utils/image-utils';

interface StickyBottomPlayCTAProps {
  entity: TitleEntity;
}

export function StickyBottomPlayCTA({ entity }: StickyBottomPlayCTAProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isVisible, setIsVisible] = useState(false);
  const { viewingHistory } = useHistoryStore();
  const [currentEpisode, setCurrentEpisode] = useState<number>(1);

  useEffect(() => {
    // 检查历史进度
    const historyItem = viewingHistory.find(
      h => h.title?.trim().toLowerCase() === entity.title.trim().toLowerCase()
    );
    if (historyItem) {
      setCurrentEpisode((historyItem.episodeIndex ?? 0) + 1);
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
  }, [entity.title, viewingHistory]);

  const handlePlay = () => {
    startTransition(() => {
      const params = new URLSearchParams({
        entity: entity.entityId,
        title: entity.title,
        type: entity.type === 'tv' ? 'tv' : 'movie',
        episode: String(currentEpisode),
      });
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
                  <span className="text-red-400">第 {currentEpisode} 集</span>
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
            {entity.type === 'tv' ? `播放第 ${currentEpisode} 集` : '立即播放'}
          </span>
        </button>
      </div>
    </aside>
  );
}
