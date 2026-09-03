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

// 客户端全局 SWR 内存与持久化缓存池
const clientMemoryCache = new Map<string, PremiumVideo[]>();

function getStorageCache(key: string): PremiumVideo[] | null {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem(STORAGE_PREFIX + key);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
        }
    } catch {}
    return null;
}

function setStorageCache(key: string, data: PremiumVideo[]) {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data.slice(0, 40)));
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
        if (mem && mem.length > 0) return mem;
        const local = getStorageCache(cacheKey);
        if (local && local.length > 0) {
            clientMemoryCache.set(cacheKey, local);
            return local;
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
                        clientMemoryCache.set(currentKey, newVideos);
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

    // 监听分类或榜单 Tab 变化，0ms 优先展示缓存并触发后台 SWR
    useEffect(() => {
        const key = categoryValue ? `cat:${categoryValue}` : `mode:${rankingMode}`;
        const mem = clientMemoryCache.get(key);
        const local = !mem ? getStorageCache(key) : null;
        const cached = mem || local;

        setPage(1);
        if (cached && cached.length > 0) {
            setVideos(cached);
        } else if (!categoryValue && rankingMode === 'today') {
            setVideos(PREBAKED_PREMIUM_DATA);
        }
        // 绝不强行将 videos 设为空数组，避免用户等待大白板
        setLoading(false);
        setHasMore(true);

        loadVideos(1, false);
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
