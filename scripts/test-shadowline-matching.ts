import assert from 'node:assert';
import {
  matchBestShadowLineCandidate,
  normalizeTitleForMatch,
  numToChinese,
  GzSearchResult,
} from '../lib/services/providers/gz-provider';

console.log('🧪 启动暗影专线「宁缺毋错」消歧匹配器单元测试...\n');

// 1. 测试数字季转中文数字及规范化
assert.strictEqual(numToChinese(1), '一');
assert.strictEqual(numToChinese(4), '四');
assert.strictEqual(numToChinese(11), '十一');
assert.strictEqual(normalizeTitleForMatch('无耻之徒(美版)  第十一季'), '无耻之徒第十一季');
assert.strictEqual(normalizeTitleForMatch('无耻之徒(美版)  第11季'), '无耻之徒第十一季');
assert.strictEqual(normalizeTitleForMatch('生化危机：爆发夜'), '生化危机爆发夜');
assert.strictEqual(normalizeTitleForMatch('生化危机：爆发夜TC'), '生化危机爆发夜tc');
assert.strictEqual(normalizeTitleForMatch('请回答1988'), '请回答1988');
console.log('✅ [测试 1/6] 标题规范化、全角半角转换与数字季归一化测试通过！');

// 2. 测试凡人修仙传：真人版 vs 动漫版
const fanrenCandidates: GzSearchResult[] = [
  {
    vod_id: 'gz_fanren_anime',
    title: '凡人修仙传',
    year: '2020',
    tags: ['动漫'],
    d_type: '30',
    episodesCount: 193,
  },
  {
    vod_id: 'gz_fanren_drama',
    title: '凡人修仙传剧版',
    year: '2025',
    tags: ['连续剧'],
    d_type: '2',
    actors: '杨洋, 金晨, 汪铎',
    episodesCount: 30,
  },
  {
    vod_id: 'gz_fanren_remake',
    title: '凡人修仙传重制版',
    year: '2021',
    tags: ['动漫'],
    d_type: '30',
    episodesCount: 21,
  },
  {
    vod_id: 'gz_fanren_yanjiabao',
    title: '凡人修仙传之燕家堡之战',
    year: '2021',
    tags: ['动漫'],
    d_type: '30',
    episodesCount: 4,
  },
];

// 2.1 真人版（连续剧，2025，30集，主演杨洋）
const liveMatch = matchBestShadowLineCandidate(fanrenCandidates, {
  title: '凡人修仙传',
  category: 'tv',
  year: 2025,
  expectedEpisodes: 30,
  actors: '杨洋',
});
assert.strictEqual(liveMatch?.vod_id, 'gz_fanren_drama', '真人版凡人修仙传必须精准匹配到剧版');

// 2.2 动漫版（2020，动漫）
const animeMatch = matchBestShadowLineCandidate(fanrenCandidates, {
  title: '凡人修仙传',
  category: 'anime',
  year: 2020,
  expectedEpisodes: 193,
});
assert.strictEqual(animeMatch?.vod_id, 'gz_fanren_anime', '动漫版凡人修仙传必须精准匹配到动漫条目');
console.log('✅ [测试 2/6] 《凡人修仙传》真人剧与动漫严格隔离测试通过！');

// 3. 测试三体：腾讯连续剧版 / Netflix版 / 动画版 / 电影解说版
const santiCandidates: GzSearchResult[] = [
  {
    vod_id: 'santi_tx',
    title: '三体',
    year: '2023',
    tags: ['连续剧'],
    d_type: '2',
    actors: '张鲁一, 于和伟, 陈瑾, 王子文',
    episodesCount: 30,
  },
  {
    vod_id: 'santi_netflix',
    title: '三体第一季',
    year: '2024',
    tags: ['连续剧'],
    d_type: '2',
    actors: '本尼迪克特·王, 艾莎·冈萨雷斯',
    episodesCount: 8,
  },
  {
    vod_id: 'santi_anime',
    title: '三体动画版',
    year: '2022',
    tags: ['动漫'],
    d_type: '30',
    episodesCount: 15,
  },
  {
    vod_id: 'santi_commentary',
    title: '三体解说版',
    year: '2023',
    tags: ['电影'],
    d_type: '1',
    episodesCount: 1,
  },
];

// 3.1 连续剧 2023 年 30 集 -> 腾讯版
const txMatch = matchBestShadowLineCandidate(santiCandidates, {
  title: '三体',
  category: 'tv',
  year: 2023,
  expectedEpisodes: 30,
});
assert.strictEqual(txMatch?.vod_id, 'santi_tx', '2023年30集三体应匹配腾讯版');

// 3.2 连续剧 2024 年 8 集 -> Netflix 版（三体第一季）
const netflixMatch = matchBestShadowLineCandidate(santiCandidates, {
  title: '三体',
  category: 'tv',
  year: 2024,
  expectedEpisodes: 8,
});
assert.strictEqual(netflixMatch?.vod_id, 'santi_netflix', '2024年8集三体应匹配Netflix版(三体第一季)');

// 3.3 动漫 2022 年 15 集 -> 三体动画版
const santiAnimeMatch = matchBestShadowLineCandidate(santiCandidates, {
  title: '三体',
  category: 'anime',
  year: 2022,
  expectedEpisodes: 15,
});
assert.strictEqual(santiAnimeMatch?.vod_id, 'santi_anime', '2022年15集动漫应匹配三体动画版');

// 3.4 电影 -> 只有解说版，必须淘汰返回 null
const santiMovieMatch = matchBestShadowLineCandidate(santiCandidates, {
  title: '三体',
  category: 'movie',
  year: 2023,
});
assert.strictEqual(santiMovieMatch, null, '电影三体只有解说版，必须宁缺毋错返回 null');
console.log('✅ [测试 3/6] 《三体》多版本（腾讯版/网飞版/动画版/解说淘汰）测试通过！');

// 4. 恶搞之家第4季（2005）
const familyGuyCandidates: GzSearchResult[] = [
  {
    vod_id: 'fg_s2',
    title: '恶搞之家 第二季',
    year: '1999',
    tags: ['动漫'],
    d_type: '30',
    episodesCount: 21,
  },
  {
    vod_id: 'fg_s4',
    title: '恶搞之家第四季',
    year: '2005',
    tags: ['动漫'],
    d_type: '30',
    episodesCount: 30,
  },
];
const fgMatch = matchBestShadowLineCandidate(familyGuyCandidates, {
  title: '恶搞之家',
  season: 4,
  year: 2005,
  category: 'anime',
});
assert.strictEqual(fgMatch?.vod_id, 'fg_s4', '恶搞之家第4季必须匹配第四季，严禁跨季错选第二季');
console.log('✅ [测试 4/6] 《恶搞之家》跨季防串线测试通过！');

// 5. 无耻之徒(美版) 第十一季
const shamelessCandidates: GzSearchResult[] = [
  {
    vod_id: 'shameless_11',
    title: '无耻之徒(美版)  第十一季',
    year: '2020',
    tags: ['连续剧'],
    d_type: '2',
    episodesCount: 12,
  },
  {
    vod_id: 'shameless_1',
    title: '无耻之徒第一季',
    year: '2011',
    tags: ['连续剧'],
    d_type: '2',
    episodesCount: 12,
  },
];
const shamelessMatch = matchBestShadowLineCandidate(shamelessCandidates, {
  title: '无耻之徒',
  season: 11,
  year: 2020,
  category: 'tv',
});
assert.strictEqual(shamelessMatch?.vod_id, 'shameless_11', '无耻之徒第11季必须准确匹配');
console.log('✅ [测试 5/6] 复杂别名与带括号外语版本《无耻之徒(美版) 第十一季》测试通过！');

// 6. 发布标签剥离与年份保护：《生化危机：爆发夜TC》与《请回答1988》
const tagCandidates: GzSearchResult[] = [
  {
    vod_id: 're_outbreak_tc',
    title: '生化危机：爆发夜TC',
    year: '2024',
    tags: ['电影'],
    d_type: '1',
    episodesCount: 1,
  },
  {
    vod_id: 'reply_1988',
    title: '请回答1988',
    year: '2015',
    tags: ['连续剧'],
    d_type: '2',
    episodesCount: 20,
  },
];

const reMatch = matchBestShadowLineCandidate([tagCandidates[0]], {
  title: '生化危机：爆发夜',
  category: 'movie',
  year: 2024,
});
assert.strictEqual(reMatch?.vod_id, 're_outbreak_tc', '发布标签TC应被单次剥离并成功匹配正片');

const replyMatch = matchBestShadowLineCandidate([tagCandidates[1]], {
  title: '请回答1988',
  category: 'tv',
  year: 2015,
  expectedEpisodes: 20,
});
assert.strictEqual(replyMatch?.vod_id, 'reply_1988', '片名本身以年份结尾的《请回答1988》绝不能被误删年份');
console.log('✅ [测试 6/6] 发布标签剥离与《请回答1988》年份保护测试通过！');

console.log('\n🎉 恭喜！暗影专线「宁缺毋错」所有 6 大真实用例单元测试 100% 验证通过！');
