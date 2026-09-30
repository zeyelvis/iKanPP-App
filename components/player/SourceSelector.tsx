'use client';

/**
 * 播放线路选择组件 (SourceSelector)
 * 遵循极简与真实无虚假宣称设计：
 * 1. 原样保留容器按地区算法排定的健康顺序，不擅自重排；
 * 2. 默认展示前 9 条，超过 9 条提供「更多 N 条线路」/「收起线路」切换；
 * 3. 未展开时确保当前正在播放的线路始终可见；
 * 4. 彻底删除虚假的 4K/蓝光 对照表标签；
 * 5. 命中 AD_PRONE_SOURCES 的线路真实标注「片头广告」；
 * 6. 纯色暗夜高级质感，严禁 backdrop-blur。
 */

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Icons } from '@/components/ui/Icon';
import { AD_PRONE_SOURCES } from '@/lib/utils/line-ranking';

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
  embedded?: boolean;
}

// 线路标识映射字典 (规范化 key 用于判断广告特征)
const FLAG_TO_SOURCE_KEY: Record<string, string> = {
  jlm3u8: 'juliang',
  wjm3u8: 'wujin',
  zuidam3u8: 'zuida',
  gsm3u8: 'guangsu',
  jsm3u8: 'jisu',
  xlm3u8: 'xinlang',
  bfzym3u8: 'baofeng',
  lzm3u8: 'liangzi',
  dyttm3u8: 'dytt',
  '1080zyk': 'json1080',
  hym3u8: 'huya',
  hhm3u8: 'haitun',
  ffm3u8: 'feifan',
  hongniu: 'hongniu',
  rym3u8: 'ruyi',
  subm3u8: 'subo',
  jinyingm3u8: 'jinying',
  ukm3u8: 'youku',
  ikm3u8: 'ikun',
  iqym3u8: 'lezi',
  '360zy': 'zy360',
  modu: 'modu',
  jingyu: 'jingyu',
  moduys: 'moduys',
  modu_dm: 'modu_dm',
  snm3u8: 'suoni',
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
  return FLAG_TO_SOURCE_KEY[source] || source;
}

function isAdProne(sourceId: string): boolean {
  const clean = getCleanSourceKey(sourceId);
  return AD_PRONE_SOURCES.has(sourceId) || AD_PRONE_SOURCES.has(clean);
}

export function SourceSelector({
  sources,
  currentSource,
  onSourceChange,
  className = '',
  embedded = false,
}: SourceSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // 1. 去重并保持容器传进来的权威顺序，不打乱
  const uniqueSources = useMemo(() => {
    const seen = new Set<string>();
    const list: SourceInfo[] = [];
    for (const s of sources) {
      if (!s || !s.source) continue;
      if (!seen.has(s.source)) {
        seen.add(s.source);
        list.push(s);
      }
    }
    return list;
  }, [sources]);

  const DEFAULT_VISIBLE_COUNT = 9;
  const totalCount = uniqueSources.length;
  const hasMore = totalCount > DEFAULT_VISIBLE_COUNT;

  // 2. 计算当前可见线路列表：默认 9 条，若当前选中线路排在 9 之后，未展开时也要确保当前线路可见
  const visibleSources = useMemo(() => {
    if (isExpanded || !hasMore) {
      return uniqueSources;
    }

    const currentIdx = uniqueSources.findIndex((s) => s.source === currentSource);
    // 如果当前正在播放的线路排在 9 之后，前 8 条 + 当前线路，确保当前线路可见
    if (currentIdx >= DEFAULT_VISIBLE_COUNT) {
      const topSlice = uniqueSources.slice(0, DEFAULT_VISIBLE_COUNT - 1);
      const currentItem = uniqueSources[currentIdx];
      return [...topSlice, currentItem];
    }

    return uniqueSources.slice(0, DEFAULT_VISIBLE_COUNT);
  }, [uniqueSources, isExpanded, hasMore, currentSource]);

  if (totalCount <= 1) {
    return null;
  }

  const content = (
    <div className="space-y-3">
      {/* 顶栏：仅保留极简标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icons.Layers size={17} className="text-purple-400" />
          <span className="text-sm sm:text-base font-bold text-white tracking-tight">
            播放线路
          </span>
        </div>

        {hasMore && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 font-medium cursor-pointer py-1 px-2 rounded-lg hover:bg-white/5"
          >
            <span>{isExpanded ? '收起线路' : `更多 ${totalCount - DEFAULT_VISIBLE_COUNT} 条线路`}</span>
            <Icons.ChevronDown
              size={14}
              className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            />
          </button>
        )}
      </div>

      {/* 紧凑胶囊网格：手机 2~3 列，桌面 3 列 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {visibleSources.map((source, index) => {
          const isCurrent = source.source === currentSource;
          const hasAd = isAdProne(source.source);
          const originalIndex = uniqueSources.findIndex((s) => s.source === source.source);
          const rankNumber = originalIndex !== -1 ? originalIndex + 1 : index + 1;

          return (
            <button
              key={`${source.source}-${index}`}
              type="button"
              onClick={() => !isCurrent && onSourceChange(source)}
              className={`
                relative group flex items-center justify-between px-2.5 py-2 rounded-xl text-left
                transition-all duration-200 cursor-pointer text-xs font-medium border select-none
                ${
                  isCurrent
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white border-amber-300/60 shadow-lg shadow-orange-600/25 scale-[1.01] z-10'
                    : 'bg-[#18181C] hover:bg-[#202026] text-white/90 border-white/10 hover:border-amber-500/40'
                }
              `}
              title={source.sourceName || source.source}
            >
              {/* 左侧：序号与线路名称 */}
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                {isCurrent ? (
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
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

              {/* 右侧：专线极清/片头广告真实标注 */}
              {source.source === 'shadowline' ? (
                <span className={`text-[10px] px-1 py-0.2 rounded shrink-0 ml-1 font-semibold ${isCurrent ? 'bg-black/30 text-amber-200' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
                  4K原画
                </span>
              ) : hasAd ? (
                <span className={`text-[10px] px-1 py-0.2 rounded shrink-0 ml-1 ${isCurrent ? 'bg-black/20 text-white/70' : 'text-white/40 border border-white/10'}`}>
                  片头广告
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );

  if (embedded) {
    return (
      <div id="source-selector-section" className={className}>
        {content}
      </div>
    );
  }

  return (
    <div id="source-selector-section" className={`mt-4 ${className}`}>
      <Card hover={false}>{content}</Card>
    </div>
  );
}
