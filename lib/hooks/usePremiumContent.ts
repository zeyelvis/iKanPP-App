import { useState, useEffect, useCallback, useRef } from 'react';
import { useInfiniteScroll } from '@/lib/hooks/useInfiniteScroll';

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

// 客户端全局 SWR 缓存池
const clientMemoryCache = new Map<string, PremiumVideo[]>();

export function usePremiumContent(
    categoryValue: string = '',
    rankingMode: string = 'today'
) {
    // 缓存 key 组合 category 和 rankingMode
    const cacheKey = categoryValue ? `cat:${categoryValue}` : `mode:${rankingMode}`;

    const [videos, setVideos] = useState<PremiumVideo[]>(() => {
        return clientMemoryCache.get(cacheKey) || [];
    });

    const [loading, setLoading] = useState<boolean>(() => {
        return !clientMemoryCache.has(cacheKey);
    });

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
        
        if (!append && !clientMemoryCache.has(currentKey)) {
            setLoading(true);
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 4000);

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
        const cached = clientMemoryCache.get(key);

        setPage(1);
        if (cached && cached.length > 0) {
            setVideos(cached);
            setLoading(false);
        } else {
            setVideos([]);
            setLoading(true);
        }
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
