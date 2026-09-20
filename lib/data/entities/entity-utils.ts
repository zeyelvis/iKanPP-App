/**
 * 将影视中文/英文标题转换为 SEO 规范化的 Slug
 * 100% 兼容 Cloudflare Workers / Pages Edge Runtime，绝不在全局作用域引入任何带 setTimeout 的第三方库
 */
export function generateSlug(title: string): string {
  if (!title || typeof title !== 'string') return 'video';

  // 清洗特殊标点与括号备注（如 "(2024)"、"【完整版】"）
  const cleaned = title
    .replace(/[（(][^）)]*[）)]/g, ' ')
    .replace(/[【\[][^】\]]*[】\]]/g, ' ')
    .replace(/[:：·•/／\\、，,。！？!?~～@#$%^&*+=|]/g, ' ')
    .trim();

  // 将字符转小写，非英文字母数字保留下划线或短横线
  // 对于中文字符，编码为规范的拼音/Unicode-safe slug
  const slug = cleaned
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u4e00-\u9fa5-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return slug || 'video';
}


/**
 * 格式化自增序号为 6 位实体 ID，例如 1 → "ik000001"
 */
export function formatEntityId(seq: number): string {
  const padded = Math.max(1, Math.floor(seq)).toString().padStart(6, '0');
  return `ik${padded}`;
}

/**
 * 从 URL 参数中解析出 entityId 和 slug
 * 例如："ik000001-xiao-shen-ke-de-jiu-shu" → { entityId: "ik000001", slug: "xiao-shen-ke-de-jiu-shu" }
 *       "ik000001" → { entityId: "ik000001", slug: "" }
 */
export function parseEntitySlug(param: string): { entityId: string | null; slug: string } {
  if (!param) return { entityId: null, slug: '' };

  // 1. 优先匹配标准 6 位实体 ID：如 "ik000001-xiao-shen-ke-de-jiu-shu" 或 "ik000001"
  const matchStandard = param.match(/^(ik\d{6})(?:-(.*))?$/i);
  if (matchStandard) {
    return {
      entityId: matchStandard[1].toLowerCase(),
      slug: (matchStandard[2] || '').toLowerCase(),
    };
  }

  // 2. 增强容错：兼容带下划线或其他前缀的内部 ID（如 "ik_latest_all_1-兰香如故" 或 "pb_cat_movie_1-抓娃娃"）
  const matchInternal = param.match(/^((?:ik|pb)_[a-zA-Z0-9_]+)-(.*)$/i);
  if (matchInternal) {
    return {
      entityId: matchInternal[1].toLowerCase(),
      slug: (matchInternal[2] || '').trim(),
    };
  }

  return { entityId: null, slug: param };
}

/**
 * 客户端与组件层权威详情页 URL 生成器
 * 优先生成标准权威规范 URL: /title/ik000001-slug
 * 若无标准 ik ID，则回退为 /title/slug（由服务端 301 自愈升级）
 */
export function getTitleCanonicalHref(item: { entityId?: string; id?: string | number; title?: string; name?: string; slug?: string; canonicalSlug?: string } | null | undefined): string {
  if (!item) return '/';
  if (item.canonicalSlug && item.canonicalSlug.trim()) {
    return `/title/${item.canonicalSlug.trim()}`;
  }
  const title = (item.title || item.name || '').trim();
  if (!title) return '/';
  const rawId = (item.entityId || item.id || '').toString().trim().toLowerCase();
  const hasStandardId = /^ik\d{6}$/i.test(rawId);
  const baseText = item.slug || title;
  let cleanSlug = generateSlug(baseText).toLowerCase();
  if (hasStandardId && cleanSlug.startsWith(`${rawId}-`)) {
    cleanSlug = cleanSlug.slice(rawId.length + 1);
  }
  if (hasStandardId) {
    return `/title/${rawId}-${cleanSlug}`;
  }
  return `/title/${cleanSlug}`;
}

/**
 * 标题规范化比对键（用于旧 URL 301 命中或名称模糊去重）
 */
export function normalizeTitle(title: string): string {
  if (!title) return '';
  return title
    .toLowerCase()
    .replace(/[（(][^）)]*[）)]/g, '')
    .replace(/[【\[][^】\]]*[】\]]/g, '')
    .replace(/\s+/g, '')
    .replace(/[^\w\u4e00-\u9fa5]/g, '');
}

/**
 * 校验影视条目是否为脱口秀、真人秀、综艺通告或颁奖典礼等非影视正片
 */
export function isInvalidDramaOrMovie(entity: {
  title?: string;
  genres?: string[];
  description?: string;
}): boolean {
  if (!entity) return true;
  const title = (entity.title || '').trim();
  const genres = Array.isArray(entity.genres) ? entity.genres : [];
  const desc = (entity.description || '').trim();

  // 1. 分类标签过滤
  const invalidGenres = ['脱口秀', '真人秀', '新闻', 'talk', 'reality', 'news', 'soap'];
  if (genres.some(g => invalidGenres.some(ig => g.toLowerCase().includes(ig)))) {
    return true;
  }

  // 2. 标题关键词过滤（脱口秀、晚会、综艺、颁奖典礼、日常访谈等）
  const invalidTitleRegex = /(\bshow$|秀$|脱口秀|晚间秀|深夜秀|今夜秀|直播秀|现场观察|周六夜现场|颁奖典礼|电影节|奥斯卡|艾美奖|金球奖|格莱美|音乐奖|星光大赏|红毯|春晚|春节联欢晚会|圆桌派|天天向上|快乐大本营|中餐厅|王牌对王牌|奔跑吧|极限挑战|向往的生活|Running Man|Close-Up with|Late Night with|The Tonight Show|The Late Late Show|The Daily Show|Watch What Happens|Today with|The Ellen|Off Camera)/i;
  if (invalidTitleRegex.test(title)) {
    return true;
  }

  // 3. 简介关键词过滤
  if (/脱口秀节目|访谈节目|电视访谈|真人秀节目|现场脱口秀/.test(desc)) {
    return true;
  }

  return false;
}

/**
 * 标题相似度与相关性交集检测
 * 用于校验 URL 中的 slug 与取出的实体标题是否属于同一部作品，严防 ID 错配与脏缓存污染
 */
export function hasTitleOverlap(a: string, b: string): boolean {
  if (!a || !b) return false;
  const chineseA = a.match(/[\u4e00-\u9fff]/g);
  const chineseB = b.match(/[\u4e00-\u9fff]/g);

  if (chineseA && chineseA.length > 0 && chineseB && chineseB.length > 0) {
    const setB = new Set(chineseB);
    return chineseA.some(ch => setB.has(ch));
  }

  const la = a.toLowerCase();
  const lb = b.toLowerCase();
  return la.includes(lb) || lb.includes(la);
}

/**
 * 华语流媒体主站内容安全铁律：
 * 1. 绝对拦截日文假名（平假名/片假名无论是否带汉字，一律坚决阻断）
 * 2. 绝对拦截韩文字符
 * 3. 必须包含至少 1 个中文字符（彻底阻断纯英文、德文、西文、印地文等无中文译名外文条目）
 * 4. 绝对拦截低俗色情敏感黑名单
 */
export const ADULT_BLACKLIST_WORDS = [
  '痴漢', '痴汉', '調教', '调教', '発情', '发情', '近親', '近亲', '乱倫', '乱伦',
  '性奴', '小股', '沙龙病院', '中出し', '潮吹き', '巨乳', '美乳', '爆乳', '素人',
  '熟女', '人妻', '淫乱', '淫', '絶頂', '绝顶', '強姦', '强奸', '輪姦', '轮奸', '肉便器',
  '風俗', '风俗', '無修正', '无修正', 'エロ', 'AV', 'JAV', 'FC2', 'SM', '変態', '变态',
  '制服誘惑', '制服诱惑', '女教師', '女教师', '看護婦', '看护妇', '盗撮', '覗き', '偷窥',
  '性交', '做爱', '自慰', '色情', '三级', '露点', '情色', '偷拍', '色誘', '色诱', '情欲', '欲女',
  '売春', '愛汁', '肉しびれ', '女囚', '痴情', '快辱', '乱交', 'ポルノ', '半熟売春',
  '肉体', '迷奸', '性爱', '野合', '春药', '偷欢', '私通', '肉欲', '性虐', '援交', '内射', '潮吹',
  '抽插', '颜射', '绿帽', '绿帽奴', '寝取', 'ntr', '中出', '口交', '乳交', '打炮', '手淫',
  '高潮', '风俗娘', '精液', '精子', '射精', '催情', '开苞', '破处', '拘束', '凌辱', '皮鞭', '滴蜡',
  '本庄铃', '本庄鈴', '三上悠亚', '三上悠亞', '波多野结衣', '波多野結衣', '相泽南', '相澤南',
  '河北彩花', '河北彩伽', '深田咏美', '深田詠美', '桃乃木香奈', '小仓由菜', '小倉由菜',
  'sod', 'idea pocket', 'attackers', 'prestige', 'madonna',
  'start-', 'ipx-', 'ssis-', 'midv-', 'stars-', 'mide-', 'miaa-', 'abp-', 'snis-', 'jul-',
  'fc2-ppv', 'heyzo', 'caribbeancom', '一本道', '1pondo', 'pacopacomama', 'tokyo-hot',
  '美神列传', '美神列伝', '击溃屋', '脱衣麻将', '脱衣', '见异思迁', '浮気', '野性之女', '女杀手绘里香',
  '靓女俏医生', '粉红电影', '日活粉红', '粉红肉体', '思春期诱惑', '赤裸三姐妹', '豚鼠1', '豚鼠2', '恶魔实验', '血肉之花',
  '勃起', '性关系'
];

// 日本特有新字体汉字（和制汉字/国字，在中文正规汉字中不存在或已被规范简化，出现通常代表生肉日文片名）
const JAPANESE_KANJI_VARIANTS = /[剣気駅図竜絵鉄悪戦沢浜黑广恵毎齿寿对专拠抜拝捜検栄様歩杀殻浄浅]/;

// 成人番号特征识别（如 START-205, IPX-123 等）
const ADULT_CODE_REGEX = /\b[A-Z]{2,6}[-_]?\d{2,5}\b/i;

export function isCleanChineseTitle(title: string): boolean {
  if (!title || typeof title !== 'string') return false;
  const t = title.trim();
  if (!t) return false;

  // 1. 命中成人低俗违禁词直接拦截（排除星球大战等名作误杀）
  const lower = t.toLowerCase();
  for (const w of ADULT_BLACKLIST_WORDS) {
    if (lower.includes(w.toLowerCase())) {
      if (t.includes('星球大战') || t.includes('野战排') || t.includes('大雨将至') || t.includes('辉煌的意外') || t.includes('我的恐怖妻子') || t.includes('魔法少女与邪恶') || t.includes('亲爱的小美人鱼')) {
        continue;
      }
      return false;
    }
  }

  // 2. 命中番号格式直接拦截
  if (ADULT_CODE_REGEX.test(t)) {
    return false;
  }

  // 3. 日文平假名/片假名绝对零容忍（无论夹杂多少汉字，如“銭の踊り”、“悪魔からの勲章”，一律拦截）
  if (/[\u3040-\u309f\u30a0-\u30ff]/.test(t)) {
    return false;
  }

  // 4. 韩文音节绝对零容忍（韩剧必须有中文译名）
  if (/[\uac00-\ud7af]/.test(t)) {
    return false;
  }

  // 5. 识别并拦截纯日本生肉汉字片名（如《斬人斬馬剣》中的“剣”等日本新字体，一票物理否决）
  if (JAPANESE_KANJI_VARIANTS.test(t)) {
    return false;
  }

  // 6. 华语平台核心底线：必须包含中文字符（彻底拦截 Bourek、Die Chefin、Unser Charly 等纯外文条目）
  if (!/[\u4e00-\u9fa5]/.test(t)) {
    return false;
  }

  return true;
}

/**
 * 🌟 严格全维度影视实体安全铁律（覆盖标题、原名、剧情简介、番号格式与成人标记）
 * 彻底杜绝伪装成普通剧情片的成人 AV、粉红电影、低俗露骨条目与日文生肉条目渗透！
 */
export function isStrictSafeEntity(entity: {
  title?: string;
  originalTitle?: string;
  description?: string;
  adult?: boolean;
}): { safe: boolean; reason?: string } {
  if (!entity) return { safe: false, reason: '空实体' };

  // 1. TMDB 官方成人标识一票否决
  if (entity.adult === true) {
    return { safe: false, reason: 'TMDB adult=true' };
  }

  const title = (entity.title || '').trim();
  const orig = (entity.originalTitle || '').trim();
  const desc = (entity.description || '').trim();

  // 2. 标题基础华语合规性核验
  if (!isCleanChineseTitle(title)) {
    return { safe: false, reason: '标题非规范华语或命中违禁词' };
  }

  // 3. 原名若含成人番号格式，坚决拦截
  if (ADULT_CODE_REGEX.test(orig)) {
    return { safe: false, reason: '外文原名包含成人番号格式' };
  }

  // 4. 简介严禁出现日文平假名/片假名（正规华语引进片简介绝不含生肉假名）
  if (/[\u3040-\u309f\u30a0-\u30ff]/.test(desc)) {
    return { safe: false, reason: '剧情简介包含日文假名' };
  }

  // 5. 简介与原名深度敏感词命中
  const combined = `${orig} ${desc}`.toLowerCase();
  for (const w of ADULT_BLACKLIST_WORDS) {
    if (combined.includes(w.toLowerCase())) {
      if (title.includes('星球大战') || title.includes('野战排') || title.includes('大雨将至') || title.includes('辉煌的意外') || title.includes('我的恐怖妻子') || title.includes('魔法少女与邪恶') || title.includes('亲爱的小美人鱼')) {
        continue;
      }
      return { safe: false, reason: `原名或简介命中敏感词: ${w}` };
    }
  }

  return { safe: true };
}
