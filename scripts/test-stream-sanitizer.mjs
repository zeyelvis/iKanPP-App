import assert from 'node:assert';
import { sanitizeStreamUrl, sanitizeStreamContent } from '../lib/utils/stream-sanitizer.ts';

console.log('🧪 开始执行播放域名防污染热修复测试...');

// 1. 测试单 URL 替换
const testCases = [
  {
    input: 'https://s1.fengbao9.com/20240501/1234_abcdef/index.m3u8',
    expected: 'https://v.baofeng9.com/20240501/1234_abcdef/index.m3u8',
    desc: 's1.fengbao9.com -> v.baofeng9.com',
  },
  {
    input: 'http://s1.fengbao9.com:8080/vod/play.m3u8',
    expected: 'http://v.baofeng9.com:8080/vod/play.m3u8',
    desc: '带端口号的 s1.fengbao9.com 替换',
  },
  {
    input: 'https://v10.baofeng10.com/hls/test.m3u8',
    expected: 'https://v.fengbao10.com/hls/test.m3u8',
    desc: 'v10.baofeng10.com -> v.fengbao10.com',
  },
  {
    input: 'https://v.baofeng10.com/hls/test.m3u8',
    expected: 'https://v.fengbao10.com/hls/test.m3u8',
    desc: 'v.baofeng10.com -> v.fengbao10.com',
  },
  {
    input: 'https://v.baofeng9.com/2024/index.m3u8',
    expected: 'https://v.baofeng9.com/2024/index.m3u8',
    desc: '官方未污染新域名保持原样',
  },
  {
    input: 'https://api.guangsuapi.com/vod.m3u8',
    expected: 'https://api.guangsuapi.com/vod.m3u8',
    desc: '其他无害源站 CDN 域名不受任何影响',
  },
];

for (const tc of testCases) {
  const result = sanitizeStreamUrl(tc.input);
  assert.strictEqual(result, tc.expected, `❌ 测试失败: ${tc.desc}`);
  console.log(`✅ [通过] ${tc.desc}: \n   ${tc.input} ➔ ${result}`);
}

// 2. 测试 M3U8 清单内容替换
const mockM3u8 = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:10
#EXTINF:6.400,
https://s1.fengbao9.com/202401/seg1.ts
#EXTINF:6.400,
https://v10.baofeng10.com/202401/seg2.ts
#EXTINF:6.400,
https://v.baofeng10.com/202401/seg3.ts
#EXT-X-ENDLIST`;

const sanitizedM3u8 = sanitizeStreamContent(mockM3u8);
assert(sanitizedM3u8.includes('https://v.baofeng9.com/202401/seg1.ts'));
assert(sanitizedM3u8.includes('https://v.fengbao10.com/202401/seg2.ts'));
assert(sanitizedM3u8.includes('https://v.fengbao10.com/202401/seg3.ts'));
assert(!sanitizedM3u8.includes('s1.fengbao9.com'));
assert(!sanitizedM3u8.includes('v10.baofeng10.com'));
assert(!sanitizedM3u8.includes('v.baofeng10.com'));

console.log('✅ [通过] M3U8 文本批量域名清洗测试完全通过！');
console.log('🎉 所有防污染测试全部通过！');
