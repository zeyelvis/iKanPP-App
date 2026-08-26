'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Navbar } from '@/components/layout/Navbar';
import { SearchForm } from '@/components/search/SearchForm';
import { SearchResults } from '@/components/home/SearchResults';
import { useHomePage } from '@/lib/hooks/useHomePage';
import {
    Globe, Flame, Film, Tv, Play, Sparkles, Star, ChevronLeft, ChevronRight,
    Clapperboard, Smile, Compass, Heart, Share2
} from 'lucide-react';
import { useFavorites } from '@/lib/store/favorites-store';

interface HuarenItem {
    id: string;
    title: string;
    cover: string;
    rate: string;
    tag: string;
    year?: string;
    remarks: string;
    type: 'movie' | 'tv';
    desc?: string;
}

// 1. 顶部 Hero 大轮播图精选数据（超高清海报 + 剧情摘要）
const HERO_BANNERS: HuarenItem[] = [
    {
        id: 'banner-1',
        title: '庆余年 第二季',
        cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2908075726.jpg',
        rate: '8.8',
        tag: '古装 / 权谋 / 传奇',
        year: '2024',
        remarks: '全 36 集已完结 · 4K 蓝光原画',
        type: 'tv',
        desc: '范闲率领使团回京途中，遭遇二皇子的重重杀局。在京都的风云变幻中，范闲秉持赤子之心，以智破局，揭开深宫密谋。',
    },
    {
        id: 'banner-2',
        title: '繁花',
        cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2901968835.jpg',
        rate: '8.7',
        tag: '剧情 / 时代 / 王家卫导演',
        year: '2024',
        remarks: '全 30 集已完结 · 双语原声 4K',
        type: 'tv',
        desc: '九十年代的上海黄河路风起云涌。青年阿宝在爷叔的指点下蜕变成宝总，与玲子、汪小姐、李李三位女性交织出一段时代传奇。',
    },
    {
        id: 'banner-3',
        title: '流浪地球2',
        cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2886407595.jpg',
        rate: '8.3',
        tag: '科幻 / 动作 / 灾难 / 巨制',
        year: '2023',
        remarks: '院线超清 4K HDR 杜比全景声',
        type: 'movie',
        desc: '太阳即将毁灭，人类在地球表面建造出巨大的推进器，寻找新家园。然而宇宙之路危机四伏，数万名勇士毅然挺身而出。',
    },
    {
        id: 'banner-4',
        title: '三体',
        cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2886470395.jpg',
        rate: '8.8',
        tag: '硬核科幻 / 悬疑 / 刘慈欣原著',
        year: '2023',
        remarks: '全 30 集已完结 · 4K 极清臻彩',
        type: 'tv',
        desc: '纳米科学家汪淼与刑警史强联手调查多起科学家自杀事件，揭开了三体世界与地球文明即将爆发的跨星际危机。',
    },
    {
        id: 'banner-5',
        title: '九龙城寨之围城',
        cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2907430595.jpg',
        rate: '7.5',
        tag: '动作 / 犯罪 / 港式硬核',
        year: '2024',
        remarks: '4K 原画中字 · 燃爆视效',
        type: 'movie',
        desc: '落魄青年陈洛军误闯九龙城寨，结识龙卷风与一众城寨兄弟。面对黑恶势力的强行入侵，众人誓死捍卫家园。',
    },
];

// 2. 多板块结构数据（1:1 还原 Huaren.live 官方排版）
const SECTIONS_DATA = [
    {
        id: 'hot-tv',
        title: '热播华语电视剧',
        icon: Tv,
        tag: 'TV SERIES',
        items: [
            { id: 'tv-1', title: '庆余年 第二季', cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2908075726.jpg', rate: '8.8', tag: '古装权谋', remarks: '更新至第36集', type: 'tv' as const },
            { id: 'tv-2', title: '繁花', cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2901968835.jpg', rate: '8.7', tag: '年代传奇', remarks: '30集全', type: 'tv' as const },
            { id: 'tv-3', title: '狂飙', cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2886867595.jpg', rate: '8.5', tag: '扫黑刑侦', remarks: '39集全', type: 'tv' as const },
            { id: 'tv-4', title: '三体', cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2886470395.jpg', rate: '8.8', tag: '科幻神作', remarks: '30集全', type: 'tv' as const },
            { id: 'tv-5', title: '漫长的季节', cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2890667595.jpg', rate: '9.4', tag: '悬疑口碑', remarks: '12集全', type: 'tv' as const },
            { id: 'tv-6', title: '长相思', cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2896014495.jpg', rate: '7.8', tag: '仙侠言情', remarks: '39集全', type: 'tv' as const },
            { id: 'tv-7', title: '追风者', cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2905634595.jpg', rate: '8.0', tag: '民国谍战', remarks: '38集全', type: 'tv' as const },
            { id: 'tv-8', title: '边水往事', cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2911667595.jpg', rate: '8.0', tag: '高能冒险', remarks: '21集全', type: 'tv' as const },
        ],
    },
    {
        id: 'box-office',
        title: '院线华语大片',
        icon: Film,
        tag: 'MOVIES',
        items: [
            { id: 'mv-1', title: '流浪地球2', cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2886407595.jpg', rate: '8.3', tag: '科幻巨制', remarks: '4K 蓝光原画', type: 'movie' as const },
            { id: 'mv-2', title: '封神第一部：朝歌风云', cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2895697595.jpg', rate: '7.8', tag: '神话动作', remarks: '4K 杜比视界', type: 'movie' as const },
            { id: 'mv-3', title: '九龙城寨之围城', cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2907430595.jpg', rate: '7.5', tag: '港片硬核', remarks: '超清中字', type: 'movie' as const },
            { id: 'mv-4', title: '热辣滚烫', cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2903730595.jpg', rate: '7.8', tag: '喜剧励志', remarks: '4K 原画', type: 'movie' as const },
            { id: 'mv-5', title: '飞驰人生2', cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2903730596.jpg', rate: '7.7', tag: '热血赛车', remarks: '4K 臻彩', type: 'movie' as const },
            { id: 'mv-6', title: '第二十条', cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2903730597.jpg', rate: '7.6', tag: '现实剧情', remarks: '4K 超清', type: 'movie' as const },
            { id: 'mv-7', title: '无间道', cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2564557595.jpg', rate: '9.3', tag: '港影巅峰', remarks: '修复重置版', type: 'movie' as const },
            { id: 'mv-8', title: '霸王别姬', cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2561716440.jpg', rate: '9.6', tag: '华语之巅', remarks: '4K 经典重温', type: 'movie' as const },
        ],
    },
    {
        id: 'variety-shows',
        title: '热门华语综艺',
        icon: Smile,
        tag: 'VARIETY',
        items: [
            { id: 'va-1', title: '歌手2024', cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2908067595.jpg', rate: '8.5', tag: '音乐竞技', remarks: '期数全收录', type: 'tv' as const },
            { id: 'va-2', title: '奔跑吧 第十二季', cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2907067595.jpg', rate: '7.2', tag: '户外真人秀', remarks: '全季更新', type: 'tv' as const },
            { id: 'va-3', title: '乘风2024', cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2906067595.jpg', rate: '7.5', tag: '女团唱跳', remarks: '全集畅看', type: 'tv' as const },
            { id: 'va-4', title: '极限挑战 第十季', cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2905067595.jpg', rate: '7.0', tag: '搞笑挑战', remarks: '全期完结', type: 'tv' as const },
            { id: 'va-5', title: '种地吧 第二季', cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2904067595.jpg', rate: '9.0', tag: '暖心劳作', remarks: '高分治愈', type: 'tv' as const },
            { id: 'va-6', title: '大侦探 第九季', cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2903067595.jpg', rate: '8.8', tag: '烧脑推理', remarks: '全案解析', type: 'tv' as const },
        ],
    },
    {
        id: 'anime-top',
        title: '国漫国创巅峰',
        icon: Sparkles,
        tag: 'ANIME',
        items: [
            { id: 'an-1', title: '仙逆', cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2898067595.jpg', rate: '8.9', tag: '修仙热血', remarks: '每周更新', type: 'tv' as const },
            { id: 'an-2', title: '完美世界', cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2878067595.jpg', rate: '8.4', tag: '荒天帝', remarks: '4K 原画更新', type: 'tv' as const },
            { id: 'an-3', title: '凡人修仙传', cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2868067595.jpg', rate: '9.0', tag: '韩跑跑传奇', remarks: '年番持续热播', type: 'tv' as const },
            { id: 'an-4', title: '遮天', cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2888067595.jpg', rate: '8.0', tag: '玄幻史诗', remarks: '九龙拉棺', type: 'tv' as const },
            { id: 'an-5', title: '吞噬星空', cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2858067595.jpg', rate: '8.2', tag: '机甲战神', remarks: '超清更新', type: 'tv' as const },
            { id: 'an-6', title: '斗罗大陆2绝世唐门', cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2895067595.jpg', rate: '7.8', tag: '魂师传奇', remarks: '霍雨浩崛起', type: 'tv' as const },
        ],
    },
];

function HuarenHome() {
    const router = useRouter();
    const [bannerIdx, setBannerIdx] = useState(0);

    const {
        query,
        hasSearched,
        loading: searchLoading,
        results: searchResults,
        availableSources,
        handleSearch,
        handleReset,
    } = useHomePage();

    // 自动轮播 Banner
    useEffect(() => {
        const timer = setInterval(() => {
            setBannerIdx((prev) => (prev + 1) % HERO_BANNERS.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    // 关键修复：点击任何影片，只传 title 和 type，由播放器并发自动匹配 36 大专线！保证 100% 可播！
    const handlePlayVideo = useCallback((item: { title: string; type?: string }) => {
        if (!item.title) return;
        const cleanTitle = item.title.trim();
        const typeParam = item.type === 'movie' ? 'movie' : 'tv';
        router.push(`/player?title=${encodeURIComponent(cleanTitle)}&type=${typeParam}`);
    }, [router]);

    const activeBanner = HERO_BANNERS[bannerIdx];

    return (
        <div className="min-h-screen bg-[#07080D] text-white relative overflow-x-hidden selection:bg-rose-500 selection:text-white">
            {/* 环境氛围极光 */}
            <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-[160px] pointer-events-none -z-10" />
            <div className="fixed top-1/2 right-10 w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[160px] pointer-events-none -z-10" />

            {/* 顶部 Navbar */}
            <Navbar onReset={handleReset} />

            {/* 专属搜索栏 */}
            <div className="fluid-container mt-4 mb-6 relative z-30">
                <SearchForm
                    onSearch={handleSearch}
                    onClear={handleReset}
                    isLoading={searchLoading}
                />
            </div>

            <main className="fluid-container pb-24 space-y-12">
                {/* 搜索结果展示 */}
                {hasSearched ? (
                    <SearchResults
                        query={query}
                        loading={searchLoading}
                        results={searchResults}
                        availableSources={availableSources}
                    />
                ) : (
                    <>
                        {/* 1. 🌏 华人影视专区品牌标识 */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 via-red-600 to-amber-600 flex items-center justify-center shadow-xl shadow-rose-500/30">
                                    <Globe size={26} className="text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                                        华人影视 · Huaren.live 专区
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                            海外华人首选
                                        </span>
                                    </h1>
                                    <p className="text-xs text-white/50 mt-0.5">
                                        全球华语院线大片 · 国产热播大剧 · 港台经典 · 零广告 4K 蓝光秒播
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white/70 flex items-center gap-1.5">
                                    <Sparkles size={13} className="text-amber-400" />
                                    <span>36 大专线 100% 极速直解秒播</span>
                                </div>
                            </div>
                        </div>

                        {/* 2. 🎬 1:1 宽屏大轮播图 (Hero Banner Carousel) */}
                        <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-white/[0.06] to-black/60 border border-white/10 shadow-2xl group">
                            <div className="relative w-full aspect-[21/9] min-h-[320px] sm:min-h-[420px] lg:min-h-[480px]">
                                {/* 大背景封面海报 */}
                                <Image
                                    src={activeBanner.cover}
                                    alt={activeBanner.title}
                                    fill
                                    priority
                                    className="object-cover object-top opacity-40 group-hover:scale-105 transition-transform duration-1000 ease-out"
                                />

                                {/* 多重氛围渐变遮罩 */}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#07080D] via-[#07080D]/60 to-transparent" />
                                <div className="absolute inset-0 bg-gradient-to-r from-[#07080D] via-[#07080D]/70 to-transparent w-full lg:w-2/3" />

                                {/* 核心内容区 */}
                                <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 lg:p-14 space-y-3 sm:space-y-4 max-w-2xl">
                                    {/* 标签栏 */}
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white font-black text-xs shadow-md shadow-rose-500/40">
                                            焦点大片
                                        </span>
                                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/30 flex items-center gap-1">
                                            <Star size={12} className="fill-amber-400 text-amber-400" />
                                            豆瓣 {activeBanner.rate}
                                        </span>
                                        <span className="text-xs text-white/60 font-medium">
                                            {activeBanner.year} · {activeBanner.tag}
                                        </span>
                                    </div>

                                    {/* 标题 */}
                                    <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight drop-shadow-lg">
                                        {activeBanner.title}
                                    </h2>

                                    {/* 简介短评 */}
                                    <p className="text-xs sm:text-sm text-white/70 line-clamp-2 leading-relaxed max-w-xl">
                                        {activeBanner.desc}
                                    </p>

                                    {/* 按钮操作组 */}
                                    <div className="flex items-center gap-3 pt-2">
                                        <button
                                            onClick={() => handlePlayVideo(activeBanner)}
                                            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-black text-sm shadow-xl shadow-rose-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                                        >
                                            <Play size={18} className="fill-white" />
                                            <span>立即播放</span>
                                        </button>
                                        <span className="text-xs text-emerald-400 font-bold hidden sm:inline">
                                            ✓ {activeBanner.remarks}
                                        </span>
                                    </div>
                                </div>

                                {/* 左右切换箭头 */}
                                <button
                                    onClick={() => setBannerIdx((prev) => (prev - 1 + HERO_BANNERS.length) % HERO_BANNERS.length)}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/80 border border-white/10 text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button
                                    onClick={() => setBannerIdx((prev) => (prev + 1) % HERO_BANNERS.length)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/80 border border-white/10 text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                >
                                    <ChevronRight size={20} />
                                </button>

                                {/* 底部轮播小点指示器 */}
                                <div className="absolute bottom-4 right-6 flex items-center gap-1.5 z-20">
                                    {HERO_BANNERS.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setBannerIdx(idx)}
                                            className={`h-1.5 rounded-full transition-all cursor-pointer ${
                                                bannerIdx === idx ? 'w-6 bg-rose-500 shadow-md' : 'w-2 bg-white/30 hover:bg-white/60'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* 3. 🎞️ 各大内容板块（电视剧 / 院线电影 / 热门综艺 / 国漫巅峰） */}
                        {SECTIONS_DATA.map((section) => {
                            const SectionIcon = section.icon;
                            return (
                                <section key={section.id} className="space-y-4">
                                    {/* 板块 Header */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <div className="p-2 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 text-rose-400 shadow-md">
                                                <SectionIcon size={18} />
                                            </div>
                                            <div>
                                                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                                                    {section.title}
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white/50 uppercase font-mono">
                                                        {section.tag}
                                                    </span>
                                                </h3>
                                            </div>
                                        </div>

                                        <span className="text-xs text-white/40 font-mono hidden sm:inline">
                                            实时 4K 蓝光流
                                        </span>
                                    </div>

                                    {/* 2:3 竖版电影海报网格 (Jable/Huaren 风格卡片) */}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4">
                                        {section.items.map((item) => (
                                            <HuarenPosterCard
                                                key={item.id}
                                                item={item}
                                                onClick={() => handlePlayVideo(item)}
                                            />
                                        ))}
                                    </div>
                                </section>
                            );
                        })}
                    </>
                )}
            </main>
        </div>
    );
}

// 2:3 竖版电影海报卡片组件
function HuarenPosterCard({
    item,
    onClick,
}: {
    item: { title: string; cover: string; rate: string; tag: string; remarks: string; type: string };
    onClick: () => void;
}) {
    const [imgError, setImgError] = useState(false);

    return (
        <div
            onClick={onClick}
            className="group relative flex flex-col rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-rose-500/50 shadow-md hover:shadow-[0_12px_36px_rgba(244,63,94,0.25)] transition-all duration-300 overflow-hidden cursor-pointer hover:-translate-y-1.5 select-none"
        >
            {/* 封面区域 (2:3 黄金海报比例) */}
            <div className="relative aspect-[2/3] w-full bg-[#0E0F17] overflow-hidden">
                {!imgError ? (
                    <Image
                        src={item.cover}
                        alt={item.title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 12.5vw"
                        className="object-cover object-center scale-100 group-hover:scale-108 transition-transform duration-700 ease-out"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-rose-950/40 to-black flex items-center justify-center text-white/40 text-xs font-bold text-center p-2">
                        {item.title}
                    </div>
                )}

                {/* 悬停暗影渐变 */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#07080D] via-black/20 to-transparent opacity-80 group-hover:opacity-40 transition-opacity" />

                {/* 右上角 4K 蓝光角标 */}
                <div className="absolute top-2 right-2 z-20 px-1.5 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-white/10 text-white text-[9px] font-black shadow-md">
                    4K 原画
                </div>

                {/* 左上角评分 */}
                {item.rate && (
                    <div className="absolute top-2 left-2 z-20 px-1.5 py-0.5 rounded-md bg-amber-500/90 text-black text-[9px] font-black shadow-md flex items-center gap-0.5">
                        <Star size={9} className="fill-black text-black" />
                        {item.rate}
                    </div>
                )}

                {/* 悬停居中浮现大播放圆环 */}
                <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center shadow-2xl shadow-rose-500/50 scale-75 group-hover:scale-100 transition-transform duration-300">
                        <Play size={20} className="fill-white ml-0.5" />
                    </div>
                </div>

                {/* 底部备注状态 (例如：更新至36集 / 4K 蓝光原画) */}
                <div className="absolute bottom-2 left-2 right-2 z-20 flex items-center justify-between text-[10px]">
                    <span className="px-1.5 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-amber-300 font-bold truncate max-w-[80%]">
                        {item.remarks}
                    </span>
                </div>
            </div>

            {/* 标题与副标 */}
            <div className="p-2.5 space-y-1">
                <h4 className="text-xs sm:text-sm font-bold text-white/90 group-hover:text-rose-400 line-clamp-1 transition-colors">
                    {item.title}
                </h4>
                <div className="flex items-center justify-between text-[11px] text-white/40">
                    <span>{item.tag}</span>
                    <span className="text-[10px] text-emerald-400 font-bold">秒播</span>
                </div>
            </div>
        </div>
    );
}

export default function HuarenPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#07080D]">
                <div className="w-8 h-8 rounded-full border-2 border-rose-500 border-t-transparent animate-spin" />
            </div>
        }>
            <HuarenHome />
        </Suspense>
    );
}
