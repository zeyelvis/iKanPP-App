import { Metadata } from 'next';
import { isEntityIndexable } from '@/lib/data/seo-rules/seo-keyword-system';
import { parseEntitySlug } from '@/lib/data/entities/entity-utils';
import { parseSeasonFromTitle } from '@/lib/utils/season-resolver';
import { isFakeBackdrop } from '@/lib/services/entity-enrichment';
import { generateFullSpectrumKeywords, isFillerDescription } from '@/lib/utils/seo-keyword-generator';
import {
  getCachedEntity,
  getEntityCanonicalSlug,
  resolveEntityChannel,
  healBackdropInBackground,
} from './resolve-entity';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ikanpp.com';

/**
 * 动态 SEO Metadata 生成（含 Google Discover 大图与 AI 摘要授权）
 */
export async function generateTitleMetadata(slug: string): Promise<Metadata> {
  const entity = await getCachedEntity(slug);

  if (!entity || !isEntityIndexable(entity)) {
    return {
      title: '影片未收录 - iKanPP 爱看片片',
      robots: { index: false, follow: false },
    };
  }

  let decodedSlug = slug.trim();
  try {
    decodedSlug = decodeURIComponent(decodedSlug).trim();
  } catch {}
  const { entityId: rawEntityId, slug: innerSlug } = parseEntitySlug(decodedSlug);
  const rawCleanTitle = innerSlug || (rawEntityId ? '' : decodedSlug);
  const seasonInfo = parseSeasonFromTitle(rawCleanTitle);
  const seasonTag = seasonInfo ? (seasonInfo.rawSeasonMatch || `第${seasonInfo.seasonNumber}季`) : '';

  // 权威规范 Slug 计算（用于规范 Canonical URL 声明）
  const canonicalSlug = getEntityCanonicalSlug(entity);

  // 多分类与真实标题定义
  const displayTitle = seasonTag && !entity.title.includes(seasonTag) ? `${entity.title} ${seasonTag}` : entity.title;
  const yearSuffix = entity.year ? ` (${entity.year})` : '';
  const pageTitle = `${displayTitle}${yearSuffix} 在线观看 - ${resolveEntityChannel(entity).name} | iKanPP 爱看片片`;

  const canonicalUrl = `${BASE_URL}/title/${encodeURIComponent(canonicalSlug)}`;
  const resolvedBackdrop = entity.backdrop;
  if (isFakeBackdrop(entity.backdrop, entity.cover)) {
    healBackdropInBackground(entity);
  }
  const ogImage = resolvedBackdrop || entity.cover;

  const synopsis = [entity.description, entity.aiContent?.uniqueSynopsis].find((t) => !isFillerDescription(t)) || '';

  // 自动化构建全光谱长尾关键词与意图捕获矩阵
  const seoSpectrum = generateFullSpectrumKeywords({
    title: displayTitle,
    year: entity.year,
    type: entity.type,
    genres: entity.genres,
    directors: entity.directors,
    actors: entity.actors,
    region: entity.region,
    numberOfEpisodes: entity.numberOfEpisodes,
    description: synopsis,
  });

  const hook = synopsis ? entity.aiContent?.hook?.trim() || '' : '';
  const hookPrefix = hook ? `${hook}${/[。！？!?…]$/.test(hook) ? '' : '。'}` : '';
  const metaDescription = `${hookPrefix}${seoSpectrum.metaDescription}`;

  return {
    title: pageTitle,
    description: metaDescription,
    keywords: seoSpectrum.keywords.slice(0, 5),
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title: pageTitle,
      description: metaDescription,
      url: canonicalUrl,
      type: 'video.movie',
      siteName: 'iKanPP 爱看片片',
      locale: 'zh_CN',
      images: [
        {
          url: ogImage,
          width: 1280,
          height: 720,
          alt: `${entity.title} 官方剧照海报`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: metaDescription,
      images: [ogImage],
    },
  };
}
