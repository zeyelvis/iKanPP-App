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
    'hongniu', 'baofeng', 'juliang', 'json1080', 'suoni', 'haohua_4k', 'blue_4k', 'laosiji_4k'
]);

// 1080P 蓝光秒播高码率专线字典
const HD_BLURAY_SOURCES = new Set([
    'jisu', 'guangsu', 'juliang', 'xinlang', 'wujin', 'liangzi', 'dytt',
    'feifan', 'huya', 'haitun', 'ruyi', 'zuida', 'subo', 'youku'
]);

// 黄金线路优先级权重（严格按金字塔梯队分级，对齐全站最新健康骨干源标准）
const GOLDEN_PRIORITY_MAP: Record<string, number> = {
    // === 第一梯队：全量 443 端口纯净切片与数百万海量热播大源（CORS 100% 开放，国内极速秒开首选） ===
    'baofeng': 0,   // 暴风资源 (国内目前访问速度最快，多线CDN秒播首选)
    'juliang': 1,   // 巨量资源 (纯净2.0切片，香港Anycast极速，4K/短剧秒播)
    'guangsu': 2,   // 光速资源 (数百万海量新热影视第一大站，秒播首选)
    'wujin': 3,     // 无尽资源 (443纯净源，老片/动画秒播首选)
    'zuida': 4,     // 最大资源 (443纯净源，经典/新剧兼备)
    'jisu': 5,      // 极速资源 (443纯净源)
    'xinlang': 6,   // 新浪资源 (443纯净源)
    'modu': 7,      // 魔都资源 (热播大站)
    'zy360': 8,     // 360资源 (独播大站)

    // === 第二梯队：优质主流高码率专线（1080P/4K，部分节点有防盗链策略） ===
    'json1080': 9,  // 1080JSON
    'feifan': 10,   // 非凡资源
    'dytt': 11,     // 电影天堂
    'liangzi': 12,  // 量子资源
    'hongniu': 13,  // 红牛资源 (4K)
    'huya': 14,     // 虎牙资源
    'haitun': 15,   // 海豚资源
    'lezi': 16,     // 乐子资源
    'ruyi': 17,     // 如意资源
    'modu_dm': 18,  // 魔都动漫
    'moduys': 19,   // 魔都影视

    // === 第三梯队：备用线路（部分切片挂在非标端口或开启防盗链，顺延保底） ===
    'ikun': 20,     // iKun资源
    'subo': 21,     // 速博资源
    'jinying': 22,  // 金鹰点播
    'youku': 23,    // 优酷资源
    'jingyu': 24,   // 鲸鱼资源
};

// ikanbot / 采集站线路标识映射
const FLAG_TO_SOURCE_KEY: Record<string, string> = {
    'jlm3u8': 'juliang',
    'wjm3u8': 'wujin',
    'zuidam3u8': 'zuida',
    'gsm3u8': 'guangsu',
    'jsm3u8': 'jisu',
    'xlm3u8': 'xinlang',
    'bfzym3u8': 'baofeng',
    'lzm3u8': 'liangzi',
    'dyttm3u8': 'dytt',
    '1080zyk': 'json1080',
    'hym3u8': 'huya',
    'hhm3u8': 'haitun',
    'ffm3u8': 'feifan',
    'hongniu': 'hongniu',
    'rym3u8': 'ruyi',
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

    // 智能排序与强力去重：同一个 source 仅保留 1 个权威项，且第一梯队（无尽/最大/光速/魔都/360）永远锁定在 1~5 位
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

    // 默认展示数量（精选前 3 条黄金线路：高清专线 720P、光速资源 蓝光、超清专线 1080P）
    const DEFAULT_VISIBLE_COUNT = 3;
    const shouldShowExpandButton = sortedSources.length > DEFAULT_VISIBLE_COUNT;

    // 当前可见线路：若已展开显示全部；未展开时严格保持 3 条精选线路（第 1 位永远是当前正在播放的线路，后续为推荐备选线路）
    const visibleSources = useMemo(() => {
        if (isExpanded || !shouldShowExpandButton) {
            return sortedSources;
        }
        const currentItem = sortedSources.find(s => s.source === currentSource) || sortedSources[0];
        const remaining = sortedSources.filter(s => s.source !== currentItem.source);
        
        return [currentItem, ...remaining.slice(0, DEFAULT_VISIBLE_COUNT - 1)].filter(Boolean);
    }, [sortedSources, isExpanded, shouldShowExpandButton, currentSource]);

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
                    const originalIndex = sortedSources.findIndex(s => s.source === source.source);
                    const rankNumber = originalIndex !== -1 ? originalIndex + 1 : index + 1;

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
                            {/* 左侧：状态圆点/序号与线路名称 */}
                            <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                {isCurrent ? (
                                    <span className="relative flex h-2 w-2 shrink-0">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                                    </span>
                                ) : (
                                    <span className="text-[10px] text-white/40 font-mono shrink-0">
                                        {rankNumber}.
                                    </span>
                                )}
                                <span className="truncate font-semibold text-[11px] sm:text-xs">
                                    {source.sourceName || source.source}
                                </span>
                            </div>

                            {/* 右侧徽章（4K / 蓝光 / 备用 / 首选） */}
                            <div className="flex items-center gap-1 shrink-0 ml-1">
                                {is4K ? (
                                    <span className="text-[9px] font-black px-1.5 py-0.2 bg-amber-400 text-black rounded shadow-xs">
                                        4K
                                    </span>
                                ) : isBluRay ? (
                                    <span className="text-[9px] font-bold px-1.5 py-0.2 bg-sky-500/20 text-sky-300 border border-sky-400/40 rounded">
                                        蓝光
                                    </span>
                                ) : !isExpanded && index === 1 ? (
                                    <span className="text-[9px] font-bold px-1 py-0.2 bg-purple-500/20 text-purple-300 border border-purple-400/40 rounded">
                                        备用
                                    </span>
                                ) : originalIndex === 0 && !isCurrent ? (
                                    <span className="text-[9px] font-bold px-1 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 rounded">
                                        首选
                                    </span>
                                ) : null}
                            </div>
                        </button>
                    );
                })}
            </div>
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
