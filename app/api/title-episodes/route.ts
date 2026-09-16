import { NextRequest, NextResponse } from 'next/server';
import { parseSeasonFromTitle, generateSeasonSearchVariants, matchesTargetSeason } from '@/lib/utils/season-resolver';
import { safeParseResponse } from '@/lib/utils/safe-json';

export const runtime = 'edge';

// 选用响应速度最快、更新最及时的骨干线路进行秒级探测（巨量Anycast纯净全网首选，光速全球高可用第二首选，暴风国内第三首选）
const PROBE_SOURCES = [
  { id: 'juliang', baseUrl: 'https://api.juliang.live/api/provide/vod' },
  { id: 'guangsu', baseUrl: 'https://api.guangsuapi.com/api.php/provide/vod' },
  { id: 'baofeng', baseUrl: 'https://bfzyapi.com/api.php/provide/vod' },
  { id: 'dytt', baseUrl: 'http://caiji.dyttzyapi.com/api.php/provide/vod' },
  { id: 'wujin', baseUrl: 'https://api.wujinapi.me/api.php/provide/vod' },
  { id: 'jisu', baseUrl: 'https://jszyapi.com/api.php/provide/vod' },
];

interface SimpleEpisode {
  name: string;
  index: number;
  episodeNumber?: number;
  isSpecial?: boolean;
}

/**
 * 从 remarks（如 "第191集", "更新至191集", "全191集"）提取集数数字
 */
function extractEpisodeFromRemarks(remarks?: string): number | null {
  if (!remarks) return null;
  const clean = remarks.trim();
  const m = clean.match(/(?:更新至|更新到|全|第)?\s*(\d+)\s*(?:集|话|期)?/);
  if (m) {
    const num = parseInt(m[1], 10);
    if (num > 0 && num < 2500) return num;
  }
  return null;
}

/**
 * 智能提取切片名称中的正片集数编号
 * 过滤花絮、预告、特别篇等非正片切片
 */
function extractEpisodeNumber(name?: string): number | null {
  if (!name) return null;
  const clean = name.trim();
  if (/(?:预告|花絮|PV|特辑|采访|彩蛋)/i.test(clean)) return null;

  // 优先匹配：第191集、第191话、EP191、第77集星海飞驰篇
  const m1 = clean.match(/(?:第|ep)\s*(\d+)\s*(?:集|话)?/i);
  if (m1) {
    const num = parseInt(m1[1], 10);
    if (num > 0 && num < 2500) return num;
  }

  // 匹配：191集、191话
  const m2 = clean.match(/^(\d+)\s*(?:集|话)/);
  if (m2) {
    const num = parseInt(m2[1], 10);
    if (num > 0 && num < 2500) return num;
  }

  // 匹配纯数字：191（排除4位数年份）
  if (/^\d+$/.test(clean)) {
    const num = parseInt(clean, 10);
    if (num > 0 && num < 1900) return num;
  }

  return null;
}

/**
 * 单源季播智能探测
 */
async function probeSingleSource(
  src: typeof PROBE_SOURCES[0],
  cleanTitle: string,
  baseTitle: string,
  targetSeason: number | null,
  searchVariants: string[]
) {
  // 若有季数，尝试中文标准名（如"时光代理人第三季"）与无空格变体及母标题
  // 采集站（苹果CMS/帝国CMS）会将空格拆分成 OR 导致脱靶，因此搜索词去除多余空格
  const rawKeywords = targetSeason ? searchVariants : [cleanTitle];
  const seenKws = new Set<string>();
  const keywordsToTry: string[] = [];

  for (const raw of rawKeywords) {
    const compact = raw.replace(/\s+/g, '').trim();
    if (compact && !seenKws.has(compact)) {
      seenKws.add(compact);
      keywordsToTry.push(compact);
    }
  }

  // 尝试前 4 个最精准变体（包含中文数字、去符号及核心子标题）
  const finalKeywords = keywordsToTry.slice(0, 4);
  const cleanSymbols = (s: string) => (s || '').replace(/[·・\-_:：\s+]/g, '').toLowerCase();
  const normalizedBase = cleanSymbols(baseTitle);

  for (const kw of finalKeywords) {
    try {
      const controller = new AbortController();
      const timeoutMs = src.id === 'juliang' ? 3500 : 2200;
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const cleanBase = src.baseUrl.replace(/\/+$/, '');
      const url = `${cleanBase}/?ac=detail&wd=${encodeURIComponent(kw)}`;
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
        },
      });
      clearTimeout(timeoutId);

      if (!res.ok) continue;
      let data: any;
      try {
        data = await safeParseResponse(res);
      } catch {
        continue;
      }

      if (!data || !Array.isArray(data.list) || data.list.length === 0) continue;

      // 🌟 强防线 1：过滤掉片名完全不包含母标题 baseTitle 的无关条目（支持中点·等标点符号容错）
      const validItems = data.list.filter((item: any) => {
        const rawName = cleanSymbols(item.vod_name);
        if (rawName.includes(normalizedBase) || normalizedBase.includes(rawName)) return true;
        // 若长标题包含复合词，只要核心关键词（后 4 个字）相互重合即视为同片
        if (normalizedBase.length >= 6) {
          const coreEnd = normalizedBase.slice(-4);
          if (rawName.includes(coreEnd)) return true;
        }
        return false;
      });

      if (validItems.length === 0) continue;

      let matched: any = null;

      // 🌟 强防线 2：若有明确季数，优先在有效条目中挑选完全匹配目标季的条目（优先正统原版，降级日语/英配版）
      if (targetSeason) {
        matched = validItems.find((item: any) => {
          const rawName = (item.vod_name || '').trim();
          const isForeignDub = /(?:日语|韩语|英语|日剧|日版|英配)/i.test(rawName);
          return !isForeignDub && matchesTargetSeason(rawName, targetSeason);
        });
        if (!matched) {
          matched = validItems.find((item: any) => {
            const rawName = (item.vod_name || '').trim();
            return matchesTargetSeason(rawName, targetSeason);
          });
        }
      }

      // 🌟 强防线 3：若未匹配到季数专属条目，尝试与当前搜索词或原始标题一致
      if (!matched) {
        matched = validItems.find((item: any) => {
          const rawName = cleanSymbols(item.vod_name);
          return rawName === cleanSymbols(kw) || rawName === cleanSymbols(cleanTitle);
        });
      }

      // 🌟 强防线 4：若无季数要求，取有效条目中的第一条
      if (!matched && !targetSeason) {
        matched = validItems[0];
      }

      if (!matched || !matched.vod_play_url) continue;

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
          const cleanName = name || `第${i + 1}集`;
          const epNum = extractEpisodeNumber(cleanName);

          parsedEps.push({
            name: cleanName,
            index: i,
            episodeNumber: epNum ?? undefined,
            isSpecial: epNum === null,
          });
        }
        if (parsedEps.length > bestEpisodes.length) {
          bestEpisodes = parsedEps;
        }
      }

      if (bestEpisodes.length === 0) continue;

      // 智能仲裁正片总集数与特别篇
      let maxParsedEpisode = 0;
      const specialEpisodes: SimpleEpisode[] = [];

      for (const ep of bestEpisodes) {
        if (ep.episodeNumber) {
          if (ep.episodeNumber > maxParsedEpisode) {
            maxParsedEpisode = ep.episodeNumber;
          }
        } else {
          specialEpisodes.push(ep);
        }
      }

      const remarksEp = extractEpisodeFromRemarks(matched.vod_remarks);
      let totalEpisodes = bestEpisodes.length;

      if (maxParsedEpisode > 0) {
        if (remarksEp && Math.abs(remarksEp - maxParsedEpisode) <= 5) {
          totalEpisodes = Math.max(remarksEp, maxParsedEpisode);
        } else {
          totalEpisodes = maxParsedEpisode;
        }
      } else if (remarksEp && remarksEp > 0) {
        totalEpisodes = remarksEp;
      }

      return {
        id: matched.vod_id,
        source: src.id,
        vodName: (matched.vod_name || '').trim(),
        targetSeason: targetSeason ?? undefined,
        totalEpisodes,
        rawTotalCount: bestEpisodes.length,
        episodes: bestEpisodes,
        specialEpisodes,
        remarks: matched.vod_remarks || '',
      };
    } catch (err: any) {
      return { source: src.id, failed: true, error: `${err?.name || 'Error'}: ${err?.message || 'unknown'}` };
    }
  }

  return { source: src.id, failed: true, error: 'no matching items' };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title')?.trim();

  if (!title) {
    return NextResponse.json({ success: false, error: 'Missing title parameter' }, { status: 400 });
  }

  const cleanTitle = title.replace(/[《》【】\[\]（）()]/g, ' ').replace(/\s+/g, ' ').trim();
  const parsedSeason = parseSeasonFromTitle(cleanTitle);
  const baseTitle = parsedSeason ? parsedSeason.baseTitle : cleanTitle;
  const targetSeason = parsedSeason ? parsedSeason.seasonNumber : null;
  const searchVariants = generateSeasonSearchVariants(cleanTitle);

  try {
    // 并行向骨干源发起探测
    const probePromises = PROBE_SOURCES.map(src =>
      probeSingleSource(src, cleanTitle, baseTitle, targetSeason, searchVariants)
    );

    const rawResults = await Promise.all(probePromises);
    const results = rawResults.filter((r: any) => r && !r.failed);
    const probeErrors = rawResults.filter((r: any) => r && r.failed);

    if (results.length === 0) {
      return NextResponse.json({ success: false, error: 'No matching episodes found', _debugErrors: probeErrors });
    }

    // 排序优先级：
    // 1. 命中目标季优先
    // 2. 骨干线路权重仲裁：消除采集站预告片/花絮/特别篇切片虚高干扰（巨量 Anycast 纯净首选，光速全球高可用第二，暴风第三）
    // 3. 连载正片集数显著领先（差异超过 5 集且非花絮预告误差）
    const SOURCE_PROBE_WEIGHTS: Record<string, number> = {
      juliang: 100,
      guangsu: 95,
      baofeng: 90,
      wujin: 80,
      jisu: 70,
      dytt: 60,
    };

    results.sort((a: any, b: any) => {
      if (targetSeason) {
        const aSeasonMatch = matchesTargetSeason(a.vodName, targetSeason) ? 1 : 0;
        const bSeasonMatch = matchesTargetSeason(b.vodName, targetSeason) ? 1 : 0;
        if (aSeasonMatch !== bSeasonMatch) {
          return bSeasonMatch - aSeasonMatch;
        }
      }

      const aEp = a.totalEpisodes || 0;
      const bEp = b.totalEpisodes || 0;
      const epDiff = Math.abs(aEp - bEp);
      const isMovie = aEp <= 3 && bEp <= 3;
      const maxEp = Math.max(aEp, bEp, 1);
      const relativeDiff = epDiff / maxEp;

      // 电影，或者剧集集数差异在 8 集以内，或相对误差在 10% 以内（长篇年番/连续剧预告、花絮、彩蛋、特别篇常见切片虚高），严格以黄金骨干线路优先级（巨量 > 光速 > 暴风）仲裁
      if (isMovie || epDiff <= 8 || relativeDiff <= 0.1) {
        const aWeight = SOURCE_PROBE_WEIGHTS[a.source] || 0;
        const bWeight = SOURCE_PROBE_WEIGHTS[b.source] || 0;
        if (aWeight !== bWeight) {
          return bWeight - aWeight;
        }
      }

      // 真实连载更新显著领先（集数差距 > 8 集且超出 10%）时，才以更新集数更多者优先
      if (bEp !== aEp) {
        return bEp - aEp;
      }

      const aWeight = SOURCE_PROBE_WEIGHTS[a.source] || 0;
      const bWeight = SOURCE_PROBE_WEIGHTS[b.source] || 0;
      return bWeight - aWeight;
    });

    const best = results[0];

    if (!best) {
      return NextResponse.json({ success: false, error: 'No matching episodes found' });
    }

    return NextResponse.json({
      success: true,
      title,
      matchedVodName: best.vodName,
      targetSeason: best.targetSeason,
      id: best.id,
      source: best.source,
      totalEpisodes: best.totalEpisodes,
      rawTotalCount: best.rawTotalCount,
      remarks: best.remarks,
      episodes: best.episodes,
      specialEpisodes: best.specialEpisodes,
      _candidates: results.map((r: any) => ({ source: r.source, id: r.id, ep: r.totalEpisodes })),
      _debugErrors: probeErrors,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Server error' }, { status: 500 });
  }
}

