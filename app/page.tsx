'use client';

import { Suspense, useMemo } from 'react';
import { SearchLoadingAnimation } from '@/components/SearchLoadingAnimation';
import { NoResults } from '@/components/search/NoResults';
import { PopularFeatures } from '@/components/home/PopularFeatures';
import { WatchHistorySidebar } from '@/components/history/WatchHistorySidebar';
import { FavoritesSidebar } from '@/components/favorites/FavoritesSidebar';
import { Navbar } from '@/components/layout/Navbar';
import { SearchResults } from '@/components/home/SearchResults';
import { useHomePage } from '@/lib/hooks/useHomePage';
import { useLatencyPing } from '@/lib/hooks/useLatencyPing';
import { ResumePlayBubble } from '@/components/home/ResumePlayBubble';

function HomePage() {
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
    availableSources.map(s => ({ id: s.id, baseUrl: s.id })), // Using id as baseUrl if not available elsewhere
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
      />

      {/* Search Loading Animation */}
      {loading && (
        <div className="fluid-container mt-4">
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
      <main className="fluid-container pb-20">
        {/* Results Section */}
        {(results.length >= 1 || (!loading && results.length > 0)) && (
          <SearchResults
            results={results}
            availableSources={availableSources}
            loading={loading}
            latencies={latencies}
            query={query}
            onSearch={handleSearch}
          />
        )}

        {/* Popular Features - Homepage */}
        {!loading && !hasSearched && (
          <PopularFeatures onSearch={handleSearch} />
        )}

        {/* No Results */}
        {!loading && hasSearched && results.length === 0 && (
          <NoResults onReset={handleReset} />
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

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="brand-spinner" />
      </div>
    }>
      <HomePage />
    </Suspense>
  );
}
