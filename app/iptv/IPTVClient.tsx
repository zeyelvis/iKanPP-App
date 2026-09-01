'use client';

import { useState } from 'react';
import { IPTVChannelGrid } from '@/components/iptv/IPTVChannelGrid';
import { IPTVPlayer } from '@/components/iptv/IPTVPlayer';
import { Tv } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { LIVE_CHANNELS, type LiveChannel } from '@/lib/data/live-channels';

export default function IPTVClient() {
  const [activeChannel, setActiveChannel] = useState<LiveChannel>(() => LIVE_CHANNELS[0]);

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      <Navbar />

      <div className="fluid-container pt-3 sm:pt-4 pb-28 sm:pb-16 space-y-6 sm:space-y-8">
        {/* 1. 演播大厅顶部：超清直播播放器 */}
        {activeChannel && (
          <div className="relative group/iptv-player rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black">
            {/* 环境流光 */}
            <div className="absolute -inset-2 bg-linear-to-r from-red-600/20 via-blue-600/20 to-purple-600/20 rounded-3xl blur-2xl opacity-50 -z-10" />

            <div className="p-4 sm:p-5 bg-black/50 backdrop-blur-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white rounded-full text-xs font-black shadow-lg shadow-red-600/30">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span>LIVE 直播中</span>
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                    {activeChannel.name}
                  </h2>
                  <p className="text-xs text-white/40">
                    {activeChannel.category} · 海外专线超清直连 · 0 缓冲极速秒播
                  </p>
                </div>
              </div>

              {/* 快捷标签 */}
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/70 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  流媒体专线已连通
                </span>
              </div>
            </div>

            {/* 直播播放器主舞台 */}
            <div className="w-full aspect-video max-h-[640px] bg-black">
              <IPTVPlayer
                channel={activeChannel}
                channels={LIVE_CHANNELS}
                onChannelChange={(ch) => setActiveChannel(ch)}
              />
            </div>
          </div>
        )}

        {/* 2. 全国电视频道矩阵大厅 */}
        <div className="bg-[#0A0A0F]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-2xl bg-red-600 text-white shadow-lg shadow-red-600/20">
                <Tv size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">全国电视频道矩阵</h1>
                <p className="text-xs text-white/40">
                  CCTV 央视全套 · 全国各大高清卫视 · 海外专线 24 小时全天候直连
                </p>
              </div>
            </div>
          </div>

          <IPTVChannelGrid
            channels={LIVE_CHANNELS}
            activeChannel={activeChannel}
            onSelect={(channel) => {
              setActiveChannel(channel);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>
      </div>
    </div>
  );
}
