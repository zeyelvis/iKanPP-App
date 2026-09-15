import { PREBAKED_HOME_DATA } from '@/lib/data/home-prebaked';

export interface CategoryHubSkeletonProps {
  channelKey?: 'movie' | 'tv' | 'anime' | 'variety' | 'documentary' | 'short';
  categoryTitle?: string;
  activeNav?: string;
}

/**
 * 全站频道大厅首屏高保真 SSR 骨架 (CategoryHubSkeleton)
 * 供 /movie, /tv, /anime, /variety, /documentary, /ranking 等频道页复用。
 * 纯 Server Component，0 毫秒首字节 HTML 直出，彻底消灭全站各大频道的居中 blank spinner。
 */
export function CategoryHubSkeleton({
  channelKey = 'movie',
  categoryTitle,
  activeNav,
}: CategoryHubSkeletonProps) {
  const channelData = PREBAKED_HOME_DATA[channelKey] || PREBAKED_HOME_DATA.movie;
  const hero = channelData.hero?.[0] || {
    title: categoryTitle || '精选大片',
    backdrop: 'https://image.tmdb.org/t/p/w1280/AwmlL79nKTcX5tzAhyoV298xXlz.jpg',
    episodes_info: '院线热播',
    rate: '8.5',
  };

  const trendingNav = channelData.trendingNav || [];
  const backdropUrl = hero.backdrop
    ? `/api/img-proxy?url=${encodeURIComponent(hero.backdrop)}&w=1280`
    : '';

  const navKey = activeNav || channelKey;

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      {/* 1. 顶部极简毛玻璃导航栏骨架 */}
      <header className="fixed top-0 inset-x-0 h-16 z-50 bg-[#0A0A0F]/60 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-(--accent-color,theme(colors.red.600)) flex items-center justify-center font-black text-white text-base">
              iK
            </div>
            <span className="font-extrabold text-lg tracking-wider text-white">iKanPP</span>
          </div>
          <nav className="hidden md:flex items-center gap-4 text-sm font-medium text-white/70">
            <span className={navKey === 'home' || !navKey ? 'text-white font-bold' : ''}>首页</span>
            <span className={navKey === 'movie' ? 'text-white font-bold' : ''}>电影</span>
            <span className={navKey === 'tv' ? 'text-white font-bold' : ''}>电视剧</span>
            <span className={navKey === 'anime' ? 'text-white font-bold' : ''}>动漫</span>
            <span className={navKey === 'variety' ? 'text-white font-bold' : ''}>综艺</span>
            <span className={navKey === 'documentary' ? 'text-white font-bold' : ''}>纪录片</span>
            <span className={navKey === 'ranking' ? 'text-white font-bold' : ''}>排行榜</span>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center w-48 lg:w-64 h-9 rounded-full bg-white/10 border border-white/10 px-3 text-xs text-white/40">
            搜索电影、电视剧、演员...
          </div>
          <div className="w-8 h-8 rounded-full bg-white/10" />
        </div>
      </header>

      {/* 2. 影院级全景巨幕 Hero 区域 */}
      <section className="relative w-full h-[68vh] min-h-140 sm:h-[75vh] lg:h-[82vh] max-h-210 overflow-hidden select-none">
        {backdropUrl && (
          <img
            src={backdropUrl}
            alt={hero.title}
            fetchPriority="high"
            decoding="sync"
            className="absolute inset-0 w-full h-full object-cover object-center transform scale-102"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/40 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0F]/90 via-[#0A0A0F]/30 to-transparent z-10" />

        <div className="absolute inset-x-0 bottom-0 z-20 w-full flex flex-col justify-end pb-3 sm:pb-4 lg:pb-5">
          <div className="fluid-container relative">
            <div className="iyf-hero-bar relative flex items-end justify-between">
              {/* 左栏 */}
              <div className="shrink-0 w-full max-w-[280px] sm:max-w-[340px] lg:w-[260px] xl:w-[380px] 2xl:w-[480px] flex flex-col items-start justify-end">
                <div className="mb-3 sm:mb-4 w-full h-[76px] sm:h-[88px] lg:h-[96px] flex flex-col justify-end">
                  <h2 className="text-2xl sm:text-3xl lg:text-[26px] xl:text-3xl 2xl:text-4xl font-black text-white tracking-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] mb-1 leading-tight whitespace-nowrap">
                    {hero.title}
                  </h2>
                  <div className="text-white/90 text-sm sm:text-base font-medium flex items-center gap-2 whitespace-nowrap drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] h-6">
                    <span className="truncate">{hero.episodes_info || (categoryTitle ? `${categoryTitle} · 热门` : '热门推荐')}</span>
                    {hero.rate && (
                      <span className="text-amber-400 font-bold text-sm sm:text-base flex items-center gap-0.5 shrink-0">
                        ★ {hero.rate}
                      </span>
                    )}
                  </div>
                </div>

                <div className="inline-flex items-center justify-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 xl:px-6 xl:py-3 bg-white/20 backdrop-blur-md text-white rounded-full text-sm sm:text-base xl:text-lg font-bold border border-white/30 shadow-[0_4px_24px_rgba(0,0,0,0.6)] shrink-0">
                  <span>立即播放</span>
                  <span className="text-sm sm:text-base">▷</span>
                </div>
              </div>

              {/* 中栏：TrendingNav 速报标签栏 (爱壹帆专区专属：电影/剧集/动漫 6+6，综艺/纪录片 4+4) */}
              {trendingNav.length > 0 && (() => {
                const isWide4 = channelKey === 'variety' || channelKey === 'documentary';
                const splitIdx = isWide4 ? 4 : 6;
                const line1 = trendingNav.slice(0, splitIdx);
                const line2 = trendingNav.slice(splitIdx, splitIdx * 2);

                const renderItem = (item: { title: string; updateBadge?: string }, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-start text-left text-white/90 select-none shrink-0"
                  >
                    <span className={`font-bold tracking-tight whitespace-nowrap leading-snug truncate shrink-0 ${
                      isWide4
                        ? 'text-[12px] lg:text-[12.5px] xl:text-[14.5px] 2xl:text-[16px] max-w-[110px] lg:max-w-[130px] xl:max-w-[185px] 2xl:max-w-[220px]'
                        : 'text-[11px] lg:text-[11.5px] xl:text-[13px] 2xl:text-[14.5px] max-w-[74px] lg:max-w-[82px] xl:max-w-[120px] 2xl:max-w-[150px]'
                    }`}>
                      {item.title}
                    </span>
                    {item.updateBadge ? (
                      <span className="inline-flex items-center justify-center bg-[#E50914] text-white text-[8.5px] xl:text-[9.5px] 2xl:text-[10px] font-black rounded-xs px-1 py-0.2 min-w-3.5 h-3.5 leading-none ml-1 shrink-0 shadow-md">
                        {item.updateBadge}
                      </span>
                    ) : null}
                  </div>
                );

                return (
                  <div className="hidden lg:flex flex-1 min-w-0 flex-col items-center justify-end px-2 xl:px-6 pb-1">
                    <div className="flex flex-col items-center gap-y-2 xl:gap-y-3 w-full max-w-fit">
                      <div className={`flex items-center justify-center whitespace-nowrap shrink-0 ${
                        isWide4
                          ? 'gap-x-3 lg:gap-x-4 xl:gap-x-8 2xl:gap-x-11'
                          : 'gap-x-2 lg:gap-x-2.5 xl:gap-x-5 2xl:gap-x-7'
                      }`}>
                        {line1.map(renderItem)}
                      </div>
                      <div className={`flex items-center justify-center whitespace-nowrap shrink-0 ${
                        isWide4
                          ? 'gap-x-3 lg:gap-x-4 xl:gap-x-8 2xl:gap-x-11'
                          : 'gap-x-2 lg:gap-x-2.5 xl:gap-x-5 2xl:gap-x-7'
                      }`}>
                        {line2.map((item, idx) => renderItem(item, idx + splitIdx))}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* 右栏：8 席轮播大片缩略海报卡片列表占位 */}
              <div className="hidden md:flex items-center gap-0.5 xl:gap-1.5 shrink-0 self-end p-1 xl:p-1.5 rounded-xl bg-black/25 backdrop-blur-xs border border-white/10 ml-auto lg:ml-0">
                {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <div
                    key={i}
                    className={`w-[36px] h-[52px] sm:w-[40px] sm:h-[58px] lg:w-[38px] lg:h-[54px] xl:w-[48px] xl:h-[70px] 2xl:w-[54px] 2xl:h-[78px] rounded-lg bg-white/5 border shrink-0 ${
                      i === 0 ? 'border-[#00D1FF] ring-2 ring-[#00D1FF]/70 scale-105' : 'border-white/10'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 频道大厅专属内容货架骨架区 */}
      <div className="fluid-container space-y-8 mt-4 relative z-20 pb-20">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-36 h-6 rounded bg-white/10 animate-pulse" />
            <div className="w-16 h-5 rounded-full bg-white/5 animate-pulse" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-2">
                <div className="aspect-[2/3] rounded-xl bg-white/5 animate-pulse border border-white/5" />
                <div className="w-3/4 h-4 rounded bg-white/10 animate-pulse" />
                <div className="w-1/2 h-3 rounded bg-white/5 animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-44 h-6 rounded bg-white/10 animate-pulse" />
            <div className="w-16 h-5 rounded-full bg-white/5 animate-pulse" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-2">
                <div className="aspect-[2/3] rounded-xl bg-white/5 animate-pulse border border-white/5" />
                <div className="w-3/4 h-4 rounded bg-white/10 animate-pulse" />
                <div className="w-1/2 h-3 rounded bg-white/5 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
