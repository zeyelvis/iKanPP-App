'use client';

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
  const { sources, cachedChannels, cachedGroups, cachedChannelsBySource, refreshSources, isLoading } = useIPTVStore();
  const [activeChannel, setActiveChannel] = useState<M3UChannel | null>(null);

  const canAccessIPTV = hasPermission('iptv_access');

  // 无权限提示
  if (!canAccessIPTV && getSession()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0F]">
        <div className="text-center p-8 bg-white/5 rounded-3xl border border-white/10 max-w-sm">
          <Icons.TV size={48} className="mx-auto mb-4 text-white/30" />
          <p className="text-white font-bold text-lg mb-2">无权访问 IPTV 电视直播</p>
          <p className="text-sm text-white/50 mb-6">请联系管理员开通直播权限</p>
          <Link href="/" className="px-6 py-2.5 bg-(--accent-color) text-white rounded-full text-xs font-bold inline-block">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (sources.length > 0 && cachedChannels.length === 0 && !isLoading) {
      refreshSources();
    }
  }, [sources.length, cachedChannels.length, isLoading, refreshSources]);

  // 默认选中第一个可用频道
  useEffect(() => {
    if (!activeChannel && cachedChannels.length > 0) {
      setActiveChannel(cachedChannels[0]);
    }
  }, [activeChannel, cachedChannels]);

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      <Navbar />

      <div className="fluid-container pt-3 sm:pt-4 pb-28 sm:pb-16 space-y-6 sm:space-y-8">
        {/* 1. 演播室顶部区域：直播播放器与正在播放信息 */}
        {activeChannel && (
          <div className="relative group/iptv-player rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black">
            {/* 环境流光 */}
            <div className="absolute -inset-2 bg-linear-to-r from-red-600/20 via-(--accent-color)/20 to-blue-600/20 rounded-3xl blur-2xl opacity-50 -z-10" />

            <div className="p-4 sm:p-6 bg-black/40 backdrop-blur-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1 bg-red-600/90 text-white rounded-full text-xs font-black shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span>LIVE 直播中</span>
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                    {activeChannel.name}
                  </h2>
                  {activeChannel.group && (
                    <p className="text-xs text-white/40">{activeChannel.group}</p>
                  )}
                </div>
              </div>

              {/* 刷新频道源 */}
              <button
                onClick={() => refreshSources()}
                disabled={isLoading}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 self-start md:self-auto"
              >
                <Icons.RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
                <span>{isLoading ? '同步频道中...' : '刷新频道源'}</span>
              </button>
            </div>

            {/* 直播播放器窗口 */}
            <div className="w-full aspect-video max-h-155 bg-black">
              <IPTVPlayer
                channel={activeChannel}
                onClose={() => {}}
                channels={cachedChannels}
                onChannelChange={(ch) => setActiveChannel(ch)}
                channelsBySource={cachedChannelsBySource}
                sources={sources}
              />
            </div>
          </div>
        )}

        {/* 2. 频道列表与探索 */}
        <div className="bg-[#0A0A0F]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-2xl bg-(--accent-color) text-white shadow-lg">
                <Icons.TV size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">全国电视频道矩阵</h1>
                <p className="text-xs text-white/40">央视 · 卫视 · 港澳台 · 4K 高清轮播</p>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-20">
              <div className="w-12 h-12 border-3 border-(--accent-color)/30 border-t-(--accent-color) rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-white/60">正在拉取最新的超清频道列表...</p>
            </div>
          ) : (
            <IPTVChannelGrid
              channels={cachedChannels}
              groups={cachedGroups}
              onSelect={(channel) => {
                setActiveChannel(channel);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              activeChannel={activeChannel}
              channelsBySource={cachedChannelsBySource}
              sources={sources}
            />
          )}
        </div>
      </div>
    </div>
  );
}
