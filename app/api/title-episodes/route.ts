import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// 选用响应速度最快、更新最及时的骨干线路进行秒级探测
const PROBE_SOURCES = [
  { id: 'guangsu', baseUrl: 'https://api.guangsuapi.com/api.php/provide/vod' },
  { id: 'dytt', baseUrl: 'http://caiji.dyttzyapi.com/api.php/provide/vod' },
  { id: 'wujin', baseUrl: 'https://api.wujinapi.me/api.php/provide/vod' },
  { id: 'jisu', baseUrl: 'https://jszyapi.com/api.php/provide/vod' },
];

interface SimpleEpisode {
  name: string;
  index: number;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title')?.trim();

  if (!title) {
    return NextResponse.json({ success: false, error: 'Missing title parameter' }, { status: 400 });
  }

  const cleanTitle = title.replace(/[《》【】\[\]（）()]/g, ' ').replace(/\s+/g, ' ').trim();

  try {
    // 并行向骨干源探测最新集数
    const probePromises = PROBE_SOURCES.map(async (src) => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);

        const url = `${src.baseUrl}?ac=detail&wd=${encodeURIComponent(cleanTitle)}`;
        const res = await fetch(url, {
          signal: controller.signal,
          headers: { 'User-Agent': 'Mozilla/5.0' },
        });
        clearTimeout(timeoutId);

        if (!res.ok) return null;
        const data = await res.json();
        if (!data || !Array.isArray(data.list) || data.list.length === 0) return null;

        // 寻找标题完全一致的最佳条目
        const matched = data.list.find((item: any) => {
          const rawName = (item.vod_name || '').trim();
          return rawName === cleanTitle || rawName === title;
        }) || data.list[0];

        if (!matched || !matched.vod_play_url) return null;

        // 解析播放列表：多条线路用 $$$ 分割，单线路集数用 # 分割
        const lines = matched.vod_play_url.split('$$$');
        let bestEpisodes: SimpleEpisode[] = [];

        for (const line of lines) {
          const rawEps = line.split('#');
          const parsedEps: SimpleEpisode[] = [];
          for (let i = 0; i < rawEps.length; i++) {
            const part = rawEps[i].trim();
            if (!part) continue;
            const [name] = part.split('$');
            parsedEps.push({
              name: name || `第${i + 1}集`,
              index: i,
            });
          }
          if (parsedEps.length > bestEpisodes.length) {
            bestEpisodes = parsedEps;
          }
        }

        return {
          source: src.id,
          totalEpisodes: bestEpisodes.length,
          episodes: bestEpisodes,
          remarks: matched.vod_remarks || '',
        };
      } catch {
        return null;
      }
    });

    const results = (await Promise.all(probePromises)).filter(Boolean);

    if (results.length === 0) {
      return NextResponse.json({ success: false, error: 'No matching episodes found' });
    }

    // 挑选集数最多且最完整的源结果
    results.sort((a: any, b: any) => b.totalEpisodes - a.totalEpisodes);
    const best = results[0];

    if (!best) {
      return NextResponse.json({ success: false, error: 'No matching episodes found' });
    }

    return NextResponse.json({
      success: true,
      title,
      totalEpisodes: best.totalEpisodes,
      remarks: best.remarks,
      episodes: best.episodes,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Server error' }, { status: 500 });
  }
}
