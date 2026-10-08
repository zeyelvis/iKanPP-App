/** 爱壹帆：各频道网页里内嵌的轮播（injectJson 的 slide-list）、轮播接口、热播榜接口。 */
const BROWSER_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36';

export interface IyfSlide {
  title: string;
  subTitle?: string;
}

const isFeature = (s: { title?: string; external?: boolean; url?: string; isTop?: boolean }) =>
  Boolean(s?.title) && !s.external && !s.url?.includes('ppt.iyf.tv') && !s.isTop && !/爽剧|短剧开启|广告/.test(s.title!);

/** 频道网页里的轮播（广告、外链、短剧推广不要）。 */
export async function pageSlides(url: string): Promise<IyfSlide[]> {
  const res = await fetch(url, { headers: { 'User-Agent': BROWSER_UA, 'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8' }, signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`${url} HTTP ${res.status}`);
  const html = await res.text();
  const m = html.match(/var\s+injectJson\s*=\s*(\{[\s\S]*?\});/);
  if (!m) throw new Error(`${url} 页面里没有 injectJson`);
  const json = JSON.parse(m[1]) as Record<string, unknown>;
  const key = Object.keys(json).find((k) => k.startsWith('slide-list'));
  const list = key && Array.isArray(json[key]) ? (json[key] as IyfSlide[]) : [];
  return list.filter(isFeature).map((s) => ({ title: s.title.trim(), subTitle: s.subTitle }));
}

/** 轮播接口（纪录片频道用）。 */
export async function bannerSlides(cid: string): Promise<IyfSlide[]> {
  const res = await fetch(`https://m10.iyf.tv/v3/home/getflashbanner?cinema=1&region=GL.&cid=${cid}&size=20`, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`getflashbanner HTTP ${res.status}`);
  const data = (await res.json()) as { data?: { info?: IyfSlide[] } };
  return (data.data?.info ?? []).filter(isFeature).map((s) => ({ title: s.title.trim(), subTitle: s.subTitle }));
}

export interface TrendingItem {
  title: string;
  updateBadge: string;
}

/** 热播标签：保留爱壹帆的更新角标（updateNumber，或 notifications）。 */
export async function hotTop(cid: string, count: number): Promise<TrendingItem[]> {
  const res = await fetch(`https://m10.iyf.tv/v3/list/getHotVideoTop?cinema=1&cid=${cid}&pageSize=${Math.max(12, count)}`, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`getHotVideoTop HTTP ${res.status}`);
  const data = (await res.json()) as { data?: { info?: Array<{ title?: string; external?: boolean; updateNumber?: number | string; notifications?: string }> } };
  const seen = new Set<string>();
  const items: TrendingItem[] = [];
  for (const it of data.data?.info ?? []) {
    const title = it?.title?.trim();
    if (!title || it.external || seen.has(title)) continue;
    seen.add(title);
    const badge = Number(it.updateNumber) > 0 ? String(it.updateNumber) : String(it.notifications ?? '').trim();
    items.push({ title, updateBadge: badge });
    if (items.length >= count) break;
  }
  return items;
}
