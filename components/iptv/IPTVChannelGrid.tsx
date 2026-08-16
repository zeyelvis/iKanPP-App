'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Icons } from '@/components/ui/Icon';
import type { M3UChannel } from '@/lib/utils/m3u-parser';
import type { IPTVSource } from '@/lib/store/iptv-store';

const PAGE_SIZE = 120;

interface IPTVChannelGridProps {
  channels: M3UChannel[];
  groups: string[];
  onSelect: (channel: M3UChannel) => void;
  activeChannel?: M3UChannel | null;
  channelsBySource?: Record<string, { channels: M3UChannel[]; groups: string[] }>;
  sources?: IPTVSource[];
}

export function IPTVChannelGrid({
  channels,
  groups,
  onSelect,
  activeChannel,
  channelsBySource,
  sources,
}: IPTVChannelGridProps) {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filteredChannels = useMemo(() => {
    let result = channels;
    if (selectedGroup) {
      result = result.filter((c) => c.group === selectedGroup);
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter((c) => c.name.toLowerCase().includes(q));
    }
    return result;
  }, [channels, selectedGroup, search]);

  const visibleChannels = filteredChannels.slice(0, visibleCount);
  const hasMore = visibleCount < filteredChannels.length;

  return (
    <div className="space-y-6">
      {/* 搜索与分类导航 */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* 搜索框 */}
        <div className="relative flex-1 max-w-md">
          <Icons.Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="搜索全国电视频道、卫视、国际台..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-(--accent-color) transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
            >
              <Icons.X size={14} />
            </button>
          )}
        </div>

        <div className="text-xs text-white/40 font-medium px-1">
          共 <strong className="text-white/80">{filteredChannels.length}</strong> 个可用频道
        </div>
      </div>

      {/* 分类药丸切换栏 */}
      {groups.length > 0 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setSelectedGroup(null)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedGroup === null
                ? 'bg-(--accent-color) text-white shadow-lg shadow-(--accent-color)/30 scale-102'
                : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10'
            }`}
          >
            全部频道 ({channels.length})
          </button>
          {groups.map((group) => {
            const count = channels.filter((c) => c.group === group).length;
            const isActive = selectedGroup === group;
            return (
              <button
                key={group}
                onClick={() => setSelectedGroup(group)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-(--accent-color) text-white shadow-lg shadow-(--accent-color)/30 scale-102'
                    : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10'
                }`}
              >
                {group} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* 频道网格 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {visibleChannels.map((channel, idx) => {
          const isActive = activeChannel?.url === channel.url;
          return (
            <button
              key={`${channel.name}-${idx}`}
              onClick={() => onSelect(channel)}
              className={`
                group p-3.5 rounded-2xl text-left transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden active:scale-95
                ${
                  isActive
                    ? 'bg-(--accent-color) text-white shadow-xl shadow-(--accent-color)/40 ring-2 ring-white/40 scale-102'
                    : 'bg-white/5 hover:bg-white/10 text-white/90 border border-white/10 hover:border-white/20'
                }
              `}
            >
              {/* 台标与 LIVE 状态 */}
              <div className="flex items-center justify-between gap-2 mb-2 w-full">
                {channel.logo ? (
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-black/40 flex items-center justify-center p-0.5 border border-white/10">
                    <img
                      src={channel.logo}
                      alt={channel.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-xs font-bold text-white/70">
                    {channel.name.slice(0, 2)}
                  </div>
                )}

                {/* 🔴 LIVE 状态呼吸灯 */}
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-live-pulse" />
                  <span className="text-[9px] font-black tracking-wider text-red-400">LIVE</span>
                </div>
              </div>

              {/* 频道名称 */}
              <div className="w-full">
                <p className="text-xs sm:text-sm font-bold truncate group-hover:text-white transition-colors">
                  {channel.name}
                </p>
                {channel.group && (
                  <p className="text-[10px] text-white/40 truncate mt-0.5 font-medium">
                    {channel.group}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* 加载更多 */}
      {hasMore && (
        <div className="text-center pt-4">
          <button
            onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
            className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full text-xs font-bold transition-all cursor-pointer shadow-md"
          >
            加载更多频道 ({filteredChannels.length - visibleCount} 个剩余)
          </button>
        </div>
      )}
    </div>
  );
}
