import { useState, useEffect, useCallback, useRef } from 'react';
import { useInfiniteScroll } from '@/lib/hooks/useInfiniteScroll';
import { PREBAKED_PREMIUM_DATA } from '@/lib/data/premium-prebaked';

export interface PremiumVideo {
    vod_id: string | number;
    vod_name: string;
    video_code?: string;
    vod_pic?: string;
    vod_remarks?: string;
    type_name?: string;
    duration?: string;
    views?: string;
    likes?: string;
    rating?: number;
    source: string;
}

const PAGE_LIMIT = 20;
const STORAGE_PREFIX = 'kvideo-premium-cache-v2-';
const ONE_DAY_MS = 24 * 60 * 60 * 1000; // 24 小时每日对齐

// 客户端全局 SWR 内存与持久化缓存池
const clientMemoryCache = new Map<string, { data: PremiumVideo[]; timestamp: number }>();

function getStorageCache(key: string): { data: PremiumVideo[]; isFresh: boolean } | null {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem(STORAGE_PREFIX + key);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
            return { data: parsed, isFresh: false };
        }
        if (parsed && Array.isArray(parsed.data) && parsed.data.length > 0) {
            const isFresh = Boolean(parsed.timestamp && (Date.now() - parsed.timestamp < ONE_DAY_MS));
            return { data: parsed.data, isFresh };
        }
    } catch {}
    return null;
}

function setStorageCache(key: string, data: PremiumVideo[]) {
    if (typeof window === 'undefined') return;
    try {
        const payload = {
            data: data.slice(0, 40),
            timestamp: Date.now()
        };
        localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(payload));
    } catch {}
}

export function usePremiumContent(
    categoryValue: string = '',
    rankingMode: string = 'today'
) {
    // 缓存 key 组合 category 和 rankingMode
    const cacheKey = categoryValue ? `cat:${categoryValue}` : `mode:${rankingMode}`;

    // 0ms 瞬间秒开初始状态：内存 -> localStorage -> 预烘焙精选库
    const [videos, setVideos] = useState<PremiumVideo[]>(() => {
        const mem = clientMemoryCache.get(cacheKey);
        if (mem && mem.data.length > 0) return mem.data;
        const local = getStorageCache(cacheKey);
        if (local && local.data.length > 0) {
            clientMemoryCache.set(cacheKey, { data: local.data, timestamp: Date.now() });
            return local.data;
        }
        // 首次打开午夜版，直接使用高质量预置种子库，完全 0ms 秒开呈现
        return PREBAKED_PREMIUM_DATA;
    });

    // 保持 false，彻底杜绝骨架屏卡滞，后台永远静默同步
    const [loading, setLoading] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);

    const loadingRef = useRef(false);
    const categoryRef = useRef(categoryValue);
    const modeRef = useRef(rankingMode);
    categoryRef.current = categoryValue;
    modeRef.current = rankingMode;

    const loadVideos = useCallback(async (pageNum: number, append = false) => {
        if (loadingRef.current) return;
        loadingRef.current = true;

        const currentKey = categoryRef.current ? `cat:${categoryRef.current}` : `mode:${modeRef.current}`;

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3500);

            let apiUrl = `/api/premium/jable?page=${pageNum}`;
            if (categoryRef.current) {
                apiUrl += `&mode=search&q=${encodeURIComponent(categoryRef.current)}`;
            } else {
                apiUrl += `&mode=${encodeURIComponent(modeRef.current || 'today')}`;
            }

            const response = await fetch(apiUrl, {
                method: 'GET',
                signal: controller.signal,
                headers: { 'Accept': 'application/json' },
            });

            clearTimeout(timeoutId);

            if (!response.ok) throw new Error('Failed to fetch from jable API');

            const data = await response.json();
            const newVideos: PremiumVideo[] = data.videos || [];

            if (newVideos.length > 0) {
                setVideos(prev => {
                    const merged = append ? [...prev, ...newVideos] : newVideos;
                    if (pageNum === 1) {
                        clientMemoryCache.set(currentKey, { data: newVideos, timestamp: Date.now() });
                        setStorageCache(currentKey, newVideos);
                    }
                    return merged;
                });
            }

            setHasMore(newVideos.length >= PAGE_LIMIT);
        } catch (error) {
            console.warn('[usePremiumContent] Fetch error, keeping cached data:', error);
            setHasMore(false);
        } finally {
            loadingRef.current = false;
            setLoading(false);
        }
    }, []);

    // 监听分类或榜单 Tab 变化，0ms 优先展示缓存并触发每日后台对齐
    useEffect(() => {
        const key = categoryValue ? `cat:${categoryValue}` : `mode:${rankingMode}`;
        const mem = clientMemoryCache.get(key);
        const local = !mem ? getStorageCache(key) : null;
        const cachedData = mem ? mem.data : local?.data;
        const isFresh = mem ? (Date.now() - mem.timestamp < ONE_DAY_MS) : Boolean(local?.isFresh);

        setPage(1);
        if (cachedData && cachedData.length > 0) {
            setVideos(cachedData);
        } else if (!categoryValue && rankingMode === 'today') {
            setVideos(PREBAKED_PREMIUM_DATA);
        }
        // 绝不强行将 videos 设为空数组，避免用户等待大白板
        setLoading(false);
        setHasMore(true);

        // 若当前处于 24 小时新鲜期内，跳过重复网络回源，实现真正的每日对齐一次
        if (!isFresh || !cachedData || cachedData.length === 0) {
            loadVideos(1, false);
        }
    }, [categoryValue, rankingMode, loadVideos]);

    const { prefetchRef, loadMoreRef } = useInfiniteScroll({
        hasMore,
        loading,
        page,
        onLoadMore: (nextPage) => {
            setPage(nextPage);
            loadVideos(nextPage, true);
        },
    });

    return {
        videos,
        loading,
        hasMore,
        prefetchRef,
        loadMoreRef,
    };
}
