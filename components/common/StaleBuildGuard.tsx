'use client';

import { useEffect } from 'react';
import { isStaleBuildError, reloadForNewBuild } from '@/lib/client/stale-build';

/** 事件处理函数里按需加载失败（不经过错误边界）时，同样刷新到新版本。 */
export function StaleBuildGuard() {
  useEffect(() => {
    const onRejection = (event: PromiseRejectionEvent) => {
      if (isStaleBuildError(event.reason)) reloadForNewBuild();
    };
    window.addEventListener('unhandledrejection', onRejection);
    return () => window.removeEventListener('unhandledrejection', onRejection);
  }, []);
  return null;
}
