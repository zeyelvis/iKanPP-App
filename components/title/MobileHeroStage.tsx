'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Play, Film } from 'lucide-react';
import { resolvePlayTarget } from '@/lib/utils/title-probe';
import { isValidSourceId } from '@/lib/api/video-sources';
import { useHistoryStore } from '@/lib/store/history-store';
import { getEpisodeDisplayInfo } from '@/lib/utils/episode-resolver';

interface MobileHeroStageProps {
  entityId: string;
  title: string;
  type: string;
  heroBackdrop?: string;
  displayTitle: string;
}

export function MobileHeroStage({
  entityId,
  title,
  type,
  heroBackdrop,
  displayTitle,
}: MobileHeroStageProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { viewingHistory } = useHistoryStore();

  const handlePlay = async () => {
    // 检查历史进度
    const historyItem = viewingHistory.find(
      h => h.title?.trim().toLowerCase() === title.trim().toLowerCase()
    );

    let playEpisode = '1';
    if (historyItem) {
      const displayInfo = getEpisodeDisplayInfo(historyItem.episodes, historyItem.episodeIndex);
      playEpisode = displayInfo.paramValue;
    }

    let playId: string | number | undefined = undefined;
    let playSource: string | undefined = undefined;

    // 1. 优先超短竞速 300ms 抢抓骨干源（巨量 Anycast 纯净全网首选）
    const fast = await resolvePlayTarget(title, 300);
    if (fast.source === 'juliang' && fast.id) {
      playId = fast.id;
      playSource = 'juliang';
    } else if (historyItem?.source && isValidSourceId(historyItem.source)) {
      // 2. 巨量未收录时，回退老用户历史记录源
      playId = historyItem.videoId;
      playSource = historyItem.source;
    } else if (fast.id && fast.source && isValidSourceId(fast.source)) {
      // 3. 次级骨干源（光速/暴风）
      playId = fast.id;
      playSource = fast.source;
    }

    startTransition(() => {
      const params = new URLSearchParams({
        entity: entityId,
        title,
        type: type === 'tv' ? 'tv' : 'movie',
        episode: playEpisode,
      });
      if (playId) params.set('id', String(playId));
      if (playSource) params.set('source', playSource);
      router.push(`/player?${params.toString()}`);
    });
  };

  return (
    <div
      onClick={handlePlay}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handlePlay();
        }
      }}
      className="group relative block w-full aspect-16/9 rounded-2xl overflow-hidden bg-black/60 border border-white/15 shadow-2xl shadow-black cursor-pointer"
      aria-label={`播放《${displayTitle}》`}
    >
      {heroBackdrop ? (
        <Image
          src={heroBackdrop}
          alt={`${displayTitle} 封面海报`}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-white/30">
          <Film className="w-12 h-12" />
        </div>
      )}
      {/* 电影级微光暗角融合 */}
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-black/30" />
      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />

      {/* 居中浮动 Netflix 级透明磨砂玻璃【▶ 播放】高阶按钮 */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className={`w-14 h-14 rounded-full bg-black/40 backdrop-blur-md border border-white/30 text-white flex items-center justify-center shadow-2xl shadow-black/80 group-hover:scale-110 group-active:scale-95 group-hover:bg-black/55 group-hover:border-white/50 transition-all duration-300 ${isPending ? 'opacity-70 scale-95' : ''}`}>
          <Play className="w-6 h-6 fill-white text-white translate-x-0.5 opacity-90 group-hover:opacity-100" />
        </div>
      </div>
    </div>
  );
}
