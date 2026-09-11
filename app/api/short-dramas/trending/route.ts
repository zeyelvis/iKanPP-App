import { NextResponse } from 'next/server';
import {
  SHORT_DRAMA_SOURCES,
  ShortDramaItem,
  parseShortDramaPlayUrl,
  parseEpisodesCount,
} from '@/lib/api/short-drama-sources';

export const runtime = 'edge';

const FETCH_TIMEOUT_MS = 2500;

export async function GET() {
  const primarySource = SHORT_DRAMA_SOURCES[0]; // 光速资源优先

  // 各核心热门子分类
  const coreCategories = [
    { key: 'shuangju', id: 49, name: '反转爽剧' },
    { key: 'yanqing', id: 47, name: '言情总裁' },
    { key: 'dushi', id: 45, name: '现代都市' },
    { key: 'guzhuang', id: 44, name: '古风仙侠' },
    { key: 'chuanyue', id: 46, name: '穿越年代' },
    { key: 'naodong', id: 50, name: '脑洞悬疑' },
  ];

  const fetchCategoryTop = async (cat: { key: string; id: number; name: string }) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const url = `${primarySource.baseUrl}${primarySource.apiPath}?ac=detail&t=${cat.id}&pg=1`;
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          Accept: 'application/json',
        },
      });
      clearTimeout(timer);
      if (!res.ok) return [];
      const data = await res.json();
      if (!data || !Array.isArray(data.list)) return [];

      return data.list.slice(0, 4).map((item: any) => {
        const playUrl = item.vod_play_url || '';
        const episodes = parseShortDramaPlayUrl(playUrl);
        const totalEpisodes = parseEpisodesCount(item.vod_remarks, episodes.length);

        return {
          id: `${primarySource.id}-${item.vod_id}`,
          title: item.vod_name || '短剧',
          poster: item.vod_pic || '',
          category: cat.key,
          categoryName: cat.name,
          year: item.vod_year || '2026',
          remarks: item.vod_remarks || (totalEpisodes > 0 ? `共${totalEpisodes}集` : '全集完结'),
          totalEpisodes,
          playUrl,
          episodes,
          firstPlayUrl: episodes[0]?.url || '',
          updatedAt: item.vod_time || '',
        } as ShortDramaItem;
      });
    } catch {
      clearTimeout(timer);
      return [];
    }
  };

  try {
    const settled = await Promise.allSettled(coreCategories.map(fetchCategoryTop));
    const allCandidates: ShortDramaItem[] = [];

    settled.forEach((res) => {
      if (res.status === 'fulfilled' && Array.isArray(res.value)) {
        allCandidates.push(...res.value);
      }
    });

    // 跨分类混排去重
    const seenTitles = new Set<string>();
    const uniqueDramas: ShortDramaItem[] = [];

    for (const item of allCandidates) {
      const norm = item.title.trim().toLowerCase();
      if (!seenTitles.has(norm)) {
        seenTitles.add(norm);
        uniqueDramas.push(item);
      }
    }

    return NextResponse.json({
      success: true,
      total: uniqueDramas.length,
      list: uniqueDramas.slice(0, 20),
    });
  } catch (err) {
    console.error('Fetch trending error:', err);
    return NextResponse.json({
      success: false,
      list: [],
    });
  }
}
