'use client';

import { useState } from 'react';
import { Icons } from '@/components/ui/Icon';
import { getSourceName } from '@/lib/utils/source-names';

function splitPersonNames(str: string): string[] {
  return str.split(/[,，/]/).map(s => s.trim()).filter(Boolean);
}

interface VideoMetadataProps {
  videoData: any;
  source: string | null;
  title?: string | null;
}

export function VideoMetadata({ videoData, source, title }: VideoMetadataProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const cleanContent = videoData?.vod_content?.replace(/<[^>]*>/g, '') || '';
  const actors = videoData?.vod_actor ? splitPersonNames(videoData.vod_actor) : [];
  const directors = videoData?.vod_director ? splitPersonNames(videoData.vod_director) : [];

  return (
    <div className="bg-[#0A0A0F]/80 backdrop-blur-2xl rounded-3xl border border-white/10 p-6 shadow-2xl space-y-5">
      {/* 标题与主要徽章 */}
      <div>
        <div className="flex items-center gap-2 flex-wrap mb-2">
          {source && (
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-[var(--accent-color)] text-white shadow-md flex items-center gap-1">
              <Icons.Check size={12} />
              {getSourceName(source)}
            </span>
          )}
          {videoData?.type_name && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-white/80 border border-white/10">
              {videoData.type_name}
            </span>
          )}
          {videoData?.vod_year && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/5 text-white/60">
              {videoData.vod_year}
            </span>
          )}
          {videoData?.vod_area && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/5 text-white/60">
              {videoData.vod_area}
            </span>
          )}
          {videoData?.vod_lang && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/5 text-white/60">
              {videoData.vod_lang}
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          {videoData?.vod_name || title}
        </h1>
      </div>

      {/* 剧情简介 */}
      {cleanContent && (
        <div className="space-y-1.5">
          <h4 className="text-xs font-bold text-white/40 tracking-wider uppercase">剧情简介</h4>
          <p className={`text-sm text-white/70 leading-relaxed ${isExpanded ? '' : 'line-clamp-3'}`}>
            {cleanContent}
          </p>
          {cleanContent.length > 120 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs font-bold text-[var(--accent-color)] hover:underline cursor-pointer pt-0.5"
            >
              {isExpanded ? '收起简介 ▲' : '展开全文 ▼'}
            </button>
          )}
        </div>
      )}

      {/* 演职员表 */}
      {(directors.length > 0 || actors.length > 0) && (
        <div className="pt-4 border-t border-white/10 space-y-2.5 text-xs text-white/60">
          {directors.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-white/40 shrink-0">导演：</span>
              {directors.map(name => (
                <a
                  key={name}
                  href={`https://movie.douban.com/celebrities/search?search_text=${encodeURIComponent(name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-white/15 transition-all inline-flex items-center gap-1"
                >
                  {name}
                  <Icons.ExternalLink size={10} className="opacity-40" />
                </a>
              ))}
            </div>
          )}

          {actors.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-white/40 shrink-0">主演：</span>
              {actors.slice(0, 8).map(name => (
                <a
                  key={name}
                  href={`https://movie.douban.com/celebrities/search?search_text=${encodeURIComponent(name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-white/15 transition-all inline-flex items-center gap-1"
                >
                  {name}
                  <Icons.ExternalLink size={10} className="opacity-40" />
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
