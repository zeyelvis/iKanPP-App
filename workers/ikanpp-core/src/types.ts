/**
 * iKanPP Core Worker Types & Standards
 */

export interface ExecutionContext {
  waitUntil(promise: Promise<any>): void;
  passThroughOnException(): void;
}

export interface ScheduledEvent {
  cron: string;
  type: string;
  scheduledTime: number;
}

export interface Env {
  KVIDEO_KV: KVNamespace;
  DB?: D1Database;
  ENVIRONMENT?: string;
  VERSION?: string;
  TMDB_API_KEY?: string;
  CRON_SECRET?: string;
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
  '痴漢', '痴汉', '調教', '调教', '発情', '发情', '近親', '近亲', '乱倫', '乱伦',
  '性奴', '小股', '沙龙病院', '中出し', '潮吹き', '巨乳', '美乳', '爆乳', '素人',
  '熟女', '人妻', '淫乱', '淫', '絶頂', '绝顶', '強姦', '强奸', '輪姦', '轮奸', '肉便器',
  '風俗', '风俗', '無修正', '无修正', 'エロ', 'AV', 'JAV', 'FC2', 'SM', '変態', '变态',
  '制服誘惑', '制服诱惑', '女教師', '女教师', '看護婦', '看护妇', '盗撮', '覗き', '偷窥',
  '性交', '做爱', '自慰', '色情', '三级', '露点', '情色', '偷拍', '色誘', '色诱', '情欲', '欲女',
  '性爱', '野合', '春药', '偷欢', '私通', '肉欲', '性虐', '援交', '内射', '潮吹',
  '抽插', '颜射', '绿帽', '绿帽奴', '寝取', 'ntr', '中出', '口交', '乳交', '打炮', '手淫',
  '高潮', '风俗娘', '精液', '射精', '催情', '开苞', '破处', '拘束', '凌辱'
];

export const COMMENTARY_BLACKLIST_WORDS = [
  '解说', '说电影', '几分钟看', '一口气看', '速看', '看懂',
  '纯享版', '先导片', '幕后花絮', '独家花絮', '精彩看点', '正片片段',
  '电影解说', '影视解说', '剧情解说', '短剧解说', '影视剪辑', '混剪'
];

const ADULT_CODE_REGEX = /\b[A-Z]{2,6}[-_]?\d{2,5}\b/i;

/**
 * 校验标题是否符合华语内容安全准则 (AGENTS.md 准则 12)
 */
export function isCleanChineseTitle(title: string): boolean {
  if (!title || typeof title !== 'string') return false;
  const t = title.trim();
  if (!t) return false;

  // 1. 必须包含至少一个汉字 (杜绝未汉化海外条目)
  if (!/[\u4e00-\u9fa5]/.test(t)) return false;

  // 2. 绝对零容忍日文假名（无论夹带多少汉字）
  if (/[\u3040-\u309f\u30a0-\u30ff]/.test(t)) return false;

  // 3. 绝对零容忍韩文字符
  if (/[\uac00-\ud7af]/.test(t)) return false;

  // 4. 绝对拦截二手搬运、短视频剪辑与解说类
  for (const cw of COMMENTARY_BLACKLIST_WORDS) {
    if (t.includes(cw)) return false;
  }

  // 5. 命中番号格式直接拦截
  if (ADULT_CODE_REGEX.test(t)) return false;

  // 6. 敏感词拦截（排除星球大战等合法标题误杀）
  const lower = t.toLowerCase();
  for (const word of ADULT_BLACKLIST_WORDS) {
    if (lower.includes(word.toLowerCase())) {
      if (t.includes('星球大战') || t.includes('野战排') || t.includes('大雨将至')) {
        continue;
      }
      return false;
    }
  }

  return true;
}
