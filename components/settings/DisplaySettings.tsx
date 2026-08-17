'use client';

/**
 * DisplaySettings - Settings for theme, search display and latency
 * Following Liquid Glass design system
 */

import { type SearchDisplayMode } from '@/lib/store/settings-store';
import { Switch } from '@/components/ui/Switch';
import { useTheme } from '@/components/ThemeProvider';
import { Icons } from '@/components/ui/Icon';
import { setTVMode } from '@/lib/hooks/useTVDetection';
import { useIsTV } from '@/lib/contexts/TVContext';
import { useGeoLocation } from '@/lib/hooks/useGeoLocation';

interface DisplaySettingsProps {
    realtimeLatency: boolean;
    searchDisplayMode: SearchDisplayMode;
    rememberScrollPosition: boolean;
    onRealtimeLatencyChange: (enabled: boolean) => void;
    onSearchDisplayModeChange: (mode: SearchDisplayMode) => void;
    onRememberScrollPositionChange: (enabled: boolean) => void;
}

export function DisplaySettings({
    realtimeLatency,
    searchDisplayMode,
    rememberScrollPosition,
    onRealtimeLatencyChange,
    onSearchDisplayModeChange,
    onRememberScrollPositionChange,
}: DisplaySettingsProps) {
    const { theme, setTheme } = useTheme();
    const isTV = useIsTV();
    const { geo, loading: geoLoading } = useGeoLocation();
    const tvModeSetting = typeof window !== 'undefined'
        ? (localStorage.getItem('kvideo-tv-mode') || 'auto')
        : 'auto';

    const themeOptions: { value: 'system' | 'light' | 'dark'; label: string; icon: React.ReactNode; desc: string }[] = [
        { value: 'system', label: '跟随系统', icon: <Icons.Monitor size={18} />, desc: '自动适配系统主题' },
        { value: 'light', label: '浅色模式', icon: <Icons.Sun size={18} />, desc: '明亮的白天主题' },
        { value: 'dark', label: '深色模式', icon: <Icons.Moon size={18} />, desc: '护眼的暗黑主题' },
    ];

    return (
        <div className="bg-(--glass-bg) border border-(--glass-border) rounded-2xl shadow-(--shadow-sm) p-6 mb-6">
            <h2 className="text-xl font-semibold text-(--text-color) mb-4">显示设置</h2>

            {/* Theme Display Card */}
            <div className="mb-6">
                <h3 className="font-medium text-(--text-color) mb-2">外观主题</h3>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center text-amber-400 shrink-0 shadow-lg">
                            <Icons.Moon size={20} />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-white flex items-center gap-2">
                                <span>纯暗黑影院模式 (Cinema Dark)</span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">已永久开启</span>
                            </div>
                            <p className="text-xs text-white/50 mt-0.5">
                                专为电影大片与夜间观影打造，提供最高色彩对比度与沉浸护眼体验
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* TV Mode Selector */}
            <div className="mb-6">
                <h3 className="font-medium text-(--text-color) mb-2">
                    📺 电视模式
                    {isTV && <span className="ml-2 text-xs text-emerald-400 font-normal">(当前已激活)</span>}
                </h3>
                <p className="text-sm text-(--text-color-secondary) mb-4">
                    在电视/大屏设备上放大字体和按钮，支持遥控器方向键导航
                </p>
                <div className="grid grid-cols-3 gap-3">
                    {([
                        { value: 'auto', label: '自动检测', desc: '根据设备自动判断' },
                        { value: 'on', label: '强制开启', desc: '始终使用电视布局' },
                        { value: 'off', label: '关闭', desc: '使用默认布局' },
                    ] as const).map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => setTVMode(opt.value)}
                            className={`px-3 py-3 rounded-2xl border text-center font-medium transition-all duration-200 cursor-pointer ${tvModeSetting === opt.value
                                ? 'bg-(--accent-color) border-(--accent-color) text-white shadow-[0_4px_12px_rgba(var(--accent-color-rgb),0.3)]'
                                : 'bg-(--glass-bg) border-(--glass-border) text-(--text-color) hover:bg-[color-mix(in_srgb,var(--accent-color)_10%,transparent)]'
                                }`}
                        >
                            <div className="text-sm font-semibold">{opt.label}</div>
                            <div className="text-xs opacity-70 hidden sm:block mt-1">{opt.desc}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Remember Scroll Position Toggle */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-medium text-(--text-color)">记住滚动位置</h3>
                        <p className="text-sm text-(--text-color-secondary) mt-1">
                            退出或刷新页面后，自动恢复到之前的滚动位置
                        </p>
                    </div>
                    <Switch
                        checked={rememberScrollPosition}
                        onChange={onRememberScrollPositionChange}
                        ariaLabel="记住滚动位置开关"
                    />
                </div>
            </div>

            {/* Real-time Latency Toggle */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-medium text-(--text-color)">实时延迟显示</h3>
                        <p className="text-sm text-(--text-color-secondary) mt-1">
                            开启后，搜索结果中的延迟数值会每 5 秒更新一次
                        </p>
                    </div>
                    <Switch
                        checked={realtimeLatency}
                        onChange={onRealtimeLatencyChange}
                        ariaLabel="实时延迟显示开关"
                    />
                </div>
            </div>

            {/* Search Display Mode */}
            <div className="mb-6">
                <h3 className="font-medium text-(--text-color) mb-2">搜索结果显示方式</h3>
                <p className="text-sm text-(--text-color-secondary) mb-4">
                    选择搜索结果的展示模式
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                        onClick={() => onSearchDisplayModeChange('normal')}
                        className={`px-4 py-3 rounded-2xl border text-left font-medium transition-all duration-200 cursor-pointer ${searchDisplayMode === 'normal'
                            ? 'bg-(--accent-color) border-(--accent-color) text-white shadow-[0_4px_12px_rgba(var(--accent-color-rgb),0.3)]'
                            : 'bg-(--glass-bg) border-(--glass-border) text-(--text-color) hover:bg-[color-mix(in_srgb,var(--accent-color)_10%,transparent)]'
                            }`}
                    >
                        <div className="font-semibold">默认显示</div>
                        <div className="text-sm opacity-80 mt-1">每个源的结果单独显示</div>
                    </button>
                    <button
                        onClick={() => onSearchDisplayModeChange('grouped')}
                        className={`px-4 py-3 rounded-2xl border text-left font-medium transition-all duration-200 cursor-pointer ${searchDisplayMode === 'grouped'
                            ? 'bg-(--accent-color) border-(--accent-color) text-white shadow-[0_4px_12px_rgba(var(--accent-color-rgb),0.3)]'
                            : 'bg-(--glass-bg) border-(--glass-border) text-(--text-color) hover:bg-[color-mix(in_srgb,var(--accent-color)_10%,transparent)]'
                            }`}
                    >
                        <div className="font-semibold">合并同名源</div>
                        <div className="text-sm opacity-80 mt-1">相同名称的视频合并为一个卡片</div>
                    </button>
                </div>
            </div>

            {/* Geo & Network Status */}
            <div className="pt-5 border-t border-(--glass-border)">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-medium text-(--text-color) flex items-center gap-1.5">
                            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            全球边缘直连状态 (GEO)
                        </h3>
                        <p className="text-xs text-(--text-color-secondary) mt-1">
                            {geoLoading ? (
                                '正在检测最近的 Cloudflare 边缘加速节点...'
                            ) : geo ? (
                                <>
                                    当前接入：<span className="font-semibold text-(--text-color)">{geo.countryName} {geo.city ? `(${geo.city})` : ''}</span> · 节点：<span className="text-(--accent-color) font-medium">{geo.cfNode}</span>
                                    {geo.isOverseas && <span className="ml-1.5 px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-medium">海外免翻墙直连</span>}
                                </>
                            ) : (
                                'Cloudflare Anycast 全球边缘就近分发已就绪'
                            )}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
