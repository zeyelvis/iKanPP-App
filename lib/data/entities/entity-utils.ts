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
    .replace(/[\s\-_:：·•/／\\、，,。！？!?~～@#$%^&*+=|（()）]/g, '')
    .trim();
}
