'use client';

import { useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { PopularFeatures } from '@/components/home/PopularFeatures';
import { Navbar } from '@/components/layout/Navbar';
import { useHomePage } from '@/lib/hooks/useHomePage';
import { useLatencyPing } from '@/lib/hooks/useLatencyPing';

// 🚀 八层极速秒开架构：次级交互组件（侧边栏抽屉/搜索结果/断点气泡）按需延迟加载
const SearchLoadingAnimation = dynamic(
  () => import('@/components/SearchLoadingAnimation').then(m => m.SearchLoadingAnimation),
  { ssr: false }
);
const NoResults = dynamic(
  () => import('@/components/search/NoResults').then(m => m.NoResults),
  { ssr: false }
);
const SearchResults = dynamic(
  () => import('@/components/home/SearchResults').then(m => m.SearchResults),
  { ssr: false }
);
const WatchHistorySidebar = dynamic(
  () => import('@/components/history/WatchHistorySidebar').then(m => m.WatchHistorySidebar),
  { ssr: false }
);
const FavoritesSidebar = dynamic(
  () => import('@/components/favorites/FavoritesSidebar').then(m => m.FavoritesSidebar),
  { ssr: false }
);
const ResumePlayBubble = dynamic(
  () => import('@/components/home/ResumePlayBubble').then(m => m.ResumePlayBubble),
  { ssr: false }
);

export function HomePageClient() {
  // 频道大厅与午夜版返回穿透保护守卫：若用户刚刚在播放器退出且来自子大厅/午夜版，确保永不误落回总首页
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const playingFromHub = sessionStorage.getItem('ikanpp_playing_from_hub');
    if (playingFromHub && playingFromHub !== '/') {
      sessionStorage.removeItem('ikanpp_playing_from_hub');
      window.location.replace(playingFromHub);
    }
  }, []);

  const {
    query,
    hasSearched,
    loading,
    results,
    availableSources,
    completedSources,
    totalSources,
    handleSearch,
    handleReset,
  } = useHomePage();

  // Real-time latency pinging
  const sourceUrls = useMemo(() =>
    availableSources.map(s => ({ id: s.id, baseUrl: s.id })),
    [availableSources]
  );

  const { latencies } = useLatencyPing({
    sourceUrls,
    enabled: hasSearched && results.length > 0,
  });

  return (
    <div className="min-h-screen">
      {/* Glass Navbar with integrated search */}
      <Navbar
        onReset={handleReset}
        onSearch={handleSearch}
        onClearSearch={handleReset}
        initialQuery={query}
        isSearching={loading}
        transparentFloat={!hasSearched && !loading}
      />

      {/* Search Loading Animation */}
      {loading && (
        <div className="fluid-container pt-3 pb-1">
          <div className="max-w-3xl mx-auto">
            <SearchLoadingAnimation
              currentSource=""
              checkedSources={completedSources}
              totalSources={totalSources}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="pb-20">
        {/* Results Section */}
        {(results.length >= 1 || (!loading && results.length > 0)) && (
          <div className="fluid-container pt-2 sm:pt-4">
            <SearchResults
              results={results}
              availableSources={availableSources}
              loading={loading}
              latencies={latencies}
              query={query}
              onSearch={handleSearch}
            />
          </div>
        )}

        {/* Popular Features - Homepage */}
        {!loading && !hasSearched && (
          <PopularFeatures onSearch={handleSearch} />
        )}

        {/* No Results */}
        {!loading && hasSearched && results.length === 0 && (
          <div className="fluid-container pt-8">
            <NoResults onReset={handleReset} />
          </div>
        )}
      </main>

      {/* Favorites Sidebar - Left */}
      <FavoritesSidebar />

      {/* Watch History Sidebar - Right */}
      <WatchHistorySidebar />

      {/* 智能断点续播气泡 */}
      <ResumePlayBubble />
    </div>
  );
}
