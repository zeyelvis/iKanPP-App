'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SearchForm } from '@/components/search/SearchForm';
import { NoResults } from '@/components/search/NoResults';
import { Navbar } from '@/components/layout/Navbar';
import { SearchResults } from '@/components/home/SearchResults';
import { usePremiumHomePage } from '@/lib/hooks/usePremiumHomePage';
import { PremiumContent } from '@/components/premium/PremiumContent';
import { FavoritesSidebar } from '@/components/favorites/FavoritesSidebar';
import { VipPrompt } from '@/components/premium/VipPrompt';
import { AuthModal } from '@/components/auth/AuthModal';
import { useUserStore } from '@/lib/store/user-store';
import { Crown, Sparkles, Zap, ShieldCheck } from 'lucide-react';

function PremiumHomePage() {
    const router = useRouter();
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

    const { user, initialize } = useUserStore();
    const [showVipModal, setShowVipModal] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);

    // 确保用户状态已初始化
    useEffect(() => {
        initialize();
    }, [initialize]);

    // 监听全局 open-vip-modal 事件（方便子组件任意触发）
    useEffect(() => {
        const handleOpenVip = () => setShowVipModal(true);
        window.addEventListener('open-vip-modal', handleOpenVip);
        return () => window.removeEventListener('open-vip-modal', handleOpenVip);
    }, []);

    const isVip = user?.isVip ?? false;

    // 当用户点击播放任何视频时的核心拦截处理
    const handlePlayVideo = (video: any) => {
        const title = video?.vod_name || video?.title;
        if (!isVip) {
            // 未开通 VIP：直接呼出黑金 VIP 尊享激活弹窗
            setShowVipModal(true);
            return;
        }
        // VIP 会员：直接跳转播放页
        if (title) {
            router.push(`/player?title=${encodeURIComponent(title)}&type=tv&premium=1`);
        }
    };

    return (
        <div className="min-h-screen bg-[#060609] text-white relative overflow-x-hidden selection:bg-purple-500 selection:text-white">
            {/* 顶部与环境极光光晕背景 */}
            <div className="fixed top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
            <div className="fixed top-1/3 right-10 w-96 h-96 bg-pink-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />
            <div className="fixed bottom-10 left-10 w-80 h-80 bg-amber-600/5 rounded-full blur-[100px] pointer-events-none -z-10" />

            {/* 顶部专属 Navbar */}
            <Navbar onReset={handleReset} isPremiumMode={true} />

            {/* 游客尊享提示条（未开通 VIP 时常驻，高质感悬浮） */}
            {!isVip && (
                <div className="fluid-container mt-3">
                    <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-linear-to-r from-amber-500/15 via-yellow-500/10 to-purple-600/15 border border-amber-500/30 backdrop-blur-xl shadow-lg shadow-amber-500/5">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-xl bg-linear-to-br from-amber-400 to-yellow-600 flex items-center justify-center shrink-0 shadow-md shadow-amber-500/30">
                                <Crown size={15} className="text-black font-black" />
                            </div>
                            <div className="text-xs sm:text-sm text-white/90 truncate">
                                <span className="font-bold text-amber-300">午夜版专区预览中</span>
                                <span className="hidden sm:inline text-white/60 ml-2">· 注册即赠送 30 天 VIP，畅看 36 大专线与 4K 原画</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowVipModal(true)}
                            className="px-3.5 py-1.5 rounded-xl bg-linear-to-r from-amber-400 via-yellow-400 to-amber-500 text-black text-xs font-black shrink-0 hover:shadow-lg hover:shadow-amber-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                        >
                            ⚡ 立即免费开通 VIP
                        </button>
                    </div>
                </div>
            )}

            {/* 专属搜索栏 */}
            <div className="fluid-container mt-5 mb-8 relative z-30">
                <SearchForm
                    onSearch={handleSearch}
                    onClear={handleReset}
                    isLoading={loading}
                    initialQuery={query}
                    currentSource=""
                    checkedSources={completedSources}
                    totalSources={totalSources}
                    placeholder="探索 4K 蓝光大片、中文字幕、国产原创与日韩精选..."
                    isPremium={true}
                />
            </div>

            {/* Main Content */}
            <main className="fluid-container pb-24 relative z-10">
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
                    <PremiumContent onSearch={handleSearch} onPlayVideo={handlePlayVideo} />
                )}
            </main>

            {/* Favorites Sidebar - Left */}
            <FavoritesSidebar isPremium={true} />

            {/* VIP 尊享激活弹窗 */}
            {showVipModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
                    <div className="w-full max-w-4xl relative">
                        <VipPrompt
                            asModal={true}
                            onClose={() => setShowVipModal(false)}
                            onOpenLogin={() => {
                                setShowVipModal(false);
                                setShowLoginModal(true);
                            }}
                        />
                    </div>
                </div>
            )}

            {/* 登录/注册弹窗 */}
            {showLoginModal && (
                <AuthModal
                    isOpen={showLoginModal}
                    onClose={() => setShowLoginModal(false)}
                />
            )}
        </div>
    );
}

export default function PremiumPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#060609' }}>
                <div className="brand-spinner" />
            </div>
        }>
            <PremiumHomePage />
        </Suspense>
    );
}
