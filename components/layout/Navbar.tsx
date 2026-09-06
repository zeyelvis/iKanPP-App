'use client';

import { useState, useEffect } from 'react';
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
}

export function Navbar({
  variant = 'home',
  onReset,
  isPremiumMode = false,
  onSearch,
  onClearSearch,
  initialQuery = '',
  isSearching = false,
  activeCategory = 'home',
  onSelectCategory,
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

  const homeHref = isPremiumMode
    ? '/premium'
    : (fromChannel && channelMap[fromChannel] ? channelMap[fromChannel].href : '/');

  const returnLabel = isPremiumMode
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
    onSearch?.(query);
    setMobileSearchOpen(false);
  };

  const handleClear = () => {
    onClearSearch?.();
  };

  const isPlayer = variant === 'player';

  const navCategories = [
    { id: 'home', label: '首页', href: '/' },
    { id: 'movie', label: '电影', href: '/movie' },
    { id: 'tv', label: '电视剧', href: '/tv' },

    { id: 'anime', label: '动漫', href: '/anime' },
    { id: 'variety', label: '综艺', href: '/variety' },
    { id: 'ranking', label: '风云榜', href: '/ranking' },
    { id: 'iptv', label: '电视直播', href: '/iptv' },
    { id: 'premium', label: '午夜版', href: '/premium' },
  ];

  return (
    <nav
      className={`sticky top-0 z-2000 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-[#0A0A0F]/90 backdrop-blur-2xl border-b border-white/10 shadow-2xl py-3'
          : 'bg-linear-to-b from-black/80 via-black/40 to-transparent py-4'
      }`}
    >
      <div className="fluid-container flex items-center justify-between gap-4">
        {/* 左侧：Logo + 品牌标识 + 核心分类导航 */}
        <div className="flex items-center gap-6 lg:gap-8">
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
                <span className="font-black text-xl tracking-tight text-white hidden sm:inline">iKanPP</span>
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
                    background: 'linear-gradient(135deg, #FF4D4D 0%, #F59E0B 50%, #FFD700 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  iKanPP
                </span>
                <span className="text-[9px] text-white/50 tracking-widest font-semibold hidden md:inline -mt-1">
                  爱看片片 · 全免流媒体
                </span>
              </div>
            </Link>
          )}

          {/* 桌面端顶级频道横排导航 */}
          {!isPlayer && (
            <div className="hidden lg:flex items-center gap-1 xl:gap-2">
              {navCategories.map(cat => {
                const isActive = pathname === cat.href || (cat.href === '/' && pathname === '') || activeCategory === cat.id;

                return (
                  <Link
                    key={cat.id}
                    href={cat.href}
                    className={`px-3.5 py-1.5 rounded-full text-xs xl:text-sm font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-(--accent-color) text-white shadow-lg shadow-(--accent-color)/25 scale-105'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span>{cat.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* 右侧：全网搜索框 + 移动端菜单展开 */}
        <div className="flex items-center gap-3 shrink-0">
          {/* 桌面端展开式搜索栏 */}
          {onSearch && !isPlayer && (
            <div className="hidden sm:block">
              <SearchBox
                onSearch={handleSearch}
                onClear={handleClear}
                initialQuery={initialQuery}
                isPremium={isPremiumMode}
              />
            </div>
          )}

          {/* 移动端搜索放大镜触发按钮 */}
          {onSearch && !isPlayer && (
            <div className="sm:hidden">
              <button
                onClick={() => setMobileSearchOpen(true)}
                className="p-2 rounded-full text-white/80 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                aria-label="打开搜索"
              >
                <Icons.Search size={18} />
              </button>
            </div>
          )}

          {/* 移动端汉堡菜单按钮 */}
          {!isPlayer && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors lg:hidden"
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
                    router.push(cat.href);
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
                  </span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 移动端全屏搜索弹层 */}
      {onSearch && (
        <MobileSearchOverlay
          isOpen={mobileSearchOpen}
          onClose={() => setMobileSearchOpen(false)}
          onSearch={handleSearch}
          initialQuery={initialQuery}
        />
      )}
    </nav>
  );
}
