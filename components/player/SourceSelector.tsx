'use client';

/**
 * SourceSelector - Component for selecting video source in player
 * Following Liquid Glass design system
 * Features:
 * 1. Compact Capsule Chips Grid (2~3 columns, saves 85% space)
 * 2. 4K (2160P) UHD & 1080P Blu-ray Badges
 * 3. Segmented view: Default top 6 Golden Lines + Smooth Expand/Collapse for all 35 lines
 * 4. Active playing state with glowing pulse
 */

import { useState, useMemo } from 'react';
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
    remarks?: string;
}

interface SourceSelectorProps {
    sources: SourceInfo[];
    currentSource: string;
    onSourceChange: (source: SourceInfo) => void;
    className?: string;
    embedded?: boolean; // When true, renders without outer Card wrapper for seamless embedding
}

// 4K (2160P) UHD 极致原画专线字典
const FOUR_K_SOURCES = new Set([
    'hongniu', 'baofeng', 'json1080', 'suoni', 'haohua_4k', 'blue_4k', 'laosiji_4k'
]);

// 1080P 蓝光秒播高码率专线字典
const HD_BLURAY_SOURCES = new Set([
    'jisu', 'guangsu', 'xinlang', 'wujin', 'liangzi', 'dytt',
    'feifan', 'huya', 'haitun', 'ruyi', 'zuida', 'subo', 'youku'
]);

// 黄金线路优先级权重（严格按金字塔梯队分级）
const GOLDEN_PRIORITY_MAP: Record<string, number> = {
    // === 第一梯队：超一线商业骨干秒播大源（秒开率 98%+，永远排在最前） ===
    'guangsu': 1,   // 光速资源
    'jisu': 2,      // 极速资源
    'xinlang': 3,   // 新浪资源
    'baofeng': 4,   // 暴风资源 (4K/蓝光)
    'wujin': 5,     // 无尽资源

    // === 第二梯队：优质中型主流高码率专线 ===
    'liangzi': 10,  // 量子资源
    'dytt': 11,     // 电影天堂
    'json1080': 12, // 1080JSON
    'hongniu': 13,  // 红牛资源 (4K)
    'suoni': 14,    // 索尼专线 (4K)
    'huya': 15,     // 虎牙资源
    'haitun': 16,   // 海豚资源
    'feifan': 17,   // 非凡资源
    'ruyi': 18,     // 如意资源
    'zuida': 19,    // 最大资源
    'subo': 20,     // 速博资源
    'jinying': 21,  // 金鹰点播
    'youku': 22,    // 优酷资源
    'ikun': 23,     // iKun资源
    'lezi': 24,     // 乐子资源

    // === 第三梯队：备用专线与尾部小源（容易偶发拥堵或失效，沉底排列） ===
    'zy360': 30,    // 360资源
    'dbm3u8': 31,   // 豆瓣专线
    'kcm3u8': 32,   // 快车专线
    'sdm3u8': 33,   // 闪电专线
    'tpm3u8': 34,   // 淘片专线
    'modu': 35,     // 魔都资源
    'jingyu': 36,   // 鲸鱼资源
    'moduys': 37,   // 魔都影视
    'modu_dm': 38,  // 魔都动漫
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

export function getCleanSourceKey(source: string): string {
    if (source.startsWith('ikanbot_')) {
        let flag = source.slice('ikanbot_'.length);
        const underscoreIdx = flag.lastIndexOf('_');
        if (underscoreIdx !== -1) {
            const potentialNum = flag.slice(underscoreIdx + 1);
            if (!isNaN(Number(potentialNum))) {
                flag = flag.slice(0, underscoreIdx);
            }
        }
        return FLAG_TO_SOURCE_KEY[flag] || flag;
    }
    return source;
}

export function SourceSelector({
    sources,
    currentSource,
    onSourceChange,
    className = '',
    embedded = false,
}: SourceSelectorProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    // 智能排序与强力去重：同一个 source 仅保留 1 个权威项，且第一梯队（光速/极速/新浪/暴风/无尽）永远锁定在 1~5 位
    const sortedSources = useMemo(() => {
        // 第一道核心防线：对传入数据进行去重，杜绝同一个 source 出现多次（如多个重复的海豚资源）
        const seen = new Set<string>();
        const uniqueList: SourceInfo[] = [];
        for (const s of sources) {
            if (!s || !s.source) continue;
            if (!seen.has(s.source)) {
                seen.add(s.source);
                uniqueList.push(s);
            }
        }

        return uniqueList.sort((a, b) => {
            const cleanA = getCleanSourceKey(a.source);
            const cleanB = getCleanSourceKey(b.source);

            const priorityA = a.source === 'ikanbot' ? 0.5 : (GOLDEN_PRIORITY_MAP[cleanA] ?? 999);
            const priorityB = b.source === 'ikanbot' ? 0.5 : (GOLDEN_PRIORITY_MAP[cleanB] ?? 999);

            if (priorityA !== priorityB) {
                return priorityA - priorityB;
            }

            return 0;
        });
    }, [sources]);

    // 当前选中的线路索引
    const currentIndex = sortedSources.findIndex(s => s.source === currentSource);

    // 默认展示数量（前 6 条黄金线路）
    const DEFAULT_VISIBLE_COUNT = 6;
    const shouldShowExpandButton = sortedSources.length > DEFAULT_VISIBLE_COUNT;

    // 当前可见线路：若已展开，或当前选中线路在第 6 条之后，自动展开以防当前播放项失焦
    const visibleSources = useMemo(() => {
        if (isExpanded || !shouldShowExpandButton) {
            return sortedSources;
        }
        // 如果当前播放线路在 6 条之外，默认至少展示到包含当前线路
        if (currentIndex >= DEFAULT_VISIBLE_COUNT) {
            return sortedSources;
        }
        return sortedSources.slice(0, DEFAULT_VISIBLE_COUNT);
    }, [sortedSources, isExpanded, shouldShowExpandButton, currentIndex]);

    if (sortedSources.length <= 1) {
        return null;
    }

    const content = (
        <div className="space-y-3">
            {/* 顶栏：标题、可用线路数与快捷展开 */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Icons.Layers size={17} className="text-purple-400" />
                    <span className="text-sm sm:text-base font-bold text-(--text-color) tracking-tight">
                        播放线路
                    </span>
                    <Badge variant="primary" className="text-[10px] px-1.5 py-0.5 font-bold">
                        {sortedSources.length} 条可用
                    </Badge>
                </div>

                {shouldShowExpandButton && (
                    <button
                        type="button"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 font-medium cursor-pointer py-1 px-2 rounded-lg hover:bg-white/5"
                    >
                        <span>{isExpanded ? '收起备用' : `全部线路 (${sortedSources.length})`}</span>
                        <Icons.ChevronDown
                            size={14}
                            className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                        />
                    </button>
                )}
            </div>

            {/* 紧凑胶囊网格：PC 3 列，移动端 2~3 列 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {visibleSources.map((source, index) => {
                    const isCurrent = source.source === currentSource;
                    const cleanKey = getCleanSourceKey(source.source);
                    const is4K = FOUR_K_SOURCES.has(cleanKey) ||
                                 source.sourceName?.includes('4K') ||
                                 source.sourceName?.includes('2160') ||
                                 source.sourceName?.includes('红牛') ||
                                 source.sourceName?.includes('暴风');
                    const isBluRay = !is4K && (HD_BLURAY_SOURCES.has(cleanKey) || source.sourceName?.includes('蓝光'));
                    const isTopRecommended = index === 0;

                    return (
                        <button
                            key={`${source.source}-${index}`}
                            type="button"
                            onClick={() => !isCurrent && onSourceChange(source)}
                            className={`
                                relative group flex items-center justify-between px-2.5 py-2 rounded-xl text-left
                                transition-all duration-200 cursor-pointer text-xs font-medium border select-none
                                ${isCurrent
                                    ? 'bg-linear-to-r from-purple-600 to-pink-600 text-white border-purple-400/60 shadow-md shadow-purple-600/30 scale-[1.02] z-10'
                                    : 'bg-(--glass-bg) hover:bg-(--glass-hover) text-(--text-color) border-(--glass-border) hover:border-purple-500/40'
                                }
                            `}
                            title={source.sourceName || source.source}
                        >
                            {/* 左侧：序号与线路名称 */}
                            <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                {isCurrent ? (
                                    <span className="relative flex h-2 w-2 shrink-0">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                                    </span>
                                ) : (
                                    <span className="text-[10px] text-white/40 font-mono shrink-0">
                                        {index + 1}.
                                    </span>
                                )}
                                <span className="truncate font-semibold text-[11px] sm:text-xs">
                                    {source.sourceName || source.source}
                                </span>
                            </div>

                            {/* 右侧徽章（4K / 蓝光 / 首选） */}
                            <div className="flex items-center gap-1 shrink-0 ml-1">
                                {is4K ? (
                                    <span className="text-[9px] font-black px-1.5 py-0.2 bg-amber-400 text-black rounded shadow-xs">
                                        4K
                                    </span>
                                ) : isBluRay ? (
                                    <span className="text-[9px] font-bold px-1.5 py-0.2 bg-sky-500/20 text-sky-300 border border-sky-400/40 rounded">
                                        蓝光
                                    </span>
                                ) : isTopRecommended && !isCurrent ? (
                                    <span className="text-[9px] font-bold px-1 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 rounded">
                                        首选
                                    </span>
                                ) : null}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* 底部折叠切换提示栏（当线路较多且未展开时展示） */}
            {shouldShowExpandButton && !isExpanded && (
                <button
                    type="button"
                    onClick={() => setIsExpanded(true)}
                    className="w-full py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white/80 text-[11px] font-medium transition-all duration-200 flex items-center justify-center gap-1 border border-white/5 cursor-pointer"
                >
                    <span>查看更多备用专线 (还有 {sortedSources.length - DEFAULT_VISIBLE_COUNT} 条)</span>
                    <Icons.ChevronDown size={13} />
                </button>
            )}
        </div>
    );

    if (embedded) {
        return <div id="source-selector-section" className={className}>{content}</div>;
    }

    return (
        <div id="source-selector-section" className={`mt-4 ${className}`}>
            <Card hover={false}>
                {content}
            </Card>
        </div>
    );
}
