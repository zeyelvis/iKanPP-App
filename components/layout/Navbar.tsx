'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Icons } from '@/components/ui/Icon';
import { LogoIcon } from '@/components/ui/LogoIcon';
import { Menu, X } from 'lucide-react';
import { SearchBox } from '@/components/search/SearchBox';
import { MobileSearchOverlay } from '@/components/search/MobileSearchOverlay';

interface NavbarProps {
  variant?: 'home' | 'player';
  onReset?: () => void;
  isPremiumMode?: boolean;
  onSearch?: (query: string) => void;
  onClearSearch?: () => void;
  initialQuery?: string;
  isSearching?: boolean;
  activeCategory?: string;
  onSelectCategory?: (category: string) => void;
  transparentFloat?: boolean;
}

function NavbarInner({
  variant = 'home',
  onReset,
  isPremiumMode = false,
  onSearch,
  onClearSearch,
  initialQuery = '',
  isSearching = false,
  activeCategory = 'home',
  onSelectCategory,
  transparentFloat = false,
}: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 智能推导精准返回通道
  const fromChannel = searchParams?.get('from') || '';
  const channelMap: Record<string, { label: string; href: string }> = {
    movie: { label: '返回电影', href: '/movie' },
    tv: { label: '返回剧集', href: '/tv' },

    anime: { label: '返回动漫', href: '/anime' },
    variety: { label: '返回综艺', href: '/variety' },
    ranking: { label: '返回榜单', href: '/ranking' },
    iptv: { label: '返回直播', href: '/iptv' },
  };

  const [isIkanX, setIsIkanX] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsIkanX(window.location.hostname.includes('ikanx.com'));
    }
  }, []);

  const homeHref = isIkanX
    ? '/'
    : isPremiumMode
    ? '/premium'
    : (fromChannel && channelMap[fromChannel] ? channelMap[fromChannel].href : '/');

  const returnLabel = isIkanX
    ? '返回午夜专区'
    : isPremiumMode
    ? '返回午夜版'
    : (fromChannel && channelMap[fromChannel] ? channelMap[fromChannel].label : '返回');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    if (onSearch) {
      onSearch(trimmed);
    } else {
      // 全局兜底搜索跳转：跨页从详情页/播放页直接唤起全网聚合秒播
      if (isIkanX || isPremiumMode) {
        window.location.href = `https://ikanx.com/?q=${encodeURIComponent(trimmed)}`;
      } else {
        router.push(`/?q=${encodeURIComponent(trimmed)}`);
      }
    }
    setMobileSearchOpen(false);
  };

  const handleClear = () => {
    onClearSearch?.();
  };

  const isPlayer = variant === 'player';

  const navCategories = isIkanX
    ? [
        { id: 'premium', label: '午夜大厅', href: '/', isExternal: false },
        { id: 'return_main', label: '返回主站 (大众影视)', href: 'https://www.ikanpp.com', isExternal: true },
      ]
    : [
        { id: 'home', label: '首页', href: '/', isExternal: false },
        { id: 'movie', label: '电影', href: '/movie', isExternal: false },
        { id: 'tv', label: '电视剧', href: '/tv', isExternal: false },
        { id: 'anime', label: '动漫', href: '/anime', isExternal: false },
        { id: 'variety', label: '综艺', href: '/variety', isExternal: false },
        { id: 'documentary', label: '纪录片', href: '/documentary', isExternal: false },
        { id: 'short', label: '短剧', href: '/short', isExternal: false },
        { id: 'ranking', label: '风云榜', href: '/ranking', isExternal: false },
        { id: 'iptv', label: '电视直播', href: '/iptv', isExternal: false },
        { id: 'premium', label: '午夜版', href: 'https://ikanx.com', isExternal: true },
      ];

  return (
    <nav
      className={`z-2000 w-full transition-all duration-300 ${
        transparentFloat
          ? (isScrolled
              ? 'fixed top-0 inset-x-0 bg-[#0A0A0F]/90 backdrop-blur-2xl border-b border-white/10 shadow-2xl py-3'
              : 'absolute top-0 inset-x-0 bg-transparent py-4')
          : (isScrolled
              ? 'sticky top-0 bg-[#0A0A0F]/90 backdrop-blur-2xl border-b border-white/10 shadow-2xl py-3'
              : 'sticky top-0 bg-linear-to-b from-black/80 via-black/40 to-transparent py-4')
      }`}
    >
      <div className="fluid-container flex items-center justify-between gap-4">
        {/* 左侧：Logo 与导航标签 (自适应 iPad 横屏与超宽桌面) */}
        <div className="flex items-center gap-2 sm:gap-4 lg:gap-2.5 xl:gap-6 2xl:gap-8 min-w-0">
          {isPlayer ? (
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => router.push(homeHref)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-white/90 hover:text-white border border-white/10 text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                title={returnLabel}
              >
                <Icons.ChevronLeft size={16} />
                <span>{returnLabel}</span>
              </button>
              <button
                onClick={() => router.push(homeHref)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0 cursor-pointer"
                title={returnLabel}
              >
                <LogoIcon size={32} />
                <span className="font-black text-xl tracking-tight text-white hidden sm:inline">
                  {isIkanX ? 'iKanX' : 'iKanPP'}
                </span>
              </button>
            </div>
          ) : (
            <Link
              href={homeHref}
              className="flex items-center gap-2.5 hover:opacity-90 transition-opacity cursor-pointer shrink-0"
              onClick={onReset}
            >
              <LogoIcon size={34} />
              <div className="flex flex-col">
                <span
                  className="text-xl font-black tracking-tight"
                  style={{
                    background: isIkanX
                      ? 'linear-gradient(135deg, #EC4899 0%, #A855F7 50%, #6366F1 100%)'
                      : 'linear-gradient(135deg, #FF4D4D 0%, #F59E0B 50%, #FFD700 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {isIkanX ? 'iKanX' : 'iKanPP'}
                </span>
                <span className="text-[9px] text-white/50 tracking-widest font-semibold hidden md:inline -mt-1">
                  {isIkanX ? '午夜专区 · 4K 极速秒播' : '爱看片片 · 全免流媒体'}
                </span>
              </div>
            </Link>
          )}

          {/* 桌面端/平板顶级频道横排导航 (iPad与宽屏自适应防挤压) */}
          {!isPlayer && (
            <div className="hidden lg:flex items-center gap-0.5 xl:gap-1.5 2xl:gap-2 shrink-0">
              {navCategories.map(cat => {
                const isActive = (cat.href === '/' && pathname === '') || pathname === cat.href || activeCategory === cat.id;

                if ((cat as any).isExternal) {
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        if (cat.id === 'premium') {
                          window.open(cat.href, '_blank', 'noopener,noreferrer');
                        } else {
                          window.location.href = cat.href;
                        }
                      }}
                      className={`shrink-0 whitespace-nowrap px-2 xl:px-3.5 py-1.5 rounded-full text-[11.5px] xl:text-xs 2xl:text-sm font-bold transition-all duration-200 cursor-pointer flex items-center gap-1 xl:gap-1.5 ${
                        cat.id === 'premium'
                          ? 'text-pink-400 hover:text-pink-300 hover:bg-pink-500/10 border border-pink-500/20'
                          : 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 border border-amber-500/20'
                      }`}
                    >
                      {cat.id === 'premium' && <span className="shrink-0">🌙</span>}
                      <span className="shrink-0 whitespace-nowrap">{cat.label}</span>
                    </button>
                  );
                }

                return (
                  <Link
                    key={cat.id}
                    href={cat.href}
                    className={`shrink-0 whitespace-nowrap px-2 xl:px-3.5 py-1.5 rounded-full text-[11.5px] xl:text-xs 2xl:text-sm font-bold transition-all duration-200 cursor-pointer flex items-center gap-1 xl:gap-1.5 ${
                      isActive
                        ? 'bg-(--accent-color) text-white shadow-lg shadow-(--accent-color)/25 scale-105'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span className="shrink-0 whitespace-nowrap">{cat.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* 右侧：全网搜索框 + 移动端搜索与菜单展开 */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* 桌面端胶囊搜索栏 (在主站首页、详情页、播放页等所有页面全量常驻) */}
          <div className="hidden sm:block">
            <SearchBox
              onSearch={handleSearch}
              onClear={handleClear}
              initialQuery={initialQuery}
              isPremium={isPremiumMode}
            />
          </div>

          {/* 移动端搜索放大镜触发按钮 (随时唤起全屏搜索抽屉) */}
          <div className="sm:hidden">
            <button
              onClick={() => setMobileSearchOpen(true)}
              className="p-2 rounded-full text-white/80 hover:text-white bg-white/5 hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
              aria-label="打开搜索"
            >
              <Icons.Search size={18} />
            </button>
          </div>

          {/* 移动端汉堡菜单按钮 (仅在非播放页呈现) */}
          {!isPlayer && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer lg:hidden"
              aria-label="展开导航菜单"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
        </div>
      </div>

      {/* 移动端下拉分类抽屉 */}
      {mobileMenuOpen && !isPlayer && (
        <div className="lg:hidden bg-[#0A0A0F]/98 backdrop-blur-3xl border-b border-white/10 px-4 pt-3 pb-5 animate-fade-in shadow-2xl">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-bold text-white/50 tracking-wider">频道直通</span>
            <span className="text-[10px] text-white/30">100% 永久免费播放</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {navCategories.map(cat => {
              const isActive = pathname === cat.href || (cat.href === '/' && pathname === '') || activeCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if ((cat as any).isExternal) {
                      if (cat.id === 'premium') {
                        window.open(cat.href, '_blank', 'noopener,noreferrer');
                      } else {
                        window.location.href = cat.href;
                      }
                    } else {
                      router.push(cat.href);
                    }
                  }}
                  className={`py-3 px-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-1 active:scale-95 ${
                    isActive
                      ? 'bg-(--accent-color) text-white shadow-lg shadow-(--accent-color)/30 font-black'
                      : 'bg-white/5 text-white/80 hover:bg-white/10 border border-white/5'
                  }`}
                >
                  <span className="text-sm">
                    {cat.id === 'home' && '🏠'}
                    {cat.id === 'movie' && '🎬'}
                    {cat.id === 'tv' && '📺'}
                    {cat.id === 'anime' && '⚡'}
                    {cat.id === 'variety' && '🎤'}
                    {cat.id === 'ranking' && '🏆'}
                    {cat.id === 'iptv' && '📡'}
                    {cat.id === 'premium' && '🌙'}
                    {cat.id === 'return_main' && '🌐'}
                  </span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 移动端全屏搜索弹层 (全站全量开放) */}
      <MobileSearchOverlay
        isOpen={mobileSearchOpen}
        onClose={() => setMobileSearchOpen(false)}
        onSearch={handleSearch}
        initialQuery={initialQuery}
        isPremium={isPremiumMode}
      />
    </nav>
  );
}

export function Navbar(props: NavbarProps) {
  return (
    <Suspense fallback={<nav className="sticky top-0 z-40 w-full h-16 bg-[#0A0A0F]/80 backdrop-blur-md" />}>
      <NavbarInner {...props} />
    </Suspense>
  );
}
