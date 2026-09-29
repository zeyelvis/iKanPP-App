'use client';

import React, { useSyncExternalStore } from 'react';
import dynamic from 'next/dynamic';
import { DesktopVideoPlayer } from './DesktopVideoPlayer';
import { settingsStore } from '@/lib/store/settings-store';

const DynamicXgVideoPlayer = dynamic(
  () => import('./xg/XgVideoPlayer').then((m) => m.XgVideoPlayer),
  {
    ssr: false,
    loading: () => (
      <div className="w-full aspect-video bg-black rounded-none sm:rounded-2xl flex items-center justify-center text-slate-500 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span>正在启动字节 XGPlayer 播放引擎...</span>
        </div>
      </div>
    ),
  }
);

const DynamicNextgenVideoPlayer = dynamic(
  () => import('./nextgen/NextgenVideoPlayer').then((m) => m.NextgenVideoPlayer),
  {
    ssr: false,
    loading: () => (
      <div className="w-full aspect-video bg-black rounded-none sm:rounded-2xl flex items-center justify-center text-slate-500 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          <span>正在启动新一代内核 (Nextgen) 播放引擎...</span>
        </div>
      </div>
    ),
  }
);

interface CustomVideoPlayerProps {
  src: string;
  poster?: string;
  onError?: (error: string) => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  initialTime?: number;
  shouldAutoPlay?: boolean;
  // Episode navigation props for auto-skip/auto-next
  totalEpisodes?: number;
  currentEpisodeIndex?: number;
  onNextEpisode?: () => void;
  isReversed?: boolean;
  // Danmaku props
  videoTitle?: string;
  episodeName?: string;
  isPremium?: boolean;
  onBack?: () => void;
  // Resolution callback
  onResolutionDetected?: (info: import('./hooks/useVideoResolution').VideoResolutionInfo) => void;
  // Netflix 级新交互
  episodes?: Array<{ name?: string; url: string }>;
  onSelectEpisode?: (index: number) => void;
  sources?: Array<import('./desktop/InPlayerSourceDrawer').SourceItem>;
  currentSource?: string;
  onSelectSource?: (source: import('./desktop/InPlayerSourceDrawer').SourceItem) => void;
}

function getClientEngine(): 'xgplayer' | 'legacy' | 'nextgen' {
  if (typeof window === 'undefined') return 'nextgen';
  const params = new URLSearchParams(window.location.search);
  const queryEngine = params.get('engine');
  if (queryEngine === 'nextgen' || queryEngine === 'xgplayer' || queryEngine === 'legacy') {
    return queryEngine;
  }
  return settingsStore.getSettings().playerEngine || 'nextgen';
}

function getServerEngine(): 'xgplayer' | 'legacy' | 'nextgen' {
  return 'nextgen';
}

/**
 * Smart Video Player that routes to modern Nextgen, XGPlayer, or legacy player based on user preference
 */
export const CustomVideoPlayer = React.memo(function CustomVideoPlayer(props: CustomVideoPlayerProps) {
  const engine = useSyncExternalStore(
    settingsStore.subscribe.bind(settingsStore),
    getClientEngine,
    getServerEngine
  );

  if (engine === 'legacy') {
    return <DesktopVideoPlayer {...props} />;
  }

  if (engine === 'nextgen') {
    return <DynamicNextgenVideoPlayer {...props} />;
  }

  return <DynamicXgVideoPlayer {...props} />;
});

