'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { IkanPPPlayerContainer } from '@/components/player/containers/IkanPPPlayerContainer';
import { IkanXPlayerContainer } from '@/components/player/containers/IkanXPlayerContainer';

/**
 * 播放器顶级路由入口（Dual-Track Architecture 分发器）
 * - 普通全年龄影视：分发至 IkanPPPlayerContainer（毫秒级秒播仲裁、多剧集选集抽屉、弹幕、豆瓣推荐、全套 SEO 结构化）
 * - 午夜成人专区：分发至 IkanXPlayerContainer（番号直推引擎、防盗链中继、沉浸暗黑界面、100% 隔离主站）
 */
function PlayerRouter() {
  const searchParams = useSearchParams();
  const isPremium = searchParams.get('premium') === '1';

  return isPremium ? <IkanXPlayerContainer /> : <IkanPPPlayerContainer />;
}

export default function PlayerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-(--bg-color)">
          <div className="brand-spinner" />
        </div>
      }
    >
      <PlayerRouter />
    </Suspense>
  );
}
