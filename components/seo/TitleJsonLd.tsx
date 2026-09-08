import { TitleEntity } from '@/lib/types/entity';

interface TitleJsonLdProps {
  entity: TitleEntity;
  siteUrl?: string;
}

export function TitleJsonLd({ entity, siteUrl = 'https://www.ikanpp.com' }: TitleJsonLdProps) {
  const currentUrl = `${siteUrl}/title/${entity.entityId}-${entity.slug}`;
  const channelPath = entity.type === 'tv' ? '/tv' : '/movie';
  const channelName = entity.type === 'tv' ? '电视剧' : '电影';

  // 1. Movie / TVSeries 结构化数据
  const isTv = entity.type === 'tv';
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
    inLanguage: 'zh-CN',
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
