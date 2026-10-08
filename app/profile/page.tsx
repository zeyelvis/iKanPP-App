'use client';

/**
 * 设置（原「个人中心」）。会员系统（账号、VIP、签到、邀请）已于 2026-10-08 去掉，
 * 这里只保留存在本机浏览器里的设置：播放器、显示、数据管理。不需要登录。
 */
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Database, Film, Palette } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { PlayerSettings } from '@/components/settings/PlayerSettings';
import { DisplaySettings } from '@/components/settings/DisplaySettings';
import { DataSettings } from '@/components/settings/DataSettings';
import { ExportModal } from '@/components/settings/ExportModal';
import { ImportModal } from '@/components/settings/ImportModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PermissionGate } from '@/components/PermissionGate';
import { hasPermission } from '@/lib/store/auth-store';
import { useSettingsPage } from '@/app/settings/hooks/useSettingsPage';

const TABS = [
    { id: 'player', label: '播放器', icon: Film },
    { id: 'display', label: '显示设置', icon: Palette },
    { id: 'data', label: '数据管理', icon: Database },
] as const;

type TabId = (typeof TABS)[number]['id'];
const isTab = (v: string | null): v is TabId => TABS.some((t) => t.id === v);

function SettingsContent() {
    const searchParams = useSearchParams();
    const initial = searchParams.get('tab');
    const [activeTab, setActiveTab] = useState<TabId>(isTab(initial) ? initial : 'player');
    const settings = useSettingsPage();

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (isTab(tab)) setActiveTab(tab);
    }, [searchParams]);

    const handleTabChange = (tab: TabId) => {
        setActiveTab(tab);
        window.history.replaceState(null, '', `/profile?tab=${tab}`);
    };

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-color)', backgroundImage: 'var(--bg-image)' }}>
            <Navbar variant="player" />
            <div className="max-w-3xl mx-auto px-3 sm:px-4 py-3 sm:py-6 pb-28 sm:pb-12">
                <div className="flex gap-1.5 overflow-x-auto pb-3 scrollbar-hide">
                    {TABS.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${activeTab === tab.id
                                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                    : 'bg-white/5 border border-transparent hover:bg-white/10'
                                    }`}
                                style={activeTab !== tab.id ? { color: 'var(--text-color-secondary)' } : undefined}
                            >
                                <Icon size={14} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                <main className="space-y-6">
                    {activeTab === 'player' && (
                        <PermissionGate permission="player_settings">
                            <PlayerSettings
                                fullscreenType={settings.fullscreenType}
                                onFullscreenTypeChange={settings.handleFullscreenTypeChange}
                                proxyMode={settings.proxyMode}
                                onProxyModeChange={settings.handleProxyModeChange}
                                danmakuApiUrl={settings.danmakuApiUrl}
                                onDanmakuApiUrlChange={settings.handleDanmakuApiUrlChange}
                                danmakuOpacity={settings.danmakuOpacity}
                                onDanmakuOpacityChange={settings.handleDanmakuOpacityChange}
                                danmakuFontSize={settings.danmakuFontSize}
                                onDanmakuFontSizeChange={settings.handleDanmakuFontSizeChange}
                                danmakuDisplayArea={settings.danmakuDisplayArea}
                                onDanmakuDisplayAreaChange={settings.handleDanmakuDisplayAreaChange}
                                showDanmakuApi={hasPermission('danmaku_api')}
                            />
                        </PermissionGate>
                    )}
                    {activeTab === 'display' && (
                        <DisplaySettings
                            realtimeLatency={settings.realtimeLatency}
                            searchDisplayMode={settings.searchDisplayMode}
                            rememberScrollPosition={settings.rememberScrollPosition}
                            onRealtimeLatencyChange={settings.handleRealtimeLatencyChange}
                            onSearchDisplayModeChange={settings.handleSearchDisplayModeChange}
                            onRememberScrollPositionChange={settings.handleRememberScrollPositionChange}
                        />
                    )}
                    {activeTab === 'data' && (
                        <PermissionGate permission="data_management">
                            <DataSettings
                                onExport={() => settings.setIsExportModalOpen(true)}
                                onImport={() => settings.setIsImportModalOpen(true)}
                                onReset={() => settings.setIsResetDialogOpen(true)}
                            />
                            <ExportModal
                                isOpen={settings.isExportModalOpen}
                                onClose={() => settings.setIsExportModalOpen(false)}
                                onExport={settings.handleExport}
                            />
                            <ImportModal
                                isOpen={settings.isImportModalOpen}
                                onClose={() => settings.setIsImportModalOpen(false)}
                                onImportFile={settings.handleImportFile}
                                onImportLink={settings.handleImportLink}
                                subscriptions={settings.subscriptions}
                                onAddSubscription={settings.handleAddSubscription}
                                onRemoveSubscription={settings.handleRemoveSubscription}
                                onRefreshSubscription={settings.handleRefreshSubscription}
                            />
                            <ConfirmDialog
                                isOpen={settings.isResetDialogOpen}
                                title="清除所有数据"
                                message="这将删除所有设置、历史记录、Cookie 和缓存。此操作不可撤销。是否继续？"
                                confirmText="清除"
                                cancelText="取消"
                                onConfirm={settings.handleResetAll}
                                onCancel={() => settings.setIsResetDialogOpen(false)}
                                dangerous
                            />
                        </PermissionGate>
                    )}
                </main>
            </div>
        </div>
    );
}

export default function ProfilePage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-color)' }}>
                    <div className="brand-spinner" />
                </div>
            }
        >
            <SettingsContent />
        </Suspense>
    );
}
