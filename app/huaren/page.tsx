'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Navbar } from '@/components/layout/Navbar';
import { SearchForm } from '@/components/search/SearchForm';
import { SearchResults } from '@/components/home/SearchResults';
import { useHomePage } from '@/lib/hooks/useHomePage';
import { Play, ChevronRight, Flame, Loader2 } from 'lucide-react';

// API 返回的数据类型
interface HuarenVideoItem {
  vodId: string;
  title: string;
  cover: string;
  badge?: string;
  status?: string;
  score?: string;
  type?: 'movie' | 'tv' | 'variety' | 'anime';
}

interface HuarenSection {
  id: string;
  title: string;
  moreLink: string;
  items: HuarenVideoItem[];
}

// 安全代理封面图 (确保 100% 显示)
function getSafeCoverUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  if (rawUrl.startsWith('/api/')) return rawUrl;
  return `/api/img-proxy?url=${encodeURIComponent(rawUrl)}`;
}

function HuarenHome() {
  const router = useRouter();
  const [sections, setSections] = useState<HuarenSection[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    query,
    hasSearched,
    loading: searchLoading,
    results: searchResults,
    availableSources,
    handleSearch,
    handleReset,
  } = useHomePage();

  // 从 API 加载 huaren.live 真实数据
  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      try {
        const resp = await fetch('/api/huaren?mode=home');
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        if (!cancelled && data.sections) {
          setSections(data.sections);
        }
      } catch (err) {
        console.error('华人专区数据加载失败:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadData();
    return () => { cancelled = true; };
  }, []);

  // 播放逻辑：传 title 搜索 36 大专线秒播
  const handlePlayVideo = useCallback((item: HuarenVideoItem) => {
    if (!item.title) return;
    const cleanTitle = item.title.trim();
    const typeParam = item.type === 'movie' ? 'movie' : 'tv';
    router.push(`/player?title=${encodeURIComponent(cleanTitle)}&type=${typeParam}`);
  }, [router]);

  return (
    <div className="min-h-screen bg-[#14151B] text-white relative overflow-x-hidden selection:bg-rose-500 selection:text-white">
      <Navbar onReset={handleReset} />

      {/* 搜索栏 */}
      <div className="fluid-container mt-4 mb-6 relative z-30">
        <SearchForm
          onSearch={handleSearch}
          onClear={handleReset}
          isLoading={searchLoading}
        />
      </div>

      <main className="fluid-container pb-24 space-y-12">
        {hasSearched ? (
          <SearchResults
            query={query}
            loading={searchLoading}
            results={searchResults}
            availableSources={availableSources}
          />
        ) : loading ? (
          /* 加载骨架屏 */
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 size={36} className="text-rose-500 animate-spin" />
            <p className="text-white/50 text-sm">正在加载华人专区真实数据...</p>
          </div>
        ) : sections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <p className="text-white/50 text-sm">暂无数据，请稍后刷新重试</p>
          </div>
        ) : (
          /* 真实板块渲染 */
          sections.map((section) => (
            <section key={section.id} className="space-y-4">
              {/* 板块 Header */}
              <div className="flex items-center gap-3">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {section.title}
                </h2>
                <button
                  onClick={() => window.open(`https://huaren.live${section.moreLink}`, '_blank')}
                  className="text-xs text-white/50 hover:text-white flex items-center transition-colors cursor-pointer mt-0.5"
                >
                  <span>更多</span>
                  <ChevronRight size={14} />
                </button>
              </div>

              {/* 卡片网格 */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-4">
                {section.items.map((item) => (
                  <HuarenMovieCard
                    key={item.vodId}
                    item={item}
                    onClick={() => handlePlayVideo(item)}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </main>
    </div>
  );
}

// 真实 huaren.live 封面卡片组件
function HuarenMovieCard({
  item,
  onClick,
}: {
  item: HuarenVideoItem;
  onClick: () => void;
}) {
  const [imgError, setImgError] = useState(false);
  const coverUrl = getSafeCoverUrl(item.cover);

  return (
    <div
      onClick={onClick}
      className="group relative flex flex-col cursor-pointer select-none transition-transform duration-300 hover:-translate-y-1.5"
    >
      {/* 封面 (3:4 比例) */}
      <div className="relative aspect-[3/4] w-full rounded-2xl bg-[#1C1D24] overflow-hidden shadow-lg border border-white/[0.04] group-hover:border-white/20 transition-all">
        {!imgError && coverUrl ? (
          <Image
            src={coverUrl}
            alt={item.title}
            fill
            unoptimized
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
            className="object-cover object-center scale-100 group-hover:scale-106 transition-transform duration-700 ease-out"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-900 to-black flex flex-col items-center justify-center p-3 text-center">
            <span className="text-xs font-bold text-white/80 line-clamp-2">{item.title}</span>
          </div>
        )}

        {/* 渐变遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 opacity-60 group-hover:opacity-30 transition-opacity" />

        {/* 标签 Badge */}
        {item.badge && (
          <div className="absolute top-2 right-2 z-20 px-2 py-0.5 rounded-md text-[10px] font-bold shadow-md bg-amber-500/90 text-black">
            {item.badge}
          </div>
        )}

        {/* 评分 */}
        {item.score && item.score !== '未出分' && (
          <div className="absolute bottom-2 right-2 z-20 px-1.5 py-0.5 rounded-md text-[10px] font-bold shadow-md bg-black/70 text-amber-400 backdrop-blur-sm">
            ⭐ {item.score}
          </div>
        )}

        {/* 集数状态 */}
        {item.status && (
          <div className="absolute bottom-2 left-2 z-20 px-1.5 py-0.5 rounded-md text-[10px] font-medium shadow-md bg-black/70 text-white/80 backdrop-blur-sm">
            {item.status}
          </div>
        )}

        {/* 悬停播放图标 */}
        <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center shadow-xl scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play size={20} className="fill-white ml-0.5" />
          </div>
        </div>
      </div>

      {/* 标题 */}
      <div className="pt-2.5 px-0.5">
        <h4 className="text-xs sm:text-sm font-bold text-white/95 group-hover:text-rose-400 line-clamp-1 transition-colors">
          {item.title}
        </h4>
      </div>
    </div>
  );
}

export default function HuarenPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#14151B]">
        <div className="w-8 h-8 rounded-full border-2 border-rose-500 border-t-transparent animate-spin" />
      </div>
    }>
      <HuarenHome />
    </Suspense>
  );
}
