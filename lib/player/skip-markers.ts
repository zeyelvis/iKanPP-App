/**
 * 片头片尾自定义跳过打点引擎 (Intro/Outro Skip Markers Engine)
 * 智能记忆每部影视剧的片头结束时间与片尾开始时间，实现全剧全自动跳过片头、自动连播下一集
 */

export interface SkipMarkers {
  intro: number | null;
  outro: number | null;
}

export function getCleanTitleKey(title: string): string {
  if (!title) return '';
  return title
    .replace(/[《》【】\[\]（）()·\s:：\-—_]/g, '')
    .replace(/(第[一二三四五六七八九十\d]+[季部期]|season\s*\d+|S\d{1,2})/gi, '')
    .toLowerCase()
    .trim();
}

export function getSkipMarkers(title: string): SkipMarkers {
  if (typeof window === 'undefined' || !title) return { intro: null, outro: null };
  try {
    const key = getCleanTitleKey(title);
    const raw = localStorage.getItem(`ikanpp:skip:${key}`);
    if (!raw) return { intro: null, outro: null };
    const parsed = JSON.parse(raw);
    return {
      intro: typeof parsed.intro === 'number' && parsed.intro > 0 ? parsed.intro : null,
      outro: typeof parsed.outro === 'number' && parsed.outro > 0 ? parsed.outro : null,
    };
  } catch {
    return { intro: null, outro: null };
  }
}

export function saveSkipMarkers(title: string, markers: SkipMarkers): void {
  if (typeof window === 'undefined' || !title) return;
  try {
    const key = getCleanTitleKey(title);
    localStorage.setItem(`ikanpp:skip:${key}`, JSON.stringify(markers));
  } catch {}
}

export function formatTimeSeconds(seconds: number): string {
  if (!seconds || isNaN(seconds) || seconds < 0) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
