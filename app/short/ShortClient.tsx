'use client';

import { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CategoryHub } from '@/components/category/CategoryHub';
import { Icons } from '@/components/ui/Icon';
import { ShortDramaTrendingRail } from '@/components/home/ShortDramaTrendingRail';
import { ShortDramaForYouRail } from '@/components/home/ShortDramaForYouRail';
import { ShortCollectionsRail } from '@/components/home/ShortCollectionsRail';

const GENRES = [
  { label: '全部短剧', value: '' },
  { label: '⚡ 反转爽剧', value: 'shuangju' },
  { label: '💕 言情总裁', value: 'yanqing' },
  { label: '🏙️ 现代都市', value: 'dushi' },
  { label: '🏯 古装仙侠', value: 'guzhuang' },
  { label: '⏳ 穿越年代', value: 'chuanyue' },
  { label: '🔄 重生民国', value: 'chongsheng' },
  { label: '🔍 脑洞悬疑', value: 'naodong' },
  { label: '🤖 AI漫剧', value: 'ai' },
];

const REGIONS = [
  { label: '全部来源', value: '' },
  { label: '⚡ 爽剧打脸', value: 'shuangju' },
  { label: '💕 甜宠恋爱', value: 'yanqing' },
  { label: '🏙️ 都市职场', value: 'dushi' },
  { label: '🏯 权谋武侠', value: 'guzhuang' },
];

const YEARS = [
  { label: '全部年份', value: '' },
  { label: '2026', value: '2026' },
  { label: '2025', value: '2025' },
  { label: '2024', value: '2024' },
];

const SHELVES = [
  {
    title: '⚡ 爆款爽剧 · 逆天改命打脸封神',
    icon: '⚡',
    badge: 'SHUANGJU',
    tag: 'shuangju',
  },
  {
    title: '💕 甜宠霸总 · 豪门契约专宠千金',
    icon: '💕',
    badge: 'ROMANCE',
    tag: 'yanqing',
  },
  {
    title: '🏙️ 现代都市 · 神豪归来纵横四海',
    icon: '🏙️',
    badge: 'URBAN',
    tag: 'dushi',
  },
  {
    title: '🏯 古装仙侠 · 权谋绝色虐恋三生',
    icon: '🏯',
    badge: 'PALACE',
    tag: 'guzhuang',
  },
  {
    title: '⏳ 穿越年代 · 逆风翻盘当家做主',
    icon: '⏳',
    badge: 'REBORN',
    tag: 'chuanyue',
  },
];

interface ShortClientProps {
  topCustomRails?: React.ReactNode;
}

export default function ShortClient({ topCustomRails }: ShortClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleShortSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    router.push(`/short/player?title=${encodeURIComponent(q)}&search=1`);
  };

  // 顶层挂接：0. 短剧专属搜索栏 1. 实时热搜榜 TOP10 2. 猜你想追推荐 3. 6大主题策展片单
  const shortRails = (
    <div className="space-y-6 my-2">
      {/* 短剧专属频道搜索栏 */}
      <div className="pt-2 pb-1">
        <form
          onSubmit={handleShortSearch}
          className="flex items-center gap-2 max-w-2xl mx-auto bg-white/5 hover:bg-white/10 focus-within:bg-white/10 border border-white/10 focus-within:border-(--accent-color) rounded-2xl px-4 py-2.5 sm:py-3 transition-all shadow-xl"
        >
          <Icons.Search size={18} className="text-white/40 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="在 36,000+ 部短剧中搜索剧名（如：龙王、战神、夫人、逆袭）..."
            className="w-full bg-transparent text-sm sm:text-base text-white placeholder-white/30 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!searchQuery.trim()}
            className="px-4 py-1.5 bg-(--accent-color) hover:brightness-110 disabled:opacity-40 disabled:hover:brightness-100 text-white rounded-xl text-xs sm:text-sm font-bold shrink-0 transition-all cursor-pointer"
          >
            搜短剧
          </button>
        </form>
      </div>

      <ShortDramaTrendingRail />
      <ShortDramaForYouRail />
      <ShortCollectionsRail />
      {topCustomRails}
    </div>
  );

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
          <div className="brand-spinner" />
        </div>
      }
    >
      <CategoryHub
        categoryTitle="精品微短剧"
        categorySubtitle="36,000+ 热门短剧 · 9大精细分类 · 9:16 竖屏上下滑动沉浸全集连播"
        doubanType="tv"
        activeNav="short"
        genres={GENRES}
        regions={REGIONS}
        years={YEARS}
        shelves={SHELVES}
        defaultTag="shuangju"
        usePrebakedOnly={false}
        shortDramaMode={true}
        topCustomRails={shortRails}
      />
    </Suspense>
  );
}
