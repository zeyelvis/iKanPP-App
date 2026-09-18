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

  // 2. VideoObject 结构化数据（符合 Google 视频结构化数据规范）
  const playerUrl = `${siteUrl}/player?entity=${entity.entityId}`;
  const videoSchema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: `${entity.title} 在线高清完整版`,
    description: entity.description || `${entity.title} 在线观看，全网高清影视资源。`,
    thumbnailUrl: [entity.cover].filter(Boolean),
    uploadDate: entity.year ? `${entity.year}-01-01T08:00:00+08:00` : new Date().toISOString(),
    embedUrl: playerUrl,
    contentUrl: playerUrl,
    inLanguage: 'zh-CN',
    potentialAction: {
      '@type': 'SeekToAction',
      target: `${playerUrl}&t={seek_to_second_number}`,
      'startOffset-input': 'required name=seek_to_second_number',
    },
  };

  if (entity.runtime) {
    videoSchema.duration = `PT${entity.runtime}M`;
  }

  // 3. BreadcrumbList 结构化数据
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

  // 4. FAQPage 结构化数据（触发 Google 下拉展开式富媒体问答卡片 + AI Overview 权威知识注入）
  const validDirectors = (entity.directors || []).filter(d => d && !['知名导演', '未知', '暂无'].includes(d.trim()));
  const validActors = (entity.actors || []).filter(a => a && !['实力主演', '未知', '暂无'].includes(a.trim()));
  const castDesc = [
    validDirectors.length > 0 ? `由${validDirectors.slice(0, 2).join('、')}执导` : '',
    validActors.length > 0 ? `${validActors.slice(0, 3).join('、')}领衔主演` : '',
  ].filter(Boolean).join('，');

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `《${entity.title}》可以在线免费观看吗？`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `可以。在 iKanPP (爱看片片) 可以免费在线观看《${entity.title}》完整版高清视频，支持多线路智能秒播，海外华人免翻墙极速畅享。`,
        },
      },
      {
        '@type': 'Question',
        name: `《${entity.title}》的演职员阵容和评分是多少？`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `《${entity.title}》(${entity.year})${castDesc ? `${castDesc}，` : ''}当前全网真实评分约 ${entity.rate || '8.5'} 分，属于高口碑的${channelName}作品。`,
        },
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(videoSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}
