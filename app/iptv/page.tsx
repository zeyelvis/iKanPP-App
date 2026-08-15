'use client';

/**
 * IPTV Page - Live TV channel viewer
 * 使用全局 Navbar，禁止用户自行管理源
 */

import { useState, useEffect } from 'react';
import { useIPTVStore } from '@/lib/store/iptv-store';
import { IPTVChannelGrid } from '@/components/iptv/IPTVChannelGrid';
import { IPTVPlayer } from '@/components/iptv/IPTVPlayer';
import { Icons } from '@/components/ui/Icon';
import { hasPermission, getSession } from '@/lib/store/auth-store';
import { Navbar } from '@/components/layout/Navbar';
import Link from 'next/link';
import type { M3UChannel } from '@/lib/utils/m3u-parser';

export default function IPTVPage() {
  const { sources, cachedChannels, cachedGroups, cachedChannelsBySource, refreshSources, isLoading, lastRefreshed } = useIPTVStore();
  const [activeChannel, setActiveChannel] = useState<M3UChannel | null>(null);

  const canAccessIPTV = hasPermission('iptv_access');

  // 无权限时显示提示
  if (!canAccessIPTV && getSession()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-color)] bg-[image:var(--bg-image)]">
        <div className="text-center p-8">
          <Icons.TV size={48} className="mx-auto mb-4 text-[var(--text-color-secondary)] opacity-40" />
          <p className="text-[var(--text-color)] font-medium mb-2">无权访问 IPTV</p>
          <p className="text-sm text-[var(--text-color-secondary)] mb-4">请联系管理员开通权限</p>
          <Link href="/" className="text-sm text-[var(--accent-color)] hover:underline">返回首页</Link>
        </div>
      </div>
    );
  }

  // 首次加载自动刷新频道
  useEffect(() => {
    if (sources.length > 0 && cachedChannels.length === 0 && !isLoading) {
      refreshSources();
    }
  }, [sources.length, cachedChannels.length, isLoading, refreshSources]);

  return (
      <div className="min-h-screen bg-[var(--bg-color)] bg-[image:var(--bg-image)] bg-fixed">
        {/* 全局统一 Navbar */}
        <Navbar />

        <div className="fluid-container pt-4 pb-8">
          {/* 页面标题 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-full"
                   style={{ background: 'var(--accent-color)', color: 'white' }}>
                <Icons.TV size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ color: 'var(--text-color)' }}>
                  电视直播
                </h1>
                <p className="text-xs" style={{ color: 'var(--text-color-secondary)' }}>
                  {cachedChannels.length > 0 ? `${cachedChannels.length} 个频道在线` : '加载频道中...'}
                </p>
              </div>
            </div>
            {/* 刷新按钮 */}
            <button
              onClick={() => refreshSources()}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer disabled:opacity-50"
              style={{
                color: 'var(--accent-color)',
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
              }}
            >
              <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              {isLoading ? '刷新中...' : '刷新'}
            </button>
          </div>

          {/* 加载状态 */}
          {isLoading && (
            <div className="text-center py-16">
              <div className="w-10 h-10 border-2 border-[var(--accent-color)]/30 border-t-[var(--accent-color)] rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-[var(--text-color-secondary)]">正在加载频道列表...</p>
            </div>
          )}

          {/* 频道列表 */}
          {!isLoading && (
            <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-[var(--radius-2xl)] shadow-[var(--shadow-sm)] p-6">
              <IPTVChannelGrid
                channels={cachedChannels}
                groups={cachedGroups}
                onSelect={setActiveChannel}
                activeChannel={activeChannel}
                channelsBySource={cachedChannelsBySource}
                sources={sources}
              />
            </div>
          )}
        </div>

        {/* 播放器 Overlay */}
        {activeChannel && (
          <IPTVPlayer
            channel={activeChannel}
            onClose={() => setActiveChannel(null)}
            channels={cachedChannels}
            onChannelChange={setActiveChannel}
            channelsBySource={cachedChannelsBySource}
            sources={sources}
          />
        )}
      </div>
  );
}

