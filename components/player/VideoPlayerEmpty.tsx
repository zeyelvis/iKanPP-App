'use client';

import { Card } from '@/components/ui/Card';
import { Icons } from '@/components/ui/Icon';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

interface VideoPlayerEmptyProps {
  videoTitle?: string;
  isPremium?: boolean;
}

export function VideoPlayerEmpty({ videoTitle, isPremium }: VideoPlayerEmptyProps = {}) {
  const router = useRouter();

  const handleAutoSearch = () => {
    if (!videoTitle) {
      router.push(isPremium ? '/premium' : '/');
      return;
    }
    const params = new URLSearchParams();
    params.set('title', videoTitle);
    if (isPremium) params.set('premium', '1');
    router.replace(`/player?${params.toString()}`);
  };

  return (
    <Card hover={false} className="p-0 overflow-hidden">
      <div className="aspect-video bg-[#141416]/95 rounded-[var(--radius-2xl)] flex items-center justify-center border border-white/10">
        <div className="text-center text-[var(--text-secondary)] px-4">
          <Icons.TV size={56} className="text-[var(--text-color-secondary)] mx-auto mb-3 opacity-60" />
          <p className="text-base font-medium text-white/80 mb-2">当前线路暂无有效播放流</p>
          {videoTitle && (
            <p className="text-xs text-white/40 mb-5 max-w-sm mx-auto truncate">
              《{videoTitle}》
            </p>
          )}
          <div className="flex items-center justify-center gap-3">
            {videoTitle && (
              <button
                onClick={handleAutoSearch}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-(--accent-color) hover:bg-(--accent-color)/90 text-white text-xs font-bold transition-all shadow-lg hover:shadow-(--accent-color)/20 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <Search size={14} />
                全网智能检索其他片源
              </button>
            )}
            <button
              onClick={() => router.push(isPremium ? '/premium' : '/')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white/70 hover:text-white text-xs font-medium transition-all cursor-pointer"
            >
              返回大厅
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}
