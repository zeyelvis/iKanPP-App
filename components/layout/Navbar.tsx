'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { Icons } from '@/components/ui/Icon';
import { siteConfig } from '@/lib/config/site-config';
import { LogoIcon } from '@/components/ui/LogoIcon';
import { getSession, clearSession, hasPermission, type AuthSession } from '@/lib/store/auth-store';
import { LogOut, User, Crown, Share2, Menu, X, Sparkles } from 'lucide-react';
import { SearchBox } from '@/components/search/SearchBox';
import { MobileSearchOverlay } from '@/components/search/MobileSearchOverlay';
import { Button } from '@/components/ui/Button';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { AuthModal } from '@/components/auth/AuthModal';
import { useUserStore } from '@/lib/store/user-store';
import { useSessionGuard } from '@/lib/hooks/useSessionGuard';

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
  const settingsHref = '/profile?tab=player';
  const homeHref = isPremiumMode ? '/premium' : '/';
  const [session, setSessionState] = useState<AuthSession | null>(null);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [kickedMessage, setKickedMessage] = useState('');
  const { user: supabaseUser, initialize: initUser, logout: supabaseLogout } = useUserStore();

  useSessionGuard();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setKickedMessage(detail?.message || '你的账号已在其他设备登录');
    };
    window.addEventListener('session-kicked', handler);
    return () => window.removeEventListener('session-kicked', handler);
  }, []);

  useEffect(() => {
    setSessionState(getSession());
    initUser();
  }, [initUser]);

  const handleLogout = () => {
    clearSession();
    window.location.href = '/';
  };

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
    { id: 'premium', label: '午夜版', href: '/premium', isVip: true },
  ];

  return (
    <nav
      className={`sticky top-0 z-[2000] w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-[#0A0A0F]/90 backdrop-blur-2xl border-b border-white/10 shadow-2xl py-3'
          : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent py-4'
      }`}
    >
      <div className="fluid-container flex items-center justify-between gap-4">
        {/* 左侧：Logo + 品牌标识 + 核心分类导航 */}
        <div className="flex items-center gap-6 lg:gap-8">
          {isPlayer ? (
            <button
              onClick={() => router.push(homeHref)}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0 cursor-pointer"
              title={isPremiumMode ? '返回高级主页' : '返回首页'}
            >
              <LogoIcon size={34} />
              <span className="font-black text-xl tracking-tight text-white hidden sm:inline">iKanPP</span>
            </button>
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
                  爱看片片 · 流媒体
                </span>
              </div>
            </Link>
          )}

          {/* 桌面端：流媒体分类导航菜单 */}
          {!isPlayer && (
            <div className="hidden lg:flex items-center gap-1">
              {navCategories.map(cat => {
                const isActive = pathname === cat.href || (cat.href === '/' && pathname === '') || activeCategory === cat.id;

                return (
                  <Link
                    key={cat.id}
                    href={cat.href}
                    className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer flex items-center gap-1 ${
                      cat.isVip
                        ? 'text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30'
                        : isActive
                        ? 'text-white bg-[var(--accent-color)] font-bold shadow-lg shadow-[var(--accent-color)]/30 scale-105'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {cat.isVip && <Crown size={12} className="text-amber-400" />}
                    {cat.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* 播放页：返回按钮 */}
        {isPlayer && (
          <Button
            variant="secondary"
            onClick={() => router.back()}
            className="flex items-center gap-2 bg-white/10 text-white border-white/15 hover:bg-white/20"
          >
            <Icons.ChevronLeft size={20} />
            <span>返回上一页</span>
          </Button>
        )}

        {/* 右侧：搜索展开器 + 用户状态 + 快捷功能 */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* 桌面端极简展开式搜索框 */}
          {!isPlayer && onSearch && (
            <div className="relative flex items-center">
              <div className="hidden sm:block w-64 md:w-80 transition-all duration-300">
                <SearchBox
                  onSearch={handleSearch}
                  onClear={handleClear}
                  initialQuery={initialQuery}
                />
              </div>

              {/* 移动端搜索按钮 */}
              <button
                onClick={() => setMobileSearchOpen(true)}
                className="flex sm:hidden w-9 h-9 items-center justify-center rounded-full bg-white/10 border border-white/15 text-white hover:bg-white/20 transition-all cursor-pointer shadow-md"
                aria-label="打开搜索"
              >
                <Icons.Search size={16} />
              </button>
            </div>
          )}

          {/* 用户与 VIP 入口 */}
          {!isPlayer && supabaseUser && (
            <div className="flex items-center gap-2">
              <Link
                href="/profile"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 border border-white/15 rounded-full text-xs hover:bg-white/20 transition-all cursor-pointer"
                title="个人中心"
              >
                <div className="w-5 h-5 rounded-full bg-[var(--accent-color)] flex items-center justify-center text-white font-black text-[10px]">
                  {supabaseUser.email.charAt(0).toUpperCase()}
                </div>
                <span className="text-white max-w-[80px] truncate hidden md:inline">
                  {supabaseUser.email.split('@')[0]}
                </span>
                {supabaseUser.isVip && (
                  <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-500 text-black rounded-full text-[10px] font-black shadow-sm">
                    <Crown size={10} />
                    VIP
                  </span>
                )}
              </Link>
            </div>
          )}

          {!isPlayer && !supabaseUser && (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[var(--accent-color)] text-white rounded-full text-xs sm:text-sm font-bold hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-lg shadow-[var(--accent-color)]/25"
            >
              <User size={14} />
              登录
            </button>
          )}

          {/* 设置 */}
          <Link
            href={settingsHref}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 border border-white/15 text-white/80 hover:text-white hover:bg-white/20 transition-all cursor-pointer"
            aria-label="设置"
            title="播放与显示设置"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 -960 960 960">
              <path d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z" />
            </svg>
          </Link>

          {/* 移动端菜单汉堡按钮 */}
          {!isPlayer && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex lg:hidden w-9 h-9 items-center justify-center rounded-full bg-white/10 border border-white/15 text-white"
              aria-label="菜单"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          )}

          {isPlayer && <ThemeSwitcher />}
        </div>
      </div>

      {/* 移动端下拉分类抽屉 */}
      {mobileMenuOpen && !isPlayer && (
        <div className="lg:hidden bg-[#0A0A0F]/95 backdrop-blur-3xl border-b border-white/10 px-4 py-4 animate-fade-in">
          <div className="grid grid-cols-3 gap-2">
            {navCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  setMobileMenuOpen(false);
                  router.push(cat.href);
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  cat.isVip
                    ? 'bg-amber-400/10 text-amber-400 border border-amber-400/30'
                    : (pathname === cat.href || (cat.href === '/' && pathname === '') || activeCategory === cat.id)
                    ? 'bg-[var(--accent-color)] text-white shadow-md'
                    : 'bg-white/5 text-white/80 hover:bg-white/10'
                }`}
              >
                {cat.label}
              </button>
            ))}
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

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </nav>
  );
}
