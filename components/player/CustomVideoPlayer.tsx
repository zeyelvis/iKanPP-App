'use client';

import React from 'react';
import { DesktopVideoPlayer } from './DesktopVideoPlayer';


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

/**
 * Smart Video Player that renders different versions based on device
 * - Mobile/Tablet: Optimized touch controls, double-tap gestures, orientation lock
 * - Desktop: Full-featured player with hover interactions
 */
export const CustomVideoPlayer = React.memo(function CustomVideoPlayer(props: CustomVideoPlayerProps) {
  return <DesktopVideoPlayer {...props} />;
});

