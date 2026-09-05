'use client';

/**
 * SourceSelector - Component for selecting video source in player
 * Following Liquid Glass design system
 * Enhanced with 4K (2160P) UHD & 1080P Blu-ray Badges
 */

import { useMemo } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Icons } from '@/components/ui/Icon';

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
    'hongniu', 'baofeng', 'json1080', 'suoni', 'haohua_4k', 'blue_4k'
]);

// 1080P 蓝光秒播高码率专线字典
const HD_BLURAY_SOURCES = new Set([
    'jisu', 'guangsu', 'xinlang', 'wujin', 'liangzi', 'dytt',
    'feifan', 'huya', 'haitun', 'ruyi', 'zuida', 'subo', 'youku'
]);

// 黄金线路优先级权重（完全对齐 ikanbot 首选顺位）
const GOLDEN_PRIORITY_MAP: Record<string, number> = {
    'jisu': 1,      // 极速资源
    'guangsu': 2,   // 光速资源
    'xinlang': 3,   // 新浪资源
    'wujin': 4,     // 无尽资源
    'baofeng': 5,   // 暴风资源
    'liangzi': 6,   // 量子资源
    'dytt': 7,      // 电影天堂
    'json1080': 8,  // 1080JSON
    'huya': 9,      // 虎牙资源
    'haitun': 10,   // 海豚资源
    'feifan': 11,   // 非凡资源
    'hongniu': 12,  // 红牛资源
    'ruyi': 13,     // 如意资源
    'zuida': 14,    // 最大资源
    'subo': 15,     // 速博资源
    'jinying': 16,  // 金鹰点播
    'youku': 17,    // 优酷资源
    'ikun': 18,     // iKun资源
    'lezi': 19,     // 乐子资源
    'zy360': 20,    // 360资源
    'modu': 21,     // 魔都资源
    'jingyu': 22,   // 鲸鱼资源
    'moduys': 23,   // 魔都影视
    'modu_dm': 24,  // 魔都动漫
};

// ikanbot 线路标识映射
const FLAG_TO_SOURCE_KEY: Record<string, string> = {
    'jsm3u8': 'jisu',
    'gsm3u8': 'guangsu',
    'xlm3u8': 'xinlang',
    'wjm3u8': 'wujin',
    'bfzym3u8': 'baofeng',
    'lzm3u8': 'liangzi',
    'dyttm3u8': 'dytt',
    '1080zyk': 'json1080',
    'hym3u8': 'huya',
    'hhm3u8': 'haitun',
    'ffm3u8': 'feifan',
    'hongniu': 'hongniu',
    'rym3u8': 'ruyi',
    'zuidam3u8': 'zuida',
    'subm3u8': 'subo',
    'jinyingm3u8': 'jinying',
    'ukm3u8': 'youku',
    'ikm3u8': 'ikun',
    'iqym3u8': 'lezi',
    '360zy': 'zy360',
    'modu': 'modu',
    'jingyu': 'jingyu',
    'moduys': 'moduys',
    'modu_dm': 'modu_dm',
    'snm3u8': 'suoni',
};

function getCleanSourceKey(source: string): string {
    if (source.startsWith('ikanbot_')) {
        const flag = source.slice('ikanbot_'.length);
        return FLAG_TO_SOURCE_KEY[flag] || flag;
    }
    return source;
}

export function SourceSelector({
    sources,
    currentSource,
    onSourceChange,
    className = '',
}: SourceSelectorProps) {
    // 智能排序：优先将 4K (2160P) 专线排在前面，其余严格按照 ikanbot 黄金骨干顺位排列，避免网络 Ping 抖动打乱黄金源
    const sortedSources = useMemo(() => {
        return [...sources].sort((a, b) => {
            const cleanA = getCleanSourceKey(a.source);
            const cleanB = getCleanSourceKey(b.source);
            const isA4K = FOUR_K_SOURCES.has(cleanA) || a.sourceName?.includes('4K') || a.sourceName?.includes('2160');
            const isB4K = FOUR_K_SOURCES.has(cleanB) || b.sourceName?.includes('4K') || b.sourceName?.includes('2160');

            if (isA4K && !isB4K) return -1;
            if (!isA4K && isB4K) return 1;

            const priorityA = a.source === 'ikanbot' ? 0.5 : (GOLDEN_PRIORITY_MAP[cleanA] ?? 999);
            const priorityB = b.source === 'ikanbot' ? 0.5 : (GOLDEN_PRIORITY_MAP[cleanB] ?? 999);
            if (priorityA !== priorityB) {
                return priorityA - priorityB;
            }

            return 0;
        });
    }, [sources]);

    if (sources.length <= 1) {
        return null;
    }

    return (
        <Card hover={false} className={`mt-6 ${className}`}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-(--text-color) flex items-center gap-2">
                    <Icons.Layers size={20} className="sm:w-6 sm:h-6 text-purple-400" />
                    <span>多线路选择 · 黄金骨干专线</span>
                    <Badge variant="primary">{sources.length} 条可用</Badge>
                </h3>
                <span className="text-xs text-white/50 hidden sm:inline-block">
                    首选线路 1，遇卡顿可直接切换其他备用线路
                </span>
            </div>

            <div className="space-y-2 max-h-85 overflow-y-auto pr-1">
                {sortedSources.map((source, index) => {
                    const isCurrent = source.source === currentSource;
                    const cleanKey = getCleanSourceKey(source.source);
                    const is4K = FOUR_K_SOURCES.has(cleanKey) ||
                                 source.sourceName?.includes('4K') ||
                                 source.sourceName?.includes('2160') ||
                                 source.sourceName?.includes('红牛') ||
                                 source.sourceName?.includes('暴风');
                    const isBluRay = !is4K && (HD_BLURAY_SOURCES.has(cleanKey) || source.sourceName?.includes('蓝光'));

                    return (
                        <button
                            key={`${source.source}-${index}`}
                            onClick={() => !isCurrent && onSourceChange(source)}
                            className={`
                                w-full p-3 rounded-2xl text-left transition-all duration-200
                                flex items-center gap-3 cursor-pointer
                                ${isCurrent
                                    ? 'bg-linear-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/30 scale-[1.01]'
                                    : 'bg-(--glass-bg) hover:bg-(--glass-hover) text-(--text-color) border border-(--glass-border) hover:border-purple-500/30'
                                }
                            `}
                            aria-current={isCurrent ? 'true' : undefined}
                        >
                            {/* 缩略图 */}
                            {source.pic && (
                                <div className="w-12 h-16 rounded-xl overflow-hidden shrink-0 bg-black/20 border border-white/10">
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
                                    <span className="font-bold truncate">
                                        线路 {index + 1} · {source.sourceName || source.source}
                                    </span>

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

                                    {/* 推荐首选标识 */}
                                    {index === 0 && (
                                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 font-bold text-[10px] rounded-md shrink-0">
                                            🚀 推荐首选
                                        </span>
                                    )}
                                </div>

                                <div className="mt-1 flex items-center gap-2">
                                    <span className="text-[11px] opacity-60">
                                        {is4K
                                            ? '原生 4K UHD 极清画质流'
                                            : isBluRay
                                            ? '1080P 蓝光高码率 · 稳定直连'
                                            : index < 3
                                            ? '极速 CDN 直连 · 秒开'
                                            : '高速稳定备用骨干线路'}
                                    </span>
                                </div>
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
                                    className={`shrink-0 ${
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
