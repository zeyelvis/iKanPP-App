import { normalizeVideoType } from '../lib/utils/taxonomy.ts';

const testCases = [
  // 电视剧
  { input: '国产剧', name: '狂飙', expectedBadge: '国产剧', expectedCategory: 'tv' },
  { input: '大陆剧', name: '庆余年', expectedBadge: '国产剧', expectedCategory: 'tv' },
  { input: '华语电视剧', name: '繁花', expectedBadge: '国产剧', expectedCategory: 'tv' },
  { input: '连续剧', name: '武林外传', expectedBadge: '电视剧', expectedCategory: 'tv' },
  { input: '国产', name: '三体', expectedBadge: '国产剧', expectedCategory: 'tv' },
  { input: '美剧', name: '怪奇物语', expectedBadge: '美剧', expectedCategory: 'tv' },
  { input: '欧美剧', name: '权力的游戏', expectedBadge: '美剧', expectedCategory: 'tv' },
  { input: '韩剧', name: '黑暗荣耀', expectedBadge: '韩剧', expectedCategory: 'tv' },
  { input: '日剧', name: '半泽直树', expectedBadge: '日剧', expectedCategory: 'tv' },
  { input: '港剧', name: '新闻女王', expectedBadge: '港剧', expectedCategory: 'tv' },
  { input: 'TVB', name: '使徒行者', expectedBadge: '港剧', expectedCategory: 'tv' },
  { input: '台剧', name: '想见你', expectedBadge: '台剧', expectedCategory: 'tv' },

  // 动漫
  { input: '国漫', name: '斗破苍穹', expectedBadge: '国漫', expectedCategory: 'guoman' },
  { input: '国产动漫', name: '凡人修仙传', expectedBadge: '国漫', expectedCategory: 'guoman' },
  { input: '国创', name: '完美世界', expectedBadge: '国漫', expectedCategory: 'guoman' },
  { input: '日漫', name: '鬼灭之刃', expectedBadge: '新番', expectedCategory: 'anime' },
  { input: '新番', name: '咒术回战', expectedBadge: '新番', expectedCategory: 'anime' },
  { input: '日本动漫', name: '火影忍者', expectedBadge: '新番', expectedCategory: 'anime' },

  // 电影
  { input: '动作片', name: '疾速追杀4', expectedBadge: '动作', expectedCategory: 'movie' },
  { input: '动作', name: '战狼2', expectedBadge: '动作', expectedCategory: 'movie' },
  { input: '科幻片', name: '流浪地球2', expectedBadge: '科幻', expectedCategory: 'movie' },
  { input: '喜剧片', name: '热辣滚烫', expectedBadge: '喜剧', expectedCategory: 'movie' },
  { input: '悬疑片', name: '消失的她', expectedBadge: '悬疑', expectedCategory: 'movie' },
  { input: '动画片', name: '哪吒之魔童闹海', expectedBadge: '动画', expectedCategory: 'movie' },
  { input: '电影', name: '奥本海默', expectedBadge: '电影', expectedCategory: 'movie' },

  // 综艺
  { input: '综艺', name: '奔跑吧', expectedBadge: '综艺', expectedCategory: 'variety' },
  { input: '大陆综艺', name: '歌手2025', expectedBadge: '综艺', expectedCategory: 'variety' },
  { input: '真人秀', name: '极速前进', expectedBadge: '真人秀', expectedCategory: 'variety' },
  { input: '脱口秀', name: '脱口秀和Ta的朋友们', expectedBadge: '脱口秀', expectedCategory: 'variety' },

  // 纪录片与短剧
  { input: '纪录片', name: '舌尖上的中国', expectedBadge: '纪录片', expectedCategory: 'documentary' },
  { input: '短剧', name: '我在八零年代当后妈', expectedBadge: '短剧', expectedCategory: 'short' },

  // 噪音词自动修复与兜底
  { input: '4K', name: '庆余年 第二季', expectedBadge: '电视剧', expectedCategory: 'tv' },
  { input: '蓝光', name: '封神第一部', expectedBadge: '电影', expectedCategory: 'movie' },
  { input: '极速', name: '长相思 第1集', expectedBadge: '电视剧', expectedCategory: 'tv' },
];

let passed = 0;
let failed = 0;

for (const tc of testCases) {
  const result = normalizeVideoType(tc.input, tc.name);
  const badgeMatch = result.badge === tc.expectedBadge;
  const catMatch = result.category === tc.expectedCategory;

  if (badgeMatch && catMatch) {
    passed++;
  } else {
    failed++;
    console.error(`❌ FAILED: input="${tc.input}", name="${tc.name}" -> got badge="${result.badge}", category="${result.category}" | expected badge="${tc.expectedBadge}", category="${tc.expectedCategory}"`);
  }
}

console.log(`\n🎉 Taxonomy Verification: ${passed}/${testCases.length} PASSED!`);
if (failed > 0) {
  process.exit(1);
}
