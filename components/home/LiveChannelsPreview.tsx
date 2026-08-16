'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ChannelTeaser {
  id: string;
  name: string;
  category: string;
  badge: string;
  nowPlaying: string;
  logoText: string;
  gradient: string;
}

const FEATURED_CHANNELS: ChannelTeaser[] = [
  {
    id: 'cctv1',
    name: 'CCTV-1 综合',
    category: '央视频道',
    badge: '1080P 60FPS',
    nowPlaying: '新闻联播 · 晚间剧场',
    logoText: '1',
    gradient: 'from-red-600 to-rose-700',
  },
  {
    id: 'cctv5',
    name: 'CCTV-5 体育',
    category: '体育竞技',
    badge: 'LIVE 极速',
    nowPlaying: '全球顶级体育赛事直播',
    logoText: '5',
    gradient: 'from-amber-600 to-orange-700',
  },
  {
    id: 'hunan',
    name: '湖南卫视',
    category: '卫视频道',
    badge: '4K 超清',
    nowPlaying: '黄金档热播综艺 · 金鹰剧场',
    logoText: 'HN',
    gradient: 'from-yellow-500 to-amber-600',
  },
  {
    id: 'tvb',
    name: '翡翠台 TVB',
    category: '港澳频道',
    badge: '粤语原声',
    nowPlaying: '经典港剧 · 无线新闻',
    logoText: 'TVB',
    gradient: 'from-blue-600 to-indigo-700',
  },
];

export function LiveChannelsPreview() {
  const router = useRouter();

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">📡</span>
          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
            <span>电视直播 · 实时频道</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE 直连
            </span>
          </h2>
        </div>
        <Link
          href="/iptv"
          prefetch={false}
          className="text-xs font-semibold text-white/50 hover:text-white flex items-center gap-1 transition-colors"
        >
          <span>查看全部 200+ 频道</span>
          <span>→</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {FEATURED_CHANNELS.map((ch) => (
          <Link
            key={ch.id}
            href="/iptv"
            prefetch={false}
            className="group relative overflow-hidden rounded-2xl bg-[#0A0A0F]/80 backdrop-blur-xl border border-white/10 hover:border-emerald-500/40 p-4 flex items-center gap-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(16,185,129,0.15)] cursor-pointer select-none"
          >
            {/* 频道标志方块 */}
            <div
              className={`w-12 h-12 rounded-xl bg-linear-to-br ${ch.gradient} flex items-center justify-center text-white font-black text-sm shrink-0 shadow-lg group-hover:scale-105 transition-transform`}
            >
              {ch.logoText}
            </div>

            {/* 频道信息 */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <h4 className="text-sm font-bold text-white truncate group-hover:text-emerald-400 transition-colors">
                  {ch.name}
                </h4>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-white/10 text-white/70">
                  {ch.badge}
                </span>
              </div>
              <p className="text-[11px] text-white/45 truncate mt-0.5">
                {ch.nowPlaying}
              </p>
            </div>

            {/* 右侧播放微光 */}
            <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-emerald-500 text-white/40 group-hover:text-white flex items-center justify-center shrink-0 transition-all">
              <svg className="w-3.5 h-3.5 fill-current ml-0.5" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
