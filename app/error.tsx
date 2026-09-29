'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { startTransition, useEffect } from 'react';
import { isStaleBuildError, reloadForNewBuild } from '@/lib/client/stale-build';

export default function PageError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();
  const stale = isStaleBuildError(error);

  useEffect(() => {
    if (stale) reloadForNewBuild();
  }, [stale]);

  if (stale) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center px-4 text-center text-white/60">
        <div>
          <span className="block mx-auto w-10 h-10 rounded-full border-2 border-white/20 border-t-(--accent-color) animate-spin" aria-hidden />
          <p className="mt-4 text-sm">网站刚更新，正在载入新版本…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center text-white">
      <h1 className="text-xl font-bold">页面出了点问题</h1>
      <p className="mt-2 text-sm text-white/50">可能是网络不稳定。请重试，或者刷新页面。</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => startTransition(() => { router.refresh(); reset(); })}
          className="px-6 py-2.5 rounded-full bg-(--accent-color) text-white text-sm font-semibold cursor-pointer hover:brightness-110 transition-all"
        >
          重试
        </button>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 rounded-full bg-[#1c1c20] border border-white/10 text-white/80 text-sm cursor-pointer hover:bg-white/10 transition-all"
        >
          刷新页面
        </button>
        <Link href="/" className="px-6 py-2.5 rounded-full bg-[#1c1c20] border border-white/10 text-white/80 text-sm hover:bg-white/10 transition-all">
          回首页
        </Link>
      </div>
    </div>
  );
}
