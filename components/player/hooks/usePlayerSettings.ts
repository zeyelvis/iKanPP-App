'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    settingsStore,
    type AppSettings,
    type AdFilterMode,
} from '@/lib/store/settings-store';

interface PlayerSettingsSnapshot {
    autoNextEpisode: boolean;
    autoSkipIntro: boolean;
    skipIntroSeconds: number;
    autoSkipOutro: boolean;
    skipOutroSeconds: number;
    showModeIndicator: boolean;
    adFilter: boolean;
    adFilterMode: AdFilterMode;
    adKeywords: string[];
    fullscreenType: 'auto' | 'native' | 'window';
    danmakuEnabled: boolean;
    danmakuApiUrl: string;
    danmakuOpacity: number;
    danmakuFontSize: number;
    danmakuDisplayArea: number;
}

// 主站播放一律直连源站，不经代理（AGENTS 第 8 条），所以这里没有代理相关设置。
function getPlayerSettingsSnapshot(): PlayerSettingsSnapshot {
    const globalSettings = settingsStore.getSettings();

    return {
        autoNextEpisode: globalSettings.autoNextEpisode,
        autoSkipIntro: globalSettings.autoSkipIntro,
        skipIntroSeconds: globalSettings.skipIntroSeconds,
        autoSkipOutro: globalSettings.autoSkipOutro,
        skipOutroSeconds: globalSettings.skipOutroSeconds,
        showModeIndicator: globalSettings.showModeIndicator,
        adFilter: globalSettings.adFilter,
        adFilterMode: globalSettings.adFilterMode,
        adKeywords: globalSettings.adKeywords,
        fullscreenType: globalSettings.fullscreenType,
        danmakuEnabled: globalSettings.danmakuEnabled,
        danmakuApiUrl: globalSettings.danmakuApiUrl,
        danmakuOpacity: globalSettings.danmakuOpacity,
        danmakuFontSize: globalSettings.danmakuFontSize,
        danmakuDisplayArea: globalSettings.danmakuDisplayArea,
    };
}

function playerSettingsEqual(a: PlayerSettingsSnapshot, b: PlayerSettingsSnapshot): boolean {
    return (
        a.autoNextEpisode === b.autoNextEpisode &&
        a.autoSkipIntro === b.autoSkipIntro &&
        a.skipIntroSeconds === b.skipIntroSeconds &&
        a.autoSkipOutro === b.autoSkipOutro &&
        a.skipOutroSeconds === b.skipOutroSeconds &&
        a.showModeIndicator === b.showModeIndicator &&
        a.adFilter === b.adFilter &&
        a.adFilterMode === b.adFilterMode &&
        a.adKeywords === b.adKeywords &&
        a.fullscreenType === b.fullscreenType &&
        a.danmakuEnabled === b.danmakuEnabled &&
        a.danmakuApiUrl === b.danmakuApiUrl &&
        a.danmakuOpacity === b.danmakuOpacity &&
        a.danmakuFontSize === b.danmakuFontSize &&
        a.danmakuDisplayArea === b.danmakuDisplayArea
    );
}

/**
 * Hook to access and update player settings from the settings store
 * Provides reactive updates when settings change
 */
export function usePlayerSettings() {
    const [settings, setSettings] = useState(getPlayerSettingsSnapshot);

    // Subscribe to settings changes. Reuse the previous snapshot when
    // non-player fields change (e.g. episodeReverseOrder) so HLS is not rebuilt.
    useEffect(() => {
        const syncSettings = () => {
            const next = getPlayerSettingsSnapshot();
            setSettings((prev) => (playerSettingsEqual(prev, next) ? prev : next));
        };
        const unsubscribe = settingsStore.subscribe(syncSettings);
        syncSettings();
        return unsubscribe;
    }, []);

    const updateModeSettings = useCallback((partial: Partial<AppSettings>) => {
        const currentSettings = settingsStore.getSettings();
        settingsStore.saveSettings({
            ...currentSettings,
            ...partial,
        });
    }, []);

    const updateGlobalSettings = useCallback((partial: Partial<AppSettings>) => {
        const currentSettings = settingsStore.getSettings();
        settingsStore.saveSettings({
            ...currentSettings,
            ...partial,
        });
    }, []);

    const setAutoNextEpisode = useCallback((value: boolean) => {
        updateModeSettings({ autoNextEpisode: value });
    }, [updateModeSettings]);

    const setAutoSkipIntro = useCallback((value: boolean) => {
        updateModeSettings({ autoSkipIntro: value });
    }, [updateModeSettings]);

    const setSkipIntroSeconds = useCallback((value: number) => {
        updateModeSettings({ skipIntroSeconds: Math.max(0, value) });
    }, [updateModeSettings]);

    const setAutoSkipOutro = useCallback((value: boolean) => {
        updateModeSettings({ autoSkipOutro: value });
    }, [updateModeSettings]);

    const setSkipOutroSeconds = useCallback((value: number) => {
        updateModeSettings({ skipOutroSeconds: Math.max(0, value) });
    }, [updateModeSettings]);

    const setShowModeIndicator = useCallback((value: boolean) => {
        updateModeSettings({ showModeIndicator: value });
    }, [updateModeSettings]);

    const setAdFilter = useCallback((value: boolean) => {
        updateGlobalSettings({ adFilter: value });
    }, [updateGlobalSettings]);

    const setAdFilterMode = useCallback((value: AdFilterMode) => {
        updateModeSettings({ adFilterMode: value });
    }, [updateModeSettings]);

    const setAdKeywords = useCallback((value: string[]) => {
        updateGlobalSettings({ adKeywords: value });
    }, [updateGlobalSettings]);

    const setFullscreenType = useCallback((value: 'auto' | 'native' | 'window') => {
        updateModeSettings({ fullscreenType: value });
    }, [updateModeSettings]);

    const setDanmakuEnabled = useCallback((value: boolean) => {
        updateModeSettings({ danmakuEnabled: value });
    }, [updateModeSettings]);

    const setDanmakuApiUrl = useCallback((value: string) => {
        updateModeSettings({ danmakuApiUrl: value });
    }, [updateModeSettings]);

    const setDanmakuOpacity = useCallback((value: number) => {
        updateModeSettings({ danmakuOpacity: Math.max(0.1, Math.min(1, value)) });
    }, [updateModeSettings]);

    const setDanmakuFontSize = useCallback((value: number) => {
        updateModeSettings({ danmakuFontSize: value });
    }, [updateModeSettings]);

    const setDanmakuDisplayArea = useCallback((value: number) => {
        updateModeSettings({ danmakuDisplayArea: value });
    }, [updateModeSettings]);

    return {
        ...settings,
        setAutoNextEpisode,
        setAutoSkipIntro,
        setSkipIntroSeconds,
        setAutoSkipOutro,
        setSkipOutroSeconds,
        setShowModeIndicator,
        setAdFilter,
        setAdFilterMode,
        setAdKeywords,
        setFullscreenType,
        setDanmakuEnabled,
        setDanmakuApiUrl,
        setDanmakuOpacity,
        setDanmakuFontSize,
        setDanmakuDisplayArea,
    };
}
