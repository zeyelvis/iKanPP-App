/**
 * 全网流媒体源站防污染与播放域名热修复模块 (Stream Anti-Pollution Sanitizer)
 * 依据各主流资源站官方紧急公告持续维护，确保客户端 100% 直连最新未污染 CDN 节点
 * 严格恪守 Track A 铁律：纯前端/字符级域名热映射，零代理流量、零服务器成本
 */

export interface DomainReplacementRule {
  from: RegExp;
  to: string;
  source: string;
  description: string;
}

export const PLAY_DOMAIN_REPLACEMENT_RULES: DomainReplacementRule[] = [
  // 暴风资源官方紧急公告 (2026-07-09): https://bfzy.tv/announcements/play-domain-replacement-2026-07-09
  // 1. s1.fengbao9.com 遭运营商严重污染 -> v.baofeng9.com
  {
    from: /s1\.fengbao9\.com/gi,
    to: 'v.baofeng9.com',
    source: 'baofeng',
    description: '暴风资源老播放域名 s1.fengbao9.com 遭污染热替换为 v.baofeng9.com',
  },
  // 2. v10.baofeng10.com 遭运营商严重污染 -> v.fengbao10.com
  {
    from: /v10\.baofeng10\.com/gi,
    to: 'v.fengbao10.com',
    source: 'baofeng',
    description: '暴风资源老播放域名 v10.baofeng10.com 遭污染热替换为 v.fengbao10.com',
  },
  // 3. v.baofeng10.com 官方建议割接 -> v.fengbao10.com
  {
    from: /v\.baofeng10\.com/gi,
    to: 'v.fengbao10.com',
    source: 'baofeng',
    description: '暴风资源老播放域名 v.baofeng10.com 建议割接为 v.fengbao10.com',
  },
];

/**
 * 清洗并热修复播放流 URL，消除 DNS 污染与死链域名
 */
export function sanitizeStreamUrl(rawUrl: string): string {
  if (!rawUrl || typeof rawUrl !== 'string') return rawUrl;

  let sanitized = rawUrl;
  for (const rule of PLAY_DOMAIN_REPLACEMENT_RULES) {
    if (rule.from.test(sanitized)) {
      sanitized = sanitized.replace(rule.from, rule.to);
    }
  }

  return sanitized;
}

/**
 * 批量清洗 M3U8 清单文本内容中的切片与嵌套子流域名
 */
export function sanitizeStreamContent(content: string): string {
  if (!content || typeof content !== 'string') return content;

  let sanitized = content;
  for (const rule of PLAY_DOMAIN_REPLACEMENT_RULES) {
    sanitized = sanitized.replace(rule.from, rule.to);
  }

  return sanitized;
}
