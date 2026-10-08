'use client';

import { Suspense } from 'react';
import { IkanPPPlayerContainer } from '@/components/player/containers/IkanPPPlayerContainer';

/**
 * 播放器兜底页（片库里没有作品的片源链接）。午夜专区已拆到 ikanx.com，带 premium=1 的请求由 proxy.ts 301 过去。
 */
function PlayerRouter() {
  return <IkanPPPlayerContainer />;
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
