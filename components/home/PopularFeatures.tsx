'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { HeroSlideshow } from './TmdbSlideshow';
import { Top10Rail } from './Top10Rail';
import LatestTitlesRail from './LatestTitlesRail';
import { ContentRail } from './ContentRail';
import { ContinueWatchingRail } from './ContinueWatchingRail';
import { PREBAKED_HOME_DATA } from '@/lib/data/home-prebaked';
import { generateSlug, getTitleCanonicalHref } from '@/lib/data/entities/entity-utils';

// 🚀 八层极速秒开架构：非首屏重量级组件按需动态加载，首屏 JS 包体积直降 30%
const LiveChannelsPreview = dynamic(
  () => import('./LiveChannelsPreview').then((m) => m.LiveChannelsPreview),
  { loading: () => <div className="h-44 rounded-2xl bg-white/5 animate-pulse border border-white/5" /> }
);
const CollectionsRail = dynamic(
  () => import('./CollectionsRail').then((m) => m.CollectionsRail),
  { loading: () => <div className="h-44 rounded-2xl bg-white/5 animate-pulse border border-white/5" /> }
);
const PlatformFeaturesStrip = dynamic(
  () => import('./PlatformFeaturesStrip').then((m) => m.PlatformFeaturesStrip),
  { loading: () => <div className="h-28 rounded-2xl bg-white/5 animate-pulse border border-white/5" /> }
);
const PersonalizedForYouRail = dynamic(
  () => import('./PersonalizedForYouRail').then((m) => m.PersonalizedForYouRail),
  { loading: () => <div className="h-56 rounded-2xl bg-white/5 animate-pulse border border-white/5" /> }
);
const ExploreHubFooterBanner = dynamic(
  () => import('./ExploreHubFooterBanner').then((m) => m.ExploreHubFooterBanner),
  { loading: () => <div className="h-36 rounded-2xl bg-white/5 animate-pulse border border-white/5" /> }
);

export type HomeContentType = 'all' | 'movie' | 'tv' | 'anime' | 'variety' | 'documentary' | 'short';

interface PopularFeaturesProps {
  onSearch?: (query: string) => void;
}

// ── SWR 货架本地瞬间缓存 ──────────────────────────
const SHELVES_CACHE_KEY = 'kvideo-home-shelves-v11-';

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
const WEEKLY_CHART_CACHE_KEY = 'kvideo-weekly-douban-chart-v5-';

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
        { title: '🔥 最新院线热播', icon: '🔥', badge: 'NOW PLAYING', tag: '最新', doubanType: 'movie', viewAll: '/movie?genre=最新', prebakedOnly: true },
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
        { title: '🎵 顶级音乐竞演现场', icon: '🎵', badge: 'MUSIC', tag: '音乐', doubanType: 'tv', viewAll: '/variety?genre=音乐' },
        { title: '🌿 慢生活治愈与美食旅行', icon: '🌿', badge: 'SLOW LIFE', tag: '慢生活', doubanType: 'tv', viewAll: '/variety?genre=美食' },
      ];
    case 'documentary':
      return [
        { title: '🌍 BBC 史诗级自然与浩瀚宇宙', icon: '🌍', badge: 'BBC 4K', tag: '自然', doubanType: 'tv', viewAll: '/documentary?genre=自然' },
        { title: '🍲 人间烟火 · 顶级华语美食图鉴', icon: '🍲', badge: 'FOOD', tag: '美食', doubanType: 'tv', viewAll: '/documentary?genre=美食' },
        { title: '🏺 华夏光影 · 历史人文与国宝探寻', icon: '🏺', badge: 'HISTORY', tag: '历史', doubanType: 'tv', viewAll: '/documentary?genre=历史' },
        { title: '🏆 影史殿堂 · 豆瓣 9.5+ 极致口碑神作', icon: '⭐', badge: 'TOP 9.5+', tag: '纪录片', doubanType: 'tv', viewAll: '/documentary?genre=经典高分' },
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
    case 'documentary':
      return { title: '豆瓣高分纪录片口碑榜 TOP 10', badge: '殿堂神作榜 · 每日自动更新' };
    case 'short':
      return { title: '精品微短剧热度 TOP 10', badge: '爆款爽剧榜 · 每日自动更新' };
  }
}

const TABS: Array<{ id: HomeContentType | 'iptv'; label: string; isRoute?: boolean; href?: string }> = [
  { id: 'movie', label: '🎬 电影' },
  { id: 'tv', label: '📺 电视剧' },
  { id: 'anime', label: '🏮 动漫' },
  { id: 'variety', label: '🎤 综艺' },
  { id: 'documentary', label: '🎥 纪录片' },
  { id: 'short', label: '⚡ 短剧' },
  { id: 'iptv', label: '📡 直播', isRoute: true, href: '/iptv' },
];

function DeferredShelfPlaceholder() {
  return (
    <div className="space-y-3 py-1">
      <div className="flex items-center justify-between">
        <div className="h-5 w-36 sm:w-48 rounded bg-white/5 animate-pulse" />
        <div className="h-4 w-12 rounded bg-white/5 animate-pulse" />
      </div>
      <div className="flex gap-2.5 sm:gap-4 overflow-hidden py-1">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="shrink-0 w-[118px] sm:w-40 aspect-2/3 rounded-2xl bg-white/5 border border-white/5 animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}

export function PopularFeatures({ onSearch }: PopularFeaturesProps) {
  const router = useRouter();

  // 🚀 TBT 极速攻坚：首屏水合优先执行 Hero 与 Top10，屏下货架在主线程空闲后平滑挂载，释放 500ms 阻塞
  const [isBelowFoldMounted, setIsBelowFoldMounted] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ('requestIdleCallback' in window) {
      const handle = (window as any).requestIdleCallback(
        () => setIsBelowFoldMounted(true),
        { timeout: 350 }
      );
      return () => (window as any).cancelIdleCallback(handle);
    } else {
      const timer = setTimeout(() => setIsBelowFoldMounted(true), 150);
      return () => clearTimeout(timer);
    }
  }, []);

  // 🌟 排行榜分类独立状态：点击仅驱动紧随其后的 Top 10 口碑榜联动，不干扰整页其他货架
  const [top10Category, setTop10Category] = useState<HomeContentType>('movie');
  const prebakedTop10 = useMemo(
    () => PREBAKED_HOME_DATA[top10Category]?.top10 || PREBAKED_HOME_DATA.movie.top10,
    [top10Category]
  );
  const initialWeeklyCache = typeof window !== 'undefined' ? getLocalWeeklyChart(top10Category) : null;
  const [weeklyMovies, setWeeklyMovies] = useState<any[]>(() => initialWeeklyCache || (PREBAKED_HOME_DATA.movie.top10));
  const [weeklyLoading, setWeeklyLoading] = useState<boolean>(false);
  const top10Info = useMemo(() => getTop10Info(top10Category), [top10Category]);

  // 🏛️ 首页大厅精选货架：恢复为经典的 2026 最新院线与影史殿堂货架（以 movie 为基础）
  const prebakedShelves = PREBAKED_HOME_DATA.movie;
  const initialShelvesCache = typeof window !== 'undefined' ? getLocalShelves('movie') : null;
  const [shelf1Movies, setShelf1Movies] = useState<any[]>(() => initialShelvesCache?.s1 || prebakedShelves.s1);
  const [shelf2Movies, setShelf2Movies] = useState<any[]>(() => initialShelvesCache?.s2 || prebakedShelves.s2);
  const [shelf3Movies, setShelf3Movies] = useState<any[]>(() => initialShelvesCache?.s3 || prebakedShelves.s3);
  const [shelf4Movies, setShelf4Movies] = useState<any[]>(() => initialShelvesCache?.s4 || prebakedShelves.s4);
  const [loadingShelves, setLoadingShelves] = useState<boolean>(false);
  const shelvesMeta = useMemo(() => getShelvesMeta('movie'), []);

  // ── 口碑榜：仅当 top10Category 变化时更新口碑榜数据 ──────────────────
  useEffect(() => {
    let isMounted = true;
    const cache = getLocalWeeklyChart(top10Category);
    const pb = PREBAKED_HOME_DATA[top10Category]?.top10 || PREBAKED_HOME_DATA.movie.top10;
    setWeeklyMovies(cache && cache.length > 0 ? cache : pb);

    // 仅当为电影或剧集时走豆瓣官方周榜 API，其余品类（全部/动漫/综艺/纪录片/短剧）直接使用高清预烘焙精选榜单
    if (top10Category !== 'movie' && top10Category !== 'tv') {
      return;
    }

    const fetchWeekly = async () => {
      try {
        setWeeklyLoading(true);
        const res = await fetch(`/api/douban/weekly-chart?type=${top10Category}`, {
          signal: AbortSignal.timeout(4000),
        });
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && data.subjects && Array.isArray(data.subjects) && data.subjects.length > 0) {
          setWeeklyMovies(prev => {
            const isSame = prev.length === data.subjects.length && prev.every((m, i) => (m?.title || m?.id) === (data.subjects[i]?.title || data.subjects[i]?.id));
            return isSame ? prev : data.subjects;
          });
          setLocalWeeklyChart(top10Category, data.subjects);
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
  }, [top10Category]);

  // ── 首页综合货架：后台异步静默拉取综合大厅货架数据（只在初次加载拉取一次） ──────────────────
  useEffect(() => {
    let isMounted = true;
    const cache = getLocalShelves('movie');

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
        let latestS1: any[] = cache?.s1 || prebakedShelves.s1 || [];
        let latestS2: any[] = cache?.s2 || prebakedShelves.s2 || [];
        let latestS3: any[] = cache?.s3 || prebakedShelves.s3 || [];
        let latestS4: any[] = cache?.s4 || prebakedShelves.s4 || [];

        const [m1, m2, m3, m4] = shelvesMeta;

        const p1 = m1.prebakedOnly
          ? Promise.resolve({ subjects: prebakedShelves.s1 })
          : fetchWithTimeout(`/api/douban/recommend?tag=${encodeURIComponent(m1.tag)}&type=${m1.doubanType}&page_limit=14&page_start=0`);

        const p2 = m2.prebakedOnly
          ? Promise.resolve({ subjects: prebakedShelves.s2 })
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
            setLocalShelves('movie', {
              s1: latestS1,
              s2: latestS2,
              s3: latestS3,
              s4: latestS4,
            });
          }
        }

        await new Promise(r => setTimeout(r, 1000));
        if (!isMounted) return;

        const p3 = m3.prebakedOnly
          ? Promise.resolve({ subjects: prebakedShelves.s3 })
          : fetchWithTimeout(`/api/douban/recommend?tag=${encodeURIComponent(m3.tag)}&type=${m3.doubanType}&page_limit=14&page_start=0`);

        const p4 = m4.prebakedOnly
          ? Promise.resolve({ subjects: prebakedShelves.s4 })
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

          setLocalShelves('movie', {
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
  }, [shelvesMeta, prebakedShelves]);

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

    // 1. Hero 巨幕专属大片（常驻独立：固定展示爱壹帆每日定时同步的 7 席正片巨幕）
    const heroPool = PREBAKED_HOME_DATA.all.hero || [];
    const heroList: any[] = [];
    for (const item of heroPool) {
      const key = normalize(item.title);
      if (key && !seen.has(key)) {
        seen.add(key);
        heroList.push(item);
      }
    }

    // 2. 一周口碑榜 TOP 10（随 top10Category 联动）
    const top10Source = (weeklyMovies && weeklyMovies.length > 0) ? weeklyMovies : (prebakedTop10 || []);
    const top10List: any[] = [];
    for (const item of top10Source) {
      if (top10List.length >= 10) break;
      const key = normalize(item.title);
      if (key && !seen.has(key)) {
        seen.add(key);
        top10List.push(item);
      }
    }
    if (top10List.length < 10 && prebakedTop10) {
      for (const item of prebakedTop10) {
        if (top10List.length >= 10) break;
        const key = normalize(item.title);
        if (key && !seen.has(key)) {
          seen.add(key);
          top10List.push(item);
        }
      }
    }

    // 3. 通用货架过滤填充器（固定综合大厅精选货架）
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

    const s1 = filterAndFill(shelf1Movies, prebakedShelves.s1);
    const s2 = filterAndFill(shelf2Movies, prebakedShelves.s2);
    const s3 = filterAndFill(shelf3Movies, prebakedShelves.s3);
    const s4 = filterAndFill(shelf4Movies, prebakedShelves.s4);

    return { heroList, top10List, s1, s2, s3, s4, seenSnapshot: new Set(seen) };
  }, [weeklyMovies, prebakedTop10, shelf1Movies, shelf2Movies, shelf3Movies, shelf4Movies, prebakedShelves]);

  const handleMovieClick = (movie: any) => {
    if (top10Category === 'short' || movie.play_url || movie.playUrl || movie.firstPlayUrl || (movie.types && movie.types.includes('短剧'))) {
      const playUrl = movie.play_url || movie.playUrl || movie.url || movie.firstPlayUrl || '';
      const query = new URLSearchParams();
      if (movie.title) query.set('title', movie.title);
      if (playUrl) query.set('url', playUrl);
      if (movie.cover || movie.poster) query.set('poster', movie.cover || movie.poster);
      if (movie.id) query.set('id', String(movie.id));
      router.push(`/short/player?${query.toString()}`);
      return;
    }
    router.push(getTitleCanonicalHref(movie));
  };

  const [m1, m2, m3, m4] = shelvesMeta;

  return (
    <div className="animate-fade-in pb-6 sm:pb-8">
      {/* 1. 🏆 影院级全景沉浸式巨幕 Billboard（100% 全宽通顶，四周电影级暗黑羽化系统） */}
      <HeroSlideshow
        onSearch={onSearch}
        customHeroMovies={deduplicatedContent.heroList}
        trendingNav={PREBAKED_HOME_DATA.all.trendingNav}
      />

      {/* 2. 核心流式内容货架区（包裹在 fluid-container 中，无缝承接上方羽化渐变） */}
      <div className="fluid-container space-y-6 sm:space-y-8 mt-2 sm:mt-4 relative z-20">
        {/* 🎬 断点续播 / 最近观看记录横轨 */}
        <ContinueWatchingRail />

        {/* 🆕 最新上线 · 实时收录横轨（TMDB 自动化飞轮全自动增量入库） */}
        <LatestTitlesRail />

        {/* 🌟 口碑榜专用品类切换胶囊条（仅联动下方 Top 10 口碑榜） */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 px-0.5 -mx-0.5">
          {TABS.map((tab) => {
            const isActive = top10Category === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.isRoute && tab.href) {
                    router.push(tab.href);
                  } else {
                    setTop10Category(tab.id as HomeContentType);
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
          权威榜单 · 每日定时自动同步 · 0 延时瞬开
        </span>
      </div>

      {/* 4. 🥇 口碑榜 TOP 10（随上方品类胶囊即时联动） */}
      <Top10Rail
        title={top10Info.title}
        badge={top10Info.badge}
        movies={deduplicatedContent.top10List}
        loading={weeklyLoading && deduplicatedContent.top10List.length === 0}
        onMovieClick={handleMovieClick}
        contentType={top10Category}
      />

      {/* 5. 🎯 猜你喜欢 · 智能定制推荐（全站综合推荐，不受上方排行榜切换影响） */}
      <div className="below-fold-rail min-h-[280px]">
        {isBelowFoldMounted ? (
          <PersonalizedForYouRail
            onMovieClick={handleMovieClick}
            contentType="movie"
            excludeTitles={deduplicatedContent.seenSnapshot}
          />
        ) : (
          <DeferredShelfPlaceholder />
        )}
      </div>

      {/* 6. 货架 1 */}
      <div className="below-fold-rail min-h-[280px]">
        {isBelowFoldMounted ? (
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
        ) : (
          <DeferredShelfPlaceholder />
        )}
      </div>

      {/* 7. 货架 2 */}
      <div className="below-fold-rail min-h-[280px]">
        {isBelowFoldMounted ? (
          <ContentRail
            title={m2.title}
            icon={m2.icon}
            badge={m2.badge}
            movies={deduplicatedContent.s2}
            loading={loadingShelves}
            onMovieClick={handleMovieClick}
            onViewAll={() => router.push(m2.viewAll)}
          />
        ) : (
          <DeferredShelfPlaceholder />
        )}
      </div>

      {/* 8. 📡 电视直播精选频道（在推荐主干展示） */}
      <div className="below-fold-section min-h-[180px]">
        {isBelowFoldMounted ? <LiveChannelsPreview /> : null}
      </div>

      {/* 8.5 📚 官方策展 · 殿堂片单与深度意图专题超级展台（融合34大主题，打通全网意图与经典片单） */}
      <div className="below-fold-rail min-h-[220px]">
        {isBelowFoldMounted ? <CollectionsRail /> : null}
      </div>

      {/* 9. 货架 3 */}
      <div className="below-fold-rail min-h-[280px]">
        {isBelowFoldMounted ? (
          <ContentRail
            title={m3.title}
            icon={m3.icon}
            badge={m3.badge}
            movies={deduplicatedContent.s3}
            loading={loadingShelves}
            onMovieClick={handleMovieClick}
            onViewAll={() => router.push(m3.viewAll)}
          />
        ) : (
          <DeferredShelfPlaceholder />
        )}
      </div>

      {/* 10. 货架 4 */}
      <div className="below-fold-rail min-h-[280px]">
        {isBelowFoldMounted ? (
          <ContentRail
            title={m4.title}
            icon={m4.icon}
            badge={m4.badge}
            movies={deduplicatedContent.s4}
            loading={loadingShelves}
            onMovieClick={handleMovieClick}
            onViewAll={() => router.push(m4.viewAll)}
          />
        ) : (
          <DeferredShelfPlaceholder />
        )}
      </div>

      {/* 11. 🛡️ 平台核心特性与极速播放优势 */}
      <div className="below-fold-section min-h-[120px]">
        {isBelowFoldMounted ? <PlatformFeaturesStrip /> : null}
      </div>

      {/* 12. 🧭 全库多维分类检索大厅导航卡片 */}
      <div className="below-fold-footer min-h-[140px]">
        {isBelowFoldMounted ? <ExploreHubFooterBanner /> : null}
      </div>
      </div>
    </div>
  );
}
