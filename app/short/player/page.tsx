import { Metadata } from 'next';
import { Suspense } from 'react';
import ShortPlayerClient from './ShortPlayerClient';

export const metadata: Metadata = {
  title: '沉浸式短剧播放器 - 竖屏上下滑动连播 | iKanPP 爱看片片',
  description: 'iKanPP 9:16 竖屏沉浸式微短剧播放器，支持上下滑动智能切集、长按3倍速、双击快进、全屏自动连播。100% 极速直连高清播放。',
};

export default function ShortPlayerPage() {
  return (
    <Suspense
      fallback={
        <div className="w-screen h-[100dvh] bg-black flex items-center justify-center text-white">
          <div className="brand-spinner" />
        </div>
      }
    >
      <ShortPlayerClient />
    </Suspense>
  );
}
