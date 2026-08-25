'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Play, Flame, Heart, Sparkles, Crown, Eye } from 'lucide-react';
import { useFavorites } from '@/lib/store/favorites-store';

interface JableVideoCardProps {
    video: any;
    onClick: () => void;
    index?: number;
    rankBadge?: number;
}

export function JableVideoCard({
    video,
    onClick,
    index = 0,
    rankBadge,
}: JableVideoCardProps) {
    const [imgError, setImgError] = useState(false);
    const { addFavorite, removeFavorite, isFavorite } = useFavorites(true);

    const title = video?.vod_name || video?.title || '未知影片';
    const rawPic = video?.vod_pic || '';
    const videoId = String(video?.vod_id || '');
    const source = video?.source || 'hsck';
    const isFav = isFavorite(videoId, source);

    // 智能提取番号
    const codeMatch = title.match(/([A-Za-z0-9]{2,8}[-_][0-9]{3,8}|FC2[-_]PPV[-_][0-9]{5,8}|T28[-_][0-9]{3,5})/i);
    const videoCode = codeMatch ? codeMatch[0].toUpperCase() : null;

    // 清洗后较短的标题（去除番号与杂质字符）
    const cleanTitle = videoCode ? title.replace(videoCode, '').replace(/[《》【】\[\]（）()]/g, ' ').trim() : title;

    // 是否包含中文字幕
    const hasChineseSub = title.includes('中文') || title.includes('字幕') || title.includes('中字');

    // 真实/拟真播放热度生成（基于 ID 伪随机稳定）
    const seed = videoId ? videoId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : index * 137;
    const views = Math.floor(12000 + (seed % 88000));
    const viewsFormatted = views > 10000 ? `${(views / 10000).toFixed(1)}万` : `${views}`;

    const handleToggleFav = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isFav) {
            removeFavorite(videoId, source);
        } else {
            addFavorite({
                videoId: videoId,
                title: title,
                poster: rawPic,
                source: source,
                sourceName: '4K 原画',
                remarks: videoCode || '4K MAX',
                type: 'tv',
            });
        }
    };

    return (
        <div
            onClick={onClick}
            className="group relative flex flex-col rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-purple-500/50 shadow-lg hover:shadow-[0_16px_40px_rgba(168,85,247,0.22)] transition-all duration-300 overflow-hidden cursor-pointer hover:-translate-y-1.5 select-none"
        >
            {/* 1. 封面海报区域 */}
            <div className="relative aspect-[16/10] w-full bg-[#0E0F17] overflow-hidden">
                {/* 封面图片 */}
                {rawPic && !imgError ? (
                    <Image
                        src={rawPic}
                        alt={title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover scale-100 group-hover:scale-108 transition-transform duration-700 ease-out"
                        onError={() => setImgError(true)}
                        loading={index < 8 ? 'eager' : 'lazy'}
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-950/40 via-slate-900 to-black flex items-center justify-center text-white/30 text-xs font-mono">
                        {videoCode || '4K 原画'}
                    </div>
                )}

                {/* 悬停多重渐变暗影 */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C14] via-black/30 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                {/* 排行榜名次徽章 (前 3 名金银铜光效) */}
                {rankBadge !== undefined && (
                    <div
                        className={`absolute top-2.5 left-2.5 z-20 w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shadow-lg backdrop-blur-md ${
                            rankBadge === 1
                                ? 'bg-gradient-to-br from-amber-400 to-yellow-600 text-black shadow-amber-500/40 scale-105 ring-2 ring-amber-300'
                                : rankBadge === 2
                                ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-black shadow-slate-400/40 ring-1 ring-white/60'
                                : rankBadge === 3
                                ? 'bg-gradient-to-br from-amber-700 to-orange-800 text-white shadow-amber-900/40'
                                : 'bg-black/75 text-white/90 border border-white/10'
                        }`}
                    >
                        {rankBadge}
                    </div>
                )}

                {/* 核心番号标签 (若无排行徽章则置于左上角) */}
                {videoCode && !rankBadge && (
                    <div className="absolute top-2.5 left-2.5 z-20 px-2 py-0.5 rounded-lg bg-black/85 border border-amber-500/30 text-amber-300 text-[10px] font-black uppercase tracking-wider shadow-md backdrop-blur-md">
                        {videoCode}
                    </div>
                )}

                {/* 4K / 中文字幕角标 (右上角) */}
                <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5">
                    {hasChineseSub && (
                        <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/90 text-white text-[9px] font-black shadow-sm backdrop-blur-md">
                            中字
                        </span>
                    )}
                    <span className="px-1.5 py-0.5 rounded-md bg-purple-600/90 text-white text-[9px] font-black shadow-sm backdrop-blur-md">
                        4K
                    </span>
                </div>

                {/* 悬停居中浮现奢华播放按钮 */}
                <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 text-black flex items-center justify-center shadow-xl shadow-amber-500/50 scale-75 group-hover:scale-100 transition-transform duration-300">
                        <Play size={20} className="fill-black ml-0.5" />
                    </div>
                </div>

                {/* 右下角快捷收藏按钮 */}
                <button
                    onClick={handleToggleFav}
                    className={`absolute bottom-2.5 right-2.5 z-20 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md border transition-all cursor-pointer ${
                        isFav
                            ? 'bg-pink-600 border-pink-400 text-white opacity-100 scale-105'
                            : 'bg-black/60 hover:bg-black/90 border-white/15 text-white/70 hover:text-white opacity-0 group-hover:opacity-100 hover:scale-110'
                    }`}
                    title={isFav ? '已在私密片单中' : '加入私密收藏'}
                >
                    <Heart size={14} className={isFav ? 'fill-white' : ''} />
                </button>

                {/* 底部播放量与状态 */}
                <div className="absolute bottom-2.5 left-2.5 z-20 flex items-center gap-2 text-[10px] text-white/80 font-medium">
                    <span className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-md border border-white/5">
                        <Eye size={10} className="text-purple-400" />
                        <span>{viewsFormatted}</span>
                    </span>
                </div>
            </div>

            {/* 2. 底部标题与信息区域 */}
            <div className="p-3 sm:p-3.5 flex flex-col justify-between flex-1 space-y-1.5">
                <h3 className="text-xs sm:text-sm font-bold text-white/90 group-hover:text-purple-300 line-clamp-2 leading-snug transition-colors">
                    {cleanTitle || title}
                </h3>

                <div className="flex items-center justify-between pt-1 text-[11px] text-white/40">
                    <span className="text-amber-400/90 font-mono font-bold">
                        {videoCode || '4K MAX'}
                    </span>
                    <span className="text-[10px] text-white/30">
                        极速秒播
                    </span>
                </div>
            </div>
        </div>
    );
}
