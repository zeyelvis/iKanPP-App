import { useState, useEffect, useCallback, type MutableRefObject } from 'react';
import { getSkipMarkers, saveSkipMarkers, formatTimeSeconds, type SkipMarkers } from '@/lib/player/skip-markers';

export function usePlayerSkipMarkers(title: string | null, playerTimeRef: MutableRefObject<number>) {
  const [skipMarkers, setSkipMarkers] = useState<SkipMarkers>(() => getSkipMarkers(title || ''));
  const [skipToast, setSkipToast] = useState<string | null>(null);

  useEffect(() => {
    if (title) {
      setSkipMarkers(getSkipMarkers(title));
    }
  }, [title]);

  const handleMarkIntro = useCallback(() => {
    const cur = playerTimeRef.current;
    if (typeof cur !== 'number' || cur < 0) return;
    const rounded = Math.round(cur);
    const updated = { ...skipMarkers, intro: rounded };
    setSkipMarkers(updated);
    saveSkipMarkers(title || '', updated);
    setSkipToast(`已标记片头 (${formatTimeSeconds(rounded)})，后续集数将自动秒跳片头`);
    setTimeout(() => setSkipToast(null), 3500);
  }, [title, skipMarkers, playerTimeRef]);

  const handleMarkOutro = useCallback(() => {
    const cur = playerTimeRef.current;
    if (typeof cur !== 'number' || cur <= 0) return;
    const rounded = Math.round(cur);
    const updated = { ...skipMarkers, outro: rounded };
    setSkipMarkers(updated);
    saveSkipMarkers(title || '', updated);
    setSkipToast(`已标记片尾 (${formatTimeSeconds(rounded)})，播至此处将自动连播下一集`);
    setTimeout(() => setSkipToast(null), 3500);
  }, [title, skipMarkers, playerTimeRef]);

  const handleClearMarker = useCallback((type: 'intro' | 'outro') => {
    const updated = { ...skipMarkers, [type]: null };
    setSkipMarkers(updated);
    saveSkipMarkers(title || '', updated);
    setSkipToast(`已清除${type === 'intro' ? '片头' : '片尾'}跳过标记`);
    setTimeout(() => setSkipToast(null), 2500);
  }, [title, skipMarkers]);

  return {
    skipMarkers,
    skipToast,
    handleMarkIntro,
    handleMarkOutro,
    handleClearMarker,
  };
}
