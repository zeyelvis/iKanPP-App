import { useState, useEffect, useCallback, useRef } from 'react';
import { useInfiniteScroll } from '@/lib/hooks/useInfiniteScroll';
import { settingsStore } from '@/lib/store/settings-store';

export interface PremiumVideo {
    vod_id: string | number;
    vod_name: string;
    vod_pic?: string;
    vod_remarks?: string;
    type_name?: string;
    source: string;
}

const PAGE_LIMIT = 20;

// 客户端内存/持久级 SWR 缓存池
const clientMemoryCache = new Map<string, PremiumVideo[]>();

export function usePremiumContent(categoryValue: string) {
    const cacheKey = categoryValue || '_all_';

    // 优先从内存缓存中读取初始数据（实现 0ms 瞬间直出）
    const [videos, setVideos] = useState<PremiumVideo[]>(() => {
        return clientMemoryCache.get(cacheKey) || [];
    });

    const [loading, setLoading] = useState<boolean>(() => {
        // 如果已有缓存，不显示全屏加载态
        return !clientMemoryCache.has(cacheKey);
    });

    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);

    const loadingRef = useRef(false);
    const categoryRef = useRef(categoryValue);
    categoryRef.current = categoryValue;

    const loadVideos = useCallback(async (pageNum: number, append = false) => {
        if (loadingRef.current) return;

        loadingRef.current = true;
        // 只有无缓存数据时才展示主 loading
        if (!append && (!clientMemoryCache.has(categoryRef.current || '_all_'))) {
            setLoading(true);
        }

        try {
            const settings = settingsStore.getSettings();
            const premiumSources = [
                ...settings.premiumSources,
                ...settings.subscriptions.filter(s => (s as any).group === 'premium')
            ].filter(s => (s as any).enabled !== false);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3500); // 客户端最高 3.5s 超时保护

            const response = await fetch('/api/premium/category', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal: controller.signal,
                body: JSON.stringify({
                    sources: premiumSources.length > 0 ? premiumSources : undefined,
                    category: categoryRef.current,
                    page: pageNum.toString(),
                    limit: PAGE_LIMIT.toString()
                })
            });

            clearTimeout(timeoutId);

            if (!response.ok) throw new Error('Failed to fetch');

            const data = await response.json();
            const newVideos: PremiumVideo[] = data.videos || [];

            if (newVideos.length > 0) {
                setVideos(prev => {
                    const merged = append ? [...prev, ...newVideos] : newVideos;
                    if (pageNum === 1) {
                        clientMemoryCache.set(categoryRef.current || '_all_', newVideos);
                    }
                    return merged;
                });
            }

            setHasMore(newVideos.length >= PAGE_LIMIT);
        } catch (error) {
            console.error('Failed to load videos:', error);
            // 若为第一页且原本有缓存，则静默容灾，不中断用户体验
            setHasMore(false);
        } finally {
            loadingRef.current = false;
            setLoading(false);
        }
    }, []);

    // 分类变化时触发 SWR 更新
    useEffect(() => {
        const key = categoryValue || '_all_';
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
    }, [categoryValue, loadVideos]);

    // 订阅设置变化，源异步加载完成后重试
    useEffect(() => {
        const handleSettingsUpdate = () => {
            const settings = settingsStore.getSettings();
            const premiumSources = [
                ...settings.premiumSources,
                ...settings.subscriptions.filter(s => (s as any).group === 'premium')
            ].filter(s => (s as any).enabled !== false);

            if (premiumSources.length > 0 && !loadingRef.current) {
                setVideos(currentVideos => {
                    if (currentVideos.length === 0) {
                        setTimeout(() => loadVideos(1, false), 0);
                    }
                    return currentVideos;
                });
            }
        };

        const unsubscribe = settingsStore.subscribe(handleSettingsUpdate);
        return () => unsubscribe();
    }, [loadVideos]);

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
