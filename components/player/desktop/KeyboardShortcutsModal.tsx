'use client';

import React, { useEffect } from 'react';
import { X, Keyboard } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
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

  if (!isOpen) return null;

  const shortcuts = [
    { key: '空格 / K', action: '播放 / 暂停' },
    { key: '← / →', action: '后退 / 前进 10 秒' },
    { key: '↑ / ↓', action: '调高 / 调低 音量' },
    { key: 'M', action: '静音 / 取消静音' },
    { key: 'F', action: '设备原生全屏' },
    { key: 'W', action: '网页窗口全屏' },
    { key: 'N', action: '播放下一集' },
    { key: '0 - 9', action: '快进到视频百分比 (0% - 90%)' },
    { key: 'Esc', action: '退出全屏 / 关闭浮层' },
  ];

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/75 p-4 animate-fade-in"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-[#141416]/98 border border-white/20 p-6 shadow-2xl text-white pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Keyboard size={20} className="text-red-500" />
            <h3 className="text-base font-bold">键盘快捷键指南</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 py-4 text-xs">
          {shortcuts.map(({ key, action }) => (
            <div key={key} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
              <span className="text-white/60">{action}</span>
              <kbd className="px-2 py-0.5 rounded bg-white/15 text-white font-mono font-bold shadow-xs">
                {key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="text-center pt-2 text-xs text-white/40">
          随时按下键盘即可触发对应快捷操作
        </div>
      </div>
    </div>
  );
}
