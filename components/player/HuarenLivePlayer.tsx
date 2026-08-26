'use client';

import React, { useState } from 'react';
import { Film, Sparkles, Tv, MonitorPlay } from 'lucide-react';

interface HuarenLivePlayerProps {
    vodId: string;
    title: string;
    totalEpisodes?: number;
    initialEpisode?: number;
    initialSid?: number;
}

export function HuarenLivePlayer({
    vodId,
    title,
    totalEpisodes = 40,
    initialEpisode = 1,
    initialSid = 1,
}: HuarenLivePlayerProps) {
    // 1: 高性能 (ARTA), 2: 投屏版 (DPA), 3: 超清4K[限免] (ARTA4K)
    const [currentSid, setCurrentSid] = useState<number>(initialSid);
    const [currentEpisode, setCurrentEpisode] = useState<number>(initialEpisode);
    const [iframeKey, setIframeKey] = useState<number>(0);

    // 经过反向代理剥离 X-Frame-Options 后的目标站原生播放器地址
    const playerUrl = `/api/huaren-embed?episode=${vodId}-${currentSid}-${currentEpisode}`;

    // 切换线路
    const handleSwitchSource = (sid: number) => {
        if (sid === currentSid) return;
        setCurrentSid(sid);
        setIframeKey((prev) => prev + 1);
    };

    // 切换集数
    const handleSelectEpisode = (ep: number) => {
        if (ep === currentEpisode) return;
        setCurrentEpisode(ep);
        setIframeKey((prev) => prev + 1);
    };

    // 生成集数数组 (如果是电影则只有1集，如果是电视剧则根据实际集数生成)
    const episodeList = Array.from({ length: Math.max(1, totalEpisodes) }, (_, i) => i + 1);

    return (
        <div className="space-y-6">
            {/* 1. 播放器顶部：三大官方视频源切换 Tab */}
            <div className="bg-[#1C1D24] p-3 sm:p-4 rounded-2xl border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm font-bold text-white tracking-wide">目标站官方播放源</span>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/30">
                        Huaren.live 原生极速
                    </span>
                </div>

                {/* 三大线路切换按钮 */}
                <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/5 overflow-x-auto">
                    <button
                        onClick={() => handleSwitchSource(1)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            currentSid === 1
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'text-white/60 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <Film size={13} />
                        <span>高性能</span>
                    </button>

                    <button
                        onClick={() => handleSwitchSource(2)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            currentSid === 2
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'text-white/60 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <Tv size={13} />
                        <span>投屏版</span>
                    </button>

                    <button
                        onClick={() => handleSwitchSource(3)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            currentSid === 3
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black shadow-md'
                                : 'text-white/60 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <Sparkles size={13} />
                        <span>超清4K[限免]</span>
                    </button>
                </div>
            </div>

            {/* 2. 核心视频播放器 iframe 容器 */}
            <div className="relative aspect-video w-full rounded-2xl bg-black overflow-hidden shadow-2xl border border-white/10">
                <iframe
                    key={iframeKey}
                    src={playerUrl}
                    className="w-full h-full border-0"
                    allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                    allowFullScreen
                />
            </div>

            {/* 3. 选集列表（电视剧多集时显示） */}
            {totalEpisodes > 1 && (
                <div className="bg-[#1C1D24] p-4 sm:p-6 rounded-2xl border border-white/[0.06] shadow-xl space-y-3">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <div className="flex items-center gap-2">
                            <MonitorPlay size={16} className="text-rose-500" />
                            <h3 className="text-sm sm:text-base font-bold text-white">
                                选集播放 ({totalEpisodes}集全)
                            </h3>
                        </div>
                        <span className="text-xs text-white/40">
                            正在播放：第 {currentEpisode} 集
                        </span>
                    </div>

                    <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2 pt-1 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 pr-1">
                        {episodeList.map((ep) => {
                            const isActive = ep === currentEpisode;
                            return (
                                <button
                                    key={ep}
                                    onClick={() => handleSelectEpisode(ep)}
                                    className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                        isActive
                                            ? 'bg-rose-600 text-white shadow-lg scale-105'
                                            : 'bg-white/[0.04] text-white/70 hover:bg-white/10 hover:text-white border border-white/5'
                                    }`}
                                >
                                    {ep < 10 ? `0${ep}` : ep}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
