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

  const match = param.match(/^(ik\d{6})(?:-(.*))?$/i);
  if (match) {
    return {
      entityId: match[1].toLowerCase(),
      slug: (match[2] || '').toLowerCase(),
    };
  }

  return { entityId: null, slug: param };
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
