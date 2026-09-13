'use client';

import { useState, useEffect } from 'react';

export interface GeoData {
    countryCode: string;
    countryName: string;
    region: string;
    city: string;
    state: string;
    timezone: string;
    cfNode: string;
    cfNodeCode: string;
    isOverseas: boolean;
    directStreamingAccelerated: boolean;
}

const GEO_CACHE_KEY = 'kvideo_geo_data';

export function getClientCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    try {
        const match = document.cookie.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'));
        return match ? decodeURIComponent(match[1]) : null;
    } catch {
        return null;
    }
}

/**
 * 极速轻量判断当前用户是否在中国大陆 (0ms，首帧可用，零网络延迟)
 */
export function useIsChinaMainland(): boolean {
    const [isChina, setIsChina] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false;
        const cookieVal = getClientCookie('geo-region');
        if (cookieVal) return cookieVal.toUpperCase() === 'CN';
        try {
            const cached = sessionStorage.getItem(GEO_CACHE_KEY);
            if (cached) {
                const parsed = JSON.parse(cached);
                return parsed.countryCode === 'CN';
            }
        } catch {}
        return false;
    });

    return isChina;
}

export function useGeoLocation() {
    const [geo, setGeo] = useState<GeoData | null>(() => {
        if (typeof window === 'undefined') return null;
        try {
            const cached = sessionStorage.getItem(GEO_CACHE_KEY);
            if (cached) return JSON.parse(cached);
        } catch {
            // 继续向下尝试 cookie 预填充
        }

        const cookieRegion = getClientCookie('geo-region');
        if (cookieRegion) {
            const isCN = cookieRegion.toUpperCase() === 'CN';
            return {
                countryCode: cookieRegion,
                countryName: isCN ? '中国' : 'Overseas',
                region: '',
                city: '',
                state: '',
                timezone: '',
                cfNode: '',
                cfNodeCode: '',
                isOverseas: !isCN,
                directStreamingAccelerated: true,
            };
        }

        return null;
    });

    const [loading, setLoading] = useState<boolean>(!geo);

    useEffect(() => {
        if (geo && geo.region) return; // 已有完整信息则不重复请求

        let cancelled = false;

        fetch('/api/geo')
            .then(res => res.ok ? res.json() : null)
            .then((data: GeoData | null) => {
                if (!cancelled && data) {
                    setGeo(data);
                    try {
                        sessionStorage.setItem(GEO_CACHE_KEY, JSON.stringify(data));
                    } catch {}
                }
            })
            .catch(() => {
                // 静默失败降级
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [geo]);

    return { geo, loading };
}

