'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Play, Eye, ThumbsUp, Sparkles, Copy, Check, Heart } from 'lucide-react';

interface JableVideoCardProps {
    video: {
        vod_id: string | number;
        vod_name: string;
        video_code?: string;
        vod_pic?: string;
        vod_remarks?: string;
        vod_duration?: string;
        duration?: string;
        views?: string;
        likes?: string;
        rating?: number;
        type_name?: string;
        vod_year?: string;
        vod_actor?: string;
    };
    onClick: () => void;
    index?: number;
    rankBadge?: number;
}

export function JableVideoCard({ video, onClick, index, rankBadge }: JableVideoCardProps) {
    const [imgError, setImgError] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isFavorited, setIsFavorited] = useState(false);

    const title = video.vod_name || '高清影视大片';

    // 提取番号（优先真实字段，次选智能正则提取）
    const videoCode = video.video_code || (title.match(/([A-Za-z0-9]{2,8}[-_][0-9]{3,8}|FC2[-_]PPV[-_][0-9]{5,8}|T28[-_][0-9]{3,5})/i)?.[0]?.toUpperCase() ?? null);

    // 清理标题展示（去除冗余标签）
    const cleanTitle = title.replace(/^(【[^】]+】|\[[^\]]+\]|\([^\)]+\))/g, '').trim();

    // 智能 CDN 代理地址（解决第三方防盗链与慢速直连）
    const proxiedPic = video.vod_pic?.startsWith('http')
        ? `/api/img-proxy?url=${encodeURIComponent(video.vod_pic)}`
        : video.vod_pic;

    // 真实或智能模拟的 Jable 播放数据与时长
    const mockViews = Math.floor(10000 + (Math.sin((Number(video.vod_id) || (index ?? 1)) * 99) * 0.5 + 0.5) * 250000);
    const viewsText = video.views || (mockViews > 10000 ? `${(mockViews / 10000).toFixed(1)}万` : `${mockViews}`);
    const displayRating = video.likes ? video.likes.replace('%', '') : String(video.rating || Math.floor(92 + ((Number(video.vod_id) || 1) % 8)));
    const isChineseSub = title.includes('中文字幕') || title.includes('中字') || video.type_name?.includes('中字');
    const is4K = title.includes('4K') || title.includes('原画') || title.includes('蓝光');
    const isUncensored = title.includes('无码') || title.includes('步兵') || title.includes('FC2');

    // 复制番号
    const handleCopyCode = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!videoCode) return;
        navigator.clipboard.writeText(videoCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // 收藏点击
    const handleFavorite = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsFavorited(!isFavorited);
    };

    return (
        <div
            onClick={onClick}
            className="group relative flex flex-col rounded-2xl bg-[#0E0F17] border border-white/5 hover:border-purple-500/50 shadow-md hover:shadow-2xl hover:shadow-purple-950/40 transition-all duration-300 cursor-pointer overflow-hidden hover:-translate-y-1"
        >
            {/* 1. 视频封面与专业角标 */}
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-900">
                {!imgError && proxiedPic ? (
                    <Image
                        src={proxiedPic}
                        alt={cleanTitle}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        unoptimized
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-purple-950/20 text-white/30 text-xs p-2 text-center">
                        <Sparkles size={20} className="text-purple-400 mb-1" />
                        <span>爱看片片 HD</span>
                    </div>
                )}

                {/* 悬停播放暗黑蒙版 */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white shadow-xl shadow-purple-600/40 group-hover:scale-110 active:scale-95 transition-transform">
                        <Play size={20} className="fill-white ml-0.5" />
                    </div>
                </div>

                {/* 右上角快速收藏按钮 */}
                <button
                    onClick={handleFavorite}
                    className={`absolute top-2 right-2 z-20 w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-md transition-all cursor-pointer ${
                        isFavorited
                            ? 'bg-rose-500 text-white'
                            : 'bg-black/40 text-white/70 hover:text-white hover:bg-black/70'
                    }`}
                    title={isFavorited ? '已收藏' : '加入收藏'}
                    aria-label="收藏"
                >
                    <Heart size={14} className={isFavorited ? 'fill-white' : ''} />
                </button>

                {/* 排行榜角标（Top 1 ~ 3） */}
                {rankBadge !== undefined && (
                    <div className="absolute top-2 left-2 z-10">
                        <span
                            className={`px-2 py-0.5 rounded-lg text-xs font-black shadow-lg ${
                                rankBadge === 1
                                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black'
                                    : rankBadge === 2
                                    ? 'bg-gradient-to-r from-slate-200 to-zinc-400 text-black'
                                    : rankBadge === 3
                                    ? 'bg-gradient-to-r from-amber-600 to-orange-700 text-white'
                                    : 'bg-black/70 text-white border border-white/20'
                            }`}
                        >
                            TOP {rankBadge}
                        </span>
                    </div>
                )}

                {/* 左下角：中文字幕 / 无码 / 4K 高亮标签 */}
                <div className="absolute bottom-2 left-2 flex items-center gap-1 z-10">
                    {isChineseSub && (
                        <span className="px-1.5 py-0.2 rounded-md bg-emerald-500 text-black text-[10px] font-black shadow-md tracking-tight">
                            中文字幕
                        </span>
                    )}
                    {isUncensored && (
                        <span className="px-1.5 py-0.2 rounded-md bg-blue-600 text-white text-[10px] font-black shadow-md">
                            无码
                        </span>
                    )}
                    {is4K && (
                        <span className="px-1.5 py-0.2 rounded-md bg-amber-500 text-black text-[10px] font-black shadow-md">
                            4K
                        </span>
                    )}
                </div>

                {/* 右下角：时长 / 备注角标 */}
                <div className="absolute bottom-2 right-2 z-10">
                    <span className="px-1.5 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-white/90 text-[10px] font-bold tracking-tight border border-white/10">
                        {video.vod_remarks || video.vod_duration || 'HD 高清'}
                    </span>
                </div>
            </div>

            {/* 2. 视频信息与元数据 */}
            <div className="p-3 flex flex-col flex-1 justify-between">
                {/* 番号高亮与复制 */}
                {videoCode && (
                    <div className="mb-1 flex items-center justify-between">
                        <button
                            onClick={handleCopyCode}
                            className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-black tracking-wider bg-purple-500/15 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 transition-colors cursor-pointer"
                            title="点击复制番号"
                        >
                            {videoCode}
                            {copied ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} className="text-purple-400/60" />}
                        </button>

                        {video.vod_actor && (
                            <span className="text-[10px] text-pink-300/80 truncate max-w-28 font-medium">
                                {video.vod_actor.split(',')[0]}
                            </span>
                        )}
                    </div>
                )}

                {/* 标题 */}
                <h4 className="text-xs sm:text-sm font-bold text-white/90 group-hover:text-purple-300 line-clamp-2 leading-snug transition-colors mb-2">
                    {cleanTitle}
                </h4>

                {/* 底部互动指标：播放量 + 点赞好评率 */}
                <div className="flex items-center justify-between text-[11px] text-white/40 pt-1 border-t border-white/5">
                    <span className="flex items-center gap-1">
                        <Eye size={12} className="text-purple-400/80" />
                        {viewsText} 播放
                    </span>
                    <span className="flex items-center gap-1 text-emerald-400/90 font-medium">
                        <ThumbsUp size={11} />
                        {displayRating}%
                    </span>
                </div>
            </div>
        </div>
    );
}
