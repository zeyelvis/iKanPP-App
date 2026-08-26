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
import { useBossKey } from '@/lib/hooks/useBossKey';
import { Crown, Sparkles, Zap, ShieldCheck, EyeOff } from 'lucide-react';

function PremiumHomePage() {
    const router = useRouter();
    const { triggerBossKey } = useBossKey({ redirectUrl: '/movie' });
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

    // 当用户点击播放任何视频时的处理（全站全面免费：0ms 直达秒播）
    const handlePlayVideo = (video: any) => {
        const title = video?.vod_name || video?.title;
        if (title) {
            const videoId = video?.vod_id ? String(video.vod_id) : '';
            const source = video?.source || '';
            
            let playUrl = `/player?title=${encodeURIComponent(title)}&type=tv&premium=1`;
            if (videoId && source) {
                playUrl += `&id=${encodeURIComponent(videoId)}&source=${encodeURIComponent(source)}`;
            }
            router.push(playUrl);
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

            {/* 一键防尴尬「隐私伪装 (Esc)」悬浮胶囊 */}
            <button
                onClick={triggerBossKey}
                className="fixed bottom-6 right-6 z-40 flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-black/85 hover:bg-black text-white/80 hover:text-white border border-white/15 backdrop-blur-xl shadow-xl shadow-black/80 text-xs font-bold transition-all cursor-pointer hover:scale-105 active:scale-95 group"
                title="按键盘 Esc 键或点击立即伪装切回普通电影页面"
                aria-label="隐私伪装"
            >
                <EyeOff size={14} className="text-amber-400 group-hover:rotate-12 transition-transform" />
                <span className="hidden sm:inline">隐私伪装</span>
                <kbd className="hidden sm:inline-block px-1.5 py-0.2 rounded bg-white/10 text-[10px] font-mono text-white/60">Esc</kbd>
            </button>

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
