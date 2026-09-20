import { TitleEntity } from '@/lib/types/entity';
import { generateSlug } from '@/lib/data/entities/entity-utils';

interface TitleJsonLdProps {
  entity: TitleEntity;
  siteUrl?: string;
}

export function TitleJsonLd({ entity, siteUrl = 'https://www.ikanpp.com' }: TitleJsonLdProps) {
  const slugPart = entity.canonicalSlug || `${entity.entityId}-${generateSlug(entity.slug || entity.title)}`;
  const currentUrl = `${siteUrl}/title/${slugPart}`;

  // 多分类频道映射（与详情页面包屑保持一致）
  const genreStr = (entity.genres || []).join(',');
  const animeKws = ['动漫', '动画', '国漫', '国创', '日漫', '新番', '番剧', '修仙', 'Animation'];
  const isAnime = entity.type === 'anime' || animeKws.some(kw => genreStr.includes(kw));
  const isDocumentary = genreStr.includes('纪录');
  const isVariety = genreStr.includes('综艺') || genreStr.includes('真人秀');

  const channelPath = isAnime ? '/anime' : isDocumentary ? '/documentary' : isVariety ? '/variety' : entity.type === 'tv' ? '/tv' : '/movie';
  const channelName = isAnime ? '动漫' : isDocumentary ? '纪录片' : isVariety ? '综艺' : entity.type === 'tv' ? '电视剧' : '电影';

  const isTv = entity.type === 'tv' || entity.type === 'anime';
  const sameAsUrls: string[] = [];
  if (entity.tmdbId && /^\d+$/.test(entity.tmdbId)) {
    sameAsUrls.push(`https://www.themoviedb.org/${isTv ? 'tv' : 'movie'}/${entity.tmdbId}`);
  }

  // 过滤不可信的默认占位词
  const validDirectors = (entity.directors || []).filter(d => d && !['知名导演', '未知', '暂无'].includes(d.trim()));
  const validActors = (entity.actors || []).filter(a => a && !['实力主演', '未知', '暂无'].includes(a.trim()));

  // 1. 作品节点 (Movie / TVSeries)
  const workNode: Record<string, any> = {
    '@id': `${currentUrl}#work`,
    '@type': isTv ? 'TVSeries' : 'Movie',
    name: entity.title,
    alternateName: entity.originalTitle || undefined,
    url: currentUrl,
    image: entity.cover,
    description: entity.description,
    datePublished: entity.year ? String(entity.year) : undefined,
    genre: entity.genres && entity.genres.length > 0 ? entity.genres : undefined,
    inLanguage: 'zh-CN',
    sameAs: sameAsUrls.length > 0 ? sameAsUrls : undefined,
    director: validDirectors.map(d => ({
      '@type': 'Person',
      name: d,
    })),
    actor: validActors.map(a => ({
      '@type': 'Person',
      name: a,
    })),
    countryOfOrigin: entity.region ? {
      '@type': 'Country',
      name: entity.region,
    } : undefined,
    duration: entity.runtime ? `PT${entity.runtime}M` : undefined,
  };

  if (isTv && entity.numberOfEpisodes) {
    workNode.numberOfEpisodes = entity.numberOfEpisodes;
  }
  if (isTv && entity.numberOfSeasons) {
    workNode.numberOfSeasons = entity.numberOfSeasons;
  }

  // 2. 面包屑节点 (BreadcrumbList)
  const breadcrumbNode = {
    '@id': `${currentUrl}#breadcrumb`,
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

  // 3. 规范单一 @graph 结构，消除虚假评分人数、伪造 VideoObject 及机械 FAQ
  const graphSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@id': `${siteUrl}/#website`,
        '@type': 'WebSite',
        name: 'iKanPP 爱看片片',
        url: siteUrl,
      },
      workNode,
      breadcrumbNode,
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graphSchema) }}
    />
  );
}
