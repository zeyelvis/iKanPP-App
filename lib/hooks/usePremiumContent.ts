import { useState, useEffect, useCallback, useRef } from 'react';
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
    const baseCacheKey = categoryValue ? `cat:${categoryValue}` : `mode:${rankingMode}`;

    // 0ms 瞬间秒开初始状态：内存 -> localStorage -> 预烘焙精选库
    const [videos, setVideos] = useState<PremiumVideo[]>(() => {
        const mem = clientMemoryCache.get(baseCacheKey);
        if (mem && mem.data.length > 0) return mem.data;
        const local = getStorageCache(baseCacheKey);
        if (local && local.data.length > 0) {
            clientMemoryCache.set(baseCacheKey, { data: local.data, timestamp: Date.now() });
            return local.data;
        }
        // 首次打开午夜版，直接使用高质量预置种子库，完全 0ms 秒开呈现
        return PREBAKED_PREMIUM_DATA;
    });

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
        setLoading(true);

        const currentBaseKey = categoryRef.current ? `cat:${categoryRef.current}` : `mode:${modeRef.current}`;
        const pageKey = pageNum === 1 ? currentBaseKey : `${currentBaseKey}:page:${pageNum}`;

        // 优先检查内存缓存（翻页秒切）
        if (!append) {
            const mem = clientMemoryCache.get(pageKey);
            if (mem && mem.data.length > 0 && Date.now() - mem.timestamp < ONE_DAY_MS) {
                setVideos(mem.data);
                setHasMore(mem.data.length >= PAGE_LIMIT);
                loadingRef.current = false;
                setLoading(false);
                return;
            }
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
                    clientMemoryCache.set(pageKey, { data: newVideos, timestamp: Date.now() });
                    if (pageNum === 1 && !append) {
                        setStorageCache(currentBaseKey, newVideos);
                    }
                    return merged;
                });
            }

            setHasMore(newVideos.length >= PAGE_LIMIT);
        } catch (error) {
            console.warn('[usePremiumContent] Fetch error, keeping cached data:', error);
            // 若第 1 页拉取失败，保持现有或预置数据；若第 2 页失败，则提示暂无更多
            if (pageNum > 1) {
                setHasMore(false);
            }
        } finally {
            loadingRef.current = false;
            setLoading(false);
        }
    }, []);

    // 显式数字翻页切换方法
    const changePage = useCallback((targetPage: number) => {
        if (targetPage < 1 || loadingRef.current) return;
        setPage(targetPage);
        loadVideos(targetPage, false);
    }, [loadVideos]);

    // 监听分类或榜单 Tab 变化，重置回第 1 页并 0ms 展示缓存
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

        setLoading(false);
        setHasMore(true);

        // 若当前处于 24 小时新鲜期内，跳过重复网络回源，实现真正的每日对齐一次
        if (!isFresh || !cachedData || cachedData.length === 0) {
            loadVideos(1, false);
        }
    }, [categoryValue, rankingMode, loadVideos]);

    const dummyRef = useRef<HTMLDivElement>(null);

    return {
        videos,
        loading,
        hasMore,
        page,
        setPage,
        changePage,
        prefetchRef: dummyRef,
        loadMoreRef: dummyRef,
    };
}

