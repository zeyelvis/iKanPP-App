'use client';

import { useState, useMemo } from 'react';
import { Search, X, Tv } from 'lucide-react';
import { LIVE_CATEGORIES, type LiveChannel, type LiveCategory } from '@/lib/data/live-channels';

interface IPTVChannelGridProps {
  channels: LiveChannel[];
  activeChannel?: LiveChannel | null;
  onSelect: (channel: LiveChannel) => void;
}

export function IPTVChannelGrid({
  channels,
  activeChannel,
  onSelect,
}: IPTVChannelGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<LiveCategory>('全部频道');
  const [search, setSearch] = useState('');

  const filteredChannels = useMemo(() => {
    let result = channels;
    if (selectedCategory !== '全部频道') {
      result = result.filter((c) => c.category === selectedCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return result;
  }, [channels, selectedCategory, search]);

  return (
    <div className="space-y-6">
      {/* 搜索与分类导航 */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* 分类 Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {LIVE_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                    : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* 频道搜索框 */}
        <div className="relative w-full md:w-72">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40"
          />
          <input
            type="text"
            placeholder="搜索频道名称或拼音 (如 cctv5, 湖南)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-white/5 border border-white/10 rounded-full text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-red-500 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white cursor-pointer"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* 频道网格卡片 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {filteredChannels.map((channel) => {
          const isActive = activeChannel?.id === channel.id;
          return (
            <button
              key={channel.id}
              onClick={() => onSelect(channel)}
              className={`group relative p-4 rounded-2xl border text-left transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[96px] ${
                isActive
                  ? 'bg-red-600/15 border-red-500 shadow-xl shadow-red-500/10 scale-[1.02]'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20'
              }`}
            >
              {/* 顶部标识 */}
              <div className="flex items-center justify-between w-full mb-2">
                <span className="text-[10px] text-white/40 font-mono tracking-wider">
                  {channel.category}
                </span>
                {channel.badge && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      channel.badge.includes('热门')
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-white/10 text-white/70'
                    }`}
                  >
                    {channel.badge}
                  </span>
                )}
              </div>

              {/* 频道名称 */}
              <div className="flex items-center justify-between gap-2">
                <h4
                  className={`text-sm font-bold truncate transition-colors ${
                    isActive ? 'text-red-400' : 'text-white group-hover:text-red-300'
                  }`}
                >
                  {channel.name}
                </h4>
                {isActive && (
                  <span className="flex items-center gap-1 text-[10px] text-red-400 font-bold shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                    播放中
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {filteredChannels.length === 0 && (
        <div className="py-16 text-center">
          <Tv size={40} className="mx-auto mb-3 text-white/20" />
          <p className="text-sm font-bold text-white/60">未找到匹配的电视频道</p>
          <p className="text-xs text-white/30 mt-1">请尝试更换分类或关键词搜索</p>
        </div>
      )}
    </div>
  );
}
