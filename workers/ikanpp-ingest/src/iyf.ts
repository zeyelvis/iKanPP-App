/** 爱壹帆：各频道网页里内嵌的轮播（injectJson 的 slide-list）、轮播接口、热播榜接口、最近上架。 */
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

// ── 带签名的列表接口（最近上架 GetLastAdd、排序列表 Search）：vv = md5(公钥&小写查询串&私钥)，
//    密钥取自 www.iyf.tv/list 的 pConfig，签名失效（401/403）时重取一次。

let keys: { pub: string; priv: string } | null = null;

/** Workers 的 crypto.subtle.digest 支持 MD5（非标准扩展）。 */
async function md5(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('MD5', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function refreshKeys() {
  const res = await fetch('https://www.iyf.tv/list', { headers: { 'User-Agent': BROWSER_UA, 'Accept-Language': 'zh-CN,zh;q=0.9' }, signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`iyf list HTTP ${res.status}`);
  const m = (await res.text()).match(/"pConfig":\s*(\{[^}]+\})/);
  if (!m) throw new Error('iyf list 页面里没有 pConfig');
  const p = JSON.parse(m[1]) as { publicKey?: string; privateKey?: string | string[] };
  const priv = Array.isArray(p.privateKey) ? p.privateKey[0] : p.privateKey;
  if (!p.publicKey || !priv) throw new Error('pConfig 缺少密钥');
  keys = { pub: p.publicKey, priv };
}

async function signedGet<T>(api: string, query: string): Promise<T> {
  const call = async () => {
    const vv = await md5(`${keys!.pub}&${query.toLowerCase()}&${keys!.priv}`);
    return fetch(`https://m10.iyf.tv/api/list/${api}?${query}&vv=${vv}&pub=${keys!.pub}`, {
      headers: { 'User-Agent': BROWSER_UA, Referer: 'https://www.iyf.tv/list' },
      signal: AbortSignal.timeout(10_000),
    });
  };
  if (!keys) await refreshKeys();
  let res = await call();
  if (res.status === 401 || res.status === 403) {
    await refreshKeys();
    res = await call();
  }
  if (!res.ok) throw new Error(`${api} HTTP ${res.status}`);
  return (await res.json()) as T;
}

/** 列表接口返回的作品（只列用得到的字段）。 */
export interface IyfListItem {
  title: string;
  year?: number;
  atypeName?: string;
  lastName?: string;
  regional?: string;
  vipResource?: string;
  addTime?: string;
  contxt?: string;
  isFilm?: boolean;
  score?: string;
  hot?: number;
}

const clean = (list: IyfListItem[] | undefined) => (list ?? []).filter((it) => it?.title?.trim()).map((it) => ({ ...it, title: it.title.trim() }));

/** 某频道最近上架的作品（每页 10 部）。 */
export async function lastAdd(cid: string, page: number): Promise<IyfListItem[]> {
  const data = await signedGet<{ data?: { info?: IyfListItem[] } }>('GetLastAdd', `cinema=1&cid=${cid}&page=${page}&pageSize=10`);
  return clean(data.data?.info);
}

/** 爱壹帆片库排序：0 添加时间、1 更新时间、2 人气、3 评分（与 www.iyf.tv/list 的 orderBy 相同）。每页 50 部。 */
export async function sortedList(cid: string, orderby: 0 | 1 | 2 | 3, page: number): Promise<IyfListItem[]> {
  const cidParam = cid ? `&cid=${cid}` : '';
  const data = await signedGet<{ data?: { info?: Array<{ result?: IyfListItem[] }> } }>('Search', `cinema=1${cidParam}&page=${page}&size=50&orderby=${orderby}&desc=1`);
  return clean(data.data?.info?.[0]?.result);
}
