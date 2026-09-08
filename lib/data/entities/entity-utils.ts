import { pinyin } from 'pinyin-pro';

/**
 * 将影视中文/英文标题转换为 SEO 规范化的拼音 Slug
 * 例如："肖申克的救赎" → "xiao-shen-ke-de-jiu-shu"
 *       "沙丘2" → "sha-qiu-2"
 *       "The Shawshank Redemption" → "the-shawshank-redemption"
 */
export function generateSlug(title: string): string {
  if (!title || typeof title !== 'string') return 'video';

  // 清洗特殊标点与括号备注（如 "(2024)"、"【完整版】"）
  const cleaned = title
    .replace(/[（(][^）)]*[）)]/g, ' ')
    .replace(/[【\[][^】\]]*[】\]]/g, ' ')
    .replace(/[:：·•/／\\、，,。！？!?~～@#$%^&*+=|]/g, ' ')
    .trim();

  // 使用 pinyin-pro 将中文字符转为拼音，非中文保留
  const pyStr = pinyin(cleaned, {
    toneType: 'none',
    type: 'string',
    separator: '-',
    nonZh: 'consecutive',
  });

  // 转小写、去除非合法字符、合并多余连字符
  const slug = pyStr
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
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
