'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Film, Tv, Flame, Sparkles, Trophy } from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: typeof Home;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: '首页', href: '/', icon: Home },
  { id: 'movie', label: '电影', href: '/movie', icon: Film },
  { id: 'tv', label: '电视剧', href: '/tv', icon: Tv },

  { id: 'anime', label: '动漫', href: '/anime', icon: Sparkles },
  { id: 'ranking', label: '风云榜', href: '/ranking', icon: Trophy },
];

export function MobileBottomNav() {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // 避免 SSR 水合不一致
  if (!mounted) {
    return null;
  }

  // 严密隔离：凡是午夜专区 (ikanx.com 域名、/premium 路径或带有 premium=1 的播放页)，100% 严禁渲染主站移动端底部导航
  if (typeof window !== 'undefined') {
    const isIkanXHost = window.location.hostname.includes('ikanx.com');
    const isPremiumSearch = window.location.search.includes('premium=1');
    const isPremiumPath = window.location.pathname.startsWith('/premium');
    if (isIkanXHost || isPremiumSearch || isPremiumPath) {
      return null;
    }
  }

  if (pathname?.startsWith('/premium')) {
    return null;
  }

  // 播放页隐藏底部导航，避免挡住全屏播放器与控制条
  if (pathname?.startsWith('/player')) {
    return null;
  }

  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 z-1000 bg-[#0A0A0F]/85 backdrop-blur-3xl backdrop-saturate-180 border-t border-white/10 px-2 sm:px-4 pt-1.5 pb-[max(10px,env(safe-area-inset-bottom))] shadow-[0_-10px_35px_rgba(0,0,0,0.85)] select-none">
      {/* 顶部精密流光高光反光边 (Specular Glow Highlight) */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-linear-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

      {/* 5 等分标准黄金对称网格 */}
      <div className="grid grid-cols-5 gap-1 items-center max-w-md mx-auto">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href === '/' && pathname === '') ||
            (item.href !== '/' && pathname?.startsWith(item.href));

          const IconComponent = item.icon;

          return (
            <Link
              key={item.id}
              href={item.href}
              prefetch={false}
              className={`group relative flex flex-col items-center justify-center py-1.5 px-0.5 rounded-2xl transition-all duration-300 cursor-pointer select-none active:scale-90 ${
                isActive
                  ? 'bg-linear-to-b from-red-600/18 via-red-600/8 to-transparent border border-red-500/25 shadow-[0_0_20px_rgba(229,9,20,0.22),inset_0_1px_1px_rgba(255,255,255,0.15)]'
                  : 'border border-transparent hover:bg-white/5 active:opacity-75'
              }`}
            >
              {/* 图标与微光霓虹 */}
              <div className="relative flex items-center justify-center">
                <IconComponent
                  size={20}
                  className={`transition-all duration-300 ${
                    isActive
                      ? 'text-red-500 scale-105 stroke-[2.2] drop-shadow-[0_2px_10px_rgba(239,68,68,0.55)]'
                      : 'text-white/45 group-hover:text-white/75 stroke-[1.8]'
                  }`}
                />
              </div>

              {/* 标题文字 */}
              <span
                className={`text-[10px] tracking-tight mt-1 transition-all duration-300 ${
                  isActive
                    ? 'text-white font-extrabold drop-shadow-sm'
                    : 'text-white/45 group-hover:text-white/75 font-medium'
                }`}
              >
                {item.label}
              </span>

              {/* 激活底部发光晶体呼吸胶囊点 */}
              {isActive && (
                <div className="absolute -bottom-0.5 w-3 h-0.5 rounded-full bg-linear-to-r from-red-500 via-rose-400 to-red-500 shadow-[0_0_8px_rgba(239,68,68,0.9)]" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
