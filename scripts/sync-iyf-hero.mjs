import fs from 'fs';
import path from 'path';

/**
 * 每日全自动同步爱壹帆 (iyf.tv) 首页顶级轮播图
 * 
 * 机制：
 * 1. 抓取 iyf.tv 官方实时 8 席轮播巨幕
 * 2. 智能剔除商业广告位与外链导流
 * 3. 并发通过 TMDB / 豆瓣 / 官方宣发源补齐 4K 横版剧照 (backdrop)、高清海报、剧情简介与评分
 * 4. 自动更新到 lib/data/home-prebaked.ts 首页预热数据库
 */

const TMDB_API_KEY = '82eaf0e14803590730e45c2123c90957';
const TMDB_BASE = 'https://api.themoviedb.org/3';

async function fetchTMDB(query, type = 'movie') {
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

async function fetchIyfHeroSlides() {
  console.log('[iyf-sync] 正在向 https://www.iyf.tv/ 请求最新轮播图数据...');
  const res = await fetch('https://www.iyf.tv/', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
    }
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch iyf.tv homepage, HTTP ${res.status}`);
  }
  const html = await res.text();
  const match = html.match(/var\s+injectJson\s*=\s*(\{[\s\S]*?\});/);
  if (!match) {
    throw new Error('Unable to locate injectJson in iyf.tv HTML');
  }

  const json = JSON.parse(match[1]);
  const slideKey = Object.keys(json).find(k => k.startsWith('slide-list'));
  if (!slideKey || !Array.isArray(json[slideKey])) {
    throw new Error('Slide list not found in injectJson');
  }

  const rawSlides = json[slideKey];
  console.log(`[iyf-sync] 获取到原始轮播项 ${rawSlides.length} 个`);

  // 严格过滤广告、外链与无意义推广
  const validMovies = rawSlides.filter(s => {
    if (!s || !s.title) return false;
    // 排除外链广告或特定推广
    if (s.external || s.url?.includes('ppt.iyf.tv') || s.isTop) return false;
    if (s.title.includes('爽剧') || s.title.includes('短剧开启') || s.title.includes('广告')) return false;
    return true;
  });

  console.log(`[iyf-sync] 过滤广告后保留 ${validMovies.length} 个正片项:`, validMovies.map(m => m.title));
  return validMovies;
}

async function enrichMovieData(slideItem, index) {
  const title = slideItem.title.trim();
  const subTitle = slideItem.subTitle || '';
  // 精确区分：若包含“电影”则必为电影；若包含“集”或“季”则必为连续剧
  const isMovie = subTitle.includes('电影');
  const isSeries = !isMovie && (subTitle.includes('集') || subTitle.includes('季') || subTitle.includes('电视剧') || subTitle.includes('连载'));
  const contentType = isSeries ? 'tv' : 'movie';

  console.log(`[iyf-sync] 正在补全元数据 [${contentType}]: ${title} (${subTitle})`);

  // 1. 尝试从 TMDB 获取官方大剧照与详情
  const tmdbData = await fetchTMDB(title, contentType);

  // 2. 确定最佳图片（优先 TMDB 4K 宽屏 backdrop，若无则使用 iyf 官方设计师定制海报）
  const backdrop = tmdbData?.backdrop || slideItem.image || '';
  const cover = tmdbData?.poster || slideItem.verticalImg || slideItem.image || '';
  const rate = tmdbData?.rate || '8.8';
  const year = tmdbData?.year || '2026';
  const description = tmdbData?.overview || `《${title}》由爱壹帆实时高分精选推荐，全集高清极速秒播。${subTitle ? `当前状态：${subTitle}。` : ''}`;

  // 提取分类标签
  let types = ['热门'];
  if (subTitle.includes('剧情')) types.push('剧情');
  if (subTitle.includes('动画')) types.push('动画');
  if (subTitle.includes('喜剧')) types.push('喜剧');
  if (subTitle.includes('动作')) types.push('动作');
  if (subTitle.includes('悬疑') || subTitle.includes('警')) types.push('悬疑');
  if (isSeries) types.push('连续剧');
  else types.push('电影');

  return {
    item: {
      id: `iyf_hero_${contentType}_${index + 1}`,
      title,
      rate,
      cover,
      backdrop,
      description,
      year,
      types: Array.from(new Set(types)),
      episodes_info: subTitle || undefined,
      is_new: true,
      playable: true
    },
    isSeries
  };
}

async function main() {
  try {
    const slides = await fetchIyfHeroSlides();
    if (slides.length === 0) {
      console.warn('[iyf-sync] 未抓取到有效轮播项，跳过更新');
      return;
    }

    const movieHeros = [];
    const tvHeros = [];

    for (let i = 0; i < slides.length; i++) {
      const { item, isSeries } = await enrichMovieData(slides[i], i);
      if (isSeries) {
        tvHeros.push(item);
      } else {
        movieHeros.push(item);
      }
    }

    console.log(`[iyf-sync] 成功整理出电影 Hero ${movieHeros.length} 部，电视剧 Hero ${tvHeros.length} 部`);

    // 读取现有 home-prebaked.ts
    const filePath = path.resolve(process.cwd(), 'lib/data/home-prebaked.ts');
    let fileContent = fs.readFileSync(filePath, 'utf-8');

    // 如果电影或电视剧单项不足 4 部，用混合列表补齐，保证各频道都有 6~8 部精美轮播
    const allHeros = [...movieHeros, ...tvHeros];
    const finalMovieHeros = movieHeros.length >= 4 ? movieHeros : allHeros.slice(0, 8);
    const finalTvHeros = tvHeros.length >= 4 ? tvHeros : allHeros.slice(0, 8);

    // 提取出整个 PREBAKED_HOME_DATA 赋值并在内存中替换 hero 字段
    // 采用正则精准替换 "hero": [ ... ]
    const replaceHeroSection = (sourceCode, categoryKey, newHeros) => {
      const categoryRegex = new RegExp(`("${categoryKey}":\\s*\\{[\\s\\S]*?"hero":\\s*\\[)[\\s\\S]*?(\\]\\s*,\\s*"top10")`);
      const formattedJson = JSON.stringify(newHeros, null, 8)
        .replace(/^\[/, '')
        .replace(/\]$/, '')
        .trim();
      return sourceCode.replace(categoryRegex, `$1\n        ${formattedJson}\n      $2`);
    };

    let updatedContent = replaceHeroSection(fileContent, 'movie', finalMovieHeros);
    updatedContent = replaceHeroSection(updatedContent, 'tv', finalTvHeros);

    if (updatedContent !== fileContent) {
      fs.writeFileSync(filePath, updatedContent, 'utf-8');
      console.log('✅ [iyf-sync] 成功将爱壹帆最新轮播巨幕更新至 lib/data/home-prebaked.ts！');
    } else {
      console.log('[iyf-sync] 轮播内容未变动或匹配区已是最优');
    }
  } catch (err) {
    console.error('[iyf-sync] 执行异常:', err);
    process.exit(1);
  }
}

main();
