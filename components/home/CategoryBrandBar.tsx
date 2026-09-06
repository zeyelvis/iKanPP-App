'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface HubTile {
  title: string;
  subtitle: string;
  icon: string;
  tag: string;
  href: string;
  gradient: string;
  glow: string;
  border: string;
}

const HUB_TILES: HubTile[] = [
  {
    title: '电影大厅',
    subtitle: '4K 院线巨制 · 豆瓣高分',
    icon: '🎬',
    tag: '4K ULTRA',
    href: '/movie',
    gradient: 'from-rose-600/30 via-red-500/10 to-transparent',
    glow: 'group-hover:shadow-[0_8px_30px_rgba(225,29,72,0.25)]',
    border: 'group-hover:border-rose-500/50',
  },
  {
    title: '连续剧集',
    subtitle: '全球热播 · 华语大剧 · 美剧',
    icon: '📺',
    tag: 'SERIES',
    href: '/tv',
    gradient: 'from-amber-600/30 via-orange-500/10 to-transparent',
    glow: 'group-hover:shadow-[0_8px_30px_rgba(245,158,11,0.25)]',
    border: 'group-hover:border-amber-500/50',
  },
  {
    title: '国创 & 动漫',
    subtitle: '国漫年番 · 日本新番热血',
    icon: '🏮',
    tag: 'ANIME',
    href: '/anime',
    gradient: 'from-orange-600/30 via-amber-500/10 to-transparent',
    glow: 'group-hover:shadow-[0_8px_30px_rgba(249,115,22,0.25)]',
    border: 'group-hover:border-orange-500/50',
  },
  {
    title: '动漫新番',
    subtitle: '当季连载 · 日本新番 · 经典',
    icon: '⚡',
    tag: 'ANIME',
    href: '/anime',
    gradient: 'from-purple-600/30 via-indigo-500/10 to-transparent',
    glow: 'group-hover:shadow-[0_8px_30px_rgba(168,85,247,0.25)]',
    border: 'group-hover:border-purple-500/50',
  },
  {
    title: '热门综艺',
    subtitle: '爆笑真人秀 · 脱口秀竞演',
    icon: '🎤',
    tag: 'VARIETY',
    href: '/variety',
    gradient: 'from-emerald-600/30 via-teal-500/10 to-transparent',
    glow: 'group-hover:shadow-[0_8px_30px_rgba(16,185,129,0.25)]',
    border: 'group-hover:border-emerald-500/50',
  },
  {
    title: '电视直播',
    subtitle: '央视卫视 · 4K 原画 · 港澳台',
    icon: '📡',
    tag: 'LIVE IPTV',
    href: '/iptv',
    gradient: 'from-blue-600/30 via-cyan-500/10 to-transparent',
    glow: 'group-hover:shadow-[0_8px_30px_rgba(59,130,246,0.25)]',
    border: 'group-hover:border-blue-500/50',
  },
  {
    title: '实时风云榜',
    subtitle: '全网 TOP 10 · 豆瓣影史神作',
    icon: '🏆',
    tag: 'RANKING',
    href: '/ranking',
    gradient: 'from-yellow-600/30 via-amber-500/10 to-transparent',
    glow: 'group-hover:shadow-[0_8px_30px_rgba(234,179,8,0.25)]',
    border: 'group-hover:border-yellow-500/50',
  },
];

export function CategoryBrandBar() {
  const router = useRouter();

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">✨</span>
          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
            频道直通入口
          </h2>
        </div>
        <span className="text-xs text-white/40 hidden sm:inline">
          一键直达专属流媒体频道
        </span>
      </div>

      <div className="flex overflow-x-auto no-scrollbar sm:grid sm:grid-cols-3 lg:grid-cols-7 gap-2.5 sm:gap-4 pb-2 sm:pb-0 px-0.5 sm:px-0">
        {HUB_TILES.map((tile) => (
          <Link
            key={tile.title}
            href={tile.href}
            prefetch={false}
            className={`group relative overflow-hidden rounded-2xl bg-[#0A0A0F]/90 border border-white/10 p-3 sm:p-5 flex flex-col justify-between transition-all duration-300 active:scale-95 hover:-translate-y-1 ${tile.glow} ${tile.border} cursor-pointer w-34 sm:w-auto shrink-0`}
          >
            {/* 背景动态流光渐变 */}
            <div
              className={`absolute inset-0 bg-linear-to-br ${tile.gradient} opacity-40 group-hover:opacity-100 transition-opacity duration-500`}
            />

            {/* 顶部图标与徽章 */}
            <div className="relative z-10 flex items-center justify-between mb-3 sm:mb-4">
              <span className="text-2xl sm:text-3xl filter drop-shadow-md group-hover:scale-110 transition-transform duration-300">
                {tile.icon}
              </span>
              <span className="text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-md text-white/70 border border-white/10">
                {tile.tag}
              </span>
            </div>

            {/* 标题与描述 */}
            <div className="relative z-10">
              <h3 className="text-xs sm:text-base font-black text-white group-hover:text-(--accent-color) transition-colors flex items-center gap-1">
                <span>{tile.title}</span>
                <span className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-xs hidden sm:inline">
                  →
                </span>
              </h3>
              <p className="text-[10px] sm:text-[11px] text-white/45 truncate mt-0.5 font-medium">
                {tile.subtitle}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
