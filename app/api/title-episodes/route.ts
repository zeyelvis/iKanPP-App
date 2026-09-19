import { NextRequest, NextResponse } from 'next/server';
import { parseSeasonFromTitle, generateSeasonSearchVariants, matchesTargetSeason } from '@/lib/utils/season-resolver';
import { safeParseResponse } from '@/lib/utils/safe-json';
import { cleanEpisodeName } from '@/lib/utils/episode-resolver';

export const runtime = 'edge';

// 选用响应速度最快、更新最及时的骨干线路进行秒级探测（巨量Anycast纯净全网首选，光速全球高可用第二首选，暴风国内第三首选）
const PROBE_SOURCES = [
  { id: 'juliang', baseUrl: 'https://api.juliang.live/api/provide/vod' },
  { id: 'guangsu', baseUrl: 'https://api.guangsuapi.com/api.php/provide/vod' },
  { id: 'baofeng', baseUrl: 'https://bfzyapi.com/api.php/provide/vod' },
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

  // 1. 先剔除季数前缀（如 '第 1 季 ', 'Season 2', 'S01'），防止 '第 1 季 第 189 集' 误将季数 '1' 识别为集数
  const withoutSeason = clean.replace(/(?:第\s*[\d一二三四五六七八九十]+\s*季|season\s*\d+|s\d+)/gi, '').trim();

  // 2. 强匹配：明确带有 '集'、'话'、'期' 的集数（如 '第 189 集', '第191话', '189集', 'EP 12期'）
  const m1 = withoutSeason.match(/(?:第|ep)?\s*(\d+)\s*(?:集|话|期)/i);
  if (m1) {
    const num = parseInt(m1[1], 10);
    if (num > 0 && num < 2500) return num;
  }

  // 3. 匹配明确的 EP/第 + 数字（如 'EP189', '第189', 'EP.189'）
  const m2 = withoutSeason.match(/(?:ep\.?|第)\s*(\d+)/i);
  if (m2) {
    const num = parseInt(m2[1], 10);
    if (num > 0 && num < 2500) return num;
  }

  // 4. 匹配以数字开头的集数（如 '189', '189 完结', '01'，排除4位数年份）
  const m3 = withoutSeason.match(/^(\d+)(?:\s|$|[-_:：])/);
  if (m3) {
    const num = parseInt(m3[1], 10);
    if (num > 0 && num < 2500 && num !== 1900 && num !== 2023 && num !== 2024 && num !== 2025 && num !== 2026) return num;
  }

  // 5. 兜底匹配纯数字
  if (/^\d+$/.test(withoutSeason)) {
    const num = parseInt(withoutSeason, 10);
    if (num > 0 && num < 2500) return num;
  }

  return null;
}

/**
 * 影视类型判断辅助函数
 */
function isSeriesType(typeName?: string): boolean {
  if (!typeName) return false;
  const tn = typeName.toLowerCase();
  if (tn.endsWith('片') && !tn.includes('纪录片')) return false;
  return (
    tn.includes('连续剧') ||
    tn.includes('电视剧') ||
    tn.includes('动漫') ||
    tn.includes('动画') ||
    (tn.includes('剧') && !tn.includes('剧情') && !tn.includes('喜剧'))
  );
}

/**
 * 归一化清洗片名（去除特殊标点并剥离紧随片尾的4位年份数字，如"生化危机：爆发夜2026" -> "生化危机爆发夜"）
 */
function normalizeTitleClean(s?: string): string {
  if (!s) return '';
  return s
    .replace(/[·・\-_:：\s+]/g, '')
    .replace(/[《》【】\[\]（）()]/g, '')
    .replace(/(19\d\d|20\d\d)$/g, '') // 剥离末尾贴着的4位年份
    .toLowerCase()
    .trim();
}

/**
 * 单源季播智能探测
 */
async function probeSingleSource(
  src: typeof PROBE_SOURCES[0],
  cleanTitle: string,
  baseTitle: string,
  targetSeason: number | null,
  searchVariants: string[],
  targetType?: string | null,
  targetYear?: string | null
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
    const noPunctuation = compact.replace(/[:：·•\-_]/g, '').trim();
    if (noPunctuation && !seenKws.has(noPunctuation)) {
      seenKws.add(noPunctuation);
      keywordsToTry.push(noPunctuation);
    }
  }

  // 尝试前 3 个最精准核心变体（母标题及去符号标准名），杜绝漫长轮询
  const finalKeywords = keywordsToTry.slice(0, 3);
  const normalizedBase = normalizeTitleClean(baseTitle);

  for (const kw of finalKeywords) {
    try {
      const controller = new AbortController();
      const timeoutMs = src.id === 'juliang' ? 2500 : 1800;
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

      // 🌟 强防线 1：过滤掉片名完全不包含母标题 baseTitle 的无关条目，并严格执行电影/剧集物理类型隔离
      const validItems = data.list.filter((item: any) => {
        const rawName = normalizeTitleClean(item.vod_name);
        const itemIsSeries = isSeriesType(item.type_name) || (item.vod_remarks && /更新|全\d+集|第\d+集|连载/i.test(item.vod_remarks));

        // 电影类型隔离：若目标是电影，坚决剔除连续剧/剧集条目（杜绝误把2022美剧《生化危机》等剧集当成2026电影）
        if (targetType === 'movie') {
          if (isSeriesType(item.type_name)) return false;
          const epLines = (item.vod_play_url || '').split('#').length;
          if (epLines > 3) return false;
        }

        // 电视剧类型隔离：若目标是电视剧且有季数，过滤掉单部独立电影
        if (targetType === 'tv' && targetSeason && !itemIsSeries && !(item.vod_remarks && /第|集|话|期/i.test(item.vod_remarks))) {
          return false;
        }

        // 片名一致性核验：归一化后必须完全相等，或者长标题完全包含短标题且重合字数必须覆盖副标题
        if (rawName === normalizedBase) return true;
        if (rawName.includes(normalizedBase)) return true;
        if (normalizedBase.includes(rawName)) {
          // 若目标包含副标题（长度 >= 5），候选短词长度若差距超过 2 个字（如"生化危机" vs "生化危机爆发夜"），不可误吞！
          if (normalizedBase.length >= 5 && rawName.length <= normalizedBase.length - 2) {
            return false;
          }
          return true;
        }

        // 若长标题包含复合词，只要核心关键词（后 4 个字，如"爆发夜"）相互重合即视为同片
        if (normalizedBase.length >= 6) {
          const coreEnd = normalizedBase.slice(-4);
          if (rawName.includes(coreEnd)) return true;
        }
        return false;
      });

      if (validItems.length === 0) continue;

      let matched: any = null;

      // 🌟 强防线 2：若有明确季数，优先在有效条目中挑选完全匹配目标季的条目
      if (targetSeason) {
        const seasonMatches = validItems.filter((item: any) => {
          const rawName = (item.vod_name || '').trim();
          return matchesTargetSeason(rawName, targetSeason);
        });
        if (seasonMatches.length > 0) {
          seasonMatches.sort((a: any, b: any) => {
            const isADub = /(?:日语|韩语|英语|日剧|日版|英配)/i.test(a.vod_name || '') ? 1 : 0;
            const isBDub = /(?:日语|韩语|英语|日剧|日版|英配)/i.test(b.vod_name || '') ? 1 : 0;
            if (isADub !== isBDub) return isADub - isBDub;
            const aEpsCount = (a.vod_play_url || '').split('#').length;
            const bEpsCount = (b.vod_play_url || '').split('#').length;
            return bEpsCount - aEpsCount;
          });
          matched = seasonMatches[0];
        }
      }

      // 🌟 强防线 3：精确片名与年份对齐匹配（优先挑归一化片名完全一致且年份吻合的，如"生化危机：爆发夜2026"精准对齐"生化危机：爆发夜"）
      if (!matched) {
        const exactMatches = validItems.filter((item: any) => {
          const rawName = normalizeTitleClean(item.vod_name);
          return rawName === normalizedBase || rawName === normalizeTitleClean(cleanTitle);
        });
        if (exactMatches.length > 0) {
          exactMatches.sort((a: any, b: any) => {
            // 年份吻合优先
            if (targetYear) {
              const aYearMatch = (a.vod_year === targetYear || (a.vod_name || '').includes(targetYear)) ? 1 : 0;
              const bYearMatch = (b.vod_year === targetYear || (b.vod_name || '').includes(targetYear)) ? 1 : 0;
              if (aYearMatch !== bYearMatch) return bYearMatch - aYearMatch;
            }
            // 抢先版/TC/HD等画质标签优先于预告花絮
            const aIsGood = /(?:hd|tc|抢先|正片|4k|1080)/i.test(a.vod_remarks || '') ? 1 : 0;
            const bIsGood = /(?:hd|tc|抢先|正片|4k|1080)/i.test(b.vod_remarks || '') ? 1 : 0;
            if (aIsGood !== bIsGood) return bIsGood - aIsGood;

            const aEpsCount = (a.vod_play_url || '').split('#').length;
            const bEpsCount = (b.vod_play_url || '').split('#').length;
            return bEpsCount - aEpsCount;
          });
          matched = exactMatches[0];
        }
      }

      // 🌟 强防线 4：若无季数要求且无完全精确片名，在过滤后的有效条目中挑选年份最吻合的一条
      if (!matched && !targetSeason) {
        if (targetYear) {
          const yearMatched = validItems.find((it: any) => it.vod_year === targetYear || (it.vod_name || '').includes(targetYear));
          if (yearMatched) matched = yearMatched;
        }
        if (!matched) matched = validItems[0];
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
          const cleanName = cleanEpisodeName(name) || `第${i + 1}集`;
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
  const targetType = searchParams.get('type')?.trim() || null;
  const targetYear = searchParams.get('year')?.trim() || null;

  if (!title) {
    return NextResponse.json({ success: false, error: 'Missing title parameter' }, { status: 400 });
  }

  const cleanTitle = title.replace(/[《》【】\[\]（）()]/g, ' ').replace(/\s+/g, ' ').trim();
  const parsedSeason = parseSeasonFromTitle(cleanTitle);
  const baseTitle = parsedSeason ? parsedSeason.baseTitle : cleanTitle;
  const targetSeason = parsedSeason ? parsedSeason.seasonNumber : null;
  const searchVariants = generateSeasonSearchVariants(cleanTitle);

  try {
    // 采用“首选骨干源早停收敛窗口（Fast Early-Return Grace Window）”：
    // 1. 若巨量资源 (juliang) 率先命中，其权重恒定最高 (100)，直接在 50ms 内瞬间直出，无需等待其他任何源；
    // 2. 若光速或暴风等骨干源率先命中，开启 350ms 宽限窗口：若巨量在 350ms 内到达则采用巨量，若巨量超时则直接由光速/暴风直出；
    // 3. 全局最长等待 2200ms 熔断，绝不允许接口被慢速源拖累。
    const collected: any[] = [];
    const probeErrors: any[] = [];
    let completedCount = 0;
    const totalSources = PROBE_SOURCES.length;

    await new Promise<void>((resolve) => {
      let isResolved = false;
      let graceTimer: ReturnType<typeof setTimeout> | null = null;

      const finish = () => {
        if (isResolved) return;
        isResolved = true;
        if (graceTimer) clearTimeout(graceTimer);
        resolve();
      };

      // 全局硬熔断守卫：最多 2200ms
      const globalTimer = setTimeout(() => {
        finish();
      }, 2200);

      PROBE_SOURCES.forEach(src => {
        probeSingleSource(src, cleanTitle, baseTitle, targetSeason, searchVariants, targetType, targetYear)
          .then(res => {
            completedCount++;
            if (res) {
              if (!res.failed) {
                collected.push(res);
                // 1. 若全网首选【巨量资源】成功命中且有效，直接在 50ms 缓冲后立即提前结束
                if (res.source === 'juliang' && (res.totalEpisodes ?? 0) > 0) {
                  if (!graceTimer) {
                    graceTimer = setTimeout(() => finish(), 50);
                  }
                } else if (collected.length > 0 && !graceTimer) {
                  // 2. 若光速/暴风等先到达，给巨量留出 350ms 窗口；若超时未到则直接提前结束
                  graceTimer = setTimeout(() => finish(), 350);
                }
              } else {
                probeErrors.push(res);
              }
            }

            if (completedCount >= totalSources) {
              clearTimeout(globalTimer);
              finish();
            }
          })
          .catch(err => {
            completedCount++;
            probeErrors.push({ source: src.id, failed: true, error: String(err) });
            if (completedCount >= totalSources) {
              clearTimeout(globalTimer);
              finish();
            }
          });
      });
    });

    const results = collected.filter((r: any) => r && !r.failed);

    if (results.length === 0) {
      return NextResponse.json({ success: false, error: 'No matching episodes found', _debugErrors: probeErrors });
    }

    // 排序优先级：
    // 1. 命中目标季优先
    // 2. 电影类型优先（若目标为电影，单集正片/TC/抢先版绝对优先）
    // 3. 骨干线路权重仲裁：消除采集站预告片/花絮/特别篇切片虚高干扰（巨量 Anycast 纯净首选，光速全球高可用第二，暴风第三）
    const SOURCE_PROBE_WEIGHTS: Record<string, number> = {
      juliang: 100,
      guangsu: 95,
      baofeng: 90,
      jisu: 70,
    };

    results.sort((a: any, b: any) => {
      if (targetSeason) {
        const aSeasonMatch = matchesTargetSeason(a.vodName, targetSeason) ? 1 : 0;
        const bSeasonMatch = matchesTargetSeason(b.vodName, targetSeason) ? 1 : 0;
        if (aSeasonMatch !== bSeasonMatch) {
          return bSeasonMatch - aSeasonMatch;
        }
      }

      // 电影类型约束保护：单集优先
      if (targetType === 'movie') {
        const aIsMovie = (a.totalEpisodes || 0) <= 2 ? 1 : 0;
        const bIsMovie = (b.totalEpisodes || 0) <= 2 ? 1 : 0;
        if (aIsMovie !== bIsMovie) {
          return bIsMovie - aIsMovie;
        }
      }

      const aEp = a.totalEpisodes || 0;
      const bEp = b.totalEpisodes || 0;
      const epDiff = Math.abs(aEp - bEp);
      const isMovie = aEp <= 3 && bEp <= 3;
      const maxEp = Math.max(aEp, bEp, 1);
      const relativeDiff = epDiff / maxEp;

      // 电影，或者剧集集数差异在 8 集以内，或相对误差在 10% 以内，严格以黄金骨干线路优先级（巨量 > 光速 > 暴风）仲裁
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
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Server error' }, { status: 500 });
  }
}

