'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useHistoryStore } from '@/lib/store/history-store';
import { ShortDramaItem } from '@/lib/api/short-drama-sources';

export interface RecommendedShortDrama {
  id: string;
  title: string;
  poster: string;
  category: string;
  categoryName?: string;
  remarks?: string;
  totalEpisodes?: number;
  firstPlayUrl?: string;
  playUrl?: string;
  reason: string;
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  shuangju: ['爽剧', '战神', '逆袭', '打脸', '至尊', '冥王', '首富', '神医', '弃少'],
  yanqing: ['总裁', '甜宠', '闪婚', '夫人', '豪门', '专宠', '契约', '诱温', '绯尘', '爱'],
  dushi: ['都市', '神豪', '职场', '乡邻', '邻里', '护家', '老板'],
  guzhuang: ['古装', '仙侠', '侯府', '权谋', '宫廷', '明月', '侯门', '天下', '师尊'],
  chuanyue: ['穿越', '年代', '穿书', '70', '80', '回城', '做主'],
  chongsheng: ['重生', '民国', '改命', '再世', '新人生'],
  naodong: ['脑洞', '悬疑', '反转', '惊悚', '谜案', '黑莲花'],
};

const CATEGORY_NAMES: Record<string, string> = {
  shuangju: '反转爽剧',
  yanqing: '甜宠霸总',
  dushi: '现代都市',
  guzhuang: '古风仙侠',
  chuanyue: '穿越年代',
  chongsheng: '重生改命',
  naodong: '脑洞悬疑',
};

export function useShortDramaRecommendations() {
  const { viewingHistory } = useHistoryStore();
  const [movies, setMovies] = useState<RecommendedShortDrama[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasHistory, setHasHistory] = useState(false);
  const isFetchedRef = useRef(false);

  const analyzePreferences = useCallback(() => {
    // 筛选出短剧观看记录
    const shortRecords = viewingHistory.filter(
      (item) =>
        item.type_name?.includes('短剧') ||
        String(item.videoId || '').startsWith('short-') ||
        item.title.includes('短剧')
    );

    if (shortRecords.length === 0) {
      return { topCategories: ['shuangju', 'yanqing'], isColdStart: true };
    }

    const scores: Record<string, number> = {};

    shortRecords.forEach((rec) => {
      const text = `${rec.title} ${rec.type_name || ''}`;
      for (const [catKey, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        keywords.forEach((kw) => {
          if (text.includes(kw)) {
            scores[catKey] = (scores[catKey] || 0) + 1;
          }
        });
      }
    });

    const sorted = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .map(([key]) => key);

    const top = sorted.length > 0 ? sorted.slice(0, 3) : ['shuangju', 'dushi'];
    return { topCategories: top, isColdStart: false };
  }, [viewingHistory]);

  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    try {
      const { topCategories, isColdStart } = analyzePreferences();
      setHasHistory(!isColdStart);

      // 已观看过的标题集合
      const watchedTitles = new Set(
        viewingHistory.map((item) => item.title.trim().toLowerCase())
      );

      // 并行拉取偏好分类短剧
      const fetchPromises = topCategories.map(async (catKey) => {
        try {
          const res = await fetch(`/api/short-dramas/browse?category=${catKey}&limit=12`);
          if (!res.ok) return [];
          const data = await res.json();
          const list: ShortDramaItem[] = data.list || [];
          return list.map((item) => ({
            id: String(item.id),
            title: item.title,
            poster: item.poster,
            category: catKey,
            categoryName: item.categoryName || CATEGORY_NAMES[catKey] || '短剧',
            remarks: item.remarks || (item.totalEpisodes ? `全${item.totalEpisodes}集` : ''),
            totalEpisodes: item.totalEpisodes,
            firstPlayUrl: item.firstPlayUrl,
            playUrl: item.playUrl,
            reason: isColdStart ? '全网热播推荐' : `基于你常看的「${CATEGORY_NAMES[catKey] || '短剧'}」`,
          }));
        } catch {
          return [];
        }
      });

      const results = await Promise.all(fetchPromises);

      // 混排 (Interleave) 与去重
      const interleaved: RecommendedShortDrama[] = [];
      const maxLength = Math.max(...results.map((r) => r.length), 0);
      const seenTitles = new Set<string>();

      for (let i = 0; i < maxLength; i++) {
        for (const bucket of results) {
          if (bucket[i]) {
            const drama = bucket[i];
            const normalizedTitle = drama.title.trim().toLowerCase();
            if (!seenTitles.has(normalizedTitle) && !watchedTitles.has(normalizedTitle)) {
              seenTitles.add(normalizedTitle);
              interleaved.push(drama);
            }
          }
        }
      }

      setMovies(interleaved.slice(0, 18));
    } catch (err) {
      console.error('Fetch short drama recommendations error:', err);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  }, [analyzePreferences, viewingHistory]);

  useEffect(() => {
    if (!isFetchedRef.current) {
      isFetchedRef.current = true;
      fetchRecommendations();
    }
  }, [fetchRecommendations]);

  return {
    movies,
    loading,
    hasHistory,
    refresh: fetchRecommendations,
  };
}
