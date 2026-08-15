
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

interface SearchResultsProps {
    results: Video[];
    availableSources: SourceBadge[];
    loading: boolean;
    isPremium?: boolean;
    latencies?: Record<string, number>;
    query?: string;
    onSearch?: (query: string) => void;
}

export function SearchResults({
    results,
    availableSources,
    loading,
    isPremium = false,
    latencies = {},
    query = '',
    onSearch,
}: SearchResultsProps) {
    // 过滤器折叠状态（默认折叠）
    const [filtersExpanded, setFiltersExpanded] = useState(false);

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

    if (results.length === 0 && !loading) return null;

    const hasFilters = availableSources.length > 0 || typeBadges.length > 0 || languageBadges.length > 0;
    const activeFilterCount = selectedSources.size + selectedTypes.size + selectedLangs.size;

    return (
        <div className="animate-fade-in">
            <ResultsHeader
                loading={loading}
                resultsCount={results.length}
                availableSources={availableSources}
            />

            {/* 可折叠过滤器区域 */}
            {hasFilters && (
                <div className="mb-6">
                    {/* 折叠/展开按钮 */}
                    <button
                        onClick={() => setFiltersExpanded(!filtersExpanded)}
                        className="flex items-center gap-2 text-sm text-[var(--text-color-secondary)] hover:text-[var(--accent-color)] transition-colors mb-3 cursor-pointer"
                    >
                        <Icons.Settings size={14} />
                        <span>
                            {filtersExpanded ? '收起筛选' : '展开筛选'}
                        </span>
                        {activeFilterCount > 0 && (
                            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[var(--accent-color)] text-white min-w-[18px] text-center">
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
                        className={`transition-all duration-300 ease-in-out overflow-hidden ${filtersExpanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
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
            <RelatedKeywords
                query={query || results[0]?.vod_name || ''}
                onKeywordClick={onSearch}
            />

            {/* Display filtered videos */}
            <VideoGrid
                videos={finalFilteredVideos}
                isPremium={isPremium}
                latencies={latencies}
            />
        </div>
    );
}
