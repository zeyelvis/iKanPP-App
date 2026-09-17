import { TitleEntity } from '@/lib/types/entity';

interface TitleJsonLdProps {
  entity: TitleEntity;
  siteUrl?: string;
}

export function TitleJsonLd({ entity, siteUrl = 'https://www.ikanpp.com' }: TitleJsonLdProps) {
  const currentUrl = `${siteUrl}/title/${entity.entityId}-${entity.slug}`;

  // 多分类频道映射（与详情页面包屑保持一致）
  const genreStr = (entity.genres || []).join(',');
  const animeKws = ['动漫', '动画', '国漫', '国创', '日漫', '新番', '番剧', '修仙', 'Animation'];
  const isAnime = entity.type === 'anime' || animeKws.some(kw => genreStr.includes(kw));
  const isDocumentary = genreStr.includes('纪录');
  const isVariety = genreStr.includes('综艺') || genreStr.includes('真人秀');

  const channelPath = isAnime ? '/anime' : isDocumentary ? '/documentary' : isVariety ? '/variety' : entity.type === 'tv' ? '/tv' : '/movie';
  const channelName = isAnime ? '动漫' : isDocumentary ? '纪录片' : isVariety ? '综艺' : entity.type === 'tv' ? '电视剧' : '电影';

  // 1. Movie / TVSeries 结构化数据
  const isTv = entity.type === 'tv' || entity.type === 'anime';
  const mediaSchema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': isTv ? 'TVSeries' : 'Movie',
    name: entity.title,
    alternateName: entity.originalTitle || undefined,
    url: currentUrl,
    image: entity.cover,
    description: entity.description,
    dateCreated: entity.year,
    genre: entity.genres,
    director: entity.directors?.map(d => ({
      '@type': 'Person',
      name: d,
    })),
    actor: entity.actors?.map(a => ({
      '@type': 'Person',
      name: a,
    })),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: entity.rate || '9.0',
      bestRating: '10',
      worstRating: '1',
      ratingCount: 1520,
    },
    countryOfOrigin: entity.region ? {
      '@type': 'Country',
      name: entity.region,
    } : undefined,
    duration: entity.runtime ? `PT${entity.runtime}M` : undefined,
    potentialAction: {
      '@type': 'WatchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/player?entity=${entity.entityId}`,
        actionPlatform: [
          'http://schema.org/DesktopWebPlatform',
          'http://schema.org/MobileWebPlatform',
        ],
      },
    },
  };

  if (isTv && entity.numberOfEpisodes) {
    mediaSchema.numberOfEpisodes = entity.numberOfEpisodes;
  }
  if (isTv && entity.numberOfSeasons) {
    mediaSchema.numberOfSeasons = entity.numberOfSeasons;
  }

  // 2. BreadcrumbList 结构化数据
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: '首页',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: channelName,
        item: `${siteUrl}${channelPath}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: entity.title,
        item: currentUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(mediaSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}
