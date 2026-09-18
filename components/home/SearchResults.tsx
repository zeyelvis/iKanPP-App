
import { useState } from 'react';
import { ResultsHeader } from '@/components/search/ResultsHeader';
import { SourceBadges } from '@/components/search/SourceBadges';
import { TypeBadges } from '@/components/search/TypeBadges';
import { LanguageBadges } from '@/components/search/LanguageBadges';
import { VideoGrid } from '@/components/search/VideoGrid';
import { RelatedKeywords } from '@/components/search/RelatedKeywords';
import { useSourceBadges } from '@/lib/hooks/useSourceBadges';
import { useTypeBadges } from '@/lib/hooks/useTypeBadges';
import { useLanguageBadges } from '@/lib/hooks/useLanguageBadges';
import { Video, SourceBadge } from '@/lib/types';
import { Icons } from '@/components/ui/Icon';
import { SearchKnowledgePanel } from '@/components/search/SearchKnowledgePanel';

interface SearchResultsProps {
    results: Video[];
    availableSources: SourceBadge[];
    loading: boolean;
    isPremium?: boolean;
    latencies?: Record<string, number>;
    query?: string;
    onSearch?: (query: string) => void;
    onReset?: () => void;
}

export function SearchResults({
    results,
    availableSources,
    loading,
    isPremium = false,
    latencies = {},
    query = '',
    onSearch,
    onReset,
}: SearchResultsProps) {
    // 过滤器折叠状态（默认折叠）
    const [filtersExpanded, setFiltersExpanded] = useState(false);
    // 记录是否有官方图谱命中
    const [hasEntityMatched, setHasEntityMatched] = useState(false);

    // Source badges hook - filters by video source
    const {
        selectedSources,
        filteredVideos: sourceFilteredVideos,
        toggleSource,
    } = useSourceBadges(results, availableSources);

    // Type badges hook - auto-collects and filters by type_name
    const {
        typeBadges,
        selectedTypes,
        filteredVideos: typeFilteredVideos,
        toggleType,
    } = useTypeBadges(sourceFilteredVideos);

    // Language badges hook - auto-collects and filters by vod_lang
    const {
        languageBadges,
        selectedLangs,
        filteredVideos: finalFilteredVideos,
        toggleLang,
    } = useLanguageBadges(typeFilteredVideos);

    const hasFilters = availableSources.length > 0 || typeBadges.length > 0 || languageBadges.length > 0;
    const activeFilterCount = selectedSources.size + selectedTypes.size + selectedLangs.size;

    return (
        <div className="animate-fade-in">
            <ResultsHeader
                loading={loading}
                resultsCount={results.length}
                availableSources={availableSources}
            />

            {/* 本站 TMDB 权威最高权重推荐知识面板（置顶第一席，实体大脑先行） */}
            <SearchKnowledgePanel
                query={query}
                onEntityLoaded={(has) => setHasEntityMatched(has)}
            />

            {/* 可折叠过滤器区域 */}
            {hasFilters && results.length > 0 && (
                <div className="mb-6">
                    {/* 折叠/展开按钮 */}
                    <button
                        onClick={() => setFiltersExpanded(!filtersExpanded)}
                        className="flex items-center gap-2 text-sm text-(--text-color-secondary) hover:text-(--accent-color) transition-colors mb-3 cursor-pointer"
                    >
                        <Icons.Settings size={14} />
                        <span>
                            {filtersExpanded ? '收起筛选' : '展开筛选'}
                        </span>
                        {activeFilterCount > 0 && (
                            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-(--accent-color) text-white min-w-4.5 text-center">
                                {activeFilterCount}
                            </span>
                        )}
                        <Icons.ChevronDown
                            size={14}
                            className={`transition-transform duration-300 ${filtersExpanded ? 'rotate-180' : ''}`}
                        />
                    </button>

                    {/* 过滤器内容 */}
                    <div
                        className={`transition-all duration-300 ease-in-out overflow-hidden ${filtersExpanded ? 'max-h-150 opacity-100' : 'max-h-0 opacity-0'
                            }`}
                    >
                        {/* Source Badges */}
                        {availableSources.length > 0 && (
                            <SourceBadges
                                sources={availableSources}
                                selectedSources={selectedSources}
                                onToggleSource={toggleSource}
                                className="mb-4"
                            />
                        )}

                        {/* Type Badges */}
                        {typeBadges.length > 0 && (
                            <TypeBadges
                                badges={typeBadges}
                                selectedTypes={selectedTypes}
                                onToggleType={toggleType}
                                className="mb-4"
                            />
                        )}

                        {/* Language Badges */}
                        {languageBadges.length > 0 && (
                            <LanguageBadges
                                badges={languageBadges}
                                selectedLangs={selectedLangs}
                                onToggleLang={toggleLang}
                                className="mb-4"
                            />
                        )}
                    </div>
                </div>
            )}

            {/* 智能相关搜索推荐与 SEO 深度内链 */}
            {results.length > 0 && (
                <RelatedKeywords
                    query={query || results[0]?.vod_name || ''}
                    onKeywordClick={onSearch}
                />
            )}

            {/* 当有切片结果时，渲染视频流网格 */}
            {finalFilteredVideos.length > 0 && (
                <VideoGrid
                    videos={finalFilteredVideos}
                    isPremium={isPremium}
                    latencies={latencies}
                />
            )}

            {/* 当全网切片为0且完成加载时：分流自愈呈现 */}
            {!loading && results.length === 0 && (
                <div className="pt-2 pb-8">
                    {hasEntityMatched ? (
                        /* 场景 A：命中了官方影视图谱（如《法蒂玛圣母》），温馨引导求片，绝不弹出冷冰冰的“未找到相关内容” */
                        <div className="rounded-2xl bg-amber-500/10 border border-amber-500/25 p-5 sm:p-6 text-center max-w-xl mx-auto space-y-2.5 shadow-lg backdrop-blur-md">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                <span>🏛️ 影史馆藏已收录 · 暂无公网在线切片</span>
                            </div>
                            <p className="text-sm sm:text-base font-semibold text-white">
                                已为您精确锁定《{query}》官方百科档案与演职员图谱
                            </p>
                            <p className="text-xs text-neutral-400 leading-relaxed max-w-md mx-auto">
                                受海外胶片数字化与版权所限，全网公网切片站暂未收录高清在线片源。您可以点击上方卡片进入图谱，一键提交求片工单，平台将优先协调母带！
                            </p>
                        </div>
                    ) : (
                        /* 场景 B：连官方实体也未命中（如无意义乱码），展示友好的无结果提示 */
                        <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/5 border border-white/10 rounded-full mb-4 text-neutral-400">
                                <Icons.Search size={36} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">未找到切片片源</h3>
                            <p className="text-sm text-neutral-400 mb-5">试试精简关键词、影视别名或演员名字</p>
                            {onReset && (
                                <button
                                    onClick={onReset}
                                    className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-red-600/30"
                                >
                                    返回首页推荐
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
