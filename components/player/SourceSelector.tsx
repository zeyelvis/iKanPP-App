'use client';

/**
 * SourceSelector - Component for selecting video source in player
 * Following Liquid Glass design system
 * Enhanced with 4K (2160P) UHD & 1080P Blu-ray Badges
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Icons } from '@/components/ui/Icon';
import { LatencyBadge } from '@/components/ui/LatencyBadge';
import { Button } from '@/components/ui/Button';

export interface SourceInfo {
    id: string | number;
    source: string;
    sourceName?: string;
    latency?: number;
    pic?: string;
    typeName?: string;
}

interface SourceSelectorProps {
    sources: SourceInfo[];
    currentSource: string;
    onSourceChange: (source: SourceInfo) => void;
    className?: string;
}

// 4K (2160P) UHD 极致原画专线字典
const FOUR_K_SOURCES = new Set([
    'hongniu', 'hongniu3', 'haohua_4k', 'blue_4k', 'suoni', 'suoni_sd',
    'baofeng', 'baofeng_app', 'json1080', 'laosiji_4k', 'midnight_4k', 'yutu', 'hsck', 'jingpin'
]);

// 1080P 蓝光秒播高码率专线字典
const HD_BLURAY_SOURCES = new Set([
    'feifan', 'feifan_api', 'feifan1', 'guangsu', 'guangsu_http', 'wolong', 'wolong_cj',
    'zuida', 'zuida_db', 'baidu', 'jisu', 'liangzi', 'kuaiche', 'leba', 'ck', 'tantan', 'sejie'
]);

export function SourceSelector({
    sources,
    currentSource,
    onSourceChange,
    className = '',
}: SourceSelectorProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [latencies, setLatencies] = useState<Record<string, number>>({});

    // 智能排序：优先将 4K (2160P) 线路排在前面，其次按延迟排序
    const sortedSources = useMemo(() => {
        return [...sources].sort((a, b) => {
            const isA4K = FOUR_K_SOURCES.has(a.source) || a.sourceName?.includes('4K') || a.sourceName?.includes('2160');
            const isB4K = FOUR_K_SOURCES.has(b.source) || b.sourceName?.includes('4K') || b.sourceName?.includes('2160');

            if (isA4K && !isB4K) return -1;
            if (!isA4K && isB4K) return 1;

            const latA = latencies[a.source] ?? a.latency ?? Infinity;
            const latB = latencies[b.source] ?? b.latency ?? Infinity;
            return latA - latB;
        });
    }, [sources, latencies]);

    // 刷新所有线路的实时延迟
    const refreshLatencies = useCallback(async () => {
        setIsLoading(true);

        const results = await Promise.all(
            sources.map(async (source) => {
                try {
                    const response = await fetch('/api/ping', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ url: source.source }),
                    });

                    if (response.ok) {
                        const data = await response.json();
                        return { source: source.source, latency: data.latency };
                    }
                } catch {}
                return { source: source.source, latency: undefined };
            })
        );

        const newLatencies: Record<string, number> = {};
        results.forEach(({ source, latency }) => {
            if (latency !== undefined) {
                newLatencies[source] = latency;
            }
        });

        setLatencies(newLatencies);
        setIsLoading(false);
    }, [sources]);

    // 初始化延迟数据
    useEffect(() => {
        const initial: Record<string, number> = {};
        sources.forEach(s => {
            if (s.latency !== undefined) {
                initial[s.source] = s.latency;
            }
        });
        setLatencies(initial);
    }, [sources]);

    if (sources.length <= 1) {
        return null;
    }

    return (
        <Card hover={false} className={`mt-6 ${className}`}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-[var(--text-color)] flex items-center gap-2">
                    <Icons.Layers size={20} className="sm:w-6 sm:h-6 text-purple-400" />
                    <span>多线路选择 · 4K/蓝光智能选线</span>
                    <Badge variant="primary">{sources.length}</Badge>
                </h3>
                <Button
                    variant="secondary"
                    onClick={refreshLatencies}
                    disabled={isLoading}
                    className="flex items-center gap-1.5 text-sm px-3 py-1.5 cursor-pointer"
                >
                    <Icons.RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                    刷新延迟
                </Button>
            </div>

            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                {sortedSources.map((source, index) => {
                    const isCurrent = source.source === currentSource;
                    const latency = latencies[source.source] ?? source.latency;
                    const is4K = FOUR_K_SOURCES.has(source.source) ||
                                 source.sourceName?.includes('4K') ||
                                 source.sourceName?.includes('2160') ||
                                 source.sourceName?.includes('红牛') ||
                                 source.sourceName?.includes('暴风') ||
                                 source.sourceName?.includes('索尼') ||
                                 source.sourceName?.includes('老司机');
                    const isBluRay = !is4K && (HD_BLURAY_SOURCES.has(source.source) || source.sourceName?.includes('蓝光'));

                    return (
                        <button
                            key={`${source.source}-${index}`}
                            onClick={() => !isCurrent && onSourceChange(source)}
                            className={`
                                w-full p-3 rounded-2xl text-left transition-all duration-200
                                flex items-center gap-3 cursor-pointer
                                ${isCurrent
                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/30 scale-[1.01]'
                                    : 'bg-[var(--glass-bg)] hover:bg-[var(--glass-hover)] text-[var(--text-color)] border border-[var(--glass-border)] hover:border-purple-500/30'
                                }
                            `}
                            aria-current={isCurrent ? 'true' : undefined}
                        >
                            {/* 缩略图 */}
                            {source.pic && (
                                <div className="w-12 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-black/20 border border-white/10">
                                    <Image
                                        src={source.pic}
                                        alt=""
                                        width={48}
                                        height={64}
                                        className="w-full h-full object-cover"
                                        unoptimized
                                        referrerPolicy="no-referrer"
                                        onError={(e) => {
                                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}

                            {/* 线路名称与 4K / 蓝光画质角标 */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 font-medium text-sm sm:text-base truncate">
                                    <span className="font-bold truncate">{source.sourceName || source.source}</span>

                                    {/* 4K 2160P 黄金徽标 */}
                                    {is4K && (
                                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-amber-400 text-black font-black text-[10px] rounded-md shadow-md shadow-amber-500/40 border border-amber-300 shrink-0">
                                            ⚡ 4K VIP (2160P)
                                        </span>
                                    )}

                                    {/* 1080P 蓝光原画徽标 */}
                                    {isBluRay && (
                                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-sky-500/20 text-sky-300 border border-sky-400/50 font-bold text-[10px] rounded-md shrink-0">
                                            💎 1080P 蓝光
                                        </span>
                                    )}

                                    {/* 极速秒播标识 */}
                                    {latency !== undefined && latency < 200 && (
                                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 font-bold text-[10px] rounded-md shrink-0">
                                            🚀 秒播
                                        </span>
                                    )}
                                </div>

                                {latency !== undefined && (
                                    <div className="mt-1 flex items-center gap-2">
                                        <LatencyBadge latency={latency} />
                                        <span className="text-[11px] opacity-60">
                                            {is4K ? '原生 4K UHD 极清画质流' : isBluRay ? '1080P 蓝光高码率' : '高速稳定 CDN 直连'}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* 当前播放指示器 */}
                            {isCurrent && (
                                <div className="flex items-center gap-1 text-xs font-bold bg-white/20 px-2.5 py-1 rounded-full shrink-0">
                                    <Icons.Play size={13} className="fill-white" />
                                    <span>播放中</span>
                                </div>
                            )}

                            {/* 排行标 */}
                            {!isCurrent && index < 3 && (
                                <Badge
                                    variant="secondary"
                                    className={`flex-shrink-0 ${
                                        index === 0
                                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 font-black'
                                            : index === 1
                                            ? 'bg-sky-500/20 text-sky-400 border-sky-500/40 font-bold'
                                            : 'bg-purple-500/20 text-purple-400 border-purple-500/40'
                                    }`}
                                >
                                    #{index + 1}
                                </Badge>
                            )}
                        </button>
                    );
                })}
            </div>
        </Card>
    );
}
