'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Film, Tv, Flame, Trophy, User } from 'lucide-react';
import { useUserStore } from '@/lib/store/user-store';

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
  { id: 'guoman', label: '国漫', href: '/guoman', icon: Flame },
  { id: 'ranking', label: '风云榜', href: '/ranking', icon: Trophy },
  { id: 'profile', label: '我的', href: '/profile', icon: User },
];

export function MobileBottomNav() {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { user } = useUserStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  // 避免 SSR 水合不一致
  if (!mounted) {
    return null;
  }

  // 播放页隐藏底部导航，避免挡住全屏播放器与控制条
  if (pathname?.startsWith('/player')) {
    return null;
  }

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-1000 bg-[#0A0A0F]/95 backdrop-blur-2xl border-t border-white/10 px-2 pt-2 pb-[max(8px,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(0,0,0,0.8)]">
      <div className="grid grid-cols-6 gap-1 items-center max-w-md mx-auto">
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
              className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all duration-200 cursor-pointer relative ${
                isActive
                  ? 'text-(--accent-color)'
                  : 'text-white/50 hover:text-white/80 active:scale-95'
              }`}
            >
              {/* 图标与微动画 */}
              <div className="relative">
                <IconComponent
                  size={20}
                  className={`transition-transform duration-200 ${
                    isActive ? 'scale-110 stroke-[2.5]' : 'stroke-2'
                  }`}
                />
                {/* 如果是个人中心且未登录，小红点提示 */}
                {item.id === 'profile' && user?.isVip && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-black" />
                )}
              </div>

              {/* 标题 */}
              <span
                className={`text-[10px] tracking-tight mt-1 transition-all ${
                  isActive ? 'font-bold' : 'font-medium'
                }`}
              >
                {item.label}
              </span>

              {/* 激活底部发光短横条 */}
              {isActive && (
                <div className="absolute -bottom-1 w-3 h-0.5 rounded-full bg-(--accent-color) shadow-[0_0_8px_var(--accent-color)]" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
