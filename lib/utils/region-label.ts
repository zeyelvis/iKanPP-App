/** TMDB gives some regions in English ("China", "United States of America"). */
const REGION_ZH: Record<string, string> = {
  china: '中国大陆',
  "people's republic of china": '中国大陆',
  'hong kong': '中国香港',
  taiwan: '中国台湾',
  macao: '中国澳门',
  'united states of america': '美国',
  'united states': '美国',
  usa: '美国',
  us: '美国',
  'united kingdom': '英国',
  uk: '英国',
  japan: '日本',
  'south korea': '韩国',
  korea: '韩国',
  thailand: '泰国',
  singapore: '新加坡',
  malaysia: '马来西亚',
  india: '印度',
  france: '法国',
  germany: '德国',
  spain: '西班牙',
  italy: '意大利',
  canada: '加拿大',
  australia: '澳大利亚',
  russia: '俄罗斯',
  philippines: '菲律宾',
  indonesia: '印度尼西亚',
  vietnam: '越南',
};

/** The first region of a title, in Chinese; '' when it is neither Chinese nor a known name. */
export function regionLabel(region: string | null | undefined): string {
  if (!region) return '';
  const first = region.split(/[·,，、/|]/)[0].trim();
  if (/[一-龥]/.test(first)) return first;
  return REGION_ZH[first.toLowerCase()] || '';
}
