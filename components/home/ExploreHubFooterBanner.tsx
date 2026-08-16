'use client';

import Link from 'next/link';

interface HubFeature {
  title: string;
  tag: string;
  desc: string;
  href: string;
  tags: string[];
  gradient: string;
  borderHover: string;
}

const HUB_FEATURES: HubFeature[] = [
  {
    title: '🎬 电影大厅',
    tag: '4K CINEMA',
    desc: '全球院线大片 · 豆瓣 9.0+ 影史神作',
    href: '/movie',
    tags: ['动作', '科幻', '悬疑', '犯罪', '喜剧', '经典高分'],
    gradient: 'from-rose-950/40 via-red-900/10 to-transparent',
    borderHover: 'hover:border-rose-500/50',
  },
  {
    title: '📺 连续剧集',
    tag: 'GLOBAL TV',
    desc: '2026 华语大剧 · 顶级美剧 · 热门韩剧',
    href: '/tv',
    tags: ['国产热播', '权游美剧', '爆款韩剧', '高分日剧', '古装武侠'],
    gradient: 'from-amber-950/40 via-yellow-900/10 to-transparent',
    borderHover: 'hover:border-amber-500/50',
  },
  {
    title: '🏮 国创国漫',
    tag: 'GUOMAN HUB',
    desc: '东方玄幻修真年番 · 3D 末世科幻巨制',
    href: '/guoman',
    tags: ['凡人修仙', '遮天', '完美世界', '仙逆', '吞噬星空', '剑来'],
    gradient: 'from-orange-950/40 via-amber-900/10 to-transparent',
    borderHover: 'hover:border-orange-500/50',
  },
  {
    title: '⚡ 动漫新番',
    tag: 'ANIME HUB',
    desc: '当季热血新番 · 日本连载 · 经典剧场版',
    href: '/anime',
    tags: ['2026 新番', '热血战斗', '奇幻冒险', '咒术回战', '治愈日常'],
    gradient: 'from-purple-950/40 via-indigo-900/10 to-transparent',
    borderHover: 'hover:border-purple-500/50',
  },
  {
    title: '🎤 热门综艺',
    tag: 'VARIETY SHOW',
    desc: '爆笑真人秀 · 顶级音乐竞演 · 名场面脱口秀',
    href: '/variety',
    tags: ['热门真人秀', '脱口秀', '音乐竞技', '美食旅行', '韩国综艺'],
    gradient: 'from-emerald-950/40 via-teal-900/10 to-transparent',
    borderHover: 'hover:border-emerald-500/50',
  },
];

export function ExploreHubFooterBanner() {
  return (
    <div className="mt-14 pt-10 border-t border-white/10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <span>🧭</span>
            <span>全库多维分类检索大厅</span>
          </h2>
          <p className="text-xs sm:text-sm text-white/50 mt-1">
            支持按题材类型、国家地区、上映年份、口碑评分进行多维度交叉筛选
          </p>
        </div>

        <Link
          href="/ranking"
          prefetch={false}
          className="self-start sm:self-auto px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-white/10 hover:border-white/20 cursor-pointer"
        >
          <span>查看实时排行榜</span>
          <span>→</span>
        </Link>
      </div>

      {/* 5 大专区卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {HUB_FEATURES.map((hub) => (
          <Link
            key={hub.title}
            href={hub.href}
            prefetch={false}
            className={`group relative overflow-hidden rounded-3xl bg-[#0A0A0F]/90 border border-white/10 ${hub.borderHover} p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl cursor-pointer`}
          >
            {/* 背景流光 */}
            <div className={`absolute inset-0 bg-linear-to-b ${hub.gradient} opacity-50 group-hover:opacity-100 transition-opacity`} />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md text-white/80 border border-white/10">
                  {hub.tag}
                </span>
                <span className="text-sm text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all">
                  进入专区 →
                </span>
              </div>

              <h3 className="text-lg font-black text-white group-hover:text-(--accent-color) transition-colors">
                {hub.title}
              </h3>
              <p className="text-xs text-white/50 leading-relaxed mt-1">
                {hub.desc}
              </p>
            </div>

            {/* 包含的常用热词标签 */}
            <div className="relative z-10 flex flex-wrap gap-1.5 mt-6 pt-4 border-t border-white/5">
              {hub.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] px-2 py-0.5 rounded-lg bg-white/5 group-hover:bg-white/10 text-white/60 group-hover:text-white/90 transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
