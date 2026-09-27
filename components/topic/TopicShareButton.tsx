'use client';

import React, { useState } from 'react';
import { Share2 } from 'lucide-react';
import { AiViralShareModal } from '@/components/share/AiViralShareModal';

interface TopicShareButtonProps {
  title: string;
  poster?: string;
  curatorNote?: string;
  slug: string;
}

export function TopicShareButton({ title, poster, curatorNote, slug }: TopicShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 hover:text-white text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-lg active:scale-95 shrink-0"
        title="生成电影明信片与安利文案"
      >
        <Share2 className="w-4 h-4 text-red-400" />
        <span>✨ 分享此片单</span>
      </button>

      <AiViralShareModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={title}
        poster={poster}
        overview={curatorNote}
        slug={slug}
      />
    </>
  );
}
