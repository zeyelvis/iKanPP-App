'use client';

import React, { useEffect, useState } from 'react';
import { usePersonalizedRecommendations } from './hooks/usePersonalizedRecommendations';
import { ContentRail, type RailMovie } from './ContentRail';

interface PersonalizedForYouRailProps {
  onMovieClick: (movie: any) => void;
  contentType: 'movie' | 'tv';
  excludeTitles?: Set<string>;
}

export function PersonalizedForYouRail({ onMovieClick, contentType, excludeTitles }: PersonalizedForYouRailProps) {
  const { movies: personalizedMovies, loading: personalizedLoading } = usePersonalizedRecommendations(false);
  const [fallbackMovies, setFallbackMovies] = useState<RailMovie[]>([]);
  const [loadingFallback, setLoadingFallback] = useState(false);

  // 若没有足够观看历史生成个性化推荐，则自动抓取全网口碑黑马与高分小众佳作作为推荐
  useEffect(() => {
    if (personalizedMovies.length === 0 && !personalizedLoading) {
      let isMounted = true;
      setLoadingFallback(true);
      const fallbackTag = contentType === 'movie' ? '冷门佳片' : '悬疑';
      fetch(`/api/douban/recommend?tag=${encodeURIComponent(fallbackTag)}&type=${contentType}&page_limit=14&page_start=0`)
        .then((r) => r.json())
        .then((data) => {
          if (isMounted && data.subjects?.length) {
            setFallbackMovies(data.subjects);
          }
        })
        .catch(() => {})
        .finally(() => {
          if (isMounted) setLoadingFallback(false);
        });

      return () => {
        isMounted = false;
      };
    }
  }, [personalizedMovies.length, personalizedLoading, contentType]);

  const rawDisplayMovies: RailMovie[] = personalizedMovies.length > 0
    ? personalizedMovies.map(m => ({
        id: m.id,
        title: m.title,
        cover: m.cover,
        rate: m.rate,
        url: m.url,
      }))
    : fallbackMovies;

  // 严格过滤掉已在页面上游展示过的影视作品
  const displayMovies = excludeTitles && excludeTitles.size > 0
    ? rawDisplayMovies.filter(m => m && m.title && !excludeTitles.has(m.title))
    : rawDisplayMovies;

  const isLoading = personalizedLoading || (personalizedMovies.length === 0 && loadingFallback);

  if (!isLoading && displayMovies.length === 0) return null;

  return (
    <ContentRail
      title="猜你喜欢 · 个性化精选"
      icon="🎯"
      badge={personalizedMovies.length > 0 ? "FOR YOU" : "TAILORED"}
      movies={displayMovies}
      loading={isLoading}
      onMovieClick={onMovieClick}
    />
  );
}
