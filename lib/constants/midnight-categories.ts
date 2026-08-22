/**
 * 午夜版专业分类与标签体系
 */

export interface MidnightCategory {
    id: string;
    label: string;
    keyword: string;
    icon: string;
    tag: string;
    color: string;
    description: string;
}

export const MIDNIGHT_CATEGORIES: MidnightCategory[] = [
    {
        id: 'featured',
        label: '今日精选',
        keyword: '',
        icon: '🔥',
        tag: 'HOT',
        color: 'from-amber-500 to-red-500',
        description: '全网热播 · 每日严选必看',
    },
    {
        id: 'chinese_sub',
        label: '中文字幕',
        keyword: '中文字幕',
        icon: '👑',
        tag: 'SUB',
        color: 'from-purple-500 to-pink-500',
        description: '官方中字 · 剧情无障碍',
    },
    {
        id: '4k_uhd',
        label: '4K 极清',
        keyword: '4K',
        icon: '💎',
        tag: '4K UHD',
        color: 'from-cyan-500 to-blue-500',
        description: '原画质感 · 蓝光秒播专线',
    },
    {
        id: 'domestic',
        label: '国产原创',
        keyword: '国产',
        icon: '🏮',
        tag: 'ORIGINAL',
        color: 'from-rose-500 to-orange-500',
        description: '华语精选 · 原生高颜值',
    },
    {
        id: 'japan_korea',
        label: '日韩精品',
        keyword: '日本',
        icon: '🌸',
        tag: 'ASIA',
        color: 'from-pink-500 to-rose-400',
        description: '顶级片商 · 院线同步',
    },
    {
        id: 'western',
        label: '欧美大片',
        keyword: '欧美',
        icon: '🎬',
        tag: 'WESTERN',
        color: 'from-emerald-500 to-teal-500',
        description: '高清无码 · 剧情巨作',
    },
    {
        id: 'anime_3d',
        label: '二次元 3D',
        keyword: '动漫',
        icon: '⚡',
        tag: '3D/CG',
        color: 'from-violet-500 to-indigo-500',
        description: '精美建模 · 梦幻视效',
    },
    {
        id: 'live_vlog',
        label: '主播自拍',
        keyword: '主播',
        icon: '💃',
        tag: 'LIVE',
        color: 'from-amber-400 to-yellow-500',
        description: '真实互动 · 独家私房',
    },
];

export type MidnightSortType = 'recommend' | 'latest' | 'hot' | 'fast';

export const MIDNIGHT_SORT_OPTIONS: { id: MidnightSortType; label: string; icon: string }[] = [
    { id: 'recommend', label: '智能推荐', icon: '✨' },
    { id: 'latest', label: '最新上架', icon: '🕒' },
    { id: 'hot', label: '最受欢迎', icon: '🔥' },
    { id: 'fast', label: '秒播专线', icon: '⚡' },
];
