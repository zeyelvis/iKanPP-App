'use client';

import React, { Suspense, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { CategoryHub } from '@/components/category/CategoryHub';
import { Icons } from '@/components/ui/Icon';
import { ShortDramaTrendingRail } from '@/components/home/ShortDramaTrendingRail';
import { ShortDramaForYouRail } from '@/components/home/ShortDramaForYouRail';
import { ShortCollectionsRail } from '@/components/home/ShortCollectionsRail';
import { getOptimizedImageUrl } from '@/lib/utils/image-utils';
import { SHORT_HOME_DATA } from '@/lib/data/home-prebaked-extra';

const GENRES = [
  { label: '全部短剧', value: '' },
  { label: '🤖 2026 AI短剧', value: 'ai' },
  { label: '⚡ 反转爽剧', value: 'shuangju' },
  { label: '💕 言情总裁', value: 'yanqing' },
  { label: '🏙️ 现代都市', value: 'dushi' },
  { label: '🏯 古装仙侠', value: 'guzhuang' },
  { label: '⏳ 穿越年代', value: 'chuanyue' },
  { label: '🔄 重生民国', value: 'chongsheng' },
  { label: '🔍 脑洞悬疑', value: 'naodong' },
];

const REGIONS = [
  { label: '全部来源', value: '' },
  { label: '🤖 AI生成漫剧', value: 'ai' },
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
    title: '🤖 2026 AI短剧 · 生成式大模型脑洞神作',
    icon: '🤖',
    badge: '2026 AI HOT',
    tag: 'ai',
  },
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

function ShortContent({ topCustomRails }: ShortClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlQ = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(urlQ);
  const [activeKeyword, setActiveKeyword] = useState(urlQ);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // 触发搜索核心请求
  const triggerSearch = useCallback((keyword: string) => {
    const q = keyword.trim();
    setActiveKeyword(q);
    if (!q) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    fetch(`/api/short-dramas/search?q=${encodeURIComponent(q)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setSearchResults(data?.list || []);
      })
      .catch(() => {
        setSearchResults([]);
      })
      .finally(() => {
        setIsSearching(false);
      });
  }, []);

  // 监听 URL 中的 ?q= 参数变化
  useEffect(() => {
    if (urlQ) {
      setSearchQuery(urlQ);
      triggerSearch(urlQ);
    } else {
      setSearchQuery('');
      setActiveKeyword('');
      setSearchResults([]);
    }
  }, [urlQ, triggerSearch]);

  const handleShortSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;

    // 更新 URL，同时唤起搜索
    const p = new URLSearchParams(window.location.search);
    p.set('q', q);
    window.history.pushState(null, '', `${window.location.pathname}?${p.toString()}`);
    triggerSearch(q);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setActiveKeyword('');
    setSearchResults([]);
    const p = new URLSearchParams(window.location.search);
    p.delete('q');
    const qs = p.toString();
    window.history.pushState(null, '', qs ? `${window.location.pathname}?${qs}` : window.location.pathname);
  };

  const handlePlayDrama = (item: any) => {
    const query = new URLSearchParams();
    query.set('title', item.title);
    if (item.firstPlayUrl || item.playUrl) query.set('url', item.firstPlayUrl || item.playUrl);
    if (item.poster) query.set('poster', item.poster);
    query.set('ep', '1');
    router.push(`/short/player?${query.toString()}`);
  };

  // 顶层挂接：短剧专属搜索栏 +（搜索结果展示 OR 推荐热播栏）
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
            placeholder="在 36,000+ 部短剧中搜索剧名（如：神豪、2026 AI短剧、暴君、逆袭）..."
            className="w-full bg-transparent text-sm sm:text-base text-white placeholder-white/30 focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="text-white/40 hover:text-white text-xs p-1"
              title="清空输入"
            >
              <Icons.X size={16} />
            </button>
          )}
          <button
            type="submit"
            disabled={!searchQuery.trim()}
            className="px-4 py-1.5 bg-(--accent-color) hover:brightness-110 disabled:opacity-40 disabled:hover:brightness-100 text-white rounded-xl text-xs sm:text-sm font-bold shrink-0 transition-all cursor-pointer shadow-md"
          >
            搜短剧
          </button>
        </form>
      </div>

      {/* 搜索结果展示区：用户搜索后立即展示匹配的网格列表 */}
      {activeKeyword ? (
        <div className="bg-[#12131F]/90 backdrop-blur-2xl border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl animate-fadeIn">
          {/* 搜索结果头部信息 */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🔍</span>
              <div>
                <h2 className="text-base sm:text-lg font-black text-white">
                  “<span className="text-(--accent-color)">{activeKeyword}</span>” 的短剧搜索结果
                </h2>
                <p className="text-xs text-white/50 mt-0.5">
                  {isSearching ? '正在全网 36,000+ 部短剧中极速检索...' : `共找到 ${searchResults.length} 部相关微短剧`}
                </p>
              </div>
            </div>
            <button
              onClick={handleClearSearch}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-white/80 hover:text-white text-xs font-bold transition-all cursor-pointer border border-white/10 active:scale-95"
            >
              <Icons.X size={14} />
              <span>返回推荐</span>
            </button>
          </div>

          {/* 搜索中骨架屏 */}
          {isSearching && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="aspect-[9/14] rounded-2xl bg-white/5 animate-pulse" />
              ))}
            </div>
          )}

          {/* 搜索结果卡片列表 */}
          {!isSearching && searchResults.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {searchResults.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handlePlayDrama(item)}
                  className="group relative flex flex-col cursor-pointer transition-all duration-300 active:scale-95 select-none"
                >
                  <div className="relative aspect-[9/14] w-full rounded-2xl overflow-hidden bg-[#161724] border border-white/10 group-hover:border-(--accent-color) shadow-lg group-hover:shadow-[0_12px_28px_rgba(229,9,20,0.35)] transition-all">
                    <Image
                      src={getOptimizedImageUrl(item.poster)}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />

                    {/* 右上角总集数标签 */}
                    {item.remarks && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-white/15 text-white font-black text-[10px] sm:text-xs shadow-md">
                        {item.remarks}
                      </div>
                    )}

                    {/* 悬停播放指示层 */}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 rounded-full bg-(--accent-color) flex items-center justify-center text-white shadow-2xl scale-90 group-hover:scale-100 transition-transform">
                        <Icons.Play size={22} className="fill-white ml-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* 标题与描述 */}
                  <div className="mt-2 min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-(--accent-color) transition-colors">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-white/50">
                      <span>{item.categoryName || '短剧'}</span>
                      {item.year && <span>· {item.year}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 0 匹配空状态友好引导 */}
          {!isSearching && searchResults.length === 0 && (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <Icons.Search size={40} className="text-white/20 mb-3" />
              <p className="text-sm text-white/70 font-bold mb-1">
                未找到与 “{activeKeyword}” 相关的微短剧
              </p>
              <p className="text-xs text-white/40 mb-4">您可以尝试以下 2026 爆款短剧热搜词：</p>
              <div className="flex items-center gap-2 flex-wrap justify-center max-w-md">
                {['神豪', '2026 AI短剧', '暴君', '逆袭', '战神', '总裁', '重生'].map((kw) => (
                  <button
                    key={kw}
                    onClick={() => {
                      setSearchQuery(kw);
                      const p = new URLSearchParams(window.location.search);
                      p.set('q', kw);
                      window.history.pushState(null, '', `${window.location.pathname}?${p.toString()}`);
                      triggerSearch(kw);
                    }}
                    className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/80 hover:text-white transition-all cursor-pointer"
                  >
                    {kw}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* 未搜索时：展示常规精选热播栏 */
        <>
          <ShortDramaTrendingRail />
          <ShortDramaForYouRail />
          <ShortCollectionsRail />
        </>
      )}

      {topCustomRails}
    </div>
  );

  return (
    <CategoryHub
      categoryTitle="精品微短剧"
      categorySubtitle="36,000+ 热门短剧 · 9大精细分类 · 9:16 竖屏上下滑动沉浸全集连播"
      doubanType="tv"
      activeNav="short"
      genres={GENRES}
      regions={REGIONS}
      years={YEARS}
      shelves={activeKeyword ? [] : SHELVES}
      defaultTag="shuangju"
      usePrebakedOnly={false}
      shortDramaMode={true}
      topCustomRails={shortRails}
      heroItems={SHORT_HOME_DATA.hero}
    />
  );
}

export default function ShortClient(props: ShortClientProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
          <div className="brand-spinner" />
        </div>
      }
    >
      <ShortContent {...props} />
    </Suspense>
  );
}
