/**
 * iKanPP Core Worker Types & Standards
 */

export interface Env {
  KVIDEO_KV: KVNamespace;
  ENVIRONMENT?: string;
  VERSION?: string;
}

export interface EpisodeItem {
  name: string;
  url: string;
  index: number;
}

export interface CandidateItem {
  vodId: string;
  vod_id: string;
  title: string;
  vod_name: string;
  year?: string;
  category?: string;
  totalEpisodes?: number;
  pic?: string;
}

export interface ResolveParams {
  title?: string;
  id?: string;
  vodId?: string;
  episode?: string | number;
  source?: string;
  category?: string;
  year?: string;
  expectedEpisodes?: string | number;
  season?: string | number;
  aliases?: string | string[];
  onlyCandidates?: boolean;
  includeCandidates?: boolean;
}

export interface LineResponsePayload {
  success: boolean;
  vodId?: string;
  title?: string;
  targetEpisode?: {
    episode: string;
    url: string;
    index: number;
  };
  episodes?: EpisodeItem[];
  play_url?: string;
  raw_play_url?: string;
  total_episodes?: number;
  current_episode?: number;
  current_episode_name?: string;
  quality?: string;
  line?: string;
  source?: string;
  timestamp?: string;
  cached?: boolean;
  error?: string;
  totalCandidates?: number;
  candidates?: CandidateItem[];
  data?: {
    vod_id?: string;
    vod_name?: string;
    type_name?: string;
    episodes?: EpisodeItem[];
    play_url?: string;
    raw_play_url?: string;
    total_episodes?: number;
    current_episode?: number;
    quality?: string;
    source?: string;
  };
}

// 内容安全敏感词黑名单 (AGENTS.md 准则 12)
export const ADULT_BLACKLIST_WORDS = [
  'AV', '三级', '情色', '无码', '有码', '成人', '调教', '偷拍', '熟女', '乱伦',
  '女优', '肉便器', '群交', '巨乳', '痴汉', '快感', '色情'
];

/**
 * 校验标题是否符合华语内容安全准则
 */
export function isCleanChineseTitle(title: string): boolean {
  if (!title || typeof title !== 'string') return false;
  const clean = title.trim();
  if (!clean) return false;

  // 必须包含至少一个汉字
  if (!/[\u4e00-\u9fa5]/.test(clean)) return false;

  // 绝对零容忍日文假名（无论夹带多少汉字）
  if (/[\u3040-\u309f\u30a0-\u30ff]/.test(clean)) return false;

  // 绝对零容忍韩文字符
  if (/[\uac00-\ud7af]/.test(clean)) return false;

  // 敏感词拦截
  for (const word of ADULT_BLACKLIST_WORDS) {
    if (clean.includes(word)) return false;
  }

  return true;
}
