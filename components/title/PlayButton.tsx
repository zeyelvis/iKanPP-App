'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Loader2 } from 'lucide-react';

interface PlayButtonProps {
  entityId: string;
  title: string;
  type: string;
  episode?: number;
}

export function PlayButton({ entityId, title, type, episode = 1 }: PlayButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handlePlay = () => {
    startTransition(() => {
      // 严格遵循 R10 架构铁律：通过 entity 参数导航，避免与旧格式 301 冲突
      const params = new URLSearchParams({
        entity: entityId,
        title,
        type: type === 'tv' ? 'tv' : 'movie',
        episode: String(episode),
      });
      router.push(`/player?${params.toString()}`);
    });
  };

  return (
    <button
      onClick={handlePlay}
      disabled={isPending}
      className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-lg shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-75 disabled:cursor-wait"
      id="btn-play-now"
    >
      {isPending ? (
        <>
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>正在进入影院...</span>
        </>
      ) : (
        <>
          <Play className="w-6 h-6 fill-white" />
          <span>立即播放</span>
        </>
      )}
    </button>
  );
}
