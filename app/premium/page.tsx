'use client';

import { Suspense } from 'react';
import { SearchForm } from '@/components/search/SearchForm';
import { NoResults } from '@/components/search/NoResults';
import { Navbar } from '@/components/layout/Navbar';
import { SearchResults } from '@/components/home/SearchResults';
import { usePremiumHomePage } from '@/lib/hooks/usePremiumHomePage';
import { PremiumContent } from '@/components/premium/PremiumContent';
import { FavoritesSidebar } from '@/components/favorites/FavoritesSidebar';
import { VipGate } from '@/components/premium/VipGate';

function PremiumHomePage() {
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
    } = usePremiumHomePage();

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-color)', backgroundImage: 'var(--bg-image)' }}>
            {/* Glass Navbar */}
            <Navbar onReset={handleReset} isPremiumMode={true} />

            {/* Search Form - Separate from navbar */}
            <div className="fluid-container mt-6 mb-8 relative" style={{
                transform: 'translate3d(0, 0, 0)',
                zIndex: 1000
            }}>
                <SearchForm
                    onSearch={handleSearch}
                    onClear={handleReset}
                    isLoading={loading}
                    initialQuery={query}
                    currentSource=""
                    checkedSources={completedSources}
                    totalSources={totalSources}
                    placeholder="输入关键词开始搜索..."
                    isPremium={true}
                />
            </div>

            {/* Main Content */}
            <main className="fluid-container pb-20">
                {/* Results Section */}
                {(results.length >= 1 || (!loading && results.length > 0)) && (
                    <SearchResults
                        results={results}
                        availableSources={availableSources}
                        loading={loading}
                        isPremium={true}
                    />
                )}

                {/* No Results */}
                {!loading && hasSearched && results.length === 0 && (
                    <NoResults onReset={handleReset} />
                )}

                {/* Premium Content - Trending and Latest */}
                {!loading && !hasSearched && (
                    <>
                        <PremiumContent onSearch={handleSearch} />
                    </>
                )}
            </main>

            {/* Favorites Sidebar - Left */}
            <FavoritesSidebar isPremium={true} />
        </div>
    );
}

export default function PremiumPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-color)' }}>
                <div className="brand-spinner" />
            </div>
        }>
            <VipGate>
                <PremiumHomePage />
            </VipGate>
        </Suspense>
    );
}
