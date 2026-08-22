/**
 * Jable.tv 风格专业分类、女优索引与标签体系
 */

export interface JableCategory {
    id: string;
    label: string;
    keyword: string;
    icon: string;
    badge?: string;
    isHot?: boolean;
}

export const JABLE_MAIN_CATEGORIES: JableCategory[] = [
    { id: 'all', label: '全部影片', keyword: '', icon: '🎬' },
    { id: 'today_hot', label: '今日热门', keyword: '热门', icon: '🔥', isHot: true },
    { id: 'chinese_sub', label: '中文字幕', keyword: '中文字幕', icon: '👑', badge: 'SUB' },
    { id: 'uncensored', label: '无码专区', keyword: '无码', icon: '💎', badge: 'HD' },
    { id: 'japan_censored', label: '日本有码', keyword: '日本', icon: '🌸' },
    { id: 'domestic', label: '国产自拍', keyword: '国产', icon: '🏮', isHot: true },
    { id: 'western', label: '欧美大片', keyword: '欧美', icon: '🗽' },
    { id: 'anime_3d', label: '动漫 3D', keyword: '动漫', icon: '⚡' },
    { id: 'fc2', label: 'FC2 独家', keyword: 'FC2', icon: '⭐', badge: 'PRO' },
    { id: 'actress', label: '女优列表', keyword: '女优', icon: '💃' },
];

export interface JableActress {
    id: string;
    name: string;
    avatar: string;
    tag: string;
    videoCount: number;
    searchKey: string;
}

export const JABLE_POPULAR_ACTRESSES: JableActress[] = [
    {
        id: '1',
        name: '河北彩花',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop',
        tag: '国民级偶像',
        videoCount: 128,
        searchKey: '河北彩花',
    },
    {
        id: '2',
        name: '三上悠亚',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=300&auto=format&fit=crop',
        tag: '超级顶流',
        videoCount: 260,
        searchKey: '三上悠亚',
    },
    {
        id: '3',
        name: '相泽南',
        avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=300&auto=format&fit=crop',
        tag: '灰姑娘影后',
        videoCount: 195,
        searchKey: '相泽南',
    },
    {
        id: '4',
        name: '深田咏美',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300&auto=format&fit=crop',
        tag: '社交天后',
        videoCount: 310,
        searchKey: '深田咏美',
    },
    {
        id: '5',
        name: '小宵虎南',
        avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=300&auto=format&fit=crop',
        tag: '神级身材',
        videoCount: 88,
        searchKey: '小宵虎南',
    },
    {
        id: '6',
        name: '山岸逢花',
        avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=300&auto=format&fit=crop',
        tag: '知性主播',
        videoCount: 142,
        searchKey: '山岸逢花',
    },
    {
        id: '7',
        name: '葵司',
        avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=300&auto=format&fit=crop',
        tag: '清纯女神',
        videoCount: 175,
        searchKey: '葵司',
    },
    {
        id: '8',
        name: '明里紬',
        avatar: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?q=80&w=300&auto=format&fit=crop',
        tag: '透明系美少女',
        videoCount: 110,
        searchKey: '明里紬',
    },
];

export const JABLE_POPULAR_TAGS = [
    { label: '🔥 中文字幕', keyword: '中文字幕' },
    { label: '💎 4K 原画', keyword: '4K' },
    { label: '🏮 国产自拍', keyword: '国产' },
    { label: '👙 巨乳美胸', keyword: '巨乳' },
    { label: '👠 丝袜美腿', keyword: '丝袜' },
    { label: '👗 制服诱惑', keyword: '制服' },
    { label: '💍 人妻熟女', keyword: '人妻' },
    { label: '💄 职场白领', keyword: 'OL' },
    { label: '🎓 清纯女学生', keyword: '学生' },
    { label: '🎭 角色扮演', keyword: 'Cosplay' },
    { label: '⭐ FC2 独家', keyword: 'FC2' },
    { label: '💃 极品模特', keyword: '模特' },
    { label: '⚡ 剧情大作', keyword: '剧情' },
    { label: '🏖️ 户外搭讪', keyword: '搭讪' },
];
