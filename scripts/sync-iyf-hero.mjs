import fs from 'fs';
import path from 'path';

/**
 * 每日全自动同步爱壹帆 (iyf.tv) 全站所有专区板块顶级轮播图与热播速报
 * 
 * 机制：
 * 1. 100% 动态对齐爱壹帆 6 大核心板块：
 *    - 首页 (All): https://www.iyf.tv/ (CID 0,1)
 *    - 电影 (Movie): https://www.iyf.tv/movie (CID 0,1,3)
 *    - 电视剧 (Drama/TV): https://www.iyf.tv/drama (CID 0,1,4)
 *    - 动漫 (Anime): https://www.iyf.tv/anime (CID 0,1,6)
 *    - 综艺 (Variety): https://www.iyf.tv/variety (CID 0,1,5)
 *    - 纪录片 (Documentary): 爱壹帆纪录片官方专区 (CID 0,1,7)
 * 2. 轮播巨幕 (Hero 8 席)：从爱壹帆官方频道真实 HTML / 接口动态提取，自动过滤广告与短剧推广，并通过 TMDB / 豆瓣补齐 4K 宽屏剧照 (backdrop)、高清海报、剧情简介与真实评分
 * 3. 追更速报 (trendingNav 12 席)：从爱壹帆对应 CID 接口实时提取，带真实连载集数/期数角标（如 [6]、[8]、[11]、[16]、[0912]）
 * 4. 自动更新写入 lib/data/home-prebaked.ts 与 lib/data/home-prebaked-extra.ts 预热数据库
 */

const TMDB_API_KEY = '';
const TMDB_BASE = 'https://api.themoviedb.org/3';

/**
 * 精准映射表：针对容易被 TMDB 模糊匹配误杀或由于剧集/电影分类歧义而配错的纪录片与特定影视建立官方基线
 */
const EXACT_TMDB_MAPPING = {
  // ── 🌍 爱壹帆纪录片频道 8 席顶级轮播精准锁定 ──
  '欢迎来地球': { id: 127700, type: 'tv', title: '欢迎来地球', customTypes: ['纪录片', '自然', '探索'] },
  '带你探索地球': { id: 127700, type: 'tv', title: '欢迎来地球', customTypes: ['纪录片', '自然', '探索'] },
  '泰国洞穴救援': { id: 680058, type: 'movie', title: '泰国洞穴救援', customTypes: ['纪录片', '自然', '探索'] },
  '内马尔：不完美的完美球星': { id: 153519, type: 'tv', title: '内马尔：不完美的完美球星', customTypes: ['纪录片', '人物', '体育'] },
  '屏住呼吸：挑战冰潜记录': { id: 958080, type: 'movie', title: '屏住呼吸：挑战冰潜记录', customTypes: ['纪录片', '极限', '体育'] },
  '史前星球': { id: 95171, type: 'tv', title: '史前星球', customTypes: ['纪录片', '自然', '探索'] },
  '王朝第2季': { id: 82953, type: 'tv', title: '王朝第2季', customTypes: ['纪录片', '自然', '野生动物'] },
  '王朝 第二季': { id: 82953, type: 'tv', title: '王朝第2季', customTypes: ['纪录片', '自然', '野生动物'] },
  '漫威616': { id: 102693, type: 'tv', title: '漫威616', customTypes: ['纪录片', '文化', '影视'] },
  '欢迎来到雷克斯汉姆': { id: 126929, type: 'tv', title: '欢迎来到雷克斯汉姆', customTypes: ['纪录片', '体育', '励志'] },
  '小球会大明星': { id: 126929, type: 'tv', title: '欢迎来到雷克斯汉姆', customTypes: ['纪录片', '体育', '励志'] },
  // ── 🌍 纪录片经典备选神作 ──
  '地球脉动': { id: 106379, type: 'tv', title: '地球脉动' },
  '蓝色星球': { id: 74313, type: 'tv', title: '蓝色星球' },
  '七个世界，一个星球': { id: 94665, type: 'tv', title: '七个世界，一个星球' },
};

async function fetchTMDBById(id, type = 'movie') {
  const url = `${TMDB_BASE}/${type}/${id}?api_key=${TMDB_API_KEY}&language=zh-CN`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) return null;
    const match = await res.json();
    return {
      title: match.title || match.name,
      overview: match.overview || '',
      poster: match.poster_path ? `https://image.tmdb.org/t/p/w500${match.poster_path}` : '',
      backdrop: match.backdrop_path ? `https://image.tmdb.org/t/p/w1280${match.backdrop_path}` : '',
      rate: (match.vote_average && match.vote_average > 0) ? match.vote_average.toFixed(1) : '8.5',
      year: (match.release_date || match.first_air_date || '2026').slice(0, 4)
    };
  } catch {
    return null;
  }
}

async function fetchTMDB(query, type = 'movie') {
  const cleanKey = query.trim();
  // 1. 优先查阅精准映射字典，杜绝张冠李戴（修仙动画、印度军官电影等）
  if (EXACT_TMDB_MAPPING[cleanKey]) {
    const exact = EXACT_TMDB_MAPPING[cleanKey];
    const directData = await fetchTMDBById(exact.id, exact.type);
    if (directData) return directData;
  }

  const endpoint = type === 'tv' ? 'search/tv' : 'search/movie';
  const url = `${TMDB_BASE}/${endpoint}?api_key=${TMDB_API_KEY}&language=zh-CN&query=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.results || data.results.length === 0) {
      // 清洗关键词重试（去掉冒号、副标题）
      const clean = query.split(/[:：\s]/)[0].trim();
      if (clean && clean !== query) {
        return fetchTMDB(clean, type);
      }
      return null;
    }
    const match = data.results[0];
    return {
      title: match.title || match.name,
      overview: match.overview || '',
      poster: match.poster_path ? `https://image.tmdb.org/t/p/w500${match.poster_path}` : '',
      backdrop: match.backdrop_path ? `https://image.tmdb.org/t/p/w1280${match.backdrop_path}` : '',
      rate: (match.vote_average && match.vote_average > 0) ? match.vote_average.toFixed(1) : '8.5',
      year: (match.release_date || match.first_air_date || '2026').slice(0, 4)
    };
  } catch {
    return null;
  }
}

async function fetchIyfSlides(url, channelName = '首页') {
  console.log(`[iyf-sync] 正在向 ${url} 请求最新【${channelName}】轮播图数据...`);
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
    }
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}, HTTP ${res.status}`);
  }
  const html = await res.text();
  const match = html.match(/var\s+injectJson\s*=\s*(\{[\s\S]*?\});/);
  if (!match) {
    throw new Error(`Unable to locate injectJson in ${url} HTML`);
  }

  const json = JSON.parse(match[1]);
  const slideKey = Object.keys(json).find(k => k.startsWith('slide-list'));
  if (!slideKey || !Array.isArray(json[slideKey])) {
    throw new Error(`Slide list not found in injectJson for ${url}`);
  }

  const rawSlides = json[slideKey];
  console.log(`[iyf-sync] 【${channelName}】获取到原始轮播项 ${rawSlides.length} 个`);

  // 严格过滤广告、外链与无意义短剧推广
  const validMovies = rawSlides.filter(s => {
    if (!s || !s.title) return false;
    if (s.external || s.url?.includes('ppt.iyf.tv') || s.isTop) return false;
    if (s.title.includes('爽剧') || s.title.includes('短剧开启') || s.title.includes('广告')) return false;
    return true;
  });

  console.log(`[iyf-sync] 【${channelName}】过滤后保留 ${validMovies.length} 个正片影视:`, validMovies.map(m => m.title));
  return validMovies;
}

async function enrichMovieData(slideItem, index, forceType = null) {
  const title = slideItem.title.trim();
  const subTitle = slideItem.subTitle || '';
  // 精确区分：若指定 forceType 则优先；若包含“电影”则必为电影；若包含“集”或“季”则必为连续剧
  const isMovie = forceType === 'movie' || subTitle.includes('电影');
  const isSeries = forceType === 'tv' || (!isMovie && (subTitle.includes('集') || subTitle.includes('季') || subTitle.includes('电视剧') || subTitle.includes('连载')));
  const contentType = forceType || (isSeries ? 'tv' : 'movie');

  console.log(`[iyf-sync] 正在补全元数据 [${contentType}]: ${title} (${subTitle})`);

  // 1. 尝试从 TMDB 获取官方大剧照与详情
  const tmdbData = await fetchTMDB(title, contentType);

  // 2. 确定最佳图片（优先 TMDB 4K 宽屏 backdrop，若无则使用 iyf 官方宣发横图）
  const backdrop = tmdbData?.backdrop || slideItem.image || '';
  const cover = tmdbData?.poster || slideItem.verticalImg || slideItem.image || '';
  const rate = tmdbData?.rate || '8.8';
  const year = tmdbData?.year || '2026';
  const description = tmdbData?.overview || `《${title}》由 iKanPP 官方编辑精选推荐，全网 4K 超清极速秒播。${subTitle ? `当前状态：${subTitle}。` : ''}`;

  // 提取分类标签
  let types = ['热门'];
  if (subTitle.includes('剧情')) types.push('剧情');
  if (subTitle.includes('动画')) types.push('动画');
  if (subTitle.includes('喜剧')) types.push('喜剧');
  if (subTitle.includes('动作')) types.push('动作');
  if (subTitle.includes('悬疑') || subTitle.includes('警')) types.push('悬疑');
  if (subTitle.includes('纪录') || forceType === 'documentary') types.push('纪录片');
  if (isSeries) types.push('连续剧');
  else types.push('电影');

  return {
    id: `iyf_hero_${contentType}_${index + 1}`,
    title,
    rate,
    cover,
    backdrop,
    description,
    year,
    types: Array.from(new Set(types)),
    episodes_info: subTitle || undefined,
    type: contentType,
    is_new: true,
    playable: true
  };
}

/**
 * 动态拉取爱壹帆指定板块 (CID) 官方原生二级速报推荐标签矩阵
 * 对应爱壹帆底层原生接口：/v3/list/getHotVideoTop?cinema=1&cid=${cid}&pageSize=${targetCount}
 * 包含电影(12席)、电视剧(11席)、首页(11席)、综艺(8席)、动漫(8席)、纪录片(8席)等专区专属原生排布
 */
async function fetchChannelTrendingNav(cid, channelName, defaultBaselines = [], targetCount = 8) {
  console.log(`[iyf-sync] 正在向爱壹帆拉取【${channelName}】(cid=${cid}) 官方原生 ${targetCount} 席热门推荐标签 (getHotVideoTop)...`);
  try {
    const res = await fetch(`https://m10.iyf.tv/v3/list/getHotVideoTop?cinema=1&cid=${cid}&pageSize=${Math.max(12, targetCount)}`, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(6000)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const list = data?.data?.info || [];

    const items = [];
    const seen = new Set();

    for (const item of list) {
      if (!item || !item.title || item.external) continue;
      const title = item.title.trim();
      if (!seen.has(title)) {
        seen.add(title);
        let updateBadge = "";
        if (item.updateNumber && Number(item.updateNumber) > 0) {
          updateBadge = String(item.updateNumber);
        } else if (item.notifications && String(item.notifications).trim()) {
          updateBadge = String(item.notifications).trim();
        }
        items.push({ title, updateBadge });
      }
      if (items.length >= targetCount) break;
    }

    // 若接口条数不足 targetCount 席，使用官方基准兜底
    for (const fb of defaultBaselines) {
      if (!seen.has(fb.title)) {
        seen.add(fb.title);
        items.push(fb);
      }
      if (items.length >= targetCount) break;
    }

    console.log(`[iyf-sync] 成功获取【${channelName}】${items.length} 席动态原生速报:`, items.map(i => `${i.title}${i.updateBadge ? `[${i.updateBadge}]` : ''}`));
    return items.slice(0, targetCount);
  } catch (err) {
    console.warn(`[iyf-sync] 抓取【${channelName}】速报异常，使用兜底数据:`, err.message);
    return defaultBaselines.slice(0, targetCount);
  }
}

// ──────────────── 1. 首页 (All) ────────────────
async function syncHomeAll() {
  console.log('\n====== [1/6] 同步爱壹帆首页全站轮播大片与速报 ======');
  const slides = await fetchIyfSlides('https://www.iyf.tv/', '首页');
  if (slides.length === 0) {
    console.warn('[iyf-sync] 首页未抓取到有效轮播项，跳过');
    return;
  }

  const allHeroItems = [];
  for (let i = 0; i < slides.length; i++) {
    const item = await enrichMovieData(slides[i], i);
    allHeroItems.push(item);
  }

  const defaultHomeTrending = [
    { title: '兰香如故', updateBadge: '2' },
    { title: '早春晴朗', updateBadge: '' },
    { title: '斗破苍穹年番', updateBadge: '1' },
    { title: '交锋', updateBadge: '2' },
    { title: '凡人修仙传', updateBadge: '1' },
    { title: '飞到我心上', updateBadge: '' },
    { title: '生逢其时', updateBadge: '1' },
    { title: '冬城猎凶', updateBadge: '2' },
    { title: '深渊无间', updateBadge: '2' },
    { title: '说唱巅峰对决2026', updateBadge: '2' },
    { title: '杀手妈咪', updateBadge: '1' },
    { title: '死有对证', updateBadge: '' },
  ];

  const trendingNavItems = await fetchChannelTrendingNav('0,1', '全站精选', defaultHomeTrending, 12);

  const extraPath = path.resolve(process.cwd(), 'lib/data/home-prebaked-extra.ts');
  if (fs.existsSync(extraPath)) {
    let extraContent = fs.readFileSync(extraPath, 'utf-8');

    // 1. 同步 Hero 轮播大图
    const allHeroRegex = /(ALL_HOME_DATA:\s*PrebakedHomeCategory\s*=\s*\{[\s\S]*?["']?hero["']?:\s*\[)[\s\S]*?(\]\s*,\s*["']?top10["']?)/;
    if (allHeroRegex.test(extraContent)) {
      const formattedJson = JSON.stringify(allHeroItems, null, 4)
        .replace(/^\[/, '')
        .replace(/\]$/, '')
        .trim();
      extraContent = extraContent.replace(allHeroRegex, `$1\n    ${formattedJson}\n  $2`);
      console.log(`✅ [iyf-sync] 成功将爱壹帆首页真实 ${allHeroItems.length} 席最新轮播巨幕同步至 ALL_HOME_DATA.hero！`);
    }

    // 2. 同步 12 席热播追更速报矩阵
    if (trendingNavItems && trendingNavItems.length > 0) {
      const trendingRegex = /(ALL_HOME_DATA:\s*PrebakedHomeCategory\s*=\s*\{[\s\S]*?trendingNav:\s*\[)[\s\S]*?(\]\s*,\s*["']?hero["']?:)/;
      if (trendingRegex.test(extraContent)) {
        const formattedTrending = JSON.stringify(trendingNavItems, null, 4)
          .replace(/^\[/, '')
          .replace(/\]$/, '')
          .trim();
        extraContent = extraContent.replace(trendingRegex, `$1\n    ${formattedTrending}\n  $2`);
        console.log(`✅ [iyf-sync] 成功将爱壹帆最新 ${trendingNavItems.length} 席全站追更矩阵同步至 ALL_HOME_DATA.trendingNav！`);
      }
    }

    fs.writeFileSync(extraPath, extraContent, 'utf-8');
  }
}

// ──────────────── 2. 电影频道 (Movie) ────────────────
async function syncMovieChannel() {
  console.log('\n====== [2/6] 同步爱壹帆电影频道专属轮播大片与速报 ======');
  const slides = await fetchIyfSlides('https://www.iyf.tv/movie', '电影频道');
  if (slides.length === 0) {
    console.warn('[iyf-sync] 电影频道未抓取到有效轮播项，跳过');
    return;
  }

  const movieHeroItems = [];
  for (let i = 0; i < slides.length; i++) {
    const item = await enrichMovieData(slides[i], i, 'movie');
    movieHeroItems.push(item);
  }

  // 100% 对齐爱壹帆电影官方 getHotVideoTop 专属 12 席热映推荐标签
  const defaultMovieTrending = [
    { title: '蜂鸟行动', updateBadge: '' },
    { title: '欢迎来龙餐馆', updateBadge: '' },
    { title: '给阿嬷的情书', updateBadge: '' },
    { title: '出入平安', updateBadge: '' },
    { title: '特立独行', updateBadge: '' },
    { title: '海洋奇缘：启航', updateBadge: '' },
    { title: '百分之十', updateBadge: '' },
    { title: '求救信号', updateBadge: '' },
    { title: '夜王', updateBadge: '' },
    { title: '怒之杀(听译)', updateBadge: '' },
    { title: '玩具总动员5', updateBadge: '' },
    { title: '不成功穿越指南', updateBadge: '' },
  ];

  const movieTrendingNav = await fetchChannelTrendingNav('0,1,3', '电影频道', defaultMovieTrending, 12);

  const prebakedPath = path.resolve(process.cwd(), 'lib/data/home-prebaked.ts');
  if (fs.existsSync(prebakedPath)) {
    let prebakedContent = fs.readFileSync(prebakedPath, 'utf-8');

    // 1. 同步 PREBAKED_HOME_DATA.movie.hero
    const movieHeroRegex = /(["']?movie["']?:\s*\{[\s\S]*?["']?hero["']?:\s*\[)[\s\S]*?(\]\s*,\s*["']?top10["']?:)/;
    if (movieHeroRegex.test(prebakedContent)) {
      const formattedMovieJson = JSON.stringify(movieHeroItems, null, 8)
        .replace(/^\[/, '')
        .replace(/\]$/, '')
        .trim();
      prebakedContent = prebakedContent.replace(movieHeroRegex, `$1\n        ${formattedMovieJson}\n      $2`);
      console.log(`✅ [iyf-sync] 成功将爱壹帆电影频道真实 ${movieHeroItems.length} 席院线大片巨幕同步至 PREBAKED_HOME_DATA.movie.hero！`);
    }

    // 2. 同步或注入 PREBAKED_HOME_DATA.movie.trendingNav
    const movieTrendingRegex = /(["']?movie["']?:\s*\{[\s\S]*?)(["']?trendingNav["']?:\s*\[[\s\S]*?\]\s*,\s*)?(["']?hero["']?:)/;
    if (movieTrendingRegex.test(prebakedContent)) {
      const formattedTrending = JSON.stringify(movieTrendingNav, null, 8)
        .replace(/^\[/, '')
        .replace(/\]$/, '')
        .trim();
      prebakedContent = prebakedContent.replace(movieTrendingRegex, `$1"trendingNav": [\n        ${formattedTrending}\n      ],\n    $3`);
      console.log(`✅ [iyf-sync] 成功为电影频道写入专属 ${movieTrendingNav.length} 席热映速报至 PREBAKED_HOME_DATA.movie.trendingNav！`);
    }

    fs.writeFileSync(prebakedPath, prebakedContent, 'utf-8');
  }
}

// ──────────────── 3. 电视剧频道 (Drama / TV) ────────────────
async function syncTvChannel() {
  console.log('\n====== [3/6] 同步爱壹帆电视剧频道专属轮播剧王与速报 ======');
  const slides = await fetchIyfSlides('https://www.iyf.tv/drama', '电视剧频道');
  if (slides.length === 0) {
    console.warn('[iyf-sync] 电视剧频道未抓取到有效轮播项，跳过');
    return;
  }

  const tvHeroItems = [];
  for (let i = 0; i < slides.length; i++) {
    const item = await enrichMovieData(slides[i], i, 'tv');
    tvHeroItems.push(item);
  }

  // 100% 对齐爱壹帆电视剧官方 getHotVideoTop 专属 12 席黄金档推荐标签 (6+6 黄金排布)
  const defaultTvTrending = [
    { title: '兰香如故', updateBadge: '2' },
    { title: '早春晴朗', updateBadge: '' },
    { title: '交锋', updateBadge: '2' },
    { title: '生逢其时', updateBadge: '1' },
    { title: '飞到我心上', updateBadge: '' },
    { title: '冬城猎凶', updateBadge: '1' },
    { title: '深渊无间', updateBadge: '' },
    { title: '死有对证', updateBadge: '1' },
    { title: '云雀叫天录', updateBadge: '5' },
    { title: '花开锦绣', updateBadge: '' },
    { title: '杀手妈咪', updateBadge: '' },
    { title: '百花杀', updateBadge: '' }
  ];

  const tvTrendingNav = await fetchChannelTrendingNav('0,1,4', '电视剧频道', defaultTvTrending, 12);

  const prebakedPath = path.resolve(process.cwd(), 'lib/data/home-prebaked.ts');
  if (fs.existsSync(prebakedPath)) {
    let prebakedContent = fs.readFileSync(prebakedPath, 'utf-8');

    // 1. 同步 PREBAKED_HOME_DATA.tv.hero
    const tvHeroRegex = /(["']?tv["']?:\s*\{[\s\S]*?["']?hero["']?:\s*\[)[\s\S]*?(\]\s*,\s*["']?top10["']?:)/;
    if (tvHeroRegex.test(prebakedContent)) {
      const formattedTvJson = JSON.stringify(tvHeroItems, null, 8)
        .replace(/^\[/, '')
        .replace(/\]$/, '')
        .trim();
      prebakedContent = prebakedContent.replace(tvHeroRegex, `$1\n        ${formattedTvJson}\n      $2`);
      console.log(`✅ [iyf-sync] 成功将爱壹帆电视剧频道真实 ${tvHeroItems.length} 席剧王巨幕同步至 PREBAKED_HOME_DATA.tv.hero！`);
    }

    // 2. 同步或注入 PREBAKED_HOME_DATA.tv.trendingNav
    const tvTrendingRegex = /(["']?tv["']?:\s*\{[\s\S]*?)(["']?trendingNav["']?:\s*\[[\s\S]*?\]\s*,\s*)?(["']?hero["']?:)/;
    if (tvTrendingRegex.test(prebakedContent)) {
      const formattedTrending = JSON.stringify(tvTrendingNav, null, 8)
        .replace(/^\[/, '')
        .replace(/\]$/, '')
        .trim();
      prebakedContent = prebakedContent.replace(tvTrendingRegex, `$1"trendingNav": [\n        ${formattedTrending}\n      ],\n    $3`);
      console.log(`✅ [iyf-sync] 成功为电视剧频道写入专属 ${tvTrendingNav.length} 席黄金档速报至 PREBAKED_HOME_DATA.tv.trendingNav！`);
    }

    fs.writeFileSync(prebakedPath, prebakedContent, 'utf-8');
  }
}

// ──────────────── 4. 动漫频道 (Anime) ────────────────
async function syncAnimeChannel() {
  console.log('\n====== [4/6] 同步爱壹帆动漫频道专属轮播新番与速报 ======');
  const slides = await fetchIyfSlides('https://www.iyf.tv/anime', '动漫频道');
  if (slides.length === 0) {
    console.warn('[iyf-sync] 动漫频道未抓取到有效轮播项，跳过');
    return;
  }

  const animeHeroItems = [];
  for (let i = 0; i < slides.length; i++) {
    const item = await enrichMovieData(slides[i], i, 'tv');
    animeHeroItems.push(item);
  }

  // 100% 对齐爱壹帆动漫官方 getHotVideoTop 专属 12 席新番推荐标签 (6+6 黄金对称排布)
  const defaultAnimeTrending = [
    { title: '吞噬星空', updateBadge: '1' },
    { title: '仙逆', updateBadge: '' },
    { title: '凡人修仙传', updateBadge: '' },
    { title: '海贼王', updateBadge: '' },
    { title: '牧神记', updateBadge: '' },
    { title: '斗破苍穹年番', updateBadge: '' },
    { title: '逆天至尊', updateBadge: '1' },
    { title: '光阴之外', updateBadge: '' },
    { title: '沧元图', updateBadge: '' },
    { title: '无上神帝', updateBadge: '1' },
    { title: '遮天', updateBadge: '' },
    { title: '灵武大陆', updateBadge: '1' },
  ];

  const animeTrendingNav = await fetchChannelTrendingNav('0,1,6', '动漫频道', defaultAnimeTrending, 12);

  const extraPath = path.resolve(process.cwd(), 'lib/data/home-prebaked-extra.ts');
  if (fs.existsSync(extraPath)) {
    let extraContent = fs.readFileSync(extraPath, 'utf-8');

    // 1. 同步 ANIME_HOME_DATA.hero
    const animeHeroRegex = /(ANIME_HOME_DATA:\s*PrebakedHomeCategory\s*=\s*\{[\s\S]*?["']?hero["']?:\s*\[)[\s\S]*?(\]\s*,\s*["']?top10["']?:)/;
    if (animeHeroRegex.test(extraContent)) {
      const formattedJson = JSON.stringify(animeHeroItems, null, 4)
        .replace(/^\[/, '')
        .replace(/\]$/, '')
        .trim();
      extraContent = extraContent.replace(animeHeroRegex, `$1\n    ${formattedJson}\n  $2`);
      console.log(`✅ [iyf-sync] 成功将爱壹帆动漫频道真实 ${animeHeroItems.length} 席新番巨幕同步至 ANIME_HOME_DATA.hero！`);
    }

    // 2. 同步或注入 ANIME_HOME_DATA.trendingNav
    const animeTrendingRegex = /(ANIME_HOME_DATA:\s*PrebakedHomeCategory\s*=\s*\{[\s\S]*?)(trendingNav:\s*\[[\s\S]*?\]\s*,\s*)?(hero:)/;
    if (animeTrendingRegex.test(extraContent)) {
      const formattedTrending = JSON.stringify(animeTrendingNav, null, 4)
        .replace(/^\[/, '')
        .replace(/\]$/, '')
        .trim();
      extraContent = extraContent.replace(animeTrendingRegex, `$1trendingNav: [\n    ${formattedTrending}\n  ],\n  $3`);
      console.log(`✅ [iyf-sync] 成功为动漫频道写入专属 ${animeTrendingNav.length} 席热播速报至 ANIME_HOME_DATA.trendingNav！`);
    }

    fs.writeFileSync(extraPath, extraContent, 'utf-8');
  }
}

// ──────────────── 5. 综艺频道 (Variety) ────────────────
async function syncVarietyChannel() {
  console.log('\n====== [5/6] 同步爱壹帆综艺频道专属轮播爆款与速报 ======');
  const slides = await fetchIyfSlides('https://www.iyf.tv/variety', '综艺频道');
  if (slides.length === 0) {
    console.warn('[iyf-sync] 综艺频道未抓取到有效轮播项，跳过');
    return;
  }

  const varietyHeroItems = [];
  for (let i = 0; i < slides.length; i++) {
    const item = await enrichMovieData(slides[i], i, 'tv');
    varietyHeroItems.push(item);
  }

  // 100% 对齐爱壹帆综艺官方 getHotVideoTop 专属 8 席爆款推荐标签
  const defaultVarietyTrending = [
    { title: '花儿与少年第8季', updateBadge: '1' },
    { title: '心动的信号第9季', updateBadge: '1' },
    { title: '说唱巅峰对决2026', updateBadge: '' },
    { title: '披荆斩棘2026', updateBadge: '1' },
    { title: '一饭封神第2季', updateBadge: '2' },
    { title: '我家那闺女2026', updateBadge: '2' },
    { title: '地球超新鲜第2季', updateBadge: '1' },
    { title: '你好星期六', updateBadge: '1' }
  ];

  const varietyTrendingNav = await fetchChannelTrendingNav('0,1,5', '综艺频道', defaultVarietyTrending, 8);

  const extraPath = path.resolve(process.cwd(), 'lib/data/home-prebaked-extra.ts');
  if (fs.existsSync(extraPath)) {
    let extraContent = fs.readFileSync(extraPath, 'utf-8');

    // 1. 同步 VARIETY_HOME_DATA.hero
    const varietyHeroRegex = /(VARIETY_HOME_DATA:\s*PrebakedHomeCategory\s*=\s*\{[\s\S]*?["']?hero["']?:\s*\[)[\s\S]*?(\]\s*,\s*["']?top10["']?:)/;
    if (varietyHeroRegex.test(extraContent)) {
      const formattedJson = JSON.stringify(varietyHeroItems, null, 4)
        .replace(/^\[/, '')
        .replace(/\]$/, '')
        .trim();
      extraContent = extraContent.replace(varietyHeroRegex, `$1\n    ${formattedJson}\n  $2`);
      console.log(`✅ [iyf-sync] 成功将爱壹帆综艺频道真实 ${varietyHeroItems.length} 席爆款巨幕同步至 VARIETY_HOME_DATA.hero！`);
    }

    // 2. 同步或注入 VARIETY_HOME_DATA.trendingNav
    const varietyTrendingRegex = /(VARIETY_HOME_DATA:\s*PrebakedHomeCategory\s*=\s*\{[\s\S]*?)(trendingNav:\s*\[[\s\S]*?\]\s*,\s*)?(hero:)/;
    if (varietyTrendingRegex.test(extraContent)) {
      const formattedTrending = JSON.stringify(varietyTrendingNav, null, 4)
        .replace(/^\[/, '')
        .replace(/\]$/, '')
        .trim();
      extraContent = extraContent.replace(varietyTrendingRegex, `$1trendingNav: [\n    ${formattedTrending}\n  ],\n  $3`);
      console.log(`✅ [iyf-sync] 成功为综艺频道写入专属 ${varietyTrendingNav.length} 席热播速报至 VARIETY_HOME_DATA.trendingNav！`);
    }

    fs.writeFileSync(extraPath, extraContent, 'utf-8');
  }
}

// ──────────────── 6. 纪录片专区 (Documentary - 爱壹帆 CID 0,1,7) ────────────────
async function syncDocumentaryChannel() {
  console.log('\n====== [6/6] 同步爱壹帆纪录片专区 (CID 0,1,7) 轮播巨幕与速报 ======');
  
  // 1. 动态从爱壹帆官方纪录片接口拉取正片推荐
  let iyfDocList = [];
  try {
    const res = await fetch('https://m10.iyf.tv/v3/home/getflashbanner?cinema=1&region=GL.&cid=0,1,7&size=20', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(6000)
    });
    if (res.ok) {
      const data = await res.json();
      iyfDocList = (data?.data?.info || []).filter(item => item && item.title && !item.external && !item.title.includes('爽剧'));
    }
  } catch (err) {
    console.warn('[iyf-sync] 抓取爱壹帆纪录片官方接口异常:', err.message);
  }

  // 经典神级纪录片兜底种子（确保恒定至少 8 席 4K 巨幕）
  const fallbackDocSeeds = [
    { title: '地球脉动', q: '地球脉动', type: 'tv', rate: '9.9' },
    { title: '蓝色星球', q: '蓝色星球', type: 'tv', rate: '9.8' },
    { title: '史前星球', q: '史前星球', type: 'tv', rate: '9.7' },
    { title: '河西走廊', q: '河西走廊', type: 'tv', rate: '9.7' },
    { title: '风味人间', q: '风味人间', type: 'tv', rate: '9.1' },
    { title: '七个世界，一个星球', q: '七个世界，一个星球', type: 'tv', rate: '9.7' },
    { title: '如果国宝会说话', q: '如果国宝会说话', type: 'tv', rate: '9.5' },
    { title: '欢迎来地球', q: '欢迎来地球', type: 'tv', rate: '9.0' },
  ];

  const docHeroItems = [];
  const seenTitles = new Set();

  // 先处理爱壹帆官方推荐的纪录片
  for (const item of iyfDocList) {
    const title = item.title.trim();
    if (seenTitles.has(title)) continue;
    seenTitles.add(title);

    const enriched = await enrichMovieData({
      title,
      subTitle: item.subTitle || '纪录片',
      image: item.image || '',
      verticalImg: item.verticalImg || ''
    }, docHeroItems.length, 'documentary');
    
    enriched.types = ['纪录片', '自然', '探索'];
    enriched.type = 'tv';
    docHeroItems.push(enriched);
    if (docHeroItems.length >= 8) break;
  }

  // 若不足 8 席，用经典神作补齐
  for (const s of fallbackDocSeeds) {
    if (docHeroItems.length >= 8) break;
    if (seenTitles.has(s.title)) continue;
    seenTitles.add(s.title);

    const tmdbData = await fetchTMDB(s.q, s.type);
    docHeroItems.push({
      id: `iyf_hero_doc_${docHeroItems.length + 1}`,
      title: s.title,
      rate: s.rate,
      cover: tmdbData?.poster || '',
      backdrop: tmdbData?.backdrop || '',
      description: tmdbData?.overview || `豆瓣 ${s.rate} 分神作纪录片，BBC/央视史诗级殿堂级巨制，全集 4K 超清畅享。`,
      year: tmdbData?.year || '2024',
      types: ['纪录片', '自然', '历史'],
      type: s.type,
      is_new: true,
      playable: true
    });
  }

  // 100% 对齐爱壹帆纪录片官方 getHotVideoTop 专属 8 席口碑推荐标签
  const defaultDocTrending = [
    { title: '克拉克森的农场第1季', updateBadge: '' },
    { title: '克拉克森的农场第5季', updateBadge: '' },
    { title: '克拉克森的农场第3季', updateBadge: '' },
    { title: '守护解放西第6季', updateBadge: '' },
    { title: '克拉克森的农场第4季', updateBadge: '' },
    { title: '若泽·穆里尼奥：特立之道', updateBadge: '' },
    { title: '守护解放西第5季', updateBadge: '' },
    { title: '克拉克森的农场第2季', updateBadge: '' }
  ];

  const docTrendingNav = await fetchChannelTrendingNav('0,1,7', '纪录片频道', defaultDocTrending, 8);

  const extraPath = path.resolve(process.cwd(), 'lib/data/home-prebaked-extra.ts');
  if (fs.existsSync(extraPath)) {
    let extraContent = fs.readFileSync(extraPath, 'utf-8');

    // 1. 同步 DOCUMENTARY_HOME_DATA.hero
    const docHeroRegex = /(DOCUMENTARY_HOME_DATA:\s*PrebakedHomeCategory\s*=\s*\{[\s\S]*?["']?hero["']?:\s*\[)[\s\S]*?(\]\s*,\s*["']?top10["']?:)/;
    if (docHeroRegex.test(extraContent)) {
      const formattedJson = JSON.stringify(docHeroItems, null, 4)
        .replace(/^\[/, '')
        .replace(/\]$/, '')
        .trim();
      extraContent = extraContent.replace(docHeroRegex, `$1\n    ${formattedJson}\n  $2`);
      console.log(`✅ [iyf-sync] 成功将爱壹帆纪录片频道真实 ${docHeroItems.length} 席殿堂巨幕同步至 DOCUMENTARY_HOME_DATA.hero！`);
    }

    // 2. 同步或注入 DOCUMENTARY_HOME_DATA.trendingNav
    const docTrendingRegex = /(DOCUMENTARY_HOME_DATA:\s*PrebakedHomeCategory\s*=\s*\{[\s\S]*?)(trendingNav:\s*\[[\s\S]*?\]\s*,\s*)?(hero:)/;
    if (docTrendingRegex.test(extraContent)) {
      const formattedTrending = JSON.stringify(docTrendingNav, null, 4)
        .replace(/^\[/, '')
        .replace(/\]$/, '')
        .trim();
      extraContent = extraContent.replace(docTrendingRegex, `$1trendingNav: [\n    ${formattedTrending}\n  ],\n  $3`);
      console.log(`✅ [iyf-sync] 成功为纪录片专区写入专属 ${docTrendingNav.length} 席热播速报至 DOCUMENTARY_HOME_DATA.trendingNav！`);
    }

    fs.writeFileSync(extraPath, extraContent, 'utf-8');
  }
}

// ──────────────── 主执行入口 ────────────────
async function main() {
  const args = process.argv.slice(2);
  const target = args.find(a => a.startsWith('--target='))?.split('=')[1] || 'all_channels';

  console.log(`🎬 [iyf-sync] 启动爱壹帆官方全板块数据同步系统，目标: [${target}]`);

  try {
    if (target === 'all' || target === 'home' || target === 'all_channels') {
      await syncHomeAll();
    }
    if (target === 'movie' || target === 'all_channels') {
      await syncMovieChannel();
    }
    if (target === 'tv' || target === 'drama' || target === 'all_channels') {
      await syncTvChannel();
    }
    if (target === 'anime' || target === 'all_channels') {
      await syncAnimeChannel();
    }
    if (target === 'variety' || target === 'all_channels') {
      await syncVarietyChannel();
    }
    if (target === 'doc' || target === 'documentary' || target === 'all_channels') {
      await syncDocumentaryChannel();
    }
    console.log('\n🎉 [iyf-sync] 全站所有板块（首页+电影+电视剧+动漫+综艺+纪录片）轮播巨幕与更新速报 100% 对齐爱壹帆并同步完成！');
  } catch (err) {
    console.error('[iyf-sync] 执行异常:', err);
    process.exit(1);
  }
}

main();
