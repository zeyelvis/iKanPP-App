import { ALL_HOME_DATA } from '@/lib/data/home-prebaked-extra';

/**
 * 首页首屏高保真 SSR 骨架 (HomePageSkeleton)
 * 纯 Server Component，0 毫秒首字节 HTML 直出。
 * 包含首屏真实 4K/1080P Hero 背景图预渲染与首屏货架骨位，
 * 彻底消灭 blank spinner，为全球及受限国家用户提供秒开视觉感知。
 */
export function HomePageSkeleton() {
  const hero = ALL_HOME_DATA.hero[0] || {
    title: '精选大片',
    backdrop: 'https://image.tmdb.org/t/p/w1280/kTp2i00tjARpsI6wTkU4Q8ArGaX.jpg',
    episodes_info: '热门·剧情',
    rate: '8.8',
  };

  const trendingNav = ALL_HOME_DATA.trendingNav || [];
  const desktopBackdropUrl = hero.backdrop
    ? `/api/img-proxy?url=${encodeURIComponent(hero.backdrop)}&w=1280`
    : '';
  const mobileBackdropUrl = hero.backdrop
    ? `/api/img-proxy?url=${encodeURIComponent(hero.backdrop)}&w=780`
    : '';

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      {/* 1. 顶部极简毛玻璃导航栏骨架 (与 Navbar 高度 64px 严格对齐) */}
      <header className="fixed top-0 inset-x-0 h-16 z-50 bg-[#0A0A0F]/60 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-(--accent-color,theme(colors.red.600)) flex items-center justify-center font-black text-white text-base">
              iK
            </div>
            <span className="font-extrabold text-lg tracking-wider text-white">iKanPP</span>
          </div>
          <nav className="hidden md:flex items-center gap-4 text-sm font-medium text-white/70">
            <span className="text-white font-bold">首页</span>
            <span>电影</span>
            <span>电视剧</span>
            <span>动漫</span>
            <span>综艺</span>
            <span>纪录片</span>
            <span>排行榜</span>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center w-48 lg:w-64 h-9 rounded-full bg-white/10 border border-white/10 px-3 text-xs text-white/40">
            搜索电影、电视剧、演员...
          </div>
          <div className="w-8 h-8 rounded-full bg-white/10" />
        </div>
      </header>

      {/* 2. 影院级全景巨幕 Hero 区域 (与 HeroSlideshow 高度与结构绝对 1:1 对齐) */}
      <section className="relative w-full h-[68vh] min-h-140 sm:h-[75vh] lg:h-[82vh] max-h-210 overflow-hidden select-none">
        {/* 原生 <picture> 响应式自适应预渲染背景图，移动端 780px 极速加载，桌面端 1280px 超清呈现，0ms 启动网络流 */}
        {desktopBackdropUrl && (
          <picture className="absolute inset-0 w-full h-full">
            <source media="(max-width: 640px)" srcSet={mobileBackdropUrl} />
            <img
              src={desktopBackdropUrl}
              alt={hero.title}
              fetchPriority="high"
              decoding="sync"
              className="w-full h-full object-cover object-center transform scale-102"
            />
          </picture>
        )}

        {/* 电影级暗黑羽化与渐变遮罩系统 */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/40 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0F]/90 via-[#0A0A0F]/30 to-transparent z-10" />

        {/* 巨幕内容排版 */}
        <div className="absolute inset-x-0 bottom-0 z-20 w-full flex flex-col justify-end pb-3 sm:pb-4 lg:pb-5">
          <div className="fluid-container relative">
            <div className="iyf-hero-bar relative flex items-end justify-between">
              {/* 左栏：标题与立即播放按钮 */}
              <div className="shrink-0 w-full max-w-[280px] sm:max-w-[340px] lg:w-[260px] xl:w-[380px] 2xl:w-[480px] flex flex-col items-start justify-end">
                <div className="mb-3 sm:mb-4 w-full h-[76px] sm:h-[88px] lg:h-[96px] flex flex-col justify-end">
                  <h2 className="text-2xl sm:text-3xl lg:text-[26px] xl:text-3xl 2xl:text-4xl font-black text-white tracking-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] mb-1 leading-tight whitespace-nowrap">
                    {hero.title}
                  </h2>
                  <div className="text-white/90 text-sm sm:text-base font-medium flex items-center gap-2 whitespace-nowrap drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] h-6">
                    <span className="truncate">{hero.episodes_info || '电影 · 剧情'}</span>
                    {hero.rate && (
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        ★ {hero.rate}
                      </span>
                    )}
                  </div>
                </div>

                <div className="w-28 sm:w-32 h-10 sm:h-11 rounded-full bg-(--accent-color,theme(colors.red.600)) flex items-center justify-center font-bold text-white text-sm shadow-lg shadow-red-600/30">
                  立即播放
                </div>
              </div>

              {/* 中栏：全专区 100% 绝对对齐爱壹帆官方原生的二级速报标签栏 */}
              {(() => {
                const total = trendingNav.length;
                const half = Math.ceil(total / 2);
                const line1 = trendingNav.slice(0, half);
                const line2 = trendingNav.slice(half);

                const renderItem = (item: { title: string; hot_score?: string }, index: number) => (
                  <div
                    key={index}
                    className="flex items-baseline gap-1 text-xs lg:text-[13px] 2xl:text-sm font-medium text-white/80"
                  >
                    <span className="truncate max-w-[120px] 2xl:max-w-[150px]">{item.title}</span>
                    {item.hot_score ? (
                      <span className="text-[10px] 2xl:text-xs text-amber-400 font-bold shrink-0">
                        {item.hot_score}
                      </span>
                    ) : null}
                  </div>
                );

                return (
                  <div className="hidden lg:flex flex-1 min-w-0 flex-col items-center justify-end px-2 xl:px-6 pb-1">
                    <div className="flex flex-col items-center gap-y-2 xl:gap-y-3 w-full max-w-fit">
                      <div className="flex items-center justify-center whitespace-nowrap shrink-0 gap-x-4 lg:gap-x-6 xl:gap-x-8">
                        {line1.map(renderItem)}
                      </div>
                      <div className="flex items-center justify-center whitespace-nowrap shrink-0 gap-x-4 lg:gap-x-6 xl:gap-x-8">
                        {line2.map((item, idx) => renderItem(item, idx + half))}
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

      {/* 3. 核心货架骨架区 (采用与 Top10Rail 和 ContentRail 严格对齐的单行水平滚动滑轨，彻底消灭 CLS 布局跳动) */}
      <div className="fluid-container space-y-8 mt-4 relative z-20 pb-20">
        {/* 口碑榜胶囊条占位 */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 border-b border-white/10 pb-3">
          {['全部', '电影', '电视剧', '动漫', '综艺', '纪录片', '短剧'].map((tab, idx) => (
            <div
              key={idx}
              className={`px-4 py-1.5 rounded-full text-xs font-bold shrink-0 ${
                idx === 0 ? 'bg-white/20 text-white' : 'bg-white/5 text-white/40'
              }`}
            >
              {tab}
            </div>
          ))}
        </div>

        {/* 货架 1 骨架 (Top 10 / 热门：严格物理锁死单行滑轨尺寸) */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-32 h-6 rounded bg-white/10 animate-pulse" />
            <div className="w-16 h-5 rounded-full bg-white/5 animate-pulse" />
          </div>
          <div className="flex gap-2.5 sm:gap-4 overflow-hidden pb-4 pt-1 items-center">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div
                key={i}
                className="w-[118px] sm:w-40 lg:w-46 shrink-0 aspect-[2/3] rounded-2xl bg-white/5 animate-pulse border border-white/5"
              />
            ))}
          </div>
        </div>

        {/* 货架 2 骨架 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-40 h-6 rounded bg-white/10 animate-pulse" />
            <div className="w-16 h-5 rounded-full bg-white/5 animate-pulse" />
          </div>
          <div className="flex gap-2.5 sm:gap-4 overflow-hidden pb-4 pt-1 items-center">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div
                key={i}
                className="w-[118px] sm:w-40 lg:w-46 shrink-0 aspect-[2/3] rounded-2xl bg-white/5 animate-pulse border border-white/5"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
