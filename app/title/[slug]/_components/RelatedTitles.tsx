import Link from 'next/link';
import Image from 'next/image';
import { Film, Star, Play } from 'lucide-react';
import { TitleEntity } from '@/lib/types/entity';
import { getTitleCanonicalHref } from '@/lib/data/entities/entity-utils';
import { getOptimizedImageUrl } from '@/lib/utils/image-utils';

interface RelatedTitlesProps {
  relatedTitles: TitleEntity[];
  primaryGenre: string;
  isChinaMainland: boolean;
}

export function RelatedTitles({
  relatedTitles,
  primaryGenre,
  isChinaMainland,
}: RelatedTitlesProps) {
  if (!relatedTitles || relatedTitles.length === 0) return null;

  return (
    <section className="mt-8 below-fold-section">
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <span>🍿</span>
        <span>更多{primaryGenre}精选推荐</span>
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
        {relatedTitles.slice(0, 12).map((rel) => (
          <Link
            key={rel.entityId}
            href={getTitleCanonicalHref(rel)}
            className="group block rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black"
            style={{ contentVisibility: 'auto', containIntrinsicSize: '160px 240px' }}
          >
            <div className="relative aspect-2/3 w-full bg-black/40 overflow-hidden">
              {rel.cover ? (
                <Image
                  src={getOptimizedImageUrl(rel.cover, { variant: 'poster', isChinaMainland })}
                  alt={rel.title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/20">
                  <Film className="w-8 h-8" />
                </div>
              )}

              {/* 评分 */}
              {rel.rate && (
                <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/75 text-amber-400 text-xs font-bold flex items-center gap-0.5 backdrop-blur-sm">
                  <Star className="w-3 h-3 fill-amber-400" />
                  {rel.rate}
                </div>
              )}

              {/* Netflix 风格悬停播放图标 */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                  <Play className="w-5 h-5 fill-white ml-0.5" />
                </div>
              </div>
            </div>

            <div className="p-2.5">
              <h3 className="font-semibold text-sm text-white/90 truncate group-hover:text-red-400 transition-colors">
                {rel.title}
              </h3>
              <p className="text-xs text-white/40 mt-0.5">
                {[rel.year, rel.genres?.[0]].filter(Boolean).join(' · ') || '影视'}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
