'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clapperboard } from 'lucide-react';
import { getOptimizedImageUrl } from '@/lib/utils/image-utils';

interface CastRailProps {
  directors: string[];
  actors: string[];
  initialAvatars?: Record<string, string>;
}

export function CastRail({ directors, actors, initialAvatars = {} }: CastRailProps) {
  const [avatars, setAvatars] = useState<Record<string, string>>(initialAvatars);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // 找出当前尚未获取到头像的演职员
    const allNames = [...directors, ...actors];
    const missing = allNames.filter(name => !avatars[name] && !initialAvatars[name]);

    if (missing.length === 0) return;

    let isMounted = true;

    // 客户端后台异步向 /api/person-avatars 请求缺失头像，不阻塞主渲染
    const fetchMissingAvatars = async () => {
      try {
        const res = await fetch(`/api/person-avatars?names=${encodeURIComponent(missing.join(','))}`);
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && data?.avatars && Object.keys(data.avatars).length > 0) {
          setAvatars(prev => ({
            ...prev,
            ...data.avatars,
          }));
        }
      } catch {
        // 静默失败，保持兜底字圆圈
      }
    };

    fetchMissingAvatars();

    return () => {
      isMounted = false;
    };
  }, [directors, actors]);

  if (directors.length === 0 && actors.length === 0) {
    return null;
  }

  const handleImageError = (name: string) => {
    setFailedImages(prev => ({ ...prev, [name]: true }));
  };

  return (
    <section className="mb-14">
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-5 flex items-center gap-2">
        <Clapperboard className="w-5 h-5 text-red-500" />
        <span>演职员专栏</span>
      </h2>

      <div className="flex items-center gap-3.5 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {/* 导演卡片 */}
        {directors.map(d => {
          const avatarUrl = avatars[d] || initialAvatars[d];
          const hasValidAvatar = Boolean(avatarUrl) && !failedImages[d];

          return (
            <Link
              key={d}
              href={`/director/${encodeURIComponent(d)}`}
              prefetch={false}
              className="group shrink-0 flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-red-500/40 transition-all duration-200 hover:-translate-y-0.5 shadow-sm hover:shadow-lg hover:shadow-red-950/30"
            >
              {hasValidAvatar ? (
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-red-500/40 group-hover:border-red-500 shrink-0 shadow-md group-hover:scale-105 transition-all">
                  <Image
                    src={getOptimizedImageUrl(avatarUrl, { variant: 'avatar' })}
                    alt={d}
                    fill
                    sizes="48px"
                    className="object-cover transition-opacity duration-300"
                    onError={() => handleImageError(d)}
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-red-600/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform font-bold text-sm">
                  {d.slice(0, 1)}
                </div>
              )}
              <div>
                <div className="font-bold text-sm text-white group-hover:text-red-400 transition-colors">
                  {d}
                </div>
                <div className="text-[11px] text-white/40 mt-0.5">导演</div>
              </div>
            </Link>
          );
        })}

        {/* 演员卡片 */}
        {actors.map(a => {
          const avatarUrl = avatars[a] || initialAvatars[a];
          const hasValidAvatar = Boolean(avatarUrl) && !failedImages[a];

          return (
            <Link
              key={a}
              href={`/actor/${encodeURIComponent(a)}`}
              prefetch={false}
              className="group shrink-0 flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500/40 transition-all duration-200 hover:-translate-y-0.5 shadow-sm hover:shadow-lg hover:shadow-amber-950/30"
            >
              {hasValidAvatar ? (
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-amber-500/40 group-hover:border-amber-500 shrink-0 shadow-md group-hover:scale-105 transition-all">
                  <Image
                    src={getOptimizedImageUrl(avatarUrl, { variant: 'avatar' })}
                    alt={a}
                    fill
                    sizes="48px"
                    className="object-cover transition-opacity duration-300"
                    onError={() => handleImageError(a)}
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-amber-600/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform font-bold text-sm">
                  {a.slice(0, 1)}
                </div>
              )}
              <div>
                <div className="font-bold text-sm text-white group-hover:text-amber-400 transition-colors">
                  {a}
                </div>
                <div className="text-[11px] text-white/40 mt-0.5">实力主演</div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
