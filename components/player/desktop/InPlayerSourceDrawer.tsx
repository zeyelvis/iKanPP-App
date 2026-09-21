'use client';

import React, { useEffect } from 'react';
import { X, Check, Zap, Server, ShieldCheck } from 'lucide-react';

export interface SourceItem {
  id: string | number;
  source: string;
  sourceName?: string;
  latency?: number;
  pic?: string;
  typeName?: string;
}

interface InPlayerSourceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sources: SourceItem[];
  currentSource: string;
  onSelectSource: (source: SourceItem) => void;
}

export function InPlayerSourceDrawer({
  isOpen,
  onClose,
  sources,
  currentSource,
  onSelectSource,
}: InPlayerSourceDrawerProps) {
  // ESC 键关闭
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, onClose]);

  if (!isOpen || !sources || sources.length === 0) return null;

  return (
    <div
      data-player-layer="true"
      className="absolute inset-0 z-50 flex justify-end bg-black/60 transition-opacity duration-300 animate-fade-in"
      onPointerDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div
        className="w-72 sm:w-80 h-full bg-[#141416]/98 border-l border-white/10 shadow-2xl flex flex-col pointer-events-auto text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部标题栏 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <Server size={18} className="text-purple-400" />
            <h3 className="text-base font-bold tracking-wide">切换专线</h3>
            <span className="text-xs text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full font-mono">
              {sources.length} 条可用
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-colors cursor-pointer"
            title="关闭 (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* 线路列表 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {sources.map((s, idx) => {
            const isCurrent = s.source === currentSource;
            const displayName = s.sourceName || `专线 ${idx + 1}`;
            const is4K = displayName.includes('4K') || s.source.includes('4k') || s.source === 'hongniu';
            const isUltra = displayName.includes('极速') || displayName.includes('蓝光') || s.source === 'guangsu';

            return (
              <button
                key={s.source || idx}
                type="button"
                onClick={() => {
                  onSelectSource(s);
                  onClose();
                }}
                className={`w-full p-3.5 rounded-xl text-left transition-all duration-200 cursor-pointer flex items-center justify-between border ${
                  isCurrent
                    ? 'bg-purple-600/20 border-purple-500/60 shadow-lg shadow-purple-600/20 text-white'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isCurrent
                        ? 'bg-purple-600 text-white'
                        : 'bg-white/10 text-white/60'
                    }`}
                  >
                    {isCurrent ? <Zap size={16} /> : <Server size={16} />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{displayName}</span>
                      {is4K && (
                        <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          4K 原画
                        </span>
                      )}
                      {isUltra && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          秒播
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-xs text-white/40">
                      <span className="flex items-center gap-1">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isCurrent ? 'bg-emerald-400 animate-pulse' : 'bg-emerald-500/60'
                          }`}
                        />
                        {s.latency ? `${s.latency}ms` : '极速直连'}
                      </span>
                      <span>·</span>
                      <span>100% 浏览器直连</span>
                    </div>
                  </div>
                </div>

                {isCurrent && (
                  <Check size={18} className="text-purple-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* 底部架构说明 */}
        <div className="px-5 py-3 border-t border-white/10 bg-black/60 shrink-0 text-xs text-white/50 flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
          <span>全网 CDN 智能容灾，如遇卡顿随时切换</span>
        </div>
      </div>
    </div>
  );
}
