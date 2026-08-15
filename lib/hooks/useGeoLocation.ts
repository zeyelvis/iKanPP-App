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

export function useGeoLocation() {
    const [geo, setGeo] = useState<GeoData | null>(() => {
        if (typeof window === 'undefined') return null;
        try {
            const cached = sessionStorage.getItem(GEO_CACHE_KEY);
            return cached ? JSON.parse(cached) : null;
        } catch {
            return null;
        }
    });

    const [loading, setLoading] = useState<boolean>(!geo);

    useEffect(() => {
        if (geo) return;

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
