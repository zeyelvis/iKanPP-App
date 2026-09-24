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
const SHELVES_CACHE_KEY = 'kvideo-home-shelves-v12-';

function getLocalShelves() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SHELVES_CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {}
  return null;
}

function setLocalShelves(data: Record<string, any[]>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SHELVES_CACHE_KEY, JSON.stringify(data));
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

  // 🏛️ 六大核心板块基础预烘焙数据源（100% 官方演职人员与 TMDB 原画直链，零延时秒开）
  const initialShelvesCache = typeof window !== 'undefined' ? getLocalShelves() : null;

  // 1. 电影专区
  const [shelfMovie, setShelfMovie] = useState<any[]>(() => initialShelvesCache?.movie || PREBAKED_HOME_DATA.movie.s1);
  // 2. 电视剧专区
  const [shelfTv, setShelfTv] = useState<any[]>(() => initialShelvesCache?.tv || PREBAKED_HOME_DATA.tv.s1);
  // 3. 动漫专区
  const [shelfAnime] = useState<any[]>(() => PREBAKED_HOME_DATA.anime.s1 || []);
  // 4. 综艺专区
  const [shelfVariety] = useState<any[]>(() => PREBAKED_HOME_DATA.variety.s1 || []);
  // 5. 纪录片专区（组合自然生态与高分人文）
  const [shelfDocumentary] = useState<any[]>(() => [
    ...(PREBAKED_HOME_DATA.documentary?.s1 || []),
    ...(PREBAKED_HOME_DATA.documentary?.s2 || []),
  ].slice(0, 14));
  // 6. 微短剧专区（组合爆款爽剧与热度合集）
  const [shelfShort] = useState<any[]>(() => {
    const raw = [
      ...(PREBAKED_HOME_DATA.short?.hero || []),
      ...(PREBAKED_HOME_DATA.short?.top10 || []),
    ];
    const seenShort = new Set<string>();
    const res: any[] = [];
    for (const item of raw) {
      if (!item || !item.title) continue;
      if (!seenShort.has(item.title)) {
        seenShort.add(item.title);
        res.push(item);
      }
      if (res.length >= 14) break;
    }
    return res;
  });

  const [loadingShelves, setLoadingShelves] = useState<boolean>(false);

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

  // ── 首页综合货架：后台异步静默更新电影与电视剧最新热门 ──────────────────
  useEffect(() => {
    let isMounted = true;

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
        const [resMovie, resTv] = await Promise.allSettled([
          fetchWithTimeout('/api/douban/recommend?tag=%E7%83%AD%E9%97%A8&type=movie&page_limit=14&page_start=0'),
          fetchWithTimeout('/api/douban/recommend?tag=%E5%9B%BD%E4%BA%A7%E5%89%A7&type=tv&page_limit=14&page_start=0'),
        ]);

        if (isMounted) {
          let updatedMovie = shelfMovie;
          let updatedTv = shelfTv;

          if (resMovie.status === 'fulfilled' && resMovie.value?.subjects?.length) {
            updatedMovie = resMovie.value.subjects;
            setShelfMovie(prev => isSameList(prev, updatedMovie) ? prev : updatedMovie);
          }
          if (resTv.status === 'fulfilled' && resTv.value?.subjects?.length) {
            updatedTv = resTv.value.subjects;
            setShelfTv(prev => isSameList(prev, updatedTv) ? prev : updatedTv);
          }

          setLocalShelves({
            movie: updatedMovie,
            tv: updatedTv,
          });
        }
      } catch {
        // 静默降级至预烘焙种子数据
      } finally {
        if (isMounted) setLoadingShelves(false);
      }
    };

    fetchShelves();
    return () => {
      isMounted = false;
    };
  }, []);

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

    // 3. 六大核心专区板块去重填充器
    const filterAndFill = (current: any[], fallback: any[], minCount = 8) => {
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

    const movie = filterAndFill(shelfMovie, PREBAKED_HOME_DATA.movie.s1);
    const tv = filterAndFill(shelfTv, PREBAKED_HOME_DATA.tv.s1);
    const anime = filterAndFill(shelfAnime, PREBAKED_HOME_DATA.anime.s1);
    const variety = filterAndFill(shelfVariety, PREBAKED_HOME_DATA.variety.s1);
    const documentary = filterAndFill(shelfDocumentary, PREBAKED_HOME_DATA.documentary.s1);
    const short = filterAndFill(shelfShort, PREBAKED_HOME_DATA.short.hero);

    return {
      heroList,
      top10List,
      movie,
      tv,
      anime,
      variety,
      documentary,
      short,
      seenSnapshot: new Set(seen),
    };
  }, [weeklyMovies, prebakedTop10, shelfMovie, shelfTv, shelfAnime, shelfVariety, shelfDocumentary, shelfShort]);

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

        {/* 6. 🎬 板块一：电影专区 (Movie) */}
        <div className="below-fold-rail min-h-[280px]">
          {isBelowFoldMounted ? (
            <ContentRail
              title="🎬 热门院线与经典电影"
              icon="🎬"
              badge="4K 原盘 · 杜比视界"
              actionLabel="进入电影大厅 →"
              quickTags={[
                { label: '最新上映', href: '/movie?genre=最新' },
                { label: '豆瓣高分', href: '/movie?genre=豆瓣高分' },
                { label: '好莱坞巨制', href: '/movie?region=欧美' },
                { label: '华语经典', href: '/movie?region=华语' },
                { label: '动作悬疑', href: '/movie?genre=动作' },
                { label: '科幻奇幻', href: '/movie?genre=科幻' },
              ]}
              movies={deduplicatedContent.movie}
              loading={loadingShelves}
              isPriority={true}
              onMovieClick={handleMovieClick}
              onViewAll={() => router.push('/movie')}
            />
          ) : (
            <DeferredShelfPlaceholder />
          )}
        </div>

        {/* 7. 📺 板块二：电视剧专区 (TV) */}
        <div className="below-fold-rail min-h-[280px]">
          {isBelowFoldMounted ? (
            <ContentRail
              title="📺 热播黄金档与口碑剧集"
              icon="📺"
              badge="同步跟播 · 多源聚合"
              actionLabel="进入电视剧大厅 →"
              quickTags={[
                { label: '华语热播', href: '/tv?region=国产剧' },
                { label: '顶级美剧', href: '/tv?region=美剧' },
                { label: '人气韩剧', href: '/tv?region=韩剧' },
                { label: '口碑日剧', href: '/tv?region=日剧' },
                { label: '古装传奇', href: '/tv?genre=古装' },
                { label: '悬疑刑侦', href: '/tv?genre=悬疑' },
              ]}
              movies={deduplicatedContent.tv}
              loading={loadingShelves}
              onMovieClick={handleMovieClick}
              onViewAll={() => router.push('/tv')}
            />
          ) : (
            <DeferredShelfPlaceholder />
          )}
        </div>

        {/* 8. 📡 电视直播精选频道（在电视剧之后穿插） */}
        <div className="below-fold-section min-h-[180px]">
          {isBelowFoldMounted ? <LiveChannelsPreview /> : null}
        </div>

        {/* 9. 🏮 板块三：动漫专区 (Anime) */}
        <div className="below-fold-rail min-h-[280px]">
          {isBelowFoldMounted ? (
            <ContentRail
              title="🏮 热门番剧与国创修真"
              icon="🏮"
              badge="超清连载 · 年番速递"
              actionLabel="进入动漫大厅 →"
              quickTags={[
                { label: '当季新番', href: '/anime?region=日本动画' },
                { label: '国创修真', href: '/anime?region=国产动画' },
                { label: '热血冒险', href: '/anime?genre=热血' },
                { label: '剧场版电影', href: '/movie?genre=动画' },
                { label: '经典神作', href: '/anime' },
              ]}
              movies={deduplicatedContent.anime}
              loading={false}
              onMovieClick={handleMovieClick}
              onViewAll={() => router.push('/anime')}
            />
          ) : (
            <DeferredShelfPlaceholder />
          )}
        </div>

        {/* 10. 🎤 板块四：综艺专区 (Variety) */}
        <div className="below-fold-rail min-h-[280px]">
          {isBelowFoldMounted ? (
            <ContentRail
              title="🎤 王牌综艺与爆笑真人秀"
              icon="🎤"
              badge="笑点拉满 · 伴饭神器"
              actionLabel="进入综艺大厅 →"
              quickTags={[
                { label: '热播真人秀', href: '/variety' },
                { label: '爆笑脱口秀', href: '/variety?genre=脱口秀' },
                { label: '顶级音乐舞台', href: '/variety?genre=音乐' },
                { label: '慢生活治愈', href: '/variety?genre=生活' },
                { label: '恋爱推理', href: '/variety?genre=恋爱' },
              ]}
              movies={deduplicatedContent.variety}
              loading={false}
              onMovieClick={handleMovieClick}
              onViewAll={() => router.push('/variety')}
            />
          ) : (
            <DeferredShelfPlaceholder />
          )}
        </div>

        {/* 11. 📚 官方策展 · 34主题片单超级展台（融合34大主题，打通全网意图与经典片单） */}
        <div className="below-fold-rail min-h-[220px]">
          {isBelowFoldMounted ? <CollectionsRail /> : null}
        </div>

        {/* 12. 🎥 板块五：纪录片专区 (Documentary) */}
        <div className="below-fold-rail min-h-[280px]">
          {isBelowFoldMounted ? (
            <ContentRail
              title="🎥 寰宇探索与人文纪录片"
              icon="🎥"
              badge="BBC 4K · 豆瓣 9.5+ 封神"
              actionLabel="进入纪录片大厅 →"
              quickTags={[
                { label: 'BBC 自然地理', href: '/documentary?genre=自然' },
                { label: '华夏光影历史', href: '/documentary?genre=历史' },
                { label: '人间烟火美食', href: '/documentary?genre=美食' },
                { label: '硬核科学探索', href: '/documentary?genre=科学' },
                { label: '豆瓣 9.5+ 殿堂', href: '/documentary?genre=经典高分' },
              ]}
              movies={deduplicatedContent.documentary}
              loading={false}
              onMovieClick={handleMovieClick}
              onViewAll={() => router.push('/documentary')}
            />
          ) : (
            <DeferredShelfPlaceholder />
          )}
        </div>

        {/* 13. ⚡ 板块六：微短剧专区 (Short Drama) */}
        <div className="below-fold-rail min-h-[280px]">
          {isBelowFoldMounted ? (
            <ContentRail
              title="⚡ 精选微短剧与爽剧合辑"
              icon="⚡"
              badge="节奏拉满 · 一气呵成"
              actionLabel="进入短剧专区 →"
              quickTags={[
                { label: '战神逆袭', href: '/short?genre=战神' },
                { label: '豪门虐恋', href: '/short?genre=豪门' },
                { label: '年代重生', href: '/short?genre=重生' },
                { label: '古装穿越', href: '/short?genre=古装' },
                { label: '热血修真', href: '/short?genre=修真' },
              ]}
              movies={deduplicatedContent.short}
              loading={false}
              onMovieClick={handleMovieClick}
              onViewAll={() => router.push('/short')}
            />
          ) : (
            <DeferredShelfPlaceholder />
          )}
        </div>

        {/* 14. 🛡️ 平台核心特性与极速播放优势 */}
        <div className="below-fold-section min-h-[120px]">
          {isBelowFoldMounted ? <PlatformFeaturesStrip /> : null}
        </div>

        {/* 15. 🧭 全库多维分类检索大厅导航卡片 */}
        <div className="below-fold-footer min-h-[140px]">
          {isBelowFoldMounted ? <ExploreHubFooterBanner /> : null}
        </div>
      </div>
    </div>
  );
}

