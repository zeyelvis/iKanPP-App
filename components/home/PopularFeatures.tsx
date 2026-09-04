'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import { HeroSlideshow } from './TmdbSlideshow';
import { Top10Rail } from './Top10Rail';
import { ContentRail } from './ContentRail';
import { CategoryBrandBar } from './CategoryBrandBar';
import { ContinueWatchingRail } from './ContinueWatchingRail';
import { LiveChannelsPreview } from './LiveChannelsPreview';
import { PlatformFeaturesStrip } from './PlatformFeaturesStrip';
import { PersonalizedForYouRail } from './PersonalizedForYouRail';
import { ExploreHubFooterBanner } from './ExploreHubFooterBanner';
import { PREBAKED_HOME_DATA } from '@/lib/data/home-prebaked';

interface PopularFeaturesProps {
  onSearch?: (query: string) => void;
}

// ── SWR 货架本地瞬间缓存 ──────────────────────────
const SHELVES_CACHE_KEY = 'kvideo-home-shelves-v5-';

function getLocalShelves(type: 'movie' | 'tv') {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SHELVES_CACHE_KEY + type);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.s1) && parsed.s1.length > 0) {
      return parsed;
    }
  } catch {}
  return null;
}

function setLocalShelves(type: 'movie' | 'tv', data: { s1: any[]; s2: any[]; s3: any[]; s4: any[] }) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SHELVES_CACHE_KEY + type, JSON.stringify(data));
  } catch {}
}

// ── 豆瓣一周口碑榜 SWR 本地秒开缓存 ──────────────────────────
const WEEKLY_CHART_CACHE_KEY = 'kvideo-weekly-douban-chart-v2-';

function getLocalWeeklyChart(type: 'movie' | 'tv') {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(WEEKLY_CHART_CACHE_KEY + type);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {}
  return null;
}

function setLocalWeeklyChart(type: 'movie' | 'tv', data: any[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(WEEKLY_CHART_CACHE_KEY + type, JSON.stringify(data));
  } catch {}
}

export function PopularFeatures({ onSearch }: PopularFeaturesProps) {
  const router = useRouter();
  const [contentType, setContentType] = useState<'movie' | 'tv'>('movie');

  // 主题货架分片数据获取（SWR: 优先使用本地缓存，新用户首次访问直接秒级呈现预烘焙高清精选数据，0ms 瞬间秒开）
  const initialCache = typeof window !== 'undefined' ? getLocalShelves(contentType) : null;
  const prebaked = PREBAKED_HOME_DATA[contentType];

  // 豆瓣一周口碑榜 TOP 10（首屏 0ms 瞬间秒出，后台静默自动每日同步）
  const initialWeeklyCache = typeof window !== 'undefined' ? getLocalWeeklyChart(contentType) : null;
  const [weeklyMovies, setWeeklyMovies] = useState<any[]>(() => initialWeeklyCache || prebaked.top10);
  const [weeklyLoading, setWeeklyLoading] = useState<boolean>(false);

  const [shelf1Movies, setShelf1Movies] = useState<any[]>(() => initialCache?.s1 || prebaked.s1);
  const [shelf2Movies, setShelf2Movies] = useState<any[]>(() => initialCache?.s2 || prebaked.s2);
  const [shelf3Movies, setShelf3Movies] = useState<any[]>(() => initialCache?.s3 || prebaked.s3);
  const [shelf4Movies, setShelf4Movies] = useState<any[]>(() => initialCache?.s4 || prebaked.s4);
  const [loadingShelves, setLoadingShelves] = useState<boolean>(false);

  // 根据 contentType 动态确定 4 个货架的标签
  const isMovie = contentType === 'movie';
  const tag1 = isMovie ? '最新' : '国产剧';
  const tag2 = isMovie ? '豆瓣高分' : '美剧';
  const tag3 = isMovie ? '华语' : '韩剧';
  const tag4 = isMovie ? '欧美' : '日本动画';

  useEffect(() => {
    let isMounted = true;
    const cache = getLocalShelves(contentType);
    if (cache) {
      setShelf1Movies(cache.s1);
      setShelf2Movies(cache.s2);
      setShelf3Movies(cache.s3);
      setShelf4Movies(cache.s4);
    }
    // 始终保持 false，首屏直接基于预烘焙数据秒开，后台异步静默更新
    setLoadingShelves(false);

    const fetchShelves = async () => {
      const fetchWithTimeout = async (url: string, timeoutMs = 2000) => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
          const res = await fetch(url, { signal: controller.signal });
          if (!res.ok) return { subjects: [] };
          return await res.json();
        } catch {
          return { subjects: [] };
        } finally {
          clearTimeout(timer);
        }
      };

      try {
        // 第一阶段：优先极速拉取前 2 个首屏高光货架
        const [res1, res2] = await Promise.allSettled([
          fetchWithTimeout(`/api/douban/recommend?tag=${encodeURIComponent(tag1)}&type=${contentType}&page_limit=14&page_start=0`),
          fetchWithTimeout(`/api/douban/recommend?tag=${encodeURIComponent(tag2)}&type=${contentType}&page_limit=14&page_start=0`),
        ]);

        if (isMounted) {
          const s1 = res1.status === 'fulfilled' && res1.value?.subjects?.length ? res1.value.subjects : [];
          const s2 = res2.status === 'fulfilled' && res2.value?.subjects?.length ? res2.value.subjects : [];
          if (s1.length) setShelf1Movies(s1);
          if (s2.length) setShelf2Movies(s2);
        }

        // 第二阶段：轻量延迟 1 秒后拉取后 2 个货架，彻底释放网络并发通道
        await new Promise(r => setTimeout(r, 1000));
        if (!isMounted) return;

        const [res3, res4] = await Promise.allSettled([
          fetchWithTimeout(`/api/douban/recommend?tag=${encodeURIComponent(tag3)}&type=${contentType}&page_limit=14&page_start=0`),
          fetchWithTimeout(`/api/douban/recommend?tag=${encodeURIComponent(tag4)}&type=${contentType}&page_limit=14&page_start=0`),
        ]);

        if (isMounted) {
          const s3 = res3.status === 'fulfilled' && res3.value?.subjects?.length ? res3.value.subjects : [];
          const s4 = res4.status === 'fulfilled' && res4.value?.subjects?.length ? res4.value.subjects : [];
          if (s3.length) setShelf3Movies(s3);
          if (s4.length) setShelf4Movies(s4);

          setLocalShelves(contentType, {
            s1: (shelf1Movies.length ? shelf1Movies : cache?.s1) || [],
            s2: (shelf2Movies.length ? shelf2Movies : cache?.s2) || [],
            s3: (s3.length ? s3 : (cache?.s3 || [])),
            s4: (s4.length ? s4 : (cache?.s4 || [])),
          });
        }
      } catch (err) {
        // 静默降级至预烘焙种子数据
      } finally {
        if (isMounted) setLoadingShelves(false);
      }
    };

    fetchShelves();
    return () => {
      isMounted = false;
    };
  }, [contentType, tag1, tag2, tag3, tag4]);

  // ── 豆瓣一周口碑榜：后台静默每日自动更新 ──────────────────
  useEffect(() => {
    let isMounted = true;
    const cache = getLocalWeeklyChart(contentType);
    if (cache && cache.length > 0) {
      setWeeklyMovies(cache);
    } else if (PREBAKED_HOME_DATA[contentType]?.top10) {
      setWeeklyMovies(PREBAKED_HOME_DATA[contentType].top10);
    }

    const fetchWeekly = async () => {
      try {
        const res = await fetch(`/api/douban/weekly-chart?type=${contentType}`, {
          signal: AbortSignal.timeout(4000),
        });
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && data.subjects && Array.isArray(data.subjects) && data.subjects.length > 0) {
          setWeeklyMovies(data.subjects);
          setLocalWeeklyChart(contentType, data.subjects);
        }
      } catch {
        // 网络超时或失败时平滑兜底当前缓存或预烘焙口碑榜
      } finally {
        if (isMounted) setWeeklyLoading(false);
      }
    };

    fetchWeekly();
    return () => {
      isMounted = false;
    };
  }, [contentType]);

  // ── 全局流媒体防重管道（Deduplication Funnel） ──────────────────
  // 按照页面视觉从上至下的动线流动，严格依次排除上游模块已展示过的影片：
  // 1. Hero 巨幕专属大片 -> 标记已看
  // 2. 豆瓣一周口碑榜 TOP 10 -> 剔除 Hero 重复项，标记已看
  // 3. 货架 1（院线/新剧） -> 剔除前面所有重复项，用预置池补足
  // 4. 货架 2（高分/美剧） -> 剔除前面所有重复项，用预置池补足
  // 5. 货架 3（华语/韩剧） -> 剔除前面所有重复项，用预置池补足
  // 6. 货架 4（科幻/动漫） -> 剔除前面所有重复项，用预置池补足
  const deduplicatedContent = useMemo(() => {
    const seen = new Set<string>();

    // 辅助归一化标题函数（去除季数、括号等轻微差异，防止重复）
    const normalize = (t: string) =>
      (t || '')
        .replace(/\s*第[一二三四五六七八九十\d]+季/, '')
        .replace(/\s*年番/, '')
        .replace(/\s*[（(][^)）]*[)）]/g, '')
        .trim()
        .toLowerCase();

    // 1. Hero 巨幕：专属大片
    const heroPool = prebaked.hero || [];
    const heroList: any[] = [];
    for (const item of heroPool) {
      const key = normalize(item.title);
      if (key && !seen.has(key)) {
        seen.add(key);
        heroList.push(item);
      }
    }

    // 2. 豆瓣一周口碑榜 TOP 10：从实际口碑榜中选出 10 部作品（排查 Hero 零重复）
    const top10Source = (weeklyMovies && weeklyMovies.length > 0) ? weeklyMovies : (prebaked.top10 || []);
    const top10List: any[] = [];
    for (const item of top10Source) {
      if (top10List.length >= 10) break;
      const key = normalize(item.title);
      if (key && !seen.has(key)) {
        seen.add(key);
        top10List.push(item);
      }
    }
    // 若因过滤不足 10 部，从 prebaked.top10 补足
    if (top10List.length < 10 && prebaked.top10) {
      for (const item of prebaked.top10) {
        if (top10List.length >= 10) break;
        const key = normalize(item.title);
        if (key && !seen.has(key)) {
          seen.add(key);
          top10List.push(item);
        }
      }
    }

    // 3. 通用货架过滤填充器
    const filterAndFill = (current: any[], fallback: any[], minCount = 10) => {
      const result: any[] = [];
      // 优先装载网络或缓存的最新数据
      for (const m of (current || [])) {
        if (!m || !m.title) continue;
        const key = normalize(m.title);
        if (key && !seen.has(key)) {
          seen.add(key);
          result.push(m);
        }
      }
      // 不足时，用该专区的高清预置精选池补足
      if (result.length < minCount) {
        for (const m of (fallback || [])) {
          if (!m || !m.title) continue;
          const key = normalize(m.title);
          if (key && !seen.has(key)) {
            seen.add(key);
            result.push(m);
          }
        }
      }
      return result;
    };

    const s1 = filterAndFill(shelf1Movies, prebaked.s1);
    const s2 = filterAndFill(shelf2Movies, prebaked.s2);
    const s3 = filterAndFill(shelf3Movies, prebaked.s3);
    const s4 = filterAndFill(shelf4Movies, prebaked.s4);

    return { heroList, top10List, s1, s2, s3, s4, seenSnapshot: new Set(seen) };
  }, [contentType, prebaked, weeklyMovies, shelf1Movies, shelf2Movies, shelf3Movies, shelf4Movies]);

  const handleMovieClick = (movie: any) => {
    const params = new URLSearchParams();
    params.set('title', movie.title);
    params.set('type', contentType);
    router.push(`/player?${params.toString()}`);
  };

  return (
    <div className="animate-fade-in pb-28 sm:pb-16">
      {/* 1. 🏆 影院级全景沉浸式巨幕 Billboard（专属 5 大视效巨制，横版剧照 + 深度看点） */}
      <HeroSlideshow contentType={contentType} onSearch={onSearch} customHeroMovies={deduplicatedContent.heroList} />

      {/* 2. 🎬 断点续播 / 最近观看记录横轨 */}
      <ContinueWatchingRail />

      {/* 3. ✨ 流媒体核心频道与品牌直通入口 (Brands Bar) */}
      <CategoryBrandBar />

      {/* 4. 🌟 流媒体核心分类快速切换（电影 / 电视剧 / 动漫 / 综艺） */}
      <div className="flex items-center justify-between gap-4 mb-6 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setContentType('movie')}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all cursor-pointer ${
              contentType === 'movie'
                ? 'bg-(--accent-color) text-white shadow-lg shadow-(--accent-color)/30 scale-105'
                : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            🎬 电影专区
          </button>
          <button
            onClick={() => setContentType('tv')}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all cursor-pointer ${
              contentType === 'tv'
                ? 'bg-(--accent-color) text-white shadow-lg shadow-(--accent-color)/30 scale-105'
                : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            📺 电视剧集
          </button>
          <button
            onClick={() => router.push('/iptv')}
            className="px-4 py-2 rounded-full text-sm font-medium bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all cursor-pointer hidden sm:inline-flex items-center gap-1.5"
          >
            📡 电视直播
          </button>
        </div>

        <span className="text-xs text-white/40 font-medium hidden md:inline">
          全球多源秒播 · 4K 超清聚合 · 零重复策划
        </span>
      </div>

      {/* 5. 🥇 豆瓣一周口碑榜 TOP 10（每日定时自动更新） */}
      <Top10Rail
        title={contentType === 'movie' ? '豆瓣一周电影口碑榜 TOP 10' : '豆瓣一周华语口碑剧集 TOP 10'}
        badge="豆瓣权威榜 · 每日自动更新"
        movies={deduplicatedContent.top10List}
        loading={weeklyLoading && deduplicatedContent.top10List.length === 0}
        onMovieClick={handleMovieClick}
        contentType={contentType}
      />

      {/* 6. 🎯 猜你喜欢 · 智能定制推荐（排除已展示影片，挖掘真正冷门黑马） */}
      <PersonalizedForYouRail
        onMovieClick={handleMovieClick}
        contentType={contentType}
        excludeTitles={deduplicatedContent.seenSnapshot}
      />

      {/* 7. 货架 1：院线首播 & 同步爆款 / 华语热播连续剧 */}
      <ContentRail
        title={isMovie ? '✨ 院线首播 & 2024-2026 同步爆款' : '🔥 2026 华语爆款热播连续剧'}
        icon={isMovie ? '✨' : '🔥'}
        badge="NEW RELEASE"
        movies={deduplicatedContent.s1}
        loading={loadingShelves}
        isPriority={true}
        onMovieClick={handleMovieClick}
        onViewAll={() => router.push(isMovie ? '/movie?genre=最新' : '/tv?region=国产剧')}
      />

      {/* 8. 货架 2：豆瓣 8.5+ 影史高分神作 / 顶级欧美神剧专区 */}
      <ContentRail
        title={isMovie ? '⭐ 豆瓣 8.5+ 影史殿堂神作' : '🌟 顶级欧美神剧 & 艾美奖力作'}
        icon={isMovie ? '⭐' : '🌟'}
        badge={isMovie ? '豆瓣 9.0+' : 'TOP HBO/NETFLIX'}
        movies={deduplicatedContent.s2}
        loading={loadingShelves}
        onMovieClick={handleMovieClick}
        onViewAll={() => router.push(isMovie ? '/movie?genre=豆瓣高分' : '/tv?region=美剧')}
      />

      {/* 9. 📡 电视直播精选频道 */}
      <LiveChannelsPreview />

      {/* 10. 货架 3：华语经典口碑大片 / 人气韩剧 & 经典日剧 */}
      <ContentRail
        title={isMovie ? '🏮 华语经典 & 港影黄金时代' : '🍿 人气韩剧 & 现象级爆款'}
        icon={isMovie ? '🏮' : '🍿'}
        badge="CLASSIC"
        movies={deduplicatedContent.s3}
        loading={loadingShelves}
        onMovieClick={handleMovieClick}
        onViewAll={() => router.push(isMovie ? '/movie?region=华语' : '/tv?region=韩剧')}
      />

      {/* 11. 货架 4：好莱坞震撼视效 / 国漫巅峰 & 热血动漫新番 */}
      <ContentRail
        title={isMovie ? '🚀 好莱坞震撼视效 & 科幻动作巅峰' : '⚡ 国漫巅峰 & 连载动漫新番'}
        icon={isMovie ? '🚀' : '⚡'}
        badge="SUPER HIT"
        movies={deduplicatedContent.s4}
        loading={loadingShelves}
        onMovieClick={handleMovieClick}
        onViewAll={() => router.push(isMovie ? '/movie?region=欧美' : '/anime')}
      />

      {/* 12. 🛡️ 平台核心特性与极速播放优势 */}
      <PlatformFeaturesStrip />

      {/* 13. 🧭 全库多维分类检索大厅导航卡片 */}
      <ExploreHubFooterBanner />
    </div>
  );
}
