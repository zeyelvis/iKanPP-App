'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Film, Sparkles, Tv, MonitorPlay, AlertCircle } from 'lucide-react';
import { VideoPlayer } from '@/components/player/VideoPlayer';

interface HuarenLivePlayerProps {
    vodId: string;
    title: string;
    totalEpisodes?: number;
    initialEpisode?: number;
}

interface DiscoveredStream {
    name: string;
    url: string;
}

export function HuarenLivePlayer({
    vodId,
    title,
    totalEpisodes = 40,
    initialEpisode = 1,
}: HuarenLivePlayerProps) {
    // 线路 1: 高性能, 线路 2: 投屏版, 线路 3: 超清4K[限免]
    const [currentLine, setCurrentLine] = useState<number>(1);
    const [currentEpisode, setCurrentEpisode] = useState<number>(initialEpisode);
    const [playUrl, setPlayUrl] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const playerTimeRef = useRef(0);

    // 搜索并解析该影片在各线路的真实播放流
    useEffect(() => {
        let isCancelled = false;
        setLoading(true);
        setError('');

        const cleanTitle = title.replace(/[《》【】\[\]（）()]/g, ' ').replace(/\s+/g, ' ').trim();

        // 请求聚合搜索专线，并发调度各大影视专线
        fetch(`/api/search-parallel?q=${encodeURIComponent(cleanTitle)}`)
            .then(async (res) => {
                if (!res.ok) throw new Error('网络请求失败');
                const reader = res.body?.getReader();
                if (!reader) throw new Error('流读取失败');

                const decoder = new TextDecoder();
                let buffer = '';
                const streamsByLine: Record<number, string[]> = { 1: [], 2: [], 3: [] };

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || '';

                    for (const line of lines) {
                        if (!line.startsWith('data: ')) continue;
                        try {
                            const data = JSON.parse(line.slice(6));
                            if (data.type === 'videos' && Array.isArray(data.videos) && data.videos.length > 0) {
                                for (const v of data.videos) {
                                    if (!v.vod_play_url) continue;
                                    // 分割集数
                                    const epPairs = v.vod_play_url.split('#');
                                    const epUrls = epPairs.map((pair: string) => {
                                        const parts = pair.split('$');
                                        return parts.length > 1 ? parts[1] : parts[0];
                                    }).filter((u: string) => u && u.startsWith('http'));

                                    if (epUrls.length > 0) {
                                        if (streamsByLine[1].length === 0) streamsByLine[1] = epUrls;
                                        else if (streamsByLine[2].length === 0) streamsByLine[2] = epUrls;
                                        else if (streamsByLine[3].length === 0) streamsByLine[3] = epUrls;
                                    }
                                }
                            }
                        } catch {
                            // 忽略单个解析异常
                        }
                    }
                }

                if (!isCancelled) {
                    const targetList = streamsByLine[currentLine] || streamsByLine[1] || streamsByLine[2] || streamsByLine[3] || [];
                    const epIndex = Math.min(currentEpisode - 1, Math.max(0, targetList.length - 1));
                    const selectedUrl = targetList[epIndex];

                    if (selectedUrl) {
                        setPlayUrl(selectedUrl);
                        setLoading(false);
                    } else {
                        // 兜底流
                        const fallbackList = streamsByLine[1] || [];
                        if (fallbackList[0]) {
                            setPlayUrl(fallbackList[0]);
                            setLoading(false);
                        } else {
                            setError('该线路正在调度备用节点，请稍候或切换线路...');
                            setLoading(false);
                        }
                    }
                }
            })
            .catch((err) => {
                if (!isCancelled) {
                    setError('流解析异常，正在自动重试...');
                    setLoading(false);
                }
            });

        return () => {
            isCancelled = true;
        };
    }, [title, currentLine, currentEpisode]);

    // 切换线路
    const handleSwitchLine = (line: number) => {
        if (line === currentLine) return;
        setCurrentLine(line);
    };

    // 切换集数
    const handleSelectEpisode = (ep: number) => {
        if (ep === currentEpisode) return;
        setCurrentEpisode(ep);
    };

    const episodeList = Array.from({ length: Math.max(1, totalEpisodes) }, (_, i) => i + 1);

    return (
        <div className="space-y-6">
            {/* 1. 播放器顶部：三大官方视频线路 Tab */}
            <div className="bg-[#1C1D24] p-3 sm:p-4 rounded-2xl border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm font-bold text-white tracking-wide">目标站专线直解</span>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">
                        超清蓝光直出 · 免广告
                    </span>
                </div>

                {/* 三大线路切换按钮 */}
                <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/5 overflow-x-auto">
                    <button
                        onClick={() => handleSwitchLine(1)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            currentLine === 1
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'text-white/60 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <Film size={13} />
                        <span>高性能</span>
                    </button>

                    <button
                        onClick={() => handleSwitchLine(2)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            currentLine === 2
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'text-white/60 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <Tv size={13} />
                        <span>投屏版</span>
                    </button>

                    <button
                        onClick={() => handleSwitchLine(3)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            currentLine === 3
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black shadow-md'
                                : 'text-white/60 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <Sparkles size={13} />
                        <span>超清4K[限免]</span>
                    </button>
                </div>
            </div>

            {/* 2. 核心视频播放器（内置全功能原生 HTML5 / Hls.js 播放器） */}
            <div className="relative aspect-video w-full rounded-2xl bg-black overflow-hidden shadow-2xl border border-white/10">
                {loading ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-black/80 space-y-3">
                        <div className="w-10 h-10 rounded-full border-3 border-rose-500 border-t-transparent animate-spin" />
                        <p className="text-sm font-medium text-white/80">
                            正在直连 {currentLine === 1 ? '高性能' : currentLine === 2 ? '投屏版' : '超清4K'} 专线...
                        </p>
                    </div>
                ) : error && !playUrl ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-black/90 p-6 text-center space-y-3">
                        <AlertCircle size={32} className="text-amber-400" />
                        <p className="text-sm text-white/80">{error}</p>
                        <button
                            onClick={() => handleSwitchLine(currentLine === 1 ? 2 : 1)}
                            className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white transition-all cursor-pointer shadow-lg"
                        >
                            切换备用线路
                        </button>
                    </div>
                ) : (
                    <VideoPlayer
                        playUrl={playUrl}
                        videoId={vodId}
                        currentEpisode={currentEpisode - 1}
                        onBack={() => window.history.back()}
                        totalEpisodes={totalEpisodes}
                        onNextEpisode={() => {
                            if (currentEpisode < totalEpisodes) {
                                setCurrentEpisode((prev) => prev + 1);
                            }
                        }}
                        isReversed={false}
                        isPremium={false}
                        videoTitle={title}
                        episodeName={`第 ${currentEpisode} 集`}
                        externalTimeRef={playerTimeRef}
                    />
                )}
            </div>

            {/* 3. 选集列表 */}
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
                            当前正在播放：第 {currentEpisode} 集 · {currentLine === 1 ? '高性能' : currentLine === 2 ? '投屏版' : '超清4K[限免]'}
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
