'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { HeroSlideshow } from './TmdbSlideshow';
import { Top10Rail } from './Top10Rail';
import { ContentRail } from './ContentRail';
import { ContinueWatchingRail } from './ContinueWatchingRail';
import { LiveChannelsPreview } from './LiveChannelsPreview';
import { PlatformFeaturesStrip } from './PlatformFeaturesStrip';
import { PersonalizedForYouRail } from './PersonalizedForYouRail';
import { ExploreHubFooterBanner } from './ExploreHubFooterBanner';
import { PREBAKED_HOME_DATA } from '@/lib/data/home-prebaked';
import { generateSlug } from '@/lib/data/entities/entity-utils';

export type HomeContentType = 'all' | 'movie' | 'tv' | 'anime' | 'variety' | 'short';

interface PopularFeaturesProps {
  onSearch?: (query: string) => void;
}

// ── SWR 货架本地瞬间缓存 ──────────────────────────
const SHELVES_CACHE_KEY = 'kvideo-home-shelves-v9-';

function getLocalShelves(type: HomeContentType) {
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

function setLocalShelves(type: HomeContentType, data: { s1: any[]; s2: any[]; s3: any[]; s4: any[] }) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SHELVES_CACHE_KEY + type, JSON.stringify(data));
  } catch {}
}

// ── 豆瓣/平台一周口碑榜 SWR 本地秒开缓存 ──────────────────────────
const WEEKLY_CHART_CACHE_KEY = 'kvideo-weekly-douban-chart-v4-';

function getLocalWeeklyChart(type: HomeContentType) {
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

function setLocalWeeklyChart(type: HomeContentType, data: any[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(WEEKLY_CHART_CACHE_KEY + type, JSON.stringify(data));
  } catch {}
}

interface ShelfMeta {
  title: string;
  icon: string;
  badge: string;
  tag: string;
  doubanType: 'movie' | 'tv';
  viewAll: string;
  prebakedOnly?: boolean;
}

function getShelvesMeta(contentType: HomeContentType): [ShelfMeta, ShelfMeta, ShelfMeta, ShelfMeta] {
  switch (contentType) {
    case 'all':
      return [
        { title: '🔥 院线重磅 & 华语热播', icon: '🔥', badge: 'HOT PICKS', tag: '热门', doubanType: 'movie', viewAll: '/movie' },
        { title: '🌟 顶级欧美神剧 & 艾美奖力作', icon: '🌟', badge: 'TOP HBO/NETFLIX', tag: '美剧', doubanType: 'tv', viewAll: '/tv?region=美剧' },
        { title: '⚡ 热血动漫 & 当季新番连载', icon: '⚡', badge: 'ANIME HIT', tag: '日本动画', doubanType: 'tv', viewAll: '/anime' },
        { title: '🎬 全网爆款微短剧精选', icon: '🎬', badge: 'SHORT DRAMA', tag: '短剧', doubanType: 'tv', viewAll: '/short', prebakedOnly: true },
      ];
    case 'movie':
      return [
        { title: '🔥 最新院线热播', icon: '🔥', badge: 'NOW PLAYING', tag: '最新', doubanType: 'movie', viewAll: '/movie?genre=最新' },
        { title: '⭐ 豆瓣 8.5+ 影史殿堂神作', icon: '⭐', badge: '豆瓣 9.0+', tag: '豆瓣高分', doubanType: 'movie', viewAll: '/movie?genre=豆瓣高分' },
        { title: '🏮 华语经典 & 港影黄金时代', icon: '🏮', badge: 'CLASSIC', tag: '华语', doubanType: 'movie', viewAll: '/movie?region=华语' },
        { title: '🚀 好莱坞震撼视效 & 科幻动作巅峰', icon: '🚀', badge: 'SUPER HIT', tag: '欧美', doubanType: 'movie', viewAll: '/movie?region=欧美' },
      ];
    case 'tv':
      return [
        { title: '🔥 2026 华语爆款热播连续剧', icon: '🔥', badge: 'HOT SERIES', tag: '国产剧', doubanType: 'tv', viewAll: '/tv?region=国产剧' },
        { title: '🌟 顶级欧美神剧专区', icon: '🌟', badge: 'TOP US', tag: '美剧', doubanType: 'tv', viewAll: '/tv?region=美剧' },
        { title: '🍿 人气韩剧 & 现象级爆款', icon: '🍿', badge: 'TRENDING', tag: '韩剧', doubanType: 'tv', viewAll: '/tv?region=韩剧' },
        { title: '🌸 经典口碑高分日剧', icon: '🌸', badge: 'JAPAN', tag: '日剧', doubanType: 'tv', viewAll: '/tv?region=日剧' },
      ];
    case 'anime':
      return [
        { title: '⚡ 当季热血新番连载', icon: '⚡', badge: 'SEASON', tag: '日本动画', doubanType: 'tv', viewAll: '/anime?region=日本动画' },
        { title: '🐉 国创修真年番巅峰', icon: '🐉', badge: 'CHINESE ANIME', tag: '国产动画', doubanType: 'tv', viewAll: '/anime?region=国产动画' },
        { title: '👑 殿堂级经典不朽神作', icon: '👑', badge: 'CLASSIC', tag: '日本动画', doubanType: 'tv', viewAll: '/anime' },
        { title: '🎨 全球经典剧场版动画电影', icon: '🎨', badge: 'MOVIE', tag: '动画', doubanType: 'movie', viewAll: '/movie?genre=动画' },
      ];
    case 'variety':
      return [
        { title: '🎤 全网爆款真人秀', icon: '🎤', badge: 'HOT SHOW', tag: '综艺', doubanType: 'tv', viewAll: '/variety' },
        { title: '🤣 爆笑喜剧与名场面脱口秀', icon: '🤣', badge: 'COMEDY', tag: '脱口秀', doubanType: 'tv', viewAll: '/variety?genre=脱口秀' },
        { title: '🎵 顶级音乐竞演现场', icon: '🎵', badge: 'MUSIC', tag: '综艺', doubanType: 'tv', viewAll: '/variety?genre=音乐' },
        { title: '🌿 慢生活治愈与美食旅行', icon: '🌿', badge: 'SLOW LIFE', tag: '综艺', doubanType: 'tv', viewAll: '/variety?genre=美食' },
      ];
    case 'short':
      return [
        { title: '⚡ 战神归来 · 逆袭打脸爽剧', icon: '⚡', badge: 'GOD OF WAR', tag: '战神', doubanType: 'tv', viewAll: '/short?genre=战神', prebakedOnly: true },
        { title: '💍 豪门恩怨 · 甜宠闪婚霸总', icon: '💍', badge: 'SWEET LOVE', tag: '豪门', doubanType: 'tv', viewAll: '/short?genre=豪门', prebakedOnly: true },
        { title: '⏳ 穿越重生 · 年代绝地反击', icon: '⏳', badge: 'REBORN', tag: '重生', doubanType: 'tv', viewAll: '/short?genre=重生', prebakedOnly: true },
        { title: '👑 古装权谋 · 绝色大女主戏', icon: '👑', badge: 'PALACE', tag: '古装', doubanType: 'tv', viewAll: '/short?genre=古装', prebakedOnly: true },
      ];
  }
}

function getTop10Info(contentType: HomeContentType): { title: string; badge: string } {
  switch (contentType) {
    case 'all':
      return { title: '🔥 全网全品类综合热播 TOP 10', badge: '全站综合权威榜 · 每日自动更新' };
    case 'movie':
      return { title: '豆瓣一周电影口碑榜 TOP 10', badge: '豆瓣权威榜 · 每日自动更新' };
    case 'tv':
      return { title: '豆瓣一周华语口碑剧集 TOP 10', badge: '豆瓣权威榜 · 每日自动更新' };
    case 'anime':
      return { title: '年度动漫新番热播榜 TOP 10', badge: '番剧高分榜 · 每日自动更新' };
    case 'variety':
      return { title: '热门爆款综艺口碑榜 TOP 10', badge: '全民热度榜 · 每日自动更新' };
    case 'short':
      return { title: '精品微短剧热度 TOP 10', badge: '爆款爽剧榜 · 每日自动更新' };
  }
}

const TABS: Array<{ id: HomeContentType | 'iptv'; label: string; isRoute?: boolean; href?: string }> = [
  { id: 'all', label: '🔥 全部推荐' },
  { id: 'movie', label: '🎬 电影' },
  { id: 'tv', label: '📺 电视剧' },
  { id: 'anime', label: '🏮 动漫' },
  { id: 'variety', label: '🎤 综艺' },
  { id: 'short', label: '⚡ 短剧' },
  { id: 'iptv', label: '📡 直播', isRoute: true, href: '/iptv' },
];

export function PopularFeatures({ onSearch }: PopularFeaturesProps) {
  const router = useRouter();
  // 默认 Tab 设为 🔥 全部推荐 (all)
  const [contentType, setContentType] = useState<HomeContentType>('all');

  // 主题货架分片数据获取（SWR: 优先使用本地缓存，新用户首次访问直接秒级呈现预烘焙高清精选数据，0ms 瞬间秒开）
  const prebaked = useMemo(() => PREBAKED_HOME_DATA[contentType] || PREBAKED_HOME_DATA.all, [contentType]);
  const initialCache = typeof window !== 'undefined' ? getLocalShelves(contentType) : null;

  // 一周口碑榜 TOP 10（首屏 0ms 瞬间秒出，后台静默自动每日同步）
  const initialWeeklyCache = typeof window !== 'undefined' ? getLocalWeeklyChart(contentType) : null;
  const [weeklyMovies, setWeeklyMovies] = useState<any[]>(() => initialWeeklyCache || prebaked.top10);
  const [weeklyLoading, setWeeklyLoading] = useState<boolean>(false);

  const [shelf1Movies, setShelf1Movies] = useState<any[]>(() => initialCache?.s1 || prebaked.s1);
  const [shelf2Movies, setShelf2Movies] = useState<any[]>(() => initialCache?.s2 || prebaked.s2);
  const [shelf3Movies, setShelf3Movies] = useState<any[]>(() => initialCache?.s3 || prebaked.s3);
  const [shelf4Movies, setShelf4Movies] = useState<any[]>(() => initialCache?.s4 || prebaked.s4);
  const [loadingShelves, setLoadingShelves] = useState<boolean>(false);

  const shelvesMeta = useMemo(() => getShelvesMeta(contentType), [contentType]);
  const top10Info = useMemo(() => getTop10Info(contentType), [contentType]);

  // 切换品类时，瞬间同步本地缓存或预烘焙数据
  useEffect(() => {
    const cache = getLocalShelves(contentType);
    const pb = PREBAKED_HOME_DATA[contentType] || PREBAKED_HOME_DATA.all;
    setShelf1Movies(cache?.s1 || pb.s1);
    setShelf2Movies(cache?.s2 || pb.s2);
    setShelf3Movies(cache?.s3 || pb.s3);
    setShelf4Movies(cache?.s4 || pb.s4);

    const weeklyCache = getLocalWeeklyChart(contentType);
    setWeeklyMovies(weeklyCache || pb.top10);
  }, [contentType]);

  // 后台异步静默拉取货架数据（带 SWR 智能防抖与局部刷新）
  useEffect(() => {
    let isMounted = true;
    const cache = getLocalShelves(contentType);

    // 智能比对两个影片序列是否相同（按 title 比对），杜绝相同列表触发无谓的重新渲染和 DOM 抖动
    const isSameList = (a: any[], b: any[]) => {
      if (!a || !b || a.length !== b.length) return false;
      return a.every((item, i) => (item?.title || item?.id) === (b[i]?.title || b[i]?.id));
    };

    const fetchShelves = async () => {
      const fetchWithTimeout = async (url: string, timeoutMs = 2500) => {
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
        let latestS1: any[] = cache?.s1 || prebaked.s1 || [];
        let latestS2: any[] = cache?.s2 || prebaked.s2 || [];
        let latestS3: any[] = cache?.s3 || prebaked.s3 || [];
        let latestS4: any[] = cache?.s4 || prebaked.s4 || [];

        const [m1, m2, m3, m4] = shelvesMeta;

        // 第一阶段：优先拉取前 2 个首屏高光货架（跳过纯预烘焙货架）
        const p1 = m1.prebakedOnly
          ? Promise.resolve({ subjects: prebaked.s1 })
          : fetchWithTimeout(`/api/douban/recommend?tag=${encodeURIComponent(m1.tag)}&type=${m1.doubanType}&page_limit=14&page_start=0`);

        const p2 = m2.prebakedOnly
          ? Promise.resolve({ subjects: prebaked.s2 })
          : fetchWithTimeout(`/api/douban/recommend?tag=${encodeURIComponent(m2.tag)}&type=${m2.doubanType}&page_limit=14&page_start=0`);

        const [res1, res2] = await Promise.allSettled([p1, p2]);

        if (isMounted) {
          const s1 = res1.status === 'fulfilled' && res1.value?.subjects?.length ? res1.value.subjects : [];
          const s2 = res2.status === 'fulfilled' && res2.value?.subjects?.length ? res2.value.subjects : [];

          if (s1.length) {
            latestS1 = s1;
            setShelf1Movies(prev => isSameList(prev, s1) ? prev : s1);
          }
          if (s2.length) {
            latestS2 = s2;
            setShelf2Movies(prev => isSameList(prev, s2) ? prev : s2);
          }

          if (s1.length || s2.length) {
            setLocalShelves(contentType, {
              s1: latestS1,
              s2: latestS2,
              s3: latestS3,
              s4: latestS4,
            });
          }
        }

        // 第二阶段：轻量延迟 1 秒后拉取后 2 个货架，彻底释放网络并发通道
        await new Promise(r => setTimeout(r, 1000));
        if (!isMounted) return;

        const p3 = m3.prebakedOnly
          ? Promise.resolve({ subjects: prebaked.s3 })
          : fetchWithTimeout(`/api/douban/recommend?tag=${encodeURIComponent(m3.tag)}&type=${m3.doubanType}&page_limit=14&page_start=0`);

        const p4 = m4.prebakedOnly
          ? Promise.resolve({ subjects: prebaked.s4 })
          : fetchWithTimeout(`/api/douban/recommend?tag=${encodeURIComponent(m4.tag)}&type=${m4.doubanType}&page_limit=14&page_start=0`);

        const [res3, res4] = await Promise.allSettled([p3, p4]);

        if (isMounted) {
          const s3 = res3.status === 'fulfilled' && res3.value?.subjects?.length ? res3.value.subjects : [];
          const s4 = res4.status === 'fulfilled' && res4.value?.subjects?.length ? res4.value.subjects : [];
          if (s3.length) {
            latestS3 = s3;
            setShelf3Movies(prev => isSameList(prev, s3) ? prev : s3);
          }
          if (s4.length) {
            latestS4 = s4;
            setShelf4Movies(prev => isSameList(prev, s4) ? prev : s4);
          }

          setLocalShelves(contentType, {
            s1: latestS1,
            s2: latestS2,
            s3: latestS3,
            s4: latestS4,
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
  }, [contentType, shelvesMeta, prebaked]);

  // ── 口碑榜：后台静默每日自动更新 ──────────────────
  useEffect(() => {
    let isMounted = true;
    const cache = getLocalWeeklyChart(contentType);
    if (cache && cache.length > 0) {
      setWeeklyMovies(cache);
    } else if (prebaked.top10) {
      setWeeklyMovies(prebaked.top10);
    }

    // 仅当为电影或剧集时走豆瓣官方周榜 API，其余品类（全部/动漫/综艺/短剧）直接使用高清预烘焙精选榜单
    if (contentType !== 'movie' && contentType !== 'tv') {
      return;
    }

    const fetchWeekly = async () => {
      try {
        const res = await fetch(`/api/douban/weekly-chart?type=${contentType}`, {
          signal: AbortSignal.timeout(4000),
        });
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && data.subjects && Array.isArray(data.subjects) && data.subjects.length > 0) {
          setWeeklyMovies(prev => {
            const isSame = prev.length === data.subjects.length && prev.every((m, i) => (m?.title || m?.id) === (data.subjects[i]?.title || data.subjects[i]?.id));
            return isSame ? prev : data.subjects;
          });
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
  }, [contentType, prebaked]);

  // ── 全局流媒体防重管道（Deduplication Funnel） ──────────────────
  const deduplicatedContent = useMemo(() => {
    const seen = new Set<string>();

    const normalize = (t: string) =>
      (t || '')
        .replace(/\s*第[一二三四五六七八九十\d]+季/, '')
        .replace(/\s*年番/, '')
        .replace(/\s*[（(][^)）]*[)）]/g, '')
        .trim()
        .toLowerCase();

    // 1. Hero 巨幕专属大片（常驻独立：固定展示爱壹帆每日定时同步的 7 席正片巨幕，与下方 Tab 解耦）
    const heroPool = PREBAKED_HOME_DATA.movie.hero || [];
    const heroList: any[] = [];
    for (const item of heroPool) {
      const key = normalize(item.title);
      if (key && !seen.has(key)) {
        seen.add(key);
        heroList.push(item);
      }
    }

    // 2. 一周口碑榜 TOP 10
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
      for (const m of (current || [])) {
        if (!m || !m.title) continue;
        const key = normalize(m.title);
        if (key && !seen.has(key)) {
          seen.add(key);
          result.push(m);
        }
      }
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
  }, [prebaked, weeklyMovies, shelf1Movies, shelf2Movies, shelf3Movies, shelf4Movies]);

  const handleMovieClick = (movie: any) => {
    router.push(`/title/${generateSlug(movie.title)}`);
  };

  const [m1, m2, m3, m4] = shelvesMeta;

  return (
    <div className="animate-fade-in pb-28 sm:pb-16">
      {/* 1. 🏆 影院级全景沉浸式巨幕 Billboard（常驻独立：固定展示爱壹帆每日定时同步的 7 席大片，不受下方 Tab 切换干扰） */}
      <HeroSlideshow onSearch={onSearch} customHeroMovies={deduplicatedContent.heroList} />

      {/* 2. 🎬 断点续播 / 最近观看记录横轨 */}
      <ContinueWatchingRail />

      {/* 3. 🌟 流媒体 7 大核心品类导航条（支持移动端横向滑动手势） */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 px-0.5 -mx-0.5">
          {TABS.map((tab) => {
            const isActive = contentType === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.isRoute && tab.href) {
                    router.push(tab.href);
                  } else {
                    setContentType(tab.id as HomeContentType);
                  }
                }}
                className={`shrink-0 whitespace-nowrap px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-(--accent-color) text-white shadow-lg shadow-(--accent-color)/30 scale-105'
                    : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <span className="text-xs text-white/40 font-medium hidden lg:inline">
          全品类 0 延时秒播 · 4K 官方高清聚合 · 智能无重复货架
        </span>
      </div>

      {/* 4. 🥇 口碑榜 TOP 10（每日定时自动更新） */}
      <Top10Rail
        title={top10Info.title}
        badge={top10Info.badge}
        movies={deduplicatedContent.top10List}
        loading={weeklyLoading && deduplicatedContent.top10List.length === 0}
        onMovieClick={handleMovieClick}
        contentType={contentType}
      />

      {/* 5. 🎯 猜你喜欢 · 智能定制推荐 */}
      <PersonalizedForYouRail
        onMovieClick={handleMovieClick}
        contentType={contentType === 'all' ? 'movie' : contentType}
        excludeTitles={deduplicatedContent.seenSnapshot}
      />

      {/* 6. 货架 1 */}
      <ContentRail
        title={m1.title}
        icon={m1.icon}
        badge={m1.badge}
        movies={deduplicatedContent.s1}
        loading={loadingShelves}
        isPriority={true}
        onMovieClick={handleMovieClick}
        onViewAll={() => router.push(m1.viewAll)}
      />

      {/* 7. 货架 2 */}
      <ContentRail
        title={m2.title}
        icon={m2.icon}
        badge={m2.badge}
        movies={deduplicatedContent.s2}
        loading={loadingShelves}
        onMovieClick={handleMovieClick}
        onViewAll={() => router.push(m2.viewAll)}
      />

      {/* 8. 📡 电视直播精选频道（在推荐主干展示） */}
      <LiveChannelsPreview />

      {/* 9. 货架 3 */}
      <ContentRail
        title={m3.title}
        icon={m3.icon}
        badge={m3.badge}
        movies={deduplicatedContent.s3}
        loading={loadingShelves}
        onMovieClick={handleMovieClick}
        onViewAll={() => router.push(m3.viewAll)}
      />

      {/* 10. 货架 4 */}
      <ContentRail
        title={m4.title}
        icon={m4.icon}
        badge={m4.badge}
        movies={deduplicatedContent.s4}
        loading={loadingShelves}
        onMovieClick={handleMovieClick}
        onViewAll={() => router.push(m4.viewAll)}
      />

      {/* 11. 🛡️ 平台核心特性与极速播放优势 */}
      <PlatformFeaturesStrip />

      {/* 12. 🧭 全库多维分类检索大厅导航卡片 */}
      <ExploreHubFooterBanner />
    </div>
  );
}
