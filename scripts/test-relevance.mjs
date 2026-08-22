import { calculateRelevanceScore, extractCleanBaseTitle } from '../lib/utils/search.ts';

const query = '狂飙';

const mockItems = [
  { vod_name: '狂飙之逃出生天', latency: 50, vod_remarks: 'HD' },
  { vod_name: '狂飙[全39集]', latency: 300, vod_remarks: '全39集' },
  { vod_name: '狂飙 2023', latency: 200, vod_remarks: '39集全' },
  { vod_name: '狂飙（国语版）', latency: 150, vod_remarks: '完结' },
  { vod_name: '狂飙：极限行动', latency: 80, vod_remarks: 'HD' },
  { vod_name: '狂飙极速', latency: 60, vod_remarks: '高清' },
  { vod_name: '新狂飙', latency: 100, vod_remarks: '正片' },
  { vod_name: '三体', latency: 50, vod_remarks: '全30集' },
];

console.log(`--- Query: "${query}" Relevance Scores ---`);

const scored = mockItems.map(item => ({
  ...item,
  cleanTitle: extractCleanBaseTitle(item.vod_name),
  score: calculateRelevanceScore(item, query),
})).sort((a, b) => {
  if (b.score !== a.score) return b.score - a.score;
  return a.latency - b.latency;
});

scored.forEach((item, index) => {
  console.log(`#${index + 1}: ${item.vod_name} (Clean: "${item.cleanTitle}", Score: ${item.score}, Latency: ${item.latency}ms)`);
});

// 验证第1、2、3名必须是原版狂飙
const top3Names = scored.slice(0, 3).map(s => s.cleanTitle);
const isTopAccurate = top3Names.every(name => name === '狂飙');

if (!isTopAccurate) {
  console.error('\n❌ FAILED: Top results are not original 狂飙 series!');
  process.exit(1);
} else {
  console.log('\n🎉 SUCCESS: Original 狂飙 completely dominates the top rankings!');
}
